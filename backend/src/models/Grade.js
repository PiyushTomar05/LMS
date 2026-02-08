const mongoose = require('mongoose');

const gradeSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'Absent'],
        required: true
    },
    gradePoints: {
        type: Number,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Regular', 'Backlog', 'Improvement'],
        default: 'Regular'
    },
    examSession: {
        type: String, // e.g., "Dec 2023", "May 2024"
        required: true
    },
    isAudit: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Composite index to ensure unique grade entry per student per course per session
gradeSchema.index({ studentId: 1, courseId: 1, examSession: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
