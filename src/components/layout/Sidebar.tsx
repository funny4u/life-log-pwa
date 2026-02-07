"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Calendar, PieChart, Settings, LogOut, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLayoutContext } from '@/components/providers/LayoutProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/components/providers/LanguageProvider';

import { createClient } from '@/lib/supabase/client';

export function Sidebar() {
    const { isSidebarOpen, closeSidebar } = useLayoutContext();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const { t } = useLanguage();

    // Profile State
    const [email, setEmail] = useState<string | null>(null);
    const [appTitle, setAppTitle] = useState('My Life Log');
    const [appTagline, setAppTagline] = useState('Keep track of everything');

    // Category State
    const [categories, setCategories] = useState<any[]>([]);
    const currentCategory = searchParams.get('category');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || null);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('app_title, app_tagline')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    if (profile.app_title) setAppTitle(profile.app_title);
                    if (profile.app_tagline) setAppTagline(profile.app_tagline);
                }
            }
        };

        const fetchCategoriesData = async () => {
            // We can reuse the server action or fetch client-side
            // Importing getCategories from actions might work if it's a server action
            // But let's use client-side supabase for valid RLS
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (data) {
                setCategories(data);
            }
        };

        if (isSidebarOpen) {
            fetchProfile();
            fetchCategoriesData();
        }
    }, [isSidebarOpen]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
        closeSidebar();
    };

    const handleCategoryClick = (categoryName: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoryName) {
            params.set('category', categoryName);
        } else {
            params.delete('category');
        }
        router.push(`/?${params.toString()}`);
        closeSidebar();
    };

    const menuItems = [
        { label: t('nav.home'), href: '/', icon: Calendar },
        { label: t('nav.stats'), href: '/stats', icon: PieChart },
        { label: t('nav.settings'), href: '/settings', icon: Settings },
    ];

    return (
        <Sheet open={isSidebarOpen} onOpenChange={(open) => !open && closeSidebar()}>
            <SheetContent side="left" className="w-[80%] sm:w-[300px] p-0 flex flex-col h-full hidden-scrollbar">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                {/* Custom Header Area */}
                <div className="p-6 pb-4 border-b bg-muted/20 relative">
                    <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 rounded-full" onClick={closeSidebar}>
                        <Settings className="w-4 h-4 opacity-0" /> {/* Hack for spacing if needed, or just X */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="sr-only">Close</span>
                            {/* We can use standard close button or custom X */}
                        </div>
                    </Button>

                    <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {email ? email[0].toUpperCase() : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <h2 className="text-lg font-bold truncate leading-none mb-1">{appTitle}</h2>
                            <p className="text-xs text-muted-foreground truncate">{appTagline}</p>
                        </div>
                    </div>
                    {email && (
                        <div className="px-1">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Signed in as</p>
                            <p className="text-xs text-primary font-medium truncate">{email}</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 py-4 px-3 overflow-y-auto">
                    <nav className="space-y-1">
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Categories
                        </div>

                        {/* All Categories Option */}
                        <Button
                            variant="ghost"
                            onClick={() => handleCategoryClick(null)}
                            className={cn(
                                "w-full justify-start gap-3 px-3 py-2.5 mb-1 text-sm font-medium transition-colors",
                                !currentCategory
                                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className={cn("w-5 h-5", !currentCategory ? "text-primary-foreground" : "text-muted-foreground")} />
                            {t('stats.filter.all')}
                        </Button>

                        {categories.map((cat) => {
                            const isActive = currentCategory === cat.name;
                            return (
                                <Button
                                    key={cat.id}
                                    variant="ghost"
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className={cn(
                                        "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <span className="text-lg w-5 h-5 flex items-center justify-center">{cat.icon || '🏷️'}</span>
                                    {cat.name}
                                </Button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t pb-safe bg-muted/10">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground text-sm gap-3 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        {t('nav.signOut')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
