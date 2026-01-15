import { useState, useEffect } from 'react';
import { fetchPlayerStats, fetchPlayerHeroStats } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import ShareButton from '../components/common/ShareButton';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';

// Stat categories for leaderboard
const STAT_CATEGORIES = [
    { id: 'mvp', label: 'MVP', icon: 'fa-star', color: 'text-yellow-500' },
    { id: 'kills', label: 'Kills', icon: 'fa-skull', color: 'text-red-500' },
    { id: 'assists', label: 'Assists', icon: 'fa-hands-helping', color: 'text-green-500' },
    { id: 'kda', label: 'KDA', icon: 'fa-chart-line', color: 'text-cyan-aura' },
    { id: 'gamesPlayed', label: 'Games', icon: 'fa-gamepad', color: 'text-purple-500' },
];

function PlayerCard({ player, rank, stat, statLabel }) {
    const getMedalClass = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
        return 'bg-gray-200 text-gray-600';
    };

    return (
        <div className={`flex items-center gap-4 p-4 bg-white dark:bg-uefa-dark rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow ${rank <= 3 ? 'border-l-4 border-l-cyan-aura' : ''}`}>
            {/* Rank */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getMedalClass(rank)}`}>
                {rank <= 3 ? (
                    <i className={`fas fa-trophy ${rank === 1 ? 'text-yellow-200' : rank === 2 ? 'text-gray-200' : 'text-orange-200'}`}></i>
                ) : rank}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-uefa-dark dark:text-white truncate">{player.playerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TeamLogo teamName={player.teamName} size="xs" />
                    <span className="truncate">{player.teamName}</span>
                </div>
            </div>

            {/* Stat Value */}
            <div className="text-right">
                <div className="text-2xl font-bold text-cyan-aura">
                    {typeof stat === 'number' ? (Number.isInteger(stat) ? stat : stat.toFixed(2)) : stat}
                </div>
                <div className="text-xs text-gray-400 uppercase">{statLabel}</div>
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('mvp');

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const data = await fetchPlayerStats();
                setPlayers(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Sort players by selected category
    const sortedPlayers = [...players].sort((a, b) => {
        if (activeCategory === 'kda') {
            const kdaA = a.deaths > 0 ? (a.kills + a.assists) / a.deaths : (a.kills + a.assists);
            const kdaB = b.deaths > 0 ? (b.kills + b.assists) / b.deaths : (b.kills + b.assists);
            return kdaB - kdaA;
        }
        return (b[activeCategory] || 0) - (a[activeCategory] || 0);
    }).slice(0, 10); // Top 10

    const getStatValue = (player) => {
        if (activeCategory === 'kda') {
            return player.deaths > 0
                ? ((player.kills + player.assists) / player.deaths)
                : (player.kills + player.assists);
        }
        return player[activeCategory] || 0;
    };

    const activeLabel = STAT_CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <ErrorState
                    title="เกิดข้อผิดพลาด"
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="flex-grow bg-gray-50 dark:bg-deep-space">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                            🏆 Leaderboard
                        </h1>
                        <p className="text-gray-400 mt-2">อันดับผู้เล่นยอดเยี่ยม</p>
                    </div>
                    <ShareButton title="Leaderboard - RoV SN Tournament" />
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {STAT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeCategory === cat.id
                                    ? 'bg-cyan-aura text-uefa-dark shadow-lg shadow-cyan-aura/30'
                                    : 'bg-white dark:bg-uefa-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <i className={`fas ${cat.icon} ${cat.color}`}></i>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Leaderboard */}
                <div className="max-w-2xl mx-auto">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton h-20 rounded-lg"></div>
                            ))}
                        </div>
                    ) : sortedPlayers.length === 0 ? (
                        <EmptyState
                            title="ยังไม่มีข้อมูลผู้เล่น"
                            message="กรุณาเพิ่มข้อมูลผู้เล่นในหน้า Admin"
                            icon="fas fa-users"
                        />
                    ) : (
                        <div className="space-y-3">
                            {sortedPlayers.map((player, index) => (
                                <PlayerCard
                                    key={player._id || player.playerName}
                                    player={player}
                                    rank={index + 1}
                                    stat={getStatValue(player)}
                                    statLabel={activeLabel}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                {!loading && sortedPlayers.length > 0 && (
                    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-uefa-dark rounded-lg shadow-sm">
                        <h3 className="font-display font-bold text-lg mb-4 text-uefa-dark dark:text-white">
                            <i className="fas fa-chart-bar mr-2 text-cyan-aura"></i>
                            สรุปสถิติ
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-cyan-aura">{players.length}</div>
                                <div className="text-sm text-gray-500">ผู้เล่นทั้งหมด</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-500">
                                    {players.reduce((sum, p) => sum + (p.kills || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">Total Kills</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-500">
                                    {players.reduce((sum, p) => sum + (p.assists || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">Total Assists</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-500">
                                    {players.reduce((sum, p) => sum + (p.mvp || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">Total MVPs</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
