const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getSocketIo } = require('../socket');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentOrder = asyncHandler(async (req, res) => {
    try {
        console.log("okay");
        console.log(process.env.RAZORPAY_KEY_ID);

        const { amount, currency = 'INR', receipt } = req.body;
        if (!amount || !receipt) {
            return res.status(400).json({ status: 'error', message: 'Amount and receipt are required' });
        }
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        res.status(201).json({ status: 'ok', order });
    } catch (err) {
        console.error('Razorpay order creation error:', err);
        res.status(500).json({ status: 'error', message: 'Failed to create Razorpay order', error: err.message });
    }
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');
    if (expectedSignature === razorpay_signature) {
        return res.status(200).json({ status: 'ok', verified: true });
    } else {
        return res.status(400).json({ status: 'error', verified: false, message: 'Invalid signature' });
    }
});

const getAllEvents = asyncHandler(async (req, res) => {
    const events = await Event.find()
        .populate('createdBy', 'name email')
        .populate('registeredUsers', 'name email');
    res.status(200).json({ status: 'ok', events });
});

// GET events that are marked for display
const getDisplayEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ display: true })
        .populate('createdBy', 'name email')
        .populate('registeredUsers', 'name email');
    res.status(200).json({ status: 'ok', events });
});

// GET event by ID
const getEventById = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId)
        .populate('createdBy', 'name email')
        .populate('registeredUsers', 'name email');

    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    res.status(200).json({ status: 'ok', event });
});

// GET single public event by ID (for public site)
const getDisplayEventById = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }
    const event = await Event.findOne({ _id: eventId, display: true })
        .populate('createdBy', 'name email')
        .populate('registeredUsers', 'name email');
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found or not public' });
    }
    res.status(200).json({ status: 'ok', event });
});

// GET events created by a specific user
const getEventsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const events = await Event.find({ createdBy: userId })
        .populate('createdBy', 'name email')
        .populate('registeredUsers', 'name email');

    res.status(200).json({ status: 'ok', events });
});

// GET events by department (assuming you filter by creator's department)
const getEventsByDepartment = asyncHandler(async (req, res) => {
    const { department } = req.params;

    const events = await Event.find()
        .populate({
            path: 'createdBy',
            match: { department },
            select: 'name email department'
        })
        .populate('registeredUsers', 'name email');

    // Filter out events whose `createdBy` did not match
    const filtered = events.filter(e => e.createdBy !== null);

    res.status(200).json({ status: 'ok', events: filtered });
});

// CREATE event

const createEvent = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.role === 'volunteer') {
        return res.status(403).json({
            status: 'error',
            message: 'Volunteers are not allowed to create events',
        });
    }

    const {
        title,
        description,
        scheduledDate,
        startTime,
        endTime,
        location,
        mainImageUrl,
        galleryImages,
        display,
        isFreeForAll,
        isFreeForStudents,
        price,
    } = req.body;

    if (!title || !description || !scheduledDate || !startTime || !endTime) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields',
        });
    }

    const newEvent = await Event.create({
        title,
        description,
        scheduledDate,
        startTime,
        endTime,
        location,
        mainImageUrl,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        createdBy: user._id,
        display: display ?? false,
        isFreeForAll: !!isFreeForAll,
        isFreeForStudents: !!isFreeForStudents,
        price: price ?? 0,
    });

    const targetUsers = await User.find({ userType: { $ne: 'attendee' } });
    const io = getSocketIo();

    for (const u of targetUsers) {
        const notification = await Notification.create({
            userId: u._id,
            message: `New event "${title}" has been created.`,
            read: false,
        });

        const unreadCount = await Notification.countDocuments({ userId: u._id, read: false });

        io.to(u._id.toString()).emit('receiveNotification', notification);
        io.to(u._id.toString()).emit('unreadCount', unreadCount); // ✅ send actual count
    }

    io.emit('eventCreated', newEvent); // Global broadcast

    res.status(201).json({
        status: 'ok',
        message: 'Event created and notifications sent',
        event: newEvent,
    });
});


