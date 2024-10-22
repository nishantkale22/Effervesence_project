const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT'); // Middleware to verify JWT
const userController = require('../controllers/userController'); // Import functions from controller

// Route for user dashboard
router.get('/:userType/:role/:department/dashboard/:_id', verifyJWT, userController.getUserDashboard);

// Route for user profile
router.get('/profile/:_id', verifyJWT, userController.getUserById);

// Route for user tasks
router.get('/tasks/:_id', verifyJWT, userController.getUserTasks);

router.get('/volunteers/:department',verifyJWT, userController.getAllVolunteers );

router.get('/executives/:department', verifyJWT, userController.getAllExecutives);

module.exports = router;
