import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { MatchSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';

// ... (MatchCard remains mostly UI-focused, but date formatting might need locale 'th-TH'/'en-US' - small optimization for later)
function MatchCard({ match, result, date }) {
    const { language } = useLanguage();
    const hasResult = !!result;

    const blueClass = hasResult && result.scoreBlue > result.scoreRed ? 'text-cyan-aura font-bold' : 'text-gray-500';
    const redClass = hasResult && result.scoreRed > result.scoreBlue ? 'text-cyan-aura font-bold' : 'text-gray-500';

    // Format Date based on current language
    const locale = language === 'th' ? 'th-TH' : 'en-US';
    const formattedDate = date ? new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '20:00';

    return (
        <div className={`bg-white border border-gray-200 p-4 flex items-center justify-between hover:border-cyan-aura transition shadow-sm ${hasResult ? 'border-l-4 border-l-cyan-aura' : ''}`}>
            {/* Team Blue */}
            <div className={`flex-1 flex items-center justify-end md:text-lg ${hasResult ? blueClass : 'text-uefa-dark'}`}>
                <span className="mr-3 font-display">{match.blue}</span>
                <TeamLogo teamName={match.blue} size="lg" />
            </div>

            {/* Score / VS */}
            <div className="px-6 flex flex-col items-center min-w-[100px]">
                {hasResult ? (
                    <>
                        <div className="bg-uefa-dark text-white px-4 py-1 rounded text-xl font-bold flex items-center gap-2">
                            <span>{result.scoreBlue}</span>
                            <span className="text-gray-400 text-sm">-</span>
                            <span>{result.scoreRed}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">FT</div>
                    </>
                ) : (
                    <>
                        <div className="text-xs text-gray-400 font-bold mb-1">{formattedDate}</div>
                        <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm font-bold">VS</div>
                    </>
                )}
            </div>

            {/* Team Red */}
            <div className={`flex-1 flex items-center justify-start md:text-lg ${hasResult ? redClass : 'text-uefa-dark'}`}>
                <TeamLogo teamName={match.red} size="lg" />
                <span className="ml-3 font-display">{match.red}</span>
            </div>
        </div>
    );
}

const STAGE_MAPPING = {
    90: 'Semi-Finals',
    99: 'Grand Final'
};

export default function FixturesPage() {
    const { schedule, results, loading, error } = useData();
    const { t } = useLanguage();
    const [activeDay, setActiveDay] = useState(1);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <ErrorState
                    title={t.common.error}
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    const dayData = schedule.find(r => r.day === activeDay);

    return (
        <div className="flex-grow bg-gray-50">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                        {t.fixtures.title}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Match Day Filters */}
                <div className="flex overflow-x-auto space-x-2 mb-8 pb-4 border-b border-gray-200">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton h-10 w-28 rounded"></div>
                        ))
                    ) : (
                        schedule.map(round => (
                            <button
                                key={round.day}
                                onClick={() => setActiveDay(round.day)}
                                className={`whitespace-nowrap px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${round.day === activeDay
                                    ? 'bg-cyan-aura text-uefa-dark'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                {STAGE_MAPPING[round.day] || `${t.fixtures.day} ${round.day}`}
                            </button>
                        ))
                    )}
                </div>

                {/* Matches List */}
                <div className="space-y-4 max-w-4xl mx-auto">
                    {loading ? (
                        <MatchSkeleton count={6} />
                    ) : dayData ? (
                        dayData.matches.map((m, i) => {
                            const matchKey = `${activeDay}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
                            const result = results.find(r => r.matchId === matchKey);
                            return <MatchCard key={i} match={m} result={result} date={dayData.date} />;
                        })
                    ) : (
                        <EmptyState
                            title="ไม่มีแมตช์ในวันนี้"
                            message="ยังไม่มีการแข่งขันสำหรับวันที่เลือก"
                            icon="fas fa-calendar-times"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
