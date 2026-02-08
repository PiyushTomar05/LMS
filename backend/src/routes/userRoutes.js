const express = require('express');
const { deleteUser, updateUser, importUsers } = require('../controllers/userController');
const { generateReportCard } = require('../controllers/reportController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Ideally protect these routes
router.patch('/change-password', require('../middleware/authMiddleware').protect, require('../controllers/userController').changePassword);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);
router.post('/import', upload.single('file'), importUsers);
router.get('/report/:studentId', generateReportCard);

module.exports = router;
