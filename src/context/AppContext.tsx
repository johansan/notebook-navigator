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

// src/context/AppContext.tsx
import React, { createContext, useContext, useMemo, useEffect, useReducer } from 'react';
import { App, TFile, TFolder } from 'obsidian';
import NotebookNavigatorPlugin from '../main';
import { isTFolder, isTFile } from '../utils/typeGuards';

/**
 * Global application state interface.
 * Manages the current state of the Notebook Navigator plugin.
 */
export interface AppState {
    /** Type of selection - either folder or tag */
    selectionType: 'folder' | 'tag' | 'backlink';
    /** Currently selected folder in the folder tree */
    selectedFolder: TFolder | null;
    /** Currently selected tag */
    selectedTag: string | null;
    /** Currently selected file in the file list */
    selectedFile: TFile | null;
    /** Currently selected backlink */
    selectedBacklink: string | null;
    /** Set of folder paths that are currently expanded in the tree */
    expandedFolders: Set<string>;
    /** Set of tag paths that are currently expanded in the tree */
    expandedTags: Set<string>;
    /** Which pane currently has keyboard focus */
    focusedPane: 'folders' | 'files';
    /** Counter that increments when we need to trigger a scroll to the selected folder */
    scrollToFolderTrigger: number;
    /** Current view on mobile devices - 'list' for folder/tags, 'files' for file list */
    currentMobileView: 'list' | 'files';
}

/**
 * Discriminated union of all possible actions that can be dispatched
 * to modify the application state.
 */
export type AppAction = 
    | { type: 'SET_SELECTED_FOLDER'; folder: TFolder | null }
    | { type: 'SET_SELECTED_TAG'; tag: string | null }
    | { type: 'SET_SELECTED_BACKLINK'; backlink: string | null }
    | { type: 'SET_SELECTED_FILE'; file: TFile | null }
    | { type: 'SET_EXPANDED_FOLDERS'; folders: Set<string> }
    | { type: 'TOGGLE_FOLDER_EXPANDED'; folderPath: string }
    | { type: 'SET_EXPANDED_TAGS'; tags: Set<string> }
    | { type: 'TOGGLE_TAG_EXPANDED'; tagPath: string }
    | { type: 'SET_FOCUSED_PANE'; pane: 'folders' | 'files' }
    | { type: 'EXPAND_FOLDERS'; folderPaths: string[] }
    | { type: 'REVEAL_FILE'; file: TFile }
    | { type: 'CLEANUP_DELETED_ITEMS' }
    | { type: 'FORCE_REFRESH' }
    | { type: 'SET_MOBILE_VIEW'; view: 'list' | 'files' };

/**
 * Context value type containing all app-level data and functions
 * available to child components.
 */
interface AppContextType {
    /** Obsidian App instance */
    app: App;
    /** Plugin instance with settings and methods */
    plugin: NotebookNavigatorPlugin;
    /** Current application state */
    appState: AppState;
    /** Dispatch function to update state */
    dispatch: React.Dispatch<AppAction>;
    /** Counter that increments to force component re-renders */
    refreshCounter: number;
    /** Whether the app is running on a mobile device */
    isMobile: boolean;
}

/**
 * The main application context that provides global state and functions.
 * The null! assertion is safe because we always wrap components with AppProvider.
 */
const AppContext = createContext<AppContextType>(null!);

/**
 * LocalStorage keys for persisting state across sessions.
 * These keys are used to save and restore the plugin state.
 */
const STORAGE_KEYS = {
    /** Key for storing expanded folder paths */
    expandedFolders: 'notebook-navigator-expanded-folders',
    /** Key for storing expanded tag paths */
    expandedTags: 'notebook-navigator-expanded-tags',
    /** Key for storing selected folder path */
    selectedFolder: 'notebook-navigator-selected-folder',
    /** Key for storing selected file path */
    selectedFile: 'notebook-navigator-selected-file',
    /** Key for storing current mobile view */
    currentMobileView: 'notebook-navigator-mobile-view'
};

/**
 * Loads the application state from localStorage.
 * Validates that files and folders still exist in the vault.
 * 
 * @param app - The Obsidian App instance
 * @returns The restored AppState with validated references
 */
