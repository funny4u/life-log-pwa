import React from 'react';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLayoutContext } from '@/components/providers/LayoutProvider';

interface TopBarProps {
    title?: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
    hideMenu?: boolean;
}

export function TopBar({ title = "LifeLog", className, actions, hideMenu = false }: TopBarProps) {
    const { openSidebar } = useLayoutContext();

    return (
        <div className={cn(
            "h-14 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b sticky top-0 z-40 pt-safe",
            className
        )}>
            <div className="font-semibold text-lg flex-1 flex items-center gap-2">
                {!hideMenu && (
                    <Button variant="ghost" size="icon" className="-ml-2 h-9 w-9" onClick={openSidebar}>
                        <Menu className="w-5 h-5" />
                    </Button>
                )}
                {title}
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
    );
}
