const express = require('express');
const { addGrade, getStudentGPA } = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/', protect, authorize(['SCHOOL_ADMIN', 'PROFESSOR']), addGrade);
router.get('/student/:studentId', protect, getStudentGPA);

module.exports = router;
