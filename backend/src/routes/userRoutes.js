const express = require('express');
const { deleteUser, updateUser, importUsers } = require('../controllers/userController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Ideally protect these routes
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);
router.post('/import', upload.single('file'), importUsers);

module.exports = router;
