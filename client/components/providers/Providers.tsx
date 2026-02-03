'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from './LanguageProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <LanguageProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </LanguageProvider>
    );
}
