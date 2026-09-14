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

import type { AlphaSortOrder, NavRainbowColorMode, NavRainbowScope, TagSortOrder } from '../settings/types';
import { NavigationPaneItemType, UNTAGGED_TAG_ID } from '../types';
import type { PropertyTreeNode, TagTreeNode } from '../types/storage';
import type { CombinedNavigationItem } from '../types/virtualization';
import {
    applyRainbowOverlay,
    buildPropertyRainbowColors,
    buildTagRainbowColors,
    type PropertyRainbowColors,
    type TagRainbowColors
} from './navigationRainbow';
import { getPropertyKeyNodeIdFromNodeId, getTotalPropertyNoteCount, parsePropertyNodeId } from './propertyTree';
import { naturalCompare, compareByAlphaSortOrder } from './sortUtils';
import { normalizeTagPathValue } from './tagPrefixMatcher';
import { collectAllTagPaths } from './tagTree';
import { comparePropertyOrderWithFallback, compareTagOrderWithFallback, flattenTagTree } from './treeFlattener';

export interface FileItemPillDecorationColors {
    color: string | undefined;
    backgroundColor: string | undefined;
}

export interface FileItemPillDecorationModel {
    navRainbowMode: NavRainbowColorMode;
    tagRainbowColors: TagRainbowColors;
    propertyRainbowColors: PropertyRainbowColors;
    inheritPropertyColors: boolean;
}

function createEmptyTagRainbowColors(): TagRainbowColors {
    return {
        colorsByPath: new Map<string, string>(),
        rootColor: undefined,
        getInheritedColor: (_path: string) => undefined
    };
}

function createEmptyPropertyRainbowColors(): PropertyRainbowColors {
    return {
        colorsByNodeId: new Map<string, string>(),
        rootColor: undefined,
        rootColorsByKey: new Map<string, string>()
    };
}

function compareTagsAlphabetically(a: TagTreeNode, b: TagTreeNode): number {
    const nameCompare = naturalCompare(a.name, b.name);
    if (nameCompare !== 0) {
        return nameCompare;
    }

    return a.path.localeCompare(b.path);
}

function comparePropertyValuesAlphabetically(a: PropertyTreeNode, b: PropertyTreeNode): number {
    const nameCompare = naturalCompare(a.name, b.name);
    if (nameCompare !== 0) {
        return nameCompare;
    }

    return (a.valuePath ?? '').localeCompare(b.valuePath ?? '');
}

function reverseComparator<T>(comparator: (a: T, b: T) => number): (a: T, b: T) => number {
    return (a, b) => -comparator(a, b);
}

function createPropertyValueComparator(params: {
    order: TagSortOrder;
    keyNode: PropertyTreeNode;
    includeDescendantNotes: boolean;
}): (a: PropertyTreeNode, b: PropertyTreeNode) => number {
    const { order, keyNode, includeDescendantNotes } = params;
    const compareAlphabetically = comparePropertyValuesAlphabetically;

    if (order === 'alpha-asc') {
        return compareAlphabetically;
    }

    if (order === 'alpha-desc') {
        return reverseComparator(compareAlphabetically);
    }

    const compareByFrequency = (a: PropertyTreeNode, b: PropertyTreeNode) => {
        const getFrequency = (node: PropertyTreeNode): number => {
            if (includeDescendantNotes && node.valuePath) {
                return getTotalPropertyNoteCount(keyNode, node.valuePath);
            }

            return node.notesWithValue.size;
        };

        const difference = getFrequency(a) - getFrequency(b);
        if (difference !== 0) {
            return difference;
        }

        return compareAlphabetically(a, b);
    };

    if (order === 'frequency-asc') {
        return compareByFrequency;
    }

    return reverseComparator(compareByFrequency);
}

function resolveAlphaSortComparator<T extends { name: string } & ({ path: string } | { valuePath: string | null })>(
    order: AlphaSortOrder,
    getTieBreaker: (node: T) => string
): (a: T, b: T) => number {
    return (a, b) => {
        const nameCompare = compareByAlphaSortOrder(a.name, b.name, order);
        if (nameCompare !== 0) {
            return nameCompare;
        }

        return getTieBreaker(a).localeCompare(getTieBreaker(b));
    };
}

