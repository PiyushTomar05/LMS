const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Grade = require('../models/Grade');
const { FeePayment } = require('../models/Fee');
const fs = require('fs');
const path = require('path');

// Helper to generate PDF Header
const generateHeader = (doc, title) => {
    doc.fontSize(20).text('University Management System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
};

// @desc    Generate Grade Card PDF
// @route   GET /reports/grade-card/:studentId/:semester
const generateGradeCard = async (req, res) => {
    try {
        const { studentId, semester } = req.params;
        const student = await User.findById(studentId);
        const grades = await Grade.find({ studentId, semester }).populate('courseId');

        if (!student) return res.status(404).json({ message: "Student not found" });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=GradeCard_${student.urn}_Sem${semester}.pdf`);

        doc.pipe(res);

        generateHeader(doc, `Grade Card - Semester ${semester}`);

        // Student Info
        doc.fontSize(12).text(`Name: ${student.firstName} ${student.lastName}`);
        doc.text(`URN: ${student.urn}`);
        doc.text(`Program: ${student.program}`);
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Course Code', 50, tableTop);
        doc.text('Course Name', 150, tableTop);
        doc.text('Credits', 350, tableTop);
        doc.text('Grade', 450, tableTop);
        doc.moveDown();
        doc.font('Helvetica');

        // Table Rows
        let y = doc.y;
        let totalCredits = 0;
        let totalPoints = 0;

        grades.forEach(g => {
            const course = g.courseId;
            doc.text(course.code || 'N/A', 50, y);
            doc.text(course.name, 150, y);
            doc.text(g.credits.toString(), 350, y);
            doc.text(g.grade, 450, y);

            totalCredits += g.credits;
            totalPoints += (g.gradePoints * g.credits);

            y += 20;
        });

        doc.moveDown();
        doc.moveTo(50, y).lineTo(550, y).stroke();
        doc.moveDown();

        const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
        doc.fontSize(14).text(`SGPA: ${sgpa}`, { align: 'right' });

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Fee Receipt
// @route   GET /reports/fee-receipt/:paymentId
const generateFeeReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await FeePayment.findById(paymentId)
            .populate('studentId', 'firstName lastName urn program')
            .populate('feeStructureId', 'name');

        if (!payment) return res.status(404).json({ message: "Payment record not found" });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt_${payment.transactionId}.pdf`);
        doc.pipe(res);

        generateHeader(doc, 'Fee Receipt');

        doc.fontSize(12);
        doc.text(`Receipt No: ${payment.transactionId}`);
        doc.text(`Date: ${payment.paymentDate.toDateString()}`);
        doc.moveDown();

        doc.text(`Student: ${payment.studentId.firstName} ${payment.studentId.lastName} (${payment.studentId.urn})`);
        doc.text(`Program: ${payment.studentId.program}`);
        doc.moveDown();

        doc.text(`Fee Type: ${payment.feeStructureId.name}`);
        doc.text(`Amount Paid: ₹${payment.amountPaid}`);
        doc.text(`Payment Mode: ${payment.paymentMode}`);
        doc.text(`Status: ${payment.status}`);

        doc.moveDown(2);
        doc.fontSize(10).text('This is a computer generated receipt.', { align: 'center' });

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateGradeCard, generateFeeReceipt };
