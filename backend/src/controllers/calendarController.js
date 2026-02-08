const AcademicCalendar = require('../models/AcademicCalendar');


// Get all events for a university
const getEvents = async (req, res) => {
    try {
        const { universityId } = req.query; // Or from req.user
        if (!universityId) return res.status(400).json({ message: 'University ID required' });

        const events = await AcademicCalendar.find({ universityId }).sort({ startDate: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new event
const addEvent = async (req, res) => {
    try {
        const { universityId, title, type, startDate, endDate, description } = req.body;

        // Basic validation
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: 'Start date cannot be after end date' });
        }

        const event = await AcademicCalendar.create({
            universityId, title, type, startDate, endDate, description
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

// Internal helper to check if a date is a holiday
const isHoliday = async (universityId, date) => {
    const targetDate = new Date(date);
    const holiday = await AcademicCalendar.findOne({
        universityId,
        type: 'Holiday',
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate }
    });
    return !!holiday;
};

module.exports = { getEvents, addEvent, deleteEvent, isHoliday };
