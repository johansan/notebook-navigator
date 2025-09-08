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

import { TFile, TFolder } from 'obsidian';
import type { SortOption, NotebookNavigatorSettings } from '../settings';
import { NavigationItemType, ItemType } from '../types';
import { getCurrentLanguage } from 'src/i18n'

/**
 * Available sort options in order they appear in menus
 */
export const SORT_OPTIONS: SortOption[] = ['modified-desc', 'modified-asc', 'created-desc', 'created-asc', 'title-asc', 'title-desc'];

/**
 * Determines the effective sort option for a given context
 * @param settings - Plugin settings
 * @param selectionType - Whether folder or tag is selected
 * @param selectedFolder - The currently selected folder (if any)
 * @param selectedTag - The currently selected tag (if any)
 * @returns The sort option to use
 */
export function getEffectiveSortOption(
    settings: NotebookNavigatorSettings,
    selectionType: NavigationItemType,
    selectedFolder: TFolder | null,
    selectedTag?: string | null
): SortOption {
    if (selectionType === ItemType.FOLDER && selectedFolder && settings.folderSortOverrides?.[selectedFolder.path]) {
        return settings.folderSortOverrides[selectedFolder.path];
    }
    if (selectionType === ItemType.TAG && selectedTag && settings.tagSortOverrides?.[selectedTag]) {
        return settings.tagSortOverrides[selectedTag];
    }
    return settings.defaultFolderSort;
}

/**
 * Sorts an array of files according to the specified sort option using getter functions
 * @param files - Array of files to sort (will be mutated)
 * @param sortOption - How to sort the files
 * @param getCreatedTime - Function to get file created time
 * @param getModifiedTime - Function to get file modified time
 */
export function sortFiles(
    files: TFile[],
    sortOption: SortOption,
    getCreatedTime: (file: TFile) => number,
    getModifiedTime: (file: TFile) => number
): void {
    // Helper function to get timestamp for sorting
    const getTimestamp = (file: TFile, type: 'created' | 'modified'): number => {
        return type === 'created' ? getCreatedTime(file) : getModifiedTime(file);
    };

    switch (sortOption) {
        case 'modified-desc':
            files.sort((a, b) => getTimestamp(b, 'modified') - getTimestamp(a, 'modified'));
            break;
        case 'modified-asc':
            files.sort((a, b) => getTimestamp(a, 'modified') - getTimestamp(b, 'modified'));
            break;
        case 'created-desc':
            files.sort((a, b) => getTimestamp(b, 'created') - getTimestamp(a, 'created'));
            break;
        case 'created-asc':
            files.sort((a, b) => getTimestamp(a, 'created') - getTimestamp(b, 'created'));
            break;
        case 'title-asc':
            files.sort((a, b) => alphanumericCompare(a.basename, b.basename));
            break;
        case 'title-desc':
            files.sort((a, b) => alphanumericCompare(b.basename, a.basename));
            break;
    }
}

/**
 * Determines whether two strings are equivalent in the current locale.
 * Orders numbers in numerical order, not alphanumeric order
 * For example:
 * Alphanumeric order: 1, 10, 11, 2, 3
 * Numeric order: 1, 2, 3, 10, 11
 * @param a - First string in compare operation
 * @param b - Second string in compare operation
 */
export function alphanumericCompare(a: string, b: string) {
    return collator.compare(a, b)
}
const collator = new Intl.Collator(getCurrentLanguage(), { numeric: true });

/**
 * Gets the sort icon name based on sort option
 * @param sortOption - The current sort option
 * @returns Icon name for ObsidianIcon component
 */
export function getSortIcon(sortOption: SortOption): string {
    return sortOption.endsWith('-desc') ? 'lucide-sort-desc' : 'lucide-sort-asc';
}

/**
 * Gets the date field to use based on sort option
 * @param sortOption - The current sort option
 * @returns 'ctime' for created sorts, 'mtime' for others
 */
export function getDateField(sortOption: SortOption): 'ctime' | 'mtime' {
    return sortOption.startsWith('created') ? 'ctime' : 'mtime';
}
