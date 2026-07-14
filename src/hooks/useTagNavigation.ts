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

import { useCallback } from 'react';
import { useExpansionDispatch, useExpansionState } from '../context/ExpansionContext';
import { useSelectionDispatch } from '../context/SelectionContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUIDispatch, type ContentPane } from '../context/UIStateContext';
import { useFileCache } from '../context/StorageContext';
import { navigateToTag as navigateToTagInternal, type NavigateToTagOptions } from '../utils/tagNavigation';
import { navigateToProperty as navigateToPropertyInternal, type NavigateToPropertyOptions } from '../utils/propertyNavigation';

/**
 * Custom hook that provides tag navigation functionality.
 * Handles navigating to tags, expanding parent tags, and managing UI state.
 *
 * This hook encapsulates the tag navigation logic to make it reusable
 * across different components (NotebookNavigatorComponent, FileItem, etc).
 */
export function useTagNavigation() {
    const settings = useSettingsState();
    const expansionState = useExpansionState();
    const selectionDispatch = useSelectionDispatch();
    const expansionDispatch = useExpansionDispatch();
    const uiDispatch = useUIDispatch();
    const { findTagInTree, getPropertyTree } = useFileCache();
    const activatePane = useCallback(
        (target: ContentPane) => {
            uiDispatch({ type: 'ACTIVATE_PANE', target });
        },
        [uiDispatch]
    );

    /**
     * Navigates to a tag, expanding parent tags if it's hierarchical.
     *
     * @param tagPath - The tag path to navigate to (e.g., "parent/child")
     */
    const navigateToTag = useCallback(
        (tagPath: string, options?: NavigateToTagOptions) => {
            navigateToTagInternal(
                {
                    showTags: settings.showTags,
                    showAllTagsFolder: settings.showAllTagsFolder,
                    expandedTags: expansionState.expandedTags,
                    expandedVirtualFolders: expansionState.expandedVirtualFolders,
                    collapseOtherBranchesOnExpand: settings.collapseOtherBranchesOnExpand,
                    expansionDispatch,
                    selectionDispatch,
                    activatePane,
                    findTagInTree
                },
                tagPath,
                {
                    ...options,
                    preserveNavigationFocus: options?.preserveNavigationFocus ?? false,
                    requireTagInTree: options?.requireTagInTree ?? false
                }
            );
        },
        [
            selectionDispatch,
            expansionDispatch,
            expansionState.expandedTags,
            expansionState.expandedVirtualFolders,
            settings.showAllTagsFolder,
            settings.collapseOtherBranchesOnExpand,
            settings.showTags,
            findTagInTree,
            activatePane
        ]
    );

    /**
     * Navigates to a property key or value node.
     *
     * @param propertyNodeId - Property key/value node id
     */
    const navigateToProperty = useCallback(
        (propertyNodeId: string, options?: NavigateToPropertyOptions) => {
            navigateToPropertyInternal(
                {
                    showProperties: settings.showProperties,
                    showAllPropertiesFolder: settings.showAllPropertiesFolder,
                    propertyTree: getPropertyTree(),
                    expandedProperties: expansionState.expandedProperties,
                    expandedVirtualFolders: expansionState.expandedVirtualFolders,
                    collapseOtherBranchesOnExpand: settings.collapseOtherBranchesOnExpand,
                    expansionDispatch,
                    selectionDispatch,
                    activatePane
                },
                propertyNodeId,
                {
                    ...options,
                    preserveNavigationFocus: options?.preserveNavigationFocus ?? false,
                    requirePropertyInTree: options?.requirePropertyInTree ?? false
                }
            );
        },
        [
            expansionDispatch,
            expansionState.expandedProperties,
            expansionState.expandedVirtualFolders,
            getPropertyTree,
            selectionDispatch,
            settings.showAllPropertiesFolder,
            settings.collapseOtherBranchesOnExpand,
            settings.showProperties,
            activatePane
        ]
    );

    return {
        navigateToTag,
        navigateToProperty
    };
}
