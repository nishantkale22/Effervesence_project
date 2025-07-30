const mongoose = require('mongoose');
const connectDB = require('../config/dbConn');
const User = require('../models/User');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '/../.env' });

const basicUsers = [
    {
        name: 'Festival Head',
        photo: 'https://randomuser.me/api/portraits/men/1.jpg',
        userType: 'core',
        role: 'festival head',
        department: 'none',
        email: 'festivalhead@gmail.com',
        phone: '1234567890',
        password: 'password123'
    },
    {
        name: 'Operational Head',
        photo: 'https://randomuser.me/api/portraits/men/2.jpg',
        userType: 'core',
        role: 'operational head',
        department: 'none',
        email: 'operationalhead@gmail.com',
        phone: '1234567891',
        password: 'password123'
    },
    {
        name: 'Events Coordinator',
        photo: 'https://randomuser.me/api/portraits/men/3.jpg',
        userType: 'non_core',
        role: 'coordinator',
        department: 'events',
        email: 'eventscoord@gmail.com',
        phone: '1234567892',
        password: 'password123'
    },
    {
        name: 'Hospitality Coordinator',
        photo: 'https://randomuser.me/api/portraits/men/4.jpg',
        userType: 'non_core',
        role: 'coordinator',
        department: 'hospitality',
        email: 'hospitalitycoord@gmail.com',
        phone: '1234567893',
        password: 'password123'
    },
    {
        name: 'Sponsorship Executive',
        photo: 'https://randomuser.me/api/portraits/men/5.jpg',
        userType: 'non_core',
        role: 'executive',
        department: 'sponsorship',
        email: 'sponsorshipexec@gmail.com',
        phone: '1234567894',
        password: 'password123'
    },
    {
        name: 'Events Volunteer',
        photo: 'https://randomuser.me/api/portraits/men/6.jpg',
        userType: 'non_core',
        role: 'volunteer',
        department: 'events',
        email: 'eventsvol@gmail.com',
        phone: '1234567895',
        password: 'password123'
    },
    {
        name: 'Hospitality Volunteer',
        photo: 'https://randomuser.me/api/portraits/men/7.jpg',
        userType: 'non_core',
        role: 'volunteer',
        department: 'hospitality',
        email: 'hospitalityvol@gmail.com',
        phone: '1234567896',
        password: 'password123'
    },
    {
        name: 'Student Attendee',
        photo: 'https://randomuser.me/api/portraits/men/8.jpg',
        userType: 'attendee',
        role: 'student',
        department: 'none',
        email: 'student@gmail.com',
        phone: '1234567897',
        password: 'password123'
    }
];

async function createUsers() {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    for (const user of basicUsers) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    const createdUsers = await User.insertMany(basicUsers);
    console.log(`Created ${createdUsers.length} users`);

    await mongoose.connection.close();
    console.log('Users created successfully!');
}

createUsers().catch(err => {
    console.error(err);
    process.exit(1);
}); 