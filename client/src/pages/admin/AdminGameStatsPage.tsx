import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface GameStat {
    _id: string;
    matchId: string;
    gameNumber: number;
    teamName: string;
    playerName: string;
    heroName: string;
    kills: number;
    deaths: number;
    assists: number;
    mvp: boolean;
    win: boolean;
    gameDuration?: number;
}

interface PlayerStat {
    realName: string;
    playerName: string;
    teamName: string;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    gamesPlayed: number;
    mvpCount: number;
    wins: number;
    winRate: number;
    kda: number;
}

export default function AdminGameStatsPage() {
    const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'kda' | 'kills' | 'mvp' | 'winRate'>('kda');
    const [filterTeam, setFilterTeam] = useState('');

    const getToken = () => sessionStorage.getItem('auth_token');

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/player-stats`);
            setPlayerStats(response.data || []);
        } catch (error) {
            console.error('Error fetching stats:', error);
            Toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดสถิติได้' });
        } finally {
            setLoading(false);
        }
    };

    const uniqueTeams = [...new Set(playerStats.map(p => p.teamName))].sort();

    const filteredStats = playerStats
        .filter(p => {
            const matchesSearch =
                p.realName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.playerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTeam = !filterTeam || p.teamName === filterTeam;
            return matchesSearch && matchesTeam;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'kills': return b.totalKills - a.totalKills;
                case 'mvp': return b.mvpCount - a.mvpCount;
                case 'winRate': return b.winRate - a.winRate;
                case 'kda':
                default: return b.kda - a.kda;
            }
        });

    const handleViewPlayerDetails = (player: PlayerStat) => {
        Swal.fire({
            title: player.realName || player.playerName,
            html: `
                <div class="text-left space-y-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-gray-500">IGN:</span>
                                <span class="ml-2 font-bold">${player.playerName}</span>
                            </div>
                            <div>
                                <span class="text-gray-500">ทีม:</span>
                                <span class="ml-2 font-bold">${player.teamName}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-3 text-center">
                        <div class="bg-green-50 rounded-lg p-3">
                            <div class="text-2xl font-bold text-green-600">${player.gamesPlayed}</div>
                            <div class="text-xs text-gray-500">เกมที่เล่น</div>
                        </div>
                        <div class="bg-blue-50 rounded-lg p-3">
                            <div class="text-2xl font-bold text-blue-600">${player.wins}</div>
                            <div class="text-xs text-gray-500">ชนะ</div>
                        </div>
                        <div class="bg-purple-50 rounded-lg p-3">
                            <div class="text-2xl font-bold text-purple-600">${player.winRate}%</div>
                            <div class="text-xs text-gray-500">Win Rate</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-3 text-center">
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xl font-bold text-blue-500">${player.totalKills}</div>
                            <div class="text-xs text-gray-500">Kills</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xl font-bold text-red-500">${player.totalDeaths}</div>
                            <div class="text-xs text-gray-500">Deaths</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xl font-bold text-green-500">${player.totalAssists}</div>
                            <div class="text-xs text-gray-500">Assists</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xl font-bold text-yellow-500">${player.mvpCount}</div>
                            <div class="text-xs text-gray-500">MVP</div>
                        </div>
                    </div>
                    
                    <div class="bg-cyan-50 rounded-lg p-4 text-center">
                        <div class="text-3xl font-bold text-cyan-600">${player.kda.toFixed(2)}</div>
                        <div class="text-sm text-gray-500">KDA Ratio</div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: 450
        });
    };

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
                        <i className="fas fa-chart-line mr-3 text-cyan-aura"></i>
                        สถิติผู้เล่น
                    </h1>
                    <p className="text-gray-500 mt-1">ดูและจัดการสถิติผู้เล่นทั้งหมด ({playerStats.length} คน)</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-cyan-aura text-white rounded-lg hover:bg-cyan-500 transition-colors"
                >
                    <i className="fas fa-sync-alt mr-2"></i>
                    รีเฟรช
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="ค้นหาผู้เล่น..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                        />
                    </div>

                    {/* Team Filter */}
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    >
                        <option value="">ทุกทีม</option>
                        {uniqueTeams.map(team => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    >
                        <option value="kda">เรียงตาม KDA</option>
                        <option value="kills">เรียงตาม Kills</option>
                        <option value="mvp">เรียงตาม MVP</option>
                        <option value="winRate">เรียงตาม Win Rate</option>
                    </select>
                </div>
            </div>

            {/* Stats Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ผู้เล่น</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ทีม</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">G</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">WR%</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-500 uppercase">K</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-red-500 uppercase">D</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-green-500 uppercase">A</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-yellow-500 uppercase">MVP</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-cyan-500 uppercase">KDA</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStats.map((player, index) => (
                                <tr key={`${player.teamName}-${player.realName}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        {index < 3 ? (
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                        'bg-gradient-to-br from-orange-400 to-orange-600'
                                                }`}>
                                                {index + 1}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 font-bold">{index + 1}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-bold text-uefa-dark">{player.realName || player.playerName}</div>
                                            {player.realName && player.playerName && player.realName !== player.playerName && (
                                                <div className="text-xs text-gray-400">IGN: {player.playerName}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{player.teamName}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-gray-600">{player.gamesPlayed}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-bold text-sm ${player.winRate >= 70 ? 'text-green-600' :
                                                player.winRate >= 50 ? 'text-cyan-600' :
                                                    'text-orange-500'
                                            }`}>
                                            {player.winRate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-blue-600">{player.totalKills}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-red-500">{player.totalDeaths}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-green-600">{player.totalAssists}</td>
                                    <td className="px-4 py-3 text-center">
                                        {player.mvpCount > 0 ? (
                                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold text-sm">
                                                <i className="fas fa-crown text-xs"></i>
                                                {player.mvpCount}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-lg font-bold text-cyan-aura">{player.kda.toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleViewPlayerDetails(player)}
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

                {filteredStats.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-chart-bar text-5xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500">ไม่พบสถิติผู้เล่น</p>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            {playerStats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">{playerStats.reduce((acc, p) => acc + p.totalKills, 0)}</div>
                        <div className="text-blue-100 text-sm">Total Kills</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">{playerStats.reduce((acc, p) => acc + p.totalAssists, 0)}</div>
                        <div className="text-green-100 text-sm">Total Assists</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">{playerStats.reduce((acc, p) => acc + p.mvpCount, 0)}</div>
                        <div className="text-yellow-100 text-sm">Total MVPs</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">
                            {(playerStats.reduce((acc, p) => acc + p.kda, 0) / playerStats.length).toFixed(2)}
                        </div>
                        <div className="text-cyan-100 text-sm">Avg KDA</div>
                    </div>
                </div>
            )}
        </div>
    );
}
