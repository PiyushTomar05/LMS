const express = require('express');
const router = express.Router();
const { generateTimetable, getTimetable, createClassroom, getClassrooms } = require('../controllers/timetableController');

// Timetable
router.post('/generate', generateTimetable);
router.post('/reset', require('../controllers/timetableController').resetTimetable);
router.patch('/update', require('../controllers/timetableController').updateCourseSchedule);
router.get('/:universityId', getTimetable);

// Classrooms
router.post('/classrooms', createClassroom);
router.get('/classrooms/all', getClassrooms);

module.exports = router;
