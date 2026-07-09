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

import type { TFile } from 'obsidian';
import type { FileData as DBFileData, PreviewTextBatchOp } from '../../storage/IndexedDBStorage';
import { runAsyncAction } from '../../utils/async';

/**
 * A rename event buffered for the batched flush. `newPath` is the file's path at event time; a
 * chained rename can advance `file.path` again before the flush runs.
 */
export interface PendingRenameMove {
    file: TFile;
    oldPath: string;
    newPath: string;
    /** Record seeded into the memory mirror at event time; the flush persists it at `newPath` */
    seeded: DBFileData;
    wasMarkdown: boolean;
    isMarkdown: boolean;
    /** True when the old record had a stored thumbnail (`featureImageStatus === 'has'`) */
    hasStoredBlob: boolean;
}

/**
 * Buffered vault rename events awaiting the zero-delay batched flush, in vault event order.
 * Owned by `StorageContext` so buffered entries survive remounts of the vault-sync effect.
 */
export interface PendingRenameFlushBuffer {
    moves: PendingRenameMove[];
    /** Active flush timer id, or null when no flush is scheduled */
    timerId: number | null;
}

/** Storage operations the rename flush uses; implemented by `IndexedDBStorage`. */
export interface RenameFlushStore {
    seedMemoryFile(path: string, data: DBFileData): void;
    setFiles(files: { path: string; data: DBFileData }[]): Promise<void>;
    moveFeatureImageBlobs(moves: { oldPath: string; newPath: string }[]): Promise<boolean>;
    movePreviewTexts(ops: PreviewTextBatchOp[]): Promise<void>;
}

export interface RenameFlushController {
    /** Cancels an armed diff timer and arms the zero-delay flush for the buffered burst */
    scheduleFlush(): void;
    /** Cancels an armed flush timer and flushes buffered moves immediately (effect cleanup) */
    flushNow(): void;
}

/**
 * Filters a diff's removal list against paths a rename has re-occupied. A diff classifies a path
 * as removed based on a vault snapshot; a rename landing after the snapshot (in the diff's awaited
 * record update) can re-occupy such a path, and the flush persists a seeded record and moves
 * stored artifacts there ahead of the diff's delete transaction. Deleting the path would destroy
 * the moved state, and with the pending rename entry consumed by the flush, the reconciling diff
 * would recreate the path as a default record. A path stays in the removal list when no rename
 * targets it (no buffered move and no pending rename entry) or when the file is gone from the
 * vault again.
 */
export function excludeReoccupiedRenameTargets(params: {
    paths: string[];
    buffer: PendingRenameFlushBuffer;
    pendingRenameData: Map<string, DBFileData>;
    isPathInVault: (path: string) => boolean;
}): string[] {
    const { paths, buffer, pendingRenameData, isPathInVault } = params;
    if (buffer.moves.length === 0 && pendingRenameData.size === 0) {
        return paths;
    }
    const renameTargets = new Set(pendingRenameData.keys());
    for (const move of buffer.moves) {
        renameTargets.add(move.newPath);
    }
    return paths.filter(path => !renameTargets.has(path) || !isPathInVault(path));
}

/**
 * Persists a buffered rename burst: one `setFiles` for the burst's seeded records, one batched
 * blob move and one batched preview text move per store (each replayed in vault event order),
 * then a content refresh and a diff reschedule. Callers buffer moves into `buffer.moves` at
 * rename-event time and call `scheduleFlush()`.
 */
