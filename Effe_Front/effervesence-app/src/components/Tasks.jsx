import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate for navigation
import axiosInstance from '../api/axiosInstance'; 
import '../styles/tasks.css'; // Add CSS for styling

const Tasks = () => {
    const { _id } = useParams(); // Extract user ID from route parameters
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // For programmatic navigation

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/tasks/${_id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setTasks(data.tasks); // Set the fetched tasks
            } catch (err) {
                setError('Failed to fetch tasks.');
                console.error(err); // For debugging
            }
        };

        fetchTasks();
    }, [_id]);

    // Function to handle navigation to task details page
    const handleTaskDetails = (taskId) => {
        navigate(`/user/taskdetails/${taskId}`);
    };

    return (
        <div className="tasks-container">
            <h2>Your Tasks</h2>

            {error ? (
                <p>{error}</p>
            ) : tasks.length > 0 ? (
                tasks.map((task) => (
                    <div key={task._id} className="task-card">
                        <h3>{task.title}</h3> {/* Assuming task has a title */}
                        <p>{task.description}</p> {/* Assuming task has a description */}
                        <button 
                            onClick={() => handleTaskDetails(task._id)} 
                            className="details-button"
                        >
                            View Details
                        </button>
                    </div>
                ))
            ) : (
                <p>No tasks assigned.</p>
            )}
        </div>
    );
};

export default Tasks;
