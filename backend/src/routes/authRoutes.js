const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/school/:schoolId', require('../controllers/authController').getUsersBySchool);

module.exports = router;
