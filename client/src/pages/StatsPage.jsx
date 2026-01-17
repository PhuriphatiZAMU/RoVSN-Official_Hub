import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchSeasonStats, fetchTeamStats, fetchPlayerStats, fetchPlayerHeroStats, fetchHeroes } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { StatsSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';
import ShareButton from '../components/common/ShareButton';

function SeasonStats() {
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSeasonStats()
            .then(data => setStats(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <StatsSkeleton />;
    if (!stats && !loading && !error) return <EmptyState title={t.common.noData} message="" />;

    const duration = stats?.avgGameDuration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const StatCard = ({ label, value, colorClass }) => (
        <div className={`bg-white p-4 md:p-6 rounded-lg shadow-sm border-t-4 ${colorClass} transition-all hover:shadow-md border border-gray-100`}>
            <p className="text-gray-500 uppercase text-xs font-bold mb-2">{label}</p>
            <div className={`text-3xl md:text-5xl font-display font-bold text-uefa-dark`}>
                {error ? <span className="text-gray-300">-</span> : value}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                label={t.stats.totalKills}
                value={(stats?.totalKills || 0).toLocaleString()}
                colorClass="border-red-500"
            />
            <StatCard
                label={t.stats.totalDeaths}
                value={(stats?.totalDeaths || 0).toLocaleString()}
                colorClass="border-gray-500"
            />
            <StatCard
                label={t.stats.avgGameTime}
                value={timeStr}
                colorClass="border-cyan-aura"
            />

            {/* Additional Stats - Now visible on all screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 col-span-1 md:col-span-3 mt-4">
                {/* Bloodiest Game */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs md:text-sm font-bold uppercase truncate">{t.stats.highestKillGame}</p>
                        <p className="text-lg md:text-2xl font-display font-bold text-uefa-dark mt-1 truncate">
                            {stats?.highestKillGame?.match || '-'}
                        </p>
                    </div>
                    <div className="text-2xl md:text-4xl font-bold text-red-500 bg-red-50 px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex-shrink-0">
                        {stats?.highestKillGame?.kills || 0} <span className="text-xs md:text-base text-gray-500">Kills</span>
                    </div>
                </div>

                {/* Longest Game */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs md:text-sm font-bold uppercase truncate">{t.stats.longestGame}</p>
                        <p className="text-lg md:text-2xl font-display font-bold text-uefa-dark mt-1 truncate">
                            {stats?.longestGame?.match || '-'}
                        </p>
                    </div>
                    <div className="text-2xl md:text-4xl font-bold text-purple-500 bg-purple-50 px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex-shrink-0">
                        {Math.floor((stats?.longestGame?.duration || 0) / 60)}:{((stats?.longestGame?.duration || 0) % 60).toString().padStart(2, '0')}
                        <span className="text-xs md:text-base text-gray-500 ml-1 md:ml-2">Mins</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TeamStats() {
    const { t } = useLanguage();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeamStats()
            .then(data => setStats(data || []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full uefa-table min-w-[600px]">
                    <thead>
                        <tr>
                            <th className="p-4 text-left bg-gray-50 text-uefa-dark border-b border-gray-200">{t.standings.team}</th>
                            <th className="p-4 text-center bg-gray-50 text-uefa-dark border-b border-gray-200">{t.stats.games}</th>
                            <th className="p-4 text-center text-green-600 bg-gray-50 border-b border-gray-200">{t.stats.wins}</th>
                            <th className="p-4 text-center text-red-500 bg-gray-50 border-b border-gray-200">{t.stats.losses}</th>
                            <th className="p-4 text-center bg-gray-50 text-uefa-dark border-b border-gray-200">{t.stats.winRate}</th>
                            <th className="p-4 text-center bg-gray-50 text-uefa-dark border-b border-gray-200" title="(Total Kills + Assists) / Total Deaths">Team {t.stats.kda}</th>
                        </tr>
                    </thead>
                    {loading ? (
                        <TableSkeleton rows={8} cols={6} />
                    ) : error ? (
                        <tbody>
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-red-500 font-bold">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    {t.common.error}: {error}
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {stats.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">{t.common.noData}</td></tr>
                            ) : (
                                stats.map((team, idx) => {
                                    const kdaRatio = team.totalDeaths === 0
                                        ? (team.totalKills + team.totalAssists)
                                        : ((team.totalKills + team.totalAssists) / team.totalDeaths);

                                    const games = team.realGamesPlayed || 0;
                                    const wins = team.realWins || 0;
                                    const losses = games - wins;
                                    const winRate = games > 0 ? ((wins / games) * 100).toFixed(1) : 0;

                                    return (
                                        <tr key={team.teamName} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                                            <td className="p-4 font-bold text-uefa-dark flex items-center gap-3">
                                                <span className="text-gray-400 text-xs w-4">{idx + 1}</span>
                                                <TeamLogo teamName={team.teamName} size="md" />
                                                <span className="truncate max-w-[120px] md:max-w-xs">{team.teamName}</span>
                                            </td>
                                            <td className="p-4 text-center text-gray-600">{games}</td>
                                            <td className="p-4 text-center text-green-600 font-bold">{wins}</td>
                                            <td className="p-4 text-center text-red-500 font-bold">{losses}</td>
                                            <td className="p-4 text-center text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-cyan-aura"
                                                            style={{ width: `${winRate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="w-12 text-right text-gray-600">{winRate}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-bold text-cyan-aura text-lg">{kdaRatio.toFixed(2)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}

// ... Inside PlayerStats function ...
function PlayerStats() {
    const { t } = useLanguage();
    const [stats, setStats] = useState([]);
    const [heroStats, setHeroStats] = useState([]);
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            fetchPlayerStats(),
            fetchPlayerHeroStats(),
            fetchHeroes()
        ])
            .then(([playerData, heroStatData, heroData]) => {
                setStats(playerData || []);
                setHeroStats(heroStatData || []);
                setHeroes(heroData || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getHeroImage = (heroName) => {
        const hero = heroes.find(h => h.name === heroName);
        return hero?.imageUrl || null;
    };

    const getPlayerTopHeroes = (playerName) => {
        const playerHeroStat = heroStats.find(h => h.playerName === playerName);
        return playerHeroStat?.topHeroes || [];
    };

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full uefa-table min-w-[800px]">
                    <thead>
                        <tr>
                            <th className="p-4 text-center w-16 bg-gray-50 text-uefa-dark border-b border-gray-200">#</th>
                            <th className="p-4 text-left sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] md:shadow-none md:static text-uefa-dark border-b border-gray-200">
                                {t.stats.playerShort}
                            </th>
                            <th className="p-4 text-left bg-gray-50 text-uefa-dark border-b border-gray-200">{t.stats.team}</th>
                            <th className="p-2 md:p-4 text-center bg-gray-50 text-uefa-dark border-b border-gray-200" title="Top Heroes">{t.stats.heroes}</th>
                            <th className="p-4 text-center bg-gray-50 text-uefa-dark border-b border-gray-200" title="Games Played">{t.stats.games}</th>
                            <th className="p-4 text-center text-blue-600 bg-gray-50 border-b border-gray-200" title="Total Kills">K</th>
                            <th className="p-4 text-center text-red-600 bg-gray-50 border-b border-gray-200" title="Total Deaths">D</th>
                            <th className="p-4 text-center text-green-600 bg-gray-50 border-b border-gray-200" title="Total Assists">A</th>
                            {/* REMOVED GPM Header */}
                            <th className="p-4 text-center font-bold text-cyan-aura bg-gray-50 border-b border-gray-200" title="KDA Ratio">{t.stats.kda}</th>
                        </tr>
                    </thead>
                    {loading ? (
                        <TableSkeleton rows={10} cols={10} />
                    ) : error ? (
                        <tbody>
                            <tr>
                                <td colSpan="10" className="p-8 text-center text-red-500 font-bold">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    {t.common.error}: {error}
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {stats.length === 0 ? (
                                <tr><td colSpan="10" className="p-8 text-center text-gray-500">{t.common.noData}</td></tr>
                            ) : (
                                stats.slice(0, 50).map((p, idx) => {
                                    const topHeroes = getPlayerTopHeroes(p.playerName);
                                    return (
                                        <tr key={`${p.teamName}-${p.playerName}`} className={`hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${idx < 3 ? 'bg-yellow-50' : 'bg-white'}`}>
                                            <td className="p-4 text-center text-gray-500">
                                                {idx < 3 ? (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-white ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                                        idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                            'bg-gradient-to-br from-orange-400 to-orange-600'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 font-bold text-sm">{idx + 1}</span>
                                                )}
                                            </td>
                                            <td className="p-4 font-bold text-uefa-dark sticky left-0 bg-inherit z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] md:shadow-none">
                                                {p.playerName}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <TeamLogo teamName={p.teamName} size="xs" />
                                                    <span className="text-sm text-gray-600 truncate max-w-[100px]">{p.teamName}</span>
                                                </div>
                                            </td>
                                            <td className="p-2 md:p-4 max-w-[150px]">
                                                <div className="flex gap-1 justify-center flex-wrap">
                                                    {topHeroes.length > 0 ? (
                                                        topHeroes.slice(0, 3).map((hero, i) => (
                                                            <div key={i} className="relative group" title={`${hero.heroName} (${hero.gamesPlayed} games)`}>
                                                                {getHeroImage(hero.heroName) ? (
                                                                    <img src={getHeroImage(hero.heroName)} alt={hero.heroName} className="w-8 h-8 rounded border border-gray-200 object-cover bg-gray-900" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
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
                                            <td className="p-4 text-center font-mono text-gray-600 font-bold">{p.gamesPlayed}</td>
                                            <td className="p-4 text-center font-mono font-bold text-gray-800">{p.totalKills}</td>
                                            <td className="p-4 text-center font-mono font-bold text-gray-800">{p.totalDeaths}</td>
                                            <td className="p-4 text-center font-mono font-bold text-gray-800">{p.totalAssists}</td>
                                            {/* REMOVED GPM Cell */}
                                            <td className="p-4 text-center">
                                                <span className="text-lg font-bold text-cyan-aura bg-cyan-aura/10 px-2 py-1 rounded inline-block min-w-[60px]">
                                                    {p.kda.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}

export default function StatsPage() {
    const { t } = useLanguage();
    const location = useLocation();
    const path = location.pathname;

    // Determine active tab
    const activeTab = path === '/stats/team' ? 'team' : path === '/stats/player' ? 'player' : 'season';

    const tabs = [
        { path: '/stats', id: 'season', label: t.stats.season, icon: 'fa-chart-pie' },
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
                        <ShareButton title={`${t.stats.title} - RoV SN Tournament`} />
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
                        {activeTab === 'season' && t.stats.kpi}
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
