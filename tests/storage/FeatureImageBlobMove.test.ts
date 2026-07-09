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
import {
    FeatureImageBlobStore,
    remapSelfReferentialFeatureImageKey,
    type FeatureImageBlobRecord
} from '../../src/storage/FeatureImageBlobStore';
import { FeatureImageCoordinator } from '../../src/storage/indexeddb/featureImageOps';
import { MockIDBDatabase } from './mockIndexedDB';

function makeRecord(key: string, content: string): FeatureImageBlobRecord {
    return { featureImageKey: key, blob: new Blob([content], { type: 'image/webp' }) };
}

function asIdb(db: MockIDBDatabase<FeatureImageBlobRecord>): IDBDatabase {
    return db as unknown as IDBDatabase;
}

describe('remapSelfReferentialFeatureImageKey', () => {
    it('rewrites only keys that point at the renamed file path', () => {
        expect(remapSelfReferentialFeatureImageKey('f:docs/a.pdf@123', 'docs/a.pdf', 'docs/b.pdf')).toBe('f:docs/b.pdf@123');
        expect(remapSelfReferentialFeatureImageKey('f:assets/cover.png@123', 'docs/a.pdf', 'docs/b.pdf')).toBeNull();
        expect(remapSelfReferentialFeatureImageKey('e:https://example.com/cover.png', 'docs/a.pdf', 'docs/b.pdf')).toBeNull();
        expect(remapSelfReferentialFeatureImageKey(null, 'docs/a.pdf', 'docs/b.pdf')).toBeNull();
    });
});

