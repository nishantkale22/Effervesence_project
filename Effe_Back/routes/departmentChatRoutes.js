const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const departmentChatController = require('../controllers/departmentChatController');
const { upload, uploadToGCS } = require('../middleware/uploadGCS');

router.get('/department/:department', verifyJWT, departmentChatController.getMessages);
router.post('/department/:department', verifyJWT, departmentChatController.sendMessage);

// File upload for chat (image, video, audio, file)
router.post('/upload', verifyJWT, upload.single('file'), uploadToGCS, (req, res) => {
    if (!req.file?.cloudStoragePublicUrl) {
        return res.status(400).json({ error: 'No file uploaded or GCS failed' });
    }
    res.status(200).json({ fileUrl: req.file.cloudStoragePublicUrl });
});

// Delete for me
router.patch('/message/:id/delete-for-me', verifyJWT, departmentChatController.deleteForMe);
// Delete for everyone
router.patch('/message/:id/delete-for-everyone', verifyJWT, departmentChatController.deleteForEveryone);

module.exports = router; 