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
import { cn } from '@/lib/utils';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    const { isDrawerOpen, closeDrawer } = useLogContext();
    const pathname = usePathname();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Robust check for auth-related pages (login, signup, callback etc)
    const isAuthPage = pathname ? /^\/(login|auth|signup)/.test(pathname) : false;

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden">
            <NotificationManager />
            <main className={cn(
                "flex-1 w-full min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain",
                !isAuthPage && "pb-24"
            )}>
                {children}
            </main>

            {mounted && !isAuthPage && (
                <>
                    <LogDrawer open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()} />
                    <BottomNav />
                    <Suspense fallback={null}>
                        <Sidebar />
                    </Suspense>
                </>
            )}
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
