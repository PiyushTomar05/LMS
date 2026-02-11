const express = require('express');
const { assignFeeToStudents, getMyFees, payFee } = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/assign', protect, assignFeeToStudents);
router.get('/my-fees', protect, getMyFees);
router.patch('/:id/pay', protect, payFee);

module.exports = router;
