const mongoose = require('mongoose');

const TransportRouteSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    routeNumber: { type: String, required: true }, // e.g., "R-101"
    name: { type: String, required: true }, // e.g., "North City Loop"

    driverName: String,
    driverPhone: String,
    vehicleNumber: String, // e.g., "TX-99-1234"
    capacity: Number,

    stops: [{
        stopName: String,
        pickupTime: String, // "07:30 AM"
        dropTime: String,   // "04:30 PM"
        monthlyCost: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('TransportRoute', TransportRouteSchema);
