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
import { IndexedDBStorage, createDefaultFileData } from '../../src/storage/IndexedDBStorage';
import { FeatureImageBlobStore } from '../../src/storage/FeatureImageBlobStore';
import { MemoryFileCache } from '../../src/storage/MemoryFileCache';
import { FeatureImageCoordinator } from '../../src/storage/indexeddb/featureImageOps';

class TestFeatureImageBlobStore extends FeatureImageBlobStore {
    public readonly reads: Array<{ path: string; expectedKey: string }> = [];
    public readonly cacheMoves: Array<{ oldPath: string; newPath: string }> = [];
    private readonly responses = new Map<string, Blob | null>();

    setResponse(path: string, blob: Blob | null): void {
        this.responses.set(path, blob);
    }

    override getBlob(_db: IDBDatabase, path: string, expectedKey: string): Promise<Blob | null> {
        this.reads.push({ path, expectedKey });
        return Promise.resolve(this.responses.get(path) ?? null);
    }

    override moveCacheEntry(oldPath: string, newPath: string): void {
        this.cacheMoves.push({ oldPath, newPath });
    }
}

describe('IndexedDBStorage feature image moves', () => {
    it('falls back to the old path while a blob move is in-flight', async () => {
        const oldPath = 'notes/old.md';
        const newPath = 'notes/new.md';
        const expectedKey = 'f:images/cover.png@123';
        const blob = new Blob(['thumbnail']);

        const storage = new IndexedDBStorage('test-feature-image-moves');
        const cache = Reflect.get(storage, 'cache') as MemoryFileCache;
        cache.markInitialized();

        const seeded = createDefaultFileData({ mtime: 1, path: newPath });
        seeded.featureImageStatus = 'has';
        seeded.featureImageKey = expectedKey;
        storage.seedMemoryFile(newPath, seeded);

        const featureImageBlobs = new TestFeatureImageBlobStore(10);
        featureImageBlobs.setResponse(newPath, null);
        featureImageBlobs.setResponse(oldPath, blob);

        storage.init = async () => void 0;
        Reflect.set(storage, 'db', {} as IDBDatabase);
        Reflect.set(
            storage,
            'featureImages',
            new FeatureImageCoordinator({
                getDb: () => Reflect.get(storage, 'db') as IDBDatabase,
                init: () => storage.init(),
                isClosing: () => false,
                blobs: featureImageBlobs
            })
        );

        storage.beginFeatureImageBlobMove(oldPath, newPath);

        expect(await storage.getFeatureImageBlob(newPath, expectedKey)).toBe(blob);
        expect(featureImageBlobs.reads).toEqual([
            { path: newPath, expectedKey },
            { path: oldPath, expectedKey }
        ]);
        expect(featureImageBlobs.cacheMoves).toEqual([{ oldPath, newPath }]);
    });

    it('falls back to the old self-referential key after a generated-thumbnail move', async () => {
        const oldPath = 'docs/old.pdf';
        const newPath = 'docs/new.pdf';
        const oldKey = `f:${oldPath}@123`;
        const newKey = `f:${newPath}@123`;
        const blob = new Blob(['thumbnail']);

        const storage = new IndexedDBStorage('test-feature-image-self-reference-moves');
        const cache = Reflect.get(storage, 'cache') as MemoryFileCache;
        cache.markInitialized();

        const seeded = createDefaultFileData({ mtime: 1, path: newPath });
        seeded.featureImageStatus = 'has';
        seeded.featureImageKey = newKey;
        storage.seedMemoryFile(newPath, seeded);

        const featureImageBlobs = new TestFeatureImageBlobStore(10);
        featureImageBlobs.setResponse(newPath, null);
        featureImageBlobs.setResponse(oldPath, blob);

        storage.init = async () => void 0;
        Reflect.set(storage, 'db', {} as IDBDatabase);
        Reflect.set(
            storage,
            'featureImages',
            new FeatureImageCoordinator({
                getDb: () => Reflect.get(storage, 'db') as IDBDatabase,
                init: () => storage.init(),
                isClosing: () => false,
                blobs: featureImageBlobs
            })
        );

        storage.beginFeatureImageBlobMove(oldPath, newPath);

        expect(await storage.getFeatureImageBlob(newPath, newKey)).toBe(blob);
        expect(featureImageBlobs.reads).toEqual([
            { path: newPath, expectedKey: newKey },
            { path: oldPath, expectedKey: oldKey }
        ]);
    });

    it('follows chained generated-thumbnail moves before the blob store batch lands', async () => {
        const oldPath = 'docs/old.pdf';
        const middlePath = 'docs/mid.pdf';
        const newPath = 'docs/new.pdf';
        const oldKey = `f:${oldPath}@123`;
        const middleKey = `f:${middlePath}@123`;
        const newKey = `f:${newPath}@123`;
        const blob = new Blob(['thumbnail']);

        const storage = new IndexedDBStorage('test-feature-image-chained-self-reference-moves');
        const cache = Reflect.get(storage, 'cache') as MemoryFileCache;
        cache.markInitialized();

        const seeded = createDefaultFileData({ mtime: 1, path: newPath });
        seeded.featureImageStatus = 'has';
        seeded.featureImageKey = newKey;
        storage.seedMemoryFile(newPath, seeded);

        const featureImageBlobs = new TestFeatureImageBlobStore(10);
        featureImageBlobs.setResponse(newPath, null);
        featureImageBlobs.setResponse(middlePath, null);
        featureImageBlobs.setResponse(oldPath, blob);

        storage.init = async () => void 0;
        Reflect.set(storage, 'db', {} as IDBDatabase);
        Reflect.set(
            storage,
            'featureImages',
            new FeatureImageCoordinator({
                getDb: () => Reflect.get(storage, 'db') as IDBDatabase,
                init: () => storage.init(),
                isClosing: () => false,
                blobs: featureImageBlobs
            })
        );

        storage.beginFeatureImageBlobMove(oldPath, middlePath);
        storage.beginFeatureImageBlobMove(middlePath, newPath);

        expect(await storage.getFeatureImageBlob(newPath, newKey)).toBe(blob);
        expect(featureImageBlobs.reads).toEqual([
            { path: newPath, expectedKey: newKey },
            { path: middlePath, expectedKey: middleKey },
            { path: oldPath, expectedKey: oldKey }
        ]);
    });
});
