const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Find Students with missing Program or Semester
        const invalidStudents = await User.find({
            role: 'STUDENT',
            $or: [
                { program: { $exists: false } },
                { program: null },
                { semester: { $exists: false } },
                { semester: null }
            ]
        });

        console.log(`Found ${invalidStudents.length} students with missing data.`);

        if (invalidStudents.length > 0) {
            console.log("Fixing data... Setting default Program='B.Tech', Semester=1, AcademicYear='2025-2026'");

            const res = await User.updateMany(
                {
                    role: 'STUDENT',
                    $or: [
                        { program: { $exists: false } },
                        { program: null },
                        { semester: { $exists: false } }, // Note: semester 0 is valid? Usually 1-indexed.
                        { semester: null }
                    ]
                },
                {
                    $set: {
                        program: 'B.Tech',
                        semester: 1,
                        academicYear: '2025-2026'
                    }
                }
            );
            console.log(`Updated ${res.modifiedCount} records.`);
        }

        // 2. Clear invalid section data (e.g. empty strings vs null)
        const resSections = await User.updateMany(
            { role: 'STUDENT', section: "" },
            { $set: { section: null } }
        );
        console.log(`Normalized ${resSections.modifiedCount} empty sections to null.`);

        console.log("Data Fix Complete.");
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixData();
