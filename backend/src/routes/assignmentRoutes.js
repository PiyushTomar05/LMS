const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const assignmentController = require('../controllers/assignmentController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Verify upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/assignments');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Routes
router.post('/', protect, authorize(['TEACHER']), assignmentController.createAssignment);
router.post('/submit', protect, authorize(['STUDENT']), upload.single('file'), assignmentController.submitAssignment);
router.get('/class/:classId', protect, assignmentController.getClassAssignments);
router.get('/student/my-submissions', protect, authorize(['STUDENT']), assignmentController.getMySubmissions);
router.get('/:assignmentId/submissions', protect, authorize(['TEACHER']), assignmentController.getSubmissions);
router.post('/submissions/:submissionId/grade', protect, authorize(['TEACHER']), assignmentController.gradeSubmission);

module.exports = router;
