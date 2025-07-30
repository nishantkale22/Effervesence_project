import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { motion } from 'framer-motion';
// Razorpay script loader utility
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-sdk')) return resolve(true);
        const script = document.createElement('script');
        script.id = 'razorpay-sdk';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}
const Section = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-2xl font-bold text-pink-400 mb-2">{title}</h3>
        <div className="bg-white/10 rounded-xl p-4 text-gray-200">{children}</div>
    </div>
);

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [regStatus, setRegStatus] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const paymentRef = useRef();

    useEffect(() => {
        setLoading(true);
        axiosInstance.get(`/event/display/${eventId}`)
            .then(res => {
                setEvent(res.data.event);
                setLoading(false);
            })
            .catch(() => {
                setError('Event not found or not public.');
                setLoading(false);
            });
    }, [eventId]);

    useEffect(() => {
        axiosInstance.get('/user/me')
            .then(res => setUser(res.data.user))
            .catch(() => setUser(null));
    }, []);

    useEffect(() => {
        if (!user || !event) return;
        // Check if user is already registered
        if (event.registeredUsers && event.registeredUsers.some(u => u._id === user._id)) {
            setRegStatus('registered');
        } else {
            setRegStatus('not_registered');
        }
    }, [user, event]);

    if (loading) return <div className="text-center text-xl text-gray-300 py-20">Loading event details...</div>;
    if (error) return <div className="text-center text-xl text-red-400 py-20">{error}</div>;
    if (!event) return null;

    const { title, description, scheduledDate, startTime, endTime, location, mainImageUrl, galleryImages = [], guidelines, rules, isFreeForAll, isFreeForStudents, price, registrationDeadline } = event;

    // Registration deadline logic: 2 hours before event start
    const eventStart = new Date(scheduledDate + 'T' + startTime);
    const regDeadline = registrationDeadline ? new Date(registrationDeadline) : new Date(eventStart.getTime() - 2 * 60 * 60 * 1000);
    const now = new Date();
    const regClosed = now > regDeadline;

    // Determine if user is student
    const isStudent = user && (user.role === 'student' || user.userType === 'student');
    let eventStatus = '';
    if (isFreeForAll) {
        eventStatus = 'Free for everyone';
    } else if (isFreeForStudents) {
        eventStatus = isStudent ? 'Free for you (student)' : `Paid for outsiders: ₹${price}`;
    } else {
        eventStatus = `Paid event: ₹${price}`;
    }
    const handleRegister = async () => {
        setRegLoading(true);
        setError('');
        setPaymentStatus('');
        try {
            if ((!isFreeForAll && !(isFreeForStudents && isStudent)) && price > 0) {
                const res = await axiosInstance.post('/event/payment/order', {
                    amount: price,
                    receipt: `evt${eventId.slice(-6)}_u${user._id.slice(-6)}`
                });
                const { order } = res.data;
                const loaded = await loadRazorpayScript();
                if (!loaded) {
                    setError('Failed to load payment gateway.');
                    setRegLoading(false);
                    return;
                }
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: title,
                    description: description,
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            await axiosInstance.post(`/event/${eventId}/register`, {
                                payment: {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                }
                            });
                            setRegStatus('registered');
                            setPaymentStatus('success');
                        } catch (err) {
                            setError('Payment verification or registration failed.');
                            setPaymentStatus('failure');
                        } finally {
                            setRegLoading(false);
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                    },
                    theme: {
                        color: '#ec4899',
                    },
                    modal: {
                        ondismiss: function () {
                            setRegLoading(false);
                            setPaymentStatus('cancelled');
                        }
                    }
                };
                const rzp = new window.Razorpay(options);
                paymentRef.current = rzp;
                rzp.open();
                return;
            }
            // Free registration
            await axiosInstance.post(`/event/${eventId}/register`);
            setRegStatus('registered');
        } catch (err) {
            setError('Registration failed.');
        } finally {
            setRegLoading(false);
        }
    };



    return (
        <>
            {paymentStatus === 'success' && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
                        <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
                        <p className="mb-4">You have been registered for this event.</p>
                        <button onClick={() => setPaymentStatus('')} className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold">OK</button>
                    </div>
                </div>
            )}

            {paymentStatus === 'failure' && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
                        <p className="mb-4">There was an issue with your payment or registration. Please try again.</p>
                        <button onClick={() => setPaymentStatus('')} className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold">Close</button>
                    </div>
                </div>
            )}

            {paymentStatus === 'cancelled' && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Payment Cancelled</h2>
                        <p className="mb-4">You cancelled the payment. No registration was made.</p>
                        <button onClick={() => setPaymentStatus('')} className="px-6 py-2 bg-gray-600 text-white rounded-full font-semibold">Close</button>
                    </div>
                </div>
            )}

            <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-12 px-4 md:px-12">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-lg"
                >
                    ← Back
                </button>

                <motion.div
                    className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {mainImageUrl && (
                        <img src={mainImageUrl} alt={title} className="w-full h-72 object-cover" />
                    )}

                    <div className="p-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">{title}</h1>
                        <div className="flex flex-wrap gap-6 text-lg text-pink-300 font-semibold mb-4">
                            <span>{scheduledDate ? new Date(scheduledDate).toLocaleDateString() : ''}</span>
                            <span>{startTime} - {endTime}</span>
                            <span>{location}</span>
                        </div>

                        <div className="mb-4">
                            <span className="inline-block px-4 py-2 rounded-full bg-pink-600 text-white font-bold text-lg mr-4">{eventStatus}</span>
                            {regClosed && <span className="inline-block px-4 py-2 rounded-full bg-gray-500 text-white font-bold text-lg">Registration Closed</span>}
                            {regStatus === 'registered' && <span className="inline-block px-4 py-2 rounded-full bg-green-600 text-white font-bold text-lg">Registered</span>}
                        </div>

                        {!regClosed && regStatus !== 'registered' && user && (
                            <button
                                onClick={handleRegister}
                                disabled={regLoading}
                                className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold shadow-lg transition-all text-lg"
                            >
                                {regLoading ? 'Registering...' : 'Register'}
                            </button>
                        )}
                        {!user && <div className="text-yellow-300 mt-2">Please log in to register for this event.</div>}

                        <Section title="Description">
                            <p>{description}</p>
                        </Section>

                        {guidelines && (
                            <Section title="Guidelines">
                                <ul className="list-disc pl-6">
                                    {Array.isArray(guidelines) ? guidelines.map((g, i) => <li key={i}>{g}</li>) : <li>{guidelines}</li>}
                                </ul>
                            </Section>
                        )}

                        {rules && (
                            <Section title="Rules">
                                <ul className="list-decimal pl-6">
                                    {Array.isArray(rules) ? rules.map((r, i) => <li key={i}>{r}</li>) : <li>{rules}</li>}
                                </ul>
                            </Section>
                        )}

                        {galleryImages.length > 0 && (
                            <Section title="Gallery">
                                <div className="flex flex-wrap gap-4">
                                    {galleryImages.map((img, i) => (
                                        <img key={i} src={img} alt={`Gallery ${i + 1}`} className="w-40 h-40 object-cover rounded-lg border-2 border-pink-400" />
                                    ))}
                                </div>
                            </Section>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}

export default EventDetails; 