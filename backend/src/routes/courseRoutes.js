const express = require('express');
const { createCourse, getCoursesByUniversity, deleteCourse, updateCourse, enrollStudents, getProfessorCourses, getStudentCourses } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Ensure we have access to auth middleware for role checks if needed, though simpler for now
const router = express.Router();

// Public/Admin routes (some might need protection/specific roles in real app)
router.post('/', createCourse);
router.get('/university/:universityId', getCoursesByUniversity);
router.delete('/:id', deleteCourse);
router.patch('/:id', updateCourse);
router.post('/:id/enroll', enrollStudents);

// Specialized routes
// Note: These rely on req.user which is set by authMiddleware. 
// If 'protect' is not applied globally in server.js, apply it here.
// Assuming server.js applies 'protect' to '/classes' or we need to add it.
// Let's add it explicitly to be safe if not global.
router.get('/professor/my-courses', protect, getProfessorCourses);
router.get('/student/my-courses', protect, getStudentCourses);

module.exports = router;
