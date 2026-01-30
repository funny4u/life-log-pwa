"use client";

import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
    isSidebarOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <LayoutContext.Provider value={{
            isSidebarOpen, openSidebar, closeSidebar, toggleSidebar
        }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayoutContext() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error("useLayoutContext must be used within a LayoutProvider");
    }
    return context;
}
