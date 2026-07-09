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

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { App, EventRef, TAbstractFile, TFile, debounce } from 'obsidian';
import { TIMEOUTS } from '../../types/obsidian-extended';
import { INTERNAL_NOTEBOOK_NAVIGATOR_API, type NotebookNavigatorAPI } from '../../api/NotebookNavigatorAPI';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { ContentProviderType, FileContentType } from '../../interfaces/IContentProvider';
import type { ContentProviderRegistry } from '../../services/content/ContentProviderRegistry';
import type { PropertyTreeNode, TagTreeNode } from '../../types/storage';
import { calculateFileDiff } from '../../storage/diffCalculator';
import { type FileData as DBFileData } from '../../storage/IndexedDBStorage';
import { remapSelfReferentialFeatureImageKey } from '../../storage/FeatureImageBlobStore';
import { getDBInstance, markFilesForRegeneration, recordFileChanges, removeFilesFromCache } from '../../storage/fileOperations';
import { createRenameFlushController, excludeReoccupiedRenameTargets, type PendingRenameFlushBuffer } from './renameFlush';
import { runAsyncAction } from '../../utils/async';
import { isMarkdownPath } from '../../utils/fileTypeUtils';
import { isPropertyFeatureEnabled } from '../../utils/propertyTree';
import { emitDrawingCompanionImageChange, findDrawingFileForCompanionImage } from '../../utils/drawingFeatureImages';
import {
    filterFilesRequiringFileThumbnails,
    filterFilesRequiringMetadataSources,
    shouldQueueFileThumbnailProvider
} from '../storageQueueFilters';
import { getCacheRebuildProgressTypes, getContentWorkTotal, getMetadataDependentTypes } from './storageContentTypes';
import { finishStartupDiagnostics, isDebugLogPath, recordStartupDiagnostic } from '../../services/diagnostics/DebugLoggingService';
import { getMarkdownPipelineContentTypes } from '../../utils/markdownPipelineContentTypes';
import {
    clearFrontmatterMetadataCacheSignature,
    isFrontmatterMetadataCacheCurrent,
    markFrontmatterMetadataCacheCurrent
} from '../../utils/frontmatterMetadataCache';

/**
 * Buffered vault/metadata events awaiting a debounced flush. The whole buffer (files, timer, processing flag) is
 * shared through a ref so an in-flight flush started before an effect remount and a flush scheduled after it
 * operate on the same state.
 */
export interface PendingFileFlushBuffer {
    /** Pending files keyed by path */
    files: Map<string, TFile>;
    /** Active flush timer id, or null when no flush is scheduled */
    timerId: number | null;
    /** True while a flush batch is being processed */
    isProcessing: boolean;
}

async function ensureFrontmatterMetadataCacheMatchesSettings(settings: NotebookNavigatorSettings): Promise<boolean> {
    if (!settings.useFrontmatterMetadata) {
        clearFrontmatterMetadataCacheSignature();
        return false;
    }

    if (isFrontmatterMetadataCacheCurrent(settings)) {
        return false;
    }

    await getDBInstance().batchClearAllFileContent('metadata');
    markFrontmatterMetadataCacheCurrent(settings);
    return true;
}

/**
 * Syncs vault changes into the IndexedDB cache and triggers derived-content generation.
 *
 * Responsibilities:
 * - Initial load: diff the vault against the database, update the cache, build the initial tag tree, and mark
 *   storage as ready.
 * - Live updates: listen to vault events (create/delete/rename/modify) and reconcile the database via diffs.
 * - Derived content: queue content providers for files that changed or still need content (tags, preview text,
 *   feature images, metadata, properties).
 *
 * Design notes:
 * - Vault events can arrive in bursts or in multi-step sequences (especially renames/moves). A shared debouncer
 *   (TIMEOUTS.FILE_OPERATION_DELAY) collapses those bursts into a single `calculateFileDiff()` pass.
 * - A markdown save fires both `vault.on('modify')` and `metadataCache.on('changed')`. The modify flush records
 *   stat changes and queues non-markdown thumbnails only; markdown content generation is queued by the
 *   metadata-change flush so providers read the metadata cache after Obsidian has indexed the save.
 * - Rename handling preserves existing cached content by seeding the new path with the old record at event time
 *   and buffering the move. A zero-delay flush then persists the whole burst's seeded records in one `setFiles`
 *   call and moves stored blobs/preview text in one batched transaction per store, each replayed in vault event
 *   order (a folder move with N files runs a handful of transactions instead of ~3N).
 * - The modify/metadata flush buffers are refs owned by `StorageContext`. This effect re-runs on settings changes,
 *   and events buffered but not yet flushed must survive the remount: cleanup clears only the flush timers, and
 *   the mount path reschedules flushes for entries still in the buffers. The rename buffer is flushed by cleanup
 *   instead: its entries seed the plugin-lifetime memory mirror and must not outlive the effect unpersisted.
 * - `latestSettingsRef` is used inside async callbacks to avoid stale closures when settings change mid-queue.
 */
