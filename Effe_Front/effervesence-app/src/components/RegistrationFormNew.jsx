// src/components/RegistrationForm.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Keep Axios import
import { User, Mail, Phone, Lock, Camera, UserCheck, Building, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const RegistrationForm = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        photo: '',
        email: '',
        phone: '',
        password: '',
        userType: '',
        role: '',
        department: 'none'
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const userTypes = [
        { value: 'core', label: 'Core', description: 'Festival leadership and management' },
        { value: 'non_core', label: 'Non-Core', description: 'Department volunteers and executives' },
        { value: 'attendee', label: 'Attendee', description: 'Students and external participants' },
    ];

    const roles = {
        core: ['festival head', 'operational head'],
        non_core: ['volunteer', 'executive'],
        attendee: ['student', 'outsider'],
    };

    const departments = [
        { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
        { value: 'events', label: 'Events', icon: '🎉' },
        { value: 'sponsorship', label: 'Sponsorship', icon: '💼' }
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', selectedFile);

            const token = localStorage.getItem('token');

            const res = await axios.post('http://localhost:5000/upload/register/single', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            const uploadedUrl = res.data.fileUrl;
            setFormData((prev) => ({ ...prev, photo: uploadedUrl }));
            setSuccessMessage('Photo uploaded successfully!');
        } catch (err) {
            setErrorMessage('File upload failed. Please try again.');
        }
    };

    // Unified input change handler
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear messages when user starts typing
        if (errorMessage || successMessage) {
            setErrorMessage('');
            setSuccessMessage('');
        }
    };

    const handleUserTypeChange = (value) => {
        setFormData(prev => ({
            ...prev,
            userType: value,
            role: '', // Reset role when user type changes
            department: 'none' // Reset department when user type changes
        }));
    };

    const handleRoleChange = (value) => {
        setFormData(prev => ({
            ...prev,
            role: value,
            // Set department to 'none' if userType is 'core' or 'attendee'
            department: (formData.userType === 'core' || formData.userType === 'attendee') ? 'none' : prev.department
        }));
    };

    // Form validation logic
    const validateForm = () => {
        const { name, email, phone, password, userType, role } = formData;

        if (!name.trim()) return 'Name is required';
        if (!email.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
        if (!phone.trim()) return 'Phone number is required';
        if (phone.length < 10) return 'Phone number must be at least 10 digits';
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (!userType) return 'Please select a user type';
        if (!role) return 'Please select a role';

        return null; // No errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/register', formData);
            setSuccessMessage(response.data.message || 'Registration successful!');
            setErrorMessage('');
            // Reset form after successful registration
            setFormData({
                name: '',
                photo: '',
                email: '',
                phone: '',
                password: '',
                userType: '',
                role: '',
                department: 'none'
            });
            setSelectedFile(null);
        } catch (error) {
            setErrorMessage(error.response?.data.message || 'An error occurred during registration.');
            setSuccessMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
            <div className="scale-90 max-w-2xl mx-auto bg-white pt-6 rounded-xl">
                {/* Header */}
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCheck size={20} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                    <p className="text-gray-600">Join our festival management platform</p>
                </div>
                <hr className='mt-4 mb-0' />

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
                    <div className="space-y-6">
                        {/* Personal Information Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <User size={20} className="mr-2 text-blue-600" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User size={20} className="absolute left-3 top-4 text-gray-400" />
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Photo URL + File Upload */}
                                <div>
                                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                                        Photo URL
                                    </label>
                                    <div className="relative">
                                        <Camera size={20} className="absolute left-3 top-4 text-gray-400" />
                                        <input
                                            type="url"
                                            id="photo"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="https://example.com/photo.jpg"
                                            value={formData.photo}
                                            onChange={(e) => handleInputChange('photo', e.target.value)}
                                        />
                                    </div>

                                    {/* Optional Upload File */}
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Or Upload Image File
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleFileUpload}
                                            className="mt-2 px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition"
                                        >
                                            Upload Photo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Mail size={20} className="mr-2 text-green-600" />
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail size={20} className="absolute left-3 top-4 text-gray-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="your.email@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone size={20} className="absolute left-3 top-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="1234567890"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mt-6">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-3 top-4 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter a secure password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters required</p>
                            </div>
                        </div>

                        {/* Role Information Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Shield size={20} className="mr-2 text-purple-600" />
                                Role Information
                            </h3>

                            {/* User Type */}
                            <div className="mb-6">
                                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-3">
                                    User Type *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {userTypes.map((type) => (
                                        <div key={type.value} className="relative">
                                            <input
                                                type="radio"
                                                id={type.value}
                                                name="userType"
                                                value={type.value}
                                                checked={formData.userType === type.value}
                                                onChange={(e) => handleUserTypeChange(e.target.value)}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor={type.value}
                                                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.userType === type.value
                                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-sm font-medium text-gray-900">{type.label}</div>
                                                <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Role */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        id="role"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                                        value={formData.role}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        disabled={!formData.userType}
                                        required
                                    >
                                        <option value="">Select role</option>
                                        {formData.userType &&
                                            roles[formData.userType].map((role) => (
                                                <option key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Department */}
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                                        value={formData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        disabled={formData.userType === 'core' || formData.userType === 'attendee'}
                                    >
                                        <option value="none">None</option>
                                        {formData.userType === 'non_core' &&
                                            departments.map((dept) => (
                                                <option key={dept.value} value={dept.value}>
                                                    {dept.icon} {dept.label}
                                                </option>
                                            ))}
                                    </select>
                                    {(formData.userType === 'core' || formData.userType === 'attendee') && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Department selection not available for {formData.userType} users
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        {successMessage && (
                            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle size={20} className="text-green-600 mr-3" />
                                <p className="text-green-700">{successMessage}</p>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle size={20} className="text-red-600 mr-3" />
                                <p className="text-red-700">{errorMessage}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <UserCheck size={20} className="mr-2" />
                                    Create Account
                                </>
                            )}
                        </button>

                        {/* Footer */}
                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Sign in here
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;