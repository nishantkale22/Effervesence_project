import React, { useEffect, useState } from 'react';
import { Bell, User, CheckSquare, Menu, X } from 'lucide-react';

const AttendeeDashboard = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const role = 'student';
    const department = 'hospitality';
    const _id = '123456';

    useEffect(() => {
        // Simulating data fetch
        setUser({
            name: 'Tanmay Makode',
            email: 'randomemail@gmail.com',
            phone: '1234567890',
            department: 'hospitality',
            userType: 'attendee',
            role: 'student',
            createdAt: '2023-10-01T00:00:00Z',
            photo: '/api/placeholder/150/150'
        });
    }, []);

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
                    <h1 className="text-xl font-bold">Event Dashboard</h1>
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
                                    <p className="text-xs text-gray-400">{user.role}</p>
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
                        <a href={`/user/notifications/${_id}`} className="flex items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                            <Bell size={20} className="mr-3" />
                            <span>Notifications</span>
                        </a>
                    </nav>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={toggleMenu}></div>
                    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white">
                        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-800">
                            <h1 className="text-xl font-bold">Event Dashboard</h1>
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
                                        <p className="text-xs text-gray-400">{user.role}</p>
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
                            <a href={`/user/notifications/${_id}`} className="flex items-center px-4 py-3 mb-2 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                                <Bell size={20} className="mr-3" />
                                <span>Notifications</span>
                            </a>
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
                            <h2 className="text-lg font-medium text-gray-900">{department.charAt(0).toUpperCase() + department.slice(1)} Department</h2>
                        </div>
                        <div className="flex items-center">
                            <button className="p-1 mr-4 text-gray-500 rounded-full hover:bg-gray-100 relative">
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
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
                                    <p className="text-lg font-semibold text-gray-900">5</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div className="w-1/2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">50% complete</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-500">
                                    <User size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Team Members</p>
                                    <p className="text-lg font-semibold text-gray-900">12</p>
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
                                    <p className="text-lg font-semibold text-gray-900">3</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                                    <CheckSquare size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                                    <p className="text-lg font-semibold text-gray-900">2</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Recent Activity</h3>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                                <li className="px-4 py-3 hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                                <CheckSquare size={16} />
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-gray-900">Task assigned: "Coordinate with team leaders"</p>
                                            <p className="text-xs text-gray-500">Today at 9:42 AM</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="px-4 py-3 hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                                                <Bell size={16} />
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-gray-900">New notification: "Team meeting scheduled"</p>
                                            <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="px-4 py-3 hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                                                <User size={16} />
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-gray-900">Profile information updated</p>
                                            <p className="text-xs text-gray-500">May 18, 2025</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div className="px-4 py-3 bg-gray-50 text-right">
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</a>
                            </div>
                        </div>
                    </div>

                    {/* User Information Card */}
                    <div>
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Your Information</h3>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                                        <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                        <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Department</h4>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{user.department}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Role</h4>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">User Type</h4>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{user.userType}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right">
                                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Edit Profile</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AttendeeDashboard;