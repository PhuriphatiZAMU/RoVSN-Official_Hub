import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { MatchSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/States';

// Hero Carousel Images
const heroImages = [
    '/images/key-visual/RoV-SN-TOURNAMENT-2023.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2024.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2025.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2026.png',
];

function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full aspect-[21/9] bg-uefa-dark overflow-hidden shadow-2xl">
            <div
                className="carousel-wrapper h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {heroImages.map((img, i) => (
                    <div key={i} className="carousel-slide relative min-w-full h-full">
                        <img
                            src={img}
                            alt={`Hero ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop`;
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-uefa-dark/80 via-transparent to-transparent" />
                    </div>
                ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroImages.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-cyan-aura w-6 md:w-8' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length)}
                className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-cyan-aura text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-sm border border-white/10"
            >
                <i className="fas fa-chevron-left text-lg md:text-xl"></i>
            </button>
            <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % heroImages.length)}
                className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-cyan-aura text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-sm border border-white/10"
            >
                <i className="fas fa-chevron-right text-lg md:text-xl"></i>
            </button>
        </div>
    );
}

function LatestMatches() {
    const { schedule, results, loading, error } = useData();
    const { language } = useLanguage(); // Add language context
    const isThai = language === 'th'; // Determine language

    // Helper: Format date for display (Copied from FixturesPage for consistency)
    const formatMatchDate = (dateString) => {
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

    if (loading) return <MatchSkeleton count={4} />;
    if (error) return <ErrorState title="ไม่สามารถโหลดข้อมูลได้" message={error} onRetry={() => window.location.reload()} />;

    // Get all matches with results, sorted by matchDay descending (most recent first)
    const matchesWithResults = [];
    schedule.forEach(round => {
        (round.matches || []).forEach((m, index) => {
            const matchKey = `${round.day}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
            const result = results.find(r => r.matchId === matchKey);
            if (result) {
                // Find round date
                matchesWithResults.push({ match: m, result, day: round.day, index, date: m.date || round.date });
            }
        });
    });

    // Sort by day descending AND match index descending (to show latest match first)
    const latestMatches = matchesWithResults
        .sort((a, b) => {
            if (b.day !== a.day) return b.day - a.day;
            return b.index - a.index;
        })
        .slice(0, 4);

    // If no results yet, show first scheduled matches
    if (latestMatches.length === 0) {
        const dayData = schedule.find(r => r.day === 1);
        if (!dayData) return null;

        return (
            <div className="space-y-3">
                {dayData.matches.slice(0, 4).map((m, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition group">
                        <div className="flex-1 flex items-center justify-end font-bold text-sm md:text-base text-gray-700">
                            <span className="mr-3 hidden md:inline">{m.blue}</span>
                            <span className="mr-3 md:hidden truncate max-w-[50px]">{m.blue}</span>
                            <TeamLogo teamName={m.blue} size="sm" />
                        </div>
                        <div className="px-3 flex items-center justify-center bg-gray-50 rounded-lg mx-2 h-8 min-w-[60px] group-hover:bg-cyan-aura/10 transition-colors">
                            <span className="text-xs text-gray-400 font-bold group-hover:text-cyan-aura">VS</span>
                        </div>
                        <div className="flex-1 flex items-center justify-start font-bold text-sm md:text-base text-gray-700">
                            <TeamLogo teamName={m.red} size="sm" />
                            <span className="ml-3 hidden md:inline">{m.red}</span>
                            <span className="ml-3 md:hidden truncate max-w-[50px]">{m.red}</span>
                        </div>
                    </div>
                ))}
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
                    <div className="p-3 md:p-4 flex items-center justify-between gap-2 md:gap-4">
                        {/* Blue Team */}
                        <div className="flex-1 flex items-center justify-end gap-2 md:gap-3 min-w-0">
                            <span className="font-bold text-gray-800 text-xs md:text-base truncate text-right">
                                {m.blue}
                            </span>
                            <div className="flex-shrink-0">
                                <TeamLogo teamName={m.blue} size="sm" />
                            </div>
                        </div>

                        {/* Score / VS - Center */}
                        <div className="flex-shrink-0 bg-gray-50 py-1.5 px-3 md:py-2 md:px-5 rounded-lg border border-gray-100 min-w-[60px] md:min-w-[90px] text-center">
                            {result.isByeWin ? (
                                <div className="flex flex-col items-center">
                                    <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold">BYE</span>
                                    <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[80px]">{result.winner}</span>
                                </div>
                            ) : (
                                <span className="font-display font-bold text-lg md:text-2xl text-uefa-dark">
                                    {result.scoreBlue} - {result.scoreRed}
                                </span>
                            )}
                        </div>

                        {/* Red Team */}
                        <div className="flex-1 flex items-center justify-start gap-2 md:gap-3 min-w-0">
                            <div className="flex-shrink-0">
                                <TeamLogo teamName={m.red} size="sm" />
                            </div>
                            <span className="font-bold text-gray-800 text-xs md:text-base truncate text-left">
                                {m.red}
                            </span>
                        </div>
                    </div>

                    {/* Match Info Footer (Date + MVP) - Consistent with FixturesPage */}
                    {(date || (result && result.mvp)) && (
                        <div className="bg-gradient-to-r from-gray-50 to-white px-3 py-1.5 text-xs flex items-center justify-between border-t border-gray-100">
                            {/* Match Date */}
                            {date && (
                                <span className="text-gray-500 flex items-center gap-1">
                                    <i className="far fa-calendar text-cyan-aura/70"></i>
                                    {formatMatchDate(date)}
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
            ))}
        </div>
    );
}

function LeagueTable() {
    const { standings, loading, error } = useData();
    const { t } = useLanguage();

    if (error) return <ErrorState title="ไม่สามารถโหลดตารางได้" message={error} />;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left uefa-table text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-4 w-10 text-center text-gray-500 uppercase text-xs font-bold tracking-wider">#</th>
                        <th className="p-4 text-gray-500 uppercase text-xs font-bold tracking-wider">{t.standings.team}</th>
                        <th className="p-4 text-center text-gray-500 uppercase text-xs font-bold tracking-wider">{t.standings.played}</th>
                        <th className="p-4 text-center text-gray-500 uppercase text-xs font-bold tracking-wider">{t.standings.gd}</th>
                        <th className="p-4 text-center font-bold text-uefa-dark uppercase text-xs tracking-wider">{t.standings.pts}</th>
                    </tr>
                </thead>
                {loading ? (
                    <TableSkeleton rows={5} cols={5} />
                ) : (
                    <tbody>
                        {standings.slice(0, 5).map((d, i) => (
                            <tr key={d.name} className="border-b border-gray-100 hover:bg-echo-white transition group">
                                <td className="p-4 text-center">
                                    <div className={`w-6 h-6 ${i < 4 ? 'bg-cyan-aura text-uefa-dark shadow-cyan-aura/20 shadow-lg' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center font-bold text-xs mx-auto transition-transform group-hover:scale-110`}>
                                        {i + 1}
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-uefa-dark text-sm md:text-base flex items-center gap-3">
                                    <TeamLogo teamName={d.name} size="sm" />
                                    <span className="truncate max-w-[120px] md:max-w-none">{d.name}</span>
                                </td>
                                <td className="p-4 text-center text-sm text-gray-600 font-medium">{d.p}</td>
                                <td className="p-4 text-center text-sm font-mono text-gray-600">{d.gd > 0 ? `+${d.gd}` : d.gd}</td>
                                <td className="p-4 text-center font-bold text-uefa-dark text-lg">{d.pts}</td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
        </div>
    );
}

export default function HomePage() {
    const { t } = useLanguage();

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Latest Matches */}
                    <div>
                        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl md:text-3xl font-display font-bold uppercase text-uefa-dark border-l-4 border-cyan-aura pl-4">
                                {t.home.latestResults}
                            </h2>
                            <Link to="/fixtures" className="text-cyan-aura font-bold hover:text-cyan-600 hover:underline text-sm flex items-center gap-1 transition-colors">
                                {t.home.viewAll} <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                        <LatestMatches />
                    </div>

                    {/* League Table */}
                    <div>
                        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl md:text-3xl font-display font-bold uppercase text-uefa-dark border-l-4 border-cyan-aura pl-4">
                                {t.home.leagueTable}
                            </h2>
                            <Link to="/standings" className="text-cyan-aura font-bold hover:text-cyan-600 hover:underline text-sm flex items-center gap-1 transition-colors">
                                {t.home.fullTable} <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                        <div className="bg-white shadow-lg shadow-gray-100 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <LeagueTable />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
