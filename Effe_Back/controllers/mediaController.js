const Media = require('../models/Media');

// Upload media (image/video)
exports.uploadMedia = async (req, res) => {
    try {
        const { eventId, type } = req.body;
        const url = req.body.url;
        if (!eventId || !type || !url) {
            return res.status(400).json({ message: 'eventId, type, and url are required' });
        }
        const uploadedBy = req.user._id;
        const media = await Media.create({ eventId, type, url, uploadedBy });
        res.status(201).json(media);
    } catch (err) {
        res.status(500).json({ message: 'Failed to upload media', error: err.message });
    }
};

// Get media for an event
exports.getMedia = async (req, res) => {
    try {
        const { eventId } = req.query;
        if (!eventId) return res.status(400).json({ message: 'eventId is required' });
        const media = await Media.find({ eventId }).sort({ createdAt: -1 });
        res.json(media);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch media', error: err.message });
    }
};

// Delete media
exports.deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await Media.findByIdAndDelete(id);
        if (!media) return res.status(404).json({ message: 'Media not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete media', error: err.message });
    }
}; 