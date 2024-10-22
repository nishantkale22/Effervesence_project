const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const resourceSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', 'doc', 'excel', 'csv'], // Allowed file types
    required: true,
  },
  fileUrl: {
    type: String, // URL fetched from cloud storage
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who uploaded the resource
    required: true,
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who requested the resource
  },
});

// Create the resource model
const Resource = model('Resource', resourceSchema);

module.exports = Resource;
