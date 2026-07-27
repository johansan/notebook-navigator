/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
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

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type NotebookNavigatorPlugin from '../main';
import type { CollapsedPinnedContexts, UXPreferences } from '../types';

/**
 * Props for the UX preferences provider component
 */
interface UXPreferencesProviderProps {
    children: ReactNode;
    plugin: NotebookNavigatorPlugin;
}

/**
 * Actions for modifying UX preference values
 * These preferences control runtime view state that should not persist across devices
 */
interface UXPreferenceActions {
    setSearchActive: (value: boolean) => void;
    setIncludeDescendantNotes: (value: boolean) => void;
    toggleIncludeDescendantNotes: () => void;
    setShowHiddenItems: (value: boolean) => void;
    toggleShowHiddenItems: () => void;
    setPinShortcuts: (value: boolean) => void;
    // Per-device toggle for the navigation calendar overlay.
    setShowCalendar: (value: boolean) => void;
    toggleShowCalendar: () => void;
}

// Context for providing UX preference state values
const UXPreferencesStateContext = createContext<UXPreferences | null>(null);
// Context for providing UX preference action methods
const UXPreferencesActionsContext = createContext<UXPreferenceActions | null>(null);
// Context for the vault-local pinned-section collapse state, refreshed through the same listener as UX preferences
const CollapsedPinnedContextsStateContext = createContext<CollapsedPinnedContexts | null>(null);

/**
 * Provider component for UX preferences
 * Manages non-persistent view state preferences that control runtime UI behavior
 */
export function UXPreferencesProvider({ children, plugin }: UXPreferencesProviderProps) {
    // Version counter to trigger re-renders when preferences change
    const [version, setVersion] = useState(0);
    const listenerIdRef = useRef<string>('');
    if (!listenerIdRef.current) {
        listenerIdRef.current = `ux-preferences-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    // Register listener for preference updates from the plugin
    useEffect(() => {
        const handleUpdate = () => {
            setVersion(v => v + 1);
        };

        plugin.registerUXPreferencesListener(listenerIdRef.current, handleUpdate);

        return () => {
            plugin.unregisterUXPreferencesListener(listenerIdRef.current);
        };
    }, [plugin]);

    // Get current preferences from plugin, re-computing on version change
    const preferences = useMemo(() => {
        void version; // keep dependency so settings snapshot recreates when updates are published
        return plugin.getUXPreferences();
    }, [plugin, version]);

    const collapsedPinnedContexts = useMemo(() => {
        void version; // keep dependency so the record snapshot recreates when updates are published
        return plugin.getCollapsedPinnedContexts();
    }, [plugin, version]);

    // Create stable action methods that delegate to plugin
    const actions = useMemo<UXPreferenceActions>(
        () => ({
            setSearchActive: (value: boolean) => {
                plugin.setSearchActive(value);
            },
            setIncludeDescendantNotes: (value: boolean) => {
                plugin.setIncludeDescendantNotes(value);
            },
            toggleIncludeDescendantNotes: () => {
                plugin.toggleIncludeDescendantNotes();
            },
            setShowHiddenItems: (value: boolean) => {
                plugin.setShowHiddenItems(value);
            },
            toggleShowHiddenItems: () => {
                plugin.toggleShowHiddenItems();
            },
            setPinShortcuts: (value: boolean) => {
                plugin.setPinShortcuts(value);
            },
            setShowCalendar: (value: boolean) => {
                plugin.setShowCalendar(value);
            },
            toggleShowCalendar: () => {
                plugin.toggleShowCalendar();
            }
        }),
        [plugin]
    );

    return (
        <UXPreferencesStateContext.Provider value={preferences}>
            <UXPreferencesActionsContext.Provider value={actions}>
                <CollapsedPinnedContextsStateContext.Provider value={collapsedPinnedContexts}>
                    {children}
                </CollapsedPinnedContextsStateContext.Provider>
            </UXPreferencesActionsContext.Provider>
        </UXPreferencesStateContext.Provider>
    );
}

/**
 * Hook to access current UX preference values
 * @returns Current UX preferences state
 */
export function useUXPreferences(): UXPreferences {
    const context = useContext(UXPreferencesStateContext);
    if (!context) {
        throw new Error('useUXPreferences must be used within a UXPreferencesProvider');
    }
    return context;
}

/**
 * Hook to access UX preference action methods
 * @returns Object containing methods to modify UX preferences
 */
export function useUXPreferenceActions(): UXPreferenceActions {
    const context = useContext(UXPreferencesActionsContext);
    if (!context) {
        throw new Error('useUXPreferenceActions must be used within a UXPreferencesProvider');
    }
    return context;
}

/**
 * Hook to access the vault-local pinned-section collapse state
 * @returns Record of navigation contexts where the pinned section is collapsed
 */
export function useCollapsedPinnedContexts(): CollapsedPinnedContexts {
    const context = useContext(CollapsedPinnedContextsStateContext);
    if (!context) {
        throw new Error('useCollapsedPinnedContexts must be used within a UXPreferencesProvider');
    }
    return context;
}
