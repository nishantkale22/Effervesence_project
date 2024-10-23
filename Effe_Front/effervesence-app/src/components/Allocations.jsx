import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate for navigation
import axiosInstance from '../api/axiosInstance'; 
import '../styles/tasks.css'; // Update the CSS file if necessary

const Allocations = () => {
    const { _id } = useParams(); // Extract user ID from route parameters
    const [allocations, setAllocations] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // For programmatic navigation

    useEffect(() => {
        const fetchAllocations = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/allocations/${_id}`, // Update the endpoint to /user/allocations
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setAllocations(data.Tasks); // Set the fetched allocations
            } catch (err) {
                setError('Failed to fetch allocations.');
                console.error(err); // For debugging
            }
        };

        fetchAllocations();
    }, [_id]);

    // Function to handle navigation to allocation details page
    const handleAllocationDetails = (allocationId) => {
        navigate(`/user/allocationdetails/${allocationId}`); // Update the navigation path
    };

    return (
        <div className="tasks-container">
            <h2>Your Allocations</h2>

            {error ? (
                <p>{error}</p>
            ) : allocations.length > 0 ? (
                allocations.map((allocation) => (
                    <div key={allocation._id} className="task-card"> {/* Change class name if needed */}
                        <h3>{allocation.title}</h3> {/* Assuming allocation has a title */}
                        <p>{allocation.description}</p> {/* Assuming allocation has a description */}
                        <button 
                            onClick={() => handleAllocationDetails(allocation._id)} 
                            className="details-button"
                        >
                            View Details
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
