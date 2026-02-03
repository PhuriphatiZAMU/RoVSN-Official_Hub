'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface HistoryEntry {
    _id: string;
    matchId: string;
    action: 'create' | 'update' | 'delete';
    previousData?: any;
    newData?: any;
    changedBy: string;
    changedAt: string;
    reason?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AdminResultHistoryPage() {
    const { t, language } = useLanguage();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState<string>('');
    const [searchMatch, setSearchMatch] = useState<string>('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/results/recent-changes?limit=100`, {
                withCredentials: true
            });
            setHistory(response.data || []);
        } catch (error: any) {
            console.error('Error fetching history:', error);
            if (error.response?.status === 403 || error.response?.status === 401) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Please login again.',
                    confirmButtonText: 'Login'
                }).then(() => {
                    window.location.href = '/login';
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'create':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">Created</span>;
            case 'update':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">Updated</span>;
            case 'delete':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">Deleted</span>;
            default:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">{action}</span>;
        }
    };

    const handleViewDetails = (entry: HistoryEntry) => {
        const prevData = entry.previousData ? JSON.stringify(entry.previousData, null, 2) : 'None';
        const newData = entry.newData ? JSON.stringify(entry.newData, null, 2) : 'None';

        Swal.fire({
            title: 'Change Details',
            html: `
                <div class="text-left text-sm space-y-4">
                    <div>
                        <strong>Match ID:</strong> ${entry.matchId}<br/>
                        <strong>Action:</strong> ${entry.action}<br/>
                        <strong>By:</strong> ${entry.changedBy}<br/>
                        <strong>Time:</strong> ${formatDate(entry.changedAt)}<br/>
                        ${entry.reason ? `<strong>Reason:</strong> ${entry.reason}` : ''}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <strong class="text-red-600">Old Data:</strong>
                            <pre class="bg-red-50 p-2 rounded text-xs overflow-auto max-h-40 text-left border border-red-100 mt-1">${prevData}</pre>
                        </div>
                        <div>
                            <strong class="text-green-600">New Data:</strong>
                            <pre class="bg-green-50 p-2 rounded text-xs overflow-auto max-h-40 text-left border border-green-100 mt-1">${newData}</pre>
                        </div>
                    </div>
                </div>
            `,
            width: 700,
            showCloseButton: true,
            showConfirmButton: false
        });
    };

    const filteredHistory = history.filter(entry => {
        const matchesAction = !filterAction || entry.action === filterAction;
        const matchesSearch = !searchMatch || entry.matchId.toLowerCase().includes(searchMatch.toLowerCase());
        return matchesAction && matchesSearch;
    });

    if (loading) {
        return <div className="p-12 text-center text-gray-400">Loading history...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-uefa-dark">
                        <i className="fas fa-history mr-3 text-cyan-aura"></i>
                        {t.admin.historyTitle || 'Change History'}
                    </h1>
                    <p className="text-gray-500 mt-1">Found {history.length} records.</p>
                </div>
                <button
                    onClick={fetchHistory}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-cyan-aura transition-colors shadow-sm w-full md:w-auto"
                >
                    <i className="fas fa-sync-alt"></i>
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Search Match ID..."
                            value={searchMatch}
                            onChange={(e) => setSearchMatch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <div className="relative">
                            <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none appearance-none bg-white cursor-pointer"
                            >
                                <option value="">All Actions</option>
                                <option value="create">Created</option>
                                <option value="update">Updated</option>
                                <option value="delete">Deleted</option>
                            </select>
                            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time / User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Match ID</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">JSON</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">No history found matching filters.</td>
                                </tr>
                            ) : (
                                filteredHistory.map((entry) => (
                                    <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{formatDate(entry.changedAt)}</span>
                                                <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <i className="fas fa-user-circle"></i> {entry.changedBy}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                            {entry.matchId}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getActionBadge(entry.action)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex flex-col gap-1">
                                                {entry.action === 'create' && entry.newData && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        <span>{entry.newData.teamBlue} vs {entry.newData.teamRed}</span>
                                                        <span className="font-bold">({entry.newData.scoreBlue}-{entry.newData.scoreRed})</span>
                                                    </span>
                                                )}
                                                {entry.action === 'update' && entry.newData && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                        <span>Updated Match</span>
                                                        <span className="font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                            {entry.newData.scoreBlue}-{entry.newData.scoreRed}
                                                        </span>
                                                    </span>
                                                )}
                                                {entry.action === 'delete' && entry.previousData && (
                                                    <span className="flex items-center gap-2 text-red-600">
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                        <span className="line-through text-gray-400">
                                                            {entry.previousData.teamBlue} vs {entry.previousData.teamRed}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(entry)}
                                                className="text-gray-400 hover:text-cyan-aura transition-colors"
                                                title="View JSON"
                                            >
                                                <i className="fas fa-code text-lg"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            {history.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-green-700 font-bold">Created</div>
                            <div className="text-xs text-green-600">New Matches</div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {history.filter(h => h.action === 'create').length}
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-blue-700 font-bold">Updated</div>
                            <div className="text-xs text-blue-600">Edits</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {history.filter(h => h.action === 'update').length}
                        </div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-red-700 font-bold">Deleted</div>
                            <div className="text-xs text-red-600">Removals</div>
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            {history.filter(h => h.action === 'delete').length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
