const School = require('../models/School');
const User = require('../models/User');

// @desc    Create a new school
// @route   POST /schools
// @access  Super Admin
const createSchool = async (req, res) => {
    try {
        const { name, address, adminFirstName, adminLastName, adminEmail, adminPassword } = req.body;

        // 1. Create School
        const school = await School.create({ name, address });

        // 2. Create School Admin User if details are provided
        if (adminEmail && adminPassword) {
            const adminUser = await User.create({
                firstName: adminFirstName || 'Admin',
                lastName: adminLastName || 'User',
                email: adminEmail,
                password: adminPassword,
                role: 'SCHOOL_ADMIN',
                schoolId: school._id
            });

            // Optional: Update school with adminId if needed (schema has adminId)
            school.adminId = adminUser._id;
            await school.save();
        }

        res.status(201).json(school);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all schools
// @route   GET /schools
// @access  Super Admin
const getAllSchools = async (req, res) => {
    try {
        const schools = await School.find();
        res.json(schools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a school
// @route   DELETE /schools/:id
// @access  Super Admin
const deleteSchool = async (req, res) => {
    try {
        const { id } = req.params;
        await School.findByIdAndDelete(id);
        // Optional: Delete associated users and classes
        await User.deleteMany({ schoolId: id });
        // await Class.deleteMany({ schoolId: id }); // If Class model exists
        res.json({ message: 'School deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update subscription (Renew/Cancel)
// @route   PATCH /schools/:id/subscription
// @access  Super Admin
const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, durationInMonths } = req.body; // action: 'renew' | 'cancel'

        const school = await School.findById(id);
        if (!school) return res.status(404).json({ message: 'School not found' });

        if (action === 'cancel') {
            school.subscriptionStatus = 'INACTIVE';
        } else if (action === 'renew') {
            school.subscriptionStatus = 'ACTIVE';

            // Calculate new End Date
            const currentEndDate = new Date(school.subscriptionEndDate);
            // If expired, start from today, else start from currentEndDate
            const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();

            const monthsToAdd = parseInt(durationInMonths) || 12; // Default 1 year
            baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

            school.subscriptionEndDate = baseDate;
        }

        await school.save();
        res.json(school);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createSchool, getAllSchools, deleteSchool, updateSubscription };
