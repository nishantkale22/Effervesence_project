const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { logDatabaseActivity } = require('../middleware/logger');

// POST: Register User
router.post('/', async (req, res) => {
    const { name, email, phone, password, userType, role, department, photo } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logDatabaseActivity(`User registration failed: User with email ${email} already exists.`);
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            userType,
            role,
            department: department || 'none',
            photo: photo || '', // ✅ Store uploaded photo URL
        });

        const savedUser = await newUser.save();

        logDatabaseActivity(`User registered: ID=${savedUser._id}, Name=${savedUser.name}, Email=${savedUser.email}`);
        console.log(`User registered with email: ${savedUser.email}`);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
