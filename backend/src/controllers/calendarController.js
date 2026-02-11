const AcademicCalendar = require('../models/AcademicCalendar');

// Get all events for a university
const getEvents = async (req, res) => {
    try {
        const { universityId } = req.query;
        // Allow querying by universityId from query params OR from logged in user
        const targetUnivId = universityId || (req.user ? req.user.universityId : null);

        if (!targetUnivId) return res.status(400).json({ message: 'University ID required' });

        const events = await AcademicCalendar.find({ universityId: targetUnivId }).sort({ startDate: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new event
const addEvent = async (req, res) => {
    try {
        const { universityId, title, type, startDate, endDate, description, isBlocking } = req.body;

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: 'Start date cannot be after end date' });
        }

        const event = await AcademicCalendar.create({
            universityId: universityId || req.user.universityId,
            title, type, startDate, endDate, description, isBlocking
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        await AcademicCalendar.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Internal/External helper to check if a date is blocked (Holiday/Exam)
const isDateBlocked = async (universityId, date) => {
    const targetDate = new Date(date);
    const event = await AcademicCalendar.findOne({
        universityId,
        isBlocking: true,
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate }
    });
    return !!event;
};

module.exports = { getEvents, addEvent, deleteEvent, isDateBlocked };
