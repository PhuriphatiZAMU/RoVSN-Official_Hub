import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/fixtures', label: 'Fixtures' },
        { path: '/standings', label: 'Standings' },
        { path: '/stats', label: 'Stats' },
        { path: '/clubs', label: 'Clubs' },
        { path: '/format', label: 'Format' },
    ];

    return (
        <nav className="navbar-custom sticky top-0 z-50 py-4">
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-3">
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

                {/* Desktop Navigation */}
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
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-cyan-aura">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </nav>
    );
}
