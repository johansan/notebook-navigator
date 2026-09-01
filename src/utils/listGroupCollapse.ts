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

import { ItemType, type NavigationItemType } from '../types';
import { createPropertyGroupingOption, getPropertyGroupingKey } from '../settings/types';
import type { ListNoteGroupingOption } from '../settings/types';
import type { PropertySelectionNodeId } from './propertyTree';

interface ListGroupCollapseKeyParams {
    selectionType: NavigationItemType | ItemType | null;
    selectedFolderPath: string | null;
    selectedTag: string | null;
    selectedProperty: PropertySelectionNodeId | null;
    groupingMode: ListNoteGroupingOption;
    groupId: string;
}

type ListGroupCollapseScopeParams = Omit<ListGroupCollapseKeyParams, 'groupId'>;

export function normalizeStoredCollapsedListGroupKeys(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const normalizedKeys: string[] = [];
    const seen = new Set<string>();
    value.forEach(entry => {
        if (typeof entry !== 'string') {
            return;
        }

        const key = entry.trim();
        if (!key || seen.has(key)) {
            return;
        }

        seen.add(key);
        normalizedKeys.push(key);
    });

    return normalizedKeys;
}

function encodeKeyPart(value: string): string {
    return encodeURIComponent(value);
}

/**
 * Returns the prefix shared by every collapse key in one navigation selection and grouping mode.
 * Bulk expansion uses the prefix because collapsed parents can keep descendant headers out of the rendered list.
 */
export function buildListGroupCollapseKeyPrefix({
    selectionType,
    selectedFolderPath,
    selectedTag,
    selectedProperty,
    groupingMode
}: ListGroupCollapseScopeParams): string {
    let scope: string;
    if (selectionType === ItemType.TAG && selectedTag) {
        scope = `tag:${encodeKeyPart(selectedTag)}`;
    } else if (selectionType === ItemType.PROPERTY && selectedProperty) {
        scope = `property:${encodeKeyPart(selectedProperty)}`;
    } else {
        scope = `folder:${encodeKeyPart(selectedFolderPath ?? '/')}`;
    }

    // Property grouping keys normalize to the ascending prefix so collapse state survives
    // flipping or following the group order.
    const propertyGroupingKey = getPropertyGroupingKey(groupingMode);
    const scopeGroupingMode = propertyGroupingKey !== null ? createPropertyGroupingOption(propertyGroupingKey, 'asc') : groupingMode;

    return `scope=${scope};group=${encodeKeyPart(scopeGroupingMode)};id=`;
}

export function buildListGroupCollapseKey(params: ListGroupCollapseKeyParams): string {
    return `${buildListGroupCollapseKeyPrefix(params)}${encodeKeyPart(params.groupId)}`;
}
