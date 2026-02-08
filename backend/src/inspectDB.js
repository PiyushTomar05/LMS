const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const University = require('./models/University');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const inspectDB = async () => {
    await connectDB();
    try {
        const universities = await University.find();
        console.log('Universities:', universities.map(u => ({ id: u._id, name: u.name })));

        const dean = await User.findOne({ email: 'dean@university.com' });
        console.log('Dean:', dean ? { id: dean._id, uniId: dean.universityId } : 'Not Found');

        const courses = await Course.find();
        console.log(`Total Courses: ${courses.length}`);
        if (courses.length > 0) {
            console.log('Sample Course UniID:', courses[0].universityId);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectDB();
