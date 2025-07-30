const DepartmentChatMessage = require('../models/DepartmentChatMessage');
const User = require('../models/User');
const { getSocketIo } = require('../socket');

// GET /chat/department/:department
exports.getMessages = async (req, res) => {
    try {
        const { department } = req.params;
        const userId = req.user._id;
        // Fetch messages, filter out those deleted for this user
        const messages = await DepartmentChatMessage.find({ department, deletedFor: { $ne: userId } })
            .sort({ createdAt: 1 })
            .populate('sender', 'name photo role');
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
    }
};

// POST /chat/department/:department
exports.sendMessage = async (req, res) => {
    try {
        const { department } = req.params;
        const { message, type = 'text', fileUrl } = req.body;
        const sender = req.user._id;
        if (type === 'text' && !message) return res.status(400).json({ message: 'Message required' });
        if (type !== 'text' && !fileUrl) return res.status(400).json({ message: 'File URL required for non-text messages' });
        const newMsg = await DepartmentChatMessage.create({ department, sender, message, type, fileUrl });
        const populatedMsg = await newMsg.populate('sender', 'name photo role');
        // Emit to department room
        const io = getSocketIo();
        io.to(`dept_${department}`).emit('departmentMessage', populatedMsg);
        res.status(201).json(populatedMsg);
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
};

// DELETE for me: PATCH /chat/message/:id/delete-for-me
exports.deleteForMe = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const msg = await DepartmentChatMessage.findById(id);
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        if (!msg.deletedFor.includes(userId)) {
            msg.deletedFor.push(userId);
            await msg.save();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete for me', error: err.message });
    }
};

// DELETE for everyone: PATCH /chat/message/:id/delete-for-everyone
exports.deleteForEveryone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const msg = await DepartmentChatMessage.findById(id);
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        if (String(msg.sender) !== String(userId)) return res.status(403).json({ message: 'Only sender can delete for everyone' });
        msg.deletedForEveryone = true;
        msg.deletedAt = new Date();
        await msg.save();
        // Emit update to department
        const io = getSocketIo();
        io.to(`dept_${msg.department}`).emit('departmentMessageDeleted', { id: msg._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete for everyone', error: err.message });
    }
}; 