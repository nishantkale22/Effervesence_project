const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'urgent', 'winner', 'alert', 'other'], default: 'info' },
    target: { type: String, default: 'all' }, // e.g., 'all', 'attendees', 'department:xyz'
    display: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema); 