export function buildFileItemTagRainbowColors(params: {
    visibleTagTree: Map<string, TagTreeNode>;
    rootTagKeys?: readonly string[];
    rootTagOrderMap: Map<string, number>;
    tagComparator?: (a: TagTreeNode, b: TagTreeNode) => number;
    palette: readonly string[];
    scope: NavRainbowScope;
    showAllTagsFolder: boolean;
    inheritColors: boolean;
    childSortOrderOverrides?: Record<string, AlphaSortOrder>;
}): TagRainbowColors {
    const {
        visibleTagTree,
        rootTagKeys,
        rootTagOrderMap,
        tagComparator,
        palette,
        scope,
        showAllTagsFolder,
        inheritColors,
        childSortOrderOverrides
    } = params;

    if (palette.length === 0) {
        return createEmptyTagRainbowColors();
    }

    // The Tags root and Untagged can remain visible without real tags, so their colors must still be built.
    const rootNodes = Array.from(visibleTagTree.values());
    const baseComparator = tagComparator ?? compareTagsAlphabetically;
    const effectiveComparator =
        rootTagOrderMap.size > 0
            ? (a: TagTreeNode, b: TagTreeNode) => compareTagOrderWithFallback(a, b, rootTagOrderMap, baseComparator)
            : baseComparator;
    const expandedTags = new Set<string>();
    rootNodes.forEach(node => {
        collectAllTagPaths(node, expandedTags);
    });

    const rootLevel = showAllTagsFolder ? 1 : 0;
    let items: CombinedNavigationItem[];

    if (rootTagKeys && rootTagKeys.length > 0) {
        const addedRoots = new Set<string>();
        items = [];

        rootTagKeys.forEach(key => {
            if (key === UNTAGGED_TAG_ID) {
                const untaggedNode: TagTreeNode = {
                    name: UNTAGGED_TAG_ID,
                    path: UNTAGGED_TAG_ID,
                    displayPath: UNTAGGED_TAG_ID,
                    children: new Map(),
                    notesWithTag: new Set()
                };
                items.push({
                    type: NavigationPaneItemType.UNTAGGED,
                    data: untaggedNode,
                    level: rootLevel,
                    key: UNTAGGED_TAG_ID
                });
                return;
            }

            const node = visibleTagTree.get(key);
            if (!node || addedRoots.has(node.path)) {
                return;
            }

            addedRoots.add(node.path);
            items.push(
                ...flattenTagTree([node], expandedTags, rootLevel, {
                    comparator: baseComparator,
                    childSortOrderOverrides
                })
            );
        });

        rootNodes
            .filter(node => !addedRoots.has(node.path))
            .sort(effectiveComparator)
            .forEach(node => {
                items.push(
                    ...flattenTagTree([node], expandedTags, rootLevel, {
                        comparator: baseComparator,
                        childSortOrderOverrides
                    })
                );
            });
    } else {
        items = flattenTagTree(rootNodes, expandedTags, rootLevel, {
            comparator: effectiveComparator,
            childSortOrderOverrides
        });
    }

    return buildTagRainbowColors({
        items,
        palette,
        scope,
        rootLevel,
        showAllTagsFolder,
        inheritColors
    });
}

