import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/taskDetails.css';
// import { io } from 'socket.io-client';


const TaskDetails = () => {
    const { _id } = useParams();
    const location = useLocation();
    const user_id = location.state?.user_id;
    // console.log(user_id) ;
    // const socket = io('http://localhost:5000', { transports: ['websocket'] });


    const [task, setTask] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [resources, setResources] = useState([]);
    const [error, setError] = useState('');
    const [newResource, setNewResource] = useState({ title: '', description: '', fileType: '', fileUrl: '' });
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [resourceRequest, setResourceRequest] = useState({ title: '', description: '' });

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/taskdetails/${_id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );

                setTask(data.task);
                setAssignedUsers(data.task.assignedTo);
                setResources(data.task.resources);
            } catch (err) {
                setError('Failed to fetch task details.');
                console.error(err);
            }
        };

        fetchTaskDetails();
    }, [_id]);
    const handleResourceUpload = async (e) => {
        e.preventDefault();
        if (!newResource.fileUrl) {
            alert('Please upload a file first.');
            return;
        }
    
        try {
            const { data } = await axiosInstance.post(
                `/resource/post`,
                { user_id, _id, resource: newResource },
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );
    
            setResources([...resources, data.newResource]);
            setNewResource({ title: '', description: '', fileType: '', fileUrl: '' });
            setShowUploadForm(false);
            setError('');
        } catch (err) {
            setError('Failed to upload resource.');
            console.error(err);
        }
    };
    
    const handleResourceRequest = async (e) => {
        e.preventDefault();
        try {
            const requestPayload = {
                _id, 
                resourceRequest: {
                    title: resourceRequest.title, 
                    description: resourceRequest.description
                },
                user_id
            };
    
            // Send the resource request to the server
            await axiosInstance.post(
                `/request/resources`, 
                requestPayload,
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );
    
            // Reset form fields after successful submission
            setResourceRequest({ title: '', description: '' });
            setShowRequestForm(false);
            setError('');
        } catch (err) {
            // Display error message on failure
            setError('Failed to submit resource request.');
            console.error(err);
        }
    };
    const handleFileUpload = async () => {
        if (!newResource.selectedFile) {
          alert('Please select a file before uploading.');
          return;
        }
    
        const formData = new FormData();
        formData.append('file', newResource.selectedFile);
    
        try {
          const { data } = await axiosInstance.post('/resource/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
    
          if (!data.fileUrl) {
            throw new Error("File upload failed, URL not received.");
          }
    
          setNewResource({
            ...newResource,
            fileUrl: data.fileUrl,
          });
    
          alert('File uploaded successfully!');
        } catch (error) {
          console.error('File upload error:', error);
          alert('Failed to upload the file.');
        }
    };
    

    const renderTooltip = (user) => (
        <span className="tooltip-text">
            <strong>Contact:</strong> {user.phone || 'N/A'} <br />
            <strong>Email:</strong> {user.email || 'N/A'}
        </span>
    );

 // Download function
    const handleDownload = async (fileUrl, filename) => {
        try {
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || 'downloaded_file');
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
        }
    };


    return (
        <div className="task-details-container">
            <div className="task-info-box">
                <h3>Task Details</h3>
                {task ? (
                    <>
                        <p><strong>Title:</strong> {task.title}</p>
                        <p><strong>Description:</strong> {task.description}</p>
                        <p><strong>Deadline:</strong> {task.deadline || 'N/A'}</p>
                        <p>
                            <strong>Assigned By:</strong>{' '}
                            <span className="tooltip">
                                {task.assignedBy?.name || 'N/A'}
                                {task.assignedBy && renderTooltip(task.assignedBy)}
                            </span>
                        </p>
                        <p><strong>Created At:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                    </>
                ) : (
                    <p>Loading task details...</p>
                )}
            </div>

            <div className="assigned-users-box">
                <h3>Assigned Users</h3>
                {assignedUsers.length > 0 ? (
                    <ul>
                        {assignedUsers.map((user) => (
                            <li key={user._id}>
                                <span className="tooltip">
                                    {user.name}
                                    {renderTooltip(user)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users assigned to this task.</p>
                )}
            </div>

            <div className="task-resources-box">
                <h3>Task Resources</h3>
                {resources.length > 0 ? (
                    <ul>
                        {resources.map((resource) => (
                            <li key={resource._id}>
                                <p>{resource.title} - {resource.description}</p>
                                <button onClick={() => handleDownload(resource.fileUrl, resource.title)}>Download File</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No resources available.</p>
                )}

                <button onClick={() => setShowUploadForm(!showUploadForm)}>
                    {showUploadForm ? 'Cancel Upload' : 'Upload Resource'}
                </button>
                {showUploadForm && (
                    <form onSubmit={handleResourceUpload} className="resource-upload-form">
                        <div className="form-section">
    <h3>Resource Details</h3>
    <input
      type="text"
      value={newResource.title}
      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
      placeholder="Resource Title"
      required
    />
    <textarea
      value={newResource.description}
      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
      placeholder="Resource Description"
      required
    />
    <select
      value={newResource.fileType}
      onChange={(e) => setNewResource({ ...newResource, fileType: e.target.value })}
      required
    >
      <option value="">Select File Type</option>
      <option value="image">Image</option>
      <option value="pdf">PDF</option>
      <option value="doc">Document</option>
      <option value="excel">Excel</option>
      <option value="csv">CSV</option>
    </select>

    {/* File Input */}
    <input
      type="file"
      id="fileInput"
      accept=".jpg,.jpeg,.png,.pdf,.doc,.xls,.xlsx,.csv"
      onChange={(e) => setNewResource({ ...newResource, selectedFile: e.target.files[0] })}
      required
    />

    {/* Upload Button */}
    <button type="button" onClick={handleFileUpload}>
      Upload File
    </button>

    {/* Uploaded file display */}
    {newResource.fileUrl && (
      <p>
        Uploaded file: <a href={newResource.fileUrl} target="_blank" rel="noopener noreferrer">View File</a>

      </p>
      
    )}
  </div>
                        <button type="submit">Upload Resource</button>
                    </form>
                )}
            </div>

            <div className="resource-request-box">
                <h3>Request Resource</h3>
                <button onClick={() => setShowRequestForm(!showRequestForm)}>
                    {showRequestForm ? 'Cancel Request' : 'Request Resource'}
                </button>
                {showRequestForm && (
                    <form onSubmit={handleResourceRequest} className="resource-request-form">
                        <input
                            type="text"
                            placeholder="Request Title"
                            value={resourceRequest.title}
                            onChange={(e) => setResourceRequest({ ...resourceRequest, title: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Request Description"
                            value={resourceRequest.description}
                            onChange={(e) => setResourceRequest({ ...resourceRequest, description: e.target.value })}
                            required
                        />
                        <button type="submit">Submit Request</button>
                    </form>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default TaskDetails;
