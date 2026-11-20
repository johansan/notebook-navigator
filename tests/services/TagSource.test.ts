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
import { App, TFile, type CachedMetadata } from 'obsidian';

const { mockLocalStorageStore } = vi.hoisted(() => ({ mockLocalStorageStore: new Map<string, unknown>() }));

vi.mock('../../src/utils/localStorage', () => ({
    localStorage: {
        get: (key: string) => mockLocalStorageStore.get(key) ?? null,
        set: (key: string, value: unknown) => mockLocalStorageStore.set(key, value),
        remove: (key: string) => mockLocalStorageStore.delete(key)
    }
}));

import { TagContentProvider } from '../../src/services/content/TagContentProvider';
import { collectRenameFiles, TagDescriptor } from '../../src/services/tagRename/TagRenameEngine';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { getTagSourceCache, markTagSourceCacheCurrent } from '../../src/utils/tagSourceCache';
import { buildAllSourcesTagTreeFromMetadataCache } from '../../src/utils/tagTree';
import { getMetadataTags } from '../../src/utils/tagUtils';
import { createTestTFile } from '../utils/createTestTFile';

class TestTagContentProvider extends TagContentProvider {
    async runProcessFile(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        return await this.processFile({ file, path: file.path }, fileData, settings);
    }
}

// Mirrors Obsidian's split: frontmatter tags in `frontmatter.tags`, inline body tags in `tags` with positions
function createMetadata(frontmatterTags: string[], inlineTags: string[]): CachedMetadata {
    const position = { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } };
    return {
        frontmatter: frontmatterTags.length > 0 ? { tags: frontmatterTags } : undefined,
        tags: inlineTags.map(tag => ({ tag, position }))
    };
}

function createVault(metadataByPath: Record<string, CachedMetadata>): App {
    const app = new App();
    const files = Object.keys(metadataByPath).map(path => createTestTFile(path));
    app.vault.getMarkdownFiles = () => files;
    Object.assign(app.metadataCache, {
        getCache: (path: string) => metadataByPath[path] ?? null,
        getFileCache: (file: TFile) => metadataByPath[file.path] ?? null
    });
    return app;
}

describe('Tag source', () => {
    it('reads frontmatter and body tags, or only frontmatter tags', () => {
        const metadata = createMetadata(['project'], ['#inbox', '#project']);

        expect(getMetadataTags(metadata, 'all')).toEqual(['#inbox', '#project']);
        expect(getMetadataTags(metadata, 'frontmatter')).toEqual(['project']);
        expect(getMetadataTags(createMetadata([], ['#inbox']), 'frontmatter')).toBeNull();
    });

    it('caches only frontmatter tags with the frontmatter source', async () => {
        const app = createVault({ 'Notes/Note.md': createMetadata(['project'], ['#inbox']) });
        const provider = new TestTagContentProvider(app);
        const file = createTestTFile('Notes/Note.md');

        const all = await provider.runProcessFile(file, null, { ...DEFAULT_SETTINGS, tagSource: 'all' });
        const frontmatter = await provider.runProcessFile(file, null, { ...DEFAULT_SETTINGS, tagSource: 'frontmatter' });

        expect(all.update).toEqual({ path: file.path, tags: ['inbox', 'project'] });
        expect(frontmatter.update).toEqual({ path: file.path, tags: ['project'] });
    });

    it('regenerates cached tags when the source changes while tags are shown', () => {
        const provider = new TagContentProvider(new App());
        const all: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, tagSource: 'all' };
        const frontmatter: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, tagSource: 'frontmatter' };

        expect(provider.shouldRegenerate(all, frontmatter)).toBe(true);
        expect(provider.shouldRegenerate({ ...all, showTags: false }, { ...frontmatter, showTags: false })).toBe(false);
    });

    it('collects rename and delete targets from frontmatter only, without inline positions', () => {
        const app = createVault({
            'Notes/Both.md': createMetadata(['project'], ['#project']),
            'Notes/Body.md': createMetadata([], ['#project'])
        });
        const tag = new TagDescriptor('project');

        const allTargets = collectRenameFiles(app, tag, 'all');
        const frontmatterTargets = collectRenameFiles(app, tag, 'frontmatter');

        expect(allTargets.map(target => target.filePath).sort()).toEqual(['Notes/Body.md', 'Notes/Both.md']);
        expect(frontmatterTargets.map(target => target.filePath)).toEqual(['Notes/Both.md']);
        expect(Reflect.get(frontmatterTargets[0], 'tagPositions')).toEqual([]);
    });

    it('validates metadata cleanup against body tags too', () => {
        const app = createVault({ 'Notes/Note.md': createMetadata(['project'], ['#inbox/today']) });

        const tree = buildAllSourcesTagTreeFromMetadataCache(app);

        expect(Array.from(tree.keys()).sort()).toEqual(['inbox', 'project']);
        expect(tree.get('inbox')?.children.has('inbox/today')).toBe(true);
    });

    it('treats a missing tag source record as a cache built from all sources', () => {
        mockLocalStorageStore.clear();
        expect(getTagSourceCache()).toBe('all');

        markTagSourceCacheCurrent('frontmatter');
        expect(getTagSourceCache()).toBe('frontmatter');

        markTagSourceCacheCurrent('all');
        expect(mockLocalStorageStore.size).toBe(0);
        expect(getTagSourceCache()).toBe('all');
    });
});
