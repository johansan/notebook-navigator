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
import { TFile } from 'obsidian';
import {
    createRenameFlushController,
    excludeReoccupiedRenameTargets,
    type PendingRenameFlushBuffer,
    type PendingRenameMove,
    type RenameFlushStore
} from '../../src/context/storage/renameFlush';
import { createDefaultFileData, type FileData, type PreviewTextBatchOp } from '../../src/storage/IndexedDBStorage';

function makeMove(
    oldPath: string,
    newPath: string,
    options?: { wasMarkdown?: boolean; isMarkdown?: boolean; hasStoredBlob?: boolean; mtime?: number }
): PendingRenameMove {
    const file = new TFile(newPath);
    file.stat.mtime = options?.mtime ?? 100;
    const seeded = createDefaultFileData({ mtime: 1, path: newPath });
    return {
        file,
        oldPath,
        newPath,
        seeded,
        wasMarkdown: options?.wasMarkdown ?? true,
        isMarkdown: options?.isMarkdown ?? true,
        hasStoredBlob: options?.hasStoredBlob ?? false
    };
}

interface StoreCalls {
    seeded: { path: string; mtime: number }[];
    setFiles: { records: { path: string; data: FileData }[] }[];
    blobMoves: { oldPath: string; newPath: string }[][];
    previewOps: PreviewTextBatchOp[][];
}

function createFakeStore(overrides?: Partial<RenameFlushStore>): { store: RenameFlushStore; calls: StoreCalls } {
    const calls: StoreCalls = { seeded: [], setFiles: [], blobMoves: [], previewOps: [] };
    const store: RenameFlushStore = {
        seedMemoryFile: (path, data) => {
            calls.seeded.push({ path, mtime: data.mtime });
        },
        setFiles: async records => {
            calls.setFiles.push({ records });
        },
        moveFeatureImageBlobs: async moves => {
            calls.blobMoves.push(moves);
            return true;
        },
        movePreviewTexts: async ops => {
            calls.previewOps.push(ops);
        },
        ...overrides
    };
    return { store, calls };
}

function createController(params?: {
    store?: RenameFlushStore;
    buffer?: PendingRenameFlushBuffer;
    pendingRenameData?: Map<string, FileData>;
    isStopped?: () => boolean;
}): {
    controller: ReturnType<typeof createRenameFlushController>;
    buffer: PendingRenameFlushBuffer;
    pendingRenameData: Map<string, FileData>;
    cancelScheduledDiff: ReturnType<typeof vi.fn>;
    queueContentRefresh: ReturnType<typeof vi.fn>;
    scheduleDiff: ReturnType<typeof vi.fn>;
} {
    const buffer = params?.buffer ?? { moves: [], timerId: null };
    const pendingRenameData = params?.pendingRenameData ?? new Map<string, FileData>();
    const cancelScheduledDiff = vi.fn();
    const queueContentRefresh = vi.fn();
    const scheduleDiff = vi.fn();
    const controller = createRenameFlushController({
        buffer,
        pendingRenameData,
        isStopped: params?.isStopped ?? (() => false),
        getStore: () => params?.store ?? createFakeStore().store,
        cancelScheduledDiff,
        queueContentRefresh,
        scheduleDiff
    });
    return { controller, buffer, pendingRenameData, cancelScheduledDiff, queueContentRefresh, scheduleDiff };
}

/** Waits for the flush's async action to settle (it never spans more than a few microtask hops). */
async function settle(): Promise<void> {
    await new Promise(resolve => window.setTimeout(resolve, 0));
}

