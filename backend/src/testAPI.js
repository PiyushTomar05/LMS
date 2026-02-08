const axios = require('axios');

const testAPI = async () => {
    try {
        const uniId = '698442e199a83d37c5c3b314'; // ID from inspectDB
        console.log(`Testing with University ID: ${uniId}`);

        // 1. Test Courses
        try {
            const courseRes = await axios.get(`http://localhost:5000/courses/university/${uniId}`);
            console.log(`Courses Found: ${courseRes.data.length}`);
            if (courseRes.data.length > 0) console.log('Sample Course:', courseRes.data[0].name);
        } catch (e) {
            console.log('Course Fetch Failed:', e.message);
        }

        // 2. Test Users
        try {
            const userRes = await axios.get(`http://localhost:5000/auth/university/${uniId}`);
            console.log(`Users Found: ${userRes.data.length}`);
        } catch (e) {
            console.log('User Fetch Failed:', e.message);
        }

    } catch (error) {
        console.error(error);
    }
};

testAPI();
