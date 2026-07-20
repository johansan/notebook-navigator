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
import { App, TFile, type CachedMetadata } from 'obsidian';
import { LIMITS } from '../../src/constants/limits';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { deriveFileMetadata } from '../utils/pathMetadata';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';

class TestMarkdownPipelineContentProvider extends MarkdownPipelineContentProvider {
    async runWordCount(file: TFile, settings: NotebookNavigatorSettings): Promise<number | null> {
        const result = await this.processFile({ file, path: file.path }, null, settings);
        return result.update?.wordCount ?? null;
    }

    async runProcessFile(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        return await this.processFile({ file, path: file.path }, fileData, settings);
    }
}

function createSettings(overrides?: Partial<NotebookNavigatorSettings> & { propertyFields?: string }): NotebookNavigatorSettings {
    const { propertyFields, ...settingsOverrides } = overrides ?? {};
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.showFilePreview = false;
    settings.showFeatureImage = false;
    settings.textCountDisplay = 'both';
    settings.wordCountTargetProperty = '';
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

function createFrontmatterPosition(bodyStartIndex: number): CachedMetadata['frontmatterPosition'] {
    return {
        start: { line: 0, col: 0, offset: 0 },
        end: { line: 0, col: 0, offset: bodyStartIndex }
    };
}

function extractFrontmatterBodyStartIndex(content: string): number | null {
    const firstLineEnd = content.indexOf('\n');
    const firstLine = firstLineEnd === -1 ? content : content.slice(0, firstLineEnd);
    const normalizedFirstLine = firstLine.charCodeAt(0) === 0xfeff ? firstLine.slice(1) : firstLine;

    if (normalizedFirstLine.trim() !== '---' || firstLineEnd === -1) {
        return null;
    }

    const yamlStart = firstLineEnd + 1;
    let lineStart = yamlStart;
    while (lineStart <= content.length) {
        const nextLineEnd = content.indexOf('\n', lineStart);
        const lineEnd = nextLineEnd === -1 ? content.length : nextLineEnd;
        const line = content.slice(lineStart, lineEnd);
        const trimmed = line.trim();

        if (trimmed === '---' || trimmed === '...') {
            return nextLineEnd === -1 ? content.length : lineEnd + 1;
        }

        if (nextLineEnd === -1) {
            break;
        }

        lineStart = lineEnd + 1;
    }

    return null;
}

function setMarkdownContent(context: ReturnType<typeof createApp>, file: TFile, content: string): void {
    context.app.vault.cachedRead = async (target: TFile) => {
        return target.path === file.path ? content : '';
    };

    const metadata: CachedMetadata = {};
    const bodyStartIndex = extractFrontmatterBodyStartIndex(content);
    if (typeof bodyStartIndex === 'number' && bodyStartIndex > 0) {
        metadata.frontmatterPosition = createFrontmatterPosition(bodyStartIndex);
    }

    context.cachedMetadataByPath.set(file.path, metadata);
}

function createFileData(overrides: Partial<FileData>): FileData {
    return {
        mtime: 0,
        markdownPipelineMtime: 0,
        tagsMtime: 0,
        metadataMtime: 0,
        fileThumbnailsMtime: 0,
        tags: null,
        wordCount: null,
        characterCountWithSpaces: null,
        characterCountWithoutSpaces: null,
        taskTotal: 0,
        taskUnfinished: 0,
        properties: [],
        previewStatus: 'unprocessed',
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: null,
        ...overrides
    };
}

describe('MarkdownPipelineContentProvider word count', () => {
    it('counts basic words', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'Hello world');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('clears stale preview and word count when file is too large to read', async () => {
        const context = createApp();
        const settings = createSettings({
            showFilePreview: true,
            showFeatureImage: false,
            propertyFields: ''
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = LIMITS.markdown.maxReadBytes.desktop + 1;

        setMarkdownContent(context, file, '');

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            wordCount: 123,
            previewStatus: 'has',
            featureImageStatus: 'none',
            featureImageKey: ''
        });

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(true);
        expect(result.update).toEqual({
            path: file.path,
            wordCount: 0,
            characterCountWithSpaces: 0,
            characterCountWithoutSpaces: 0,
            preview: ''
        });
    });

    it('falls back to safe defaults after repeated read failures', async () => {
        const context = createApp();
        const settings = createSettings({
            showFilePreview: true,
            showFeatureImage: false,
            propertyFields: ''
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = 1;

        context.cachedMetadataByPath.set(file.path, {});
        context.app.vault.cachedRead = async () => {
            throw new Error('read failed');
        };

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            wordCount: 123,
            characterCountWithSpaces: 456,
            characterCountWithoutSpaces: 400,
            previewStatus: 'has',
            featureImageStatus: 'none',
            featureImageKey: ''
        });

        for (let attempt = 0; attempt < LIMITS.contentProvider.retry.maxAttempts - 1; attempt += 1) {
            const result = await provider.runProcessFile(file, fileData, settings);
            expect(result.processed).toBe(false);
            expect(result.update).toBeNull();
        }

        const result = await provider.runProcessFile(file, fileData, settings);
        expect(result.processed).toBe(true);
        expect(result.update).toEqual({
            path: file.path,
            wordCount: 0,
            characterCountWithSpaces: 0,
            characterCountWithoutSpaces: 0,
            preview: ''
        });
    });

    it('counts hyphens and apostrophes as part of a word', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, "don't mother-in-law");
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('groups numbers with separators and adjacent letters', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'GPT-5.2 is 1,000x');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(3);
    });

    it('counts CJK characters individually inside mixed runs', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'HunyuanOCR开源模型');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(5);
    });

    it('counts punctuation between CJK characters as a word token', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '汉-汉');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(3);
    });

    it('counts Hangul as word-forming content', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '한글 테스트');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('does not count left single quote as part of a word', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'don\u2018t');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('counts BMP words next to Math Alphanumeric Symbols', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'A\u{1D400}');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(1);
    });

    it('skips frontmatter by using the body start index', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '---\nwords: should not count\n---\nHello world');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('skips character counts when character counts are hidden', async () => {
        const context = createApp();
        const settings = createSettings({ textCountDisplay: 'none' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '---\ntitle: Draft\n---\n\nBody');
        const result = await provider.runProcessFile(file, null, settings);

        expect(result.update?.characterCountWithSpaces).toBeUndefined();
        expect(result.update?.characterCountWithoutSpaces).toBeUndefined();
    });

    it('counts words for sort-activated custom group headers when file counts are hidden', async () => {
        const context = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'title-asc'
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'Hello group header');
        const result = await provider.runProcessFile(file, null, settings);

        expect(result.update?.wordCount).toBe(3);
    });

    it('counts isolated punctuation when Math Alphanumeric Symbols are present', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '\u{1D400}-\u{1D401}');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(1);
    });

    it('does not count Math Alphanumeric Symbols without isolated punctuation', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '\u{1D400}\u{1D401}');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(0);
    });
});
