const Course = require('../models/Course');

// @desc    Create a new course
// @route   POST /courses
// @access  University Admin
const createCourse = async (req, res) => {
    try {
        const { name, code, credits, prerequisites, universityId, schedule } = req.body;

        // Simple validation: Ensure universityId is required
        if (!universityId) {
            return res.status(400).json({ message: 'University ID is required' });
        }

        const newCourse = await Course.create({
            name,
            code,
            credits,
            section: req.body.section || 'A', // Default to A
            prerequisites,
            universityId,
            schedule // Optional
        });

        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get courses by university
// @route   GET /courses/university/:universityId
// @access  University Admin / Professor
const getCoursesByUniversity = async (req, res) => {
    try {
        const { universityId } = req.params;
        const courses = await Course.find({ universityId }).populate('professorId', 'firstName lastName');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /courses/:id
// @access  University Admin
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course (Assign Professor)
// @route   PATCH /courses/:id
// @access  University Admin
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCourse = await Course.findByIdAndUpdate(id, req.body, { new: true }).populate('professorId', 'firstName lastName');
        res.json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Enroll students in a course
// @route   POST /courses/:id/enroll
// @access  University Admin
const enrollStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentIds } = req.body; // Expecting array of student IDs

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { $addToSet: { students: { $each: studentIds } } },
            { new: true }
        ).populate('professorId', 'firstName lastName')
            .populate('students', 'firstName lastName email');

        res.json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get courses for a professor
// @route   GET /courses/professor/my-courses
// @access  Professor
const getProfessorCourses = async (req, res) => {
    try {
        // req.user.id coming from auth middleware
        const courses = await Course.find({ professorId: req.user.id })
            .populate('students', 'firstName lastName email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get courses for a student
// @route   GET /courses/student/my-courses
// @access  Student
const getStudentCourses = async (req, res) => {
    try {
        // Find courses where students array contains req.user.id
        const courses = await Course.find({ students: req.user.id })
            .populate('professorId', 'firstName lastName');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCourse, getCoursesByUniversity, deleteCourse, updateCourse, enrollStudents, getProfessorCourses, getStudentCourses };
