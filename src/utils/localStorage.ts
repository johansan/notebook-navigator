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

import { App } from 'obsidian';

// Current localStorage schema version
// Version 2: removes the legacy pre-IndexedDB file cache blob
// Version 3: adds the device-local What's new version marker
export const LOCALSTORAGE_VERSION = 3;

/**
 * Keys the plugin no longer reads or writes. Removed from existing devices by the
 * localStorage version migration and on reinstall, because they are absent from
 * STORAGE_KEYS and no other cleanup path would ever delete their stored values.
 */
export const LEGACY_STORAGE_KEYS: readonly string[] = [
    // Pre-IndexedDB file cache
    'notebook-navigator-file-cache'
];

/**
 * Type-safe wrapper around Obsidian's vault-specific localStorage API
 * Obsidian handles JSON serialization/deserialization internally
 * IMPORTANT: Must be initialized with app instance before use to prevent data mixing between vaults
 */
export const localStorage = {
    _app: null as App | null,

    /**
     * Initialize the localStorage utility with the app instance
     * This enables vault-specific storage isolation
     */
    init(app: App) {
        // Use localStorage object literal directly to ensure proper this binding (eslint @typescript-eslint/unbound-method)
        localStorage._app = app;
    },

    /**
     * Returns true when vault-scoped localStorage access is ready.
     */
    isInitialized(): boolean {
        return localStorage._app !== null;
    },

    /**
     * Safely retrieves a value from localStorage with error handling
     * Obsidian automatically deserializes the stored value
     * @param key - The localStorage key
     * @returns The deserialized value or null if not found/error occurs
     */
    get<T = string>(key: string): T | null {
        try {
            if (!localStorage._app) {
                // Return null if app not initialized to prevent mixing storage
                return null;
            }
            // Use vault-specific storage
            const data: unknown = localStorage._app.loadLocalStorage(key);
            return data as T;
        } catch (error: unknown) {
            console.error(`Failed to get from localStorage for key "${key}":`, error);
            return null;
        }
    },

    /**
     * Safely sets a value in localStorage with error handling
     * @param key - The localStorage key
     * @param value - The value to store (Obsidian handles serialization)
     * @returns True if successful, false otherwise
     */
    set<T>(key: string, value: T): boolean {
        try {
            if (!localStorage._app) {
                // Ignore writes if app not initialized to prevent mixing storage
                return false;
            }
            // Use vault-specific storage
            localStorage._app.saveLocalStorage(key, value);
            return true;
        } catch (error: unknown) {
            console.error(`Failed to set localStorage for key "${key}":`, error);
            return false;
        }
    },

    /**
     * Safely removes a value from localStorage with error handling
     * @param key - The localStorage key
     * @returns True if successful, false otherwise
     */
    remove(key: string): boolean {
        try {
            if (!localStorage._app) {
                // Ignore removes if app not initialized to prevent mixing storage
                return false;
            }
            // Use vault-specific storage - pass null to clear
            localStorage._app.saveLocalStorage(key, null);
            return true;
        } catch (error: unknown) {
            console.error(`Failed to remove from localStorage for key "${key}":`, error);
            return false;
        }
    }
};
