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

import { TFile } from 'obsidian';
import { IContentProvider, type ContentProviderClearContext, type ContentProviderType } from '../../interfaces/IContentProvider';
import type { NotebookNavigatorSettings } from '../../settings/types';

/**
 * Registry for managing content providers
 * Centralizes the registration and coordination of different content generation services
 */
export class ContentProviderRegistry {
    private providers: Map<ContentProviderType, IContentProvider> = new Map();

    /**
     * Registers a content provider
     * @param provider - The provider to register
     */
    registerProvider(provider: IContentProvider): void {
        this.providers.set(provider.getContentType(), provider);
    }

    /**
     * Gets all registered providers
     */
    getAllProviders(): IContentProvider[] {
        return Array.from(this.providers.values());
    }

    /**
     * Gets a specific provider by provider type
     */
    getProvider(type: ContentProviderType): IContentProvider | undefined {
        return this.providers.get(type);
    }

    /**
     * Gets all settings that affect any content generation
     */
    getAllRelevantSettings(): (keyof NotebookNavigatorSettings)[] {
        const allSettings = new Set<keyof NotebookNavigatorSettings>();

        for (const provider of this.providers.values()) {
            const settings = provider.getRelevantSettings();
            settings.forEach(setting => allSettings.add(setting));
        }

        return Array.from(allSettings);
    }

    /**
     * Handles settings changes by notifying affected providers
     * @param oldSettings - Previous settings
     * @param newSettings - New settings
     * @returns Content types affected by settings changes and eligible for regeneration
     */
    async handleSettingsChange(
        oldSettings: NotebookNavigatorSettings,
        newSettings: NotebookNavigatorSettings
    ): Promise<ContentProviderType[]> {
        const stopPromises: Promise<void>[] = [];
        const providersToClear: { provider: IContentProvider; context: ContentProviderClearContext }[] = [];
        const affectedTypes: ContentProviderType[] = [];

        // Check each provider to see if it's affected
        for (const provider of this.providers.values()) {
            const relevantSettings = provider.getRelevantSettings();
            const hasRelevantChanges = relevantSettings.some(settingKey => oldSettings[settingKey] !== newSettings[settingKey]);
            const shouldClear = provider.shouldRegenerate(oldSettings, newSettings);
            if (hasRelevantChanges || shouldClear) {
                // Prevent providers from writing results computed with stale settings.
                // stopProcessing() cannot cancel in-flight IndexedDB writes, so we wait for providers to become idle.
                provider.stopProcessing();
                stopPromises.push(provider.waitForIdle());
            }

            if (shouldClear) {
                // Clear content for this provider after all providers have stopped.
                const context: ContentProviderClearContext = { oldSettings, newSettings };
                providersToClear.push({ provider, context });
            }

            if (hasRelevantChanges || shouldClear) {
                affectedTypes.push(provider.getContentType());
            }

            // Always notify providers of settings changes
            provider.onSettingsChanged(newSettings);
        }

        if (stopPromises.length > 0) {
            await Promise.all(stopPromises);
        }

        if (providersToClear.length > 0) {
            await Promise.all(providersToClear.map(({ provider, context }) => provider.clearContent(context)));
        }

        return affectedTypes;
    }

    /**
     * Queues files for content generation across all providers
     * @param files - Files to queue
     * @param settings - Current settings
     * @param options - Optional filtering to include or exclude specific content types
     */
    queueFilesForAllProviders(
        files: TFile[],
        settings: NotebookNavigatorSettings,
        options?: { include?: ContentProviderType[]; exclude?: ContentProviderType[] }
    ): void {
        const include = options?.include;
        const exclude = options?.exclude;

        for (const provider of this.providers.values()) {
            const type = provider.getContentType();

            // Skip providers not in the include list (if specified)
            if (include && !include.includes(type)) {
                continue;
            }

            // Skip providers in the exclude list (if specified)
            if (exclude && exclude.includes(type)) {
                continue;
            }

            // Resume provider before queuing so it accepts new work after a stop
            provider.startProcessing(settings);
            provider.queueFiles(files);
        }
    }

    /**
     * Stops all providers' processing
     */
    stopAllProcessing(): void {
        for (const provider of this.providers.values()) {
            provider.stopProcessing();
        }
    }
}
