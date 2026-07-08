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

import React from 'react';
import type { App, TFile, TFolder } from 'obsidian';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { FileVisibility } from '../../utils/fileTypeUtils';
import type { NoteCountInfo } from '../../types/noteCounts';
import type { CombinedNavigationItem } from '../../types/virtualization';
import type { NavigationSectionId } from '../../types';
import type {
    NavigationPaneShortcutRowHandlers,
    NavigationPaneShortcutUiState
} from '../../hooks/navigationPane/navigationPaneShortcutTypes';
import type { NavigationPaneTreeInteractionsResult } from '../../hooks/navigationPane/useNavigationPaneTreeInteractions';
import type { NavigationSearchHighlightsResult } from '../../hooks/navigationPane/useNavigationSearchHighlights';
export type NavigationInlineRenameTarget =
    | { type: 'folder'; id: string; initialValue: string }
    | { type: 'tag'; id: string; initialValue: string; displayPath: string }
    | { type: 'property'; id: string; initialValue: string; normalizedKey: string };

export interface NavigationInlineRenameActions {
    startFolder: (folder: TFolder) => boolean;
    commit: (target: NavigationInlineRenameTarget, value: string) => Promise<boolean>;
    cancel: () => void;
    restoreFocus: () => void;
}

/** Per-row state that changes with selection, expansion, inline rename, and shortcut drag; passed as row props so memoized rows re-render only when their own values change */
export interface NavigationPaneRowHotState {
    isSelected: boolean;
    isExpanded: boolean;
    renameTarget: NavigationInlineRenameTarget | null;
    isDragSource: boolean;
}

export interface NavigationPaneRowContext {
    app: App;
    settings: NotebookNavigatorSettings;
    isMobile: boolean;
    indentGuideLevelsByKey: Map<string, number[]>;
    firstSectionId: NavigationSectionId | null;
    firstInlineFolderPath: string | null;
    shouldPinShortcuts: boolean;
    showHiddenItems: boolean;
    folderCounts: Map<string, NoteCountInfo>;
    tagCounts: Map<string, NoteCountInfo>;
    propertyCounts: Map<string, NoteCountInfo>;
    vaultChangeVersion: number;
    fileVisibility: FileVisibility;
    hiddenFolders: string[];
    descendantExcludedFolders: string[];
    getFileDisplayName: (file: TFile) => string;
    getFileTimestamps: (file: TFile) => { created: number; modified: number };
    getFileWordCount: (file: TFile) => number | null;
    getSolidBackground: (color?: string | null) => string | undefined;
    shortcuts: NavigationPaneShortcutRowHandlers;
    shortcutUiState: NavigationPaneShortcutUiState;
    tree: NavigationPaneTreeInteractionsResult;
    searchHighlights: NavigationSearchHighlightsResult;
    inlineRename: NavigationInlineRenameActions;
    onSectionContextMenu: (
        event: React.MouseEvent<HTMLDivElement>,
        sectionId: NavigationSectionId,
        options?: { allowSeparator?: boolean }
    ) => void;
}

export interface NavigationPaneRowProps extends NavigationPaneRowHotState {
    item: CombinedNavigationItem;
    context: NavigationPaneRowContext;
    adjacentFilledClassName?: string;
}
