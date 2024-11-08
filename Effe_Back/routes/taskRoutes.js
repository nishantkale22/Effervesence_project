const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const taskController = require('../controllers/taskController');


// POST route for assigning a task with resources
router.post('/assign', verifyJWT,  (req, res) => taskController.postTaskWithResource(req, res, req.app.get('io')));

router.get('/resource/_id' , taskController.getTaskResources) ;

module.exports = router;