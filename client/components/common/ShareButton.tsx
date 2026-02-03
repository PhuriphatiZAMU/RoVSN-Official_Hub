'use client';

import { useState } from 'react';

interface ShareButtonProps {
    title?: string;
    url?: string;
    className?: string;
}

export default function ShareButton({ title = 'RoV SN Tournament', url, className = '' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or share failed
                console.log('Share cancelled or failed:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs font-bold transition-all ${className}`}
            title={copied ? 'Copied!' : 'Share'}
        >
            <i className={`fas ${copied ? 'fa-check' : 'fa-share-alt'}`}></i>
            {copied && <span>Copied!</span>}
        </button>
    );
}
