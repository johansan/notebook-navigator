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
import { resolveListGroupingOverride } from '../utils/listGrouping';
import {
    isTextCountDisplay,
    type ListDisplayMode,
    type ListNoteGroupingOption,
    type ListPaneAppearance,
    type NotebookNavigatorSettings,
    type TextCountDisplay
} from './types';

export type { ListPaneAppearance } from './types';

export interface ListPaneAppearanceSettings {
    mode: ListDisplayMode;
    titleRows: number;
    previewRows: number;
    showDate: boolean;
    showParentFolder: boolean;
    showPreview: boolean;
    showImage: boolean;
    showTags: boolean;
    showProperties: boolean;
    showTaskProgress: boolean;
    textCountDisplay: TextCountDisplay;
    groupBy: ListNoteGroupingOption;
}

/**
 * Content toggles that can be stored per folder, tag, or property selection.
 * Both `true` and `false` are persisted so a selection can enable content that
 * the global setting turns off, and hide content that the global setting shows.
 */
export const LIST_PANE_TOGGLE_KEYS = ['showTags', 'showProperties', 'showTaskProgress', 'showDate', 'showParentFolder'] as const;

export type ListPaneToggleKey = (typeof LIST_PANE_TOGGLE_KEYS)[number];

export type ListPaneAppearanceFields = Omit<ListPaneAppearance, 'groupBy'>;

const LIST_PANE_APPEARANCE_FIELD_KEYS = [
    'mode',
    'titleRows',
    'previewRows',
    ...LIST_PANE_TOGGLE_KEYS,
    'textCount'
] as const satisfies readonly (keyof ListPaneAppearanceFields)[];

function isValidTitleRows(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 3;
}

function isValidPreviewRows(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5;
}

/**
 * Returns the stored appearance intent without grouping, dropping invalid and unknown fields.
 * Returns null when the appearance stores no valid field, so callers can delete the record.
 */
export function getStoredListPaneAppearanceFields(appearance: ListPaneAppearance | undefined): ListPaneAppearanceFields | null {
    if (!appearance) {
        return null;
    }

    const normalized: ListPaneAppearanceFields = {};
    if (appearance.mode === 'standard' || appearance.mode === 'compact') {
        normalized.mode = appearance.mode;
    }
    if (isValidTitleRows(appearance.titleRows)) {
        normalized.titleRows = appearance.titleRows;
    }
    if (isValidPreviewRows(appearance.previewRows)) {
        normalized.previewRows = appearance.previewRows;
    }
    LIST_PANE_TOGGLE_KEYS.forEach(key => {
        if (typeof appearance[key] === 'boolean') {
            normalized[key] = appearance[key];
        }
    });
    if (isTextCountDisplay(appearance.textCount)) {
        normalized.textCount = appearance.textCount;
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
}

export function hasStoredListPaneAppearanceOverride(appearance: ListPaneAppearance | undefined): boolean {
    return getStoredListPaneAppearanceFields(appearance) !== null;
}

export function areStoredListPaneAppearanceFieldsEqual(
    left: ListPaneAppearance | undefined,
    right: ListPaneAppearance | undefined
): boolean {
    const normalizedLeft = getStoredListPaneAppearanceFields(left);
    const normalizedRight = getStoredListPaneAppearanceFields(right);
    if (!normalizedLeft || !normalizedRight) {
        return normalizedLeft === normalizedRight;
    }

    return LIST_PANE_APPEARANCE_FIELD_KEYS.every(key => normalizedLeft[key] === normalizedRight[key]);
}

/** Combines appearance-only fields with grouping while keeping the two toolbar concerns independent. */
export function mergeListPaneAppearanceAndGrouping(
    appearanceFields: ListPaneAppearanceFields | null,
    groupBy: ListNoteGroupingOption | undefined
): ListPaneAppearance | null {
    const merged: ListPaneAppearance = appearanceFields ? { ...appearanceFields } : {};
    if (groupBy !== undefined) {
        merged.groupBy = groupBy;
    }
    return Object.keys(merged).length > 0 ? merged : null;
}

function areAppearanceValuesEqual(left: ListPaneAppearance, right: ListPaneAppearance): boolean {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);
    return leftKeys.length === rightKeys.length && leftKeys.every(key => leftRecord[key] === rightRecord[key]);
}

