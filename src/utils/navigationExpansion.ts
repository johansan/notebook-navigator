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

import { TFolder } from 'obsidian';
import type { ExpansionAction } from '../context/ExpansionContext';
import { NavigationPaneItemType } from '../types';
import type { CombinedNavigationItem } from '../types/virtualization';
import { hasSubfolders } from './fileFilters';
import { getPropertyKeyNodeIdFromNodeId } from './propertyTree';

export interface NavigationExpansionSets {
    expandedFolders: ReadonlySet<string>;
    expandedTags: ReadonlySet<string>;
    expandedProperties: ReadonlySet<string>;
    expandedVirtualFolders: ReadonlySet<string>;
}

export interface NavigationExpansionTarget {
    type: 'folder' | 'tag' | 'property' | 'virtual-folder';
    id: string;
    hasChildren: boolean;
    ancestorIds?: readonly string[];
}

type NavigationExpansionTreeType = Exclude<NavigationExpansionTarget['type'], 'virtual-folder'>;

interface ExpandNavigationTreeItemsOptions {
    type: NavigationExpansionTreeType;
    ids: readonly string[];
    collapseOtherBranches: boolean;
    dispatch: (action: ExpansionAction) => void;
}

interface NavigationExpansionTargetState {
    isExpanded: boolean;
    hasChildren: boolean;
    canExpand: boolean;
    canCollapse: boolean;
}

/**
 * The root row is locked open when Show root folder is off. It can still be
 * rendered by Show hidden items, but its persisted expansion bit must not control
 * row interactions because collapsing it would hide the folder tree.
 */
export function isFolderExpansionLocked(folderPath: string, showRootFolder: boolean): boolean {
    return folderPath === '/' && !showRootFolder;
}

/**
 * Returns the expansion state used by rendering and interactions. A locked root
 * stays open independently of any expansion state retained from when it was visible.
 */
export function isFolderEffectivelyExpanded(folderPath: string, expandedFolders: ReadonlySet<string>, showRootFolder: boolean): boolean {
    return isFolderExpansionLocked(folderPath, showRootFolder) || expandedFolders.has(folderPath);
}

function getTargetExpandedState(target: NavigationExpansionTarget, expansionState: NavigationExpansionSets): boolean {
    switch (target.type) {
        case 'folder':
            return expansionState.expandedFolders.has(target.id);
        case 'tag':
            return expansionState.expandedTags.has(target.id);
        case 'property':
            return expansionState.expandedProperties.has(target.id);
        case 'virtual-folder':
            return expansionState.expandedVirtualFolders.has(target.id);
    }
}

function buildToggleAction(target: NavigationExpansionTarget): ExpansionAction {
    switch (target.type) {
        case 'folder':
            return { type: 'TOGGLE_FOLDER_EXPANDED', folderPath: target.id };
        case 'tag':
            return { type: 'TOGGLE_TAG_EXPANDED', tagPath: target.id };
        case 'property':
            return { type: 'TOGGLE_PROPERTY_EXPANDED', propertyNodeId: target.id };
        case 'virtual-folder':
            return { type: 'TOGGLE_VIRTUAL_FOLDER_EXPANDED', folderId: target.id };
    }
}

function buildExpandItemsAction(
    type: NavigationExpansionTreeType,
    ids: readonly string[],
    collapseOtherBranches: boolean
): ExpansionAction {
    switch (type) {
        case 'folder':
            return collapseOtherBranches
                ? { type: 'SET_EXPANDED_FOLDERS', folders: new Set(ids) }
                : { type: 'EXPAND_FOLDERS', folderPaths: [...ids] };
        case 'tag':
            return collapseOtherBranches ? { type: 'SET_EXPANDED_TAGS', tags: new Set(ids) } : { type: 'EXPAND_TAGS', tagPaths: [...ids] };
        case 'property':
            return collapseOtherBranches
                ? { type: 'SET_EXPANDED_PROPERTIES', properties: new Set(ids) }
                : { type: 'EXPAND_PROPERTIES', propertyNodeIds: [...ids] };
    }
}

function buildBranchExpandAction(target: NavigationExpansionTarget): ExpansionAction {
    if (target.type === 'virtual-folder') {
        return buildToggleAction(target);
    }

    return buildExpandItemsAction(target.type, [...(target.ancestorIds ?? []), target.id], true);
}

