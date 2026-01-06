"use client";

import React, { useState } from 'react';
import { Log, Category } from '@/lib/types';
import { TopBar } from '@/components/layout/TopBar';
import { LogListView } from '@/components/features/LogList';
import { GalleryView } from '@/components/features/GalleryView';
import { LayoutGrid, List as ListIcon, Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator'; // Need to make sure Separator exists or use hr

interface HomeClientProps {
    initialLogs: Log[];
    categories: Category[];
}

export function HomeClient({ initialLogs, categories }: HomeClientProps) {
    const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');

    // Filter & Sort State
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'amount'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    const categoryMap = React.useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.name] = cat;
            return acc;
        }, {} as Record<string, Category>);
    }, [categories]);

    // Derived State: Filtered & Sorted Logs
    const filteredLogs = React.useMemo(() => {
        let result = [...initialLogs];

        // 1. Category Filter
        if (categoryFilter) {
            result = result.filter(log => log.category === categoryFilter);
        }

        // 2. Sort
        result.sort((a, b) => {
            if (sortConfig.key === 'date') {
                const dateA = new Date(a.date + (a.start_time ? 'T' + a.start_time : '')).getTime();
                const dateB = new Date(b.date + (b.start_time ? 'T' + b.start_time : '')).getTime();
                return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortConfig.key === 'amount') {
                const amountA = a.amount || 0;
                const amountB = b.amount || 0;
                return sortConfig.direction === 'asc' ? amountA - amountB : amountB - amountA;
            }
            return 0;
        });

        return result;
    }, [initialLogs, categoryFilter, sortConfig]);

    // Calculate Totals if refined
    const totalAmount = React.useMemo(() => {
        return filteredLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
    }, [filteredLogs]);

    return (
        <div className="flex flex-col h-full w-full relative">
            <TopBar
                title="My Logs"
                actions={
                    <div className="flex items-center gap-2">
                        {/* View Settings Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <SlidersHorizontal className="w-5 h-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-56 p-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">View Mode</h4>
                                        <div className="flex items-center bg-muted/50 rounded-lg p-1 h-9">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("flex-1 h-7 rounded-md text-xs", viewMode === 'list' && "bg-background shadow-sm")}
                                                onClick={() => setViewMode('list')}
                                            >
                                                <ListIcon className="w-3 h-3 mr-1" /> List
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("flex-1 h-7 rounded-md text-xs", viewMode === 'gallery' && "bg-background shadow-sm")}
                                                onClick={() => setViewMode('gallery')}
                                            >
                                                <LayoutGrid className="w-3 h-3 mr-1" /> Gallery
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="h-px bg-border" />

                                    <div>
                                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">Sort By</h4>
                                        <div className="grid gap-2">
                                            <Button
                                                variant={sortConfig.key === 'date' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setSortConfig(prev => ({ key: 'date', direction: prev.key === 'date' && prev.direction === 'desc' ? 'asc' : 'desc' }))}
                                                className="justify-between h-8 text-xs"
                                            >
                                                <span>Date</span>
                                                {sortConfig.key === 'date' && <ArrowUpDown className="w-3 h-3" />}
                                            </Button>
                                            <Button
                                                variant={sortConfig.key === 'amount' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setSortConfig(prev => ({ key: 'amount', direction: prev.key === 'amount' && prev.direction === 'desc' ? 'asc' : 'desc' }))}
                                                className="justify-between h-8 text-xs"
                                            >
                                                <span>Amount</span>
                                                {sortConfig.key === 'amount' && <ArrowUpDown className="w-3 h-3" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                }
            />

            {/* Filter Bar */}
            <div className="w-full bg-background/95 backdrop-blur-sm border-b z-30 px-4 py-2 flex justify-between items-center gap-2">
                <Select value={categoryFilter || "all"} onValueChange={(val) => setCategoryFilter(val === "all" ? null : val)}>
                    <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Active Filter Summary (Total Amount) */}
                {categoryFilter && (
                    <div className="flex-shrink-0 text-xs font-medium bg-muted px-2 py-1 rounded">
                        Total: ${totalAmount.toLocaleString()}
                    </div>
                )}
            </div>

            {/* List/Gallery Content */}
            <div className="flex-1 overflow-y-auto w-full">
                {viewMode === 'list' ? (
                    <LogListView logs={filteredLogs} categoryMap={categoryMap} />
                ) : (
                    <GalleryView logs={filteredLogs} categoryMap={categoryMap} />
                )}
            </div>
        </div>
    );
}
