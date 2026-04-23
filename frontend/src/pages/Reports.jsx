import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Search,
    Filter,
    Calendar,
    ExternalLink,
    MoreVertical
} from 'lucide-react';
import api from '../services/api';

const Reports = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('reports');
                setLogs(response.data.recent_searches || []);
            } catch (error) {
                console.error('Failed to fetch reports', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const downloadCSV = () => {
        if (!logs || logs.length === 0) return;
        
        const headers = ['Search ID', 'Date', 'Time', 'Match Found', 'Matched Child ID', 'Confidence Score', 'IP Address'];
        const csvRows = [headers.join(',')];
        
        logs.forEach(log => {
            const date = new Date(log.searched_at).toLocaleDateString();
            const time = new Date(log.searched_at).toLocaleTimeString();
            const confidence = log.confidence_score ? (log.confidence_score).toFixed(1) + '%' : 'N/A';
            
            const row = [
                `"${log.id || ''}"`,
                `"${date}"`,
                `"${time}"`,
                log.match_found ? 'Yes' : 'No',
                `"${log.matched_child_id || 'N/A'}"`,
                `"${confidence}"`,
                `"${log.ip_address || 'Internal'}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MCIS_Search_Logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System Reports</h1>
                    <p className="text-slate-500 mt-1">Audit logs and identification statistics</p>
                </div>
                <button onClick={downloadCSV} className="btn-primary gap-2">
                    <Download className="w-4 h-4" />
                    Export Audit Log (CSV)
                </button>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Searches Today', value: '12', trend: '+4' },
                    { label: 'Avg Match Time', value: '1.2s', trend: '-0.2s' },
                    { label: 'DB Integrity', value: '100%', trend: 'Stable' }
                ].map(stat => (
                    <div key={stat.label} className="card p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-end justify-between mt-1">
                            <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table */}
            <div className="card">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by Child ID or IP..."
                            className="input-field pl-10 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Search Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Image</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Best Match</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium">
                                        No search logs found in the database.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {new Date(log.searched_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(log.searched_at).toLocaleTimeString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group-hover:scale-110 transition-transform">
                                                {/* Placeholder for query image if available */}
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.match_found ? (
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">ID: {log.matched_child_id?.slice(0, 8)}...</p>
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">Linked Match</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 italic">No Match Found</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.confidence_score ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-primary-500 h-full rounded-full"
                                                            style={{ width: `${log.confidence_score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{(log.confidence_score).toFixed(1)}%</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                            {log.ip_address || "Internal"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                        Showing <span className="text-slate-900 font-bold">{logs.length}</span> entries
                    </p>
                    <div className="flex gap-2">
                        <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-400 cursor-not-allowed">Previous</button>
                        <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-400 cursor-not-allowed">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
