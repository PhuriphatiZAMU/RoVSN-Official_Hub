'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
    '/images/key-visual/RoV-SN-TOURNAMENT-2023.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2024.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2025.png',
    '/images/key-visual/RoV-SN-TOURNAMENT-2026.png',
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full aspect-[21/9] bg-uefa-dark overflow-hidden shadow-2xl">
            <div
                className="carousel-wrapper h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {heroImages.map((img, i) => (
                    <div key={i} className="carousel-slide relative min-w-full h-full">
                        <Image
                            src={img}
                            alt={`RoV SN Tournament ${2023 + i}`}
                            fill
                            className={`object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            priority={i === 0}
                            onLoad={() => i === 0 && setIsLoading(false)}
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-uefa-dark/80 via-transparent to-transparent" />
                    </div>
                ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroImages.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${currentSlide === i
                                ? 'bg-cyan-aura w-6 md:w-8'
                                : 'bg-white/50 hover:bg-white'
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length)}
                className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-cyan-aura text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-sm border border-white/10"
                aria-label="Previous slide"
            >
                <i className="fas fa-chevron-left text-lg md:text-xl"></i>
            </button>
            <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % heroImages.length)}
                className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-cyan-aura text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-sm border border-white/10"
                aria-label="Next slide"
            >
                <i className="fas fa-chevron-right text-lg md:text-xl"></i>
            </button>
        </div>
    );
}
