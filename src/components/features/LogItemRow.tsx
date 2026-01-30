"use client";

import React from 'react';
import { Log, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useLogContext } from '@/components/providers/LogProvider';

interface LogItemRowProps {
    log: Log;
    categoryDef?: Category;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (id: string) => void;
}

export function LogItemRow({ log, categoryDef, isSelectionMode, isSelected, onToggleSelection }: LogItemRowProps) {
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

    const handleClick = (e: React.MouseEvent) => {
        if (isSelectionMode && onToggleSelection) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelection(log.id);
        } else {
            openDrawer(log);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "flex items-center gap-3 py-3 px-4 bg-background transition-colors cursor-pointer",
                isSelectionMode && "hover:bg-muted/50",
                !isSelectionMode && "active:bg-muted/30"
            )}
        >
            {isSelectionMode && (
                <div className="flex-shrink-0 mr-1">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection?.(log.id)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0")}
                style={{ backgroundColor: color + '20', color: color }}
            >
                {displayEmoji}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <p className="font-medium truncate pr-2 leading-tight">{log.title}</p>
                    {log.amount && <span className="font-semibold text-primary whitespace-nowrap text-sm">${log.amount}</span>}
                </div>
                <div className="flex flex-wrap gap-2 items-center mt-1">
                    <span className="text-[10px] uppercase font-medium tracking-wide opacity-70" style={{ color: color }}>
                        {log.category}
                    </span>
                    {/* Separator dot */}
                    {timeString && (
                        <>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{timeString}</span>
                        </>
                    )}
                </div>
                {log.memo && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{log.memo}</p>}
            </div>
        </div>
    );
}
