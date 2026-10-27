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
import type { CollisionDetection } from '@dnd-kit/core';
import { typeFilteredCollisionDetection } from '../../src/utils/dndConfig';

type CollisionArgs = Parameters<CollisionDetection>[0];

interface TestDroppable {
    id: string;
    data: Record<string, unknown>;
    top: number;
    height: number;
}

function createRect(top: number, height: number) {
    return { top, height, left: 0, width: 200, right: 200, bottom: top + height };
}

function detect(active: TestDroppable, droppables: TestDroppable[], draggedTop: number): string[] {
    const droppableRects = new Map(droppables.map(entry => [entry.id, createRect(entry.top, entry.height)]));
    const args = {
        active: { id: active.id, data: { current: active.data }, rect: { current: { initial: null, translated: null } } },
        collisionRect: createRect(draggedTop, active.height),
        droppableRects,
        droppableContainers: droppables.map(entry => ({ id: entry.id, data: { current: entry.data } })),
        pointerCoordinates: null
    } as unknown as CollisionArgs;
    return typeFilteredCollisionDetection(args).map(collision => String(collision.id));
}

describe('typeFilteredCollisionDetection', () => {
    // Root folders: scripts, src (expanded, 20 rows tall), tests; src/hooks is one of src's children
    const scripts: TestDroppable = { id: 'scripts', data: { type: 'folder', parentPath: '/' }, top: 0, height: 28 };
    const src: TestDroppable = { id: 'src', data: { type: 'folder', parentPath: '/' }, top: 28, height: 560 };
    const tests: TestDroppable = { id: 'tests', data: { type: 'folder', parentPath: '/' }, top: 588, height: 28 };
    const hooks: TestDroppable = { id: 'src/hooks', data: { type: 'folder', parentPath: 'src' }, top: 56, height: 28 };

    it('targets the row of an expanded sibling instead of the middle of its subfolders', () => {
        const collisions = detect(tests, [scripts, src, tests, hooks], 30);

        expect(collisions[0]).toBe('src');
    });

    it('targets an expanded sibling while the dragged row is over the lower part of its subfolders', () => {
        const collisions = detect(scripts, [scripts, src, tests, hooks], 320);

        expect(collisions[0]).toBe('src');
    });

    it('only matches folders with the same parent', () => {
        const collisions = detect(hooks, [scripts, src, tests, hooks], 0);

        expect(collisions).toEqual(['src/hooks']);
    });

    it('keeps center-based targeting for items without a parent path', () => {
        const tagA: TestDroppable = { id: 'tag-a', data: { type: 'tag' }, top: 0, height: 28 };
        const tagB: TestDroppable = { id: 'tag-b', data: { type: 'tag' }, top: 28, height: 28 };
        const collisions = detect(tagA, [tagA, tagB, scripts], 26);

        expect(collisions[0]).toBe('tag-b');
        expect(collisions).not.toContain('scripts');
    });
});
