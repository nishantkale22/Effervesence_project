const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const announcementController = require('../controllers/announcementController');

// Role check middleware (admin/core only)
const allowedRoles = ['admin', 'core', 'executive', 'coordinator', 'operations_head']; // extend as needed
function requireAdminOrCore(req, res, next) {
    if (allowedRoles.includes(req.user?.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
}

// Create announcementboth
router.post('/', verifyJWT, requireAdminOrCore, announcementController.createAnnouncement);

// Get all announcements
router.get('/', verifyJWT, announcementController.getAllAnnouncements);

// Update announcement
router.patch('/:id', verifyJWT, requireAdminOrCore, announcementController.updateAnnouncement);

// Delete announcement
router.delete('/:id', verifyJWT, requireAdminOrCore, announcementController.deleteAnnouncement);

module.exports = router; 