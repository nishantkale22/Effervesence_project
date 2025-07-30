import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Button from './ui/Button';

const ScheduleManager = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [form, setForm] = useState({ date: '', events: [] });
    const [selectedId, setSelectedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchSchedules(); }, []);
    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/schedule');
            setSchedules(res.data);
        } catch { setError('Failed to load schedules'); }
        setLoading(false);
    };
    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setShowModal(true);
        if (mode === 'edit' && item) {
            setForm({ date: item.date, events: item.events });
            setSelectedId(item._id);
        } else {
            setForm({ date: '', events: [] });
            setSelectedId(null);
        }
    };
    const closeModal = () => { setShowModal(false); setForm({ date: '', events: [] }); setSelectedId(null); setError(''); };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };
    // For simplicity, events input is a JSON string (advanced: use dynamic form fields)
    const handleEventsChange = (e) => {
        try {
            setForm((f) => ({ ...f, events: JSON.parse(e.target.value) }));
            setError('');
        } catch {
            setError('Invalid events JSON');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await axiosInstance.post('/schedule', form);
                setSuccess('Schedule added!');
            } else {
                await axiosInstance.patch(`/schedule/${selectedId}`, form);
                setSuccess('Schedule updated!');
            }
            closeModal();
            fetchSchedules();
        } catch { setError('Failed to save schedule'); }
        setTimeout(() => setSuccess(''), 2000);
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/schedule/${id}`);
            setSuccess('Schedule deleted!');
            fetchSchedules();
        } catch { setError('Failed to delete schedule'); }
        setDeletingId(null);
        setTimeout(() => setSuccess(''), 2000);
    };
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
                <Button className="bg-pink-600 text-white font-semibold px-6" onClick={() => openModal('add')}>Add Schedule</Button>
            </div>
            {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
            {loading ? (<div>Loading...</div>) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="py-2 px-4">Date</th>
                                <th className="py-2 px-4">Events (JSON)</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((item) => (
                                <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                                    <td className="py-2 px-4 font-semibold">{item.date}</td>
                                    <td className="py-2 px-4 text-xs max-w-xs overflow-x-auto">{JSON.stringify(item.events)}</td>
                                    <td className="py-2 px-4 flex gap-2">
                                        <Button className="bg-blue-500 text-white px-4" onClick={() => openModal('edit', item)}>Edit</Button>
                                        <Button className="bg-red-500 text-white px-4" onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}>{deletingId === item._id ? 'Deleting...' : 'Delete'}</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fadeIn">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeModal}>&times;</button>
                        <h3 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Schedule' : 'Edit Schedule'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Date (YYYY-MM-DD)</label>
                                <input type="text" name="date" value={form.date} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Events (JSON array)</label>
                                <textarea name="events" value={JSON.stringify(form.events)} onChange={handleEventsChange} className="w-full border rounded px-3 py-2" rows={3} required />
                                <span className="text-xs text-gray-500">Example: [{'{'}"eventId":"...","time":"10:00 AM","venue":"Main Stage","type":"cultural","status":"upcoming"{'}'}]</span>
                            </div>
                            <Button type="submit" className="bg-pink-600 text-white font-semibold w-full">{modalMode === 'add' ? 'Add' : 'Save'}</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManager; 