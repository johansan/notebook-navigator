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
import { compareByAlphaSortOrder, naturalCompare, resolveFolderChildSortOrder } from './sortUtils';
import { NavigationPaneItemType } from '../types';
import { PropertyTreeNode, TagTreeNode } from '../types/storage';
import type { FolderTreeItem, TagTreeItem } from '../types/virtualization';
import { isFolderInExcludedFolder } from './fileFilters';
import { matchesHiddenTagPattern, HiddenTagMatcher } from './tagPrefixMatcher';
import type { AlphaSortOrder } from '../settings/types';

/** Settings that decide the order of a parent folder's subfolders */
export interface FolderSiblingOrderOptions {
    /** Manual subfolder names per parent folder path ('/' for the vault root) */
    childOrder?: Readonly<Record<string, readonly string[]>>;
    /** Default alphabetical order for child folders */
    defaultSortOrder?: AlphaSortOrder;
    /** Per-folder child sort order overrides */
    childSortOrderOverrides?: Record<string, AlphaSortOrder>;
    /** Resolves the string used when alphabetically sorting folders */
    getFolderSortName?: (folder: TFolder) => string;
}

/** Options for flattenFolderTree function */
interface FlattenFolderTreeOptions extends FolderSiblingOrderOptions {
    /** Additional exclusion check applied per folder */
    isFolderExcluded?: (folder: TFolder) => boolean;
}

interface BuildVisibleFolderTraversalStateParams extends FlattenFolderTreeOptions {
    /** Root folders used by the navigation tree. May be the vault root or ordered root-level folders. */
    rootFolders: TFolder[];
    /** Patterns used to exclude folders from navigation and rainbow assignment. */
    excludePatterns: string[];
    /** Whether child sibling groups should be traversed beyond the root level. */
    includeDescendantSiblingGroups?: boolean;
}

interface WalkOrderedFolderTreeParams extends FlattenFolderTreeOptions {
    rootFolders: TFolder[];
    excludePatterns: string[];
    level?: number;
    visitedPaths?: Set<string>;
    onFolder?: (params: { folder: TFolder; level: number; isExcluded: boolean; parentPath: string }) => void;
    onSiblingGroup?: (params: {
        parentPath: string;
        level: number;
        entries: readonly { folder: TFolder; level: number; isExcluded: boolean; parentPath: string }[];
    }) => void;
    shouldVisitChildren?: (params: { folder: TFolder; level: number; isExcluded: boolean; parentPath: string }) => boolean;
}

/** Options for flattenTagTree function */
interface FlattenTagTreeOptions {
    /** Matcher for determining hidden tags */
    hiddenMatcher?: HiddenTagMatcher;
    /** Custom comparator for sorting tag nodes */
    comparator?: (a: TagTreeNode, b: TagTreeNode) => number;
    /** Per-tag child sort order overrides */
    childSortOrderOverrides?: Record<string, AlphaSortOrder>;
    /** Manual child order per parent tag path (settings.tagChildOrder); root tags use the comparator */
    childOrder?: Readonly<Record<string, readonly string[]>>;
}

const NO_CHILD_ORDER: readonly string[] = [];

/**
 * Reads a parent's manual child order (folders, nested tags or property values). Only own keys count, so a
 * parent named like an Object.prototype member (for example "constructor") reads as having no manual order.
 */
export function getChildOrder(childOrder: Readonly<Record<string, readonly string[]>> | undefined, parentKey: string): readonly string[] {
    if (!childOrder || !Object.prototype.hasOwnProperty.call(childOrder, parentKey)) {
        return NO_CHILD_ORDER;
    }
    return childOrder[parentKey];
}

/**
 * Orders children by a parent's manual order: listed names first, in list order, then the rest by `compare`.
 */
export function orderByManualList<T>(
    items: readonly T[],
    manualOrder: readonly string[],
    getName: (item: T) => string,
    compare: (a: T, b: T) => number
): T[] {
    if (manualOrder.length === 0) {
        return items.slice().sort(compare);
    }

    const unlistedByName = new Map(items.map(item => [getName(item), item]));
    const listed: T[] = [];
    manualOrder.forEach(name => {
        const item = unlistedByName.get(name);
        if (item !== undefined) {
            listed.push(item);
            unlistedByName.delete(name);
        }
    });

    return listed.concat(Array.from(unlistedByName.values()).sort(compare));
}

