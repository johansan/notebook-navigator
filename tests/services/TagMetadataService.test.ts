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
import { TagMetadataService } from '../../src/services/metadata/TagMetadataService';
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import type { CleanupValidators } from '../../src/services/MetadataService';
import { createDefaultFileData } from '../../src/storage/indexeddb/fileData';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { createVaultProfile } from '../../src/utils/vaultProfiles';
import { TAGGED_TAG_ID, UNTAGGED_TAG_ID, type CollapsedPinnedContexts } from '../../src/types';

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
    return {
        ...DEFAULT_SETTINGS,
        tagColors: {},
        tagBackgroundColors: {},
        tagIcons: {},
        tagSortOverrides: {},
        tagAppearances: {},
        vaultProfiles: DEFAULT_SETTINGS.vaultProfiles.map(profile => ({
            ...profile,
            hiddenFolders: [...profile.hiddenFolders],
            hiddenFileProperties: [...profile.hiddenFileProperties],
            hiddenFileNames: [...profile.hiddenFileNames],
            hiddenTags: [...profile.hiddenTags],
            hiddenFileTags: [...profile.hiddenFileTags],
            shortcuts: [...profile.shortcuts]
        }))
    };
}

function createValidators(dbFiles: CleanupValidators['dbFiles']): CleanupValidators {
    return {
        dbFiles,
        tagTree: new Map(),
        vaultFiles: new Set(),
        vaultFolders: new Set(['/'])
    };
}

function createMarkdownFile(path: string, tags: string[]): { path: string; data: FileData } {
    const data = createDefaultFileData({ path, mtime: 1 });
    data.tags = tags;
    return { path, data };
}

