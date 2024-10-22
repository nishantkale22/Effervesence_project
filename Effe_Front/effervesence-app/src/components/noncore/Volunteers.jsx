import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useNavigate for navigation
import axiosInstance from '../../api/axiosInstance'; 
import '../../styles/volunteers.css'; // Add CSS for styling

const Volunteers = () => {
    const { _id, department } = useParams();
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteers, setSelectedVolunteers] = useState([]);
    const [error, setError] = useState('');
    const [isAssigning, setIsAssigning] = useState(false); // Track if Assign Task is clicked
    const [taskDetails, setTaskDetails] = useState(''); // Store task details for assignment
    const navigate = useNavigate(); // For programmatic navigation

    useEffect(() => {
        const fetchVolunteers = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/${_id}/volunteers/${department}`,
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

    const handleAssignTask = () => {
        setIsAssigning(!isAssigning); // Toggle assigning state
    };

    const handleVolunteerSelect = (volunteerId) => {
        setSelectedVolunteers((prevSelected) => {
            if (prevSelected.includes(volunteerId)) {
                return prevSelected.filter(id => id !== volunteerId); // Remove if already selected
            } else {
                return [...prevSelected, volunteerId]; // Add if not selected
            }
        });
    };

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        // Logic to assign the task to the selected volunteers
        console.log('Assigning task:', taskDetails, 'to volunteers:', selectedVolunteers);
        // Here you can call an API to assign tasks and reset the state afterward
        setIsAssigning(false); // Close the assigning state
        setSelectedVolunteers([]); // Reset selected volunteers
        setTaskDetails(''); // Reset task details
    };

    return (
        <div className="volunteers-container">
            <div className="header">
                <h1>{department}</h1>
                <button onClick={handleAssignTask} className={`assign-task-button ${isAssigning ? 'active' : ''}`}>
                    {isAssigning ? 'Cancel' : 'Assign Task'}
                </button>
            </div>

            <h2>Volunteers</h2>

            {error ? (
                <p className="error-message">{error}</p>
            ) : volunteers.length > 0 ? (
                volunteers.map((volunteer) => (
                    <div key={volunteer._id} className="volunteer-card">
                        <img 
                            src={volunteer.photo} 
                            alt={`${volunteer.name}'s profile`} 
                            className="volunteer-photo" 
                        />
                        <h3>{volunteer.name}</h3>
                        <div className="volunteer-details">
                            <p>{volunteer.email}</p>
                            <p>{volunteer.phone}</p>
                        </div>
                        {isAssigning && (
                            <input 
                                type="checkbox" 
                                checked={selectedVolunteers.includes(volunteer._id)} 
                                onChange={() => handleVolunteerSelect(volunteer._id)} 
                            />
                        )}
                    </div>
                ))
            ) : (
                <p>No volunteers assigned.</p>
            )}

            {isAssigning && (
                <form onSubmit={handleTaskSubmit} className="task-assignment-form">
                    <h3>Assign Task to Selected Volunteers</h3>
                    <textarea 
                        value={taskDetails} 
                        onChange={(e) => setTaskDetails(e.target.value)} 
                        placeholder="Enter task details..." 
                        required
                    />
                    <button type="submit">Submit Tasks</button>
                </form>
            )}
        </div>
    );
};

export default Volunteers;
