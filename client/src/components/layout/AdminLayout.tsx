import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: 'fas fa-tachometer-alt', exact: true },
        { path: '/admin/draw', label: 'จับสลาก', icon: 'fas fa-random' },
        { path: '/admin/results', label: 'ผลการแข่งขัน', icon: 'fas fa-trophy' },
        { path: '/admin/players', label: 'ทะเบียนผู้เล่น', icon: 'fas fa-users' },
        { path: '/admin/heroes', label: 'ฮีโร่', icon: 'fas fa-mask' },
        { path: '/admin/logos', label: 'โลโก้ทีม', icon: 'fas fa-image' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    // Close sidebar when route changes (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar when clicking outside (mobile)
    const handleOverlayClick = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={handleOverlayClick}
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
                    <Link to="/" className="flex items-center gap-3">
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
                            to={item.path}
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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-cyan-aura/20 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-cyan-aura"></i>
                        </div>
                        <div>
                            <div className="font-bold text-sm">{user?.username}</div>
                            <div className="text-xs text-gray-400 uppercase">{user?.role}</div>
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
                            {menuItems.find(m => isActive(m.path, m.exact))?.label || 'Admin'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <Link
                            to="/"
                            className="text-gray-500 hover:text-cyan-aura transition-colors text-sm lg:text-base"
                            target="_blank"
                        >
                            <i className="fas fa-external-link-alt"></i>
                            <span className="hidden sm:inline ml-1">เปิดเว็บไซต์</span>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
