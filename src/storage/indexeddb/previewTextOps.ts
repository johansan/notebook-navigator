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

import { isPlainObjectRecordValue } from '../../utils/recordUtils';
import { MemoryFileCache } from '../MemoryFileCache';
import { PREVIEW_STORE_NAME, STORE_NAME } from './constants';
import { normalizeIdbError, rejectWithTransactionError } from './idbErrors';
import { getDefaultPreviewStatusForPath, type FileContentChange, type PreviewStatus } from './fileData';

interface PreviewTextCoordinatorDeps {
    cache: MemoryFileCache;
    getDb: () => IDBDatabase | null;
    init: () => Promise<void>;
    isClosing: () => boolean;
    emitChanges: (changes: FileContentChange[]) => void;
}

/**
 * One preview store change from a rename event. `move` transfers stored text between paths;
 * `delete` drops the stored text for a path (rename from markdown to a non-markdown extension).
 */
export type PreviewTextBatchOp = { type: 'move'; oldPath: string; newPath: string } | { type: 'delete'; path: string };

/**
 * Final preview store state a rename burst leaves at one path, resolved in event order.
 * `vacated` marks a move source no later op re-occupied; like `deleted`, its stored text is gone.
 */
type PreviewMoveOutcome = { type: 'moved'; text: string } | { type: 'missing' } | { type: 'deleted' } | { type: 'vacated' };

export class PreviewTextCoordinator {
    private readonly cache: MemoryFileCache;
    private readonly getDb: () => IDBDatabase | null;
    private readonly init: () => Promise<void>;
    private readonly isClosing: () => boolean;
    private readonly emitChanges: (changes: FileContentChange[]) => void;
    // Maximum number of preview text strings held in memory.
    private readonly previewTextCacheMaxEntries: number;
    // Maximum number of preview text paths processed per load flush.
    private readonly previewLoadMaxBatch: number;

    private readonly previewLoadPromises = new Map<string, Promise<void>>();
    private readonly previewLoadDeferred = new Map<string, { resolve: () => void }>();
    private readonly previewLoadQueue = new Set<string>();
    private previewLoadFlushTimer: ReturnType<typeof window.setTimeout> | null = null;
    private previewLoadFlushTimerWindow: Window | null = null;
    private isPreviewLoadFlushRunning = false;
    private previewLoadSessionId = 0;
    // Tracks preview store key moves while a rename is in progress: newPath -> { oldPath, startedAt }.
    // Used to prevent the preview loader from downgrading `previewStatus` when the preview record is temporarily missing.
    private readonly previewTextMoveInFlight = new Map<string, { oldPath: string; startedAt: number }>();
    // Warmup state for background preview text cache population.
    private isPreviewWarmupEnabled = false;
    private isPreviewWarmupComplete = false;
    private isPreviewWarmupRunning = false;
    private previewWarmupCursorKey: string | null = null;
    private previewWarmupTimer: ReturnType<typeof window.setTimeout> | null = null;
    private previewWarmupTimerWindow: Window | null = null;

    constructor(params: { deps: PreviewTextCoordinatorDeps; previewTextCacheMaxEntries: number; previewLoadMaxBatch: number }) {
        this.cache = params.deps.cache;
        this.getDb = params.deps.getDb;
        this.init = params.deps.init;
        this.isClosing = params.deps.isClosing;
        this.emitChanges = params.deps.emitChanges;
        this.previewTextCacheMaxEntries = params.previewTextCacheMaxEntries;
        this.previewLoadMaxBatch = params.previewLoadMaxBatch;
    }

    getCachedPreviewText(path: string): string {
        if (!this.cache.isReady()) {
            return '';
        }
        return this.cache.getPreviewText(path);
    }

