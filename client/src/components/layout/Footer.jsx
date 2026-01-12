import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-uefa-dark text-white border-t-4 border-cyan-aura mt-auto">
            <div className="container mx-auto px-4 py-12">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-aura to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(21,200,255,0.4)]">
                        <img
                            src="/images/logo/RoV-Logo.png"
                            alt="RoV Logo"
                            className="w-8 h-8"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                    <h2 className="font-display font-bold text-2xl tracking-widest text-center">
                        ROV SN TOURNAMENT OFFICIAL
                    </h2>
                    <p className="text-cyan-aura text-sm mt-1">Echo of Destiny</p>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-6 mb-8">
                    <a
                        href="#"
                        className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-cyan-aura hover:bg-cyan-aura/10 transition-all hover:shadow-[0_0_15px_rgba(21,200,255,0.3)]"
                        aria-label="Facebook"
                    >
                        <i className="fab fa-facebook text-xl"></i>
                    </a>
                    <a
                        href="#"
                        className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-cyan-aura hover:bg-cyan-aura/10 transition-all hover:shadow-[0_0_15px_rgba(21,200,255,0.3)]"
                        aria-label="Discord"
                    >
                        <i className="fab fa-discord text-xl"></i>
                    </a>
                    <a
                        href="#"
                        className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-cyan-aura hover:bg-cyan-aura/10 transition-all hover:shadow-[0_0_15px_rgba(21,200,255,0.3)]"
                        aria-label="YouTube"
                    >
                        <i className="fab fa-youtube text-xl"></i>
                    </a>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-8 py-6 border-t border-gray-700 text-sm text-gray-400">
                    <Link to="/privacy" className="hover:text-cyan-aura transition-colors">
                        Privacy
                    </Link>
                    <Link to="/terms" className="hover:text-cyan-aura transition-colors">
                        Terms
                    </Link>
                    <Link to="/contact" className="hover:text-cyan-aura transition-colors">
                        Contact
                    </Link>
                </div>

                {/* Copyright */}
                <div className="text-center text-gray-600 text-xs mt-4">
                    © 2026 RoV SN Tournament. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
