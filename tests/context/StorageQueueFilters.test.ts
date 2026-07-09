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
import { App, TFile } from 'obsidian';
import type { CachedMetadata, ListItemCache } from 'obsidian';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { ContentProviderType } from '../../src/interfaces/IContentProvider';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { filterFilesRequiringFileThumbnails, filterFilesRequiringMetadataSources } from '../../src/context/storageQueueFilters';
import { getDrawingDirectFeatureImageKey } from '../../src/utils/drawingFeatureImages';

class FakeDB {
    private readonly files = new Map<string, FileData>();

    setFile(path: string, data: FileData): void {
        this.files.set(path, data);
    }

    getFiles(paths: string[]): Map<string, FileData> {
        const result = new Map<string, FileData>();
        for (const path of paths) {
            const record = this.files.get(path);
            if (record) {
                result.set(path, record);
            }
        }
        return result;
    }
}

let db: FakeDB;

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstance: () => db
}));

function createFileData(overrides: Partial<FileData>): FileData {
    return {
        mtime: 0,
        markdownPipelineMtime: 0,
        tagsMtime: 0,
        metadataMtime: 0,
        fileThumbnailsMtime: 0,
        tags: null,
        wordCount: null,
        taskTotal: 0,
        taskUnfinished: 0,
        properties: null,
        previewStatus: 'unprocessed',
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: null,
        ...overrides
    };
}

function createTaskItem(line: number, task: string): ListItemCache {
    return {
        parent: -line,
        position: {
            start: { line, col: 0, offset: line },
            end: { line, col: 10, offset: line + 10 }
        },
        task
    };
}

function createTaskMetadata(tasks: string[]): CachedMetadata {
    return {
        listItems: tasks.map((task, index) => createTaskItem(index, task))
    };
}

