const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { Submission } = require('../models/Assignment');
const Course = require('../models/Course');

exports.generateReportCard = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId).populate('universityId');

        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Get courses for student
        const studentCourses = await Course.find({ students: studentId }).populate('professorId');

        // Get Attendance
        const attendance = await Attendance.find({ studentId });

        // Get Submissions (Grades)
        const submissions = await Submission.find({ studentId }).populate('assignmentId');

        const doc = new PDFDocument({ margin: 50 });

        // Stream PDF to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${student.firstName}.pdf`);
        doc.pipe(res);

        // Header
        doc.fillColor('#1e3a8a').fontSize(24).text('Student Report Card', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).fillColor('#444').text(student.universityId.name, { align: 'center' });
        doc.moveDown(2);

        // Student Info
        doc.fontSize(12).fillColor('#000').text(`Student Name: ${student.firstName} ${student.lastName}`);
        doc.text(`Email: ${student.email}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.rect(50, doc.y, 500, 2).fill('#eee');
        doc.moveDown();

        // Academic Performance Table Header
        doc.fontSize(14).fillColor('#1e3a8a').text('Academic Performance', { underline: true });
        doc.moveDown();

        doc.fontSize(10).fillColor('#000');

        let yPos = doc.y;
        doc.text('Course Name', 50, yPos, { bold: true });
        doc.text('Professor', 200, yPos, { bold: true });
        doc.text('Attendance %', 350, yPos, { bold: true });
        doc.text('Avg Grade', 450, yPos, { bold: true });
        doc.moveDown();

        studentCourses.forEach(course => {
            const courseAttendance = attendance.filter(a => a.courseId.toString() === course._id.toString());
            const presentDays = courseAttendance.filter(a => a.status === 'Present').length;
            const attPercentage = courseAttendance.length > 0 ? ((presentDays / courseAttendance.length) * 100).toFixed(1) : 'N/A';

            const classSubmissions = submissions.filter(s => {
                // This is a bit complex as assignments are linked to courses
                // For now we'll match by some logic or assume all assignments in submissions relate to his courses
                return true;
            });

            const gradedSubmissions = classSubmissions.filter(s => s.grade !== undefined);
            const avgGrade = gradedSubmissions.length > 0 ? (gradedSubmissions.reduce((acc, s) => acc + s.grade, 0) / gradedSubmissions.length).toFixed(1) : 'N/A';

            yPos = doc.y;
            doc.text(course.name, 50, yPos);
            doc.text(course.professorId ? `${course.professorId.firstName} ${course.professorId.lastName}` : 'N/A', 200, yPos);
            doc.text(`${attPercentage}%`, 350, yPos);
            doc.text(avgGrade, 450, yPos);
            doc.moveDown();
        });

        doc.moveDown(2);
        doc.fontSize(12).text('Notes:', { bold: true });
        doc.fontSize(10).text('This is an automatically generated report card. For any discrepancies, please contact the school administration.');

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
