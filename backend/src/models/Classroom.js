const mongoose = require('mongoose');

const classroomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true,
    },
    // Optional: Type of room (Lab, Lecture Hall, etc.)
    type: {
        type: String,
        enum: ['Lecture Hall', 'Lab', 'Seminar Room'],
        default: 'Lecture Hall'
    }
}, {
    timestamps: true,
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
