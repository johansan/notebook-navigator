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
import type { ContentProviderType } from '../../src/interfaces/IContentProvider';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import type { FeatureImageReference } from '../../src/services/content/featureImageReferenceResolver';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';

class FakeDb {
    private readonly files = new Map<string, FileData>();

    setFile(path: string, data: FileData): void {
        this.files.set(path, { ...data });
    }

    getFile(path: string): FileData | null {
        return this.files.get(path) ?? null;
    }

    getCachedPreviewText(): string {
        return '';
    }

    async batchUpdateFileContentAndProviderProcessedMtimes(params: {
        contentUpdates: {
            path: string;
            tags?: string[] | null;
            wordCount?: number | null;
            preview?: string;
            featureImage?: Blob | null;
            featureImageKey?: string | null;
            metadata?: FileData['metadata'];
            properties?: FileData['properties'];
        }[];
        provider?: ContentProviderType;
        processedMtimeUpdates?: { path: string; mtime: number; expectedPreviousMtime: number }[];
    }): Promise<void> {
        const provider = params.provider;
        if (!provider) {
            return;
        }

        for (const update of params.contentUpdates) {
            const existing = this.files.get(update.path);
            if (!existing) {
                continue;
            }

            if (update.featureImageKey !== undefined) {
                existing.featureImageKey = update.featureImageKey;
            }

            if (update.featureImage !== undefined) {
                const nextBlob = update.featureImage;
                existing.featureImage = null;
                if (nextBlob && nextBlob.size > 0) {
                    existing.featureImageStatus = 'has';
                } else {
                    existing.featureImageStatus = 'none';
                }
            }
        }

        for (const update of params.processedMtimeUpdates ?? []) {
            const existing = this.files.get(update.path);
            if (!existing) {
                continue;
            }

            if (provider === 'markdownPipeline') {
                if (existing.markdownPipelineMtime !== update.expectedPreviousMtime) {
                    continue;
                }
                existing.markdownPipelineMtime = update.mtime;
            }
        }
    }
}

let db: FakeDb;

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstance: () => db,
    isShutdownInProgress: () => false
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

class ThrowingThumbnailProvider extends MarkdownPipelineContentProvider {
    private thumbnailAttempts = 0;

    getThumbnailAttempts(): number {
        return this.thumbnailAttempts;
    }

    async runBatch(settings: NotebookNavigatorSettings): Promise<void> {
        this.onSettingsChanged(settings);
        await this.processNextBatch();
    }

    protected async createThumbnailBlob(_reference: FeatureImageReference, _settings: NotebookNavigatorSettings): Promise<Blob | null> {
        this.thumbnailAttempts += 1;
        throw new Error('createThumbnailBlob failed');
    }

    protected async yieldToEventLoop(): Promise<void> {}
}

describe('MarkdownPipelineContentProvider feature image errors', () => {
    beforeEach(() => {
        db = new FakeDb();
    });

    it('records an attempted marker and does not reprocess forever', async () => {
        const app = new App();

        const noteFile = new TFile();
        noteFile.path = 'notes/note.md';
        noteFile.extension = 'md';
        noteFile.stat.mtime = 100;

        const imageFile = new TFile();
        imageFile.path = 'images/cover.png';
        imageFile.extension = 'png';
        imageFile.stat.mtime = 50;

        app.metadataCache.getFileCache = (file: TFile) => {
            if (file.path !== noteFile.path) {
                return null;
            }
            return { frontmatter: { thumbnail: imageFile.path } };
        };
        app.metadataCache.getFirstLinkpathDest = (path: string) => {
            return path === imageFile.path ? imageFile : null;
        };
        app.vault.getAbstractFileByPath = (path: string) => {
            if (path === noteFile.path) return noteFile;
            if (path === imageFile.path) return imageFile;
            return null;
        };

        db.setFile(
            noteFile.path,
            createFileData({
                mtime: noteFile.stat.mtime,
                markdownPipelineMtime: 0,
                featureImageStatus: 'unprocessed',
                featureImageKey: null
            })
        );

        const settings: NotebookNavigatorSettings = {
            ...DEFAULT_SETTINGS,
            showFilePreview: false,
            showFeatureImage: true,
            featureImageProperties: ['thumbnail']
        };

        const provider = new ThrowingThumbnailProvider(app);

        provider.queueFiles([noteFile]);
        await provider.runBatch(settings);

        expect(provider.getThumbnailAttempts()).toBe(1);

        const updated = db.getFile(noteFile.path);
        expect(updated).not.toBeNull();
        if (!updated) {
            throw new Error('Expected file record to exist');
        }

        // Empty blobs are treated as a processed marker; status should move off `unprocessed` after an error.
        expect(updated.featureImageStatus).not.toBe('unprocessed');
        expect(updated.featureImageKey).toBe(`f:${imageFile.path}@${imageFile.stat.mtime}`);

        provider.queueFiles([noteFile]);
        await provider.runBatch(settings);

        expect(provider.getThumbnailAttempts()).toBe(1);
    });
});
