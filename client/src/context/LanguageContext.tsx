import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../utils/translations';

type Language = 'th' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    changeLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: typeof translations.th;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    // Default to 'th' or check localStorage
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'en' ? 'en' : 'th') as Language;
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'th' ? 'en' : 'th');
    };

    // Alias for setLanguage for convenience
    const changeLanguage = (lang: Language) => {
        if (lang === 'th' || lang === 'en') {
            setLanguage(lang);
        }
    };

    const t = translations[language] || translations['th'];

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            changeLanguage,
            toggleLanguage,
            t
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
