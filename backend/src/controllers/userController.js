const User = require('../models/User');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const { validateProgramDepartment } = require('../utils/validation');


// @desc    Delete user
// @route   DELETE /users/:id
// @access  School Admin
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PATCH /users/:id
// @access  School Admin
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Import users from Excel
// @route   POST /users/import
// @access  School Admin
const importUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel file' });
        }

        const { universityId } = req.body;
        if (!universityId) {
            return res.status(400).json({ message: 'University ID is required' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const usersToCreate = [];

        // 1. Prepare Base Data for ID Generation
        const currentYear = new Date().getFullYear();
        const Counter = require('../models/Counter');

        // We will increment counters ONCE by the number of needed IDs (Bulk Reservation)
        // But we don't know exactly how many valid students/faculty until we parse?
        // Actually we do parse first.
        // Let's first parse roles to count how many of each we need.

        // PEEK at data to count roles
        let studentNeed = 0;
        let facultyNeed = 0;

        data.forEach(row => {
            const r = (row['User Role'] || row['Role'] || '').toString().toUpperCase().trim();
            const d = (row['Designation'] || '').toString().toUpperCase().trim();
            let isProf = r === 'PROFESSOR' || r === 'TEACHER' || r === 'FACULTY' || (d && (d.includes('PROFESSOR') || d.includes('TEACHER')));

            if (isProf) facultyNeed++;
            else studentNeed++; // Assume student/staff split, simplified for counter reservation logic or just do one by one.
            // Actually, mixed import is rare. Usually one file per role.
            // Let's stick to simple "One by One" atomic increment if list is small (<1000). 
            // Or better, just countDocuments as "starting point" is risky if concurrent admissions happen.
            // Correct approach: Use atomic counter.
        });

        // For simplicity and safety against concurrency, let's just initialize variables and use atomic updates OR 
        // if performance is key, reserve. 
        // Let's use PRE-FETCHED sequence via `countDocuments` methodology but using `Counter` model? 
        // No, `countDocuments` is unreliable.
        // Let's just use `fetchCurrentSeq` helper? 
        // Actually, the previous code used `studentCount` based on DB.
        // I will replace this block with initializing the Counter logic variables.

        // We will resolve sequence dynamically inside the loop or reserve block. 
        // Let's reserve block to ensure import gets a contiguous chunk (nice for paper records).

        let urnStart = 0;
        let facStart = 0;

        if (studentNeed > 0) {
            const c = await Counter.findByIdAndUpdate(
                { _id: `urn_${currentYear}` },
                { $inc: { seq: studentNeed } },
                { new: true, upsert: true }
            );
            urnStart = c.seq - studentNeed;
        }

        if (facultyNeed > 0) {
            const c = await Counter.findByIdAndUpdate(
                { _id: `faculty_${currentYear}` },
                { $inc: { seq: facultyNeed } },
                { new: true, upsert: true }
            );
            facStart = c.seq - facultyNeed;
        }

        const salt = await bcrypt.genSalt(10);
        const defaultPasswordHash = await bcrypt.hash('123456', salt);

        for (const row of data) {
            // Map Headers from User's Excel (keys with spaces)
            const firstName = row['First Name'] || row['FirstName'];
            const lastName = row['Last Name'] || row['LastName'];
            const email = row['Email'];

            if (!firstName || !lastName || !email) continue;

            // Debug Logging to File
            const debugLogPath = require('path').join(__dirname, '../../import_debug.log');
            const fs = require('fs');

            if (data.indexOf(row) === 0) {
                fs.appendFileSync(debugLogPath, `\n--- NEW UPLOAD ---\nHeaders: ${JSON.stringify(Object.keys(row))}\n`);
            }
            if (data.indexOf(row) < 5) {
                fs.appendFileSync(debugLogPath, `Row ${data.indexOf(row)}: Role=${row['Role']}, UserRole=${row['User Role']}, Desig=${row['Designation']}\n`);
            }

            // Role mapping
            let role = 'STUDENT';
            let rawRole = (row['User Role'] || row['Role'] || '').toString().toUpperCase().trim();
            const designation = (row['Designation'] || '').toString().toUpperCase().trim();

            // Smart Inference: If Role is missing but Designation exists
            if (!rawRole && designation) {
                if (designation.includes('PROFESSOR') || designation.includes('TEACHER') || designation.includes('LECTURER') || designation.includes('DEAN') || designation.includes('HOD')) {
                    rawRole = 'PROFESSOR';
                } else {
                    rawRole = 'STAFF';
                }
            }

            if (rawRole === 'PROFESSOR' || rawRole === 'TEACHER' || rawRole === 'FACULTY') {
                role = 'PROFESSOR';
            } else if (rawRole === 'STAFF' || rawRole === 'ADMIN' || rawRole === 'ADMIN STAFF') {
                role = 'STAFF';
            }

            // Semester Parsing (Handle "Semester 1" -> 1)
            let semester = 1;
            const rawSemester = row['Semester'];
            if (rawSemester) {
                const match = String(rawSemester).match(/\d+/);
                if (match) semester = parseInt(match[0], 10);
            }

            console.log('Decided Role:', role);

            let extraFields = {};


            if (role === 'STUDENT') {
                const prog = row['Program'] || '';
                const dept = row['Department'] || '';

                // Strict Mapping Check
                if (!validateProgramDepartment(prog, dept)) {
                    const errorMsg = `Row ${data.indexOf(row)} Skipped: Invalid Program-Department map (${prog} -> ${dept})`;
                    console.error(errorMsg);
                    if (typeof fs !== 'undefined' && typeof debugLogPath !== 'undefined') {
                        fs.appendFileSync(debugLogPath, errorMsg + '\n');
                    }
                    continue; // SKIP this row
                }

                urnStart++;
                const sequence = String(urnStart).padStart(4, '0');
                extraFields = {
                    urn: `URN-${currentYear}-${sequence}`,
                    program: prog,
                    department: dept,
                    semester: semester,
                    academicYear: row['Academic Year'] || row['AcademicYear'] || `${currentYear}-${currentYear + 1}`,
                    section: null,
                    rollNumber: null
                };
            } else if (role === 'PROFESSOR' || role === 'STAFF') {
                // Shared logic for Faculty and Staff IDs
                // Use FAC- prefix for both for now, or STF- for staff?
                // Let's use STF- for staff to be distinct as requested
                let prefix = 'FAC';
                if (role === 'STAFF') {
                    prefix = 'STF';
                }

                facStart++;
                const sequence = String(facStart).padStart(4, '0');
                extraFields = {
                    facultyId: `${prefix}-${currentYear}-${sequence}`,
                    department: row['Department'] || '',
                    designation: row['Designation'] || (role === 'STAFF' ? 'Administrative Staff' : 'Assistant Professor')
                };
            }

            // Original fields that were part of usersToCreate.push
            const commonFields = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: defaultPasswordHash,
                role: role,
                universityId: universityId,
                contactNumber: row['Contact Number'] || row['ContactNumber'] || '',
                gender: row['Gender'] || '',
                dob: row['Date of Birth'] || row['DateOfBirth'] || null,
            };

            usersToCreate.push({
                ...commonFields,
                ...extraFields
            });
        }

        // Debug Log: Valid Users Found
        const debugLogPath = require('path').join(__dirname, '../../import_debug.log');
        const fs = require('fs');
        fs.appendFileSync(debugLogPath, `Users parsed from Excel: ${usersToCreate.length}\n`);

        if (usersToCreate.length === 0) {
            return res.status(400).json({ message: 'No valid users found in file' });
        }

        // Filter duplicates
        const emails = usersToCreate.map(u => u.email);
        const existingUsers = await User.find({ email: { $in: emails } }).select('email');
        const existingEmails = existingUsers.map(u => u.email);

        fs.appendFileSync(debugLogPath, `Existing Emails in DB: ${JSON.stringify(existingEmails)}\n`);

        const newUsers = usersToCreate.filter(u => !existingEmails.includes(u.email));

        fs.appendFileSync(debugLogPath, `New Users to Insert: ${newUsers.length}\n`);

        if (newUsers.length > 0) {
            await User.insertMany(newUsers);
            fs.appendFileSync(debugLogPath, `Successfully inserted ${newUsers.length} users.\n`);
        } else {
            fs.appendFileSync(debugLogPath, `All users were duplicates. No new users inserted.\n`);
        }

        res.status(200).json({
            message: `Processed ${usersToCreate.length} rows. Imported ${newUsers.length} new users. Skipped ${existingEmails.length} duplicates.`
        });

    } catch (error) {
        const debugLogPath = require('path').join(__dirname, '../../import_debug.log');
        if (require('fs').existsSync(debugLogPath)) {
            require('fs').appendFileSync(debugLogPath, `ERROR: ${error.message}\n`);
        }
        console.error("Import Error:", error);
        res.status(500).json({ message: "Import failed: " + error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all students
// @route   DELETE /users/delete-all-students
// @access  School Admin
const deleteAllStudents = async (req, res) => {
    try {
        const { universityId } = req.body;

        if (!universityId) {
            return res.status(400).json({ message: 'University ID is required' });
        }

        const result = await User.deleteMany({ universityId, role: 'STUDENT' });

        res.json({ message: `Successfully deleted ${result.deletedCount} students.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete selected users
// @route   POST /users/delete-selected
// @access  School Admin
const deleteSelectedUsers = async (req, res) => {
    try {
        const { userIds, universityId } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'No users selected' });
        }
        await User.deleteMany({ _id: { $in: userIds }, universityId });
        res.json({ message: `Successfully deleted ${userIds.length} users.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all users by role
// @route   DELETE /users/delete-all/:role
// @access  School Admin
const deleteAllUsersByRole = async (req, res) => {
    try {
        const { universityId } = req.body;
        const { role } = req.params;

        if (!['STUDENT', 'PROFESSOR', 'STAFF'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const result = await User.deleteMany({ universityId, role });
        res.json({ message: `Successfully deleted ${result.deletedCount} ${role.toLowerCase()}s.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { deleteUser, updateUser, importUsers, changePassword, deleteAllStudents, deleteSelectedUsers, deleteAllUsersByRole };

