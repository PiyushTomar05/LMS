const User = require('../models/User');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');

// @desc    Delete user
// @route   DELETE /users/:id
// @access  School Admin
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PATCH /users/:id
// @access  School Admin
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Import users from Excel
// @route   POST /users/import
// @access  School Admin
const importUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel file' });
        }

        const { schoolId } = req.body;
        if (!schoolId) {
            return res.status(400).json({ message: 'School ID is required' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const usersToCreate = [];
        // Default password hash (e.g., '123456')
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        for (const row of data) {
            // Excel columns: FirstName, LastName, Email, Role
            // Simple validation
            if (row.FirstName && row.LastName && row.Email) {
                usersToCreate.push({
                    firstName: row.FirstName,
                    lastName: row.LastName,
                    email: row.Email,
                    password: hashedPassword, // Default password
                    role: row.Role ? row.Role.toUpperCase() : 'STUDENT',
                    schoolId: schoolId
                });
            }
        }

        if (usersToCreate.length === 0) {
            return res.status(400).json({ message: 'No valid user data found in file' });
        }

        await User.insertMany(usersToCreate);
        res.json({ message: `${usersToCreate.length} users imported successfully` });

    } catch (error) {
        // Handle duplicate email errors specifically if possible, or generic
        if (error.code === 11000) {
            return res.status(400).json({ message: 'One or more emails already exist' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { deleteUser, updateUser, importUsers };
