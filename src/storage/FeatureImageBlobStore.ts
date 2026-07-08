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

import { FeatureImageBlobCache } from './FeatureImageBlobCache';
import type { FeatureImageStatus } from './IndexedDBStorage';
import { LIMITS } from '../constants/limits';

// Blob store for feature image thumbnails keyed by file path.
export const FEATURE_IMAGE_STORE_NAME = 'featureImageBlobs';
// Default in-memory LRU capacity for feature image blobs.
export const DEFAULT_FEATURE_IMAGE_CACHE_MAX = LIMITS.storage.featureImageCacheMaxEntriesDefault;

export interface FeatureImageBlobRecord {
    featureImageKey: string;
    blob: Blob;
}

export interface FeatureImageChangeSet {
    featureImageKey?: string | null;
    featureImageStatus?: FeatureImageStatus;
}

/**
 * Compute the normalized feature image update across:
 * - the main IndexedDB record (key + status, no blob payload), and
 * - the dedicated blob store (blob payload + key).
 *
 * Callers typically pass:
 * - `featureImageKey` when the selected reference changes
 * - `featureImage` when a thumbnail generation attempt completes (blob or empty blob)
 */
export function computeFeatureImageMutation(params: {
    existingKey: string | null;
    existingStatus: FeatureImageStatus;
    featureImageKey?: string | null;
    featureImage?: Blob | null;
}): {
    nextKey: string | null;
    nextStatus: FeatureImageStatus;
    changes: FeatureImageChangeSet;
    blobUpdate: FeatureImageBlobRecord | null;
    shouldDeleteBlob: boolean;
    shouldClearCache: boolean;
} {
    // Feature images are tracked as:
    // - Main store: `featureImageKey` + `featureImageStatus` (no blob data)
    // - Blob store: `{ featureImageKey, blob }` keyed by path
    //
    // Normalized rules:
    // - A non-empty blob requires a non-empty key; otherwise it is dropped.
    // - Empty blobs are treated as "processed but no thumbnail" and are not persisted.
    // - Any key change invalidates any stored blob for that path.
    const changes: FeatureImageChangeSet = {};
    let nextKey = params.existingKey;
    let nextStatus = params.existingStatus;
    let blobUpdate: FeatureImageBlobRecord | null = null;
    let shouldDeleteBlob = false;
    let shouldClearCache = false;

    const featureImageKeyProvided = params.featureImageKey !== undefined;
    if (featureImageKeyProvided) {
        // A key change indicates the selected feature image reference changed.
        // This invalidates any stored blob for the path because the blob is scoped to the key.
        const requestedKey = params.featureImageKey ?? null;
        if (requestedKey !== params.existingKey) {
            nextKey = requestedKey;
            nextStatus = nextKey === null ? 'unprocessed' : 'none';
            changes.featureImageKey = nextKey;
            changes.featureImageStatus = nextStatus;
            shouldDeleteBlob = true;
            shouldClearCache = true;
        }
    }

    const featureImageProvided = params.featureImage !== undefined;
    if (featureImageProvided) {
        // Any feature image blob update invalidates the in-memory LRU entry for this path.
        // Even when the new blob is dropped, this prevents returning an older thumbnail.
        shouldClearCache = true;
        const blob = params.featureImage;
        if (blob instanceof Blob && blob.size > 0 && nextKey !== null && nextKey !== '') {
            // Persist non-empty blobs only when a non-empty key is present.
            // The key is the durable marker that content providers use to avoid duplicate work.
            blobUpdate = { featureImageKey: nextKey, blob };
            nextStatus = 'has';
            changes.featureImageStatus = 'has';
            shouldDeleteBlob = false;
        } else {
            // Empty blobs are treated as "processed but no thumbnail" and are not persisted.
            // The durable marker for this state is the featureImageKey in the main store.
            blobUpdate = null;
            shouldDeleteBlob = true;
            nextStatus = nextKey === null ? 'unprocessed' : 'none';
            changes.featureImageStatus = nextStatus;
        }
    }

    return { nextKey, nextStatus, changes, blobUpdate, shouldDeleteBlob, shouldClearCache };
}

/**
 * FeatureImageBlobStore - Dedicated IndexedDB store helper with an in-memory LRU.
 */
export class FeatureImageBlobStore {
    private readonly cache: FeatureImageBlobCache;
    // Global counter used to invalidate all in-flight reads when memory caches are cleared.
    private globalCacheEpoch = 0;
    // Per-path counter used to invalidate in-flight reads when the cache is cleared.
    //
    // A get-blob request snapshots the current epoch before reading from IndexedDB.
    // If the epoch changes before the read completes, the result is returned to the caller
    // but is not inserted into the LRU to avoid repopulating stale data.
    private cacheEpochs = new Map<string, number>();
    // Tracks in-flight reads by path + expectedKey to deduplicate concurrent requests.
    //
    // Structure:
    // - First key: file path
    // - Second key: expected feature image key for that path
    // - Value: promise resolving to the stored blob (or null)
    private inFlight = new Map<string, Map<string, Promise<Blob | null>>>();

