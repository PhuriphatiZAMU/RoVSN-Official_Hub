import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Swal from 'sweetalert2';

export default function AdminSchedulePage() {
    const { schedule, results } = useData();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (schedule.length > 0 && selectedDay === null) {
            setSelectedDay(schedule[0]?.day || 1);
        }
    }, [schedule, selectedDay]);

    const getMatchId = (day: number, index: number, blue: string, red: string) => {
        return `${day}_${blue}_vs_${red}`.replace(/\s+/g, '');
    };

    const getMatchStatus = (matchId: string) => {
        const result = results.find(r => r.matchId === matchId);
        if (result) {
            if (result.isByeWin || (result.scoreBlue === 0 && result.scoreRed === 0 && result.winner)) {
                return { status: 'bye', result };
            }
            return { status: 'completed', result };
        }
        return { status: 'pending', result: null };
    };

    const getDayStats = (day: typeof schedule[0]) => {
        const total = day.matches?.length || 0;
        const completed = day.matches?.filter((m, idx) => {
            const matchId = getMatchId(day.day, idx, m.blue, m.red);
            return getMatchStatus(matchId).status !== 'pending';
        }).length || 0;
        return { total, completed, pending: total - completed };
    };

    const filteredSchedule = schedule.filter((day) => {
        if (!searchTerm) return true;
        return day.matches?.some(m =>
            m.blue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.red?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const selectedDayData = schedule.find((d) => d.day === selectedDay);

    const handleViewMatchDetails = (match: { blue: string; red: string }, matchId: string) => {
        const { status, result } = getMatchStatus(matchId);

        let content = `
            <div class="text-center">
                <div class="flex items-center justify-center gap-4 mb-4">
                    <div class="text-xl font-bold">${match.blue}</div>
                    <div class="text-gray-400">vs</div>
                    <div class="text-xl font-bold">${match.red}</div>
                </div>
        `;

        if (status === 'completed' && result) {
            content += `
                <div class="bg-green-50 rounded-lg p-4 mb-4">
                    <div class="text-3xl font-bold text-green-600">${result.scoreBlue} - ${result.scoreRed}</div>
                    <div class="text-sm text-green-500 mt-1">ผู้ชนะ: ${result.winner}</div>
                </div>
            `;
        } else if (status === 'bye') {
            content += `
                <div class="bg-yellow-50 rounded-lg p-4 mb-4">
                    <div class="text-xl font-bold text-yellow-600">BYE</div>
                    <div class="text-sm text-yellow-500 mt-1">ผู้ชนะ: ${result?.winner}</div>
                </div>
            `;
        } else {
            content += `
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <div class="text-xl font-bold text-gray-400">ยังไม่แข่ง</div>
                </div>
            `;
        }

        content += `
            <div class="text-sm text-gray-500">Match ID: ${matchId}</div>
        </div>`;

        Swal.fire({
            title: `แมตช์ ${matchId}`,
            html: content,
            showCloseButton: true,
            showConfirmButton: false,
            width: 450
        });
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-uefa-dark">
                        <i className="fas fa-calendar-check mr-3 text-cyan-aura"></i>
                        ตารางแข่งขัน
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {schedule.length} Match Days • {schedule.reduce((acc, d) => acc + (d.matches?.length || 0), 0)} แมตช์ทั้งหมด
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-cyan-aura text-white rounded-lg hover:bg-cyan-500 transition-colors"
                >
                    <i className="fas fa-sync-alt mr-2"></i>
                    รีเฟรช
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="ค้นหาทีม..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Day Selector */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
                        <h3 className="font-bold text-uefa-dark mb-4">
                            <i className="fas fa-calendar-day mr-2 text-cyan-aura"></i>
                            Match Days
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredSchedule.map((day) => {
                                const stats = getDayStats(day);
                                const isCompleted = stats.completed === stats.total && stats.total > 0;

                                return (
                                    <button
                                        key={day.day}
                                        onClick={() => setSelectedDay(day.day)}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${selectedDay === day.day
                                            ? 'bg-cyan-aura text-white shadow-md'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">Day {day.day}</span>
                                            {isCompleted ? (
                                                <i className={`fas fa-check-circle ${selectedDay === day.day ? 'text-white' : 'text-green-500'}`}></i>
                                            ) : (
                                                <span className={`text-xs ${selectedDay === day.day ? 'text-white/80' : 'text-gray-400'}`}>
                                                    {stats.completed}/{stats.total}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-xs mt-1 ${selectedDay === day.day ? 'text-white/70' : 'text-gray-400'}`}>
                                            {stats.total} แมตช์
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Matches List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-bold text-uefa-dark">
                                <i className="fas fa-gamepad mr-2 text-cyan-aura"></i>
                                {selectedDay ? `Day ${selectedDay} - ${selectedDayData?.matches?.length || 0} แมตช์` : 'เลือก Match Day'}
                            </h3>
                        </div>
                        <div className="p-5">
                            {selectedDayData && selectedDayData.matches && selectedDayData.matches.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedDayData.matches.map((match, index) => {
                                        const matchId = getMatchId(selectedDayData.day, index, match.blue, match.red);
                                        const { status, result } = getMatchStatus(matchId);

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => handleViewMatchDetails(match, matchId)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${status === 'completed' ? 'bg-green-50 border-green-200' :
                                                    status === 'bye' ? 'bg-yellow-50 border-yellow-200' :
                                                        'bg-gray-50 border-gray-200 hover:border-cyan-aura'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={`flex-1 text-right font-bold ${result?.winner === match.blue ? 'text-green-600' : ''}`}>
                                                            {match.blue}
                                                        </div>

                                                        <div className="px-4 py-2 rounded-lg bg-white shadow-sm min-w-[80px] text-center">
                                                            {status === 'completed' ? (
                                                                <span className="font-bold text-uefa-dark">
                                                                    {result?.scoreBlue} - {result?.scoreRed}
                                                                </span>
                                                            ) : status === 'bye' ? (
                                                                <span className="font-bold text-yellow-600 text-sm">BYE</span>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">VS</span>
                                                            )}
                                                        </div>

                                                        <div className={`flex-1 text-left font-bold ${result?.winner === match.red ? 'text-green-600' : ''}`}>
                                                            {match.red}
                                                        </div>
                                                    </div>

                                                    <div className="ml-4">
                                                        {status === 'completed' && (
                                                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                                                เสร็จสิ้น
                                                            </span>
                                                        )}
                                                        {status === 'bye' && (
                                                            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                                                BYE
                                                            </span>
                                                        )}
                                                        {status === 'pending' && (
                                                            <span className="px-3 py-1 bg-gray-300 text-gray-600 text-xs font-bold rounded-full">
                                                                รอแข่ง
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-xs text-gray-400">
                                                    Match ID: {matchId}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <i className="fas fa-calendar-times text-5xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500">ไม่มีแมตช์ในวันนี้</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {schedule.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <i className="fas fa-calendar-plus text-6xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">ยังไม่มีตารางแข่งขัน</h3>
                    <p className="text-gray-400 mb-6">กรุณาจับสลากทีมก่อนเพื่อสร้างตารางแข่งขัน</p>
                    <a
                        href="/admin/draw"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-aura text-white rounded-lg hover:bg-cyan-500 transition-colors"
                    >
                        <i className="fas fa-random"></i>
                        ไปจับสลากทีม
                    </a>
                </div>
            )}
        </div>
    );
}
