const express = require('express');
const { deleteUser, updateUser, importUsers } = require('../controllers/userController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.delete('/delete-all-students', require('../middleware/authMiddleware').protect, require('../controllers/userController').deleteAllStudents);
router.patch('/change-password', require('../middleware/authMiddleware').protect, require('../controllers/userController').changePassword);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);
router.post('/delete-selected', require('../middleware/authMiddleware').protect, require('../controllers/userController').deleteSelectedUsers);
router.delete('/delete-all/:role', require('../middleware/authMiddleware').protect, require('../controllers/userController').deleteAllUsersByRole);
router.post('/import', upload.single('file'), require('../controllers/userController').importUsers);

module.exports = router;