function loadStateFromStorage(app: App): AppState {
    const expandedFoldersData = localStorage.getItem(STORAGE_KEYS.expandedFolders);
    const expandedTagsData = localStorage.getItem(STORAGE_KEYS.expandedTags);
    const selectedFolderPath = localStorage.getItem(STORAGE_KEYS.selectedFolder);
    const selectedFilePath = localStorage.getItem(STORAGE_KEYS.selectedFile);
    
    let expandedFolders = new Set<string>();
    try {
        if (expandedFoldersData) {
            const parsed = JSON.parse(expandedFoldersData);
            if (Array.isArray(parsed)) {
                expandedFolders = new Set(parsed);
            }
        }
    } catch (e) {
        // Silently ignore parse errors
    }
    
    let expandedTags = new Set<string>();
    try {
        if (expandedTagsData) {
            const parsed = JSON.parse(expandedTagsData);
            if (Array.isArray(parsed)) {
                expandedTags = new Set(parsed);
            }
        }
    } catch (e) {
        // Silently ignore parse errors
    }
    
    let selectedFolder: TFolder | null = null;
    if (selectedFolderPath) {
        const folder = app.vault.getAbstractFileByPath(selectedFolderPath);
        if (isTFolder(folder)) {
            selectedFolder = folder;
        }
    }
    
    let selectedFile: TFile | null = null;
    if (selectedFilePath) {
        const file = app.vault.getAbstractFileByPath(selectedFilePath);
        if (isTFile(file)) {
            selectedFile = file;
        }
    }
    
    // Load mobile view state - always default to 'list' for better UX
    const currentMobileView = 'list' as 'list' | 'files';
    // Note: We don't persist mobile view to avoid confusion when switching platforms
    
    return {
        selectionType: 'folder',
        selectedFolder,
        selectedTag: null,
        selectedFile,
        expandedFolders,
        expandedTags,
        focusedPane: 'folders',
        scrollToFolderTrigger: 0,
        currentMobileView
    };
}

/**
 * Saves a specific state value to localStorage.
 * Handles serialization for complex types like Sets.
 * 
 * @param key - The localStorage key to save to
 * @param value - The value to save (will be serialized if needed)
 */
function saveToStorage(key: string, value: any) {
    try {
        if (key === STORAGE_KEYS.expandedFolders || key === STORAGE_KEYS.expandedTags) {
            localStorage.setItem(key, JSON.stringify(Array.from(value)));
        } else {
            localStorage.setItem(key, value || '');
        }
    } catch (e) {
        // Silently ignore save errors (e.g., quota exceeded)
    }
}

/**
 * Main reducer function that handles all state updates.
 * This is a pure function - no side effects are performed here.
 * 
 * @param state - Current application state
 * @param action - The action to process
 * @param app - The Obsidian App instance for vault operations
 * @returns The new state after applying the action
 */
