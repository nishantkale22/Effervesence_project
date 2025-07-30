const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const scheduleController = require('../controllers/scheduleController');

// Role check middleware (admin/core only)
function requireAdminOrCore(req, res, next) {
    if (req.user?.role === 'admin' || req.user?.role === 'core') return next();
    return res.status(403).json({ message: 'Forbidden: Admin/Core only' });
}

// Create schedule
router.post('/', verifyJWT, requireAdminOrCore, scheduleController.createSchedule);

// Get all schedules
router.get('/', verifyJWT, scheduleController.getAllSchedules);

// Update schedule
router.patch('/:id', verifyJWT, requireAdminOrCore, scheduleController.updateSchedule);

// Delete schedule
router.delete('/:id', verifyJWT, requireAdminOrCore, scheduleController.deleteSchedule);

module.exports = router; 