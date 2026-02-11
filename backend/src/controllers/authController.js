const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateProgramDepartment } = require('../utils/validation');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                access_token: generateToken(user._id),
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    role: user.role,
                    universityId: user.universityId
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Counter = require('../models/Counter');

// Helper to generate URN (Atomic)
const generateURN = async () => {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
        { _id: `urn_${year}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const sequence = String(counter.seq).padStart(4, '0');
    return `URN-${year}-${sequence}`;
};

// Helper to generate Faculty ID (Atomic)
const generateFacultyID = async () => {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
        { _id: `faculty_${year}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const sequence = String(counter.seq).padStart(4, '0');
    return `FAC-${year}-${sequence}`;
};

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role, universityId, department, program, semester, academicYear, dob, gender, contactNumber, address, guardian } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Critical Security Fix: Prevent Privilege Escalation
        // Public Registration is STRICTLY for Students.
        // Faculty/Admin creation must be done via protected Admin routes.
        const finalRole = 'STUDENT';

        if (role && role !== 'STUDENT') {
            console.warn(`[SECURITY] Attempted Role Spoofing: Email ${email} tried to register as ${role}`);
            // We can strictly reject or just silently force STUDENT. 
            // Rejecting is safer to signal to the hacker that we know.
            return res.status(403).json({ message: "Public registration is restricted to Students only." });
        }


        // Valication for Students
        if (finalRole === 'STUDENT') {
            if (!department || !program || !semester || !academicYear) {
                return res.status(400).json({ message: "Student admission requires Department, Program, Semester, and Academic Year." });
            }

            // Strict Program-Department Mapping Check
            if (!validateProgramDepartment(program, department)) {
                return res.status(400).json({
                    message: `Invalid Department '${department}' for Program '${program}'. Allowed departments are strictly mapped.`
                });
            }
        }

        let urn = null;
        if (finalRole === 'STUDENT') {
            urn = await generateURN();
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: finalRole,
            universityId,
            // SIS Fields
            urn,
            department,
            program,
            semester,
            academicYear,
            dob,
            gender,
            contactNumber,
            address,
            guardian,
            // Faculty Fields
            facultyId: finalRole === 'PROFESSOR' ? await generateFacultyID() : undefined,
            designation: finalRole === 'PROFESSOR' ? req.body.designation : undefined,
            qualification: finalRole === 'PROFESSOR' ? req.body.qualification : undefined,
            specialization: finalRole === 'PROFESSOR' ? req.body.specialization : undefined,
            employmentType: finalRole === 'PROFESSOR' ? req.body.employmentType : undefined,
            joiningDate: finalRole === 'PROFESSOR' ? new Date() : undefined
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                email: user.email,
                role: user.role,
                urn: user.urn,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUsersByUniversity = async (req, res) => {
    try {
        const { universityId } = req.params;
        const users = await User.find({ universityId }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, getUsersByUniversity };
