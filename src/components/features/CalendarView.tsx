"use client";

import React, { useState } from 'react';
import { Log, Category } from '@/lib/types';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isWithinInterval
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLogContext } from '@/components/providers/LogProvider';

interface CalendarViewProps {
    logs: Log[];
    categoryMap: Record<string, Category>;
}

export function CalendarView({ logs, categoryMap }: CalendarViewProps) {
    const { openDrawer } = useLogContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calculate logs that affect the current month view (ranges)
    const renderData = React.useMemo(() => {
        const dayMap: Record<string, { dots: Log[], bars: Log[] }> = {};

        // Prepare map
        daysInMonth.forEach(day => {
            dayMap[day.toISOString()] = { dots: [], bars: [] };
        });

        logs.forEach(log => {
            // Safe parse dates
            const startDate = parseISO(log.date);
            const endDate = log.end_date ? parseISO(log.end_date) : null;

            if (endDate && endDate >= startDate && log.end_date !== log.date) {
                // Range Logic
                // Naive implementation: check every day in current view
                daysInMonth.forEach(day => {
                    // Check intersection
                    if (isWithinInterval(day, { start: startDate, end: endDate })) {
                        dayMap[day.toISOString()]?.bars.push(log);
                    }
                });
            } else {
                // Single Point Logic (Dot)
                // Need to find exactly matching day string
                const matchDay = daysInMonth.find(d => isSameDay(d, startDate));
                if (matchDay) {
                    dayMap[matchDay.toISOString()]?.dots.push(log);
                }
            }
        });

        return dayMap;
    }, [logs, daysInMonth]); // Correct dependency on daysInMonth

    const selectedDateLogs = logs.filter(log => {
        const start = parseISO(log.date);
        const end = log.end_date ? parseISO(log.end_date) : start;
        return isWithinInterval(selectedDate, { start, end });
    });

    // Helper to generate distinct colors from string
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 60%)`;
    };

    return (
        <div className="flex flex-col h-full gap-4 p-4 pb-24 max-w-lg mx-auto w-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs text-muted-foreground font-medium py-2">
                        {day}
                    </div>
                ))}
                {daysInMonth.map((day, i) => {
                    const data = renderData[day.toISOString()] || { dots: [], bars: [] };
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());

                    // Sort bars to be deterministic? (For stacking visual)
                    // Simplified: just render bars

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-start py-1 cursor-pointer rounded-lg transition-colors relative overflow-hidden",
                                !isCurrentMonth && "opacity-30",
                                isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted",
                                isToday && !isSelected && "border border-primary text-primary"
                            )}
                        >
                            <span className={cn("text-sm font-medium z-10", isSelected && "font-bold")}>{format(day, 'd')}</span>

                            {/* Bars Layer (Behind dots) */}
                            <div className="absolute inset-0 top-6 px-0.5 flex flex-col gap-[2px]">
                                {data.bars.slice(0, 3).map(log => {
                                    const isStart = isSameDay(day, parseISO(log.date));
                                    const endD = log.end_date ? parseISO(log.end_date) : new Date();
                                    const isEnd = isSameDay(day, endD);

                                    return (
                                        <div
                                            key={log.id}
                                            className={cn(
                                                "h-1.5 w-full opacity-60",
                                                isStart && "rounded-l-sm ml-[2px]",
                                                isEnd && "rounded-r-sm mr-[2px]",
                                                !isStart && !isEnd && "rounded-none scale-x-[1.1]", // visual overlap
                                            )}
                                            style={{ backgroundColor: stringToColor(log.title) }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Dots for single events */}
                            <div className="absolute bottom-1 flex gap-0.5 flex-wrap justify-center px-1 z-10 bg-transparent">
                                {data.dots.slice(0, 4).map((log, idx) => (
                                    <div
                                        key={log.id}
                                        className="w-1 h-1 rounded-full shadow-sm"
                                        style={{
                                            backgroundColor: categoryMap[log.category]?.color || '#94A3B8'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="h-px bg-border my-2" />

            {/* Selected Date List (Enhanced for Range) */}
            <div className="flex flex-col gap-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                    {format(selectedDate, 'EEEE, MMMM do')}
                </h3>
                {selectedDateLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No plans or logs for this day.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {selectedDateLogs.map(log => {
                            const isRange = log.end_date && log.end_date !== log.date;
                            return (
                                <div
                                    key={log.id}
                                    onClick={() => openDrawer(log)}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <div
                                        className="w-1 h-8 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: isRange ? stringToColor(log.title) : (categoryMap[log.category]?.color || '#94A3B8') }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate">{log.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {isRange ? (
                                                <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400">
                                                    {format(parseISO(log.date), 'MM/dd')}
                                                    {' '}-{' '}
                                                    {format(parseISO(log.end_date!), 'MM/dd')}
                                                </span>
                                            ) : (
                                                log.start_time && <span>{log.start_time}</span>
                                            )}
                                            <span>{log.category}</span>
                                        </div>
                                    </div>
                                    {log.amount !== null && log.amount !== undefined && (
                                        <div className="text-right px-2">
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                log.amount > 0 ? "text-blue-600" : "text-red-500"
                                            )}>
                                                {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {log.status === 'Completed' && (
                                        <span className="text-xs text-green-600 font-medium">Done</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