    async ensurePreviewTextLoaded(path: string): Promise<void> {
        if (this.isClosing()) {
            return;
        }
        if (!this.cache.isReady()) {
            return;
        }

        const file = this.cache.getFile(path);
        if (!file || file.previewStatus !== 'has') {
            return;
        }

        if (this.cache.getPreviewText(path).length > 0) {
            return;
        }

        const existingPromise = this.previewLoadPromises.get(path);
        if (existingPromise) {
            return existingPromise;
        }

        const deferred: { resolve: () => void } = {
            resolve: () => void 0
        };

        const loadPromise = new Promise<void>(resolve => {
            deferred.resolve = resolve;
        }).finally(() => {
            this.previewLoadPromises.delete(path);
            this.previewLoadDeferred.delete(path);
        });

        this.previewLoadDeferred.set(path, deferred);
        this.previewLoadPromises.set(path, loadPromise);
        this.previewLoadQueue.add(path);
        this.schedulePreviewTextLoadFlush();
        this.enablePreviewTextWarmup();
        return loadPromise;
    }

    beginMove(oldPath: string, newPath: string): void {
        if (oldPath === newPath) {
            return;
        }
        // Opportunistic cleanup for failed/abandoned moves.
        this.pruneMovesInFlight();

        const existing = this.previewTextMoveInFlight.get(newPath);
        if (existing?.oldPath === oldPath) {
            return;
        }
        this.previewTextMoveInFlight.set(newPath, { oldPath, startedAt: Date.now() });

        if (!this.cache.isReady()) {
            return;
        }

        // Copy already-loaded preview text to the new path so UI can render without waiting for IndexedDB.
        const cachedPreviewText = this.cache.getPreviewText(oldPath);
        if (cachedPreviewText.length === 0) {
            return;
        }

        const existingRecord = this.cache.getFile(newPath);
        if (!existingRecord) {
            return;
        }

        const previousPreviewStatus = existingRecord.previewStatus;
        this.cache.updateFileContent(newPath, { previewText: cachedPreviewText, previewStatus: 'has' });
        const changes: FileContentChange['changes'] = { preview: cachedPreviewText };
        if (previousPreviewStatus !== 'has') {
            changes.previewStatus = 'has';
        }
        this.emitChanges([{ path: newPath, changes, changeType: 'content' }]);
    }

