"use client";

import React, { useMemo, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Log, Category } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    format,
    startOfMonth,
    endOfMonth,
    isWithinInterval,
    startOfWeek,
    endOfWeek,
    startOfYear,
    eachDayOfInterval,
    eachMonthOfInterval,
    isSameDay,
    isSameMonth,
    parseISO
} from 'date-fns';
import { FileText, DollarSign, TrendingUp, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface StatsClientProps {
    logs: Log[];
    categories: Category[];
}

type TimeRange = 'week' | 'month' | 'year';
type ViewType = 'count' | 'amount';

export function StatsClient({ logs, categories }: StatsClientProps) {
    const { t } = useLanguage();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [viewType, setViewType] = useState<ViewType>('amount');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Get filtered logs based on timeRange and selectedCategory
    const dateRange = useMemo(() => {
        const referenceDate = new Date();
        switch (timeRange) {
            case 'week':
                return { start: startOfWeek(referenceDate), end: endOfWeek(referenceDate) };
            case 'month':
                return { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
            case 'year':
                return { start: startOfYear(referenceDate), end: referenceDate };
        }
    }, [timeRange]);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const logDate = parseISO(log.date);
            const isInRange = isWithinInterval(logDate, dateRange);
            const isSelectedCat = selectedCategory === 'all' || log.category === selectedCategory;


            // Search filter - includes title, memo, and custom field values
            let matchesSearch = searchQuery.trim() === '' ||
                log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.memo || '').toLowerCase().includes(searchQuery.toLowerCase());

            // Also search through custom field values
            if (!matchesSearch && log.custom_data && searchQuery.trim() !== '') {
                const customValues = Object.values(log.custom_data);
                matchesSearch = customValues.some(value => {
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(searchQuery.toLowerCase());
                });
            }

            return isInRange && isSelectedCat && matchesSearch;
        });
    }, [logs, dateRange, selectedCategory, searchQuery]);

    // 2. Trend Data Aggregation
    const trendData = useMemo(() => {
        let intervals: Date[] = [];
        if (timeRange === 'week') {
            intervals = eachDayOfInterval(dateRange);
        } else if (timeRange === 'month') {
            intervals = eachDayOfInterval(dateRange);
        } else {
            intervals = eachMonthOfInterval(dateRange);
        }

        return intervals.map(date => {
            const bucketLogs = filteredLogs.filter(log => {
                const logDate = parseISO(log.date);
                return timeRange === 'year'
                    ? isSameMonth(logDate, date)
                    : isSameDay(logDate, date);
            });

            const value = viewType === 'count'
                ? bucketLogs.length
                : bucketLogs.reduce((sum, l) => sum + (l.amount || 0), 0);

            return {
                label: timeRange === 'year' ? format(date, 'MMM') : format(date, 'd'),
                fullLabel: format(date, 'MMM d'),
                value: value
            };
        });
    }, [filteredLogs, timeRange, viewType, dateRange]);

    // 3. Distribution Data (Pie Chart)
    const distributionData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredLogs.forEach(log => {
            const val = viewType === 'count' ? 1 : (log.amount || 0);
            counts[log.category] = (counts[log.category] || 0) + val;
        });

        return Object.entries(counts)
            .map(([name, value]) => {
                const cat = categories.find(c => c.name === name);
                return { name, value, color: cat?.color || '#94A3B8' };
            })
            .sort((a, b) => b.value - a.value)
            .filter(d => Math.abs(d.value) > 0);
    }, [filteredLogs, categories, viewType]);

    // KPIs
    const totalCount = filteredLogs.length;
    const totalAmount = filteredLogs.reduce((sum, log) => sum + (log.amount || 0), 0);

    const formatValue = (val: number) => {
        if (viewType === 'amount') {
            return new Intl.NumberFormat(t('common.locale'), { style: 'currency', currency: t('common.currency'), signDisplay: 'always' }).format(val);
        }
        return val.toString();
    };

    return (
        <div className="flex flex-col h-full w-full bg-muted/10">
            <TopBar title={t('stats.title')} />

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
                {/* Selectors */}
                <div className="space-y-4">
                    <div className="flex bg-muted/50 p-1 rounded-lg">
                        {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all",
                                    timeRange === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {t(`stats.periods.${r}` as any)}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={t('stats.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-background/50 border-muted-foreground/20 focus:bg-background transition-colors"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
                            <SelectTrigger className="flex-1 h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="amount">{t('stats.views.amount')}</SelectItem>
                                <SelectItem value="count">{t('stats.views.count')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="flex-1 h-10">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 opacity-50" />
                                    <SelectValue placeholder={t('stats.filter.all')} />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('stats.filter.all')}</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <FileText className="w-4 h-4 text-primary mb-1 opacity-60" />
                            <span className="text-2xl font-bold">{totalCount}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t('stats.kpis.entries')}</span>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-green-500/5 to-green-500/10">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <DollarSign className="w-4 h-4 text-green-600 mb-1 opacity-60" />
                            <span className={cn(
                                "text-2xl font-bold truncate w-full",
                                totalAmount > 0 ? "text-blue-600" : totalAmount < 0 ? "text-red-600" : ""
                            )}>
                                {new Intl.NumberFormat(t('common.locale'), { notation: 'compact', maximumFractionDigits: 1 }).format(totalAmount)}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t('stats.kpis.netBalance')}</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Trend Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            {viewType === 'amount' ? t('stats.charts.trendFinancial') : t('stats.charts.trendActivity')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] p-2 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={10}
                                    tick={{ fill: '#64748B' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={10}
                                    tick={{ fill: '#64748B' }}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-background border rounded-lg p-2 shadow-lg text-[10px]">
                                                    <p className="font-bold border-b pb-1 mb-1">{data.fullLabel}</p>
                                                    <p className={cn(
                                                        "font-medium",
                                                        viewType === 'amount' && data.value > 0 ? "text-blue-600" : viewType === 'amount' && data.value < 0 ? "text-red-600" : "text-primary"
                                                    )}>
                                                        {formatValue(data.value)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[4, 4, 0, 0]}
                                    fill="hsl(var(--primary))"
                                >
                                    {trendData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={viewType === 'amount' ? (entry.value >= 0 ? '#3b82f6' : '#ef4444') : 'hsl(var(--primary))'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">{t('stats.charts.distribution')}</CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-[250px] flex flex-col">
                        {distributionData.length > 0 ? (
                            <>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value: number | string | (number | string)[] | undefined) => {
                                                    if (value === undefined) return ['', ''];
                                                    const val = Array.isArray(value) ? Number(value[0]) : Number(value);
                                                    return [formatValue(val), viewType === 'amount' ? 'Amount' : 'Count'];
                                                }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                                    {distributionData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between text-[11px]">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            <span className="font-semibold">{formatValue(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                                {t('stats.charts.noData')}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
