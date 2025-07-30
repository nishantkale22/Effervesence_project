import axios from 'axios';

export const tryRefreshToken = async () => {
    try {
        const response = await axios.get('http://localhost:5000/auth/refresh', { withCredentials: true });
        if (response.data?.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            return true;
        }
        return false;
    } catch (err) {
        localStorage.removeItem('accessToken');
        return false;
    }
};