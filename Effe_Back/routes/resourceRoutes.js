const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const resourceController = require('../controllers/resourceController');
const { upload, uploadToGCS } = require('../middleware/uploadGCS');

// Secure upload with JWT and Google Cloud integration
router.post('/upload', verifyJWT, upload.single('file'), uploadToGCS, resourceController.uploadResource);

// Attach resource to task (requires login)
router.post('/post', verifyJWT, resourceController.attatchResourceToTask);

// Delete resource (requires login)
router.delete('/:resourceId/delete', verifyJWT, resourceController.deleteResourceById);

module.exports = router;
