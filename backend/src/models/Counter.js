const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., 'urn_2024', 'faculty_2024'
    seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);
