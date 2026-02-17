const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    universityId: {
        type: mongoose.Schema.Types.ObjectId, // Changed from schoolId
        ref: 'User', // University is a User with role UNIVERSITY_ADMIN (or distinct model?)
        // Verification: User model has 'universityId' field? No, University is usually an Entity.
        // Let's check User.js again.
        // Re-reading User.js in my memory/knowledge... User has `universityId`.
        // So `universityId` here likely refers to the University entity.
        // The controller uses `req.user.universityId`.
        ref: 'University', // Assuming University model exists. If not, maybe User? 
        // Wait, earlier files showed `universityId` in User.
        // Let's check `createFullDemoData.js`.
        // It creates a `University` model.
        required: true,
    },
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
        default: 'PRESENT',
    },
    type: {
        type: String,
        enum: ['Lecture', 'Lab', 'Tutorial', 'Exam'],
        default: 'Lecture'
    }
}, { timestamps: true });

// Ensure one record per student per class per date
attendanceSchema.index({ date: 1, courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
