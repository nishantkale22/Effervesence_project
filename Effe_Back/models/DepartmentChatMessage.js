const mongoose = require('mongoose');

const departmentChatMessageSchema = new mongoose.Schema({
    department: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    type: { type: String, enum: ['text', 'image', 'video', 'audio', 'file'], default: 'text' },
    fileUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 'delete for me'
    deletedForEveryone: { type: Boolean, default: false },
    deletedAt: { type: Date },
});

module.exports = mongoose.model('DepartmentChatMessage', departmentChatMessageSchema); 