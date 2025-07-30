import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Button from './ui/Button';

const MerchManager = () => {
    const [merch, setMerch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', display: true, image: null, imageUrl: '', sizes: [] });
    const [selectedId, setSelectedId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [success, setSuccess] = useState('');

    // Fetch merch list
    useEffect(() => {
        fetchMerch();
    }, []);
    const fetchMerch = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/merch');
            setMerch(res.data);
        } catch {
            setError('Failed to load merchandise');
        } finally {
            setLoading(false);
        }
    };

    // Open modal for add/edit
    const openModal = (mode, merchItem = null) => {
        setModalMode(mode);
        setShowModal(true);
        if (mode === 'edit' && merchItem) {
            setForm({
                name: merchItem.name,
                description: merchItem.description,
                price: merchItem.price,
                stock: merchItem.stock,
                display: merchItem.display,
                image: null,
                imageUrl: merchItem.imageUrl,
                sizes: merchItem.sizes || [],
            });
            setSelectedId(merchItem._id);
        } else {
            setForm({ name: '', description: '', price: '', stock: '', display: true, image: null, imageUrl: '', sizes: [] });
            setSelectedId(null);
        }
    };
    const closeModal = () => {
        setShowModal(false);
        setForm({ name: '', description: '', price: '', stock: '', display: true, image: null, imageUrl: '', sizes: [] });
        setSelectedId(null);
        setError('');
    };

    // Handle form input
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'checkbox') {
            setForm((f) => ({ ...f, [name]: checked }));
        } else if (type === 'file') {
            const file = files[0];
            setForm((f) => ({ ...f, image: file, imageUrl: file ? URL.createObjectURL(file) : '' }));
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    // Add or edit merch
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('price', form.price);
            formData.append('stock', form.stock);
            formData.append('display', form.display);
            if (form.image) formData.append('image', form.image);
            if (form.sizes && form.sizes.length > 0) formData.append('sizes', JSON.stringify(form.sizes));
            if (modalMode === 'add') {
                await axiosInstance.post('/merch', formData);
                setSuccess('Merchandise added!');
            } else {
                await axiosInstance.patch(`/merch/${selectedId}`, formData);
                setSuccess('Merchandise updated!');
            }
            closeModal();
            fetchMerch();
        } catch {
            setError('Failed to save merchandise');
        } finally {
            setUploading(false);
            setTimeout(() => setSuccess(''), 2000);
        }
    };

    // Delete merch
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/merch/${id}`);
            setSuccess('Merchandise deleted!');
            fetchMerch();
        } catch {
            setError('Failed to delete merchandise');
        } finally {
            setDeletingId(null);
            setTimeout(() => setSuccess(''), 2000);
        }
    };

    // Toggle display
    const handleToggleDisplay = async (item) => {
        try {
            await axiosInstance.patch(`/merch/${item._id}`, { display: !item.display });
            fetchMerch();
        } catch {
            setError('Failed to update display status');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Merchandise Management</h2>
                <Button className="bg-pink-600 text-white font-semibold px-6" onClick={() => openModal('add')}>Add Merch</Button>
            </div>
            {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="py-2 px-4">Image</th>
                                <th className="py-2 px-4">Name</th>
                                <th className="py-2 px-4">Price</th>
                                <th className="py-2 px-4">Stock</th>
                                <th className="py-2 px-4">Display</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {merch.map((item) => (
                                <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                                    <td className="py-2 px-4">
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded shadow border" />
                                    </td>
                                    <td className="py-2 px-4 font-semibold">{item.name}</td>
                                    <td className="py-2 px-4">₹{item.price}</td>
                                    <td className="py-2 px-4">
                                        {item.sizes && item.sizes.length > 0 ? (
                                            <span className="text-xs text-gray-700">{item.sizes.map(sz => `${sz.size} (${sz.stock})`).join(', ')}</span>
                                        ) : (
                                            item.stock
                                        )}
                                    </td>
                                    <td className="py-2 px-4">
                                        <button
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${item.display ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                                            onClick={() => handleToggleDisplay(item)}
                                        >
                                            {item.display ? 'Visible' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 flex gap-2">
                                        <Button className="bg-blue-500 text-white px-4" onClick={() => openModal('edit', item)}>Edit</Button>
                                        <Button className="bg-red-500 text-white px-4" onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}>
                                            {deletingId === item._id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fadeIn">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeModal}>&times;</button>
                        <h3 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Merchandise' : 'Edit Merchandise'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold mb-1">Price (₹)</label>
                                    <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required min={0} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold mb-1">Stock</label>
                                    <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full border rounded px-3 py-2" required min={0} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="display" checked={form.display} onChange={handleChange} id="display" />
                                <label htmlFor="display" className="text-sm">Visible to Attendees</label>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Image</label>
                                <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full" />
                                {form.imageUrl && (
                                    <img src={form.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded mt-2 border" />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Sizes & Stock</label>
                                <div className="space-y-2">
                                    {form.sizes && form.sizes.length > 0 && form.sizes.map((sz, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input type="text" placeholder="Size (e.g. S, M, L, XL, XXL, Free Size)" value={sz.size} onChange={e => {
                                                const sizes = [...form.sizes];
                                                sizes[idx].size = e.target.value;
                                                setForm(f => ({ ...f, sizes }));
                                            }} className="border rounded px-2 py-1 w-32" required />
                                            <input type="number" placeholder="Stock" value={sz.stock} min={0} onChange={e => {
                                                const sizes = [...form.sizes];
                                                sizes[idx].stock = e.target.value;
                                                setForm(f => ({ ...f, sizes }));
                                            }} className="border rounded px-2 py-1 w-20" required />
                                            <button type="button" className="text-red-500 font-bold ml-2" onClick={() => {
                                                const sizes = form.sizes.filter((_, i) => i !== idx);
                                                setForm(f => ({ ...f, sizes }));
                                            }}>✕</button>
                                        </div>
                                    ))}
                                    <button type="button" className="text-pink-600 font-semibold mt-2" onClick={() => setForm(f => ({ ...f, sizes: [...(f.sizes || []), { size: '', stock: 0 }] }))}>+ Add Size</button>
                                </div>
                                <span className="text-xs text-gray-500">Leave empty for single-size items.</span>
                            </div>
                            <Button type="submit" className="bg-pink-600 text-white font-semibold w-full" disabled={uploading}>
                                {uploading ? (modalMode === 'add' ? 'Adding...' : 'Saving...') : (modalMode === 'add' ? 'Add' : 'Save')}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchManager; 