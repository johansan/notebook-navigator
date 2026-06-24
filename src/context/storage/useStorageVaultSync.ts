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
import { getDBInstance, markFilesForRegeneration, recordFileChanges, removeFilesFromCache } from '../../storage/fileOperations';
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
 * - Rename handling preserves existing cached content by seeding the new path with the old record and moving any
 *   stored blobs/text before the next diff runs.
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
    buildFileCacheFnRef: MutableRefObject<((isInitialLoad?: boolean) => Promise<void>) | null>;
    rebuildFileCacheRef: MutableRefObject<ReturnType<typeof debounce> | null>;
    activeVaultEventRefsRef: MutableRefObject<EventRef[] | null>;
    activeMetadataEventRefRef: MutableRefObject<EventRef | null>;
    rebuildTagTree: () => Map<string, TagTreeNode>;
    scheduleTagTreeRebuild: (options?: { flush?: boolean }) => void;
    cancelTagTreeRebuildDebouncer: (options?: { reset?: boolean }) => void;
    rebuildPropertyTree: () => Map<string, PropertyTreeNode>;
    schedulePropertyTreeRebuild: (options?: { flush?: boolean }) => void;
    cancelPropertyTreeRebuildDebouncer: (options?: { reset?: boolean }) => void;
    startCacheRebuildNotice: (total: number, enabledTypes: FileContentType[]) => void;
    getIndexableFiles: () => TFile[];
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
        buildFileCacheFnRef,
        rebuildFileCacheRef,
        activeVaultEventRefsRef,
        activeMetadataEventRefRef,
        rebuildTagTree,
        scheduleTagTreeRebuild,
        cancelTagTreeRebuildDebouncer,
        rebuildPropertyTree,
        schedulePropertyTreeRebuild,
        cancelPropertyTreeRebuildDebouncer,
        startCacheRebuildNotice,
        getIndexableFiles,
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
                    const { toAdd, toUpdate, toRemove, cachedFiles } = await calculateFileDiff(allFiles);
                    const diffElapsedMs = Math.round(performance.now() - diffStartMs);

                    if (toRemove.length > 0) {
                        await removeFilesFromCache(toRemove);
                    }

                    if (toAdd.length > 0 || toUpdate.length > 0) {
                        await recordFileChanges([...toAdd, ...toUpdate], cachedFiles, pendingRenameDataRef.current);
                    }

                    const tagTreeStartMs = performance.now();
                    rebuildTagTree();
                    const tagTreeElapsedMs = Math.round(performance.now() - tagTreeStartMs);
                    const propertyTreeStartMs = performance.now();
                    rebuildPropertyTree();
                    const propertyTreeElapsedMs = Math.round(performance.now() - propertyTreeStartMs);

                    isStorageReadyRef.current = true;
                    setIsStorageReady(true);

                    api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].setStorageReady(true);

                    const metadataDependentTypes = getMetadataDependentTypes(settings);
                    const contentEnabled = metadataDependentTypes.length > 0;
                    const queuedStartupDetails: Record<string, unknown> = { metadataDependentTypes };

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
                        cachedFileCount: cachedFiles.size,
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
                        const { toAdd, toUpdate, toRemove, cachedFiles } = await calculateFileDiff(allFiles);
                        recordStartupDiagnostic('storage.diff.processed', {
                            indexableFileCount: allFiles.length,
                            cachedFileCount: cachedFiles.size,
                            toAdd: toAdd.length,
                            toUpdate: toUpdate.length,
                            toRemove: toRemove.length
                        });

                        if (toAdd.length > 0 || toUpdate.length > 0 || toRemove.length > 0) {
                            try {
                                const filesToUpdate = [...toAdd, ...toUpdate];
                                if (filesToUpdate.length > 0) {
                                    await recordFileChanges(filesToUpdate, cachedFiles, pendingRenameDataRef.current);
                                }

                                if (toRemove.length > 0) {
                                    await removeFilesFromCache(toRemove);
                                    if (settings.showTags) {
                                        scheduleTagTreeRebuild();
                                    }
                                    if (isPropertyFeatureEnabled(settings)) {
                                        // Flush rebuild after cache removals so deleted files are reflected in the property tree counts.
                                        schedulePropertyTreeRebuild({ flush: true });
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

        const queueFileContentRefresh = (file: TFile) => {
            queueFilesContentRefresh([file]);
        };

        const pendingModifiedFiles = new Map<string, TFile>();
        let pendingModifyFlushTimerId: number | null = null;
        let isProcessingModifyBatch = false;
        const pendingMetadataChangedFiles = new Map<string, TFile>();
        let pendingMetadataChangeFlushTimerId: number | null = null;
        let isProcessingMetadataChangeBatch = false;

        const clearPendingModifyFlushTimer = () => {
            if (pendingModifyFlushTimerId === null) {
                return;
            }
            if (typeof window !== 'undefined') {
                window.clearTimeout(pendingModifyFlushTimerId);
            }
            pendingModifyFlushTimerId = null;
        };

        const clearPendingMetadataChangeFlushTimer = () => {
            if (pendingMetadataChangeFlushTimerId === null) {
                return;
            }
            if (typeof window !== 'undefined') {
                window.clearTimeout(pendingMetadataChangeFlushTimerId);
            }
            pendingMetadataChangeFlushTimerId = null;
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
            pendingModifyFlushTimerId = null;
            if (isProcessingModifyBatch) {
                return;
            }

            runAsyncAction(async () => {
                if (stoppedRef.current) {
                    pendingModifiedFiles.clear();
                    return;
                }

                const pendingFiles = Array.from(pendingModifiedFiles.values());
                pendingModifiedFiles.clear();
                if (pendingFiles.length === 0) {
                    return;
                }

                const files = resolveLiveFiles(pendingFiles);
                if (files.length === 0) {
                    return;
                }

                let recordedChanges = false;
                isProcessingModifyBatch = true;
                try {
                    const db = getDBInstance();
                    const existingData = db.getFiles(files.map(file => file.path));
                    await recordFileChanges(files, existingData, pendingRenameDataRef.current);
                    recordedChanges = true;
                } catch (error: unknown) {
                    console.error('Failed to record file changes on modify:', error);
                } finally {
                    isProcessingModifyBatch = false;
                }

                if (recordedChanges) {
                    queueFilesContentRefresh(files);
                }

                if (pendingModifiedFiles.size > 0 && !stoppedRef.current) {
                    scheduleModifiedFilesFlush();
                }
            });
        };

        const scheduleModifiedFilesFlush = () => {
            if (stoppedRef.current || isProcessingModifyBatch || pendingModifyFlushTimerId !== null) {
                return;
            }

            if (typeof window !== 'undefined') {
                pendingModifyFlushTimerId = window.setTimeout(flushModifiedFiles, TIMEOUTS.FILE_OPERATION_DELAY);
                return;
            }

            flushModifiedFiles();
        };

        const flushMetadataChangedFiles = () => {
            pendingMetadataChangeFlushTimerId = null;
            if (isProcessingMetadataChangeBatch) {
                return;
            }

            runAsyncAction(async () => {
                if (stoppedRef.current) {
                    pendingMetadataChangedFiles.clear();
                    return;
                }

                const pendingFiles = Array.from(pendingMetadataChangedFiles.values());
                pendingMetadataChangedFiles.clear();
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
                let canQueueContentRefresh = true;

                isProcessingMetadataChangeBatch = true;
                try {
                    if (metadataDependentTypes.length > 0) {
                        // Obsidian's metadata cache can change after initial indexing even when file mtime did
                        // not trigger a "modify" handler in the expected order. Mark files for regeneration so
                        // metadata-dependent providers re-run against the updated cache snapshot.
                        await markFilesForRegeneration(filesToRefresh, metadataDependentTypes);
                    }
                } catch (error: unknown) {
                    canQueueContentRefresh = false;
                    console.error('Failed to mark files for regeneration:', error);
                } finally {
                    isProcessingMetadataChangeBatch = false;
                }

                if (canQueueContentRefresh) {
                    queueFilesContentRefresh(filesToRefresh);
                }

                if (pendingMetadataChangedFiles.size > 0 && !stoppedRef.current) {
                    scheduleMetadataChangedFilesFlush();
                }
            });
        };

        const scheduleMetadataChangedFilesFlush = () => {
            if (stoppedRef.current || isProcessingMetadataChangeBatch || pendingMetadataChangeFlushTimerId !== null) {
                return;
            }

            if (typeof window !== 'undefined') {
                pendingMetadataChangeFlushTimerId = window.setTimeout(flushMetadataChangedFiles, TIMEOUTS.FILE_OPERATION_DELAY);
                return;
            }

            flushMetadataChangedFiles();
        };

        const notifyDrawingCompanionChange = (imagePath: string) => {
            emitDrawingCompanionImageChange(app, imagePath);
        };

        const handleRename = (file: TAbstractFile, oldPath: string) => {
            if (file instanceof TFile) {
                notifyDrawingCompanionChange(oldPath);
                notifyDrawingCompanionChange(file.path);

                try {
                    const db = getDBInstance();
                    const existing = db.getFile(oldPath);
                    if (existing) {
                        // Renames are handled as "seed + move artifacts":
                        // - Seed the new path in the in-memory mirror so synchronous reads during the rename window see a consistent record.
                        // - Persist the seeded record to IndexedDB before any provider writes run for the new path.
                        // - Move any stored blobs/text keyed by path.
                        // - Schedule a diff afterwards to reconcile final state and update mtimes.
                        const wasMarkdown = isMarkdownPath(oldPath);
                        const isMarkdown = isMarkdownPath(file.path);
                        const nextPreviewStatus: DBFileData['previewStatus'] = isMarkdown
                            ? wasMarkdown
                                ? existing.previewStatus
                                : 'unprocessed'
                            : 'none';
                        const seeded: DBFileData = {
                            ...existing,
                            previewStatus: nextPreviewStatus,
                            markdownPipelineMtime: wasMarkdown && isMarkdown ? 0 : existing.markdownPipelineMtime,
                            metadataMtime: wasMarkdown && isMarkdown ? 0 : existing.metadataMtime
                        };

                        pendingRenameDataRef.current.set(file.path, seeded);
                        db.seedMemoryFile(file.path, seeded);
                        if (existing.featureImageStatus === 'has') {
                            // Prevent `getFeatureImageBlob(newPath)` from returning null before the blob store key moves.
                            db.beginFeatureImageBlobMove(oldPath, file.path);
                        }
                        if (wasMarkdown && isMarkdown) {
                            // Prevent preview status repairs while the preview store key is moving from oldPath -> newPath.
                            db.beginPreviewTextMove(oldPath, file.path);
                        }
                        runAsyncAction(async () => {
                            try {
                                // Persist the seeded record at `newPath` before content providers run.
                                //
                                // Content providers can still run during the rename window (before the next diff reconciles the vault).
                                // Provider writes fetch the main IndexedDB record for the path first. If the record is missing, the
                                // provider layer creates a default record, which resets preview/feature-image fields (status/key) and
                                // also drops any cached preview text for the path.
                                //
                                // Keeping a real record in IndexedDB avoids the default-record path and preserves the seeded fields
                                // until the diff finishes and deletes `oldPath`.
                                await db.setFile(file.path, { ...seeded, mtime: file.stat.mtime });
                                const operations: Promise<void>[] = [db.moveFeatureImageBlob(oldPath, file.path)];

                                if (wasMarkdown && isMarkdown) {
                                    operations.push(db.movePreviewText(oldPath, file.path));
                                } else if (wasMarkdown) {
                                    operations.push(
                                        db.deletePreviewText(oldPath).catch((error: unknown) => {
                                            console.error('Failed to delete preview text after rename:', {
                                                oldPath,
                                                newPath: file.path,
                                                error
                                            });
                                        })
                                    );
                                }

                                await Promise.all(operations);
                                queueFileContentRefresh(file);
                            } finally {
                                rebuildFileCache?.();
                            }
                        });
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

            pendingModifiedFiles.set(file.path, file);
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

            pendingMetadataChangedFiles.set(file.path, file);
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
            clearPendingModifyFlushTimer();
            pendingModifiedFiles.clear();
            clearPendingMetadataChangeFlushTimer();
            pendingMetadataChangedFiles.clear();

            // Clears debouncers and pending waits so no background work continues after teardown.
            cancelTagTreeRebuildDebouncer({ reset: true });
            cancelPropertyTreeRebuildDebouncer({ reset: true });
            disposeMetadataWaitDisposers();
        };
    }, [
        app,
        api,
        activeMetadataEventRefRef,
        activeVaultEventRefsRef,
        buildFileCacheFnRef,
        cancelTagTreeRebuildDebouncer,
        cancelPropertyTreeRebuildDebouncer,
        contentRegistryRef,
        disposeMetadataWaitDisposers,
        getIndexableFiles,
        hasBuiltInitialCacheRef,
        isFirstLoadRef,
        isIndexedDBReady,
        isStorageReadyRef,
        latestSettingsRef,
        pendingRenameDataRef,
        pendingSyncTimeoutIdRef,
        queueIndexableFilesForContentGeneration,
        queueIndexableFilesNeedingContentGeneration,
        queueMetadataContentWhenReady,
        rebuildFileCacheRef,
        rebuildTagTree,
        rebuildPropertyTree,
        scheduleTagTreeRebuild,
        schedulePropertyTreeRebuild,
        setIsStorageReady,
        settings,
        stoppedRef,
        startCacheRebuildNotice
    ]);
}
