import { useEffect, useState } from 'react';
import { ArrowLeft, Edit, Mail, Phone, Building, User, Calendar, Shield, Camera } from 'lucide-react';
import { useParams } from 'react-router-dom'; // Get user ID from params
import axiosInstance from '../api/axiosInstance';

const Profile = () => {
    const { _id } = useParams(); // Get user ID from params
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // console.log('User photo URL:', user.photo);
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

        // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
        // setUser({
        //     name: 'Tanmay Makode',
        //     email: 'randomemail@gmail.com',
        //     phone: '1234567890',
        //     department: 'hospitality',
        //     userType: 'attendee',
        //     role: 'student',
        //     createdAt: '2023-10-01T00:00:00Z',
        //     photo: '/api/placeholder/200/200'
        // });
    }, [_id]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRoleColor = (role) => {
        const colors = {
            'student': 'bg-blue-100 text-blue-800',
            'faculty': 'bg-green-100 text-green-800',
            'admin': 'bg-purple-100 text-purple-800',
            'staff': 'bg-yellow-100 text-yellow-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getDepartmentIcon = (department) => {
        const icons = {
            'hospitality': '🏨',
            'engineering': '⚙️',
            'business': '💼',
            'arts': '🎨',
            'science': '🔬'
        };
        return icons[department] || '🏢';
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Profile</h3>
                        <p className="text-gray-600">Please wait while we fetch your information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="ml-2 text-xl font-semibold text-gray-900">Profile</h1>

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <div className="relative px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
                            <div className="relative -mt-16 mb-4 sm:mb-0">
                                <div className="relative">
                                    <img
                                        src={user.photo}
                                        alt={`${user.name}'s profile`}
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 truncate">{user.name}</h2>
                                        <div className="flex flex-wrap items-center mt-2 space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                <Shield size={12} className="mr-1" />
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar size={16} className="mr-2" />
                                            Joined {formatDate(user.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Mail size={16} className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Phone size={16} className="text-green-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">Phone Number</p>
                                    <p className="text-sm text-gray-600">{user.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Building size={16} className="text-purple-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">Department</p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <span className="mr-2">{getDepartmentIcon(user.department)}</span>
                                        {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <User size={16} className="text-yellow-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">User Type</p>
                                    <p className="text-sm text-gray-600 capitalize">{user.userType}</p>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;