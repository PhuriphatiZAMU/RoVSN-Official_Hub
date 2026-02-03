import { Metadata } from 'next';
import { serverApi } from '@/lib/api';
import StandingsContent from '@/components/standings/StandingsContent';

export const metadata: Metadata = {
    title: 'Standings - RoV SN Tournament 2026',
    description: 'ตารางคะแนน League Phase Rankings - RoV SN Tournament 2026',
    openGraph: {
        title: 'Standings - RoV SN Tournament 2026',
        description: 'ตารางคะแนนและอันดับทีมในการแข่งขัน',
    },
};

export const revalidate = 60;

export default async function StandingsPage() {
    const data = await serverApi.getStandingsPageData();

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <StandingsContent
                standings={data.standings}
                teamLogos={data.teamLogos}
            />
        </div>
    );
}