    /**
     * Applies a rename burst's preview store changes in vault event order inside one transaction.
     *
     * Ops are replayed serially: each move's get is issued after the previous op's put/delete, so a
     * chained rename (a -> b, b -> c) reads the text written by the preceding move, and a delete for
     * a vacated markdown path runs before a later move re-occupies that path. `delete` ops cover
     * renames from markdown to a non-markdown extension.
     */
    async movePreviewTexts(ops: PreviewTextBatchOp[]): Promise<void> {
        const pendingOps = ops.filter(batchOp => batchOp.type === 'delete' || batchOp.oldPath !== batchOp.newPath);
        if (pendingOps.length === 0) {
            return;
        }

        // Final preview store state per path, recorded in event order across both op types so the
        // last op for a path wins (covers a later delete of a path an earlier move occupied).
        const finalStates = new Map<string, PreviewMoveOutcome>();
        let didMove = false;
        try {
            await this.init();
            const db = this.getDb();
            if (!db) throw new Error('Database not initialized');

            const transaction = db.transaction([PREVIEW_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(PREVIEW_STORE_NAME);

            await new Promise<void>((resolve, reject) => {
                const op = 'movePreviewTexts';
                let lastRequestError: DOMException | Error | null = null;

                const processOp = (startIndex: number): void => {
                    // Delete ops need no result, so a run of them is issued in a loop; only a move
                    // waits on its get before continuing.
                    let index = startIndex;
                    while (index < pendingOps.length) {
                        const currentOp = pendingOps[index];
                        if (currentOp.type === 'delete') {
                            finalStates.set(currentOp.path, { type: 'deleted' });
                            const deleteReq = store.delete(currentOp.path);
                            deleteReq.onerror = () => {
                                lastRequestError = deleteReq.error || null;
                                console.error('[IndexedDB] delete failed', {
                                    store: PREVIEW_STORE_NAME,
                                    op,
                                    path: currentOp.path,
                                    name: deleteReq.error?.name,
                                    message: deleteReq.error?.message
                                });
                            };
                            index += 1;
                            continue;
                        }

                        const moveIndex = index;
                        const getReq = store.get(currentOp.oldPath);
                        getReq.onsuccess = () => {
                            // The move vacates its source; a later op that re-occupies the path
                            // overrides this entry.
                            finalStates.set(currentOp.oldPath, { type: 'vacated' });
                            const previewText: unknown = getReq.result;
                            if (typeof previewText === 'string' && previewText.length > 0) {
                                finalStates.set(currentOp.newPath, { type: 'moved', text: previewText });
                                const putReq = store.put(previewText, currentOp.newPath);
                                putReq.onerror = () => {
                                    lastRequestError = putReq.error || null;
                                    console.error('[IndexedDB] put failed', {
                                        store: PREVIEW_STORE_NAME,
                                        op,
                                        path: currentOp.newPath,
                                        name: putReq.error?.name,
                                        message: putReq.error?.message
                                    });
                                };
                            } else {
                                finalStates.set(currentOp.newPath, { type: 'missing' });
                            }
                            const deleteReq = store.delete(currentOp.oldPath);
                            deleteReq.onerror = () => {
                                lastRequestError = deleteReq.error || null;
                                console.error('[IndexedDB] delete failed', {
                                    store: PREVIEW_STORE_NAME,
                                    op,
                                    path: currentOp.oldPath,
                                    name: deleteReq.error?.name,
                                    message: deleteReq.error?.message
                                });
                            };
                            processOp(moveIndex + 1);
                        };
                        getReq.onerror = () => {
                            lastRequestError = getReq.error || null;
                            console.error('[IndexedDB] get failed', {
                                store: PREVIEW_STORE_NAME,
                                op,
                                path: currentOp.oldPath,
                                name: getReq.error?.name,
                                message: getReq.error?.message
                            });
                            try {
                                transaction.abort();
                            } catch (e) {
                                void e;
                            }
                        };
                        return;
                    }
                };
                processOp(0);

                transaction.oncomplete = () => resolve();
                transaction.onabort = () => {
                    console.error('[IndexedDB] transaction aborted', {
                        store: PREVIEW_STORE_NAME,
                        op,
                        txError: transaction.error?.message,
                        reqError: lastRequestError?.message
                    });
                    rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
                };
                transaction.onerror = () => {
                    console.error('[IndexedDB] transaction error', {
                        store: PREVIEW_STORE_NAME,
                        op,
                        txError: transaction.error?.message,
                        reqError: lastRequestError?.message
                    });
                    rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
                };
            });
            didMove = true;

            // The store is consistent from here: end the move markers and unblock loads that were
            // queued during the rename window now, before the cache reconciliation and the status
            // repair below. The repair awaits a second transaction, and a load queued during that
            // wait (for example for a path whose reconciled text was evicted from the LRU) is
            // legitimate and must not be cancelled.
            for (const currentOp of pendingOps) {
                if (currentOp.type !== 'move') {
                    continue;
                }
                this.endMove(currentOp.oldPath, currentOp.newPath);
                this.previewLoadQueue.delete(currentOp.newPath);
                // Unblock any `ensurePreviewTextLoaded(newPath)` call queued during the rename window.
                this.previewLoadDeferred.get(currentOp.newPath)?.resolve();
            }

            if (this.cache.isReady()) {
                const changes: FileContentChange[] = [];
                const statusRepairs: { path: string; previewStatus: PreviewStatus }[] = [];
                for (const [path, finalState] of finalStates) {
                    if (finalState.type === 'deleted' || finalState.type === 'vacated') {
                        // Mirror the store state: the path's text is gone (deleted, or moved away with
                        // no later op re-occupying the path). The following diff removes the record.
                        this.cache.updateFileContent(path, { previewText: '' });
                        continue;
                    }
                    if (finalState.type === 'moved') {
                        const previousPreviewStatus = this.cache.getFile(path)?.previewStatus ?? null;
                        this.cache.updateFileContent(path, { previewText: finalState.text, previewStatus: 'has' });
                        const entryChanges: FileContentChange['changes'] = { preview: finalState.text };
                        if (previousPreviewStatus !== null && previousPreviewStatus !== 'has') {
                            entryChanges.previewStatus = 'has';
                        }
                        changes.push({ path, changes: entryChanges, changeType: 'content' });
                        // The rename flush persists the seeded records with previewStatus 'has' before
                        // this mover runs, so a cached 'has' needs no repair transaction; the repair
                        // covers records whose cached status disagrees with the moved text.
                        if (previousPreviewStatus !== 'has') {
                            statusRepairs.push({ path, previewStatus: 'has' });
                        }
                        continue;
                    }

                    const file = this.cache.getFile(path);
                    if (file && file.previewStatus === 'has') {
                        const nextPreviewStatus = getDefaultPreviewStatusForPath(path);
                        this.cache.updateFileContent(path, { previewText: '', previewStatus: nextPreviewStatus });
                        changes.push({
                            path,
                            changes: { preview: null, previewStatus: nextPreviewStatus },
                            changeType: 'content'
                        });
                        statusRepairs.push({ path, previewStatus: nextPreviewStatus });
                    }
                }

                if (changes.length > 0) {
                    this.emitChanges(changes);
                }
                if (statusRepairs.length > 0) {
                    try {
                        await this.repairPreviewStatusRecords(statusRepairs);
                    } catch (error: unknown) {
                        if (!this.isClosing()) {
                            console.error('[PreviewText] Failed to persist preview status after move', error);
                        }
                    }
                }
            }
        } catch (error: unknown) {
            if (!this.isClosing()) {
                console.error('[PreviewText] Failed to move preview texts', { ops: pendingOps, error });
            }
        } finally {
            if (!didMove) {
                // A failed batch keeps the markers alive so the load flush skips the status repair
                // at the new paths until the TTL prunes them; regeneration heals after the diff.
                // Loads queued during the rename window still resolve so callers are not left hanging.
                for (const currentOp of pendingOps) {
                    if (currentOp.type !== 'move') {
                        continue;
                    }
                    this.previewLoadQueue.delete(currentOp.newPath);
                    this.previewLoadDeferred.get(currentOp.newPath)?.resolve();
                }
            }
        }
    }

    async forEachPreviewTextRecord(callback: (path: string, previewText: string) => void): Promise<void> {
        await this.init();
        const db = this.getDb();
        if (!db) {
            return;
        }

        const transaction = db.transaction([PREVIEW_STORE_NAME], 'readonly');
        const store = transaction.objectStore(PREVIEW_STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const op = 'forEachPreviewTextRecord';
            let lastRequestError: DOMException | Error | null = null;

            const request = store.openCursor();
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    return;
                }

                const path = cursor.key;
                const value: unknown = cursor.value;
                if (typeof path === 'string' && typeof value === 'string' && value.length > 0) {
                    callback(path, value);
                }

                cursor.continue();
            };
            request.onerror = () => {
                const requestError = request.error;
                lastRequestError = requestError || null;
                console.error('[IndexedDB] openCursor failed', {
                    store: PREVIEW_STORE_NAME,
                    op,
                    name: requestError?.name,
                    message: requestError?.message
                });
                reject(normalizeIdbError(requestError, 'Cursor request failed'));
            };

            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: PREVIEW_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: PREVIEW_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });
    }

    close(): void {
        this.previewLoadSessionId += 1;
        if (this.previewLoadFlushTimer !== null) {
            (this.previewLoadFlushTimerWindow ?? activeWindow).clearTimeout(this.previewLoadFlushTimer);
            this.previewLoadFlushTimer = null;
            this.previewLoadFlushTimerWindow = null;
        }
        if (this.previewWarmupTimer !== null) {
            (this.previewWarmupTimerWindow ?? activeWindow).clearTimeout(this.previewWarmupTimer);
            this.previewWarmupTimer = null;
            this.previewWarmupTimerWindow = null;
        }
        this.isPreviewWarmupEnabled = false;
        this.isPreviewWarmupComplete = true;
        this.isPreviewWarmupRunning = false;
        this.previewWarmupCursorKey = null;
        this.previewLoadQueue.clear();
        this.previewLoadDeferred.forEach(deferred => deferred.resolve());
        this.previewLoadDeferred.clear();
        this.previewLoadPromises.clear();
        this.previewTextMoveInFlight.clear();
    }

    private schedulePreviewTextLoadFlush(): void {
        if (this.isClosing()) {
            return;
        }
        if (this.previewLoadFlushTimer !== null) {
            return;
        }

        const timerWindow = activeWindow;
        this.previewLoadFlushTimerWindow = timerWindow;
        this.previewLoadFlushTimer = timerWindow.setTimeout(() => {
            this.previewLoadFlushTimer = null;
            this.previewLoadFlushTimerWindow = null;
            void this.flushPreviewTextLoadQueue();
        }, 0);
    }

    /**
     * Enables preview text warmup and schedules the first warmup flush.
     */
    private enablePreviewTextWarmup(): void {
        if (this.isClosing()) {
            return;
        }
        if (this.isPreviewWarmupComplete) {
            return;
        }
        if (this.isPreviewWarmupEnabled) {
            return;
        }
        if (this.previewTextCacheMaxEntries === 0) {
            this.isPreviewWarmupComplete = true;
            return;
        }

        this.isPreviewWarmupEnabled = true;
        this.schedulePreviewTextWarmupFlush();
    }

    /**
     * Schedules a warmup flush with an optional delay.
     */
    private schedulePreviewTextWarmupFlush(delayMs = 0): void {
        if (this.isClosing()) {
            return;
        }
        if (!this.isPreviewWarmupEnabled || this.isPreviewWarmupComplete) {
            return;
        }
        if (this.previewWarmupTimer !== null) {
            return;
        }

        const timerWindow = activeWindow;
        this.previewWarmupTimerWindow = timerWindow;
        this.previewWarmupTimer = timerWindow.setTimeout(() => {
            this.previewWarmupTimer = null;
            this.previewWarmupTimerWindow = null;
            void this.flushPreviewTextWarmup();
        }, delayMs);
    }

    /**
     * Loads preview text strings from IndexedDB into the in-memory LRU.
     */
    private async flushPreviewTextWarmup(): Promise<void> {
        if (this.isClosing()) {
            return;
        }
        if (!this.isPreviewWarmupEnabled || this.isPreviewWarmupComplete) {
            return;
        }
        if (this.isPreviewWarmupRunning) {
            return;
        }
        if (!this.cache.isReady()) {
            return;
        }

        if (this.previewTextCacheMaxEntries === 0 || this.cache.getPreviewTextEntryCount() >= this.previewTextCacheMaxEntries) {
            this.isPreviewWarmupEnabled = false;
            this.isPreviewWarmupComplete = true;
            return;
        }

        // Warm up after the initial preview requests have loaded.
        if (this.isPreviewLoadFlushRunning || this.previewLoadFlushTimer !== null || this.previewLoadQueue.size > 0) {
            this.schedulePreviewTextWarmupFlush(25);
            return;
        }

        const sessionId = this.previewLoadSessionId;
        this.isPreviewWarmupRunning = true;
        try {
            await this.init();
            const db = this.getDb();
            if (!db) {
                this.isPreviewWarmupEnabled = false;
                this.isPreviewWarmupComplete = true;
                return;
            }
            if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                return;
            }

            const cursorStepLimit = this.previewLoadMaxBatch * 10;
            const hasMore = await this.warmPreviewTextCacheBatch(cursorStepLimit, sessionId, db);
            if (!hasMore) {
                this.isPreviewWarmupEnabled = false;
                this.isPreviewWarmupComplete = true;
                return;
            }
        } catch (error: unknown) {
            if (!this.isClosing() && sessionId === this.previewLoadSessionId) {
                console.error('[PreviewText] Warmup failed', error);
            }
            this.isPreviewWarmupEnabled = false;
            this.isPreviewWarmupComplete = true;
            return;
        } finally {
            this.isPreviewWarmupRunning = false;
        }

        if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
            return;
        }
        if (this.cache.getPreviewTextEntryCount() >= this.previewTextCacheMaxEntries) {
            this.isPreviewWarmupEnabled = false;
            this.isPreviewWarmupComplete = true;
            return;
        }

        this.schedulePreviewTextWarmupFlush();
    }

    /**
     * Reads a cursor batch from the preview store and updates the preview text LRU.
     */
    private async warmPreviewTextCacheBatch(cursorStepLimit: number, sessionId: number, db: IDBDatabase): Promise<boolean> {
        if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
            return false;
        }
        if (!this.cache.isReady()) {
            return false;
        }
        if (this.previewTextCacheMaxEntries === 0) {
            return false;
        }

        if (this.cache.getPreviewTextEntryCount() >= this.previewTextCacheMaxEntries) {
            return false;
        }

        const transaction = db.transaction([PREVIEW_STORE_NAME], 'readonly');
        const store = transaction.objectStore(PREVIEW_STORE_NAME);

        let reachedEnd = false;

        await new Promise<void>((resolve, reject) => {
            const op = 'warmPreviewTextCache';
            let lastRequestError: DOMException | Error | null = null;

            const range = this.previewWarmupCursorKey ? IDBKeyRange.lowerBound(this.previewWarmupCursorKey, true) : undefined;
            const request = store.openCursor(range);

            let steps = 0;
            request.onsuccess = () => {
                if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                    return;
                }

                const cursor = request.result;
                if (!cursor) {
                    reachedEnd = true;
                    return;
                }

                // Pause warmup when explicit preview-load requests are pending.
                // The preview-load flush path emits change events used by UI components (e.g. FileItem state).
                if (this.isPreviewLoadFlushRunning || this.previewLoadFlushTimer !== null || this.previewLoadQueue.size > 0) {
                    return;
                }

                if (this.cache.getPreviewTextEntryCount() >= this.previewTextCacheMaxEntries) {
                    return;
                }

                steps += 1;

                const path = cursor.key;
                const previewText: unknown = cursor.value;

                if (typeof path === 'string') {
                    this.previewWarmupCursorKey = path;
                    if (typeof previewText === 'string' && previewText.length > 0) {
                        const file = this.cache.getFile(path);
                        if (file && file.previewStatus === 'has' && !this.cache.isPreviewTextLoaded(path)) {
                            this.cache.updateFileContent(path, { previewText });
                        }
                    }
                }

                if (this.cache.getPreviewTextEntryCount() >= this.previewTextCacheMaxEntries || steps >= cursorStepLimit) {
                    return;
                }

                cursor.continue();
            };
            request.onerror = () => {
                lastRequestError = request.error || null;
                console.error('[IndexedDB] openCursor failed', {
                    store: PREVIEW_STORE_NAME,
                    op,
                    name: request.error?.name,
                    message: request.error?.message
                });
                reject(normalizeIdbError(request.error, 'Cursor request failed'));
            };

            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                    resolve();
                    return;
                }
                console.error('[IndexedDB] transaction aborted', {
                    store: PREVIEW_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                    resolve();
                    return;
                }
                console.error('[IndexedDB] transaction error', {
                    store: PREVIEW_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });

        if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
            return false;
        }
        if (this.cache.getPreviewTextEntryCount() >= this.previewTextCacheMaxEntries) {
            return false;
        }
        return !reachedEnd;
    }

    private async repairPreviewStatusRecords(updates: { path: string; previewStatus: PreviewStatus }[]): Promise<void> {
        if (this.isClosing()) {
            return;
        }
        if (updates.length === 0) {
            return;
        }
        await this.init();
        const db = this.getDb();
        if (!db) {
            return;
        }

        const sessionId = this.previewLoadSessionId;
        if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const op = 'repairPreviewStatusRecords';
            let lastRequestError: DOMException | Error | null = null;

            updates.forEach(update => {
                const getReq = store.get(update.path);
                getReq.onsuccess = () => {
                    const recordValue: unknown = getReq.result;
                    if (!isPlainObjectRecordValue(recordValue)) {
                        return;
                    }

                    const record = recordValue;
                    if (record.previewStatus === update.previewStatus) {
                        return;
                    }

                    record.previewStatus = update.previewStatus;
                    const putReq = store.put(record, update.path);
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
                    try {
                        transaction.abort();
                    } catch (e) {
                        void e;
                    }
                };
            });

            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                if (this.isClosing()) {
                    resolve();
                    return;
                }
                console.error('[IndexedDB] transaction aborted', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
            };
            transaction.onerror = () => {
                if (this.isClosing()) {
                    resolve();
                    return;
                }
                console.error('[IndexedDB] transaction error', {
                    store: STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
            };
        });
    }

    private async flushPreviewTextLoadQueue(): Promise<void> {
        if (this.isPreviewLoadFlushRunning) {
            return;
        }

        this.isPreviewLoadFlushRunning = true;
        const sessionId = this.previewLoadSessionId;
        try {
            // Opportunistic cleanup so stuck in-flight state does not block preview loading indefinitely.
            this.pruneMovesInFlight();

            const queuedPaths = Array.from(this.previewLoadQueue);
            this.previewLoadQueue.clear();
            if (queuedPaths.length === 0) {
                return;
            }

            const pathsToProcess = queuedPaths.slice(0, this.previewLoadMaxBatch);
            if (queuedPaths.length > this.previewLoadMaxBatch) {
                for (const path of queuedPaths.slice(this.previewLoadMaxBatch)) {
                    this.previewLoadQueue.add(path);
                }
            }

            if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                for (const path of pathsToProcess) {
                    this.previewLoadDeferred.get(path)?.resolve();
                }
                return;
            }

            try {
                await this.init();
            } catch (error: unknown) {
                if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                    for (const path of queuedPaths) {
                        this.previewLoadDeferred.get(path)?.resolve();
                    }
                    return;
                }
                const initError = error instanceof Error ? error : new Error('Failed to initialize database');
                console.error('[PreviewText] Failed to initialize database for preview load', initError);
                for (const path of queuedPaths) {
                    this.previewLoadDeferred.get(path)?.resolve();
                }
                return;
            }

            const db = this.getDb();
            if (!db) {
                if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                    for (const path of pathsToProcess) {
                        this.previewLoadDeferred.get(path)?.resolve();
                    }
                    return;
                }
                console.error('[PreviewText] Database not initialized for preview load');
                for (const path of pathsToProcess) {
                    this.previewLoadDeferred.get(path)?.resolve();
                }
                return;
            }

            const pathsToLoad: string[] = [];
            for (const path of pathsToProcess) {
                const deferred = this.previewLoadDeferred.get(path);
                if (!deferred) {
                    continue;
                }

                const file = this.cache.getFile(path);
                if (!file || file.previewStatus !== 'has') {
                    deferred.resolve();
                    continue;
                }

                if (this.cache.getPreviewText(path).length > 0) {
                    deferred.resolve();
                    continue;
                }

                pathsToLoad.push(path);
            }

            if (pathsToLoad.length === 0) {
                return;
            }

            const previewTexts = new Map<string, string | null>();
            const changes: FileContentChange[] = [];
            const previewStatusRepairs: { path: string; previewStatus: PreviewStatus }[] = [];

            if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                for (const path of pathsToLoad) {
                    this.previewLoadDeferred.get(path)?.resolve();
                }
                return;
            }

            const transaction = db.transaction([PREVIEW_STORE_NAME], 'readonly');
            const store = transaction.objectStore(PREVIEW_STORE_NAME);

            try {
                await new Promise<void>((resolve, reject) => {
                    const op = 'loadPreviewText:batch';
                    let lastRequestError: DOMException | Error | null = null;

                    for (const path of pathsToLoad) {
                        const getReq = store.get(path);
                        getReq.onsuccess = () => {
                            const previewText: unknown = getReq.result;
                            if (typeof previewText === 'string' && previewText.length > 0) {
                                previewTexts.set(path, previewText);
                            } else {
                                previewTexts.set(path, null);
                            }
                        };
                        getReq.onerror = () => {
                            lastRequestError = getReq.error || null;
                            if (!this.isClosing() && sessionId === this.previewLoadSessionId) {
                                console.error('[IndexedDB] get failed', {
                                    store: PREVIEW_STORE_NAME,
                                    op,
                                    path,
                                    name: getReq.error?.name,
                                    message: getReq.error?.message
                                });
                            }
                            try {
                                transaction.abort();
                            } catch (e) {
                                void e;
                            }
                        };
                    }

                    transaction.oncomplete = () => resolve();
                    transaction.onabort = () => {
                        if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                            resolve();
                            return;
                        }
                        console.error('[IndexedDB] transaction aborted', {
                            store: PREVIEW_STORE_NAME,
                            op,
                            txError: transaction.error?.message,
                            reqError: lastRequestError?.message
                        });
                        rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
                    };
                    transaction.onerror = () => {
                        if (this.isClosing() || sessionId !== this.previewLoadSessionId) {
                            resolve();
                            return;
                        }
                        console.error('[IndexedDB] transaction error', {
                            store: PREVIEW_STORE_NAME,
                            op,
                            txError: transaction.error?.message,
                            reqError: lastRequestError?.message
                        });
                        rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
                    };
                });
            } catch (error: unknown) {
                const loadError = error instanceof Error ? error : new Error('Preview load failed');
                if (!this.isClosing() && sessionId === this.previewLoadSessionId) {
                    console.error('[PreviewText] Failed to load previews', loadError);
                }
                for (const path of pathsToLoad) {
                    this.previewLoadDeferred.get(path)?.resolve();
                }
                return;
            }

            for (const path of pathsToLoad) {
                const previewText = previewTexts.get(path);
                if (typeof previewText === 'string' && previewText.length > 0) {
                    this.cache.updateFileContent(path, { previewText, previewStatus: 'has' });
                    changes.push({ path, changes: { preview: previewText }, changeType: 'content' });
                    this.previewLoadDeferred.get(path)?.resolve();
                    continue;
                }

                const file = this.cache.getFile(path);
                if (file && file.previewStatus === 'has') {
                    // During a rename/move, the preview record is keyed by path and may not exist at `newPath` yet.
                    // Keep `previewStatus` intact until the batched `movePreviewTexts()` lands or the marker expires.
                    if (this.isMoveInFlight(path)) {
                        this.previewLoadDeferred.get(path)?.resolve();
                        continue;
                    }
                    const nextPreviewStatus = getDefaultPreviewStatusForPath(path);
                    this.cache.updateFileContent(path, { previewText: '', previewStatus: nextPreviewStatus });
                    previewStatusRepairs.push({ path, previewStatus: nextPreviewStatus });
                    changes.push({ path, changes: { preview: null, previewStatus: nextPreviewStatus }, changeType: 'content' });
                }

                this.previewLoadDeferred.get(path)?.resolve();
            }

            if (previewStatusRepairs.length > 0 && !this.isClosing() && sessionId === this.previewLoadSessionId) {
                try {
                    await this.repairPreviewStatusRecords(previewStatusRepairs);
                } catch (error: unknown) {
                    if (!this.isClosing() && sessionId === this.previewLoadSessionId) {
                        console.error('[PreviewText] Failed to persist preview status repairs', error);
                    }
                }
            }

            if (changes.length > 0) {
                this.emitChanges(changes);
            }
        } finally {
            this.isPreviewLoadFlushRunning = false;
            if (sessionId === this.previewLoadSessionId && !this.isClosing() && this.previewLoadQueue.size > 0) {
                this.schedulePreviewTextLoadFlush();
            }
        }
    }

    private endMove(oldPath: string, newPath: string): void {
        const tracked = this.previewTextMoveInFlight.get(newPath);
        if (tracked?.oldPath === oldPath) {
            this.previewTextMoveInFlight.delete(newPath);
        }
    }

    private isMoveInFlight(path: string): boolean {
        return this.previewTextMoveInFlight.has(path);
    }

    private pruneMovesInFlight(): void {
        // In-flight entries are best-effort and can remain if the IndexedDB move fails.
        // Prune on subsequent operations to keep the map bounded.
        const maxAgeMs = 10_000;
        const cutoff = Date.now() - maxAgeMs;
        for (const [newPath, tracked] of this.previewTextMoveInFlight.entries()) {
            if (tracked.startedAt <= cutoff) {
                this.previewTextMoveInFlight.delete(newPath);
            }
        }
    }
}
