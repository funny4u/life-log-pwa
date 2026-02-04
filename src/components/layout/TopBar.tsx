import React from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps {
    title?: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}

export function TopBar({ title = "LifeLog", className, actions }: TopBarProps) {
    return (
        <div className={cn(
            "h-14 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b sticky top-0 z-40 pt-safe",
            className
        )}>
            <div className="font-semibold text-lg flex-1 flex items-center">
                {title}
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
    );
}
