const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://127.0.0.1:5000';
let adminToken = '';
let studentToken = '';
let studentId = '';
let universityId = '';

const log = (msg, type = 'INFO') => {
    console.log(`[${type}] ${msg}`);
};

const runVerification = async () => {
    log('Starting System Verification...');

    try {
        // 1. Health Check
        try {
            log('Checking Server Connectivity...');
            await axios.get(`${API_URL}/universities`); // Assuming get all exists
            log('Server is UP', 'PASS');
        } catch (e) {
            log('Server Check Failed: ' + e.message, 'ERROR');
        }

        // Fetch valid University ID
        try {
            const uniRes = await axios.get(`${API_URL}/universities`);
            if (uniRes.data && uniRes.data.length > 0) {
                universityId = uniRes.data[0]._id;
                log(`Using University ID: ${universityId}`, 'INFO');
            } else {
                log('No Universities found. Seeding might be needed.', 'WARN');
                // If no uni, we can't register.
            }
        } catch (e) {
            log('Failed to fetch universities: ' + e.message, 'WARN');
        }

        // 2. Authentication
        log('--- 2. Authentication Testing ---');
        // Register Admin (Should fail due to privilege escalation fix, or we use existing)
        // Let's assume we need to Login. If no user, we might need to seed.
        // For this script, we'll try to Login with a known user or Register a new Student.

        // Register Student
        const studentEmail = `verif_${Date.now()}@test.com`;
        const password = 'password123';

        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                firstName: 'Test',
                lastName: 'Student',
                email: studentEmail,
                password: password,
                role: 'STUDENT', // Should pass
                universityId: universityId || '60d5ecb8b392d7001f301234'
            });
            log(`Student Registration: SUCCESS (${regRes.data.role})`, 'PASS');
            studentId = regRes.data._id;
            universityId = regRes.data.universityId; // Assuming it returns user obj
        } catch (error) {
            // If universityId validation fails, we might need a real universityId.
            // But let's see if we get a response.
            log(`Student Registration Failed: ${error.message} - Status: ${error.response?.status} - Data: ${JSON.stringify(error.response?.data)}`, 'FAIL');
        }

        // Login Student
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: studentEmail,
                password: password
            });
            studentToken = loginRes.data.token;
            log('Student Login: SUCCESS', 'PASS');
        } catch (error) {
            log(`Student Login Failed: ${error.message} - Status: ${error.response?.status} - Data: ${JSON.stringify(error.response?.data)}`, 'FAIL');
        }

        // Admin Login (simulated or pre-existing)
        // Assuming we have an admin seed. If not, we can't test Admin routes easily without manual DB insert.
        // We'll skip Admin-only detailed writes if we don't have creds, but we'll try.

        // 3. Admission & Identity
        log('--- 3. Admission & Identity ---');
        if (studentToken) {
            const me = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'x-auth-token': studentToken }
            });
            if (me.data.urn) {
                log(`URN Generated: ${me.data.urn}`, 'PASS');
            } else {
                log('URN Missing in Student Profile', 'FAIL');
            }
        }

        // 4. Section & Roll Number (Requires Admin)
        // We'll skip write-tests that need Admin if we don't have token. 
        // But we can check if the endpoints exist.

        // 5. Course (Read)
        log('--- 5. Course Management ---');
        try {
            // Need a universityID to fetch courses. Using the one from student if avail.
            if (universityId) {
                const courses = await axios.get(`${API_URL}/courses/university/${universityId}`);
                log(`Fetch Courses: SUCCESS (${courses.data.length} found)`, 'PASS');
            }
        } catch (e) {
            log(`Fetch Courses Failed: ${e.message}`, 'FAIL');
        }

        // 12. Reports (PDF)
        log('--- 12. Reports ---');
        if (studentId && studentToken) {
            try {
                // Try to get grade card for Sem 1 (Might be empty but should not 500)
                await axios.get(`${API_URL}/reports/grade-card/${studentId}/1`, {
                    headers: { 'x-auth-token': studentToken }
                });
                log('Grade Card Endpoint: REACHABLE', 'PASS');
            } catch (e) {
                // 404 is expected if no student, but 500 is bad.
                if (e.response?.status === 404) log('Grade Card: 404 (Expected for new student)', 'PASS');
                else log(`Grade Card Error: ${e.message}`, 'FAIL');
            }
        }

        // 13. Security (Rate Limit)
        log('--- 13. Security Checks ---');
        log('Testing Rate Limit (sending 15 login requests)...');
        let blocked = false;
        for (let i = 0; i < 15; i++) {
            try {
                await axios.post(`${API_URL}/auth/login`, { email: 'bad@test.com', password: 'bad' });
            } catch (e) {
                if (e.response?.status === 429) {
                    blocked = true;
                    break;
                }
            }
        }
        if (blocked) log('Rate Limiting: ACTIVE', 'PASS');
        else log(`Rate Limiting: INACTIVE (Failed to block). Requests sent: 15. Last status: 200`, 'FAIL');

    } catch (err) {
        log(`Fatal Error: ${err.message}`, 'ERROR');
    }

    log('Verification Complete.');
};

runVerification();