describe('TagMetadataService.handleTagRename', () => {
    const app = new App();

    it('moves metadata when destination tag has no existing entries', async () => {
        const settings = createSettings();
        settings.tagColors = { project: '#ff0000' };
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagRename('project', 'areas', false);

        expect(settings.tagColors.project).toBeUndefined();
        expect(settings.tagColors.areas).toBe('#ff0000');
    });

    it('preserves destination metadata when renaming into an existing tag', async () => {
        const settings = createSettings();
        settings.tagColors = { project: '#ff0000', areas: '#00ff00' };
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagRename('project', 'areas', true);

        expect(settings.tagColors.project).toBeUndefined();
        expect(settings.tagColors.areas).toBe('#00ff00');
    });

    it('retains descendant metadata on destination tags while removing legacy entries', async () => {
        const settings = createSettings();
        settings.tagIcons = { 'project/demo': 'lucide-circle' };
        settings.tagBackgroundColors = { 'project/design': '#123456' };
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagRename('project', 'areas', true);

        expect(settings.tagIcons['project/demo']).toBeUndefined();
        expect(settings.tagIcons['areas/demo']).toBe('lucide-circle');
        expect(settings.tagBackgroundColors['project/design']).toBeUndefined();
        expect(settings.tagBackgroundColors['areas/design']).toBe('#123456');
    });

    it('updates hidden tags across profiles on rename', async () => {
        const settings = createSettings();
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['projects', 'misc'];
        activeProfile.hiddenFileTags = ['projects', 'misc'];
        settings.vaultProfiles.push(
            createVaultProfile('secondary', {
                id: 'secondary',
                hiddenTags: ['projects/client', '*draft'],
                hiddenFileTags: ['projects/client', '*draft']
            })
        );

        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagRename('projects', 'areas');

        expect(activeProfile.hiddenTags).toEqual(['areas', 'misc']);
        expect(activeProfile.hiddenFileTags).toEqual(['areas', 'misc']);
        expect(settings.vaultProfiles[1].hiddenTags).toEqual(['areas/client', '*draft']);
        expect(settings.vaultProfiles[1].hiddenFileTags).toEqual(['areas/client', '*draft']);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('updates descendant wildcard tag rules ending with /* on rename', async () => {
        const settings = createSettings();
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['projects/*', 'projects/client'];
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagRename('projects', 'areas');

        expect(activeProfile.hiddenTags).toEqual(['areas/*', 'areas/client']);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('updates mid-segment wildcard tag patterns during rename', async () => {
        const settings = createSettings();
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['projects/*/drafts', 'temp*', '*draft'];
        settings.vaultProfiles.push(
            createVaultProfile('secondary', {
                id: 'secondary',
                hiddenTags: ['projects/research*', 'keep']
            })
        );

        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagRename('projects', 'areas');

        expect(activeProfile.hiddenTags).toEqual(['areas/*/drafts', 'temp*', '*draft']);
        expect(settings.vaultProfiles[1].hiddenTags).toEqual(['areas/research*', 'keep']);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('does not rewrite name-based wildcard patterns on rename', async () => {
        const settings = createSettings();
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['draft*', '*review', 'keep'];
        settings.vaultProfiles.push(
            createVaultProfile('secondary', {
                id: 'secondary',
                hiddenTags: ['*review', 'draft*', 'misc']
            })
        );

        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagRename('draft', 'approved');

        expect(activeProfile.hiddenTags).toEqual(['draft*', '*review', 'keep']);
        expect(settings.vaultProfiles[1].hiddenTags).toEqual(['*review', 'draft*', 'misc']);
        expect(provider.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });
});

describe('TagMetadataService.handleTagDelete', () => {
    const app = new App();

    it('removes metadata and hidden tags for deleted hierarchy', async () => {
        const settings = createSettings();
        settings.tagColors = { project: '#ff0000', other: '#00ff00' };
        settings.tagIcons = { 'project/archive': 'lucide-archive' };
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['project', 'archive'];
        activeProfile.hiddenFileTags = ['project', 'archive'];
        settings.vaultProfiles.push(
            createVaultProfile('secondary', {
                id: 'secondary',
                hiddenTags: ['project/client'],
                hiddenFileTags: ['project/client']
            })
        );
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagDelete('project');

        expect(settings.tagColors).toEqual({ other: '#00ff00' });
        expect(settings.tagIcons).toEqual({});
        expect(activeProfile.hiddenTags).toEqual(['archive']);
        expect(activeProfile.hiddenFileTags).toEqual(['archive']);
        expect(settings.vaultProfiles[1].hiddenTags).toEqual([]);
        expect(settings.vaultProfiles[1].hiddenFileTags).toEqual([]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('skips work when no metadata matches deleted tag', async () => {
        const settings = createSettings();
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagDelete('project');

        expect(provider.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });

    it('removes mid-segment wildcard hidden tag patterns on delete when the literal prefix matches', async () => {
        const settings = createSettings();
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['projects/*/drafts', 'keep*', '*draft'];
        settings.vaultProfiles.push(
            createVaultProfile('secondary', {
                id: 'secondary',
                hiddenTags: ['projects/research*', 'misc']
            })
        );

        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagDelete('projects');

        expect(activeProfile.hiddenTags).toEqual(['keep*', '*draft']);
        expect(settings.vaultProfiles[1].hiddenTags).toEqual(['misc']);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('removes descendant wildcard hidden tag rules ending with /* on delete', async () => {
        const settings = createSettings();
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['projects/*', 'projects/client', 'keep'];
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagDelete('projects');

        expect(activeProfile.hiddenTags).toEqual(['keep']);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('keeps name-based wildcard hidden tag patterns on delete', async () => {
        const settings = createSettings();
        const activeProfile = settings.vaultProfiles[0];
        activeProfile.hiddenTags = ['draft*', '*draft', 'keep'];
        settings.vaultProfiles.push(
            createVaultProfile('secondary', {
                id: 'secondary',
                hiddenTags: ['*draft', 'draft*', 'other']
            })
        );

        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        await service.handleTagDelete('draft');

        expect(activeProfile.hiddenTags).toEqual(['draft*', '*draft', 'keep']);
        expect(settings.vaultProfiles[1].hiddenTags).toEqual(['*draft', 'draft*', 'other']);
        expect(provider.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });
});

describe('TagMetadataService.cleanupWithValidators', () => {
    const app = new App();

    it('removes stale tag metadata when processed cache data contains no tags', async () => {
        const settings = createSettings();
        settings.tagColors = { stale: '#ff0000' };
        const provider = new TestSettingsProvider(settings);
        const service = new TagMetadataService(app, provider, () => null);

        const changes = await service.cleanupWithValidators(createValidators([createMarkdownFile('Note.md', [])]), settings);

        expect(changes).toEqual({ settingsChanged: true, localChanged: false });
        expect(settings.tagColors).toEqual({});
    });

    it('keeps collapsed state for virtual tag contexts during cleanup', async () => {
        const settings = createSettings();
        const provider = new TestSettingsProvider(settings);
        provider.collapsedPinnedContexts = {
            [`tag:${TAGGED_TAG_ID}`]: true,
            [`tag:${UNTAGGED_TAG_ID}`]: true,
            'tag:stale': true
        };
        const service = new TagMetadataService(app, provider, () => null);

        const changes = await service.cleanupWithValidators(createValidators([createMarkdownFile('Note.md', [])]), settings);

        expect(changes).toEqual({ settingsChanged: false, localChanged: true });
        expect(provider.collapsedPinnedContexts).toEqual({
            [`tag:${TAGGED_TAG_ID}`]: true,
            [`tag:${UNTAGGED_TAG_ID}`]: true
        });
    });
});
