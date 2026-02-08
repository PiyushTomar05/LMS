const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    section: {
        type: String, // e.g. "A", "B"
        default: "A"
    },
    weeklyHours: {
        type: Number,
        default: 3
    },
    type: {
        type: String,
        enum: ['Core', 'Lab', 'Elective', 'Audit'],
        default: 'Core'
    },
    studentCount: {
        type: Number,
        default: 30
    },
    requiredRoomType: {
        type: String,
        enum: ['Lecture Hall', 'Lab'],
        default: 'Lecture Hall'
    },
    universityId: {
        type: mongoose.Schema.Types.ObjectId, // Strictly referencing University Model now
        ref: 'University',
        required: true,
    },
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Can be assigned later
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: false // Assigned by timetable generator
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        startTime: { type: String, required: true }, // e.g., "10:00"
        endTime: { type: String, required: true }    // e.g., "11:00"
    }]
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
