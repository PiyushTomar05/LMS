const Class = require('../models/Class');

// @desc    Create a new class
// @route   POST /classes
// @access  School Admin
const createClass = async (req, res) => {
    try {
        const { name, schoolId } = req.body;

        // Simple validation: Ensure schoolId is provided (usually from logged in user's context)
        if (!schoolId) {
            return res.status(400).json({ message: 'School ID is required' });
        }

        const newClass = await Class.create({
            name,
            schoolId
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get classes by school
// @route   GET /classes/school/:schoolId
// @access  School Admin / Teacher
const getClassesBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const classes = await Class.find({ schoolId }).populate('teacherId', 'firstName lastName');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /classes/:id
// @access  School Admin
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClass = await Class.findByIdAndDelete(id);
        if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a class (Assign Teacher)
// @route   PATCH /classes/:id
// @access  School Admin
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedClass = await Class.findByIdAndUpdate(id, req.body, { new: true }).populate('teacherId', 'firstName lastName');
        res.json(updatedClass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Enroll students in a class
// @route   POST /classes/:id/enroll
// @access  School Admin
const enrollStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentIds } = req.body; // Expecting array of student IDs

        const updatedClass = await Class.findByIdAndUpdate(
            id,
            { $addToSet: { students: { $each: studentIds } } },
            { new: true }
        ).populate('teacherId', 'firstName lastName')
            .populate('students', 'firstName lastName email');

        res.json(updatedClass);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get classes for a teacher
// @route   GET /classes/teacher/my-classes
// @access  Teacher
const getTeacherClasses = async (req, res) => {
    try {
        // req.user.id coming from auth middleware
        const classes = await Class.find({ teacherId: req.user.id })
            .populate('students', 'firstName lastName email');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get classes for a student
// @route   GET /classes/student/my-classes
// @access  Student
const getStudentClasses = async (req, res) => {
    try {
        // Find classes where students array contains req.user.id
        const classes = await Class.find({ students: req.user.id })
            .populate('teacherId', 'firstName lastName');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createClass, getClassesBySchool, deleteClass, updateClass, enrollStudents, getTeacherClasses, getStudentClasses };
