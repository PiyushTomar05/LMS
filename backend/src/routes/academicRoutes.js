const express = require('express');
const router = express.Router();
const {
    generateURN,
    assignSections,
    generateRollNumbers,
    promoteStudents,
    getAcademicStats,
    getAvailableSections
} = require('../controllers/academicController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Base path: /api/academic

router.post('/urn', protect, authorize(['UNIVERSITY_ADMIN', 'SCHOOL_ADMIN']), generateURN);
router.post('/sections', protect, authorize(['UNIVERSITY_ADMIN', 'SCHOOL_ADMIN']), assignSections);
router.post('/roll-numbers', protect, authorize(['UNIVERSITY_ADMIN', 'SCHOOL_ADMIN']), generateRollNumbers);
router.post('/promote', protect, authorize(['UNIVERSITY_ADMIN', 'SCHOOL_ADMIN']), promoteStudents);

router.get('/stats/:universityId', protect, authorize(['UNIVERSITY_ADMIN', 'SCHOOL_ADMIN']), getAcademicStats);
router.get('/sections', protect, authorize(['UNIVERSITY_ADMIN', 'SCHOOL_ADMIN']), getAvailableSections);

module.exports = router;
