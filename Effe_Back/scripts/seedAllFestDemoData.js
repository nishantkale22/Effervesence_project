const mongoose = require('mongoose');
const connectDB = require('../config/dbConn');
const Merch = require('../models/Merch');
const Announcement = require('../models/Announcement');
const Schedule = require('../models/Schedule');
const Media = require('../models/Media');
const Event = require('../models/Event');
const User = require('../models/User');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const Meeting = require('../models/Meeting');
const DepartmentChatMessage = require('../models/DepartmentChatMessage');
const Notification = require('../models/Notification');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '/../.env' });

async function seed() {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get existing users from database
    console.log('Database URI:', process.env.DATABASE_URI);
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    const userDocs = await User.find({});
    console.log(`Found ${userDocs.length} existing users`);

    // Also try to find users directly in the users collection
    const directUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${directUsers.length} users directly from collection`);

    if (userDocs.length === 0) {
        console.log('No users found in database. Please create users first.');
        await mongoose.connection.close();
        return;
    }

    // Clear all collections except users
    await Promise.all([
        Event.deleteMany({}), Task.deleteMany({}), Resource.deleteMany({}), Merch.deleteMany({}),
        Announcement.deleteMany({}), Schedule.deleteMany({}), Media.deleteMany({}), Meeting.deleteMany({}),
        DepartmentChatMessage.deleteMany({}), Notification.deleteMany({})
    ]);

    // Helper functions to get users by type/role/department
    const getUsersByType = (type) => userDocs.filter(u => u.userType === type);
    const getUsersByRole = (role) => userDocs.filter(u => u.role === role);
    const getUsersByDepartment = (dept) => userDocs.filter(u => u.department === dept);
    const getRandomUser = (filterFn) => {
        const arr = userDocs.filter(filterFn);
        return arr[Math.floor(Math.random() * arr.length)];
    };
    const getRandomUsers = (filterFn, n) => {
        const arr = userDocs.filter(filterFn);
        return getRandom(arr, Math.min(n, arr.length));
    };

    // Helper function to get random items from array
    const getRandom = (arr, n) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    // 1. EVENTS (fest-themed)
    const festEventNames = [
        'Battle of Bands', 'Hackathon', 'LAN Gaming', 'Open Mic', 'DJ Night', 'Treasure Hunt', 'Dance Battle',
        'Food Fest', 'Quiz Mania', 'Fashion Show', 'Stand-up Comedy', 'Photography Contest', 'Short Film Screening',
        'Drama Night', 'Art Exhibition', 'Startup Pitch', 'Robo Race', 'Closing Ceremony', 'LAN Gaming', 'Drama Night',
        'Startup Pitch', 'Robo Race', 'Quiz Mania', 'Closing Ceremony', 'Art Exhibition'
    ];
    const festEventDescriptions = [
        'A night of electrifying music and performances by top college bands.',
        '24-hour coding challenge for tech enthusiasts.',
        'Compete in popular multiplayer games for prizes.',
        'Showcase your talent in music, poetry, or comedy.',
        'Dance to the beats of the best DJs in town.',
        'Solve clues and race across campus for prizes.',
        'Inter-college dance competition with cash prizes.',
        'Stalls from top restaurants and student entrepreneurs.',
        'Test your knowledge in a fun, fast-paced quiz.',
        'Walk the ramp and dazzle the crowd with your style.',
        'Laugh out loud with the best stand-up acts.',
        'Capture the fest moments and win prizes.',
        'Watch short films made by talented students.',
        'Enjoy powerful performances by drama clubs.',
        'Explore creative artworks by students.',
        'Pitch your startup idea to investors.',
        'Robots race for glory!',
        'Celebrate the end of the fest with awards and music.',
        'Compete in popular multiplayer games for prizes.',
        'Enjoy powerful performances by drama clubs.',
        'Pitch your startup idea to investors.',
        'Robots race for glory!',
        'Test your knowledge in a fun, fast-paced quiz.',
        'Celebrate the end of the fest with awards and music.',
        'Explore creative artworks by students.'
    ];
    const festLocations = ['Main Stage', 'Auditorium', 'Open Lawn', 'Lab 1', 'Cafeteria', 'Gallery', 'Sports Ground'];
    const eventsData = festEventNames.map((name, i) => {
        const creator = getRandomUser(u => u.userType !== 'attendee');
        const participants = getRandomUsers(u => u.userType === 'attendee', Math.floor(Math.random() * 5) + 1).map(u => u._id);
        return {
            title: name,
            description: festEventDescriptions[i],
            scheduledDate: `2024-10-${String((i % 10) + 10).padStart(2, '0')}`,
            startTime: `${10 + (i % 8)}:00`,
            endTime: `${11 + (i % 8)}:30`,
            location: festLocations[i % festLocations.length],
            display: true,
            createdBy: creator._id,
            mainImageUrl: `https://source.unsplash.com/random/600x400?sig=${i}&${encodeURIComponent(name)}`,
            galleryImages: [
                `https://source.unsplash.com/random/600x400?sig=${i + 100}&${encodeURIComponent(name)}`,
                `https://source.unsplash.com/random/600x400?sig=${i + 200}&crowd`
            ],
            registeredUsers: participants,
            isFreeForAll: i % 2 === 0,
            isFreeForStudents: i % 3 === 0,
            price: i % 4 === 0 ? 0 : 100 + i * 10
        };
    });
    const eventDocs = await Event.insertMany(eventsData);
    console.log(`Created ${eventDocs.length} events`);

    // 2. TASKS (fest-themed)
    const festTaskTitles = [
        'Set up Registration Desk', 'Coordinate Food Stalls', 'Manage Social Media', 'Distribute Goodie Bags',
        'Stage Lighting Setup', 'Sound Check', 'Crowd Management', 'Clean-up Crew', 'Photography', 'Security Briefing',
        'Decorate Main Stage', 'Arrange Judges Panel', 'Prepare Certificates', 'Manage Lost & Found', 'Guide Guests',
        'Check Entry Passes', 'Organize Green Room', 'Setup Projectors', 'Arrange Water Stations', 'Distribute Coupons',
        'Monitor Backstage', 'Assist Performers', 'Setup Art Gallery', 'Manage Merchandise Stall', 'Coordinate Volunteers',
        'First Aid Desk', 'Setup LAN Network', 'Arrange Props', 'Manage Parking', 'Distribute Feedback Forms',
        'Setup Sound Booth', 'Organize Afterparty', 'Prepare Event Schedule', 'Update Fest Website', 'Arrange Trophies',
        'Coordinate Sponsors', 'Setup Photo Booth', 'Manage VIP Area', 'Distribute ID Cards', 'Check Lighting', 'Setup Banner',
        'Organize Flash Mob', 'Prepare Press Kits', 'Manage Green Room', 'Setup Charging Stations', 'Arrange Snacks',
        'Coordinate Security', 'Setup Help Desk', 'Manage Entry Queue', 'Distribute Maps', 'Setup Info Kiosk'
    ];
    const tasksData = festTaskTitles.map((title, i) => {
        const assignedBy = getRandomUser(u => u.userType === 'core');
        const assignedTo = getRandomUsers(u => ['volunteer', 'executive', 'coordinator'].includes(u.role), Math.floor(Math.random() * 3) + 1).map(u => u._id);
        return {
            title,
            description: `Task: ${title} for ${festEventNames[i % festEventNames.length]}`,
            assignedBy: assignedBy._id,
            assignedTo,
            taskStatus: i % 3 === 0 ? 'complete' : 'incomplete',
        };
    });
    const taskDocs = await Task.insertMany(tasksData);
    console.log(`Created ${taskDocs.length} tasks`);

    // 3. RESOURCES (linked to tasks)
    const resourcesData = Array.from({ length: 15 }, (_, i) => {
        const uploadedBy = getRandomUser(() => true);
        const requestedBy = getRandomUser(() => true);
        return {
            title: `Resource ${i + 1}`,
            description: `Description for resource ${i + 1}`,
            fileType: ['image', 'pdf', 'doc', 'excel', 'csv'][i % 5],
            fileUrl: `https://source.unsplash.com/random/400x400?sig=${i}&resource`,
            uploadedBy: uploadedBy._id,
            requestedBy: requestedBy._id
        };
    });
    const resourceDocs = await Resource.insertMany(resourcesData);

    // Link resources to random tasks
    for (const task of taskDocs) {
        const n = Math.floor(Math.random() * 3);
        const resources = getRandom(resourceDocs, n).map(r => r._id);
        await Task.updateOne({ _id: task._id }, { $set: { resources } });
    }

    // 4. MERCH (fest-themed)
    const festMerchNames = [
        'Fest 2024 Official Tee', 'Glow-in-the-Dark Tee', 'Snapback Cap', 'Entry Wristband', 'VIP Badge',
        'Fest Mug', 'Canvas Tote Bag', 'Sticker Pack', 'Hoodie', 'Sunglasses', 'Water Bottle', 'Poster'
    ];
    const festMerchImages = [
        'tshirt', 'tshirt', 'cap', 'wristband', 'badge', 'mug', 'bag', 'sticker', 'hoodie', 'sunglasses', 'bottle', 'poster'
    ];
    const merchData = festMerchNames.map((name, i) => {
        const sizes = [
            { size: 'S', stock: 10 + i },
            { size: 'M', stock: 15 + i },
            { size: 'L', stock: 12 + i },
            { size: 'XL', stock: 8 + i },
            { size: 'Free Size', stock: 20 + i }
        ];
        const stock = sizes.reduce((sum, s) => sum + s.stock, 0);
        return {
            name,
            description: `Official fest merch: ${name}`,
            price: 100 + i * 25,
            imageUrl: `https://source.unsplash.com/random/300x300?sig=${i}&${festMerchImages[i]}`,
            display: true,
            sizes,
            stock
        };
    });
    await Merch.insertMany(merchData);
    console.log(`Created ${merchData.length} merch items`);

    // 5. ANNOUNCEMENTS (fest-themed)
    const festAnnouncements = [
        'Welcome to the Fest! Registration desk opens at 8:00 AM.',
        'Main Stage event delayed by 30 minutes due to rain.',
        'Lost & Found is at the Help Desk near the entrance.',
        'Afterparty at 10 PM in the Open Lawn!',
        'Food coupons available at the counter.',
        'Winner: Battle of Bands – Team Rockers!',
        'Photography Contest results at 5 PM.',
        'Quiz Mania finals start at 2 PM.',
        'Art Exhibition open all day in the Gallery.',
        'DJ Night starts at 8 PM on Main Stage.',
        'Short Film Screening at 6 PM in Auditorium.',
        'Drama Night begins at 7 PM.',
        'Startup Pitch: Finalists announced!',
        'Robo Race starts at 3 PM on Sports Ground.',
        'Closing Ceremony at 9 PM on Main Stage.'
    ];
    const announcementsData = festAnnouncements.map((msg, i) => {
        const createdBy = getRandomUser(() => true);
        return {
            message: msg,
            type: ['info', 'urgent', 'winner', 'alert', 'other'][i % 5],
            target: i % 2 === 0 ? 'all' : `department:${['hospitality', 'sponsorship', 'events'][i % 3]}`,
            display: true,
            createdBy: createdBy._id
        };
    });
    await Announcement.insertMany(announcementsData);
    console.log(`Created ${announcementsData.length} announcements`);

    // 6. SCHEDULES
    const schedulesData = Array.from({ length: 10 }, (_, i) => {
        const date = `2024-10-${String(10 + i).padStart(2, '0')}`;
        const events = getRandom(eventDocs, Math.floor(Math.random() * 4) + 1).map(ev => ({
            eventId: ev._id,
            time: `${10 + (i % 8)}:00 AM`,
            venue: `Venue ${i % 5 + 1}`,
            type: ['technical', 'cultural', 'informal'][i % 3],
            status: ['upcoming', 'ongoing', 'completed'][i % 3]
        }));
        return { date, events };
    });
    await Schedule.insertMany(schedulesData);

    // 7. MEDIA (fest-themed)
    const festMediaKeywords = ['concert', 'crowd', 'stage', 'food', 'games', 'art', 'coding', 'drama', 'fashion', 'quiz', 'robot', 'dj', 'film', 'gallery', 'startup'];
    const mediaData = Array.from({ length: 25 }, (_, i) => {
        const event = getRandom(eventDocs, 1)[0];
        const uploadedBy = getRandomUser(() => true);
        const keyword = festMediaKeywords[i % festMediaKeywords.length];
        return {
            eventId: event._id,
            type: i % 2 === 0 ? 'image' : 'video',
            url: i % 2 === 0 ? `https://source.unsplash.com/random/600x400?sig=${i}&${keyword}` : `https://www.youtube.com/embed/dQw4w9WgXcQ?sig=${i}`,
            uploadedBy: uploadedBy._id
        };
    });
    await Media.insertMany(mediaData);

    // 8. MEETINGS
    const meetingsData = Array.from({ length: 12 }, (_, i) => {
        const organizer = getRandomUser(u => u.userType !== 'attendee');
        const participants = getRandomUsers(u => u.userType !== 'attendee', Math.floor(Math.random() * 4) + 2).map(u => u._id);
        const department = ['hospitality', 'sponsorship', 'events'][i % 3];
        return {
            organizer: organizer._id,
            participants,
            department,
            scheduledFor: new Date(`2024-10-${String(10 + i).padStart(2, '0')}T${10 + (i % 8)}:00:00Z`),
            meetingUrl: `https://meet.jit.si/fest-meeting-${i}`,
            status: ['scheduled', 'started', 'ended'][i % 3]
        };
    });
    await Meeting.insertMany(meetingsData);

    // 9. DEPARTMENT CHAT MESSAGES (fest-themed)
    const festChatMessages = [
        'Hospitality team, please report at 8 AM.',
        'Sponsorship update: 2 new sponsors confirmed.',
        'Events team, sound check at 9:30.',
        'Food Fest volunteers, assemble at Cafeteria.',
        'Security briefing at 10 AM in Green Room.',
        'Art Exhibition setup at 7 AM.',
        'Main Stage decoration starts at 6 AM.',
        'Lost & Found desk needs more volunteers.',
        'Photography team, meet at 11 AM.',
        'Quiz Mania: Question papers ready.',
        'Fashion Show: Models rehearsal at 2 PM.',
        'Drama Night: Props ready?',
        'Startup Pitch: Judges panel confirmed.',
        'Robo Race: Track setup at 8 AM.',
        'Closing Ceremony: Trophy table ready.'
    ];
    const chatMessagesData = Array.from({ length: 40 }, (_, i) => {
        const sender = getRandomUser(() => true);
        const department = ['hospitality', 'sponsorship', 'events'][i % 3];
        return {
            department,
            sender: sender._id,
            message: festChatMessages[i % festChatMessages.length],
            type: 'text',
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
        };
    });
    await DepartmentChatMessage.insertMany(chatMessagesData);

    // 10. NOTIFICATIONS
    const notificationsData = Array.from({ length: 40 }, (_, i) => {
        const user = getRandomUser(() => true);
        return {
            userId: user._id,
            message: `Notification ${i + 1} for ${user.name}`,
            read: i % 2 === 0,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
        };
    });
    await Notification.insertMany(notificationsData);

    // 4. FEEDBACK/DEMANDS (fest-themed, added to users)
    const festFeedback = [
        'Loved the food stalls!', 'Need more water at the main stage.', 'Can we have more seating?',
        'Great event, well organized!', 'Sound system was awesome!', 'Lighting could be better.',
        'Enjoyed the coding marathon!', 'More dustbins needed.', 'Loved the art exhibition!',
        'Security was very helpful.', 'Wish there were more snacks.', 'Loved the DJ Night!'
    ];
    const festDemands = [
        'Need more volunteers', 'Request for extra chairs', 'More dustbins needed',
        'Need more water bottles', 'Request for extra banners', 'Need more seating near stage',
        'Request for more food stalls', 'Need more lighting', 'Request for more event maps'
    ];

    // Fill user fields: eventsRegistered, feedback, demands, tasks
    for (const user of userDocs) {
        const registeredEvents = getRandom(eventDocs, Math.floor(Math.random() * 5)).map(ev => ev._id);
        const feedback = getRandom(festFeedback, Math.floor(Math.random() * 3));
        const demands = getRandom(festDemands, Math.floor(Math.random() * 2));
        const tasks = getRandom(taskDocs, Math.floor(Math.random() * 5)).map(t => t._id);
        await User.updateOne({ _id: user._id }, { $set: { eventsRegistered: registeredEvents, feedback, demands, tasks } });
    }

    // Log final counts
    const finalEventCount = await Event.countDocuments();
    const finalTaskCount = await Task.countDocuments();
    const finalMerchCount = await Merch.countDocuments();
    const finalAnnouncementCount = await Announcement.countDocuments();
    const finalNotificationCount = await Notification.countDocuments();

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Events created: ${finalEventCount}`);
    console.log(`Tasks created: ${finalTaskCount}`);
    console.log(`Merch items created: ${finalMerchCount}`);
    console.log(`Announcements created: ${finalAnnouncementCount}`);
    console.log(`Notifications created: ${finalNotificationCount}`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
}

seed().catch(err => { console.error(err); process.exit(1); }); 