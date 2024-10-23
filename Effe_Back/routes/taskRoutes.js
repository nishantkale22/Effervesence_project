const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const taskController = require('../controllers/taskController');


// POST route for assigning a task with resources
router.post('/assign', verifyJWT,  taskController.postTaskWithResource);

module.exports = router;
