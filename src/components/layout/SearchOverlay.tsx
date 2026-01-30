"use client";

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLayoutContext } from '@/components/providers/LayoutProvider';
import { Log, Category } from '@/lib/types';
import { getLogs, getCategories } from '@/app/actions';
import { LogListView } from '@/components/features/LogList';

export function SearchOverlay() {
    const { isSearchOpen, closeSearch } = useLayoutContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState<Log[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data when opened
    useEffect(() => {
        if (isSearchOpen && logs.length === 0) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [fetchedLogs, fetchedCats] = await Promise.all([getLogs(), getCategories()]);
                    setLogs(fetchedLogs);
                    setCategories(fetchedCats);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isSearchOpen, logs.length]);

    // Cleanup query on close
    useEffect(() => {
        if (!isSearchOpen && searchQuery !== '') {
            setSearchQuery('');
        }
    }, [isSearchOpen, searchQuery]);

    const categoryMap = React.useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.name] = cat;
            return acc;
        }, {} as Record<string, Category>);
    }, [categories]);

    const filteredLogs = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return logs.filter(log =>
            log.title.toLowerCase().includes(lowerQuery) ||
            log.memo?.toLowerCase().includes(lowerQuery) ||
            log.category.toLowerCase().includes(lowerQuery)
        );
    }, [logs, searchQuery]);

    if (!isSearchOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center gap-2 p-4 border-b pt-safe">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    autoFocus
                    placeholder="Search logs..."
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg p-0 h-auto placeholder:text-muted-foreground/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={closeSearch}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="text-center text-muted-foreground mt-10">Loading...</div>
                ) : searchQuery ? (
                    filteredLogs.length > 0 ? (
                        <LogListView logs={filteredLogs} categoryMap={categoryMap} />
                    ) : (
                        <div className="text-center text-muted-foreground mt-10">No results found</div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Search className="w-12 h-12 mb-2 opacity-20" />
                        <p>Type to search...</p>
                    </div>
                )}
            </div>

            {searchQuery && filteredLogs.length > 0 && (
                <div className="p-4 border-t bg-muted/20 text-center text-sm text-muted-foreground pb-safe">
                    Found {filteredLogs.length} matches
                </div>
            )}
        </div>
    );
}
