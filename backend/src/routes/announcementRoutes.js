const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize(['SCHOOL_ADMIN', 'UNIVERSITY_ADMIN']), createAnnouncement);
router.get('/', protect, getAnnouncements);
router.delete('/:id', protect, authorize(['SCHOOL_ADMIN', 'UNIVERSITY_ADMIN']), deleteAnnouncement);

module.exports = router;