export function useStorageVaultSync(params: {
    app: App;
    api: NotebookNavigatorAPI | null;
    settings: NotebookNavigatorSettings;
    latestSettingsRef: MutableRefObject<NotebookNavigatorSettings>;
    stoppedRef: MutableRefObject<boolean>;
    isFirstLoadRef: MutableRefObject<boolean>;
    isIndexedDBReady: boolean;
    hasBuiltInitialCacheRef: MutableRefObject<boolean>;
    setIsStorageReady: Dispatch<SetStateAction<boolean>>;
    isStorageReadyRef: MutableRefObject<boolean>;
    contentRegistryRef: MutableRefObject<ContentProviderRegistry | null>;
    pendingSyncTimeoutIdRef: MutableRefObject<number | null>;
    pendingRenameDataRef: MutableRefObject<Map<string, DBFileData>>;
    modifyFlushBufferRef: MutableRefObject<PendingFileFlushBuffer>;
    metadataChangeFlushBufferRef: MutableRefObject<PendingFileFlushBuffer>;
    renameFlushBufferRef: MutableRefObject<PendingRenameFlushBuffer>;
    buildFileCacheFnRef: MutableRefObject<((isInitialLoad?: boolean) => Promise<void>) | null>;
    rebuildFileCacheRef: MutableRefObject<ReturnType<typeof debounce> | null>;
    activeVaultEventRefsRef: MutableRefObject<EventRef[] | null>;
    activeMetadataEventRefRef: MutableRefObject<EventRef | null>;
    rebuildTagTree: (getVisibleFiles?: () => TFile[]) => Map<string, TagTreeNode>;
    scheduleTagTreeRebuild: (options?: { flush?: boolean }) => void;
    rebuildPropertyTree: (getVisibleFiles?: () => TFile[]) => Map<string, PropertyTreeNode>;
    schedulePropertyTreeRebuild: (options?: { flush?: boolean }) => void;
    cancelTreeRebuildDebouncer: (options?: { reset?: boolean }) => void;
    startCacheRebuildNotice: (total: number, enabledTypes: FileContentType[]) => void;
    getIndexableFiles: () => TFile[];
    getVisibleMarkdownFiles: () => TFile[];
    queueMetadataContentWhenReady: (
        files: TFile[],
        includeTypes?: ContentProviderType[],
        settingsOverride?: NotebookNavigatorSettings
    ) => void;
    queueIndexableFilesForContentGeneration: (files: TFile[], settings: NotebookNavigatorSettings) => { markdownFiles: TFile[] };
    queueIndexableFilesNeedingContentGeneration: (filesToCheck: TFile[], allFiles: TFile[], settings: NotebookNavigatorSettings) => void;
    disposeMetadataWaitDisposers: () => void;
}): void {
    const {
        app,
        api,
        settings,
        latestSettingsRef,
        stoppedRef,
        isFirstLoadRef,
        isIndexedDBReady,
        hasBuiltInitialCacheRef,
        setIsStorageReady,
        isStorageReadyRef,
        contentRegistryRef,
        pendingSyncTimeoutIdRef,
        pendingRenameDataRef,
        modifyFlushBufferRef,
        metadataChangeFlushBufferRef,
        renameFlushBufferRef,
        buildFileCacheFnRef,
        rebuildFileCacheRef,
        activeVaultEventRefsRef,
        activeMetadataEventRefRef,
        rebuildTagTree,
        scheduleTagTreeRebuild,
        rebuildPropertyTree,
        schedulePropertyTreeRebuild,
        cancelTreeRebuildDebouncer,
        startCacheRebuildNotice,
        getIndexableFiles,
        getVisibleMarkdownFiles,
        queueMetadataContentWhenReady,
        queueIndexableFilesForContentGeneration,
        queueIndexableFilesNeedingContentGeneration,
        disposeMetadataWaitDisposers
    } = params;

    useEffect(() => {
        // `processExistingCache` is called in two modes:
        // - Initial load: do a full diff, populate the database, and mark storage ready.
        // - Incremental updates: schedule a diff after vault events settle.
        const processExistingCache = async (allFiles: TFile[], isInitialLoad: boolean = false) => {
            if (stoppedRef.current) return;
            if (isFirstLoadRef.current) {
                isFirstLoadRef.current = false;
            }

            if (isInitialLoad) {
                const initialLoadStartMs = performance.now();
                try {
                    recordStartupDiagnostic('storage.initialLoad.start', { indexableFileCount: allFiles.length });
                    const diffStartMs = performance.now();
                    const { toAdd, toUpdate, toRemove, existingData, cachedFileCount } = calculateFileDiff(allFiles);
                    const diffElapsedMs = Math.round(performance.now() - diffStartMs);

                    if (toRemove.length > 0) {
                        await removeFilesFromCache(toRemove);
                    }

                    if (toAdd.length > 0 || toUpdate.length > 0) {
                        await recordFileChanges([...toAdd, ...toUpdate], existingData, pendingRenameDataRef.current);
                    }
                    const frontmatterMetadataCacheInvalidated = await ensureFrontmatterMetadataCacheMatchesSettings(settings);

                    // Both tree rebuilds share one visible-file scan.
                    let visibleFilesForTrees: TFile[] | null = null;
                    const getVisibleFilesForTrees = () => (visibleFilesForTrees ??= getVisibleMarkdownFiles());
                    const tagTreeStartMs = performance.now();
                    rebuildTagTree(getVisibleFilesForTrees);
                    const tagTreeElapsedMs = Math.round(performance.now() - tagTreeStartMs);
                    const propertyTreeStartMs = performance.now();
                    rebuildPropertyTree(getVisibleFilesForTrees);
                    const propertyTreeElapsedMs = Math.round(performance.now() - propertyTreeStartMs);

                    isStorageReadyRef.current = true;
                    setIsStorageReady(true);

                    api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].setStorageReady(true);

                    const metadataDependentTypes = getMetadataDependentTypes(settings);
                    const contentEnabled = metadataDependentTypes.length > 0;
                    const queuedStartupDetails: Record<string, unknown> = { metadataDependentTypes, frontmatterMetadataCacheInvalidated };

                    if (contentRegistryRef.current && contentEnabled) {
                        const markdownFiles: TFile[] = [];
                        const fileThumbnailFiles: TFile[] = [];
                        let filesNeedingThumbnailCount = 0;

                        for (const file of allFiles) {
                            if (file.extension === 'md') {
                                markdownFiles.push(file);
                                continue;
                            }
                            if (shouldQueueFileThumbnailProvider(file)) {
                                fileThumbnailFiles.push(file);
                            }
                        }

                        if (metadataDependentTypes.length > 0 && markdownFiles.length > 0) {
                            queueMetadataContentWhenReady(markdownFiles, metadataDependentTypes, settings);
                        }

                        if (settings.showFeatureImage && fileThumbnailFiles.length > 0) {
                            const filesNeedingThumbnails = filterFilesRequiringFileThumbnails(fileThumbnailFiles, settings);
                            filesNeedingThumbnailCount = filesNeedingThumbnails.length;
                            if (filesNeedingThumbnails.length > 0) {
                                contentRegistryRef.current.queueFilesForAllProviders(filesNeedingThumbnails, settings, {
                                    include: ['fileThumbnails']
                                });
                            }
                        }

                        queuedStartupDetails.markdownFiles = markdownFiles.length;
                        queuedStartupDetails.fileThumbnailFiles = fileThumbnailFiles.length;
                        queuedStartupDetails.filesNeedingThumbnails = filesNeedingThumbnailCount;
                    }

                    finishStartupDiagnostics({
                        status: 'storageReady',
                        indexableFileCount: allFiles.length,
                        cachedFileCount,
                        diff: {
                            toAdd: toAdd.length,
                            toUpdate: toUpdate.length,
                            toRemove: toRemove.length
                        },
                        queued: queuedStartupDetails,
                        timingsMs: {
                            diff: diffElapsedMs,
                            tagTree: tagTreeElapsedMs,
                            propertyTree: propertyTreeElapsedMs,
                            initialLoad: Math.round(performance.now() - initialLoadStartMs)
                        }
                    });
                } catch (error: unknown) {
                    recordStartupDiagnostic('storage.initialLoad.failed', { error });
                    finishStartupDiagnostics({
                        status: 'initialLoadFailed',
                        indexableFileCount: allFiles.length,
                        error
                    });
                    console.error('Failed during initial load sequence:', error);
                }
            } else {
                if (pendingSyncTimeoutIdRef.current !== null) {
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(pendingSyncTimeoutIdRef.current);
                    }
                    pendingSyncTimeoutIdRef.current = null;
                }

                const processDiff = async () => {
                    if (stoppedRef.current) return;
                    try {
                        const { toAdd, toUpdate, toRemove, existingData, cachedFileCount } = calculateFileDiff(allFiles);
                        recordStartupDiagnostic('storage.diff.processed', {
                            indexableFileCount: allFiles.length,
                            cachedFileCount,
                            toAdd: toAdd.length,
                            toUpdate: toUpdate.length,
                            toRemove: toRemove.length
                        });

                        if (toAdd.length > 0 || toUpdate.length > 0 || toRemove.length > 0) {
                            try {
                                const filesToUpdate = [...toAdd, ...toUpdate];
                                if (filesToUpdate.length > 0) {
                                    await recordFileChanges(filesToUpdate, existingData, pendingRenameDataRef.current);
                                }

                                if (toRemove.length > 0) {
                                    // A rename landing after this diff's vault snapshot (during the awaited
                                    // record update above) can re-occupy a path classified as removed; the
                                    // rename flush persists a seeded record and moves stored artifacts there
                                    // ahead of this delete. Skip such paths; the diff rescheduled by the
                                    // rename handler reconciles them.
                                    const pathsToRemove = excludeReoccupiedRenameTargets({
                                        paths: toRemove,
                                        buffer: renameFlushBufferRef.current,
                                        pendingRenameData: pendingRenameDataRef.current,
                                        isPathInVault: path => app.vault.getAbstractFileByPath(path) instanceof TFile
                                    });
                                    if (pathsToRemove.length > 0) {
                                        await removeFilesFromCache(pathsToRemove);
                                        if (settings.showTags) {
                                            scheduleTagTreeRebuild();
                                        }
                                        if (isPropertyFeatureEnabled(settings)) {
                                            // Flush rebuild after cache removals so deleted files are reflected in the property tree counts.
                                            schedulePropertyTreeRebuild({ flush: true });
                                        }
                                    }
                                }
                            } catch (error: unknown) {
                                console.error('Failed to update IndexedDB cache:', error);
                            }

                            queueIndexableFilesNeedingContentGeneration([...toAdd, ...toUpdate], allFiles, settings);
                        }
                    } catch (error: unknown) {
                        console.error('Error processing file cache diff:', error);
                    }
                };

                if (typeof window !== 'undefined') {
                    // Defer the diff to the next tick so multiple vault events can coalesce and so heavy work does
                    // not run inside the vault event handler call stack.
                    pendingSyncTimeoutIdRef.current = window.setTimeout(() => {
                        pendingSyncTimeoutIdRef.current = null;
                        runAsyncAction(() => processDiff());
                    }, 0);
                } else {
                    runAsyncAction(() => processDiff());
                }
            }
        };

        const buildFileCache = async (isInitialLoad: boolean = false) => {
            if (stoppedRef.current) return;
            const allFiles = getIndexableFiles();
            await processExistingCache(allFiles, isInitialLoad);
        };

        buildFileCacheFnRef.current = buildFileCache;

        let rebuildFileCache = rebuildFileCacheRef.current;
        if (!rebuildFileCache) {
            rebuildFileCache = debounce(
                () => {
                    if (stoppedRef.current) {
                        return;
                    }
                    const build = buildFileCacheFnRef.current;
                    if (!build) {
                        return;
                    }
                    runAsyncAction(() => build(false));
                },
                TIMEOUTS.FILE_OPERATION_DELAY,
                true
            );
            rebuildFileCacheRef.current = rebuildFileCache;
        }

        if (isIndexedDBReady && !hasBuiltInitialCacheRef.current) {
            // The storage layer is only safe to read/write after IndexedDB initialization completes. Trigger the
            // initial diff and tag tree build exactly once.
            hasBuiltInitialCacheRef.current = true;
            const db = getDBInstance();
            if (db.consumePendingRebuildNotice()) {
                const liveSettings = latestSettingsRef.current;
                const enabledTypes = getCacheRebuildProgressTypes(liveSettings);
                const total = getContentWorkTotal(getIndexableFiles(), enabledTypes);
                startCacheRebuildNotice(total, enabledTypes);
            }
            runAsyncAction(() => buildFileCache(true));
        }

        const queueFilesContentRefresh = (files: TFile[]) => {
            if (stoppedRef.current || !contentRegistryRef.current) {
                return;
            }

            try {
                const liveSettings = latestSettingsRef.current;
                const metadataDependentTypes = getMetadataDependentTypes(liveSettings);
                const { markdownFiles } = queueIndexableFilesForContentGeneration(files, liveSettings);
                if (metadataDependentTypes.length > 0) {
                    queueMetadataContentWhenReady(markdownFiles, metadataDependentTypes, liveSettings);
                }
            } catch (error: unknown) {
                console.error('Failed to queue content refresh for files:', error);
            }
        };

        const modifyFlushBuffer = modifyFlushBufferRef.current;
        const metadataChangeFlushBuffer = metadataChangeFlushBufferRef.current;

        const clearPendingModifyFlushTimer = () => {
            if (modifyFlushBuffer.timerId === null) {
                return;
            }
            if (typeof window !== 'undefined') {
                window.clearTimeout(modifyFlushBuffer.timerId);
            }
            modifyFlushBuffer.timerId = null;
        };

        const clearPendingMetadataChangeFlushTimer = () => {
            if (metadataChangeFlushBuffer.timerId === null) {
                return;
            }
            if (typeof window !== 'undefined') {
                window.clearTimeout(metadataChangeFlushBuffer.timerId);
            }
            metadataChangeFlushBuffer.timerId = null;
        };

        const resolveLiveFiles = (files: TFile[]): TFile[] => {
            const filesByPath = new Map<string, TFile>();
            for (const file of files) {
                const abstract = app.vault.getAbstractFileByPath(file.path);
                if (abstract instanceof TFile) {
                    filesByPath.set(abstract.path, abstract);
                }
            }
            return Array.from(filesByPath.values());
        };

        const flushModifiedFiles = () => {
            modifyFlushBuffer.timerId = null;
            if (modifyFlushBuffer.isProcessing) {
                return;
            }

            runAsyncAction(async () => {
                if (stoppedRef.current) {
                    modifyFlushBuffer.files.clear();
                    return;
                }

                const pendingFiles = Array.from(modifyFlushBuffer.files.values());
                modifyFlushBuffer.files.clear();
                if (pendingFiles.length === 0) {
                    return;
                }

                const files = resolveLiveFiles(pendingFiles);
                if (files.length === 0) {
                    return;
                }

                let recordedChanges = false;
                modifyFlushBuffer.isProcessing = true;
                try {
                    const db = getDBInstance();
                    const existingData = db.getFiles(files.map(file => file.path));
                    await recordFileChanges(files, existingData, pendingRenameDataRef.current);
                    recordedChanges = true;
                } catch (error: unknown) {
                    console.error('Failed to record file changes on modify:', error);
                } finally {
                    modifyFlushBuffer.isProcessing = false;
                }

                if (recordedChanges) {
                    // Markdown content is queued by the metadata-change flush once Obsidian has indexed the
                    // modified file. Queueing markdown here as well runs the metadata-dependent providers a
                    // second time per save, against a metadata cache that may not reflect the save yet.
                    const nonMarkdownFiles = files.filter(file => file.extension !== 'md');
                    if (nonMarkdownFiles.length > 0) {
                        queueFilesContentRefresh(nonMarkdownFiles);
                    }
                }

                if (modifyFlushBuffer.files.size > 0 && !stoppedRef.current) {
                    scheduleModifiedFilesFlush();
                }
            });
        };

        const scheduleModifiedFilesFlush = () => {
            if (stoppedRef.current || modifyFlushBuffer.isProcessing || modifyFlushBuffer.timerId !== null) {
                return;
            }

            if (typeof window !== 'undefined') {
                modifyFlushBuffer.timerId = window.setTimeout(flushModifiedFiles, TIMEOUTS.FILE_OPERATION_DELAY);
                return;
            }

            flushModifiedFiles();
        };

        const flushMetadataChangedFiles = () => {
            metadataChangeFlushBuffer.timerId = null;
            if (metadataChangeFlushBuffer.isProcessing) {
                return;
            }

            runAsyncAction(async () => {
                if (stoppedRef.current) {
                    metadataChangeFlushBuffer.files.clear();
                    return;
                }

                const pendingFiles = Array.from(metadataChangeFlushBuffer.files.values());
                metadataChangeFlushBuffer.files.clear();
                if (pendingFiles.length === 0) {
                    return;
                }

                const files = resolveLiveFiles(pendingFiles).filter(file => file.extension === 'md' && !isDebugLogPath(file.path));
                if (files.length === 0) {
                    return;
                }

                const liveSettings = latestSettingsRef.current;
                const metadataDependentTypes = getMetadataDependentTypes(liveSettings);
                const markdownPipelineContentTypes = getMarkdownPipelineContentTypes(liveSettings);
                const shouldPrefilterTaskOnlyMarkdownPipeline =
                    metadataDependentTypes.length === 1 &&
                    metadataDependentTypes[0] === 'markdownPipeline' &&
                    markdownPipelineContentTypes.length === 1 &&
                    markdownPipelineContentTypes[0] === 'tasks';
                const filesToRefresh = shouldPrefilterTaskOnlyMarkdownPipeline
                    ? filterFilesRequiringMetadataSources(files, metadataDependentTypes, liveSettings, {
                          app,
                          conservativeMetadata: true
                      })
                    : files;
                if (filesToRefresh.length === 0) {
                    return;
                }

                metadataChangeFlushBuffer.isProcessing = true;
                try {
                    if (metadataDependentTypes.length > 0) {
                        // Obsidian's metadata cache can change after initial indexing even when file mtime did
                        // not trigger a "modify" handler in the expected order. Mark files for regeneration so
                        // metadata-dependent providers re-run against the updated cache snapshot.
                        // The processed-mtime reset also invalidates in-flight provider batches whose
                        // `expectedPreviousMtime` snapshot was non-zero: their guarded writes are dropped after
                        // the reset, so such a batch cannot persist content from a pre-change cache snapshot.
                        await markFilesForRegeneration(filesToRefresh, metadataDependentTypes);
                    }
                } catch (error: unknown) {
                    console.error('Failed to mark files for regeneration:', error);
                } finally {
                    metadataChangeFlushBuffer.isProcessing = false;
                }

                // Queue even when marking fails: this flush is the only content trigger for markdown saves, and
                // files whose processed mtimes are already stale still pass the queue filters without the reset.
                queueFilesContentRefresh(filesToRefresh);

                if (metadataChangeFlushBuffer.files.size > 0 && !stoppedRef.current) {
                    scheduleMetadataChangedFilesFlush();
                }
            });
        };

        const scheduleMetadataChangedFilesFlush = () => {
            if (stoppedRef.current || metadataChangeFlushBuffer.isProcessing || metadataChangeFlushBuffer.timerId !== null) {
                return;
            }

            if (typeof window !== 'undefined') {
                metadataChangeFlushBuffer.timerId = window.setTimeout(flushMetadataChangedFiles, TIMEOUTS.FILE_OPERATION_DELAY);
                return;
            }

            flushMetadataChangedFiles();
        };

        // Entries buffered before an effect remount have no active timer (cleanup cleared it); reschedule their
        // flushes. When a flush batch from the previous effect run is still in flight, the schedule guard skips
        // and that batch reschedules on completion if the buffer is non-empty.
        if (modifyFlushBuffer.files.size > 0) {
            scheduleModifiedFilesFlush();
        }
        if (metadataChangeFlushBuffer.files.size > 0) {
            scheduleMetadataChangedFilesFlush();
        }

        const notifyDrawingCompanionChange = (imagePath: string) => {
            emitDrawingCompanionImageChange(app, imagePath);
        };

        const renameFlushBuffer = renameFlushBufferRef.current;

        const renameFlushController = createRenameFlushController({
            buffer: renameFlushBuffer,
            pendingRenameData: pendingRenameDataRef.current,
            isStopped: () => stoppedRef.current,
            getStore: () => getDBInstance(),
            cancelScheduledDiff: () => {
                if (pendingSyncTimeoutIdRef.current !== null) {
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(pendingSyncTimeoutIdRef.current);
                    }
                    pendingSyncTimeoutIdRef.current = null;
                }
            },
            queueContentRefresh: files => queueFilesContentRefresh(files),
            scheduleDiff: () => rebuildFileCache?.()
        });

        const handleRename = (file: TAbstractFile, oldPath: string) => {
            if (file instanceof TFile) {
                notifyDrawingCompanionChange(oldPath);
                notifyDrawingCompanionChange(file.path);

                try {
                    const db = getDBInstance();
                    const existing = db.getFile(oldPath);
                    if (existing) {
                        // Renames are handled as "seed + batched move":
                        // - Seed the new path in the in-memory mirror so synchronous reads during the rename window see a consistent record.
                        // - Begin blob/preview move markers so reads fall back to the old path until the stores move.
                        // - Buffer the move in event order; the zero-delay flush persists the burst's seeded records
                        //   and moves stored blobs/preview text in one batched transaction per store.
                        // - Schedule a diff afterwards to reconcile final state and update mtimes.
                        const wasMarkdown = isMarkdownPath(oldPath);
                        const isMarkdown = isMarkdownPath(file.path);
                        const nextPreviewStatus: DBFileData['previewStatus'] = isMarkdown
                            ? wasMarkdown
                                ? existing.previewStatus
                                : 'unprocessed'
                            : 'none';
                        const remappedFeatureImageKey = remapSelfReferentialFeatureImageKey(existing.featureImageKey, oldPath, file.path);
                        const seeded: DBFileData = {
                            ...existing,
                            previewStatus: nextPreviewStatus,
                            featureImageKey: remappedFeatureImageKey ?? existing.featureImageKey,
                            markdownPipelineMtime: wasMarkdown && isMarkdown ? 0 : existing.markdownPipelineMtime,
                            metadataMtime: wasMarkdown && isMarkdown ? 0 : existing.metadataMtime
                        };

                        pendingRenameDataRef.current.set(file.path, seeded);
                        db.seedMemoryFile(file.path, seeded);
                        const hasStoredBlob = existing.featureImageStatus === 'has';
                        if (hasStoredBlob) {
                            // Prevent `getFeatureImageBlob(newPath)` from returning null before the blob store key moves.
                            db.beginFeatureImageBlobMove(oldPath, file.path);
                        }
                        if (wasMarkdown && isMarkdown) {
                            // Prevent preview status repairs while the preview store key is moving from oldPath -> newPath.
                            db.beginPreviewTextMove(oldPath, file.path);
                        }
                        renameFlushBuffer.moves.push({
                            file,
                            oldPath,
                            newPath: file.path,
                            seeded,
                            wasMarkdown,
                            isMarkdown,
                            hasStoredBlob
                        });
                        renameFlushController.scheduleFlush();
                        rebuildFileCache?.();
                        return;
                    }
                } catch (error: unknown) {
                    console.error('Failed to capture renamed file data:', error);
                }
            }
            rebuildFileCache?.();
        };

        const handleModify = (file: TAbstractFile) => {
            if (stoppedRef.current) {
                return;
            }
            if (!(file instanceof TFile)) {
                return;
            }
            if (isDebugLogPath(file.path)) {
                return;
            }

            const drawingFile = findDrawingFileForCompanionImage(app, file.path);
            if (drawingFile) {
                notifyDrawingCompanionChange(file.path);
                return;
            }

            if (file.extension !== 'md' && !shouldQueueFileThumbnailProvider(file)) {
                return;
            }

            modifyFlushBuffer.files.set(file.path, file);
            scheduleModifiedFilesFlush();
        };

        const handleCreateOrDelete = (file: TAbstractFile) => {
            if (file instanceof TFile && isDebugLogPath(file.path)) {
                return;
            }
            rebuildFileCache?.();
            if (file instanceof TFile) {
                notifyDrawingCompanionChange(file.path);
            }
        };

        const vaultEvents = [
            app.vault.on('create', handleCreateOrDelete),
            app.vault.on('delete', handleCreateOrDelete),
            app.vault.on('rename', handleRename),
            app.vault.on('modify', handleModify)
        ];
        activeVaultEventRefsRef.current = vaultEvents;

        const handleMetadataChange = (file: TAbstractFile | null) => {
            if (stoppedRef.current) {
                return;
            }
            if (!(file instanceof TFile) || file.extension !== 'md' || isDebugLogPath(file.path)) {
                return;
            }
            if (getMetadataDependentTypes(latestSettingsRef.current).length === 0) {
                return;
            }

            metadataChangeFlushBuffer.files.set(file.path, file);
            scheduleMetadataChangedFilesFlush();
        };

        const metadataEvent = app.metadataCache.on('changed', handleMetadataChange);
        activeMetadataEventRefRef.current = metadataEvent;

        return () => {
            buildFileCacheFnRef.current = null;
            vaultEvents.forEach(eventRef => app.vault.offref(eventRef));
            app.metadataCache.offref(metadataEvent);
            activeVaultEventRefsRef.current = null;
            activeMetadataEventRefRef.current = null;

            if (pendingSyncTimeoutIdRef.current !== null) {
                if (typeof window !== 'undefined') {
                    window.clearTimeout(pendingSyncTimeoutIdRef.current);
                }
                pendingSyncTimeoutIdRef.current = null;
            }
            // Keep buffered files so the next effect run can reschedule their flushes; only cancel the timers.
            clearPendingModifyFlushTimer();
            clearPendingMetadataChangeFlushTimer();

            // Flush buffered renames now: their seeded memory records must not outlive the effect
            // unpersisted. A plain view close never remounts this effect, and the next session's diff
            // would treat the seeded paths as unchanged while deleting the old-path artifacts. On plugin
            // shutdown `stopAllProcessing` has already emptied the buffer and the flush drops out.
            renameFlushController.flushNow();

            // Clears debouncers and pending waits so no background work continues after teardown.
            cancelTreeRebuildDebouncer({ reset: true });
            disposeMetadataWaitDisposers();
        };
    }, [
        app,
        api,
        activeMetadataEventRefRef,
        activeVaultEventRefsRef,
        buildFileCacheFnRef,
        cancelTreeRebuildDebouncer,
        contentRegistryRef,
        disposeMetadataWaitDisposers,
        getIndexableFiles,
        getVisibleMarkdownFiles,
        hasBuiltInitialCacheRef,
        isFirstLoadRef,
        isIndexedDBReady,
        isStorageReadyRef,
        latestSettingsRef,
        metadataChangeFlushBufferRef,
        modifyFlushBufferRef,
        pendingRenameDataRef,
        pendingSyncTimeoutIdRef,
        queueIndexableFilesForContentGeneration,
        queueIndexableFilesNeedingContentGeneration,
        queueMetadataContentWhenReady,
        rebuildFileCacheRef,
        rebuildTagTree,
        rebuildPropertyTree,
        renameFlushBufferRef,
        scheduleTagTreeRebuild,
        schedulePropertyTreeRebuild,
        setIsStorageReady,
        settings,
        stoppedRef,
        startCacheRebuildNotice
    ]);
}
