import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const AttendeeHome = () => {
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [userError, setUserError] = useState('');

    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [announcementsError, setAnnouncementsError] = useState('');
    const [announcementIdx, setAnnouncementIdx] = useState(0);

    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState('');

    // Fetch user info
    useEffect(() => {
        setUserLoading(true);
        axiosInstance.get('/user/me')
            .then(res => {
                setUser(res.data.user);
                setUserLoading(false);
            })
            .catch(err => {
                setUserError('Failed to load user info');
                setUserLoading(false);
            });
    }, []);

    // Fetch announcements
    useEffect(() => {
        setAnnouncementsLoading(true);
        axiosInstance.get('/announcements?display=true')
            .then(res => {
                setAnnouncements(res.data);
                setAnnouncementsLoading(false);
            })
            .catch(err => {
                setAnnouncementsError('Failed to load announcements');
                setAnnouncementsLoading(false);
            });
    }, []);

    // Fetch registered events (after user loads)
    useEffect(() => {
        if (!user?._id) return;
        setEventsLoading(true);
        axiosInstance.get(`/user/${user._id}/registered-events`)
            .then(res => {
                setRegisteredEvents(res.data.registeredEvents || []);
                setEventsLoading(false);
            })
            .catch(err => {
                setEventsError('Failed to load registered events');
                setEventsLoading(false);
            });
    }, [user]);

    // Announcements ticker
    useEffect(() => {
        if (!announcements.length) return;
        const id = setInterval(() => setAnnouncementIdx(i => (i + 1) % announcements.length), 4000);
        return () => clearInterval(id);
    }, [announcements.length]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans">
            {/* Welcome Banner */}
            <section className="flex flex-col items-center justify-center text-center py-16 px-4">
                <motion.img
                    src="/logo.svg"
                    alt="Effervescence Logo"
                    className="w-24 h-24 mb-4 drop-shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                />
                <motion.h1
                    className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-xl"
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                >
                    {userLoading ? 'Loading...' : user ? `Welcome, ${user.name}!` : 'Welcome!'}
                </motion.h1>
                <motion.p
                    className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Your personalized Effervescence 2025 dashboard. Explore, participate, and make memories!
                </motion.p>
                {userError && <div className="text-red-400 mt-2">{userError}</div>}
            </section>

            {/* Announcements Ticker */}
            <section className="flex justify-center items-center py-4 bg-[#1f1b2e] min-h-[48px]">
                {announcementsLoading ? (
                    <div className="text-gray-300">Loading announcements...</div>
                ) : announcementsError ? (
                    <div className="text-red-400">{announcementsError}</div>
                ) : announcements.length > 0 ? (
                    <motion.div
                        key={announcementIdx}
                        className="text-pink-400 text-lg font-semibold text-center px-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {announcements[announcementIdx].message}
                    </motion.div>
                ) : (
                    <div className="text-gray-400">No announcements yet.</div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="py-10 flex flex-wrap justify-center gap-6">
                <Link to="/events">
                    <button className="px-8 py-4 bg-pink-600 hover:bg-pink-700 rounded-full font-bold shadow-lg text-lg transition">Discover Events</button>
                </Link>
                <Link to={user ? `/user/profile/${user._id}` : '#'}>
                    <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-full font-bold shadow-lg text-lg transition">My Profile</button>
                </Link>
                <Link to="/merch">
                    <button className="px-8 py-4 bg-white text-purple-700 hover:bg-gray-100 rounded-full font-bold shadow-lg text-lg transition">Buy Merch</button>
                </Link>
                <Link to="/schedule">
                    <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 rounded-full font-bold shadow-lg text-lg transition">View Schedule</button>
                </Link>
                <Link to="/gallery">
                    <button className="px-8 py-4 bg-[#181624] hover:bg-[#241b3b] rounded-full font-bold shadow-lg text-lg transition">Gallery</button>
                </Link>
            </section>

            {/* Registered Events */}
            <section className="py-12 px-4 max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-white">Your Registered Events</h2>
                {eventsLoading ? (
                    <div className="text-gray-300">Loading your events...</div>
                ) : eventsError ? (
                    <div className="text-red-400">{eventsError}</div>
                ) : registeredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {registeredEvents.map(event => (
                            <motion.div
                                key={event._id || event.name}
                                className="flex bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <img src={event.mainImageUrl || '/assets/events/default.jpg'} alt={event.title || event.name} className="w-40 h-40 object-cover" />
                                <div className="flex flex-col justify-center p-4">
                                    <h3 className="text-xl font-bold text-white mb-2">{event.title || event.name}</h3>
                                    <p className="text-pink-300 font-semibold">{event.scheduledDate ? new Date(event.scheduledDate).toLocaleString() : event.date}</p>
                                    <p className="text-gray-300">{event.location || event.venue}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400">You have not registered for any events yet.</div>
                )}
            </section>

            {/* Media/Promo Section */}
            <section className="py-16 bg-[#1a182d] text-center">
                <h2 className="text-3xl font-bold mb-4">Fest Highlights</h2>
                <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                    Relive the best moments from past editions and get hyped for what’s coming!
                </p>
                <div className="flex justify-center">
                    <video
                        src="/assets/highlights/effe_aftermovie.mp4"
                        className="w-full max-w-2xl rounded-xl shadow-lg"
                        controls
                        poster="/assets/gallery/moonshow.jpg"
                    />
                </div>
            </section>

            {/* Social & Helpdesk */}
            <footer className="bg-[#181624] text-gray-400 py-8 text-sm mt-8">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">© 2025 Effervescence, IIIT Allahabad. All rights reserved.</div>
                    <div className="flex space-x-5 mb-4 md:mb-0">
                        {[FaInstagram, FaFacebookF, FaTwitter, FaYoutube].map((Icon, idx) => (
                            <a key={idx} href="https://www.instagram.com/goeffervescence/" target="_blank" rel="noreferrer">
                                <Icon className="text-xl hover:text-white transition" />
                            </a>
                        ))}
                    </div>
                    <Link to="/helpdesk">
                        <button className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-semibold shadow transition">Helpdesk</button>
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default AttendeeHome; 