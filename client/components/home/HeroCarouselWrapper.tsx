'use client';

import dynamic from 'next/dynamic';

// Dynamically import HeroCarousel with SSR disabled
const HeroCarousel = dynamic(() => import('./HeroCarousel'), {
    ssr: false,
    loading: () => <div className="w-full aspect-[21/9] bg-uefa-dark animate-pulse shadow-2xl"></div>,
});

export default function HeroCarouselWrapper() {
    return <HeroCarousel />;
}
