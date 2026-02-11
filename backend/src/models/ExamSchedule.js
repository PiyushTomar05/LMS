const mongoose = require('mongoose');

const examScheduleSchema = mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // HH:mm format (24hr)
        required: true
    },
    endTime: {
        type: String, // HH:mm format (24hr)
        required: true
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    invigilatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Professor
        default: null
    },
    studentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for conflict detection
examScheduleSchema.index({ classroomId: 1, date: 1, startTime: 1 }, { unique: true }); // Room busy
examScheduleSchema.index({ invigilatorId: 1, date: 1, startTime: 1 }); // Prof busy (not unique as it might be null initially)

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);

module.exports = ExamSchedule;
