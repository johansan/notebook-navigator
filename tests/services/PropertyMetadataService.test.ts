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

import { describe, expect, it, vi } from 'vitest';
import { App } from 'obsidian';
import { PropertyMetadataService } from '../../src/services/metadata/PropertyMetadataService';
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { MetadataService, type CleanupValidators } from '../../src/services/MetadataService';
import { createDefaultFileData } from '../../src/storage/indexeddb/fileData';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../src/utils/propertyTree';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, type CollapsedPinnedContexts } from '../../src/types';

class TestSettingsProvider implements ISettingsProvider {
    constructor(public settings: NotebookNavigatorSettings) {}

    saveSettingsAndUpdate = vi.fn().mockResolvedValue(undefined);

    notifySettingsUpdate(): void {}

    getRecentNotes(): string[] {
        return [];
    }

    setRecentNotes(): void {}

    getRecentIcons(): Record<string, string[]> {
        return {};
    }

    setRecentIcons(): void {}

    getRecentColors(): string[] {
        return [];
    }

    setRecentColors(): void {}

    collapsedPinnedContexts: CollapsedPinnedContexts = {};

    getCollapsedPinnedContexts(): CollapsedPinnedContexts {
        return { ...this.collapsedPinnedContexts };
    }

    updateCollapsedPinnedContexts(mutator: (record: CollapsedPinnedContexts) => boolean): boolean {
        return mutator(this.collapsedPinnedContexts);
    }
}

function createSettings(): NotebookNavigatorSettings {
    const settings = structuredClone(DEFAULT_SETTINGS);
    setActivePropertyFields(settings, 'status');
    settings.propertyColors = {};
    settings.propertyBackgroundColors = {};
    settings.propertyIcons = {};
    settings.propertySortOverrides = {};
    settings.propertyTreeSortOverrides = {};
    return settings;
}

function createValidators(dbFiles: CleanupValidators['dbFiles']): CleanupValidators {
    return {
        dbFiles,
        tagTree: new Map(),
        vaultFiles: new Set(),
        vaultFolders: new Set(['/'])
    };
}

function createMarkdownFileWithProperty(path: string, fieldKey: string, value: string): CleanupValidators['dbFiles'][number] {
    const data = createDefaultFileData({ path, mtime: 1 });
    data.properties = [
        {
            fieldKey,
            value,
            valueKind: 'string'
        }
    ];
    return { path, data };
}

describe('PropertyMetadataService cleanupWithValidators', () => {
    const app = new App();

    it('removes stale property metadata while keeping existing key and value entries', async () => {
        const validKeyNodeId = buildPropertyKeyNodeId('status');
        const staleKeyNodeId = buildPropertyKeyNodeId('priority');
        const validValueNodeId = buildPropertyValueNodeId('status', 'todo');
        const staleValueNodeId = buildPropertyValueNodeId('status', 'done');

        const settings = createSettings();
        settings.propertyColors = {
            [validKeyNodeId]: '#111111',
            [staleKeyNodeId]: '#222222'
        };
        settings.propertyBackgroundColors = {
            [validValueNodeId]: '#333333',
            [staleValueNodeId]: '#444444'
        };
        settings.propertyIcons = {
            [validValueNodeId]: 'lucide-check',
            [staleValueNodeId]: 'lucide-x'
        };
        settings.propertyTreeSortOverrides = {
            [validKeyNodeId]: 'alpha-desc',
            [staleKeyNodeId]: 'alpha-asc'
        };

        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);
        const validators = createValidators([createMarkdownFileWithProperty('Note.md', 'Status', 'ToDo')]);

        const changes = await service.cleanupWithValidators(validators, settings);

        expect(changes).toEqual({ settingsChanged: true, localChanged: false });
        expect(settings.propertyColors).toEqual({
            [validKeyNodeId]: '#111111'
        });
        expect(settings.propertyBackgroundColors).toEqual({
            [validValueNodeId]: '#333333'
        });
        expect(settings.propertyIcons).toEqual({
            [validValueNodeId]: 'lucide-check'
        });
        expect(settings.propertyTreeSortOverrides).toEqual({
            [validKeyNodeId]: 'alpha-desc'
        });
    });

    it('clears property metadata when no property fields are configured', async () => {
        const keyNodeId = buildPropertyKeyNodeId('status');
        const valueNodeId = buildPropertyValueNodeId('status', 'todo');

        const settings = createSettings();
        setActivePropertyFields(settings, '');
        settings.propertyColors = {
            [keyNodeId]: '#111111'
        };
        settings.propertyBackgroundColors = {
            [valueNodeId]: '#333333'
        };
        settings.propertyIcons = {
            [valueNodeId]: 'lucide-check'
        };
        settings.propertyTreeSortOverrides = {
            [keyNodeId]: 'alpha-asc'
        };

        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);
        const validators = createValidators([createMarkdownFileWithProperty('Note.md', 'Status', 'ToDo')]);

        const changes = await service.cleanupWithValidators(validators, settings);

        expect(changes).toEqual({ settingsChanged: true, localChanged: false });
        expect(settings.propertyColors).toEqual({});
        expect(settings.propertyBackgroundColors).toEqual({});
        expect(settings.propertyIcons).toEqual({});
        expect(settings.propertyTreeSortOverrides).toEqual({});
    });

    it('removes configured property keys that no longer exist in cached note data', async () => {
        const settings = createSettings();
        settings.vaultProfiles[0].propertyKeys = [
            {
                key: 'status',
                showInNavigation: true,
                showInList: true,
                showInFileMenu: false
            },
            {
                key: 'priority',
                showInNavigation: true,
                showInList: true,
                showInFileMenu: false
            }
        ];

        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);
        const validators = createValidators([createMarkdownFileWithProperty('Note.md', 'Status', 'ToDo')]);

        const changes = await service.cleanupWithValidators(validators, settings);

        expect(changes).toEqual({ settingsChanged: true, localChanged: false });
        expect(settings.vaultProfiles[0]?.propertyKeys).toEqual([
            {
                key: 'status',
                showInNavigation: true,
                showInList: true,
                showInFileMenu: false
            }
        ]);
    });
});

