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

import { Menu, TFile, TFolder, App } from 'obsidian';
import { ItemType } from '../../types';
import type { VisibilityPreferences } from '../../types';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { FileSystemOperations } from '../../services/FileSystemService';
import { MetadataService } from '../../services/MetadataService';
import { PropertyOperations } from '../../services/PropertyOperations';
import { TagOperations } from '../../services/TagOperations';
import { TagTreeService } from '../../services/TagTreeService';
import type { PropertyTreeService } from '../../services/PropertyTreeService';
import { CommandQueueService } from '../../services/CommandQueueService';
import { SelectionState, SelectionAction } from '../../context/SelectionContext';
import type NotebookNavigatorPlugin from '../../main';
import { ExpansionAction } from '../../context/ExpansionContext';
import { UIAction } from '../../context/UIStateContext';
import type { ShortcutsContextValue } from '../../context/ShortcutsContext';

/**
 * Configuration for the context menu
 */
// Special menu type for empty areas in the list pane
export const EMPTY_LIST_MENU_TYPE = 'empty-list' as const;

export type MenuConfig =
    | {
          type: typeof ItemType.FILE;
          item: TFile;
          options?: FileMenuOptions;
      }
    | {
          type: typeof ItemType.FOLDER;
          item: TFolder;
          options?: FolderMenuOptions;
      }
    | {
          type: typeof ItemType.TAG;
          item: string; // Tag path
      }
    | {
          type: typeof ItemType.PROPERTY;
          item: string; // Property node id
      }
    | {
          type: typeof EMPTY_LIST_MENU_TYPE;
          item: TFolder | null;
          options?: EmptyListMenuOptions;
      };

/**
 * Services available to menu builders
 */
export interface MenuServices {
    app: App;
    plugin: NotebookNavigatorPlugin;
    isMobile: boolean;
    fileSystemOps: FileSystemOperations;
    metadataService: MetadataService;
    tagOperations: TagOperations;
    propertyOperations: PropertyOperations;
    tagTreeService: TagTreeService | null;
    propertyTreeService: PropertyTreeService | null;
    commandQueue: CommandQueueService | null;
    shortcuts: ShortcutsContextValue | null;
    visibility: VisibilityPreferences;
}

/**
 * State values available to menu builders
 */
export interface MenuState {
    selectionState: SelectionState;
    expandedFolders: Set<string>;
    expandedTags: Set<string>;
    expandedProperties: Set<string>;
}

/**
 * Dispatch functions available to menu builders
 */
export interface MenuDispatchers {
    selectionDispatch: (action: SelectionAction) => void;
    expansionDispatch: (action: ExpansionAction) => void;
    uiDispatch: (action: UIAction) => void;
}

/**
 * Common parameters for all menu builders
 */
export interface MenuBuilderParams {
    menu: Menu;
    services: MenuServices;
    settings: NotebookNavigatorSettings;
    state: MenuState;
    dispatchers: MenuDispatchers;
}

export interface FolderMenuOptions {
    disableNavigationSeparatorActions?: boolean;
    onStartInlineRename?: (folder: TFolder) => boolean;
}

export interface TagMenuOptions {
    disableNavigationSeparatorActions?: boolean;
}

export interface PropertyMenuOptions {
    disableNavigationSeparatorActions?: boolean;
}

export interface FileMenuOptions {
    source?: 'list-pane';
    orderedFiles?: readonly TFile[];
    onStartInlineRename?: (file: TFile) => boolean;
}

export interface EmptyListMenuOptions {
    orderedFiles?: readonly TFile[];
    onStartInlineRename?: (file: TFile) => boolean;
}

/**
 * Parameters for folder menu builder
 */
export interface FolderMenuBuilderParams extends MenuBuilderParams {
    folder: TFolder;
    options?: FolderMenuOptions;
}

/**
 * Parameters for tag menu builder
 */
export interface TagMenuBuilderParams extends MenuBuilderParams {
    tagPath: string;
    options?: TagMenuOptions;
}

/**
 * Parameters for property menu builder
 */
export interface PropertyMenuBuilderParams extends MenuBuilderParams {
    propertyNodeId: string;
    options?: PropertyMenuOptions;
}

/**
 * Parameters for file menu builder
 */
export interface FileMenuBuilderParams extends MenuBuilderParams {
    file: TFile;
    options?: FileMenuOptions;
}
