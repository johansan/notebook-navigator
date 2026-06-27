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
import { TFolder } from 'obsidian';
import { useExpansionState, useExpansionDispatch } from '../context/ExpansionContext';
import { useSelectionState } from '../context/SelectionContext';
import { useServices, useFileSystemOps } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferenceActions, useUXPreferences } from '../context/UXPreferencesContext';
import { useFileCache } from '../context/StorageContext';
import type { ItemScope } from '../settings/types';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID, TAGS_ROOT_VIRTUAL_FOLDER_ID } from '../types';
import type { PropertyTreeNode } from '../types/storage';
import { getPropertyKeyNodeIdFromNodeId } from '../utils/propertyTree';
import { collectAllTagPaths } from '../utils/tagTree';
import { expandNavigationTreeItems, getFolderAncestorPaths } from '../utils/navigationExpansion';

interface CollapseBehaviorScope {
    affectFolders: boolean;
    affectTags: boolean;
    affectProperties: boolean;
}

interface CollapsedExpansionState {
    folders: Set<string>;
    tags: Set<string>;
    properties: Set<string>;
    virtualFolders: Set<string>;
}

interface CollapseStateForSelectionParams {
    behavior: ItemScope;
    currentExpandedVirtualFolders: Set<string>;
    selectedFolder?: TFolder | null;
    selectedTag?: string | null;
    selectedPropertyNodeId?: string | null;
    showAllTagsFolder: boolean;
    showAllPropertiesFolder: boolean;
    preserveRootFolder?: boolean;
    rootFolderExpanded?: boolean;
}

const ROOT_FOLDER_PATH = '/';

export function getCollapseBehaviorScope(behavior: ItemScope): CollapseBehaviorScope {
    switch (behavior) {
        case 'folders-only':
            return { affectFolders: true, affectTags: false, affectProperties: false };
        case 'tags-only':
            return { affectFolders: false, affectTags: true, affectProperties: false };
        case 'properties-only':
            return { affectFolders: false, affectTags: false, affectProperties: true };
        case 'all':
        default:
            return { affectFolders: true, affectTags: true, affectProperties: true };
    }
}

export function hasCollapsibleFolderExpansion(expandedFolders: ReadonlySet<string>, preserveRootFolder: boolean): boolean {
    if (!preserveRootFolder) {
        return expandedFolders.size > 0;
    }

    for (const path of expandedFolders) {
        if (path !== ROOT_FOLDER_PATH) {
            return true;
        }
    }

    return false;
}

export function collectExpandableFolderPaths(rootFolder: TFolder, includeRootFolder: boolean): Set<string> {
    const allFolders = new Set<string>();

    const collectAllFolders = (folder: TFolder) => {
        folder.children.forEach(child => {
            if (child instanceof TFolder) {
                allFolders.add(child.path);
                collectAllFolders(child);
            }
        });
    };

    if (includeRootFolder) {
        allFolders.add(rootFolder.path);
    }

    collectAllFolders(rootFolder);
    return allFolders;
}

