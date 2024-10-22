import React, { useEffect, useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom'; // useNavigate for navigation
import axiosInstance from '../../api/axiosInstance'; 
import '../../styles/volunteers.css'; // Add CSS for styling

const Volunteers = () => {
    const { department } = useParams();

    const [volunteers, setVolunteers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // For programmatic navigation

    useEffect(() => {
        const fetchVolunteers = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/volunteers/${department}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setVolunteers(data.volunteers); // Adjusted to use data.volunteers
            } catch (err) {
                setError('Failed to fetch volunteers.');
                console.error(err); // For debugging
            }
        };

        fetchVolunteers();
    }, []); // Added empty dependency array

    const handleAssignTask = (volunteerId) => {
        // Logic to assign a task to the volunteer
        console.log(`Assigning task to volunteer ID: ${volunteerId}`);
        // Here you can navigate to another page or call an API
    };

    return (
        

        <div className="volunteers-container">
            <h1>{department}</h1>
            <h2>Volunteers</h2>

            {error ? (
                <p className="error-message">{error}</p>
            ) : volunteers.length > 0 ? (
                volunteers.map((volunteer) => (
                    <div key={volunteer._id} className="volunteer-card">
                        <img src={volunteer.photo} alt={`${volunteer.name}'s profile`} className="volunteer-photo" />
                        <h3>{volunteer.name}</h3>
                        <div className="volunteer-details">
                         
                            <p>{volunteer.email}</p>
                            <p>{volunteer.phone}</p>
                            
                        </div>
                        <button onClick={() => handleAssignTask(volunteer._id)} className="assign-button">
                            Assign Task
                        </button>
                    </div>
                ))
            ) : (
                <p>No volunteers assigned.</p>
            )}
        </div>
    );
};

export default Volunteers;
