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

import { ItemType } from '../types';
import type { NotebookNavigatorSettings } from '../settings';
import type { ListNoteGroupingOption, SortOption } from '../settings/types';
import { getSortField, isDateSortOption } from './sortUtils';

interface ResolveListGroupingParams {
    settings: Pick<NotebookNavigatorSettings, 'noteGrouping' | 'folderAppearances' | 'tagAppearances' | 'propertyAppearances'>;
    selectionType?: ItemType;
    folderPath?: string | null;
    tag?: string | null;
    propertyNodeId?: string | null;
}

export interface ListGroupingResolution {
    defaultGrouping: ListNoteGroupingOption;
    effectiveGrouping: ListNoteGroupingOption;
    normalizedOverride: ListNoteGroupingOption | undefined;
    hasCustomOverride: boolean;
}

export function resolveEffectiveListGroupingForSort({
    groupBy,
    sortOption,
    selectionType,
    isManualSortActive = false,
    isManualSortEditActive = false
}: {
    groupBy: ListNoteGroupingOption;
    sortOption: SortOption;
    selectionType?: ItemType | null;
    isManualSortActive?: boolean;
    isManualSortEditActive?: boolean;
}): ListNoteGroupingOption {
    if (isManualSortActive || isManualSortEditActive) {
        return 'custom';
    }

    if (getSortField(sortOption) === 'property') {
        return selectionType === ItemType.FOLDER && groupBy === 'folder' ? 'folder' : 'custom';
    }

    if (groupBy === 'date' && !isDateSortOption(sortOption)) {
        return 'custom';
    }

    return groupBy;
}

export function resolveListGroupingOverride({
    noteGrouping,
    selectionType,
    groupBy
}: {
    noteGrouping: ListNoteGroupingOption;
    selectionType?: ItemType | null;
    groupBy?: ListNoteGroupingOption;
}): ListGroupingResolution {
    const globalDefault: ListNoteGroupingOption = noteGrouping ?? 'custom';

    if (selectionType === ItemType.FOLDER) {
        return {
            defaultGrouping: globalDefault,
            effectiveGrouping: groupBy ?? globalDefault,
            normalizedOverride: groupBy,
            hasCustomOverride: groupBy !== undefined
        };
    }

    if (selectionType === ItemType.TAG || selectionType === ItemType.PROPERTY) {
        const defaultGrouping: ListNoteGroupingOption = globalDefault === 'folder' ? 'date' : globalDefault;

        if (groupBy === undefined || groupBy === 'folder') {
            return {
                defaultGrouping,
                effectiveGrouping: defaultGrouping,
                normalizedOverride: undefined,
                hasCustomOverride: false
            };
        }

        return {
            defaultGrouping,
            effectiveGrouping: groupBy,
            normalizedOverride: groupBy,
            hasCustomOverride: true
        };
    }

    return {
        defaultGrouping: globalDefault,
        effectiveGrouping: globalDefault,
        normalizedOverride: undefined,
        hasCustomOverride: false
    };
}

/**
 * Calculates effective list grouping for the current selection.
 * Normalizes tag and property overrides that stored "folder" by falling back to the selection default.
 */
export function resolveListGrouping({
    settings,
    selectionType,
    folderPath,
    tag,
    propertyNodeId
}: ResolveListGroupingParams): ListGroupingResolution {
    const globalDefault: ListNoteGroupingOption = settings.noteGrouping ?? 'custom';

    // Folder selection: use folder-specific override if set, otherwise use global default
    if (selectionType === ItemType.FOLDER && folderPath) {
        return resolveListGroupingOverride({
            noteGrouping: globalDefault,
            selectionType,
            groupBy: settings.folderAppearances?.[folderPath]?.groupBy
        });
    }

    // Tag and property selections don't support "folder" grouping.
    if (selectionType === ItemType.TAG && tag) {
        return resolveListGroupingOverride({
            noteGrouping: globalDefault,
            selectionType,
            groupBy: settings.tagAppearances?.[tag]?.groupBy
        });
    }

    if (selectionType === ItemType.PROPERTY && propertyNodeId) {
        return resolveListGroupingOverride({
            noteGrouping: globalDefault,
            selectionType,
            groupBy: settings.propertyAppearances?.[propertyNodeId]?.groupBy
        });
    }

    // No specific selection or other selection types: use global default
    return {
        defaultGrouping: globalDefault,
        effectiveGrouping: globalDefault,
        normalizedOverride: undefined,
        hasCustomOverride: false
    };
}
