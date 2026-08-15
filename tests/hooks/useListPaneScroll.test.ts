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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import { ItemType, ListPaneItemType } from '../../src/types';
import type { ListPaneItem } from '../../src/types/virtualization';
import { getListPaneMeasurements } from '../../src/utils/listPaneMeasurements';
import { createHiddenTagVisibility } from '../../src/utils/tagPrefixMatcher';
import type { FileContentChange, IndexedDBStorage } from '../../src/storage/IndexedDBStorage';
import {
    createRemeasureScheduler,
    isPendingFileScrollStale,
    isListRowHeightAffectingContentChange,
    type ListRowHeightAffectingContentChangeConfig,
    resolveListFileRowHeightInputs,
    type ListFileRowSizingConfig
} from '../../src/hooks/useListPaneScroll';
import { createTestTFile } from '../utils/createTestTFile';

function createContentChange(patch: Partial<FileContentChange>): FileContentChange {
    return {
        path: 'Notes/Daily.md',
        changes: {},
        ...patch
    };
}

function createFileItem(file: TFile, overrides: Partial<ListPaneItem> = {}): ListPaneItem {
    return {
        type: ListPaneItemType.FILE,
        data: file,
        key: file.path,
        hasTags: false,
        ...overrides
    };
}

function createRowSizingConfig(overrides: Partial<ListFileRowSizingConfig> = {}): ListFileRowSizingConfig {
    const showPreview = overrides.showPreview ?? true;
    const showImage = overrides.showImage ?? false;

    return {
        heights: getListPaneMeasurements(false),
        titleRows: 1,
        previewRows: 3,
        showDate: true,
        showPreview,
        showImage,
        compactPaddingTotal: 18,
        isCompactMode: false,
        tagsBaseEnabled: false,
        frontmatterPropertyRowsPossible: false,
        propertyRowsPossible: false,
        showTextCountProperty: false,
        showWordCountProperty: false,
        showCharacterCountProperty: false,
        showFileProperties: false,
        showPropertiesOnSeparateRows: false,
        showFilePropertiesInCompactMode: false,
        characterCountSpaces: 'include',
        showParentFolder: false,
        showTaskProgress: false,
        hideTaskProgressWhenComplete: false,
        selectionType: ItemType.FOLDER,
        includeDescendantNotes: false,
        selectedTagToHide: null,
        selectedPropertyValueNodeIdToHide: null,
        hiddenTagVisibility: createHiddenTagVisibility([], false),
        visiblePropertyKeys: new Set(),
        themeMode: 'light',
        ...overrides
    };
}

function createDb(record: unknown = null) {
    return {
        getFile: vi.fn(() => record)
    };
}

function installAnimationFrameStub() {
    let nextFrameId = 1;
    const callbacks = new Map<number, FrameRequestCallback>();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback): number => {
        const frameId = nextFrameId;
        nextFrameId += 1;
        callbacks.set(frameId, callback);
        return frameId;
    });
    const cancelAnimationFrame = vi.fn((frameId: number): void => {
        callbacks.delete(frameId);
    });

    vi.stubGlobal('window', {
        requestAnimationFrame,
        cancelAnimationFrame
    });

    return {
        requestAnimationFrame,
        cancelAnimationFrame,
        runNextFrame(): boolean {
            const next = callbacks.entries().next();
            if (next.done) {
                return false;
            }

            const [frameId, callback] = next.value;
            callbacks.delete(frameId);
            callback(0);
            return true;
        }
    };
}

