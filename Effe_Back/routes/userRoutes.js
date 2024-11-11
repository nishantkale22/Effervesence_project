const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');
const notificationController = require('../controllers/notificationController');



// Route for user dashboard
router.get('/:userType/:role/:department/dashboard/:_id', verifyJWT, userController.getUserDashboard);

// Route for user profile
router.get('/profile/:_id', verifyJWT, userController.getUserById);

// Route for user tasks
router.get('/tasks/:_id', verifyJWT, userController.getUserTasks);

router.get('/allocations/:_id',verifyJWT,  userController.getUserAllocations);

router.post('/allocations/status/:allocationId', taskController.updateAllocationStatusById  );


router.delete('/allocations/:allocationId', verifyJWT, taskController.deleteAllocationById);

router.get('/taskdetails/:_id',taskController.getTaskByID )

// router.get('/allocationdetails/:_id',taskController.getTaskByID )



// Route for fetching volunteers (with corrected route)
router.get('/:_id/volunteers/:department', verifyJWT, userController.getAllVolunteers);

// Route for fetching executives (with corrected route)
router.get('/:_id/executives/:department', verifyJWT, userController.getAllExecutives);

router.get('/notifications/:_id',notificationController.getNotifications ) ;

router.patch('/notifications/:notificationId/markAsRead',notificationController.markAsRead) ;

router.delete('/notifications/:notificationId',notificationController.deleteNotification) ;
module.exports = router;