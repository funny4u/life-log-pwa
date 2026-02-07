"use client";

import React from 'react';
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { LayoutProvider } from "@/components/providers/LayoutProvider";
import { LogProvider } from "@/components/providers/LogProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <LayoutProvider>
                <LogProvider>
                    {children}
                </LogProvider>
            </LayoutProvider>
        </LanguageProvider>
    );
}
