"use client";

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Log, Category } from '@/lib/types';
import { LogListView } from '@/components/features/LogList';
import { TopBar } from '@/components/layout/TopBar';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface SearchClientProps {
    initialLogs: Log[];
    initialCategories: Category[];
}

export function SearchClient({ initialLogs, initialCategories }: SearchClientProps) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const categoryMap = useMemo(() => {
        return initialCategories.reduce((acc, cat) => {
            acc[cat.name] = cat;
            return acc;
        }, {} as Record<string, Category>);
    }, [initialCategories]);

    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return initialLogs.filter(log =>
            log.title.toLowerCase().includes(lowerQuery) ||
            log.memo?.toLowerCase().includes(lowerQuery) ||
            log.category.toLowerCase().includes(lowerQuery)
        );
    }, [initialLogs, searchQuery]);

    return (
        <div className="flex flex-col h-full w-full bg-muted/10">
            <TopBar title={t('search.title')} />

            <div className="p-4 bg-background border-b sticky top-14 z-10">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                    <Input
                        autoFocus
                        placeholder={t('search.placeholder')}
                        className="pl-10 h-10 bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {searchQuery ? (
                    filteredLogs.length > 0 ? (
                        <div className="space-y-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                                {t('search.results', { count: filteredLogs.length })}
                            </p>
                            <LogListView logs={filteredLogs} categoryMap={categoryMap} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground animate-in fade-in zoom-in duration-300">
                            <Search className="w-12 h-12 mb-3 opacity-10" />
                            <p className="text-sm">{t('search.noResults', { query: searchQuery })}</p>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-60 text-muted-foreground/60">
                        <Search className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-sm text-center px-8">
                            {t('search.startTyping')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
