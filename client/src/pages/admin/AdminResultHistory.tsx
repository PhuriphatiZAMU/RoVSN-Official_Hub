import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

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
    const { token, logout } = useAuth();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState<string>('');
    const [searchMatch, setSearchMatch] = useState<string>('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/results/recent-changes?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data || []);
        } catch (error: any) {
            console.error('Error fetching history:', error);
            if (error.response && error.response.status === 403) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'กรุณาเข้าสู่ระบบใหม่',
                    confirmButtonText: 'Login'
                }).then(() => {
                    logout(); // Use logout from context
                    window.location.href = '/login';
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'ไม่สามารถโหลดประวัติได้' });
            }
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-cyan-aura transition-colors shadow-sm"
                >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    <span>รีเฟรช</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="ค้นหา Match ID (เช่น D1_TeamA_vs_TeamB)..."
                            value={searchMatch}
                            onChange={(e) => setSearchMatch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent bg-gray-50"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <div className="relative">
                            <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent appearance-none bg-white cursor-pointer"
                            >
                                <option value="">ทุกการกระทำ</option>
                                <option value="create">สร้างใหม่ (Create)</option>
                                <option value="update">แก้ไข (Update)</option>
                                <option value="delete">ลบ (Delete)</option>
                            </select>
                            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">เวลา / ผู้ทำรายการ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Match ID</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">การกระทำ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รายละเอียด</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ตรวจสอบ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHistory.map((entry) => (
                                <tr key={entry._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(entry.changedAt)}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <i className="fas fa-user-circle text-gray-400"></i>
                                                {entry.changedBy}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600 block truncate max-w-[180px]" title={entry.matchId}>
                                            {entry.matchId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getActionBadge(entry.action)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex flex-col gap-1">
                                            {entry.action === 'create' && entry.newData && (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    <span>{entry.newData.teamBlue} <span className="text-gray-400">vs</span> {entry.newData.teamRed}</span>
                                                    <span className="font-bold">({entry.newData.scoreBlue}-{entry.newData.scoreRed})</span>
                                                </span>
                                            )}
                                            {entry.action === 'update' && entry.newData && (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    <span>อัปเดตผลการแข่งขัน</span>
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
                                            {entry.reason && (
                                                <span className="text-xs text-gray-400 italic mt-1">
                                                    "{entry.reason}"
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleViewDetails(entry)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-cyan-aura hover:text-white transition-all transform hover:scale-110 shadow-sm"
                                            title="ดูรายละเอียด JSON"
                                        >
                                            <i className="fas fa-code"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredHistory.length === 0 && (
                    <div className="text-center py-16 bg-gray-50/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-search text-2xl text-gray-300"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">ไม่พบประวัติการแก้ไข</h3>
                        <p className="text-gray-500">ลองเปลี่ยนตัวกรอง หรือยังไม่มีการดำเนินการใดๆ</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            {history.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-green-700 font-bold mb-1">สร้างใหม่ (Created)</div>
                            <div className="text-xs text-green-600">บันทึกผลการแข่งขันใหม่</div>
                        </div>
                        <div className="text-3xl font-display font-bold text-green-600">
                            {history.filter(h => h.action === 'create').length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-blue-700 font-bold mb-1">แก้ไข (Updated)</div>
                            <div className="text-xs text-blue-600">เปลี่ยนแปลงผล/สถิติ</div>
                        </div>
                        <div className="text-3xl font-display font-bold text-blue-600">
                            {history.filter(h => h.action === 'update').length}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-red-700 font-bold mb-1">ลบ (Deleted)</div>
                            <div className="text-xs text-red-600">ลบผลการแข่งขัน</div>
                        </div>
                        <div className="text-3xl font-display font-bold text-red-600">
                            {history.filter(h => h.action === 'delete').length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
