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
import { NavigationSeparatorService } from '../../src/services/metadata/NavigationSeparatorService';
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import type { CleanupValidators } from '../../src/services/MetadataService';
import { createDefaultFileData } from '../../src/storage/indexeddb/fileData';
import type { TagTreeNode } from '../../src/types/storage';
import { buildPropertySeparatorKey, buildTagSeparatorKey } from '../../src/utils/navigationSeparators';
import { buildPropertyValueNodeId } from '../../src/utils/propertyTree';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';
import type { CollapsedPinnedContexts } from '../../src/types';

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

    collapsedPinnedContexts: CollapsedPinnedContexts = {};

    getCollapsedPinnedContexts(): CollapsedPinnedContexts {
        return { ...this.collapsedPinnedContexts };
    }

    updateCollapsedPinnedContexts(mutator: (record: CollapsedPinnedContexts) => boolean): boolean {
        return mutator(this.collapsedPinnedContexts);
    }

    getRecentColors(): string[] {
        return [];
    }

    setRecentColors(): void {}
}

function createSettings(): NotebookNavigatorSettings {
    const settings = structuredClone(DEFAULT_SETTINGS);
    setActivePropertyFields(settings, 'status');
    settings.navigationSeparators = {};
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

function createTagNode(path: string, children: TagTreeNode[] = []): TagTreeNode {
    return {
        name: path.split('/').pop() ?? path,
        path,
        displayPath: path,
        children: new Map(children.map(child => [child.path, child])),
        notesWithTag: new Set()
    };
}

describe('NavigationSeparatorService property cleanup', () => {
    const app = new App();

    it('normalizes legacy property separator keys during cleanup without property provider', async () => {
        const settings = createSettings();
        const legacyKey = buildPropertySeparatorKey('key:Status=ToDo');
        const normalizedNodeId = buildPropertyValueNodeId('status', 'todo');
        const normalizedKey = buildPropertySeparatorKey(normalizedNodeId);
        settings.navigationSeparators = {
            [legacyKey]: true
        };

        const provider = new TestSettingsProvider(settings);
        const service = new NavigationSeparatorService(app, provider, () => null);

        const changed = await service.cleanupSeparators(settings);

        expect(changed).toBe(true);
        expect(settings.navigationSeparators[legacyKey]).toBeUndefined();
        expect(settings.navigationSeparators[normalizedKey]).toBe(true);
    });

    it('normalizes legacy property separator keys and keeps existing entries when node exists', async () => {
        const settings = createSettings();
        const legacyKey = buildPropertySeparatorKey('key:Status=ToDo');
        const normalizedNodeId = buildPropertyValueNodeId('status', 'todo');
        const normalizedKey = buildPropertySeparatorKey(normalizedNodeId);
        settings.navigationSeparators = {
            [legacyKey]: true
        };

        const provider = new TestSettingsProvider(settings);
        const service = new NavigationSeparatorService(app, provider, () => null);
        const validators = createValidators([createMarkdownFileWithProperty('Note.md', 'Status', 'ToDo')]);

        const changed = await service.cleanupWithValidators(validators, settings);

        expect(changed).toBe(true);
        expect(settings.navigationSeparators).toEqual({
            [normalizedKey]: true
        });
    });

    it('removes normalized and legacy property separators when property node no longer exists', async () => {
        const settings = createSettings();
        const normalizedNodeId = buildPropertyValueNodeId('status', 'todo');
        const normalizedKey = buildPropertySeparatorKey(normalizedNodeId);
        const legacyKey = buildPropertySeparatorKey('key:Status=ToDo');
        settings.navigationSeparators = {
            [legacyKey]: true,
            [normalizedKey]: true
        };

        const provider = new TestSettingsProvider(settings);
        const service = new NavigationSeparatorService(app, provider, () => null);
        const validators = createValidators([]);

        const changed = await service.cleanupWithValidators(validators, settings);

        expect(changed).toBe(true);
        expect(settings.navigationSeparators).toEqual({});
    });
});

describe('NavigationSeparatorService tag cleanup', () => {
    const app = new App();

    it('normalizes legacy tag separator keys during cleanup without tag provider', async () => {
        const settings = createSettings();
        const legacyKey = buildTagSeparatorKey('re\u0301union');
        const normalizedKey = buildTagSeparatorKey('réunion');
        settings.navigationSeparators = {
            [legacyKey]: true
        };

        const provider = new TestSettingsProvider(settings);
        const service = new NavigationSeparatorService(app, provider, () => null);

        const changed = await service.cleanupSeparators(settings);

        expect(changed).toBe(true);
        expect(settings.navigationSeparators[legacyKey]).toBeUndefined();
        expect(settings.navigationSeparators[normalizedKey]).toBe(true);
    });

    it('normalizes legacy tag separator keys and keeps existing entries when tag exists', async () => {
        const settings = createSettings();
        const legacyKey = buildTagSeparatorKey('re\u0301union');
        const normalizedKey = buildTagSeparatorKey('réunion');
        settings.navigationSeparators = {
            [legacyKey]: true
        };

        const provider = new TestSettingsProvider(settings);
        const service = new NavigationSeparatorService(app, provider, () => null);
        const reunionNode = createTagNode('réunion');
        const validators = {
            ...createValidators([]),
            tagTree: new Map([[reunionNode.path, reunionNode]])
        };

        const changed = await service.cleanupWithValidators(validators, settings);

        expect(changed).toBe(true);
        expect(settings.navigationSeparators).toEqual({
            [normalizedKey]: true
        });
    });

    it('removes normalized and legacy tag separators when tag no longer exists', async () => {
        const settings = createSettings();
        const legacyKey = buildTagSeparatorKey('re\u0301union');
        const normalizedKey = buildTagSeparatorKey('réunion');
        settings.navigationSeparators = {
            [legacyKey]: true,
            [normalizedKey]: true
        };

        const provider = new TestSettingsProvider(settings);
        const service = new NavigationSeparatorService(app, provider, () => null);

        const changed = await service.cleanupWithValidators(createValidators([]), settings);

        expect(changed).toBe(true);
        expect(settings.navigationSeparators).toEqual({});
    });

    it('keeps nested tag separators when the validator tree contains the descendant', async () => {
        const settings = createSettings();
        const separatorKey = buildTagSeparatorKey('projects/client');
        settings.navigationSeparators = {
            [separatorKey]: true
        };

        const provider = new TestSettingsProvider(settings);
        const service = new NavigationSeparatorService(app, provider, () => null);
        const childNode = createTagNode('projects/client');
        const rootNode = createTagNode('projects', [childNode]);
        const validators = {
            ...createValidators([]),
            tagTree: new Map([[rootNode.path, rootNode]])
        };

        const changed = await service.cleanupWithValidators(validators, settings);

        expect(changed).toBe(false);
        expect(settings.navigationSeparators).toEqual({
            [separatorKey]: true
        });
    });
});
