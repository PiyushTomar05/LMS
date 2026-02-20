/**
 * Utility script to bulk update passwords for specific users.
 * Usage: node src/updatePasswords.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const updatePasswords = async () => {
    await connectDB();
    try {
        const password = await bcrypt.hash('123456', 10);

        // Update Teacher
        await User.findOneAndUpdate(
            { email: 'teacher@school.com' },
            { password: password }
        );
        console.log('Updated teacher@school.com password to 123456');

        // Update Student
        await User.findOneAndUpdate(
            { email: 'student@school.com' },
            { password: password }
        );
        console.log('Updated student@school.com password to 123456');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updatePasswords();
