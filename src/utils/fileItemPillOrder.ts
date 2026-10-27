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

import type { AlphaSortOrder } from '../settings/types';
import type { TagTreeNode } from '../types/storage';
import { casefold } from './recordUtils';
import { compareByAlphaSortOrder, naturalCompare } from './sortUtils';
import { normalizeTagPathValue } from './tagPrefixMatcher';
import { compareByManualList, compareTagOrderWithFallback, getChildOrder, getTagChildName } from './treeFlattener';

export type FileItemTagNodeComparator = (a: TagTreeNode, b: TagTreeNode) => number;

export interface FileItemPillOrderModel {
    tagTree: ReadonlyMap<string, TagTreeNode>;
    rootTagOrderMap: Map<string, number>;
    tagComparator: FileItemTagNodeComparator | undefined;
    rootPropertyNavigationOrderMap: ReadonlyMap<string, number>;
}

function compareTagNodesAlphabetically(a: TagTreeNode, b: TagTreeNode): number {
    const nameCompare = naturalCompare(a.name, b.name);
    if (nameCompare !== 0) {
        return nameCompare;
    }

    return a.path.localeCompare(b.path);
}

function compareCanonicalPaths(leftPath: string, rightPath: string): number {
    const naturalResult = naturalCompare(leftPath, rightPath);
    if (naturalResult !== 0) {
        return naturalResult;
    }

    return leftPath.localeCompare(rightPath);
}

function getTagPathSegments(tagPath: string): string[] {
    if (!tagPath) {
        return [];
    }

    return tagPath.split('/').filter(segment => segment.length > 0);
}

function getTagNodeAtDepth(
    rootNodes: ReadonlyMap<string, TagTreeNode>,
    segments: readonly string[],
    depth: number
): TagTreeNode | undefined {
    let children = rootNodes;
    let node: TagTreeNode | undefined;
    let currentPath = '';

    for (let index = 0; index <= depth; index += 1) {
        const segment = segments[index];
        if (!segment) {
            return undefined;
        }

        currentPath = index === 0 ? segment : `${currentPath}/${segment}`;
        node = children.get(currentPath);
        if (!node) {
            return undefined;
        }

        children = node.children;
    }

    return node;
}

function compareOrderMapEntries(leftKey: string, rightKey: string, orderMap: ReadonlyMap<string, number>): number {
    if (orderMap.size === 0) {
        return 0;
    }

    const leftOrder = orderMap.get(leftKey);
    const rightOrder = orderMap.get(rightKey);

    if (leftOrder !== undefined && rightOrder !== undefined) {
        return leftOrder - rightOrder;
    }
    if (leftOrder !== undefined) {
        return -1;
    }
    if (rightOrder !== undefined) {
        return 1;
    }

    return 0;
}

function compareTagNodesByNavigationOrder({
    leftNode,
    rightNode,
    parentPath,
    orderModel,
    childSortOrderOverrides,
    childOrder
}: {
    leftNode: TagTreeNode;
    rightNode: TagTreeNode;
    parentPath: string | null;
    orderModel: FileItemPillOrderModel;
    childSortOrderOverrides?: Readonly<Record<string, AlphaSortOrder>>;
    childOrder?: Readonly<Record<string, readonly string[]>>;
}): number {
    // Nested tags follow their parent's manual order first, as in the navigation tree
    if (parentPath) {
        const manualCompare = compareByManualList(
            getChildOrder(childOrder, parentPath),
            getTagChildName(leftNode.path),
            getTagChildName(rightNode.path)
        );
        if (manualCompare !== 0) {
            return manualCompare;
        }
    }

    const childSortOrder = parentPath ? childSortOrderOverrides?.[parentPath] : undefined;
    if (childSortOrder) {
        const childNameCompare = compareByAlphaSortOrder(leftNode.name, rightNode.name, childSortOrder);
        if (childNameCompare !== 0) {
            return childNameCompare;
        }

        return leftNode.path.localeCompare(rightNode.path);
    }

    return compareTagOrderWithFallback(
        leftNode,
        rightNode,
        orderModel.rootTagOrderMap,
        orderModel.tagComparator ?? compareTagNodesAlphabetically
    );
}

export function compareFileItemTagsByNavigationOrder({
    leftTag,
    rightTag,
    orderModel,
    childSortOrderOverrides,
    childOrder
}: {
    leftTag: string;
    rightTag: string;
    orderModel: FileItemPillOrderModel;
    childSortOrderOverrides?: Readonly<Record<string, AlphaSortOrder>>;
    childOrder?: Readonly<Record<string, readonly string[]>>;
}): number {
    const leftPath = normalizeTagPathValue(leftTag);
    const rightPath = normalizeTagPathValue(rightTag);

    if (leftPath === rightPath) {
        return 0;
    }

    const leftSegments = getTagPathSegments(leftPath);
    const rightSegments = getTagPathSegments(rightPath);
    const sharedDepth = Math.min(leftSegments.length, rightSegments.length);

    for (let depth = 0; depth < sharedDepth; depth += 1) {
        const leftSegment = leftSegments[depth] ?? '';
        const rightSegment = rightSegments[depth] ?? '';
        if (leftSegment === rightSegment) {
            continue;
        }

        const parentPath = depth === 0 ? null : leftSegments.slice(0, depth).join('/');
        const leftNode = getTagNodeAtDepth(orderModel.tagTree, leftSegments, depth);
        const rightNode = getTagNodeAtDepth(orderModel.tagTree, rightSegments, depth);

        if (leftNode && rightNode) {
            const nodeCompare = compareTagNodesByNavigationOrder({
                leftNode,
                rightNode,
                parentPath,
                orderModel,
                childSortOrderOverrides,
                childOrder
            });
            if (nodeCompare !== 0) {
                return nodeCompare;
            }
        }

        if (depth === 0) {
            const rootOrderCompare = compareOrderMapEntries(leftSegment, rightSegment, orderModel.rootTagOrderMap);
            if (rootOrderCompare !== 0) {
                return rootOrderCompare;
            }
        }

        return compareCanonicalPaths(leftSegment, rightSegment);
    }

    if (leftSegments.length !== rightSegments.length) {
        return leftSegments.length - rightSegments.length;
    }

    return compareCanonicalPaths(leftPath, rightPath);
}

export function compareFileItemPropertyKeysByNavigationOrder(
    leftKey: string,
    rightKey: string,
    navigationOrderMap: ReadonlyMap<string, number>,
    visibleNavigationPropertyKeys: ReadonlySet<string>
): number {
    const leftNormalizedKey = casefold(leftKey);
    const rightNormalizedKey = casefold(rightKey);

    if (!leftNormalizedKey || !rightNormalizedKey || leftNormalizedKey === rightNormalizedKey) {
        return 0;
    }

    if (navigationOrderMap.size === 0) {
        return 0;
    }

    const leftOrderKey =
        visibleNavigationPropertyKeys.has(leftNormalizedKey) && navigationOrderMap.has(leftNormalizedKey) ? leftNormalizedKey : '';
    const rightOrderKey =
        visibleNavigationPropertyKeys.has(rightNormalizedKey) && navigationOrderMap.has(rightNormalizedKey) ? rightNormalizedKey : '';

    if (!leftOrderKey || !rightOrderKey) {
        if (leftOrderKey) {
            return -1;
        }
        if (rightOrderKey) {
            return 1;
        }
        return 0;
    }

    return compareOrderMapEntries(leftOrderKey, rightOrderKey, navigationOrderMap);
}
