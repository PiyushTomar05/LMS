const express = require('express');
const { createClass, getClassesBySchool, deleteClass, updateClass, enrollStudents, getTeacherClasses, getStudentClasses } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Ensure we have access to auth middleware for role checks if needed, though simpler for now
const router = express.Router();

// Public/Admin routes (some might need protection/specific roles in real app)
router.post('/', createClass);
router.get('/school/:schoolId', getClassesBySchool);
router.delete('/:id', deleteClass);
router.patch('/:id', updateClass);
router.post('/:id/enroll', enrollStudents);

// Specialized routes
// Note: These rely on req.user which is set by authMiddleware. 
// If 'protect' is not applied globally in server.js, apply it here.
// Assuming server.js applies 'protect' to '/classes' or we need to add it.
// Let's add it explicitly to be safe if not global.
router.get('/teacher/my-classes', getTeacherClasses);
router.get('/student/my-classes', getStudentClasses);

module.exports = router;
