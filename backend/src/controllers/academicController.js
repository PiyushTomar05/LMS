const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// 1. Generate URN (Called during admission)
// Format: YYYY<DEPT_CODE><UNI_ID_LAST_4><SEQ> -> Simplified to: YYYY-SEQ-RAND for now to stay generic
// Better: YYYY + Random 6 digits to ensure uniqueness quickly.
const generateURN = async (req, res) => {
    try {
        const { academicYear } = req.body;
        const year = academicYear ? academicYear.split('-')[0] : new Date().getFullYear();
        const randomPart = Math.floor(100000 + Math.random() * 900000); // 6 digit random
        const urn = `URN-${year}-${randomPart}`;

        // Simple check for collision (rare)
        const exists = await User.findOne({ urn });
        if (exists) return generateURN(req, res); // Retry

        res.json({ urn });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate URN", error: error.message });
    }
};

// 2. Auto-Assign Sections
const assignSections = async (req, res) => {
    const { universityId, program, semester, academicYear, maxCapacity } = req.body;

    if (!maxCapacity || maxCapacity < 1) {
        return res.status(400).json({ message: "Invalid max capacity" });
    }

    try {
        // 1. Find unassigned students for this sem
        // Logic: Students in this prog/sem/year with NO section assigned
        const students = await User.find({
            universityId,
            program,
            semester,
            role: 'STUDENT',
            $or: [{ section: null }, { section: "" }]
        }).sort({ firstName: 1, lastName: 1 }); // Alphabetical sort for distribution

        if (students.length === 0) {
            return res.json({ message: "No unassigned students found for this criteria.", count: 0 });
        }

        let sectionCode = 65; // ASCII for 'A'
        let currentSectionCount = 0;
        let updatedCount = 0;

        // Check if there are already sections to continue from (e.g., if A is full)
        // For simplicity, we assume this is a bulk run. If partial, we'd need to query existing sections.
        // Let's simplified: pure round robin or fill-and-move? 
        // User asked for: "Evenly distributed". 
        // Strategy: Calculate needed sections -> Distribute round robin.

        const totalStudents = students.length;
        const numSections = Math.ceil(totalStudents / maxCapacity);

        const updates = [];

        for (let i = 0; i < totalStudents; i++) {
            // Round robin index: i % numSections
            // Section name: A, B, C...
            const sectionIndex = i % numSections;
            const sectionName = String.fromCharCode(65 + sectionIndex);

            updates.push({
                updateOne: {
                    filter: { _id: students[i]._id },
                    update: { $set: { section: sectionName } }
                }
            });
        }

        if (updates.length > 0) {
            await User.bulkWrite(updates);
        }

        res.json({
            message: `Assigned sections to ${totalStudents} students.`,
            sectionsCreated: numSections,
            studentsProcessed: totalStudents
        });

    } catch (error) {
        console.error("Section Assignment Error:", error);
        res.status(500).json({ message: "Failed to assign sections", error: error.message });
    }
};

// 3. Generate Roll Numbers
const generateRollNumbers = async (req, res) => {
    const { universityId, program, semester } = req.body;

    try {
        // Find students HAS section but NO roll number (or regenerate all?)
        // Requirement: "Restarted for each section"

        // We fetch ALL students in this sem to ensure sequence is correct 
        // even if some already have roll numbers (to avoid duplicates if we just fill gaps).
        // BUT user said "Strict Format", maybe we should just regenerate for everyone to be safe?
        // Let's target only those without roll numbers OR force regenerate flag?
        // Safe approach: Fetch all, sort by Name, re-assign strictly to ensure A-1, A-2...

        const students = await User.find({
            universityId,
            program,
            semester,
            role: 'STUDENT',
            section: { $exists: true, $ne: null }
        }).sort({ section: 1, firstName: 1, lastName: 1 });

        if (students.length === 0) {
            return res.json({ message: "No students with sections found.", count: 0 });
        }

        const updates = [];
        let currentSection = null;
        let currentSeq = 0;

        for (const student of students) {
            if (student.section !== currentSection) {
                currentSection = student.section;
                currentSeq = 1;
            } else {
                currentSeq++;
            }

            const rollNumber = `${currentSection}-${String(currentSeq).padStart(2, '0')}`;

            // Only update if different (optimization)
            if (student.rollNumber !== rollNumber) {
                updates.push({
                    updateOne: {
                        filter: { _id: student._id },
                        update: { $set: { rollNumber: rollNumber } }
                    }
                });
            }
        }

        if (updates.length > 0) {
            await User.bulkWrite(updates);
        }

        res.json({
            message: `Roll numbers generated/verified for ${students.length} students.`,
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

module.exports = {
    generateURN,
    assignSections,
    generateRollNumbers,
    promoteStudents,
    getAcademicStats
};
