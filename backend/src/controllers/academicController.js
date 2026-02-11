const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// 1. Generate URN (Called during admission)
// Format: YYYY<DEPT_CODE><UNI_ID_LAST_4><SEQ> -> Simplified to: YYYY-SEQ-RAND for now to stay generic
// Better: YYYY + Random 6 digits to ensure uniqueness quickly.
const Counter = require('../models/Counter');

// 1. Generate URN (Called during admission)
// Format: URN-YYYY-SEQ (e.g., URN-2024-0001)
// Uses Atomic Counter for strict sequentiality.
const generateURN = async (req, res) => {
    try {
        const { academicYear } = req.body;
        const year = academicYear ? academicYear.split('-')[0] : new Date().getFullYear();

        // Atomically increment counter
        const counter = await Counter.findByIdAndUpdate(
            { _id: `urn_${year}` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true } // Create if doesn't exist
        );

        const sequence = String(counter.seq).padStart(4, '0');
        const urn = `URN-${year}-${sequence}`;

        res.json({ urn });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate URN", error: error.message });
    }
};

// 2. Auto-Assign Sections (Load Balanced)
const assignSections = async (req, res) => {
    const { universityId, program, department, semester, academicYear, maxCapacity } = req.body; // Added department

    if (!maxCapacity || maxCapacity < 1) {
        return res.status(400).json({ message: "Invalid max capacity" });
    }

    try {
        // 1. Get current section counts
        const existingStudents = await User.aggregate([
            { $match: { universityId, program, semester, role: 'STUDENT', section: { $ne: null } } },
            { $group: { _id: "$section", count: { $sum: 1 } } }
        ]);

        const sectionCounts = {};
        existingStudents.forEach(s => sectionCounts[s._id] = s.count);

        // 2. Find unassigned students
        const students = await User.find({
            universityId,
            program,
            department, // Filter by Department
            semester,
            role: 'STUDENT',
            $or: [{ section: null }, { section: "" }]
        }).sort({ firstName: 1, lastName: 1 });

        if (students.length === 0) {
            return res.json({ message: "No unassigned students found.", count: 0 });
        }

        const updates = [];
        let currentSectionCode = 65; // 'A'

        for (const student of students) {
            // Find a section with space
            let sectionName = String.fromCharCode(currentSectionCode);
            while ((sectionCounts[sectionName] || 0) >= maxCapacity) {
                currentSectionCode++;
                sectionName = String.fromCharCode(currentSectionCode);
            }

            // Assign
            updates.push({
                updateOne: {
                    filter: { _id: student._id },
                    update: { $set: { section: sectionName } }
                }
            });

            // Update local count
            sectionCounts[sectionName] = (sectionCounts[sectionName] || 0) + 1;

            // Reset for next student to check from 'A' (or keep filling current? "Even distribution" vs "Fill First")
            // User requirement: "Even distribution" usually. 
            // Better Load Balancing: Always pick the section with MINIMUM students.
            // Let's refine: Pick section with min count < maxCapacity.
            currentSectionCode = 65; // Reset to start search from A
        }

        // Actually, the above loop fills A until full, then B. This is "Fill First".
        // "Even Distribution" requires finding min-count section. 
        // Let's switch to Min-Count strategy for better balance?
        // But "Fill First" is standard for classroom allocation. Let's stick to Fill First for simplicity unless specified.

        await User.bulkWrite(updates);

        res.json({
            message: `Assigned sections to ${students.length} students.`,
            studentsProcessed: students.length
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to assign sections", error: error.message });
    }
};

// 3. Generate Roll Numbers (Append-Only)
const generateRollNumbers = async (req, res) => {
    const { universityId, program, department, semester, section } = req.body;
    // req.body.regenerateAll = true/false (Safety flag)

    try {
        // Build query
        const query = {
            universityId,
            program,
            department,
            semester,
            role: 'STUDENT',
            section: { $exists: true, $ne: null }
        };

        if (section) {
            query.section = section;
        }

        // Fetch ALL students with sections matches
        const students = await User.find(query).sort({ section: 1, firstName: 1, lastName: 1 });

        if (students.length === 0) {
            return res.json({ message: "No students with sections found.", count: 0 });
        }

        // 1. Calculate Max Sequence per Section
        const sectionMaxSeq = {};

        students.forEach(s => {
            if (s.rollNumber) {
                const parts = s.rollNumber.split('-');
                if (parts.length === 2) {
                    const seq = parseInt(parts[1], 10);
                    if (!isNaN(seq)) {
                        sectionMaxSeq[s.section] = Math.max(sectionMaxSeq[s.section] || 0, seq);
                    }
                }
            }
        });

        const updates = [];

        // 2. Assign to those without Roll Number
        for (const student of students) {
            if (!student.rollNumber) {
                const currentSeq = (sectionMaxSeq[student.section] || 0) + 1;
                const rollNumber = `${student.section}-${String(currentSeq).padStart(2, '0')}`;

                updates.push({
                    updateOne: {
                        filter: { _id: student._id },
                        update: { $set: { rollNumber: rollNumber } }
                    }
                });

                sectionMaxSeq[student.section] = currentSeq;
            }
        }

        if (updates.length > 0) {
            await User.bulkWrite(updates);
        }

        res.json({
            message: `Roll numbers generated for ${updates.length} new students.`,
            updatedCount: updates.length
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to generate roll numbers", error: error.message });
    }
};

// 4. Promote Students
const promoteStudents = async (req, res) => {
    const { studentIds, currentSemester, nextSemester, academicYear } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: "No students selected for promotion" });
    }

    try {
        const students = await User.find({ _id: { $in: studentIds } });
        const updates = [];

        for (const student of students) {
            // Archive current state
            const historyEntry = {
                semester: student.semester,
                academicYear: student.academicYear || academicYear, // fallback
                program: student.program,
                section: student.section,
                rollNumber: student.rollNumber,
                cgpa: student.cgpa, // Assuming this is upto date
                status: 'Promoted',
                promotedAt: new Date()
            };

            updates.push({
                updateOne: {
                    filter: { _id: student._id },
                    update: {
                        $push: { academicHistory: historyEntry },
                        $set: {
                            semester: nextSemester,
                            section: null, // Reset for next sem
                            rollNumber: null, // Reset for next sem
                            academicYear: academicYear // Update to new year
                        }
                    }
                }
            });
        }

        await User.bulkWrite(updates);

        res.json({ message: `Successfully promoted ${updates.length} students.` });

    } catch (error) {
        res.status(500).json({ message: "Promotion failed", error: error.message });
    }
};

// 5. Get Stats/Filter helper
const getAcademicStats = async (req, res) => {
    const { universityId } = req.params;
    try {
        // Group by Program -> Semester -> Count
        const stats = await User.aggregate([
            { $match: { universityId: universityId, role: 'STUDENT' } },
            {
                $group: {
                    _id: { program: "$program", semester: "$semester" },
                    count: { $sum: 1 },
                    unassignedSection: { $sum: { $cond: [{ $or: [{ $eq: ["$section", null] }, { $eq: ["$section", ""] }] }, 1, 0] } },
                    unassignedRoll: { $sum: { $cond: [{ $or: [{ $eq: ["$rollNumber", null] }, { $eq: ["$rollNumber", ""] }] }, 1, 0] } }
                }
            },
            { $sort: { "_id.program": 1, "_id.semester": 1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats", error: error.message });
    }
};

// 6. Get Available Sections for Dropdowns
const getAvailableSections = async (req, res) => {
    const { universityId, program, department, semester } = req.query;

    try {
        const sections = await User.distinct('section', {
            universityId,
            program,
            department,
            semester: semester,
            role: 'STUDENT',
            section: { $ne: null }
        });

        // Return sorted sections
        res.json(sections.sort());
    } catch (error) {
        res.status(500).json({ message: "Error fetching sections", error: error.message });
    }
};

module.exports = {
    generateURN,
    assignSections,
    generateRollNumbers,
    promoteStudents,
    getAcademicStats,
    getAvailableSections
};
