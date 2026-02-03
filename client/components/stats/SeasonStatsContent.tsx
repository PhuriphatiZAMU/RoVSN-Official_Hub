'use client';

import TeamLogo from '@/components/common/TeamLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { SeasonStats, Hero } from '@/types';

interface SeasonStatsContentProps {
    seasonStats: SeasonStats | null;
    heroes: Hero[];
    teamLogos: Record<string, string>;
}

// Helper: Format duration (seconds) to MM:SS
function formatDuration(seconds: number | undefined | null): string {
    if (!seconds || seconds <= 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function SeasonStatsContent({ seasonStats, heroes, teamLogos }: SeasonStatsContentProps) {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    const getHeroImage = (heroName: string): string | null => {
        const hero = heroes.find(h => h.name === heroName);
        return hero?.imageUrl || null;
    };

    if (!seasonStats) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <i className="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">{t.common.noData}</p>
            </div>
        );
    }

    // Stat Cards Data
    const statCards = [
        {
            icon: 'fa-trophy',
            label: t.stats.totalMatches,
            value: seasonStats.totalMatches || 0,
            color: 'from-cyan-500 to-blue-600',
            bgColor: 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10',
        },
        {
            icon: 'fa-gamepad',
            label: t.stats.totalGames,
            value: seasonStats.totalGames || 0,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-gradient-to-br from-purple-500/10 to-pink-600/10',
        },
        {
            icon: 'fa-clock',
            label: t.stats.avgGameTime,
            value: formatDuration(seasonStats.avgGameDuration),
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10',
        },
        {
            icon: 'fa-skull-crossbones',
            label: t.stats.bloodiestGame,
            value: seasonStats.highestKillGame?.kills || 0,
            subtext: seasonStats.highestKillGame?.match !== '-' ? `${seasonStats.highestKillGame?.match}` : null,
            color: 'from-red-500 to-orange-600',
            bgColor: 'bg-gradient-to-br from-red-500/10 to-orange-600/10',
        },
    ];

    // Highlight Cards (Players, Team, Hero)
    const highlightCards = [
        seasonStats.topMVPPlayer && {
            icon: 'fa-crown',
            title: t.stats.topMVP,
            name: seasonStats.topMVPPlayer.name,
            team: seasonStats.topMVPPlayer.team,
            value: `${seasonStats.topMVPPlayer.count} MVP`,
            color: 'from-yellow-400 to-amber-500',
        },
        seasonStats.topKillerPlayer && {
            icon: 'fa-crosshairs',
            title: t.stats.topKiller,
            name: seasonStats.topKillerPlayer.name,
            team: seasonStats.topKillerPlayer.team,
            value: `${seasonStats.topKillerPlayer.kills} Kills`,
            color: 'from-red-500 to-rose-600',
        },
        seasonStats.bestTeam && {
            icon: 'fa-users',
            title: t.stats.bestTeamWR,
            name: seasonStats.bestTeam.name,
            value: `${seasonStats.bestTeam.winRate}%`,
            subtext: `${seasonStats.bestTeam.wins}W / ${seasonStats.bestTeam.games}G`,
            color: 'from-cyan-400 to-blue-500',
            isTeam: true,
        },
        seasonStats.mostPickedHero && {
            icon: 'fa-mask',
            title: t.stats.mostPickedHero,
            name: seasonStats.mostPickedHero.name,
            value: `${seasonStats.mostPickedHero.picks} ${isThai ? 'ครั้ง' : 'picks'}`,
            subtext: `WR: ${seasonStats.mostPickedHero.winRate}%`,
            color: 'from-purple-500 to-violet-600',
            heroImage: getHeroImage(seasonStats.mostPickedHero.name),
        },
        seasonStats.bestWinRateHero && {
            icon: 'fa-star',
            title: t.stats.bestHeroWR,
            name: seasonStats.bestWinRateHero.name,
            value: `${seasonStats.bestWinRateHero.winRate}%`,
            subtext: `${seasonStats.bestWinRateHero.picks} ${isThai ? 'ครั้ง' : 'picks'}`,
            color: 'from-emerald-500 to-green-600',
            heroImage: getHeroImage(seasonStats.bestWinRateHero.name),
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
                                <TeamLogo teamName={card.name} logoUrl={teamLogos[card.name]} size="lg" />
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
                                        <TeamLogo teamName={card.team} logoUrl={teamLogos[card.team]} size="sm" />
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
            {seasonStats.longestGame && seasonStats.longestGame.duration > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                            <i className="fas fa-hourglass-half"></i>
                        </div>
                        <div>
                            <p className="text-sm text-amber-700 font-medium">{t.stats.longestGame}</p>
                            <p className="font-bold text-amber-900">
                                {formatDuration(seasonStats.longestGame.duration)} - {seasonStats.longestGame.match}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
