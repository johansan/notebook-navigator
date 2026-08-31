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
import { createPropertyGroupingOption, getPropertyGroupingKey, getPropertyGroupingOrder } from '../settings/types';
import type { ListNoteGroupingOption, ListSortOverrideValue, NotebookNavigatorSettings, SortOption } from '../settings/types';
import { DEFAULT_SETTINGS } from '../settings/defaultSettings';
import type { PropertyGroupingDirection } from '../settings/types';
import { casefold } from './recordUtils';
import {
    getSortDirection,
    getSortField,
    isDateSortOption,
    isManualSortPropertyKey,
    parsePropertySortKeys,
    replacePropertySortKey,
    resolveListSort,
    type DefaultReconcileResult
} from './sortUtils';

/**
 * Returns the configured grouping property keys available as grouping choices.
 * The manual-sort property is excluded because manual sort has its own menu entry and is never
 * offered as a grouping choice.
 */
export function getAvailablePropertyGroupKeys(
    settings: Pick<NotebookNavigatorSettings, 'propertyGroupKey' | 'manualSortPropertyKey'>
): string[] {
    return parsePropertySortKeys(settings.propertyGroupKey).filter(propertyKey => !isManualSortPropertyKey(settings, propertyKey));
}

/**
 * Resolves the direction used to arrange property groups. A stored `follow` order borrows the
 * direction from the effective sort option, so sorting and grouping by the same property behaves
 * like chunking the sorted list; fixed `asc`/`desc` orders are returned unchanged.
 */
export function resolvePropertyGroupingDirection(groupBy: ListNoteGroupingOption, sortOption: SortOption): PropertyGroupingDirection {
    const order = getPropertyGroupingOrder(groupBy);
    if (order === 'asc' || order === 'desc') {
        return order;
    }
    return getSortDirection(sortOption);
}

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

    // Property grouping buckets by frontmatter value independent of the file order, so it survives every sort.
    if (getPropertyGroupingKey(groupBy) !== null) {
        return groupBy;
    }

    // Sort-incompatible grouping modes fall back to None because falling back to Custom would
    // activate frontmatter headers that the user did not select.
    if (getSortField(sortOption) === 'property') {
        if (selectionType === ItemType.FOLDER && groupBy === 'folder') {
            return 'folder';
        }
        return groupBy === 'custom' ? 'custom' : 'none';
    }

    if (groupBy === 'date' && !isDateSortOption(sortOption)) {
        return 'none';
    }

    return groupBy;
}

/** Compares grouping options with case-insensitive property keys, matching how sort override keys are matched. */
export function areListGroupingOptionsEqual(left: ListNoteGroupingOption, right: ListNoteGroupingOption): boolean {
    if (left === right) {
        return true;
    }

    const leftPropertyKey = getPropertyGroupingKey(left);
    const rightPropertyKey = getPropertyGroupingKey(right);
    if (leftPropertyKey === null || rightPropertyKey === null) {
        return false;
    }

    return casefold(leftPropertyKey) === casefold(rightPropertyKey) && getPropertyGroupingOrder(left) === getPropertyGroupingOrder(right);
}

/**
 * Returns undefined when the complete selected grouping matches the complete default, signaling
 * that the existing override should be removed. A property grouping must match both its property
 * key and group order; sharing only one component retains the selection as an override.
 */
export function resolveListGroupingOverrideForDefault(
    selectedGrouping: ListNoteGroupingOption,
    defaultGrouping: ListNoteGroupingOption
): ListNoteGroupingOption | undefined {
    return areListGroupingOptionsEqual(selectedGrouping, defaultGrouping) ? undefined : selectedGrouping;
}

/** Compares grouping options ignoring group order direction, so a direction change stays on the same grouping property. */
export function areListGroupingOptionsSameKind(left: ListNoteGroupingOption, right: ListNoteGroupingOption): boolean {
    if (left === right) {
        return true;
    }

    const leftPropertyKey = getPropertyGroupingKey(left);
    const rightPropertyKey = getPropertyGroupingKey(right);
    if (leftPropertyKey === null || rightPropertyKey === null) {
        return false;
    }

    return casefold(leftPropertyKey) === casefold(rightPropertyKey);
}

const APPEARANCE_RECORD_KEYS = ['folderAppearances', 'tagAppearances', 'propertyAppearances'] as const;

/**
 * Removes property grouping overrides whose key is no longer configured in the grouping property list.
 * The manual sort key never appears as a grouping choice, so overrides referencing it are removed too.
 * Returns true when at least one appearance record changed; callers persist the settings on change.
 */
export function pruneUnavailablePropertyGroupingOverrides(settings: NotebookNavigatorSettings): boolean {
    const availablePropertyKeys = new Set(getAvailablePropertyGroupKeys(settings).map(propertyKey => casefold(propertyKey)));
    let changed = false;

    APPEARANCE_RECORD_KEYS.forEach(recordKey => {
        const record = settings[recordKey];
        if (!record) {
            return;
        }

        Object.entries(record).forEach(([entryKey, appearance]) => {
            const propertyKey = getPropertyGroupingKey(appearance?.groupBy);
            if (propertyKey === null || availablePropertyKeys.has(casefold(propertyKey))) {
                return;
            }

            delete appearance.groupBy;
            // A grouping-only appearance becomes an empty object; drop the entry so no
            // field-less record stays persisted and counted as stored metadata.
            if (Object.keys(appearance).length === 0) {
                delete record[entryKey];
            }
            changed = true;
        });
    });

    return changed;
}

