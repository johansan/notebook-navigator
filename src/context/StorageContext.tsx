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

/**
 * StorageContext - Central state management for storage system
 *
 * What it does:
 * - Monitors vault changes and syncs with database
 * - Builds and maintains the tag tree structure
 * - Coordinates content generation via ContentProviderRegistry
 * - Provides real-time content updates to UI components
 *
 * Relationships:
 * - Uses: IndexedDBStorage, ContentProviderRegistry, FileOperations, DiffCalculator
 * - Provides: StorageContext to all child components
 * - Integrates with: Obsidian vault and metadata APIs
 *
 * Key responsibilities:
 * - Monitor file system events (create, delete, rename, modify)
 * - Calculate diffs and update database accordingly
 * - Rebuild tag tree when tags change
 * - Queue content generation for new/modified files
 * - Handle settings changes and trigger regeneration
 * - Provide metadata extraction methods with frontmatter fallback
 */

import { createContext, useContext, useState, useRef, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { App, TFile, debounce, EventRef } from 'obsidian';
import { ProcessedMetadata, extractMetadata } from '../utils/metadataExtractor';
import { ContentProviderRegistry } from '../services/content/ContentProviderRegistry';
import { useCacheRebuildNotice } from './storage/useCacheRebuildNotice';
import { useIndexedDBReady } from './storage/useIndexedDBReady';
import { useInitializeContentProviderRegistry } from './storage/useInitializeContentProviderRegistry';
import { useMetadataCacheQueue } from './storage/useMetadataCacheQueue';
import { useStorageCacheRebuild } from './storage/useStorageCacheRebuild';
import { useStorageContentQueue } from './storage/useStorageContentQueue';
import { useStorageFileQueries } from './storage/useStorageFileQueries';
import { useTreeRebuildScheduler } from './storage/useTreeRebuildScheduler';
import { useTagTreeSync } from './storage/useTagTreeSync';
import { usePropertyTreeSync } from './storage/usePropertyTreeSync';
import { useStorageVaultSync, type PendingFileFlushBuffer } from './storage/useStorageVaultSync';
import { useStorageSettingsSync } from './storage/useStorageSettingsSync';
import { METADATA_SENTINEL, type FileData as DBFileData, type IndexedDBStorage } from '../storage/IndexedDBStorage';
import { getDBInstance } from '../storage/fileOperations';
import type { StorageFileData } from './storage/storageFileData';
import type { PropertyTreeNode, TagTreeNode } from '../types/storage';
import { getFileDisplayName as getDisplayName } from '../utils/fileNameUtils';
import { findTagNode, collectAllTagPaths } from '../utils/tagTree';
import { useServices } from './ServicesContext';
import { useSettingsState, useActiveProfile } from './SettingsContext';
import { useUXPreferences } from './UXPreferencesContext';
import type { NotebookNavigatorAPI } from '../api/NotebookNavigatorAPI';
import { getCacheRebuildProgressTypes } from './storage/storageContentTypes';
import { clearCacheRebuildNoticeState, getCacheRebuildNoticeState, setCacheRebuildNoticeState } from './storage/cacheRebuildNoticeStorage';
import { shouldQueueFileThumbnailProvider } from './storageQueueFilters';

/**
 * Context value providing both file data (tag tree) and the file cache
 */
interface StorageContextValue {
    fileData: StorageFileData;
    // Methods to get file metadata with frontmatter extraction
    getFileDisplayName: (file: TFile) => string;
    getFileCreatedTime: (file: TFile) => number;
    getFileModifiedTime: (file: TFile) => number;
    getFileTimestamps: (file: TFile) => { created: number; modified: number };
    getFileMetadata: (file: TFile) => { name: string; created: number; modified: number };
    // IndexedDB storage instance for FileItem to use
    getDB: () => IndexedDBStorage;
    // Synchronous database access methods
    getFile: (path: string) => DBFileData | null;
    // Tag tree access methods
    getTagTree: () => Map<string, TagTreeNode>;
    getPropertyTree: () => Map<string, PropertyTreeNode>;
    findTagInTree: (tagPath: string) => TagTreeNode | null;
    getAllTagPaths: () => string[];
    getTagDisplayPath: (path: string) => string;
    getFiles: (paths: string[]) => Map<string, DBFileData>;
    hasPreview: (path: string) => boolean;
    // Storage initialization state
    isStorageReady: boolean;
    stopAllProcessing: () => void;
    rebuildCache: () => Promise<void>;
    regenerateFeatureImageForFile: (file: TFile) => Promise<void>;
}

const StorageContext = createContext<StorageContextValue | null>(null);

type StorageRuntimeActiveListener = (active: boolean) => void;

let activeStorageRuntimeCount = 0;
const storageRuntimeActiveListeners = new Set<StorageRuntimeActiveListener>();

function notifyStorageRuntimeActiveListeners(): void {
    const active = activeStorageRuntimeCount > 0;
    storageRuntimeActiveListeners.forEach(listener => {
        listener(active);
    });
}

function updateActiveStorageRuntimeCount(delta: 1 | -1): void {
    const wasActive = activeStorageRuntimeCount > 0;
    activeStorageRuntimeCount = Math.max(0, activeStorageRuntimeCount + delta);
    if (wasActive !== activeStorageRuntimeCount > 0) {
        notifyStorageRuntimeActiveListeners();
    }
}

export function isStorageRuntimeActive(): boolean {
    return activeStorageRuntimeCount > 0;
}

export function subscribeStorageRuntimeActive(listener: StorageRuntimeActiveListener): () => void {
    storageRuntimeActiveListeners.add(listener);
    listener(isStorageRuntimeActive());
    return () => {
        storageRuntimeActiveListeners.delete(listener);
    };
}

interface StorageProviderProps {
    app: App;
    api: NotebookNavigatorAPI | null;
    children: ReactNode;
}

// Resolves file created/modified timestamps from frontmatter metadata or file stats
const computeFileTimestamps = (file: TFile, extractedMetadata: ProcessedMetadata | null): { created: number; modified: number } => {
    return {
        created:
            extractedMetadata?.fc !== undefined &&
            extractedMetadata.fc !== METADATA_SENTINEL.FIELD_NOT_CONFIGURED &&
            extractedMetadata.fc !== METADATA_SENTINEL.PARSE_FAILED
                ? extractedMetadata.fc
                : file.stat.ctime,
        modified:
            extractedMetadata?.fm !== undefined &&
            extractedMetadata.fm !== METADATA_SENTINEL.FIELD_NOT_CONFIGURED &&
            extractedMetadata.fm !== METADATA_SENTINEL.PARSE_FAILED
                ? extractedMetadata.fm
                : file.stat.mtime
    };
};

export function StorageProvider({ app, api, children }: StorageProviderProps) {
    const settings = useSettingsState();
    const { hiddenFolders, hiddenFileProperties, hiddenFileNames, hiddenTags, hiddenFileTags, fileVisibility, profile } =
        useActiveProfile();
    const uxPreferences = useUXPreferences();
    const showHiddenItems = uxPreferences.showHiddenItems;
    const { tagTreeService, propertyTreeService } = useServices();
    const [fileData, setFileData] = useState<StorageFileData>({
        tagTree: new Map(),
        propertyTree: new Map(),
        tagged: 0,
        untagged: 0,
        hiddenRootTags: new Map()
    });

    // Registry managing content providers for generated file content
    const contentRegistry = useRef<ContentProviderRegistry | null>(null);
    const isFirstLoad = useRef(true);
    // ID of any scheduled timeout for deferred processing, used for cancellation on unmount
    const pendingSyncTimeoutId = useRef<number | null>(null);
    // Flag indicating whether all processing should be stopped (plugin disabled or view closed)
    const stoppedRef = useRef<boolean>(false);
    const metadataWaitDisposersRef = useRef<Set<() => void>>(new Set());
    // Map: file path -> pending metadata-dependent wait mask (used by `useMetadataCacheQueue`).
    const pendingMetadataWaitPathsRef = useRef<Map<string, number>>(new Map());
    const pendingRenameDataRef = useRef<Map<string, DBFileData>>(new Map());
    // Buffered vault `modify` events awaiting a debounced flush. Owned here so buffered entries survive
    // remounts of the vault-sync effect (it re-runs on settings changes).
    const modifyFlushBufferRef = useRef<PendingFileFlushBuffer>({ files: new Map(), timerId: null, isProcessing: false });
    // Buffered `metadataCache.changed` events awaiting a debounced flush. This flush is the only content
    // trigger for markdown saves, so buffered entries must survive effect remounts.
    const metadataChangeFlushBufferRef = useRef<PendingFileFlushBuffer>({ files: new Map(), timerId: null, isProcessing: false });
    const latestSettingsRef = useRef(settings);
    latestSettingsRef.current = settings;
    const activeVaultEventRefs = useRef<EventRef[] | null>(null);
    const activeMetadataEventRef = useRef<EventRef | null>(null);
    const rebuildFileCacheRef = useRef<ReturnType<typeof debounce> | null>(null);
    const buildFileCacheFnRef = useRef<((isInitialLoad?: boolean) => Promise<void>) | null>(null);

    // State tracking whether storage system is fully initialized
    const [isStorageReady, setIsStorageReady] = useState(false);
    const isIndexedDBReady = useIndexedDBReady();

    // Mirrors isStorageReady for callbacks that may run after renders.
    const isStorageReadyRef = useRef(false);
    isStorageReadyRef.current = isStorageReady;

    // Flag preventing duplicate initial cache building during startup
    const hasBuiltInitialCache = useRef(false);
    const { clearCacheRebuildNotice, startCacheRebuildNotice } = useCacheRebuildNotice({
        app,
        stoppedRef,
        onRebuildComplete: clearCacheRebuildNoticeState
    });
    // Run rebuild notice restoration once after storage initialization completes.
    const hasRestoredCacheRebuildNoticeRef = useRef(false);

    useEffect(() => {
        updateActiveStorageRuntimeCount(1);
        return () => {
            updateActiveStorageRuntimeCount(-1);
        };
    }, []);

    const { getVisibleMarkdownFiles, getIndexableFiles } = useStorageFileQueries({ app, latestSettingsRef, showHiddenItems });

    // Shared debounced scheduler that runs tag and property tree rebuilds from one visible-file scan.
    const { tagTreeRebuildFnRef, propertyTreeRebuildFnRef, scheduleTreeRebuild, cancelTreeRebuildDebouncer } = useTreeRebuildScheduler({
        isStorageReadyRef,
        stoppedRef,
        getVisibleMarkdownFiles
    });

    const { rebuildTagTree, scheduleTagTreeRebuild } = useTagTreeSync({
        app,
        settings,
        showHiddenItems,
        hiddenFolders,
        hiddenTags,
        hiddenFileProperties,
        hiddenFileTags,
        fileVisibility,
        profileId: profile.id,
        isStorageReady,
        isStorageReadyRef,
        latestSettingsRef,
        stoppedRef,
        setFileData,
        getVisibleMarkdownFiles,
        tagTreeService: tagTreeService ?? null,
        scheduleTreeRebuild,
        tagTreeRebuildFnRef
    });

    const { rebuildPropertyTree, schedulePropertyTreeRebuild } = usePropertyTreeSync({
        app,
        settings,
        showHiddenItems,
        hiddenFolders,
        hiddenFileProperties,
        hiddenFileNames,
        hiddenFileTags,
        fileVisibility,
        profileId: profile.id,
        isStorageReady,
        isStorageReadyRef,
        latestSettingsRef,
        stoppedRef,
        setFileData,
        getVisibleMarkdownFiles,
        propertyTreeService: propertyTreeService ?? null,
        scheduleTreeRebuild,
        propertyTreeRebuildFnRef
    });

    const { queueMetadataContentWhenReady, disposeMetadataWaitDisposers } = useMetadataCacheQueue({
        app,
        settings,
        latestSettingsRef,
        stoppedRef,
        contentRegistryRef: contentRegistry,
        metadataWaitDisposersRef,
        pendingMetadataWaitPathsRef
    });

    const { queueIndexableFilesForContentGeneration, queueIndexableFilesNeedingContentGeneration } = useStorageContentQueue({
        app,
        contentRegistryRef: contentRegistry,
        queueMetadataContentWhenReady
    });

    const { rebuildCache } = useStorageCacheRebuild({
        contentRegistryRef: contentRegistry,
        pendingSyncTimeoutIdRef: pendingSyncTimeoutId,
        rebuildFileCacheRef,
        cancelTreeRebuildDebouncer,
        disposeMetadataWaitDisposers,
        pendingMetadataWaitPathsRef,
        setFileData,
        tagTreeService: tagTreeService ?? null,
        propertyTreeService: propertyTreeService ?? null,
        setIsStorageReady,
        isStorageReadyRef,
        hasBuiltInitialCacheRef: hasBuiltInitialCache,
        buildFileCacheFnRef,
        latestSettingsRef,
        stoppedRef,
        clearCacheRebuildNotice,
        startCacheRebuildNotice,
        getIndexableFiles
    });

    useEffect(() => {
        if (!isStorageReady || hasRestoredCacheRebuildNoticeRef.current) {
            return;
        }

        hasRestoredCacheRebuildNoticeRef.current = true;
        // Restore rebuild progress notice if a rebuild was in progress during the previous session.
        const state = getCacheRebuildNoticeState();
        if (!state) {
            return;
        }

        const enabledTypes = getCacheRebuildProgressTypes(latestSettingsRef.current);
        if (enabledTypes.length === 0) {
            clearCacheRebuildNoticeState();
            return;
        }

        const pending = getDBInstance().getFilesNeedingAnyContent(enabledTypes).size;
        if (pending <= 0) {
            clearCacheRebuildNoticeState();
            return;
        }

        const total = Math.max(state.total, pending);
        if (total !== state.total) {
            setCacheRebuildNoticeState({ ...state, total });
        }

        startCacheRebuildNotice(total, enabledTypes);
    }, [isStorageReady, startCacheRebuildNotice]);

    const getFileDisplayName = useCallback(
        (file: TFile): string => {
            if (settings.useFrontmatterMetadata) {
                const metadata = extractMetadata(app, file, settings);
                if (metadata.fn) {
                    return metadata.fn;
                }
            }
            return getDisplayName(file, undefined, settings);
        },
        [app, settings]
    );

    const getFileTimestamps = useCallback(
        (file: TFile): { created: number; modified: number } => {
            const extractedMetadata = settings.useFrontmatterMetadata ? extractMetadata(app, file, settings) : null;
            return computeFileTimestamps(file, extractedMetadata);
        },
        [app, settings]
    );

    const getFileCreatedTime = useCallback((file: TFile): number => getFileTimestamps(file).created, [getFileTimestamps]);

    const getFileModifiedTime = useCallback((file: TFile): number => getFileTimestamps(file).modified, [getFileTimestamps]);

    const getFileMetadata = useCallback(
        (file: TFile): { name: string; created: number; modified: number } => {
            const extractedMetadata = settings.useFrontmatterMetadata ? extractMetadata(app, file, settings) : null;
            const timestamps = computeFileTimestamps(file, extractedMetadata);

            return {
                name: extractedMetadata?.fn || getDisplayName(file, undefined, settings),
                created: timestamps.created,
                modified: timestamps.modified
            };
        },
        [app, settings]
    );

    const hasPreview = useCallback((path: string): boolean => getDBInstance().hasPreview(path), []);

    const regenerateFeatureImageForFile = useCallback(
        async (file: TFile) => {
            if (stoppedRef.current) {
                return;
            }

            const liveSettings = latestSettingsRef.current;
            if (!liveSettings.showFeatureImage) {
                return;
            }

            if (file.extension !== 'md' && !shouldQueueFileThumbnailProvider(file)) {
                return;
            }

            try {
                const db = getDBInstance();
                await db.clearFileContent(file.path, 'featureImage');
            } catch (error: unknown) {
                console.error('Failed to clear feature image content:', error);
                return;
            }

            if (stoppedRef.current || !contentRegistry.current) {
                return;
            }

            try {
                if (file.extension === 'md') {
                    queueMetadataContentWhenReady([file], ['markdownPipeline'], liveSettings);
                } else {
                    contentRegistry.current.queueFilesForAllProviders([file], liveSettings, { include: ['fileThumbnails'] });
                }
            } catch (error: unknown) {
                console.error('Failed to queue feature image regeneration for file:', file.path, error);
            }
        },
        [queueMetadataContentWhenReady]
    );

    /**
     * Memoized context value to prevent unnecessary re-renders
     *
     * This memo creates the context value object that will be provided to all child
     * components. It includes:
     * - Helper methods for getting file metadata with frontmatter support
     * - Direct database access methods
     * - Tag tree navigation methods
     * - Storage state information
     *
     * The value is memoized to only recreate when its dependencies change,
     * preventing child components from re-rendering unnecessarily.
     */
    const contextValue = useMemo(() => {
        // Direct accessors for tag tree data structures
        const getTagTree = () => fileData.tagTree;
        const getPropertyTree = () => fileData.propertyTree;

        // Finds a tag node by path in the main tag tree
        const findTagInTree = (tagPath: string) => {
            return findTagNode(fileData.tagTree, tagPath);
        };

        // Collects all tag paths from the tree
        const getAllTagPaths = () => {
            const allPaths: string[] = [];
            for (const rootNode of fileData.tagTree.values()) {
                const paths = collectAllTagPaths(rootNode);
                allPaths.push(...paths);
            }
            return allPaths;
        };

        // Gets the display path for a tag (may differ from actual path due to display settings)
        const getTagDisplayPath = (path: string): string => {
            const tagNode = findTagNode(fileData.tagTree, path);
            return tagNode?.displayPath ?? path;
        };

        return {
            fileData,
            getFileDisplayName,
            getFileCreatedTime,
            getFileModifiedTime,
            getFileTimestamps,
            getFileMetadata,
            getDB: getDBInstance,
            getFile: (path: string) => getDBInstance().getFile(path),
            getFiles: (paths: string[]) => getDBInstance().getFiles(paths),
            hasPreview,
            isStorageReady,
            getTagTree,
            getPropertyTree,
            findTagInTree,
            getAllTagPaths,
            getTagDisplayPath,
            rebuildCache,
            regenerateFeatureImageForFile
        };
    }, [
        fileData,
        getFileDisplayName,
        getFileCreatedTime,
        getFileModifiedTime,
        getFileTimestamps,
        getFileMetadata,
        hasPreview,
        isStorageReady,
        rebuildCache,
        regenerateFeatureImageForFile
    ]);

    // Initializes providers before settings-sync hooks schedule any provider work.
    useInitializeContentProviderRegistry({
        app,
        contentRegistryRef: contentRegistry,
        pendingSyncTimeoutIdRef: pendingSyncTimeoutId,
        clearCacheRebuildNotice
    });

    const { resetPendingSettingsChanges } = useStorageSettingsSync({
        settings,
        stoppedRef,
        contentRegistryRef: contentRegistry,
        hiddenFolders,
        hiddenFileProperties,
        hiddenFileNames,
        hiddenFileTags,
        scheduleTagTreeRebuild,
        schedulePropertyTreeRebuild,
        getIndexableFiles,
        pendingRenameDataRef,
        queueMetadataContentWhenReady,
        queueIndexableFilesForContentGeneration,
        queueIndexableFilesNeedingContentGeneration,
        startCacheRebuildNotice,
        clearCacheRebuildNotice
    });

    // ==================== Effects ====================

    useStorageVaultSync({
        app,
        api,
        settings,
        latestSettingsRef,
        stoppedRef,
        isFirstLoadRef: isFirstLoad,
        isIndexedDBReady,
        hasBuiltInitialCacheRef: hasBuiltInitialCache,
        setIsStorageReady,
        isStorageReadyRef,
        contentRegistryRef: contentRegistry,
        pendingSyncTimeoutIdRef: pendingSyncTimeoutId,
        pendingRenameDataRef,
        modifyFlushBufferRef,
        metadataChangeFlushBufferRef,
        buildFileCacheFnRef,
        rebuildFileCacheRef,
        activeVaultEventRefsRef: activeVaultEventRefs,
        activeMetadataEventRefRef: activeMetadataEventRef,
        rebuildTagTree,
        rebuildPropertyTree,
        scheduleTagTreeRebuild,
        schedulePropertyTreeRebuild,
        cancelTreeRebuildDebouncer,
        startCacheRebuildNotice,
        getIndexableFiles,
        getVisibleMarkdownFiles,
        queueMetadataContentWhenReady,
        queueIndexableFilesForContentGeneration,
        queueIndexableFilesNeedingContentGeneration,
        disposeMetadataWaitDisposers
    });

    /**
     * Augment context with control methods
     *
     * Adds the stopAllProcessing method to the context value.
     * Called during plugin shutdown (main.ts stopNavigatorContentProcessing via the view's
     * stopContentProcessing handle). Not called on plain view close; cache rebuilds run their
     * own stop sequence in useStorageCacheRebuild.
     *
     * It ensures clean shutdown by:
     * - Stopping all content providers
     * - Cancelling pending operations and buffered flushes
     * - Detaching event listeners
     * - Preventing any new operations from starting
     */
    const contextWithControls = useMemo(() => {
        return {
            ...contextValue,
            stopAllProcessing: () => {
                // Mark stopped to gate any subsequent event handlers
                stoppedRef.current = true;
                resetPendingSettingsChanges();
                // Stop all provider processing
                if (contentRegistry.current) {
                    contentRegistry.current.stopAllProcessing();
                }
                // Cancel any pending scheduled work initiated by StorageContext
                if (pendingSyncTimeoutId.current !== null) {
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(pendingSyncTimeoutId.current);
                    }
                    pendingSyncTimeoutId.current = null;
                }
                // Drop buffered modify/metadata flushes and their timers
                for (const buffer of [modifyFlushBufferRef.current, metadataChangeFlushBufferRef.current]) {
                    if (buffer.timerId !== null) {
                        if (typeof window !== 'undefined') {
                            window.clearTimeout(buffer.timerId);
                        }
                        buffer.timerId = null;
                    }
                    buffer.files.clear();
                }
                // Optionally detach event subscriptions and cancel debouncers
                try {
                    if (activeVaultEventRefs.current) {
                        activeVaultEventRefs.current.forEach(ref => app.vault.offref(ref));
                        activeVaultEventRefs.current = null;
                    }
                    if (activeMetadataEventRef.current) {
                        app.metadataCache.offref(activeMetadataEventRef.current);
                        activeMetadataEventRef.current = null;
                    }
                } catch {
                    // ignore
                }
                try {
                    rebuildFileCacheRef.current?.cancel();
                } catch {
                    // ignore
                }
                rebuildFileCacheRef.current = null;
                // Clears any pending rebuild scheduled by UI or database events.
                cancelTreeRebuildDebouncer({ reset: true });
                // Clean up all tracked metadata wait disposers on shutdown
                disposeMetadataWaitDisposers();
                pendingMetadataWaitPathsRef.current.clear();
            }
        };
    }, [cancelTreeRebuildDebouncer, resetPendingSettingsChanges, contextValue, disposeMetadataWaitDisposers, app.vault, app.metadataCache]);

    return <StorageContext.Provider value={contextWithControls}>{children}</StorageContext.Provider>;
}

/**
 * Hook to access file cache and file data
 *
 * Returns:
 * - fileData: Contains the tag tree and untagged file count
 * - Methods to get file metadata from frontmatter
 */
export function useFileCache() {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useFileCache must be used within StorageProvider');
    }
    return context;
}

export function useFileCacheOptional() {
    return useContext(StorageContext);
}
