const Grade = require('../models/Grade');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// Grade Point Mapping (Standard 10-point scale)
const GRADE_POINTS = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0,
    'Absent': 0
};

// @desc    Add or Update a Grade
// @route   POST /grades
// @access  Admin/Professor
const addGrade = async (req, res) => {
    try {
        const { studentId, courseId, semester, grade, type, examSession } = req.body;

        const gradePoints = GRADE_POINTS[grade];
        if (gradePoints === undefined) {
            return res.status(400).json({ message: 'Invalid Grade' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if grade exists for this session
        let gradeRecord = await Grade.findOne({ studentId, courseId, examSession });

        if (gradeRecord) {
            // Update existing
            gradeRecord.grade = grade;
            gradeRecord.gradePoints = gradePoints;
            gradeRecord.type = type || gradeRecord.type;
            gradeRecord.credits = course.credits || 4; // Default to 4 if missing
            gradeRecord.isAudit = course.type === 'Audit';
            await gradeRecord.save();
        } else {
            // Create new
            gradeRecord = await Grade.create({
                studentId,
                courseId,
                semester,
                grade,
                gradePoints,
                credits: course.credits || 4, // Default to 4
                type: type || 'Regular',
                examSession,
                isAudit: course.type === 'Audit'
            });
        }

        res.status(201).json(gradeRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Transcript / Calculate API
// @route   GET /grades/student/:studentId
// @access  Private
const getStudentGPA = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Fetch all grades for the student
        const allGrades = await Grade.find({ studentId }).populate('courseId', 'name code type');

        if (!allGrades.length) {
            return res.json({ sgpa: 0, cgpa: 0, semesters: [], transcript: [] });
        }

        // Logic: Group by Course. If multiple attempts, pick BEST result.
        // But for SGPA of a specific semester, we usually look at that specific semester's attempt? 
        // Actually, transcripts usually show the LATEST status or Cleaned status.
        // For CGPA: Use Best Attempt.
        // For SGPA history: We calculate per semester based on the grades obtained IN THAT SEMESTER or usually the final result of that semester.
        // Let's implement: 
        // 1. Group by Semester for SGPA
        // 2. Global Group for CGPA

        // --- CGPA Calculation (Best Grades) ---
        const bestGradesMap = {}; // courseId -> GradeDoc
        allGrades.forEach(g => {
            if (g.isAudit) return; // Skip audit for CGPA

            if (!bestGradesMap[g.courseId._id] || g.gradePoints > bestGradesMap[g.courseId._id].gradePoints) {
                bestGradesMap[g.courseId._id] = g;
            }
        });

        let totalPoints = 0;
        let totalCredits = 0;

        Object.values(bestGradesMap).forEach(g => {
            totalPoints += (g.gradePoints * g.credits);
            totalCredits += g.credits;
        });

        const cgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);

        // --- SGPA Calculation (Per Semester) ---
        // This is tricky if backlogs are cleared later. 
        // Valid approach: SGPA for Sem X is calculated using the Best Grades for courses belonging to Sem X.

        const semesterMap = {}; // semNumber -> { points: 0, credits: 0, courses: [] }

        allGrades.forEach(g => {
            if (!semesterMap[g.semester]) {
                semesterMap[g.semester] = { points: 0, credits: 0, courses: [] };
            }
            // For breakdown list only
            semesterMap[g.semester].courses.push(g);
        });

        // Re-calculate SGPA based on BEST attempts for that semester's courses
        const semesterSGPAs = {};

        // We iterate through BEST grades to populate semester credits
        Object.values(bestGradesMap).forEach(g => {
            const sem = g.semester;
            if (!semesterSGPAs[sem]) semesterSGPAs[sem] = { points: 0, credits: 0 };
            semesterSGPAs[sem].points += (g.gradePoints * g.credits);
            semesterSGPAs[sem].credits += g.credits;
        });

        const semesterResults = Object.keys(semesterMap).map(sem => {
            const data = semesterSGPAs[sem] || { points: 0, credits: 0 };
            return {
                semester: sem,
                sgpa: data.credits === 0 ? 0 : (data.points / data.credits).toFixed(2),
                creditsEarned: data.credits,
                courses: semesterMap[sem].courses // Show all attempts in history
            };
        });

        res.json({
            studentId,
            cgpa,
            totalCredits,
            semesters: semesterResults
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addGrade, getStudentGPA };
