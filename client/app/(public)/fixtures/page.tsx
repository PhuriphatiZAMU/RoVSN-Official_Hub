import { Metadata } from 'next';
import { serverApi } from '@/lib/api';
import FixturesContent from '@/components/fixtures/FixturesContent';

export const metadata: Metadata = {
    title: 'Fixtures - RoV SN Tournament 2026',
    description: 'ตารางการแข่งขันและผลการแข่ง - RoV SN Tournament 2026',
    openGraph: {
        title: 'Fixtures - RoV SN Tournament 2026',
        description: 'ดูตารางการแข่งขัน คู่แข่งขัน และผลการแข่งทั้งหมด',
    },
};

export const revalidate = 60;

export default async function FixturesPage() {
    const data = await serverApi.getFixturesPageData();

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <FixturesContent
                schedule={data.schedule}
                results={data.results}
                teamLogos={data.teamLogos}
            />
        </div>
    );
}
