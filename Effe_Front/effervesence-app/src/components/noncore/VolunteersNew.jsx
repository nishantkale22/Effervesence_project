import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const Volunteers = ({ _id, department }) => {
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteers, setSelectedVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [taskDetails, setTaskDetails] = useState({ title: '', description: '' });
    const [resourceDetails, setResourceDetails] = useState({
        title: '',
        description: '',
        fileType: '',
        fileUrl: ''
    });
    const [error, setError] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [attachResource, setAttachResource] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVolunteers = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/${_id}/volunteers/${department}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setVolunteers(data.volunteers);
            } catch (err) {
                setError('Failed to fetch volunteers.');
                console.error(err);
            }
        };
        fetchVolunteers();

        // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
        // setVolunteers([
        //     {
        //         _id: 'dummy1',
        //         name: 'John Doe',
        //         email: 'randomemail.com',
        //         phone: '1234567890',
        //         department: 'hospitality',
        //         userType: 'attendee',
        //         role: 'student',
        //         createdAt: '2023-10-01T00:00:00Z',
        //         photo: 'https://via.placeholder.com/150'
        //     },
        //     {
        //         _id: 'dummy2',
        //         name: 'Jane Smith',
        //         email: 'randomemail2.com',
        //         phone: '0987654321',
        //         department: 'hospitality',
        //         userType: 'attendee',
        //         role: 'student',
        //         createdAt: '2023-10-01T00:00:00Z',
        //         photo: 'https://via.placeholder.com/150'
        //     },
        // ]);

    }, [_id, department]);

    const handleAssignTask = () => setIsAssigning(!isAssigning);

    const handleVolunteerSelect = (volunteerId) => {
        setSelectedVolunteers((prev) =>
            prev.includes(volunteerId) ? prev.filter((id) => id !== volunteerId) : [...prev, volunteerId]
        );
    };

    const handleVolunteerClick = async (volunteer) => {
        // Optionally fetch more details here if needed
        setSelectedVolunteer(volunteer);
    };

    const closeVolunteerModal = () => setSelectedVolunteer(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedVolunteers.length === 0) {
            alert('Please select at least one volunteer.');
            return;
        }

        const payload = {
            id: _id,
            task: { ...taskDetails },
            assignedTo: selectedVolunteers,
            resource: attachResource ? { ...resourceDetails } : {}
        };

        try {
            await axiosInstance.post('/task/assign', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            alert('Task and Resource assigned successfully!');
            setIsAssigning(false);
            setTaskDetails({ title: '', description: '' });
            setResourceDetails({ title: '', description: '', fileType: '', fileUrl: '' });

            setSelectedVolunteers([]);
            setAttachResource(false);
        } catch (error) {
            console.error('Failed to assign task and resource:', error);
        }
    };

    const handleFileUpload = async () => {
        if (!resourceDetails.selectedFile) {
            alert('Please select a file before uploading.');
            return;
        }

        const formData = new FormData();
        formData.append('file', resourceDetails.selectedFile);

        try {
            const { data } = await axiosInstance.post('/resource/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setResourceDetails({
                ...resourceDetails,
                fileUrl: data.fileUrl,
            });

            alert('File uploaded successfully!');
        } catch (error) {
            console.error('File upload error:', error);
            alert('Failed to upload the file.');
        }
    };

    return (
        <>
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{department}</h1>
                <button
                    onClick={() => setIsAssigning(!isAssigning)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${isAssigning
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isAssigning ? 'Cancel' : 'Assign Task'}
                </button>
            </div>

            {/* Volunteers Section */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-4 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Volunteers</h2>
                </div>

                <div className="px-4 py-5">
                    {error ? (
                        <p className="text-sm text-red-500">{error}</p>
                    ) : volunteers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {volunteers.map((volunteer) => (
                                <div
                                    key={volunteer._id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition"
                                    onClick={() => handleVolunteerClick(volunteer)}
                                >
                                    <div className="flex items-center p-4">
                                        <img
                                            src={volunteer.photo}
                                            alt={`${volunteer.name}'s profile`}
                                            className="w-10 h-10 border border-gray-400 shadow-md rounded-full mr-4"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-gray-900">{volunteer.name}</h3>
                                        </div>
                                        {isAssigning && (
                                            <div className="ml-4">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 border border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectedVolunteers.includes(volunteer._id)}
                                                    onChange={e => { e.stopPropagation(); handleVolunteerSelect(volunteer._id); }}
                                                    onClick={e => e.stopPropagation()}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No volunteers assigned.</p>
                    )}
                </div>
            </div>

            {/* Volunteer Details Modal */}
            {selectedVolunteer && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg border p-8 w-full max-w-md relative flex flex-col items-center">
                        <button
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-2xl font-bold transition"
                            onClick={closeVolunteerModal}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <img src={selectedVolunteer.photo} alt={selectedVolunteer.name} className="w-24 h-24 rounded-full border-2 border-gray-200 shadow mb-4 object-cover" />
                        <h2 className="text-2xl font-bold mb-1 text-gray-900">{selectedVolunteer.name}</h2>
                        <div className="text-sm text-gray-500 mb-4">{selectedVolunteer.role} &bull; {selectedVolunteer.department}</div>
                        <hr className="w-full mb-4 border-gray-200" />
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-gray-700"><span className="font-semibold">Email:</span> <span>{selectedVolunteer.email}</span></div>
                            <div className="flex justify-between text-gray-700"><span className="font-semibold">Phone:</span> <span>{selectedVolunteer.phone}</span></div>
                            <div className="flex justify-between text-gray-700"><span className="font-semibold">User Type:</span> <span>{selectedVolunteer.userType}</span></div>
                            <div className="flex justify-between text-gray-700"><span className="font-semibold">Joined:</span> <span>{selectedVolunteer.createdAt ? new Date(selectedVolunteer.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Assignment Form */}
            {isAssigning && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-4 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Task Assignment</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="px-4 py-5">
                        {/* Task Section */}
                        <div className="mb-6">
                            <h3 className="text-md font-medium text-gray-500 mb-4">Task Details</h3>

                            <div className="mb-4">
                                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-600 mb-1">
                                    Task Title
                                </label>
                                <input
                                    id="taskTitle"
                                    type="text"
                                    value={taskDetails.title}
                                    onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
                                    placeholder="Enter task title"
                                    className="block w-full rounded-md  border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-600 mb-1">
                                    Task Description
                                </label>
                                <textarea
                                    id="taskDescription"
                                    value={taskDetails.description}
                                    onChange={(e) => setTaskDetails({ ...taskDetails, description: e.target.value })}
                                    placeholder="Enter task description"
                                    rows="4"
                                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                                    required
                                />
                            </div>
                        </div>

                        {/* Resource Toggle Button */}
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setAttachResource(!attachResource)}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${attachResource
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                            >
                                {attachResource ? 'Remove Resource' : 'Attach Resource'}
                            </button>
                        </div>

                        {/* Resource Section */}
                        {attachResource && (
                            <div className="bg-gray-50 rounded-md p-4 mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-4">Resource Details</h3>

                                <div className="mb-4">
                                    <label htmlFor="resourceTitle" className="block text-sm font-medium text-gray-600 mb-1">
                                        Resource Title
                                    </label>
                                    <input
                                        id="resourceTitle"
                                        type="text"
                                        value={resourceDetails.title}
                                        onChange={(e) => setResourceDetails({ ...resourceDetails, title: e.target.value })}
                                        placeholder="Enter resource title"
                                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="resourceDescription" className="block text-sm font-medium text-gray-600 mb-1">
                                        Resource Description
                                    </label>
                                    <textarea
                                        id="resourceDescription"
                                        value={resourceDetails.description}
                                        onChange={(e) => setResourceDetails({ ...resourceDetails, description: e.target.value })}
                                        placeholder="Enter resource description"
                                        rows="3"
                                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="fileType" className="block text-sm font-medium text-gray-600 mb-1">
                                        File Type
                                    </label>
                                    <select
                                        id="fileType"
                                        value={resourceDetails.fileType}
                                        onChange={(e) => setResourceDetails({ ...resourceDetails, fileType: e.target.value })}
                                        className="block w-full rounded-md border border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                        required
                                    >
                                        <option value="">Select File Type</option>
                                        <option value="image">Image</option>
                                        <option value="pdf">PDF</option>
                                        <option value="doc">Document</option>
                                        <option value="excel">Excel</option>
                                        <option value="csv">CSV</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="fileInput" className="block text-sm font-medium text-gray-600 mb-1">
                                        Upload File
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="file"
                                            id="fileInput"
                                            accept=".jpg,.jpeg,.png,.pdf,.doc,.xls,.xlsx,.csv"
                                            onChange={(e) => setResourceDetails({ ...resourceDetails, selectedFile: e.target.files[0] })}
                                            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={handleFileUpload}
                                            className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Upload
                                        </button>
                                    </div>

                                    {resourceDetails.fileUrl && (
                                        <div className="mt-2 text-sm text-blue-600">
                                            Uploaded file: <a href={resourceDetails.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">View File</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 -mx-4 -mb-5 rounded-b-lg">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Submit Task and Resource
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Volunteers;