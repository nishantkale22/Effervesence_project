import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

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
    <div className="container">
      <div className="form">
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="button">Login</button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
