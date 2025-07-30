import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ReportsTab = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        axiosInstance.get('/merch/admin/sales-summary')
            .then(res => setSummary(res.data))
            .catch(() => setError('Failed to load sales summary.'))
            .finally(() => setLoading(false));
    }, []);

    const handleExportCSV = () => {
        if (!summary) return;
        let csv = 'Merch,Total Sold,Revenue\n';
        Object.values(summary.salesByMerch).forEach(m => {
            csv += `${m.name},${m.total},\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales_summary.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div>Loading reports...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Sales Summary</h2>
            {summary && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    {Object.entries(summary.salesByMerch).map(([id, merch]) => (
                        <div key={id} className="mb-4">
                            <div className="font-bold text-indigo-700">{merch.name}</div>
                            <div>Total Sold: <span className="font-semibold">{merch.total}</span></div>
                            <div className="text-sm text-gray-500">By Size: {Object.entries(merch.sizeSales).map(([size, qty]) => `${size}: ${qty}`).join(', ')}</div>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={handleExportCSV} className="px-5 py-2 bg-pink-600 text-white rounded-lg font-semibold shadow hover:bg-pink-700 transition">Export CSV</button>
        </div>
    );
};

export default ReportsTab;