"use client";

import React from 'react';
import { Log, LogCategory } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categoryColors: Record<LogCategory, string> = {
    'Cooking/Meal': '#f97316', // orange-500
    'Car/Maintenance': '#3b82f6', // blue-500
    'Visit/Place': '#22c55e', // green-500
    'Shopping/Expense': '#ef4444', // red-500
    'Schedule': '#a855f7', // purple-500
};

export function StatsChart({ logs }: { logs: Log[] }) {
    // Filter for current month
    const now = new Date();
    const currentMonthLogs = logs.filter(log =>
        isWithinInterval(new Date(log.date), {
            start: startOfMonth(now),
            end: endOfMonth(now)
        })
    );

    // Aggregate data
    const dataMap = currentMonthLogs.reduce((acc, log) => {
        if (log.amount) {
            acc[log.category] = (acc[log.category] || 0) + log.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(dataMap).map(([name, value]) => ({
        name,
        value,
        color: categoryColors[name as LogCategory]
    })).sort((a, b) => b.value - a.value);

    const totalExpense = data.reduce((acc, item) => acc + item.value, 0);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-4 text-center">
                <p>No expense data for this month.</p>
                <p className="text-sm">Add expenses to see stats.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Total Expenses (This Month)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalExpense)}
                    </div>
                </CardContent>
            </Card>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid gap-3 pt-4">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="font-semibold text-sm">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
