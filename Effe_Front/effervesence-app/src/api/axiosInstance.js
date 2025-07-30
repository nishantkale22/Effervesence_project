// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // needed for sending cookies (refresh token)
});

// ✅ Automatically attach access token before every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 403 - auto refresh and retry once
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.get('/auth/refresh', { withCredentials: true });
        localStorage.setItem('accessToken', refreshResponse.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
        return axiosInstance(originalRequest); // use axiosInstance to preserve interceptors
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
