const asyncHandler = require('express-async-handler');
const { getSocketIo } = require('../socket');

// Single file upload
const uploadfile = asyncHandler(async (req, res) => {
  if (!req.file?.cloudStoragePublicUrl) {
    return res.status(400).json({ error: 'No file uploaded or GCS failed' });
  }
  const fileUrl = req.file.cloudStoragePublicUrl;
  res.status(200).json({ fileUrl });
});

// Multiple file upload
const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded or GCS failed' });
  }

  const uploadedFiles = req.files.map(file => ({
    fileName: file.originalname,
    fileType: file.mimetype,
    size: file.size || file.buffer?.length || null,
    fileUrl: file.cloudStoragePublicUrl,
  }));

  res.status(200).json({
    message: 'Files uploaded successfully',
    files: uploadedFiles,
  });
});

module.exports = {
  uploadfile,
  uploadMultipleFiles,
};
