const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const User = require('../models/User');

const generateTimetable = async (req, res) => {
    try {
        const { universityId } = req.body;
        console.log('--- STRICT SCHEDULER STARTED ---');

        // 1. Fetch Resources
        const courses = await Course.find({ universityId }).populate('professorId');
        const rooms = await Classroom.find({ universityId });

        // 2. Clear Existing Schedule
        await Course.updateMany({ universityId }, { $set: { schedule: [], classroomId: null } });

        // 3. Define Constraints & Maps
        // M-F, 09:00 - 17:00 (Start times: 9,10,11,12,13,14,15,16) -> 8 slots
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

        // Helper to get time index
        const getTimeIndex = (t) => times.indexOf(t);

        // State Maps
        const profSchedule = {}; // { profId: { day: Set(times) } }
        const roomSchedule = {}; // { roomId: { day: Set(times) } }
        const sectionSchedule = {}; // { "CourseName-Section": { day: Set(times) } }
        const profDailyHours = {}; // { profId: { day: count } }
        const sectionLunch = {}; // { "CourseName-Section": "12:00" | "13:00" }

        // Initialize Section Lunch (Dynamic between 12 and 13)
        // Groups are defined by "Section" strictly (e.g., all "Section A" students are one cohort)
        const sections = new Set(courses.map(c => c.section));
        sections.forEach(sec => {
            sectionSchedule[sec] = {};
            sectionLunch[sec] = Math.random() > 0.5 ? '12:00' : '13:00';
            days.forEach(d => sectionSchedule[sec][d] = new Set());
        });

        const updates = [];
        let assignedCount = 0;
        let failedCount = 0;

        // 4. Sort Courses (Priority: Lab > Core > Elective | Then High Hours > Low Hours)
        courses.sort((a, b) => {
            const typePriority = { 'Lab': 0, 'Core': 1, 'Elective': 2 };
            if (typePriority[a.type] !== typePriority[b.type]) {
                return typePriority[a.type] - typePriority[b.type];
            }
            return b.weeklyHours - a.weeklyHours;
        });

        // 5. Scheduling Loop
        for (const course of courses) {
            const sectionKey = course.section;
            const profId = course.professorId?._id.toString();
            const neededHours = course.weeklyHours || 3;
            // For Labs, we try to schedule all hours in one block if possible, or at least 2
            const isLab = course.type === 'Lab';
            const blockSize = isLab ? neededHours : 1;

            // Init Prof maps if needed
            if (profId) {
                if (!profSchedule[profId]) profSchedule[profId] = {};
                if (!profDailyHours[profId]) profDailyHours[profId] = {};
                days.forEach(d => {
                    if (!profSchedule[profId][d]) profSchedule[profId][d] = new Set();
                    if (!profDailyHours[profId][d]) profDailyHours[profId][d] = 0;
                });
            }

            let assignedHours = 0;
            const courseSchedule = [];

            // Try to distribute hours across days (max 1-2 per day unless Lab)
            let dayIdx = 0;

            while (assignedHours < neededHours) {
                let scheduledThisBlock = false;

                // Try all days cyclic
                for (let d = 0; d < days.length; d++) {
                    if (assignedHours >= neededHours) break;

                    const day = days[(dayIdx + d) % days.length];

                    // Distribution Rule: Non-Labs shouldn't have >1 class per day unless specific conditions
                    const alreadyHasClassToday = courseSchedule.some(s => s.day === day);
                    if (!isLab && alreadyHasClassToday && neededHours <= 5 && assignedHours < neededHours - 2) {
                        continue;
                    }

                    // Try all times for this day - finding a BLOCK of size 'blockSize'
                    // If Lab (3 hours), we need times[i], times[i+1], times[i+2]
                    for (let i = 0; i <= times.length - blockSize; i++) {
                        const timeBlock = [];
                        for (let k = 0; k < blockSize; k++) timeBlock.push(times[i + k]);

                        // Check availability for WHOLE block
                        let blockValid = true;
                        let validRoomForBlock = null;

                        // 1. Check Prof, Section, Lunch for ALL slots in block
                        for (const t of timeBlock) {
                            if (t === sectionLunch[sectionKey]) { blockValid = false; break; }
                            if (profId && profSchedule[profId][day].has(t)) { blockValid = false; break; }
                            if (profId && profDailyHours[profId][day] >= (course.professorId.maxHoursPerDay || 4)) { blockValid = false; break; }
                            if (sectionSchedule[sectionKey][day].has(t)) { blockValid = false; break; }
                        }
                        if (!blockValid) continue;

                        // 2. Check Room for ALL slots in block (Must be SAME room)
                        // Optimization: Find a room free for all slots
                        for (const room of rooms) {
                            if (room.capacity < course.studentCount) continue;
                            if (room.type !== course.requiredRoomType) continue;

                            let roomFree = true;
                            // Init room map if needed
                            if (!roomSchedule[room._id]) roomSchedule[room._id] = {};
                            if (!roomSchedule[room._id][day]) roomSchedule[room._id][day] = new Set();

                            for (const t of timeBlock) {
                                if (roomSchedule[room._id][day].has(t)) {
                                    roomFree = false;
                                    break;
                                }
                            }

                            if (roomFree) {
                                validRoomForBlock = room;
                                break;
                            }
                        }

                        if (validRoomForBlock) {
                            // --- ASSIGN BLOCK ---
                            timeBlock.forEach(t => {
                                courseSchedule.push({ day, startTime: t, endTime: getEndTime(t) });
                                // Update Maps
                                if (profId) {
                                    profSchedule[profId][day].add(t);
                                    profDailyHours[profId][day]++;
                                }
                                sectionSchedule[sectionKey][day].add(t);
                                roomSchedule[validRoomForBlock._id][day].add(t);
                            });

                            course.classroomId = validRoomForBlock._id;
                            assignedHours += blockSize;
                            scheduledThisBlock = true;
                            break; // Block assigned, break time loop
                        }
                    }
                    if (scheduledThisBlock) break; // Break day loop
                }

                if (!scheduledThisBlock) {
                    // Try reducing block size split if strict block failed? (Or just fail for strict lab rule)
                    // For now, fail strict to adhere to rule
                    // console.log(`Could not find slot for ${course.name}`);
                    failedCount++;
                    break;
                }
                dayIdx++;
            }

            course.schedule = courseSchedule;
            updates.push(course.save());
            if (courseSchedule.length > 0) assignedCount++;
        }

        await Promise.all(updates);
        res.json({
            message: `Strict Schedule Generated. Assigned: ${assignedCount}/${courses.length} courses. Failed: ${failedCount}`,
            stats: { assignedCount, failedCount }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getEndTime = (startTime) => {
    const [h, m] = startTime.split(':').map(Number);
    return `${h + 1}:00`.padStart(5, '0');
};

const getTimetable = async (req, res) => {
    try {
        const { universityId } = req.params;
        const courses = await Course.find({ universityId })
            .populate('professorId', 'firstName lastName')
            .populate('classroomId', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetTimetable = async (req, res) => {
    try {
        const { universityId } = req.body;
        await Course.updateMany({ universityId }, { $set: { schedule: [], classroomId: null } });
        res.json({ message: 'Timetable reset successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCourseSchedule = async (req, res) => {
    try {
        const { courseId, schedule } = req.body;
        // schedule: array of { day, startTime, endTime }

        // 1. Fetch Course with populated fields to check ID
        const course = await Course.findById(courseId).populate('professorId');
        if (!course) return res.status(404).json({ message: "Course not found" });

        const { universityId, classroomId, professorId } = course;

        // 2. Validate Conflicts for each new slot
        for (const slot of schedule) {
            const { day, startTime } = slot;

            // Check Room Conflict
            if (classroomId) {
                const roomConflict = await Course.findOne({
                    universityId,
                    _id: { $ne: courseId },
                    classroomId,
                    schedule: { $elemMatch: { day: day, startTime: startTime } }
                });

                if (roomConflict) {
                    return res.status(409).json({
                        message: `Room Conflict! The room is already booked on ${day} at ${startTime} by another course.`
                    });
                }
            }

            // Check Professor Conflict
            if (professorId) {
                const profId = professorId._id || professorId; // Handle if populated or not
                const profConflict = await Course.findOne({
                    universityId,
                    _id: { $ne: courseId },
                    professorId: profId,
                    schedule: { $elemMatch: { day: day, startTime: startTime } }
                });

                if (profConflict) {
                    return res.status(409).json({
                        message: `Professor Conflict! ${professorId.firstName || 'The professor'} is already teaching on ${day} at ${startTime}.`
                    });
                }
            }
        }

        course.schedule = schedule;
        await course.save();

        res.json({ message: "Schedule updated successfully.", course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Classroom CRUD (Basic)
const createClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.create(req.body);
        res.status(201).json(classroom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getClassrooms = async (req, res) => {
    try {
        const { universityId } = req.query;
        const classrooms = await Classroom.find({ universityId });
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateTimetable, getTimetable, createClassroom, getClassrooms, resetTimetable, updateCourseSchedule };
