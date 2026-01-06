
import React from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayoutContext } from '@/components/providers/LayoutProvider';
import { useLogContext } from '@/components/providers/LogProvider';
import { Button } from '@/components/ui/button';

export function BottomNav() {
    const { openSidebar, openSearch } = useLayoutContext();
    const { openDrawer } = useLogContext();

    return (
        <div className="fixed bottom-0 w-full bg-background/80 backdrop-blur-md border-t z-50 pb-safe">
            <div className="flex justify-around items-center h-16 px-6">

                {/* Menu (Hamburger) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 hover:bg-transparent text-muted-foreground hover:text-primary"
                    onClick={openSidebar}
                >
                    <Menu className="w-12 h-12" />
                </Button>

                {/* Add Button (Center) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-16 w-16 hover:bg-transparent text-primary hover:text-primary scale-125 -mt-4 shadow-sm bg-background/50 rounded-full border border-border/50 backdrop-blur-sm"
                    onClick={() => openDrawer()}
                >
                    <Plus className="w-14 h-14" />
                </Button>

                {/* Search */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 hover:bg-transparent text-muted-foreground hover:text-primary"
                    onClick={openSearch}
                >
                    <Search className="w-12 h-12" />
                </Button>

            </div>
        </div>
    );
}
