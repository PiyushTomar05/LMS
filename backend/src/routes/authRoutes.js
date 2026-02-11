const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');

const { check } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validate
], loginUser);

router.post('/register', [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').not().isEmpty(),
    check('universityId', 'University ID is required').not().isEmpty(),
    validate
], registerUser);

router.get('/university/:universityId', require('../controllers/authController').getUsersByUniversity);

module.exports = router;
