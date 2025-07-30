const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { upload, uploadToGCS } = require('../middleware/uploadGCS');
const { uploadfile, uploadMultipleFiles } = require('../controllers/uploadController');

// Single file route
router.post('/single', verifyJWT, upload.single('file'), uploadToGCS, uploadfile);

router.post('/register/single', upload.single('file'), uploadToGCS, uploadfile);


// Multiple files route
router.post('/multiple', verifyJWT, upload.array('files'), uploadToGCS, uploadMultipleFiles);

module.exports = router;
