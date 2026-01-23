import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface DashboardStats {
    teams: number;
    matches: number;
    results: number;
    matchDays: number;
    players: number;
    heroes: number;
    logos: number;
    gameStats: number;
}

interface QuickAction {
    label: string;
    icon: string;
    href: string;
    color: string;
    description: string;
}

export default function AdminDashboard() {
    const { schedule, results, teams, standings } = useData();
    const { t, language } = useLanguage();
    const [dbStats, setDbStats] = useState<DashboardStats>({
        teams: 0,
        matches: 0,
        results: 0,
        matchDays: 0,
        players: 0,
        heroes: 0,
        logos: 0,
        gameStats: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [playersRes, heroesRes, logosRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/players`),
                    axios.get(`${API_BASE}/api/heroes`),
                    axios.get(`${API_BASE}/api/team-logos`)
                ]);

                setDbStats({
                    teams: teams.length,
                    matches: schedule.reduce((acc, d) => acc + (d.matches?.length || 0), 0),
                    results: results.length,
                    matchDays: schedule.length,
                    players: playersRes.data?.length || 0,
                    heroes: heroesRes.data?.length || 0,
                    logos: logosRes.data?.length || 0,
                    gameStats: results.reduce((acc, r) => acc + (r.gameDetails?.length || 0), 0)
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [teams, schedule, results]);

    const statsCards = [
        { label: t.admin.dashboard.totalTeams, value: dbStats.teams, icon: 'fas fa-users', color: 'from-blue-500 to-blue-600', link: '/admin/teams' },
        { label: t.admin.dashboard.totalMatches, value: dbStats.matches, icon: 'fas fa-gamepad', color: 'from-green-500 to-green-600', link: '/admin/results' },
        { label: t.admin.dashboard.finishedMatches, value: dbStats.results, icon: 'fas fa-check-circle', color: 'from-purple-500 to-purple-600', link: '/admin/results' },
        { label: t.admin.dashboard.matchDays, value: dbStats.matchDays, icon: 'fas fa-calendar-alt', color: 'from-orange-500 to-orange-600', link: '/admin/schedule' },
        { label: t.admin.dashboard.poolPlayers, value: dbStats.players, icon: 'fas fa-user-friends', color: 'from-cyan-500 to-cyan-600', link: '/admin/players' },
        { label: t.admin.dashboard.totalHeroes, value: dbStats.heroes, icon: 'fas fa-mask', color: 'from-pink-500 to-pink-600', link: '/admin/heroes' },
        { label: t.admin.dashboard.teamLogos, value: dbStats.logos, icon: 'fas fa-image', color: 'from-indigo-500 to-indigo-600', link: '/admin/logos' },
        { label: t.admin.dashboard.gameStats, value: dbStats.gameStats, icon: 'fas fa-chart-bar', color: 'from-red-500 to-red-600', link: '/admin/game-stats' },
    ];

    const quickActions: QuickAction[] = [
        { label: t.admin.dashboard.draw, icon: 'fas fa-random', href: '/admin/draw', color: 'bg-blue-500', description: t.admin.dashboard.drawDesc },
        { label: t.admin.dashboard.recordResult, icon: 'fas fa-plus-circle', href: '/admin/results', color: 'bg-green-500', description: t.admin.dashboard.recordResultDesc },
        { label: t.admin.dashboard.managePlayers, icon: 'fas fa-user-edit', href: '/admin/players', color: 'bg-purple-500', description: t.admin.dashboard.managePlayersDesc },
        { label: t.admin.dashboard.manageHeroes, icon: 'fas fa-mask', href: '/admin/heroes', color: 'bg-pink-500', description: t.admin.dashboard.manageHeroesDesc },
        { label: t.admin.dashboard.manageLogos, icon: 'fas fa-image', href: '/admin/logos', color: 'bg-indigo-500', description: t.admin.dashboard.manageLogosDesc },
        { label: t.admin.dashboard.manageTeams, icon: 'fas fa-users-cog', href: '/admin/teams', color: 'bg-orange-500', description: t.admin.dashboard.manageTeamsDesc },
        { label: t.admin.dashboard.manageSchedule, icon: 'fas fa-calendar-check', href: '/admin/schedule', color: 'bg-cyan-500', description: t.admin.dashboard.manageScheduleDesc },
        { label: t.admin.dashboard.manageStats, icon: 'fas fa-chart-line', href: '/admin/game-stats', color: 'bg-red-500', description: t.admin.dashboard.manageStatsDesc },
    ];

    const recentResults = [...results]
        .sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        })
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-uefa-dark">
                        <i className="fas fa-tachometer-alt mr-3 text-cyan-aura"></i>
                        {t.admin.dashboard.title}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.admin.dashboard.subtitle}</p>
                </div>
                <div className="text-sm text-gray-400">
                    <i className="fas fa-clock mr-1"></i>
                    {t.admin.dashboard.lastUpdate}: {new Date().toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US')}
                </div>
            </div>

            {/* Tournament Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-cyan-aura">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-uefa-dark">{t.admin.dashboard.progress}</h2>
                    <span className="text-2xl font-bold text-cyan-aura">
                        {dbStats.matches > 0 ? Math.round((dbStats.results / dbStats.matches) * 100) : 0}%
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-cyan-aura to-blue-600 h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${dbStats.matches > 0 ? (dbStats.results / dbStats.matches) * 100 : 0}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>
                        <i className="fas fa-check-circle text-green-500 mr-1"></i>
                        {t.admin.dashboard.completed}: <strong>{dbStats.results}</strong>
                    </span>
                    <span>
                        <i className="fas fa-hourglass-half text-orange-500 mr-1"></i>
                        {t.admin.dashboard.remaining}: <strong>{dbStats.matches - dbStats.results}</strong>
                    </span>
                    <span>
                        <i className="fas fa-flag text-gray-400 mr-1"></i>
                        {t.admin.dashboard.total}: <strong>{dbStats.matches}</strong>
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statsCards.map((stat, i) => (
                    <Link
                        key={i}
                        to={stat.link}
                        className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <i className={`${stat.icon} text-xl`}></i>
                            </div>
                            <div>
                                <div className="text-2xl font-display font-bold text-uefa-dark">
                                    {loading ? <span className="animate-pulse">...</span> : stat.value}
                                </div>
                                <div className="text-gray-500 text-xs">{stat.label}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-display font-bold text-uefa-dark uppercase mb-4 flex items-center">
                    <i className="fas fa-bolt mr-2 text-cyan-aura"></i>
                    {t.admin.dashboard.quickActions}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, i) => (
                        <Link
                            key={i}
                            to={action.href}
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group border border-transparent hover:border-cyan-aura/30"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                <i className={`${action.icon} text-xl`}></i>
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-cyan-aura transition-colors">{action.label}</span>
                            <span className="text-xs text-gray-400 text-center">{action.description}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Results */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-display font-bold text-uefa-dark uppercase flex items-center">
                            <i className="fas fa-history mr-2 text-cyan-aura"></i>
                            {t.admin.dashboard.recentResults}
                        </h2>
                        <Link to="/admin/results" className="text-cyan-aura text-sm hover:underline">
                            {t.admin.dashboard.viewAll} →
                        </Link>
                    </div>
                    <div className="p-5">
                        {recentResults.length > 0 ? (
                            <div className="space-y-3">
                                {recentResults.map((r, i) => {
                                    const isBye = r.isByeWin || (r.scoreBlue === 0 && r.scoreRed === 0 && r.winner);
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">{r.teamBlue}</span>
                                                <span className="text-gray-400 text-xs">vs</span>
                                                <span className="font-bold text-sm">{r.teamRed}</span>
                                            </div>
                                            {isBye ? (
                                                <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    BYE → {r.winner}
                                                </div>
                                            ) : (
                                                <div className="bg-uefa-dark text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    {r.scoreBlue} - {r.scoreRed}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center py-8">
                                <i className="fas fa-inbox text-4xl mb-2"></i>
                                <p>{t.admin.dashboard.noResults}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Teams */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-display font-bold text-uefa-dark uppercase flex items-center">
                            <i className="fas fa-trophy mr-2 text-cyan-aura"></i>
                            {t.admin.dashboard.topTeams}
                        </h2>
                        <a href="/standings" target="_blank" className="text-cyan-aura text-sm hover:underline">
                            {t.admin.dashboard.viewAll} →
                        </a>
                    </div>
                    <div className="p-5">
                        {standings.length > 0 ? (
                            <div className="space-y-3">
                                {standings.slice(0, 5).map((t, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                                                i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                                    i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                                        'bg-gray-200 text-gray-600'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <span className="font-bold text-sm">{t.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-cyan-aura">{t.pts} <span className="text-xs text-gray-400">pts</span></div>
                                            <div className="text-xs text-gray-500">{t.w}W {t.l}L</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center py-8">
                                <i className="fas fa-medal text-4xl mb-2"></i>
                                <p>{t.admin.dashboard.noStandings}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Public Pages */}
            <div className="bg-gradient-to-r from-cyan-aura/10 to-blue-500/10 rounded-xl p-6 border border-cyan-aura/20">
                <h2 className="text-lg font-display font-bold text-uefa-dark uppercase mb-4 flex items-center">
                    <i className="fas fa-external-link-alt mr-2 text-cyan-aura"></i>
                    {t.admin.dashboard.publicPages}
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                        { label: t.admin.dashboard.home, href: '/', icon: 'fas fa-home' },
                        { label: t.admin.dashboard.fixtures, href: '/fixtures', icon: 'fas fa-calendar' },
                        { label: t.admin.dashboard.standings, href: '/standings', icon: 'fas fa-list-ol' },
                        { label: t.admin.dashboard.stats, href: '/stats', icon: 'fas fa-chart-pie' },
                        { label: t.admin.dashboard.clubs, href: '/clubs', icon: 'fas fa-users' },
                        { label: t.admin.dashboard.format, href: '/format', icon: 'fas fa-sitemap' },
                    ].map((page, i) => (
                        <a
                            key={i}
                            href={page.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-all text-center"
                        >
                            <i className={`${page.icon} text-xl text-cyan-aura`}></i>
                            <span className="text-xs font-medium text-gray-600">{page.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
