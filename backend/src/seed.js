const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const University = require('./models/University');
const connectDB = require('./config/db');

const seedData = async () => {
    await connectDB();
    try {
        await User.deleteMany();
        await University.deleteMany();

        // 1. Create Super Admin
        const adminUser = await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@university.com',
            password: 'admin123',
            role: 'SUPER_ADMIN'
        });
        console.log('Super Admin Created:', adminUser.email);

        // 2. Create a Demo University
        const university = await University.create({
            name: 'Greenwood University',
            address: '123 Education Lane'
        });
        console.log('University Created:', university.name);

        // 3. Create University Admin
        const universityAdmin = await User.create({
            firstName: 'Dean',
            lastName: 'Skinner',
            email: 'dean@university.com',
            password: 'university123',
            role: 'UNIVERSITY_ADMIN',
            universityId: university._id
        });
        console.log('University Admin Created:', universityAdmin.email);

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
