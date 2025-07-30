import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import axiosInstance from '../../api/axiosInstance';

const EventDiscovery = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        axiosInstance.get('/event/display')
            .then(res => {
                setEvents(res.data.events || []);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load events');
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-16 px-4 md:px-12">
            <motion.h1
                className="text-5xl md:text-6xl font-extrabold text-white mb-12 text-center drop-shadow-lg"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                Discover Live Events
            </motion.h1>
            <div className="max-w-5xl mx-auto flex flex-col gap-8">
                {loading ? (
                    <div className="text-gray-300 text-center text-xl">Loading events...</div>
                ) : error ? (
                    <div className="text-red-400 text-center text-xl">{error}</div>
                ) : events.length > 0 ? (
                    events.map(event => (
                        <EventCard
                            key={event._id}
                            image={event.mainImageUrl || '/assets/events/default.jpg'}
                            video={event.previewVideoUrl || ''}
                            name={event.title}
                            date={event.scheduledDate ? new Date(event.scheduledDate).toLocaleString() : ''}
                            venue={event.location}
                            description={event.description}
                            tags={event.tags || []}
                            isLive={event.isLive || false}
                            onViewDetails={() => window.location.href = `/events/${event._id}`}
                        />
                    ))
                ) : (
                    <div className="text-gray-400 text-center text-xl">No live events to display right now.</div>
                )}
            </div>
        </div>
    );
};

export default EventDiscovery; 