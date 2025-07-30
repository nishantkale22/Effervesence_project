import React from 'react';

const MerchCard = ({ merch, onAddToCart }) => {
  const allOutOfStock =
    (merch.sizes && merch.sizes.length > 0 && merch.sizes.every(s => s.stock === 0)) ||
    (merch.sizes.length === 0 && merch.stock === 0);

  return (
    <div className="bg-white/10 rounded-xl shadow-lg p-4 flex flex-col items-center relative hover:scale-105 transition-transform">
      <img src={merch.imageUrl} alt={merch.name} className="w-40 h-40 object-cover rounded-lg mb-3 border-2 border-pink-400" />
      <h3 className="text-xl font-bold text-pink-400 mb-1 text-center">{merch.name}</h3>
      <div className="text-lg text-white font-semibold mb-2">₹{merch.price}</div>
      {merch.sizes && merch.sizes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {merch.sizes.map((s, i) => (
            <span key={i} className={`px-2 py-1 rounded-full text-xs font-bold ${s.stock === 0 ? 'bg-gray-400 text-white' : 'bg-pink-600 text-white'}`}>{s.size} {s.stock === 0 ? '(Out)' : ''}</span>
          ))}
        </div>
      )}
      {allOutOfStock && (
        <span className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">Out of Stock</span>
      )}
      <button
        className={`mt-2 px-6 py-2 rounded-full font-bold shadow-lg text-white text-lg transition-all ${allOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'}`}
        onClick={() => onAddToCart(merch)}
        disabled={allOutOfStock}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default MerchCard;