/**
 * Compares two child names by a manual order: listed names first in list order. Returns 0 when neither is listed,
 * so callers fall back to their regular comparison.
 */
export function compareByManualList(manualOrder: readonly string[], left: string, right: string): number {
    const leftIndex = manualOrder.indexOf(left);
    const rightIndex = manualOrder.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) {
        return 0;
    }
    if (leftIndex === -1) {
        return 1;
    }
    if (rightIndex === -1) {
        return -1;
    }
    return leftIndex - rightIndex;
}

/** Returns the name a nested tag is stored under in its parent's manual order: the last segment of its lowercase path. */
export function getTagChildName(tagPath: string): string {
    return tagPath.slice(tagPath.lastIndexOf('/') + 1);
}

/**
 * Orders the subfolders of one parent: names in the parent's manual order come first, in list order,
 * then the remaining folders by the parent's alphabetical order.
 */
export function sortFolderSiblings(folders: readonly TFolder[], parentPath: string, options: FolderSiblingOrderOptions): TFolder[] {
    const alphaOrder = resolveFolderChildSortOrder(
        { folderSortOrder: options.defaultSortOrder ?? 'alpha-asc', folderTreeSortOverrides: options.childSortOrderOverrides },
        parentPath
    );
    const getFolderSortName = options.getFolderSortName;
    const compareByName = (a: TFolder, b: TFolder): number => {
        const leftName = getFolderSortName ? getFolderSortName(a) : a.name;
        const rightName = getFolderSortName ? getFolderSortName(b) : b.name;
        const cmp = compareByAlphaSortOrder(leftName, rightName, alphaOrder);
        if (cmp !== 0) {
            return cmp;
        }
        return a.path.localeCompare(b.path);
    };

    return orderByManualList(folders, getChildOrder(options.childOrder, parentPath), folder => folder.name, compareByName);
}

/**
 * Applies a new order of the displayed subfolder names to a parent's stored manual order.
 * Displayed names fill the slots that displayed names held, so names that are not displayed keep their
 * positions: folders hidden in this vault profile but shown in another, and folders that do not exist.
 * Displayed names that were not stored yet are appended.
 */
export function mergeDisplayedOrder(storedOrder: readonly string[], displayedOrder: readonly string[]): string[] {
    const displayedNames = new Set(displayedOrder);
    const merged: string[] = [];
    let nextDisplayedIndex = 0;
    storedOrder.forEach(name => {
        if (!displayedNames.has(name)) {
            merged.push(name);
            return;
        }
        merged.push(displayedOrder[nextDisplayedIndex]);
        nextDisplayedIndex += 1;
    });

    return merged.concat(displayedOrder.slice(nextDisplayedIndex));
}

/**
 * Compares tags using custom order map with fallback to provided comparator or natural order.
 * Returns negative if a comes before b, positive if b comes before a, 0 if equal.
 */
export function compareTagOrderWithFallback(
    a: TagTreeNode,
    b: TagTreeNode,
    orderMap?: Map<string, number>,
    fallback?: (first: TagTreeNode, second: TagTreeNode) => number
): number {
    if (!orderMap || orderMap.size === 0) {
        return fallback ? fallback(a, b) : naturalCompare(a.name, b.name);
    }

    const orderA = orderMap.get(a.path);
    const orderB = orderMap.get(b.path);

    if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
    }
    if (orderA !== undefined) {
        return -1;
    }
    if (orderB !== undefined) {
        return 1;
    }
    return fallback ? fallback(a, b) : naturalCompare(a.name, b.name);
}

/**
 * Compares property key nodes using custom order map with fallback comparator or natural order.
 * Returns negative if a comes before b, positive if b comes before a, 0 if equal.
 */
export function comparePropertyOrderWithFallback(
    a: PropertyTreeNode,
    b: PropertyTreeNode,
    orderMap?: Map<string, number>,
    fallback?: (first: PropertyTreeNode, second: PropertyTreeNode) => number
): number {
    if (!orderMap || orderMap.size === 0) {
        return fallback ? fallback(a, b) : naturalCompare(a.name, b.name);
    }

    const orderA = orderMap.get(a.key);
    const orderB = orderMap.get(b.key);

    if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
    }
    if (orderA !== undefined) {
        return -1;
    }
    if (orderB !== undefined) {
        return 1;
    }
    return fallback ? fallback(a, b) : naturalCompare(a.name, b.name);
}