describe('FeatureImageBlobStore.moveBlobs', () => {
    it('moves independent records in one batch', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const recordB = makeRecord('key-b', 'blob-b');
        const records = new Map<string, FeatureImageBlobRecord>([
            ['notes/a.md', recordA],
            ['notes/b.md', recordB]
        ]);
        const store = new FeatureImageBlobStore(10);

        await store.moveBlobs(asIdb(new MockIDBDatabase(records)), [
            { oldPath: 'notes/a.md', newPath: 'moved/a.md' },
            { oldPath: 'notes/b.md', newPath: 'moved/b.md' }
        ]);

        expect(records.has('notes/a.md')).toBe(false);
        expect(records.has('notes/b.md')).toBe(false);
        expect(records.get('moved/a.md')).toBe(recordA);
        expect(records.get('moved/b.md')).toBe(recordB);
    });

    it('replays a chained rename in event order', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const records = new Map<string, FeatureImageBlobRecord>([['notes/a.md', recordA]]);
        const store = new FeatureImageBlobStore(10);

        await store.moveBlobs(asIdb(new MockIDBDatabase(records)), [
            { oldPath: 'notes/a.md', newPath: 'notes/b.md' },
            { oldPath: 'notes/b.md', newPath: 'notes/c.md' }
        ]);

        // The second move reads the record the first move wrote; only the final path keeps a record.
        expect(records.has('notes/a.md')).toBe(false);
        expect(records.has('notes/b.md')).toBe(false);
        expect(records.get('notes/c.md')).toBe(recordA);
    });

    it('remaps self-referential generated-thumbnail keys through a chained rename', async () => {
        const recordA = makeRecord('f:notes/a.pdf@123', 'blob-a');
        const records = new Map<string, FeatureImageBlobRecord>([['notes/a.pdf', recordA]]);
        const store = new FeatureImageBlobStore(10);

        await store.moveBlobs(asIdb(new MockIDBDatabase(records)), [
            { oldPath: 'notes/a.pdf', newPath: 'notes/b.pdf' },
            { oldPath: 'notes/b.pdf', newPath: 'notes/c.pdf' }
        ]);

        expect(records.has('notes/a.pdf')).toBe(false);
        expect(records.has('notes/b.pdf')).toBe(false);
        expect(records.get('notes/c.pdf')?.featureImageKey).toBe('f:notes/c.pdf@123');
        expect(await store.getBlob(asIdb(new MockIDBDatabase(records)), 'notes/c.pdf', 'f:notes/c.pdf@123')).toBe(recordA.blob);
    });

    it('replays a swap through a temporary name', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const recordB = makeRecord('key-b', 'blob-b');
        const records = new Map<string, FeatureImageBlobRecord>([
            ['notes/a.md', recordA],
            ['notes/b.md', recordB]
        ]);
        const store = new FeatureImageBlobStore(10);

        await store.moveBlobs(asIdb(new MockIDBDatabase(records)), [
            { oldPath: 'notes/a.md', newPath: 'notes/temp.md' },
            { oldPath: 'notes/b.md', newPath: 'notes/a.md' },
            { oldPath: 'notes/temp.md', newPath: 'notes/b.md' }
        ]);

        expect(records.get('notes/a.md')).toBe(recordB);
        expect(records.get('notes/b.md')).toBe(recordA);
        expect(records.has('notes/temp.md')).toBe(false);
    });

    it('drops the relocated cache entry when a move finds no stored record', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const records = new Map<string, FeatureImageBlobRecord>([['notes/a.md', recordA]]);
        const store = new FeatureImageBlobStore(10);
        const db = new MockIDBDatabase(records);

        // Populate the LRU at the old path, then relocate it the way beginMove does at event time.
        await store.getBlob(asIdb(db), 'notes/a.md', 'key-a');
        store.moveCacheEntry('notes/a.md', 'notes/b.md');
        // The stored record disappears before the batch runs (e.g. the status marker lied).
        records.delete('notes/a.md');

        await store.moveBlobs(asIdb(db), [{ oldPath: 'notes/a.md', newPath: 'notes/b.md' }]);

        // Without the cleanup the stale LRU entry at the new path would keep serving a blob that has
        // no stored record behind it.
        expect(records.has('notes/b.md')).toBe(false);
        expect(await store.getBlob(asIdb(db), 'notes/b.md', 'key-a')).toBeNull();
    });

    it('keeps the cache entry when a later move re-occupies a missing-record target', async () => {
        // a.md's status marker lied (no stored record) and its move targets p.md; p.md moves on,
        // then d.md re-occupies p.md with a real record in the same burst.
        const recordD = makeRecord('key-d', 'blob-d');
        const records = new Map<string, FeatureImageBlobRecord>([['notes/d.md', recordD]]);
        const store = new FeatureImageBlobStore(10);
        const db = new MockIDBDatabase(records);

        // Warm the LRU at d.md, then relocate entries the way beginMove does at event time.
        await store.getBlob(asIdb(db), 'notes/d.md', 'key-d');
        store.moveCacheEntry('notes/a.md', 'notes/p.md');
        store.moveCacheEntry('notes/p.md', 'notes/x.md');
        store.moveCacheEntry('notes/d.md', 'notes/p.md');

        await store.moveBlobs(asIdb(db), [
            { oldPath: 'notes/a.md', newPath: 'notes/p.md' },
            { oldPath: 'notes/p.md', newPath: 'notes/x.md' },
            { oldPath: 'notes/d.md', newPath: 'notes/p.md' }
        ]);

        expect(records.get('notes/p.md')).toBe(recordD);
        // Remove the stored record: a cache hit is the only way getBlob can still return the blob,
        // so this proves the missing-record cleanup for the first move spared the final entry.
        records.delete('notes/p.md');
        expect(await store.getBlob(asIdb(db), 'notes/p.md', 'key-d')).toBe(recordD.blob);
    });

    it('rolls back the whole batch when a put fails and leaves stored records in place', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const recordB = makeRecord('key-b', 'blob-b');
        const records = new Map<string, FeatureImageBlobRecord>([
            ['notes/a.md', recordA],
            ['notes/b.md', recordB]
        ]);
        const store = new FeatureImageBlobStore(10);

        await expect(
            store.moveBlobs(asIdb(new MockIDBDatabase(records, new Set(['notes/temp.md']))), [
                { oldPath: 'notes/a.md', newPath: 'notes/temp.md' },
                { oldPath: 'notes/b.md', newPath: 'notes/a.md' },
                { oldPath: 'notes/temp.md', newPath: 'notes/b.md' }
            ])
        ).rejects.toThrow();

        expect(records.get('notes/a.md')).toBe(recordA);
        expect(records.get('notes/b.md')).toBe(recordB);
        expect(records.has('notes/temp.md')).toBe(false);
    });
});

