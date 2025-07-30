const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getSocketIo } = require('../socket');

const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file?.cloudStoragePublicUrl) {
    return res.status(400).json({ error: 'No file uploaded or GCS failed' });
  }
  const fileUrl = req.file.cloudStoragePublicUrl;
  res.status(200).json({ fileUrl });
});


const attatchResourceToTask = asyncHandler(async (req, res) => {
  try {
      const { user_id, _id, resource } = req.body;

      if (!resource.fileUrl) {
          return res.status(400).json({ message: "Missing file URL" });
      }

      const newResource = new Resource({
          title: resource.title,
          description: resource.description,
          fileType: resource.fileType,
          fileUrl: resource.fileUrl,
          uploadedBy: user_id,
      });

      await newResource.save();

      const task = await Task.findById(_id);
      if (!task) {
          return res.status(404).json({ message: "Task not found" });
      }

      task.resources.push(newResource._id);
      await task.save();

      res.json({ newResource });
  } catch (error) {
      console.error("Error in attaching resource to task:", error);
      res.status(500).json({ message: "Server error" });
  }
});

const deleteResourceById = asyncHandler(async (req, res) => {
  try {
    const { resourceId } = req.params;
    // console.log(resourceId) 
    if (!resourceId || resourceId === 'undefined') {
      return res.status(400).json({ message: 'Invalid Resource Id' });
    }

    const task = await Resource.findByIdAndDelete(resourceId) ;
    res.json({message : 'Resource deleted successfully'}) ;
    
    

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = {
  uploadResource,
  attatchResourceToTask,
  deleteResourceById,
};
