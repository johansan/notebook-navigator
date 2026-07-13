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

import type { ExpansionAction } from '../context/ExpansionContext';
import type { SelectionAction, SelectionRevealSource } from '../context/SelectionContext';
import type { ContentPane } from '../context/UIStateContext';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../types';
import {
    getPropertyKeyNodeIdFromNodeId,
    normalizePropertyNodeId,
    resolvePropertySelectionNodeId,
    type PropertySelectionNodeId
} from './propertyTree';
import type { PropertyTreeNode } from '../types/storage';
import { expandNavigationTreeItems } from './navigationExpansion';

type Dispatch<T> = (action: T) => void;

export interface NavigateToPropertyOptions {
    skipScroll?: boolean;
    source?: SelectionRevealSource;
    preserveNavigationFocus?: boolean;
    requirePropertyInTree?: boolean;
    skipFocus?: boolean;
    historyIndex?: number;
}

export interface PropertyNavigationEnvironment {
    showProperties: boolean;
    showAllPropertiesFolder: boolean;
    propertyTree: ReadonlyMap<string, PropertyTreeNode>;
    expandedProperties: Set<string>;
    expandedVirtualFolders: Set<string>;
    collapseOtherBranchesOnExpand?: boolean;
    expansionDispatch: Dispatch<ExpansionAction>;
    selectionDispatch: Dispatch<SelectionAction>;
    activatePane: (target: ContentPane) => void;
    resolveSelectionNodeId?: (nodeId: PropertySelectionNodeId) => PropertySelectionNodeId;
    requestScroll?: (nodeId: PropertySelectionNodeId, options: { align: 'auto'; itemType: typeof ItemType.PROPERTY }) => void;
}

function resolveTargetNodeId(
    env: PropertyNavigationEnvironment,
    nodeId: PropertySelectionNodeId,
    options?: NavigateToPropertyOptions
): PropertySelectionNodeId | null {
    if (nodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return nodeId;
    }

    const resolvedNodeId = env.resolveSelectionNodeId
        ? env.resolveSelectionNodeId(nodeId)
        : resolvePropertySelectionNodeId(env.propertyTree, nodeId);

    if (resolvedNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        const requirePropertyInTree = options?.requirePropertyInTree ?? true;
        if (requirePropertyInTree) {
            return null;
        }

        return nodeId;
    }

    return resolvedNodeId;
}

function selectPropertyAndFocus(
    env: PropertyNavigationEnvironment,
    nodeId: PropertySelectionNodeId,
    options?: NavigateToPropertyOptions
): void {
    env.selectionDispatch({
        type: 'SET_SELECTED_PROPERTY',
        nodeId,
        source: options?.source,
        historyIndex: options?.historyIndex
    });

    if (options?.skipFocus) {
        return;
    }

    const preserveNavigationFocus = options?.preserveNavigationFocus ?? true;
    env.activatePane(preserveNavigationFocus ? 'navigation' : 'files');
}

/**
 * Selects a property node in the navigation pane, expands parent nodes, manages focus,
 * and optionally requests scrolling.
 * Returns the resolved selection node id when navigation succeeded, otherwise null.
 */
export function navigateToProperty(
    env: PropertyNavigationEnvironment,
    propertyNodeId: string,
    options?: NavigateToPropertyOptions
): PropertySelectionNodeId | null {
    const normalizedNodeId =
        propertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID ? PROPERTIES_ROOT_VIRTUAL_FOLDER_ID : normalizePropertyNodeId(propertyNodeId);
    if (!normalizedNodeId) {
        return null;
    }

    const resolvedNodeId = resolveTargetNodeId(env, normalizedNodeId, options);
    if (!resolvedNodeId) {
        return null;
    }

    if (env.showProperties && env.showAllPropertiesFolder && !env.expandedVirtualFolders.has(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)) {
        const nextExpanded = new Set(env.expandedVirtualFolders);
        nextExpanded.add(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
        env.expansionDispatch({ type: 'SET_EXPANDED_VIRTUAL_FOLDERS', folders: nextExpanded });
    }

    const keyNodeId =
        resolvedNodeId !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
            ? getPropertyKeyNodeIdFromNodeId(resolvedNodeId)
            : PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    const keyNeedsExpansion =
        keyNodeId &&
        keyNodeId !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID &&
        keyNodeId !== resolvedNodeId &&
        !env.expandedProperties.has(keyNodeId);
    if (keyNeedsExpansion) {
        expandNavigationTreeItems({
            type: 'property',
            ids: [keyNodeId],
            collapseOtherBranches: Boolean(env.collapseOtherBranchesOnExpand),
            dispatch: env.expansionDispatch
        });
    }

    selectPropertyAndFocus(env, resolvedNodeId, options);

    const shouldSkipScroll = Boolean(options?.skipScroll);
    if (!shouldSkipScroll && env.requestScroll) {
        env.requestScroll(resolvedNodeId, { align: 'auto', itemType: ItemType.PROPERTY });
    }

    return resolvedNodeId;
}
