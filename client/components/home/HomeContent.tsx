'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import LatestMatches from './LatestMatches';
import LeagueTable from './LeagueTable';
import type { ProcessedStanding, MatchWithResult, ScheduleMatch } from '@/lib/api';

interface HomeContentProps {
    latestMatches: MatchWithResult[];
    upcomingMatches: ScheduleMatch[];
    standings: ProcessedStanding[];
    teamLogos: Record<string, string>;
}

export default function HomeContent({
    latestMatches,
    upcomingMatches,
    standings,
    teamLogos
}: HomeContentProps) {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Latest Matches */}
                <div>
                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-xl md:text-3xl font-display font-bold uppercase text-uefa-dark border-l-4 border-cyan-aura pl-4">
                            {t.home.latestResults}
                        </h2>
                        <Link
                            href="/fixtures"
                            className="text-cyan-aura font-bold hover:text-cyan-600 hover:underline text-sm flex items-center gap-1 transition-colors"
                        >
                            {t.home.viewAll} <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                    <LatestMatches
                        latestMatches={latestMatches}
                        upcomingMatches={upcomingMatches}
                        teamLogos={teamLogos}
                    />
                </div>

                {/* League Table */}
                <div>
                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-xl md:text-3xl font-display font-bold uppercase text-uefa-dark border-l-4 border-cyan-aura pl-4">
                            {t.home.leagueTable}
                        </h2>
                        <Link
                            href="/standings"
                            className="text-cyan-aura font-bold hover:text-cyan-600 hover:underline text-sm flex items-center gap-1 transition-colors"
                        >
                            {t.home.fullTable} <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                    <div className="bg-white shadow-lg shadow-gray-100 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <LeagueTable
                            standings={standings}
                            teamLogos={teamLogos}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
