import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { tryRefreshToken } from '../api/refreshToken';

const ProtectedRoute = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        const refreshed = await tryRefreshToken();
        token = refreshed ? localStorage.getItem('accessToken') : null;
      }
      setIsAuthenticated(!!token);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) return <div>Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
