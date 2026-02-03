'use client';

import TeamLogo from '@/components/common/TeamLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { PlayerStat, Hero, PlayerHeroStat } from '@/types';

interface PlayerStatsContentProps {
    playerStats: PlayerStat[];
    playerHeroStats: PlayerHeroStat[];
    heroes: Hero[];
    teamLogos: Record<string, string>;
}

export default function PlayerStatsContent({ playerStats, playerHeroStats, heroes, teamLogos }: PlayerStatsContentProps) {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    const getHeroImage = (heroName: string): string | null => {
        const hero = heroes.find(h => h.name === heroName);
        return hero?.imageUrl || null;
    };

    const getPlayerTopHeroes = (playerRealName: string) => {
        const playerHeroStat = playerHeroStats.find(h =>
            h.realName === playerRealName || h.playerName === playerRealName
        );
        return playerHeroStat?.topHeroes || [];
    };

    if (playerStats.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <i className="fas fa-user-ninja text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">{t.common.noData}</p>
            </div>
        );
    }

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
                            {playerStats.slice(0, 50).map((p, idx) => {
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
                                                <TeamLogo teamName={p.teamName} logoUrl={teamLogos[p.teamName]} size="sm" />
                                                <span className="text-sm text-gray-600 truncate max-w-[100px]">{p.teamName}</span>
                                            </div>
                                        </td>
                                        {/* Top Heroes */}
                                        <td className="p-2 max-w-[120px]">
                                            <div className="flex gap-1 justify-center">
                                                {topHeroes.length > 0 ? (
                                                    topHeroes.slice(0, 3).map((hero, i) => (
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
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {playerStats.slice(0, 30).map((p, idx) => {
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
                                        <TeamLogo teamName={p.teamName} logoUrl={teamLogos[p.teamName]} size="sm" />
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
                                    {topHeroes.slice(0, 3).map((hero, i) => (
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
                })}
            </div>
        </div>
    );
}
