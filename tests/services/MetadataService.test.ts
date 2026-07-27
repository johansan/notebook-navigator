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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App, TFile, TFolder } from 'obsidian';
import { MetadataService } from '../../src/services/MetadataService';
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import type { ITagTreeProvider } from '../../src/interfaces/ITagTreeProvider';
import type { CollapsedPinnedContexts } from '../../src/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { createDefaultFileData } from '../../src/storage/indexeddb/fileData';

const dbState = vi.hoisted(() => ({
    files: [] as { path: string; data: FileData }[]
}));

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstance: () => ({
        getAllFiles: () => dbState.files,
        forEachFile: (callback: (path: string, data: FileData) => void) => {
            dbState.files.forEach(({ path, data }) => callback(path, data));
        }
    }),
    getDBInstanceOrNull: () => ({
        getAllFiles: () => dbState.files
    })
}));

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
    settings.tagColors = {};
    settings.tagBackgroundColors = {};
    settings.tagIcons = {};
    settings.tagSortOverrides = {};
    settings.tagTreeSortOverrides = {};
    settings.tagAppearances = {};
    settings.fileIcons = {};
    settings.fileColors = {};
    settings.fileBackgroundColors = {};
    settings.pinnedNotes = {};
    settings.navigationSeparators = {};
    settings.vaultProfiles = settings.vaultProfiles.map(profile => ({
        ...profile,
        propertyKeys: []
    }));
    return settings;
}

function createDbFile(path: string, tags: string[]): { path: string; data: FileData } {
    const data = createDefaultFileData({ path, mtime: 1 });
    data.tags = tags;
    return { path, data };
}

function configureVault(app: App, filePaths: string[]): void {
    const files = filePaths.map(path => {
        const file = new TFile();
        file.path = path;
        return file;
    });
    const root = new TFolder() as TFolder & { children: TFolder[] };
    root.path = '/';
    root.children = [];

    const vault = app.vault as unknown as {
        getFiles: () => TFile[];
        getRoot: () => TFolder & { children: TFolder[] };
        getFolderByPath: (path: string) => TFolder | null;
    };

    vault.getFiles = () => files;
    vault.getRoot = () => root;
    vault.getFolderByPath = path => (path === '/' ? root : null);
}

function createFilteredTagProvider(): ITagTreeProvider {
    return {
        addTreeUpdateListener: () => () => {},
        hasNodes: () => false,
        findTagNode: () => null,
        resolveSelectionTagPath: () => null,
        getAllTagPaths: () => [],
        collectDescendantTagPaths: () => new Set(),
        collectTagFilePaths: () => []
    };
}

describe('MetadataService cleanup', () => {
    beforeEach(() => {
        dbState.files = [];
    });

    it('summarizes hidden-only tags using vault-wide cached tags', async () => {
        dbState.files = [createDbFile('Hidden.md', ['#hidden/private'])];

        const app = new App();
        configureVault(app, ['Hidden.md']);
        const settings = createSettings();
        settings.tagColors = {
            'hidden/private': '#111111',
            stale: '#222222'
        };

        const provider = new TestSettingsProvider(settings);
        const service = new MetadataService(app, provider, () => createFilteredTagProvider());

        const summary = await service.getCleanupSummary();

        expect(summary.tags).toBe(1);
        expect(settings.tagColors).toEqual({
            'hidden/private': '#111111',
            stale: '#222222'
        });
    });

    it('keeps metadata for hidden-only tags during cleanup', async () => {
        dbState.files = [createDbFile('Hidden.md', ['#hidden/private'])];

        const app = new App();
        configureVault(app, ['Hidden.md']);
        const settings = createSettings();
        settings.tagColors = {
            'hidden/private': '#111111',
            stale: '#222222'
        };

        const provider = new TestSettingsProvider(settings);
        const service = new MetadataService(app, provider, () => createFilteredTagProvider());

        const changes = await service.cleanupAllMetadata(settings);

        expect(changes).toEqual({ settingsChanged: true, localChanged: false });
        expect(settings.tagColors).toEqual({
            'hidden/private': '#111111'
        });
    });

    it('reports stale pinned collapse contexts as local-only changes', async () => {
        const app = new App();
        configureVault(app, []);
        const settings = createSettings();
        const provider = new TestSettingsProvider(settings);
        provider.collapsedPinnedContexts = {
            'folder:Missing': true
        };
        const service = new MetadataService(app, provider, () => createFilteredTagProvider());

        const changes = await service.cleanupAllMetadata(settings);

        expect(changes).toEqual({ settingsChanged: false, localChanged: true });
        expect(provider.collapsedPinnedContexts).toEqual({});
    });
});
