import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo.jsx';
import { StatsSkeleton, TableSkeleton } from '../components/common/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/common/States.jsx';
import ShareButton from '../components/common/ShareButton.jsx';

// Type Definitions
interface SeasonStatsData {
    totalMatches: number;
    totalGames: number;
    avgGameDuration: number;
    highestKillGame?: { match: string; kills: number };
    longestGame?: { match: string; duration: number };
    topMVPPlayer?: { name: string; team: string; count: number };
    topKillerPlayer?: { name: string; team: string; kills: number };
    bestTeam?: { name: string; winRate: string; wins: number; games: number };
    mostPickedHero?: { name: string; picks: number; winRate: string };
    bestWinRateHero?: { name: string; picks: number; winRate: string };
}

interface Hero {
    name: string;
    imageUrl?: string;
}

interface TeamStatData {
    teamName: string;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    mvpCount: number;
    realGamesPlayed: number;
    realWins: number;
    realLosses: number;
    kda: number;
    winRate: number;
}

interface PlayerStatData {
    realName?: string;
    playerName: string;
    teamName: string;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    gamesPlayed: number;
    mvpCount: number;
    wins: number;
    winRate: number;
    avgKillsPerGame: number;
    avgDeathsPerGame: number;
    avgAssistsPerGame: number;
    mvpRate: number;
    kda: number;
}

interface PlayerHeroData {
    heroName: string;
    gamesPlayed: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
}

interface PlayerHeroStat {
    realName: string;
    playerName: string;
    topHeroes: PlayerHeroData[];
}

