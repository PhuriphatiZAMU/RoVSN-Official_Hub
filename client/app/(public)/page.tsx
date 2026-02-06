import { Metadata } from 'next';
import Link from 'next/link';
import { serverApi } from '@/lib/api';
import HeroCarousel from '@/components/home/HeroCarousel';
import HomeContentWrapper from '@/components/home/HomeContentWrapper';

export const metadata: Metadata = {
    title: 'RoV SN Tournament 2026',
    description: 'การแข่งขัน RoV ที่ยิ่งใหญ่ที่สุดในรั้ว SN - Witness the new legend unfold',
    openGraph: {
        title: 'RoV SN Tournament 2026',
        description: 'การแข่งขัน RoV ที่ยิ่งใหญ่ที่สุดในรั้ว SN',
        images: ['/images/key-visual/RoV-SN-TOURNAMENT-2026.png'],
    },
};

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

export default async function HomePage() {
    // Fetch all data on the server
    const data = await serverApi.getHomePageData();

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Content Section - Using Client Component Wrapper for hydration safety */}
            <HomeContentWrapper
                latestMatches={data.latestMatches}
                upcomingMatches={data.upcomingMatches}
                standings={data.standings}
                teamLogos={data.teamLogos}
            />
        </div>
    );
}
