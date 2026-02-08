const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const fixLogin = async () => {
    await connectDB();
    try {
        const email = 'dean@university.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found.');
            process.exit(1);
        }

        // Set plaintext password. The pre('save') hook in User.js will hash this.
        // DO NOT HASH IT MANUALLY HERE.
        user.password = '123456';
        await user.save();

        console.log('Password reset to plaintext "123456". Model hook should have hashed it once.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixLogin();
