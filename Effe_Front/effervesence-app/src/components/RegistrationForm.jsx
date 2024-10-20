// src/components/RegistrationForm.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Import Axios

const RegistrationForm = () => {
    const [name, setName] = useState(''); // State for name
    const [photo, setPhoto] = useState(''); // State for photo URL or Base64
    const [email, setEmail] = useState(''); // State for email
    const [phone, setPhone] = useState(''); // State for phone
    const [password, setPassword] = useState(''); // State for password
    const [userType, setUserType] = useState(''); // State for user type
    const [role, setRole] = useState(''); // State for role
    const [department, setDepartment] = useState('none'); // State for department
    const [errorMessage, setErrorMessage] = useState(''); // State for error messages
    const [successMessage, setSuccessMessage] = useState(''); // State for success messages

    const userTypes = [
        { value: 'core', label: 'Core' },
        { value: 'non_core', label: 'Non-Core' },
        { value: 'attendee', label: 'Attendee' },
    ];

    const roles = {
        core: ['festival head', 'operational head'],
        non_core: ['volunteer', 'coordinator','executive'],
        attendee: ['student', 'outsider'],
    };

    const departments = ['hospitality', 'events', 'sponsorship'];

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
        setRole(''); // Reset role when user type changes
        setDepartment('none'); // Reset department when user type changes
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        // Automatically set department to "none" for core and non_core
        if (userType === 'core' || userType === 'attendee') {
            setDepartment('none');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission

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
            const response = await axios.post('http://localhost:4000/register', formData); // Adjust URL if needed
            setSuccessMessage(response.data.message || 'Registration successful!'); // Display success message
            setErrorMessage(''); // Clear any previous error messages
        } catch (error) {
            setErrorMessage(error.response?.data.message || 'An error occurred during registration.'); // Display error message
            setSuccessMessage(''); // Clear any previous success messages
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
                <label>Photo URL:</label>
                <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} />
            </div>

            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
                <label>Phone:</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div>
                <label>User Type:</label>
                <select value={userType} onChange={handleUserTypeChange} required>
                    <option value="">Select user type</option>
                    {userTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Role:</label>
                <select value={role} onChange={handleRoleChange} disabled={!userType} required>
                    <option value="">Select role</option>
                    {userType &&
                        roles[userType].map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                </select>
            </div>

            <div>
                <label>Department:</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} disabled={userType === 'core' || userType === 'attendee'}>
                    <option value="none">None</option>
                    {userType === 'non_core' &&
                        departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                </select>
            </div>

            <button type="submit">Register</button>

            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </form>
    );
};

export default RegistrationForm;
