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

import { TFile, App } from 'obsidian';
import { SelectionDispatch, SelectionState } from '../context/SelectionContext';
import {
    ItemType,
    type NavigationItemType,
    type NavigatorContext,
    type PinnedSectionCollapseKey,
    type VisibilityPreferences
} from '../types';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { IPropertyTreeProvider } from '../interfaces/IPropertyTreeProvider';
import type { ITagTreeProvider } from '../interfaces/ITagTreeProvider';
import { createScopedSelectionVisibilityCheck, getFilesForFolder, getFilesForProperty, getFilesForTag } from './fileFinder';

/**
 * Utilities for managing file selection operations
 */

/**
 * Get the path of the currently selected folder or tag
 * @param selectionState The current selection state
 * @returns The path string or null if nothing is selected
 */
export function getSelectedPath(
    selectionState: Pick<SelectionState, 'selectionType' | 'selectedFolder' | 'selectedTag' | 'selectedProperty'>
): string | null {
    if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
        return selectionState.selectedFolder.path;
    }
    if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
        return selectionState.selectedTag;
    }
    if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
        return selectionState.selectedProperty;
    }
    return null;
}

export interface NavigationSelectionScope {
    selectionType: NavigationItemType | ItemType | null;
    selectedFolder?: SelectionState['selectedFolder'];
    selectedTag?: SelectionState['selectedTag'];
    selectedProperty?: SelectionState['selectedProperty'];
}

interface NavigationSelectionOptions {
    orderResults?: boolean;
}

export function getNavigatorPinContext(selectionType: NavigationSelectionScope['selectionType']): NavigatorContext {
    if (selectionType === ItemType.TAG) {
        return ItemType.TAG;
    }

    if (selectionType === ItemType.PROPERTY) {
        return ItemType.PROPERTY;
    }

    return ItemType.FOLDER;
}

export function getPinnedSectionCollapseKey(selectionScope: NavigationSelectionScope): PinnedSectionCollapseKey {
    if (selectionScope.selectionType === ItemType.TAG && selectionScope.selectedTag) {
        return `tag:${selectionScope.selectedTag}`;
    }

    if (selectionScope.selectionType === ItemType.PROPERTY && selectionScope.selectedProperty) {
        return `property:${selectionScope.selectedProperty}`;
    }

    return `folder:${selectionScope.selectedFolder?.path ?? '/'}`;
}

export function getFilesForNavigationSelection(
    selectionScope: NavigationSelectionScope,
    settings: NotebookNavigatorSettings,
    visibility: VisibilityPreferences,
    app: App,
    tagTreeService: ITagTreeProvider | null,
    propertyTreeService: IPropertyTreeProvider | null,
    options?: NavigationSelectionOptions
): TFile[] {
    if (selectionScope.selectionType === ItemType.FOLDER && selectionScope.selectedFolder) {
        return getFilesForFolder(selectionScope.selectedFolder, settings, visibility, app, options);
    }
    if (selectionScope.selectionType === ItemType.TAG && selectionScope.selectedTag) {
        return getFilesForTag(selectionScope.selectedTag, settings, visibility, app, tagTreeService, options);
    }
    if (selectionScope.selectionType === ItemType.PROPERTY && selectionScope.selectedProperty) {
        return getFilesForProperty(selectionScope.selectedProperty, settings, visibility, app, propertyTreeService, options);
    }
    return [];
}

/**
 * Creates the list-membership check used to reconcile the file selection after files were moved.
 * The returned function runs after the move, with the file's new path, and answers whether the file
 * still belongs to the list the selection was made in.
 *
 * Folder lists are recomputed from the vault, which reflects a move as soon as the rename resolves.
 * Tag and property lists use tree path sets that are refreshed asynchronously, so recomputing them
 * here can report a moved file as missing. A move preserves the file's tags and properties, so for
 * those scopes only the per-file visibility rules are re-evaluated: hidden folders, hidden file names
 * and paths, and companion drawing images can all start matching at the new path or a conflict-renamed
 * name. The rename handler synchronously seeds the storage mirror at the new path from the existing
 * record, so the hidden file tag rule can read the moved file's cached tags before the trees refresh.
 */
export function createMovedFileListMembershipCheck(
    selectionScope: NavigationSelectionScope,
    settings: NotebookNavigatorSettings,
    visibility: VisibilityPreferences,
    searchActive: boolean,
    app: App
): (file: TFile) => boolean {
    // Search results are recomputed asynchronously after the storage sync and cannot be evaluated for a
    // moved file at this point, so a move during an active search always drops the moved files from the
    // selection. Otherwise a file that a folder: token or a renamed name no longer matches would stay
    // selected without being visible, and the list refresh does not reconcile that afterwards.
    if (searchActive) {
        return () => false;
    }

    if (selectionScope.selectionType === ItemType.FOLDER) {
        const selectedFolder = selectionScope.selectedFolder;
        if (!selectedFolder) {
            return () => false;
        }

        // Computed lazily so the folder list is built once, after the move, even when several files moved.
        let folderFilePaths: Set<string> | null = null;
        return file => {
            if (!folderFilePaths) {
                const folderFiles = getFilesForFolder(selectedFolder, settings, visibility, app, { orderResults: false });
                folderFilePaths = new Set(folderFiles.map(entry => entry.path));
            }
            return folderFilePaths.has(file.path);
        };
    }

    const isTagScope = selectionScope.selectionType === ItemType.TAG && !!selectionScope.selectedTag;
    const isPropertyScope = selectionScope.selectionType === ItemType.PROPERTY && !!selectionScope.selectedProperty;
    if (isTagScope || isPropertyScope) {
        return createScopedSelectionVisibilityCheck(settings, visibility, app);
    }

    return () => false;
}

