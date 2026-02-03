'use client';

import TeamLogo from '@/components/common/TeamLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { ProcessedStanding } from '@/lib/api';

interface LeagueTableProps {
    standings: ProcessedStanding[];
    teamLogos: Record<string, string>;
}

export default function LeagueTable({ standings, teamLogos }: LeagueTableProps) {
    const { t, language } = useLanguage();
    const isThai = language === 'th';

    if (standings.length === 0) {
        return (
            <div className="p-8 text-center">
                <i className="fas fa-trophy text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">{isThai ? 'ยังไม่มีข้อมูลตารางคะแนน' : 'No standings data yet'}</p>
            </div>
        );
    }

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
                <tbody>
                    {standings.slice(0, 5).map((d, i) => (
                        <tr key={`${d.name}-${i}`} className="border-b border-gray-100 hover:bg-echo-white transition group">
                            <td className="p-4 text-center">
                                <div className={`w-6 h-6 ${i < 4 ? 'bg-cyan-aura text-uefa-dark shadow-cyan-aura/20 shadow-lg' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center font-bold text-xs mx-auto transition-transform group-hover:scale-110`}>
                                    {i + 1}
                                </div>
                            </td>
                            <td className="p-4 font-bold text-uefa-dark text-sm md:text-base flex items-center gap-3">
                                <TeamLogo teamName={d.name} logoUrl={teamLogos[d.name]} size="sm" />
                                <span className="truncate max-w-[120px] md:max-w-none">{d.name}</span>
                            </td>
                            <td className="p-4 text-center text-sm text-gray-600 font-medium">{d.p}</td>
                            <td className="p-4 text-center text-sm font-mono text-gray-600">{d.gd > 0 ? `+${d.gd}` : d.gd}</td>
                            <td className="p-4 text-center font-bold text-uefa-dark text-lg">{d.pts}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
