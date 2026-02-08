const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const University = require('./models/University');
const Course = require('./models/Course');
const Classroom = require('./models/Classroom');
const connectDB = require('./config/db');

dotenv.config();

const createFullDemoData = async () => {
    await connectDB();
    try {
        console.log('--- Starting Full Demo Data Seed (STRICT) ---');

        // 1. Reset Data
        const uniName = 'Greenwood University';
        await University.deleteMany({});
        await User.deleteMany({});
        await Course.deleteMany({});
        await Classroom.deleteMany({});
        console.log('Cleared database.');

        // 2. Create University
        const university = await University.create({
            name: uniName,
            address: '123 Education Lane, Tech City'
        });

        // 3. Create Admin
        const password = await bcrypt.hash('123456', 10);
        await User.create({
            firstName: 'Dean', lastName: 'Skinner',
            email: 'dean@university.com', password: password,
            role: 'UNIVERSITY_ADMIN', universityId: university._id
        });

        // 4. Create Classrooms
        const classrooms = await Classroom.insertMany([
            { name: 'Room 101', capacity: 40, universityId: university._id, type: 'Lecture Hall' },
            { name: 'Room 102', capacity: 40, universityId: university._id, type: 'Lecture Hall' },
            { name: 'Lab A', capacity: 25, universityId: university._id, type: 'Lab' },
            { name: 'Lab B', capacity: 25, universityId: university._id, type: 'Lab' },
            { name: 'Auditorium', capacity: 100, universityId: university._id, type: 'Lecture Hall' }
        ]);
        console.log(`Created ${classrooms.length} classrooms.`);

        // 5. Create Professors
        const professors = await User.insertMany([
            { firstName: 'Alan', lastName: 'Turing', email: 'turing@university.com', password, role: 'PROFESSOR', universityId: university._id, maxHoursPerDay: 4 },
            { firstName: 'Ada', lastName: 'Lovelace', email: 'lovelace@university.com', password, role: 'PROFESSOR', universityId: university._id, maxHoursPerDay: 4 },
            { firstName: 'Grace', lastName: 'Hopper', email: 'hopper@university.com', password, role: 'PROFESSOR', universityId: university._id, maxHoursPerDay: 3 }, // Limited hours
            { firstName: 'Isaac', lastName: 'Newton', email: 'newton@university.com', password, role: 'PROFESSOR', universityId: university._id, maxHoursPerDay: 5 },
        ]);
        console.log(`Created ${professors.length} professors.`);

        // 6. Create Students
        const students = [];
        for (let i = 1; i <= 20; i++) {
            students.push({
                firstName: `Student`, lastName: `${i}`,
                email: `student${i}@university.com`, password,
                role: 'STUDENT', universityId: university._id
            });
        }
        await User.insertMany(students);
        console.log(`Created ${students.length} students.`);

        // 7. Create Courses with Strict Fields
        const courseData = [
            // CS (Turing) - 40 Students, Core
            { name: 'Intro to CS', section: 'A', professorId: professors[0]._id, type: 'Core', weeklyHours: 3, studentCount: 40, requiredRoomType: 'Lecture Hall' },
            { name: 'Intro to CS', section: 'B', professorId: professors[0]._id, type: 'Core', weeklyHours: 3, studentCount: 40, requiredRoomType: 'Lecture Hall' },
            { name: 'Algorithms', section: 'A', professorId: professors[0]._id, type: 'Core', weeklyHours: 4, studentCount: 30, requiredRoomType: 'Lecture Hall' },

            // Programming (Lovelace) - Labs (20 students)
            { name: 'Web Dev', section: 'A', professorId: professors[1]._id, type: 'Lab', weeklyHours: 4, studentCount: 20, requiredRoomType: 'Lab' },
            { name: 'Web Dev', section: 'B', professorId: professors[1]._id, type: 'Lab', weeklyHours: 4, studentCount: 20, requiredRoomType: 'Lab' },
            { name: 'Database', section: 'A', professorId: professors[1]._id, type: 'Core', weeklyHours: 3, studentCount: 40, requiredRoomType: 'Lecture Hall' },

            // Systems (Hopper)
            { name: 'OS', section: 'A', professorId: professors[2]._id, type: 'Core', weeklyHours: 3, studentCount: 35, requiredRoomType: 'Lecture Hall' },
            { name: 'Compilers', section: 'A', professorId: professors[2]._id, type: 'Core', weeklyHours: 3, studentCount: 35, requiredRoomType: 'Lecture Hall' },

            // Math (Newton)
            { name: 'Calculus', section: 'A', professorId: professors[3]._id, type: 'Core', weeklyHours: 5, studentCount: 40, requiredRoomType: 'Lecture Hall' },
            { name: 'Physics', section: 'A', professorId: professors[3]._id, type: 'Core', weeklyHours: 3, studentCount: 40, requiredRoomType: 'Lecture Hall' },
            { name: 'Physics Lab', section: 'A', professorId: professors[3]._id, type: 'Lab', weeklyHours: 2, studentCount: 20, requiredRoomType: 'Lab' },
        ];

        const coursesWithUni = courseData.map(c => ({ ...c, universityId: university._id }));
        await Course.insertMany(coursesWithUni);
        console.log(`Created ${coursesWithUni.length} strict courses.`);

        console.log('--- Data Seed Completed ---');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createFullDemoData();
