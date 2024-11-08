import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../api/axiosInstance';
import '../styles/notifications.css';
import { io } from 'socket.io-client';

const Notifications = () => {
    const { _id } = useParams();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const socket = io('http://localhost:5000', { transports: ['websocket'] });

        const fetchNotifications = async () => {
            try {
                const { data } = await axiosInstance.get(`/user/notifications/${_id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                });
                setNotifications(data.allNotifications);
            } catch (err) {
                setError('Failed to fetch notifications.');
                console.error(err);
            }
        };

        fetchNotifications();

        socket.on('receiveNotification', (newNotification) => {
            setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
        });

        return () => {
            socket.disconnect();
        };
    }, [_id]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axiosInstance.patch(`/user/notifications/${notificationId}/markAsRead`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            setNotifications((prev) =>
                prev.map((notif) => notif._id === notificationId ? { ...notif, read: true } : notif)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await axiosInstance.delete(`/user/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    return (
        <div className="notifications-container">
            <h2>Notifications</h2>
            {error ? (
                <p className="error-message">{error}</p>
            ) : notifications.length > 0 ? (
                <div className="notification-list">
                    {notifications.map((notif) => (
                        <div key={notif._id} className={`notification-card ${notif.read ? 'read' : 'unread'}`}>
                            <p className="notification-message">{notif.message}</p>
                            <div className="notification-actions">
                                <button
                                    className="mark-as-read-btn"
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    disabled={notif.read}
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    {notif.read ? 'Read' : 'Mark as Read'}
                                </button>
                                <button className="delete-btn" onClick={() => handleDeleteNotification(notif._id)}>
                                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                                </button>
                            </div>
                            <p className="notification-time">
                                {new Date(notif.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-notifications">You have no notifications.</p>
            )}
        </div>
    );
};

export default Notifications;
