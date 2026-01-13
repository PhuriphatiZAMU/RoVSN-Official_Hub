import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { MatchSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/States';

// Hero Carousel Images... (unchanged)
const heroImages = [
    '/images/key-visual/RoV-SN-TOURNAMENT-2023.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2024.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2025.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2026.png',
];

function HeroCarousel() {
    // ... (unchanged logic)
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full aspect-[21/9] bg-black overflow-hidden">
            <div
                className="carousel-wrapper h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {heroImages.map((img, i) => (
                    <div key={i} className="carousel-slide relative">
                        <img
                            src={img}
                            alt={`Hero ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop`;
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <button
                onClick={() => setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length)}
                className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-cyan-aura text-white rounded-full flex items-center justify-center transition-colors z-10"
            >
                <i className="fas fa-chevron-left"></i>
            </button>
            <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % heroImages.length)}
                className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-cyan-aura text-white rounded-full flex items-center justify-center transition-colors z-10"
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
}

function LatestMatches() {
    // ... (unchanged logic)
    const { schedule, results, loading, error } = useData();

    if (loading) return <MatchSkeleton count={4} />;
    if (error) return <ErrorState title="ไม่สามารถโหลดข้อมูลได้" message={error} onRetry={() => window.location.reload()} />;

    const dayData = schedule.find(r => r.day === 1);
    if (!dayData) return null;

    return (
        <div className="space-y-3">
            {dayData.matches.slice(0, 4).map((m, i) => {
                const matchKey = `${dayData.day}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
                const result = results.find(r => r.matchId === matchKey);

                return (
                    <div
                        key={i}
                        className={`bg-white border border-gray-100 p-3 flex items-center justify-between shadow-sm hover:shadow-md transition ${result ? 'border-l-4 border-l-cyan-aura' : ''}`}
                    >
                        <div className="flex-1 flex items-center justify-end font-bold text-sm text-gray-700">
                            <span className="mr-2">{m.blue}</span>
                            <TeamLogo teamName={m.blue} size="sm" />
                        </div>
                        <div className="px-3 flex items-center justify-center bg-gray-50 rounded mx-2 h-8 min-w-[60px]">
                            {result ? (
                                <span className="font-bold text-uefa-dark">{result.scoreBlue} - {result.scoreRed}</span>
                            ) : (
                                <span className="text-xs text-gray-400 font-bold">VS</span>
                            )}
                        </div>
                        <div className="flex-1 flex items-center justify-start font-bold text-sm text-gray-700">
                            <TeamLogo teamName={m.red} size="sm" />
                            <span className="ml-2">{m.red}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function LeagueTable() {
    const { standings, loading, error } = useData();
    const { t } = useLanguage();

    if (loading) {
        return (
            <table className="w-full text-left uefa-table text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">{t.standings.team}</th>
                        <th className="p-3 text-center">{t.standings.played}</th>
                        <th className="p-3 text-center">{t.standings.gd}</th>
                        <th className="p-3 text-center font-bold">{t.standings.pts}</th>
                    </tr>
                </thead>
                <TableSkeleton rows={5} cols={5} />
            </table>
        );
    }

    if (error) return <ErrorState title="ไม่สามารถโหลดตารางได้" message={error} />;

    return (
        <table className="w-full text-left uefa-table text-sm">
            <thead className="bg-gray-50">
                <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">{t.standings.team}</th>
                    <th className="p-3 text-center">{t.standings.played}</th>
                    <th className="p-3 text-center">{t.standings.gd}</th>
                    <th className="p-3 text-center font-bold">{t.standings.pts}</th>
                </tr>
            </thead>
            <tbody>
                {standings.slice(0, 5).map((d, i) => (
                    <tr key={d.name} className="border-b border-gray-50 hover:bg-echo-white transition">
                        <td className="p-3 text-center">
                            <div className={`w-6 h-6 ${i < 4 ? 'bg-cyan-aura text-uefa-dark' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center font-bold text-xs mx-auto`}>
                                {i + 1}
                            </div>
                        </td>
                        <td className="p-3 font-bold text-uefa-dark text-sm flex items-center gap-2">
                            <TeamLogo teamName={d.name} size="sm" />
                            {d.name}
                        </td>
                        <td className="p-3 text-center text-sm">{d.p}</td>
                        <td className="p-3 text-center text-sm font-mono">{d.gd > 0 ? `+${d.gd}` : d.gd}</td>
                        <td className="p-3 text-center font-bold text-black">{d.pts}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default function HomePage() {
    const { t } = useLanguage();

    return (
        <div>
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Latest Matches */}
                    <div>
                        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
                            <h2 className="text-xl md:text-3xl font-display font-bold uppercase text-uefa-dark border-l-4 border-cyan-aura pl-3">
                                {t.home.latestResults}
                            </h2>
                            <Link to="/fixtures" className="text-cyan-aura font-bold hover:underline text-sm">
                                {t.home.viewAll} <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </div>
                        <LatestMatches />
                    </div>

                    {/* League Table */}
                    <div>
                        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
                            <h2 className="text-xl md:text-3xl font-display font-bold uppercase text-uefa-dark border-l-4 border-cyan-aura pl-3">
                                {t.home.leagueTable}
                            </h2>
                            <Link to="/standings" className="text-cyan-aura font-bold hover:underline text-sm">
                                {t.home.fullTable} <i className="fas fa-arrow-right ml-1"></i>
                            </Link>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                            <LeagueTable />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
