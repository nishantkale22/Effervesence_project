import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Button from './ui/Button';

const ScheduleMeeting = ({ onSuccess }) => {
    const [members, setMembers] = useState([]);
    const [selected, setSelected] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await axiosInstance.get('/user/department/members');
                setMembers(res.data.users);
            } catch (err) {
                setError('Failed to fetch department members');
            }
        };
        fetchMembers();
    }, []);

    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!date || !time || selected.length === 0) {
            setError('Please select members, date, and time.');
            return;
        }
        setLoading(true);
        try {
            const scheduledFor = new Date(`${date}T${time}`);
            await axiosInstance.post('/meeting/schedule', {
                participants: selected,
                scheduledFor,
            });
            setSuccess('Meeting scheduled!');
            setSelected([]);
            setDate('');
            setTime('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to schedule meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-gray-900">
            <h2 className="text-2xl font-bold mb-4">Schedule a Meeting</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1">Select Members:</label>
                    <ul className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 divide-y divide-gray-200">
                        {members.map((m) => (
                            <li key={m._id} className="py-1 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(m._id)}
                                    onChange={() => handleSelect(m._id)}
                                    className="accent-pink-600"
                                />
                                <span>{m.name} <span className="text-xs text-gray-500">({m.role})</span></span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex gap-2">
                    <label className="flex-1">
                        <span className="block mb-1">Date:</span>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full border rounded px-2 py-1" />
                    </label>
                    <label className="flex-1">
                        <span className="block mb-1">Time:</span>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full border rounded px-2 py-1" />
                    </label>
                </div>
                <Button type="submit" className="w-full bg-pink-600 text-white font-semibold mt-2" disabled={loading}>
                    {loading ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
            </form>
        </div>
    );
};

export default ScheduleMeeting; 