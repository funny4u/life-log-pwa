import React from 'react';
import { Log, Category } from '@/lib/types';
import { format, isToday, isYesterday } from 'date-fns';
import { LogItemRow } from './LogItemRow';

function GroupHeader({ dateStr }: { dateStr: string }) {
    const date = new Date(dateStr);
    let label = format(date, 'MMM d, yyyy');
    if (isToday(date)) label = 'Today';
    if (isYesterday(date)) label = 'Yesterday';

    return (
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 px-4 text-sm font-semibold text-muted-foreground border-b">
            {label}
        </div>
    );
}

interface LogListViewProps {
    logs: Log[];
    categoryMap: Record<string, Category>;
}

export function LogListView({ logs, categoryMap }: LogListViewProps) {
    // Group by date
    const groupedLogs = logs.reduce((acc, log) => {
        const dateKey = log.date; // string YYYY-MM-DD
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(log);
        return acc;
    }, {} as Record<string, Log[]>);

    const dates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (logs.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>No logs yet.</p>
                <p className="text-sm">Click + to add one.</p>
            </div>
        );
    }

    return (
        <div className="pb-4">
            {dates.map((date) => (
                <div key={date}>
                    <GroupHeader dateStr={date} />
                    <div className="divide-y">
                        {groupedLogs[date].map((log) => (
                            <LogItemRow key={log.id} log={log} categoryDef={categoryMap[log.category]} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
