const express = require('express');
const { createUniversity, getAllUniversities, deleteUniversity, updateSubscription } = require('../controllers/universityController');
const router = express.Router();

// Ideally protect these routes with middleware (e.g., verifyToken, isSuperAdmin)
router.post('/', createUniversity);
router.get('/', getAllUniversities);
router.delete('/:id', deleteUniversity);
router.patch('/:id/subscription', updateSubscription);

module.exports = router;
