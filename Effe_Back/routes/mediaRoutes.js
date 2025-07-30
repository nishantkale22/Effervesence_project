const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { upload, uploadToGCS } = require('../middleware/uploadGCS');
const mediaController = require('../controllers/mediaController');

// Role check middleware (admin/core only)
function requireAdminOrCore(req, res, next) {
    if (req.user?.role === 'admin' || req.user?.role === 'core') return next();
    return res.status(403).json({ message: 'Forbidden: Admin/Core only' });
}

// Upload media (image/video)
router.post('/', verifyJWT, requireAdminOrCore, upload.single('file'), uploadToGCS, (req, res, next) => {
    if (req.file?.cloudStoragePublicUrl) req.body.url = req.file.cloudStoragePublicUrl;
    mediaController.uploadMedia(req, res, next);
});

// Get media for an event
router.get('/', verifyJWT, mediaController.getMedia);

// Delete media
router.delete('/:id', verifyJWT, requireAdminOrCore, mediaController.deleteMedia);

module.exports = router; 