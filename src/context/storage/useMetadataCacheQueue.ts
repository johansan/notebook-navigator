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

import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import { EventRef, TFile, type App } from 'obsidian';
import type { ContentProviderRegistry } from '../../services/content/ContentProviderRegistry';
import type { ContentProviderType } from '../../interfaces/IContentProvider';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { filterFilesRequiringMetadataSources } from '../storageQueueFilters';
import { getMetadataDependentTypes, resolveMetadataDependentTypes } from './storageContentTypes';

type PendingMetadataWaitMask = number;

// Bitmask tracking which metadata-dependent content types are still waiting on `metadataCache` per file path.
const PENDING_METADATA_WAIT_MARKDOWN_PIPELINE = 1;
const PENDING_METADATA_WAIT_TAGS = 2;
const PENDING_METADATA_WAIT_METADATA = 4;

function getPendingMetadataWaitMask(type: ContentProviderType): PendingMetadataWaitMask {
    switch (type) {
        case 'markdownPipeline':
            return PENDING_METADATA_WAIT_MARKDOWN_PIPELINE;
        case 'tags':
            return PENDING_METADATA_WAIT_TAGS;
        case 'metadata':
            return PENDING_METADATA_WAIT_METADATA;
        default:
            // Types that do not depend on `metadataCache` are not tracked by this hook.
            return 0;
    }
}

function getPendingMetadataWaitMaskForTypes(types: ContentProviderType[]): PendingMetadataWaitMask {
    let mask = 0;
    for (const type of types) {
        mask |= getPendingMetadataWaitMask(type);
    }
    return mask;
}

function getTypesForPendingMetadataWaitMask(mask: PendingMetadataWaitMask): ContentProviderType[] {
    // Converts a pending mask into `include` types for `ContentProviderRegistry.queueFilesForAllProviders`.
    const types: ContentProviderType[] = [];
    if ((mask & PENDING_METADATA_WAIT_MARKDOWN_PIPELINE) !== 0) {
        types.push('markdownPipeline');
    }
    if ((mask & PENDING_METADATA_WAIT_TAGS) !== 0) {
        types.push('tags');
    }
    if ((mask & PENDING_METADATA_WAIT_METADATA) !== 0) {
        types.push('metadata');
    }
    return types;
}

/**
 * Queues metadata-dependent content providers once Obsidian's metadata cache is ready.
 *
 * Obsidian populates `app.metadataCache` asynchronously. Some providers (tags, frontmatter metadata, and
 * property extraction) must not run until `metadataCache.getFileCache(file)` returns a value.
 *
 * Flow:
 * 1) Queue files that already have metadata cache entries.
 * 2) Track remaining paths and queue them as their metadata cache entries appear (via `metadataCache` events).
 *
 * The `pendingMetadataWaitPathsRef` map is a per-path guard against duplicated listeners when multiple callers
 * request the same content types for the same files.
 */
