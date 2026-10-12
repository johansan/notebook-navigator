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

import type { App, ButtonComponent, Setting } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';

export type SettingDescription = string | DocumentFragment;

/** Configures an existing Setting with a debounced text input */
type DebouncedTextSettingConfigurer = (
    setting: Setting,
    name: string,
    desc: SettingDescription,
    placeholder: string,
    getValue: () => string,
    setValue: (value: string) => void,
    validator?: (value: string) => boolean,
    onAfterUpdate?: () => void
) => Setting;

/** Optional configuration for debounced text area settings */
export interface DebouncedTextAreaSettingOptions {
    rows?: number;
    validator?: (value: string) => boolean;
    onAfterUpdate?: () => void;
}

/** Configures an existing Setting with a debounced text area input */
export type DebouncedTextAreaSettingConfigurer = (
    setting: Setting,
    name: string,
    desc: SettingDescription,
    placeholder: string,
    getValue: () => string,
    setValue: (value: string) => void,
    options?: DebouncedTextAreaSettingOptions
) => Setting;

/**
 * Context object passed to settings page definition factories
 */
export interface SettingsTabContext {
    app: App;
    plugin: NotebookNavigatorPlugin;
    configureDebouncedTextSetting: DebouncedTextSettingConfigurer;
    configureDebouncedTextAreaSetting: DebouncedTextAreaSettingConfigurer;
    /** Registers a listener for plugin settings updates while the settings tab is open */
    registerSettingsUpdateListener(id: string, listener: () => void): void;
    /** Unregisters a previously registered settings update listener */
    unregisterSettingsUpdateListener(id: string): void;
    /** Registers cleanup work tied to the current settings render lifecycle */
    registerSettingsRenderCleanup(cleanup: () => void): void;
    /** Registers the elements where metadata info should be displayed */
    registerMetadataInfoElement(element: HTMLElement, exportButton: ButtonComponent): void;
    /** Registers the element where statistics should be displayed */
    registerStatsTextElement(element: HTMLElement): void;
    /** Requests an immediate statistics refresh */
    requestStatisticsRefresh(): void;
    /** Re-evaluates native setting visibility and disabled states */
    refreshSettingsDomState(): void;
    /** Ensures the statistics update interval is running */
    ensureStatisticsInterval(): void;
}
