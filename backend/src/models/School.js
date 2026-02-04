const mongoose = require('mongoose');

const schoolSchema = mongoose.Schema({
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

const School = mongoose.model('School', schoolSchema);

module.exports = School;
