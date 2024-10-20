// src/components/RegistrationForm.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Import Axios
import '../styles/registration.css'; // Ensure correct path to your CSS

const RegistrationForm = () => {
    const [name, setName] = useState('');
    const [photo, setPhoto] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('');
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('none');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const userTypes = [
        { value: 'core', label: 'Core' },
        { value: 'non_core', label: 'Non-Core' },
        { value: 'attendee', label: 'Attendee' },
    ];

    const roles = {
        core: ['festival head', 'operational head'],
        non_core: ['volunteer', 'coordinator', 'executive'],
        attendee: ['student', 'outsider'],
    };

    const departments = ['hospitality', 'events', 'sponsorship'];

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
        setRole('');
        setDepartment('none');
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        if (userType === 'core' || userType === 'attendee') {
            setDepartment('none');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            name,
            photo,
            email,
            phone,
            password,
            userType,
            role,
            department,
        };

        try {
            const response = await axios.post('http://localhost:4000/register', formData);
            setSuccessMessage(response.data.message || 'Registration successful!');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.response?.data.message || 'An error occurred during registration.');
            setSuccessMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="registration-form">
            <h1 className="form-title">Registration Form</h1>
            
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="photo">Photo URL:</label>
                <input
                    type="text"
                    id="photo"
                    className="input"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="phone">Phone:</label>
                <input
                    type="text"
                    id="phone"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="userType">User Type:</label>
                <select
                    id="userType"
                    className="select"
                    value={userType}
                    onChange={handleUserTypeChange}
                    required
                >
                    <option value="">Select user type</option>
                    {userTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="role">Role:</label>
                <select
                    id="role"
                    className="select"
                    value={role}
                    onChange={handleRoleChange}
                    disabled={!userType}
                    required
                >
                    <option value="">Select role</option>
                    {userType &&
                        roles[userType].map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="department">Department:</label>
                <select
                    id="department"
                    className="select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={userType === 'core' || userType === 'attendee'}
                >
                    <option value="none">None</option>
                    {userType === 'non_core' &&
                        departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                </select>
            </div>

            <button type="submit" className="button">Register</button>

            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
    );
};

export default RegistrationForm;