function appReducer(state: AppState, action: AppAction, app: App): AppState {
    switch (action.type) {
        case 'SET_SELECTED_FOLDER': {
            // Update the selected folder and clear tag selection
            return { ...state, selectionType: 'folder', selectedFolder: action.folder, selectedBacklink: null, selectedTag: null };
        }
        
        case 'SET_SELECTED_TAG': {
            // Update the selected tag and clear folder selection
            return { ...state, selectionType: 'tag', selectedTag: action.tag, selectedBacklink: null, selectedFolder: null };
        }

        case 'SET_SELECTED_BACKLINK': {
            // Update the selected backlink and clear folder selection
            return { ...state, selectionType: 'backlink', selectedTag: null, selectedBacklink: action.backlink, selectedFolder: null };
        }
        
        case 'SET_SELECTED_FILE': {
            // Update the selected file
            return { ...state, selectedFile: action.file };
        }
        
        case 'SET_EXPANDED_FOLDERS': {
            // Replace all expanded folders (used for bulk operations)
            return { ...state, expandedFolders: action.folders };
        }
        
        case 'TOGGLE_FOLDER_EXPANDED': {
            // Toggle a single folder's expanded state
            const newExpanded = new Set(state.expandedFolders);
            if (newExpanded.has(action.folderPath)) {
                newExpanded.delete(action.folderPath);
            } else {
                newExpanded.add(action.folderPath);
            }
            return { ...state, expandedFolders: newExpanded };
        }
        
        case 'SET_EXPANDED_TAGS': {
            // Replace all expanded tags (used for bulk operations)
            return { ...state, expandedTags: action.tags };
        }
        
        case 'TOGGLE_TAG_EXPANDED': {
            // Toggle a single tag's expanded state
            const newExpanded = new Set(state.expandedTags);
            if (newExpanded.has(action.tagPath)) {
                newExpanded.delete(action.tagPath);
            } else {
                newExpanded.add(action.tagPath);
            }
            return { ...state, expandedTags: newExpanded };
        }
        
        case 'SET_FOCUSED_PANE': {
            // Update which pane has keyboard focus
            return { ...state, focusedPane: action.pane };
        }
        
        case 'EXPAND_FOLDERS': {
            // Expand multiple folders at once (additive, doesn't collapse others)
            const newExpanded = new Set([...state.expandedFolders, ...action.folderPaths]);
            return { ...state, expandedFolders: newExpanded };
        }
        
        case 'REVEAL_FILE': {
            // Reveal a file in the navigator by expanding all parent folders
            if (!action.file.parent) {
                return state;
            }
            
            // Get all parent folders up to root
            const foldersToExpand: string[] = [];
            let currentFolder: TFolder | null = action.file.parent;
            while (currentFolder && currentFolder.path !== '/') {
                foldersToExpand.unshift(currentFolder.path);
                currentFolder = currentFolder.parent || null;
            }
            
            // Expand all parent folders, select the file and its parent folder
            const newExpanded = new Set([...state.expandedFolders, ...foldersToExpand]);
            
            return {
                ...state,
                selectionType: 'folder', // Switch to folder view when revealing a file
                expandedFolders: newExpanded,
                selectedFolder: action.file.parent,
                selectedTag: null, // Clear tag selection
                selectedFile: action.file,
                focusedPane: 'files',
                scrollToFolderTrigger: state.scrollToFolderTrigger + 1
            };
        }
        
        case 'CLEANUP_DELETED_ITEMS': {
            // Remove references to deleted files/folders from state
            let newState = { ...state };
            
            // Check if selected file still exists
            if (state.selectedFile && !app.vault.getAbstractFileByPath(state.selectedFile.path)) {
                newState.selectedFile = null;
            }
            
            // Check if selected folder still exists
            if (state.selectedFolder && !app.vault.getAbstractFileByPath(state.selectedFolder.path)) {
                newState.selectedFolder = null;
            }
            
            // Clean up expanded folders that no longer exist
            const validExpandedFolders = new Set<string>();
            state.expandedFolders.forEach(path => {
                if (app.vault.getAbstractFileByPath(path)) {
                    validExpandedFolders.add(path);
                }
            });
            
            if (validExpandedFolders.size !== state.expandedFolders.size) {
                newState.expandedFolders = validExpandedFolders;
            }
            
            return newState;
        }
        
        case 'FORCE_REFRESH': {
            // Force a re-render by returning a new state object
            // The actual refresh is triggered by incrementing refreshCounter in the wrapped dispatch
            return { ...state };
        }
        
        case 'SET_MOBILE_VIEW': {
            // Update the current mobile view
            return { ...state, currentMobileView: action.view };
        }
        
        default:
            return state;
    }
}

/**
 * Context provider component that wraps the entire plugin UI.
 * Manages global state, handles vault events, and provides context to all child components.
 * 
 * @param props - Component props
 * @param props.children - Child components to render
 * @param props.plugin - The NotebookNavigatorPlugin instance
 */
