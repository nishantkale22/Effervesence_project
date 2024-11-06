const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const User = require('../models/User');

// Updated sendNotification function
const sendNotification = asyncHandler(async (req, res) => {
    try {
        const { _id, user_id, resourceRequest } = req.body;  // Destructuring payload
        if (!user_id || !resourceRequest || !resourceRequest.title || !resourceRequest.description) {
            return res.status(400).json({ message: 'Missing required fields in the request.' });
        }

        // Fetch the task and requesting user based on provided IDs
        const task = await Task.findById(_id).populate('assignedBy');
        const requestingUser = await User.findById(user_id);

        if (!task || !requestingUser) {
            return res.status(404).json({ message: 'Task or User not found' });
        }

        // Create the notification
        const newNotification = new Notification({
            userId: task.assignedBy._id,
            message: `Resource Request Notification:
- Task: "${task.title}"
- Assigned By: ${task.assignedBy.name}
- Requested By: ${requestingUser.name}
- Task Created On: ${task.createdAt.toDateString()}
- Request Details: Title - "${resourceRequest.title}", Description - "${resourceRequest.description}"`,
            read: false,
        });

        // Save the notification
        await newNotification.save();

        // Emit notification to the assigned user in real-time (ensure the user is connected)
        req.io.to(task.assignedBy._id.toString()).emit('newNotification', newNotification);

        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error in sending notification:', error);
        res.status(500).json({ message: 'Notification sending failed' });
    }
});

module.exports = {
    sendNotification,
};