function walkOrderedFolderTree({
    rootFolders,
    excludePatterns,
    childOrder,
    defaultSortOrder,
    childSortOrderOverrides,
    getFolderSortName,
    isFolderExcluded,
    level = 0,
    visitedPaths = new Set<string>(),
    onFolder,
    onSiblingGroup,
    shouldVisitChildren
}: WalkOrderedFolderTreeParams): void {
    const siblingOrderOptions: FolderSiblingOrderOptions = { childOrder, defaultSortOrder, childSortOrderOverrides, getFolderSortName };

    const isExcluded = (folder: TFolder): boolean => {
        const isExcludedByPattern = excludePatterns.length > 0 && isFolderInExcludedFolder(folder, excludePatterns);
        const isExcludedByRule = isFolderExcluded ? isFolderExcluded(folder) : false;
        return isExcludedByPattern || isExcludedByRule;
    };

    const sortSiblingFolders = (folders: TFolder[], parentPath: string): TFolder[] => {
        if (folders.length <= 1) {
            return folders;
        }
        return sortFolderSiblings(folders, parentPath, siblingOrderOptions);
    };

    const walkChildren = (parentPath: string, folders: TFolder[], currentLevel: number) => {
        const entries = sortSiblingFolders(
            folders.filter(folder => !visitedPaths.has(folder.path)),
            parentPath
        ).map(folder => ({
            folder,
            level: currentLevel,
            isExcluded: isExcluded(folder),
            parentPath
        }));

        onSiblingGroup?.({
            parentPath,
            level: currentLevel,
            entries
        });

        entries.forEach(entry => {
            visitedPaths.add(entry.folder.path);
            onFolder?.(entry);

            if (shouldVisitChildren?.(entry) === false) {
                return;
            }

            const childFolders = entry.folder.children.filter((child): child is TFolder => child instanceof TFolder);
            if (childFolders.length === 0) {
                return;
            }

            walkChildren(entry.folder.path, childFolders, currentLevel + 1);
        });
    };

    if (rootFolders.length === 1 && rootFolders[0]?.path === '/') {
        const rootFolder = rootFolders[0];
        if (visitedPaths.has(rootFolder.path)) {
            return;
        }

        const rootEntry = {
            folder: rootFolder,
            level,
            isExcluded: isExcluded(rootFolder),
            parentPath: ''
        };
        visitedPaths.add(rootFolder.path);
        onFolder?.(rootEntry);

        if (shouldVisitChildren?.(rootEntry) === false) {
            return;
        }

        const rootChildren = rootFolder.children.filter((child): child is TFolder => child instanceof TFolder);
        if (rootChildren.length > 0) {
            walkChildren('/', rootChildren, level + 1);
        }
        return;
    }

    walkChildren('/', rootFolders, level);
}

/**
 * Flattens a folder tree into a linear array for virtualization.
 * Only includes folders that are visible based on the expanded state.
 *
 * @param folders - Array of root folders to flatten
 * @param expandedFolders - Set of expanded folder paths
 * @param excludePatterns - Patterns for folders to exclude
 * @param level - Current nesting level (for indentation)
 * @returns Array of flattened folder items
 */
export function flattenFolderTree(
    folders: TFolder[],
    expandedFolders: Set<string>,
    excludePatterns: string[],
    level: number = 0,
    visitedPaths: Set<string> = new Set(),
    options: FlattenFolderTreeOptions = {}
): FolderTreeItem[] {
    const items: FolderTreeItem[] = [];
    walkOrderedFolderTree({
        rootFolders: folders,
        excludePatterns,
        childOrder: options.childOrder,
        defaultSortOrder: options.defaultSortOrder,
        childSortOrderOverrides: options.childSortOrderOverrides,
        getFolderSortName: options.getFolderSortName,
        isFolderExcluded: options.isFolderExcluded,
        level,
        visitedPaths,
        onFolder: ({ folder, level: folderLevel, isExcluded }) => {
            const folderItem: FolderTreeItem = {
                type: NavigationPaneItemType.FOLDER,
                data: folder,
                level: folderLevel,
                path: folder.path,
                key: folder.path
            };

            if (isExcluded) {
                folderItem.isExcluded = true;
            }

            items.push(folderItem);
        },
        shouldVisitChildren: ({ folder }) => expandedFolders.has(folder.path)
    });

    return items;
}

