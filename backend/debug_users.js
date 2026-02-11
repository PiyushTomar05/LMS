const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const res = await User.updateOne(
            { email: 'piyushtomarp@gmail.com' },
            {
                $set: {
                    semester: 1,
                    academicYear: '2025-2026',
                    section: null, // Ensure unassigned
                    rollNumber: null // Ensure no roll
                }
            }
        );

        console.log("Update result:", res);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
