const mongoose = require('mongoose');

const scheduleEventSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    time: { type: String, required: true }, // e.g., '10:00 AM'
    venue: { type: String, required: true },
    type: { type: String }, // e.g., 'technical', 'cultural', etc.
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
});

const scheduleSchema = new mongoose.Schema({
    date: { type: String, required: true }, // e.g., '2024-10-20'
    events: [scheduleEventSchema],
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema); 