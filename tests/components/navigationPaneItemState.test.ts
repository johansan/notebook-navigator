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

import { TFile, TFolder } from 'obsidian';
import { describe, expect, it } from 'vitest';
import { isNavigationItemSelected } from '../../src/components/navigationPane/navigationPaneItemState';
import type { NavigationSelectionState } from '../../src/context/SelectionContext';
import { ItemType, NavigationPaneItemType } from '../../src/types';
import type {
    FolderTreeItem,
    RecentNoteNavItem,
    ShortcutFolderNavItem,
    ShortcutNoteNavItem,
    ShortcutTagNavItem
} from '../../src/types/virtualization';

const folderSelection = (path: string): NavigationSelectionState => ({
    selectionType: ItemType.FOLDER,
    selectedFolder: new TFolder(path),
    selectedTag: null,
    selectedProperty: null
});

const folderShortcut: ShortcutFolderNavItem = {
    type: NavigationPaneItemType.SHORTCUT_FOLDER,
    key: 'folder:notes',
    level: 0,
    shortcut: { type: 'folder', path: 'notes' },
    folder: new TFolder('notes')
};

const noteShortcut: ShortcutNoteNavItem = {
    type: NavigationPaneItemType.SHORTCUT_NOTE,
    key: 'note:notes/a.md',
    level: 0,
    shortcut: { type: 'note', path: 'notes/a.md' },
    note: new TFile('notes/a.md')
};

const tagShortcut: ShortcutTagNavItem = {
    type: NavigationPaneItemType.SHORTCUT_TAG,
    key: 'tag:projects',
    level: 0,
    shortcut: { type: 'tag', tagPath: 'projects' },
    tagPath: 'projects',
    displayName: 'projects'
};

describe('isNavigationItemSelected', () => {
    it('shows only the shortcut activated last as selected', () => {
        const selection = folderSelection('notes');

        expect(isNavigationItemSelected(noteShortcut, selection, noteShortcut.key)).toBe(true);
        expect(isNavigationItemSelected(folderShortcut, selection, noteShortcut.key)).toBe(false);
        expect(isNavigationItemSelected(tagShortcut, selection, noteShortcut.key)).toBe(false);
    });

    it('shows no shortcut as selected when none was activated, even when its target is selected', () => {
        expect(isNavigationItemSelected(folderShortcut, folderSelection('notes'), null)).toBe(false);
    });

    it('keeps tree rows following the selection', () => {
        const folderRow: FolderTreeItem = {
            type: NavigationPaneItemType.FOLDER,
            data: new TFolder('notes'),
            level: 0,
            path: 'notes',
            key: 'notes'
        };

        expect(isNavigationItemSelected(folderRow, folderSelection('notes'), folderShortcut.key)).toBe(true);
    });

    it('never shows a recent note row as selected', () => {
        const recentNote: RecentNoteNavItem = {
            type: NavigationPaneItemType.RECENT_NOTE,
            key: 'note:notes/a.md',
            level: 0,
            note: new TFile('notes/a.md')
        };

        expect(isNavigationItemSelected(recentNote, folderSelection('notes'), 'note:notes/a.md')).toBe(false);
    });
});
