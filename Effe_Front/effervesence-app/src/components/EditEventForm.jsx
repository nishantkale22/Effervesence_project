import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const EditEventForm = () => {
    const { id: eventId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        location: '',
        registrationDeadline: '',
        mainImageUrl: '',
        galleryImages: [],
        display: false,
    });

    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch event details to populate form
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axiosInstance.get(`/event/${eventId}`);
                const event = data.event;
                setForm({
                    ...event,
                    scheduledDate: event.scheduledDate?.slice(0, 10),
                    registrationDeadline: event.registrationDeadline?.slice(0, 16),
                });
            } catch (err) {
                setError('Failed to fetch event data');
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const uploadToGCS = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        const { data } = await axiosInstance.post('/upload/single', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.fileUrl;
    };

    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingMain(true);
        try {
            const url = await uploadToGCS(file);
            setForm((p) => ({ ...p, mainImageUrl: url }));
            setSuccess('Main image uploaded');
        } catch (err) {
            console.error(err);
            setError('Main image upload failed');
        } finally {
            setUploadingMain(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploadingGallery(true);
        try {
            const urls = await Promise.all(files.map(uploadToGCS));
            setForm((p) => ({ ...p, galleryImages: urls }));
            setSuccess('Gallery images uploaded');
        } catch (err) {
            console.error(err);
            setError('Gallery upload failed');
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const payload = { ...form };
            const { data } = await axiosInstance.put(`/event/${eventId}`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            setSuccess('Event updated!');
            navigate(`/event/${eventId}`);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Server error');
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Edit Event</h2>
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {['title', 'description', 'location'].map((name) =>
                    name === 'description' ? (
                        <textarea
                            key={name}
                            name={name}
                            value={form[name]}
                            onChange={handleChange}
                            placeholder={name}
                            rows={4}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    ) : (
                        <input
                            key={name}
                            name={name}
                            value={form[name]}
                            onChange={handleChange}
                            placeholder={name}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    )
                )}

                <input
                    type="date"
                    name="scheduledDate"
                    value={form.scheduledDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
                <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
                <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
                <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={form.registrationDeadline}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />

                <label>Upload Main Image
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} />
                </label>
                {form.mainImageUrl && (
                    <img src={form.mainImageUrl} alt="main preview" className="h-40 border mt-1" />
                )}

                <label>Upload Gallery Images
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
                </label>
                {form.galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {form.galleryImages.map((url, i) => (
                            <img key={i} src={url} alt={`g${i}`} className="h-24 object-contain border" />
                        ))}
                    </div>
                )}

                <label className="flex items-center gap-2">
                    <input type="checkbox" name="display" checked={form.display} onChange={handleChange} />
                    Display to public
                </label>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Update Event
                </button>
            </form>
        </div>
    );
};

export default EditEventForm;
