import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export default function AdminResultHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState<string>('');
    const [searchMatch, setSearchMatch] = useState<string>('');

    const getToken = () => sessionStorage.getItem('auth_token');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/results/recent-changes?limit=100`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setHistory(response.data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'ไม่สามารถโหลดประวัติได้' });
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'create':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">สร้าง</span>;
            case 'update':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">แก้ไข</span>;
            case 'delete':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">ลบ</span>;
            default:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">{action}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleViewDetails = (entry: HistoryEntry) => {
        const prevData = entry.previousData ? JSON.stringify(entry.previousData, null, 2) : 'ไม่มี';
        const newData = entry.newData ? JSON.stringify(entry.newData, null, 2) : 'ไม่มี';

        Swal.fire({
            title: `รายละเอียดการเปลี่ยนแปลง`,
            html: `
                <div class="text-left text-sm space-y-4">
                    <div>
                        <strong>Match ID:</strong> ${entry.matchId}<br/>
                        <strong>การกระทำ:</strong> ${entry.action}<br/>
                        <strong>ดำเนินการโดย:</strong> ${entry.changedBy}<br/>
                        <strong>เวลา:</strong> ${formatDate(entry.changedAt)}<br/>
                        ${entry.reason ? `<strong>เหตุผล:</strong> ${entry.reason}` : ''}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <strong class="text-red-600">ข้อมูลเดิม:</strong>
                            <pre class="bg-red-50 p-2 rounded text-xs overflow-auto max-h-40">${prevData}</pre>
                        </div>
                        <div>
                            <strong class="text-green-600">ข้อมูลใหม่:</strong>
                            <pre class="bg-green-50 p-2 rounded text-xs overflow-auto max-h-40">${newData}</pre>
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
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-aura border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-uefa-dark">
                        <i className="fas fa-history mr-3 text-cyan-aura"></i>
                        ประวัติการแก้ไขผลแข่ง
                    </h1>
                    <p className="text-gray-500 mt-1">ดูประวัติการสร้าง แก้ไข และลบผลการแข่งขันทั้งหมด ({history.length} รายการ)</p>
                </div>
                <button
                    onClick={fetchHistory}
                    className="px-4 py-2 bg-cyan-aura text-white rounded-lg hover:bg-cyan-500 transition-colors"
                >
                    <i className="fas fa-sync-alt mr-2"></i>
                    รีเฟรช
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="ค้นหา Match ID..."
                            value={searchMatch}
                            onChange={(e) => setSearchMatch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    >
                        <option value="">ทุกการกระทำ</option>
                        <option value="create">สร้างใหม่</option>
                        <option value="update">แก้ไข</option>
                        <option value="delete">ลบ</option>
                    </select>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">เวลา</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Match ID</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">การกระทำ</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ผู้ดำเนินการ</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">รายละเอียด</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">ดู</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHistory.map((entry) => (
                                <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDate(entry.changedAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {entry.matchId}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {getActionBadge(entry.action)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        <i className="fas fa-user mr-1 text-gray-400"></i>
                                        {entry.changedBy}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {entry.action === 'create' && entry.newData && (
                                            <span>{entry.newData.teamBlue} vs {entry.newData.teamRed} ({entry.newData.scoreBlue}-{entry.newData.scoreRed})</span>
                                        )}
                                        {entry.action === 'update' && entry.newData && (
                                            <span>สกอร์ใหม่: {entry.newData.scoreBlue}-{entry.newData.scoreRed}</span>
                                        )}
                                        {entry.action === 'delete' && entry.previousData && (
                                            <span className="text-red-500">ลบ: {entry.previousData.teamBlue} vs {entry.previousData.teamRed}</span>
                                        )}
                                        {entry.reason && <span className="text-gray-400 ml-2">({entry.reason})</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleViewDetails(entry)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-cyan-aura/20 rounded-lg text-sm text-gray-600 hover:text-cyan-600 transition-colors"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredHistory.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-history text-5xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500">ไม่พบประวัติการแก้ไข</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            {history.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {history.filter(h => h.action === 'create').length}
                        </div>
                        <div className="text-sm text-green-500">สร้างใหม่</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {history.filter(h => h.action === 'update').length}
                        </div>
                        <div className="text-sm text-blue-500">แก้ไข</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {history.filter(h => h.action === 'delete').length}
                        </div>
                        <div className="text-sm text-red-500">ลบ</div>
                    </div>
                </div>
            )}
        </div>
    );
}
