import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLanguage } from '../../context/LanguageContext';

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
    const { t } = useLanguage();
    const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'kda' | 'kills' | 'mvp' | 'winRate'>('kda');
    const [filterTeam, setFilterTeam] = useState('');

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
            Toast.fire({ icon: 'error', title: t.common.error });
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
                                <span class="text-gray-500">${t.admin.team}:</span>
                                <span class="ml-2 font-bold">${player.teamName}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-3 text-center">
                        <div class="bg-green-50 rounded-lg p-3">
                            <div class="text-2xl font-bold text-green-600">${player.gamesPlayed}</div>
                            <div class="text-xs text-gray-500">${t.admin.gamesPlayed}</div>
                        </div>
                        <div class="bg-blue-50 rounded-lg p-3">
                            <div class="text-2xl font-bold text-blue-600">${player.wins}</div>
                            <div class="text-xs text-gray-500">${t.stats.wins}</div>
                        </div>
                        <div class="bg-purple-50 rounded-lg p-3">
                            <div class="text-2xl font-bold text-purple-600">${player.winRate}%</div>
                            <div class="text-xs text-gray-500">${t.stats.winRate}</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-3 text-center">
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xl font-bold text-blue-500">${player.totalKills}</div>
                            <div class="text-xs text-gray-500">${t.stats.kills}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xl font-bold text-red-500">${player.totalDeaths}</div>
                            <div class="text-xs text-gray-500">Deaths</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xl font-bold text-green-500">${player.totalAssists}</div>
                            <div class="text-xs text-gray-500">${t.stats.assists}</div>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-uefa-dark">
                        <i className="fas fa-chart-line mr-3 text-cyan-aura"></i>
                        {t.admin.playerStatsTitle}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.admin.playerStatsSubtitle.replace('{count}', String(playerStats.length))}</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-aura text-white rounded-lg hover:bg-cyan-500 transition-colors w-full md:w-auto"
                >
                    <i className="fas fa-sync-alt"></i>
                    {t.admin.refresh}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder={t.admin.searchPlayer}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                        />
                    </div>

                    {/* Team Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={filterTeam}
                            onChange={(e) => setFilterTeam(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                        >
                            <option value="">{t.admin.allTeams}</option>
                            {uniqueTeams.map(team => (
                                <option key={team} value={team}>{team}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="w-full md:w-48">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                        >
                            <option value="kda">{t.admin.sortKda}</option>
                            <option value="kills">{t.admin.sortKills}</option>
                            <option value="mvp">{t.admin.sortMvp}</option>
                            <option value="winRate">{t.admin.sortWinRate}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Table (Desktop) */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.stats.playerShort}</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.admin.team}</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">G</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">WR%</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-blue-500 uppercase">K</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-red-500 uppercase">D</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-green-500 uppercase">A</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-yellow-500 uppercase">MVP</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-cyan-500 uppercase">KDA</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">{t.admin.actions}</th>
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
                                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mx-auto text-gray-500 hover:bg-cyan-aura hover:text-white transition-all transform hover:scale-110 shadow-sm"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredStats.map((player, index) => (
                    <div key={`${player.teamName}-${player.realName}`} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                            'bg-gray-100 text-gray-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-uefa-dark">{player.realName || player.playerName}</div>
                                    <div className="text-xs text-gray-500">{player.teamName}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewPlayerDetails(player)}
                                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-cyan-aura hover:text-white transition-colors"
                            >
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-xs text-gray-400">Matches</div>
                                <div className="font-bold text-gray-700">{player.gamesPlayed}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-xs text-gray-400">Win Rate</div>
                                <div className={`font-bold ${player.winRate >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {player.winRate}%
                                </div>
                            </div>
                            <div className="bg-cyan-50 p-2 rounded text-center border border-cyan-100">
                                <div className="text-xs text-cyan-600">KDA</div>
                                <div className="font-bold text-cyan-700">{player.kda.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                            <div className="flex gap-4">
                                <div><span className="text-blue-500 font-bold">{player.totalKills}</span> <span className="text-gray-400 text-xs">K</span></div>
                                <div><span className="text-red-500 font-bold">{player.totalDeaths}</span> <span className="text-gray-400 text-xs">D</span></div>
                                <div><span className="text-green-500 font-bold">{player.totalAssists}</span> <span className="text-gray-400 text-xs">A</span></div>
                            </div>
                            {player.mvpCount > 0 && (
                                <span className="flex items-center gap-1 text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-0.5 rounded-full">
                                    <i className="fas fa-crown"></i> {player.mvpCount} MVP
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {filteredStats.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <i className="fas fa-chart-bar text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500">{t.admin.noData}</p>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            {playerStats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">{playerStats.reduce((acc, p) => acc + p.totalKills, 0)}</div>
                        <div className="text-blue-100 text-sm">{t.admin.totalKills}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">{playerStats.reduce((acc, p) => acc + p.totalAssists, 0)}</div>
                        <div className="text-green-100 text-sm">{t.admin.totalAssists}</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">{playerStats.reduce((acc, p) => acc + p.mvpCount, 0)}</div>
                        <div className="text-yellow-100 text-sm">{t.admin.totalMvps}</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 text-white">
                        <div className="text-3xl font-bold">
                            {(playerStats.reduce((acc, p) => acc + p.kda, 0) / playerStats.length).toFixed(2)}
                        </div>
                        <div className="text-cyan-100 text-sm">{t.admin.avgKda}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
