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
import { orderFilesByReference, resolveShortcutTargetFromNavigatorSelection } from '../../src/utils/selectionUtils';
import { createTestTFile } from './createTestTFile';

describe('orderFilesByReference', () => {
    it('orders files by a reference list and appends missing files in original order', () => {
        const first = createTestTFile('Notes/First.md');
        const second = createTestTFile('Notes/Second.md');
        const third = createTestTFile('Notes/Third.md');
        const outsideReference = createTestTFile('Notes/Outside.md');

        const ordered = orderFilesByReference([third, first, second], [outsideReference, second, first]);

        expect(ordered.map(file => file.path)).toEqual([second.path, first.path, third.path]);
    });
});

describe('resolveShortcutTargetFromNavigatorSelection', () => {
    const emptySelection = {
        selectedFilePath: null,
        selectedFolderPath: null,
        selectedTag: null,
        selectedProperty: null
    };

    it('resolves the selected note when the list pane is active', () => {
        expect(
            resolveShortcutTargetFromNavigatorSelection({
                ...emptySelection,
                activePane: 'files',
                selectedFilePath: 'Notes/First.md',
                selectedFolderPath: 'Notes'
            })
        ).toEqual({ type: 'note', path: 'Notes/First.md' });
    });

    it('does not fall back to the folder when the list pane has no selection', () => {
        expect(
            resolveShortcutTargetFromNavigatorSelection({
                ...emptySelection,
                activePane: 'files',
                selectedFolderPath: 'Notes'
            })
        ).toBeNull();
    });

    it('resolves the selected folder when the navigation pane is active even with a selected note', () => {
        expect(
            resolveShortcutTargetFromNavigatorSelection({
                ...emptySelection,
                activePane: 'navigation',
                selectedFilePath: 'Notes/First.md',
                selectedFolderPath: 'Notes'
            })
        ).toEqual({ type: 'folder', path: 'Notes' });
    });

    it('resolves the selected tag and property when the navigation pane is active', () => {
        expect(
            resolveShortcutTargetFromNavigatorSelection({
                ...emptySelection,
                activePane: 'navigation',
                selectedTag: 'projects/active'
            })
        ).toEqual({ type: 'tag', tagPath: 'projects/active' });

        expect(
            resolveShortcutTargetFromNavigatorSelection({
                ...emptySelection,
                activePane: 'navigation',
                selectedProperty: 'status:done'
            })
        ).toEqual({ type: 'property', nodeId: 'status:done' });
    });

    it('returns null when the navigation pane has no selection', () => {
        expect(resolveShortcutTargetFromNavigatorSelection({ ...emptySelection, activePane: 'navigation' })).toBeNull();
    });
});
