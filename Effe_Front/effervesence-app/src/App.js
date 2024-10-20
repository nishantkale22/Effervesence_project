import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
// import Dashboard from './components/UserDashboard'; // Adjust based on your structure
import Register from './components/RegistrationForm';

// Dynamic imports for user-specific dashboards
const UserDashboard = React.lazy(() => import('./components/UserDashboard')); // Updated to point to UserDashboard

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        
        {/* Dynamic route for user dashboards */}
        <Route path="/user/:userType/:role/:department/dashboard/:_id" element={<UserDashboard />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
