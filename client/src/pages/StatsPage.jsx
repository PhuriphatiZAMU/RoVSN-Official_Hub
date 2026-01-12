import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchSeasonStats, fetchTeamStats, fetchPlayerStats } from '../services/api';
import TeamLogo from '../components/common/TeamLogo';
import { StatsSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';

function SeasonStats() {
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
    if (error) return <ErrorState title="ไม่สามารถโหลดสถิติได้" message={error} />;
    if (!stats) return <EmptyState title="ยังไม่มีข้อมูล" message="ยังไม่มีสถิติในระบบ" />;

    const duration = stats.avgGameDuration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow border-t-4 border-cyan-aura">
                <p className="text-gray-500 uppercase text-xs font-bold mb-2">Total Kills</p>
                <div className="text-5xl font-display font-bold text-uefa-dark">
                    {(stats.totalKills || 0).toLocaleString()}
                </div>
            </div>
            <div className="bg-white p-6 rounded shadow border-t-4 border-cyan-aura">
                <p className="text-gray-500 uppercase text-xs font-bold mb-2">Total Deaths</p>
                <div className="text-5xl font-display font-bold text-uefa-dark">
                    {(stats.totalDeaths || 0).toLocaleString()}
                </div>
            </div>
            <div className="bg-white p-6 rounded shadow border-t-4 border-cyan-aura">
                <p className="text-gray-500 uppercase text-xs font-bold mb-2">Avg Game Time</p>
                <div className="text-5xl font-display font-bold text-uefa-dark">{timeStr}</div>
            </div>
        </div>
    );
}

function TeamStats() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeamStats()
            .then(data => setStats(data || []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (error) return <ErrorState title="ไม่สามารถโหลดสถิติทีมได้" message={error} />;

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="w-full uefa-table">
                <thead>
                    <tr>
                        <th className="p-4 text-left">Club</th>
                        <th className="p-4 text-center">Games</th>
                        <th className="p-4 text-center">Win</th>
                        <th className="p-4 text-center">Lose</th>
                        <th className="p-4 text-center">Win Rate</th>
                        <th className="p-4 text-center" title="(Total Kills + Assists) / Total Deaths">Team KDA</th>
                    </tr>
                </thead>
                {loading ? (
                    <TableSkeleton rows={8} cols={6} />
                ) : (
                    <tbody>
                        {stats.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลสถิติทีม</td></tr>
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
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlayerStats()
            .then(data => setStats(data || []))
            // Sort by KDA Ratio (highest first) as default ranking
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (error) return <ErrorState title="ไม่สามารถโหลดสถิติผู้เล่นได้" message={error} />;

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full uefa-table min-w-[900px]">
                <thead>
                    <tr>
                        <th className="p-4 text-center w-16">#</th>
                        <th className="p-4 text-left">Player</th>
                        <th className="p-4 text-left">Team</th>
                        <th className="p-4 text-center" title="Games Played">G</th>
                        <th className="p-4 text-center text-blue-600" title="Total Kills">K</th>
                        <th className="p-4 text-center text-red-600" title="Total Deaths">D</th>
                        <th className="p-4 text-center text-green-600" title="Total Assists">A</th>
                        <th className="p-4 text-right" title="Total Damage Dealt">Damage</th>
                        <th className="p-4 text-right" title="Total Damage Taken">Taken</th>
                        <th className="p-4 text-center font-bold text-cyan-aura" title="KDA Ratio">KDA</th>
                    </tr>
                </thead>
                {loading ? (
                    <TableSkeleton rows={10} cols={10} />
                ) : (
                    <tbody>
                        {stats.length === 0 ? (
                            <tr><td colSpan="10" className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลสถิติผู้เล่น</td></tr>
                        ) : (
                            stats.slice(0, 50).map((p, idx) => (
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
                                    <td className="p-4 text-center font-mono text-gray-600">{p.gamesPlayed}</td>
                                    <td className="p-4 text-center font-mono">{p.totalKills}</td>
                                    <td className="p-4 text-center font-mono">{p.totalDeaths}</td>
                                    <td className="p-4 text-center font-mono">{p.totalAssists}</td>
                                    <td className="p-4 text-right font-mono text-sm text-blue-600">
                                        {(p.totalDamage || 0).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right font-mono text-sm text-red-600">
                                        {(p.totalDamageTaken || 0).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-lg font-bold text-cyan-aura">{p.kda.toFixed(2)}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                )}
            </table>
        </div>
    );
}

export default function StatsPage() {
    const location = useLocation();
    const path = location.pathname;

    const tabs = [
        { path: '/stats', label: 'Season' },
        { path: '/stats/team', label: 'Club' },
        { path: '/stats/player', label: 'Player' },
    ];

    return (
        <div className="flex-grow bg-gray-50">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                        Statistics
                    </h1>

                    {/* Sub-nav */}
                    <div className="flex space-x-6 mt-8 font-display text-gray-400 text-lg uppercase">
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
                    {path === '/stats' && 'Key Performance Indicators'}
                    {path === '/stats/team' && 'Club Rankings'}
                    {path === '/stats/player' && 'Top Players'}
                </h2>

                {path === '/stats' && <SeasonStats />}
                {path === '/stats/team' && <TeamStats />}
                {path === '/stats/player' && <PlayerStats />}
            </div>
        </div>
    );
}
