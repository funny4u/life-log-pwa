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
        <div className="flex h-full max-w-[100vw] overflow-x-auto gap-4 p-4 pb-24 snap-x snap-mandatory">
            {/* Backlog Column */}
            <div className="flex-none w-[80vw] md:w-80 flex flex-col gap-3 snap-center">
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg sticky top-0">
                    <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{t('maintenance.backlog')}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{columns.backlog.length}</Badge>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pb-4">
                    {columns.backlog.map(renderCard)}
                </div>
            </div>

            {/* Planned Column */}
            <div className="flex-none w-[80vw] md:w-80 flex flex-col gap-3 snap-center">
                <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg sticky top-0">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm">{t('maintenance.planned')}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{columns.planned.length}</Badge>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pb-4">
                    {columns.planned.map(renderCard)}
                </div>
            </div>

            {/* Completed Column */}
            <div className="flex-none w-[80vw] md:w-80 flex flex-col gap-3 snap-center">
                <div className="flex items-center justify-between bg-green-50/50 p-2 rounded-lg sticky top-0">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm">{t('maintenance.completed')}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{columns.completed.length}</Badge>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pb-4">
                    {columns.completed.map(renderCard)}
                </div>
            </div>
        </div>
    );
}
