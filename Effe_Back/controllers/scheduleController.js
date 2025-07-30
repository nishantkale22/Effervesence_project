const Schedule = require('../models/Schedule');

// Create new schedule
exports.createSchedule = async (req, res) => {
    try {
        const { date, events } = req.body;
        if (!date || !Array.isArray(events)) {
            return res.status(400).json({ message: 'Date and events are required' });
        }
        const schedule = await Schedule.create({ date, events });
        res.status(201).json(schedule);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create schedule', error: err.message });
    }
};

// Get all schedules (optionally filter by date)
exports.getAllSchedules = async (req, res) => {
    try {
        const { date } = req.query;
        const filter = date ? { date } : {};
        const schedules = await Schedule.find(filter).sort({ date: 1 }).populate('events.eventId', 'title');
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch schedules', error: err.message });
    }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const schedule = await Schedule.findByIdAndUpdate(id, update, { new: true });
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update schedule', error: err.message });
    }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByIdAndDelete(id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete schedule', error: err.message });
    }
}; 