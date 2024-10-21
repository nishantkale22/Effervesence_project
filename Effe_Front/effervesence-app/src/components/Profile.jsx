import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Get user ID from params
import axiosInstance from '../api/axiosInstance'; // Import axios instance
import '../styles/profile.css'; // Import the CSS

const Profile = () => {
    const { _id } = useParams(); // Get user ID from params
    const [user, setUser] = useState(null);
    const [error, setError] = useState(''); // Ensure setError is defined

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data } = await axiosInstance.get(`/user/profile/${_id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                });
                setUser(data.user);
            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error(err); // For debugging
            }
        };

        fetchUserProfile();
    }, [_id]);

    return (
        <div className="profile-container">
            <h2 className="profile-header">Welcome, {user ? user.name : 'Loading...'}!</h2>
            <div className="profile-card">
                {user && user.photo && (
                    <img
                        src={user.photo}
                        alt={`${user.name}'s profile`}
                        className="profile-photo"
                    />
                )}
                <div className="profile-details">
                    {error ? (
                        <p>{error}</p>
                    ) : user ? (
                        <>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Phone:</strong> {user.phone}</p>
                            <p><strong>Department:</strong> {user.department}</p>
                            <p><strong>User Type:</strong> {user.userType}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Joined On:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                        </>
                    ) : (
                        <p>Loading profile data...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
