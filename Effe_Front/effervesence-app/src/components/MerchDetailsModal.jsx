import React, { useState } from 'react';

const MerchDetailsModal = ({ merch, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(
    merch.sizes && merch.sizes.length > 0 ? merch.sizes.find(s => s.stock > 0)?.size : null
  );
  const [quantity, setQuantity] = useState(1);

  let maxStock = 0;
  if (merch.sizes && merch.sizes.length > 0) {
    const sizeObj = merch.sizes.find(s => s.size === selectedSize);
    maxStock = sizeObj ? sizeObj.stock : 0;
  } else {
    maxStock = merch.stock;
  }
  const outOfStock = maxStock === 0;

  const handleAdd = () => {
    if (!outOfStock) {
      onAddToCart({ ...merch, size: selectedSize, quantity });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-pink-600 text-2xl">&times;</button>
        <img src={merch.imageUrl} alt={merch.name} className="w-64 h-64 object-cover rounded-lg mx-auto mb-4 border-2 border-pink-400" />
        <h2 className="text-2xl font-bold text-pink-600 mb-2 text-center">{merch.name}</h2>
        <div className="text-lg text-gray-800 font-semibold mb-2 text-center">₹{merch.price}</div>
        <p className="text-gray-600 mb-4 text-center">{merch.description}</p>
        {merch.sizes && merch.sizes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            {merch.sizes.map((s, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-full font-bold text-sm border-2 ${selectedSize === s.size ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-pink-600 border-pink-400'} ${s.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                disabled={s.stock === 0}
              >
                {s.size} {s.stock === 0 ? '(Out)' : ''}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="font-semibold">Qty:</span>
          <input
            type="number"
            min={1}
            max={maxStock}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Math.min(maxStock, Number(e.target.value))))}
            className="w-16 px-2 py-1 rounded border border-pink-400 text-center"
            disabled={outOfStock}
          />
          <span className="text-gray-500">(In stock: {maxStock})</span>
        </div>
        <button
          className={`w-full py-3 rounded-full font-bold text-lg shadow-lg transition-all ${outOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default MerchDetailsModal;
