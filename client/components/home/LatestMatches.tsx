'use client';

import TeamLogo from '@/components/common/TeamLogo';
import type { MatchResult } from '@/types';
import type { ScheduleMatch, MatchWithResult } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface LatestMatchesProps {
    latestMatches: MatchWithResult[];
    upcomingMatches: ScheduleMatch[];
    teamLogos: Record<string, string>;
}

export default function LatestMatches({ latestMatches, upcomingMatches, teamLogos }: LatestMatchesProps) {
    const { language } = useLanguage();
    const isThai = language === 'th';

    // Helper: Format date for display
    const formatMatchDate = (dateString?: string) => {
        if (!dateString) return null;
        if (typeof dateString === 'string' && !dateString.includes('-') && !dateString.includes('T')) {
            return dateString;
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString(isThai ? 'th-TH' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // If no results yet, show first scheduled matches
    if (latestMatches.length === 0 && upcomingMatches.length > 0) {
        return (
            <div className="space-y-3">
                {upcomingMatches.map((m, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition group">
                        <div className="flex-1 flex items-center justify-end font-bold text-sm md:text-base text-gray-700">
                            <span className="mr-3 hidden md:inline">{m.blue}</span>
                            <span className="mr-3 md:hidden truncate max-w-[50px]">{m.blue}</span>
                            <TeamLogo teamName={m.blue} logoUrl={teamLogos[m.blue]} size="sm" />
                        </div>
                        <div className="px-3 flex items-center justify-center bg-gray-50 rounded-lg mx-2 h-8 min-w-[60px] group-hover:bg-cyan-aura/10 transition-colors">
                            <span className="text-xs text-gray-400 font-bold group-hover:text-cyan-aura">VS</span>
                        </div>
                        <div className="flex-1 flex items-center justify-start font-bold text-sm md:text-base text-gray-700">
                            <TeamLogo teamName={m.red} logoUrl={teamLogos[m.red]} size="sm" />
                            <span className="ml-3 hidden md:inline">{m.red}</span>
                            <span className="ml-3 md:hidden truncate max-w-[50px]">{m.red}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Show no data state if nothing available
    if (latestMatches.length === 0 && upcomingMatches.length === 0) {
        return (
            <div className="bg-white border border-gray-100 p-8 rounded-xl text-center">
                <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">{isThai ? 'ยังไม่มีข้อมูลการแข่งขัน' : 'No match data yet'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {latestMatches.map(({ match: m, result, date }, i) => (
                <div
                    key={i}
                    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 ${result ? 'border-l-4 border-l-cyan-aura' : ''}`}
                >
                    {/* Match Row */}
                    <div className="p-3 flex items-center justify-between gap-2">
                        {/* Blue Team */}
                        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                            <span className="font-bold text-gray-800 text-sm md:text-base truncate text-right">
                                {m.blue}
                            </span>
                            <div className="flex-shrink-0">
                                <TeamLogo teamName={m.blue} logoUrl={teamLogos[m.blue]} size="sm" />
                            </div>
                        </div>

                        {/* Score / VS - Center */}
                        <div className="flex-shrink-0 bg-gray-50 py-1 px-3 rounded-lg border border-gray-100 min-w-[70px] text-center">
                            {(() => {
                                // Detect BYE: either isByeWin flag OR score 0-0 with a winner
                                const isBye = result.isByeWin || (result.scoreBlue === 0 && result.scoreRed === 0 && result.winner);
                                return isBye ? (
                                    <div className="flex flex-col items-center">
                                        <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-[4px] text-[10px] font-bold">BYE</span>
                                        <span className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[80px]">{result.winner}</span>
                                    </div>
                                ) : (
                                    <span className="font-display font-bold text-base md:text-xl text-uefa-dark">
                                        {result.scoreBlue} - {result.scoreRed}
                                    </span>
                                );
                            })()}
                        </div>

                        {/* Red Team */}
                        <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                            <div className="flex-shrink-0">
                                <TeamLogo teamName={m.red} logoUrl={teamLogos[m.red]} size="sm" />
                            </div>
                            <span className="font-bold text-gray-800 text-sm md:text-base truncate text-left">
                                {m.red}
                            </span>
                        </div>
                    </div>

                    {/* Match Info Footer (Date + MVP) - Compact Version */}
                    {(date || (result && result.mvp)) && (
                        <div className="bg-gradient-to-r from-gray-50 to-white px-3 py-1 text-[10px] md:text-xs flex items-center justify-between border-t border-gray-100">
                            {/* Match Date */}
                            {date && (
                                <span className="text-gray-500 flex items-center gap-1" suppressHydrationWarning>
                                    <i className="far fa-calendar text-cyan-aura/70"></i>
                                    {formatMatchDate(date)}
                                </span>
                            )}

                            {/* MVP */}
                            {result && result.mvp && (
                                <span className="text-gray-600 flex items-center gap-1.5 ml-auto">
                                    <i className="fas fa-crown text-yellow-500 text-[10px]"></i>
                                    MVP: <span className="font-bold text-uefa-dark">{result.mvp}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
