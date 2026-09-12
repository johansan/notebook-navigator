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

import type { Dispatch } from 'react';
import type { TFile, TFolder } from 'obsidian';
import type { NavigationItemType } from '../../types';
import type { PropertySelectionNodeId } from '../../utils/propertyTree';

export type SelectionRevealSource = 'auto' | 'manual' | 'shortcut' | 'startup';
export type SelectionHistoryBehavior = 'record' | 'replace' | 'skip';

export interface SelectionHistoryEntry {
    type: NavigationItemType;
    value: string;
}

export interface SelectionState {
    selectionType: NavigationItemType;
    selectedFolder: TFolder | null;
    selectedTag: string | null;
    selectedProperty: PropertySelectionNodeId | null;
    selectedFiles: Set<string>;
    anchorIndex: number | null;
    lastMovementDirection: 'up' | 'down' | null;
    isRevealOperation: boolean;
    isFolderChangeWithAutoSelect: boolean;
    isKeyboardNavigation: boolean;
    isFolderNavigation: boolean;
    selectedFile: TFile | null;
    revealSource: SelectionRevealSource | null;
    navigationHistory: SelectionHistoryEntry[];
    navigationHistoryIndex: number;
}

/** One moved file for CLEANUP_MOVED_FILES. `file.path` already holds the post-move path. */
export interface MovedFileSelectionUpdate {
    file: TFile;
    originalPath: string;
    /** Whether the file still belongs to the list the selection was made in, evaluated after the move. */
    inCurrentList: boolean;
}

export type SelectionAction =
    | {
          type: 'SET_SELECTED_FOLDER';
          folder: TFolder | null;
          autoSelectedFile?: TFile | null;
          source?: SelectionRevealSource;
          historyBehavior?: SelectionHistoryBehavior;
          historyIndex?: number;
      }
    | {
          type: 'SET_SELECTED_TAG';
          tag: string | null;
          autoSelectedFile?: TFile | null;
          source?: SelectionRevealSource;
          historyBehavior?: SelectionHistoryBehavior;
          historyIndex?: number;
      }
    | {
          type: 'SET_SELECTED_PROPERTY';
          nodeId: PropertySelectionNodeId;
          autoSelectedFile?: TFile | null;
          source?: SelectionRevealSource;
          historyBehavior?: SelectionHistoryBehavior;
          historyIndex?: number;
      }
    | { type: 'SET_SELECTED_FILE'; file: TFile | null }
    | { type: 'SET_SELECTION_TYPE'; selectionType: NavigationItemType }
    | { type: 'CLEAR_SELECTION' }
    | {
          type: 'REVEAL_FILE';
          file: TFile;
          preserveFolder?: boolean;
          isManualReveal?: boolean;
          targetTag?: string | null;
          targetProperty?: PropertySelectionNodeId | null;
          source?: SelectionRevealSource;
          targetFolder?: TFolder | null;
          historyBehavior?: SelectionHistoryBehavior;
          historyIndex?: number;
      }
    | { type: 'CLEAR_REVEAL_OPERATION' }
    | { type: 'CLEANUP_DELETED_FOLDER'; deletedPath: string }
    | { type: 'CLEANUP_DELETED_FILE'; deletedPath: string; nextFileToSelect?: TFile | null }
    | { type: 'CLEANUP_MOVED_FILES'; movedFiles: readonly MovedFileSelectionUpdate[] }
    | { type: 'TOGGLE_FILE_SELECTION'; file: TFile; anchorIndex?: number }
    | { type: 'EXTEND_SELECTION'; toIndex: number; files: TFile[]; allFiles: TFile[] }
    | { type: 'CLEAR_FILE_SELECTION' }
    | { type: 'SET_FILE_SELECTION'; files: TFile[]; selectedFile: TFile }
    | {
          type: 'APPLY_FILE_SELECTION';
          selectedFiles: ReadonlySet<string>;
          selectedFile: TFile | null;
          anchorIndex?: number | null;
          lastMovementDirection?: 'up' | 'down' | null;
      }
    | { type: 'SET_ANCHOR_INDEX'; index: number | null }
    | { type: 'SET_MOVEMENT_DIRECTION'; direction: 'up' | 'down' | null }
    | { type: 'UPDATE_CURRENT_FILE'; file: TFile }
    | { type: 'TOGGLE_WITH_CURSOR'; file: TFile; anchorIndex?: number }
    | { type: 'SET_KEYBOARD_NAVIGATION'; isKeyboardNavigation: boolean }
    | { type: 'SET_FOLDER_CHANGE_WITH_AUTO_SELECT'; isFolderChangeWithAutoSelect: boolean }
    | { type: 'UPDATE_FILE_PATH'; oldPath: string; newPath: string }
    | { type: 'SET_FOLDER_NAVIGATION'; isFolderNavigation: boolean };

export type SelectionDispatch = Dispatch<SelectionAction>;
