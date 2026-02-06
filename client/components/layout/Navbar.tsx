'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import Image from 'next/image';

export default function Navbar() {
    const { t, language, changeLanguage } = useLanguage();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Mark as mounted to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
    }, [isMenuOpen]);

    const navItems = [
        { path: '/', label: t.nav.home },
        { path: '/fixtures', label: t.nav.fixtures },
        { path: '/standings', label: t.nav.standings },
        { path: '/stats', label: t.nav.stats },
        { path: '/clubs', label: t.nav.teams },
        { path: '/format', label: t.nav.format },
    ];

    const toggleLanguage = () => {
        changeLanguage(language === 'th' ? 'en' : 'th');
    };

    // Flag URL - use default 'th' for SSR, actual language after hydration
    const flagUrl = mounted
        ? (language === 'th' ? "https://flagcdn.com/w40/th.png" : "https://flagcdn.com/w40/gb.png")
        : "https://flagcdn.com/w40/th.png";
    const displayLanguage = mounted ? language : 'th';

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-uefa-dark shadow-lg py-2' : 'bg-gradient-to-b from-uefa-dark to-transparent py-4'}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Image
                                src="/images/logo/RoV-Logo.png"
                                alt="RoV SN Tournament"
                                width={48}
                                height={48}
                                priority
                                className="h-10 md:h-12 w-auto transition-transform group-hover:scale-110 drop-shadow-[0_0_10px_rgba(21,200,255,0.5)]"
                            />
                            <div className="absolute inset-0 bg-cyan-aura mix-blend-overlay opacity-0 group-hover:opacity-50 blur-lg transition-opacity"></div>
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-white font-display font-bold text-lg tracking-wider leading-none group-hover:text-cyan-aura transition-colors">
                                RoV SN<br /><span className="text-cyan-aura text-sm font-normal tracking-[0.2em]">TOURNAMENT</span>
                            </h1>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1 bg-uefa-dark/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10 shadow-lg">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`px-4 py-2 rounded-full font-display text-sm uppercase tracking-wide transition-all ${pathname === item.path
                                    ? 'bg-cyan-aura text-uefa-dark font-bold shadow-[0_0_15px_rgba(21,200,255,0.4)]'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions - Language Toggle */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-aura/50 transition-all group bg-uefa-dark/50 backdrop-blur-sm"
                        >
                            <Image
                                src={flagUrl}
                                alt={displayLanguage}
                                width={20}
                                height={15}
                                className="w-5 h-auto rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{ width: 'auto', height: 'auto' }}
                                unoptimized
                            />
                            <span className="text-gray-300 text-sm font-bold group-hover:text-cyan-aura">{displayLanguage.toUpperCase()}</span>
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-uefa-dark shadow-2xl z-50 transform transition-transform duration-300 md:hidden border-l border-white/10 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-uefa-dark to-deep-space">
                        <span className="text-white font-display text-xl font-bold tracking-wider">MENU</span>
                        <div className="flex items-center gap-3">
                            {/* Language Toggle in Mobile */}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                            >
                                <Image
                                    src={flagUrl}
                                    alt={displayLanguage}
                                    width={20}
                                    height={15}
                                    className="w-5 h-auto rounded"
                                    style={{ width: 'auto', height: 'auto' }}
                                    unoptimized
                                />
                                <span className="text-xs font-bold text-white">{displayLanguage.toUpperCase()}</span>
                            </button>
                            {/* Close Button */}
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        {navItems.map((item, idx) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-6 py-4 rounded-xl text-lg font-display uppercase tracking-wider transition-all border border-transparent ${pathname === item.path
                                    ? 'bg-gradient-to-r from-cyan-aura to-blue-600 text-white shadow-lg shadow-cyan-aura/20 border-cyan-aura/30'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-8'
                                    }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{item.label}</span>
                                    {pathname === item.path && <i className="fas fa-chevron-right text-sm opacity-50"></i>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
