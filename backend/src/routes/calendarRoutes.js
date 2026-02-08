const express = require('express');
const { getEvents, addEvent, deleteEvent } = require('../controllers/calendarController');
const router = express.Router();

router.get('/', getEvents);
router.post('/', addEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