describe('createRenameFlushController', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('flushes a rename burst as one batch per store in event order', async () => {
        const { store, calls } = createFakeStore();
        const moveA = makeMove('old/a.md', 'new/a.md', { hasStoredBlob: true, mtime: 111 });
        const moveB = makeMove('old/b.md', 'new/b.md', { mtime: 222 });
        const { controller, buffer, pendingRenameData, queueContentRefresh, scheduleDiff } = createController({ store });
        buffer.moves.push(moveA, moveB);
        pendingRenameData.set(moveA.newPath, moveA.seeded);
        pendingRenameData.set(moveB.newPath, moveB.seeded);

        controller.scheduleFlush();
        await settle();

        expect(buffer.moves).toEqual([]);
        expect(calls.seeded).toEqual([
            { path: 'new/a.md', mtime: 111 },
            { path: 'new/b.md', mtime: 222 }
        ]);
        expect(calls.setFiles).toHaveLength(1);
        expect(calls.setFiles[0].records.map(record => record.path)).toEqual(['new/a.md', 'new/b.md']);
        expect(calls.setFiles[0].records.map(record => record.data.mtime)).toEqual([111, 222]);
        expect(calls.blobMoves).toEqual([[{ oldPath: 'old/a.md', newPath: 'new/a.md' }]]);
        expect(calls.previewOps).toEqual([
            [
                { type: 'move', oldPath: 'old/a.md', newPath: 'new/a.md' },
                { type: 'move', oldPath: 'old/b.md', newPath: 'new/b.md' }
            ]
        ]);
        expect(queueContentRefresh).toHaveBeenCalledExactlyOnceWith([moveA.file, moveB.file]);
        expect(scheduleDiff).toHaveBeenCalledOnce();
        expect(pendingRenameData.size).toBe(0);
    });

    it('skips the memory re-seed for an mtime-preserving rename and persists the seeded record as-is', async () => {
        const { store, calls } = createFakeStore();
        const preserved = makeMove('old/a.md', 'new/a.md', { mtime: 1 });
        const restamped = makeMove('old/b.md', 'new/b.md', { mtime: 222 });
        const { controller, buffer } = createController({ store });
        buffer.moves.push(preserved, restamped);

        controller.scheduleFlush();
        await settle();

        // The event-time seed already mirrors an mtime-preserving rename; only the re-stamped
        // record refreshes the memory mirror.
        expect(calls.seeded).toEqual([{ path: 'new/b.md', mtime: 222 }]);
        expect(calls.setFiles[0].records[0].data).toBe(preserved.seeded);
        expect(calls.setFiles[0].records.map(record => record.data.mtime)).toEqual([1, 222]);
    });

    it('maps a markdown to non-markdown rename to a preview delete op', async () => {
        const { store, calls } = createFakeStore();
        const toText = makeMove('notes/a.md', 'notes/a.txt', { isMarkdown: false });
        const image = makeMove('img/a.png', 'img/b.png', { wasMarkdown: false, isMarkdown: false, hasStoredBlob: true });
        const { controller, buffer } = createController({ store });
        buffer.moves.push(toText, image);

        controller.scheduleFlush();
        await settle();

        expect(calls.previewOps).toEqual([[{ type: 'delete', path: 'notes/a.md' }]]);
        expect(calls.blobMoves).toEqual([[{ oldPath: 'img/a.png', newPath: 'img/b.png' }]]);
    });

    it('cancels an armed diff timer when scheduling a flush', () => {
        const { controller, cancelScheduledDiff } = createController();
        controller.scheduleFlush();
        expect(cancelScheduledDiff).toHaveBeenCalledOnce();
    });

    it('starts every store batch before the record persist settles', async () => {
        let resolvePersist: () => void = () => void 0;
        const { store, calls } = createFakeStore({
            setFiles: async () => {
                await new Promise<void>(resolve => {
                    resolvePersist = resolve;
                });
            }
        });
        const { controller, buffer, queueContentRefresh } = createController({ store });
        buffer.moves.push(makeMove('old/a.md', 'new/a.md', { hasStoredBlob: true }));

        controller.scheduleFlush();
        // Let the zero-delay flush timer fire; the persist deferred is still unresolved.
        await settle();

        // Both movers must have their batches (and therefore their transactions) created while the
        // record persist is still pending, so a diff cannot slot its transactions between them.
        expect(calls.blobMoves).toHaveLength(1);
        expect(calls.previewOps).toHaveLength(1);
        expect(queueContentRefresh).not.toHaveBeenCalled();

        resolvePersist();
        await settle();
        expect(queueContentRefresh).toHaveBeenCalledOnce();
    });

    it('marks renamed feature images unprocessed when the blob move batch fails', async () => {
        const { store, calls } = createFakeStore();
        store.moveFeatureImageBlobs = async moves => {
            calls.blobMoves.push(moves);
            return false;
        };
        const move = makeMove('old/a.pdf', 'new/a.pdf', { wasMarkdown: false, isMarkdown: false, hasStoredBlob: true, mtime: 1 });
        move.seeded.featureImageStatus = 'has';
        move.seeded.featureImageKey = 'f:new/a.pdf@1';
        move.seeded.fileThumbnailsMtime = 1;
        const { controller, buffer, queueContentRefresh } = createController({ store });
        buffer.moves.push(move);

        controller.scheduleFlush();
        await settle();

        expect(calls.blobMoves).toEqual([[{ oldPath: 'old/a.pdf', newPath: 'new/a.pdf' }]]);
        expect(calls.setFiles).toHaveLength(2);
        expect(calls.setFiles[0].records[0]).toMatchObject({
            path: 'new/a.pdf',
            data: {
                featureImageKey: 'f:new/a.pdf@1',
                featureImageStatus: 'has'
            }
        });
        expect(calls.setFiles[1].records).toEqual([
            {
                path: 'new/a.pdf',
                data: {
                    ...move.seeded,
                    featureImage: null,
                    featureImageKey: null,
                    featureImageStatus: 'unprocessed'
                }
            }
        ]);
        expect(calls.seeded).toEqual([{ path: 'new/a.pdf', mtime: 1 }]);
        expect(queueContentRefresh).toHaveBeenCalledExactlyOnceWith([move.file]);
    });

    it('keeps a pending rename entry that a later rename replaced', async () => {
        const { store } = createFakeStore();
        const move = makeMove('old/a.md', 'new/a.md');
        const replacement = createDefaultFileData({ mtime: 2, path: 'new/a.md' });
        const { controller, buffer, pendingRenameData } = createController({ store });
        buffer.moves.push(move);
        // A later rename to the same path re-added its own snapshot before this flush ran.
        pendingRenameData.set(move.newPath, replacement);

        controller.scheduleFlush();
        await settle();

        expect(pendingRenameData.get(move.newPath)).toBe(replacement);
    });

    it('drops buffered moves and consumes their pending entries during a stopped window', async () => {
        const { store, calls } = createFakeStore();
        const move = makeMove('old/a.md', 'new/a.md');
        const { controller, buffer, pendingRenameData, queueContentRefresh, scheduleDiff } = createController({
            store,
            isStopped: () => true
        });
        buffer.moves.push(move);
        pendingRenameData.set(move.newPath, move.seeded);

        controller.scheduleFlush();
        await settle();

        expect(buffer.moves).toEqual([]);
        expect(pendingRenameData.size).toBe(0);
        expect(calls.setFiles).toEqual([]);
        expect(calls.blobMoves).toEqual([]);
        expect(calls.previewOps).toEqual([]);
        expect(queueContentRefresh).not.toHaveBeenCalled();
        expect(scheduleDiff).not.toHaveBeenCalled();
    });

    it('retries records per file when the batch persist fails and keeps entries for records that still fail', async () => {
        const failingPath = 'new/b.md';
        const setFilesCalls: { paths: string[] }[] = [];
        const { store } = createFakeStore({
            setFiles: async records => {
                setFilesCalls.push({ paths: records.map(record => record.path) });
                if (records.length > 1 || records.some(record => record.path === failingPath)) {
                    throw new Error('Simulated persist failure');
                }
            }
        });
        const moveA = makeMove('old/a.md', 'new/a.md');
        const moveB = makeMove('old/b.md', failingPath);
        const { controller, buffer, pendingRenameData, queueContentRefresh, scheduleDiff } = createController({ store });
        buffer.moves.push(moveA, moveB);
        pendingRenameData.set(moveA.newPath, moveA.seeded);
        pendingRenameData.set(moveB.newPath, moveB.seeded);

        controller.scheduleFlush();
        await settle();

        expect(setFilesCalls).toEqual([{ paths: ['new/a.md', 'new/b.md'] }, { paths: ['new/a.md'] }, { paths: ['new/b.md'] }]);
        expect(pendingRenameData.has(moveA.newPath)).toBe(false);
        // The failed record keeps its pending entry for the diff to consume.
        expect(pendingRenameData.get(moveB.newPath)).toBe(moveB.seeded);
        expect(queueContentRefresh).toHaveBeenCalledOnce();
        expect(scheduleDiff).toHaveBeenCalledOnce();
    });

    it('arms a single zero-delay timer per burst', () => {
        const setTimeoutSpy = vi.fn().mockReturnValue(42);
        const clearTimeoutSpy = vi.fn();
        vi.stubGlobal('window', { setTimeout: setTimeoutSpy, clearTimeout: clearTimeoutSpy });

        const { controller, buffer } = createController();
        buffer.moves.push(makeMove('old/a.md', 'new/a.md'));
        controller.scheduleFlush();
        controller.scheduleFlush();

        expect(setTimeoutSpy).toHaveBeenCalledExactlyOnceWith(expect.any(Function), 0);
        expect(buffer.timerId).toBe(42);
    });

    it('flushNow clears an armed flush timer and flushes buffered moves', () => {
        const setTimeoutSpy = vi.fn().mockReturnValue(42);
        const clearTimeoutSpy = vi.fn();
        vi.stubGlobal('window', { setTimeout: setTimeoutSpy, clearTimeout: clearTimeoutSpy });

        const { store, calls } = createFakeStore();
        const { controller, buffer } = createController({ store });
        buffer.moves.push(makeMove('old/a.md', 'new/a.md'));
        controller.scheduleFlush();
        expect(buffer.timerId).toBe(42);

        // `flushNow` runs the flush synchronously; the store batches start before it returns.
        controller.flushNow();

        expect(clearTimeoutSpy).toHaveBeenCalledExactlyOnceWith(42);
        expect(buffer.timerId).toBeNull();
        expect(buffer.moves).toEqual([]);
        expect(calls.setFiles).toHaveLength(1);
    });

    it('flushNow with an empty buffer does nothing', () => {
        const { store, calls } = createFakeStore();
        const { controller } = createController({ store });
        controller.flushNow();
        expect(calls.setFiles).toEqual([]);
    });
});

