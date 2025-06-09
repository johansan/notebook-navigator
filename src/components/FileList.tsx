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
import { buildBacklinkTree, collectAllBacklinkPaths, findBacklinkNode, GenericLinkCache } from 'src/utils/backlinkUtils';

/**
 * Renders the file list pane displaying files from the selected folder.
 * Handles file sorting, grouping by date, pinned notes, and auto-selection.
 * Integrates with the app context to manage file selection and navigation.
 * 
 * @returns A scrollable list of files grouped by date (if enabled) with empty state handling
 */
export function FileList() {
    const { app, appState, dispatch, plugin, refreshCounter } = useAppContext();
    const { selectionType, selectedFolder, selectedTag, selectedBacklink } = appState;
    
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
        } else if (selectionType === 'backlink' && selectedBacklink) {
            // Get all markdown files that aren't excluded
            const allMarkdownFiles = app.vault.getMarkdownFiles()
                .filter(file => excludedProperties.length === 0 || !shouldExcludeFile(file, excludedProperties, app));
            
            // Special case for untagged files
            if (selectedBacklink === UNTAGGED_TAG_ID) {
                allFiles = allMarkdownFiles.filter(file => {
                    if (file.path.startsWith(plugin.settings.backlinksFolderPath)) {
                        return false;
                    }
                    const cache = app.metadataCache.getFileCache(file);
                    let links: GenericLinkCache[] | undefined = cache?.links || [];
                    links = links.concat(cache?.frontmatterLinks || []);
                    const procLinks = links?.filter(link => {
                        const linkFile = app.metadataCache.getFirstLinkpathDest(link.link, file.path);
                        if (!linkFile) return false;
                        if (!linkFile.path.startsWith(plugin.settings.backlinksFolderPath)) return false;
                        return true;
                    });
                    return !procLinks || procLinks.length === 0;
                });
            } else {
                // Build the backlink tree once
                const backlinkTree = buildBacklinkTree(allMarkdownFiles, plugin.settings.backlinksFolderPath, app);
                
                // Find the selected backlink node
                const selectedNode = findBacklinkNode(selectedBacklink, backlinkTree);
                if (selectedNode) {
                    // Collect all tags to include (selected tag and all children)
                    const backlinksToInclude = collectAllBacklinkPaths(selectedNode);
                    
                    // Filter files that have any of the collected backlinks
                    allFiles = allMarkdownFiles.filter(file => {
                        const cache = app.metadataCache.getFileCache(file);
                        let links: GenericLinkCache[] | undefined = cache?.links || [];
                        links = links.concat(cache?.frontmatterLinks || []);
                        const linksFPaths = links?.map(link => {
                            const linkFile = app.metadataCache.getFirstLinkpathDest(link.link, file.path);
                            if (!linkFile) return '';
                            // Check if the link file is within the backlinks folder path
                            if (!linkFile.path.startsWith(plugin.settings.backlinksFolderPath)) return '';
                            let backlinkPath;
                            if (plugin.settings.backlinksFolderPath) {
                                backlinkPath = linkFile.path.replace(plugin.settings.backlinksFolderPath + '/', '');
                            } else {
                                backlinkPath = linkFile.path; // Use full path if no folderPath is set
                            }
                            // Remove any extension if present
                            backlinkPath = backlinkPath.replace(/\.(md|canvas|base)$/, '');
                            return backlinkPath;
                        });
                        return linksFPaths && linksFPaths.some(link => backlinksToInclude.has(link));
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
        selectedBacklink,
        plugin.settings.sortOption,
        plugin.settings.showNotesFromSubfolders,
        plugin.settings.pinnedNotes,
        plugin.settings.excludedFiles,
        app, 
        refreshCounter
    ]);
    
    // Auto-select first file when folder/tag changes
    useLayoutEffect(() => {
        // Need either a folder or tag selected
        if (!selectedFolder && !selectedTag) return;
        
        // Don't auto-select if we already have a file selected in the current context
        if (selectionType === 'folder' && selectedFolder && appState.selectedFile) {
            // Check if the selected file is in the current folder
            if (appState.selectedFile.parent?.path === selectedFolder.path) {
                return; // Keep current selection
            }
        }
        
        // For tags, also check if we already have a file selected
        if ((selectionType === 'tag' || selectionType === 'backlink') && appState.selectedFile) {
            // Check if the selected file is in the current file list
            const fileElements = Array.from(document.querySelectorAll('.nn-file-item'));
            const selectedFileInList = fileElements.some(el => 
                (el as HTMLElement).dataset.path === appState.selectedFile?.path
            );
            if (selectedFileInList) {
                return; // Keep current selection if it's in the current tag's file list
            }
        }
        
        // Find and select the first file
        const firstFileElement = document.querySelector('.nn-file-item');
        if (firstFileElement) {
            const file = getFileFromElement(firstFileElement as HTMLElement, app);
            if (file) {
                dispatch({ type: 'SET_SELECTED_FILE', file });
                
                // Always open the file when a new folder/tag is selected
                // This matches the original behavior
                const leaf = app.workspace.getMostRecentLeaf();
                if (leaf) {
                    leaf.openFile(file);
                }
            }
        }
    }, [selectionType, selectedFolder?.path, selectedTag, selectedBacklink, appState.selectedFile, app.workspace, dispatch]);
    
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
    
    if (!selectedFolder && !selectedTag && !selectedBacklink) {
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