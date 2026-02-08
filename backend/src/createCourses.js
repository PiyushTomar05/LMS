const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const User = require('./models/User');
const University = require('./models/University');
const connectDB = require('./config/db');

dotenv.config();

const createCourses = async () => {
    await connectDB();
    try {
        const university = await University.findOne({ name: 'Greenwood University' });
        if (!university) {
            console.log('University not found.');
            process.exit(1);
        }

        const professor = await User.findOne({ email: 'professor@university.com' });
        if (!professor) {
            console.log('Professor not found. Run createDemoUsers.js first.');
            process.exit(1);
        }

        // Clear existing courses
        await Course.deleteMany({ universityId: university._id });
        console.log('Existing courses cleared.');

        const courses = [
            { name: 'Introduction to Computer Science', professorId: professor._id, universityId: university._id },
            { name: 'Data Structures', professorId: professor._id, universityId: university._id },
            { name: 'Algorithms', professorId: professor._id, universityId: university._id },
            { name: 'Database Systems', professorId: professor._id, universityId: university._id },
            { name: 'Web Development', professorId: professor._id, universityId: university._id },
        ];

        await Course.insertMany(courses); // Fixed: Changed from create to insertMany for array
        console.log('Courses created successfully.');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createCourses();
