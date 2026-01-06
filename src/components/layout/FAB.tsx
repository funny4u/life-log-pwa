"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
    onClick?: () => void;
    className?: string; // Allow extra styling positioning
}

export function FAB({ onClick, className }: FABProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "flex items-center justify-center",
                className
            )}
            size="icon"
        >
            <Plus className="w-8 h-8" />
            <span className="sr-only">Add Log</span>
        </Button>
    );
}
