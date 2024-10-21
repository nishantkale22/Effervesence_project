import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/RegistrationForm';
import Profile from './components/Profile'; 
import Tasks from './components/Tasks'; // Make sure to create this component
import Notifications from './components/Notifications'; // Make sure to create this component

// Lazy load the UserDashboard for improved performance
const UserDashboard = React.lazy(() => import('./components/UserDashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Registration and Login Routes */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Dashboard Route */}
        <Route path="/user/:userType/:role/:department/dashboard/:_id" element={<UserDashboard />} />
        
        {/* New Routes for Profile, Tasks, and Notifications */}
        <Route path="/user/profile/:_id" element={<Profile />} />
        <Route path="/user/tasks/:_id" element={<Tasks />} />
        <Route path="/user/notifications/:_id" element={<Notifications />} />
      </Routes>
    </Suspense>
  );
}

export default App;
