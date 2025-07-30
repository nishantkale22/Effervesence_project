import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Button from './ui/Button';
import socket from '../socket';

const MeetingList = ({ userId }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await axiosInstance.get(`/meeting/user/${userId}`);
                setMeetings(res.data);
            } catch (err) {
                setError('Failed to fetch meetings');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchMeetings();
    }, [userId]);

    useEffect(() => {
        const handleMeetingDeleted = ({ meetingId }) => {
            setMeetings(prev => prev.filter(m => m._id !== meetingId));
        };
        socket.on('meetingDeleted', handleMeetingDeleted);
        return () => socket.off('meetingDeleted', handleMeetingDeleted);
    }, []);

    const now = Date.now();

    const handleEndMeet = async (meetingId) => {
        setDeletingId(meetingId);
        try {
            await axiosInstance.delete(`/meeting/${meetingId}`);
            setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
        } catch (err) {
            setError('Failed to end meeting');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 mt-8 max-w-2xl mx-auto text-gray-900">
            <h3 className="text-xl font-bold mb-4">Upcoming Meetings</h3>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <ul className="divide-y divide-gray-200">
                {meetings.map((m) => (
                    <li key={m._id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-gray-50 transition">
                        <div>
                            <div className="font-semibold">Organizer: <span className="font-normal">{m.organizer?.name || m.organizer}</span></div>
                            <div className="text-sm text-gray-600">Time: {new Date(m.scheduledFor).toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Participants: {m.participants?.length}</div>
                        </div>
                        <div className="mt-2 md:mt-0 flex gap-2 items-center">
                            {new Date(m.scheduledFor).getTime() <= now ? (
                                <a href={m.meetingUrl} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-pink-600 text-white font-semibold">Join Meeting</Button>
                                </a>
                            ) : (
                                <span className="text-xs text-gray-500">Not started</span>
                            )}
                            {/* End Meet button for organizer */}
                            {String(m.organizer?._id || m.organizer) === String(userId) && (
                                <Button
                                    className="bg-red-600 text-white font-semibold ml-2"
                                    onClick={() => handleEndMeet(m._id)}
                                    disabled={deletingId === m._id}
                                >
                                    {deletingId === m._id ? 'Ending...' : 'End Meet'}
                                </Button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MeetingList; 