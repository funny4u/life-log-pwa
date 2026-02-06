"use client";

import React from 'react';
import { Log, Category } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useLogContext } from '@/components/providers/LogProvider';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface JournalViewProps {
    logs: Log[];
    categoryMap: Record<string, Category>;
}

export function JournalView({ logs, categoryMap }: JournalViewProps) {
    const { openDrawer } = useLogContext();
    const { t } = useLanguage();

    if (logs.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>No journal entries yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-3 pb-24 max-w-2xl mx-auto">
            {logs.map((log) => {
                const category = categoryMap[log.category];
                const color = category?.color || '#94A3B8';
                const date = parseISO(log.date);

                return (
                    <div
                        key={log.id}
                        className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-1.5 min-w-[45px]">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{format(date, 'MMM')}</span>
                                    <span className="text-lg font-bold leading-none">{format(date, 'dd')}</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-base line-clamp-1">{log.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{log.start_time || t('common.day')}</span>
                                        </div>
                                        <span>•</span>
                                        <Badge
                                            variant="secondary"
                                            className="h-4 px-1 font-normal text-[10px]"
                                            style={{ color: color, backgroundColor: `${color}15` }}
                                        >
                                            {log.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl hidden">
                                {log.emoji}
                            </div>
                        </div>

                        {/* Image (if exists) */}
                        {log.image_url && (
                            <div
                                className="w-full bg-muted/20 cursor-pointer flex justify-center bg-black/5"
                                onClick={() => openDrawer(log)}
                            >
                                <img
                                    src={log.image_url}
                                    alt={log.title}
                                    className="object-contain max-h-[300px] w-auto max-w-[300px]"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="p-3 pt-2 flex flex-col gap-2 cursor-pointer"
                            onClick={() => openDrawer(log)}
                        >
                            {log.memo && (
                                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed line-clamp-6">
                                    {log.memo}
                                </p>
                            )}

                            {/* Tags or Custom Fields - Displaying a few key ones could be nice here */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
