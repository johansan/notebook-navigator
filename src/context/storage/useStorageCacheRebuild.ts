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

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { debounce, type TFile } from 'obsidian';
import type { FileContentType } from '../../interfaces/IContentProvider';
import type { ContentProviderRegistry } from '../../services/content/ContentProviderRegistry';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { getDBInstance } from '../../storage/fileOperations';
import type { PropertyTreeNode, TagTreeNode } from '../../types/storage';
import { clearNoteCountCache } from '../../utils/tagTree';
import type { StorageFileData } from './storageFileData';
import { getCacheRebuildProgressTypes, getContentWorkTotal } from './storageContentTypes';
import { clearCacheRebuildNoticeState, setCacheRebuildNoticeState } from './cacheRebuildNoticeStorage';

interface TagTreeServiceLike {
    updateTagTree: (tree: Map<string, TagTreeNode>, tagged: number, untagged: number) => void;
}

interface PropertyTreeServiceLike {
    updatePropertyTree: (tree: Map<string, PropertyTreeNode>) => void;
}

/**
 * Implements a "full rebuild" action for the storage cache.
 *
 * A rebuild:
 * - Stops all background processing (vault sync, tag rebuild debouncers, metadata waits, content provider queues).
 * - Clears IndexedDB and resets in-memory state (tag tree, readiness flags).
 * - Triggers a full initial cache build and shows a progress notice for the enabled derived-content types.
 *
 * The rebuild temporarily flips `stoppedRef` to ensure no other hook schedules work during the clear+rebuild window,
 * then restores the previous value on completion.
 */
export function useStorageCacheRebuild(params: {
    contentRegistryRef: MutableRefObject<ContentProviderRegistry | null>;
    pendingSyncTimeoutIdRef: MutableRefObject<number | null>;
    rebuildFileCacheRef: MutableRefObject<ReturnType<typeof debounce> | null>;
    cancelTreeRebuildDebouncer: (options?: { reset?: boolean }) => void;
    disposeMetadataWaitDisposers: () => void;
    // Map: file path -> pending metadata-dependent wait mask (see `useMetadataCacheQueue`).
    pendingMetadataWaitPathsRef: MutableRefObject<Map<string, number>>;
    setFileData: Dispatch<SetStateAction<StorageFileData>>;
    tagTreeService: TagTreeServiceLike | null;
    propertyTreeService: PropertyTreeServiceLike | null;
    setIsStorageReady: Dispatch<SetStateAction<boolean>>;
    isStorageReadyRef: MutableRefObject<boolean>;
    hasBuiltInitialCacheRef: MutableRefObject<boolean>;
    buildFileCacheFnRef: MutableRefObject<((isInitialLoad?: boolean) => Promise<void>) | null>;
    latestSettingsRef: MutableRefObject<NotebookNavigatorSettings>;
    stoppedRef: MutableRefObject<boolean>;
    clearCacheRebuildNotice: () => void;
    startCacheRebuildNotice: (total: number, enabledTypes: FileContentType[]) => void;
    getIndexableFiles: () => TFile[];
}): { rebuildCache: () => Promise<void> } {
    const {
        contentRegistryRef,
        pendingSyncTimeoutIdRef,
        rebuildFileCacheRef,
        cancelTreeRebuildDebouncer,
        disposeMetadataWaitDisposers,
        pendingMetadataWaitPathsRef,
        setFileData,
        tagTreeService,
        propertyTreeService,
        setIsStorageReady,
        isStorageReadyRef,
        hasBuiltInitialCacheRef,
        buildFileCacheFnRef,
        latestSettingsRef,
        stoppedRef,
        clearCacheRebuildNotice,
        startCacheRebuildNotice,
        getIndexableFiles
    } = params;

    const rebuildCache = useCallback(async () => {
        clearCacheRebuildNotice();
        // Reset any previously persisted rebuild marker before starting a new rebuild.
        clearCacheRebuildNoticeState();

        // Rebuild runs as an exclusive operation. Store and restore the previous value so rebuild can also be
        // invoked during shutdown without accidentally re-enabling processing afterwards.
        const previousStopped = stoppedRef.current;
        stoppedRef.current = true;

        if (contentRegistryRef.current) {
            contentRegistryRef.current.stopAllProcessing();
        }

        if (pendingSyncTimeoutIdRef.current !== null) {
            if (typeof window !== 'undefined') {
                window.clearTimeout(pendingSyncTimeoutIdRef.current);
            }
            pendingSyncTimeoutIdRef.current = null;
        }

        const rebuildFileCache = rebuildFileCacheRef.current;
        if (rebuildFileCache) {
            try {
                rebuildFileCache.cancel();
            } catch {
                // ignore
            }
        }

        cancelTreeRebuildDebouncer();
        disposeMetadataWaitDisposers();
        pendingMetadataWaitPathsRef.current.clear();

        try {
            const db = getDBInstance();
            await db.clearDatabase();
        } catch (error: unknown) {
            console.error('Failed to clear database during cache rebuild:', error);
            stoppedRef.current = previousStopped;
            throw error;
        }

        // Reset tag tree state immediately so the UI doesn't show stale counts while the rebuild is running.
        const emptyTagTree = new Map<string, TagTreeNode>();
        const emptyPropertyTree = new Map<string, PropertyTreeNode>();
        setFileData({ tagTree: emptyTagTree, propertyTree: emptyPropertyTree, tagged: 0, untagged: 0, hiddenRootTags: new Map() });
        if (tagTreeService) {
            tagTreeService.updateTagTree(emptyTagTree, 0, 0);
        }
        if (propertyTreeService) {
            propertyTreeService.updatePropertyTree(emptyPropertyTree);
        }
        clearNoteCountCache();

        isStorageReadyRef.current = false;
        setIsStorageReady(false);
        hasBuiltInitialCacheRef.current = false;

        const buildCache = buildFileCacheFnRef.current;
        if (!buildCache) {
            stoppedRef.current = previousStopped;
            console.error('Rebuild cache requested before initialization completed.');
            return;
        }

        stoppedRef.current = false;

        try {
            const liveSettings = latestSettingsRef.current;
            const enabledTypes = getCacheRebuildProgressTypes(liveSettings);
            const total = getContentWorkTotal(getIndexableFiles(), enabledTypes);
            if (total > 0 && enabledTypes.length > 0) {
                // Persist a rebuild marker so the progress notice can be restored if Obsidian restarts mid-rebuild.
                setCacheRebuildNoticeState({ total, source: 'rebuild', types: enabledTypes });
            }
            startCacheRebuildNotice(total, enabledTypes);

            hasBuiltInitialCacheRef.current = true;
            await buildCache(true);
        } catch (error: unknown) {
            clearCacheRebuildNotice();
            // Ensure restarts don't restore a notice when rebuild fails to start/complete.
            clearCacheRebuildNoticeState();
            hasBuiltInitialCacheRef.current = false;
            stoppedRef.current = previousStopped;
            throw error;
        }

        stoppedRef.current = previousStopped;
    }, [
        buildFileCacheFnRef,
        cancelTreeRebuildDebouncer,
        clearCacheRebuildNotice,
        contentRegistryRef,
        disposeMetadataWaitDisposers,
        getIndexableFiles,
        hasBuiltInitialCacheRef,
        isStorageReadyRef,
        latestSettingsRef,
        pendingMetadataWaitPathsRef,
        pendingSyncTimeoutIdRef,
        rebuildFileCacheRef,
        setFileData,
        setIsStorageReady,
        startCacheRebuildNotice,
        stoppedRef,
        propertyTreeService,
        tagTreeService
    ]);

    return { rebuildCache };
}