// DELETE event
const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    if (String(event.createdBy) !== req.user._id && req.user.role !== 'festival head') {
        return res.status(403).json({ status: 'error', message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    getSocketIo().emit('eventDeleted', eventId);

    res.json({ status: 'ok', message: 'Event deleted successfully' });
});

// UPDATE event
const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const updateFields = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    if (String(event.createdBy) !== req.user._id && req.user.role !== 'festival head') {
        return res.status(403).json({ status: 'error', message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateFields, { new: true });
    getSocketIo().emit('eventUpdated', updatedEvent);

    res.json({ status: 'ok', event: updatedEvent });
});


const makeEventPublic = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    if (String(event.createdBy) !== req.user._id && req.user.role !== 'festival head') {
        return res.status(403).json({ status: 'error', message: 'Not authorized to make this event public' });
    }

    // Make the event public
    event.display = true;
    await event.save();

    // Repopulate the saved event
    const populatedEvent = await Event.findById(eventId)
        .populate('createdBy', 'name email')
        .populate('registeredUsers', 'name email');

    // Send notification to all non-attendee users
    const targetUsers = await User.find();
    const io = getSocketIo();

    for (const user of targetUsers) {
        const notification = await Notification.create({
            userId: user._id,
            message: 'New Event out !! Check out',
            read: false,
        });

        const unreadCount = await Notification.countDocuments({ userId: user._id, read: false });

        // Emit notification and count to user's socket
        io.to(user._id.toString()).emit('receiveNotification', notification);
        io.to(user._id.toString()).emit('unreadCount', unreadCount);
    }

    // Emit event update globally
    io.emit('eventUpdated', populatedEvent);

    res.json({
        status: 'ok',
        message: 'Event made public and notifications sent',
        event: populatedEvent,
    });
});

const makeEventPrivate = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    // if (String(event.createdBy) !== req.user._id && req.user.role !== 'festival head') {
    //     return res.status(403).json({ status: 'error', message: 'Not authorized to make this event public' });
    // }

    event.display = false;
    await event.save();
    // repopulate with createdBy info
    const populatedEvent = await Event.findById(eventId)
        .populate('createdBy', 'name email')
        .populate('registeredUsers', 'name email');

    getSocketIo().emit('eventUpdated', populatedEvent);

    res.json({ status: 'ok', message: 'Event made public successfully', event: populatedEvent });
});

const addGalleryImageToEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { images } = req.body; // array of URLs

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event ID' });
    }

    if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Images must be a non-empty array' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    event.galleryImages.push(...images);
    await event.save();

    res.status(200).json({
        status: 'ok',
        message: `${images.length} image${images.length > 1 ? 's' : ''} added to gallery`,
        event
    });
});

// Remove specific image from gallery
const removeGalleryImage = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ status: 'error', message: 'Image URL required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    event.galleryImages = event.galleryImages.filter(url => url !== imageUrl);
    await event.save();

    res.status(200).json({ status: 'ok', event });
});

// Register for event
const registerForEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user._id;
    const user = req.user;
    const { payment } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    const eventStart = new Date(event.scheduledDate + 'T' + event.startTime);
    const regDeadline = new Date(eventStart.getTime() - 2 * 60 * 60 * 1000);
    if (new Date() > regDeadline) {
        return res.status(400).json({ status: 'error', message: 'Registration is closed for this event.' });
    }

    if (event.registeredUsers.some(u => u.toString() === userId.toString())) {
        return res.status(400).json({ status: 'error', message: 'Already registered for this event.' });
    }

    if (!event.isFreeForAll && !(event.isFreeForStudents && (user.role === 'student' || user.userType === 'student'))) {
        if (event.price > 0) {
            if (!payment || !payment.razorpay_order_id || !payment.razorpay_payment_id || !payment.razorpay_signature) {
                return res.status(400).json({ status: 'error', message: 'Payment details required' });
            }
            const sign = payment.razorpay_order_id + '|' + payment.razorpay_payment_id;
            const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(sign)
                .digest('hex');
            if (expectedSignature !== payment.razorpay_signature) {
                return res.status(400).json({ status: 'error', message: 'Payment verification failed' });
            }
        }
    }

    event.registeredUsers.push(userId);
    await event.save();
    return res.status(200).json({ status: 'ok', message: 'Registered successfully.' });
});


module.exports = {
    getAllEvents,
    getDisplayEvents,
    getEventById,
    getDisplayEventById,
    getEventsByUserId,
    getEventsByDepartment,
    createEvent,
    deleteEvent,
    updateEvent,
    makeEventPublic,
    makeEventPrivate,
    addGalleryImageToEvent,
    removeGalleryImage,
    registerForEvent,
    createPaymentOrder,
    verifyPayment,
};
