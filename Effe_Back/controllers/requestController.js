const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

const sendNotification = (io) => asyncHandler(async (req, res) => {
    try {
        const payload = req.body;

        // Find the task and the requesting user
        const task = await Task.findById(payload._id).populate('assignedBy');
        const requestingUser = await User.findById(payload.user_id);

        // Ensure both task and user are found
        if (!task || !requestingUser) {
            return res.status(404).json({ message: 'Task or User not found' });
        }

        // Create the new notification
        const newNotification = new Notification({
            userId: task.assignedBy._id,
            message: `Resource Request Notification:
- Task: "${task.title}"
- Assigned By: ${task.assignedBy.name}
- Requested By: ${requestingUser.name}
- Task Created On: ${task.createdAt.toDateString()}
- Request Details: Title - "${payload.resourceRequest.title}", Description - "${payload.resourceRequest.description}"`,
            read: false,
        });

        // Save the notification to the database
        await newNotification.save();

        // Emit the notification to the specific user
        io.to(task.assignedBy._id.toString()).emit('receiveNotification', newNotification);
        io.to(task.assignedBy._id.toString()).emit('unreadCount');

        
        // Send a response to the client
        res.status(200).json({ message: 'Notification sent successfully' });

    } catch (error) {
        console.error('Error in sending notification:', error);
        res.status(500).json({ message: 'Notification sending failed' });
    }
});

module.exports = (io) => ({
    sendNotification: sendNotification(io),
});
