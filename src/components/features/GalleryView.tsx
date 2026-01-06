"use client";

import React from 'react';
import { Log, Category } from '@/lib/types';
import { format } from 'date-fns';
import { useLogContext } from '@/components/providers/LogProvider';
import { Badge } from '@/components/ui/badge';

interface GalleryViewProps {
    logs: Log[];
    categoryMap: Record<string, Category>;
}

export function GalleryView({ logs, categoryMap }: GalleryViewProps) {
    const { openDrawer } = useLogContext();

    if (logs.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>No logs yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 p-4 pb-24">
            {logs.map((log) => {
                const category = categoryMap[log.category];
                const color = category?.color || '#94A3B8';

                return (
                    <div
                        key={log.id}
                        onClick={() => openDrawer(log)}
                        className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md active:scale-95 cursor-pointer"
                    >
                        {/* Image or Placeholder */}
                        <div className="aspect-square w-full bg-muted/30 relative flex items-center justify-center overflow-hidden">
                            {log.image_url ? (
                                <img
                                    src={log.image_url}
                                    alt={log.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <span className="text-4xl select-none">{log.emoji || category?.icon || '📝'}</span>
                            )}

                            {/* Overlay Badge */}
                            <div className="absolute top-2 right-2">
                                <Badge
                                    className="shadow-sm border-0"
                                    style={{ backgroundColor: color, color: '#fff' }}
                                >
                                    {log.category}
                                </Badge>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 flex flex-col gap-1">
                            <h3 className="font-semibold leading-tight line-clamp-1">{log.title}</h3>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>{format(new Date(log.date), 'MM/dd')}</span>
                                {log.amount && <span className="font-medium text-foreground">${log.amount}</span>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
