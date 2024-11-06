const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: '',
  },
  userType: {
    type: String,
    enum: ['core', 'non_core', 'attendee'],
    required: true,
  },
  role: {
    type: String,
    enum: [
      'festival head', 'operational head', 'finance',
       'volunteer', 'executive',
      'student', 'outsider',
    ],
    required: true,
  },
  department: {
    type: String,
    enum: ['hospitality', 'sponsorship', 'events', 'operations', 'finance', 'none'],
    default: 'none',
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
    required: true,
  },
  eventsRegistered: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
  feedback: {
    type: [String],
    default: [],
  },
  demands: {
    type: [String],
    default: [],
  },
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task', // Reference to tasks assigned to the user
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = model('User', userSchema);

module.exports = User;
