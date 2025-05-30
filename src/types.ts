/**
 * Shared types and constants for Notebook Navigator
 * Centralizes type definitions used across multiple modules
 */

/**
 * Unique identifier for the Notebook Navigator view type
 * Used by Obsidian to register and manage the custom view
 */
export const VIEW_TYPE_NOTEBOOK = 'notebook-navigator-view';

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
    selectedFolderKey: string;
    selectedFileKey: string;
    leftPaneWidthKey: string;
}