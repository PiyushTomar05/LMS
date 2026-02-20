const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');
require('dotenv').config();

const findSampleUsers = async () => {
    await connectDB();
    try {
        console.log("--- Finding Sample Users ---");

        const roles = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PROFESSOR', 'STUDENT'];
        const samples = {};

        for (const role of roles) {
            const user = await User.findOne({ role }).select('email role');
            samples[role] = user ? user.email : 'Not Found';
        }

        console.log(JSON.stringify(samples, null, 2));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findSampleUsers();
