"use client";

import React from 'react';
import { BottomNav } from './BottomNav';
// import { FAB } from './FAB'; // Removed in favor of BottomNav Add button
import { LogDrawer } from '../features/LogDrawer';
import { LogProvider, useLogContext } from '@/components/providers/LogProvider';
import { LayoutProvider } from '@/components/providers/LayoutProvider';
import { Sidebar } from './Sidebar';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const { isDrawerOpen, closeDrawer } = useLogContext();

    return (
        <div className="flex flex-col h-full w-full bg-background relative">
            <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden pb-24 scroll-smooth">
                {/* pb-24 ensures content isn't hidden behind BottomNav */}
                {children}
            </main>

            <LogDrawer open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()} />
            <BottomNav />
            <Sidebar />
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
