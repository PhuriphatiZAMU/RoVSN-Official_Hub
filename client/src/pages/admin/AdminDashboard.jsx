import { useData } from '../../context/DataContext';

export default function AdminDashboard() {
    const { schedule, results, teams, standings } = useData();

    const stats = [
        { label: 'ทีมทั้งหมด', value: teams.length, icon: 'fas fa-users', color: 'bg-blue-500' },
        { label: 'แมตช์ทั้งหมด', value: schedule.reduce((acc, d) => acc + (d.matches?.length || 0), 0), icon: 'fas fa-gamepad', color: 'bg-green-500' },
        { label: 'ผลแข่งเสร็จสิ้น', value: results.length, icon: 'fas fa-check-circle', color: 'bg-purple-500' },
        { label: 'Match Days', value: schedule.length, icon: 'fas fa-calendar-alt', color: 'bg-orange-500' },
    ];

    const recentResults = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                            <i className={`${stat.icon} text-2xl`}></i>
                        </div>
                        <div>
                            <div className="text-3xl font-display font-bold text-uefa-dark">{stat.value}</div>
                            <div className="text-gray-500 text-sm">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Results */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-display font-bold text-uefa-dark uppercase">
                            <i className="fas fa-history mr-2 text-cyan-aura"></i>
                            ผลการแข่งขันล่าสุด
                        </h2>
                    </div>
                    <div className="p-6">
                        {recentResults.length > 0 ? (
                            <div className="space-y-3">
                                {recentResults.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{r.teamBlue}</span>
                                            <span className="text-gray-400">vs</span>
                                            <span className="font-bold">{r.teamRed}</span>
                                        </div>
                                        <div className="bg-uefa-dark text-white px-3 py-1 rounded font-bold">
                                            {r.scoreBlue} - {r.scoreRed}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">ยังไม่มีผลการแข่งขัน</p>
                        )}
                    </div>
                </div>

                {/* Top Teams */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-display font-bold text-uefa-dark uppercase">
                            <i className="fas fa-medal mr-2 text-cyan-aura"></i>
                            อันดับทีมชั้นนำ
                        </h2>
                    </div>
                    <div className="p-6">
                        {standings.length > 0 ? (
                            <div className="space-y-3">
                                {standings.slice(0, 5).map((t, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i < 4 ? 'bg-cyan-aura text-uefa-dark' : 'bg-gray-200 text-gray-500'}`}>
                                                {i + 1}
                                            </div>
                                            <span className="font-bold">{t.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg">{t.pts} pts</div>
                                            <div className="text-xs text-gray-500">{t.w}W {t.l}L</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลอันดับ</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-display font-bold text-uefa-dark uppercase mb-4">
                    <i className="fas fa-bolt mr-2 text-cyan-aura"></i>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/admin/results" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-cyan-aura/10 transition-colors group">
                        <i className="fas fa-plus-circle text-2xl text-gray-400 group-hover:text-cyan-aura"></i>
                        <span className="text-sm text-gray-600">เพิ่มผลการแข่งขัน</span>
                    </a>

                    <a href="/fixtures" target="_blank" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-cyan-aura/10 transition-colors group">
                        <i className="fas fa-eye text-2xl text-gray-400 group-hover:text-cyan-aura"></i>
                        <span className="text-sm text-gray-600">ดูตารางแข่ง</span>
                    </a>
                    <a href="/standings" target="_blank" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-cyan-aura/10 transition-colors group">
                        <i className="fas fa-list-ol text-2xl text-gray-400 group-hover:text-cyan-aura"></i>
                        <span className="text-sm text-gray-600">ดูตารางคะแนน</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
