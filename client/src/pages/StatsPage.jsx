import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchSeasonStats, fetchTeamStats, fetchPlayerStats, fetchPlayerHeroStats, fetchHeroes } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { StatsSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';

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
    // Error handled in render
    if (!stats && !loading && !error) return <EmptyState title={t.common.noData} message="" />;

    const duration = stats?.avgGameDuration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 md:p-6 rounded shadow border-t-4 border-cyan-aura">
                <p className="text-gray-500 uppercase text-xs font-bold mb-2">{t.stats.totalKills}</p>
                <div className="text-3xl md:text-5xl font-display font-bold text-uefa-dark">
                    {error ? <span className="text-gray-300 text-4xl">-</span> : (stats?.totalKills || 0).toLocaleString()}
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded shadow border-t-4 border-cyan-aura">
                <p className="text-gray-500 uppercase text-xs font-bold mb-2">{t.stats.totalDeaths}</p>
                <div className="text-3xl md:text-5xl font-display font-bold text-uefa-dark">
                    {error ? <span className="text-gray-300 text-4xl">-</span> : (stats?.totalDeaths || 0).toLocaleString()}
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded shadow border-t-4 border-cyan-aura">
                <p className="text-gray-500 uppercase text-xs font-bold mb-2">{t.stats.avgGameTime}</p>
                <div className="text-3xl md:text-5xl font-display font-bold text-uefa-dark">
                    {error ? <span className="text-gray-300 text-4xl">-</span> : timeStr}
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

    // Error logic moved to table render

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="w-full uefa-table">
                <thead>
                    <tr>
                        <th className="p-4 text-left">{t.standings.team}</th>
                        <th className="p-4 text-center">{t.stats.games}</th>
                        <th className="p-4 text-center">{t.stats.wins}</th>
                        <th className="p-4 text-center">{t.stats.losses}</th>
                        <th className="p-4 text-center">{t.stats.winRate}</th>
                        <th className="p-4 text-center" title="(Total Kills + Assists) / Total Deaths">Team {t.stats.kda}</th>
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
                            stats.map(t => {
                                // Team KDA Calculation
                                // Team KDA Calculation
                                const kdaRatio = t.totalDeaths === 0
                                    ? (t.totalKills + t.totalAssists)
                                    : ((t.totalKills + t.totalAssists) / t.totalDeaths);

                                const games = t.realGamesPlayed || 0;
                                const wins = t.realWins || 0;
                                const losses = games - wins;

                                const winRate = games > 0
                                    ? ((wins / games) * 100).toFixed(1)
                                    : 0;

                                return (
                                    <tr key={t.teamName} className="hover:bg-echo-white transition">
                                        <td className="p-4 font-bold text-uefa-dark flex items-center gap-2">
                                            <TeamLogo teamName={t.teamName} size="md" />
                                            {t.teamName}
                                        </td>
                                        <td className="p-4 text-center">{games}</td>
                                        <td className="p-4 text-center text-green-600 font-bold">{wins}</td>
                                        <td className="p-4 text-center text-red-500 font-bold">{losses}</td>
                                        <td className="p-4 text-center text-sm">{winRate}%</td>
                                        <td className="p-4 text-center font-bold text-cyan-aura">{kdaRatio.toFixed(2)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                )}
            </table>
        </div>
    );
}

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

    // Get hero image URL
    const getHeroImage = (heroName) => {
        const hero = heroes.find(h => h.name === heroName);
        return hero?.imageUrl || null;
    };

    // Get top heroes for a player
    const getPlayerTopHeroes = (playerName) => {
        const playerHeroStat = heroStats.find(h => h.playerName === playerName);
        return playerHeroStat?.topHeroes || [];
    };

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full uefa-table min-w-[600px]">
                <thead>
                    <tr>
                        <th className="p-4 text-center w-16">#</th>
                        <th className="p-4 text-left">{t.stats.playerShort}</th>
                        <th className="p-4 text-left">{t.stats.team}</th>
                        <th className="p-2 md:p-4 text-center hide-mobile" title="Top Heroes">Heroes</th>
                        <th className="p-4 text-center" title="Games Played">{t.stats.games}</th>
                        <th className="p-4 text-center text-blue-600" title="Total Kills">K</th>
                        <th className="p-4 text-center text-red-600" title="Total Deaths">D</th>
                        <th className="p-4 text-center text-green-600" title="Total Assists">A</th>
                        <th className="p-2 md:p-4 text-right hide-mobile" title="Total Damage Dealt">{t.stats.damage}</th>
                        <th className="p-2 md:p-4 text-right hide-mobile" title="Total Damage Taken">{t.stats.taken}</th>
                        <th className="p-4 text-center font-bold text-cyan-aura" title="KDA Ratio">{t.stats.kda}</th>
                    </tr>
                </thead>
                {loading ? (
                    <TableSkeleton rows={10} cols={11} />
                ) : error ? (
                    <tbody>
                        <tr>
                            <td colSpan="11" className="p-8 text-center text-red-500 font-bold">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                {t.common.error}: {error}
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {stats.length === 0 ? (
                            <tr><td colSpan="11" className="p-8 text-center text-gray-500">{t.common.noData}</td></tr>
                        ) : (
                            stats.slice(0, 50).map((p, idx) => {
                                const topHeroes = getPlayerTopHeroes(p.playerName);
                                return (
                                    <tr key={`${p.teamName}-${p.playerName}`} className={`hover:bg-echo-white transition ${idx < 3 ? 'bg-yellow-50/40' : ''}`}>
                                        <td className={`p-4 text-center font-bold ${idx < 3 ? 'text-amber-500 text-lg' : 'text-gray-400'}`}>
                                            {idx + 1}
                                        </td>
                                        <td className="p-4 font-bold text-uefa-dark">{p.playerName}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <TeamLogo teamName={p.teamName} size="sm" />
                                                <span className="text-sm text-gray-600">{p.teamName}</span>
                                            </div>
                                        </td>
                                        <td className="p-2 md:p-4 hide-mobile">
                                            <div className="flex gap-1 justify-center">
                                                {topHeroes.length > 0 ? (
                                                    topHeroes.map((hero, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative group"
                                                            title={`${hero.heroName} (${hero.gamesPlayed} games, ${hero.winRate?.toFixed(0)}% WR)`}
                                                        >
                                                            {getHeroImage(hero.heroName) ? (
                                                                <img
                                                                    src={getHeroImage(hero.heroName)}
                                                                    alt={hero.heroName}
                                                                    className="w-7 h-7 rounded-md border border-gray-200 object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                                    {hero.heroName?.charAt(0)}
                                                                </div>
                                                            )}
                                                            <span className="absolute -bottom-1 -right-1 bg-cyan-aura text-white text-[8px] px-1 rounded-full font-bold">
                                                                {hero.gamesPlayed}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-mono text-gray-600">{p.gamesPlayed}</td>
                                        <td className="p-4 text-center font-mono">{p.totalKills}</td>
                                        <td className="p-4 text-center font-mono">{p.totalDeaths}</td>
                                        <td className="p-4 text-center font-mono">{p.totalAssists}</td>
                                        <td className="p-2 md:p-4 text-right font-mono text-sm text-blue-600 hide-mobile">
                                            {(p.totalDamage || 0).toLocaleString()}
                                        </td>
                                        <td className="p-2 md:p-4 text-right font-mono text-sm text-red-600 hide-mobile">
                                            {(p.totalDamageTaken || 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-lg font-bold text-cyan-aura">{p.kda.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                )}
            </table>
        </div>
    );
}

export default function StatsPage() {
    const { t } = useLanguage();
    const location = useLocation();
    const path = location.pathname;

    const tabs = [
        { path: '/stats', label: t.stats.season },
        { path: '/stats/team', label: t.stats.team },
        { path: '/stats/player', label: t.stats.playerShort },
    ];

    return (
        <div className="flex-grow bg-gray-50">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                        {t.stats.title}
                    </h1>

                    {/* Sub-nav */}
                    <div className="flex space-x-3 md:space-x-6 mt-6 md:mt-8 font-display text-gray-400 text-sm md:text-lg uppercase">
                        {tabs.map(tab => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`pb-1 ${path === tab.path ? 'text-cyan-aura border-b-2 border-cyan-aura' : 'hover:text-white'}`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <h2 className="text-2xl font-display font-bold text-uefa-dark mb-6 border-l-4 border-cyan-aura pl-3">
                    {path === '/stats' && t.stats.kpi}
                    {path === '/stats/team' && t.stats.team}
                    {path === '/stats/player' && t.stats.player}
                </h2>

                {path === '/stats' && <SeasonStats />}
                {path === '/stats/team' && <TeamStats />}
                {path === '/stats/player' && <PlayerStats />}
            </div>
        </div>
    );
}
