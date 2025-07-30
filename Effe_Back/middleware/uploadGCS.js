const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');
const path = require('path');

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEY_FILE,
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

const upload = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadToGCS = (req, res, next) => {
  if (!req.file) return next();

  const blob = bucket.file(Date.now() + path.extname(req.file.originalname));
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: req.file.mimetype,
  });

  blobStream.on('error', (err) => {
    console.error('Upload to GCS failed:', err);
    return res.status(500).json({ message: 'Upload to GCS failed', error: err.message });
  });

  blobStream.on('finish', async () => {
    try {
      // 🔒 Generate a signed URL valid for 7 days
      const [url] = await blob.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 year
      });

      req.file.cloudStorageObject = blob.name;
      req.file.cloudStoragePublicUrl = url;
      next();
    } catch (err) {
      console.error('Failed to generate signed URL:', err);
      return res.status(500).json({ message: 'Signed URL generation failed', error: err.message });
    }
  });

  blobStream.end(req.file.buffer);
};

module.exports = { upload, uploadToGCS };
