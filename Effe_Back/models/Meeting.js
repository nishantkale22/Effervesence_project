const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    department: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    meetingUrl: { type: String, required: true }, // Jitsi room link
    status: { type: String, enum: ['scheduled', 'started', 'ended'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema); 