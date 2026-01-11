import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-uefa-dark text-white border-t-4 border-cyan-aura mt-auto">
            <div className="container mx-auto px-4 py-12">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-aura to-blue-600 rounded-full flex items-center justify-center mb-4">
                        <img
                            src="/images/logo/RoV-Logo.png"
                            alt="RoV Logo"
                            className="w-6 h-6"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                    <h2 className="font-display font-bold text-2xl tracking-widest">
                        ROV SN TOURNAMENT OFFICIAL
                    </h2>
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
                <div className="text-center text-gray-500 text-xs mt-4">
                    © 2026 RoV SN Tournament.
                </div>
            </div>
        </footer>
    );
}