/**
 * Find the next file to select after deleting files. Moves do not use this: a moved file keeps or loses
 * its selection based on list membership instead, see createMovedFileListMembershipCheck.
 * @param allFiles - All files in the current view
 * @param removedPaths - Set of paths that are being removed
 * @returns The file to select after removal, or null if none
 */
export function findNextFileAfterRemoval(allFiles: readonly TFile[], removedPaths: Set<string>): TFile | null {
    if (allFiles.length === 0) return null;

    // Find the first removed file's index
    let firstRemovedIndex = -1;
    for (let i = 0; i < allFiles.length; i++) {
        if (removedPaths.has(allFiles[i].path)) {
            firstRemovedIndex = i;
            break;
        }
    }

    if (firstRemovedIndex === -1) return null;

    // Strategy 1: Find first unselected file starting from first removed position
    for (let i = firstRemovedIndex; i < allFiles.length; i++) {
        if (!removedPaths.has(allFiles[i].path)) {
            return allFiles[i];
        }
    }

    // Strategy 2: If no file found after, look for first file before the selection
    if (firstRemovedIndex > 0) {
        for (let i = firstRemovedIndex - 1; i >= 0; i--) {
            if (!removedPaths.has(allFiles[i].path)) {
                return allFiles[i];
            }
        }
    }

    return null;
}

/**
 * Get files in range for shift-click selection
 * @param files - All files in order
 * @param startIndex - Starting index
 * @param endIndex - Ending index
 * @returns Array of files in the range
 */
export function getFilesInRange(files: TFile[], startIndex: number, endIndex: number): TFile[] {
    const minIndex = Math.max(0, Math.min(startIndex, endIndex));
    const maxIndex = Math.min(files.length - 1, Math.max(startIndex, endIndex));

    const result: TFile[] = [];
    for (let i = minIndex; i <= maxIndex; i++) {
        if (files[i]) {
            result.push(files[i]);
        }
    }

    return result;
}

export function mergeFilesIntoSelection(
    selectedFiles: ReadonlySet<string>,
    files: readonly TFile[]
): { selectedFiles: Set<string>; changed: boolean } {
    const nextSelectedFiles = new Set<string>(selectedFiles);
    let changed = false;

    files.forEach(file => {
        if (!nextSelectedFiles.has(file.path)) {
            changed = true;
        }

        nextSelectedFiles.add(file.path);
    });

    return {
        selectedFiles: nextSelectedFiles,
        changed
    };
}

/**
 * Find the index of a file in an ordered list
 * @param files - Ordered list of files
 * @param targetFile - File to find
 * @returns Index of the file, or -1 if not found
 */
export function findFileIndex(files: TFile[], targetFile: TFile | null): number {
    if (!targetFile) return -1;
    return files.findIndex(f => f.path === targetFile.path);
}

export function orderFilesByReference(files: readonly TFile[], orderedFiles?: readonly TFile[]): TFile[] {
    if (!orderedFiles || files.length < 2) {
        return [...files];
    }

    const fileByPath = new Map(files.map(file => [file.path, file]));
    const ordered: TFile[] = [];
    const seenPaths = new Set<string>();

    orderedFiles.forEach(file => {
        const matchedFile = fileByPath.get(file.path);
        if (!matchedFile || seenPaths.has(file.path)) {
            return;
        }

        seenPaths.add(file.path);
        ordered.push(matchedFile);
    });

    files.forEach(file => {
        if (seenPaths.has(file.path)) {
            return;
        }

        seenPaths.add(file.path);
        ordered.push(file);
    });

    return ordered;
}

/**
 * Resolve the adjacent file in a visible file order.
 * Returns the first or last file when there is no current selection.
 */
export function getAdjacentFile(files: TFile[], targetFile: TFile | null, direction: 'next' | 'previous'): TFile | null {
    if (files.length === 0) {
        return null;
    }

    const currentIndex = findFileIndex(files, targetFile);
    const targetIndex =
        currentIndex === -1 ? (direction === 'next' ? 0 : files.length - 1) : direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= files.length) {
        return null;
    }

    return files[targetIndex] ?? null;
}

/**
 * Update selection after a file operation (delete, move, etc.)
 * Handles both selection state update and opening the file in editor
 * @param nextFile - The file to select, or null to clear selection
 * @param dispatch - Selection dispatch function
 * @param app - Obsidian app instance
 * @param options - Optional configuration
 */
export async function updateSelectionAfterFileOperation(
    nextFile: TFile | null,
    dispatch: SelectionDispatch,
    app: App,
    options: {
        openInEditor?: boolean; // Whether to open the file in editor (default: true)
        activeFile?: boolean; // Whether to make the file active (default: false)
    } = {}
): Promise<void> {
    const { openInEditor = true, activeFile = false } = options;

    // No file to select, clear selection and return
    if (!nextFile) {
        dispatch({ type: 'CLEAR_FILE_SELECTION' });
        return;
    }

    // Update selection state
    dispatch({ type: 'SET_SELECTED_FILE', file: nextFile });

    // Skip opening file if not requested
    if (!openInEditor) {
        return;
    }

    // Open the file in editor
    const leaf = app.workspace.getLeaf(false);
    if (!leaf) {
        return;
    }

    try {
        await leaf.openFile(nextFile, { active: activeFile });
    } catch (error) {
        console.error('Failed to open next file:', error);
    }
}
