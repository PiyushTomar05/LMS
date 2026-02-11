const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'REGISTER', 'IMPORT', 'DELETE_USER', 'DELETE_BULK', 'UPDATE_USER', 'CHANGE_PASSWORD', 'SYSTEM_ERROR', 'SECURITY_ALERT']
    },
    actor: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: { type: String },
        role: { type: String },
        ip: { type: String }
    },
    target: {
        type: String, // e.g., "User: john@example.com" or "Bulk Import: 50 users"
        required: false
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Flexible object for extra data
        default: {}
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'WARNING'],
        default: 'SUCCESS'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: '90d' // Auto-delete logs after 90 days
    }
});

module.exports = mongoose.model('SystemLog', systemLogSchema);
