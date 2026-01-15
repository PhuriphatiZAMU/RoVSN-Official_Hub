import { useState, useEffect } from 'react';
import { fetchPlayerStats } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import ShareButton from '../components/common/ShareButton';
import { EmptyState } from '../components/common/States';

// Stat categories for leaderboard
const getStatCategories = (lang) => [
    { id: 'mvp', label: 'MVP', labelTh: 'MVP', icon: 'fa-star', color: 'text-yellow-500' },
    { id: 'kills', label: 'Kills', labelTh: 'สังหาร', icon: 'fa-skull', color: 'text-red-500' },
    { id: 'assists', label: 'Assists', labelTh: 'แอสซิสต์', icon: 'fa-hands-helping', color: 'text-green-500' },
    { id: 'kda', label: 'KDA', labelTh: 'KDA', icon: 'fa-chart-line', color: 'text-cyan-aura' },
    { id: 'gamesPlayed', label: 'Games', labelTh: 'เกม', icon: 'fa-gamepad', color: 'text-purple-500' },
];

function PlayerCard({ player, rank, stat, statLabel }) {
    const getMedalClass = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    };

    return (
        <div className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${rank <= 3 ? 'border-l-4 border-l-cyan-aura' : ''}`}>
            {/* Rank */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${getMedalClass(rank)}`}>
                {rank <= 3 ? (
                    <i className={`fas fa-trophy ${rank === 1 ? 'text-yellow-200' : rank === 2 ? 'text-gray-200' : 'text-orange-200'}`}></i>
                ) : rank}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white truncate">{player.playerName}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <TeamLogo teamName={player.teamName} size="xs" />
                    <span className="truncate">{player.teamName}</span>
                </div>
            </div>

            {/* Stat Value */}
            <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-cyan-aura">
                    {typeof stat === 'number' ? (Number.isInteger(stat) ? stat : stat.toFixed(2)) : stat}
                </div>
                <div className="text-xs text-gray-400 uppercase">{statLabel}</div>
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    const { language } = useLanguage();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('mvp');

    const STAT_CATEGORIES = getStatCategories(language);
    const isThai = language === 'th';

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
    }).slice(0, 10);

    const getStatValue = (player) => {
        if (activeCategory === 'kda') {
            return player.deaths > 0
                ? ((player.kills + player.assists) / player.deaths)
                : (player.kills + player.assists);
        }
        return player[activeCategory] || 0;
    };

    const activeCat = STAT_CATEGORIES.find(c => c.id === activeCategory);
    const activeLabel = isThai ? activeCat?.labelTh : activeCat?.label;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-12">
                    <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {isThai ? 'เกิดข้อผิดพลาด' : 'Error'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                            {isThai ? 'อันดับผู้เล่น' : 'Leaderboard'}
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {isThai ? 'ผู้เล่นยอดเยี่ยม Top 10' : 'Top 10 Players'}
                        </p>
                    </div>
                    <ShareButton title={isThai ? 'อันดับผู้เล่น - RoV SN Tournament' : 'Leaderboard - RoV SN Tournament'} />
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                    {STAT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeCategory === cat.id
                                    ? 'bg-cyan-aura text-uefa-dark shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <i className={`fas ${cat.icon} ${activeCategory === cat.id ? 'text-uefa-dark' : cat.color}`}></i>
                            <span>{isThai ? cat.labelTh : cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Leaderboard */}
                <div className="max-w-2xl mx-auto">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            ))}
                        </div>
                    ) : sortedPlayers.length === 0 ? (
                        <EmptyState
                            title={isThai ? 'ยังไม่มีข้อมูลผู้เล่น' : 'No player data'}
                            message={isThai ? 'กรุณาเพิ่มข้อมูลผู้เล่นในหน้า Admin' : 'Please add players in Admin page'}
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
                    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-display font-bold text-lg mb-4 text-gray-900 dark:text-white">
                            <i className="fas fa-chart-bar mr-2 text-cyan-aura"></i>
                            {isThai ? 'สรุปสถิติ' : 'Statistics Summary'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-cyan-aura">{players.length}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{isThai ? 'ผู้เล่นทั้งหมด' : 'Total Players'}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-500">
                                    {players.reduce((sum, p) => sum + (p.kills || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{isThai ? 'สังหารรวม' : 'Total Kills'}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-500">
                                    {players.reduce((sum, p) => sum + (p.assists || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{isThai ? 'แอสซิสต์รวม' : 'Total Assists'}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-500">
                                    {players.reduce((sum, p) => sum + (p.mvp || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{isThai ? 'MVP รวม' : 'Total MVPs'}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
