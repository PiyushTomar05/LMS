const University = require('../models/University');
const User = require('../models/User');

// @desc    Create a new university
// @route   POST /universities
// @access  Super Admin
const createUniversity = async (req, res) => {
    try {
        const { name, address, adminFirstName, adminLastName, adminEmail, adminPassword } = req.body;

        // 1. Create University
        const university = await University.create({ name, address });

        // 2. Create University Admin User if details are provided
        if (adminEmail && adminPassword) {
            const adminUser = await User.create({
                firstName: adminFirstName || 'Admin',
                lastName: adminLastName || 'User',
                email: adminEmail,
                password: adminPassword,
                role: 'UNIVERSITY_ADMIN',
                universityId: university._id
            });

            // Optional: Update university with adminId if needed (schema has adminId)
            university.adminId = adminUser._id;
            await university.save();
        }

        res.status(201).json(university);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all universities
// @route   GET /universities
// @access  Super Admin
const getAllUniversities = async (req, res) => {
    try {
        const universities = await University.find();
        res.json(universities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a university
// @route   DELETE /universities/:id
// @access  Super Admin
const deleteUniversity = async (req, res) => {
    try {
        const { id } = req.params;
        await University.findByIdAndDelete(id);
        // Optional: Delete associated users and courses
        await User.deleteMany({ universityId: id });
        // await Course.deleteMany({ universityId: id }); // If Course model exists
        res.json({ message: 'University deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update subscription (Renew/Cancel)
// @route   PATCH /universities/:id/subscription
// @access  Super Admin
const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, durationInMonths } = req.body; // action: 'renew' | 'cancel'

        const university = await University.findById(id);
        if (!university) return res.status(404).json({ message: 'University not found' });

        if (action === 'cancel') {
            university.subscriptionStatus = 'INACTIVE';
        } else if (action === 'renew') {
            university.subscriptionStatus = 'ACTIVE';

            // Calculate new End Date
            const currentEndDate = new Date(university.subscriptionEndDate);
            // If expired, start from today, else start from currentEndDate
            const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();

            const monthsToAdd = parseInt(durationInMonths) || 12; // Default 1 year
            baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

            university.subscriptionEndDate = baseDate;
        }

        await university.save();
        res.json(university);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createUniversity, getAllUniversities, deleteUniversity, updateSubscription };