describe('FeatureImageCoordinator rename bursts', () => {
    function createCoordinator(
        records: Map<string, FeatureImageBlobRecord>,
        failPutPaths?: Set<string>
    ): {
        coordinator: FeatureImageCoordinator;
        blobs: FeatureImageBlobStore;
        db: MockIDBDatabase<FeatureImageBlobRecord>;
    } {
        const blobs = new FeatureImageBlobStore(10);
        const db = new MockIDBDatabase(records, failPutPaths);
        const coordinator = new FeatureImageCoordinator({
            getDb: () => asIdb(db),
            init: async () => void 0,
            isClosing: () => false,
            blobs
        });
        return { coordinator, blobs, db };
    }

    it('keeps the cached thumbnail available through a chained rename', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const records = new Map<string, FeatureImageBlobRecord>([['notes/a.md', recordA]]);
        const { coordinator, blobs, db } = createCoordinator(records);

        // Warm the LRU at the origin path.
        await blobs.getBlob(asIdb(db), 'notes/a.md', 'key-a');

        // Rename events arrive hop by hop; the flush then persists both moves in one batch.
        coordinator.beginMove('notes/a.md', 'notes/b.md');
        coordinator.beginMove('notes/b.md', 'notes/c.md');
        await coordinator.moveBlobs([
            { oldPath: 'notes/a.md', newPath: 'notes/b.md' },
            { oldPath: 'notes/b.md', newPath: 'notes/c.md' }
        ]);

        expect(records.get('notes/c.md')).toBe(recordA);
        expect(await coordinator.getBlob('notes/c.md', 'key-a')).toBe(recordA.blob);
    });

    it('keeps both cached thumbnails correct through a swap via a temporary name', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const recordB = makeRecord('key-b', 'blob-b');
        const records = new Map<string, FeatureImageBlobRecord>([
            ['notes/a.md', recordA],
            ['notes/b.md', recordB]
        ]);
        const { coordinator, blobs, db } = createCoordinator(records);

        await blobs.getBlob(asIdb(db), 'notes/a.md', 'key-a');
        await blobs.getBlob(asIdb(db), 'notes/b.md', 'key-b');

        coordinator.beginMove('notes/a.md', 'notes/temp.md');
        coordinator.beginMove('notes/b.md', 'notes/a.md');
        coordinator.beginMove('notes/temp.md', 'notes/b.md');
        await coordinator.moveBlobs([
            { oldPath: 'notes/a.md', newPath: 'notes/temp.md' },
            { oldPath: 'notes/b.md', newPath: 'notes/a.md' },
            { oldPath: 'notes/temp.md', newPath: 'notes/b.md' }
        ]);

        expect(records.get('notes/a.md')).toBe(recordB);
        expect(records.get('notes/b.md')).toBe(recordA);
        expect(await coordinator.getBlob('notes/a.md', 'key-b')).toBe(recordB.blob);
        expect(await coordinator.getBlob('notes/b.md', 'key-a')).toBe(recordA.blob);
    });

    it('keeps the old-path fallback alive when the batch fails', async () => {
        const recordA = makeRecord('key-a', 'blob-a');
        const records = new Map<string, FeatureImageBlobRecord>([['notes/a.md', recordA]]);
        const { coordinator } = createCoordinator(records, new Set(['notes/b.md']));

        coordinator.beginMove('notes/a.md', 'notes/b.md');
        const moved = await coordinator.moveBlobs([{ oldPath: 'notes/a.md', newPath: 'notes/b.md' }]);

        // The aborted batch leaves the record at the old path; the surviving marker serves reads at
        // the new path from the old path until the TTL prunes it.
        expect(moved).toBe(false);
        expect(records.get('notes/a.md')).toBe(recordA);
        expect(records.has('notes/b.md')).toBe(false);
        expect(await coordinator.getBlob('notes/b.md', 'key-a')).toBe(recordA.blob);
    });
});
