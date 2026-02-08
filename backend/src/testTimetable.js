const testTimetable = async () => {
    try {
        const BASE_URL = 'http://localhost:5000';
        // Helper for fetch
        const post = async (url, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`POST ${url} failed: ${res.status} ${res.statusText}`);
            return await res.json();
        };

        const get = async (url, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
            return await res.json();
        };

        // Authenticate as Dean
        console.log('Logging in...');
        const loginRes = await post(`${BASE_URL}/auth/login`, {
            email: 'dean@university.com',
            password: '123456'
        });

        const token = loginRes.access_token;
        const universityId = loginRes.user.universityId;

        console.log('Logged in as Dean.');

        // 1. Reset
        console.log('Resetting timetable...');
        await post(`${BASE_URL}/timetable/reset`, { universityId }, token);

        // 2. Generate
        console.log('Generating strict timetable...');
        const GenRes = await post(`${BASE_URL}/timetable/generate`, { universityId }, token);

        console.log('Generation Result:', GenRes);

        // 3. Verify Constraints
        const courses = await get(`${BASE_URL}/timetable/${universityId}`, token);

        let conflicts = 0;
        const dayTimeMap = {}; // { "Day-Time": Set(SectionIDs) }

        courses.forEach(c => {
            if (!c.schedule) return;
            c.schedule.forEach(slot => {
                const key = `${slot.day}-${slot.startTime}`;
                if (!dayTimeMap[key]) dayTimeMap[key] = new Set();

                if (dayTimeMap[key].has(c.section)) {
                    console.error(`CONFLICT DETECTED: Section ${c.section} has multiple classes at ${key} (${c.name})`);
                    conflicts++;
                } else {
                    dayTimeMap[key].add(c.section);
                }
            });
        });

        if (conflicts === 0) {
            console.log('✅ SUCCESS: No Section conflicts detected.');
        } else {
            console.log(`❌ FAILED: ${conflicts} conflicts detected.`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testTimetable();
