const express = require('express');
const { createExam, generateExamTimetable, getExamSchedule, assignInvigilators } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize(['UNIVERSITY_ADMIN', 'SUPER_ADMIN']), createExam);
router.post('/:id/generate', protect, authorize(['UNIVERSITY_ADMIN']), generateExamTimetable);
router.post('/:id/invigilators', protect, authorize(['UNIVERSITY_ADMIN']), assignInvigilators);
router.get('/:id/schedule', protect, getExamSchedule);

module.exports = router;
