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
import type { TagTreeNode } from '../../src/types/storage';
import { compareFileItemTagsByNavigationOrder, type FileItemPillOrderModel } from '../../src/utils/fileItemPillOrder';

function createTag(path: string, children: TagTreeNode[] = []): TagTreeNode {
    return {
        name: path.slice(path.lastIndexOf('/') + 1),
        path,
        displayPath: path,
        notesWithTag: new Set<string>(),
        children: new Map(children.map(child => [child.path, child]))
    };
}

describe('compareFileItemTagsByNavigationOrder', () => {
    const projects = createTag('projects', [createTag('projects/alpha'), createTag('projects/beta'), createTag('projects/gamma')]);
    const orderModel: FileItemPillOrderModel = {
        tagTree: new Map([['projects', projects]]),
        rootTagOrderMap: new Map(),
        tagComparator: undefined,
        rootPropertyNavigationOrderMap: new Map()
    };
    const sortTags = (tags: string[], childOrder?: Record<string, string[]>) =>
        tags.slice().sort((leftTag, rightTag) => compareFileItemTagsByNavigationOrder({ leftTag, rightTag, orderModel, childOrder }));

    it('orders nested tag pills by the parent manual order, with unlisted tags after the listed ones', () => {
        expect(sortTags(['projects/alpha', 'projects/beta', 'projects/gamma'], { projects: ['gamma', 'alpha'] })).toEqual([
            'projects/gamma',
            'projects/alpha',
            'projects/beta'
        ]);
    });

    it('keeps the alphabetical order without a manual order', () => {
        expect(sortTags(['projects/gamma', 'projects/alpha', 'projects/beta'])).toEqual([
            'projects/alpha',
            'projects/beta',
            'projects/gamma'
        ]);
    });
});
