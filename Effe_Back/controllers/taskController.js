const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');
const Task = require('../models/Task');
const User = require('../models/User');

const postTaskWithResource = asyncHandler (async (req, res) => {
    try {
      const { id,task,assignedTo,resource} = req.body;
  
      // Validate required fields
      if (!task || !assignedTo || !id) {
        return res.status(400).send('Missing required fields');
      }
  
      // Create a new resource if resource details are provided
      let newResource = null;
      if (resource && Object.keys(resource).length > 0) {
        newResource = new Resource({
          title: resource.title,
          description: resource.description,
          fileType: resource.fileType,
          fileUrl: resource.fileUrl,
          uploadedBy: id,
        });
        await newResource.save(); // Save resource to MongoDB
      console.log(newResource) ;

      }
  
  
      // Fetch the users to whom the task is assigned
      const assignedUsers = await User.find({ _id: { $in: assignedTo } });
      if (assignedUsers.length !== assignedTo.length) {
        return res.status(404).send('Some assigned users not found');
      }
  
      // Create a new task with the given details
      const newTask = new Task({
        title: task.title,
        description: task.description,
        resources: newResource ? [newResource._id] : [],
        assignedBy: id,
        assignedTo: assignedUsers.map(user => user._id),
      });
      

      await newTask.save(); // Save task to MongoDB


       // Update assigned users to push the new task ID into their tasks field
       await User.updateMany(
        { _id: { $in: assignedTo } },
        { $push: { tasks: newTask._id } }
      );

      res.status(200).send('Task assigned successfully');
      console.log(newTask) ;
    } catch (error) {
      console.error('Error in assigning task:', error);
      res.status(500).send('Task assignment failed');
    }
  });

  const getTaskResources = asyncHandler (async (req, res) => {
   try{
    const {_id} = req.params ;

    const task = await Task.findById(_id).populate('resources') ;
    const resources = task.resources ;

    if (resources.length === 0) {
        return res.status(404).json({ message: 'No resources found' });
    }

    res.json({ resources });


   }catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
}
  });


  const postTaskResource = asyncHandler(async (req, res) => {
    try {
        const { _id, uploaderId, resource } = req.body; // _id = Task ID, uploaderId = User ID

        // Create a new Resource instance
        const newResource = new Resource({
            title: resource.title,
            description: resource.description,
            fileType: resource.fileType,
            fileUrl: resource.fileUrl,
            uploadedBy: uploaderId, // User uploading the resource
        });

        // Save the new resource to MongoDB
        await newResource.save();

        // Update the task by pushing the new resource ID into its resources array
        const updatedTask = await Task.findByIdAndUpdate(
            _id,
            { $push: { resources: newResource._id } },
            { new: true } // Return the updated task after modification
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(201).json({
            message: 'Resource added successfully',
            resource: newResource,
            task: updatedTask,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


  module.exports = {
    postTaskWithResource,
    getTaskResources,
    postTaskResource,
};