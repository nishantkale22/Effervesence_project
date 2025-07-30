const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const meetingController = require('../controllers/meetingController');

// Schedule a new meeting
router.post('/schedule', verifyJWT, meetingController.scheduleMeeting);

// Get meetings for a user
router.get('/user/:userId', verifyJWT, meetingController.getMeetingsForUser);

// Delete a meeting (only organizer)
router.delete('/:id', verifyJWT, meetingController.deleteMeeting);

module.exports = router; 