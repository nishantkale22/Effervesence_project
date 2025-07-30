import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Edit3, Trash2, ImagePlus, Loader, Eye } from 'lucide-react';

const Event = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const fileInputRef = useRef(null);

    const fetchEvent = async () => {
        try {
            const { data } = await axiosInstance.get(`/event/${id}`);
            setEvent(data.event);
        } catch {
            setError('Failed to fetch event.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axiosInstance.delete(`/event/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                });
                alert('Event deleted');
                navigate(-1);
            } catch {
                alert('Delete failed');
            }
        }
    };

    const handleEdit = () => navigate(`/events/${id}/edit`);

    const handleToggleVisibility = async () => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('accessToken');
            const url = event.display ? `/event/${id}/make-private` : `/event/${id}/make-public`;
            const { data } = await axiosInstance.put(
                url,
                event.display ? { display: false } : {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvent(data.updatedEvent || data.event);
        } catch {
            alert('Failed to toggle visibility');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddGallery = () => {
        fileInputRef.current.value = ''; // reset file input
        fileInputRef.current.click();
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return alert('Authorization expired. Please log in again.');

        setUploadingGallery(true);
        try {
            const urls = await Promise.all(
                files.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    return axiosInstance.post('/upload/single', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }).then(res => res.data.fileUrl);
                })
            );

            const { data } = await axiosInstance.put(`/event/${id}/gallery/add`, {
                images: urls
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEvent(data.event);
        } catch {
            alert('Gallery upload failed');
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleRemoveGalleryImage = async (imageUrl) => {
        if (!window.confirm('Remove this image?')) return;
        try {
            const { data } = await axiosInstance.put(`/event/${id}/gallery/remove`, {
                imageUrl
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            setEvent(data.event);
        } catch {
            alert('Failed to remove image');
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    if (loading) return <div className="p-6 text-center animate-pulse text-gray-400">Loading event...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!event) return null;

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow rounded-lg space-y-6">
            <h1 className="text-3xl font-bold text-indigo-600">{event.title}</h1>

            {event.mainImageUrl && (
                <img
                    src={event.mainImageUrl}
                    alt="Main Event"
                    className="w-full h-64 object-cover rounded-lg shadow"
                />
            )}

            <div className="space-y-2 text-gray-800">
                <p className="text-lg">{event.description}</p>
                <p><strong>Date:</strong> {event.scheduledDate}</p>
                <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Created By:</strong> {event.createdBy?.name || 'Unknown'}</p>
                <p><strong>Visible to Public:</strong> {event.display ? 'Yes' : 'No'}</p>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Gallery</h2>
                {event.galleryImages?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {event.galleryImages.map((url, idx) => (
                            <div key={idx} className="relative group">
                                <img
                                    src={url}
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-40 object-cover rounded shadow"
                                />
                                <button
                                    onClick={() => handleRemoveGalleryImage(url)}
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
                                    title="Remove Image"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No gallery images yet.</p>
                )}
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    ref={fileInputRef}
                    onChange={handleGalleryUpload}
                />

                <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow"
                >
                    <Edit3 size={18} /> Edit Event
                </button>

                <button
                    onClick={handleAddGallery}
                    disabled={uploadingGallery}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow"
                >
                    {uploadingGallery ? (
                        <>
                            <Loader className="animate-spin" size={18} /> Uploading...
                        </>
                    ) : (
                        <>
                            <ImagePlus size={18} /> Add Gallery
                        </>
                    )}
                </button>

                <button
                    onClick={handleToggleVisibility}
                    disabled={updating}
                    className={`flex items-center gap-2 px-4 py-2 ${event.display ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
                        } text-white rounded shadow`}
                >
                    {updating ? (
                        <>
                            <Loader className="animate-spin" size={18} /> Updating...
                        </>
                    ) : (
                        <>
                            <Eye size={18} /> {event.display ? 'Make Private' : 'Make Public'}
                        </>
                    )}
                </button>

                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow"
                >
                    <Trash2 size={18} /> Delete Event
                </button>
            </div>
        </div>
    );
};

export default Event;
