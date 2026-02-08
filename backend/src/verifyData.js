const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const verifyData = async () => {
    await connectDB();
    try {
        const dean = await User.findOne({ email: 'dean@university.com' });
        console.log('Dean found:', !!dean);

        const courses = await Course.find({});
        console.log('Courses count:', courses.length);
        if (courses.length > 0) {
            console.log('Sample Course:', courses[0].name, 'Section:', courses[0].section);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyData();
