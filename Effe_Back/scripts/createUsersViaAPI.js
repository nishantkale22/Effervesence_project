const axios = require('axios');
const connectDB = require('../config/dbConn');
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

async function createUsersViaAPI() {
    try {
        // Start the server if not already running
        const baseURL = process.env.BASE_URL || 'http://localhost:5000';
        console.log(`Using API base URL: ${baseURL}`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const user of basicUsers) {
            try {
                console.log(`Creating user: ${user.name} (${user.email})`);

                const response = await axios.post(`${baseURL}/register`, user, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 201) {
                    console.log(`✅ Created: ${user.name}`);
                    createdCount++;
                }
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    console.log(`⏭️  Skipped (already exists): ${user.name}`);
                    skippedCount++;
                } else {
                    console.error(`❌ Failed to create ${user.name}:`, error.response?.data?.message || error.message);
                }
            }
        }

        console.log('\n=== USER CREATION SUMMARY ===');
        console.log(`Created: ${createdCount} users`);
        console.log(`Skipped (already exist): ${skippedCount} users`);
        console.log(`Total processed: ${createdCount + skippedCount} users`);

    } catch (error) {
        console.error('Error creating users:', error.message);
        process.exit(1);
    }
}

createUsersViaAPI(); 