"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';
import { createClient } from '@/lib/supabase/client';

type TranslationKeys = typeof translations.en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (path: string, variables?: Record<string, string | number>) => string;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ko');
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const initializeLanguage = async () => {
            // 1. Try local storage first for immediate feedback
            const savedLang = localStorage.getItem('app-language') as Language;
            if (savedLang && (savedLang === 'en' || savedLang === 'ko')) {
                setLanguageState(savedLang);
            }

            // 2. Try Supabase profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('language')
                    .eq('id', user.id)
                    .single();

                if (profile?.language && (profile.language === 'en' || profile.language === 'ko')) {
                    const profileLang = profile.language as Language;
                    if (profileLang !== savedLang) {
                        setLanguageState(profileLang);
                        localStorage.setItem('app-language', profileLang);
                    }
                }
            }
        };

        initializeLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        if (lang === language) return;

        setIsLoading(true);
        // Add a small artificial delay for smoother transition feel
        await new Promise(resolve => setTimeout(resolve, 600));

        setLanguageState(lang);
        localStorage.setItem('app-language', lang);

        // Sync to profile if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').upsert({ id: user.id, language: lang });
        }
        setIsLoading(false);
    };

    const t = (path: string, variables?: Record<string, string | number>) => {
        const keys = path.split('.');
        let current: any = translations[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key not found: ${path}`);
                return path;
            }
            current = current[key];
        }

        let translation = current as string;
        if (variables) {
            Object.entries(variables).forEach(([key, value]) => {
                translation = translation.replace(`{${key}}`, String(value));
            });
        }

        return translation;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
            <div className={`transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {children}
            </div>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            )}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
