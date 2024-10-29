const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');


// Route for user dashboard
router.get('/:userType/:role/:department/dashboard/:_id', verifyJWT, userController.getUserDashboard);

// Route for user profile
router.get('/profile/:_id', verifyJWT, userController.getUserById);

// Route for user tasks
router.get('/tasks/:_id', verifyJWT, userController.getUserTasks);

router.get('/allocations/:_id',verifyJWT,  userController.getUserAllocations);

router.get('/taskdetails/:_id',taskController.getTaskByID )


// Route for fetching volunteers (with corrected route)
router.get('/:_id/volunteers/:department', verifyJWT, userController.getAllVolunteers);

// Route for fetching executives (with corrected route)
router.get('/:_id/executives/:department', verifyJWT, userController.getAllExecutives);

module.exports = router;
