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

import { useMemo } from 'react';
import { useSettingsState } from '../context/SettingsContext';
import { useSelectionState } from '../context/SelectionContext';
import type { ListDisplayMode, ListNoteGroupingOption } from '../settings/types';
import type { NotebookNavigatorSettings } from '../settings';
import { ItemType } from '../types';
import { resolveListGroupingOverride } from '../utils/listGrouping';

export interface FolderAppearance {
    mode?: ListDisplayMode;
    titleRows?: number;
    previewRows?: number;
    groupBy?: ListNoteGroupingOption;
}

export type TagAppearance = FolderAppearance;

export interface ListPaneAppearanceSettings {
    mode: ListDisplayMode;
    titleRows: number;
    previewRows: number;
    showDate: boolean;
    showPreview: boolean;
    showImage: boolean;
    groupBy: ListNoteGroupingOption;
}

export function getDefaultListMode(settings: NotebookNavigatorSettings): ListDisplayMode {
    return settings.defaultListMode === 'compact' ? 'compact' : 'standard';
}

/**
 * Resolve the effective list mode for a folder/tag appearance.
 */
export function resolveListMode({
    appearance,
    defaultMode
}: {
    appearance?: FolderAppearance;
    defaultMode: ListDisplayMode;
}): ListDisplayMode {
    if (appearance?.mode === 'compact' || appearance?.mode === 'standard') {
        return appearance.mode;
    }

    return defaultMode;
}

interface VisibilityDefaults {
    showFileDate: boolean;
    showFilePreview: boolean;
    showFeatureImage: boolean;
}

/** Return visibility flags for a given list mode */
function getVisibilityForMode(mode: ListDisplayMode, defaults: VisibilityDefaults) {
    if (mode === 'compact') {
        return {
            showDate: false,
            showPreview: false,
            showImage: false
        };
    }

    return {
        showDate: defaults.showFileDate,
        showPreview: defaults.showFilePreview,
        showImage: defaults.showFeatureImage
    };
}

/**
 * Hook to get effective appearance settings for the current selection (folder or tag)
 * Merges folder/tag-specific settings with defaults
 */
export function useListPaneAppearance() {
    const settings = useSettingsState();
    const { selectedFolder, selectedTag, selectedProperty, selectionType } = useSelectionState();
    const selectedFolderPath = selectionType === ItemType.FOLDER ? (selectedFolder?.path ?? null) : null;
    const selectedTagPath = selectionType === ItemType.TAG ? selectedTag : null;
    const selectedPropertyNodeId = selectionType === ItemType.PROPERTY ? selectedProperty : null;
    const selectedAppearance =
        selectedFolderPath !== null
            ? settings.folderAppearances?.[selectedFolderPath]
            : selectedTagPath !== null
              ? settings.tagAppearances?.[selectedTagPath]
              : selectedPropertyNodeId !== null
                ? settings.propertyAppearances?.[selectedPropertyNodeId]
                : undefined;
    const selectedMode = selectedAppearance?.mode;
    const selectedTitleRows = selectedAppearance?.titleRows;
    const selectedPreviewRows = selectedAppearance?.previewRows;
    const selectedGroupBy = selectedAppearance?.groupBy;
    const { defaultListMode, fileNameRows, noteGrouping, previewRows, showFeatureImage, showFileDate, showFilePreview } = settings;

    return useMemo<ListPaneAppearanceSettings>(() => {
        const defaultMode = defaultListMode === 'compact' ? 'compact' : 'standard';
        const appearance = {
            mode: selectedMode,
            titleRows: selectedTitleRows,
            previewRows: selectedPreviewRows
        };
        const mode = resolveListMode({ appearance, defaultMode });
        const visibility = getVisibilityForMode(mode, { showFileDate, showFilePreview, showFeatureImage });
        const grouping = resolveListGroupingOverride({
            noteGrouping,
            selectionType,
            groupBy: selectedGroupBy
        });
        return {
            mode,
            titleRows: selectedTitleRows ?? fileNameRows,
            previewRows: selectedPreviewRows ?? previewRows,
            showDate: visibility.showDate,
            showPreview: visibility.showPreview,
            showImage: visibility.showImage,
            groupBy: grouping.effectiveGrouping
        };
    }, [
        defaultListMode,
        fileNameRows,
        noteGrouping,
        previewRows,
        selectedMode,
        selectedTitleRows,
        selectedPreviewRows,
        selectedGroupBy,
        showFeatureImage,
        showFileDate,
        showFilePreview,
        selectionType
    ]);
}
