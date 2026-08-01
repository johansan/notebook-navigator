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

import { App } from 'obsidian';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultFileData, type FileData } from '../../../src/storage/IndexedDBStorage';
import {
    applyFileItemContentChangeToBox,
    loadFileItemCacheSnapshot,
    shouldRefreshFileItemMetadataVersionForContentChange,
    subscribeToFileItemContentState,
    type FileItemCacheSnapshot,
    type FileItemContentBox,
    type FileItemContentDb
} from '../../../src/components/fileItem/useFileItemContentState';
import { createTestTFile } from '../../utils/createTestTFile';

function createFileRecord(patch?: Partial<FileData>): FileData {
    const base = createDefaultFileData({ mtime: 0, path: 'Notes/Daily.md' });
    return {
        ...base,
        ...(patch ?? {})
    };
}

function createContentDb(fileData: FileData | null): FileItemContentDb {
    return {
        getCachedPreviewText: () => 'Cached preview text',
        getFile: () => fileData,
        onFileContentChange: () => () => {},
        ensurePreviewTextLoaded: async () => {},
        getFeatureImageBlob: async () => null
    };
}

const LOAD_ALL_CONTENT = {
    shouldLoadPreviewText: true,
    shouldLoadTags: true,
    shouldLoadFeatureImage: true,
    shouldLoadProperties: true,
    shouldLoadWordCount: true,
    shouldLoadCharacterCount: true,
    shouldLoadTaskCounts: true
} as const;

const SKIP_ALL_CONTENT = {
    shouldLoadPreviewText: false,
    shouldLoadTags: false,
    shouldLoadFeatureImage: false,
    shouldLoadProperties: false,
    shouldLoadWordCount: false,
    shouldLoadCharacterCount: false,
    shouldLoadTaskCounts: false
} as const;

function createContentBox(patch?: Partial<FileItemContentBox>): FileItemContentBox {
    return {
        previewText: 'Old preview',
        tags: ['work'],
        featureImageKey: 'feature-1',
        featureImageStatus: 'none',
        properties: [{ fieldKey: 'status', value: 'open', valueKind: 'string' }],
        wordCount: 100,
        characterCountWithSpaces: 1000,
        characterCountWithoutSpaces: 850,
        taskTotal: 2,
        taskUnfinished: 1,
        metadataVersion: 3,
        ...(patch ?? {})
    };
}

