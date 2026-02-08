const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
    await connectDB();
    try {
        const email = 'dean@university.com';
        const password = '123456';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log('SUCCESS: Password matches.');
        } else {
            console.log('FAILURE: Password does NOT match.');
            console.log('Stored Hash:', user.password);

            // Force reset using model hook
            user.password = password;
            await user.save();
            console.log('Password has been reset to "123456" via model hook.');
        }


        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogin();