    constructor(maxEntries: number) {
        this.cache = new FeatureImageBlobCache(maxEntries);
    }

    clearMemoryCaches(): void {
        // Clears:
        // - the in-memory LRU (thumbnails)
        // - cache invalidation epochs
        // - in-flight request registry
        //
        // Called when the database connection changes (open/close/rebuild).
        this.cache.clear();
        this.globalCacheEpoch += 1;
        this.cacheEpochs.clear();
        this.inFlight.clear();
    }

    deleteFromCache(path: string): void {
        // Used after:
        // - key changes
        // - blob writes/deletes
        // - explicit content clears
        //
        // Bumping the epoch prevents older in-flight reads from re-populating the LRU.
        this.cache.delete(path);
        this.bumpCacheEpoch(path);
        this.dropInFlightForPath(path);
    }

    moveCacheEntry(oldPath: string, newPath: string): void {
        // Used when a file is renamed so any cached thumbnail follows the new path.
        //
        // Also clears in-flight reads for both paths since the caller is about to
        // update the blob store and/or rebuild the file cache.
        this.cache.move(oldPath, newPath);
        this.bumpCacheEpoch(oldPath);
        this.bumpCacheEpoch(newPath);
        this.dropInFlightForPath(oldPath);
        this.dropInFlightForPath(newPath);
    }

    async getBlob(db: IDBDatabase, path: string, expectedKey: string): Promise<Blob | null> {
        // Empty keys are treated as "no reference selected" and never have blobs.
        if (!expectedKey) {
            return null;
        }

        // Fast path: return the in-memory LRU blob if it matches the expected key.
        const cached = this.cache.get(path, expectedKey);
        if (cached) {
            return cached;
        }

        // Deduplicate concurrent reads for the same path+key.
        const inFlightByKey = this.inFlight.get(path);
        const inFlight = inFlightByKey?.get(expectedKey) ?? null;
        if (inFlight) {
            return inFlight;
        }

        // Snapshot the epoch so we can avoid caching stale results after invalidation.
        const cacheEpoch = this.getCacheEpoch(path);
        const globalCacheEpoch = this.globalCacheEpoch;
        const request = this.readBlobFromStore(db, path, expectedKey)
            .then(blob => {
                // Only insert into the LRU when the cache has not been invalidated
                // since this read started.
                if (blob && this.globalCacheEpoch === globalCacheEpoch && this.getCacheEpoch(path) === cacheEpoch) {
                    this.cache.set(path, { featureImageKey: expectedKey, blob });
                }
                return blob;
            })
            .finally(() => {
                // Always remove the in-flight entry so later reads can retry.
                const byKey = this.inFlight.get(path);
                if (!byKey) {
                    return;
                }
                const currentRequest = byKey.get(expectedKey);
                if (currentRequest !== request) {
                    return;
                }
                byKey.delete(expectedKey);
                if (byKey.size === 0) {
                    this.inFlight.delete(path);
                }
            });

        const updatedInFlightByKey = inFlightByKey ?? new Map<string, Promise<Blob | null>>();
        updatedInFlightByKey.set(expectedKey, request);
        if (!inFlightByKey) {
            this.inFlight.set(path, updatedInFlightByKey);
        }
        return request;
    }

