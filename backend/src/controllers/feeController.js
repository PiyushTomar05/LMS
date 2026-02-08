const Fee = require('../models/Fee');
const User = require('../models/User');

// @desc    Assign a fee to a student
// @route   POST /fees/assign
// @access  University Admin
const assignFee = async (req, res) => {
    try {
        const { studentId, type, amount, dueDate, description, universityId } = req.body;

        const fee = await Fee.create({
            studentId,
            universityId: universityId || req.user.universityId, // Fallback if admin assigns
            type,
            amount,
            dueDate,
            description
        });

        res.status(201).json(fee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get fees for logged in student
// @route   GET /fees/my-fees
// @access  Student
const getMyFees = async (req, res) => {
    try {
        const fees = await Fee.find({ studentId: req.user.id }).sort({ dueDate: 1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark fee as paid
// @route   PATCH /fees/:id/pay
// @access  University Admin (or simulated Payment Gateway)
const payFee = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);

        if (!fee) return res.status(404).json({ message: 'Fee not found' });

        fee.status = 'PAID';
        fee.paymentDate = Date.now();
        await fee.save();

        res.json(fee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { assignFee, getMyFees, payFee };
