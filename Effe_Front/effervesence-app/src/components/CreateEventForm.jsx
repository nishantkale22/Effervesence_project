// CreateEventForm.jsx (Frontend)
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const CreateEventForm = ({ onEventCreated }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        location: '',
        mainImageUrl: '',
        galleryImages: [],
        display: false,
        isFreeForAll: false,
        isFreeForStudents: false,
        price: 0,
    });

    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        // Only one of isFreeForAll or isFreeForStudents can be true
        if (name === 'isFreeForAll' && checked) {
            setForm((p) => ({ ...p, isFreeForAll: true, isFreeForStudents: false }));
        } else if (name === 'isFreeForStudents' && checked) {
            setForm((p) => ({ ...p, isFreeForAll: false, isFreeForStudents: true }));
        } else {
            setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const uploadToGCS = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        const { data } = await axiosInstance.post('/upload/single', fd, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
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
            if (!payload.galleryImages.length) delete payload.galleryImages;

            const { data } = await axiosInstance.post('/event/create', payload);

            setSuccess('Event created!');
            if (onEventCreated) onEventCreated(data.event);

            setForm({
                title: '',
                description: '',
                scheduledDate: '',
                startTime: '',
                endTime: '',
                location: '',
                mainImageUrl: '',
                galleryImages: [],
                display: false,
                isFreeForAll: false,
                isFreeForStudents: false,
                price: 0,
            });
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Server error');
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Create Event</h2>
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {['title', 'description', 'location'].map((name) => (
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
                ))}

                <input type="date" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />

                <label>Upload Main Image
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} />
                </label>
                {form.mainImageUrl && <img src={form.mainImageUrl} alt="main preview" className="h-40 border mt-1" />}

                <label>Upload Gallery Images
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
                </label>
                {form.galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {form.galleryImages.map((u, i) => (
                            <img key={i} src={u} alt={`g${i}`} className="h-24 object-contain border" />
                        ))}
                    </div>
                )}

                <label className="flex items-center gap-2">
                    <input type="checkbox" name="display" checked={form.display} onChange={handleChange} />
                    Display to public
                </label>

                <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="isFreeForAll" checked={form.isFreeForAll} onChange={handleChange} />
                        Free for all
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="isFreeForStudents" checked={form.isFreeForStudents} onChange={handleChange} />
                        Free for students only
                    </label>
                </div>
                {!(form.isFreeForAll || form.isFreeForStudents) && (
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Event Price (for outsiders)"
                        min="0"
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                )}

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Create Event
                </button>
            </form>
        </div>
    );
};

export default CreateEventForm;
