"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, PieChart, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLayoutContext } from '@/components/providers/LayoutProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Sidebar() {
    const { isSidebarOpen, closeSidebar } = useLayoutContext();
    const pathname = usePathname();

    const menuItems = [
        { label: 'Calendar', href: '/calendar', icon: Calendar },
        { label: 'Stats', href: '/stats', icon: PieChart },
        { label: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <Sheet open={isSidebarOpen} onOpenChange={(open) => !open && closeSidebar()}>
            <SheetContent side="left" className="w-[80%] sm:w-[300px] p-0 flex flex-col h-full">
                <SheetHeader className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            {/* Placeholder Avatar */}
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <SheetTitle className="text-lg">My Life Log</SheetTitle>
                            <p className="text-xs text-muted-foreground">Keep track of everything</p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 py-6 px-3">
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href === '/calendar' && pathname === '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t pb-safe">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground text-sm gap-3">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
