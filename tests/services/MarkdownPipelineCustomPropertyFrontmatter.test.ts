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
import { describe, expect, it } from 'vitest';
import { App, TFile, type CachedMetadata, type FrontMatterCache } from 'obsidian';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { deriveFileMetadata } from '../utils/pathMetadata';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';

class TestMarkdownPipelineContentProvider extends MarkdownPipelineContentProvider {
    async runCustomProperty(file: TFile, settings: NotebookNavigatorSettings): Promise<FileData['properties'] | null> {
        const result = await this.processFile({ file, path: file.path }, null, settings);
        return result.update?.properties ?? null;
    }
}

function createSettings(overrides: Partial<NotebookNavigatorSettings> & { propertyFields?: string }): NotebookNavigatorSettings {
    const { propertyFields, ...settingsOverrides } = overrides;
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.showFilePreview = false;
    settings.showFeatureImage = false;
    Object.assign(settings, settingsOverrides);

    if (typeof propertyFields === 'string') {
        setActivePropertyFields(settings, propertyFields);
    }

    return settings;
}

function createApp() {
    const app = new App();
    const cachedMetadataByPath = new Map<string, CachedMetadata>();

    app.metadataCache.getFileCache = (file: TFile) => cachedMetadataByPath.get(file.path) ?? null;
    app.vault.cachedRead = async (_file: TFile) => '';

    return { app, cachedMetadataByPath };
}

function createFile(path: string): TFile {
    const file = new TFile();
    const metadata = deriveFileMetadata(path);
    file.path = path;
    file.name = metadata.name;
    file.basename = metadata.basename;
    file.extension = metadata.extension;
    return file;
}

function setFrontmatter(context: ReturnType<typeof createApp>, file: TFile, frontmatter: FrontMatterCache): void {
    const metadata: CachedMetadata = { frontmatter };
    context.cachedMetadataByPath.set(file.path, metadata);
}

describe('MarkdownPipelineContentProvider frontmatter custom properties', () => {
    // Custom property items persist the source field key, raw value, and value kind; styling is derived at render time.
    it('returns multiple properties as pills', async () => {
        const context = createApp();
        const settings = createSettings({ propertyFields: 'status, type' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setFrontmatter(context, file, { status: 'Active', type: 'Project' });
        const result = await provider.runCustomProperty(file, settings);

        expect(result).toEqual([
            { fieldKey: 'status', value: 'Active', valueKind: 'string' },
            { fieldKey: 'type', value: 'Project', valueKind: 'string' }
        ]);
    });

    it('indexes supported properties that are not configured for display', async () => {
        const context = createApp();
        const settings = createSettings({ propertyFields: 'status' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setFrontmatter(context, file, { status: 'Active', workflow: 'Waiting' });
        const result = await provider.runCustomProperty(file, settings);

        expect(result).toEqual([
            { fieldKey: 'status', value: 'Active', valueKind: 'string' },
            { fieldKey: 'workflow', value: 'Waiting', valueKind: 'string' }
        ]);
    });

    it('flattens list values into multiple pills', async () => {
        const context = createApp();
        const settings = createSettings({ propertyFields: 'status, type' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setFrontmatter(context, file, { status: ['A', 'B'], type: 'Project' });
        const result = await provider.runCustomProperty(file, settings);

        expect(result).toEqual([
            { fieldKey: 'status', value: 'A', valueKind: 'string' },
            { fieldKey: 'status', value: 'B', valueKind: 'string' },
            { fieldKey: 'type', value: 'Project', valueKind: 'string' }
        ]);
    });

    it('does not persist presentation data in custom property items', async () => {
        const context = createApp();
        const settings = createSettings({
            propertyFields: 'status, type'
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setFrontmatter(context, file, { status: 'Active', type: 'Project' });
        const result = await provider.runCustomProperty(file, settings);

        expect(result).toEqual([
            { fieldKey: 'status', value: 'Active', valueKind: 'string' },
            { fieldKey: 'type', value: 'Project', valueKind: 'string' }
        ]);
    });

    it('preserves value kind metadata for string and boolean literals', async () => {
        const context = createApp();
        const settings = createSettings({ propertyFields: 'status, flag' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setFrontmatter(context, file, { status: 'true', flag: true });
        const result = await provider.runCustomProperty(file, settings);

        expect(result).toEqual([
            { fieldKey: 'status', value: 'true', valueKind: 'string' },
            { fieldKey: 'flag', value: 'true', valueKind: 'boolean' }
        ]);
    });

    it('preserves value kind metadata for numeric literals', async () => {
        const context = createApp();
        const settings = createSettings({ propertyFields: 'rating, count' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setFrontmatter(context, file, { rating: 4.5, count: 2 });
        const result = await provider.runCustomProperty(file, settings);

        expect(result).toEqual([
            { fieldKey: 'rating', value: '4.5', valueKind: 'number' },
            { fieldKey: 'count', value: '2', valueKind: 'number' }
        ]);
    });

    it('treats null frontmatter values as unassigned', async () => {
        const context = createApp();
        const settings = createSettings({ propertyFields: 'status, type' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setFrontmatter(context, file, { status: null, type: 'Project' });
        const result = await provider.runCustomProperty(file, settings);

        expect(result).toEqual([
            { fieldKey: 'status', value: '' },
            { fieldKey: 'type', value: 'Project', valueKind: 'string' }
        ]);
    });
});
