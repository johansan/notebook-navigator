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

import { App, TFile, TFolder } from 'obsidian';
import { naturalCompare } from './sortUtils';
import { SelectionState, SelectionAction } from '../context/SelectionContext';
import { FileSystemOperations } from '../services/FileSystemService';
import { TagTreeService } from '../services/TagTreeService';
import type { PropertyTreeService } from '../services/PropertyTreeService';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { VisibilityPreferences } from '../types';
import { getFilesForNavigationSelection } from './selectionUtils';
import { sortFolderSiblings } from './treeFlattener';

interface BaseDeleteOperationsContext {
    app: App;
    fileSystemOps: FileSystemOperations;
    settings: NotebookNavigatorSettings;
    visibility: VisibilityPreferences;
    selectionState: SelectionState;
    selectionDispatch: React.Dispatch<SelectionAction>;
}

type DeleteFilesSelectionState = Pick<
    SelectionState,
    'selectionType' | 'selectedFolder' | 'selectedTag' | 'selectedProperty' | 'selectedFiles' | 'selectedFile'
>;

interface DeleteFilesContext extends Omit<BaseDeleteOperationsContext, 'selectionState'> {
    selectionState: DeleteFilesSelectionState;
    tagTreeService: TagTreeService | null;
    propertyTreeService: PropertyTreeService | null;
    orderedFiles?: readonly TFile[];
}

/**
 * Deletes the currently selected file(s) in the file list.
 * Handles both single and multi-file selection with smart selection after deletion.
 */
export async function deleteSelectedFiles({
    app,
    fileSystemOps,
    settings,
    visibility,
    selectionState,
    selectionDispatch,
    tagTreeService,
    propertyTreeService,
    orderedFiles
}: DeleteFilesContext): Promise<void> {
    const getCurrentFiles = (selectedPaths: ReadonlySet<string>): readonly TFile[] => {
        if (orderedFiles?.some(file => selectedPaths.has(file.path))) {
            return orderedFiles;
        }

        return getFilesForNavigationSelection(
            {
                selectionType: selectionState.selectionType,
                selectedFolder: selectionState.selectedFolder,
                selectedTag: selectionState.selectedTag,
                selectedProperty: selectionState.selectedProperty
            },
            settings,
            visibility,
            app,
            tagTreeService,
            propertyTreeService
        );
    };

    // Check if multiple files are selected
    if (selectionState.selectedFiles.size > 1) {
        const allFiles = getCurrentFiles(selectionState.selectedFiles);

        // Use centralized delete method with smart selection
        await fileSystemOps.deleteFilesWithSmartSelection(
            selectionState.selectedFiles,
            allFiles,
            selectionDispatch,
            settings.confirmBeforeDelete
        );
    } else if (selectionState.selectedFile) {
        // Use the centralized delete handler for single file
        await fileSystemOps.deleteSelectedFile(
            selectionState.selectedFile,
            settings,
            {
                selectionType: selectionState.selectionType,
                selectedFolder: selectionState.selectedFolder || undefined,
                selectedTag: selectionState.selectedTag || undefined,
                selectedProperty: selectionState.selectedProperty ?? undefined
            },
            selectionDispatch,
            settings.confirmBeforeDelete,
            getCurrentFiles(new Set([selectionState.selectedFile.path]))
        );
    }
}

/**
 * Deletes the currently selected folder in the navigation pane.
 * Finds and selects the next appropriate folder after deletion.
 */
export async function deleteSelectedFolder({
    app,
    fileSystemOps,
    settings,
    selectionState,
    selectionDispatch,
    getFolderSortName
}: BaseDeleteOperationsContext & { getFolderSortName: (folder: TFolder) => string }): Promise<void> {
    if (!selectionState.selectedFolder) return;

    const folderToDelete = selectionState.selectedFolder;

    // Don't allow deleting the root folder
    if (folderToDelete.path === '/') {
        return;
    }

    // Find the next folder to select before deletion
    let nextFolderToSelect: TFolder | null = null;

    // Try to find next sibling folder
    const parentFolder = folderToDelete.parent;
    if (parentFolder) {
        // Siblings in the order the navigation tree shows them
        const siblings = sortFolderSiblings(
            parentFolder.children.filter((child): child is TFolder => child instanceof TFolder),
            parentFolder.path,
            {
                childOrder: settings.folderChildOrder,
                defaultSortOrder: settings.folderSortOrder,
                childSortOrderOverrides: settings.folderTreeSortOverrides,
                getFolderSortName
            }
        );

        const currentIndex = siblings.findIndex(f => f.path === folderToDelete.path);

        if (currentIndex !== -1) {
            // Try next sibling
            if (currentIndex < siblings.length - 1) {
                nextFolderToSelect = siblings[currentIndex + 1];
            } else if (currentIndex > 0) {
                // No next sibling, try previous
                nextFolderToSelect = siblings[currentIndex - 1];
            } else {
                // No siblings, select parent
                nextFolderToSelect = parentFolder;
            }
        }
    } else {
        // No parent folder (root level folder)
        // Try to find any other root folder
        const rootFolder = app.vault.getRoot();
        const rootFolders = rootFolder.children
            .filter((child): child is TFolder => child instanceof TFolder && child.path !== folderToDelete.path)
            .sort((a, b) => naturalCompare(a.name, b.name));

        if (rootFolders.length > 0) {
            nextFolderToSelect = rootFolders[0];
        }
    }

    // Delete the folder
    await fileSystemOps.deleteFolder(folderToDelete, settings.confirmBeforeDelete, () => {
        // After deletion, select the next folder
        if (nextFolderToSelect) {
            selectionDispatch({
                type: 'SET_SELECTED_FOLDER',
                folder: nextFolderToSelect
            });
        }
    });
}
