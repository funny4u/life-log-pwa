"use client";

import React, { Suspense } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { LogDrawer } from '@/components/features/LogDrawer';
import { useLogContext } from '@/components/providers/LogProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { NotificationManager } from '@/components/features/NotificationManager';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isDrawerOpen, closeDrawer } = useLogContext();

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden">
            <NotificationManager />
            <main className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden pb-24 scroll-smooth overscroll-contain">
                {children}
            </main>

            <LogDrawer open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()} />
            <BottomNav />
            <Suspense fallback={null}>
                <Sidebar />
            </Suspense>
        </div>
    );
}
