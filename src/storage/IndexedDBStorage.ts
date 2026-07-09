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

import { STORAGE_KEYS } from '../types';
import { localStorage } from '../utils/localStorage';
import { recordStartupDiagnostic } from '../services/diagnostics/DebugLoggingService';
import type { ContentProviderType, FileContentType } from '../interfaces/IContentProvider';
import { isMarkdownPath } from '../utils/fileTypeUtils';
import { DEFAULT_FEATURE_IMAGE_CACHE_MAX, FEATURE_IMAGE_STORE_NAME, FeatureImageBlobStore } from './FeatureImageBlobStore';
import { MemoryFileCache } from './MemoryFileCache';
import { FeatureImageCoordinator } from './indexeddb/featureImageOps';
import { PreviewTextCoordinator, type PreviewTextBatchOp } from './indexeddb/previewTextOps';
import { hydrateCacheFromMainStore } from './indexeddb/cacheHydration';
import {
    DB_CONTENT_VERSION,
    DB_SCHEMA_VERSION,
    DEFAULT_PREVIEW_LOAD_MAX_BATCH,
    DEFAULT_PREVIEW_TEXT_CACHE_MAX_ENTRIES,
    PREVIEW_STORE_NAME,
    STORE_NAME
} from './indexeddb/constants';
import {
    isVersionError as isVersionErrorValue,
    normalizeIdbError as normalizeIdbErrorValue,
    rejectWithTransactionError as rejectWithTransactionErrorValue
} from './indexeddb/idbErrors';
import { normalizeFileData as normalizeFileDataValue } from './indexeddb/normalizeFileData';
import { handleUpgradeNeeded } from './indexeddb/schemaUpgrade';
import { createDefaultFileData, METADATA_SENTINEL } from './indexeddb/fileData';
import type { PropertyItem, PropertyValueKind, FeatureImageStatus, FileContentChange, FileData, PreviewStatus } from './indexeddb/fileData';
import {
    runBatchUpdateFileContentAndProviderProcessedMtimes,
    type BatchUpdateFileContentAndProviderProcessedMtimesParams
} from './indexeddb/batchContentUpdateOperation';
import {
    runBatchClearAllFileContent,
    runBatchClearFeatureImageContent,
    runBatchClearFileContent,
    runClearFileContent,
    runUpdateFileContent,
    runUpdateFileMetadata
} from './indexeddb/contentMutationOperations';

export { createDefaultFileData, METADATA_SENTINEL };
export type { PropertyItem, PropertyValueKind, FeatureImageStatus, FileContentChange, FileData, PreviewStatus, PreviewTextBatchOp };

interface IndexedDBStorageOptions {
    featureImageCacheMaxEntries?: number;
    previewTextCacheMaxEntries?: number;
    previewLoadMaxBatch?: number;
    cache?: MemoryFileCache;
}

/**
 * IndexedDBStorage - Browser's IndexedDB wrapper for persistent file storage
 *
 * What it does:
 * - Stores file metadata and generated content (previews, images, frontmatter) in browser IndexedDB
 * - Provides efficient batch operations for large vaults
 * - Emits real-time change notifications for UI updates
 *
 * Relationships:
 * - Used by: StorageContext, ContentProviders, FileOperations, Statistics
 * - Core persistent storage layer that all other components depend on
 *
 * Key responsibilities:
 * - Manage IndexedDB connection lifecycle
 * - CRUD operations for file records (single and batch)
 * - Stream large datasets without loading into memory
 * - Track and notify about content changes
 * - Provide indexed queries (by tag, by content type)
 */
export class IndexedDBStorage {
    private cache: MemoryFileCache;
    private changeListeners = new Set<(changes: FileContentChange[]) => void>();
    private db: IDBDatabase | null = null;
    private dbName: string;
    // Dedicated feature image blob store with an in-memory LRU.
    private featureImageBlobs: FeatureImageBlobStore;
    private readonly featureImages: FeatureImageCoordinator;
    private readonly previewTexts: PreviewTextCoordinator;
    private fileChangeListeners = new Map<string, Set<(changes: FileContentChange['changes']) => void>>();
    private isClosing = false;
    private initPromise: Promise<void> | null = null;
    private pendingRebuildNotice = false;

    constructor(appId: string, options?: IndexedDBStorageOptions) {
        this.dbName = `notebooknavigator/cache/${appId}`;
        const previewTextCacheMaxEntries = options?.previewTextCacheMaxEntries ?? DEFAULT_PREVIEW_TEXT_CACHE_MAX_ENTRIES;
        this.cache = options?.cache ?? new MemoryFileCache({ previewTextCacheMaxEntries });
        const normalizedPreviewTextCacheMaxEntries = Math.max(0, previewTextCacheMaxEntries);
        const previewLoadMaxBatch = Math.max(1, options?.previewLoadMaxBatch ?? DEFAULT_PREVIEW_LOAD_MAX_BATCH);
        // Initialize the LRU size from caller options or fallback default.
        const featureImageMaxEntries = options?.featureImageCacheMaxEntries ?? DEFAULT_FEATURE_IMAGE_CACHE_MAX;
        this.featureImageBlobs = new FeatureImageBlobStore(featureImageMaxEntries);
        this.featureImages = new FeatureImageCoordinator({
            getDb: () => this.db,
            init: () => this.init(),
            isClosing: () => this.isClosing,
            blobs: this.featureImageBlobs
        });
        this.previewTexts = new PreviewTextCoordinator({
            deps: {
                cache: this.cache,
                getDb: () => this.db,
                init: () => this.init(),
                isClosing: () => this.isClosing,
                emitChanges: changes => this.emitChanges(changes)
            },
            previewTextCacheMaxEntries: normalizedPreviewTextCacheMaxEntries,
            previewLoadMaxBatch
        });
    }

