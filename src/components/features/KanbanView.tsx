"use client";

import React from 'react';
import { Log, Category } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useLogContext } from '@/components/providers/LogProvider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface KanbanViewProps {
    logs: Log[];
    categoryMap: Record<string, Category>;
}

export function KanbanView({ logs, categoryMap }: KanbanViewProps) {
    const { t } = useLanguage();
    const { openDrawer } = useLogContext();

    // Group logs by status
    const columns = React.useMemo(() => {
        const cols = {
            backlog: [] as Log[],
            planned: [] as Log[],
            completed: [] as Log[]
        };

        logs.forEach(log => {
            if (log.status === 'Completed') {
                cols.completed.push(log);
            } else if (log.status === 'Planned') {
                cols.planned.push(log);
            } else {
                cols.backlog.push(log);
            }
        });

        return cols;
    }, [logs]);

    const [activeTab, setActiveTab] = React.useState<'backlog' | 'planned' | 'completed'>('backlog');

    const renderCard = (log: Log) => {
        const category = categoryMap[log.category];

        return (
            <div
                key={log.id}
                onClick={() => openDrawer(log)}
                className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 active:scale-95"
            >
                <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                        {category?.name}
                    </span>
                    {log.amount && (
                        <span className={cn("text-xs font-medium", log.amount < 0 ? "text-red-500" : "text-blue-500")}>
                            {log.amount.toLocaleString()}
                        </span>
                    )}
                </div>

                <h4 className="font-medium text-sm line-clamp-2">{log.title}</h4>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{format(parseISO(log.date), 'MMM d')}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full max-w-[100vw]">
            {/* Mobile Tabs */}
            <div className="flex md:hidden p-3 gap-2 bg-background/95 backdrop-blur z-10 sticky top-0 border-b">
                {(['backlog', 'planned', 'completed'] as const).map(tab => {
                    const isActive = activeTab === tab;
                    let count = 0;
                    let label = '';
                    let activeClass = ''; // Explicit highlighting for active state

                    if (tab === 'backlog') {
                        count = columns.backlog.length;
                        label = t('maintenance.backlog');
                        activeClass = 'bg-secondary text-secondary-foreground';
                    } else if (tab === 'planned') {
                        count = columns.planned.length;
                        label = t('maintenance.planned');
                        activeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200';
                    } else {
                        count = columns.completed.length;
                        label = t('maintenance.completed');
                        activeClass = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200';
                    }

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 px-1 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                                isActive
                                    ? cn("shadow-sm", activeClass)
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <span>{label}</span>
                            <Badge variant="secondary" className="px-1.5 h-5 min-w-[1.25rem] text-[10px] bg-background/50">
                                {count}
                            </Badge>
                        </button>
                    )
                })}
            </div>

            {/* Columns Container */}
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                {/* Backlog Column */}
                <div className={cn(
                    "flex-1 flex flex-col gap-3 p-4 min-h-0", // base styles
                    "md:border-r", // desktop separator
                    activeTab === 'backlog' ? "flex" : "hidden md:flex" // visibility logic
                )}>
                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <Circle className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{t('maintenance.backlog')}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{columns.backlog.length}</Badge>
                    </div>
                    <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pb-24 md:pb-4 scrollbar-hide">
                        {columns.backlog.map(renderCard)}
                    </div>
                </div>

                {/* Planned Column */}
                <div className={cn(
                    "flex-1 flex flex-col gap-3 p-4 min-h-0",
                    "md:border-r",
                    activeTab === 'planned' ? "flex" : "hidden md:flex"
                )}>
                    <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg sticky top-0 z-10 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-sm">{t('maintenance.planned')}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{columns.planned.length}</Badge>
                    </div>
                    <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pb-24 md:pb-4 scrollbar-hide">
                        {columns.planned.map(renderCard)}
                    </div>
                </div>

                {/* Completed Column */}
                <div className={cn(
                    "flex-1 flex flex-col gap-3 p-4 min-h-0",
                    activeTab === 'completed' ? "flex" : "hidden md:flex"
                )}>
                    <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg sticky top-0 z-10 dark:bg-green-900/20">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-sm">{t('maintenance.completed')}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{columns.completed.length}</Badge>
                    </div>
                    <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pb-24 md:pb-4 scrollbar-hide">
                        {columns.completed.map(renderCard)}
                    </div>
                </div>
            </div>
        </div>
    );
}