function setVirtualRootExpansion(
    currentExpandedVirtualFolders: Set<string>,
    options: {
        keepTagsRoot?: boolean;
        keepPropertiesRoot?: boolean;
    }
): Set<string> {
    const nextExpandedVirtualFolders = new Set(currentExpandedVirtualFolders);

    if (options.keepTagsRoot !== undefined) {
        if (options.keepTagsRoot) {
            nextExpandedVirtualFolders.add(TAGS_ROOT_VIRTUAL_FOLDER_ID);
        } else {
            nextExpandedVirtualFolders.delete(TAGS_ROOT_VIRTUAL_FOLDER_ID);
        }
    }

    if (options.keepPropertiesRoot !== undefined) {
        if (options.keepPropertiesRoot) {
            nextExpandedVirtualFolders.add(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
        } else {
            nextExpandedVirtualFolders.delete(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
        }
    }

    return nextExpandedVirtualFolders;
}

export function buildCollapsedExpansionState(params: {
    behavior: ItemScope;
    currentExpandedVirtualFolders: Set<string>;
    selectedFolderParentPaths?: Iterable<string>;
    selectedTagParentPaths?: Iterable<string>;
    selectedPropertyKeyNodeId?: string | null;
    revealTagsRoot?: boolean;
    revealPropertiesRoot?: boolean;
    preserveRootFolder?: boolean;
    rootFolderExpanded?: boolean;
}): CollapsedExpansionState {
    const scope = getCollapseBehaviorScope(params.behavior);
    const folders = new Set<string>();
    const tags = new Set<string>();
    const properties = new Set<string>();
    const preserveRootFolder = params.preserveRootFolder === true;
    const rootFolderExpanded = params.rootFolderExpanded === true;

    if (scope.affectFolders && params.selectedFolderParentPaths) {
        for (const path of params.selectedFolderParentPaths) {
            if (preserveRootFolder && path === ROOT_FOLDER_PATH && !rootFolderExpanded) {
                continue;
            }
            folders.add(path);
        }
    }

    if (scope.affectFolders && preserveRootFolder && rootFolderExpanded) {
        folders.add(ROOT_FOLDER_PATH);
    }

    if (scope.affectTags && params.selectedTagParentPaths) {
        for (const path of params.selectedTagParentPaths) {
            tags.add(path);
        }
    }

    if (scope.affectProperties && params.selectedPropertyKeyNodeId) {
        properties.add(params.selectedPropertyKeyNodeId);
    }

    const virtualFolders = setVirtualRootExpansion(params.currentExpandedVirtualFolders, {
        keepTagsRoot: scope.affectTags ? Boolean(params.revealTagsRoot) : undefined,
        keepPropertiesRoot: scope.affectProperties ? Boolean(params.revealPropertiesRoot) : undefined
    });

    return {
        folders,
        tags,
        properties,
        virtualFolders
    };
}

function buildCollapsedExpansionStateForSelection(
    params: CollapseStateForSelectionParams,
    options?: { includeSelection?: boolean }
): CollapsedExpansionState {
    const includeSelection = options?.includeSelection ?? false;

    return buildCollapsedExpansionState({
        behavior: params.behavior,
        currentExpandedVirtualFolders: params.currentExpandedVirtualFolders,
        selectedFolderParentPaths: includeSelection ? buildSelectedFolderParentPaths(params.selectedFolder ?? null) : undefined,
        selectedTagParentPaths: includeSelection ? buildSelectedTagParentPaths(params.selectedTag ?? null) : undefined,
        selectedPropertyKeyNodeId: includeSelection ? getSelectedPropertyKeyNodeId(params.selectedPropertyNodeId ?? null) : undefined,
        revealTagsRoot: includeSelection ? shouldRevealTagsRoot(params.selectedTag ?? null, params.showAllTagsFolder) : undefined,
        revealPropertiesRoot: includeSelection
            ? shouldRevealPropertiesRoot(params.selectedPropertyNodeId ?? null, params.showAllPropertiesFolder)
            : undefined,
        preserveRootFolder: params.preserveRootFolder,
        rootFolderExpanded: params.rootFolderExpanded
    });
}

function buildSelectedFolderParentPaths(selectedFolder: TFolder | null): string[] {
    const parentPaths: string[] = [];
    let currentFolder: TFolder | null = selectedFolder?.parent ?? null;

    while (currentFolder) {
        parentPaths.push(currentFolder.path);
        if (currentFolder.path === '/') {
            break;
        }
        currentFolder = currentFolder.parent;
    }

    return parentPaths;
}

function buildSelectedTagParentPaths(selectedTag: string | null): string[] {
    if (!selectedTag) {
        return [];
    }

    const parentPaths: string[] = [];
    const parts = selectedTag.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        parentPaths.push(currentPath);
    }

    return parentPaths;
}

function getSelectedPropertyKeyNodeId(selectedPropertyNodeId: string | null): string | null {
    if (!selectedPropertyNodeId) {
        return null;
    }

    const keyNodeId = getPropertyKeyNodeIdFromNodeId(selectedPropertyNodeId);
    return keyNodeId && keyNodeId !== selectedPropertyNodeId ? keyNodeId : null;
}

function shouldRevealTagsRoot(selectedTag: string | null, showAllTagsFolder: boolean): boolean {
    return showAllTagsFolder && Boolean(selectedTag) && selectedTag !== TAGGED_TAG_ID;
}

function shouldRevealPropertiesRoot(selectedPropertyNodeId: string | null, showAllPropertiesFolder: boolean): boolean {
    return showAllPropertiesFolder && Boolean(selectedPropertyNodeId) && selectedPropertyNodeId !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
}

function setsMatch(currentValues: Set<string>, expectedValues: Set<string>): boolean {
    return currentValues.size === expectedValues.size && Array.from(currentValues).every(value => expectedValues.has(value));
}

/**
 * Custom hook that provides shared actions for navigation pane toolbars.
 * Used by both NavigationPaneHeader (desktop) and NavigationToolbar (mobile) to avoid code duplication.
 *
 * @returns Object containing action handlers and computed values for navigation pane operations
 */
export function useNavigationActions() {
    const { app } = useServices();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const showHiddenItems = uxPreferences.showHiddenItems;
    const { setShowHiddenItems } = useUXPreferenceActions();
    const expansionState = useExpansionState();
    const expansionDispatch = useExpansionDispatch();
    const selectionState = useSelectionState();
    const fileSystemOps = useFileSystemOps();
    const { fileData } = useFileCache();

    const shouldCollapseItems = useCallback(() => {
        const behavior = settings.collapseBehavior;
        const scope = getCollapseBehaviorScope(behavior);

        const hasFoldersExpanded =
            scope.affectFolders && hasCollapsibleFolderExpansion(expansionState.expandedFolders, settings.excludeVaultRootFromCollapse);
        const hasTagsExpanded =
            scope.affectTags &&
            (expansionState.expandedTags.size > 0 ||
                (settings.showAllTagsFolder && expansionState.expandedVirtualFolders.has(TAGS_ROOT_VIRTUAL_FOLDER_ID)));
        const hasPropertiesExpanded =
            scope.affectProperties &&
            (expansionState.expandedProperties.size > 0 ||
                (settings.showAllPropertiesFolder && expansionState.expandedVirtualFolders.has(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)));
        const hasItemsExpanded = hasFoldersExpanded || hasTagsExpanded || hasPropertiesExpanded;

        if (settings.smartCollapse && hasItemsExpanded) {
            const expectedCollapsedState = buildCollapsedExpansionStateForSelection(
                {
                    behavior,
                    currentExpandedVirtualFolders: expansionState.expandedVirtualFolders,
                    selectedFolder: selectionState.selectedFolder,
                    selectedTag: selectionState.selectedTag,
                    selectedPropertyNodeId: selectionState.selectedProperty,
                    showAllTagsFolder: settings.showAllTagsFolder,
                    showAllPropertiesFolder: settings.showAllPropertiesFolder,
                    preserveRootFolder: settings.excludeVaultRootFromCollapse,
                    rootFolderExpanded: expansionState.expandedFolders.has(ROOT_FOLDER_PATH)
                },
                { includeSelection: true }
            );

            const foldersMatch = !scope.affectFolders || setsMatch(expansionState.expandedFolders, expectedCollapsedState.folders);
            const tagsMatch = !scope.affectTags || setsMatch(expansionState.expandedTags, expectedCollapsedState.tags);
            const propertiesMatch =
                !scope.affectProperties || setsMatch(expansionState.expandedProperties, expectedCollapsedState.properties);
            const virtualFoldersMatch =
                (!scope.affectTags ||
                    expectedCollapsedState.virtualFolders.has(TAGS_ROOT_VIRTUAL_FOLDER_ID) ===
                        expansionState.expandedVirtualFolders.has(TAGS_ROOT_VIRTUAL_FOLDER_ID)) &&
                (!scope.affectProperties ||
                    expectedCollapsedState.virtualFolders.has(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) ===
                        expansionState.expandedVirtualFolders.has(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID));

            if (foldersMatch && tagsMatch && propertiesMatch && virtualFoldersMatch) {
                return false;
            }
        }

        return hasItemsExpanded;
    }, [
        settings.collapseBehavior,
        settings.excludeVaultRootFromCollapse,
        settings.showAllPropertiesFolder,
        settings.showAllTagsFolder,
        settings.smartCollapse,
        expansionState.expandedFolders,
        expansionState.expandedProperties,
        expansionState.expandedTags,
        expansionState.expandedVirtualFolders,
        selectionState.selectedFolder,
        selectionState.selectedProperty,
        selectionState.selectedTag
    ]);

    const handleExpandCollapseAll = useCallback(() => {
        const behavior = settings.collapseBehavior;
        const rootFolder = app.vault.getRoot();
        const shouldCollapse = shouldCollapseItems();
        const scope = getCollapseBehaviorScope(behavior);

        if (shouldCollapse) {
            if (
                settings.smartCollapse &&
                (selectionState.selectedFolder || selectionState.selectedTag || selectionState.selectedProperty)
            ) {
                const collapsedState = buildCollapsedExpansionStateForSelection(
                    {
                        behavior,
                        currentExpandedVirtualFolders: expansionState.expandedVirtualFolders,
                        selectedFolder: selectionState.selectedFolder,
                        selectedTag: selectionState.selectedTag,
                        selectedPropertyNodeId: selectionState.selectedProperty,
                        showAllTagsFolder: settings.showAllTagsFolder,
                        showAllPropertiesFolder: settings.showAllPropertiesFolder,
                        preserveRootFolder: settings.excludeVaultRootFromCollapse,
                        rootFolderExpanded: expansionState.expandedFolders.has(rootFolder.path)
                    },
                    { includeSelection: true }
                );

                if (scope.affectFolders) {
                    expansionDispatch({ type: 'SET_EXPANDED_FOLDERS', folders: collapsedState.folders });
                }
                if (scope.affectTags) {
                    expansionDispatch({ type: 'SET_EXPANDED_TAGS', tags: collapsedState.tags });
                }
                if (scope.affectProperties) {
                    expansionDispatch({ type: 'SET_EXPANDED_PROPERTIES', properties: collapsedState.properties });
                }
                if (scope.affectTags || scope.affectProperties) {
                    expansionDispatch({ type: 'SET_EXPANDED_VIRTUAL_FOLDERS', folders: collapsedState.virtualFolders });
                }
            } else {
                const collapsedState = buildCollapsedExpansionStateForSelection({
                    behavior,
                    currentExpandedVirtualFolders: expansionState.expandedVirtualFolders,
                    showAllTagsFolder: settings.showAllTagsFolder,
                    showAllPropertiesFolder: settings.showAllPropertiesFolder,
                    preserveRootFolder: settings.excludeVaultRootFromCollapse,
                    rootFolderExpanded: expansionState.expandedFolders.has(rootFolder.path)
                });

                if (scope.affectFolders) {
                    expansionDispatch({ type: 'SET_EXPANDED_FOLDERS', folders: collapsedState.folders });
                }

                if (scope.affectTags) {
                    expansionDispatch({ type: 'SET_EXPANDED_TAGS', tags: collapsedState.tags });
                }
                if (scope.affectProperties) {
                    expansionDispatch({ type: 'SET_EXPANDED_PROPERTIES', properties: collapsedState.properties });
                }
                if (scope.affectTags || scope.affectProperties) {
                    expansionDispatch({ type: 'SET_EXPANDED_VIRTUAL_FOLDERS', folders: collapsedState.virtualFolders });
                }
            }
        } else {
            if (scope.affectFolders) {
                expansionDispatch({
                    type: 'SET_EXPANDED_FOLDERS',
                    folders: collectExpandableFolderPaths(rootFolder, settings.showRootFolder)
                });
            }

            if (scope.affectTags || scope.affectProperties) {
                const allTagPaths = new Set<string>();
                const allPropertyNodeIds = new Set<string>();
                const collectExpandablePropertyNodeIds = (node: PropertyTreeNode) => {
                    if (node.children.size === 0) {
                        return;
                    }

                    allPropertyNodeIds.add(node.id);
                    node.children.forEach(childNode => {
                        collectExpandablePropertyNodeIds(childNode);
                    });
                };

                if (scope.affectTags) {
                    for (const tagNode of fileData.tagTree.values()) {
                        collectAllTagPaths(tagNode, allTagPaths);
                    }
                    expansionDispatch({ type: 'SET_EXPANDED_TAGS', tags: allTagPaths });
                }

                if (scope.affectProperties) {
                    for (const propertyNode of fileData.propertyTree.values()) {
                        collectExpandablePropertyNodeIds(propertyNode);
                    }
                    expansionDispatch({ type: 'SET_EXPANDED_PROPERTIES', properties: allPropertyNodeIds });
                }

                expansionDispatch({
                    type: 'SET_EXPANDED_VIRTUAL_FOLDERS',
                    folders: setVirtualRootExpansion(expansionState.expandedVirtualFolders, {
                        keepTagsRoot: scope.affectTags ? settings.showAllTagsFolder : undefined,
                        keepPropertiesRoot: scope.affectProperties ? settings.showAllPropertiesFolder : undefined
                    })
                });
            }
        }
    }, [
        app,
        expansionDispatch,
        expansionState.expandedFolders,
        expansionState.expandedVirtualFolders,
        settings.collapseBehavior,
        settings.excludeVaultRootFromCollapse,
        settings.showAllPropertiesFolder,
        settings.showAllTagsFolder,
        settings.showRootFolder,
        settings.smartCollapse,
        selectionState.selectedFolder,
        selectionState.selectedProperty,
        selectionState.selectedTag,
        fileData.propertyTree,
        fileData.tagTree,
        shouldCollapseItems
    ]);

    const handleNewFolder = useCallback(async () => {
        if (!selectionState.selectedFolder) return;

        try {
            await fileSystemOps.createNewFolder(selectionState.selectedFolder, () => {
                if (selectionState.selectedFolder && !expansionState.expandedFolders.has(selectionState.selectedFolder.path)) {
                    const folderPaths = settings.collapseOtherBranchesOnExpand
                        ? [...getFolderAncestorPaths(selectionState.selectedFolder), selectionState.selectedFolder.path]
                        : [selectionState.selectedFolder.path];
                    expandNavigationTreeItems({
                        type: 'folder',
                        ids: folderPaths,
                        collapseOtherBranches: settings.collapseOtherBranchesOnExpand,
                        dispatch: expansionDispatch
                    });
                }
            });
        } catch {
            // Error is handled by FileSystemOperations with user notification
        }
    }, [
        selectionState.selectedFolder,
        expansionState.expandedFolders,
        fileSystemOps,
        expansionDispatch,
        settings.collapseOtherBranchesOnExpand
    ]);

    const handleToggleShowExcludedFolders = useCallback(() => {
        setShowHiddenItems(!showHiddenItems);
    }, [setShowHiddenItems, showHiddenItems]);

    return {
        shouldCollapseItems,
        handleExpandCollapseAll,
        handleNewFolder,
        handleToggleShowExcludedFolders
    };
}
