import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/taskDetails.css';

const AllocationDetails = () => {
    const { _id } = useParams();
    const location = useLocation();
    const user_id = location.state?.user_id;

    const [task, setTask] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [resources, setResources] = useState([]);
    const [error, setError] = useState('');
    const [newResource, setNewResource] = useState({ title: '', description: '', fileType: '', fileUrl: '' });
    const [showUploadForm, setShowUploadForm] = useState(false);

    useEffect(() => {
        const fetchAllocationDetails = async () => {
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

        fetchAllocationDetails();
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

    const handleDeleteResource = async (resourceId) => {
        try {
            await axiosInstance.delete(
                `/resource/${resourceId}/delete`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );
            setResources((prev) => prev.filter((resource) => resource._id !== resourceId));
        } catch (err) {
            setError('Failed to delete resource.');
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

            setNewResource({ ...newResource, fileUrl: data.fileUrl });
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('File upload error:', error);
            alert('Failed to upload the file.');
        }
    };

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

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || 'downloaded_file');
            document.body.appendChild(link);
            link.click();
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
                        <p><strong>Assigned By:</strong> {task.assignedBy?.name || 'N/A'}</p>
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
                            <li key={user._id}>{user.name}</li>
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
                                <p> <a href={resource.fileUrl}>{resource.title}</a>  - {resource.description}</p>
                                <button onClick={() => handleDownload(resource.fileUrl, resource.title)}>Download File</button>
                                <button onClick={() => handleDeleteResource(resource._id)} className="details-button">Delete</button>
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
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.xls,.xlsx,.csv"
                                onChange={(e) => setNewResource({ ...newResource, selectedFile: e.target.files[0] })}
                                required
                            />
                            <button type="button" onClick={handleFileUpload}>Upload File</button>
                            {newResource.fileUrl && (
                                <p>Uploaded file: <a href={newResource.fileUrl} target="_blank" rel="noopener noreferrer">View File</a></p>
                            )}
                        </div>
                        <button type="submit">Upload Resource</button>
                    </form>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default AllocationDetails;
