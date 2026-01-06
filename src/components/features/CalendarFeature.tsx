"use client";

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Log, LogCategory } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    Utensils,
    Car,
    MapPin,
    ShoppingBag,
    Calendar as CalendarIcon
} from 'lucide-react';

const categoryColors: Record<LogCategory, string> = {
    'Cooking/Meal': 'bg-orange-500',
    'Car/Maintenance': 'bg-blue-500',
    'Visit/Place': 'bg-green-500',
    'Shopping/Expense': 'bg-red-500',
    'Schedule': 'bg-purple-500',
};

const categoryIcons: Record<LogCategory, React.ElementType> = {
    'Cooking/Meal': Utensils,
    'Car/Maintenance': Car,
    'Visit/Place': MapPin,
    'Shopping/Expense': ShoppingBag,
    'Schedule': CalendarIcon,
};

export function CalendarFeature({ logs }: { logs: Log[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Group logs by date
    const logsByDate = logs.reduce((acc, log) => {
        if (!acc[log.date]) acc[log.date] = new Set();
        acc[log.date].add(log.category);
        return acc;
    }, {} as Record<string, Set<LogCategory>>);

    const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';
    const selectedDateLogs = logs.filter(log => log.date === selectedDateStr);

    return (
        <div className="p-4 flex-1 overflow-y-auto w-full pb-24">
            <div className="flex justify-center mb-6">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm bg-card"
                    components={{
                        DayButton: (props) => {
                            const { day, ...rest } = props;
                            // Check for logs
                            const dateStr = format(day.date, 'yyyy-MM-dd');
                            const categories = logsByDate[dateStr];

                            return (
                                <div className="relative w-full h-full p-0">
                                    <button
                                        {...rest}
                                        className={cn(rest.className, "w-full h-full relative z-10")}
                                        onClick={rest.onClick} // Ensure click works
                                    >
                                        {props.children}
                                    </button>
                                    {categories && (
                                        <div className="absolute bottom-1 left-0 right-0 flex gap-0.5 justify-center z-0 pointer-events-none">
                                            {Array.from(categories).slice(0, 3).map((cat, i) => (
                                                <div key={i} className={cn("w-1 h-1 rounded-full", categoryColors[cat])} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    }}
                />
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg px-1">
                    {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
                </h3>

                {selectedDateLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                        No activity recorded.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {selectedDateLogs.map((log) => {
                            const Icon = categoryIcons[log.category];
                            return (
                                <div key={log.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border shadow-sm">
                                    <div className={cn("p-2 rounded-full", categoryColors[log.category].replace('bg-', 'bg-opacity-20 text-').replace('text-', 'bg-').replace('500', '100 text-current'))}>
                                        {/* Hacky color replacement for lighter bg */}
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{log.title}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{log.category}</Badge>
                                            {log.amount && <span className="text-xs font-semibold">${log.amount}</span>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
