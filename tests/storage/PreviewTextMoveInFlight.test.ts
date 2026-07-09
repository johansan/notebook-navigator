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

import { describe, expect, it } from 'vitest';
import { IndexedDBStorage, createDefaultFileData, type FileContentChange } from '../../src/storage/IndexedDBStorage';
import { MemoryFileCache } from '../../src/storage/MemoryFileCache';
import type { PreviewTextBatchOp, PreviewTextCoordinator } from '../../src/storage/indexeddb/previewTextOps';
import { MockIDBDatabase } from './mockIndexedDB';

let storageInstanceCounter = 0;

/** Creates a storage instance backed by the mock database with an initialized memory cache. */
function createStorage(previewTexts: Map<string, string>, failPutPaths?: Set<string>): IndexedDBStorage {
    storageInstanceCounter += 1;
    const storage = new IndexedDBStorage(`test-preview-${storageInstanceCounter}`, { previewTextCacheMaxEntries: 10 });
    const cache = Reflect.get(storage, 'cache') as MemoryFileCache;
    cache.markInitialized();
    storage.init = async () => void 0;
    Reflect.set(storage, 'db', new MockIDBDatabase(previewTexts, failPutPaths));
    const previewCoordinator = Reflect.get(storage, 'previewTexts') as PreviewTextCoordinator;
    Reflect.set(previewCoordinator, 'repairPreviewStatusRecords', async () => void 0);
    return storage;
}

/** Seeds a memory record at the path with previewStatus 'has'. */
function seedRecordWithPreview(storage: IndexedDBStorage, path: string): void {
    const seeded = createDefaultFileData({ mtime: 1, path });
    seeded.previewStatus = 'has';
    storage.seedMemoryFile(path, seeded);
}