// Helper: Format duration (seconds) to MM:SS
function formatDuration(seconds: number | undefined | null): string {
    if (!seconds || seconds <= 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function SeasonStats(): React.ReactElement {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState<SeasonStatsData | null>(null);
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([apiService.getSeasonStats(), apiService.getHeroes()])
            .then(([seasonData, heroData]) => {
                setStats(seasonData);
                setHeroes(heroData || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getHeroImage = (heroName: string): string | null => {
        const hero = heroes.find(h => h.name === heroName);
        return hero?.imageUrl || null;
    };

    if (loading) return <StatsSkeleton />;
    if (error) return <ErrorState title={t?.common?.error || 'Error'} message={error} onRetry={() => window.location.reload()} />;
    if (!stats) return <EmptyState title={t?.common?.noData || 'No data'} message="" />;

    // Stat Cards Data
    const statCards = [
        {
            icon: 'fa-trophy',
            label: language === 'th' ? 'แมตช์ทั้งหมด' : 'Total Matches',
            value: stats.totalMatches || 0,
            color: 'from-cyan-500 to-blue-600',
            bgColor: 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10',
        },
        {
            icon: 'fa-gamepad',
            label: language === 'th' ? 'เกมทั้งหมด' : 'Total Games',
            value: stats.totalGames || 0,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-gradient-to-br from-purple-500/10 to-pink-600/10',
        },
        {
            icon: 'fa-clock',
            label: language === 'th' ? 'เวลาเฉลี่ย/เกม' : 'Avg Game Time',
            value: formatDuration(stats.avgGameDuration),
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10',
        },
        {
            icon: 'fa-skull-crossbones',
            label: language === 'th' ? 'เกมที่ Kill เยอะสุด' : 'Bloodiest Game',
            value: stats.highestKillGame?.kills || 0,
            subtext: stats.highestKillGame?.match !== '-' ? `${stats.highestKillGame?.match}` : null,
            color: 'from-red-500 to-orange-600',
            bgColor: 'bg-gradient-to-br from-red-500/10 to-orange-600/10',
        },
    ];

    // Highlight Cards (Players, Team, Hero)
    const highlightCards = [
        stats.topMVPPlayer && {
            icon: 'fa-crown',
            title: language === 'th' ? 'MVP มากที่สุด' : 'Top MVP Player',
            name: stats.topMVPPlayer.name,
            team: stats.topMVPPlayer.team,
            value: `${stats.topMVPPlayer.count} MVP`,
            color: 'from-yellow-400 to-amber-500',
        },
        stats.topKillerPlayer && {
            icon: 'fa-crosshairs',
            title: language === 'th' ? 'Kill มากที่สุด' : 'Top Killer',
            name: stats.topKillerPlayer.name,
            team: stats.topKillerPlayer.team,
            value: `${stats.topKillerPlayer.kills} Kills`,
            color: 'from-red-500 to-rose-600',
        },
        stats.bestTeam && {
            icon: 'fa-users',
            title: language === 'th' ? 'ทีม Win Rate สูงสุด' : 'Best Win Rate Team',
            name: stats.bestTeam.name,
            value: `${stats.bestTeam.winRate}%`,
            subtext: `${stats.bestTeam.wins}W / ${stats.bestTeam.games}G`,
            color: 'from-cyan-400 to-blue-500',
            isTeam: true,
        },
        stats.mostPickedHero && {
            icon: 'fa-mask',
            title: language === 'th' ? 'ฮีโร่ยอดนิยม' : 'Most Picked Hero',
            name: stats.mostPickedHero.name,
            value: `${stats.mostPickedHero.picks} ${language === 'th' ? 'ครั้ง' : 'picks'}`,
            subtext: `WR: ${stats.mostPickedHero.winRate}%`,
            color: 'from-purple-500 to-violet-600',
            heroImage: getHeroImage(stats.mostPickedHero.name),
        },
        stats.bestWinRateHero && {
            icon: 'fa-star',
            title: language === 'th' ? 'ฮีโร่ Win Rate สูงสุด' : 'Best Hero Win Rate',
            name: stats.bestWinRateHero.name,
            value: `${stats.bestWinRateHero.winRate}%`,
            subtext: `${stats.bestWinRateHero.picks} ${language === 'th' ? 'ครั้ง' : 'picks'}`,
            color: 'from-emerald-500 to-green-600',
            heroImage: getHeroImage(stats.bestWinRateHero.name),
        },
    ].filter(Boolean) as { icon: string; title: string; name: string; value: string; color: string; team?: string; subtext?: string; isTeam?: boolean; heroImage?: string | null }[];

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`${card.bgColor} rounded-xl p-4 md:p-5 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                    >
                        <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${card.color} text-white mb-3 shadow-lg`}>
                            <i className={`fas ${card.icon} text-lg md:text-xl`}></i>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                        <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                            {card.value}
                        </p>
                        {card.subtext && (
                            <p className="text-xs text-gray-400 mt-1 truncate" title={card.subtext}>{card.subtext}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {highlightCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                <i className={`fas ${card.icon} text-white text-sm`}></i>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">{card.title}</span>
                        </div>

                        {/* Content */}
                        <div className="flex items-center gap-3">
                            {/* Avatar/Logo/Hero Image */}
                            {card.heroImage ? (
                                <img src={card.heroImage} alt={card.name} className="w-12 h-12 rounded-lg border-2 border-gray-200 object-cover bg-gray-900" />
                            ) : card.isTeam ? (
                                <TeamLogo teamName={card.name} size="lg" />
                            ) : (
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {card.name?.charAt(0)?.toUpperCase()}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-uefa-dark truncate text-lg">{card.name}</p>
                                {card.team && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <TeamLogo teamName={card.team} size="xs" />
                                        <span className="text-xs text-gray-500 truncate">{card.team}</span>
                                    </div>
                                )}
                                {card.subtext && !card.team && (
                                    <p className="text-xs text-gray-500">{card.subtext}</p>
                                )}
                            </div>

                            {/* Value Badge */}
                            <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-br ${card.color} text-white font-bold text-sm shadow-md`}>
                                {card.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Longest Game */}
            {stats.longestGame && stats.longestGame.duration > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                            <i className="fas fa-hourglass-half"></i>
                        </div>
                        <div>
                            <p className="text-sm text-amber-700 font-medium">{language === 'th' ? 'เกมที่ยาวนานที่สุด' : 'Longest Game'}</p>
                            <p className="font-bold text-amber-900">
                                {formatDuration(stats.longestGame.duration)} - {stats.longestGame.match}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TeamStats(): React.ReactElement {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState<TeamStatData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiService.getTeamStats()
            .then(data => {
                // Sort by Win Rate -> Wins -> KDA -> Kills
                const sortedData = (data || []).sort((a: TeamStatData, b: TeamStatData) => {
                    const winRateA = a.realGamesPlayed > 0 ? (a.realWins / a.realGamesPlayed) : 0;
                    const winRateB = b.realGamesPlayed > 0 ? (b.realWins / b.realGamesPlayed) : 0;
                    if (winRateB !== winRateA) return winRateB - winRateA;
                    if (b.realWins !== a.realWins) return b.realWins - a.realWins;
                    if ((b.kda || 0) !== (a.kda || 0)) return (b.kda || 0) - (a.kda || 0);
                    return (b.totalKills || 0) - (a.totalKills || 0);
                });
                setStats(sortedData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <TableSkeleton rows={8} cols={10} />;
    if (error) return <ErrorState title={t?.common?.error || 'Error'} message={error} onRetry={() => window.location.reload()} />;

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full uefa-table min-w-[1100px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <th className="p-3 text-left text-uefa-dark border-b border-gray-200 w-12">#</th>
                                <th className="p-3 text-left text-uefa-dark border-b border-gray-200">{t.standings.team}</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200" title="Games">{language === 'th' ? 'เกม' : 'G'}</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200" title="Win-Loss">{language === 'th' ? 'ชนะ-แพ้' : 'W-L'}</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200">{t.stats.winRate}</th>
                                <th className="p-3 text-center text-blue-600 border-b border-gray-200" title="Kills">K</th>
                                <th className="p-3 text-center text-red-500 border-b border-gray-200" title="Deaths">D</th>
                                <th className="p-3 text-center text-green-600 border-b border-gray-200" title="Assists">A</th>
                                <th className="p-3 text-center text-yellow-600 border-b border-gray-200" title="MVP Count">MVP</th>
                                <th className="p-3 text-center text-cyan-aura border-b border-gray-200 font-bold" title="KDA Ratio">KDA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.length === 0 ? (
                                <tr><td colSpan={10} className="p-8 text-center text-gray-500">{t.common.noData}</td></tr>
                            ) : (
                                stats.map((team, idx) => {
                                    const kda = team.kda?.toFixed(2) || '0.00';
                                    const winRate = team.winRate?.toFixed(1) || '0';
                                    const isTop3 = idx < 3;

                                    return (
                                        <tr key={team.teamName} className={`hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${isTop3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}`}>
                                            {/* Rank */}
                                            <td className="p-3 text-center">
                                                {idx === 0 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-md mx-auto">1</div>
                                                ) : idx === 1 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-md mx-auto">2</div>
                                                ) : idx === 2 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-md mx-auto">3</div>
                                                ) : (
                                                    <span className="text-gray-400 font-bold">{idx + 1}</span>
                                                )}
                                            </td>
                                            {/* Team */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <TeamLogo teamName={team.teamName} size="md" />
                                                    <span className="font-bold text-uefa-dark truncate max-w-[150px]">{team.teamName}</span>
                                                </div>
                                            </td>
                                            {/* Games */}
                                            <td className="p-3 text-center text-gray-600 font-mono">{team.realGamesPlayed || 0}</td>
                                            {/* Win-Loss */}
                                            <td className="p-3 text-center">
                                                <span className="text-green-600 font-bold">{team.realWins || 0}</span>
                                                <span className="text-gray-400 mx-1">-</span>
                                                <span className="text-red-500 font-bold">{team.realLosses || 0}</span>
                                            </td>
                                            {/* Win Rate */}
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-20 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${parseFloat(winRate) >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : parseFloat(winRate) >= 50 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
                                                            style={{ width: `${winRate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`font-bold text-sm ${parseFloat(winRate) >= 70 ? 'text-green-600' : parseFloat(winRate) >= 50 ? 'text-cyan-600' : 'text-orange-600'}`}>{winRate}%</span>
                                                </div>
                                            </td>
                                            {/* Kills */}
                                            <td className="p-3 text-center font-mono text-blue-600 font-bold">{team.totalKills || 0}</td>
                                            {/* Deaths */}
                                            <td className="p-3 text-center font-mono text-red-500 font-bold">{team.totalDeaths || 0}</td>
                                            {/* Assists */}
                                            <td className="p-3 text-center font-mono text-green-600 font-bold">{team.totalAssists || 0}</td>
                                            {/* MVP */}
                                            <td className="p-3 text-center">
                                                {team.mvpCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold text-sm">
                                                        <i className="fas fa-crown text-xs"></i>
                                                        {team.mvpCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            {/* KDA */}
                                            <td className="p-3 text-center">
                                                <span className="text-lg font-bold text-cyan-aura bg-cyan-aura/10 px-3 py-1 rounded-lg inline-block">{kda}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {stats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t.common.noData}</div>
                ) : (
                    stats.map((team, idx) => {
                        const kda = team.kda?.toFixed(2) || '0.00';
                        const winRate = team.winRate?.toFixed(1) || '0';
                        const isTop3 = idx < 3;

                        return (
                            <div key={team.teamName} className={`bg-white rounded-xl p-4 border ${isTop3 ? 'border-yellow-200 shadow-md' : 'border-gray-200'}`}>
                                {/* Header: Rank + Team */}
                                <div className="flex items-center gap-3 mb-3">
                                    {idx === 0 ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">1</div>
                                    ) : idx === 1 ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-lg">2</div>
                                    ) : idx === 2 ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">3</div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">{idx + 1}</div>
                                    )}
                                    <TeamLogo teamName={team.teamName} size="lg" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-uefa-dark truncate">{team.teamName}</p>
                                        <p className="text-sm text-gray-500">{team.realGamesPlayed || 0} {language === 'th' ? 'เกม' : 'games'}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-cyan-aura">{kda}</div>
                                        <div className="text-xs text-gray-500">KDA</div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <div className="text-center p-2 bg-green-50 rounded-lg">
                                        <div className="text-green-600 font-bold">{team.realWins || 0}</div>
                                        <div className="text-xs text-gray-500">{language === 'th' ? 'ชนะ' : 'Wins'}</div>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 rounded-lg">
                                        <div className="text-red-500 font-bold">{team.realLosses || 0}</div>
                                        <div className="text-xs text-gray-500">{language === 'th' ? 'แพ้' : 'Loss'}</div>
                                    </div>
                                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                        <div className="text-yellow-600 font-bold">{team.mvpCount || 0}</div>
                                        <div className="text-xs text-gray-500">MVP</div>
                                    </div>
                                    <div className="text-center p-2 bg-cyan-50 rounded-lg">
                                        <div className={`font-bold ${parseFloat(winRate) >= 70 ? 'text-green-600' : parseFloat(winRate) >= 50 ? 'text-cyan-600' : 'text-orange-600'}`}>{winRate}%</div>
                                        <div className="text-xs text-gray-500">WR</div>
                                    </div>
                                </div>

                                {/* K/D/A Bar */}
                                <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-blue-600 font-bold">{team.totalKills || 0}</span>
                                        <span className="text-gray-400">K</span>
                                    </div>
                                    <div className="text-gray-300">/</div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-red-500 font-bold">{team.totalDeaths || 0}</span>
                                        <span className="text-gray-400">D</span>
                                    </div>
                                    <div className="text-gray-300">/</div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-green-600 font-bold">{team.totalAssists || 0}</span>
                                        <span className="text-gray-400">A</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Enhanced PlayerStats Component
function PlayerStats(): React.ReactElement {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState<PlayerStatData[]>([]);
    const [heroStats, setHeroStats] = useState<PlayerHeroStat[]>([]);
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            apiService.getPlayerStats(),
            apiService.getPlayerHeroStats(),
            apiService.getHeroes()
        ])
            .then(([playerData, heroStatData, heroData]) => {
                setStats(playerData || []);
                setHeroStats(heroStatData || []);
                setHeroes(heroData || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getHeroImage = (heroName: string): string | null => {
        const hero = heroes.find(h => h.name === heroName);
        return hero?.imageUrl || null;
    };

    const getPlayerTopHeroes = (playerRealName: string): PlayerHeroData[] => {
        const playerHeroStat = heroStats.find(h =>
            h.realName === playerRealName || h.playerName === playerRealName
        );
        return playerHeroStat?.topHeroes || [];
    };

    if (loading) return <TableSkeleton rows={10} cols={12} />;
    if (error) return <ErrorState title={t?.common?.error || 'Error'} message={error} onRetry={() => window.location.reload()} />;

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full uefa-table min-w-[1200px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <th className="p-3 text-center w-12 text-uefa-dark border-b border-gray-200">#</th>
                                <th className="p-3 text-left text-uefa-dark border-b border-gray-200">{t.stats.playerShort}</th>
                                <th className="p-3 text-left text-uefa-dark border-b border-gray-200">{t.stats.team}</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200" title="Top Heroes">{t.stats.heroes}</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200" title="Games">G</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200" title="Win Rate">WR%</th>
                                <th className="p-3 text-center text-blue-600 border-b border-gray-200" title="Kills">K</th>
                                <th className="p-3 text-center text-red-500 border-b border-gray-200" title="Deaths">D</th>
                                <th className="p-3 text-center text-green-600 border-b border-gray-200" title="Assists">A</th>
                                <th className="p-3 text-center text-yellow-600 border-b border-gray-200" title="MVP Count">MVP</th>
                                <th className="p-3 text-center text-cyan-aura font-bold border-b border-gray-200" title="KDA Ratio">KDA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.length === 0 ? (
                                <tr><td colSpan={11} className="p-8 text-center text-gray-500">{t.common.noData}</td></tr>
                            ) : (
                                stats.slice(0, 50).map((p, idx) => {
                                    const topHeroes = getPlayerTopHeroes(p.realName || p.playerName);
                                    const isTop3 = idx < 3;
                                    const kda = p.kda?.toFixed(2) || '0.00';
                                    const winRate = p.winRate || 0;

                                    return (
                                        <tr key={`${p.teamName}-${p.realName || p.playerName}`} className={`hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${isTop3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}`}>
                                            {/* Rank */}
                                            <td className="p-3 text-center">
                                                {idx === 0 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-md mx-auto">1</div>
                                                ) : idx === 1 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-md mx-auto">2</div>
                                                ) : idx === 2 ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-md mx-auto">3</div>
                                                ) : (
                                                    <span className="text-gray-400 font-bold">{idx + 1}</span>
                                                )}
                                            </td>
                                            {/* Player Name */}
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-uefa-dark">{p.realName || p.playerName}</span>
                                                    {p.realName && p.playerName && p.realName !== p.playerName && (
                                                        <span className="text-xs text-gray-400">IGN: {p.playerName}</span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Team */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <TeamLogo teamName={p.teamName} size="xs" />
                                                    <span className="text-sm text-gray-600 truncate max-w-[100px]">{p.teamName}</span>
                                                </div>
                                            </td>
                                            {/* Top Heroes */}
                                            <td className="p-2 max-w-[120px]">
                                                <div className="flex gap-1 justify-center">
                                                    {topHeroes.length > 0 ? (
                                                        topHeroes.slice(0, 3).map((hero: PlayerHeroData, i: number) => (
                                                            <div key={i} title={`${hero.heroName} (${hero.gamesPlayed} games)`}>
                                                                {getHeroImage(hero.heroName) ? (
                                                                    <img src={getHeroImage(hero.heroName)!} alt={hero.heroName} className="w-7 h-7 rounded border border-gray-200 object-cover bg-gray-900" />
                                                                ) : (
                                                                    <div className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                                        {hero.heroName?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Games */}
                                            <td className="p-3 text-center font-mono text-gray-600 font-bold">{p.gamesPlayed}</td>
                                            {/* Win Rate */}
                                            <td className="p-3 text-center">
                                                <span className={`font-bold text-sm ${winRate >= 70 ? 'text-green-600' : winRate >= 50 ? 'text-cyan-600' : 'text-orange-500'}`}>
                                                    {winRate}%
                                                </span>
                                            </td>
                                            {/* K/D/A */}
                                            <td className="p-3 text-center font-mono font-bold text-blue-600">{p.totalKills}</td>
                                            <td className="p-3 text-center font-mono font-bold text-red-500">{p.totalDeaths}</td>
                                            <td className="p-3 text-center font-mono font-bold text-green-600">{p.totalAssists}</td>
                                            {/* MVP */}
                                            <td className="p-3 text-center">
                                                {p.mvpCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold text-sm">
                                                        <i className="fas fa-crown text-xs"></i>
                                                        {p.mvpCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            {/* KDA */}
                                            <td className="p-3 text-center">
                                                <span className="text-lg font-bold text-cyan-aura bg-cyan-aura/10 px-3 py-1 rounded-lg inline-block">{kda}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {stats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t.common.noData}</div>
                ) : (
                    stats.slice(0, 30).map((p, idx) => {
                        const topHeroes = getPlayerTopHeroes(p.realName || p.playerName);
                        const isTop3 = idx < 3;
                        const kda = p.kda?.toFixed(2) || '0.00';
                        const winRate = p.winRate || 0;

                        return (
                            <div key={`${p.teamName}-${p.realName || p.playerName}`} className={`bg-white rounded-xl p-4 border ${isTop3 ? 'border-yellow-200 shadow-md' : 'border-gray-200'}`}>
                                {/* Header: Rank + Player + KDA */}
                                <div className="flex items-center gap-3 mb-3">
                                    {idx === 0 ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">1</div>
                                    ) : idx === 1 ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow-lg">2</div>
                                    ) : idx === 2 ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">3</div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">{idx + 1}</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-uefa-dark truncate">{p.realName || p.playerName}</p>
                                        {p.realName && p.playerName && p.realName !== p.playerName && (
                                            <p className="text-xs text-gray-400 truncate">IGN: {p.playerName}</p>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <TeamLogo teamName={p.teamName} size="xs" />
                                            <span className="text-xs text-gray-500 truncate">{p.teamName}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-cyan-aura">{kda}</div>
                                        <div className="text-xs text-gray-500">KDA</div>
                                    </div>
                                </div>

                                {/* Top Heroes */}
                                {topHeroes.length > 0 && (
                                    <div className="flex gap-1 mb-3">
                                        {topHeroes.slice(0, 3).map((hero: PlayerHeroData, i: number) => (
                                            <div key={i} title={hero.heroName}>
                                                {getHeroImage(hero.heroName) ? (
                                                    <img src={getHeroImage(hero.heroName)!} alt={hero.heroName} className="w-8 h-8 rounded border border-gray-200 object-cover bg-gray-900" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {hero.heroName?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-5 gap-1.5 mb-3">
                                    <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                                        <div className="text-gray-700 font-bold text-sm">{p.gamesPlayed}</div>
                                        <div className="text-xs text-gray-400">G</div>
                                    </div>
                                    <div className="text-center p-1.5 bg-green-50 rounded-lg">
                                        <div className={`font-bold text-sm ${winRate >= 70 ? 'text-green-600' : winRate >= 50 ? 'text-cyan-600' : 'text-orange-500'}`}>{winRate}%</div>
                                        <div className="text-xs text-gray-400">WR</div>
                                    </div>
                                    <div className="text-center p-1.5 bg-yellow-50 rounded-lg">
                                        <div className="text-yellow-600 font-bold text-sm">{p.mvpCount || 0}</div>
                                        <div className="text-xs text-gray-400">MVP</div>
                                    </div>
                                    <div className="text-center p-1.5 bg-blue-50 rounded-lg">
                                        <div className="text-blue-600 font-bold text-sm">{p.avgKillsPerGame || 0}</div>
                                        <div className="text-xs text-gray-400">K/G</div>
                                    </div>
                                    <div className="text-center p-1.5 bg-green-50 rounded-lg">
                                        <div className="text-green-600 font-bold text-sm">{p.avgAssistsPerGame || 0}</div>
                                        <div className="text-xs text-gray-400">A/G</div>
                                    </div>
                                </div>

                                {/* K/D/A Bar */}
                                <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-blue-600 font-bold">{p.totalKills}</span>
                                        <span className="text-gray-400">K</span>
                                    </div>
                                    <div className="text-gray-300">/</div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-red-500 font-bold">{p.totalDeaths}</span>
                                        <span className="text-gray-400">D</span>
                                    </div>
                                    <div className="text-gray-300">/</div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-green-600 font-bold">{p.totalAssists}</span>
                                        <span className="text-gray-400">A</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default function StatsPage(): React.ReactElement {
    const { t, language } = useLanguage();
    const location = useLocation();
    const path = location.pathname;

    // Determine active tab
    const activeTab = path === '/stats/player' ? 'player' : path === '/stats/team' ? 'team' : 'season';

    const tabs = [
        { path: '/stats', id: 'season', label: language === 'th' ? 'ภาพรวม' : 'Overview', icon: 'fa-chart-pie' },
        { path: '/stats/team', id: 'team', label: t.stats.team, icon: 'fa-users' },
        { path: '/stats/player', id: 'player', label: t.stats.player, icon: 'fa-user-ninja' },
    ];

    return (
        <div className="flex-grow bg-gray-50">
            {/* Header */}
            <div className="bg-uefa-dark py-6 md:py-12 mb-4 md:mb-8 border-b-4 border-cyan-aura shadow-lg">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl md:text-5xl font-display font-bold text-white uppercase tracking-wider truncate">
                            {t.stats.title}
                        </h1>
                        <p className="text-cyan-aura/80 font-sans mt-1 text-xs md:text-base hidden sm:block">RoV Tournament Official Statistics</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        <ShareButton title={`${t.stats.title} - RoV SN Tournament`} url={window.location.href} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Navigation Tabs (Mobile Optimized) */}
                <div className="grid grid-cols-3 md:flex md:flex-wrap gap-1 md:gap-2 mb-6 md:mb-8 p-1 bg-white rounded-xl w-full md:w-fit border border-gray-200 shadow-sm">
                    {tabs.map(tab => (
                        <Link
                            key={tab.path}
                            to={tab.path}
                            className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 px-1.5 md:px-4 py-2 md:py-3 rounded-lg font-bold text-[11px] md:text-base transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-uefa-dark text-cyan-aura shadow-md'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <i className={`fas ${tab.icon} text-sm md:text-base`}></i>
                            <span className="text-center leading-tight">{tab.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Content Area */}
                <div className="animate-fade-in-up">
                    <h2 className="flex items-center gap-3 text-2xl font-display font-bold text-uefa-dark mb-6">
                        <span className="w-1.5 h-8 bg-cyan-aura rounded-full"></span>
                        {activeTab === 'season' && (language === 'th' ? 'ภาพรวมทัวร์นาเมนต์' : 'Tournament Overview')}
                        {activeTab === 'team' && t.stats.team}
                        {activeTab === 'player' && t.stats.player}
                    </h2>

                    {activeTab === 'season' && <SeasonStats />}
                    {activeTab === 'team' && <TeamStats />}
                    {activeTab === 'player' && <PlayerStats />}
                </div>
            </div>
        </div>
    );
}
