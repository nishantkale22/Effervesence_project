import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const Executives = ({ _id, department }) => {
    const [executives, setExecutives] = useState([]);
    const [selectedExecutives, setSelectedExecutives] = useState([]);
    const [error, setError] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [taskDetails, setTaskDetails] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExecutives = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/${_id}/executives/${department}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setExecutives(data.executives);
            } catch (err) {
                setError('Failed to fetch executives.');
                console.error(err);
            }
        };

        fetchExecutives();

        // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
        // setExecutives([
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
        //     }
        // ]);
    }, [_id, department]);

    const handleAssignTask = () => {
        setIsAssigning(!isAssigning);
    };

    const handleExecutiveSelect = (volunteerId) => {
        setSelectedExecutives((prevSelected) => {
            if (prevSelected.includes(volunteerId)) {
                return prevSelected.filter(id => id !== volunteerId);
            } else {
                return [...prevSelected, volunteerId];
            }
        });
    };

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        console.log('Assigning task:', taskDetails, 'to executives:', selectedExecutives);
        setIsAssigning(false);
        setSelectedExecutives([]);
        setTaskDetails('');
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{department}</h1>
                <button
                    onClick={handleAssignTask}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${isAssigning
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isAssigning ? 'Cancel' : 'Assign Task'}
                </button>
            </div>

            {/* Executives Section */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-4 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Executives</h2>
                </div>

                <div className="px-4 py-5">
                    {error ? (
                        <p className="text-sm text-red-500">{error}</p>
                    ) : executives.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {executives.map((volunteer) => (
                                <div key={volunteer._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="flex items-center p-4">
                                        <img
                                            src={volunteer.photo}
                                            alt={`${volunteer.name}'s profile`}
                                            className="w-10 h-10 rounded-full mr-4 border border-gray-400 shadow-md"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">{volunteer.name}</h3>
                                            <div className="mt-1">
                                                <p className="text-xs text-gray-500">{volunteer.email}</p>
                                                <p className="text-xs text-gray-500">{volunteer.phone}</p>
                                            </div>
                                        </div>
                                        {isAssigning && (
                                            <div className="ml-4">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectedExecutives.includes(volunteer._id)}
                                                    onChange={() => handleExecutiveSelect(volunteer._id)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No executives assigned.</p>
                    )}
                </div>
            </div>

            {/* Task Assignment Form */}
            {isAssigning && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-4 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Task Assignment</h2>
                    </div>

                    <form onSubmit={handleTaskSubmit} className="px-4 py-5">
                        <div className="mb-4">
                            <label htmlFor="taskDetails" className="block text-sm font-medium text-gray-600 mb-1">
                                Task Details
                            </label>
                            <textarea
                                id="taskDetails"
                                value={taskDetails}
                                onChange={(e) => setTaskDetails(e.target.value)}
                                placeholder="Enter task details..."
                                rows="4"
                                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="px-4 py-3 bg-gray-10 text-right sm:px-6 -mx-4 -mb-5 rounded-b-lg">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Submit Task
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Executives;