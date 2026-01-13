import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language, toggleLanguage } = useLanguage();

    const navItems = [
        { path: '/', label: t.nav.home },
        { path: '/fixtures', label: t.nav.fixtures },
        { path: '/standings', label: t.nav.standings },
        { path: '/stats', label: t.nav.stats },
        { path: '/clubs', label: t.nav.teams },
        { path: '/format', label: t.nav.format },
    ];

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="navbar-custom sticky top-0 z-50 py-4">
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-aura to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(21,200,255,0.6)]">
                        <img
                            src="/images/logo/RoV-Logo.png"
                            alt="RoV Logo"
                            className="w-6 h-6"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-bold text-2xl tracking-wide text-white leading-none">
                            ROV SN
                        </span>
                        <span className="text-cyan-aura text-xs font-sans tracking-widest uppercase">
                            Tournament Official
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation & Actions */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link text-sm ${isActive ? 'active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}

                    {/* Language Switcher (Desktop) */}
                    <button
                        onClick={toggleLanguage}
                        className="ml-4 px-3 py-1 border border-cyan-aura/30 rounded text-xs font-bold text-cyan-aura hover:bg-cyan-aura hover:text-uefa-dark transition-all"
                    >
                        {language === 'th' ? 'EN' : 'TH'}
                    </button>

                    {/* Admin Link (Optional/Hidden for public) - maybe keep hidden or icon? */}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    {/* Language Switcher (Mobile Header - Visible even if menu closed? No, let's put inside menu or generic header) */}
                    {/* Keep Simple: Just Toggle Button here */}
                    <button
                        className="text-cyan-aura p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="w-6 h-5 relative flex flex-col justify-between">
                            <span
                                className={`block h-0.5 bg-current transform transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-2' : ''
                                    }`}
                            />
                            <span
                                className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : ''
                                    }`}
                            />
                            <span
                                className={`block h-0.5 bg-current transform transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-2' : ''
                                    }`}
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeMenu}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-uefa-dark z-50 md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <span className="font-display font-bold text-white text-lg">Menu</span>

                    <div className="flex items-center gap-3">
                        {/* Language Switcher (Mobile Panel) */}
                        <button
                            onClick={toggleLanguage}
                            className="px-3 py-1 border border-cyan-aura/30 rounded text-xs font-bold text-cyan-aura hover:bg-cyan-aura hover:text-uefa-dark transition-all"
                        >
                            {language === 'th' ? 'EN' : 'TH'}
                        </button>

                        <button
                            onClick={closeMenu}
                            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Close menu"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Items */}
                <div className="py-4">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMenu}
                            className={({ isActive }) => `
                block px-6 py-4 font-display text-lg uppercase tracking-wider
                transition-all duration-200 border-l-4
                ${isActive
                                    ? 'text-cyan-aura bg-white/5 border-cyan-aura'
                                    : 'text-white hover:text-cyan-aura hover:bg-white/5 border-transparent hover:border-cyan-aura/50'
                                }
              `}
                            style={{
                                animationDelay: `${index * 50}ms`,
                                animation: isOpen ? 'slideIn 0.3s ease-out forwards' : 'none'
                            }}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>


            </div>
        </nav>
    );
}
