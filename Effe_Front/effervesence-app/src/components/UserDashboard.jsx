import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; 
import { useParams } from 'react-router-dom';

const UserDashboard = () => {
    const { userType, role, department, _id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const {data} = await axiosInstance.get(`/user/${userType}/${role}/${department}/dashboard/${_id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                });
                setUser(data.user);
            } catch (err) {
                setError('Failed to fetch user data.');
                console.error(err); // Log the error for debugging
            }
        };

        fetchUserData();
    }, [userType, role, department, _id]);

    return (
        <div>
            {/* <h1>{`${_id}`}</h1> */}
                {/* <h1>{`${localStorage.getItem('accessToken')}`}</h1> */}

            <h2>{role} Dashboard</h2>
            {error ? (
                <p>{error}</p>
            ) : user ? (
                <UserDetails user={user} />
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

const UserDetails = ({ user }) => (
    <div>
        <h3>Welcome, {user.name}!</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Department:</strong> {user.department}</p>
        <p><strong>User Type:</strong> {user.userType}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>

        {user.photo && <img src={user.photo} alt={`${user.name}'s profile`} style={{ width: '150px', height: '150px' }} />}

        {user.eventsRegistered?.length > 0 && (
            <UserList title="Registered Events" items={user.eventsRegistered} />
        )}
        
        {user.feedback?.length > 0 && (
            <UserList title="Feedback" items={user.feedback} />
        )}

        {user.demands?.length > 0 && (
            <UserList title="Demands" items={user.demands} />
        )}
    </div>
);

const UserList = ({ title, items }) => (
    <div>
        <h4>{title}:</h4>
        <ul>
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </div>
);

export default UserDashboard;
