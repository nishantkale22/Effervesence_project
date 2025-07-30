import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const CheckoutModal = ({ cart, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      // Prepare items for backend
      const items = cart.map(item => ({ merchId: item._id, size: item.size, quantity: item.quantity }));
      // Create order in backend
      const res = await axiosInstance.post('/merch/order', { items });
      const { order, merchOrderId } = res.data;
      // Load Razorpay script
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise(resolve => { script.onload = resolve; });
      }
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Effervesence Merchandise',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response) {
          try {
            await axiosInstance.post('/merch/order/verify', {
              merchOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            onSuccess();
            onClose();
          } catch (err) {
            setError('Payment verification failed.');
          }
        },
        prefill: {},
        theme: { color: '#ec4899' },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-pink-600 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-pink-600 mb-4 text-center">Checkout</h2>
        <div className="mb-4">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center mb-2">
              <div>
                <span className="font-bold text-pink-700">{item.name}</span>
                {item.size && <span className="ml-2 text-xs text-gray-600">({item.size})</span>}
                <span className="ml-2 text-gray-500">x{item.quantity}</span>
              </div>
              <div className="text-gray-800">₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-lg font-bold mb-6">
          <span>Total</span>
          <span>₹{subtotal}</span>
        </div>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <button
          className={`w-full py-3 rounded-full font-bold text-lg shadow-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;
