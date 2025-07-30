import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { CheckIcon, Trash } from 'lucide-react';
import { io } from 'socket.io-client';

const Notifications = ({ _id }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const socket = io('http://localhost:5000', { transports: ['websocket'] });
        socket.emit('joinRoom', _id);

        const fetchNotifications = async () => {
            try {
                const { data } = await axiosInstance.get(`/user/notifications/${_id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                });
                setNotifications(data.allNotifications);
                setUnreadCount(data.unreadNotifications.length);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch notifications.');
            }
        };

        fetchNotifications();

        // 🔔 New notification
        socket.on('receiveNotification', (newNotification) => {
            setNotifications((prev) => [newNotification, ...prev]);
            // setUnreadCount((prev) => prev + 1);
        });

        // 🔁 Real-time count sync
        socket.on('unreadCount', (count) => {
            setUnreadCount(count);
        });

        return () => socket.disconnect();
    }, [_id]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axiosInstance.patch(`/user/notifications/${notificationId}/markAsRead`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });

            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
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
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    return (
        <div>
            <div className="text-sm text-right text-indigo-600 font-semibold mb-4">
                Unread Notifications: {unreadCount}
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {notifications.length > 0 ? (
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`p-3 rounded border shadow ${notif.read ? 'bg-gray-100' : 'bg-white border-l-4 border-blue-500'}`}
                        >
                            <div className="flex justify-between">
                                <p className={`${notif.read ? 'text-gray-600' : 'text-black font-medium'}`}>
                                    {notif.message}
                                </p>
                                <span className="text-xs text-gray-400 ml-3">
                                    {new Date(notif.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-end mt-2 space-x-2">
                                <button
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    disabled={notif.read}
                                    className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 ${notif.read
                                        ? 'bg-green-100 text-green-800 cursor-default'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        }`}
                                >
                                    <CheckIcon size={14} />
                                    {notif.read ? 'Read' : 'Mark as Read'}
                                </button>
                                <button
                                    onClick={() => handleDeleteNotification(notif._id)}
                                    className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                                >
                                    <Trash size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    No notifications yet.
                </div>
            )}
        </div>
    );
};

export default Notifications;
