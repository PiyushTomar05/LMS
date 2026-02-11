const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000';

async function runAudit() {
    console.log('=========================================================');
    console.log('       SECURITY AUDIT & OPERATIONS TEST SUITE');
    console.log('=========================================================');

    // 1. Test Privilege Escalation
    console.log('\n[TEST 1] Privilege Escalation: Attempting to register as PROFESSOR via Public API...');
    try {
        const randomEmail = `hacker_prof_${Date.now()}@test.com`;
        const res = await axios.post(`${BASE_URL}/auth/register`, {
            firstName: "Hacker",
            lastName: "Professor",
            email: randomEmail,
            password: "password123",
            role: "PROFESSOR", // ATTACK VECTOR
            universityId: "UNI-123", // Assuming valid ID or loose check
            department: "CS",
            designation: "Hacker",
            qualification: "None",
            specialization: "None",
            employmentType: "Permanent"
        });

        if (res.data.role === 'PROFESSOR') {
            console.log('❌ FAIL: Privilege Escalation Successful! User registered with role PROFESSOR.');
        } else {
            console.log(`✅ PASS: Server forced role to ${res.data.role}`);
        }
    } catch (error) {
        console.log(`ℹ️ Info: Registration failed (might be due to validation): ${error.response?.data?.message || error.message}`);
    }

    // 2. Test SQL Injection (NoSQL)
    console.log('\n[TEST 2] NoSQL Injection: Attempting login bypass...');
    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: { "$gt": "" }, // Classic NoSQL Injection payload
            password: "password123"
        });
        console.log('❌ FAIL: Login Bypass Successful!');
    } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 500) {
            console.log(`✅ PASS: Payload rejected or Auth failed. (${error.response.status})`);
        } else {
            console.log(`❓ UNKNOWN: ${error.message}`);
        }
    }

    // 3. Rate Limiting Test
    console.log('\n[TEST 3] Rate Limiting: Sending burst requests to Login...');
    try {
        let blocked = false;
        // Valid email to avoid "User not found" costing less? No, rate limit hits IP.
        for (let i = 0; i < 15; i++) {
            try {
                await axios.post(`${BASE_URL}/auth/login`, { email: "test@test.com", password: "wrong" });
            } catch (e) {
                if (e.response?.status === 429) {
                    console.log(`✅ PASS: Rate limit triggered at request #${i + 1}`);
                    blocked = true;
                    break;
                }
            }
        }
        if (!blocked) console.log('❌ FAIL: Rate limiting not triggered after 15 attempts.');
    } catch (error) {
        console.log('Error during rate limit test:', error.message);
    }
}

runAudit();
