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

import { describe, expect, it, vi } from 'vitest';
import { TFolder } from 'obsidian';
import type { ExpansionAction } from '../../src/context/ExpansionContext';
import {
    getFolderAncestorPaths,
    isFolderEffectivelyExpanded,
    isFolderExpansionLocked,
    toggleNavigationExpansionTarget
} from '../../src/utils/navigationExpansion';

describe('navigationExpansion', () => {
    it('locks a hidden root open without relying on persisted expansion', () => {
        expect(isFolderExpansionLocked('/', false)).toBe(true);
        expect(isFolderEffectivelyExpanded('/', new Set(), false)).toBe(true);
        expect(isFolderExpansionLocked('/', true)).toBe(false);
        expect(isFolderEffectivelyExpanded('/', new Set(), true)).toBe(false);
        expect(isFolderEffectivelyExpanded('/', new Set(['/']), true)).toBe(true);
    });

    it('omits the locked root from persisted ancestor expansion paths', () => {
        const rootFolder = new TFolder('/');
        const parentFolder = new TFolder('Projects');
        const childFolder = new TFolder('Projects/Active');
        Object.assign(parentFolder, { parent: rootFolder });
        Object.assign(childFolder, { parent: parentFolder });

        expect(getFolderAncestorPaths(childFolder)).toEqual(['/', 'Projects']);
        expect(getFolderAncestorPaths(childFolder, { includeRootFolder: false })).toEqual(['Projects']);
    });

    it('replaces unrelated tag branches when branch collapse is enabled', () => {
        const dispatch = vi.fn<(action: ExpansionAction) => void>();

        const didExpand = toggleNavigationExpansionTarget(
            {
                type: 'tag',
                id: 'projects/active',
                hasChildren: true,
                ancestorIds: ['projects']
            },
            {
                expandedFolders: new Set(),
                expandedTags: new Set(['areas', 'archive']),
                expandedProperties: new Set(),
                expandedVirtualFolders: new Set()
            },
            dispatch,
            'expand',
            { collapseOtherBranches: true }
        );

        expect(didExpand).toBe(true);
        expect(dispatch).toHaveBeenCalledWith({
            type: 'SET_EXPANDED_TAGS',
            tags: new Set(['projects', 'projects/active'])
        });
    });

    it('uses the normal collapse action when the target is already expanded', () => {
        const dispatch = vi.fn<(action: ExpansionAction) => void>();

        const didCollapse = toggleNavigationExpansionTarget(
            {
                type: 'property',
                id: 'key:status',
                hasChildren: true
            },
            {
                expandedFolders: new Set(),
                expandedTags: new Set(),
                expandedProperties: new Set(['key:status', 'key:priority']),
                expandedVirtualFolders: new Set()
            },
            dispatch,
            'toggle',
            { collapseOtherBranches: true }
        );

        expect(didCollapse).toBe(true);
        expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_PROPERTY_EXPANDED', propertyNodeId: 'key:status' });
    });
});
