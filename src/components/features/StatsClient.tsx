"use client";

import React, { useMemo } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Log, Category } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { TrendingUp, FileText, DollarSign, Activity } from 'lucide-react';

interface StatsClientProps {
    logs: Log[];
    categories: Category[];
}

export function StatsClient({ logs, categories }: StatsClientProps) {

    // Filter for current month
    const currentMonthLogs = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        return logs.filter(log => {
            const logDate = new Date(log.date);
            return isWithinInterval(logDate, { start, end });
        });
    }, [logs]);

    // KPI Calculations
    const totalLogs = currentMonthLogs.length;
    const totalExpenses = currentMonthLogs.reduce((sum, log) => sum + (log.amount || 0), 0);

    // Chart Data: Logs by Category
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        currentMonthLogs.forEach(log => {
            counts[log.category] = (counts[log.category] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => {
                const cat = categories.find(c => c.name === name);
                return { name, value, color: cat?.color || '#94A3B8' };
            })
            .sort((a, b) => b.value - a.value);
    }, [currentMonthLogs, categories]);

    // Format Currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    return (
        <div className="flex flex-col h-full w-full bg-muted/10">
            <TopBar title="Statistics" />

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">This Month</h2>
                    <span className="text-sm text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <div className="p-2 bg-primary/10 rounded-full mb-2">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-2xl font-bold">{totalLogs}</span>
                            <span className="text-xs text-muted-foreground">Total Logs</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <div className="p-2 bg-green-500/10 rounded-full mb-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold">{formatCurrency(totalExpenses)}</span>
                            <span className="text-xs text-muted-foreground">Expenses</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base">Activity by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px]">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: any) => [value, 'Logs']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                No data for this month
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
