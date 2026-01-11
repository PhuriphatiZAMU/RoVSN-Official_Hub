import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-uefa-dark to-deep-space flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-aura to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(21,200,255,0.4)]">
                        <i className="fas fa-shield-alt text-white text-3xl"></i>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
                        Admin Panel
                    </h1>
                    <p className="text-gray-400 mt-2">RoV SN Tournament Official</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/10">
                    <h2 className="text-xl font-display font-bold text-white mb-6 uppercase">
                        <i className="fas fa-lock mr-2 text-cyan-aura"></i>
                        เข้าสู่ระบบ
                    </h2>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <i className="fas fa-user"></i>
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-aura focus:ring-1 focus:ring-cyan-aura transition-all"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <i className="fas fa-key"></i>
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-aura focus:ring-1 focus:ring-cyan-aura transition-all"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider hover:shadow-[0_0_20px_rgba(21,200,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin"></i>
                                กำลังเข้าสู่ระบบ...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                เข้าสู่ระบบ
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    <i className="fas fa-info-circle mr-1"></i>
                    สำหรับผู้ดูแลระบบเท่านั้น
                </p>
            </div>
        </div>
    );
}