export function createRenameFlushController(params: {
    buffer: PendingRenameFlushBuffer;
    /** Rename-time record snapshots keyed by new path, consumed once the flush persists them */
    pendingRenameData: Map<string, DBFileData>;
    isStopped: () => boolean;
    getStore: () => RenameFlushStore;
    /** Clears an armed debounced-diff timer so it cannot fire ahead of the zero-delay flush */
    cancelScheduledDiff: () => void;
    /** Queues content providers for the burst's files after the flush persists their records */
    queueContentRefresh: (files: TFile[]) => void;
    /** Re-arms the debounced diff that reconciles final state after the flush */
    scheduleDiff: () => void;
}): RenameFlushController {
    const { buffer, pendingRenameData, isStopped, getStore, cancelScheduledDiff, queueContentRefresh, scheduleDiff } = params;

    // Deletes pending rename entries the flush has persisted. Entries are identity-checked so an
    // entry re-added for the same path by a later rename survives for that rename's own flush.
    const consumePendingRenameData = (moves: PendingRenameMove[]) => {
        for (const move of moves) {
            if (pendingRenameData.get(move.newPath) === move.seeded) {
                pendingRenameData.delete(move.newPath);
            }
        }
    };

    const clearFeatureImagesForFailedBlobMove = async (
        db: RenameFlushStore,
        records: { path: string; data: DBFileData }[],
        blobMoves: { oldPath: string; newPath: string }[]
    ) => {
        if (blobMoves.length === 0) {
            return;
        }

        const recordsByPath = new Map(records.map(record => [record.path, record.data]));
        const repairRecords: { path: string; data: DBFileData }[] = [];
        const repairedPaths = new Set<string>();

        for (const move of blobMoves) {
            if (repairedPaths.has(move.newPath) || pendingRenameData.has(move.newPath)) {
                continue;
            }

            const data = recordsByPath.get(move.newPath);
            if (!data) {
                continue;
            }

            const repairedData: DBFileData = {
                ...data,
                featureImage: null,
                featureImageKey: null,
                featureImageStatus: 'unprocessed'
            };
            repairedPaths.add(move.newPath);
            repairRecords.push({ path: move.newPath, data: repairedData });
            db.seedMemoryFile(move.newPath, repairedData);
        }

        if (repairRecords.length === 0) {
            return;
        }

        try {
            await db.setFiles(repairRecords);
        } catch (error: unknown) {
            console.error('Failed to mark renamed feature images for regeneration:', error);
        }
    };

    const flush = () => {
        buffer.timerId = null;
        const moves = buffer.moves;
        if (moves.length === 0) {
            return;
        }
        buffer.moves = [];

        runAsyncAction(async () => {
            if (isStopped()) {
                // Buffered renames are dropped during a shutdown or cache-rebuild stop window; the
                // next full diff recreates the records from the vault. Consume the pending rename
                // entries too so a cache rebuild's clean build does not merge the dropped snapshots
                // into its freshly created records.
                consumePendingRenameData(moves);
                return;
            }
            const db = getStore();

            // Persist the seeded records at their new paths before content providers run.
            //
            // Content providers can still run during the rename window (before the next diff reconciles the
            // vault). Provider writes fetch the main IndexedDB record for the path first. If the record is
            // missing, the provider layer creates a default record, which resets preview/feature-image fields
            // (status/key) and also drops any cached preview text for the path.
            //
            // Keeping real records in IndexedDB avoids the default-record path and preserves the seeded fields
            // until the diff finishes and deletes the old paths.
            //
            // Renames preserve mtime, so the event-time seed already mirrors the record and the flush
            // persists it as-is. When the mtime advanced between the event and the flush (an edit landed
            // in the window), the record is re-stamped and the memory mirror refreshed now, synchronously:
            // `setFiles` never touches the memory cache, so no deferred re-stamp of the seeded records can
            // overwrite a preview-move cache reconciliation that lands between the transactions' completion
            // callbacks (the two stores' transactions commit in unspecified relative order).
            const records: { path: string; data: DBFileData }[] = [];
            for (const move of moves) {
                if (move.file.stat.mtime === move.seeded.mtime) {
                    records.push({ path: move.newPath, data: move.seeded });
                    continue;
                }
                const data = { ...move.seeded, mtime: move.file.stat.mtime };
                records.push({ path: move.newPath, data });
                db.seedMemoryFile(move.newPath, data);
            }
            const blobMoves = moves.filter(move => move.hasStoredBlob).map(move => ({ oldPath: move.oldPath, newPath: move.newPath }));
            const previewOps: PreviewTextBatchOp[] = [];
            for (const move of moves) {
                if (move.wasMarkdown && move.isMarkdown) {
                    previewOps.push({ type: 'move', oldPath: move.oldPath, newPath: move.newPath });
                } else if (move.wasMarkdown) {
                    previewOps.push({ type: 'delete', path: move.oldPath });
                }
            }

            // Start all batch operations before awaiting any of them: their transactions are then created
            // ahead of the debounced diff's delete transactions (IndexedDB runs transactions with overlapping
            // scopes in creation order), so the moves always read the old-path records before the diff
            // removes them. `scheduleFlush` cancels a diff timer armed before the burst so an
            // already-imminent diff cannot fire ahead of this flush. This ordering relies on the store's
            // `init()` resolving from a cached settled promise so all three methods create their
            // transactions within one microtask drain; an async hop added before `db.transaction(...)`
            // in any of them would reopen the race.
            const persistPromise = db.setFiles(records).then(
                () => true,
                (error: unknown) => {
                    console.error('Failed to persist renamed file records:', error);
                    return false;
                }
            );
            // The batched move methods handle their own failures and never reject; a failed feature-image
            // blob move resets the affected main records before the provider refresh runs.
            const featureImageMovePromise = db.moveFeatureImageBlobs(blobMoves);
            const previewMovePromise = db.movePreviewTexts(previewOps);

            const persisted = await persistPromise;
            const [featureImageBlobsMoved] = await Promise.all([featureImageMovePromise, previewMovePromise.then(() => undefined)]);

            if (persisted) {
                consumePendingRenameData(moves);
            } else {
                // Retry each record separately so one bad record does not block the rest of the burst.
                // A record that still fails keeps its pending rename entry for the diff to consume.
                for (let index = 0; index < moves.length; index++) {
                    try {
                        await db.setFiles([records[index]]);
                        consumePendingRenameData([moves[index]]);
                    } catch (error: unknown) {
                        console.error('Failed to persist renamed file record:', { path: records[index].path, error });
                    }
                }
            }

            if (!featureImageBlobsMoved) {
                await clearFeatureImagesForFailedBlobMove(db, records, blobMoves);
            }

            queueContentRefresh(moves.map(move => move.file));
            scheduleDiff();
        });
    };

    const scheduleFlush = () => {
        // A diff timer armed before this burst would fire ahead of the zero-delay flush and create
        // its delete transactions first. Cancel it; the rename handler's diff reschedule replaces it.
        cancelScheduledDiff();
        if (buffer.timerId !== null) {
            return;
        }
        if (typeof window !== 'undefined') {
            // Zero delay: a folder move fires its rename events in one burst, and the flush's move
            // transactions must be created before the debounced diff (FILE_OPERATION_DELAY) deletes the
            // old-path records and their stored blobs/preview text.
            buffer.timerId = window.setTimeout(flush, 0);
            return;
        }
        flush();
    };

    const flushNow = () => {
        if (buffer.timerId !== null) {
            if (typeof window !== 'undefined') {
                window.clearTimeout(buffer.timerId);
            }
            buffer.timerId = null;
        }
        if (buffer.moves.length > 0) {
            flush();
        }
    };

    return { scheduleFlush, flushNow };
}
