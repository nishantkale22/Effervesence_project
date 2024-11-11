const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const taskSchema = new Schema({
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
  resources: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    },
  ],
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  taskStatus: {
    type: String,
    enum: ['incomplete', 'complete'],
    default: 'incomplete',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the task model
const Task = model('Task', taskSchema);

module.exports = Task;
