// App.js  (remove the extra <Router> import and wrapper)
import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/LoginNew';
import Register from './components/RegistrationFormNew';
import Profile from './components/ProfileNew';
import CreateEventForm from './components/CreateEventForm'; // adjust path if needed
import EditEventForm from './components/EditEventForm'; // adjust path if needed
import Event from './components/Event'; // Adjust path if needed
import ScheduleMeeting from './components/ScheduleMeeting';
import MeetingList from './components/MeetingList';
import MeetingPopup from './components/MeetingPopup';
import EventDiscovery from './components/attendee/EventDiscovery';
import AttendeeHome from './components/attendee/AttendeeHome';
import EventDetails from './components/attendee/EventDetails';
import MerchShop from './components/MerchShop'; // at the top

// Lazy-loaded dashboards & pages
const AttendeeDashboard = React.lazy(() => import('./components/attendee/AttendeeDashboardNew'));
const CoreDashboard = React.lazy(() => import('./components/core/CoreDashboardNew'));
const NonCoreDashboard = React.lazy(() => import('./components/noncore/NonCoreDashboardNew'));


function App() {
  const [userId, setUserId] = useState(null);
  const [refreshMeetings, setRefreshMeetings] = useState(false);

  useEffect(() => {
    // Assume user info is stored in localStorage after login
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?._id) setUserId(user._id);
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
        <Route
          path="/user/attendee/:role/:department/dashboard/:_id"
          element={<AttendeeHome />}
        />
        <Route
          path="/user/core/:role/:department/dashboard/:_id"
          element={<CoreDashboard />}
        />
        <Route
          path="/user/non_core/:role/:department/dashboard/:_id"
          element={<NonCoreDashboard />}
        />
        <Route path="/event/:id" element={<Event />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/events" element={<EventDiscovery />} />

        {/* Profile, Tasks & Notifications */}
        <Route path="/user/profile/:_id" element={<Profile />} />

        <Route path="/event/create/:_id" element={<CreateEventForm />} />
        <Route path="/events/:id/edit" element={<EditEventForm />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* merch */}
        <Route path="/merch" element={<MerchShop />} />

      </Routes>
    </Suspense>
  );
}

export default App;
