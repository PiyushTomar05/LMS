const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const attendanceController = require('../controllers/attendanceController');

// Teacher/Admin can mark attendance
router.post('/mark', protect, authorize(['TEACHER', 'SCHOOL_ADMIN']), attendanceController.markAttendance);

// Get attendance for a specific class date
router.get('/class', protect, authorize(['TEACHER', 'SCHOOL_ADMIN']), attendanceController.getClassAttendance);

// Get stats for a student
router.get('/student/:studentId', protect, attendanceController.getStudentAttendanceStats);

module.exports = router;
