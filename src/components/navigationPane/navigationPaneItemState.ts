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

import { ItemType, NavigationPaneItemType } from '../../types';
import type { NavigationSelectionState } from '../../context/SelectionContext';
import type { NavigationSearchHighlightsResult } from '../../hooks/navigationPane/useNavigationSearchHighlights';
import type { CombinedNavigationItem } from '../../types/virtualization';

type NavigationItemSearchMatch = 'include' | 'exclude';

interface NavigationItemFilledParams {
    item: CombinedNavigationItem;
    selectionState: NavigationSelectionState;
    selectedShortcutKey: string | null;
    searchHighlights: NavigationSearchHighlightsResult;
    getSolidBackground: (color?: string | null) => string | undefined;
}

export function getNavigationItemSearchMatch(
    item: CombinedNavigationItem,
    searchHighlights: NavigationSearchHighlightsResult
): NavigationItemSearchMatch | undefined {
    switch (item.type) {
        case NavigationPaneItemType.VIRTUAL_FOLDER:
            return searchHighlights.getTagCollectionSearchMatch(item.tagCollectionId ?? null);

        case NavigationPaneItemType.TAG:
        case NavigationPaneItemType.UNTAGGED:
            return searchHighlights.getTagSearchMatch(item.data.path);

        case NavigationPaneItemType.PROPERTY_KEY:
        case NavigationPaneItemType.PROPERTY_VALUE:
            return searchHighlights.getPropertySearchMatch(item.data.id);

        default:
            return undefined;
    }
}

/**
 * Returns whether a navigation row shows as selected. Tree rows follow the selection. Only the shortcut activated last
 * shows as selected, and only while its target is still the selection, so a folder shortcut and a note shortcut never
 * show as selected together. Recent note rows never show as selected.
 *
 * `selectedShortcutKey` is the key of the shortcut activated last while its target is still selected, otherwise null.
 */
export function isNavigationItemSelected(
    item: CombinedNavigationItem,
    selectionState: NavigationSelectionState,
    selectedShortcutKey: string | null
): boolean {
    switch (item.type) {
        case NavigationPaneItemType.FOLDER:
            return selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder?.path === item.data.path;

        case NavigationPaneItemType.VIRTUAL_FOLDER: {
            const tagCollectionId = item.tagCollectionId ?? null;
            const propertyCollectionId = item.propertyCollectionId ?? null;
            return (
                (tagCollectionId !== null &&
                    selectionState.selectionType === ItemType.TAG &&
                    selectionState.selectedTag === tagCollectionId) ||
                (propertyCollectionId !== null &&
                    selectionState.selectionType === ItemType.PROPERTY &&
                    selectionState.selectedProperty === propertyCollectionId)
            );
        }

        case NavigationPaneItemType.TAG:
        case NavigationPaneItemType.UNTAGGED:
            return selectionState.selectionType === ItemType.TAG && selectionState.selectedTag === item.data.path;

        case NavigationPaneItemType.PROPERTY_KEY:
        case NavigationPaneItemType.PROPERTY_VALUE:
            return selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty === item.data.id;

        case NavigationPaneItemType.SHORTCUT_FOLDER:
        case NavigationPaneItemType.SHORTCUT_NOTE:
        case NavigationPaneItemType.SHORTCUT_TAG:
        case NavigationPaneItemType.SHORTCUT_PROPERTY:
            return item.key === selectedShortcutKey;

        default:
            return false;
    }
}

export function isNavigationItemFilled({
    item,
    selectionState,
    selectedShortcutKey,
    searchHighlights,
    getSolidBackground
}: NavigationItemFilledParams): boolean {
    if (
        (item.type === NavigationPaneItemType.SHORTCUT_FOLDER ||
            item.type === NavigationPaneItemType.SHORTCUT_NOTE ||
            item.type === NavigationPaneItemType.SHORTCUT_TAG ||
            item.type === NavigationPaneItemType.SHORTCUT_PROPERTY) &&
        item.isMissing
    ) {
        return false;
    }

    const hasBackground = 'backgroundColor' in item && Boolean(getSolidBackground(item.backgroundColor));
    return (
        hasBackground ||
        isNavigationItemSelected(item, selectionState, selectedShortcutKey) ||
        Boolean(getNavigationItemSearchMatch(item, searchHighlights))
    );
}
