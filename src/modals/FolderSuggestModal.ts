/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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

import { App, TFolder } from 'obsidian';
import { strings } from '../i18n';
import { BaseSuggestModal } from './BaseSuggestModal';
import { alphanumericCompare } from 'src/utils/sortUtils'

/**
 * Modal for selecting a folder to move files to
 * Uses Obsidian's FuzzySuggestModal for fuzzy search and familiar UI
 */
export class FolderSuggestModal extends BaseSuggestModal<TFolder> {
    private excludeFolders: Set<string>;

    /**
     * Creates a new FolderSuggestModal
     * @param app - The Obsidian app instance
     * @param onChooseFolder - Callback when a folder is selected
     * @param placeholderText - Placeholder text for the search input
     * @param actionText - Action text for the enter key instruction
     * @param excludePaths - Optional set of folder paths to exclude from selection
     */
    constructor(
        app: App,
        onChooseFolder: (folder: TFolder) => void,
        placeholderText: string,
        actionText: string,
        excludePaths?: Set<string>
    ) {
        super(app, onChooseFolder, placeholderText, {
            navigate: strings.modals.folderSuggest.instructions.navigate,
            action: actionText,
            dismiss: strings.modals.folderSuggest.instructions.dismiss
        });
        this.excludeFolders = excludePaths || new Set();
    }

    /**
     * Gets all folders in the vault, excluding the ones that should be hidden
     * @returns Array of folders available for selection
     */
    getItems(): TFolder[] {
        const folders: TFolder[] = [];

        // Recursively collect all folders
        const collectFolders = (folder: TFolder) => {
            if (!this.excludeFolders.has(folder.path)) {
                folders.push(folder);
            }
            for (const child of folder.children) {
                if (child instanceof TFolder) {
                    collectFolders(child);
                }
            }
        };

        // Start from root folder
        collectFolders(this.app.vault.getRoot());

        // Sort folders by path for consistent ordering
        folders.sort((a, b) => alphanumericCompare(a.path, b.path));

        return folders;
    }

    /**
     * Gets the display text for a folder
     * Shows the full path to help distinguish folders with the same name
     * @param folder - The folder to get text for
     * @returns The display text
     */
    getItemText(folder: TFolder): string {
        // Show full path for clarity
        return folder.path || folder.name;
    }

    /**
     * Gets the display path for a folder
     * @param folder - The folder to get display path for
     * @returns The path to display
     */
    protected getDisplayPath(folder: TFolder): string {
        // Root folder shows as "/"
        return folder.path || '/';
    }

    /**
     * Gets the CSS class for folder items
     * @returns The CSS class name
     */
    protected getItemClass(): string {
        return 'nn-folder-suggest-item';
    }
}
