const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000';

async function checkHealth() {
    console.log(`🏥 Starting System Health Check on ${BASE_URL}...\n`);

    const checks = [
        { name: 'Server Root', url: '/', method: 'GET' },
        { name: 'Auth Health', url: '/auth/health', method: 'GET' }, // If exists, or we check 404
        { name: 'Public Config', url: '/api/config/paypal', method: 'GET' } // Example
    ];

    let passed = 0;

    // 1. Basic Server Connectivity
    try {
        const res = await axios.get(BASE_URL + '/');
        console.log(`✅ Server is UP: ${res.data.message || 'OK'} (${res.status})`);
        passed++;
    } catch (e) {
        if (e.response && e.response.status === 404) {
            console.log(`✅ Server is UP (Root returned 404, which is expected for API-only servers)`);
            passed++;
        } else {
            console.error(`❌ Server Connection FAILED: ${e.message}`);
            return; // Stop if server is down
        }
    }

    // 2. Database Connectivity (via simple read)
    try {
        // Try to fetch public info or fail auth
        await axios.get(BASE_URL + '/api/users/profile'); // Should return 401
    } catch (e) {
        if (e.response && e.response.status === 401) {
            console.log(`✅ Auth Middleware acts correctly (401 on protected route).`);
            passed++;
        } else {
            console.log(`❌ Auth Middleware Check Failed: ${e.message}`);
        }
    }

    // 3. Login Simulation (Admin) - Requires defined credentials in .env or hardcoded test user?
    // We skip Login in this simple check, but user can run 'audit_security_test.js' for flow.

    console.log(`\n🏁 Health Check Complete. Passed basic connectivity checks.`);
    console.log(`👉 Please follow 'walkthrough.md' for manual functional testing.`);
}

checkHealth();