export function AppProvider({ children, plugin, isMobile = false }: { children: React.ReactNode, plugin: NotebookNavigatorPlugin, isMobile?: boolean }) {
    const { app } = plugin;

    /**
     * Initialize state with useReducer, loading initial state from localStorage.
     * The reducer is wrapped to include the app instance for vault operations.
     */
    const [appState, baseDispatch] = useReducer(
        (state: AppState, action: AppAction) => appReducer(state, action, app),
        null,
        () => loadStateFromStorage(app)
    );
    
    /**
     * Counter that forces re-renders when incremented.
     * Used to refresh the UI after vault changes.
     */
    const [refreshCounter, setRefreshCounter] = React.useState(0);
    
    /**
     * Wrapped dispatch function that handles FORCE_REFRESH actions specially.
     * FORCE_REFRESH increments the refresh counter to trigger re-renders.
     */
    const dispatch = useMemo(() => {
        return (action: AppAction) => {
            if (action.type === 'FORCE_REFRESH') {
                setRefreshCounter((c: number) => c + 1);
            }
            baseDispatch(action);
        };
    }, []);
    
    /**
     * Effect that subscribes to vault events and triggers UI updates.
     * Events are debounced to prevent excessive re-renders.
     */
    useEffect(() => {
        let createTimeout: NodeJS.Timeout;
        let deleteTimeout: NodeJS.Timeout;
        let renameTimeout: NodeJS.Timeout;
        let modifyTimeout: NodeJS.Timeout;
        
        /**
         * Handle file/folder creation events.
         * Debounced to avoid excessive re-renders during bulk operations.
         */
        const handleCreate = () => {
            clearTimeout(createTimeout);
            createTimeout = setTimeout(() => {
                setRefreshCounter((c: number) => c + 1);
            }, 50);
        };
        
        /**
         * Handle file/folder deletion events.
         * Cleans up state references and triggers UI refresh.
         */
        const handleDelete = () => {
            clearTimeout(deleteTimeout);
            deleteTimeout = setTimeout(() => {
                dispatch({ type: 'CLEANUP_DELETED_ITEMS' });
                setRefreshCounter((c: number) => c + 1);
            }, 50);
        };
        
        /**
         * Handle file/folder rename events.
         * Treats renames as delete + create, so cleanup is needed.
         */
        const handleRename = () => {
            clearTimeout(renameTimeout);
            renameTimeout = setTimeout(() => {
                dispatch({ type: 'CLEANUP_DELETED_ITEMS' });
                setRefreshCounter((c: number) => c + 1);
            }, 50);
        };
        
        /**
         * Handle file modification events.
         * Uses longer debounce since modifications happen frequently.
         */
        const handleModify = () => {
            clearTimeout(modifyTimeout);
            modifyTimeout = setTimeout(() => {
                setRefreshCounter((c: number) => c + 1);
            }, 200); // Longer debounce for modifications
        };
        
        // Register event handlers
        app.vault.on('create', handleCreate);
        app.vault.on('delete', handleDelete);
        app.vault.on('rename', handleRename);
        app.vault.on('modify', handleModify);
        
        // Cleanup
        return () => {
            clearTimeout(createTimeout);
            clearTimeout(deleteTimeout);
            clearTimeout(renameTimeout);
            clearTimeout(modifyTimeout);
            app.vault.off('create', handleCreate);
            app.vault.off('delete', handleDelete);
            app.vault.off('rename', handleRename);
            app.vault.off('modify', handleModify);
        };
    }, [app, dispatch]);

    /**
     * Effect that persists state changes to localStorage.
     * Runs whenever the state changes to keep localStorage in sync.
     */
    useEffect(() => {
        // Save expanded folders
        saveToStorage(STORAGE_KEYS.expandedFolders, appState.expandedFolders);
        
        // Save expanded tags
        saveToStorage(STORAGE_KEYS.expandedTags, appState.expandedTags);
        
        // Save selected folder
        saveToStorage(STORAGE_KEYS.selectedFolder, appState.selectedFolder?.path);
        
        // Save selected file
        saveToStorage(STORAGE_KEYS.selectedFile, appState.selectedFile?.path);
        
        // Note: We don't persist currentMobileView to always start fresh on mobile
    }, [appState.expandedFolders, appState.expandedTags, appState.selectedFolder, appState.selectedFile]);

    const contextValue = useMemo(() => ({
        app,
        plugin,
        appState,
        dispatch,
        refreshCounter,
        isMobile,
    }), [app, plugin, appState, dispatch, refreshCounter, isMobile]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

/**
 * Custom hook to access the app context.
 * Must be used within an AppProvider.
 * 
 * @returns The complete AppContext value
 * @throws If used outside of AppProvider
 */
export function useAppContext() {
    return useContext(AppContext);
}

/**
 * Convenience hook to access just the dispatch function.
 * Use this when you only need to dispatch actions.
 * 
 * @returns The dispatch function for updating state
 */
export function useAppDispatch() {
    const { dispatch } = useAppContext();
    return dispatch;
}

/**
 * Convenience hook to access just the app state.
 * Use this when you only need to read state without dispatching.
 * 
 * @returns The current application state
 */
export function useAppState() {
    const { appState } = useAppContext();
    return appState;
}