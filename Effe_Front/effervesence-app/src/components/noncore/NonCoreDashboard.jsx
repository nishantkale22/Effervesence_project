import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons'; // Import bell icon
import axiosInstance from '../../api/axiosInstance';
import '../../styles/dashboard.css';

const NonCoreDashboard = () => {
    const { role, department, _id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [unreadCount, setUnreadCount] = useState(0); // For unread notifications count
    const navigate = useNavigate();

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
                console.error(err);
            }
        };

        // Fetch unread notifications count
        const fetchUnreadNotifications = async () => {
            try {
                const { data } = await axiosInstance.get(`/user/notifications/${_id}`);
              
                setUnreadCount(data.unreadNotifications.length); // Set the unread notifications count
            } catch (err) {
                console.error('Failed to fetch unread notifications count:', err);
            }
        };
        

        fetchUserData();
        fetchUnreadNotifications(); // Call to get unread notifications count
    }, [role, department, _id]);

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/auth/logout', {}, { 
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });

            localStorage.removeItem('accessToken');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
            setError('Logout failed. Please try again.');
        }
    };

    const renderNavLinks = () => (
        <>
            {role !== 'volunteer' && (
                <>
                    <NavLink to={`/user/${_id}/${department}/volunteers`} activeClassName="active">
                        Volunteers
                    </NavLink>
                    <NavLink to={`/user/allocations/${_id}`} activeClassName="active">
                        Allocations
                    </NavLink>
                </>
            )}
            {role !== 'executive' && role !== 'volunteer' && (
                <NavLink to={`/user/${_id}/${department}/executives`} activeClassName="active">
                    Executives
                </NavLink>
            )}
        </>
    );

    return (
        <div className="dashboard-container">
            <div className="header">
                <h2>{role.toUpperCase()}</h2>
                <h3 className="department-label">{department.toUpperCase()}</h3>
            </div>

            <nav className="navbar">
                <NavLink to={`/user/profile/${_id}`} activeClassName="active">Profile</NavLink>
                <NavLink to={`/user/tasks/${_id}`} activeClassName="active">Tasks</NavLink>

                {/* Bell icon with unread notification count */}
                <NavLink to={`/user/notifications/${_id}`} activeClassName="active">
                    <div className="notification-icon">
                        <FontAwesomeIcon icon={faBell} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </div>
                </NavLink>

                {renderNavLinks()}
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </nav>

            <div className="content">
                {error ? (
                    <p>{error}</p>
                ) : user ? (
                    <p>Welcome, {user.name}!</p>
                ) : (
                    <p>Loading user data...</p>
                )}
            </div>
        </div>
    );
};

export default NonCoreDashboard;
