import React from 'react';

const MerchTab = ({ merchStock, merchOrders, salesSummary, merchLoading, merchError }) => (
    <div>
        <h2 className="text-2xl font-bold mb-6">Merchandise Inventory</h2>
        {merchLoading ? (
            <div>Loading inventory...</div>
        ) : merchError ? (
            <div className="text-red-500">{merchError}</div>
        ) : (
            <div className="overflow-x-auto mb-8">
                <table className="min-w-full bg-white rounded-xl shadow-lg">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Stock</th>
                            <th className="px-4 py-2">Sizes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {merchStock.map(m => (
                            <tr key={m._id} className="hover:bg-indigo-50 transition">
                                <td className="px-4 py-2">{m.name}</td>
                                <td className="px-4 py-2">₹{m.price}</td>
                                <td className="px-4 py-2">{m.sizes && m.sizes.length > 0 ? m.sizes.reduce((s, sz) => s + sz.stock, 0) : m.stock}</td>
                                <td className="px-4 py-2">{m.sizes && m.sizes.length > 0 ? m.sizes.map(sz => `${sz.size}: ${sz.stock}`).join(', ') : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        <h2 className="text-2xl font-bold mb-6">Order History</h2>
        {merchLoading ? (
            <div>Loading orders...</div>
        ) : merchError ? (
            <div className="text-red-500">{merchError}</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-lg">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2">Order ID</th>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Items</th>
                            <th className="px-4 py-2">Total</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {merchOrders.map(order => (
                            <tr key={order._id} className="hover:bg-indigo-50 transition">
                                <td className="px-4 py-2">{order._id}</td>
                                <td className="px-4 py-2">{order.user ? `${order.user.name} (${order.user.email})` : '-'}</td>
                                <td className="px-4 py-2">{order.items.map(i => `${i.name} (${i.size || 'Free'}) x${i.quantity}`).join(', ')}</td>
                                <td className="px-4 py-2">₹{order.total}</td>
                                <td className="px-4 py-2">{order.status}</td>
                                <td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        <h2 className="text-2xl font-bold mb-6 mt-8">Sales Breakdown</h2>
        {salesSummary && (
            <div className="bg-white rounded-xl shadow-lg p-6">
                {Object.entries(salesSummary.salesByMerch).map(([id, merch]) => (
                    <div key={id} className="mb-4">
                        <div className="font-bold text-indigo-700">{merch.name}</div>
                        <div>Total Sold: <span className="font-semibold">{merch.total}</span></div>
                        <div className="text-sm text-gray-500">By Size: {Object.entries(merch.sizeSales).map(([size, qty]) => `${size}: ${qty}`).join(', ')}</div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default MerchTab;