export interface VisibleFolderTraversalState {
    siblingPathsByParent: Map<string, readonly string[]>;
}

export function buildVisibleFolderTraversalState({
    rootFolders,
    excludePatterns,
    childOrder,
    defaultSortOrder,
    childSortOrderOverrides,
    getFolderSortName,
    isFolderExcluded,
    includeDescendantSiblingGroups = true
}: BuildVisibleFolderTraversalStateParams): VisibleFolderTraversalState {
    const siblingPathsByParent = new Map<string, readonly string[]>();
    walkOrderedFolderTree({
        rootFolders,
        excludePatterns,
        childOrder,
        defaultSortOrder,
        childSortOrderOverrides,
        getFolderSortName,
        isFolderExcluded,
        onSiblingGroup: ({ parentPath, entries }) => {
            siblingPathsByParent.set(
                parentPath,
                entries.filter(entry => !entry.isExcluded).map(entry => entry.folder.path)
            );
        },
        shouldVisitChildren: ({ folder }) => {
            if (includeDescendantSiblingGroups) {
                return true;
            }
            return folder.path === '/';
        }
    });
    return {
        siblingPathsByParent
    };
}

/**
 * Flattens a tag tree into a linear array for virtualization.
 * Only includes tags that are visible based on the expanded state.
 *
 * @param tagNodes - Array of root tag nodes to flatten
 * @param expandedTags - Set of expanded tag paths
 * @param level - Current nesting level (for indentation)
 * @param options - Configuration options for flattening behavior
 * @returns Array of flattened tag items
 */
export function flattenTagTree(
    tagNodes: TagTreeNode[],
    expandedTags: Set<string>,
    level: number = 0,
    options: FlattenTagTreeOptions = {}
): TagTreeItem[] {
    const items: TagTreeItem[] = [];
    const { hiddenMatcher, comparator, childSortOrderOverrides, childOrder } = options;
    /** Use custom comparator or default to alphabetical sorting */
    const sortFn = comparator ?? ((a: TagTreeNode, b: TagTreeNode) => naturalCompare(a.name, b.name));

    /** Sort tags using the selected comparator */
    const sortedNodes = tagNodes.slice().sort(sortFn);

    const compareAlphaNodes = (order: AlphaSortOrder) => (a: TagTreeNode, b: TagTreeNode) => {
        const cmp = compareByAlphaSortOrder(a.name, b.name, order);
        if (cmp !== 0) {
            return cmp;
        }
        return a.path.localeCompare(b.path);
    };

    const getEffectiveChildComparator = (parentTagPath: string) => {
        if (childSortOrderOverrides && Object.prototype.hasOwnProperty.call(childSortOrderOverrides, parentTagPath)) {
            const override = childSortOrderOverrides[parentTagPath];
            if (override) {
                return compareAlphaNodes(override);
            }
        }
        return sortFn;
    };

    /** Recursively adds a tag node and its children to the items array */
    function addNode(node: TagTreeNode, currentLevel: number, parentHidden: boolean = false) {
        const matchesRule = hiddenMatcher ? matchesHiddenTagPattern(node.path, node.name, hiddenMatcher) : false;
        const isHidden = parentHidden || matchesRule;

        const item: TagTreeItem = {
            type: NavigationPaneItemType.TAG,
            data: node,
            level: currentLevel,
            path: node.path,
            key: node.path
        };

        // Mark tags that match hidden patterns (shows eye icon when visible)
        if (isHidden) {
            item.isHidden = true;
        }

        items.push(item);

        // Add children if expanded and has children
        if (expandedTags.has(node.path) && node.children && node.children.size > 0) {
            const sortedChildren = orderByManualList(
                Array.from(node.children.values()),
                getChildOrder(childOrder, node.path),
                child => getTagChildName(child.path),
                getEffectiveChildComparator(node.path)
            );

            sortedChildren.forEach(child => addNode(child, currentLevel + 1, isHidden));
        }
    }

    sortedNodes.forEach(node => addNode(node, level));
    return items;
}
