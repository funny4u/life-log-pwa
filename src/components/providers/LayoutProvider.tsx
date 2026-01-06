"use client";

import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
    isSidebarOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void;

    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    const openSearch = () => setIsSearchOpen(true);
    const closeSearch = () => setIsSearchOpen(false);

    return (
        <LayoutContext.Provider value={{
            isSidebarOpen, openSidebar, closeSidebar, toggleSidebar,
            isSearchOpen, openSearch, closeSearch
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
