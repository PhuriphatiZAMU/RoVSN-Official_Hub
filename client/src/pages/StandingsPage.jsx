import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import TeamLogo from '../components/common/TeamLogo';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/States';
import ShareButton from '../components/common/ShareButton';

export default function StandingsPage() {
    const { standings, loading, error } = useData();
    const { t } = useLanguage();

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

    return (
        <div className="flex-grow">
            {/* Header */}
            <div className="bg-uefa-dark py-12 mb-8">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase">
                        {t.standings.title}
                    </h1>
                    <ShareButton title="ตารางคะแนน RoV SN Tournament" />
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                    {/* Table Header Info */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
                        <div>
                            <h3 className="text-lg md:text-2xl font-display font-bold text-uefa-dark">League Phase</h3>
                            <p className="text-sm text-gray-500">Overall Rankings</p>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="w-3 h-3 bg-green-100 border border-green-300 mr-2"></span>
                            <span className="text-gray-600">Qualification Zone (Top 4)</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left uefa-table">
                            <thead>
                                <tr>
                                    <th className="p-2 md:p-3 w-8 md:w-10 text-center">#</th>
                                    <th className="p-2 md:p-3">{t.standings.team}</th>
                                    <th className="p-2 md:p-3 text-center">{t.standings.played}</th>
                                    <th className="p-2 md:p-3 text-center text-green-600">{t.standings.won}</th>
                                    <th className="p-2 md:p-3 text-center text-red-500">{t.standings.lost}</th>
                                    <th className="p-2 md:p-3 text-center hide-mobile">{t.standings.gd}</th>
                                    <th className="p-2 md:p-3 text-center font-bold text-black">{t.standings.pts}</th>
                                </tr>
                            </thead>
                            {loading ? (
                                <TableSkeleton rows={12} cols={7} />
                            ) : (
                                <tbody>
                                    {standings.map((d, i) => {
                                        const rank = i + 1;
                                        const isQualified = rank <= 4;

                                        return (
                                            <tr
                                                key={d.name}
                                                className={`${isQualified ? 'bg-green-50' : ''} ${rank === 4 ? 'border-b-4 border-cyan-aura' : 'border-b border-gray-100'}`}
                                            >
                                                <td className="p-3 text-center">
                                                    <div className={`w-8 h-8 ${isQualified ? 'bg-cyan-aura text-uefa-dark' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center font-bold mx-auto`}>
                                                        {rank}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-bold text-uefa-dark">
                                                    <div className="flex items-center gap-2">
                                                        <TeamLogo teamName={d.name} size="md" />
                                                        <span>{d.name}</span> {/* Team name display */}
                                                    </div>
                                                </td>
                                                <td className="p-2 md:p-3 text-center">{d.p}</td>
                                                <td className="p-2 md:p-3 text-center text-green-600 font-bold">{d.w}</td>
                                                <td className="p-2 md:p-3 text-center text-red-500">{d.l}</td>
                                                <td className="p-2 md:p-3 text-center font-mono hide-mobile">{d.gd > 0 ? `+${d.gd}` : d.gd}</td>
                                                <td className="p-2 md:p-3 text-center font-bold text-black text-base md:text-lg">{d.pts}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
