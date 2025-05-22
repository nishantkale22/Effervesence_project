
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      localStorage.setItem('accessToken', response.data.accessToken);

      const { userType, role, department, _id } = response.data.user;
      navigate(`/user/${userType}/${role}/${department}/dashboard/${_id}`);
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-semibold">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 transition text-white py-3 rounded-full font-bold shadow-md"
          >
            Login
          </button>
          {errorMessage && <p className="mt-4 text-red-400 text-center font-medium">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;