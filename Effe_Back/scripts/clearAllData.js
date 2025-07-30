const mongoose = require('mongoose');
const connectDB = require('../config/dbConn');
const User = require('../models/User');
const Event = require('../models/Event');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const Merch = require('../models/Merch');
const Announcement = require('../models/Announcement');
const Schedule = require('../models/Schedule');
const Media = require('../models/Media');
const Meeting = require('../models/Meeting');
const DepartmentChatMessage = require('../models/DepartmentChatMessage');
const Notification = require('../models/Notification');
require('dotenv').config({ path: __dirname + '/../.env' });

async function clearAllData() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear all collections
        const collections = [
            { name: 'Users', model: User },
            { name: 'Events', model: Event },
            { name: 'Tasks', model: Task },
            { name: 'Resources', model: Resource },
            { name: 'Merch', model: Merch },
            { name: 'Announcements', model: Announcement },
            { name: 'Schedules', model: Schedule },
            { name: 'Media', model: Media },
            { name: 'Meetings', model: Meeting },
            { name: 'Department Chat Messages', model: DepartmentChatMessage },
            { name: 'Notifications', model: Notification }
        ];

        for (const collection of collections) {
            const count = await collection.model.countDocuments();
            await collection.model.deleteMany({});
            console.log(`✅ Cleared ${count} ${collection.name}`);
        }

        console.log('\n=== ALL DATA CLEARED ===');
        console.log('Database is now empty and ready for fresh data.');

        await mongoose.connection.close();
        console.log('Database connection closed.');

    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
}

clearAllData(); 