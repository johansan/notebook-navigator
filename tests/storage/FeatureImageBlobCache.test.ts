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
import { FeatureImageBlobCache } from '../../src/storage/FeatureImageBlobCache';

describe('FeatureImageBlobCache', () => {
    it('evicts least recently used entries by count', () => {
        const cache = new FeatureImageBlobCache(2);
        const blobA = new Blob(['a']);
        const blobB = new Blob(['b']);
        const blobC = new Blob(['c']);

        // Fill the cache to its maximum entry count.
        cache.set('a', { featureImageKey: 'k1', blob: blobA });
        cache.set('b', { featureImageKey: 'k2', blob: blobB });
        // Touch a so b is least recent.
        expect(cache.get('a', 'k1')).toBe(blobA);

        // Insert a third entry and expect the least-recent entry to be evicted.
        cache.set('c', { featureImageKey: 'k3', blob: blobC });

        expect(cache.get('b', 'k2')).toBeNull();
        expect(cache.get('a', 'k1')).toBe(blobA);
        expect(cache.get('c', 'k3')).toBe(blobC);
    });

    it('returns null and removes entries when key mismatches', () => {
        const cache = new FeatureImageBlobCache(1);
        const blob = new Blob(['x']);

        cache.set('path', { featureImageKey: 'key-1', blob });

        // Key mismatch returns null and removes the stale entry.
        expect(cache.get('path', 'key-2')).toBeNull();
        expect(cache.getEntryCount()).toBe(0);
    });

    it('can update the cached key while moving an entry', () => {
        const cache = new FeatureImageBlobCache(1);
        const blob = new Blob(['x']);

        cache.set('docs/old.pdf', { featureImageKey: 'f:docs/old.pdf@123', blob });
        cache.move('docs/old.pdf', 'docs/new.pdf', 'f:docs/new.pdf@123');

        expect(cache.get('docs/old.pdf', 'f:docs/old.pdf@123')).toBeNull();
        expect(cache.get('docs/new.pdf', 'f:docs/new.pdf@123')).toBe(blob);
    });
});
