'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Image from 'next/image';

function LoginContent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                // Redirect to callback URL or admin dashboard
                const callbackUrl = searchParams.get('callbackUrl') || '/admin';
                router.push(callbackUrl);
            } else {
                setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-uefa-dark via-deep-space to-uefa-dark flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2315C8FF' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block relative">
                        <Image
                            src="/images/logo/RoV-Logo.png"
                            alt="RoV SN Tournament"
                            width={100}
                            height={100}
                            className="h-24 w-auto mx-auto drop-shadow-[0_0_20px_rgba(21,200,255,0.5)]"
                        />
                        <div className="absolute inset-0 bg-cyan-aura mix-blend-overlay opacity-30 blur-xl"></div>
                    </div>
                    <h1 className="text-white font-display text-3xl font-bold mt-4 tracking-wider">
                        ADMIN <span className="text-cyan-aura">LOGIN</span>
                    </h1>
                    <p className="text-gray-400 mt-2">เข้าสู่ระบบจัดการทัวร์นาเมนต์</p>
                </div>

                {/* Login Form */}
                <div className="bg-uefa-dark/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <i className="fas fa-exclamation-circle"></i>
                                {error}
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-2 font-medium">
                                <i className="fas fa-user mr-2 text-cyan-aura"></i>
                                ชื่อผู้ใช้
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-deep-space/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-aura focus:ring-1 focus:ring-cyan-aura outline-none transition-all"
                                placeholder="กรอกชื่อผู้ใช้"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-2 font-medium">
                                <i className="fas fa-lock mr-2 text-cyan-aura"></i>
                                รหัสผ่าน
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-deep-space/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-aura focus:ring-1 focus:ring-cyan-aura outline-none transition-all"
                                placeholder="กรอกรหัสผ่าน"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-aura to-cyan-dark text-uefa-dark font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-aura/20 hover:shadow-cyan-aura/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
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
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-gray-400 hover:text-cyan-aura transition-colors text-sm"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        กลับหน้าแรก
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-uefa-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-aura border-t-transparent"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