function areAppearanceMapsEqual<T extends ListPaneAppearance>(left: Record<string, T>, right: Record<string, T> | undefined): boolean {
    const rightRecord = right ?? {};
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(rightRecord);
    return (
        leftKeys.length === rightKeys.length &&
        leftKeys.every(key => {
            if (!Object.prototype.hasOwnProperty.call(rightRecord, key)) {
                return false;
            }
            const rightValue = rightRecord[key];
            return rightValue !== undefined && areAppearanceValuesEqual(left[key], rightValue);
        })
    );
}

function cloneAppearanceMap<T extends ListPaneAppearance>(map: Record<string, T> | undefined): Record<string, T> {
    const cloned = Object.create(null) as Record<string, T>;
    Object.entries(map ?? {}).forEach(([key, value]) => {
        cloned[key] = { ...value };
    });
    return cloned;
}

/**
 * Returns an immutable appearance-map snapshot, reusing the previous snapshot when its contents
 * still match. Settings are mutated in place, so reference equality alone cannot detect changes;
 * comparing with the previous clone preserves both mutation isolation and stable context identity.
 */
export function snapshotListPaneAppearanceMap<T extends ListPaneAppearance>(
    map: Record<string, T> | undefined,
    previous?: Record<string, T>
): Record<string, T> {
    if (previous && areAppearanceMapsEqual(previous, map)) {
        return previous;
    }
    return cloneAppearanceMap(map);
}

export function getDefaultListMode(settings: NotebookNavigatorSettings): ListDisplayMode {
    return settings.defaultListMode === 'compact' ? 'compact' : 'standard';
}

/** Resolve the effective list mode for a stored selection appearance. */
function resolveListMode({ appearance, defaultMode }: { appearance?: ListPaneAppearance; defaultMode: ListDisplayMode }): ListDisplayMode {
    if (appearance?.mode === 'compact' || appearance?.mode === 'standard') {
        return appearance.mode;
    }

    return defaultMode;
}

/**
 * Resolves the effective list pane appearance for a selection.
 *
 * Per-selection toggles replace the global per-file display setting, but structural gates stay
 * global: tags require the master tag setting because tag content is only extracted when it is on,
 * compact mode keeps its own global tag/property visibility, and the compact row layout never
 * renders previews, images, dates, parent folders, or task progress.
 */
export function resolveListPaneAppearance({
    settings,
    appearance,
    selectionType
}: {
    settings: NotebookNavigatorSettings;
    appearance?: ListPaneAppearance;
    selectionType: ItemType;
}): ListPaneAppearanceSettings {
    const mode = resolveListMode({ appearance, defaultMode: getDefaultListMode(settings) });
    const isCompact = mode === 'compact';
    const showTags =
        settings.showTags && (appearance?.showTags ?? settings.showFileTags) && (!isCompact || settings.showFileTagsInCompactMode);
    const showProperties =
        (appearance?.showProperties ?? settings.showFileProperties) && (!isCompact || settings.showFilePropertiesInCompactMode);
    const showTaskProgress = (appearance?.showTaskProgress ?? settings.showFileTaskProgress) && !isCompact;
    const previewRowsOverride = isValidPreviewRows(appearance?.previewRows) ? appearance.previewRows : undefined;
    // Property-placed counts render as pills, so they are unavailable when compact mode hides pills.
    const textCountUnavailable = isCompact && settings.textCountPlacement === 'property' && !settings.showFilePropertiesInCompactMode;
    const textCountDisplay = textCountUnavailable ? 'none' : (appearance?.textCount ?? settings.textCountDisplay);
    const grouping = resolveListGroupingOverride({
        noteGrouping: settings.noteGrouping,
        selectionType,
        groupBy: appearance?.groupBy
    });

    return {
        mode,
        titleRows: isValidTitleRows(appearance?.titleRows) ? appearance.titleRows : settings.fileNameRows,
        // Zero hides preview text, but the configured row count still sizes feature-image and pill layouts.
        previewRows: previewRowsOverride && previewRowsOverride > 0 ? previewRowsOverride : settings.previewRows,
        showDate: !isCompact && (appearance?.showDate ?? settings.showFileDate),
        showParentFolder: !isCompact && (appearance?.showParentFolder ?? settings.showParentFolder),
        showPreview: !isCompact && settings.showFilePreview && previewRowsOverride !== 0,
        showImage: !isCompact && settings.showFeatureImage,
        showTags,
        showProperties,
        showTaskProgress,
        textCountDisplay,
        groupBy: grouping.effectiveGrouping
    };
}