describe('isPendingFileScrollStale', () => {
    const revealRequest = { type: 'file' as const, filePath: 'Notes/Folder.md', reason: 'reveal' as const };

    it('retains the current selection request and discards it after selection changes', () => {
        expect(isPendingFileScrollStale(revealRequest, 'Notes/Folder.md')).toBe(false);
        expect(isPendingFileScrollStale(revealRequest, 'Notes/Other.md')).toBe(true);
        expect(isPendingFileScrollStale(revealRequest, null)).toBe(true);
        expect(isPendingFileScrollStale({ type: 'top', reason: 'visibility-change' }, null)).toBe(false);
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('isListRowHeightAffectingContentChange', () => {
    function createHeightChangeConfig(
        overrides: Partial<ListRowHeightAffectingContentChangeConfig> = {}
    ): ListRowHeightAffectingContentChangeConfig {
        return {
            showPreview: true,
            showImage: true,
            tagsBaseEnabled: true,
            frontmatterPropertyRowsPossible: true,
            showWordCountProperty: true,
            showCharacterCountProperty: true,
            characterCountSpaces: 'include',
            showTaskProgress: false,
            hideTaskProgressWhenComplete: false,
            ...overrides
        };
    }

    it('detects content fields that can change estimated list row height', () => {
        const config = createHeightChangeConfig({
            characterCountSpaces: 'exclude'
        });

        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { previewStatus: 'has' } }), config)).toBe(true);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { previewStatus: 'none' } }), config)).toBe(true);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { featureImageKey: 'key' } }), config)).toBe(true);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { featureImageStatus: 'has' } }), config)).toBe(true);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { properties: [] } }), config)).toBe(true);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { tags: ['work'] } }), config)).toBe(true);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { wordCount: 123 } }), config)).toBe(true);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { characterCountWithoutSpaces: 400 } }), config)).toBe(
            true
        );
    });

    it('ignores content fields disabled by the active row sizing config', () => {
        const config = createHeightChangeConfig({
            showPreview: false,
            showImage: false,
            tagsBaseEnabled: false,
            frontmatterPropertyRowsPossible: false,
            showWordCountProperty: false,
            showCharacterCountProperty: false
        });

        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { previewStatus: 'has' } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { featureImageKey: 'key' } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { featureImageStatus: 'has' } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { properties: [] } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { tags: ['work'] } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { wordCount: 123 } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { characterCountWithSpaces: 456 } }), config)).toBe(
            false
        );
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { characterCountWithoutSpaces: 400 } }), config)).toBe(
            false
        );
    });

    it('ignores property changes when only text-count property rows can be shown', () => {
        const config = createHeightChangeConfig({
            frontmatterPropertyRowsPossible: false
        });

        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { properties: [] } }), config)).toBe(false);
    });

    it('uses the selected character count variant when deciding whether to remeasure', () => {
        expect(
            isListRowHeightAffectingContentChange(
                createContentChange({ changes: { characterCountWithSpaces: 456 } }),
                createHeightChangeConfig({ characterCountSpaces: 'include' })
            )
        ).toBe(true);
        expect(
            isListRowHeightAffectingContentChange(
                createContentChange({ changes: { characterCountWithoutSpaces: 400 } }),
                createHeightChangeConfig({ characterCountSpaces: 'include' })
            )
        ).toBe(false);
        expect(
            isListRowHeightAffectingContentChange(
                createContentChange({ changes: { characterCountWithSpaces: 456 } }),
                createHeightChangeConfig({ characterCountSpaces: 'exclude' })
            )
        ).toBe(false);
        expect(
            isListRowHeightAffectingContentChange(
                createContentChange({ changes: { characterCountWithoutSpaces: 400 } }),
                createHeightChangeConfig({ characterCountSpaces: 'exclude' })
            )
        ).toBe(true);
    });

    it('ignores content fields that do not change estimated row height', () => {
        const config = createHeightChangeConfig();

        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { preview: 'Preview' } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { preview: null } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { taskTotal: 4 } }), config)).toBe(false);
        expect(isListRowHeightAffectingContentChange(createContentChange({ changes: { taskUnfinished: 2 } }), config)).toBe(false);
        expect(
            isListRowHeightAffectingContentChange(
                createContentChange({
                    changes: { metadata: { name: 'Daily note', icon: 'lucide-star', color: '#ff0000', hidden: true } },
                    metadataHiddenChanged: true,
                    metadataNameChanged: true
                }),
                config
            )
        ).toBe(false);
    });

    it('remeasures only when task progress crosses its visibility boundary', () => {
        const showCompletedConfig = createHeightChangeConfig({ showTaskProgress: true });
        const hideCompletedConfig = createHeightChangeConfig({
            showTaskProgress: true,
            hideTaskProgressWhenComplete: true
        });

        const progressOnlyChange = createContentChange({
            changes: { taskUnfinished: 2 },
            previousTaskCounters: { taskTotal: 4, taskUnfinished: 3 }
        });
        expect(isListRowHeightAffectingContentChange(progressOnlyChange, showCompletedConfig)).toBe(false);
        expect(isListRowHeightAffectingContentChange(progressOnlyChange, hideCompletedConfig)).toBe(false);

        const completedTaskAdded = createContentChange({
            changes: { taskTotal: 1 },
            previousTaskCounters: { taskTotal: 0, taskUnfinished: 0 }
        });
        expect(isListRowHeightAffectingContentChange(completedTaskAdded, showCompletedConfig)).toBe(true);
        expect(isListRowHeightAffectingContentChange(completedTaskAdded, hideCompletedConfig)).toBe(false);

        const completedNoteBecameIncomplete = createContentChange({
            changes: { taskUnfinished: 1 },
            previousTaskCounters: { taskTotal: 4, taskUnfinished: 0 }
        });
        expect(isListRowHeightAffectingContentChange(completedNoteBecameIncomplete, showCompletedConfig)).toBe(false);
        expect(isListRowHeightAffectingContentChange(completedNoteBecameIncomplete, hideCompletedConfig)).toBe(true);

        const countersCleared = createContentChange({
            changes: { taskTotal: null, taskUnfinished: null },
            previousTaskCounters: { taskTotal: 4, taskUnfinished: 1 }
        });
        expect(isListRowHeightAffectingContentChange(countersCleared, showCompletedConfig)).toBe(true);
    });
});

