import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { io } from 'socket.io-client';
import { Bell, User, CheckSquare, Menu, X, LogOut, Users, Clipboard, CalendarDays, CalendarPlus } from 'lucide-react';
import Volunteers from './VolunteersNew';
import Executives from './ExecutivesNew';
import Allocations from '../AllocationsNew';
import Tasks from '../TasksNew';
import Notifications from '../NotificationsNew';
import CreateEventForm from '../CreateEventForm';
import MeetingList from '../MeetingList';
import ScheduleMeeting from '../ScheduleMeeting';
import MeetingPopup from '../MeetingPopup';
import Button from '../ui/Button';
import DepartmentChat from '../DepartmentChat';
import MerchManager from '../MerchManager';
import AnnouncementsManager from '../AnnouncementsManager';
import ScheduleManager from '../ScheduleManager';
import MediaManager from '../MediaManager';

const NonCoreDashboard = () => {
    const { role, department, _id } = useParams();
    const [user, setUser] = useState();
    const [error, setError] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [events, setEvents] = useState([]);
    const [showEvents, setShowEvents] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    const [chatUnread, setChatUnread] = useState(0);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPage, setShowPage] = useState('tasks');
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [refreshMeetings, setRefreshMeetings] = useState(false);


    // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
    // useEffect(() => {
    //     // Simulating data fetch
    //     setUser({
    //         name: 'Tanmay Makode',
    //         email: 'randomemail@gmail.com',
    //         phone: '1234567890',
    //         department: 'hospitality',
    //         userType: 'non_core',
    //         role: 'volunteer',
    //         createdAt: '2023-10-01T00:00:00Z',
    //         photo: '/api/placeholder/150/150'
    //     });
    // }, []);


    useEffect(() => {
        const socket = io('http://localhost:5000', { transports: ['websocket'] });
        socket.emit('joinRoom', _id);  // Join the user-specific room

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

        const fetchUnreadNotifications = async () => {
            try {
                const { data } = await axiosInstance.get(`/user/notifications/${_id}`);
                setUnreadCount(data.unreadNotifications.length);
            } catch (err) {
                console.error('Failed to fetch unread notifications count:', err);
            }
        };

        fetchUserData();
        fetchUnreadNotifications();

        // socket.on('notificationDeleted', ({ notificationId }) => {
        //     setShowNotificationPopup(prev => prev.filter(n => n._id !== notificationId));
        // });

        socket.on('unreadCount', (count) => {
            setUnreadCount(count);
        });

        socket.on('eventCreated', (event) => {
            setEvents(prev => [event, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, [role, department, _id]);

    useEffect(() => {
        const socket = io('http://localhost:5000', { withCredentials: true });
        socket.emit('joinDepartment', department);
        socket.on('departmentChatUnread', (count) => setChatUnread(count));
        return () => socket.disconnect();
    }, [department]);

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
            console.error('Logout failed:', err);
            setError('Logout failed. Please try again.');
        }
    };

    const renderNavLinks = () => (
        <>
            {role !== 'volunteer' && (
                <>
                    <button onClick={() => setShowPage('volunteers')} className="flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                        <Users size={20} className="mr-3" />
                        <span>Volunteers</span>
                    </button>
                    <button onClick={() => setShowPage('allocations')} className="flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                        <Clipboard size={20} className="mr-3" />
                        <span>Allocations</span>
                    </button>
                </>
            )}
            {role !== 'executive' && role !== 'volunteer' && (
                <button onClick={() => setShowPage('executives')} className="flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                    <Users size={20} className="mr-3" />
                    <span>Executives</span>
                </button>
            )}
            {user && user.role !== 'volunteer' && (
                <>
                    <button onClick={() => setShowPage('merch')} className={`flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white ${showPage === 'merch' ? 'bg-gray-800 text-white' : ''}`}>
                        <span className="mr-3">🛍️</span>
                        <span>Merchandise</span>
                    </button>
                    <button onClick={() => setShowPage('announcements')} className={`flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white ${showPage === 'announcements' ? 'bg-gray-800 text-white' : ''}`}>
                        <span className="mr-3">📢</span>
                        <span>Announcements</span>
                    </button>
                    <button onClick={() => setShowPage('schedule')} className={`flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white ${showPage === 'schedule' ? 'bg-gray-800 text-white' : ''}`}>
                        <span className="mr-3">📅</span>
                        <span>Schedule</span>
                    </button>
                    <button onClick={() => setShowPage('media')} className={`flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white ${showPage === 'media' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                        <span className="mr-3">🖼️</span>
                        <span>Media</span>
                    </button>
                </>
            )}


            <button
                onClick={() => { setShowPage('events'); fetchEvents() }}
                className="flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white"
            >
                <CalendarDays nderDays size={20} className="mr-3" />
                <span>Events</span>
            </button>
            <button
                onClick={() => { setShowForm(true); setShowPage('events_form'); }}
                className="flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white"
            >
                <CalendarPlus size={20} className="mr-3" />
                <span>Create Event</span>
            </button>
            <button onClick={() => setShowPage('meetings')} className={`flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white ${showPage === 'meetings' ? 'bg-gray-800 text-white' : ''}`}>
                <CalendarPlus size={20} className="mr-3" />
                <span>Meetings</span>
            </button>
            <button onClick={() => setShowPage('chat')} className={`flex w-full items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white ${showPage === 'chat' ? 'bg-gray-800 text-white' : ''}`}>
                <span className="mr-3">💬</span>
                <span>Department Chat</span>
                {chatUnread > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-600 rounded-full">{chatUnread}</span>
                )}
            </button>
        </>
    );
    const renderEvents = () => (
        <>
            {events.length === 0 ? (
                <div className="mt-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-700">No Events Found</h2>
                    <p className="mt-2 text-gray-500">There are currently no events scheduled.</p>
                    <button
                        onClick={() => { setShowForm(true); setShowPage('events_form'); }}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Create Event
                    </button>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {events.map(event => (
                        <div key={event._id} className="p-4 bg-white rounded-lg shadow-md">
                            <h3 className="text-lg font-bold text-pink-400">{event.title}</h3>
                            <p>{event.description}</p>
                            <p><strong>Scheduled:</strong> {event.scheduledDate} | {event.startTime} - {event.endTime}</p>
                            <p><strong>Location:</strong> {event.location}</p>
                            <p><strong>Created By:</strong> {event.createdBy?.name || 'Unknown'}</p>
                            <p><strong>Registered Users:</strong> {event.registeredUsers.map(user => user.name).join(', ')}</p>
                            <p><strong>Visible to Public:</strong> {event.display ? 'Yes' : 'No'}</p>

                            {/* ✅ NEW BUTTON HERE */}
                            <button
                                onClick={() => navigate(`/event/${event._id}`)}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                More Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );



    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p className="mt-2 text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
                    <div className="w-16 h-16 mt-4 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Desktop */}
            <div className="hidden md:flex md:flex-col md:w-64 bg-gray-900 text-white">
                <div className="flex items-center justify-center h-20 border-b border-gray-800">
                    <div className="text-center">
                        <h1 className="text-xl font-bold">Event Dashboard</h1>
                        <p className="text-sm text-gray-400 capitalize">{department} Department</p>
                    </div>
                </div>
                <div className="flex flex-col flex-1 overflow-y-auto">
                    <nav className="px-2 py-4">
                        <div className="mb-8">
                            <div className="flex items-center px-4 py-2">
                                <div className="relative">
                                    <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>
                        <a href={`/user/profile/${_id}`} className="flex items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                            <User size={20} className="mr-3" />
                            <span>Profile</span>
                        </a>
                        <a onClick={() => setShowPage('tasks')} className="cursor-pointer flex items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                            <CheckSquare size={20} className="mr-3" />
                            <span>Tasks</span>
                        </a>
                        {renderNavLinks()}
                        <div className="mt-8 pt-4 border-t border-gray-800">
                            <button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                                <LogOut size={20} className="mr-3" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={toggleMenu}></div>
                    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white">
                        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-800">
                            <div>
                                <h1 className="text-xl font-bold">Event Dashboard</h1>
                                <p className="text-sm text-gray-400 capitalize">{department} Department</p>
                            </div>
                            <button onClick={toggleMenu} className="p-1 rounded-md text-gray-300 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="px-2 py-4">
                            <div className="mb-8">
                                <div className="flex items-center px-4 py-2">
                                    <div className="relative">
                                        <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full" />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                                    </div>
                                </div>
                            </div>
                            <a href={`/user/profile/${_id}`} className="flex items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                                <User size={20} className="mr-3" />
                                <span>Profile</span>
                            </a>
                            <a href={`/user/tasks/${_id}`} className="flex items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                                <CheckSquare size={20} className="mr-3" />
                                <span>Tasks</span>
                            </a>
                            <a href={`/user/notifications/${_id}`} className="flex items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white relative">
                                <Bell size={20} className="mr-3" />
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute right-4 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </a>
                            {renderNavLinks()}
                            <div className="mt-8 pt-4 border-t border-gray-800">
                                <button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                                    <LogOut size={20} className="mr-3" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Top Navigation */}
                <header className="bg-white shadow">
                    <div className="flex items-center justify-between px-4 py-4 md:px-6">
                        <div className="flex items-center">
                            <button onClick={toggleMenu} className="p-1 mr-3 rounded-md md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                <Menu size={24} />
                            </button>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 capitalize">{role} Dashboard</h2>
                                <p className="text-sm text-gray-500 capitalize">{department} Department</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className='mr-4 h-fit relative w-fit'>
                                <button onClick={() => setShowNotificationPopup(!showNotificationPopup)} className="p-2.5 text-gray-500 rounded-full hover:bg-gray-100 relative">
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotificationPopup && (
                                    <div className='absolute w-[400px] max-md:w-[300px] top-10 -right-14 bg-white p-3 rounded-xl'>
                                        <Notifications _id={_id} />
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <img src={user.photo} alt={user.name} className="w-8 h-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 p-4 md:p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard | Member since {formatDate(user.createdAt)}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                                    <CheckSquare size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tasks</p>
                                    <p className="text-lg font-semibold text-gray-900">7</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">75% complete</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-500">
                                    <Users size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Team Size</p>
                                    <p className="text-lg font-semibold text-gray-900">8</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                                    <Bell size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Notifications</p>
                                    <p className="text-lg font-semibold text-gray-900">{unreadCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                                    <Clipboard size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Allocations</p>
                                    <p className="text-lg font-semibold text-gray-900">4</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="">
                        {showPage === 'tasks' && (
                            <Tasks _id={_id} />
                        )}
                        {showPage === 'volunteers' && (
                            <Volunteers _id={_id} department={department} />
                        )}
                        {showPage === 'executives' && (
                            <Executives _id={_id} department={department} />
                        )}
                        {showPage === 'allocations' && (
                            <Allocations _id={_id} />
                        )}
                        {showPage === 'merch' && user && user.role !== 'volunteer' && <MerchManager />}
                        {showPage === 'announcements' && user && user.role !== 'volunteer' && <AnnouncementsManager />}
                        {showPage === 'schedule' && user && user.role !== 'volunteer' && <ScheduleManager />}
                        {showPage === 'media' && user && user.role !== 'volunteer' && <MediaManager />}
                        {showPage === 'meetings' && (
                            <div>
                                <Button className="mb-4 bg-pink-600 text-white font-semibold" onClick={() => setShowMeetingModal(true)}>
                                    Schedule Meeting
                                </Button>
                                <MeetingList userId={_id} key={refreshMeetings} />
                            </div>
                        )}
                        {showPage === 'chat' && user && (
                            <DepartmentChat department={department} user={user} onRead={() => setChatUnread(0)} />
                        )}

                        {showPage === 'events_form' && (
                            <main className="flex-grow p-6">
                                <CreateEventForm userId={_id} onClose={() => setShowForm(false)} />
                            </main>
                        )}

                        {showPage === 'events' && (
                            <main className="flex-grow p-6">
                                {renderEvents()}
                            </main>
                        )}
                    </div>
                </main>
                {showMeetingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowMeetingModal(false)}>
                                <X size={20} />
                            </button>
                            <ScheduleMeeting onSuccess={() => { setShowMeetingModal(false); setRefreshMeetings(r => !r); }} />
                        </div>
                    </div>
                )}
                {/* Render MeetingPopup globally */}
                <MeetingPopup userId={_id} />
            </div>
        </div>
    );
};

export default NonCoreDashboard;
