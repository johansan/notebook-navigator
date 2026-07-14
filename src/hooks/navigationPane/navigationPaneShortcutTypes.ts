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
import type { TFile, TFolder } from 'obsidian';
import type { DragEndEvent, DragStartEvent, SensorDescriptor } from '@dnd-kit/core';
import type { NoteCountInfo } from '../../types/noteCounts';
import type { SearchShortcut } from '../../types/shortcuts';
import type { ListReorderHandlers } from '../../types/listReorder';
import type { VirtualFolderTrailingAction } from '../../components/VirtualFolderItem';

export type ShortcutContextMenuTarget =
    | { type: 'folder'; key: string; folder: TFolder }
    | { type: 'note'; key: string; file: TFile }
    | { type: 'tag'; key: string; tagPath: string }
    | { type: 'property'; key: string; propertyNodeId: string }
    | { type: 'search'; key: string; searchShortcut: SearchShortcut }
    | { type: 'missing'; key: string; kind: 'folder' | 'note' | 'tag' | 'property' };

export interface NavigationPaneShortcutRenderState {
    shouldUseShortcutDnd: boolean;
    allowEmptyShortcutDrop: boolean;
    shortcutDragHandleConfig: { visible: true; only: true } | undefined;
    shortcutHeaderTrailingAction: VirtualFolderTrailingAction;
    propertiesHeaderTrailingAction: VirtualFolderTrailingAction;
    shortcutNumberBadgesByKey: Map<string, string>;
    shouldShowShortcutCounts: boolean;
    removeShortcut: (key: string) => Promise<boolean>;
    handleShortcutFolderActivate: (folder: TFolder, shortcutKey: string) => void;
    handleShortcutFolderNoteClick: (folder: TFolder, shortcutKey: string, event: React.MouseEvent<HTMLSpanElement>) => void;
    handleShortcutFolderNoteMouseDown: (folder: TFolder, event: React.MouseEvent<HTMLSpanElement>) => void;
    handleShortcutNoteActivate: (note: TFile, shortcutKey: string, event?: React.MouseEvent<HTMLDivElement>) => void;
    handleShortcutNoteMouseDown: (event: React.MouseEvent<HTMLDivElement>, note: TFile) => void;
    handleRecentNoteActivate: (note: TFile, event?: React.MouseEvent<HTMLDivElement>) => void;
    handleShortcutSearchActivate: (shortcutKey: string, searchShortcut: SearchShortcut) => void;
    handleShortcutTagActivate: (tagPath: string, shortcutKey: string) => void;
    handleShortcutPropertyActivate: (propertyNodeId: string, shortcutKey: string) => boolean;
    handleShortcutContextMenu: (event: React.MouseEvent<HTMLDivElement>, target: ShortcutContextMenuTarget) => void;
    handleRecentFileContextMenu: (event: React.MouseEvent<HTMLDivElement>, file: TFile) => void;
    handleShortcutRootDragOver: (event: React.DragEvent<HTMLElement>) => void;
    handleShortcutRootDrop: (event: React.DragEvent<HTMLElement>) => void;
    buildShortcutExternalHandlers: (key: string) => ListReorderHandlers;
    getFolderShortcutCount: (folder: TFolder) => NoteCountInfo;
    getTagShortcutCount: (tagPath: string) => NoteCountInfo;
    getPropertyShortcutCount: (propertyNodeId: string) => NoteCountInfo;
    getMissingNoteLabel: (path: string) => string;
}

/** Shortcut state read during row render; row context includes it as a reactive member so rows re-render on change */
export type NavigationPaneShortcutUiState = Pick<
    NavigationPaneShortcutRenderState,
    | 'shouldUseShortcutDnd'
    | 'allowEmptyShortcutDrop'
    | 'shortcutDragHandleConfig'
    | 'shortcutHeaderTrailingAction'
    | 'propertiesHeaderTrailingAction'
    | 'shortcutNumberBadgesByKey'
    | 'shouldShowShortcutCounts'
>;

/** Shortcut handlers and lookups exposed to rows through an identity-stable facade */
export type NavigationPaneShortcutRowHandlers = Omit<NavigationPaneShortcutRenderState, keyof NavigationPaneShortcutUiState>;

export interface NavigationPaneShortcutsResult extends NavigationPaneShortcutRenderState {
    activeShortcutId: string | null;
    shortcutsExpanded: boolean;
    setShortcutsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    recentNotesExpanded: boolean;
    setRecentNotesExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    activeShortcutKey: string | null;
    clearActiveShortcut: () => void;
    pinToggleLabel: string;
    handleShortcutSplitToggle: () => void;
    isShortcutSorting: boolean;
    shortcutIds: string[];
    shortcutSensors: SensorDescriptor<object>[];
    handleShortcutDragStart: (event: DragStartEvent) => void;
    handleShortcutDragEnd: (event: DragEndEvent) => void;
    handleShortcutDragCancel: () => void;
    shortcutsCount: number;
    tagShortcutKeysByPath: Map<string, string>;
    propertyShortcutKeysByNodeId: Map<string, string>;
    clearShortcuts: () => Promise<boolean>;
    addTagShortcut: (tagPath: string, options?: { index?: number }) => Promise<boolean>;
    addPropertyShortcut: (nodeId: string, options?: { index?: number }) => Promise<boolean>;
    openShortcutByNumber: (shortcutNumber: number) => Promise<boolean>;
}
