const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Holiday', 'Exam', 'Semester Start', 'Semester End', 'Event'],
        default: 'Holiday'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

// Index for efficient date range queries
calendarSchema.index({ universityId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('AcademicCalendar', calendarSchema);
