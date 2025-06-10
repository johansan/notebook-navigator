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

// src/hooks/useKeyboardNavigation.ts
import { useCallback, useEffect, useRef } from 'react';
import { TFile, TFolder } from 'obsidian';
import { useAppContext } from '../context/AppContext';
import { useFileSystemOps } from '../context/ServicesContext';
import { isTFolder, isFolderAncestor } from '../utils/typeGuards';
import { getPathFromElement, getFolderFromElement, getFileFromElement } from '../utils/domUtils';

/**
 * Custom hook that provides keyboard navigation for the file explorer.
 * Handles arrow key navigation, tab switching between panes, and delete operations.
 * 
 * ## Design Decision: DOM Queries
 * This hook uses DOM queries (querySelectorAll) to find navigable elements rather than
 * React refs. While this goes against typical React patterns, it's a pragmatic choice here because:
 * 
 * 1. **Dynamic Hierarchy**: The folder tree has a complex, nested structure with dynamic visibility
 * 2. **Performance**: Managing refs for potentially hundreds of items would add complexity
 * 3. **Simplicity**: DOM queries provide a clean way to get only visible items
 * 4. **Reliability**: We control the DOM structure and class names, making queries predictable
 * 
 * The alternative would require:
 * - Complex ref management across multiple component levels
 * - State tracking for all navigable items
 * - Significant refactoring of the component hierarchy
 * 
 * ## Keyboard shortcuts:
 * - Arrow Up/Down: Navigate items in current pane
 * - Arrow Left: Collapse folder, move to parent, or switch to folder pane
 * - Arrow Right: Expand folder, switch to file pane, or focus editor
 * - Tab: Switch between panes (Shift+Tab for reverse)
 * - Delete/Backspace: Delete selected item
 * 
 * @param containerRef - React ref to the container element that will receive keyboard events
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useKeyboardNavigation(containerRef);
 * 
 * return (
 *   <div ref={containerRef} tabIndex={0}>
 *     <FolderTree />
 *     <FileList />
 *   </div>
 * );
 * ```
 */
