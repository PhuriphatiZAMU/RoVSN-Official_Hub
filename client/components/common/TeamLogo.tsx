'use client';

import Image from 'next/image';
import { useState } from 'react';

interface TeamLogoProps {
    teamName: string;
    logoUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
    xxl: 'w-24 h-24',
};

const sizePx = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 64,
    xxl: 96,
};

export default function TeamLogo({ teamName, logoUrl, size = 'md' }: TeamLogoProps) {
    const [hasError, setHasError] = useState(false);
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const sizePxValue = sizePx[size] || sizePx.md;

    if (!logoUrl || hasError) {
        return (
            <div className={`${sizeClass} bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className="fas fa-shield-alt text-gray-400"></i>
            </div>
        );
    }

    return (
        <div className={`${sizeClass} relative flex-shrink-0`}>
            <Image
                src={logoUrl}
                alt={teamName}
                width={sizePxValue}
                height={sizePxValue}
                className="object-contain"
                onError={() => setHasError(true)}
                unoptimized // Skip optimization for external URLs
            />
        </div>
    );
}