describe('useFileItemContentState helpers', () => {
    it('loads preview, tags, properties, and counters from the cache snapshot', () => {
        const file = createTestTFile('Notes/Daily.md');
        const properties = [{ fieldKey: 'status', value: 'open', valueKind: 'string' as const }];
        const db = createContentDb(
            createFileRecord({
                tags: ['work', 'important'],
                featureImageKey: 'feature-1',
                featureImageStatus: 'has',
                properties,
                wordCount: 321,
                taskTotal: 3,
                taskUnfinished: 2
            })
        );

        const snapshot = loadFileItemCacheSnapshot({
            app: new App(),
            file,
            showPreview: true,
            showImage: false,
            db
        });

        expect(snapshot.previewText).toBe('Cached preview text');
        expect(snapshot.tags).toEqual(['work', 'important']);
        expect(snapshot.featureImageKey).toBe('feature-1');
        expect(snapshot.featureImageStatus).toBe('has');
        expect(snapshot.wordCount).toBe(321);
        expect(snapshot.taskTotal).toBe(3);
        expect(snapshot.taskUnfinished).toBe(2);
        expect(snapshot.properties).toEqual(properties);
        expect(snapshot.properties).not.toBe(properties);
    });

    it('skips disabled content fields and avoids unused cache reads', () => {
        const file = createTestTFile('Notes/Daily.md');
        const getCachedPreviewText = vi.fn(() => 'Cached preview text');
        const getFile = vi.fn(() =>
            createFileRecord({
                tags: ['work'],
                featureImageKey: 'feature-1',
                featureImageStatus: 'has',
                properties: [{ fieldKey: 'status', value: 'open', valueKind: 'string' }],
                wordCount: 321,
                characterCountWithSpaces: 1500,
                characterCountWithoutSpaces: 1300,
                taskUnfinished: 2
            })
        );
        const db: FileItemContentDb = {
            getCachedPreviewText,
            getFile,
            onFileContentChange: () => () => {},
            ensurePreviewTextLoaded: async () => {},
            getFeatureImageBlob: async () => null
        };

        const snapshot = loadFileItemCacheSnapshot({
            app: new App(),
            file,
            showPreview: true,
            showImage: true,
            db,
            loadOptions: {
                loadPreviewText: false,
                loadTags: false,
                loadFeatureImage: false,
                loadProperties: false,
                loadWordCount: false,
                loadCharacterCount: false,
                loadTaskCounts: false
            }
        });

        expect(snapshot).toEqual({
            previewText: '',
            tags: [],
            featureImageKey: null,
            featureImageStatus: 'unprocessed',
            featureImageUrl: null,
            properties: null,
            wordCount: null,
            characterCountWithSpaces: null,
            characterCountWithoutSpaces: null,
            taskTotal: null,
            taskUnfinished: null
        });
        expect(getCachedPreviewText).not.toHaveBeenCalled();
        expect(getFile).not.toHaveBeenCalled();
    });

    it('loads only requested record-backed fields from the cache snapshot', () => {
        const file = createTestTFile('Notes/Daily.md');
        const db = createContentDb(
            createFileRecord({
                tags: ['work'],
                properties: [{ fieldKey: 'status', value: 'open', valueKind: 'string' }],
                wordCount: 321,
                characterCountWithSpaces: 1500,
                characterCountWithoutSpaces: 1300,
                taskUnfinished: 2
            })
        );

        const snapshot = loadFileItemCacheSnapshot({
            app: new App(),
            file,
            showPreview: true,
            showImage: false,
            db,
            loadOptions: {
                loadPreviewText: false,
                loadTags: false,
                loadFeatureImage: false,
                loadProperties: false,
                loadWordCount: true,
                loadCharacterCount: false,
                loadTaskCounts: false
            }
        });

        expect(snapshot.previewText).toBe('');
        expect(snapshot.tags).toEqual([]);
        expect(snapshot.properties).toBeNull();
        expect(snapshot.wordCount).toBe(321);
        expect(snapshot.characterCountWithSpaces).toBeNull();
        expect(snapshot.characterCountWithoutSpaces).toBeNull();
        expect(snapshot.taskTotal).toBeNull();
        expect(snapshot.taskUnfinished).toBeNull();
    });

    it('refreshes metadata version only for metadata or skipped feature-image changes', () => {
        expect(
            shouldRefreshFileItemMetadataVersionForContentChange({
                changes: {
                    properties: [{ fieldKey: 'status', value: 'open', valueKind: 'string' }]
                },
                shouldLoadFeatureImage: false,
                refreshMetadataVersionOnFeatureImageChange: true
            })
        ).toBe(false);

        expect(
            shouldRefreshFileItemMetadataVersionForContentChange({
                changes: {
                    metadata: { name: 'Daily note' }
                },
                shouldLoadFeatureImage: true,
                refreshMetadataVersionOnFeatureImageChange: false
            })
        ).toBe(true);

        expect(
            shouldRefreshFileItemMetadataVersionForContentChange({
                changes: {
                    featureImageKey: 'd:excalidraw:Notes/Drawing.md'
                },
                shouldLoadFeatureImage: false,
                refreshMetadataVersionOnFeatureImageChange: true
            })
        ).toBe(true);

        expect(
            shouldRefreshFileItemMetadataVersionForContentChange({
                changes: {
                    featureImageStatus: 'has'
                },
                shouldLoadFeatureImage: false,
                refreshMetadataVersionOnFeatureImageChange: true
            })
        ).toBe(true);

        expect(
            shouldRefreshFileItemMetadataVersionForContentChange({
                changes: {
                    featureImageKey: 'feature-1'
                },
                shouldLoadFeatureImage: true,
                refreshMetadataVersionOnFeatureImageChange: true
            })
        ).toBe(false);

        expect(
            shouldRefreshFileItemMetadataVersionForContentChange({
                changes: {
                    featureImageKey: 'feature-1'
                },
                shouldLoadFeatureImage: false,
                refreshMetadataVersionOnFeatureImageChange: false
            })
        ).toBe(false);
    });

    it('skips preview and tags for non-markdown files', () => {
        const file = createTestTFile('Assets/Image.png');
        const db = createContentDb(
            createFileRecord({
                tags: ['ignored'],
                wordCount: 999
            })
        );

        const snapshot = loadFileItemCacheSnapshot({
            app: new App(),
            file,
            showPreview: true,
            showImage: false,
            db
        });

        expect(snapshot.previewText).toBe('');
        expect(snapshot.tags).toEqual([]);
        expect(snapshot.wordCount).toBe(999);
    });

    it('applies loaded content changes and clones mutable change payloads', () => {
        const prev = createContentBox({
            tags: ['work', 'important'],
            properties: [{ fieldKey: 'status', value: 'open', valueKind: 'string' }]
        });
        const changedTags = ['work', 'urgent'];
        const changedProperties = [{ fieldKey: 'status', value: 'done', valueKind: 'string' as const }];

        const next = applyFileItemContentChangeToBox({
            prev,
            changes: {
                preview: 'New preview',
                featureImageKey: 'feature-2',
                featureImageStatus: 'has',
                tags: changedTags,
                properties: changedProperties,
                wordCount: 222,
                characterCountWithSpaces: 1234,
                characterCountWithoutSpaces: 999,
                taskTotal: 6,
                taskUnfinished: 4
            },
            ...LOAD_ALL_CONTENT,
            showPreview: true,
            fileExtension: 'md',
            shouldRefreshMetadataVersion: false
        });

        expect(next).not.toBe(prev);
        expect(next).toMatchObject({
            previewText: 'New preview',
            featureImageKey: 'feature-2',
            featureImageStatus: 'has',
            wordCount: 222,
            characterCountWithSpaces: 1234,
            characterCountWithoutSpaces: 999,
            taskTotal: 6,
            taskUnfinished: 4,
            metadataVersion: 3
        });
        expect(next.tags).toEqual(changedTags);
        expect(next.tags).not.toBe(changedTags);
        expect(next.properties).toEqual(changedProperties);
        expect(next.properties).not.toBe(changedProperties);
        expect(prev.tags).toEqual(['work', 'important']);
        expect(prev.properties).toEqual([{ fieldKey: 'status', value: 'open', valueKind: 'string' }]);
    });

    it('returns the same content box when loaded changes are equivalent', () => {
        const prev = createContentBox();

        const next = applyFileItemContentChangeToBox({
            prev,
            changes: {
                preview: prev.previewText,
                featureImageKey: prev.featureImageKey,
                featureImageStatus: prev.featureImageStatus,
                tags: [...prev.tags],
                properties: prev.properties?.map(property => ({ ...property })) ?? null,
                wordCount: prev.wordCount,
                characterCountWithSpaces: prev.characterCountWithSpaces,
                characterCountWithoutSpaces: prev.characterCountWithoutSpaces,
                taskTotal: prev.taskTotal,
                taskUnfinished: prev.taskUnfinished
            },
            ...LOAD_ALL_CONTENT,
            showPreview: true,
            fileExtension: 'md',
            shouldRefreshMetadataVersion: false
        });

        expect(next).toBe(prev);
    });

    it('ignores unloaded content changes while preserving metadata refreshes', () => {
        const prev = createContentBox();

        const next = applyFileItemContentChangeToBox({
            prev,
            changes: {
                preview: 'Ignored preview',
                featureImageKey: 'ignored-feature',
                featureImageStatus: 'has',
                tags: ['ignored'],
                properties: [{ fieldKey: 'status', value: 'ignored', valueKind: 'string' }],
                wordCount: 999,
                characterCountWithSpaces: 9999,
                characterCountWithoutSpaces: 8888,
                taskTotal: 9,
                taskUnfinished: 9
            },
            ...SKIP_ALL_CONTENT,
            showPreview: false,
            fileExtension: 'md',
            shouldRefreshMetadataVersion: true
        });

        expect(next).not.toBe(prev);
        expect(next).toEqual({
            ...prev,
            metadataVersion: prev.metadataVersion + 1
        });
        expect(next.tags).toBe(prev.tags);
        expect(next.properties).toBe(prev.properties);
    });

    it('versions direct image resource URLs by file mtime', () => {
        const app = new App();
        const file = createTestTFile('Assets/Image.png');
        file.stat.mtime = 1234;
        app.vault.getResourcePath = () => 'app://local/Assets/Image.png';

        const snapshot = loadFileItemCacheSnapshot({
            app,
            file,
            showPreview: false,
            showImage: true,
            db: createContentDb(null)
        });

        expect(snapshot.featureImageKey).toBe('direct-image:Assets/Image.png@1234');
        expect(snapshot.featureImageUrl).toBe('app://local/Assets/Image.png?nn-mtime=1234');
    });

    it('does not create direct preview URLs for SVG files', () => {
        const app = new App();
        const file = createTestTFile('Assets/Icon.svg');
        file.stat.mtime = 1234;
        app.vault.getResourcePath = () => 'app://local/Assets/Icon.svg';

        const snapshot = loadFileItemCacheSnapshot({
            app,
            file,
            showPreview: false,
            showImage: true,
            db: createContentDb(null)
        });

        expect(snapshot.featureImageKey).toBeNull();
        expect(snapshot.featureImageUrl).toBeNull();
    });

    it('loads a fresh snapshot after subscribing so mount-time updates are not missed', () => {
        let currentSnapshot: FileItemCacheSnapshot = {
            previewText: 'Initial preview',
            tags: ['first'],
            featureImageKey: null,
            featureImageStatus: 'unprocessed',
            featureImageUrl: null,
            properties: null,
            wordCount: 11,
            taskTotal: 2,
            taskUnfinished: 1
        };
        const appliedSnapshots: FileItemCacheSnapshot[] = [];
        const events: string[] = [];

        const db: FileItemContentDb = {
            getCachedPreviewText: () => currentSnapshot.previewText,
            getFile: () => null,
            onFileContentChange: () => {
                events.push('subscribe');
                currentSnapshot = {
                    ...currentSnapshot,
                    previewText: 'Updated during subscribe',
                    tags: ['second'],
                    wordCount: 22,
                    taskUnfinished: 2
                };
                return () => {
                    events.push('unsubscribe');
                };
            },
            ensurePreviewTextLoaded: async () => {},
            getFeatureImageBlob: async () => null
        };

        const unsubscribe = subscribeToFileItemContentState({
            db,
            filePath: 'Notes/Daily.md',
            loadSnapshot: () => {
                events.push('load');
                return currentSnapshot;
            },
            applySnapshot: snapshot => {
                events.push('apply');
                appliedSnapshots.push(snapshot);
            },
            onChange: () => {
                events.push('change');
            }
        });

        expect(events).toEqual(['subscribe', 'load', 'apply']);
        expect(appliedSnapshots).toEqual([
            expect.objectContaining({
                previewText: 'Updated during subscribe',
                tags: ['second'],
                wordCount: 22,
                taskUnfinished: 2
            })
        ]);

        unsubscribe();
        expect(events).toEqual(['subscribe', 'load', 'apply', 'unsubscribe']);
    });
});
