"use client";

import React, { useState } from 'react';
import { Log, Category, AppMode } from '@/lib/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { LogListView } from '@/components/features/LogList';
import { GalleryView } from '@/components/features/GalleryView';
import { LogTableView } from '@/components/features/LogTableView';
import { JournalView } from '@/components/features/JournalView';
import { CalendarView } from '@/components/features/CalendarView';
import { KanbanView } from '@/components/features/KanbanView';
import { bulkDeleteLogs } from '@/app/actions';
import { LayoutGrid, List as ListIcon, SlidersHorizontal, ArrowUpDown, CheckSquare, Trash2, X, DollarSign, BookHeart, Calendar, Wrench, Table as TableIcon, ScrollText, KanbanSquare, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { OnboardingGuide } from '@/components/features/OnboardingGuide';

interface HomeClientProps {
    initialLogs: Log[];
    categories: Category[];
}

export function HomeClient({ initialLogs, categories }: HomeClientProps) {
    const { t } = useLanguage(); // Need to use language hook
    const [viewMode, setViewMode] = useState<'list' | 'gallery' | 'table' | 'feed' | 'calendar' | 'board'>('list');
    const [appMode, setAppMode] = useState<AppMode>('all');

    // Onboarding State
    const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);

    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFilterBar, setShowFilterBar] = useState(false);

    // Filter & Sort State
    const searchParams = useSearchParams();
    const router = useRouter(); // Use router to update URL
    const pathname = usePathname();

    const categoryFilter = searchParams.get('category');

    // Helper to update URL
    const setCategoryFilter = (category: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category) {
            params.set('category', category);
        } else {
            params.delete('category');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'amount'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    // Mode Switching Effect
    React.useEffect(() => {
        switch (appMode) {
            case 'financial':
                setViewMode('table');
                // Future: Set filter to financial categories
                break;
            case 'journal':
                setViewMode('feed');
                // Future: Set filter to journal categories
                break;
            case 'planner':
                setViewMode('calendar'); // Future: calendar
                break;
            case 'maintenance':
                setViewMode('board');
                break;
            default:
                setViewMode('list');
                break;
        }
        // Reset category filter when mode changes (optional, but good for now)
        setCategoryFilter(null);
    }, [appMode]);

    const categoryMap = React.useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.name] = cat;
            return acc;
        }, {} as Record<string, Category>);
    }, [categories]);

    // Derived State: Filtered & Sorted Logs
    const filteredLogs = React.useMemo(() => {
        let result = [...initialLogs];

        // 0. App Mode Filter (Placeholder for now)
        // In the future, this will filter by specific category groups defined in settings
        if (appMode !== 'all') {
            if (appMode === 'financial') {
                result = result.filter(log => log.amount !== null && log.amount !== undefined);
            } else if (appMode === 'journal') {
                result = result.filter(log => log.memo && log.memo.trim() !== '');

            } else if (appMode === 'maintenance') {
                result = result.filter(log => log.status === 'Planned' || log.status === 'Completed' || log.status === 'Pending');
            }
        }

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
    }, [initialLogs, categoryFilter, sortConfig, appMode]);

    // Calculate Totals if refined
    const totalAmount = React.useMemo(() => {
        return filteredLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
    }, [filteredLogs]);

    // Selection Handlers
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds(new Set());
    };

    const toggleItemSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} logs?`)) return;

        setIsDeleting(true);
        try {
            await bulkDeleteLogs(Array.from(selectedIds));
            setIsSelectionMode(false);
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
            alert('Failed to delete logs');
        } finally {
            setIsDeleting(false);
        }
    };

    const MODES: { value: AppMode; label: string; icon: any }[] = [
        { value: 'all', label: t('nav.modes.all'), icon: LayoutGrid },
        { value: 'financial', label: t('nav.modes.financial'), icon: DollarSign },
        { value: 'journal', label: t('nav.modes.journal'), icon: BookHeart },
        { value: 'planner', label: t('nav.modes.planner'), icon: Calendar },
        { value: 'maintenance', label: t('nav.modes.maintenance'), icon: Wrench },
    ];

    const currentModeLabel = MODES.find(m => m.value === appMode)?.label;

    return (
        <div className="flex flex-col h-full w-full relative">
            <TopBar
                title={isSelectionMode ? (
                    `${selectedIds.size} Selected`
                ) : (
                    <div className="flex items-center">
                        <Select value={appMode} onValueChange={(v) => setAppMode(v as AppMode)}>
                            <SelectTrigger className="h-9 border-none bg-transparent shadow-none focus:ring-0 gap-2 px-0 hover:bg-muted/50 transition-colors">
                                <SelectValue>
                                    <span className="font-semibold text-lg">{currentModeLabel}</span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {MODES.map(mode => (
                                    <SelectItem key={mode.value} value={mode.value}>
                                        <div className="flex items-center gap-2">
                                            <mode.icon className="w-4 h-4 opacity-70" />
                                            <span>{mode.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                actions={
                    <div className="flex items-center gap-2">
                        {isSelectionMode ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground"
                                    onClick={toggleSelectionMode}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={selectedIds.size === 0 || isDeleting}
                                    onClick={handleBulkDelete}
                                    className="h-8 px-3"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8", (showFilterBar || categoryFilter) && "text-primary bg-primary/10")}
                                    onClick={() => setShowFilterBar(!showFilterBar)}
                                >
                                    <Filter className="w-5 h-5" />
                                    {categoryFilter && <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={toggleSelectionMode}
                                >
                                    <CheckSquare className="w-5 h-5" />
                                </Button>
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
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn("flex-1 h-7 rounded-md text-xs", viewMode === 'table' && "bg-background shadow-sm")}
                                                        onClick={() => setViewMode('table')}
                                                    >
                                                        <TableIcon className="w-3 h-3 mr-1" /> Table
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn("flex-1 h-7 rounded-md text-xs", viewMode === 'feed' && "bg-background shadow-sm")}
                                                        onClick={() => setViewMode('feed')}
                                                    >
                                                        <ScrollText className="w-3 h-3 mr-1" /> Feed
                                                    </Button>
                                                </div>
                                                <div className="flex items-center bg-muted/50 rounded-lg p-1 h-9 mt-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn("flex-1 h-7 rounded-md text-xs", viewMode === 'calendar' && "bg-background shadow-sm")}
                                                        onClick={() => setViewMode('calendar')}
                                                    >
                                                        <Calendar className="w-3 h-3 mr-1" /> Cal
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn("flex-1 h-7 rounded-md text-xs", viewMode === 'board' && "bg-background shadow-sm")}
                                                        onClick={() => setViewMode('board')}
                                                    >
                                                        <KanbanSquare className="w-3 h-3 mr-1" /> Board
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
                            </>
                        )}
                    </div>
                }
            />

            {/* Filter Bar */}
            {showFilterBar && (
                <div className="w-full bg-background/95 backdrop-blur-sm border-b z-30 px-4 py-2 flex justify-between items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <Select value={categoryFilter || "all"} onValueChange={(val) => setCategoryFilter(val === "all" ? null : val)}>
                        <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder={t('stats.filter.all')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('stats.filter.all')}</SelectItem>
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
            )}

            {/* List/Gallery Content */}
            <div className="flex-1 overflow-y-auto w-full">
                {viewMode === 'list' ? (
                    initialLogs.length === 0 && !hasDismissedOnboarding && !categoryFilter ? (
                        <OnboardingGuide onComplete={() => setHasDismissedOnboarding(true)} />
                    ) : (
                        <LogListView
                            logs={filteredLogs}
                            categoryMap={categoryMap}
                            isSelectionMode={isSelectionMode}
                            selectedIds={selectedIds}
                            onToggleSelection={toggleItemSelection}
                        />
                    )
                ) : viewMode === 'gallery' ? (
                    <GalleryView logs={filteredLogs} categoryMap={categoryMap} />
                ) : viewMode === 'feed' ? (
                    <JournalView logs={filteredLogs} categoryMap={categoryMap} />
                ) : viewMode === 'calendar' ? (
                    <CalendarView logs={filteredLogs} categoryMap={categoryMap} />
                ) : viewMode === 'board' ? (
                    <KanbanView logs={filteredLogs} categoryMap={categoryMap} />
                ) : (
                    <LogTableView
                        logs={filteredLogs}
                        categoryMap={categoryMap}
                        isSelectionMode={isSelectionMode}
                        selectedIds={selectedIds}
                        onToggleSelection={toggleItemSelection}
                    />
                )}
            </div>
        </div>
    );
}
