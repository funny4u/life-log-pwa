"use client";

import React from 'react';
import { Log, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLogContext } from '@/components/providers/LogProvider';

export function LogItemRow({ log, categoryDef }: { log: Log; categoryDef?: Category }) {
    const { openDrawer } = useLogContext();

    // Fallback if category definition missing
    const color = categoryDef?.color || '#94A3B8';
    const iconChar = categoryDef?.icon || '🏷️'; // Default icon

    // Use the emoji from the log if set, otherwise the category icon
    const displayEmoji = log.emoji || iconChar;

    // Format time if available
    const timeString = log.start_time ? (
        log.end_time ? `${log.start_time} - ${log.end_time}` : log.start_time
    ) : null;

    return (
        <div
            onClick={() => openDrawer(log)}
            className="flex items-center gap-3 p-3 bg-card rounded-lg border shadow-sm cursor-pointer active:scale-[0.98] transition-all hover:bg-muted/50"
        >
            <div
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm")}
                style={{ backgroundColor: color + '33', color: color }} // 20% opacity using hex alpha approximation (33 is ~20%) - wait hex alpha might not work on all browsers but usually fine. Better to use style for bg.
            >
                {displayEmoji}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <p className="font-medium truncate pr-2">{log.title}</p>
                    {log.amount && <span className="font-semibold text-primary whitespace-nowrap">${log.amount}</span>}
                </div>
                <div className="flex flex-wrap gap-2 items-center mt-1">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-background/50" style={{ borderColor: color, color: color }}>
                        {log.category}
                    </Badge>
                    {timeString && <span className="text-xs text-muted-foreground">{timeString}</span>}
                </div>
                {log.memo && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{log.memo}</p>}
            </div>
        </div>
    );
}
