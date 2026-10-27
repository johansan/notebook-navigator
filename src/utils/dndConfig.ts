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

import { closestCenter, type Collision, type CollisionDetection, type Modifier } from '@dnd-kit/core';

export const verticalAxisOnly: Modifier = ({ transform }) => {
    return {
        ...transform,
        x: 0
    };
};

/**
 * Picks the sibling whose element holds the dragged row's top edge, otherwise the sibling with the
 * closest top edge. A row in reorder mode is one sortable element holding the row and its expanded
 * children, so the whole branch belongs to that row: a row dragged anywhere over it targets it.
 * Comparing centers or tops alone would hand the lower part of a tall branch to the next sibling.
 */
const closestTopEdge: CollisionDetection = ({ collisionRect, droppableRects, droppableContainers }) => {
    const collisions: Collision[] = [];
    droppableContainers.forEach(container => {
        const rect = droppableRects.get(container.id);
        if (rect) {
            const holdsTopEdge = rect.top <= collisionRect.top && collisionRect.top < rect.bottom;
            const value = holdsTopEdge ? 0 : Math.abs(rect.top - collisionRect.top);
            collisions.push({ id: container.id, data: { droppableContainer: container, value } });
        }
    });
    return collisions.sort((left, right) => Number(left.data?.value) - Number(right.data?.value));
};

/**
 * Collision detection that filters droppable containers by type.
 * Containers must have `data: { type: string }` set via useSortable.
 * Only containers matching the active item's type are considered. Containers that also set
 * `parentPath` (folder, tag and property rows in reorder mode) only match siblings, because every
 * level is its own sortable list and a drop on another level would not be applied; they are compared
 * by row (closestTopEdge) instead of by center. Containers without it (list pane manual sort) keep
 * center-based targeting.
 */
export const typeFilteredCollisionDetection: CollisionDetection = args => {
    const activeType = args.active?.data?.current?.type as string | undefined;

    if (!activeType) {
        return closestCenter(args);
    }

    const activeParentPath: unknown = args.active?.data?.current?.parentPath;
    const filteredContainers = args.droppableContainers.filter(
        container => container.data.current?.type === activeType && container.data.current?.parentPath === activeParentPath
    );
    const detectCollisions = typeof activeParentPath === 'string' ? closestTopEdge : closestCenter;

    return detectCollisions({
        ...args,
        droppableContainers: filteredContainers
    });
};

export const SHORTCUT_POINTER_CONSTRAINT = { distance: 6 };
export const ROOT_REORDER_MOUSE_CONSTRAINT = { distance: 6 };
export const ROOT_REORDER_TOUCH_CONSTRAINT = { distance: 6 };
