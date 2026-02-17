const Course = require('../models/Course');
const Grade = require('../models/Grade');

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
        let { studentIds } = req.body; // Expecting array of student IDs

        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const deniedStudents = [];

        // Prerequisite Check
        if (course.prerequisites && course.prerequisites.length > 0) {
            const allowedStudents = [];

            for (const studentId of studentIds) {
                // Check if student passed ALL prereqs
                // We find grades for this student in the prerequisite courses where they passed (gradePoints >= 4)
                const passingGrades = await Grade.find({
                    studentId,
                    courseId: { $in: course.prerequisites },
                    gradePoints: { $gte: 4 }
                });

                const passedCourseIds = new Set(passingGrades.map(g => g.courseId.toString()));

                // Check coverage
                const hasPassedAll = course.prerequisites.every(pId => passedCourseIds.has(pId.toString()));

                if (hasPassedAll) {
                    allowedStudents.push(studentId);
                } else {
                    deniedStudents.push(studentId);
                }
            }
            // Update the list to only include allowed students
            studentIds = allowedStudents;
        }

        if (studentIds.length === 0) {
            return res.status(400).json({
                message: 'No eligible students to enroll. Prerequisites not met.',
                deniedIds: deniedStudents
            });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { $addToSet: { students: { $each: studentIds } } },
            { new: true }
        ).populate('professorId', 'firstName lastName')
            .populate('students', 'firstName lastName email');

        res.json({
            message: `Enrolled ${studentIds.length} students.`,
            deniedCount: deniedStudents.length,
            deniedIds: deniedStudents,
            course: updatedCourse
        });
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