describe('resolveListFileRowHeightInputs', () => {
    it('skips db and drawing metadata reads when row features are disabled', () => {
        const app = new App();
        const getFileCache = vi.fn(() => null);
        app.metadataCache.getFileCache = getFileCache;
        const file = createTestTFile('Notes/Daily.md');
        const db = createDb();
        const hasPreview = vi.fn(() => true);

        const inputs = resolveListFileRowHeightInputs({
            app,
            db: db as unknown as IndexedDBStorage,
            hasPreview,
            item: createFileItem(file),
            file,
            config: createRowSizingConfig({
                showPreview: false,
                showImage: false,
                tagsBaseEnabled: false,
                propertyRowsPossible: false
            })
        });

        expect(inputs.visiblePillRowCount).toBe(0);
        expect(inputs.showFeatureImageArea).toBe(false);
        expect(db.getFile).not.toHaveBeenCalled();
        expect(hasPreview).not.toHaveBeenCalled();
        expect(getFileCache).not.toHaveBeenCalled();
    });

    it('reads drawing metadata only when image rows are enabled', () => {
        const app = new App();
        const getFileCache = vi.fn(() => null);
        app.metadataCache.getFileCache = getFileCache;
        const file = createTestTFile('Notes/Daily.md');
        const db = createDb({ featureImageStatus: 'none' });

        resolveListFileRowHeightInputs({
            app,
            db: db as unknown as IndexedDBStorage,
            hasPreview: () => false,
            item: createFileItem(file),
            file,
            config: createRowSizingConfig({
                showImage: true
            })
        });

        expect(db.getFile).toHaveBeenCalledWith(file.path);
        expect(getFileCache).toHaveBeenCalledWith(file);
    });

    it('uses item tag presence without reading the file record when no selected tag is hidden', () => {
        const app = new App();
        const getFileCache = vi.fn(() => null);
        app.metadataCache.getFileCache = getFileCache;
        const file = createTestTFile('Notes/Daily.md');
        const db = createDb({ tags: ['work'] });

        const inputs = resolveListFileRowHeightInputs({
            app,
            db: db as unknown as IndexedDBStorage,
            hasPreview: () => false,
            item: createFileItem(file, { hasTags: true }),
            file,
            config: createRowSizingConfig({
                showPreview: false,
                tagsBaseEnabled: true,
                selectedTagToHide: null
            })
        });

        expect(inputs.visiblePillRowCount).toBe(1);
        expect(db.getFile).not.toHaveBeenCalled();
        expect(getFileCache).not.toHaveBeenCalled();
    });

    it('reads live tags when selected navigation pills can hide the only tag row', () => {
        const app = new App();
        const file = createTestTFile('Notes/Daily.md');
        const db = createDb({ tags: ['work', 'project'] });

        const inputs = resolveListFileRowHeightInputs({
            app,
            db: db as unknown as IndexedDBStorage,
            hasPreview: () => false,
            item: createFileItem(file, { hasTags: true }),
            file,
            config: createRowSizingConfig({
                showPreview: false,
                tagsBaseEnabled: true,
                selectedTagToHide: 'work'
            })
        });

        expect(inputs.visiblePillRowCount).toBe(1);
        expect(db.getFile).toHaveBeenCalledWith(file.path);
    });

    it('skips db reads when frontmatter properties are enabled without visible list property keys', () => {
        const app = new App();
        const file = createTestTFile('Notes/Daily.md');
        const db = createDb({
            properties: [{ fieldKey: 'status', value: 'active', valueKind: 'text' }]
        });

        const inputs = resolveListFileRowHeightInputs({
            app,
            db: db as unknown as IndexedDBStorage,
            hasPreview: () => false,
            item: createFileItem(file),
            file,
            config: createRowSizingConfig({
                showPreview: false,
                showFileProperties: true,
                visiblePropertyKeys: new Set(),
                propertyRowsPossible: false
            })
        });

        expect(inputs.visiblePillRowCount).toBe(0);
        expect(db.getFile).not.toHaveBeenCalled();
    });

    it('reads the file record when visible property rows can affect height', () => {
        const app = new App();
        const file = createTestTFile('Notes/Daily.md');
        const db = createDb({
            properties: [{ fieldKey: 'status', value: 'active', valueKind: 'text' }]
        });

        const inputs = resolveListFileRowHeightInputs({
            app,
            db: db as unknown as IndexedDBStorage,
            hasPreview: () => false,
            item: createFileItem(file),
            file,
            config: createRowSizingConfig({
                showPreview: false,
                propertyRowsPossible: true,
                showFileProperties: true,
                visiblePropertyKeys: new Set(['status'])
            })
        });

        expect(inputs.visiblePillRowCount).toBe(1);
        expect(db.getFile).toHaveBeenCalledWith(file.path);
    });

    it('includes task progress in pinned markdown row measurements', () => {
        const app = new App();
        const file = createTestTFile('Notes/Pinned.md');
        const db = createDb({ taskTotal: 4, taskUnfinished: 2 });

        const inputs = resolveListFileRowHeightInputs({
            app,
            db: db as unknown as IndexedDBStorage,
            hasPreview: () => true,
            item: createFileItem(file, { isPinned: true }),
            file,
            config: createRowSizingConfig({ showTaskProgress: true })
        });

        expect(inputs.showTaskProgressLine).toBe(true);
        expect(db.getFile).toHaveBeenCalledWith(file.path);
    });
});

