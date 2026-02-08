const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrateStudents = async () => {
    await connectDB();
    try {
        const students = await User.find({ role: 'STUDENT', urn: null });
        console.log(`Found ${students.length} students without URN.`);

        const year = new Date().getFullYear();
        let count = await User.countDocuments({ role: 'STUDENT', urn: { $regex: `^URN-${year}` } });

        for (const student of students) {
            count++;
            const sequence = String(count).padStart(4, '0');
            student.urn = `URN-${year}-${sequence}`;
            await student.save();
            console.log(`Assigned ${student.urn} to ${student.email}`);
        }

        console.log('Migration completed.');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateStudents();
