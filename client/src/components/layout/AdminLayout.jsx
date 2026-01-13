import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: 'fas fa-tachometer-alt', exact: true },
        { path: '/admin/draw', label: 'จับสลาก', icon: 'fas fa-random' },
        { path: '/admin/results', label: 'ผลการแข่งขัน', icon: 'fas fa-trophy' },
        { path: '/admin/players', label: 'ทะเบียนผู้เล่น', icon: 'fas fa-users' },

    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-uefa-dark text-white flex flex-col fixed h-full">
                {/* Logo */}
                <div className="p-6 border-b border-gray-700">
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
                <nav className="flex-1 py-4">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-6 py-3 transition-all border-l-4 ${isActive(item.path, item.exact)
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top Bar */}
                <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-display font-bold text-uefa-dark uppercase">
                            {menuItems.find(m => isActive(m.path, m.exact))?.label || 'Admin'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="text-gray-500 hover:text-cyan-aura transition-colors"
                            target="_blank"
                        >
                            <i className="fas fa-external-link-alt mr-1"></i>
                            เปิดเว็บไซต์
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