describe('createRemeasureScheduler', () => {
    it('coalesces multiple schedule calls into one animation frame measure', () => {
        const animationFrameStub = installAnimationFrameStub();
        const measure = vi.fn();
        const scheduler = createRemeasureScheduler(measure);

        scheduler.schedule();
        scheduler.schedule();
        scheduler.schedule();

        expect(animationFrameStub.requestAnimationFrame).toHaveBeenCalledTimes(1);
        expect(measure).not.toHaveBeenCalled();

        expect(animationFrameStub.runNextFrame()).toBe(true);

        expect(measure).toHaveBeenCalledTimes(1);
        expect(animationFrameStub.runNextFrame()).toBe(false);
    });

    it('schedules a new measure after the pending frame runs', () => {
        const animationFrameStub = installAnimationFrameStub();
        const measure = vi.fn();
        const scheduler = createRemeasureScheduler(measure);

        scheduler.schedule();
        animationFrameStub.runNextFrame();
        scheduler.schedule();
        animationFrameStub.runNextFrame();

        expect(animationFrameStub.requestAnimationFrame).toHaveBeenCalledTimes(2);
        expect(measure).toHaveBeenCalledTimes(2);
    });

    it('cancels a pending measure before the animation frame runs', () => {
        const animationFrameStub = installAnimationFrameStub();
        const measure = vi.fn();
        const scheduler = createRemeasureScheduler(measure);

        scheduler.schedule();
        scheduler.cancel();

        expect(animationFrameStub.cancelAnimationFrame).toHaveBeenCalledWith(1);
        expect(animationFrameStub.runNextFrame()).toBe(false);
        expect(measure).not.toHaveBeenCalled();
    });
});
