const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Announcement = require('../src/models/Announcement');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db')
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error(err));

const verifyData = async () => {
    try {
        console.log('--- VERIFYING DATA ---');

        // 1. Check Professor
        const professor = await User.findOne({ email: 'prof@test.com' });
        if (!professor) {
            console.log('❌ Professor not found');
            process.exit(1);
        }
        console.log(`✅ Professor Found: ${professor._id} (${professor.firstName})`);

        // 2. Check Course
        const courses = await Course.find({ professorId: professor._id });
        console.log(`🔎 Courses found for Professor: ${courses.length}`);
        courses.forEach(c => console.log(`   - ${c.name} (Code: ${c.code})`));

        if (courses.length === 0) {
            console.log('❌ NO COURSES assigned to this professor!');
            // Check if any courses exist at all
            const allCourses = await Course.find({});
            console.log(`ℹ️  Total Courses in DB: ${allCourses.length}`);
            allCourses.forEach(c => console.log(`   - Course: ${c.name}, ProfId: ${c.professorId}`));
        } else {
            console.log('✅ Courses linkage correct.');
        }

        // 3. Check Announcements
        const announcements = await Announcement.find({});
        console.log(`🔎 Total Announcements: ${announcements.length}`);
        announcements.forEach(a => console.log(`   - Title: ${a.title}, PostedBy: ${a.postedBy}`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyData();
