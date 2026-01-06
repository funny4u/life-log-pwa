
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
                    className="h-12 w-12 hover:bg-transparent text-muted-foreground hover:text-primary"
                    onClick={openSidebar}
                >
                    <Menu className="w-6 h-6" />
                </Button>

                {/* Add Button (Center) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 hover:bg-transparent text-muted-foreground hover:text-primary"
                    onClick={() => openDrawer()}
                >
                    <Plus className="w-8 h-8" />
                </Button>

                {/* Search */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 hover:bg-transparent text-muted-foreground hover:text-primary"
                    onClick={openSearch}
                >
                    <Search className="w-6 h-6" />
                </Button>

            </div>
        </div>
    );
}
