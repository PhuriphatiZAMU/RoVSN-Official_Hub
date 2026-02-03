'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ShareButton from '@/components/common/ShareButton';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface StatsLayoutProps {
    children: React.ReactNode;
}

export default function StatsLayout({ children }: StatsLayoutProps) {
    const pathname = usePathname();
    const { t, language } = useLanguage();

    // Determine active tab based on pathname
    const getActiveTab = () => {
        if (pathname === '/stats/player') return 'player';
        if (pathname === '/stats/team') return 'team';
        return 'season';
    };

    const activeTab = getActiveTab();

    const tabs = [
        { path: '/stats', id: 'season', label: t.stats.overview, icon: 'fa-chart-pie' },
        { path: '/stats/team', id: 'team', label: t.stats.team, icon: 'fa-users' },
        { path: '/stats/player', id: 'player', label: t.stats.player, icon: 'fa-user-ninja' },
    ];

    return (
        <div className="flex-grow bg-gray-50">
            {/* Header */}
            <div className="bg-uefa-dark py-6 md:py-12 mb-4 md:mb-8 border-b-4 border-cyan-aura shadow-lg">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl md:text-5xl font-display font-bold text-white uppercase tracking-wider truncate">
                            {t.stats.title}
                        </h1>
                        <p className="text-cyan-aura/80 font-sans mt-1 text-xs md:text-base hidden sm:block">
                            {t.stats.subtitle}
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        <ShareButton title={`${t.stats.title} - RoV SN Tournament`} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Navigation Tabs (Mobile Optimized) */}
                <div className="grid grid-cols-3 md:flex md:flex-wrap gap-1 md:gap-2 mb-6 md:mb-8 p-1 bg-white rounded-xl w-full md:w-fit border border-gray-200 shadow-sm">
                    {tabs.map(tab => (
                        <Link
                            key={tab.path}
                            href={tab.path}
                            className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 px-1.5 md:px-4 py-2 md:py-3 rounded-lg font-bold text-[11px] md:text-base transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-uefa-dark text-cyan-aura shadow-md'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <i className={`fas ${tab.icon} text-sm md:text-base`}></i>
                            <span className="text-center leading-tight">{tab.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Page Content */}
                {children}
            </div>
        </div>
    );
}
