import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Button from './ui/Button';

const MediaManager = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ eventId: '', type: 'image', file: null, url: '' });
    const [deletingId, setDeletingId] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchMedia(); }, []);
    const fetchMedia = async () => {
        setLoading(true);
        try {
            // For demo, fetch all media (in real app, filter by eventId)
            const res = await axiosInstance.get('/media?eventId=');
            setMedia(res.data);
        } catch { setError('Failed to load media'); }
        setLoading(false);
    };
    const openModal = () => { setShowModal(true); setForm({ eventId: '', type: 'image', file: null, url: '' }); };
    const closeModal = () => { setShowModal(false); setForm({ eventId: '', type: 'image', file: null, url: '' }); setError(''); };
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setForm((f) => ({ ...f, file, url: file ? URL.createObjectURL(file) : '' }));
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('eventId', form.eventId);
            formData.append('type', form.type);
            if (form.file) formData.append('file', form.file);
            await axiosInstance.post('/media', formData);
            setSuccess('Media uploaded!');
            closeModal();
            fetchMedia();
        } catch { setError('Failed to upload media'); }
        setTimeout(() => setSuccess(''), 2000);
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this media?')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/media/${id}`);
            setSuccess('Media deleted!');
            fetchMedia();
        } catch { setError('Failed to delete media'); }
        setDeletingId(null);
        setTimeout(() => setSuccess(''), 2000);
    };
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Media Management</h2>
                <Button className="bg-pink-600 text-white font-semibold px-6" onClick={openModal}>Add Media</Button>
            </div>
            {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
            {loading ? (<div>Loading...</div>) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="py-2 px-4">Event ID</th>
                                <th className="py-2 px-4">Type</th>
                                <th className="py-2 px-4">Preview</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {media.map((item) => (
                                <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                                    <td className="py-2 px-4 font-semibold">{item.eventId}</td>
                                    <td className="py-2 px-4">{item.type}</td>
                                    <td className="py-2 px-4">
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt="media" className="w-16 h-16 object-cover rounded border" />
                                        ) : (
                                            <video src={item.url} controls className="w-24 h-16 rounded border" />
                                        )}
                                    </td>
                                    <td className="py-2 px-4 flex gap-2">
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
                        <h3 className="text-xl font-bold mb-4">Add Media</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Event ID</label>
                                <input type="text" name="eventId" value={form.eventId} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Type</label>
                                <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">File</label>
                                <input type="file" name="file" accept="image/*,video/*" onChange={handleChange} className="w-full" required />
                                {form.url && (
                                    form.type === 'image' ? (
                                        <img src={form.url} alt="Preview" className="w-24 h-24 object-cover rounded mt-2 border" />
                                    ) : (
                                        <video src={form.url} controls className="w-24 h-16 rounded mt-2 border" />
                                    )
                                )}
                            </div>
                            <Button type="submit" className="bg-pink-600 text-white font-semibold w-full">Upload</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaManager; 