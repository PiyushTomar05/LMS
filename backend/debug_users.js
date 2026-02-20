const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');
require('dotenv').config();

const checkUsers = async () => {
    await connectDB();
    try {
        console.log("--- Users in DB ---");
        const users = await User.find({}, 'email role firstName lastName');
        if (users.length === 0) {
            console.log("No users found.");
        } else {
            console.log(JSON.stringify(users, null, 2));
        }

        // Also check if we can identify the password hash for 'dean' to see if others match it (roughly)
        // actually we can't easily reverse hash, but we can see if they are identical strings implying same password
        const fullUsers = await User.find({}, 'email password');
        console.log("\n--- Password Hash Comparison ---");
        const dean = fullUsers.find(u => u.email === 'dean@university.com');
        if (dean) {
            console.log(`Dean's hash starts with: ${dean.password.substring(0, 20)}...`);
            fullUsers.forEach(u => {
                if (u.email !== 'dean@university.com') {
                    const match = u.password === dean.password;
                    console.log(`${u.email}: Hash matches Dean's? ${match}`);
                }
            });
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
