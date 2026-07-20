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

class TestMarkdownPipelineContentProvider extends MarkdownPipelineContentProvider {
    shouldProcess(fileData: FileData | null, file: TFile, settings: NotebookNavigatorSettings): boolean {
        return this.needsProcessing(fileData, file, settings);
    }

    async runTasks(
        file: TFile,
        fileData: FileData | null,
        settings: NotebookNavigatorSettings
    ): Promise<{ total: number; unfinished: number } | null> {
        const result = await this.processFile({ file, path: file.path }, fileData, settings);
        const total = result.update?.taskTotal;
        const unfinished = result.update?.taskUnfinished;
        if (typeof total !== 'number' || typeof unfinished !== 'number') {
            return null;
        }
        return { total, unfinished };
    }

    async runProcessFile(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        return await this.processFile({ file, path: file.path }, fileData, settings);
    }
}

function createSettings(overrides?: Partial<NotebookNavigatorSettings>): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        showFilePreview: false,
        showFeatureImage: false,
        ...overrides
    };
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
    if (/^(?:>\s*)*(?:[-*]|\d+\.)\s+\[[^\]]?\]/m.test(content)) {
        metadata.listItems = [
            {
                parent: -1,
                position: {
                    start: { line: 0, col: 0, offset: 0 },
                    end: { line: 0, col: 10, offset: 10 }
                },
                task: ' '
            }
        ];
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
        wordCount: 0,
        characterCountWithSpaces: 0,
        characterCountWithoutSpaces: 0,
        taskTotal: null,
        taskUnfinished: null,
        properties: [],
        previewStatus: 'unprocessed',
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: null,
        ...overrides
    };
}

function createTaskMetadata(tasks: string[]): CachedMetadata {
    return {
        listItems: tasks.map((task, index) => ({
            parent: -index,
            position: {
                start: { line: index, col: 0, offset: index },
                end: { line: index, col: 10, offset: index + 10 }
            },
            task
        }))
    };
}

describe('MarkdownPipelineContentProvider task counters', () => {
    it('processes stale files with no task items so property metadata can refresh', () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        context.cachedMetadataByPath.set(file.path, { listItems: [] });

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            taskTotal: 0,
            taskUnfinished: 0
        });

        expect(provider.shouldProcess(fileData, file, settings)).toBe(true);
    });

    it('processes stale files with no list items so property metadata can refresh', () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        context.cachedMetadataByPath.set(file.path, {});

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            taskTotal: 0,
            taskUnfinished: 0
        });

        expect(provider.shouldProcess(fileData, file, settings)).toBe(true);
    });

    it('processes recent frontmatter-free files without metadata-cache retries', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = Date.now();
        context.cachedMetadataByPath.set(file.path, { listItems: [] });

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime - 1,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: []
        });

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result).toEqual({ update: null, processed: true });
    });

    it('processes stale task-only files when metadata contains task items', () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        context.cachedMetadataByPath.set(file.path, createTaskMetadata([' ', 'x']));

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            taskTotal: 2,
            taskUnfinished: 1
        });

        expect(provider.shouldProcess(fileData, file, settings)).toBe(true);
    });

    it('counts list item checkboxes with supported markers', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        setMarkdownContent(context, file, '- [ ] one\n* [x] two\n1. [X] three\n');
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 3, unfinished: 1 });
    });

    it('ignores empty checkbox list items', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        setMarkdownContent(context, file, '- [ ]\n- [ ]   \n* [x]\n1. [ ] task\n');
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 1, unfinished: 1 });
    });

    it('ignores plus markers and non-list checkboxes', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        setMarkdownContent(context, file, '+ [ ] plus\n[ ] not list\n- [ ] counted\n');
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 1, unfinished: 1 });
    });

    it('ignores YAML frontmatter', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        setMarkdownContent(context, file, '---\n- [ ] frontmatter\n---\n- [ ] body\n');
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 1, unfinished: 1 });
    });

    it('ignores fenced code blocks', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        setMarkdownContent(context, file, '- [ ] outside\n```ts\n- [ ] inside\n1. [X] inside\n```\n* [x] outside\n');
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 2, unfinished: 1 });
    });

    it('ignores fenced code blocks inside blockquotes', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        setMarkdownContent(context, file, '> ```md\n> - [ ] inside quote fence\n> ```\n- [ ] outside\n');
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 1, unfinished: 1 });
    });

    it('handles deep blockquote prefixes', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        const blockquotePrefix = '> '.repeat(120);
        setMarkdownContent(
            context,
            file,
            `${blockquotePrefix}not a task\n${blockquotePrefix}- [ ] outside\n${blockquotePrefix}* [x] done\n`
        );
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 2, unfinished: 1 });
    });

    it('handles very long blockquote prefixes', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 100;

        const blockquotePrefix = '> '.repeat(5000);
        setMarkdownContent(
            context,
            file,
            `${blockquotePrefix}not a task\n${blockquotePrefix}- [ ] outside\n${blockquotePrefix}* [x] done\n`
        );
        const fileData = createFileData({ mtime: file.stat.mtime, markdownPipelineMtime: file.stat.mtime });
        const result = await provider.runTasks(file, fileData, settings);

        expect(result).toEqual({ total: 2, unfinished: 1 });
    });

    it('sets 0/0 for stale tasks when file is too large to read', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = LIMITS.markdown.maxReadBytes.desktop + 1;
        context.cachedMetadataByPath.set(file.path, createTaskMetadata([' ']));

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            taskTotal: 5,
            taskUnfinished: 2
        });

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(true);
        expect(result.update).toEqual({ path: file.path, taskTotal: 0, taskUnfinished: 0 });
    });

    it('sets 0/0 for pending tasks when file is too large to read', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = LIMITS.markdown.maxReadBytes.desktop + 1;
        context.cachedMetadataByPath.set(file.path, createTaskMetadata([' ']));

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime,
            taskTotal: null,
            taskUnfinished: null
        });

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(true);
        expect(result.update).toEqual({ path: file.path, taskTotal: 0, taskUnfinished: 0 });
    });

    it('falls back to safe defaults after repeated read failures', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = 1;

        context.cachedMetadataByPath.set(file.path, createTaskMetadata([' ']));
        context.app.vault.cachedRead = async () => {
            throw new Error('read failed');
        };

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            taskTotal: 5,
            taskUnfinished: 2
        });

        for (let attempt = 0; attempt < LIMITS.contentProvider.retry.maxAttempts - 1; attempt += 1) {
            const result = await provider.runProcessFile(file, fileData, settings);
            expect(result.processed).toBe(false);
            expect(result.update).toBeNull();
        }

        const result = await provider.runProcessFile(file, fileData, settings);
        expect(result.processed).toBe(true);
        expect(result.update).toEqual({ path: file.path, taskTotal: 0, taskUnfinished: 0 });
    });

    it('sets 0/0 immediately when pending tasks cannot be read', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = 1;

        context.cachedMetadataByPath.set(file.path, createTaskMetadata([' ']));
        context.app.vault.cachedRead = async () => {
            throw new Error('read failed');
        };

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: file.stat.mtime,
            taskTotal: null,
            taskUnfinished: null
        });

        const result = await provider.runProcessFile(file, fileData, settings);
        expect(result.processed).toBe(false);
        expect(result.update).toEqual({ path: file.path, taskTotal: 0, taskUnfinished: 0 });
    });
});
