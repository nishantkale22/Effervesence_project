import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Button from './ui/Button';

const socket = io('http://localhost:5000', { withCredentials: true });

const MeetingPopup = ({ userId }) => {
    const [meeting, setMeeting] = useState(null);

    useEffect(() => {
        if (!userId) return;
        socket.emit('joinRoom', userId);
        const handler = (data) => {
            setMeeting(data);
        };
        socket.on('meetingStarted', handler);
        return () => {
            socket.off('meetingStarted', handler);
        };
    }, [userId]);

    if (!meeting) return null;

    return (
        <div className="fixed bottom-8 right-8 bg-white border-2 border-pink-600 rounded-lg shadow-xl p-6 z-50 text-gray-900 w-80 animate-bounce-in">
            <h4 className="text-lg font-bold mb-2 text-pink-600">Meeting Started!</h4>
            <div className="mb-1"><b>Organizer:</b> {meeting.organizer}</div>
            <div className="mb-2 text-sm text-gray-600"><b>Time:</b> {new Date(meeting.scheduledFor).toLocaleString()}</div>
            <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-pink-600 text-white font-semibold w-full mb-2">Join Meeting</Button>
            </a>
            <Button className="w-full bg-gray-200 text-gray-800" onClick={() => setMeeting(null)}>Dismiss</Button>
        </div>
    );
};

export default MeetingPopup; 