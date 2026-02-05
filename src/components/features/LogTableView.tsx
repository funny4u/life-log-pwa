"use client";

import React from 'react';
import { Log, Category } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface LogTableViewProps {
    logs: Log[];
    categoryMap: Record<string, Category>;
    isSelectionMode: boolean;
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
}

export function LogTableView({
    logs,
    categoryMap,
    isSelectionMode,
    selectedIds,
    onToggleSelection
}: LogTableViewProps) {
    const { t } = useLanguage();

    // Group logs by Date like in List View? Or just flat table?
    // For a "Ledger" feel, a flat table sorted by date is usually better, but date headers are nice.
    // Let's stick to a flat table for maximum density, as requested "Table/Ledger View".

    return (
        <div className="w-full max-w-[100vw] overflow-x-auto pb-20">
            <table className="w-full text-sm text-left border-collapse table-fixed">
                <thead className="bg-muted/50 text-muted-foreground font-medium sticky top-0 z-10">
                    <tr>
                        {isSelectionMode && (
                            <th className="p-2 md:p-3 w-8 md:w-10 text-center">
                                {/* Header Checkbox could go here if we implemented select all */}
                            </th>
                        )}
                        <th className="p-2 md:p-3 w-[50px] md:w-24">{t('fields.date')}</th>
                        <th className="p-2 md:p-3 w-[70px] md:w-24">{t('fields.category')}</th>
                        <th className="p-2 md:p-3 w-auto">{t('fields.title')}</th>
                        <th className="p-2 md:p-3 w-[85px] md:w-28 text-right header-amount">{t('fields.amount')}</th>
                        <th className="p-3 min-w-[100px] hidden md:table-cell">{t('fields.note')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                {t('search.noResults', { query: '' }).replace(/".*"/, '')}
                            </td>
                        </tr>
                    ) : (
                        logs.map(log => {
                            const category = categoryMap[log.category];
                            const isSelected = selectedIds.has(log.id);
                            const amount = log.amount || 0;
                            const isIncome = amount > 0;

                            return (
                                <tr
                                    key={log.id}
                                    className={cn(
                                        "hover:bg-muted/30 transition-colors group",
                                        isSelected && "bg-muted relative"
                                    )}
                                    onClick={() => isSelectionMode && onToggleSelection(log.id)}
                                >
                                    {isSelectionMode && (
                                        <td className="p-2 md:p-3 text-center">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onToggleSelection(log.id)}
                                            />
                                        </td>
                                    )}
                                    <td className="p-2 md:p-3 whitespace-nowrap text-muted-foreground font-medium align-top">
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs md:text-sm">{format(parseISO(log.date), 'MM-dd')}</span>
                                            {log.start_time && (
                                                <span className="text-[10px] opacity-70 hidden md:inline">{log.start_time}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 md:p-3 whitespace-nowrap align-middle">
                                        <div className="flex flex-col md:flex-row md:items-center gap-1.5">
                                            <div
                                                className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: category?.color || '#94A3B8' }}
                                            />
                                            <span className="truncate text-xs md:text-sm max-w-[60px] md:max-w-[80px] block">{log.category}</span>
                                        </div>
                                    </td>
                                    <td className="p-2 md:p-3 font-medium text-foreground align-middle">
                                        <div className="truncate text-sm w-full">
                                            {log.title}
                                        </div>
                                    </td>
                                    <td className="p-2 md:p-3 text-right font-semibold whitespace-nowrap align-middle">
                                        {amount !== 0 ? (
                                            <span className={cn(
                                                "text-xs md:text-sm",
                                                isIncome ? "text-blue-600" : "text-red-500"
                                            )}>
                                                {amount > 0 ? '+' : ''}{amount.toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/30">-</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate align-middle">
                                        {log.memo}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
