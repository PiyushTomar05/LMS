const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const University = require('./models/University');
const connectDB = require('./config/db');

dotenv.config();

const createDemoUsers = async () => {
    await connectDB();
    try {
        // Find the demo university
        const university = await University.findOne({ name: 'Greenwood University' });
        if (!university) {
            console.log('University not found. Run seed first.');
            process.exit(1);
        }

        const password = await bcrypt.hash('123456', 10);

        // Create Professor
        const professorEmail = 'professor@university.com';
        let professor = await User.findOne({ email: professorEmail });
        if (!professor) {
            professor = await User.create({
                firstName: 'John',
                lastName: 'Professor',
                email: professorEmail,
                password: password, // Hashed '123456'
                role: 'PROFESSOR',
                universityId: university._id
            });
            console.log('Professor Created: ' + professorEmail);
        } else {
            console.log('Professor already exists: ' + professorEmail);
        }

        // Create Student
        const studentEmail = 'student@university.com';
        let student = await User.findOne({ email: studentEmail });
        if (!student) {
            student = await User.create({
                firstName: 'Jane',
                lastName: 'Student',
                email: studentEmail,
                password: password, // Hashed '123456'
                role: 'STUDENT',
                universityId: university._id
            });
            console.log('Student Created: ' + studentEmail);
        } else {
            console.log('Student already exists: ' + studentEmail);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createDemoUsers();
