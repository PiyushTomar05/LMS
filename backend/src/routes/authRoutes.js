const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/university/:universityId', require('../controllers/authController').getUsersByUniversity);

module.exports = router;
