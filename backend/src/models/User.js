const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'SCHOOL_ADMIN', 'PROFESSOR', 'STUDENT', 'STAFF'],
        default: 'STUDENT',
    },
    universityId: {
        type: String, // Ideally ObjectId referencing a University model
        default: null,
        ref: 'University'
    },
    // --- SIS Fields ---
    urn: {
        type: String,
        unique: true,
        sparse: true, // Allow null for non-students initially
        immutable: true // Prevent updates after creation
    },
    rollNumber: { type: String },
    department: { type: String },
    program: { type: String }, // e.g., B.Tech, MBA
    semester: { type: Number },
    section: { type: String }, // e.g., A, B, C
    academicYear: { type: String }, // e.g., "2023-2024"
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contactNumber: { type: String },
    address: { type: String },
    guardian: {
        name: String,
        relation: String,
        contact: String
    },
    cgpa: {
        type: Number,
        default: 0.0,
        min: 0,
        max: 10
    },
    maxHoursPerDay: {
        type: Number,
        default: 4
    },
    // --- Faculty Fields ---
    facultyId: {
        type: String,
        unique: true,
        sparse: true,
        immutable: true
    },
    designation: {
        type: String,
        enum: ['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer', 'Head of Department'],
        default: 'Assistant Professor'
    },
    qualification: { type: String },
    specialization: { type: String },
    employmentType: {
        type: String,
        enum: ['Permanent', 'Contract', 'Visiting'],
        default: 'Permanent'
    },
    joiningDate: { type: Date },
    leaveBalance: {
        type: Number,
        default: 12
    },
    // --- Academic History (For Progression) ---
    academicHistory: [{
        semester: Number,
        academicYear: String,
        program: String,
        section: String,
        rollNumber: String,
        cgpa: Number,
        status: { type: String, enum: ['Promoted', 'Retained', 'Graduated'] },
        promotedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
