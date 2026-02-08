const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

// Load Models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Attendance = require('../src/models/Attendance');
const Fee = require('../src/models/Fee');
const University = require('../src/models/University');
const School = require('../src/models/School');
const Announcement = require('../src/models/Announcement');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db')
    .then(() => console.log('MongoDB Connected for Large Seeding...'))
    .catch(err => console.error(err));

const seedData = async () => {
    try {
        console.log('--- STARTING LARGE SEED ---');

        // 1. Clear Database
        await User.deleteMany({});
        await Course.deleteMany({});
        await Attendance.deleteMany({});
        await Fee.deleteMany({});
        await University.deleteMany({});
        await School.deleteMany({});
        await Announcement.deleteMany({});
        console.log('Database Cleared.');

        // 2. Create University & School
        const uni = await University.create({
            name: 'Tech University',
            domain: 'university.com',
            adminEmail: 'dean@university.com',
            address: '123 Tech Lane, Silicon Valley'
        });

        const school = await School.create({
            name: 'School of Engineering',
            universityId: uni._id,
            adminId: new mongoose.Types.ObjectId() // Placeholder, updated later
        });

        const commonPassword = '123456'; // Model will hash this

        // 3. Create Specific Users
        // -- Dean (University Admin / School Admin)
        const dean = await User.create({
            firstName: 'Dean',
            lastName: 'Winchester',
            email: 'dean@university.com',
            password: commonPassword,
            role: 'SCHOOL_ADMIN',
            universityId: uni._id,
            schoolId: school._id,
            contactNumber: '9999999999'
        });

        // -- Specific Professors
        const turing = await User.create({
            firstName: 'Alan',
            lastName: 'Turing',
            email: 'turing@university.com',
            password: commonPassword,
            role: 'PROFESSOR',
            facultyId: 'FAC-001',
            designation: 'Professor',
            department: 'Computer Science',
            universityId: uni._id,
            schoolId: school._id
        });

        const lovelace = await User.create({
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'lovelace@university.com',
            password: commonPassword,
            role: 'PROFESSOR',
            facultyId: 'FAC-002',
            designation: 'Professor',
            department: 'Computer Science',
            universityId: uni._id,
            schoolId: school._id
        });

        const professors = [turing, lovelace];

        // -- Create 8 more Professors to make 10 total
        for (let i = 3; i <= 10; i++) {
            const tempProf = await User.create({
                firstName: `Professor`,
                lastName: `${i}`,
                email: `prof${i}@university.com`,
                password: commonPassword,
                role: 'PROFESSOR',
                facultyId: `FAC-00${i}`,
                designation: 'Assistant Professor',
                department: 'Computer Science',
                universityId: uni._id,
                schoolId: school._id
            });
            professors.push(tempProf);
        }
        console.log(`Created ${professors.length} Professors.`);

        // -- Create 10 Staff
        for (let i = 1; i <= 10; i++) {
            await User.create({
                firstName: `Staff`,
                lastName: `${i}`,
                email: `staff${i}@university.com`,
                password: commonPassword,
                role: 'STAFF',
                universityId: uni._id,
                schoolId: school._id,
                employmentType: 'Permanent'
            });
        }
        console.log('Created 10 Staff members.');

        // 4. Create Students (120 total, 4 sections of 30)
        const sections = ['A', 'B', 'C', 'D'];
        const students = [];

        for (let i = 1; i <= 120; i++) {
            const sectionIndex = Math.floor((i - 1) / 30); // 0-29 -> 0(A), 30-59 -> 1(B), etc.
            const section = sections[sectionIndex];

            const student = await User.create({
                firstName: `Student`,
                lastName: `${i}`,
                email: i === 1 ? 'student1@university.com' : `student${i}@university.com`,
                password: commonPassword,
                role: 'STUDENT',
                universityId: uni._id,
                schoolId: school._id,
                urn: i === 1 ? 'URN-2026-0001' : `URN-2026-${String(i).padStart(4, '0')}`,
                section: section,
                department: 'Computer Science',
                currentSemester: 3,
                batchYear: '2025-2029',
                rollNumber: `R${String(i).padStart(3, '0')}`
            });
            students.push(student);
        }
        console.log(`Created ${students.length} Students across sections A, B, C, D.`);

        // 5. Create Courses (Subject assignments)
        // We have 10 professors. Assign 2 professors to each subject (different sections) or similar.
        // Subjects: Data Structures, Algorithms, Database Systems, Operating Systems, Web Development

        const subjects = [
            { name: 'Data Structures', code: 'CS201' },
            { name: 'Algorithms', code: 'CS202' },
            { name: 'Database Systems', code: 'CS203' },
            { name: 'Operating Systems', code: 'CS204' },
            { name: 'Web Development', code: 'CS205' }
        ];

        // Create course instances for sections
        // Strategy: Each subject is taught in ALL sections (A, B, C, D)
        // Assign different professors to cover these.

        let courseCount = 0;
        for (const subject of subjects) {
            for (const section of sections) {
                // Round robin assignment of professors
                const profIndex = (courseCount) % professors.length;
                const assignedProf = professors[profIndex];

                const course = await Course.create({
                    name: subject.name,
                    code: subject.code,
                    section: section,
                    universityId: uni._id,
                    schoolId: school._id,
                    professorId: assignedProf._id,
                    department: 'Computer Science',
                    credits: 4,
                    schedule: [
                        { day: 'Monday', startTime: '09:00', endTime: '10:00' },
                        { day: 'Wednesday', startTime: '09:00', endTime: '10:00' }
                    ]
                });

                // Enroll students of that section
                const sectionStudents = students.filter(s => s.section === section);
                const studentIds = sectionStudents.map(s => s._id);

                course.students.push(...studentIds);
                await course.save();

                courseCount++;
            }
        }
        console.log('Created Courses and enrolled students.');

        // 6. Create Announcements
        await Announcement.create({
            title: 'Welcome to the New Academic Session',
            content: 'We are excited to have you all efficiently planned and seeded!',
            audience: 'ALL',
            postedBy: dean._id,
            universityId: uni._id
        });

        // 7. Mock Fees for Student 1
        const s1 = students.find(s => s.email === 'student1@university.com');
        if (s1) {
            await Fee.create({
                studentId: s1._id,
                universityId: uni._id,
                type: 'Tuition',
                amount: 75000,
                dueDate: new Date('2026-05-01'),
                status: 'PENDING'
            });
        }

        console.log('--- SEED COMPLETED SUCCESSFULLY ---');
        console.log('Credentials:');
        console.log('Dean: dean@university.com / 123456');
        console.log('Prof Turing: turing@university.com / 123456');
        console.log('Student 1: student1@university.com / 123456');

        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedData();
