const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Define the schema for users
const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: function () {
      return new mongoose.Types.ObjectId();
    }
  },
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Store a URL or Base64 string
    default: '',
  },
  userType: {
    type: String,
    enum: ['core', 'non_core', 'attendee'], // Core, Non-Core, or Attendee
    required: true,
  },
  role: {
    type: String,
    enum: [
      'festival head', 'operational head', 'finance',
      'coordinator', 'volunteer', 'executive',
      'student',  'outsider',
    ],
    required: true,
  },
  department: {
    type: String,
    enum: ['hospitality', 'sponsorship', 'events', 'operations', 'finance', 'none'],
    default: 'none', // Optional field; 'none' for attendees without departments
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, // Store the hashed password
  },
  eventsRegistered: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event', // Reference to events the user registered for
    }
  ],
  feedback: {
    type: [String], // List of feedback messages
    default: [],
  },
  demands: {
    type: [String], // List of user demands or requests
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the user model
const User = model('User', userSchema);

module.exports = User;
