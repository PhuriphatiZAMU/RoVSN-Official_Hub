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

    if (loading) {
        return (
            <table className="w-full uefa-table">
                <thead>
                    <tr>
                        <th className="p-4 text-left">Club</th>
                        <th className="p-4 text-center">Games</th>
                        <th className="p-4 text-center">Wins</th>
                        <th className="p-4 text-center">Win Rate</th>
                        <th className="p-4 text-center">K/D/A</th>
                        <th className="p-4 text-center">KDA</th>
                        <th className="p-4 text-center">Gold (Avg)</th>
                    </tr>
                </thead>
                <TableSkeleton rows={8} cols={7} />
            </table>
        );
    }

    if (error) return <ErrorState title="ไม่สามารถโหลดสถิติทีมได้" message={error} />;
    if (stats.length === 0) return <EmptyState title="ยังไม่มีข้อมูลสถิติทีม" message="" />;

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="w-full uefa-table">
                <thead>
                    <tr>
                        <th className="p-4 text-left">Club</th>
                        <th className="p-4 text-center">Games</th>
                        <th className="p-4 text-center">Wins</th>
                        <th className="p-4 text-center">Win Rate</th>
                        <th className="p-4 text-center">K/D/A</th>
                        <th className="p-4 text-center">KDA</th>
                        <th className="p-4 text-center">Gold (Avg)</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map(t => {
                        const kdaRatio = t.totalDeaths === 0
                            ? (t.totalKills + t.totalAssists)
                            : ((t.totalKills + t.totalAssists) / t.totalDeaths);
                        const winRate = t.realGamesPlayed > 0
                            ? ((t.realWins / t.realGamesPlayed) * 100).toFixed(1)
                            : 0;

                        return (
                            <tr key={t.teamName} className="hover:bg-echo-white transition">
                                <td className="p-4 font-bold text-uefa-dark flex items-center gap-2">
                                    <TeamLogo teamName={t.teamName} size="md" />
                                    {t.teamName}
                                </td>
                                <td className="p-4 text-center">{t.realGamesPlayed || 0}</td>
                                <td className="p-4 text-center text-green-600 font-bold">{t.realWins || 0}</td>
                                <td className="p-4 text-center text-sm">{winRate}%</td>
                                <td className="p-4 text-center text-sm">{t.totalKills} / {t.totalDeaths} / {t.totalAssists}</td>
                                <td className="p-4 text-center font-bold">{kdaRatio.toFixed(2)}</td>
                                <td className="p-4 text-center font-mono">
                                    {Math.round(t.totalGold / (t.realGamesPlayed || 1)).toLocaleString()}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
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
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded"></div>
                ))}
            </div>
        );
    }

    if (error) return <ErrorState title="ไม่สามารถโหลดสถิติผู้เล่นได้" message={error} />;
    if (stats.length === 0) return <EmptyState title="ยังไม่มีข้อมูลสถิติผู้เล่น" message="" />;

    return (
        <div className="space-y-3">
            {stats.slice(0, 10).map((p, idx) => (
                <div
                    key={p.playerName}
                    className={`bg-white p-4 flex items-center justify-between shadow-sm ${idx < 3 ? 'border-l-4 border-cyan-aura' : ''}`}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-display font-bold text-gray-500">
                            {idx + 1}
                        </div>
                        <div>
                            <div className="font-bold text-lg">{p.playerName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                <TeamLogo teamName={p.teamName} size="sm" />
                                {p.teamName}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-display font-bold text-uefa-dark">{p.kda.toFixed(2)}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase">KDA Ratio</div>
                    </div>
                </div>
            ))}
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
