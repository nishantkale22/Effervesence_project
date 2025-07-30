const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // e.g., "10:00 AM"
    required: true
  },
  endTime: {
    type: String, // e.g., "1:30 PM"
    required: true
  },
  location: {
    type: String,
    default: 'IIITA Campus'
  },
  mainImageUrl: {
    type: String
  },
  galleryImages: [
    {
      type: String
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  display: {
    type: Boolean,
    default: false  // hidden by default
  },
  registeredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  isFreeForAll: {
    type: Boolean,
    default: false
  },
  isFreeForStudents: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0 // 0 means free
  }
}, { timestamps: true });

// Add a pre-save hook to ensure only one of isFreeForAll or isFreeForStudents can be true
// (Optional, but recommended for data integrity)
eventSchema.pre('save', function (next) {
  if (this.isFreeForAll && this.isFreeForStudents) {
    return next(new Error('Event cannot be free for all and free for students at the same time.'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
