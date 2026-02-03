'use client';

import TeamLogo from '@/components/common/TeamLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { TeamStat } from '@/types';

interface TeamStatsContentProps {
    teamStats: TeamStat[];
    teamLogos: Record<string, string>;
}

export default function TeamStatsContent({ teamStats, teamLogos }: TeamStatsContentProps) {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    if (teamStats.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">{t.common.noData}</p>
            </div>
        );
    }

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
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200" title="Games">{isThai ? 'เกม' : 'G'}</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200" title="Win-Loss">{isThai ? 'ชนะ-แพ้' : 'W-L'}</th>
                                <th className="p-3 text-center text-uefa-dark border-b border-gray-200">{t.stats.winRate}</th>
                                <th className="p-3 text-center text-blue-600 border-b border-gray-200" title="Kills">K</th>
                                <th className="p-3 text-center text-red-500 border-b border-gray-200" title="Deaths">D</th>
                                <th className="p-3 text-center text-green-600 border-b border-gray-200" title="Assists">A</th>
                                <th className="p-3 text-center text-yellow-600 border-b border-gray-200" title="MVP Count">MVP</th>
                                <th className="p-3 text-center text-cyan-aura border-b border-gray-200 font-bold" title="KDA Ratio">KDA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamStats.map((team, idx) => {
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
                                                <TeamLogo teamName={team.teamName} logoUrl={teamLogos[team.teamName]} size="md" />
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
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {teamStats.map((team, idx) => {
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
                                <TeamLogo teamName={team.teamName} logoUrl={teamLogos[team.teamName]} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-uefa-dark truncate">{team.teamName}</p>
                                    <p className="text-sm text-gray-500">{team.realGamesPlayed || 0} {t.stats.games}</p>
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
                                    <div className="text-xs text-gray-500">{t.stats.wins}</div>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded-lg">
                                    <div className="text-red-500 font-bold">{team.realLosses || 0}</div>
                                    <div className="text-xs text-gray-500">{t.stats.loss}</div>
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
                })}
            </div>
        </div>
    );
}
