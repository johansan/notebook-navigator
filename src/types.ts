/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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

/**
 * Shared types and constants for Notebook Navigator
 * Centralizes type definitions used across multiple modules
 */

/**
 * Unique identifier for the Notebook Navigator view type
 * Used by Obsidian to register and manage the custom view
 */
export const VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT = 'notebook-navigator-react-view';

/**
 * Special tag identifier for untagged notes
 * Using double underscore to avoid conflicts with real tags
 */
export const UNTAGGED_TAG_ID = '__untagged__';

/**
 * Identifies which pane currently has keyboard focus
 * Used for keyboard navigation between folder tree and file list
 */
export type FocusedPane = 'folders' | 'files';

/**
 * Keys used for persisting state in browser localStorage
 * Ensures consistent key naming across the plugin
 */
export interface LocalStorageKeys {
    expandedFoldersKey: string;
    expandedTagsKey: string;
    expandedBacklinksKey: string;
    selectedFolderKey: string;
    selectedFileKey: string;
    leftPaneWidthKey: string;
}

/**
 * Data attributes for drag-and-drop functionality using event delegation
 * These attributes are added to DOM elements to enable drag-drop without individual event listeners
 */
export interface DragDropAttributes {
    // Draggable element attributes
    'data-draggable'?: 'true';
    'data-drag-type'?: 'file' | 'folder';
    'data-drag-path'?: string;
    'data-drag-handle'?: 'true';
    
    // Drop zone attributes
    'data-drop-zone'?: 'folder';
    'data-drop-path'?: string;
    'data-drop-validator'?: 'folder';
    
    // Interaction attributes
    'data-clickable'?: 'folder' | 'file';
    'data-click-path'?: string;
    'data-dblclick-action'?: 'expand' | 'preview';
    'data-context-menu'?: 'folder' | 'file';
    
    // State attributes
    'data-expanded'?: 'true' | 'false';
    'data-selected'?: 'true' | 'false';
    'data-focused'?: 'true' | 'false';
    
    // Index for keyboard navigation
    'data-index'?: string;
    
    // Nesting level for folders
    'data-level'?: string;
}

/**
 * Combined attributes interface for DOM elements
 * Extends standard HTML attributes with our custom data attributes
 */
export interface NavigatorElementAttributes extends DragDropAttributes {
    'data-path': string;  // Required path attribute for all items
    'class'?: string;
    'draggable'?: 'true' | 'false';
    'aria-label'?: string;
    'aria-expanded'?: 'true' | 'false';
    'aria-selected'?: 'true' | 'false';
}

/**
 * Type guard to check if an element has drag-drop attributes
 */
export function hasDragDropAttributes(el: Element): el is HTMLElement {
    return el instanceof HTMLElement && 
           (el.hasAttribute('data-draggable') || 
            el.hasAttribute('data-drop-zone'));
}