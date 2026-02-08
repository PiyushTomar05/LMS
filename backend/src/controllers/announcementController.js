const Announcement = require('../models/Announcement');

// @desc    Create an announcement
// @route   POST /announcements
// @access  School Admin
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, audience } = req.body;

        const payload = {
            postedBy: req.user._id,
            title,
            content,
            audience
        };

        if (req.user.schoolId) payload.schoolId = req.user.schoolId;
        if (req.user.universityId) payload.universityId = req.user.universityId;

        const announcement = await Announcement.create(payload);

        res.status(201).json(announcement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get announcements for the current user
// @route   GET /announcements
// @access  All (filtered by role)
const getAnnouncements = async (req, res) => {
    try {
        const { schoolId, universityId, role } = req.user;

        let filter = {};
        if (schoolId) filter.schoolId = schoolId;
        if (universityId) filter.universityId = universityId;

        if (role === 'TEACHER') {
            filter.audience = { $in: ['ALL', 'TEACHERS'] };
        } else if (role === 'STUDENT') {
            filter.audience = { $in: ['ALL', 'STUDENTS'] };
        }
        // Admin sees all

        const announcements = await Announcement.find(filter)
            .sort({ createdAt: -1 })
            .populate('postedBy', 'firstName lastName');

        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an announcement
// @route   DELETE /announcements/:id
// @access  School Admin
const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createAnnouncement, getAnnouncements, deleteAnnouncement };