describe('MetadataService getCleanupSummary', () => {
    it('counts stale configured property keys as properties to clean', () => {
        const settings = createSettings();
        settings.vaultProfiles[0].propertyKeys = [
            {
                key: 'status',
                showInNavigation: true,
                showInList: true,
                showInFileMenu: false
            }
        ];

        const summary = (
            MetadataService as unknown as {
                computeMetadataCounts(
                    settings: NotebookNavigatorSettings,
                    collapsedPinnedContexts: CollapsedPinnedContexts
                ): { properties: number };
            }
        ).computeMetadataCounts(settings, {});

        expect(summary.properties).toBe(1);
    });
});

describe('PropertyMetadataService color inheritance', () => {
    const app = new App();

    it('inherits key color data for value nodes when inheritance is enabled', () => {
        const keyNodeId = buildPropertyKeyNodeId('status');
        const valueNodeId = buildPropertyValueNodeId('status', 'todo');

        const settings = createSettings();
        settings.inheritPropertyColors = true;
        settings.propertyColors = {
            [keyNodeId]: '#111111'
        };
        settings.propertyBackgroundColors = {
            [keyNodeId]: '#222222'
        };

        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);

        expect(service.getPropertyColorData(valueNodeId)).toEqual({
            color: '#111111',
            background: '#222222'
        });
    });

    it('does not inherit key color data for value nodes when inheritance is disabled', () => {
        const keyNodeId = buildPropertyKeyNodeId('status');
        const valueNodeId = buildPropertyValueNodeId('status', 'todo');

        const settings = createSettings();
        settings.inheritPropertyColors = false;
        settings.propertyColors = {
            [keyNodeId]: '#111111'
        };
        settings.propertyBackgroundColors = {
            [keyNodeId]: '#222222'
        };

        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);

        expect(service.getPropertyColorData(valueNodeId)).toEqual({
            color: undefined,
            background: undefined
        });
    });
});

describe('PropertyMetadataService sort overrides', () => {
    const app = new App();

    it('sets and removes property sort overrides for normalized node ids', async () => {
        const settings = createSettings();
        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);
        const normalizedNodeId = buildPropertyKeyNodeId('status');

        await service.setPropertySortOverride('key:Status', 'title-desc');
        expect(service.getPropertySortOverride(normalizedNodeId)).toBe('title-desc');

        await service.removePropertySortOverride('key:Status');
        expect(service.getPropertySortOverride(normalizedNodeId)).toBeUndefined();
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(2);
    });

    it('supports the properties root virtual folder id as a sort target', async () => {
        const settings = createSettings();
        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);

        await service.setPropertySortOverride(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, 'filename-asc');
        expect(service.getPropertySortOverride(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)).toBe('filename-asc');

        await service.removePropertySortOverride(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
        expect(service.getPropertySortOverride(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)).toBeUndefined();
    });

    it('ignores invalid property node ids for sort overrides', async () => {
        const settings = createSettings();
        const provider = new TestSettingsProvider(settings);
        const service = new PropertyMetadataService(app, provider);

        await service.setPropertySortOverride('status', 'title-asc');
        await service.removePropertySortOverride('status');

        expect(service.getPropertySortOverride('status')).toBeUndefined();
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(0);
    });
});
