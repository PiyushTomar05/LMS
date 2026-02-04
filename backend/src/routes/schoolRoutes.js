const express = require('express');
const { createSchool, getAllSchools, deleteSchool, updateSubscription } = require('../controllers/schoolController');
const router = express.Router();

// Ideally protect these routes with middleware (e.g., verifyToken, isSuperAdmin)
router.post('/', createSchool);
router.get('/', getAllSchools);
router.delete('/:id', deleteSchool);
router.patch('/:id/subscription', updateSubscription);

module.exports = router;