    consumePendingRebuildNotice(): boolean {
        const pending = this.pendingRebuildNotice;
        this.pendingRebuildNotice = false;
        return pending;
    }

    private normalizeFileData(data: Partial<FileData> & { preview?: string | null }): FileData {
        return normalizeFileDataValue(data);
    }

    /**
     * Subscribe to content change notifications.
     * Listeners are called whenever file content (preview, image, metadata) is updated.
     *
     * @param listener - Function to call with content changes
     * @returns Unsubscribe function
     */
    onContentChange(listener: (changes: FileContentChange[]) => void): () => void {
        this.changeListeners.add(listener);
        return () => this.changeListeners.delete(listener);
    }

    /**
     * Subscribe to content change notifications for a specific file.
     * More efficient than onContentChange as it only receives changes for the specified file.
     *
     * @param path - File path to listen for changes
     * @param listener - Function to call with content changes for this file
     * @returns Unsubscribe function
     */
    onFileContentChange(path: string, listener: (changes: FileContentChange['changes']) => void): () => void {
        let fileListeners = this.fileChangeListeners.get(path);
        if (!fileListeners) {
            fileListeners = new Set();
            this.fileChangeListeners.set(path, fileListeners);
        }
        fileListeners.add(listener);

        return () => {
            const listeners = this.fileChangeListeners.get(path);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.fileChangeListeners.delete(path);
                }
            }
        };
    }

    /**
     * Emit content changes to all registered listeners.
     * Catches and logs any errors in listeners to prevent cascading failures.
     *
     * @param changes - Array of content changes to emit
     */
    private emitChanges(changes: FileContentChange[]): void {
        if (changes.length === 0) return;
        // Only log batch operations or errors

        // Emit to global listeners
        this.changeListeners.forEach(listener => {
            try {
                listener(changes);
            } catch (error: unknown) {
                console.error('Error in change listener:', error);
            }
        });

        // Emit to file-specific listeners
        for (const change of changes) {
            const fileListeners = this.fileChangeListeners.get(change.path);
            if (fileListeners) {
                fileListeners.forEach(listener => {
                    try {
                        listener(change.changes);
                    } catch (error: unknown) {
                        console.error('Error in file change listener:', error);
                    }
                });
            }
        }
    }

    /**
     * Check if the database connection is initialized and ready.
     *
     * @returns True if database is connected and ready
     */
    isInitialized(): boolean {
        return this.db !== null;
    }

    /**
     * Initialize the database connection.
     * Creates the database and object stores if they don't exist.
     * Safe to call multiple times - returns existing connection if already initialized.
     */
    async init(): Promise<void> {
        if (this.isClosing) {
            return;
        }
        // Check the init promise before the connection handle: `openDatabase()` assigns `this.db` when the
        // connection opens, before cache hydration finishes. Returning on `this.db` alone lets concurrent
        // callers proceed against a not-yet-hydrated memory cache.
        if (this.initPromise) {
            return this.initPromise;
        }
        if (this.db) {
            return;
        }

        this.initPromise = this.checkSchemaAndInit().catch(error => {
            console.error('Failed to initialize database:', error);
            this.initPromise = null;
            throw error;
        });
        return this.initPromise;
    }

    private parseStoredVersion(value: unknown): number | null {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return Math.trunc(value);
        }

        if (typeof value === 'string') {
            const parsed = Number.parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
    }

    private getStoredVersion(key: string): number | null {
        const raw = localStorage.get<unknown>(key);
        return this.parseStoredVersion(raw);
    }

    private isVersionError(error: unknown): boolean {
        return isVersionErrorValue(error);
    }

    private async checkSchemaAndInit(): Promise<void> {
        const storedSchemaVersion = this.getStoredVersion(STORAGE_KEYS.databaseSchemaVersionKey);
        const storedContentVersion = this.getStoredVersion(STORAGE_KEYS.databaseContentVersionKey);
        const currentSchemaVersion = DB_SCHEMA_VERSION;
        const currentContentVersion = DB_CONTENT_VERSION;

        // Check version changes
        const schemaVersionUnknown = storedSchemaVersion === null;
        const contentVersionUnknown = storedContentVersion === null;
        const schemaChanged = storedSchemaVersion !== null && storedSchemaVersion !== currentSchemaVersion;
        const contentChanged = storedContentVersion !== null && storedContentVersion !== currentContentVersion;
        const schemaDowngrade = schemaChanged && storedSchemaVersion !== null && storedSchemaVersion > currentSchemaVersion;
        const rebuildReasons: string[] = [];
        if (schemaDowngrade) {
            rebuildReasons.push('schemaDowngrade');
        }
        if (contentChanged) {
            rebuildReasons.push('contentChanged');
        }
        if (schemaVersionUnknown) {
            rebuildReasons.push('schemaVersionMissing');
        }
        if (contentVersionUnknown) {
            rebuildReasons.push('contentVersionMissing');
        }
        recordStartupDiagnostic('indexedDb.versionCheck', {
            storedSchemaVersion,
            storedContentVersion,
            currentSchemaVersion,
            currentContentVersion,
            rebuildReasons
        });

        // Only downgrade schema changes require database recreation; upgrades are handled via onupgradeneeded.
        if (schemaChanged) {
            if (schemaDowngrade) {
                console.warn(
                    `Database schema version downgraded from ${storedSchemaVersion} to ${currentSchemaVersion}. Recreating database.`
                );
                await this.deleteDatabase();
            } else {
                console.warn(`Database schema version upgraded from ${storedSchemaVersion} to ${currentSchemaVersion}.`);
            }
        } else if (schemaVersionUnknown) {
            console.warn(`Database schema version is missing. Rebuilding database.`);
        }

        if (contentChanged) {
            console.warn(`Content version changed from ${storedContentVersion} to ${currentContentVersion}. Rebuilding content.`);
        } else if (contentVersionUnknown) {
            console.warn('Content version is missing. Rebuilding content.');
        }

        const needsRebuild = schemaDowngrade || contentChanged || schemaVersionUnknown || contentVersionUnknown;
        // Only show the rebuild notice when a version mismatch is detected (not when the keys are missing).
        this.pendingRebuildNotice = schemaDowngrade || contentChanged;

        try {
            await this.openDatabase(needsRebuild);
        } catch (error: unknown) {
            if (this.isVersionError(error)) {
                console.warn('Database version mismatch detected. Recreating database.');
            } else {
                console.error('Database open failed. Recreating database.', error);
            }
            this.pendingRebuildNotice = true;
            recordStartupDiagnostic('indexedDb.open.recreate', { error });
            await this.deleteDatabase();
            await this.openDatabase(true);
        }

        // Clear and rebuild content if either version changed
        if (needsRebuild) {
            if (!this.db) throw new Error('Database not initialized');
            // Clear all data to force rebuild
            await this.clearStores(this.db);
            recordStartupDiagnostic('indexedDb.rebuildContent', { reasons: rebuildReasons });
        }

        localStorage.set(STORAGE_KEYS.databaseSchemaVersionKey, currentSchemaVersion.toString());
        localStorage.set(STORAGE_KEYS.databaseContentVersionKey, currentContentVersion.toString());
    }

    private async deleteDatabase(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }

        return new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(this.dbName);

            deleteReq.onsuccess = () => {
                resolve();
            };

            deleteReq.onerror = () => {
                const deleteError = deleteReq.error;
                console.error('Failed to delete database:', deleteError);
                reject(this.normalizeIdbError(deleteError, 'Failed to delete database'));
            };

            deleteReq.onblocked = () => {
                console.error('Database deletion blocked');
                reject(new Error('Database deletion blocked'));
            };
        });
    }

    /**
     * Converts unknown error types to Error instances for consistent error handling.
     * IndexedDB errors can be DOMExceptions, null, or undefined - this normalizes them.
     */
    private normalizeIdbError(error: unknown, fallbackMessage: string): Error {
        return normalizeIdbErrorValue(error, fallbackMessage);
    }

    /**
     * Rejects a promise with a normalized error from either the transaction or the last request.
     * Prefers the transaction error if available, otherwise uses the last request error.
     */
    private rejectWithTransactionError(
        reject: (reason?: unknown) => void,
        transaction: IDBTransaction,
        lastRequestError: DOMException | Error | null,
        fallbackMessage: string
    ): void {
        rejectWithTransactionErrorValue(reject, transaction, lastRequestError, fallbackMessage);
    }

    private async openDatabase(skipCacheLoad: boolean = false): Promise<void> {
        const openStartMs = performance.now();
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, DB_SCHEMA_VERSION);

            request.onerror = () => {
                const requestError = request.error;
                console.error('Database open error:', requestError);
                reject(this.normalizeIdbError(requestError, 'Failed to open database'));
            };

            request.onblocked = () => {
                console.error('Database open blocked');
                reject(new Error('Database open blocked'));
            };

            request.onsuccess = async () => {
                const openedDb = request.result;
                if (this.isClosing) {
                    try {
                        openedDb.close();
                    } catch {
                        // noop
                    }
                    this.db = null;
                    resolve();
                    return;
                }

                this.db = openedDb;
                // Reset blob caches whenever a new database connection is opened.
                this.featureImageBlobs.clearMemoryCaches();

                // Close this connection if a version change is requested elsewhere
                if (this.db) {
                    this.db.onversionchange = () => {
                        try {
                            this.db?.close();
                        } catch {
                            // noop
                        }
                        this.db = null;
                    };
                }

                // Initialize the cache with all data from IndexedDB
                if (skipCacheLoad) {
                    this.cache.resetToEmpty();
                    recordStartupDiagnostic('indexedDb.cacheHydration.skipped', {
                        elapsedMs: Math.round(performance.now() - openStartMs)
                    });
                } else {
                    try {
                        const db = this.db;
                        if (!db) {
                            this.cache.resetToEmpty();
                            resolve();
                            return;
                        }
                        const hydrationStartMs = performance.now();
                        await hydrateCacheFromMainStore({ db, cache: this.cache });
                        recordStartupDiagnostic('indexedDb.cacheHydration.complete', {
                            elapsedMs: Math.round(performance.now() - hydrationStartMs),
                            fileCount: this.cache.getFileCount()
                        });
                    } catch (error: unknown) {
                        recordStartupDiagnostic('indexedDb.cacheHydration.failed', { error });
                        console.error('[DB Cache] Failed to initialize cache:', error);
                        console.error(
                            '[DB Cache] IndexedDB cache hydration failed. Run Notebook Navigator: Rebuild cache to reset the database.'
                        );
                        this.cache.resetToEmpty();
                    }
                }

                resolve();
            };

            request.onupgradeneeded = handleUpgradeNeeded;
        });
    }

    /**
     * Clear all data from the database.
     * Removes all file records but preserves the database structure.
     */
    async clear(): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        return this.clearStores(this.db);
    }

    /**
     * Clear all object stores on an already-open connection.
     * Called directly during `checkSchemaAndInit()` where awaiting `init()` would deadlock on the pending init promise.
     */
    private async clearStores(db: IDBDatabase): Promise<void> {
        // Clear stores in one transaction to keep the cache consistent.
        const transaction = db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME, PREVIEW_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);

        return new Promise((resolve, reject) => {
            const op = 'clear';
            let lastRequestError: DOMException | Error | null = null;
            const request = store.clear();
            request.onerror = () => {
                lastRequestError = request.error || null;
                console.error('[IndexedDB] clear failed', {
                    store: STORE_NAME,
                    name: request.error?.name,
                    message: request.error?.message
                });
            };
            // Clear blob records alongside the main store.
            const blobRequest = blobStore.clear();
            blobRequest.onerror = () => {
                lastRequestError = blobRequest.error || null;
                console.error('[IndexedDB] clear failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    name: blobRequest.error?.name,
                    message: blobRequest.error?.message
                });
            };
            const previewRequest = previewStore.clear();
            previewRequest.onerror = () => {
                lastRequestError = previewRequest.error || null;
                console.error('[IndexedDB] clear failed', {
                    store: PREVIEW_STORE_NAME,
                    name: previewRequest.error?.name,
                    message: previewRequest.error?.message
                });
            };
            transaction.oncomplete = () => {
                this.cache.resetToEmpty();
                // Drop any in-memory blobs after clearing the database.
                this.featureImageBlobs.clearMemoryCaches();
                resolve();
            };
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });
    }

    /**
     * Get a single file synchronously from the cache.
     *
     * @param path - File path to retrieve
     * @returns File data or null if not found
     */
    getFile(path: string): FileData | null {
        if (!this.cache.isReady()) {
            return null;
        }
        return this.cache.getFile(path);
    }

    /**
     * Seed the in-memory cache for a path without writing to IndexedDB.
     * Used to keep UI responsive when files are renamed and we already
     * have complete metadata under the old path.
     */
    seedMemoryFile(path: string, data: FileData): void {
        if (!this.cache.isReady()) {
            return;
        }
        this.cache.setClonedFile(path, data);
    }

    beginFeatureImageBlobMove(oldPath: string, newPath: string): void {
        this.featureImages.beginMove(oldPath, newPath);
    }

    beginPreviewTextMove(oldPath: string, newPath: string): void {
        this.previewTexts.beginMove(oldPath, newPath);
    }

    /**
     * Delete a single file from the database by path.
     *
     * @param path - File path to delete
     */
    async deleteFile(path: string): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME, PREVIEW_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);

        return new Promise((resolve, reject) => {
            const op = 'delete';
            let lastRequestError: DOMException | Error | null = null;
            const request = store.delete(path);
            request.onerror = () => {
                lastRequestError = request.error || null;
                console.error('[IndexedDB] delete failed', {
                    store: STORE_NAME,
                    path,
                    name: request.error?.name,
                    message: request.error?.message
                });
            };
            // Remove any feature image blob for the file path.
            const blobRequest = blobStore.delete(path);
            blobRequest.onerror = () => {
                lastRequestError = blobRequest.error || null;
                console.error('[IndexedDB] delete failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    path,
                    name: blobRequest.error?.name,
                    message: blobRequest.error?.message
                });
            };
            const previewRequest = previewStore.delete(path);
            previewRequest.onerror = () => {
                lastRequestError = previewRequest.error || null;
                console.error('[IndexedDB] delete failed', {
                    store: PREVIEW_STORE_NAME,
                    path,
                    name: previewRequest.error?.name,
                    message: previewRequest.error?.message
                });
            };
            transaction.oncomplete = () => {
                this.cache.deleteFile(path);
                this.featureImageBlobs.deleteFromCache(path);
                resolve();
            };
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: STORE_NAME,
                    op,
                    path,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: STORE_NAME,
                    op,
                    path,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });
    }

    /**
     * Get multiple files synchronously from the cache.
     * More efficient than multiple getFile calls.
     *
     * @param paths - Array of file paths to retrieve
     * @returns Map of path to file data (only includes found files)
     */
    getFiles(paths: string[]): Map<string, FileData> {
        if (!this.cache.isReady()) {
            return new Map();
        }
        return this.cache.getFiles(paths);
    }

    /**
     * Store or update multiple files in the database in one transaction.
     *
     * Does not update the memory cache: callers (the rename flush) seed the memory mirror before
     * persisting. A completion-time re-stamp could otherwise run after, and overwrite, a cache
     * reconciliation performed by another store's completion callback (for example the preview
     * mover's status downgrade for a missing record).
     *
     * @param files - Array of file data with paths to store
     */
    async setFiles(files: { path: string; data: FileData }[]): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const op = 'put:batch';
            let lastRequestError: DOMException | Error | null = null;
            if (files.length === 0) {
                resolve();
                return;
            }
            // Persist batch records without feature image blob data.
            const sanitizedFiles = files.map(({ path, data }) => ({
                path,
                data: this.normalizeFileData({ ...data, featureImage: null })
            }));

            sanitizedFiles.forEach(({ path, data }) => {
                const request = store.put(data, path);
                request.onerror = () => {
                    lastRequestError = request.error || null;
                    console.error('[IndexedDB] put failed', {
                        store: STORE_NAME,
                        path,
                        name: request.error?.name,
                        message: request.error?.message
                    });
                };
            });

            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });
    }

    /**
     * Upsert file records by applying a patch to existing records and inserting defaults for missing ones.
     *
     * This avoids clobbering provider-owned fields when callers only need to update stat-derived fields
     * such as `mtime` or forced-regeneration processed mtimes.
     */
    async upsertFilesWithPatch(updates: { path: string; create: FileData; patch?: Partial<FileData> }[]): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const updatesByPath = new Map<string, (typeof updates)[number]>();
        for (const update of updates) {
            const existing = updatesByPath.get(update.path);
            if (!existing) {
                updatesByPath.set(update.path, update);
                continue;
            }

            const mergedPatch = existing.patch ? { ...existing.patch, ...update.patch } : update.patch;
            updatesByPath.set(update.path, { ...update, patch: mergedPatch });
        }

        const uniqueUpdates = Array.from(updatesByPath.values());
        if (uniqueUpdates.length === 0) {
            return;
        }

        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const op = 'upsertFilesWithPatch';
            let lastRequestError: DOMException | Error | null = null;
            const cacheUpdates: { path: string; data: FileData }[] = [];

            uniqueUpdates.forEach(update => {
                const getReq = store.get(update.path);
                getReq.onsuccess = () => {
                    const existingRaw = (getReq.result as Partial<FileData> | undefined) || null;
                    // Use the stored record as the merge base so stat-only callers cannot overwrite provider-owned fields.
                    const base = existingRaw ? this.normalizeFileData(existingRaw) : this.normalizeFileData(update.create);
                    // Apply the patch on top of the base record (typically mtime + provider processed-mtime resets).
                    const nextData: FileData = update.patch ? { ...base, ...update.patch } : base;

                    // Main store never persists feature image blobs; keep it null.
                    nextData.featureImage = null;
                    const sanitized = this.normalizeFileData(nextData);
                    cacheUpdates.push({ path: update.path, data: sanitized });

                    const putReq = store.put(sanitized, update.path);
                    putReq.onerror = () => {
                        lastRequestError = putReq.error || null;
                        console.error('[IndexedDB] put failed', {
                            store: STORE_NAME,
                            op,
                            path: update.path,
                            name: putReq.error?.name,
                            message: putReq.error?.message
                        });
                    };
                };
                getReq.onerror = () => {
                    lastRequestError = getReq.error || null;
                    console.error('[IndexedDB] get failed', {
                        store: STORE_NAME,
                        op,
                        path: update.path,
                        name: getReq.error?.name,
                        message: getReq.error?.message
                    });
                };
            });

            transaction.oncomplete = () => {
                if (cacheUpdates.length > 0) {
                    this.cache.batchUpdate(cacheUpdates);
                }
                resolve();
            };
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });
    }

    /**
     * Delete multiple files from the database by paths.
     * More efficient than multiple deleteFile calls.
     *
     * @param paths - Array of file paths to delete
     */
    async deleteFiles(paths: string[]): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME, PREVIEW_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);

        return new Promise((resolve, reject) => {
            const op = 'delete:batch';
            let lastRequestError: DOMException | Error | null = null;
            if (paths.length === 0) {
                resolve();
                return;
            }

            paths.forEach(path => {
                const request = store.delete(path);
                request.onerror = () => {
                    lastRequestError = request.error || null;
                    console.error('[IndexedDB] delete failed', {
                        store: STORE_NAME,
                        path,
                        name: request.error?.name,
                        message: request.error?.message
                    });
                };
                // Remove any feature image blob for the file path.
                const blobRequest = blobStore.delete(path);
                blobRequest.onerror = () => {
                    lastRequestError = blobRequest.error || null;
                    console.error('[IndexedDB] delete failed', {
                        store: FEATURE_IMAGE_STORE_NAME,
                        path,
                        name: blobRequest.error?.name,
                        message: blobRequest.error?.message
                    });
                };
                const previewRequest = previewStore.delete(path);
                previewRequest.onerror = () => {
                    lastRequestError = previewRequest.error || null;
                    console.error('[IndexedDB] delete failed', {
                        store: PREVIEW_STORE_NAME,
                        path,
                        name: previewRequest.error?.name,
                        message: previewRequest.error?.message
                    });
                };
            });

            transaction.oncomplete = () => {
                this.cache.batchDelete(paths);
                paths.forEach(path => this.featureImageBlobs.deleteFromCache(path));
                resolve();
            };
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                this.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });
    }

    /**
     * Get files with content synchronously.
     * Returns files that have the specified content type generated.
     *
     * @param type - Type of content to check for
     * @returns Array of files with content
     */
    getFilesWithContent(type: 'preview' | 'featureImage' | 'metadata'): FileData[] {
        if (!this.cache.isReady()) {
            return [];
        }
        return this.cache.getAllFiles().filter(file => {
            if (type === 'preview') return file.previewStatus !== 'unprocessed';
            // Feature images are considered present when a stored thumbnail blob exists.
            if (type === 'featureImage') return file.featureImageStatus === 'has';
            if (type === 'metadata') return file.metadata !== null;
            return false;
        });
    }

    /**
     * Count files synchronously.
     * Returns the total number of files in the database.
     *
     * @returns Number of files
     */
    getFileCount(): number {
        if (!this.cache.isReady()) {
            return 0;
        }
        return this.cache.getFileCount();
    }

    /**
     * Get all files with their paths.
     * Returns array of objects containing path and file data.
     *
     * @returns Array of files with paths
     */
    getAllFiles(): { path: string; data: FileData }[] {
        if (!this.cache.isReady()) {
            return [];
        }
        return this.cache.getAllFilesWithPaths();
    }

    /**
     * Stream all files with their paths without allocating an array.
     *
     * @param callback - Function to call for each file
     */
    forEachFile(callback: (path: string, data: FileData) => void): void {
        if (!this.cache.isReady()) {
            return;
        }
        this.cache.forEachFile(callback);
    }

    /**
     * Get files that need content generation.
     * Returns paths of files where the specified content type is null.
     *
     * @param type - Type of content to check for
     * @returns Set of file paths needing content
     */
    getFilesNeedingContent(type: FileContentType): Set<string> {
        if (!this.cache.isReady()) {
            return new Set();
        }
        const result = new Set<string>();
        this.cache.forEachFile((path, data) => {
            if (
                (type === 'tags' && isMarkdownPath(path) && data.tags === null) ||
                (type === 'preview' && isMarkdownPath(path) && data.previewStatus === 'unprocessed') ||
                // Feature images need processing when they are unprocessed or missing a key marker.
                (type === 'featureImage' && (data.featureImageKey === null || data.featureImageStatus === 'unprocessed')) ||
                (type === 'metadata' && isMarkdownPath(path) && data.metadata === null) ||
                (type === 'wordCount' && isMarkdownPath(path) && data.wordCount === null) ||
                (type === 'characterCount' &&
                    isMarkdownPath(path) &&
                    (data.characterCountWithSpaces === null || data.characterCountWithoutSpaces === null)) ||
                (type === 'tasks' && isMarkdownPath(path) && (data.taskTotal === null || data.taskUnfinished === null)) ||
                (type === 'properties' && isMarkdownPath(path) && data.properties === null)
            ) {
                result.add(path);
            }
        });
        return result;
    }

    getFilesNeedingAnyContent(types: FileContentType[]): Set<string> {
        if (!this.cache.isReady() || types.length === 0) {
            return new Set();
        }

        const needsTags = types.includes('tags');
        const needsPreview = types.includes('preview');
        const needsFeatureImage = types.includes('featureImage');
        const needsMetadata = types.includes('metadata');
        const needsWordCount = types.includes('wordCount');
        const needsCharacterCount = types.includes('characterCount');
        const needsTasks = types.includes('tasks');
        const needsProperties = types.includes('properties');

        const result = new Set<string>();
        this.cache.forEachFile((path, data) => {
            const isMarkdown = isMarkdownPath(path);
            if (
                (needsTags && isMarkdown && data.tags === null) ||
                (needsPreview && isMarkdown && data.previewStatus === 'unprocessed') ||
                (needsFeatureImage && (data.featureImageKey === null || data.featureImageStatus === 'unprocessed')) ||
                (needsMetadata && isMarkdown && data.metadata === null) ||
                (needsWordCount && isMarkdown && data.wordCount === null) ||
                (needsCharacterCount &&
                    isMarkdown &&
                    (data.characterCountWithSpaces === null || data.characterCountWithoutSpaces === null)) ||
                (needsTasks && isMarkdown && (data.taskTotal === null || data.taskUnfinished === null)) ||
                (needsProperties && isMarkdown && data.properties === null)
            ) {
                result.add(path);
            }
        });
        return result;
    }

    /**
     * Get current database statistics.
     * Returns the number of items in the main store and an estimated total size in MB.
     *
     * Includes feature image blobs stored in the dedicated blob store.
     *
     * @returns Object with item count and size in MB
     */
    async getDatabaseStats(): Promise<{ itemCount: number; sizeMB: number }> {
        if (!this.cache.isReady()) {
            return { itemCount: 0, sizeMB: 0 };
        }
        let itemCount = 0;
        let totalSize = 0;
        this.cache.forEachFile((path, data) => {
            itemCount++;
            totalSize += path.length + JSON.stringify(data).length;
        });
        await this.forEachPreviewTextRecord((path, previewText) => {
            totalSize += path.length + previewText.length;
        });
        await this.forEachFeatureImageBlobRecord((_path, record) => {
            totalSize += record.blob.size;
        });
        const sizeMB = totalSize / 1024 / 1024;
        return { itemCount, sizeMB };
    }

    /**
     * Update file content (preview, image, and/or metadata) by path.
     * Only updates provided fields, preserves others.
     * Emits change notifications.
     *
     * @param path - File path to update
     * @param preview - New preview text (optional)
     * @param image - New feature image blob (optional)
     * @param metadata - New metadata (optional)
     */
    async updateFileContent(
        path: string,
        preview?: string,
        image?: Blob | null,
        metadata?: FileData['metadata'],
        featureImageKey?: string | null
    ): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await runUpdateFileContent(
            {
                db: this.db,
                cache: this.cache,
                featureImageBlobs: this.featureImageBlobs,
                normalizeFileData: data => this.normalizeFileData(data),
                emitChanges: changes => this.emitChanges(changes),
                normalizeIdbError: (error, fallbackMessage) => this.normalizeIdbError(error, fallbackMessage),
                rejectWithTransactionError: (reject, transaction, lastRequestError, fallbackMessage) =>
                    this.rejectWithTransactionError(reject, transaction, lastRequestError, fallbackMessage)
            },
            { path, preview, image, metadata, featureImageKey }
        );
    }

    /**
     * Update file metadata by path.
     * Merges with existing metadata rather than replacing.
     * Emits change notifications.
     *
     * @param path - File path to update
     * @param metadata - Metadata fields to update
     */
    async updateFileMetadata(
        path: string,
        metadata: {
            name?: string;
            created?: number;
            modified?: number;
            icon?: string;
            color?: string;
            background?: string;
        }
    ): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await runUpdateFileMetadata(
            {
                db: this.db,
                cache: this.cache,
                featureImageBlobs: this.featureImageBlobs,
                normalizeFileData: data => this.normalizeFileData(data),
                emitChanges: changes => this.emitChanges(changes),
                normalizeIdbError: (error, fallbackMessage) => this.normalizeIdbError(error, fallbackMessage),
                rejectWithTransactionError: (reject, transaction, lastRequestError, fallbackMessage) =>
                    this.rejectWithTransactionError(reject, transaction, lastRequestError, fallbackMessage)
            },
            { path, metadata }
        );
    }

    /**
     * Update processed mtimes for a specific content provider.
     *
     * Providers track their own processed mtimes so that:
     * - file modifications do not depend on a shared `mtime` flag across providers, and
     * - providers can record "processed" even when no content fields changed.
     *
     * Does NOT emit change notifications as this is internal bookkeeping.
     */
    async updateProviderProcessedMtimes(
        provider: ContentProviderType,
        updates: { path: string; mtime: number; expectedPreviousMtime: number }[]
    ): Promise<void> {
        await this.batchUpdateFileContentAndProviderProcessedMtimes({
            provider,
            contentUpdates: [],
            processedMtimeUpdates: updates
        });
    }

    /**
     * Clear content for a file by path (set to null).
     * Used when content needs to be regenerated.
     * Emits change notifications.
     *
     * @param path - File path to clear content for
     * @param type - Type of content to clear or 'all'
     */
    async clearFileContent(path: string, type: 'preview' | 'featureImage' | 'metadata' | 'all'): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await runClearFileContent(
            {
                db: this.db,
                cache: this.cache,
                featureImageBlobs: this.featureImageBlobs,
                normalizeFileData: data => this.normalizeFileData(data),
                emitChanges: changes => this.emitChanges(changes),
                normalizeIdbError: (error, fallbackMessage) => this.normalizeIdbError(error, fallbackMessage),
                rejectWithTransactionError: (reject, transaction, lastRequestError, fallbackMessage) =>
                    this.rejectWithTransactionError(reject, transaction, lastRequestError, fallbackMessage)
            },
            { path, type }
        );
    }

    /**
     * Clear content for ALL files in batch using cursor.
     * Very efficient for clearing content when settings change.
     * Only clears content that is not already null.
     * Emits change notifications for all affected files.
     *
     * @param type - Type of content to clear or 'all'
     */
    async batchClearAllFileContent(
        type: 'preview' | 'featureImage' | 'metadata' | 'tags' | 'wordCount' | 'characterCount' | 'properties' | 'all'
    ): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await runBatchClearAllFileContent(
            {
                db: this.db,
                cache: this.cache,
                featureImageBlobs: this.featureImageBlobs,
                normalizeFileData: data => this.normalizeFileData(data),
                emitChanges: changes => this.emitChanges(changes),
                normalizeIdbError: (error, fallbackMessage) => this.normalizeIdbError(error, fallbackMessage),
                rejectWithTransactionError: (reject, transaction, lastRequestError, fallbackMessage) =>
                    this.rejectWithTransactionError(reject, transaction, lastRequestError, fallbackMessage)
            },
            { type }
        );
    }

    /**
     * Clear feature image content for either markdown or non-markdown files.
     *
     * Used when providers split feature image generation by domain:
     * - markdownPipeline clears markdown feature images
     * - fileThumbnails clears non-markdown feature images (PDF covers, etc)
     *
     * Emits change notifications for affected files.
     */
    async batchClearFeatureImageContent(scope: 'markdown' | 'nonMarkdown'): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await runBatchClearFeatureImageContent(
            {
                db: this.db,
                cache: this.cache,
                featureImageBlobs: this.featureImageBlobs,
                normalizeFileData: data => this.normalizeFileData(data),
                emitChanges: changes => this.emitChanges(changes),
                normalizeIdbError: (error, fallbackMessage) => this.normalizeIdbError(error, fallbackMessage),
                rejectWithTransactionError: (reject, transaction, lastRequestError, fallbackMessage) =>
                    this.rejectWithTransactionError(reject, transaction, lastRequestError, fallbackMessage)
            },
            { scope }
        );
    }

    /**
     * Clear content for specific files in batch.
     * More efficient than multiple clearFileContent calls.
     * Only clears content that is not already null.
     * Emits change notifications for all affected files.
     *
     * @param paths - Array of file paths to clear content for
     * @param type - Type of content to clear or 'all'
     */
    async batchClearFileContent(
        paths: string[],
        type: 'preview' | 'featureImage' | 'metadata' | 'tags' | 'properties' | 'all'
    ): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await runBatchClearFileContent(
            {
                db: this.db,
                cache: this.cache,
                featureImageBlobs: this.featureImageBlobs,
                normalizeFileData: data => this.normalizeFileData(data),
                emitChanges: changes => this.emitChanges(changes),
                normalizeIdbError: (error, fallbackMessage) => this.normalizeIdbError(error, fallbackMessage),
                rejectWithTransactionError: (reject, transaction, lastRequestError, fallbackMessage) =>
                    this.rejectWithTransactionError(reject, transaction, lastRequestError, fallbackMessage)
            },
            { paths, type }
        );
    }

    /**
     * Update content for multiple files in batch.
     * More efficient than multiple updateFileContent calls.
     * Emits change notifications for all updates so UI components can react.
     * This is the primary method for notifying the UI about content changes.
     *
     * @param updates - Array of content updates to apply
     */
    async batchUpdateFileContent(updates: BatchUpdateFileContentAndProviderProcessedMtimesParams['contentUpdates']): Promise<void> {
        await this.batchUpdateFileContentAndProviderProcessedMtimes({ contentUpdates: updates });
    }

    /**
     * Update file content fields and provider processed mtimes in a single transaction.
     *
     * This is used by content providers so that:
     * - content updates are applied atomically alongside their processed mtime bookkeeping, and
     * - providers can still record "processed" even when no content fields changed.
     *
     * Provider processed mtimes are updated with a CAS guard (`expectedPreviousMtime`) to avoid
     * overwriting forced regeneration resets that occurred mid-flight.
     */
    async batchUpdateFileContentAndProviderProcessedMtimes(params: BatchUpdateFileContentAndProviderProcessedMtimesParams): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('Database not initialized');
        await runBatchUpdateFileContentAndProviderProcessedMtimes(
            {
                db: this.db,
                cache: this.cache,
                normalizeFileData: data => this.normalizeFileData(data),
                featureImageBlobs: this.featureImageBlobs,
                emitChanges: changes => this.emitChanges(changes)
            },
            params
        );
    }

    /**
     * Clear database and reinitialize.
     * Used when vault structure changes significantly.
     */
    async clearDatabase(): Promise<void> {
        await this.clear();
    }

    /**
     * Check if a file has preview text synchronously.
     *
     * @param path - File path to check
     * @returns True if the file has preview text
     */
    hasPreview(path: string): boolean {
        if (!this.cache.isReady()) {
            return false;
        }
        return this.cache.hasPreview(path);
    }

    /**
     * Check if a file exists in the database.
     *
     * @param path - File path to check
     * @returns True if the file exists
     */
    hasFile(path: string): boolean {
        if (!this.cache.isReady()) {
            return false;
        }
        return this.cache.hasFile(path);
    }

    /**
     * Get preview text from memory cache, returning empty string if null.
     * Helper method for UI components that need non-null strings.
     *
     * @param path - File path to get preview for
     * @returns Preview text or empty string
     */
    getCachedPreviewText(path: string): string {
        return this.previewTexts.getCachedPreviewText(path);
    }

    /**
     * Loads preview text for a single file path into the in-memory cache.
     * Used by UI components that need preview text without hydrating the full preview store on startup.
     */
    async ensurePreviewTextLoaded(path: string): Promise<void> {
        return this.previewTexts.ensurePreviewTextLoaded(path);
    }

    /**
     * Get tags from memory cache, returning empty array if none.
     * Helper method for UI components that need tag data.
     *
     * @param path - File path to get tags for
     * @returns Array of tag strings
     */
    getCachedTags(path: string): string[] {
        const file = this.getFile(path);
        // Return empty array if file doesn't exist or tags are null/not extracted yet
        if (!file || file.tags === null) return [];
        return file.tags;
    }

    /**
     * Fetch a feature image blob by path and expected key.
     * Reads from the in-memory LRU first, then IndexedDB.
     */
    async getFeatureImageBlob(path: string, expectedKey: string): Promise<Blob | null> {
        return this.featureImages.getBlob(path, expectedKey);
    }

    /**
     * Stream all feature image blob records without allocating an array.
     * Only yields non-empty blobs with a string key.
     */
    async forEachFeatureImageBlobRecord(callback: (path: string, record: { featureImageKey: string; blob: Blob }) => void): Promise<void> {
        await this.featureImages.forEachBlobRecord(callback);
    }

    /**
     * Stream all preview text records without hydrating them into the main in-memory cache.
     * Only yields non-empty strings with a string key.
     */
    async forEachPreviewTextRecord(callback: (path: string, previewText: string) => void): Promise<void> {
        await this.previewTexts.forEachPreviewTextRecord(callback);
    }

    /**
     * Move a rename burst's feature image blobs in one transaction, replayed in vault event order.
     */
    async moveFeatureImageBlobs(moves: { oldPath: string; newPath: string }[]): Promise<boolean> {
        return this.featureImages.moveBlobs(moves);
    }

    /**
     * Apply a rename burst's preview store moves and deletes in one transaction, replayed in vault event order.
     */
    async movePreviewTexts(ops: PreviewTextBatchOp[]): Promise<void> {
        await this.previewTexts.movePreviewTexts(ops);
    }

    /**
     * Delete a feature image blob by path.
     */
    async deleteFeatureImageBlob(path: string): Promise<void> {
        await this.featureImages.deleteBlob(path);
    }

    /**
     * Close the database connection.
     * Should be called when the plugin is unloaded.
     */
    close(): void {
        this.isClosing = true;
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        this.initPromise = null;
        this.cache.clear();
        this.previewTexts.close();
        this.featureImages.close();
        this.featureImageBlobs.clearMemoryCaches();
    }
}
