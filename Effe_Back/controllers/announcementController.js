const Announcement = require('../models/Announcement');
const { getSocketIo } = require('../socket');

// Create new announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { message, type, target, display } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });
        const createdBy = req.user._id;
        const announcement = await Announcement.create({ message, type, target, display, createdBy });
        // Emit real-time event
        const io = getSocketIo();
        io.to('attendee').emit('announcementCreated', announcement);
        res.status(201).json(announcement);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create announcement', error: err.message });
    }
};

// Get all announcements (optionally filter by display)
exports.getAllAnnouncements = async (req, res) => {
    try {
        const { display } = req.query;
        const filter = display != null ? { display: display === 'true' } : {};
        const announcements = await Announcement.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'name role');
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch announcements', error: err.message });
    }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const announcement = await Announcement.findByIdAndUpdate(id, update, { new: true });
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        // Emit real-time event
        const io = getSocketIo();
        io.to('attendee').emit('announcementUpdated', announcement);
        res.json(announcement);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update announcement', error: err.message });
    }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findByIdAndDelete(id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        // Emit real-time event
        const io = getSocketIo();
        io.to('attendee').emit('announcementDeleted', { id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete announcement', error: err.message });
    }
}; 