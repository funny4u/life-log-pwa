"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ApplyButtonProps {
    t: any;
    tempThumbnailSize: string;
}

export function ApplyButton({ t, tempThumbnailSize }: ApplyButtonProps) {
    const [isApplied, setIsApplied] = useState(false);

    const handleApply = () => {
        localStorage.setItem('journal_thumbnail_size', tempThumbnailSize);
        // Dispatch multiple events to be thorough
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('journal-settings-changed'));

        setIsApplied(true);
        setTimeout(() => setIsApplied(false), 2000);
    };

    return (
        <Button
            size="sm"
            variant={isApplied ? "default" : "secondary"}
            onClick={handleApply}
            className={isApplied ? "bg-green-600 hover:bg-green-700 text-white transition-all duration-200" : ""}
        >
            {isApplied ? (
                <>
                    <Check className="w-4 h-4 mr-1" />
                    Saved
                </>
            ) : (
                t ? t('actions.apply') || 'Apply' : 'Apply'
            )}
        </Button>
    );
}
