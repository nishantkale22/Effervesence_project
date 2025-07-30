const User = require('../models/User'); // Import the User model
const Task = require('../models/Task'); // Import the Task model
const Notification = require('../models/Notification'); // Import the Notification model
const { getSocketIo } = require('../socket');
const asyncHandler = require('express-async-handler');

// Updated getNotifications function
const getNotifications = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.params;

        // Fetch all notifications
        const allNotifications = await Notification.find({ userId: _id });

        // Separate unread notifications
        const unreadNotifications = allNotifications.filter(notification => !notification.read);

        res.json({ status: 'ok', unreadNotifications, allNotifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Updated markAsRead function


const markAsRead = asyncHandler(async (req, res) => {
    try {
        const { notificationId } = req.params;

        // Mark as read
        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }

        // Emit updated unread count
        const io = getSocketIo();
        const unreadCount = await Notification.countDocuments({
            userId: updatedNotification.userId,
            read: false,
        });

        io.to(updatedNotification.userId.toString()).emit('unreadCount', unreadCount);

        res.json({ status: 'ok', updatedNotification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});




const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    try {
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }

        // Emit event to the user who owned the notification
        const io = getSocketIo();
        const userId = deletedNotification.userId.toString();
        io.to(userId).emit('notificationDeleted', { notificationId });

        // Optionally emit updated unread count
        const unreadCount = await Notification.countDocuments({
            userId,
            read: false,
        });
        io.to(userId).emit('unreadCount', unreadCount);

        res.json({ status: 'ok', message: 'Notification deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});
module.exports = {
    deleteNotification,
    getNotifications,
    markAsRead,
};
