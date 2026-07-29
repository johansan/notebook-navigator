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

import type { NotebookNavigatorSettings } from '../settings/types';
import type { CollapsedPinnedContexts } from '../types';

/**
 * Interface for providing access to plugin settings
 * This abstraction allows services to access settings without depending on the concrete plugin class
 */
export interface ISettingsProvider {
    /**
     * Gets the current settings
     * @returns The current plugin settings
     */
    readonly settings: NotebookNavigatorSettings;

    /**
     * Saves the current settings to persistent storage and triggers UI updates
     * @returns Promise that resolves when settings are saved
     */
    saveSettingsAndUpdate(): Promise<void>;

    /**
     * Notifies listeners that settings relevant state changed without persisting
     */
    notifySettingsUpdate(): void;

    /**
     * Gets the cached list of recent notes stored outside of synced settings
     */
    getRecentNotes(): string[];

    /**
     * Persists the cached list of recent notes to vault-local storage
     * @param recentNotes - Ordered array of recent note paths
     */
    setRecentNotes(recentNotes: string[]): void;

    /**
     * Gets the cached record of recently used icons stored outside of synced settings
     */
    getRecentIcons(): Record<string, string[]>;

    /**
     * Persists the cached record of recently used icons to vault-local storage
     * @param recentIcons - Map of provider id to ordered icon id list
     */
    setRecentIcons(recentIcons: Record<string, string[]>): void;

    /**
     * Gets a copy of the pinned-section collapse state stored outside of synced settings
     */
    getCollapsedPinnedContexts(): CollapsedPinnedContexts;

    /**
     * Mutates the pinned-section collapse state stored outside of synced settings.
     * When the mutator reports a change the record is persisted to vault-local storage.
     * @returns True when the mutator changed the record
     */
    updateCollapsedPinnedContexts(mutator: (record: CollapsedPinnedContexts) => boolean): boolean;

    /**
     * Gets the cached list of recently used colors stored outside of synced settings
     */
    getRecentColors(): string[];

    /**
     * Persists the cached list of recently used colors to vault-local storage
     * @param recentColors - Ordered array of recent color values
     */
    setRecentColors(recentColors: string[]): void;
}
