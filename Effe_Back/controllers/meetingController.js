const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { getSocketIo } = require('../socket');

// POST /meetings/schedule
exports.scheduleMeeting = async (req, res) => {
    try {
        let { participants, scheduledFor } = req.body;
        const organizerId = req.user._id;
        participants = [...new Set(participants.map(id => id.toString()))];
        const filteredParticipants = participants.filter(id => id !== organizerId.toString());
        const organizer = await User.findById(organizerId);
        if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
        const users = await User.find({ _id: { $in: filteredParticipants } });
        const allSameDept = users.every(u => u.department === organizer.department);
        if (!allSameDept) return res.status(400).json({ message: 'All participants must be in the same department as the organizer' });
        const roomName = `meet_${organizer.department}_${Date.now()}`;
        const meetingUrl = `https://meet.jit.si/${roomName}`;
        const meeting = await Meeting.create({
            organizer: organizerId,
            participants: filteredParticipants,
            department: organizer.department,
            scheduledFor,
            meetingUrl,
        });
        // --- Real-time notification logic ---
        const io = getSocketIo();
        const notifyUsers = [organizerId.toString(), ...filteredParticipants];
        const scheduledTime = new Date(scheduledFor).getTime();
        const now = Date.now();
        const delay = Math.max(scheduledTime - now, 0);
        setTimeout(() => {
            notifyUsers.forEach(userId => {
                io.to(userId).emit('meetingStarted', {
                    meetingId: meeting._id,
                    meetingUrl,
                    scheduledFor,
                    organizer: organizer.name,
                });
            });
        }, delay);
        // ---
        res.status(201).json(meeting);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to schedule meeting', error: err.message });
    }
};

// GET /meetings/user/:userId
exports.getMeetingsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const meetings = await Meeting.find({
            $or: [
                { organizer: userId },
                { participants: userId }
            ]
        }).sort({ scheduledFor: 1 });
        res.json(meetings);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch meetings', error: err.message });
    }
};

// DELETE /meetings/:id
exports.deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const meeting = await Meeting.findById(id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (String(meeting.organizer) !== String(userId)) {
            return res.status(403).json({ message: 'Only the organizer can delete this meeting' });
        }
        await meeting.deleteOne();
        // Emit real-time deletion event to department
        const io = getSocketIo();
        io.to(`dept_${meeting.department}`).emit('meetingDeleted', { meetingId: meeting._id });
        res.json({ success: true, message: 'Meeting deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete meeting', error: err.message });
    }
}; 