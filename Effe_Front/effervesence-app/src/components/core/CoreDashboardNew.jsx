import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Users, CheckSquare, Calendar, BarChart, PieChart, Bell, Menu, X, User, LogOut } from 'lucide-react';
import OverviewTab from './OverviewTab';
import TeamTab from './TeamTab';
import TasksTab from './TasksTab';
import EventsTab from './EventsTab';
import ReportsTab from './ReportsTab';
import MerchTab from './MerchTab';
import ChatTab from './ChatTab';

const CoreDashboard = () => {
    const { role, department, _id } = useParams();
    const [user, setUser] = useState();
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [merchStock, setMerchStock] = useState([]);
    const [merchOrders, setMerchOrders] = useState([]);
    const [salesSummary, setSalesSummary] = useState(null);
    const [merchLoading, setMerchLoading] = useState(false);
    const [merchError, setMerchError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/core/${role}/${department}/dashboard/${_id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setUser(data.user);
            } catch (err) {
                setError('Failed to fetch user data.');
            }
        };
        fetchUserData();
    }, [role, department, _id]);

    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'merch' || activeTab === 'reports') {
            setMerchLoading(true);
            Promise.all([
                axiosInstance.get('/merch/admin/stock'),
                axiosInstance.get('/merch/admin/orders'),
                axiosInstance.get('/merch/admin/sales-summary'),
            ]).then(([stockRes, ordersRes, salesRes]) => {
                setMerchStock(stockRes.data);
                setMerchOrders(ordersRes.data);
                setSalesSummary(salesRes.data);
                setMerchError('');
            }).catch(() => {
                setMerchError('Failed to load merchandise analytics.');
            }).finally(() => setMerchLoading(false));
        }
    }, [activeTab]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

    const navLinks = [
        { key: 'overview', label: 'Overview', icon: <PieChart size={20} className="mr-3" /> },
        { key: 'team', label: 'Team', icon: <Users size={20} className="mr-3" /> },
        { key: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} className="mr-3" /> },
        { key: 'events', label: 'Events', icon: <Calendar size={20} className="mr-3" /> },
        { key: 'reports', label: 'Reports', icon: <BarChart size={20} className="mr-3" /> },
        { key: 'merch', label: 'Merchandise', icon: <span className="mr-3">🛍️</span> },
        { key: 'chat', label: 'Chat', icon: <span className="mr-3">💬</span> },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Desktop */}
            <div className="hidden md:flex md:flex-col md:w-64 bg-gray-900 text-white">
                <div className="flex items-center justify-center h-20 border-b border-gray-800">
                    <div className="text-center">
                        <h1 className="text-xl font-bold">Core Dashboard</h1>
                        {/* <p className="text-sm text-gray-400 capitalize">{department} Department</p> */}
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
                        {navLinks.map(link => (
                            <button
                                key={link.key}
                                onClick={() => setActiveTab(link.key)}
                                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors w-full text-left ${activeTab === link.key ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </button>
                        ))}
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
                                <h1 className="text-xl font-bold">Core Dashboard</h1>
                                {/* <p className="text-sm text-gray-400 capitalize">{department} Department</p> */}
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
                            {navLinks.map(link => (
                                <button
                                    key={link.key}
                                    onClick={() => { setActiveTab(link.key); toggleMenu(); }}
                                    className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors w-full text-left ${activeTab === link.key ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </button>
                            ))}
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

            {/* Main Content */}
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
                                {/* <p className="text-sm text-gray-500 capitalize">{department} Department</p> */}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="relative">
                                <img src={user.photo} alt={user.name} className="w-8 h-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            user={user}
                            merchStock={merchStock}
                            merchOrders={merchOrders}
                            salesSummary={salesSummary}
                            merchLoading={merchLoading}
                            merchError={merchError}
                        />
                    )}
                    {activeTab === 'team' && <TeamTab />}
                    {activeTab === 'tasks' && <TasksTab />}
                    {activeTab === 'events' && <EventsTab />}
                    {activeTab === 'reports' && (
                        <ReportsTab
                            salesSummary={salesSummary}
                            merchLoading={merchLoading}
                            merchError={merchError}
                        />
                    )}
                    {activeTab === 'merch' && (
                        <MerchTab
                            merchStock={merchStock}
                            merchOrders={merchOrders}
                            salesSummary={salesSummary}
                            merchLoading={merchLoading}
                            merchError={merchError}
                        />
                    )}
                    {activeTab === 'chat' && <ChatTab user={user} />}
                </main>
            </div>
        </div>
    );
};

export default CoreDashboard;
