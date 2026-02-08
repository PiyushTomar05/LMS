const express = require('express');
const { assignFee, getMyFees, payFee } = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/assign', protect, assignFee);
router.get('/my-fees', protect, getMyFees);
router.patch('/:id/pay', protect, payFee);

module.exports = router;
