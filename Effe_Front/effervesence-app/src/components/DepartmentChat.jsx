import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import io from 'socket.io-client';
import Button from './ui/Button';
import { Paperclip, Image as ImageIcon, Mic, Video, FileText, MoreVertical, X } from 'lucide-react';

const socket = io('http://localhost:5000', { withCredentials: true });

const DepartmentChat = ({ department, user, onRead }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null); // { type, file, url }
    const [optimisticMsgs, setOptimisticMsgs] = useState([]); // For optimistic UI
    const [showMenu, setShowMenu] = useState(null); // message id
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef();
    const imageInputRef = useRef();
    const videoInputRef = useRef();

    useEffect(() => {
        if (!department) return;
        setLoading(true);
        axiosInstance.get(`/chat/department/${department}`)
            .then(res => setMessages(res.data))
            .catch(() => setError('Failed to load messages'))
            .finally(() => setLoading(false));
        socket.emit('joinDepartment', department);
        const handler = (msg) => {
            // Remove matching optimistic message when real message arrives
            setOptimisticMsgs((prev) =>
                prev.filter(
                    (m) =>
                        !(
                            m.message === msg.message &&
                            m.type === msg.type &&
                            m.sender._id === msg.sender._id
                        )
                )
            );
            setMessages(prev => [...prev, msg]);
        };
        const deleteHandler = ({ id }) => setMessages(prev => prev.map(m => m._id === id ? { ...m, deletedForEveryone: true } : m));
        socket.on('departmentMessage', handler);
        socket.on('departmentMessageDeleted', deleteHandler);
        if (onRead) onRead();
        socket.emit('departmentChatRead', { department, userId: user._id });
        return () => {
            socket.off('departmentMessage', handler);
            socket.off('departmentMessageDeleted', deleteHandler);
        };
    }, [department, user._id, onRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, optimisticMsgs]);

    // --- Optimistic Send ---
    const optimisticSend = (msg) => {
        setOptimisticMsgs((prev) => [...prev, msg]);
        setTimeout(() => setOptimisticMsgs((prev) => prev.filter(m => m._optimisticId !== msg._optimisticId)), 5000);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const optimisticMsg = {
            _optimisticId: Date.now(),
            sender: user,
            message: input,
            type: 'text',
            createdAt: new Date(),
        };
        optimisticSend(optimisticMsg);
        setInput('');
        try {
            await axiosInstance.post(`/chat/department/${department}`, { message: optimisticMsg.message });
        } catch {
            setError('Failed to send message');
        }
    };

    // --- File Preview & Upload ---
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview({ type, file, url });
        e.target.value = '';
    };
    const cancelPreview = () => setPreview(null);
    const sendPreview = async () => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', preview.file);
            const { data } = await axiosInstance.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const optimisticMsg = {
                _optimisticId: Date.now(),
                sender: user,
                type: preview.type,
                fileUrl: preview.url,
                createdAt: new Date(),
            };
            optimisticSend(optimisticMsg);
            await axiosInstance.post(`/chat/department/${department}`, {
                type: preview.type,
                fileUrl: data.fileUrl,
                message: '',
            });
            setPreview(null);
        } catch {
            setError('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    // --- Audio Recording (Voice Note) ---
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const startRecording = async () => {
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new window.MediaRecorder(stream);
            setMediaRecorder(recorder);
            setAudioChunks([]);
            recorder.ondataavailable = (e) => setAudioChunks((prev) => [...prev, e.data]);
            recorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setPreview({ type: 'audio', file: blob, url });
            };
            recorder.start();
            setRecording(true);
        } catch {
            setError('Microphone access denied');
        }
    };
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    // --- Delete Message ---
    const handleDeleteForMe = async (id) => {
        await axiosInstance.patch(`/chat/message/${id}/delete-for-me`);
        setMessages((prev) => prev.filter(m => m._id !== id));
        setShowMenu(null);
    };
    const handleDeleteForEveryone = async (id) => {
        await axiosInstance.patch(`/chat/message/${id}/delete-for-everyone`);
        setMessages((prev) => prev.map(m => m._id === id ? { ...m, deletedForEveryone: true } : m));
        setShowMenu(null);
    };

    // --- Message Rendering ---
    const renderMessage = (msg, isMe) => {
        if (msg.deletedForEveryone) {
            return <div className="italic text-gray-400 text-sm">This message was deleted</div>;
        }
        if (msg.type === 'image') {
            return <img src={msg.fileUrl} alt="sent" className="max-w-xs max-h-60 rounded-lg border" />;
        }
        if (msg.type === 'audio') {
            return <audio controls src={msg.fileUrl} className="w-48" />;
        }
        if (msg.type === 'video') {
            return <video controls src={msg.fileUrl} className="max-w-xs max-h-60 rounded-lg border" />;
        }
        if (msg.type === 'file') {
            return <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1"><FileText size={16} />Download File</a>;
        }
        return <div className={`px-4 py-2 rounded-2xl shadow text-sm ${isMe ? 'bg-pink-600 text-white' : 'bg-white text-gray-900 border'}`}>{msg.message}</div>;
    };

    // --- Notification (Toast) ---
    useEffect(() => {
        const handler = (msg) => {
            if (msg.sender?._id !== user._id && document.visibilityState !== 'visible') {
                // Show browser notification
                if (window.Notification && Notification.permission === 'granted') {
                    new Notification(`${msg.sender?.name || 'Someone'}: ${msg.type === 'text' ? msg.message : msg.type}`);
                }
            }
        };
        socket.on('departmentMessage', handler);
        return () => socket.off('departmentMessage', handler);
    }, [user._id]);
    useEffect(() => {
        if (window.Notification && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    // --- Combine optimistic and real messages ---
    const allMessages = [...messages, ...optimisticMsgs];

    return (
        <div className="bg-white rounded-lg shadow-lg border p-0 flex flex-col h-[500px] max-w-2xl mx-auto">
            {/* // ... existing code ... */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                    {department && department !== 'none' ? `${department} Department Chat` : 'Department Chat'}
                </h2>
                {uploading && <span className="text-xs text-pink-600 ml-2">Uploading...</span>}
            </div>
            {/* // ... existing code ... */}
            {/* Preview before sending */}
            {preview && (
                <div className="px-6 py-4 border-b border-pink-200 bg-pink-50 flex items-center gap-4">
                    <div>
                        {preview.type === 'image' && <img src={preview.url} alt="preview" className="max-w-xs max-h-40 rounded-lg border" />}
                        {preview.type === 'audio' && <audio controls src={preview.url} className="w-48" />}
                        {preview.type === 'video' && <video controls src={preview.url} className="max-w-xs max-h-40 rounded-lg border" />}
                        {preview.type === 'file' && <span className="text-gray-700">{preview.file.name}</span>}
                    </div>
                    <Button className="bg-pink-600 text-white font-semibold px-4 mr-2" onClick={sendPreview} disabled={uploading}>Send</Button>
                    <Button className="bg-gray-200 text-gray-800 px-4" onClick={cancelPreview} disabled={uploading}><X size={18} /></Button>
                </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
                {loading ? <div>Loading...</div> : null}
                {error && <div className="text-red-500">{error}</div>}
                {allMessages.map((msg, i) => {
                    const isMe = (msg.sender?._id || msg.sender?._id === undefined) ? msg.sender._id === user._id : false;
                    return (
                        <div key={msg._id || msg._optimisticId || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                            <div className={`max-w-[70%] flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <img src={msg.sender?.photo} alt={msg.sender?.name} className="w-8 h-8 rounded-full border border-gray-200 shadow" />
                                <div>
                                    {renderMessage(msg, isMe)}
                                    <div className="text-xs text-gray-400 mt-1 ml-1">{msg.sender?.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                {/* Message menu */}
                                {!msg.deletedForEveryone && (
                                    <div className="relative">
                                        <button type="button" className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded-full hover:bg-gray-100 transition" onClick={() => setShowMenu(msg._id)}><MoreVertical size={18} /></button>
                                        {showMenu === msg._id && (
                                            <div className="absolute z-10 right-0 mt-2 bg-white border rounded shadow-lg text-sm min-w-[140px]">
                                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleDeleteForMe(msg._id)}>Delete for me</button>
                                                {isMe && <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-pink-600" onClick={() => handleDeleteForEveryone(msg._id)}>Delete for everyone</button>}
                                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => setShowMenu(null)}>Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex items-center border-t border-gray-200 px-4 py-3 bg-white gap-2">
                {/* Upload/Record Buttons */}
                <button type="button" className="p-2 rounded-full hover:bg-gray-100" title="Attach File" onClick={() => fileInputRef.current.click()}><Paperclip size={20} /></button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFileChange(e, 'file')} />
                <button type="button" className="p-2 rounded-full hover:bg-gray-100" title="Send Image" onClick={() => imageInputRef.current.click()}><ImageIcon size={20} /></button>
                <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={e => handleFileChange(e, 'image')} />
                <button type="button" className="p-2 rounded-full hover:bg-gray-100" title="Send Video" onClick={() => videoInputRef.current.click()}><Video size={20} /></button>
                <input type="file" accept="video/*" ref={videoInputRef} className="hidden" onChange={e => handleFileChange(e, 'video')} />
                <button type="button" className={`p-2 rounded-full hover:bg-gray-100 ${recording ? 'bg-pink-100' : ''}`} title={recording ? 'Stop Recording' : 'Record Voice Note'} onClick={recording ? stopRecording : startRecording}><Mic size={20} className={recording ? 'text-pink-600 animate-pulse' : ''} /></button>
                {/* Text Input and Send */}
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <Button type="submit" className="bg-pink-600 text-white font-semibold px-6">Send</Button>
            </form>
        </div>
    );
};

export default DepartmentChat; 