function getNavigationExpansionTargetState(
    target: NavigationExpansionTarget,
    expansionState: NavigationExpansionSets
): NavigationExpansionTargetState {
    const isExpanded = getTargetExpandedState(target, expansionState);
    return {
        isExpanded,
        hasChildren: target.hasChildren,
        canExpand: target.hasChildren && !isExpanded,
        canCollapse: isExpanded
    };
}

export function toggleNavigationExpansionTarget(
    target: NavigationExpansionTarget,
    expansionState: NavigationExpansionSets,
    dispatch: (action: ExpansionAction) => void,
    mode: 'toggle' | 'expand' | 'collapse' = 'toggle',
    options?: { collapseOtherBranches?: boolean }
): boolean {
    const targetState = getNavigationExpansionTargetState(target, expansionState);
    const shouldToggle =
        mode === 'expand'
            ? targetState.canExpand
            : mode === 'collapse'
              ? targetState.canCollapse
              : targetState.canExpand || targetState.canCollapse;

    if (!shouldToggle) {
        return false;
    }

    if (options?.collapseOtherBranches && targetState.canExpand) {
        dispatch(buildBranchExpandAction(target));
    } else {
        dispatch(buildToggleAction(target));
    }
    return true;
}

export function expandNavigationTreeItems({ type, ids, collapseOtherBranches, dispatch }: ExpandNavigationTreeItemsOptions): void {
    if (ids.length === 0) {
        return;
    }

    dispatch(buildExpandItemsAction(type, ids, collapseOtherBranches));
}

/**
 * Returns ancestors in root-to-parent order. Locked-root callers omit the root so
 * branch replacement cannot persist a synthetic root expansion.
 */
export function getFolderAncestorPaths(folder: TFolder, options?: { includeRootFolder?: boolean }): string[] {
    const ancestorPaths: string[] = [];
    let currentFolder: TFolder | null = folder.parent;

    while (currentFolder) {
        if (currentFolder.path === '/') {
            if (options?.includeRootFolder !== false) {
                ancestorPaths.unshift(currentFolder.path);
            }
            break;
        }

        ancestorPaths.unshift(currentFolder.path);
        currentFolder = currentFolder.parent;
    }

    return ancestorPaths;
}

export function getTagAncestorPaths(tagPath: string): string[] {
    if (!tagPath.includes('/')) {
        return [];
    }

    const parts = tagPath.split('/');
    const ancestorPaths: string[] = [];
    for (let index = 1; index < parts.length; index += 1) {
        ancestorPaths.push(parts.slice(0, index).join('/'));
    }
    return ancestorPaths;
}

export function getPropertyAncestorNodeIds(propertyNodeId: string): string[] {
    const keyNodeId = getPropertyKeyNodeIdFromNodeId(propertyNodeId);
    return keyNodeId && keyNodeId !== propertyNodeId ? [keyNodeId] : [];
}

export function getNavigationExpansionTargetForItem(
    item: CombinedNavigationItem,
    options: { showHiddenItems: boolean; showRootFolder: boolean }
): NavigationExpansionTarget | null {
    switch (item.type) {
        case NavigationPaneItemType.FOLDER:
            if (!(item.data instanceof TFolder)) {
                return null;
            }
            if (isFolderExpansionLocked(item.data.path, options.showRootFolder)) {
                return null;
            }
            return {
                type: 'folder',
                id: item.data.path,
                hasChildren: hasSubfolders(item.data, item.parsedExcludedFolders ?? [], options.showHiddenItems),
                ancestorIds: getFolderAncestorPaths(item.data, { includeRootFolder: options.showRootFolder })
            };
        case NavigationPaneItemType.TAG:
            return {
                type: 'tag',
                id: item.data.path,
                hasChildren: item.data.children.size > 0,
                ancestorIds: getTagAncestorPaths(item.data.path)
            };
        case NavigationPaneItemType.PROPERTY_KEY:
        case NavigationPaneItemType.PROPERTY_VALUE:
            return {
                type: 'property',
                id: item.data.id,
                hasChildren: item.data.children.size > 0,
                ancestorIds: getPropertyAncestorNodeIds(item.data.id)
            };
        case NavigationPaneItemType.VIRTUAL_FOLDER:
            if (typeof item.tagCollectionId !== 'string' && typeof item.propertyCollectionId !== 'string') {
                return null;
            }
            return {
                type: 'virtual-folder',
                id: item.data.id,
                hasChildren: item.hasChildren ?? false
            };
        default:
            return null;
    }
}
