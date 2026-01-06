"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Log } from '@/lib/types';

interface LogContextType {
    isDrawerOpen: boolean;
    selectedLog: Log | null;
    openDrawer: (log?: Log) => void;
    closeDrawer: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);

    const openDrawer = (log?: Log) => {
        setSelectedLog(log || null);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedLog(null), 300); // Clear after animation
    };

    return (
        <LogContext.Provider value={{ isDrawerOpen, selectedLog, openDrawer, closeDrawer }}>
            {children}
        </LogContext.Provider>
    );
}

export function useLogContext() {
    const context = useContext(LogContext);
    if (context === undefined) {
        throw new Error('useLogContext must be used within a LogProvider');
    }
    return context;
}
