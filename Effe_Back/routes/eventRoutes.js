// Updated eventRoutes.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const eventController = require('../controllers/eventController');

// Public display events (for public site)
router.get('/display', eventController.getDisplayEvents);


router.post('/create', verifyJWT, eventController.createEvent);
router.get('/all', verifyJWT, eventController.getAllEvents);
router.get('/display', eventController.getDisplayEvents);
router.get('/display/:eventId', eventController.getDisplayEventById);
router.get('/:eventId', verifyJWT, eventController.getEventById);
router.put('/:eventId', verifyJWT, eventController.updateEvent);         // ✅ fix
router.delete('/:eventId', verifyJWT, eventController.deleteEvent);     // ✅ fix
router.get('/user/:userId', verifyJWT, eventController.getEventsByUserId);
router.get('/department/:department', verifyJWT, eventController.getEventsByDepartment);
router.put('/:eventId/make-public', verifyJWT, eventController.makeEventPublic);
router.put('/:eventId/make-private', verifyJWT, eventController.makeEventPrivate);
router.put('/:eventId/gallery/add', verifyJWT, eventController.addGalleryImageToEvent);
router.put('/:eventId/gallery/remove', verifyJWT, eventController.removeGalleryImage);
router.post('/payment/order', verifyJWT, eventController.createPaymentOrder);
router.post('/payment/verify', verifyJWT, eventController.verifyPayment);
router.post('/:eventId/register', verifyJWT, eventController.registerForEvent);

module.exports = router;
