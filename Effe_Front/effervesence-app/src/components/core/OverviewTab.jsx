import React from 'react';
import { Users, CheckSquare, PieChart, Bell } from 'lucide-react';

const OverviewTab = ({ user, merchStock, merchOrders, salesSummary, merchLoading, merchError }) => (
    <>
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome, <span className="text-indigo-600">{user.name.split(' ')[0]}</span>!</h1>
            <p className="mt-1 text-base text-gray-500">
                {merchLoading ? 'Loading analytics...' : merchError ? merchError : 'Here are your latest stats.'}
            </p>
        </div>
        <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat Card 1 */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-4 border border-indigo-100">
                <div className="p-4 rounded-full bg-indigo-100 text-indigo-600 shadow">
                    <Users size={28} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500">Total Stock</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {merchStock.reduce((sum, m) => sum + (m.sizes && m.sizes.length > 0 ? m.sizes.reduce((s, sz) => s + sz.stock, 0) : m.stock), 0)}
                    </p>
                </div>
            </div>
            {/* Stat Card 2 */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-4 border border-green-100">
                <div className="p-4 rounded-full bg-green-100 text-green-600 shadow">
                    <CheckSquare size={28} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {salesSummary ? salesSummary.totalItemsSold : '-'}
                    </p>
                </div>
            </div>
            {/* Stat Card 3 */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-4 border border-purple-100">
                <div className="p-4 rounded-full bg-purple-100 text-purple-600 shadow">
                    <PieChart size={28} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{salesSummary ? salesSummary.totalRevenue : '-'}
                    </p>
                </div>
            </div>
            {/* Stat Card 4 */}
            <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-4 border border-pink-100">
                <div className="p-4 rounded-full bg-pink-100 text-pink-600 shadow">
                    <Bell size={28} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500">Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{merchOrders.length}</p>
                </div>
            </div>
        </div>
        {/* Example: Add a section for highlights or quick actions if needed */}
        {/* <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Quick Actions</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Add New Product</button>
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Recent Activity</h2>
        <ul className="text-gray-600 text-sm space-y-1">
          <li>Order #1234 placed</li>
          <li>Stock updated for T-shirt</li>
        </ul>
      </div>
    </div> */}
    </>
);

export default OverviewTab;
