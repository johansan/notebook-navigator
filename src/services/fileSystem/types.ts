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

import type { TFile, TFolder } from 'obsidian';

import type { SelectionDispatch } from '../../context/SelectionContext';
import type { NavigationItemType } from '../../types';
import type { PropertySelectionNodeId } from '../../utils/propertyTree';

export interface SelectionContext {
    selectionType: NavigationItemType;
    selectedFolder?: TFolder;
    selectedTag?: string;
    selectedProperty?: PropertySelectionNodeId;
}

export interface MoveFilesSelectionContext {
    dispatch: SelectionDispatch;
    /**
     * Answers whether a moved file still belongs to the list the selection was made in. It is called
     * after the move, with the file's new path. Moved files that no longer belong are removed from the
     * selection; moved files that still belong, and files that were not moved, keep their selection.
     */
    isFileInCurrentList: (file: TFile) => boolean;
}

export interface MoveFilesOptions {
    files: TFile[];
    targetFolder: TFolder;
    selectionContext?: MoveFilesSelectionContext;
    showNotifications?: boolean;
}

export interface MoveFilesResult {
    movedCount: number;
    skippedCount: number;
    cancelledCount: number;
    errors: { file: TFile; error: unknown }[];
}

export interface MoveFolderResult {
    oldPath: string;
    newPath: string;
    targetFolder: TFolder;
}

export type MoveFolderModalResult =
    { status: 'success'; data: MoveFolderResult } | { status: 'cancelled' } | { status: 'error'; error: unknown };
