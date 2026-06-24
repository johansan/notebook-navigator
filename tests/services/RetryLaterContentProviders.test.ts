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
import { App, TFile } from 'obsidian';
import { LIMITS } from '../../src/constants/limits';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import { TagContentProvider } from '../../src/services/content/TagContentProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { getDrawingDirectFeatureImageKey } from '../../src/utils/drawingFeatureImages';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';

class TestTagContentProvider extends TagContentProvider {
    async runProcessFile(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        return await this.processFile({ file, path: file.path }, fileData, settings);
    }
}

class TestMarkdownPipelineContentProvider extends MarkdownPipelineContentProvider {
    async runProcessFile(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        return await this.processFile({ file, path: file.path }, fileData, settings);
    }
}

describe('Content provider retry-later semantics', () => {
    it('TagContentProvider returns processed:false when metadata cache is missing', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => null;

        const provider = new TestTagContentProvider(app);
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        const settings: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, showTags: true };

        const result = await provider.runProcessFile(file, null, settings);

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });

    it('TagContentProvider defers clearing tags when tags mtime is reset and getAllTags returns null', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestTagContentProvider(app);
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 123;
        const settings: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, showTags: true };
        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime,
            tagsMtime: 0,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: ['old-tag'],
            wordCount: null,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: null,
            metadata: {}
        };

        // Returns processed:false initially so BaseContentProvider schedules a retry.
        const first = await provider.runProcessFile(file, fileData, settings);

        expect(first.processed).toBe(false);
        expect(first.update).toBeNull();

        const second = await provider.runProcessFile(file, fileData, settings);

        expect(second.processed).toBe(false);
        expect(second.update).toBeNull();

        // After the retry limit is reached, empty tags are treated as authoritative and the cached tags are cleared.
        const third = await provider.runProcessFile(file, fileData, settings);

        expect(third.processed).toBe(true);
        expect(third.update).toEqual({ path: file.path, tags: [] });
    });

    it('TagContentProvider clears tags when file mtime changed and getAllTags returns null', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestTagContentProvider(app);
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 200;
        const settings: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, showTags: true };
        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime,
            tagsMtime: 100,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: ['old-tag'],
            wordCount: null,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: null,
            metadata: {}
        };

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(true);
        expect(result.update).toEqual({ path: file.path, tags: [] });
    });

    it('TagContentProvider defers initial empty tags for recently created files', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestTagContentProvider(app);
        const file = new TFile();
        file.path = 'notes/recent.md';
        file.extension = 'md';
        file.stat.mtime = Date.now();
        const settings: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, showTags: true };
        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime,
            tagsMtime: 0,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: null,
            wordCount: null,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: null,
            metadata: {}
        };

        const first = await provider.runProcessFile(file, fileData, settings);
        expect(first.processed).toBe(false);
        expect(first.update).toBeNull();

        const second = await provider.runProcessFile(file, fileData, settings);
        expect(second.processed).toBe(false);
        expect(second.update).toBeNull();

        const third = await provider.runProcessFile(file, fileData, settings);
        expect(third.processed).toBe(true);
        expect(third.update).toEqual({ path: file.path, tags: [] });
    });

    it('TagContentProvider does not defer initial empty tags outside recent file window', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestTagContentProvider(app);
        const file = new TFile();
        file.path = 'notes/older.md';
        file.extension = 'md';
        file.stat.mtime = Date.now() - 20_000;
        const settings: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, showTags: true };
        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime,
            tagsMtime: 0,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: null,
            wordCount: null,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: null,
            metadata: {}
        };

        const result = await provider.runProcessFile(file, fileData, settings);
        expect(result.processed).toBe(true);
        expect(result.update).toEqual({ path: file.path, tags: [] });
    });

    it('MarkdownPipelineContentProvider returns processed:false when metadata cache is missing', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => null;

        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        const settings: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS, showFilePreview: true };

        const result = await provider.runProcessFile(file, null, settings);

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });

    it('MarkdownPipelineContentProvider defers preview extraction until preview-property frontmatter is ready', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = new TFile();
        file.path = 'notes/recent.md';
        file.extension = 'md';
        file.name = 'recent.md';
        file.stat.mtime = Date.now();
        app.vault.cachedRead = async () => 'Body fallback';

        const settings: NotebookNavigatorSettings = {
            ...DEFAULT_SETTINGS,
            showFilePreview: true,
            previewProperties: ['summary'],
            previewPropertiesFallback: false
        };

        const result = await provider.runProcessFile(file, null, settings);

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });

    it('MarkdownPipelineContentProvider defers preview refresh for modified notes until preview-property frontmatter is ready', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = new TFile();
        file.path = 'notes/existing.md';
        file.extension = 'md';
        file.name = 'existing.md';
        file.stat.mtime = Date.now();
        app.vault.cachedRead = async () => 'Body fallback';

        const settings: NotebookNavigatorSettings = {
            ...DEFAULT_SETTINGS,
            showFilePreview: true,
            previewProperties: ['summary'],
            previewPropertiesFallback: false
        };
        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime - 1,
            tagsMtime: file.stat.mtime,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: [],
            wordCount: 10,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'has',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: '',
            metadata: {}
        };

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });

    it('MarkdownPipelineContentProvider defers property refresh for modified notes until property frontmatter is ready', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = new TFile();
        file.path = 'notes/properties.md';
        file.extension = 'md';
        file.name = 'properties.md';
        file.stat.mtime = Date.now();
        app.vault.cachedRead = async () => 'hello world';

        const settings: NotebookNavigatorSettings = {
            ...DEFAULT_SETTINGS,
            showFilePreview: false,
            showFeatureImage: false
        };
        setActivePropertyFields(settings, 'status');

        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime - 1,
            tagsMtime: file.stat.mtime,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: [],
            wordCount: 2,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: [{ fieldKey: 'status', value: 'Active', valueKind: 'string' }],
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: '',
            metadata: {}
        };

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });

    it('MarkdownPipelineContentProvider defers feature-image refresh for modified notes until feature-image frontmatter is ready', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = new TFile();
        file.path = 'notes/feature-image.md';
        file.extension = 'md';
        file.name = 'feature-image.md';
        file.stat.mtime = Date.now();
        app.vault.cachedRead = async () => 'hello world';

        const settings: NotebookNavigatorSettings = {
            ...DEFAULT_SETTINGS,
            showFilePreview: false,
            showFeatureImage: true,
            featureImageProperties: ['thumbnail']
        };

        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime - 1,
            tagsMtime: file.stat.mtime,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: [],
            wordCount: 2,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: [],
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'has',
            featureImageKey: 'f:images/cover.png@1',
            metadata: {}
        };

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });

    it('MarkdownPipelineContentProvider processes frontmatter-based Excalidraw notes when metadata frontmatter is missing', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = new TFile();
        file.path = 'notes/sketch.md';
        file.extension = 'md';
        file.name = 'sketch.md';
        file.stat.mtime = Date.now() - 20_000;
        app.vault.cachedRead = async () => '---\nexcalidraw-plugin: parsed\n---\n# Heading\n- [ ] task\n';

        const settings: NotebookNavigatorSettings = {
            ...DEFAULT_SETTINGS,
            showFilePreview: true,
            showFeatureImage: true,
            textCountDisplay: 'words'
        };

        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime - 1,
            tagsMtime: file.stat.mtime,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: [],
            wordCount: 12,
            taskTotal: 3,
            taskUnfinished: 2,
            properties: [],
            previewStatus: 'unprocessed',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: '',
            metadata: {}
        };

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(true);
        expect(result.update?.path).toBe(file.path);
        expect(result.update?.preview).toBe('');
        expect(result.update?.wordCount).toBe(0);
        expect(result.update?.taskTotal).toBe(0);
        expect(result.update?.taskUnfinished).toBe(0);
        expect(result.update?.featureImageKey).toBe(getDrawingDirectFeatureImageKey(file, 'excalidraw'));
        expect(result.update?.featureImage).toBeInstanceOf(Blob);
    });

    it('MarkdownPipelineContentProvider defers large frontmatter-based Excalidraw feature-image refresh until metadata frontmatter is ready', async () => {
        const app = new App();
        app.metadataCache.getFileCache = () => ({});

        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = new TFile();
        file.path = 'notes/large-sketch.md';
        file.extension = 'md';
        file.name = 'large-sketch.md';
        file.stat.mtime = Date.now();
        file.stat.size = LIMITS.markdown.maxReadBytes.desktop + 1;
        app.vault.cachedRead = async () => '---\nexcalidraw-plugin: parsed\n---\n';

        const settings: NotebookNavigatorSettings = {
            ...DEFAULT_SETTINGS,
            showFilePreview: false,
            showFeatureImage: true
        };

        const fileData: FileData = {
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime - 1,
            tagsMtime: file.stat.mtime,
            metadataMtime: file.stat.mtime,
            fileThumbnailsMtime: file.stat.mtime,
            tags: [],
            wordCount: 0,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: [],
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'has',
            featureImageKey: `x:${file.path}@1`,
            metadata: {}
        };

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });
});
