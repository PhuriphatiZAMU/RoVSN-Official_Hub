import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorState, EmptyState } from '../components/common/States';
import ShareButton from '../components/common/ShareButton';

export default function StandingsPage() {
    const { standings, loading, error } = useData();
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <div className="bg-uefa-dark py-12 mb-8 shadow-lg border-b-4 border-cyan-aura">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-wider">
                            {t.nav.standings}
                        </h1>
                    </div>
                </div>
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 w-16">#</th>
                                    <th className="p-4 text-left">{t.standings.team}</th>
                                    <th className="p-4 text-center">{t.standings.played}</th>
                                    <th className="p-4 text-center">{t.standings.won}</th>
                                    <th className="p-4 text-center">{t.standings.lost}</th>
                                    <th className="p-4 text-center">{t.standings.gd}</th>
                                    <th className="p-4 text-center">{t.standings.pts}</th>
                                </tr>
                            </thead>
                            <TableSkeleton rows={10} cols={7} />
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <ErrorState title={t.common.error} message={error} />;
    if (standings.length === 0) return <EmptyState title={t.common.noData} message="" />;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Page Header */}
            <div className="bg-uefa-dark py-6 md:py-12 mb-4 md:mb-8 shadow-lg border-b-4 border-cyan-aura">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-wider truncate">
                            {t.nav.standings}
                        </h1>
                        <p className="text-cyan-aura/80 font-sans mt-1 text-xs md:text-base hidden sm:block">League Phase Rankings</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {/* Qualification Zone Indicator - Desktop only */}
                        <div className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                            <div className="w-2.5 h-2.5 bg-cyan-aura rounded-full shadow-lg shadow-cyan-aura/50"></div>
                            <span className="text-white text-xs font-bold">{isThai ? 'ผ่านเข้ารอบ Playoffs' : 'Qualifies for Playoffs'}</span>
                        </div>
                        <ShareButton title={`${t.nav.standings} - RoV SN Tournament`} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Mobile Zone Indicator */}
                <div className="md:hidden flex items-center gap-2 mb-4 bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="w-3 h-3 bg-cyan-aura rounded-full shadow-lg shadow-cyan-aura/50"></div>
                    <span className="text-gray-700 text-sm font-bold">{isThai ? 'ผ่านเข้ารอบ Playoffs' : 'Qualifies for Playoffs'}</span>
                </div>

                {/* Standings Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full uefa-table min-w-[700px]">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="p-4 w-16 text-center text-gray-500 uppercase text-xs font-bold tracking-wider">#</th>
                                    <th className="p-4 text-left text-gray-500 uppercase text-xs font-bold tracking-wider">{t.standings.team}</th>
                                    <th className="p-4 text-center text-gray-500 uppercase text-xs font-bold tracking-wider">{t.standings.played}</th>
                                    <th className="p-4 text-center text-green-600 uppercase text-xs font-bold tracking-wider">{t.standings.won}</th>
                                    <th className="p-4 text-center text-red-500 uppercase text-xs font-bold tracking-wider">{t.standings.lost}</th>
                                    <th className="p-4 text-center text-gray-500 uppercase text-xs font-bold tracking-wider">{t.standings.gd}</th>
                                    <th className="p-4 text-center text-uefa-dark uppercase text-xs font-bold tracking-wider">{t.standings.pts}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {standings.map((team, idx) => {
                                    const isQualified = idx < 4;
                                    return (
                                        <tr
                                            key={team.name}
                                            className={`transition-all duration-200 hover:bg-echo-white group ${isQualified ? 'bg-cyan-aura/5' : ''}`}
                                        >
                                            {/* Position */}
                                            <td className="p-4 text-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto transition-transform group-hover:scale-110 ${isQualified
                                                    ? 'bg-cyan-aura text-uefa-dark shadow-lg shadow-cyan-aura/30'
                                                    : 'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                            </td>

                                            {/* Team Name */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <TeamLogo teamName={team.name} size="md" />
                                                    <span className="font-bold text-uefa-dark text-sm md:text-base truncate max-w-[150px] md:max-w-none">{team.name}</span>
                                                </div>
                                            </td>

                                            {/* Played */}
                                            <td className="p-4 text-center text-gray-600 font-medium">{team.p}</td>

                                            {/* Won */}
                                            <td className="p-4 text-center font-bold text-green-600">{team.w}</td>

                                            {/* Lost */}
                                            <td className="p-4 text-center font-bold text-red-500">{team.l}</td>

                                            {/* GD */}
                                            <td className="p-4 text-center font-mono">
                                                <span className={`px-2 py-1 rounded ${team.gd > 0 ? 'text-green-600 bg-green-50' :
                                                    team.gd < 0 ? 'text-red-500 bg-red-50' :
                                                        'text-gray-500 bg-gray-100'
                                                    }`}>
                                                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                                                </span>
                                            </td>

                                            {/* Points */}
                                            <td className="p-4 text-center">
                                                <span className="text-xl font-display font-bold text-uefa-dark bg-gray-50 px-3 py-1 rounded-lg inline-block min-w-[50px]">
                                                    {team.pts}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">{t.standings.played}:</span> {isThai ? 'จำนวนเกมที่แข่ง' : 'Games Played'}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">{t.standings.won}:</span> {isThai ? 'ชนะ' : 'Wins'}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-red-500">{t.standings.lost}:</span> {isThai ? 'แพ้' : 'Losses'}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">{t.standings.gd}:</span> {isThai ? 'ผลต่างเกม' : 'Game Difference'}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-uefa-dark">{t.standings.pts}:</span> {isThai ? 'คะแนน' : 'Points'}
                    </div>
                </div>
            </div>
        </div>
    );
}
