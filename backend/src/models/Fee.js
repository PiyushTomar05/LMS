const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true }, // Changed ref to University
    name: { type: String, required: true }, // e.g., "B.Tech CSE - Year 1 (2024)"
    description: String,
    academicYear: { type: String, required: true },
    semester: { type: String, required: true }, // Added semester

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
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },

    invoiceNumber: { type: String, unique: true }, // Added invoice number

    totalPayable: { type: Number, required: true },
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

// Pre-save hook to generate invoice number
FeePaymentSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await this.constructor.countDocuments();
        this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

const FeeStructure = mongoose.model('FeeStructure', FeeStructureSchema);
const FeePayment = mongoose.model('FeePayment', FeePaymentSchema);

module.exports = { FeeStructure, FeePayment };
