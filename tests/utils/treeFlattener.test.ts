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
import { TFolder } from 'obsidian';
import type { TagTreeNode } from '../../src/types/storage';
import {
    buildVisibleFolderTraversalState,
    compareByManualList,
    flattenFolderTree,
    flattenTagTree,
    getChildOrder,
    getTagChildName,
    mergeDisplayedOrder,
    orderByManualList,
    sortFolderSiblings
} from '../../src/utils/treeFlattener';

function createTag(path: string, children: TagTreeNode[] = []): TagTreeNode {
    return {
        name: path.slice(path.lastIndexOf('/') + 1),
        path,
        displayPath: path,
        notesWithTag: new Set<string>(),
        children: new Map(children.map(child => [child.path, child]))
    };
}

function getFolderName(path: string): string {
    if (path === '/') {
        return '/';
    }
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
}

function createFolder(path: string, children: TFolder[] = []): TFolder {
    const folder = new TFolder();
    Reflect.set(folder, 'path', path);
    Reflect.set(folder, 'name', getFolderName(path));
    Reflect.set(folder, 'children', children);
    return folder;
}

describe('treeFlattener flattenFolderTree', () => {
    it('sorts folders by folder name when no custom sort name resolver is provided', () => {
        const alpha = createFolder('alpha');
        const zeta = createFolder('zeta');
        const root = createFolder('/', [zeta, alpha]);
        const expandedFolders = new Set<string>(['/']);

        const items = flattenFolderTree([root], expandedFolders, [], 0, new Set(), {
            defaultSortOrder: 'alpha-asc'
        });

        const childPaths = items.filter(item => item.level === 1).map(item => item.data.path);
        expect(childPaths).toEqual(['alpha', 'zeta']);
    });

    it('sorts folders by provided sort names when a custom resolver is provided', () => {
        const alpha = createFolder('alpha');
        const zeta = createFolder('zeta');
        const root = createFolder('/', [zeta, alpha]);
        const expandedFolders = new Set<string>(['/']);

        const sortNames = new Map<string, string>([
            ['alpha', 'Zulu'],
            ['zeta', 'Alpha']
        ]);

        const items = flattenFolderTree([root], expandedFolders, [], 0, new Set(), {
            defaultSortOrder: 'alpha-asc',
            getFolderSortName: folder => sortNames.get(folder.path) ?? folder.name
        });

        const childPaths = items.filter(item => item.level === 1).map(item => item.data.path);
        expect(childPaths).toEqual(['zeta', 'alpha']);
    });

    it('marks folders as excluded when custom exclusion resolver returns true', () => {
        const visible = createFolder('visible');
        const archived = createFolder('archived');
        const root = createFolder('/', [visible, archived]);
        const expandedFolders = new Set<string>(['/']);

        const items = flattenFolderTree([root], expandedFolders, [], 0, new Set(), {
            defaultSortOrder: 'alpha-asc',
            isFolderExcluded: folder => folder.path === 'archived'
        });

        const archivedItem = items.find(item => item.data.path === 'archived');
        const visibleItem = items.find(item => item.data.path === 'visible');
        expect(archivedItem?.isExcluded).toBe(true);
        expect(visibleItem?.isExcluded).toBeUndefined();
    });

    it('builds sibling groups without excluded folders', () => {
        const childA = createFolder('Projects/A');
        const childB = createFolder('Projects/B');
        const archived = createFolder('Projects/Archived');
        const projects = createFolder('Projects', [childB, archived, childA]);
        const root = createFolder('/', [projects]);

        const traversalState = buildVisibleFolderTraversalState({
            rootFolders: [root],
            excludePatterns: [],
            defaultSortOrder: 'alpha-asc',
            isFolderExcluded: folder => folder.path === 'Projects/Archived'
        });

        expect(traversalState.siblingPathsByParent.get('Projects')).toEqual(['Projects/A', 'Projects/B']);
    });

    it('builds sibling groups using custom folder sort names', () => {
        const bravo = createFolder('Projects/bravo');
        const alpha = createFolder('Projects/alpha');
        const projects = createFolder('Projects', [alpha, bravo]);
        const root = createFolder('/', [projects]);

        const sortNames = new Map<string, string>([
            ['Projects/alpha', 'Zulu'],
            ['Projects/bravo', 'Alpha']
        ]);

        const traversalState = buildVisibleFolderTraversalState({
            rootFolders: [root],
            excludePatterns: [],
            defaultSortOrder: 'alpha-asc',
            getFolderSortName: folder => sortNames.get(folder.path) ?? folder.name
        });

        expect(traversalState.siblingPathsByParent.get('Projects')).toEqual(['Projects/bravo', 'Projects/alpha']);
    });

    it('does not mutate caller-owned root folder arrays when sorting root siblings', () => {
        const bravo = createFolder('bravo');
        const alpha = createFolder('alpha');
        const rootFolders = [bravo, alpha];

        const traversalState = buildVisibleFolderTraversalState({
            rootFolders,
            excludePatterns: [],
            defaultSortOrder: 'alpha-asc'
        });

        expect(traversalState.siblingPathsByParent.get('/')).toEqual(['alpha', 'bravo']);
        expect(rootFolders.map(folder => folder.path)).toEqual(['bravo', 'alpha']);
    });

    it('continues traversing children when a parent folder is excluded from sibling coloring', () => {
        const visibleChild = createFolder('Projects/VisibleChild');
        const hiddenParent = createFolder('Projects', [visibleChild]);
        const root = createFolder('/', [hiddenParent]);

        const traversalState = buildVisibleFolderTraversalState({
            rootFolders: [root],
            excludePatterns: [],
            defaultSortOrder: 'alpha-asc',
            isFolderExcluded: folder => folder.path === 'Projects'
        });

        expect(traversalState.siblingPathsByParent.get('/')).toEqual([]);
        expect(traversalState.siblingPathsByParent.get('Projects')).toEqual(['Projects/VisibleChild']);
    });

    it('stops after root sibling groups when descendant traversal is disabled', () => {
        const childA = createFolder('Projects/A');
        const childB = createFolder('Projects/B');
        const projects = createFolder('Projects', [childA, childB]);
        const root = createFolder('/', [projects]);

        const traversalState = buildVisibleFolderTraversalState({
            rootFolders: [root],
            excludePatterns: [],
            defaultSortOrder: 'alpha-asc',
            includeDescendantSiblingGroups: false
        });

        expect(traversalState.siblingPathsByParent.get('/')).toEqual(['Projects']);
        expect(traversalState.siblingPathsByParent.has('Projects')).toBe(false);
    });
});

