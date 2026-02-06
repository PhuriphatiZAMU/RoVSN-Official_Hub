'use client';

import dynamic from 'next/dynamic';
import type { ProcessedStanding, MatchWithResult, ScheduleMatch } from '@/lib/api';

// Define the Props interface directly or import if exported
interface HomeContentProps {
    latestMatches: MatchWithResult[];
    upcomingMatches: ScheduleMatch[];
    standings: ProcessedStanding[];
    teamLogos: Record<string, string>;
}

// Dynamically import HomeContent with SSR disabled
// This must be done in a Client Component in Next.js 16+
const HomeContent = dynamic(() => import('./HomeContent'), {
    ssr: false,
    loading: () => <div className="container mx-auto px-4 py-12 min-h-screen"></div>,
});

export default function HomeContentWrapper(props: HomeContentProps) {
    return <HomeContent {...props} />;
}
