import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; 
import '../styles/allocations.css';

const Allocations = () => {
    const { _id } = useParams();
    const [allocations, setAllocations] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllocations = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/allocations/${_id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setAllocations(data.Tasks);
            } catch (err) {
                setError('Failed to fetch allocations.');
                console.error(err);
            }
        };

        fetchAllocations();
    }, [_id]);

    const handleAllocationDetails = (allocationId) => {
        navigate(`/user/allocationdetails/${allocationId}`);
    };

    const handleDeleteAllocation = async (allocationId) => {
        try {
            await axiosInstance.delete(
                `/user/allocations/${allocationId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );
            setAllocations((prev) => prev.filter((allocation) => allocation._id !== allocationId));
        } catch (err) {
            setError('Failed to delete allocation.');
            console.error(err);
        }
    };

    const handleMarkAsComplete = async (allocationId) => {
        try {
            await axiosInstance.post(
                `/user/allocations/status/${allocationId}`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );
            // Update the state to mark the allocation as complete
            setAllocations((prev) =>
                prev.map((allocation) =>
                    allocation._id === allocationId
                        ? { ...allocation, taskStatus: 'complete' }
                        : allocation
                )
            );
        } catch (err) {
            setError('Failed to mark allocation as complete.');
            console.error(err);
        }
    };

    return (
        <div className="tasks-container">
            <h2>Your Allocations</h2>

            {error ? (
                <p>{error}</p>
            ) : allocations.length > 0 ? (
                allocations.map((allocation) => (
                    <div key={allocation._id} className="task-card">
                        <h3>{allocation.title}</h3>
                        <p>{allocation.description}</p>
                        <button
                            onClick={() => handleAllocationDetails(allocation._id)}
                            className="details-button"
                        >
                            View Details
                        </button>

                        <button
                            onClick={() => handleDeleteAllocation(allocation._id)}
                            className="details-button"
                        >
                            Delete
                        </button>

                        <button
                            onClick={() => handleMarkAsComplete(allocation._id)}
                            className="details-button"
                            disabled={allocation.taskStatus === 'complete'}
                        >
                            {allocation.taskStatus === 'complete' ? 'Marked Completed' : 'Mark As Complete'}
                        </button>
                    </div>
                ))
            ) : (
                <p>No allocations assigned.</p>
            )}
        </div>
    );
};

export default Allocations;
