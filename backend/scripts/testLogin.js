const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db')
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error(err));

const testLogin = async () => {
    try {
        const email = 'admin@test.com';
        const password = '123456';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        console.log(`User found: ${user.email}`);
        console.log(`Stored Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password Match: ${isMatch}`);

        if (!isMatch) {
            console.log('--- DIAGNOSTIC ---');
            // Check if it's double hashed by comparing with what we think it should be
            const salt = await bcrypt.genSalt(10);
            const manualHash = await bcrypt.hash(password, 10);
            console.log(`New Manual Hash: ${manualHash}`);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogin();
