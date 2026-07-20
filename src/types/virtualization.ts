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

import { TFile, TFolder } from 'obsidian';
import { ListPaneItemType, NavigationPaneItemType, VirtualFolder } from '../types';
import type { AliasSearchMatch, SearchResultMeta } from './search';
import { PropertyTreeNode, TagTreeNode } from '../types/storage';
import type { SearchShortcut, ShortcutEntry } from '../types/shortcuts';
import type { NoteCountInfo } from '../types/noteCounts';
import type { ManualSortGroupHeaderData } from '../utils/manualSort';

export interface VirtualItem<T> {
    type: string;
    data: T;
    key: string;
    level?: number; // For hierarchical items
}

export type ListPaneHeaderKind = 'date' | 'folder' | 'pinned' | 'section' | 'manual-sort-custom';

export interface ListPaneFolderPathSegment {
    label: string;
    path: string;
}

export interface ListPaneItem {
    type: ListPaneItemType;
    data: TFile | string; // File, header text, or spacer payload
    parentFolder?: string | null;
    // Folder path associated with a folder-group header.
    // Present only when grouping by folder in the list pane.
    headerFolderPath?: string | null;
    // Visible path segments for a folder-group header when folder group paths are shown.
    headerFolderSegments?: ListPaneFolderPathSegment[];
    // Markdown file path that owns a manual sort custom header.
    // Present only on manual-sort-custom headers.
    manualSortHeaderFilePath?: string | null;
    // File paths belonging to this rendered group. Used by group-header actions even when the group is collapsed.
    groupFilePaths?: string[];
    // Whether a manual sort custom header label depends on stored word counts.
    manualSortHeaderShowsWordCount?: boolean;
    // Parsed manual sort custom header display data.
    manualSortHeader?: ManualSortGroupHeaderData;
    // Accumulated word count for the manual sort custom header segment.
    manualSortHeaderWordCount?: number;
    // Resolved target word count for the manual sort custom header segment.
    manualSortHeaderTargetWordCount?: number | null;
    headerKind?: ListPaneHeaderKind;
    collapseKey?: string;
    isCollapsed?: boolean;
    key: string;
    // Pre-computed file index for stable onClick handlers
    fileIndex?: number;
    // Indicates if this file is pinned
    isPinned?: boolean;
    searchMeta?: SearchResultMeta;
    matchedAliases?: readonly AliasSearchMatch[];
    // Pre-computed flag indicating if file has tags (for height calculation optimization)
    hasTags?: boolean;
    // Marks files that are normally hidden (frontmatter or excluded folders) but shown via "show hidden items"
    isHidden?: boolean;
}

export interface FolderTreeItem {
    type: typeof NavigationPaneItemType.FOLDER;
    data: TFolder;
    level: number;
    path: string;
    key: string;
    displayName?: string;
    color?: string;
    backgroundColor?: string;
    icon?: string;
    parsedExcludedFolders?: string[];
    isExcluded?: boolean;
}

export interface TagTreeItem {
    type: typeof NavigationPaneItemType.TAG;
    data: TagTreeNode;
    level: number;
    path?: string;
    key: string;
    noteCount?: NoteCountInfo;
    color?: string;
    backgroundColor?: string;
    icon?: string;
    isHidden?: boolean; // Marks tags that are normally hidden but being shown
}

export interface UntaggedItem {
    type: typeof NavigationPaneItemType.UNTAGGED;
    data: TagTreeNode;
    level: number;
    key: string;
    noteCount?: NoteCountInfo;
    color?: string;
    backgroundColor?: string;
    icon?: string;
}

export interface PropertyKeyTreeItem {
    type: typeof NavigationPaneItemType.PROPERTY_KEY;
    data: PropertyTreeNode;
    level: number;
    key: string;
    color?: string;
    backgroundColor?: string;
    icon?: string;
}

export interface PropertyValueTreeItem {
    type: typeof NavigationPaneItemType.PROPERTY_VALUE;
    data: PropertyTreeNode;
    level: number;
    key: string;
    color?: string;
    backgroundColor?: string;
    icon?: string;
}

export interface VirtualFolderItem {
    type: typeof NavigationPaneItemType.VIRTUAL_FOLDER;
    data: VirtualFolder;
    level: number;
    key: string;
    color?: string;
    backgroundColor?: string;
    isSelectable?: boolean;
    isSelected?: boolean;
    tagCollectionId?: string;
    propertyCollectionId?: string;
    // Pre-computed child presence flag used for rendering the expander chevron and for keyboard expand/collapse decisions.
    // Some virtual folders are backed by dynamic data (e.g. recent notes, shortcuts), where the source list can contain
    // entries that do not render (deleted/missing items). This flag reflects whether expansion would render any children.
    hasChildren?: boolean;
    showFileCount?: boolean;
    noteCount?: NoteCountInfo;
}

interface ShortcutNavigationBase {
    shortcut: ShortcutEntry;
    level: number;
    key: string;
    icon?: string;
    color?: string;
    backgroundColor?: string;
    isExcluded?: boolean;
    isMissing?: boolean;
    missingLabel?: string;
}

export interface ShortcutHeaderItem {
    type: typeof NavigationPaneItemType.SHORTCUT_HEADER;
    key: string;
    level: number;
    count: number;
}

export interface ShortcutFolderNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_FOLDER;
    folder: TFolder | null;
    displayName?: string;
}

export interface ShortcutNoteNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_NOTE;
    note: TFile | null;
}

export interface RecentNoteNavItem {
    type: typeof NavigationPaneItemType.RECENT_NOTE;
    note: TFile;
    level: number;
    key: string;
    icon?: string;
    color?: string;
    backgroundColor?: string;
}

export interface ShortcutSearchNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_SEARCH;
    searchShortcut: SearchShortcut;
}

export interface ShortcutTagNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_TAG;
    tagPath: string;
    displayName: string;
}

export interface ShortcutPropertyNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_PROPERTY;
    propertyNodeId: string;
    displayName: string;
}

export interface RootSpacerItem {
    type: typeof NavigationPaneItemType.ROOT_SPACER;
    key: string;
    spacing: number;
}

export interface TopSpacerItem {
    type: typeof NavigationPaneItemType.TOP_SPACER;
    key: string;
    hasSeparator?: boolean;
}

export interface BottomSpacerItem {
    type: typeof NavigationPaneItemType.BOTTOM_SPACER;
    key: string;
}

export interface ListSpacerItem {
    type: typeof NavigationPaneItemType.LIST_SPACER;
    key: string;
    hasSeparator?: boolean;
}

export type CombinedNavigationItem =
    | FolderTreeItem
    | VirtualFolderItem
    | TagTreeItem
    | UntaggedItem
    | PropertyKeyTreeItem
    | PropertyValueTreeItem
    | ShortcutHeaderItem
    | ShortcutFolderNavItem
    | ShortcutNoteNavItem
    | RecentNoteNavItem
    | ShortcutSearchNavItem
    | ShortcutTagNavItem
    | ShortcutPropertyNavItem
    | RootSpacerItem
    | TopSpacerItem
    | BottomSpacerItem
    | ListSpacerItem;
