// Shared types and constants for Notebook Navigator

export const VIEW_TYPE_NOTEBOOK = 'notebook-navigator-view';

export type FocusedPane = 'folders' | 'files';

export interface LocalStorageKeys {
    expandedFoldersKey: string;
    selectedFolderKey: string;
    selectedFileKey: string;
    leftPaneWidthKey: string;
}