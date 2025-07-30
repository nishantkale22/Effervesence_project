import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { ChevronUp, Download, PlusIcon, SendIcon, UploadCloud } from 'lucide-react';

const TaskDetails = ({ _id }) => {
    const location = useLocation();
    const user_id = location.state?.user_id;

    // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
    // const [task, setTask] = useState({
    //     title: 'Dummy Task',
    //     description: 'This is a dummy task description.',
    //     deadline: '2023-10-15',
    //     assignedBy: { name: 'John Doe', phone: '1234567890', email: 'randomemail.com' },
    //     createdAt: '2023-10-01T00:00:00Z',
    //     assignedTo: [
    //         { _id: 'user1', name: 'User One', phone: '9876543210', email: 'randomemail.com' },
    //         { _id: 'user2', name: 'User Two', phone: '1234567890', email: 'randomemail.com' },
    //     ],
    //     resources: [
    //         { _id: 'resource1', title: 'Resource One', description: 'This is a dummy resource.', fileUrl: 'https://example.com/resource1.pdf' },
    //         { _id: 'resource2', title: 'Resource Two', description: 'This is another dummy resource.', fileUrl: 'https://example.com/resource2.pdf' },
    //     ],
    // });
    // const [assignedUsers, setAssignedUsers] = useState([
    //     { _id: 'user1', name: 'User One', phone: '9876543210', email: 'randomemail.com' },
    //     { _id: 'user2', name: 'User Two', phone: '1234567890', email: 'randomemail.com' },
    // ]);
    // const [resources, setResources] = useState([
    //     { _id: 'resource1', title: 'Resource One', description: 'This is a dummy resource.', fileUrl: 'https://example.com/resource1.pdf' },
    //     { _id: 'resource2', title: 'Resource Two', description: 'This is another dummy resource.', fileUrl: 'https://example.com/resource2.pdf' },
    // ]);

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
        <>
            <section section className="task-details mt-10 p-6 bg-white rounded-lg shadow-lg space-y-6" >
                <h3 className="text-2xl font-semibold text-gray-900">Task Details</h3>

                {/* Task Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        {task ? (
                            <>
                                <p>
                                    <span className="font-semibold">Title:</span> {task.title}
                                </p>
                                <p className="mt-1">
                                    <span className="font-semibold">Description:</span>{" "}
                                    {task.description}
                                </p>
                                <p className="mt-1">
                                    <span className="font-semibold">Deadline:</span>{" "}
                                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}
                                </p>
                                <p className="mt-1">
                                    <span className="font-semibold">Assigned By:</span>{" "}
                                    {task.assignedBy?.name || "N/A"}
                                </p>
                                <p className="mt-1">
                                    <span className="font-semibold">Created At:</span>{" "}
                                    {new Date(task.createdAt).toLocaleString()}
                                </p>
                            </>
                        ) : (
                            <p>Loading task details...</p>
                        )}
                    </div>

                    {/* Assigned Users */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold mb-2">Assigned Users</h4>
                        {assignedUsers.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-700">
                                {assignedUsers.map((user) => (
                                    <li key={user._id}>{user.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No users assigned to this task.</p>
                        )}
                    </div>
                </div>

                {/* Resources */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-semibold">Resources</h4>
                        <button
                            onClick={() => setShowUploadForm((v) => !v)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
                            title="Add Resource"
                            aria-label="Add new resource"
                        >
                            {showUploadForm ? <ChevronUp size={18} /> : <PlusIcon size={18} />}
                            Add Resource
                        </button>
                    </div>

                    {resources.length > 0 ? (
                        <ul className="space-y-3">
                            {resources.map((resource) => (
                                <li
                                    key={resource._id}
                                    className="flex items-center justify-between bg-white rounded-md border border-gray-300 p-3 shadow-sm"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">{resource.title}</p>
                                        <p className="text-gray-600 text-sm">{resource.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                handleDownload(resource.fileUrl, resource.title)
                                            }
                                            title="Download Resource"
                                            aria-label={`Download ${resource.title}`}
                                            className="text-blue-700 hover:bg-blue-100 flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No resources available for this task.</p>
                    )}

                    {/* Upload Form */}
                    {showUploadForm && (
                        <form
                            onSubmit={handleResourceUpload}
                            className="mt-6 space-y-4 border-t pt-4"
                        >
                            <div>
                                <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-title">
                                    Title
                                </label>
                                <input
                                    id="resource-title"
                                    type="text"
                                    value={newResource.title}
                                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter resource title"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-desc">
                                    Description
                                </label>
                                <textarea
                                    id="resource-desc"
                                    value={newResource.description}
                                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter resource description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-filetype">
                                    File Type
                                </label>
                                <select
                                    id="resource-filetype"
                                    value={newResource.fileType}
                                    onChange={(e) => setNewResource({ ...newResource, fileType: e.target.value })}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select file type</option>
                                    <option value="pdf">PDF</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="doc">Document</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-file">
                                    File Upload
                                </label>

                                <div className="flex item-center">
                                    <input
                                        id="resource-file"
                                        type="file"
                                        onChange={(e) => setNewResource({ ...newResource, selectedFile: e.target.files[0] })}
                                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        accept="*"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleFileUpload}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        Upload File
                                    </button>
                                </div>

                                {newResource.fileUrl && (
                                    <div className="mt-2 text-sm text-blue-600">
                                        Uploaded file: <a href={newResource.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">View File</a>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 -mx-4 -mb-5 rounded-b-lg">
                                <button
                                    type="submit"
                                    className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    <UploadCloud size={18} />
                                    Upload Resource
                                </button>
                            </div>
                        </form>
                    )}
                </div>


                <div className="resource-request-box">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-semibold">Request Resource</h4>
                        <button
                            onClick={() => setShowRequestForm(!showRequestForm)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
                            title="Add Resource"
                            aria-label="Add new resource"
                        >
                            {showRequestForm ? (<><ChevronUp size={18} /> Request Resource</>) : (<> <PlusIcon size={18} />Request Resource</>)}
                        </button>
                    </div>

                    {showRequestForm && (
                        <form onSubmit={handleResourceRequest} className="mt-6 space-y-4 border-t pt-4">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-title">
                                    Title
                                </label>
                                <input
                                    id="request-title"
                                    type="text"
                                    value={resourceRequest.title}
                                    onChange={(e) => setResourceRequest({ ...resourceRequest, title: e.target.value })}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter Request title"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-desc">
                                    Description
                                </label>
                                <textarea
                                    id="resource-desc"
                                    value={resourceRequest.description}
                                    onChange={(e) => setResourceRequest({ ...resourceRequest, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter resource description"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 -mx-4 -mb-5 rounded-b-lg">
                                <button
                                    type="submit"
                                    className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    Submit Request
                                    <SendIcon size={14} />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section >
        </>
    );
};

export default TaskDetails;
