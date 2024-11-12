const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const resourceController = require('../controllers/resourceController');
const upload = require('../middleware/upload');


router.post('/upload', upload.single('file'), resourceController.uploadResource);

router.post('/post',resourceController.attatchResourceToTask) ;

router.delete('/:resourceId/delete',resourceController.deleteResourceById ) ;

module.exports = router;