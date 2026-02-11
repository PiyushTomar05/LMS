const express = require('express');
const router = express.Router();
const { generateGradeCard, generateFeeReceipt } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/grade-card/:studentId/:semester', protect, generateGradeCard);
router.get('/fee-receipt/:paymentId', protect, generateFeeReceipt);

module.exports = router;
