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

import React, { useMemo, useLayoutEffect, useCallback } from 'react';
import { TFile, TFolder, TAbstractFile, getAllTags } from 'obsidian';
import { useAppContext } from '../context/AppContext';
import { FileItem } from './FileItem';
import { DateUtils } from '../utils/DateUtils';
import { isTFile, isTFolder } from '../utils/typeGuards';
import { parseExcludedProperties, shouldExcludeFile } from '../utils/fileFilters';
import { getFileFromElement } from '../utils/domUtils';
import { buildTagTree, findTagNode, collectAllTagPaths } from '../utils/tagUtils';
import { UNTAGGED_TAG_ID } from '../types';

/**
 * Renders the file list pane displaying files from the selected folder.
 * Handles file sorting, grouping by date, pinned notes, and auto-selection.
 * Integrates with the app context to manage file selection and navigation.
 * 
 * @returns A scrollable list of files grouped by date (if enabled) with empty state handling
 */
export function FileList() {
    const { app, appState, dispatch, plugin, refreshCounter } = useAppContext();
    const { selectionType, selectedFolder, selectedTag, selectedFile } = appState;
    
    const handleFileClick = useCallback((file: TFile) => {
        dispatch({ type: 'SET_SELECTED_FILE', file });
        dispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
        
        // Open file preview
        const leaf = app.workspace.getMostRecentLeaf();
        if (leaf) {
            leaf.openFile(file);
        }
    }, [app.workspace, dispatch]);
    
    // Get files from selected folder or tag
    const files = useMemo(() => {
        let allFiles: TFile[] = [];
        const excludedProperties = parseExcludedProperties(plugin.settings.excludedFiles);

        if (selectionType === 'folder' && selectedFolder) {
            const collectFiles = (folder: TFolder): TFile[] => {
            const files: TFile[] = [];
            
            for (const child of folder.children) {
                if (isTFile(child)) {
                    // Only include supported file types
                    if (child.extension === 'md' || child.extension === 'canvas' || child.extension === 'base') {
                        files.push(child);
                    }
                } else if (plugin.settings.showNotesFromSubfolders && isTFolder(child)) {
                    files.push(...collectFiles(child));
                }
            }
            
            return files;
        };
        
            allFiles = collectFiles(selectedFolder);
            
        } else if (selectionType === 'tag' && selectedTag) {
            // Get all markdown files that aren't excluded
            const allMarkdownFiles = app.vault.getMarkdownFiles()
                .filter(file => excludedProperties.length === 0 || !shouldExcludeFile(file, excludedProperties, app));
            
            // Special case for untagged files
            if (selectedTag === UNTAGGED_TAG_ID) {
                allFiles = allMarkdownFiles.filter(file => {
                    const cache = app.metadataCache.getFileCache(file);
                    const fileTags = cache ? getAllTags(cache) : null;
                    return !fileTags || fileTags.length === 0;
                });
            } else {
                // Build the tag tree once
                const tagTree = buildTagTree(allMarkdownFiles, app);
                
                // Find the selected tag node
                const selectedNode = findTagNode(selectedTag, tagTree);
                
                if (selectedNode) {
                    // Collect all tags to include (selected tag and all children)
                    const tagsToInclude = collectAllTagPaths(selectedNode);
                    
                    // Filter files that have any of the collected tags
                    allFiles = allMarkdownFiles.filter(file => {
                        const cache = app.metadataCache.getFileCache(file);
                        const fileTags = cache ? getAllTags(cache) : null;
                        return fileTags && fileTags.some(tag => tagsToInclude.has(tag));
                    });
                } else {
                    // Fallback to empty if tag not found
                    allFiles = [];
                }
            }
        }
        
        // Filter out excluded files based on frontmatter properties
        if (excludedProperties.length > 0) {
            allFiles = allFiles.filter(file => !shouldExcludeFile(file, excludedProperties, app));
        }
        
        // Sort files based on settings
        switch (plugin.settings.sortOption) {
            case 'modified':
                allFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);
                break;
            case 'created':
                allFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);
                break;
            case 'title':
                allFiles.sort((a, b) => a.basename.localeCompare(b.basename));
                break;
        }
        
        // Handle pinned notes (only for folder selection)
        if (selectionType === 'folder' && selectedFolder) {
            const pinnedPaths = plugin.settings.pinnedNotes[selectedFolder.path] || [];
            const pinnedFiles = pinnedPaths
                .map(path => app.vault.getAbstractFileByPath(path))
                .filter(isTFile);
            
            const unpinnedFiles = allFiles.filter(file => !pinnedPaths.includes(file.path));
            
            return [...pinnedFiles, ...unpinnedFiles];
        }
        
        return allFiles;
    }, [
        selectionType,
        selectedFolder,
        selectedTag,
        plugin.settings.sortOption,
        plugin.settings.showNotesFromSubfolders,
        plugin.settings.pinnedNotes,
        plugin.settings.excludedFiles,
        app, 
        refreshCounter
    ]);
    
    // Auto-select first file when folder/tag changes
    useLayoutEffect(() => {
        if (files.length > 0) {
            // If we have a selected file and it's in the current file list, keep it selected
            if (selectedFile && files.some(f => f.path === selectedFile.path)) {
                return;
            }

            // If we have a selected file and we're showing subfolders, check if it's in the current folder hierarchy
            if (selectedFile && plugin.settings.showNotesFromSubfolders) {
                const selectedFileParentPath = selectedFile.path.split('/').slice(0, -1).join('/');
                const currentFolderPath = selectedFolder?.path || '';
                if (selectedFileParentPath.startsWith(currentFolderPath)) {
                    return;
                }
            }

            // If we have a selected file and we're not showing subfolders, check if it's in the current folder
            if (selectedFile && !plugin.settings.showNotesFromSubfolders) {
                const selectedFileParentPath = selectedFile.path.split('/').slice(0, -1).join('/');
                if (selectedFileParentPath === selectedFolder?.path) {
                    return;
                }
            }

            // If we have a selected folder, select the first file in that folder
            if (selectedFolder) {
                const firstFileInFolder = files.find(f => {
                    const parentPath = f.path.split('/').slice(0, -1).join('/');
                    return parentPath === selectedFolder.path;
                });
                if (firstFileInFolder) {
                    dispatch({ type: 'SET_SELECTED_FILE', file: firstFileInFolder });
                    return;
                }
            }

            // Otherwise, select the first file in the list
            dispatch({ type: 'SET_SELECTED_FILE', file: files[0] });
        }
    }, [files, selectedFolder, selectedFile, dispatch, plugin.settings.showNotesFromSubfolders]);
    
    // Group files by date if enabled
    const groupedFiles = useMemo(() => {
        // Separate pinned files first (only for folder selection)
        const pinnedPaths = (selectionType === 'folder' && selectedFolder) ? 
            (plugin.settings.pinnedNotes[selectedFolder.path] || []) : [];
        const pinnedFiles = files.filter(file => pinnedPaths.includes(file.path));
        const unpinnedFiles = files.filter(file => !pinnedPaths.includes(file.path));

        const groups: { title: string | null; files: TFile[] }[] = [];

        // Add Pinned group if it exists
        if (pinnedFiles.length > 0) {
            groups.push({ title: '📌 Pinned', files: pinnedFiles });
        }

        // Group remaining files
        if (!plugin.settings.groupByDate || plugin.settings.sortOption === 'title') {
            if (unpinnedFiles.length > 0) {
                groups.push({ title: null, files: unpinnedFiles });
            }
            return groups;
        }
        
        const dateGroups = new Map<string, TFile[]>();
        unpinnedFiles.forEach(file => {
            const fileDate = new Date(
                plugin.settings.sortOption === 'created' ? file.stat.ctime : file.stat.mtime
            );
            const groupTitle = DateUtils.getDateGroup(fileDate.getTime());
            
            if (!dateGroups.has(groupTitle)) {
                dateGroups.set(groupTitle, []);
            }
            dateGroups.get(groupTitle)!.push(file);
        });
        
        // Add date groups to the main groups array
        dateGroups.forEach((filesInGroup, title) => {
            groups.push({ title, files: filesInGroup });
        });

        return groups;
    }, [
        files, 
        plugin.settings.groupByDate,
        plugin.settings.sortOption,
        plugin.settings.pinnedNotes,
        selectionType,
        selectedFolder
    ]);
    
    if (!selectedFolder && !selectedTag) {
        return (
            <div className="nn-file-list nn-empty-state">
                <div className="nn-empty-message">Select a folder or tag to view notes</div>
            </div>
        );
    }
    
    if (files.length === 0) {
        return (
            <div className="nn-file-list nn-empty-state">
                <div className="nn-empty-message">No notes</div>
            </div>
        );
    }
    
    return (
        <div className="nn-file-list">
            {groupedFiles.map((group) => (
                <div key={group.title || 'ungrouped'} className="nn-file-group">
                    {group.title && (
                        <div className="nn-date-group-header">{group.title}</div>
                    )}
                    {group.files.map((file) => (
                        <FileItem
                            key={file.path}
                            file={file}
                            isSelected={appState.selectedFile?.path === file.path}
                            onClick={() => handleFileClick(file)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}