export function useMetadataCacheQueue(params: {
    app: App;
    settings: NotebookNavigatorSettings;
    latestSettingsRef: MutableRefObject<NotebookNavigatorSettings>;
    stoppedRef: MutableRefObject<boolean>;
    contentRegistryRef: MutableRefObject<ContentProviderRegistry | null>;
    metadataWaitDisposersRef: MutableRefObject<Set<() => void>>;
    pendingMetadataWaitPathsRef: MutableRefObject<Map<string, PendingMetadataWaitMask>>;
}): {
    queueMetadataContentWhenReady: (
        files: TFile[],
        includeTypes?: ContentProviderType[],
        settingsOverride?: NotebookNavigatorSettings
    ) => void;
    disposeMetadataWaitDisposers: () => void;
} {
    const { app, settings, latestSettingsRef, stoppedRef, contentRegistryRef, metadataWaitDisposersRef, pendingMetadataWaitPathsRef } =
        params;

    const disposeMetadataWaitDisposers = useCallback(() => {
        const metadataDisposers = metadataWaitDisposersRef.current;
        if (metadataDisposers.size === 0) {
            return;
        }

        for (const dispose of metadataDisposers) {
            try {
                dispose();
            } catch {
                // ignore errors during cleanup
            }
        }
        metadataDisposers.clear();
    }, [metadataWaitDisposersRef]);

    // Stores the active listener cleanup callback while metadata wait listeners are attached.
    const metadataWaitCleanupRef = useRef<(() => void) | null>(null);
    // Batches ready files by the mask they were waiting on so each flush can enqueue the same `include` set.
    const pendingReadyFilesByMaskRef = useRef<Map<PendingMetadataWaitMask, TFile[]>>(new Map());
    // Coordinates deferred flush/sweep passes triggered by metadata cache events.
    const flushTimeoutIdRef = useRef<number | null>(null);
    const sweepIteratorRef = useRef<Iterator<string> | null>(null);
    const sweepTimeoutIdRef = useRef<number | null>(null);
    const warningTimeoutIdRef = useRef<number | null>(null);

    /**
     * Effect: Clean up pending metadata waits for disabled content types.
     *
     * Callers can queue multiple metadata-dependent types. When a setting disables a type (for example,
     * turning off tags), remove it from the pending set so we don't keep wait state for work that can
     * no longer be scheduled.
     */
    useEffect(() => {
        const activeMask = getPendingMetadataWaitMaskForTypes(getMetadataDependentTypes(settings, app));
        pendingMetadataWaitPathsRef.current.forEach((mask, path) => {
            // Clear bits for providers that are disabled by the latest settings.
            const nextMask = mask & activeMask;
            if (nextMask === 0) {
                pendingMetadataWaitPathsRef.current.delete(path);
                return;
            }
            if (nextMask !== mask) {
                pendingMetadataWaitPathsRef.current.set(path, nextMask);
            }
        });
    }, [app, pendingMetadataWaitPathsRef, settings]);

    /**
     * Effect: Cancel metadata waits when no dependent providers are enabled.
     *
     * When all metadata-dependent providers are disabled, there is no reason to keep event listeners alive.
     */
    useEffect(() => {
        if (getMetadataDependentTypes(settings, app).length > 0) {
            return;
        }

        disposeMetadataWaitDisposers();
        pendingMetadataWaitPathsRef.current.clear();
    }, [app, disposeMetadataWaitDisposers, pendingMetadataWaitPathsRef, settings]);

    const clearWarningTimer = useCallback(() => {
        if (warningTimeoutIdRef.current === null) {
            return;
        }
        if (typeof window !== 'undefined') {
            window.clearTimeout(warningTimeoutIdRef.current);
        }
        warningTimeoutIdRef.current = null;
    }, []);

    const scheduleWarning = useCallback(() => {
        if (warningTimeoutIdRef.current !== null) {
            return;
        }
        if (typeof window === 'undefined') {
            return;
        }

        const METADATA_WAIT_WARNING_MS = 10_000;

        warningTimeoutIdRef.current = window.setTimeout(() => {
            warningTimeoutIdRef.current = null;
            const totalPending = pendingMetadataWaitPathsRef.current.size;
            if (totalPending === 0) {
                return;
            }

            const unresolved: string[] = [];
            for (const path of pendingMetadataWaitPathsRef.current.keys()) {
                unresolved.push(path);
                if (unresolved.length >= 20) {
                    break;
                }
            }

            console.error('Notebook Navigator could not resolve metadata for all files.', {
                unresolved,
                totalPending,
                hint: 'Reduce file size, fix invalid frontmatter, exclude the files, or disable metadata-dependent providers.'
            });
        }, METADATA_WAIT_WARNING_MS);
    }, [pendingMetadataWaitPathsRef]);

    const maybeDisposeMetadataWaitListeners = useCallback(() => {
        const cleanup = metadataWaitCleanupRef.current;
        if (!cleanup) {
            return;
        }

        if (pendingMetadataWaitPathsRef.current.size > 0) {
            return;
        }

        if (flushTimeoutIdRef.current !== null) {
            return;
        }

        if (sweepTimeoutIdRef.current !== null) {
            return;
        }

        if (sweepIteratorRef.current) {
            return;
        }

        if (pendingReadyFilesByMaskRef.current.size > 0) {
            return;
        }

        cleanup();
    }, [
        flushTimeoutIdRef,
        metadataWaitCleanupRef,
        pendingMetadataWaitPathsRef,
        pendingReadyFilesByMaskRef,
        sweepIteratorRef,
        sweepTimeoutIdRef
    ]);

    const flushReadyFiles = useCallback(() => {
        if (stoppedRef.current) {
            pendingReadyFilesByMaskRef.current.clear();
            return;
        }

        const registry = contentRegistryRef.current;
        if (!registry) {
            pendingReadyFilesByMaskRef.current.clear();
            return;
        }

        const latestSettings = latestSettingsRef.current;
        const activeMask = getPendingMetadataWaitMaskForTypes(getMetadataDependentTypes(latestSettings, app));
        if (activeMask === 0) {
            pendingReadyFilesByMaskRef.current.clear();
            return;
        }

        const batches = pendingReadyFilesByMaskRef.current;
        pendingReadyFilesByMaskRef.current = new Map();

        for (const [mask, files] of batches) {
            if (files.length === 0) {
                continue;
            }
            const effectiveMask = mask & activeMask;
            if (effectiveMask === 0) {
                continue;
            }
            const include = getTypesForPendingMetadataWaitMask(effectiveMask);
            if (include.length === 0) {
                continue;
            }
            registry.queueFilesForAllProviders(files, latestSettings, { include });
        }

        maybeDisposeMetadataWaitListeners();
    }, [app, contentRegistryRef, latestSettingsRef, maybeDisposeMetadataWaitListeners, stoppedRef]);

    const scheduleFlushReadyFiles = useCallback(() => {
        if (flushTimeoutIdRef.current !== null) {
            return;
        }
        if (typeof window === 'undefined') {
            flushReadyFiles();
            return;
        }
        // Coalesce multiple `metadataCache` events into a single registry enqueue pass.
        flushTimeoutIdRef.current = window.setTimeout(() => {
            flushTimeoutIdRef.current = null;
            flushReadyFiles();
        }, 0);
    }, [flushReadyFiles]);

    const queueReadyFile = useCallback(
        (file: TFile, pendingMask: PendingMetadataWaitMask) => {
            const existing = pendingReadyFilesByMaskRef.current.get(pendingMask);
            if (existing) {
                existing.push(file);
            } else {
                pendingReadyFilesByMaskRef.current.set(pendingMask, [file]);
            }
            scheduleFlushReadyFiles();
        },
        [scheduleFlushReadyFiles]
    );

    const maybeQueuePendingFile = useCallback(
        (file: TFile) => {
            const pendingMask = pendingMetadataWaitPathsRef.current.get(file.path) ?? 0;
            if (pendingMask === 0) {
                return;
            }

            const cacheReady = Boolean(app.metadataCache.getFileCache(file));
            if (!cacheReady) {
                return;
            }

            // Preserve the pending mask so the flush can enqueue only the content types requested for this path.
            pendingMetadataWaitPathsRef.current.delete(file.path);
            queueReadyFile(file, pendingMask);

            if (pendingMetadataWaitPathsRef.current.size === 0) {
                clearWarningTimer();
            }
        },
        [app, clearWarningTimer, pendingMetadataWaitPathsRef, queueReadyFile]
    );

    const runSweepChunk = useCallback(() => {
        if (sweepTimeoutIdRef.current !== null && typeof window !== 'undefined') {
            window.clearTimeout(sweepTimeoutIdRef.current);
        }
        sweepTimeoutIdRef.current = null;

        if (stoppedRef.current) {
            sweepIteratorRef.current = null;
            return;
        }

        const iterator = sweepIteratorRef.current;
        if (!iterator) {
            return;
        }

        const stepLimit = 500;
        for (let step = 0; step < stepLimit; step += 1) {
            const next = iterator.next();
            if (next.done) {
                sweepIteratorRef.current = null;
                break;
            }

            const path = next.value;
            const pendingMask = pendingMetadataWaitPathsRef.current.get(path) ?? 0;
            if (pendingMask === 0) {
                continue;
            }

            // Resolve the latest `TFile` for the path; pending paths can be removed/renamed while waiting.
            const abstract = app.vault.getAbstractFileByPath(path);
            if (!(abstract instanceof TFile) || abstract.extension !== 'md') {
                pendingMetadataWaitPathsRef.current.delete(path);
                continue;
            }

            const cacheReady = Boolean(app.metadataCache.getFileCache(abstract));
            if (!cacheReady) {
                continue;
            }

            pendingMetadataWaitPathsRef.current.delete(path);
            queueReadyFile(abstract, pendingMask);
        }

        if (sweepIteratorRef.current) {
            if (typeof window !== 'undefined') {
                sweepTimeoutIdRef.current = window.setTimeout(() => {
                    sweepTimeoutIdRef.current = null;
                    runSweepChunk();
                }, 0);
            } else {
                runSweepChunk();
            }
            return;
        }

        if (pendingMetadataWaitPathsRef.current.size === 0) {
            clearWarningTimer();
            maybeDisposeMetadataWaitListeners();
        }
    }, [app, clearWarningTimer, maybeDisposeMetadataWaitListeners, pendingMetadataWaitPathsRef, queueReadyFile, stoppedRef]);

    const startSweep = useCallback(() => {
        if (sweepIteratorRef.current) {
            return;
        }
        if (pendingMetadataWaitPathsRef.current.size === 0) {
            return;
        }

        sweepIteratorRef.current = pendingMetadataWaitPathsRef.current.keys();

        if (typeof window !== 'undefined') {
            sweepTimeoutIdRef.current = window.setTimeout(() => {
                sweepTimeoutIdRef.current = null;
                runSweepChunk();
            }, 0);
        } else {
            runSweepChunk();
        }
    }, [pendingMetadataWaitPathsRef, runSweepChunk]);

    const ensureMetadataWaitListeners = useCallback(() => {
        if (metadataWaitCleanupRef.current) {
            return;
        }

        // One listener pair for the shared pending map, disposed once all pending work has flushed.
        let resolvedEventRef: EventRef | null = null;
        let changedEventRef: EventRef | null = null;
        let disposed = false;

        const cleanup = () => {
            if (disposed) {
                return;
            }
            disposed = true;

            clearWarningTimer();

            if (flushTimeoutIdRef.current !== null && typeof window !== 'undefined') {
                window.clearTimeout(flushTimeoutIdRef.current);
            }
            flushTimeoutIdRef.current = null;
            pendingReadyFilesByMaskRef.current.clear();

            if (sweepTimeoutIdRef.current !== null && typeof window !== 'undefined') {
                window.clearTimeout(sweepTimeoutIdRef.current);
            }
            sweepTimeoutIdRef.current = null;
            sweepIteratorRef.current = null;

            if (resolvedEventRef) {
                try {
                    app.metadataCache.offref(resolvedEventRef);
                } catch {
                    // ignore
                }
                resolvedEventRef = null;
            }
            if (changedEventRef) {
                try {
                    app.metadataCache.offref(changedEventRef);
                } catch {
                    // ignore
                }
                changedEventRef = null;
            }

            metadataWaitDisposersRef.current.delete(cleanup);
            metadataWaitCleanupRef.current = null;
        };

        resolvedEventRef = app.metadataCache.on('resolved', () => {
            clearWarningTimer();
            startSweep();
            if (pendingMetadataWaitPathsRef.current.size > 0) {
                scheduleWarning();
            }
        });

        changedEventRef = app.metadataCache.on('changed', file => {
            // `changed` fires for specific files; enqueue immediately when the cache entry exists.
            if (!(file instanceof TFile) || file.extension !== 'md') {
                return;
            }
            maybeQueuePendingFile(file);
        });

        metadataWaitCleanupRef.current = cleanup;
        metadataWaitDisposersRef.current.add(cleanup);

        startSweep();
        if (pendingMetadataWaitPathsRef.current.size > 0) {
            scheduleWarning();
        }
    }, [app, clearWarningTimer, maybeQueuePendingFile, metadataWaitDisposersRef, pendingMetadataWaitPathsRef, scheduleWarning, startSweep]);

    const queueMetadataContentWhenReady = useCallback(
        (files: TFile[], includeTypes?: ContentProviderType[], settingsOverride?: NotebookNavigatorSettings) => {
            const baseSettings = settingsOverride ?? latestSettingsRef.current;
            const requestedTypes = resolveMetadataDependentTypes(baseSettings, includeTypes, app);
            const requestedMask = getPendingMetadataWaitMaskForTypes(requestedTypes);

            if (requestedTypes.length === 0 || requestedMask === 0) {
                return;
            }

            const markdownFiles: TFile[] = [];
            const seenPaths = new Set<string>();
            for (const file of files) {
                if (file.extension !== 'md') {
                    continue;
                }
                if (seenPaths.has(file.path)) {
                    continue;
                }
                seenPaths.add(file.path);
                markdownFiles.push(file);
            }
            if (markdownFiles.length === 0) {
                return;
            }

            // Keeps only files that still need one of the requested metadata-dependent providers.
            const filesForQueue = filterFilesRequiringMetadataSources(markdownFiles, requestedTypes, baseSettings, {
                // When metadata cache is not ready yet, prefer treating metadata as missing to avoid "false ready"
                // files (for example when only a subset of fields has been indexed).
                conservativeMetadata: true,
                app
            });
            if (filesForQueue.length === 0) {
                return;
            }

            // Split files into those with metadata cache ready and those waiting
            const immediateFiles: TFile[] = [];
            let addedPendingCount = 0;

            for (const file of filesForQueue) {
                const pendingMask = pendingMetadataWaitPathsRef.current.get(file.path) ?? 0;
                const hasAllPending = (pendingMask & requestedMask) === requestedMask;
                if (hasAllPending) {
                    continue;
                }

                const cacheReady = Boolean(app.metadataCache.getFileCache(file));
                if (cacheReady) {
                    immediateFiles.push(file);
                } else {
                    pendingMetadataWaitPathsRef.current.set(file.path, pendingMask | requestedMask);
                    addedPendingCount += 1;
                }
            }

            // Queues files for content generation with the requested types
            const queueFilesForTypes = (targetFiles: TFile[]) => {
                if (targetFiles.length === 0 || stoppedRef.current) {
                    return;
                }
                const latestSettings = latestSettingsRef.current;
                const activeTypes = resolveMetadataDependentTypes(latestSettings, includeTypes, app);
                if (activeTypes.length === 0 || !contentRegistryRef.current) {
                    return;
                }
                contentRegistryRef.current.queueFilesForAllProviders(targetFiles, latestSettings, { include: activeTypes });
            };

            // Queue files with metadata cache already ready
            if (immediateFiles.length > 0) {
                queueFilesForTypes(immediateFiles);
            }

            if (addedPendingCount > 0) {
                ensureMetadataWaitListeners();
                return;
            }

            // Disposers can run while the pending path map is non-empty (for example, when a storage hook re-runs
            // during settings changes). If a follow-up queue call contains only already-pending paths, it won't
            // set `addedPending`. Ensure listeners are still attached so pending files can flush when ready.
            if (pendingMetadataWaitPathsRef.current.size > 0 && !metadataWaitCleanupRef.current) {
                ensureMetadataWaitListeners();
            }
        },
        [
            app,
            contentRegistryRef,
            ensureMetadataWaitListeners,
            latestSettingsRef,
            metadataWaitCleanupRef,
            pendingMetadataWaitPathsRef,
            stoppedRef
        ]
    );

    return { queueMetadataContentWhenReady, disposeMetadataWaitDisposers };
}
