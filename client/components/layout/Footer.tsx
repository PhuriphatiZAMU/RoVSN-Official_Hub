import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-uefa-dark text-gray-400 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-white font-display text-xl font-bold mb-4">
                            RoV SN <span className="text-cyan-aura">TOURNAMENT</span>
                        </h3>
                        <p className="text-sm leading-relaxed">
                            ระบบจัดการทัวร์นาเมนต์ RoV SN อย่างเป็นทางการ
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-display text-lg font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-cyan-aura transition-colors">
                                    หน้าแรก
                                </Link>
                            </li>
                            <li>
                                <Link href="/fixtures" className="hover:text-cyan-aura transition-colors">
                                    ตารางแข่งขัน
                                </Link>
                            </li>
                            <li>
                                <Link href="/standings" className="hover:text-cyan-aura transition-colors">
                                    ตารางคะแนน
                                </Link>
                            </li>
                            <li>
                                <Link href="/stats" className="hover:text-cyan-aura transition-colors">
                                    สถิติ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-white font-display text-lg font-bold mb-4">Follow Us</h4>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                            >
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-pink-500 hover:text-white transition-all"
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all"
                            >
                                <i className="fab fa-twitter"></i>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
                    <p>© {currentYear} RoV SN Tournament. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