describe('treeFlattener manual folder order', () => {
    it('orders listed subfolders first and the rest alphabetically at every level', () => {
        const drafts = createFolder('Projects/Drafts');
        const archive = createFolder('Projects/Archive');
        const active = createFolder('Projects/Active');
        const projects = createFolder('Projects', [drafts, archive, active]);
        const inbox = createFolder('Inbox');
        const notes = createFolder('Notes');
        const root = createFolder('/', [notes, projects, inbox]);

        const items = flattenFolderTree([root], new Set(['/', 'Projects']), [], 0, new Set(), {
            childOrder: { '/': ['Projects', 'Inbox'], Projects: ['Drafts'] },
            defaultSortOrder: 'alpha-asc'
        });

        expect(items.map(item => item.data.path)).toEqual([
            '/',
            'Projects',
            'Projects/Drafts',
            'Projects/Active',
            'Projects/Archive',
            'Inbox',
            'Notes'
        ]);
    });

    it('sorts unlisted subfolders by the parent alphabetical override and skips names without a folder', () => {
        const alpha = createFolder('Projects/Alpha');
        const beta = createFolder('Projects/Beta');
        const gamma = createFolder('Projects/Gamma');

        const sorted = sortFolderSiblings([alpha, beta, gamma], 'Projects', {
            childOrder: { Projects: ['Missing', 'Beta'] },
            defaultSortOrder: 'alpha-asc',
            childSortOrderOverrides: { Projects: 'alpha-desc' }
        });

        expect(sorted.map(folder => folder.name)).toEqual(['Beta', 'Gamma', 'Alpha']);
    });

    it('applies the manual order in rainbow sibling groups', () => {
        const childA = createFolder('Projects/A');
        const childB = createFolder('Projects/B');
        const projects = createFolder('Projects', [childA, childB]);
        const root = createFolder('/', [projects]);

        const traversalState = buildVisibleFolderTraversalState({
            rootFolders: [root],
            excludePatterns: [],
            childOrder: { Projects: ['B', 'A'] },
            defaultSortOrder: 'alpha-asc'
        });

        expect(traversalState.siblingPathsByParent.get('Projects')).toEqual(['Projects/B', 'Projects/A']);
    });

    it('reads only own keys, so a folder named like an Object.prototype member has no manual order', () => {
        const childOrder = Object.create(null) as Record<string, string[]>;
        childOrder['Projects'] = ['B'];

        expect(getChildOrder(childOrder, 'Projects')).toEqual(['B']);
        expect(getChildOrder({}, 'constructor')).toEqual([]);
        expect(getChildOrder(undefined, 'Projects')).toEqual([]);
    });
});

describe('treeFlattener mergeDisplayedOrder', () => {
    it('keeps names that are not displayed in their slots', () => {
        // Hidden is hidden in this profile and Missing has no folder; both keep their positions
        expect(mergeDisplayedOrder(['A', 'Hidden', 'B', 'Missing', 'C'], ['C', 'B', 'A'])).toEqual(['C', 'Hidden', 'B', 'Missing', 'A']);
    });

    it('appends displayed names that were not stored yet', () => {
        expect(mergeDisplayedOrder(['A', 'Hidden'], ['New', 'A'])).toEqual(['New', 'Hidden', 'A']);
        expect(mergeDisplayedOrder([], ['B', 'A'])).toEqual(['B', 'A']);
    });
});

describe('treeFlattener manual order helpers', () => {
    it('orders listed items first and the rest by the comparator', () => {
        const ordered = orderByManualList(
            ['a', 'b', 'c', 'd'],
            ['c', 'missing', 'a'],
            name => name,
            (x, y) => y.localeCompare(x)
        );

        expect(ordered).toEqual(['c', 'a', 'd', 'b']);
    });

    it('compares names by a manual list and returns 0 when neither is listed', () => {
        const order = ['b', 'a'];

        expect(compareByManualList(order, 'b', 'a')).toBeLessThan(0);
        expect(compareByManualList(order, 'a', 'z')).toBeLessThan(0);
        expect(compareByManualList(order, 'z', 'b')).toBeGreaterThan(0);
        expect(compareByManualList(order, 'y', 'z')).toBe(0);
    });

    it('stores nested tags under the last segment of their path', () => {
        expect(getTagChildName('projects/active/now')).toBe('now');
        expect(getTagChildName('inbox')).toBe('inbox');
    });

    it('orders nested tags by their parent manual order in flattenTagTree', () => {
        const projects = createTag('projects', [createTag('projects/alpha'), createTag('projects/beta'), createTag('projects/gamma')]);

        const items = flattenTagTree([projects], new Set(['projects']), 0, {
            childOrder: { projects: ['gamma', 'alpha'] }
        });

        expect(items.map(item => item.path)).toEqual(['projects', 'projects/gamma', 'projects/alpha', 'projects/beta']);
    });
});