export function useKeyboardNavigation(containerRef: React.RefObject<HTMLElement | null>) {
    const { app, appState, dispatch, plugin } = useAppContext();
    const fileSystemOps = useFileSystemOps();
    const lastActionTime = useRef(0);
    
    /**
     * Gets all visible folder elements from the DOM.
     * Filters out folders that are inside collapsed parent folders.
     * 
     * @returns Array of visible folder DOM elements
     */
    const getFolderElements = useCallback(() => {
        if (!containerRef.current) return [];
        // Get all folder items
        const allFolders = Array.from(containerRef.current.querySelectorAll('.nn-folder-item'));
        
        // Filter out folders that are inside collapsed parents
        return allFolders.filter(element => {
            // Check if this element is visible by checking if it's inside a collapsed folder
            const parent = element.parentElement;
            if (!parent) return true;
            
            // Walk up the tree to see if we're inside a collapsed folder
            let currentElement: HTMLElement | null = parent;
            while (currentElement && currentElement !== containerRef.current) {
                if (currentElement.classList.contains('nn-folder-children') && 
                    !currentElement.classList.contains('nn-expanded')) {
                    return false; // This folder is inside a collapsed parent
                }
                currentElement = currentElement.parentElement;
            }
            
            return true; // This folder is visible
        });
    }, [containerRef]);
    
    /**
     * Gets all file elements from the DOM.
     * 
     * @returns Array of file DOM elements
     */
    const getFileElements = useCallback(() => {
        if (!containerRef.current) return [];
        return Array.from(containerRef.current.querySelectorAll('.nn-file-item'));
    }, [containerRef]);
    
    /**
     * Gets all visible tag elements from the DOM.
     * Filters out tags that are inside collapsed parent tags.
     * 
     * @returns Array of visible tag DOM elements
     */
    const getTagElements = useCallback(() => {
        if (!containerRef.current) return [];
        const allTags = Array.from(containerRef.current.querySelectorAll('.nn-tag-item'));
        
        // Filter out tags that are inside collapsed parents
        return allTags.filter(element => {
            // Check if this element is visible by checking if it's inside collapsed tag children
            let parent = element.parentElement;
            while (parent && parent !== containerRef.current) {
                if (parent.classList.contains('nn-tag-children')) {
                    // Check if the parent tag item is expanded
                    const parentTagItem = parent.previousElementSibling;
                    if (parentTagItem && parentTagItem.classList.contains('nn-tag-item')) {
                        const parentPath = (parentTagItem as HTMLElement).dataset.tag;
                        if (parentPath && appState.expandedTags && !appState.expandedTags.has(parentPath)) {
                            return false; // This tag is inside a collapsed parent
                        }
                    }
                }
                parent = parent.parentElement;
            }
            return true; // This tag is visible
        });
    }, [containerRef, appState.expandedTags]);

    /**
     * Gets all visible backlink elements from the DOM.
     * Filters out backlink that are inside collapsed parent backlink.
     * 
     * @returns Array of visible tag DOM elements
     */
        const getBacklinkElements = useCallback(() => {
            if (!containerRef.current) return [];
            const allTags = Array.from(containerRef.current.querySelectorAll('.nn-backlink-item'));
            
            // Filter out tags that are inside collapsed parents
            return allTags.filter(element => {
                // Check if this element is visible by checking if it's inside collapsed tag children
                let parent = element.parentElement;
                while (parent && parent !== containerRef.current) {
                    if (parent.classList.contains('nn-tag-children')) {
                        // Check if the parent tag item is expanded
                        const parentTagItem = parent.previousElementSibling;
                        if (parentTagItem && parentTagItem.classList.contains('nn-tag-item')) {
                            const parentPath = (parentTagItem as HTMLElement).dataset.tag;
                            if (parentPath && appState.expandedTags && !appState.expandedTags.has(parentPath)) {
                                return false; // This tag is inside a collapsed parent
                            }
                        }
                    }
                    parent = parent.parentElement;
                }
                return true; // This tag is visible
            });
        }, [containerRef, appState.expandedBacklinks]);
    
    /**
     * Finds the index of the selected element in an array of elements.
     * 
     * @param elements - Array of DOM elements
     * @param selectedPath - Path of the selected item
     * @returns Index of selected element or -1 if not found
     */
    const getSelectedIndex = useCallback((elements: Element[], selectedPath: string | null) => {
        if (!selectedPath) return -1;
        return elements.findIndex(el => getPathFromElement(el as HTMLElement) === selectedPath);
    }, []);
    
    /**
     * Finds the index of the selected tag element.
     * 
     * @param elements - Array of tag DOM elements  
     * @param selectedTag - Selected tag string
     * @returns Index of selected element or -1 if not found
     */
    const getSelectedTagIndex = useCallback((elements: Element[], selectedTag: string | null) => {
        if (!selectedTag) return -1;
        return elements.findIndex(el => (el as HTMLElement).dataset.tag === selectedTag);
    }, []);

    /**
     * Finds the index of the selected backlink element.
     * 
     * @param elements - Array of tag DOM elements  
     * @param selectedBacklink - Selected backlink string
     * @returns Index of selected element or -1 if not found
     */
    const getSelectedBacklinkIndex = useCallback((elements: Element[], selectedBacklink: string | null) => {
        if (!selectedBacklink) return -1;
        return elements.findIndex(el => (el as HTMLElement).dataset.tag === selectedBacklink);
    }, []);
    
    /**
     * Navigates through folder items using arrow keys.
     * Updates selection and scrolls the selected folder into view.
     * 
     * @param direction - Direction to navigate ('up' or 'down')
     */
    const navigateFolders = useCallback((direction: 'up' | 'down') => {
        const elements = getFolderElements();
        if (elements.length === 0) return;
        
        const currentIndex = getSelectedIndex(elements, appState.selectedFolder?.path || null);
        let newIndex = currentIndex;
        
        if (direction === 'up') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        } else {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : elements.length - 1;
        }
        
        if (newIndex !== currentIndex) {
            const folder = getFolderFromElement(elements[newIndex] as HTMLElement, app);
            if (folder) {
                dispatch({ type: 'SET_SELECTED_FOLDER', folder });
                dispatch({ type: 'SET_FOCUSED_PANE', pane: 'folders' });
                elements[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [getFolderElements, getSelectedIndex, appState.selectedFolder, app, dispatch]);
    
    /**
     * Navigates through tag items using arrow keys.
     * Updates selection and scrolls the selected tag into view.
     * 
     * @param direction - Direction to navigate ('up' or 'down')
     */
    const navigateTags = useCallback((direction: 'up' | 'down') => {
        const elements = getTagElements();
        if (elements.length === 0) return;
        
        const currentIndex = getSelectedTagIndex(elements, appState.selectedTag);
        let newIndex = currentIndex;
        
        if (direction === 'up') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        } else {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : elements.length - 1;
        }
        
        if (newIndex !== currentIndex && elements[newIndex]) {
            const tagElement = elements[newIndex] as HTMLElement;
            const tag = tagElement.dataset.tag;
            if (tag) {
                dispatch({ type: 'SET_SELECTED_TAG', tag });
                tagElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [getTagElements, getSelectedTagIndex, appState.selectedTag, dispatch]);

    /**
     * Navigates through backlink items using arrow keys.
     * Updates selection and scrolls the selected backlink into view.
     * 
     * @param direction - Direction to navigate ('up' or 'down')
     */
    const navigateBacklinks = useCallback((direction: 'up' | 'down') => {
        console.log(appState)
        const elements = getBacklinkElements();
        if (elements.length === 0) return;
        const currentIndex = getSelectedBacklinkIndex(elements, appState.selectedBacklink);
        let newIndex = currentIndex;
        
        if (direction === 'up') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        } else {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : elements.length - 1;
        }
        
        if (newIndex !== currentIndex && elements[newIndex]) {
            const tagElement = elements[newIndex] as HTMLElement;
            const backlink = tagElement.dataset.tag;
            if (backlink) {
                dispatch({ type: 'SET_SELECTED_BACKLINK', backlink: backlink });
                tagElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [getBacklinkElements, getSelectedBacklinkIndex, appState.selectedBacklink, dispatch]);
    
    /**
     * Navigates through file items using arrow keys.
     * Updates selection, scrolls into view, and opens the file in the editor.
     * 
     * @param direction - Direction to navigate ('up' or 'down')
     */
    const navigateFiles = useCallback((direction: 'up' | 'down') => {
        const elements = getFileElements();
        if (elements.length === 0) return;
        
        const currentIndex = getSelectedIndex(elements, appState.selectedFile?.path || null);
        let newIndex = currentIndex;
        
        if (direction === 'up') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        } else {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : currentIndex;
        }
        
        if (newIndex !== currentIndex || currentIndex === -1) {
            const file = getFileFromElement(elements[newIndex] as HTMLElement, app);
            if (file) {
                dispatch({ type: 'SET_SELECTED_FILE', file });
                dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                elements[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                
                // Open file in edit view (same as clicking)
                // Use getMostRecentLeaf to avoid creating new panes or stealing focus
                const leaf = app.workspace.getMostRecentLeaf();
                if (leaf) {
                    leaf.openFile(file);
                }
            }
        }
    }, [getFileElements, getSelectedIndex, appState.selectedFile, app, dispatch]);
    
    /**
     * Main keyboard event handler.
     * Processes all keyboard shortcuts and delegates to appropriate actions.
     * Includes debouncing to prevent rapid key spam.
     * 
     * @param e - The keyboard event
     */
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Debounce rapid key presses
        const now = Date.now();
        if (now - lastActionTime.current < 50) return;
        lastActionTime.current = now;
        
        // Don't handle if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (appState.focusedPane === 'folders') {
                    // Check if we're in tag mode or folder mode
                    if (appState.selectionType === 'tag') {
                        navigateTags('up');
                    } else if (appState.selectionType === 'backlink') {
                        navigateBacklinks('up');
                    } else {
                        navigateFolders('up');
                    }
                } else {
                    navigateFiles('up');
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (appState.focusedPane === 'folders') {
                    // Check if we're in tag mode or folder mode
                    if (appState.selectionType === 'tag') {
                        navigateTags('down');
                    } else if (appState.selectionType === 'backlink') {
                        navigateBacklinks('down');
                    } else {
                        navigateFolders('down');
                    }
                } else {
                    navigateFiles('down');
                }
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                if (appState.focusedPane === 'files') {
                    dispatch({ type: 'SET_FOCUSED_PANE', pane: 'folders' });
                } else if (appState.selectionType === 'tag' && appState.selectedTag) {
                    // Tag mode: collapse or move to parent
                    const tagPath = appState.selectedTag;
                    if (appState.expandedTags.has(tagPath)) {
                        // Collapse the tag
                        dispatch({ type: 'TOGGLE_TAG_EXPANDED', tagPath });
                    } else {
                        // Move to parent tag
                        const lastSlashIndex = tagPath.lastIndexOf('/');
                        if (lastSlashIndex > 0) { // Has a parent (not a root tag)
                            const parentPath = tagPath.substring(0, lastSlashIndex);
                            dispatch({ type: 'SET_SELECTED_TAG', tag: parentPath });
                            
                            // Ensure parent is visible by scrolling to it
                            const tagElements = getTagElements();
                            const parentElement = tagElements.find(el => (el as HTMLElement).dataset.tag === parentPath);
                            if (parentElement) {
                                parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                            }
                        }
                    }
                } else if (appState.selectionType === 'backlink' && appState.selectedBacklink) {
                    // Backlink mode: collapse or move to parent
                    const backlinkPath = appState.selectedBacklink;
                    if (appState.expandedBacklinks.has(backlinkPath)) {
                        // Collapse the tag
                        dispatch({ type: 'TOGGLE_BACKLINK_EXPANDED', backlinkPath });
                    } else {
                        // Move to parent tag
                        const lastSlashIndex = backlinkPath.lastIndexOf('/');
                        if (lastSlashIndex > 0) { // Has a parent (not a root tag)
                            const parentPath = backlinkPath.substring(0, lastSlashIndex);
                            dispatch({ type: 'SET_SELECTED_BACKLINK', backlink: parentPath });
                            
                            // Ensure parent is visible by scrolling to it
                            const backlinkElements = getBacklinkElements();
                            const parentElement = backlinkElements.find(el => (el as HTMLElement).dataset.tag === parentPath);
                            if (parentElement) {
                                parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                            }
                        }
                    }
                } else if (appState.selectedFolder) {
                    // If folder is expanded, collapse it
                    if (appState.expandedFolders.has(appState.selectedFolder.path)) {
                        dispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderPath: appState.selectedFolder.path });
                    } else {
                        // If folder is collapsed or has no children, navigate to parent
                        const parentPath = appState.selectedFolder.parent?.path;
                        
                        // Don't navigate to root if showRootFolder is false and we're at root level
                        const isAtRootLevel = !parentPath || parentPath === '' || parentPath === '/';
                        if (parentPath && !(isAtRootLevel && !plugin.settings.showRootFolder)) {
                            const parentFolder = app.vault.getAbstractFileByPath(parentPath);
                            if (parentFolder && isTFolder(parentFolder)) {
                                dispatch({ type: 'SET_SELECTED_FOLDER', folder: parentFolder });
                                
                                // Ensure parent is visible by scrolling to it
                                const folderElements = getFolderElements();
                                const parentElement = folderElements.find(el => getPathFromElement(el as HTMLElement) === parentPath);
                                if (parentElement) {
                                    parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                                }
                            }
                        }
                    }
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                if (appState.focusedPane === 'folders') {
                    if (appState.selectionType === 'tag' && appState.selectedTag) {
                        // Tag mode: expand or move to files
                        if (!appState.expandedTags.has(appState.selectedTag)) {
                            // Check if tag has children by looking at DOM
                            const tagElements = getTagElements();
                            const currentElement = tagElements.find(el => (el as HTMLElement).dataset.tag === appState.selectedTag);
                            if (currentElement) {
                                const arrow = currentElement.querySelector('.nn-tag-arrow');
                                const hasChildren = arrow && getComputedStyle(arrow).visibility !== 'hidden';
                                if (hasChildren) {
                                    dispatch({ type: 'TOGGLE_TAG_EXPANDED', tagPath: appState.selectedTag });
                                } else {
                                    dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                                }
                            }
                        } else {
                            dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                        }
                    }if (appState.selectionType === 'backlink' && appState.selectedBacklink) {
                        // Tag mode: expand or move to files
                        if (!appState.expandedBacklinks.has(appState.selectedBacklink)) {
                            // Check if tag has children by looking at DOM
                            const backlinkElements = getBacklinkElements();
                            const currentElement = backlinkElements.find(el => (el as HTMLElement).dataset.tag === appState.selectedBacklink);
                            if (currentElement) {
                                const arrow = currentElement.querySelector('.nn-tag-arrow');
                                const hasChildren = arrow && getComputedStyle(arrow).visibility !== 'hidden';
                                if (hasChildren) {
                                    dispatch({ type: 'TOGGLE_BACKLINK_EXPANDED', backlinkPath: appState.selectedBacklink });
                                } else {
                                    dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                                }
                            }
                        } else {
                            dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                        }
                    } else if (appState.selectedFolder) {
                        // Folder mode - expand or move to files
                        if (!appState.expandedFolders.has(appState.selectedFolder.path)) {
                            const hasSubfolders = appState.selectedFolder.children.some(isTFolder);
                            if (hasSubfolders) {
                                dispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderPath: appState.selectedFolder.path });
                            } else {
                                dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                            }
                        } else {
                            dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                        }
                    }
                } else if (appState.focusedPane === 'files' && appState.selectedFile) {
                    // Move focus to edit view showing the selected file
                    const leaves = app.workspace.getLeavesOfType('markdown')
                        .concat(app.workspace.getLeavesOfType('canvas'))
                        .concat(app.workspace.getLeavesOfType('database'));
                    
                    // Find leaf showing our file
                    // Note: Accessing view.file via 'any' as it's not in Obsidian's public TypeScript API
                    const targetLeaf = leaves.find(leaf => (leaf.view as any).file?.path === appState.selectedFile?.path);
                    if (targetLeaf) {
                        app.workspace.setActiveLeaf(targetLeaf, { focus: true });
                    }
                }
                break;
                
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift+Tab always moves left (to folders if in files)
                    if (appState.focusedPane === 'files') {
                        dispatch({ type: 'SET_FOCUSED_PANE', pane: 'folders' });
                    }
                } else {
                    // Tab moves right or to editor
                    if (appState.focusedPane === 'folders') {
                        dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                    } else if (appState.focusedPane === 'files' && appState.selectedFile) {
                        // Move focus to edit view showing the selected file
                        const leaves = app.workspace.getLeavesOfType('markdown')
                            .concat(app.workspace.getLeavesOfType('canvas'))
                            .concat(app.workspace.getLeavesOfType('database'));
                        
                        // Find leaf showing our file
                        const targetLeaf = leaves.find(leaf => (leaf.view as any).file?.path === appState.selectedFile?.path);
                        if (targetLeaf) {
                            app.workspace.setActiveLeaf(targetLeaf, { focus: true });
                        }
                    }
                }
                break;
                
            case 'Enter':
            case 'Escape':
            case ' ': // Space key
                e.preventDefault();
                // Do nothing
                break;
                
            case 'Delete':
            case 'Backspace':
                if (e.shiftKey || e.metaKey || e.ctrlKey) return; // Skip if modifier keys
                e.preventDefault();
                
                if (appState.focusedPane === 'files' && appState.selectedFile) {
                    fileSystemOps.deleteFile(appState.selectedFile, plugin.settings.confirmBeforeDelete);
                } else if (appState.focusedPane === 'folders' && appState.selectedFolder) {
                    const folderToDelete = appState.selectedFolder;
                    const parentFolder = folderToDelete.parent;
                    
                    fileSystemOps.deleteFolder(folderToDelete, plugin.settings.confirmBeforeDelete, () => {
                        // Check if we need to update selection
                        if (appState.selectedFolder) {
                            const isSelectedFolderDeleted = folderToDelete.path === appState.selectedFolder.path;
                            const isAncestorDeleted = isFolderAncestor(folderToDelete, appState.selectedFolder);
                            
                            if (isSelectedFolderDeleted || isAncestorDeleted) {
                                // If parent exists and is not root (or root is visible), select it
                                if (parentFolder && (parentFolder.path !== '' || plugin.settings.showRootFolder)) {
                                    dispatch({ type: 'SET_SELECTED_FOLDER', folder: parentFolder });
                                } else {
                                    // Clear selection if no valid parent
                                    dispatch({ type: 'SET_SELECTED_FOLDER', folder: null });
                                }
                            }
                        }
                    });
                }
                break;
        }
    }, [appState, dispatch, navigateFolders, navigateTags, navigateBacklinks, navigateFiles, app, fileSystemOps, getFolderElements, plugin]);
    
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        container.addEventListener('keydown', handleKeyDown);
        
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [containerRef, handleKeyDown]);
}