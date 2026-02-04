"use client";

import React from 'react';
import { Plus, Search, Calendar, PieChart, Settings, LayoutGrid } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useLayoutContext } from '@/components/providers/LayoutProvider';
import { useLogContext } from '@/components/providers/LogProvider';
import { cn } from '@/lib/utils';

import { useLanguage } from '@/components/providers/LanguageProvider';

export function BottomNav() {
    const { } = useLayoutContext();
    const { openDrawer } = useLogContext();
    const { t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { label: t('nav.home'), icon: LayoutGrid, href: '/', action: () => router.push('/') },
        { label: t('nav.stats'), icon: PieChart, href: '/stats', action: () => router.push('/stats') },
        { label: t('nav.add'), icon: Plus, isAction: true, action: () => openDrawer() },
        { label: t('nav.search'), icon: Search, href: '/search', action: () => router.push('/search') },
        { label: t('nav.settings'), icon: Settings, href: '/settings', action: () => router.push('/settings') },
    ];

    return (
        <div className="fixed bottom-0 w-full bg-background/80 backdrop-blur-md border-t z-50 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center h-14 px-2 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = item.href && pathname === item.href;
                    const Icon = item.icon;

                    if (item.isAction) {
                        return (
                            <button
                                key="add-btn"
                                onClick={item.action}
                                className="flex flex-col items-center justify-center -mt-6 bg-primary text-primary-foreground h-12 w-12 rounded-full shadow-lg active:scale-95 transition-transform"
                                aria-label={item.label}
                            >
                                <Plus className="w-7 h-7" />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