describe('Storage queue filters', () => {
    let settings: NotebookNavigatorSettings;

    beforeEach(() => {
        db = new FakeDB();
        settings = { ...DEFAULT_SETTINGS };
    });

    it('includes markdown files when tagsMtime is reset even if tags already exist', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 123;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                tags: ['tag'],
                tagsMtime: 0
            })
        );

        const types: ContentProviderType[] = ['tags'];
        const result = filterFilesRequiringMetadataSources([file], types, settings);

        expect(result).toEqual([file]);
    });

    it('includes markdown files when markdownPipelineMtime is stale even if statuses are processed', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 456;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: 0,
                previewStatus: 'has',
                featureImageStatus: 'has',
                // Stored custom property items include the source field key and value.
                properties: [{ fieldKey: 'status', value: '1' }]
            })
        );

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings);

        expect(result).toEqual([file]);
    });

    it('includes markdown files when featureImageKey is null even if status is not unprocessed', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 456;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: file.stat.mtime,
                previewStatus: 'has',
                featureImageStatus: 'none',
                featureImageKey: null,
                // Stored custom property items include the source field key and value.
                properties: [{ fieldKey: 'status', value: '1' }]
            })
        );

        settings = { ...settings, showFeatureImage: true };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings);

        expect(result).toEqual([file]);
    });

    it('includes markdown drawing files when the direct drawing marker is stale', () => {
        const file = new TFile();
        file.path = 'drawings/sketch.md';
        file.extension = 'md';
        file.stat.mtime = 456;
        const app = new App();
        app.metadataCache.getFileCache = () => ({ frontmatter: { 'tldraw-file': true } });

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: file.stat.mtime,
                wordCount: 0,
                taskTotal: 0,
                taskUnfinished: 0,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: ''
            })
        );

        settings = { ...settings, showFeatureImage: true };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings, { app });

        expect(result).toEqual([file]);
    });

    it('excludes markdown drawing files when the direct drawing marker is current', () => {
        const file = new TFile();
        file.path = 'drawings/sketch.md';
        file.extension = 'md';
        file.stat.mtime = 456;
        const app = new App();
        app.metadataCache.getFileCache = () => ({ frontmatter: { 'tldraw-file': true } });

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: file.stat.mtime,
                wordCount: 0,
                taskTotal: 0,
                taskUnfinished: 0,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: getDrawingDirectFeatureImageKey(file, 'tldraw'),
                properties: []
            })
        );

        settings = { ...settings, showFilePreview: false, showFeatureImage: true };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings, { app });

        expect(result).toEqual([]);
    });

    it('excludes markdown drawing files when the empty feature-image marker is current and feature images are excluded', () => {
        const file = new TFile();
        file.path = 'drawings/sketch.md';
        file.extension = 'md';
        file.stat.mtime = 456;
        const app = new App();
        app.metadataCache.getFileCache = () => ({ frontmatter: { 'tldraw-file': true, private: true } });

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: file.stat.mtime,
                wordCount: 0,
                taskTotal: 0,
                taskUnfinished: 0,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: '',
                properties: []
            })
        );

        settings = {
            ...settings,
            showFilePreview: false,
            showFeatureImage: true,
            featureImageExcludeProperties: ['private']
        };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings, { app });

        expect(result).toEqual([]);
    });

    it('includes markdown files when task counters are pending', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 456;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: file.stat.mtime,
                wordCount: 0,
                taskTotal: null,
                taskUnfinished: null,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: ''
            })
        );

        settings = { ...settings, showFilePreview: false, showFeatureImage: false };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings);

        expect(result).toEqual([file]);
    });

    it('excludes stale markdown pipeline files when metadata has no task items', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 456;
        const app = new App();
        app.metadataCache.getFileCache = () => ({ listItems: [] });

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: 100,
                wordCount: 0,
                taskTotal: 0,
                taskUnfinished: 0,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: '',
                properties: []
            })
        );

        settings = {
            ...settings,
            showFilePreview: false,
            showFeatureImage: false,
            showTooltips: false,
            textCountDisplay: 'none',
            calendarEnabled: true
        };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings, { app });

        expect(result).toEqual([]);
    });

    it('includes stale markdown pipeline files when metadata contains task items', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 456;
        const app = new App();
        app.metadataCache.getFileCache = () => createTaskMetadata([' ', 'x']);

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: 100,
                wordCount: 0,
                taskTotal: 2,
                taskUnfinished: 1,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: '',
                properties: []
            })
        );

        settings = {
            ...settings,
            showFilePreview: false,
            showFeatureImage: false,
            showTooltips: false,
            textCountDisplay: 'none',
            calendarEnabled: true
        };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings, { app });

        expect(result).toEqual([file]);
    });

    it('excludes current markdown pipeline files when task counters are current even if metadata contains task items', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 456;
        const app = new App();
        app.metadataCache.getFileCache = () => createTaskMetadata([' ']);

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: file.stat.mtime,
                wordCount: 0,
                taskTotal: 0,
                taskUnfinished: 0,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: '',
                properties: []
            })
        );

        settings = {
            ...settings,
            showFilePreview: false,
            showFeatureImage: false,
            showTooltips: false,
            textCountDisplay: 'none',
            calendarEnabled: true
        };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings, { app });

        expect(result).toEqual([]);
    });

    it('includes current markdown pipeline files with task metadata when current task comparison is requested', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 456;
        const app = new App();
        app.metadataCache.getFileCache = () => createTaskMetadata([' ']);

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                markdownPipelineMtime: file.stat.mtime,
                wordCount: 0,
                taskTotal: 0,
                taskUnfinished: 0,
                previewStatus: 'none',
                featureImageStatus: 'none',
                featureImageKey: '',
                properties: []
            })
        );

        settings = {
            ...settings,
            showFilePreview: false,
            showFeatureImage: false,
            showTooltips: false,
            textCountDisplay: 'none',
            calendarEnabled: true
        };

        const types: ContentProviderType[] = ['markdownPipeline'];
        const result = filterFilesRequiringMetadataSources([file], types, settings, {
            app,
            compareCurrentTaskMetadata: true
        });

        expect(result).toEqual([file]);
    });

    it('includes markdown files conservatively for metadata when hidden rules are active', () => {
        const file = new TFile();
        file.path = 'notes/note.md';
        file.extension = 'md';
        file.stat.mtime = 1111;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                metadataMtime: file.stat.mtime,
                metadata: { hidden: false }
            })
        );

        settings = {
            ...settings,
            vaultProfiles: [
                {
                    ...settings.vaultProfiles[0],
                    hiddenFileProperties: ['hide']
                }
            ]
        };

        const app = new App();
        app.metadataCache.getFileCache = () => ({ frontmatter: { title: 'Note' } });

        const types: ContentProviderType[] = ['metadata'];
        const strictResult = filterFilesRequiringMetadataSources([file], types, settings);
        expect(strictResult).toEqual([]);

        const conservativeReadyResult = filterFilesRequiringMetadataSources([file], types, settings, {
            conservativeMetadata: true,
            app
        });
        expect(conservativeReadyResult).toEqual([]);

        app.metadataCache.getFileCache = () => ({ frontmatter: { hide: true } });

        const conservativeChangedResult = filterFilesRequiringMetadataSources([file], types, settings, {
            conservativeMetadata: true,
            app
        });
        expect(conservativeChangedResult).toEqual([file]);

        app.metadataCache.getFileCache = () => null;

        const conservativeMissingResult = filterFilesRequiringMetadataSources([file], types, settings, {
            conservativeMetadata: true,
            app
        });
        expect(conservativeMissingResult).toEqual([file]);
    });

    it('includes PDF files when fileThumbnailsMtime is reset even if featureImageKey matches', () => {
        const file = new TFile();
        file.path = 'docs/file.pdf';
        file.extension = 'pdf';
        file.stat.mtime = 789;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                fileThumbnailsMtime: 0,
                featureImageKey: `f:${file.path}@${file.stat.mtime}`,
                featureImageStatus: 'has'
            })
        );

        settings = { ...settings, showFeatureImage: true };

        const result = filterFilesRequiringFileThumbnails([file], settings);

        expect(result).toEqual([file]);
    });

    it('excludes PDF files when fileThumbnailsMtime and featureImageKey are up-to-date', () => {
        const file = new TFile();
        file.path = 'docs/file.pdf';
        file.extension = 'pdf';
        file.stat.mtime = 1000;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                fileThumbnailsMtime: file.stat.mtime,
                featureImageKey: `f:${file.path}@${file.stat.mtime}`,
                featureImageStatus: 'has'
            })
        );

        settings = { ...settings, showFeatureImage: true };

        const result = filterFilesRequiringFileThumbnails([file], settings);

        expect(result).toEqual([]);
    });

    it('includes raw Tldraw files when the direct drawing marker is missing', () => {
        const file = new TFile();
        file.path = 'drawings/sketch.tldr';
        file.extension = 'tldr';
        file.stat.mtime = 222;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                fileThumbnailsMtime: file.stat.mtime,
                featureImageKey: '',
                featureImageStatus: 'none'
            })
        );

        settings = { ...settings, showFeatureImage: true };

        const result = filterFilesRequiringFileThumbnails([file], settings);

        expect(result).toEqual([file]);
    });

    it('excludes raw Tldraw files when the direct drawing marker is up-to-date', () => {
        const file = new TFile();
        file.path = 'drawings/sketch.tldr';
        file.extension = 'tldr';
        file.stat.mtime = 333;

        db.setFile(
            file.path,
            createFileData({
                mtime: file.stat.mtime,
                fileThumbnailsMtime: file.stat.mtime,
                featureImageKey: getDrawingDirectFeatureImageKey(file, 'tldraw'),
                featureImageStatus: 'none'
            })
        );

        settings = { ...settings, showFeatureImage: true };

        const result = filterFilesRequiringFileThumbnails([file], settings);

        expect(result).toEqual([]);
    });
});
