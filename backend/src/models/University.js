const mongoose = require('mongoose');

const universitySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    subscriptionStatus: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
        default: 'ACTIVE'
    },
    subscriptionStartDate: {
        type: Date,
        default: Date.now
    },
    subscriptionEndDate: {
        type: Date,
        // Default to +1 year from now
        default: () => new Date(+new Date() + 365 * 24 * 60 * 60 * 1000)
    }
}, {
    timestamps: true,
});

const University = mongoose.model('University', universitySchema);

module.exports = University;
