// App.js  (remove the extra <Router> import and wrapper)
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login         from './components/Login';
import Register      from './components/RegistrationForm';
import Profile       from './components/Profile';
import Tasks         from './components/Tasks';
import Notifications from './components/Notifications';

// Lazy-loaded dashboards & pages
const AttendeeDashboard  = React.lazy(() => import('./components/attendee/AttendeeDashboard'));
const CoreDashboard      = React.lazy(() => import('./components/core/CoreDashboard'));
const NonCoreDashboard   = React.lazy(() => import('./components/noncore/NonCoreDashboard'));
const Volunteers         = React.lazy(() => import('./components/noncore/Volunteers'));
const Executives         = React.lazy(() => import('./components/noncore/Executives'));
const Allocations        = React.lazy(() => import('./components/Allocations'));
const TaskDetails        = React.lazy(() => import('./components/TaskDetails'));
const AllocationDetails  = React.lazy(() => import('./components/AllocationDetails'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/register" element={<Register />}    />
        <Route path="/login"    element={<Login />}       />

        {/* Dashboards */}
        <Route
          path="/user/attendee/:role/:department/dashboard/:_id"
          element={<AttendeeDashboard />}
        />
        <Route
          path="/user/core/:role/:department/dashboard/:_id"
          element={<CoreDashboard />}
        />
        <Route
          path="/user/non_core/:role/:department/dashboard/:_id"
          element={<NonCoreDashboard />}
        />

        {/* Profile, Tasks & Notifications */}
        <Route path="/user/profile/:_id"     element={<Profile />}       />
        <Route path="/user/tasks/:_id"       element={<Tasks />}         />
        <Route path="/user/taskdetails/:_id" element={<TaskDetails />}   />
        <Route path="/user/notifications/:_id" element={<Notifications />} />

        {/* Allocations */}
        <Route
          path="/user/allocations/:_id"
          element={<Allocations />}
        />
        <Route
          path="/user/allocationdetails/:_id"
          element={<AllocationDetails />}
        />

        {/* Team Management */}
        <Route
          path="/user/:_id/:department/volunteers"
          element={<Volunteers />}
        />
        <Route
          path="/user/:_id/:department/executives"
          element={<Executives />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