export function buildFileItemPropertyRainbowColors(params: {
    propertyTree: Map<string, PropertyTreeNode>;
    visiblePropertyNavigationKeySet: ReadonlySet<string>;
    rootPropertyOrderMap: Map<string, number>;
    propertyKeyComparator: (a: PropertyTreeNode, b: PropertyTreeNode) => number;
    palette: readonly string[];
    scope: NavRainbowScope;
    showAllPropertiesFolder: boolean;
    propertySortOrder: TagSortOrder;
    propertyTreeSortOverrides?: Record<string, AlphaSortOrder>;
    includeDescendantNotes: boolean;
}): PropertyRainbowColors {
    const {
        propertyTree,
        visiblePropertyNavigationKeySet,
        rootPropertyOrderMap,
        propertyKeyComparator,
        palette,
        scope,
        showAllPropertiesFolder,
        propertySortOrder,
        propertyTreeSortOverrides,
        includeDescendantNotes
    } = params;

    if (palette.length === 0) {
        return createEmptyPropertyRainbowColors();
    }

    // The Properties root remains visible without matching keys, so the palette must still reach its color builder.
    const keyNodes =
        visiblePropertyNavigationKeySet.size > 0
            ? Array.from(propertyTree.values()).filter(node => visiblePropertyNavigationKeySet.has(node.key))
            : [];

    const effectiveComparator =
        rootPropertyOrderMap.size > 0
            ? (a: PropertyTreeNode, b: PropertyTreeNode) =>
                  comparePropertyOrderWithFallback(a, b, rootPropertyOrderMap, propertyKeyComparator)
            : propertyKeyComparator;
    const sortedKeyNodes = keyNodes.slice().sort(effectiveComparator);

    const rootLevel = showAllPropertiesFolder ? 1 : 0;
    const childLevel = rootLevel + 1;
    const items: CombinedNavigationItem[] = [];

    sortedKeyNodes.forEach(keyNode => {
        items.push({
            type: NavigationPaneItemType.PROPERTY_KEY,
            data: keyNode,
            level: rootLevel,
            key: keyNode.id
        });

        const childNodes = Array.from(keyNode.children.values());
        if (childNodes.length === 0) {
            return;
        }

        const overrideOrder = propertyTreeSortOverrides?.[keyNode.id];
        const childComparator = overrideOrder
            ? resolveAlphaSortComparator<PropertyTreeNode>(overrideOrder, node => node.valuePath ?? '')
            : createPropertyValueComparator({
                  order: propertySortOrder,
                  keyNode,
                  includeDescendantNotes
              });
        childNodes.sort(childComparator).forEach(childNode => {
            items.push({
                type: NavigationPaneItemType.PROPERTY_VALUE,
                data: childNode,
                level: childLevel,
                key: childNode.id
            });
        });
    });

    return buildPropertyRainbowColors({
        items,
        palette,
        scope,
        showAllPropertiesFolder
    });
}

export function resolveFileItemTagDecorationColors(params: {
    model: FileItemPillDecorationModel;
    tagPath: string;
    color: string | null | undefined;
    backgroundColor: string | null | undefined;
}): FileItemPillDecorationColors {
    const { model, tagPath, color, backgroundColor } = params;
    const normalizedTagPath = normalizeTagPathValue(tagPath);
    const rainbowTagPath = normalizedTagPath.length > 0 ? normalizedTagPath : tagPath;
    const ownRainbowColor = model.tagRainbowColors.colorsByPath.get(rainbowTagPath);
    const inheritedRainbowColor = ownRainbowColor ? undefined : model.tagRainbowColors.getInheritedColor(rainbowTagPath);

    const resolved = applyRainbowOverlay({
        mode: model.navRainbowMode,
        rainbowColor: ownRainbowColor ?? inheritedRainbowColor,
        color,
        backgroundColor
    });

    return {
        color: resolved.color,
        backgroundColor: resolved.backgroundColor
    };
}

export function resolveFileItemPropertyDecorationColors(params: {
    model: FileItemPillDecorationModel;
    nodeId: string;
    color: string | null | undefined;
    backgroundColor: string | null | undefined;
}): FileItemPillDecorationColors {
    const { model, nodeId, color, backgroundColor } = params;
    const ownRainbowColor = model.propertyRainbowColors.colorsByNodeId.get(nodeId);
    const keyNodeId = getPropertyKeyNodeIdFromNodeId(nodeId);
    const parsedKeyNode = keyNodeId ? parsePropertyNodeId(keyNodeId) : null;
    const inheritedRainbowColor =
        ownRainbowColor || !model.inheritPropertyColors || !keyNodeId || keyNodeId === nodeId || !parsedKeyNode?.key
            ? undefined
            : model.propertyRainbowColors.rootColorsByKey.get(parsedKeyNode.key);

    const resolved = applyRainbowOverlay({
        mode: model.navRainbowMode,
        rainbowColor: ownRainbowColor ?? inheritedRainbowColor,
        color,
        backgroundColor
    });

    return {
        color: resolved.color,
        backgroundColor: resolved.backgroundColor
    };
}
