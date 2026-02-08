const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Helper to generate URN
const generateURN = async () => {
    const year = new Date().getFullYear();
    const count = await User.countDocuments({ role: 'STUDENT', urn: { $regex: `^URN-${year}` } });
    const sequence = String(count + 1).padStart(4, '0');
    return `URN-${year}-${sequence}`;
};

// Helper to generate Faculty ID
const generateFacultyID = async () => {
    const year = new Date().getFullYear();
    const count = await User.countDocuments({ role: 'PROFESSOR', facultyId: { $regex: `^FAC-${year}` } });
    const sequence = String(count + 1).padStart(4, '0');
    return `FAC-${year}-${sequence}`;
};

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role, universityId, department, program, dob, gender, contactNumber, address, guardian } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let urn = null;
        if (role === 'STUDENT') {
            urn = await generateURN();
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: role || 'STUDENT',
            universityId,
            // SIS Fields
            urn,
            department,
            program,
            dob,
            gender,
            contactNumber,
            address,
            guardian,
            // Faculty Fields
            facultyId: role === 'PROFESSOR' ? await generateFacultyID() : undefined,
            designation: role === 'PROFESSOR' ? req.body.designation : undefined,
            qualification: role === 'PROFESSOR' ? req.body.qualification : undefined,
            specialization: role === 'PROFESSOR' ? req.body.specialization : undefined,
            employmentType: role === 'PROFESSOR' ? req.body.employmentType : undefined,
            joiningDate: role === 'PROFESSOR' ? new Date() : undefined
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
