import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom'; // Import NavLink for navigation
import axiosInstance from '../../api/axiosInstance'; 
import '../../styles/dashboard.css'; // Add CSS for styling

const AttendeeDashboard = () => {
    const { role, department, _id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) throw new Error('No access token found');
    
                const { data } = await axiosInstance.get(
                    `/user/attendee/${role}/${department}/dashboard/${_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
    
                if (data.user) setUser(data.user);
                else throw new Error('User not found');
            } catch (err) {
                setError('Failed to fetch user data.');
                console.error('Error:', err.response || err.message);
            }
        };
    
        fetchUserData();
    }, [_id,  role, department]);

    return (
        <div className="dashboard-container">
            <h2>{role.toUpperCase()}</h2>

            {/* Navbar with links to profile and tasks */}
            <nav className="navbar">
                <NavLink to={`/user/profile/${_id}`} activeClassName="active">Profile</NavLink>
                {/* <NavLink to={`/user/tasks/${_id}`} activeClassName="active">Tasks</NavLink> */}
                <NavLink to={`/user/notifications/${_id}`} activeClassName="active">Notifications</NavLink>
            </nav>

            <div className="content">
                {error ? (
                    <p>{error}</p>
                ) : user ? (
                    <p>Welcome, {user.name.toUpperCase()}!</p>
                ) : (
                    <p>Loading user data...</p>
                )}
            </div>
        </div>
    );
};

export default AttendeeDashboard;
