import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useNavigate for navigation
import axiosInstance from '../../api/axiosInstance'; 
import '../../styles/executives.css'; // Add CSS for styling

const Executives = () => {
    const { department } = useParams(); // Fetch department from route params

    const [executives, setExecutives] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // For programmatic navigation

    useEffect(() => {
        const fetchExecutives = async () => {
            try {

                const { data } = await axiosInstance.get(
                    `/user/executives/${department}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setExecutives(data.executives); // Adjusted to use data.executives
            } catch (err) {
                setError('Failed to fetch executives.');
                console.error(err); // For debugging
            }
        };

        fetchExecutives();
    }, []); // Added department as dependency

    const handleAssignTask = (executiveId) => {
        console.log(`Assigning task to executive ID: ${executiveId}`);
        // Implement task assignment logic here
    };

    return (
        <div className="executives-container">
            <h1>{department}</h1>
            <h2>Executives</h2>

            {error ? (
                <p className="error-message">{error}</p>
            ) : executives.length > 0 ? (
                executives.map((executive) => (
                    <div key={executive._id} className="executives-card">
                        <img src={executive.photo} alt={`${executive.name}'s profile`} className="executives-photo" />
                        <h3>{executive.name}</h3>
                        <div className="executives-details">
                            <p>{executive.email}</p>
                            <p>{executive.phone}</p>
                        </div>
                        <button onClick={() => handleAssignTask(executive._id)} className="assign-button">
                            Assign Task
                        </button>
                    </div>
                ))
            ) : (
                <p>No executives assigned.</p>
            )}
        </div>
    );
};

export default Executives;