describe('IndexedDBStorage preview text moves', () => {
    it('hydrates preview text without emitting a preview status change', async () => {
        const path = 'notes/hydrate.md';
        const previewText = 'Hydrated preview text';

        const previewTexts = new Map<string, string>([[path, previewText]]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, path);

        const previewEvents: FileContentChange['changes'][] = [];
        const unsubscribe = storage.onFileContentChange(path, changes => {
            previewEvents.push(changes);
        });

        try {
            const previewCoordinator = Reflect.get(storage, 'previewTexts') as PreviewTextCoordinator;

            const previewLoadDeferred = Reflect.get(previewCoordinator, 'previewLoadDeferred') as Map<string, { resolve: () => void }>;
            const previewLoadQueue = Reflect.get(previewCoordinator, 'previewLoadQueue') as Set<string>;

            let wasResolved = false;
            previewLoadDeferred.set(path, { resolve: () => (wasResolved = true) });
            previewLoadQueue.add(path);

            const flushPreviewTextLoadQueue = Reflect.get(previewCoordinator, 'flushPreviewTextLoadQueue') as () => Promise<void>;
            await flushPreviewTextLoadQueue.call(previewCoordinator);

            expect(wasResolved).toBe(true);
            expect(storage.getFile(path)?.previewStatus).toBe('has');
            expect(storage.getCachedPreviewText(path)).toBe(previewText);
            expect(previewEvents).toEqual([{ preview: previewText }]);
        } finally {
            unsubscribe();
        }
    });

    it('emits preview status when a missing preview record downgrades status', async () => {
        const path = 'notes/missing-preview.md';

        const previewTexts = new Map<string, string>();
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, path);

        const previewEvents: FileContentChange['changes'][] = [];
        const unsubscribe = storage.onFileContentChange(path, changes => {
            previewEvents.push(changes);
        });

        try {
            const previewCoordinator = Reflect.get(storage, 'previewTexts') as PreviewTextCoordinator;

            const previewLoadDeferred = Reflect.get(previewCoordinator, 'previewLoadDeferred') as Map<string, { resolve: () => void }>;
            const previewLoadQueue = Reflect.get(previewCoordinator, 'previewLoadQueue') as Set<string>;

            let wasResolved = false;
            previewLoadDeferred.set(path, { resolve: () => (wasResolved = true) });
            previewLoadQueue.add(path);

            const flushPreviewTextLoadQueue = Reflect.get(previewCoordinator, 'flushPreviewTextLoadQueue') as () => Promise<void>;
            await flushPreviewTextLoadQueue.call(previewCoordinator);

            expect(wasResolved).toBe(true);
            expect(storage.getFile(path)?.previewStatus).toBe('unprocessed');
            expect(previewEvents).toEqual([{ preview: null, previewStatus: 'unprocessed' }]);
        } finally {
            unsubscribe();
        }
    });

    it('does not downgrade preview status while a move is in-flight', async () => {
        const oldPath = 'notes/old.md';
        const newPath = 'notes/new.md';
        const previewText = 'Moved preview text';

        const previewTexts = new Map<string, string>([[oldPath, previewText]]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, newPath);

        storage.beginPreviewTextMove(oldPath, newPath);

        const previewEvents: (string | null)[] = [];
        const unsubscribe = storage.onFileContentChange(newPath, changes => {
            if (changes.preview !== undefined) {
                previewEvents.push(changes.preview ?? null);
            }
        });

        try {
            const previewCoordinator = Reflect.get(storage, 'previewTexts') as PreviewTextCoordinator;

            const previewLoadDeferred = Reflect.get(previewCoordinator, 'previewLoadDeferred') as Map<string, { resolve: () => void }>;
            const previewLoadQueue = Reflect.get(previewCoordinator, 'previewLoadQueue') as Set<string>;

            let wasResolved = false;
            previewLoadDeferred.set(newPath, { resolve: () => (wasResolved = true) });
            previewLoadQueue.add(newPath);

            const flushPreviewTextLoadQueue = Reflect.get(previewCoordinator, 'flushPreviewTextLoadQueue') as () => Promise<void>;
            await flushPreviewTextLoadQueue.call(previewCoordinator);

            expect(wasResolved).toBe(true);
            expect(storage.getFile(newPath)?.previewStatus).toBe('has');
            expect(previewEvents).toEqual([]);

            await storage.movePreviewTexts([{ type: 'move', oldPath, newPath }]);

            expect(wasResolved).toBe(true);
            expect(storage.getCachedPreviewText(newPath)).toBe(previewText);
            expect(previewEvents).toEqual([previewText]);
            expect(previewTexts.has(oldPath)).toBe(false);
            expect(previewTexts.get(newPath)).toBe(previewText);
        } finally {
            unsubscribe();
        }
    });

    it('replays a chained rename in event order', async () => {
        const previewTexts = new Map<string, string>([['notes/a.md', 'Text A']]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, 'notes/b.md');
        seedRecordWithPreview(storage, 'notes/c.md');

        await storage.movePreviewTexts([
            { type: 'move', oldPath: 'notes/a.md', newPath: 'notes/b.md' },
            { type: 'move', oldPath: 'notes/b.md', newPath: 'notes/c.md' }
        ]);

        // The second move reads the text the first move wrote; only the final path keeps a record.
        expect(previewTexts.has('notes/a.md')).toBe(false);
        expect(previewTexts.has('notes/b.md')).toBe(false);
        expect(previewTexts.get('notes/c.md')).toBe('Text A');
        expect(storage.getCachedPreviewText('notes/c.md')).toBe('Text A');
    });

    it('replays a swap through a temporary name', async () => {
        const previewTexts = new Map<string, string>([
            ['notes/a.md', 'Text A'],
            ['notes/b.md', 'Text B']
        ]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, 'notes/a.md');
        seedRecordWithPreview(storage, 'notes/b.md');
        seedRecordWithPreview(storage, 'notes/temp.md');

        await storage.movePreviewTexts([
            { type: 'move', oldPath: 'notes/a.md', newPath: 'notes/temp.md' },
            { type: 'move', oldPath: 'notes/b.md', newPath: 'notes/a.md' },
            { type: 'move', oldPath: 'notes/temp.md', newPath: 'notes/b.md' }
        ]);

        expect(previewTexts.get('notes/a.md')).toBe('Text B');
        expect(previewTexts.get('notes/b.md')).toBe('Text A');
        expect(previewTexts.has('notes/temp.md')).toBe(false);
        expect(storage.getCachedPreviewText('notes/a.md')).toBe('Text B');
        expect(storage.getCachedPreviewText('notes/b.md')).toBe('Text A');
    });

    it('runs a vacated-path delete before a later move re-occupies the path', async () => {
        const previewTexts = new Map<string, string>([
            ['notes/a.md', 'Text A'],
            ['notes/b.md', 'Text B']
        ]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, 'notes/a.md');

        // a.md was renamed to a non-markdown extension (delete), then b.md was renamed onto the freed path.
        await storage.movePreviewTexts([
            { type: 'delete', path: 'notes/a.md' },
            { type: 'move', oldPath: 'notes/b.md', newPath: 'notes/a.md' }
        ]);

        expect(previewTexts.get('notes/a.md')).toBe('Text B');
        expect(previewTexts.has('notes/b.md')).toBe(false);
        expect(storage.getCachedPreviewText('notes/a.md')).toBe('Text B');
    });

    it('clears vacated source paths from the cache in a chained rename', async () => {
        const previewTexts = new Map<string, string>([['notes/a.md', 'Text A']]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, 'notes/a.md');
        seedRecordWithPreview(storage, 'notes/b.md');
        seedRecordWithPreview(storage, 'notes/c.md');

        const previewEvents: FileContentChange['changes'][] = [];
        const unsubscribe = storage.onFileContentChange('notes/b.md', changes => {
            previewEvents.push(changes);
        });

        try {
            await storage.movePreviewTexts([
                { type: 'move', oldPath: 'notes/a.md', newPath: 'notes/b.md' },
                { type: 'move', oldPath: 'notes/b.md', newPath: 'notes/c.md' }
            ]);

            // The intermediate hop was vacated by the second move: the text the first move wrote
            // there must not survive in the cache or emit a change event.
            expect(storage.getCachedPreviewText('notes/b.md')).toBe('');
            expect(previewEvents).toEqual([]);
            expect(storage.getCachedPreviewText('notes/c.md')).toBe('Text A');
        } finally {
            unsubscribe();
        }
    });

    it('clears the cached text at a vacated source path', async () => {
        const oldPath = 'notes/a.md';
        const newPath = 'notes/b.md';
        const previewTexts = new Map<string, string>([[oldPath, 'Text A']]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, oldPath);
        seedRecordWithPreview(storage, newPath);

        const cache = Reflect.get(storage, 'cache') as MemoryFileCache;
        cache.updateFileContent(oldPath, { previewText: 'Text A' });
        // Event-time move: copies the cached text to the new path.
        storage.beginPreviewTextMove(oldPath, newPath);

        await storage.movePreviewTexts([{ type: 'move', oldPath, newPath }]);

        expect(storage.getCachedPreviewText(newPath)).toBe('Text A');
        // The source entry must not linger in the cache until the diff removes the record.
        expect(storage.getCachedPreviewText(oldPath)).toBe('');
    });

    it('applies a later delete of an earlier move target to the cache', async () => {
        const previewTexts = new Map<string, string>([['notes/x.md', 'Text X']]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, 'notes/p.md');

        const previewEvents: FileContentChange['changes'][] = [];
        const unsubscribe = storage.onFileContentChange('notes/p.md', changes => {
            previewEvents.push(changes);
        });

        try {
            // x.md was renamed to p.md, then p.md was renamed to a non-markdown extension.
            await storage.movePreviewTexts([
                { type: 'move', oldPath: 'notes/x.md', newPath: 'notes/p.md' },
                { type: 'delete', path: 'notes/p.md' }
            ]);

            expect(previewTexts.has('notes/x.md')).toBe(false);
            expect(previewTexts.has('notes/p.md')).toBe(false);
            // The delete is the final op for the path, so the moved text must not reach the cache.
            expect(storage.getCachedPreviewText('notes/p.md')).toBe('');
            expect(previewEvents).toEqual([]);
        } finally {
            unsubscribe();
        }
    });

    it('does not cancel a preview load queued while the status repair is pending', async () => {
        const oldPath = 'notes/old.md';
        const newPath = 'notes/new.md';
        const previewTexts = new Map<string, string>([[oldPath, 'Moved preview text']]);
        const storage = createStorage(previewTexts);
        // Seed with the default 'unprocessed' status: the cached status disagrees with the moved
        // text, so the mover issues the status repair this test gates on.
        storage.seedMemoryFile(newPath, createDefaultFileData({ mtime: 1, path: newPath }));

        // Gate the status repair so the mover suspends at its await after the batch committed.
        const previewCoordinator = Reflect.get(storage, 'previewTexts') as PreviewTextCoordinator;
        let repairStarted = false;
        let releaseRepair: () => void = () => void 0;
        Reflect.set(
            previewCoordinator,
            'repairPreviewStatusRecords',
            () =>
                new Promise<void>(resolve => {
                    repairStarted = true;
                    releaseRepair = resolve;
                })
        );

        const movePromise = storage.movePreviewTexts([{ type: 'move', oldPath, newPath }]);
        await new Promise(resolve => window.setTimeout(resolve, 0));

        // The store is consistent at this point; a load queued now (for example after LRU
        // eviction of the reconciled text) is legitimate.
        const previewLoadDeferred = Reflect.get(previewCoordinator, 'previewLoadDeferred') as Map<string, { resolve: () => void }>;
        const previewLoadQueue = Reflect.get(previewCoordinator, 'previewLoadQueue') as Set<string>;
        let wasCancelled = false;
        previewLoadDeferred.set(newPath, {
            resolve: () => {
                wasCancelled = true;
            }
        });
        previewLoadQueue.add(newPath);

        releaseRepair();
        await movePromise;

        // Guards against a vacuous pass: the disagreeing cached status must have triggered the repair.
        expect(repairStarted).toBe(true);
        expect(wasCancelled).toBe(false);
        expect(previewLoadQueue.has(newPath)).toBe(true);
    });

    it('skips the status repair when the cached status is already has', async () => {
        const oldPath = 'notes/old.md';
        const newPath = 'notes/new.md';
        const previewTexts = new Map<string, string>([[oldPath, 'Moved preview text']]);
        const storage = createStorage(previewTexts);
        seedRecordWithPreview(storage, newPath);

        const previewCoordinator = Reflect.get(storage, 'previewTexts') as PreviewTextCoordinator;
        let repairCalls = 0;
        Reflect.set(previewCoordinator, 'repairPreviewStatusRecords', async () => {
            repairCalls += 1;
        });

        await storage.movePreviewTexts([{ type: 'move', oldPath, newPath }]);

        // The rename flush already persisted the record with previewStatus 'has'; the mover must
        // not open a repair transaction for it.
        expect(storage.getCachedPreviewText(newPath)).toBe('Moved preview text');
        expect(repairCalls).toBe(0);
    });

    it('keeps the move marker alive when the batch transaction fails', async () => {
        const oldPath = 'notes/old.md';
        const newPath = 'notes/new.md';
        const previewText = 'Moved preview text';

        const previewTexts = new Map<string, string>([[oldPath, previewText]]);
        const storage = createStorage(previewTexts, new Set([newPath]));
        seedRecordWithPreview(storage, newPath);

        storage.beginPreviewTextMove(oldPath, newPath);
        await storage.movePreviewTexts([{ type: 'move', oldPath, newPath }]);

        // The aborted batch leaves the text at the old path.
        expect(previewTexts.get(oldPath)).toBe(previewText);
        expect(previewTexts.has(newPath)).toBe(false);

        // The surviving marker keeps a preview load at the new path from downgrading previewStatus
        // until regeneration or the TTL prune. The load must register a deferred entry: the flush
        // skips queued paths without one before it ever reaches the move-marker guard.
        const previewCoordinator = Reflect.get(storage, 'previewTexts') as PreviewTextCoordinator;
        const previewLoadDeferred = Reflect.get(previewCoordinator, 'previewLoadDeferred') as Map<string, { resolve: () => void }>;
        const previewLoadQueue = Reflect.get(previewCoordinator, 'previewLoadQueue') as Set<string>;
        let wasResolved = false;
        previewLoadDeferred.set(newPath, { resolve: () => (wasResolved = true) });
        previewLoadQueue.add(newPath);
        const flushPreviewTextLoadQueue = Reflect.get(previewCoordinator, 'flushPreviewTextLoadQueue') as () => Promise<void>;
        await flushPreviewTextLoadQueue.call(previewCoordinator);

        expect(wasResolved).toBe(true);
        expect(storage.getFile(newPath)?.previewStatus).toBe('has');
    });

    it('leaves the cache untouched when a batch with a delete op aborts', async () => {
        const previewTexts = new Map<string, string>([
            ['notes/a.md', 'Text A'],
            ['notes/b.md', 'Text B']
        ]);
        const storage = createStorage(previewTexts, new Set(['notes/c.md']));
        seedRecordWithPreview(storage, 'notes/a.md');
        seedRecordWithPreview(storage, 'notes/b.md');

        const cache = Reflect.get(storage, 'cache') as MemoryFileCache;
        cache.updateFileContent('notes/a.md', { previewText: 'Text A' });

        await storage.movePreviewTexts([
            { type: 'delete', path: 'notes/a.md' },
            { type: 'move', oldPath: 'notes/b.md', newPath: 'notes/c.md' }
        ]);

        // The aborted transaction rolled the store back; the delete op's cache clear must not run,
        // or the cache would show no text for a path whose stored text survived.
        expect(previewTexts.get('notes/a.md')).toBe('Text A');
        expect(previewTexts.get('notes/b.md')).toBe('Text B');
        expect(storage.getCachedPreviewText('notes/a.md')).toBe('Text A');
    });

    it('completes a long run of delete ops', async () => {
        // A run of delete ops is issued iteratively; a recursive replay would exhaust the call
        // stack on bursts of this size (markdown to non-markdown renames only produce delete ops).
        const previewTexts = new Map<string, string>();
        const ops: PreviewTextBatchOp[] = [];
        for (let index = 0; index < 50000; index++) {
            const path = `notes/file-${index}.md`;
            previewTexts.set(path, `Text ${index}`);
            ops.push({ type: 'delete', path });
        }
        const storage = createStorage(previewTexts);

        await storage.movePreviewTexts(ops);

        expect(previewTexts.size).toBe(0);
    });

    it('rolls back the whole batch when a put fails and resolves without throwing', async () => {
        const previewTexts = new Map<string, string>([
            ['notes/a.md', 'Text A'],
            ['notes/b.md', 'Text B']
        ]);
        const storage = createStorage(previewTexts, new Set(['notes/temp.md']));
        seedRecordWithPreview(storage, 'notes/a.md');
        seedRecordWithPreview(storage, 'notes/b.md');

        await storage.movePreviewTexts([
            { type: 'move', oldPath: 'notes/a.md', newPath: 'notes/temp.md' },
            { type: 'move', oldPath: 'notes/b.md', newPath: 'notes/a.md' },
            { type: 'move', oldPath: 'notes/temp.md', newPath: 'notes/b.md' }
        ]);

        // The aborted transaction leaves the store untouched; regeneration heals after the diff.
        expect(previewTexts.get('notes/a.md')).toBe('Text A');
        expect(previewTexts.get('notes/b.md')).toBe('Text B');
        expect(previewTexts.has('notes/temp.md')).toBe(false);
    });
});
