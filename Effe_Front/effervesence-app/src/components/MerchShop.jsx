import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import MerchCard from './MerchCard';
import MerchDetailsModal from './MerchDetailsModal';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';

const MerchShop = () => {
    const [merchList, setMerchList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedMerch, setSelectedMerch] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);

    useEffect(() => {
        const fetchMerch = async () => {
            try {
                const res = await axiosInstance.get('/merch');
                setMerchList(res.data);
            } catch (err) {
                setError('Failed to load merchandise. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchMerch();
    }, []);

    const handleAddToCart = (merch) => {
        setSelectedMerch(merch);
    };

    const handleModalAddToCart = (item) => {
        setCart(prev => {
            const idx = prev.findIndex(c => c._id === item._id && c.size === item.size);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx].quantity += item.quantity;
                return updated;
            }
            return [...prev, item];
        });
        setSelectedMerch(null);
    };

    const handleUpdateCartItem = (idx, updatedItem) => {
        setCart(prev => prev.map((item, i) => (i === idx ? updatedItem : item)));
    };

    const handleRemoveCartItem = (idx) => {
        setCart(prev => prev.filter((_, i) => i !== idx));
    };

    const handleCheckout = () => {
        setShowCheckout(true);
    };

    const handleOrderSuccess = () => {
        setCart([]);
        setShowCheckout(false);
        setShowCart(false);
        setOrderConfirmed(true);
    };

    if (loading) return <div className="text-center text-xl text-gray-300 py-20">Loading merchandise...</div>;
    if (error) return <div className="text-center text-xl text-red-400 py-20">{error}</div>;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-12 px-4 md:px-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center drop-shadow-lg">Merchandise Shop</h1>

            <div className="flex justify-end max-w-6xl mx-auto mb-4">
                <button
                    className="relative px-6 py-2 bg-pink-600 text-white rounded-full font-bold shadow-lg"
                    onClick={() => setShowCart(true)}
                >
                    Cart
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-2 text-xs font-bold">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {merchList.map(merch => (
                    <MerchCard key={merch._id} merch={merch} onAddToCart={handleAddToCart} />
                ))}
            </div>

            {selectedMerch && (
                <MerchDetailsModal
                    merch={selectedMerch}
                    onClose={() => setSelectedMerch(null)}
                    onAddToCart={handleModalAddToCart}
                />
            )}

            {showCart && (
                <CartDrawer
                    cart={cart}
                    onUpdateItem={handleUpdateCartItem}
                    onRemoveItem={handleRemoveCartItem}
                    onCheckout={handleCheckout}
                    onClose={() => setShowCart(false)}
                />
            )}

            {showCheckout && (
                <CheckoutModal
                    cart={cart}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={handleOrderSuccess}
                />
            )}

            {orderConfirmed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                        <h2 className="text-2xl font-bold text-green-600 mb-4">Order Confirmed!</h2>
                        <p className="mb-4">Thank you for your purchase. Your order has been placed successfully.</p>
                        <button onClick={() => setOrderConfirmed(false)} className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold">
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchShop;
