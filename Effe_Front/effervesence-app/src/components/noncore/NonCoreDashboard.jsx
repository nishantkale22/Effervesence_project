import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom'; // Import NavLink for navigation
import axiosInstance from '../../api/axiosInstance'; 
import '../../styles/dashboard.css'; // Add CSS for styling

const NonCoreDashboard = () => {
    const { role, department, _id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/non_core/${role}/${department}/dashboard/${_id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setUser(data.user);
            } catch (err) {
                setError('Failed to fetch user data.');
                console.error(err); // For debugging
            }
        };

        fetchUserData();
    }, [role, department, _id]);

    const renderNavLinks = () => {
        // Conditional rendering of Volunteers and Executives links based on role
        return (
            <>
                {role !== 'volunteer' && (
                    <NavLink to=  {`/user/${_id}/${department}/volunteers`} activeClassName="active">
                        Volunteers
                    </NavLink>
                )}
                {role !== 'executive' && role !== 'volunteer' && (
                    <NavLink to={`/user/${_id}/${department}/executives`} activeClassName="active">
                        Executives
                    </NavLink>
                )}
            </>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <h2>{role.toUpperCase()} </h2>
                <h3 className="department-label">{department.toUpperCase()}</h3> {/* Display department */}
            </div>

            {/* Navbar with links to profile, tasks, and others */}
            <nav className="navbar">
                <NavLink to={`/user/profile/${_id}`} activeClassName="active">Profile</NavLink>
                <NavLink to={`/user/tasks/${_id}`} activeClassName="active">Tasks</NavLink>
                <NavLink to={`/user/notifications/${_id}`} activeClassName="active">Notifications</NavLink>
                {renderNavLinks()} {/* Render Volunteers/Executives links conditionally */}
            </nav>

            <div className="content">
                {error ? (
                    <p>{error}</p>
                ) : user ? (
                    <p>Welcome, {user.name}!</p> // Display welcome message
                ) : (
                    <p>Loading user data...</p>
                )}
            </div>
        </div>
    );
};

export default NonCoreDashboard;
