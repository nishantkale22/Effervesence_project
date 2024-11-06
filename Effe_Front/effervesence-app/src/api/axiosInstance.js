// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.get('/auth/refresh', { withCredentials: true });
        localStorage.setItem('accessToken', refreshResponse.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // Redirect to login on failure
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
