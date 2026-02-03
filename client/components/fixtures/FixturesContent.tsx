'use client';

import TeamLogo from '@/components/common/TeamLogo';
import ShareButton from '@/components/common/ShareButton';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { ScheduleRound } from '@/lib/api';
import type { MatchResult } from '@/types';

interface FixturesContentProps {
    schedule: ScheduleRound[];
    results: MatchResult[];
    teamLogos: Record<string, string>;
}

export default function FixturesContent({ schedule, results, teamLogos }: FixturesContentProps) {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    // Helper: Format date for display
    const formatMatchDate = (dateString: string | null | undefined): string | null => {
        if (!dateString) return null;

        // If already formatted string like "25 ม.ค. 2026", return as-is
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

    // Get round label
    const getRoundLabel = (day: number): string => {
        if (day === 90) return t.fixtures.semiFinal;
        if (day === 91) return t.fixtures.grandFinal;
        return isThai ? `วันที่ ${day}` : `Day ${day}`;
    };

    if (schedule.length === 0) {
        return (
            <>
                <div className="bg-uefa-dark py-6 md:py-12 mb-4 md:mb-8 shadow-lg border-b-4 border-cyan-aura">
                    <div className="container mx-auto px-4">
                        <h1 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-wider">
                            {t.nav.fixtures}
                        </h1>
                    </div>
                </div>
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <i className="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">{t.common.noData}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="bg-uefa-dark py-6 md:py-12 mb-4 md:mb-8 shadow-lg border-b-4 border-cyan-aura">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-wider truncate">
                            {t.nav.fixtures}
                        </h1>
                        <p className="text-cyan-aura/80 font-sans mt-1 text-xs md:text-base hidden sm:block">
                            {t.fixtures.subtitle}
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        <ShareButton title={`${t.nav.fixtures} - RoV SN Tournament`} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
                    {schedule.map((round) => (
                        <div key={round.day} className="animate-fade-in-up">
                            {/* Round Header */}
                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <span className="bg-cyan-aura text-uefa-dark font-display font-bold px-3 py-1 rounded text-xs md:text-sm uppercase tracking-wide shadow-lg shadow-cyan-aura/20 whitespace-nowrap">
                                    {getRoundLabel(round.day)}
                                </span>
                                {/* Show round date if available */}
                                {round.date && (
                                    <span className="text-gray-500 text-xs md:text-sm font-medium flex items-center gap-1.5">
                                        <i className="fas fa-calendar-alt text-cyan-aura"></i>
                                        {formatMatchDate(round.date)}
                                    </span>
                                )}
                                <div className="h-px bg-gray-200 flex-grow"></div>
                            </div>

                            {/* Matches List */}
                            <div className="space-y-3">
                                {round.matches.map((match, idx) => {
                                    // Find result if exists
                                    const matchKey = `${round.day}_${match.blue}_vs_${match.red}`.replace(/\s+/g, '');
                                    const result = results.find(r => r.matchId === matchKey);

                                    // Get match date (from match itself or from round)
                                    const matchDate = match.date || round.date;

                                    return (
                                        <div
                                            key={idx}
                                            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 ${result ? 'border-l-4 border-l-cyan-aura' : ''}`}
                                        >
                                            {/* Match Row - Always horizontal */}
                                            <div className="p-3 md:p-5 flex items-center justify-between gap-2 md:gap-4">

                                                {/* Blue Team */}
                                                <div className="flex-1 flex items-center justify-end gap-2 md:gap-3 min-w-0">
                                                    <span className="font-bold text-gray-800 text-xs md:text-base truncate text-right">
                                                        {match.blue}
                                                    </span>
                                                    <div className="flex-shrink-0">
                                                        <TeamLogo teamName={match.blue} logoUrl={teamLogos[match.blue]} size="sm" />
                                                    </div>
                                                </div>

                                                {/* Score / VS - Center */}
                                                <div className="flex-shrink-0 bg-gray-50 py-1.5 px-3 md:py-2 md:px-5 rounded-lg border border-gray-100 min-w-[60px] md:min-w-[90px] text-center">
                                                    {result ? (() => {
                                                        // Detect BYE: either isByeWin flag OR score 0-0 with a winner
                                                        const isBye = result.isByeWin || (result.scoreBlue === 0 && result.scoreRed === 0 && result.winner);
                                                        return isBye ? (
                                                            <div className="flex flex-col items-center">
                                                                <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold">BYE</span>
                                                                <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[80px]">{result.winner}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-display font-bold text-lg md:text-2xl text-uefa-dark">
                                                                {result.scoreBlue} - {result.scoreRed}
                                                            </span>
                                                        );
                                                    })() : (
                                                        <span className="text-gray-400 font-bold text-sm md:text-lg">VS</span>
                                                    )}
                                                </div>

                                                {/* Red Team */}
                                                <div className="flex-1 flex items-center justify-start gap-2 md:gap-3 min-w-0">
                                                    <div className="flex-shrink-0">
                                                        <TeamLogo teamName={match.red} logoUrl={teamLogos[match.red]} size="sm" />
                                                    </div>
                                                    <span className="font-bold text-gray-800 text-xs md:text-base truncate text-left">
                                                        {match.red}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Match Info Footer (Date + MVP) */}
                                            {(matchDate || (result && result.mvp)) && (
                                                <div className="bg-gradient-to-r from-gray-50 to-white px-3 py-1.5 text-xs flex items-center justify-between border-t border-gray-100">
                                                    {/* Match Date */}
                                                    {matchDate && (
                                                        <span className="text-gray-500 flex items-center gap-1">
                                                            <i className="far fa-calendar text-cyan-aura/70"></i>
                                                            {formatMatchDate(matchDate)}
                                                        </span>
                                                    )}

                                                    {/* MVP */}
                                                    {result && result.mvp && (
                                                        <span className="text-gray-600 flex items-center gap-1.5 ml-auto">
                                                            <i className="fas fa-crown text-yellow-500"></i>
                                                            MVP: <span className="font-bold text-uefa-dark">{result.mvp}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
