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

import React, { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useFileSystemOps } from '../context/ServicesContext';
import { isTFolder } from '../utils/typeGuards';
import { ObsidianIcon } from './ObsidianIcon';

interface PaneHeaderProps {
    type: 'folder' | 'file';
}

/**
 * Renders the header bar for either the folder or file pane.
 * Provides action buttons based on pane type - expand/collapse all and new folder
 * for the folder pane, new file for the file pane.
 * 
 * @param props - The component props
 * @param props.type - Whether this is the header for the 'folder' or 'file' pane
 * @returns A header element with context-appropriate action buttons
 */
export function PaneHeader({ type }: PaneHeaderProps) {
    const { app, appState, dispatch, isMobile } = useAppContext();
    const fileSystemOps = useFileSystemOps();
    
    const handleExpandCollapseAll = useCallback(() => {
        if (type !== 'folder') return;
        
        // If we have any expanded folders, collapse all
        if (appState.expandedFolders.size > 0) {
            dispatch({ type: 'SET_EXPANDED_FOLDERS', folders: new Set() });
        } else {
            // Otherwise, expand all folders
            const allFolders = new Set<string>();
            
            const collectAllFolders = (folder: any) => {
                folder.children.forEach((child: any) => {
                    if (isTFolder(child)) {
                        allFolders.add(child.path);
                        collectAllFolders(child);
                    }
                });
            };
            
            const rootFolder = app.vault.getRoot();
            collectAllFolders(rootFolder);
            
            dispatch({ type: 'SET_EXPANDED_FOLDERS', folders: allFolders });
        }
    }, [app, appState.expandedFolders.size, dispatch, type]);
    
    const handleNewFolder = useCallback(async () => {
        if (type !== 'folder' || !appState.selectedFolder) return;
        
        try {
            await fileSystemOps.createNewFolder(appState.selectedFolder, () => {
                // Expand the parent folder to show the newly created folder
                if (appState.selectedFolder && !appState.expandedFolders.has(appState.selectedFolder.path)) {
                    dispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderPath: appState.selectedFolder.path });
                }
            });
        } catch (error) {
            // Error is handled by FileSystemOperations with user notification
        }
    }, [appState.selectedFolder, appState.expandedFolders, fileSystemOps, type, dispatch]);
    
    const handleNewFile = useCallback(async () => {
        if (type !== 'file' || !appState.selectedFolder) return;
        
        try {
            await fileSystemOps.createNewFile(appState.selectedFolder);
        } catch (error) {
            // Error is handled by FileSystemOperations with user notification
        }
    }, [appState.selectedFolder, fileSystemOps, type]);
    
    // Mobile header with back button
    if (isMobile) {
        let headerTitle = 'No selection';
        
        if (appState.selectionType === 'folder' && appState.selectedFolder) {
            headerTitle = appState.selectedFolder.path === '/' ? 'Vault' : appState.selectedFolder.name;
        } else if (appState.selectionType === 'tag' && appState.selectedTag) {
            headerTitle = appState.selectedTag === '__untagged__' ? 'Untagged' : appState.selectedTag;
        } else if (appState.selectionType === 'backlink' && appState.selectedBacklink) {
            headerTitle = appState.selectedBacklink === '__untagged__' ? 'Untagged' : appState.selectedBacklink;
        }
        
        // For file pane header on mobile
        if (type === 'file') {
            return (
                <div className="nn-pane-header">
                    <div className="nn-header-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div className="nn-mobile-back">
                            <button
                                className="nn-icon-button"
                                aria-label="Back to folders"
                                onClick={() => dispatch({ type: 'SET_MOBILE_VIEW', view: 'list' })}
                                tabIndex={-1}
                            >
                                <ObsidianIcon name="arrow-left" />
                            </button>
                            <span className="nn-mobile-title">{headerTitle}</span>
                        </div>
                        <button
                            className="nn-icon-button"
                            aria-label="New note"
                            onClick={handleNewFile}
                            disabled={!appState.selectedFolder}
                            tabIndex={-1}
                        >
                            <ObsidianIcon name="file-plus" />
                        </button>
                    </div>
                </div>
            );
        }
        
        // For folder pane header on mobile
        return (
            <div className="nn-pane-header">
                <div className="nn-header-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <button
                        className="nn-icon-button"
                        aria-label="New folder"
                        onClick={handleNewFolder}
                        disabled={!appState.selectedFolder}
                        tabIndex={-1}
                    >
                        <ObsidianIcon name="folder-plus" />
                    </button>
                </div>
            </div>
        );
    }
    
    // Desktop header (original code)
    return (
        <div className="nn-pane-header">
            <div className="nn-header-actions">
                {type === 'folder' ? (
                    <>
                        <button
                            className="nn-icon-button"
                            aria-label={appState.expandedFolders.size > 0 ? "Collapse all folders" : "Expand all folders"}
                            onClick={handleExpandCollapseAll}
                            tabIndex={-1}
                        >
                            <ObsidianIcon 
                                name={appState.expandedFolders.size > 0 ? 'chevrons-down-up' : 'chevrons-up-down'}
                            />
                        </button>
                        <button
                            className="nn-icon-button"
                            aria-label="New folder"
                            onClick={handleNewFolder}
                            disabled={!appState.selectedFolder}
                            tabIndex={-1}
                        >
                            <ObsidianIcon name="folder-plus" />
                        </button>
                    </>
                ) : (
                    <button
                        className="nn-icon-button"
                        aria-label="New note"
                        onClick={handleNewFile}
                        disabled={!appState.selectedFolder}
                        tabIndex={-1}
                    >
                        <ObsidianIcon name="file-plus" />
                    </button>
                )}
            </div>
        </div>
    );
}