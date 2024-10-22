const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const asyncHandler = require('express-async-handler');



router.post('/assign', async (req, res) => {
 try {
    const { id, task, assignedTo, resource } = req.body;
    // Your logic for task assignment
    console.log(assignedTo) ;
    res.status(200).send('Task assigned successfully');
  } catch (error) {
    console.error('Error in assigning task:', error);
    res.status(500).send('Task assignment failed');
  }
});












module.exports = router;