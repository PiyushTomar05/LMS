const { Assignment, Submission } = require('../models/Assignment');
const path = require('path');

// Grade Submission (Teacher)
exports.gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Optional: Verify teacher owns the class (Robustness)
        // const assignment = await Assignment.findById(submission.assignmentId);
        // if (assignment.schoolId.toString() !== req.user.schoolId.toString()) ...

        submission.grade = grade;
        submission.feedback = feedback;
        await submission.save();

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Error grading submission' });
    }
};

// Teacher: Create Assignment
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, classId, dueDate } = req.body;
        const assignment = await Assignment.create({
            title, description, classId, dueDate,
            schoolId: req.user.schoolId
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating assignment' });
    }
};

// Student: Submit Assignment
exports.submitAssignment = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileUrl = `/uploads/assignments/${req.file.filename}`;
        const submission = await Submission.create({
            assignmentId: req.body.assignmentId,
            studentId: req.user._id,
            fileUrl
        });
        res.status(201).json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting assignment' });
    }
};

// Get Assignments for Class
exports.getClassAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ classId: req.params.classId });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments' });
    }
};

// Get Submissions for an Assignment (Teacher)
exports.getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignmentId })
            .populate('studentId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions' });
    }
};

// Get My Submissions (Student)
exports.getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user._id });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching my submissions' });
    }
};
