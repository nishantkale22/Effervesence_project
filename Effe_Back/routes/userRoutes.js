const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT'); // Middleware to verify JWT
const User = require('../models/User'); // Import the User model

// Route for user dashboard based on userType and user ID
router.get('/:userType/:role/:department/dashboard/:_id', verifyJWT, async (req, res) => {
    const { userType, role, department, _id } = req.params;
    
    // Ensure valid userType
    const validUserTypes = ['attendee', 'core', 'non_core'];
    if (!validUserTypes.includes(userType)) {
        return res.status(400).json({ message: 'Invalid user type' });
    }
    
    try {
        // Fetch user data from the database
        const user = await User.findById(_id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user data along with dashboard message
        res.json({ 
            message: `${role} Dashboard for ${department} Department as ${userType}`, 
            user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/profile/:_id',verifyJWT,async(req,res)=>{
    console.log('data requested')
    const { _id } = req.params;
    

    
    try {
        // Fetch user data from the database
        const user = await User.findById(_id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user data along with dashboard message
        res.json({ 
            user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
} );


module.exports = router;
