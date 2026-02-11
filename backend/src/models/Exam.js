const mongoose = require('mongoose');

const examSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['MID_SEM', 'END_SEM', 'BACKLOG', 'IMPROVEMENT'],
        required: true
    },
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    academicYear: {
        type: String,
        required: true // e.g., "2023-2024"
    },
    semester: {
        type: String, // "Fall", "Spring", or specific numbers if needed
        default: "Fall"
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'COMPLETED'],
        default: 'DRAFT'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
