import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Button from './ui/Button';

const AnnouncementsManager = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [form, setForm] = useState({ message: '', type: 'info', target: 'all', display: true });
    const [selectedId, setSelectedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchAnnouncements(); }, []);
    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/announcements');
            setAnnouncements(res.data);
        } catch { setError('Failed to load announcements'); }
        setLoading(false);
    };
    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setShowModal(true);
        if (mode === 'edit' && item) {
            setForm({ message: item.message, type: item.type, target: item.target, display: item.display });
            setSelectedId(item._id);
        } else {
            setForm({ message: '', type: 'info', target: 'all', display: true });
            setSelectedId(null);
        }
    };
    const closeModal = () => { setShowModal(false); setForm({ message: '', type: 'info', target: 'all', display: true }); setSelectedId(null); setError(''); };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await axiosInstance.post('/announcements', form);
                setSuccess('Announcement added!');
            } else {
                await axiosInstance.patch(`/announcements/${selectedId}`, form);
                setSuccess('Announcement updated!');
            }
            closeModal();
            fetchAnnouncements();
        } catch { setError('Failed to save announcement'); }
        setTimeout(() => setSuccess(''), 2000);
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/announcements/${id}`);
            setSuccess('Announcement deleted!');
            fetchAnnouncements();
        } catch { setError('Failed to delete announcement'); }
        setDeletingId(null);
        setTimeout(() => setSuccess(''), 2000);
    };
    const handleToggleDisplay = async (item) => {
        try {
            await axiosInstance.patch(`/announcements/${item._id}`, { display: !item.display });
            fetchAnnouncements();
        } catch { setError('Failed to update display status'); }
    };
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Announcements Management</h2>
                <Button className="bg-pink-600 text-white font-semibold px-6" onClick={() => openModal('add')}>Add Announcement</Button>
            </div>
            {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
            {loading ? (<div>Loading...</div>) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="py-2 px-4">Message</th>
                                <th className="py-2 px-4">Type</th>
                                <th className="py-2 px-4">Target</th>
                                <th className="py-2 px-4">Display</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map((item) => (
                                <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                                    <td className="py-2 px-4 font-semibold">{item.message}</td>
                                    <td className="py-2 px-4">{item.type}</td>
                                    <td className="py-2 px-4">{item.target}</td>
                                    <td className="py-2 px-4">
                                        <button className={`px-3 py-1 rounded-full text-xs font-bold ${item.display ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`} onClick={() => handleToggleDisplay(item)}>{item.display ? 'Visible' : 'Hidden'}</button>
                                    </td>
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
                        <h3 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Announcement' : 'Edit Announcement'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Message</label>
                                <textarea name="message" value={form.message} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Type</label>
                                <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
                                    <option value="info">Info</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="winner">Winner</option>
                                    <option value="alert">Alert</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Target</label>
                                <input type="text" name="target" value={form.target} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="display" checked={form.display} onChange={handleChange} id="display" />
                                <label htmlFor="display" className="text-sm">Visible to Attendees</label>
                            </div>
                            <Button type="submit" className="bg-pink-600 text-white font-semibold w-full">{modalMode === 'add' ? 'Add' : 'Save'}</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsManager; 