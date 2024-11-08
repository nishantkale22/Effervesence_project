const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const requestController = require('../controllers/requestController');

router.post('/resources', verifyJWT, requestController.sendNotification);


module.exports = router;

