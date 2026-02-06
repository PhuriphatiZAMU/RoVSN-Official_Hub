'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const { language, changeLanguage, t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Protect admin routes
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    const menuItems = [
        { path: '/admin', label: t.admin.dashboard.title, icon: 'fas fa-tachometer-alt', exact: true },
        { path: '/admin/draw', label: t.admin.dashboard.draw, icon: 'fas fa-random' },
        { path: '/admin/schedule', label: t.admin.dashboard.manageSchedule, icon: 'fas fa-calendar-check' },
        { path: '/admin/results', label: t.admin.dashboard.recordResult, icon: 'fas fa-trophy' },
        { path: '/admin/history', label: t.admin.historyTitle || 'History', icon: 'fas fa-history' },
        { path: '/admin/teams', label: t.admin.dashboard.manageTeams, icon: 'fas fa-users-cog' },
        { path: '/admin/players', label: t.admin.dashboard.managePlayers, icon: 'fas fa-user-friends' },
        { path: '/admin/game-stats', label: t.admin.playerStatsTitle || t.admin.dashboard.gameStats, icon: 'fas fa-chart-line' },
        { path: '/admin/heroes', label: t.admin.dashboard.manageHeroes, icon: 'fas fa-mask' },
        { path: '/admin/logos', label: t.admin.dashboard.manageLogos, icon: 'fas fa-image' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const isActive = (path: string, exact = false) => {
        if (exact) return pathname === path;
        return pathname.startsWith(path);
    };

    // Close sidebar when route changes (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-aura border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-display">
                        {loading ? 'Loading Admin Panel...' : 'Redirecting to login...'}
                    </p>
                </div>
            </div>
        );
    }

    const currentMenu = menuItems.find(m => isActive(m.path, m.exact)) || { label: 'Admin' };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-uefa-dark text-white flex flex-col fixed h-full z-50
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Logo */}
                <div className="p-4 lg:p-6 border-b border-gray-700">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-aura to-blue-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-shield-alt text-white"></i>
                        </div>
                        <div>
                            <div className="font-display font-bold text-lg">ADMIN</div>
                            <div className="text-cyan-aura text-xs uppercase">RoV SN Tournament</div>
                        </div>
                    </Link>
                </div>

                {/* Menu */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 lg:px-6 py-3 transition-all border-l-4 ${isActive(item.path, item.exact)
                                ? 'bg-white/10 text-cyan-aura border-cyan-aura'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white border-transparent'
                                }`}
                        >
                            <i className={`${item.icon} w-5`}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-700">
                    {/* Language Switcher */}
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={() => changeLanguage(language === 'th' ? 'en' : 'th')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-gray-700 text-[10px] font-bold">
                                {language.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-200">
                                {language === 'th' ? 'ภาษาไทย' : 'English'}
                            </span>
                            <i className="fas fa-chevron-right text-xs text-gray-500 ml-1"></i>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-cyan-aura/20 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-cyan-aura"></i>
                        </div>
                        <div>
                            <div className="font-bold text-sm">{user?.username || 'Admin'}</div>
                            <div className="text-xs text-gray-400 uppercase">{user?.role || 'System'}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen">
                {/* Top Bar */}
                <header className="bg-white shadow-sm px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between sticky top-0 z-30">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-cyan-aura transition-colors"
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>

                    <div className="flex-1 lg:flex-none">
                        <h1 className="text-lg lg:text-xl font-display font-bold text-uefa-dark uppercase text-center lg:text-left">
                            {currentMenu.label}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <Link
                            href="/"
                            className="text-gray-500 hover:text-cyan-aura transition-colors text-sm lg:text-base flex items-center gap-2"
                            target="_blank"
                        >
                            <i className="fas fa-external-link-alt"></i>
                            <span className="hidden sm:inline">เปิดเว็บไซต์</span>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
