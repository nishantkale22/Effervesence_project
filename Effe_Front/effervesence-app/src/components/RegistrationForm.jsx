// src/components/RegistrationForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

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
    non_core: ['volunteer', 'executive'],
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
      const response = await axios.post('http://localhost:5000/register', formData);
      setSuccessMessage(response.data.message || 'Registration successful!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response?.data.message || 'An error occurred during registration.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl">
        <div className="hidden md:flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-3xl font-extrabold mb-4">Welcome to Effervescence!</h2>
          <p className="text-white/80">Join India’s most iconic cultural fest. Register now and be a part of the legacy!</p>
          <img src="/assets/gallery/crowd.jpg" alt="Effervescence Crowd" className="w-full h-64 object-cover rounded-xl mt-6 shadow-lg" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-3xl font-bold text-center md:text-left">Register</h1>

          {[{
            id: 'name', label: 'Name', value: name, setter: setName, type: 'text', required: true
          }, {
            id: 'photo', label: 'Photo URL', value: photo, setter: setPhoto, type: 'text'
          }, {
            id: 'email', label: 'Email', value: email, setter: setEmail, type: 'email', required: true
          }, {
            id: 'phone', label: 'Phone', value: phone, setter: setPhone, type: 'text', required: true
          }, {
            id: 'password', label: 'Password', value: password, setter: setPassword, type: 'password', required: true
          }].map(({ id, label, value, setter, type, required }) => (
            <div key={id}>
              <label htmlFor={id} className="block mb-1 font-semibold">{label}</label>
              <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                required={required}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          ))}

          <div>
            <label htmlFor="userType" className="block mb-1 font-semibold">User Type</label>
            <select
              id="userType"
              value={userType}
              onChange={handleUserTypeChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-black focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Select user type</option>
              {userTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="role" className="block mb-1 font-semibold">Role</label>
            <select
              id="role"
              value={role}
              onChange={handleRoleChange}
              disabled={!userType}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-black focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Select role</option>
              {userType && roles[userType].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block mb-1 font-semibold">Department</label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={userType === 'core' || userType === 'attendee'}
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-black focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="none">None</option>
              {userType === 'non_core' && departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 transition text-white py-3 rounded-full font-bold shadow-md mt-4">
            Register
          </button>

          {successMessage && <p className="mt-4 text-green-400 text-center font-medium">{successMessage}</p>}
          {errorMessage && <p className="mt-4 text-red-400 text-center font-medium">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;