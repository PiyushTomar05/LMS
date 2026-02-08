const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

const { isHoliday } = require('./calendarController');

// Mark Attendance (Bulk)
exports.markAttendance = async (req, res) => {
    try {
        const { date, courseId, records, type } = req.body; // records = [{ studentId, status }]

        if (!date || !courseId || !records) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Holiday Check
        if (await isHoliday(req.user.universityId, date)) {
            return res.status(400).json({ message: 'Cannot mark attendance on a holiday.' });
        }

        // 2. Schedule Validation
        const courseDoc = await Course.findById(courseId);
        if (!courseDoc) return res.status(404).json({ message: 'Course not found' });

        const inputDate = new Date(date);
        const dayName = inputDate.toLocaleDateString('en-US', { weekday: 'Long' }); // e.g., "Monday"

        // Check if course has a slot on this day
        // We look for ANY slot on this day. 
        // Improvement: We could check specific time, but day-level validation is a good start.
        const isScheduled = courseDoc.schedule.some(s => s.day === dayName);

        // Allow if it's a manual override (optional) or strict check? 
        // User Requirement: "Attendance allowed only for scheduled classes"
        if (!isScheduled) {
            return res.status(400).json({ message: `Class is not scheduled on ${dayName}. Cannot mark attendance.` });
        }

        // Transform records for bulkWrite or simple loop. Simple loop for now for clarity.
        const promises = records.map(async (record) => {
            return Attendance.findOneAndUpdate(
                {
                    date: inputDate,
                    courseId,
                    studentId: record.studentId
                },
                {
                    universityId: req.user.universityId,
                    status: record.status || 'PRESENT',
                    type: type || 'Lecture'
                },
                { upsert: true, new: true }
            );
        });

        await Promise.all(promises);
        res.status(200).json({ message: 'Attendance marked successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error marking attendance' });
    }
};

// Get Attendance for a Class on a specific Date
exports.getClassAttendance = async (req, res) => {
    try {
        const { courseId, date } = req.query;
        if (!courseId || !date) return res.status(400).json({ message: 'Missing courseId or date' });

        const attendance = await Attendance.find({
            courseId,
            date: new Date(date)
        });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching class attendance' });
    }
};

// Get Attendance Stats for a Student (Detailed & Overall)
exports.getStudentAttendanceStats = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Aggregate to get stats per course
        const stats = await Attendance.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: '$courseId',
                    totalClasses: { $sum: 1 },
                    presentClasses: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $project: {
                    courseName: '$course.name',
                    courseCode: '$course.code',
                    totalClasses: 1,
                    presentClasses: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ['$presentClasses', '$totalClasses'] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Calculate Overall Stats
        const overallTotal = stats.reduce((acc, curr) => acc + curr.totalClasses, 0);
        const overallPresent = stats.reduce((acc, curr) => acc + curr.presentClasses, 0);
        const overallPercentage = overallTotal > 0 ? ((overallPresent / overallTotal) * 100).toFixed(1) : 0;

        res.json({
            overall: {
                totalClasses: overallTotal,
                presentClasses: overallPresent,
                percentage: overallPercentage
            },
            courses: stats
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};
