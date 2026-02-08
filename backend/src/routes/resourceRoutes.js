const express = require('express');
const router = express.Router();
const { uploadResource, getClassResources, deleteResource } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure Multer for resources
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `resource-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.post('/', protect, authorize(['TEACHER', 'SCHOOL_ADMIN']), upload.single('file'), uploadResource);
router.get('/class/:classId', protect, getClassResources);
router.delete('/:id', protect, authorize(['TEACHER', 'SCHOOL_ADMIN']), deleteResource);

module.exports = router;
