const { FeeStructure, FeePayment } = require('../models/Fee');
const User = require('../models/User');
// const PDFDocument = require('pdfkit'); // TODO: Import when implementing receipt generation

// @desc    Create a Fee Structure (e.g., Semester Fee)
// @route   POST /fees/structure
const createFeeStructure = async (req, res) => {
    try {
        const { name, academicYear, semester, tuitionFee, libraryFee, labFee, transportFee, otherFee, dueDate, universityId } = req.body;

        const totalAmount = (tuitionFee || 0) + (libraryFee || 0) + (labFee || 0) + (transportFee || 0) + (otherFee || 0);

        const feeStructure = await FeeStructure.create({
            universityId: universityId || req.user.universityId,
            name, academicYear, semester,
            tuitionFee, libraryFee, labFee, transportFee, otherFee,
            totalAmount, dueDate
        });

        res.status(201).json(feeStructure);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Assign Fees to Students (Bulk or Single)
// @route   POST /fees/assign
const assignFeeToStudents = async (req, res) => {
    try {
        const { feeStructureId, studentIds } = req.body; // studentIds is array

        const feeStructure = await FeeStructure.findById(feeStructureId);
        if (!feeStructure) return res.status(404).json({ message: 'Fee Structure not found' });

        const payments = [];
        for (const studentId of studentIds) {
            // Check if already assigned
            const exists = await FeePayment.findOne({ studentId, feeStructureId });
            if (exists) continue;

            payments.push({
                universityId: feeStructure.universityId,
                studentId,
                feeStructureId,
                totalPayable: feeStructure.totalAmount,
                remainingAmount: feeStructure.totalAmount,
                status: 'PENDING'
            });
        }

        if (payments.length > 0) {
            await FeePayment.insertMany(payments);
        }

        res.json({ message: `Fees assigned to ${payments.length} students.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Fees
// @route   GET /fees/my-fees
const getMyFees = async (req, res) => {
    try {
        const fees = await FeePayment.find({ studentId: req.user.id })
            .populate('feeStructureId')
            .sort({ createdAt: -1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Record a fee payment transaction.
 * @route POST /fees/pay
 * @access Private (Student/Parent)
 */
const payFee = async (req, res) => {
    try {
        const { feePaymentId, amount, method, transactionId, remarks } = req.body;

        const feePayment = await FeePayment.findById(feePaymentId);
        if (!feePayment) return res.status(404).json({ message: 'Fee record not found' });

        const newPaid = feePayment.paidAmount + Number(amount);
        const newRemaining = feePayment.totalPayable - newPaid;

        if (newRemaining < 0) return res.status(400).json({ message: 'Overpayment not allowed' });

        feePayment.paidAmount = newPaid;
        feePayment.remainingAmount = newRemaining;

        if (newRemaining === 0) feePayment.status = 'PAID';
        else feePayment.status = 'PARTIAL';

        feePayment.transactions.push({
            amount, method, transactionId, remarks, date: new Date()
        });

        await feePayment.save();

        res.json(feePayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to check dues (for Exam blocking)
const checkDues = async (studentId) => {
    const pendingFees = await FeePayment.find({
        studentId,
        status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
    });
    return pendingFees.length > 0;
};

module.exports = { createFeeStructure, assignFeeToStudents, getMyFees, payFee, checkDues };
