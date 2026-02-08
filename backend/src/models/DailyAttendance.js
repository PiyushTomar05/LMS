const mongoose = require('mongoose');

const DailyAttendanceSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true }, // Linking to School/University
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true }, // Stores date without time components ideally, or consistent midnight UTC
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
        default: 'ABSENT'
    },
    checkInTime: Date,
    checkOutTime: Date,
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Professor or Admin who marked it
    remarks: String
}, { timestamps: true });

// Prevent duplicate attendance for the same student, course, and date
DailyAttendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyAttendance', DailyAttendanceSchema);
