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
import { useNavigationSelection } from '../context/SelectionContext';
import { resolveListPaneAppearance } from '../settings/listPaneAppearance';
import { ItemType } from '../types';

/**
 * Hook to get effective appearance settings for the current folder, tag, or property selection.
 */
export function useListPaneAppearance() {
    const settings = useSettingsState();
    const { selectedFolder, selectedTag, selectedProperty, selectionType } = useNavigationSelection();
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
    return useMemo(
        () => resolveListPaneAppearance({ settings, appearance: selectedAppearance, selectionType }),
        [selectedAppearance, selectionType, settings]
    );
}