    async forEachBlobRecord(db: IDBDatabase, callback: (path: string, record: FeatureImageBlobRecord) => void): Promise<void> {
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const op = 'forEachBlobRecord';
        let lastRequestError: DOMException | Error | null = null;

        await new Promise<void>((resolve, reject) => {
            const request = store.openCursor();
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    return;
                }

                if (typeof cursor.key !== 'string') {
                    cursor.continue();
                    return;
                }

                const path = cursor.key;
                const record = cursor.value as FeatureImageBlobRecord | undefined;
                if (record && typeof record.featureImageKey === 'string' && record.blob instanceof Blob && record.blob.size > 0) {
                    try {
                        callback(path, record);
                    } catch (error: unknown) {
                        console.error('[IndexedDB] callback failed', { store: FEATURE_IMAGE_STORE_NAME, op, path, error });
                    }
                }

                cursor.continue();
            };
            request.onerror = () => {
                lastRequestError = request.error || null;
                console.error('[IndexedDB] openCursor failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    name: request.error?.name,
                    message: request.error?.message
                });
                reject(request.error ?? new Error('Cursor request failed'));
            };
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction aborted'));
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction error'));
            };
        });
    }

    async moveBlobs(db: IDBDatabase, moves: { oldPath: string; newPath: string }[]): Promise<void> {
        // Replays a rename burst's blob moves in vault event order inside one transaction. Each
        // move's get is issued after the previous move's put/delete, so a chained rename
        // (a -> b, b -> c) reads the record written by the preceding move. The stored record
        // includes `featureImageKey`, allowing callers to validate the blob against the main
        // store key when rendering.
        if (moves.length === 0) {
            return;
        }
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const op = 'moveFeatureImageBlobs';
        let lastRequestError: DOMException | Error | null = null;
        // Stored-record presence per destination path, resolved in event order so a later move that
        // re-occupies a path overrides an earlier move's missing-record outcome for that path.
        const recordFoundByNewPath = new Map<string, boolean>();

        await new Promise<void>((resolve, reject) => {
            const processMove = (index: number): void => {
                if (index >= moves.length) {
                    return;
                }
                const { oldPath, newPath } = moves[index];
                const getReq = store.get(oldPath);
                getReq.onsuccess = () => {
                    const record = getReq.result as FeatureImageBlobRecord | undefined;
                    recordFoundByNewPath.set(newPath, record !== undefined);
                    if (record) {
                        const putReq = store.put(record, newPath);
                        putReq.onerror = () => {
                            lastRequestError = putReq.error || null;
                            console.error('[IndexedDB] put failed', {
                                store: FEATURE_IMAGE_STORE_NAME,
                                op,
                                path: newPath,
                                name: putReq.error?.name,
                                message: putReq.error?.message
                            });
                        };
                        const deleteReq = store.delete(oldPath);
                        deleteReq.onerror = () => {
                            lastRequestError = deleteReq.error || null;
                            console.error('[IndexedDB] delete failed', {
                                store: FEATURE_IMAGE_STORE_NAME,
                                op,
                                path: oldPath,
                                name: deleteReq.error?.name,
                                message: deleteReq.error?.message
                            });
                        };
                    }
                    processMove(index + 1);
                };
                getReq.onerror = () => {
                    lastRequestError = getReq.error || null;
                    console.error('[IndexedDB] get failed', {
                        store: FEATURE_IMAGE_STORE_NAME,
                        op,
                        path: oldPath,
                        name: getReq.error?.name,
                        message: getReq.error?.message
                    });
                    try {
                        transaction.abort();
                    } catch (e) {
                        void e;
                    }
                };
            };
            processMove(0);
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction aborted'));
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction error'));
            };
        });

        // Cached thumbnails were already relocated hop by hop at rename-event time (`moveCacheEntry`
        // via `beginMove`). A path whose final move found no stored record keeps an event-time cache
        // entry with nothing durable behind it, so drop that entry. A path whose final move found a
        // record keeps its entry even when an earlier move in the burst targeted it record-less.
        for (const [path, recordFound] of recordFoundByNewPath) {
            if (!recordFound) {
                this.deleteFromCache(path);
            }
        }
    }

    async deleteBlob(db: IDBDatabase, path: string): Promise<void> {
        // Deletes the blob store record and drops any in-memory cached entry.
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const op = 'deleteFeatureImageBlob';
        let lastRequestError: DOMException | Error | null = null;

        await new Promise<void>((resolve, reject) => {
            const deleteReq = store.delete(path);
            deleteReq.onerror = () => {
                lastRequestError = deleteReq.error || null;
                console.error('[IndexedDB] delete failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    path,
                    name: deleteReq.error?.name,
                    message: deleteReq.error?.message
                });
            };
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction aborted'));
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction error'));
            };
        });

        this.deleteFromCache(path);
    }

    protected async readBlobFromStore(db: IDBDatabase, path: string, expectedKey: string): Promise<Blob | null> {
        // Reads a single record from the dedicated blob store.
        //
        // The record is considered valid only when:
        // - it exists,
        // - the stored key matches `expectedKey`, and
        // - the stored blob is non-empty.
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const op = 'getFeatureImageBlob';

        return new Promise(resolve => {
            const request = store.get(path);
            request.onsuccess = () => {
                const record = request.result as FeatureImageBlobRecord | undefined;
                if (!record || record.featureImageKey !== expectedKey || !(record.blob instanceof Blob) || record.blob.size === 0) {
                    resolve(null);
                    return;
                }
                resolve(record.blob);
            };
            request.onerror = () => {
                console.error('[IndexedDB] get failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    path,
                    name: request.error?.name,
                    message: request.error?.message
                });
                resolve(null);
            };
        });
    }

    private getCacheEpoch(path: string): number {
        // Epoch values start at 0 and only change when this class invalidates the path.
        return this.cacheEpochs.get(path) ?? 0;
    }

    private bumpCacheEpoch(path: string): void {
        // Invalidate future LRU inserts from previously-started reads.
        this.cacheEpochs.set(path, this.getCacheEpoch(path) + 1);
    }

    private dropInFlightForPath(path: string): void {
        // Drop all in-flight reads for this path (regardless of expectedKey).
        this.inFlight.delete(path);
    }
}
