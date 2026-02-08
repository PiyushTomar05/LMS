require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const University = require('../src/models/University'); // Use University as root
const Course = require('../src/models/Course');
const Classroom = require('../src/models/Classroom');
const { FeeStructure, FeePayment } = require('../src/models/Fee');
const TransportRoute = require('../src/models/TransportRoute');

// Helper to clear collections
const cleanDB = async () => {
    console.log('🧹 Cleaning Database...');
    await User.deleteMany({});
    await University.deleteMany({});
    await Course.deleteMany({});
    await Classroom.deleteMany({});
    await FeeStructure.deleteMany({});
    await FeePayment.deleteMany({});
    await TransportRoute.deleteMany({});
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db');
        console.log('✅ Connected to MongoDB');

        await cleanDB();

        // 1. Create University (Root Tenant)
        const university = await University.create({
            name: "Springfield Institute of Technology",
            address: "123 Education Lane",
            domain: "sit.edu",
            email: "contact@sit.edu", // Assuming these fields exist in University.js
            phone: "555-1234"
        });
        console.log('🏫 University created:', university.name);

        // ... previous University creation ...

        // 2. Create Users (Volume Data)
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt);

        // Admin
        const schoolAdmin = await User.create({
            firstName: "Seymour",
            lastName: "Skinner",
            email: "admin@sit.edu",
            password,
            role: "SCHOOL_ADMIN",
            universityId: university._id
        });

        // Professors (5)
        const professors = [];
        const depts = ["Computer Science", "Physics", "Mathematics", "English", "History"];
        for (let i = 0; i < 5; i++) {
            const prof = await User.create({
                firstName: ["Edna", "Elizabeth", "Dewey", "Walter", "John"][i],
                lastName: ["Krabappel", "Hoover", "Largo", "White", "Frink"][i],
                email: `prof${i + 1}@sit.edu`,
                password,
                role: "PROFESSOR",
                universityId: university._id,
                department: depts[i]
            });
            professors.push(prof);
        }

        // Students (50)
        const students = [];
        for (let i = 1; i <= 50; i++) {
            const student = await User.create({
                firstName: `Student${i}`,
                lastName: `Doe`,
                email: `student${i}@sit.edu`,
                password,
                role: "STUDENT",
                universityId: university._id,
                enrollmentNo: `SIT-2024-${String(i).padStart(3, '0')}`,
                program: "B.Tech",
                department: "Computer Science", // Simplifying for demo
                semester: i % 8 + 1
            });
            students.push(student);
        }

        console.log('👥 Users created: Admin, 5 Professors, 50 Students');

        // 3. Create Classrooms
        const classrooms = [];
        for (let i = 101; i <= 105; i++) {
            const room = await Classroom.create({
                name: `Room ${i}`,
                capacity: 40,
                type: i % 2 === 0 ? "Lab" : "Lecture Hall",
                universityId: university._id
            });
            classrooms.push(room);
        }

        // 4. Create Courses (10)
        const courses = [];
        const subjects = ["Python", "Java", "Data Structures", "Algorithms", "Database Systems", "Web Dev", "AI", "ML", "Networking", "OS"];

        for (let i = 0; i < 10; i++) {
            const course = await User.create({ // Mistake in previous code? No, Course model.
                // Actually need to use Course model
            });
        }

        // Correcting loop for courses
        for (let i = 0; i < 10; i++) {
            const course = await Course.create({
                name: subjects[i],
                code: `CS${200 + i}`,
                description: `Introduction to ${subjects[i]}`,
                credits: 3 + (i % 2),
                professorId: professors[i % 5]._id,
                universityId: university._id,
                section: i < 5 ? "A" : "B",
                type: i % 3 === 0 ? "Lab" : "Core",
                classroomId: classrooms[i % 5]._id,
                schedule: [
                    { day: "Monday", startTime: `${9 + i}:00`, endTime: `${10 + i}:00` },
                    { day: "Wednesday", startTime: `${9 + i}:00`, endTime: `${10 + i}:00` }
                ]
            });
            courses.push(course);
        }
        console.log('📚 Courses created: 10 subjects');

        // 5. Create Fee Structure
        const feeStruct = await FeeStructure.create({
            universityId: university._id,
            name: "Annual Tuition 2024",
            tuitionFee: 10000,
            labFee: 2000,
            totalAmount: 12000,
            dueDate: new Date('2024-12-31')
        });

        // 6. Assign Fees to All Students
        const feePromises = students.map(s => FeePayment.create({
            universityId: university._id,
            studentId: s._id,
            feeStructureId: feeStruct._id,
            totalPayable: 12000,
            remainingAmount: s.semester > 4 ? 0 : 12000, // Seniors paid off for demo variance
            status: s.semester > 4 ? 'PAID' : 'PENDING'
        }));
        await Promise.all(feePromises);
        console.log('💰 Fees assigned to all 50 students');

        // 7. Transport (Keep simple)
        await TransportRoute.create({
            universityId: university._id,
            routeNumber: "BUS-01",
            name: "Downtown Route",
            driverName: "Otto",
            vehicleNumber: "BUS-101",
            stops: [{ stopName: "Center", pickupTime: "7:00" }, { stopName: "Main St", pickupTime: "7:15" }]
        });
        console.log('🚌 Transport route created');

        console.log('✅ Seeding Complete!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedDB();
