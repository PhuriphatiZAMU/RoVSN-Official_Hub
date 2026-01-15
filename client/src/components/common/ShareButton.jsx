import { useState } from 'react';

// Social Share URLs
const shareUrls = {
    facebook: (url, title) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    twitter: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    line: (url, title) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    copy: (url) => url,
};

export default function ShareButton({ title, url, variant = 'default' }) {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    const handleShare = (platform) => {
        if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            const shareLink = shareUrls[platform](shareUrl, shareTitle);
            window.open(shareLink, '_blank', 'width=600,height=400');
        }
        setIsOpen(false);
    };

    // Native share API (mobile)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="relative inline-block">
            {/* Main Share Button */}
            <button
                onClick={handleNativeShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${variant === 'icon'
                        ? 'p-2 bg-gray-100 dark:bg-gray-700 hover:bg-cyan-aura hover:text-uefa-dark'
                        : 'bg-gradient-to-r from-cyan-aura to-cyan-dark text-uefa-dark font-bold hover:shadow-lg hover:shadow-cyan-aura/30'
                    }`}
            >
                <i className="fas fa-share-alt"></i>
                {variant !== 'icon' && <span>แชร์</span>}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-uefa-dark rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => handleShare('facebook')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            <i className="fab fa-facebook-f w-5 text-blue-600"></i>
                            <span>Facebook</span>
                        </button>

                        <button
                            onClick={() => handleShare('twitter')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-400 hover:text-white transition-colors"
                        >
                            <i className="fab fa-twitter w-5 text-sky-500"></i>
                            <span>Twitter / X</span>
                        </button>

                        <button
                            onClick={() => handleShare('line')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-500 hover:text-white transition-colors"
                        >
                            <i className="fab fa-line w-5 text-green-500"></i>
                            <span>Line</span>
                        </button>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        <button
                            onClick={() => handleShare('copy')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <i className={`fas ${copied ? 'fa-check text-green-500' : 'fa-link'} w-5`}></i>
                            <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// Quick share buttons (inline)
export function ShareButtons({ title, url, size = 'md' }) {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10';

    const handleShare = (platform) => {
        const shareLink = shareUrls[platform](shareUrl, shareTitle);
        window.open(shareLink, '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleShare('facebook')}
                className={`${sizeClass} rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center`}
                title="แชร์ไป Facebook"
            >
                <i className="fab fa-facebook-f"></i>
            </button>

            <button
                onClick={() => handleShare('twitter')}
                className={`${sizeClass} rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center justify-center`}
                title="แชร์ไป Twitter"
            >
                <i className="fab fa-twitter"></i>
            </button>

            <button
                onClick={() => handleShare('line')}
                className={`${sizeClass} rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center`}
                title="แชร์ไป Line"
            >
                <i className="fab fa-line"></i>
            </button>
        </div>
    );
}
