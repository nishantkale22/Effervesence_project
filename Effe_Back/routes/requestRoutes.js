const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const requestController = require('../controllers/requestController');

// Modify this to use the passed io
module.exports = (io) => {
    router.post('/resources', verifyJWT, requestController(io).sendNotification);

    return router;
};
