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
      ref: 'Resource', // Reference to resource objects
    },
  ],
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who assigned the task
    required: true,
  },
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to users assigned to this task
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the task model
const Task = model('Task', taskSchema);

module.exports = Task;
