import React from 'react';

const CartDrawer = ({ cart, onUpdateItem, onRemoveItem, onCheckout, onClose }) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-pink-600 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Your Cart</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500 text-center mt-20">Your cart is empty.</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 mb-6 border-b pb-4">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg border-2 border-pink-400" />
                <div className="flex-1">
                  <div className="font-bold text-lg text-pink-700">{item.name}</div>
                  {item.size && <div className="text-sm text-gray-600">Size: {item.size}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Qty:</span>
                    <input
                      type="number"
                      min={1}
                      max={item.maxStock || 99}
                      value={item.quantity}
                      onChange={e => onUpdateItem(idx, { ...item, quantity: Math.max(1, Number(e.target.value)) })}
                      className="w-14 px-2 py-1 rounded border border-pink-400 text-center"
                    />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Price: ₹{item.price}</div>
                </div>
                <button onClick={() => onRemoveItem(idx)} className="text-red-500 hover:text-red-700 text-xl font-bold ml-2">&times;</button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <button
            className={`w-full py-3 rounded-full font-bold text-lg shadow-lg transition-all ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
            onClick={onCheckout}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