/**
 * Rewrites property grouping overrides after a frontmatter key rename, or removes them when the key is deleted.
 * Passing null as the new key deletes matching overrides. Returns true when at least one appearance record changed.
 */
export function updatePropertyGroupingOverrideKeys(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    let changed = false;

    APPEARANCE_RECORD_KEYS.forEach(recordKey => {
        const record = settings[recordKey];
        if (!record) {
            return;
        }

        Object.entries(record).forEach(([entryKey, appearance]) => {
            const propertyKey = getPropertyGroupingKey(appearance?.groupBy);
            if (propertyKey === null || casefold(propertyKey) !== oldKeyNormalized) {
                return;
            }

            if (newKeyDisplay) {
                appearance.groupBy = createPropertyGroupingOption(newKeyDisplay, getPropertyGroupingOrder(appearance?.groupBy) ?? 'asc');
            } else {
                delete appearance.groupBy;
                // A grouping-only appearance becomes an empty object; drop the entry so no
                // field-less record stays persisted and counted as stored metadata.
                if (Object.keys(appearance).length === 0) {
                    delete record[entryKey];
                }
            }
            changed = true;
        });
    });

    return changed;
}

/**
 * Validates the default note grouping against the configured grouping properties.
 * A property grouping whose key is missing from the configured list (or points at the manual-sort
 * property) resets to the stock default grouping rather than retargeting another property, so
 * removing a property never silently changes how the vault is grouped.
 */
export function reconcileDefaultNoteGrouping(settings: NotebookNavigatorSettings): DefaultReconcileResult {
    const propertyKey = getPropertyGroupingKey(settings.noteGrouping);
    if (propertyKey === null) {
        return { changed: false, reset: false };
    }

    const availablePropertyKeys = new Set(getAvailablePropertyGroupKeys(settings).map(availableKey => casefold(availableKey)));
    if (availablePropertyKeys.has(casefold(propertyKey))) {
        return { changed: false, reset: false };
    }

    settings.noteGrouping = DEFAULT_SETTINGS.noteGrouping;
    return { changed: true, reset: true };
}

/**
 * Rewrites the default note grouping after a frontmatter key rename, or resets it to the stock
 * default grouping when the key is deleted (newKeyDisplay is null). Returns true when settings changed.
 */
export function updateDefaultNoteGroupingKey(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    const propertyKey = getPropertyGroupingKey(settings.noteGrouping);
    if (propertyKey === null || casefold(propertyKey) !== oldKeyNormalized) {
        return false;
    }

    if (newKeyDisplay) {
        settings.noteGrouping = createPropertyGroupingOption(newKeyDisplay, getPropertyGroupingOrder(settings.noteGrouping) ?? 'asc');
    } else {
        settings.noteGrouping = DEFAULT_SETTINGS.noteGrouping;
    }
    return true;
}

/**
 * Rewrites the configured grouping property list after a frontmatter key rename, or removes the
 * key when deleted (newKeyDisplay is null). Returns true when the list changed.
 */
export function updatePropertyGroupKeySetting(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    if (!settings.propertyGroupKey.trim()) {
        return false;
    }

    const nextValue = replacePropertySortKey(settings.propertyGroupKey, oldKeyNormalized, newKeyDisplay);
    if (nextValue === settings.propertyGroupKey) {
        return false;
    }

    settings.propertyGroupKey = nextValue;
    return true;
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
    const globalDefault: ListNoteGroupingOption = noteGrouping ?? 'none';

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

/** Returns whether one folder, tag, or property selection resolves to custom grouping after its sort override is applied. */
export function hasEffectiveCustomListGroupingForSelection(
    settings: NotebookNavigatorSettings,
    selectionType: ItemType,
    key: string | null
): boolean {
    let groupBy: ListNoteGroupingOption | undefined;
    let sortOverride: ListSortOverrideValue | undefined;
    if (key !== null) {
        switch (selectionType) {
            case ItemType.FOLDER:
                groupBy = settings.folderAppearances[key]?.groupBy;
                sortOverride = settings.folderSortOverrides[key];
                break;
            case ItemType.TAG:
                groupBy = settings.tagAppearances[key]?.groupBy;
                sortOverride = settings.tagSortOverrides[key];
                break;
            case ItemType.PROPERTY:
                groupBy = settings.propertyAppearances[key]?.groupBy;
                sortOverride = settings.propertySortOverrides[key];
                break;
        }
    }

    const grouping = resolveListGroupingOverride({
        noteGrouping: settings.noteGrouping,
        selectionType,
        groupBy
    }).effectiveGrouping;
    const sort = resolveListSort(settings, sortOverride);
    return (
        resolveEffectiveListGroupingForSort({
            groupBy: grouping,
            sortOption: sort.option,
            selectionType,
            isManualSortActive: isManualSortPropertyKey(settings, sort.propertyKey)
        }) === 'custom'
    );
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
    const globalDefault: ListNoteGroupingOption = settings.noteGrouping ?? 'none';

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
