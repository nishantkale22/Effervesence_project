// src/components/noncore/NonCoreDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../api/axiosInstance';
import { io } from 'socket.io-client';
import CreateEventForm from '../CreateEventForm';

const NonCoreDashboard = () => {
  const { role, department, _id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.emit('joinRoom', _id);

    const fetchUserData = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/user/non_core/${role}/${department}/dashboard/${_id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
        );
        setUser(data.user);
      } catch (err) {
        setError('Failed to fetch user data.');
      }
    };

    const fetchUnreadNotifications = async () => {
      try {
        const { data } = await axiosInstance.get(`/user/notifications/${_id}`);
        setUnreadCount(data.unreadNotifications.length);
      } catch (err) {
        console.error('Failed to fetch unread notifications:', err);
      }
    };

    fetchUserData();
    fetchUnreadNotifications();

    socket.on('unreadCount', () => {
      setUnreadCount(prev => prev + 1);
    });

    socket.on('eventCreated', (event) => {
      setEvents(prev => [event, ...prev]);
    });

    // ✅ NEW: Listen for actual notification message
    socket.on('receiveNotification', (notif) => {
      console.log('🔔 New Notification:', notif.message); // You can replace this with toast/pop-up
    });


    return () => socket.disconnect();
  }, [role, department, _id]);

  const fetchEvents = async () => {
    try {
      const { data } = await axiosInstance.get('/event/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setEvents(data.events);
      setShowEvents(true);
    } catch (err) {
      setError('Failed to fetch events.');
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      localStorage.removeItem('accessToken');
      navigate('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  const renderNavLinks = () => (
    <>
      {role !== 'volunteer' && (
        <>
          <NavLink to={`/user/${_id}/${department}/volunteers`} className={({ isActive }) => isActive ? 'active' : ''}>Volunteers</NavLink>
          <NavLink to={`/user/allocations/${_id}`} className={({ isActive }) => isActive ? 'active' : ''}>Allocations</NavLink>
        </>
      )}
      {role !== 'executive' && role !== 'volunteer' && (
        <NavLink to={`/user/${_id}/${department}/executives`} className={({ isActive }) => isActive ? 'active' : ''}>Executives</NavLink>
      )}
      <button
        onClick={fetchEvents}
        className="text-white underline hover:text-pink-500 ml-4"
      >
        Events
      </button>
      <button
        onClick={() => setShowForm(true)}
        className="text-white underline hover:text-pink-500 ml-4"
      >
        Create Event
      </button>
    </>
  );

  const renderEvents = () => (
    <div className="mt-6 space-y-4">
      {events.map(event => (
        <div key={event._id} className="p-4 bg-white/10 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-pink-400">{event.title}</h3>
          <p>{event.description}</p>
          <p><strong>Scheduled:</strong> {event.scheduledDate} | {event.startTime} - {event.endTime}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Registered Users:</strong> {event.registeredUsers.map(user => user.name).join(', ')}</p>
          <p><strong>Visible to Public:</strong> {event.display ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col">
      <header className="p-6 flex flex-col md:flex-row justify-between items-center bg-white/10 shadow-md backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold uppercase">{role}</h2>
          <h3 className="text-sm text-white/70 uppercase">{department}</h3>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <NavLink to={`/user/notifications/${_id}`} className="relative">
            <FontAwesomeIcon icon={faBell} className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-full text-white font-bold shadow-md transition"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap justify-center gap-6 py-4 bg-white/5 shadow-inner text-lg font-medium">
        <NavLink to={`/user/profile/${_id}`} className={({ isActive }) => isActive ? 'text-pink-400 underline' : ''}>Profile</NavLink>
        <NavLink to={`/user/tasks/${_id}`} className={({ isActive }) => isActive ? 'text-pink-400 underline' : ''}>Tasks</NavLink>
        {renderNavLinks()}
      </nav>

      <main className="flex-grow p-6">
        {error ? (
          <p className="text-red-400 text-center font-medium">{error}</p>
        ) : showForm ? (
          <CreateEventForm userId={_id} onClose={() => setShowForm(false)} />
        ) : showEvents ? (
          renderEvents()
        ) : user ? (
          <div className="text-center text-xl font-semibold mt-4">Welcome, {user.name}!</div>
        ) : (
          <div className="text-center text-gray-400 animate-pulse">Loading user data...</div>
        )}
      </main>
    </div>
  );
};

export default NonCoreDashboard;
