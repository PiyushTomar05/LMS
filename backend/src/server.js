const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Security Middleware
app.use(helmet()); // Set Security Headers
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(mongoSanitize()); // Prevent NoSQL injection

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed origins or is a vercel app
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Rate Limiting (Global)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased to 500 for demo purposes
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Auth Specific Limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50, // Increased to 50 for testing
    message: 'Too many login attempts, please try again later.'
});
app.use('/auth/login', authLimiter);


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
app.use('/reports', require('./routes/reportRoutes'));


const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5173"];
            if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
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
