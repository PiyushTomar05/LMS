const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        // required: true // Made optional to support University model
    },
    universityId: { // Added for University support
        type: String,
        ref: 'University'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    audience: {
        type: String,
        enum: ['ALL', 'TEACHERS', 'STUDENTS'],
        default: 'ALL'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
