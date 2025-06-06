/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// src/context/ServicesContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { App } from 'obsidian';
import { FileSystemOperations } from '../services/FileSystemService';

/**
 * Interface defining all services available through the context.
 * Services provide business logic separated from UI components.
 */
interface Services {
    /** File system operations service for creating, renaming, and deleting files/folders */
    fileSystemOps: FileSystemOperations;
}

/**
 * React context for dependency injection of services.
 * Provides a centralized way to access business logic throughout the app.
 */
const ServicesContext = createContext<Services>(null!);

/**
 * Provider component that instantiates and provides services to child components.
 * Services are memoized to ensure singleton behavior.
 * 
 * @param props - Component props
 * @param props.children - Child components that will have access to services
 * @param props.app - The Obsidian App instance needed by services
 */
export function ServicesProvider({ children, app }: { children: React.ReactNode, app: App }) {
    /**
     * Instantiate services once and memoize them.
     * Services are only recreated if the app instance changes (which shouldn't happen).
     */
    const services = useMemo(() => ({
        fileSystemOps: new FileSystemOperations(app)
    }), [app]);

    return (
        <ServicesContext.Provider value={services}>
            {children}
        </ServicesContext.Provider>
    );
}

/**
 * Hook to access all services.
 * Must be used within a ServicesProvider.
 * 
 * @returns Object containing all available services
 * @throws If used outside of ServicesProvider
 */
export function useServices() {
    return useContext(ServicesContext);
}

/**
 * Convenience hook to access the FileSystemOperations service directly.
 * Use this when you only need file system operations.
 * 
 * @returns The FileSystemOperations service instance
 */
export function useFileSystemOps() {
    const { fileSystemOps } = useServices();
    return fileSystemOps;
}