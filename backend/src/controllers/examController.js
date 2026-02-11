const Exam = require('../models/Exam');
const ExamSchedule = require('../models/ExamSchedule');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');

const User = require('../models/User');
const { checkDues } = require('../controllers/feeController');


// @desc    Create a new Exam
// @route   POST /exams
const createExam = async (req, res) => {
    try {
        const exam = await Exam.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json(exam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Generate Exam Timetable (The Core Algorithm)
// @route   POST /exams/:id/generate
const generateExamTimetable = async (req, res) => {
    const { id } = req.params;
    const { slotsPerDay, startDate, endDate } = req.body;
    // slotsPerDay = ["09:00-12:00", "14:00-17:00"] 
    // Simplified: Just start times ["09:00", "14:00"] assuming 3hr duration

    try {
        // Feature: Block logic for specific students? 
        // Note: Schedule generation is admin side. It doesn't block *generation*. 
        // It should block *students* from viewing/registering.
        // For now, let's just add a warning or check if university has strict fee policy.

        const exam = await Exam.findById(id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // 1. Fetch Resources
        // Fetch courses for this academic year/semester
        // Assumption: Exam is for a specific set of courses (e.g., filtered by universityId)
        // Better: User passes list of courseIds to schedule? Or we fetch all active courses.
        // Let's fetch all courses for the exam's universityId.
        const courses = await Course.find({ universityId: exam.universityId })
            .populate('students') // Needed for collision detection
            .lean(); // Faster

        const rooms = await Classroom.find({ universityId: exam.universityId }).sort({ capacity: 1 });
        const professors = await User.find({ universityId: exam.universityId, role: 'PROFESSOR' });

        if (courses.length === 0) return res.status(400).json({ message: "No courses found to schedule." });

        // 2. Build Conflict Graph
        // Graph where Node = Course, Edge = Shared Students
        const conflictGraph = new Map(); // CourseID -> Set(CourseIDs)
        const courseMap = new Map(); // CourseID -> CourseObj

        courses.forEach(c => {
            conflictGraph.set(c._id.toString(), new Set());
            courseMap.set(c._id.toString(), c);
        });

        // O(N^2) comparison - optimize if needed
        for (let i = 0; i < courses.length; i++) {
            for (let j = i + 1; j < courses.length; j++) {
                const c1 = courses[i];
                const c2 = courses[j];

                // Check intersection of students
                const students1 = new Set(c1.students.map(s => s._id.toString()));
                const hasCommon = c2.students.some(s => students1.has(s._id.toString()));

                if (hasCommon) {
                    conflictGraph.get(c1._id.toString()).add(c2._id.toString());
                    conflictGraph.get(c2._id.toString()).add(c1._id.toString());
                }
            }
        }

        // 3. Prepare Time Slots
        const availableSlots = [];
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
            // Skip Sundays? (Optional)
            if (currentDate.getDay() !== 0) {
                slotsPerDay.forEach(time => {
                    availableSlots.push({ date: new Date(dateStr), time: time });
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 4. Scheduling (Graph Coloring / Greedy)
        // Sort courses by degree (most conflicts first) - "Largest Degree First"
        courses.sort((a, b) => {
            return conflictGraph.get(b._id.toString()).size - conflictGraph.get(a._id.toString()).size;
        });

        const scheduleMap = new Map(); // CourseID -> SlotIndex
        const slotOccupancy = new Map(); // SlotIndex -> [CourseIDs]

        for (const course of courses) {
            const courseId = course._id.toString();
            const conflicts = conflictGraph.get(courseId);

            // Find first valid slot
            let assigned = false;
            for (let i = 0; i < availableSlots.length; i++) {
                // Check 1: Conflict with already scheduled neighbors
                let conflictFound = false;
                for (const neighborId of conflicts) {
                    if (scheduleMap.has(neighborId) && scheduleMap.get(neighborId) === i) {
                        conflictFound = true;
                        break;
                    }
                }
                if (conflictFound) continue;

                // Check 2: Room Availability
                // We need a room that fits this course AND isn't taken by other courses in this slot
                const coursesInSlot = slotOccupancy.get(i) || [];

                // Count rooms used
                if (coursesInSlot.length >= rooms.length) continue; // All rooms busy

                // Check capacity match
                // We need 'coursesInSlot.length' rooms already taken.
                // We need to find if there is a remaining room with capacity >= course.studentCount
                // Simplified: Just check if *any* room is left? No, capacity matters.
                // Approach: For this slot, track used rooms.
                // But this is complex in a greedy step.
                // Heuristic: Just check if TOTAL courses in slot >= TOTAL rooms.
                // Refinement: Room assignment happens later. Here we just ensure theoretical feasibility?
                // No, let's allow assignment if count < rooms.length and verify later?
                // Better: Do pessimistic check.

                scheduleMap.set(courseId, i);
                if (!slotOccupancy.has(i)) slotOccupancy.set(i, []);
                slotOccupancy.get(i).push(courseId);

                assigned = true;
                break;
            }

            if (!assigned) {
                return res.status(400).json({ message: `Failed to schedule course: ${course.name}. Not enough slots.` });
            }
        }

        // 5. Assign Rooms & Save to DB
        // Clear old schedule
        await ExamSchedule.deleteMany({ examId: id });

        const schedulesToSave = [];

        // For each slot, assign rooms to courses
        for (const [slotIdx, courseIds] of slotOccupancy.entries()) {
            const slot = availableSlots[slotIdx];

            // Sort courses in this slot by size (largest first) to fit biggest rooms
            courseIds.sort((a, b) => courseMap.get(b).students.length - courseMap.get(a).students.length);

            // Keep track of used rooms for this slot
            const usedRooms = new Set();

            for (const cId of courseIds) {
                const course = courseMap.get(cId);
                const studentsCount = course.students.length;

                // Find best fit room
                const validRoom = rooms.find(r =>
                    !usedRooms.has(r._id.toString()) && r.capacity >= studentsCount
                );

                if (!validRoom) {
                    return res.status(400).json({ message: `Room constraint failed for ${course.name} in slot ${slot.date}` });
                }

                usedRooms.add(validRoom._id.toString());

                schedulesToSave.push({
                    examId: id,
                    courseId: cId,
                    date: slot.date,
                    startTime: slot.time,
                    endTime: addHours(slot.time, 3), // Assume 3 hours
                    classroomId: validRoom._id,
                    studentCount: studentsCount
                });
            }
        }

        await ExamSchedule.insertMany(schedulesToSave);

        // Update status
        exam.status = 'PUBLISHED';
        await exam.save();

        res.json({ message: "Timetable generated successfully", count: schedulesToSave.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Helper
function addHours(time, h) {
    const [hr, min] = time.split(':').map(Number);
    return `${hr + h}:${min}`.padStart(5, '0'); // simplified
}

// @desc    Get Exam Schedule (Student View with Fee Block)
// @route   GET /exams/:id/schedule
const getExamSchedule = async (req, res) => {
    try {
        // If Student, check fees
        if (req.user.role === 'STUDENT') {
            const hasDues = await checkDues(req.user._id);
            if (hasDues) {
                return res.status(403).json({
                    message: "Access Denied: You have pending fee dues. Please clear them to view exam schedule."
                });
            }
        }

        const schedule = await ExamSchedule.find({ examId: req.params.id })
            .populate('courseId', 'name code')
            .populate('classroomId', 'name')
            .populate('invigilatorId', 'firstName lastName')
            .sort({ date: 1, startTime: 1 });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auto-Assign Invigilators
// @route   POST /exams/:id/invigilators
const assignInvigilators = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await Exam.findById(id);
        const schedules = await ExamSchedule.find({ examId: id });
        const professors = await User.find({ universityId: exam.universityId, role: 'PROFESSOR' });

        if (professors.length === 0) return res.status(400).json({ message: "No professors found." });

        // Round Robin Assignment
        let profIdx = 0;
        const updates = [];

        // Group by Time Slot to ensure a prof isn't double booked
        // Actually, we iterate schedules. For each schedule, pick a prof who is FREE at that time.

        const profScheduleFn = new Map(); // ProfID -> Set(TimeKeys)

        for (const sch of schedules) {
            const timeKey = `${sch.date.toISOString()}-${sch.startTime}`;

            let assigned = false;
            let attempts = 0;
            // Try to find a free prof starting from current index
            while (attempts < professors.length) {
                const prof = professors[profIdx];
                profIdx = (profIdx + 1) % professors.length; // Rotate
                attempts++;

                if (!profScheduleFn.has(prof._id.toString())) profScheduleFn.set(prof._id.toString(), new Set());

                if (!profScheduleFn.get(prof._id.toString()).has(timeKey)) {
                    // Found one
                    sch.invigilatorId = prof._id;
                    profScheduleFn.get(prof._id.toString()).add(timeKey);
                    updates.push(sch.save());
                    assigned = true;
                    break;
                }
            }

            if (!assigned) {
                // Force assign or leave null?
                // Leave null and warn
            }
        }

        await Promise.all(updates);
        res.json({ message: "Invigilators assigned.", count: updates.length });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createExam, generateExamTimetable, getExamSchedule, assignInvigilators };
