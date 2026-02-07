"use client";

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
// import { FAB } from './FAB'; // Removed in favor of BottomNav Add button
import { LogDrawer } from '../features/LogDrawer';
import { LogProvider, useLogContext } from '@/components/providers/LogProvider';
import { LayoutProvider } from '@/components/providers/LayoutProvider';
import { Sidebar } from './Sidebar';
import { NotificationManager } from '../features/NotificationManager';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const { isDrawerOpen, closeDrawer } = useLogContext();
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/auth');

    if (isAuthPage) {
        return (
            <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden">
                <NotificationManager />
                <main className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden">
            <NotificationManager />
            <main className="flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden pb-24 scroll-smooth overscroll-contain">
                {/* pb-24 ensures content isn't hidden behind BottomNav */}
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

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutProvider>
            <LogProvider>
                <ClientLayoutContent>{children}</ClientLayoutContent>
            </LogProvider>
        </LayoutProvider>
    );
}
