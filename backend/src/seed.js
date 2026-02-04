const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const School = require('./models/School');
const connectDB = require('./config/db');

const seedData = async () => {
    await connectDB();
    try {
        await User.deleteMany();
        await School.deleteMany();

        // 1. Create Super Admin
        const adminUser = await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@school.com',
            password: 'admin123',
            role: 'SUPER_ADMIN'
        });
        console.log('Super Admin Created:', adminUser.email);

        // 2. Create a Demo School
        const school = await School.create({
            name: 'Greenwood High',
            address: '123 Education Lane'
        });
        console.log('School Created:', school.name);

        // 3. Create School Admin
        const schoolAdmin = await User.create({
            firstName: 'Principal',
            lastName: 'Skinner',
            email: 'principal@school.com',
            password: 'school123',
            role: 'SCHOOL_ADMIN',
            schoolId: school._id
        });
        console.log('School Admin Created:', schoolAdmin.email);

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
