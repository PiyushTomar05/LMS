const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting (Global)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Auth Specific Limiter (Stricter)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10, // 10 Login attempts per hour
    message: 'Too many login attempts, please try again later.'
});
app.use('/auth/login', authLimiter);


// Database Connection
// Database Connection
connectDB();

const startCronJobs = require('./cron');
startCronJobs();

// Routes
app.use('/auth', authRoutes);
app.use('/universities', require('./routes/universityRoutes'));
app.use('/courses', require('./routes/courseRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/attendance', require('./routes/attendanceRoutes'));
app.use('/assignments', require('./routes/assignmentRoutes'));
app.use('/announcements', require('./routes/announcementRoutes'));
app.use('/resources', require('./routes/resourceRoutes'));
app.use('/timetable', require('./routes/timetableRoutes'));
app.use('/calendar', require('./routes/calendarRoutes'));
app.use('/fees', require('./routes/feeRoutes'));
app.use('/academic', require('./routes/academicRoutes'));
app.use('/grades', require('./routes/gradeRoutes'));
app.use('/exams', require('./routes/examRoutes'));
app.use('/reports', require('./routes/reportRoutes')); // Added Reports


const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"]
    }
});

// Socket logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
