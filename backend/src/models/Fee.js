const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true }, // e.g., "B.Tech CSE - Year 1 (2024)"
    description: String,

    // Breakdown
    tuitionFee: { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    labFee: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    otherFee: { type: Number, default: 0 },

    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    dueDate: { type: Date, required: true },
    lateFeePerDay: { type: Number, default: 0 }
}, { timestamps: true });

const FeePaymentSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },

    totalPayable: { type: Number, required: true }, // Copy of FeeStructure.totalAmount (snapshot)
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },

    status: {
        type: String,
        enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'],
        default: 'PENDING'
    },

    transactions: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        method: { type: String, enum: ['CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER'] },
        transactionId: String,
        remarks: String
    }]
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', FeeStructureSchema);
const FeePayment = mongoose.model('FeePayment', FeePaymentSchema);

module.exports = { FeeStructure, FeePayment };
