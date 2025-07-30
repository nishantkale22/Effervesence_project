import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const EventsTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/event/all')
      .then(res => setEvents(res.data.events || res.data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Event Schedule</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-2 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-indigo-700">{event.title}</h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{event.location}</span>
            </div>
            <div className="text-sm text-gray-500">
              {event.scheduledDate ? new Date(event.scheduledDate).toLocaleDateString() : '-'} | {event.startTime} - {event.endTime}
            </div>
            <div className="text-gray-700">{event.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsTab;