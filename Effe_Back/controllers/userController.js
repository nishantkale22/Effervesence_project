const User = require('../models/User'); // Import the User model
const Task = require('../models/Task'); // Import the Task model
const Event = require('../models/Event'); // Import the Event model

const asyncHandler = require('express-async-handler');

// Controller to get user by ID
const getUserById = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Controller to get user dashboard based on userType, role, and department
const getUserDashboard = asyncHandler(async (req, res) => {
    const { userType, role, department, _id } = req.params;

    const validUserTypes = ['attendee', 'core', 'non_core'];
    if (!validUserTypes.includes(userType)) {
        return res.status(400).json({ message: 'Invalid user type' });
    }

    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: `${role} Dashboard for ${department} Department as ${userType}`,
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Controller to get tasks assigned to a user
const getUserTasks = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    try {
        // Fetch the user along with their tasks using population
        const user = await User.findById(_id).populate('tasks');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            tasks: user.tasks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Controller to get all users
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Controller to get all volunteers
const getAllVolunteers = asyncHandler(async (req, res) => {
    try {
        const { department } = req.params
        // Find all users with the role of 'volunteer'
        const volunteers = await User.find({ role: 'volunteer', department: `${department}` });

        if (volunteers.length === 0) {
            return res.status(404).json({ message: 'No volunteers found' });
        }

        res.json({ volunteers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Controller to get all executives
const getAllExecutives = asyncHandler(async (req, res) => {
    try {
        const { department } = req.params

        // Find all users with the role of 'executive'
        const executives = await User.find({ role: 'executive', department: `${department}` });

        if (executives.length === 0) {
            return res.status(404).json({ message: 'No executives found' });
        }

        res.json({ executives });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Controller to get all coordinators
const getAllCoordinators = asyncHandler(async (req, res) => {
    try {
        // Find all users with the role of 'coordinator'
        const coordinators = await User.find({ role: 'coordinator' });

        if (coordinators.length === 0) {
            return res.status(404).json({ message: 'No coordinators found' });
        }

        res.json({ coordinators });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const getUserAllocations = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.params;

        const Tasks = await Task.find({ assignedBy: _id });

        // if (Tasks.length === 0) {
        //     return res.status(404).json({ message: 'No tasks found' });
        // }

        res.json({ Tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const getUserRegisteredEvents = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.params;
        const user = await User.findById(_id).populate('eventsRegistered');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.eventsRegistered || user.eventsRegistered.length === 0) {
            return res.status(404).json({ message: 'No registered events found' });
        }
        res.json({ registeredEvents: user.eventsRegistered });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users in the same department as the requester (excluding self)
const getDepartmentMembers = asyncHandler(async (req, res) => {
    const requesterId = req.user._id;
    const requester = await User.findById(requesterId);
    if (!requester) return res.status(404).json({ message: 'Requester not found' });
    const users = await User.find({
        department: requester.department,
        _id: { $ne: requesterId }
    }, '-password');
    res.json({ users });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = {
    getUserById,
    getUserDashboard,
    getUserTasks,
    getAllUsers,
    getAllVolunteers,
    getAllExecutives,
    getAllCoordinators,
    getUserAllocations,
    getUserRegisteredEvents,
    getDepartmentMembers,
    getCurrentUser
};