describe('excludeReoccupiedRenameTargets', () => {
    const emptyBuffer = (): PendingRenameFlushBuffer => ({ moves: [], timerId: null });

    it('keeps every path when no rename evidence exists', () => {
        const paths = ['notes/a.md', 'notes/b.md'];
        const result = excludeReoccupiedRenameTargets({
            paths,
            buffer: emptyBuffer(),
            pendingRenameData: new Map(),
            isPathInVault: () => true
        });
        expect(result).toBe(paths);
    });

    it('skips a removal for a path with a pending rename entry that exists in the vault', () => {
        const pendingRenameData = new Map([['notes/z.md', createDefaultFileData({ mtime: 1, path: 'notes/z.md' })]]);
        const result = excludeReoccupiedRenameTargets({
            paths: ['notes/z.md', 'notes/gone.md'],
            buffer: emptyBuffer(),
            pendingRenameData,
            isPathInVault: path => path === 'notes/z.md'
        });
        expect(result).toEqual(['notes/gone.md']);
    });

    it('skips a removal for a buffered move target that exists in the vault', () => {
        const buffer = emptyBuffer();
        buffer.moves.push(makeMove('notes/x.md', 'notes/z.md'));
        const result = excludeReoccupiedRenameTargets({
            paths: ['notes/z.md', 'notes/gone.md'],
            buffer,
            pendingRenameData: new Map(),
            isPathInVault: path => path === 'notes/z.md'
        });
        expect(result).toEqual(['notes/gone.md']);
    });

    it('keeps a rename target whose file is gone from the vault again', () => {
        const pendingRenameData = new Map([['notes/z.md', createDefaultFileData({ mtime: 1, path: 'notes/z.md' })]]);
        const result = excludeReoccupiedRenameTargets({
            paths: ['notes/z.md'],
            buffer: emptyBuffer(),
            pendingRenameData,
            isPathInVault: () => false
        });
        expect(result).toEqual(['notes/z.md']);
    });
});
