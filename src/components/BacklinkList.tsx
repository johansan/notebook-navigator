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

// src/components/TagList.tsx
import React, { useMemo } from 'react';
import { getAllTags } from 'obsidian';
import { useAppContext } from '../context/AppContext';
import { buildBacklinkTree, BacklinkTreeNode, getTotalNoteCount, GenericLinkCache } from '../utils/backlinkUtils';
import { TagTreeItem } from './TagTreeItem';
import { parseExcludedProperties, shouldExcludeFile } from '../utils/fileFilters';

/**
 * Component that displays all Backlinks in the vault as a hierarchical tree.
 * Backlinks are organized by their path structure (e.g., inbox/processing).
 */
export function BacklinkList() {
    const { app, appState, dispatch, plugin, refreshCounter, isMobile } = useAppContext();

    // Don't render if backlinks are disabled in settings
    if (!plugin.settings.showBacklinks) {
        return null;
    }

    // Build the tag tree from all vault files
    const tagTree = useMemo(() => {
        const excludedProperties = parseExcludedProperties(plugin.settings.excludedFiles);
        const allFiles = app.vault.getMarkdownFiles().filter(file => {
            return !excludedProperties.length || !shouldExcludeFile(file, excludedProperties, app);
        });
        return buildBacklinkTree(allFiles, plugin.settings.backlinksFolderPath, app);
    }, [app.vault, app.metadataCache, plugin.settings.excludedFiles, refreshCounter]);

    // Recursive render function for tag nodes
    const renderBacklinkNode = (tagNode: BacklinkTreeNode, level: number = 0): React.ReactNode => {
        const isExpanded = appState.expandedTags.has(tagNode.path);
        const isSelected = appState.selectionType === 'tag' && appState.selectedTag === tagNode.path;
        const fileCount = getTotalNoteCount(tagNode);

        return (
            <React.Fragment key={tagNode.path}>
                <TagTreeItem
                    tagNode={tagNode}
                    level={level}
                    isExpanded={isExpanded}
                    isSelected={isSelected}
                    fileCount={fileCount}
                    showFileCount={plugin.settings.showFolderFileCount}
                    onClick={() => {
                        dispatch({ type: 'SET_SELECTED_BACKLINK', backlink: tagNode.path });
                        if (isMobile) {
                            dispatch({ type: 'SET_MOBILE_VIEW', view: 'files' });
                        }
                    }}
                    onToggle={() => dispatch({ type: 'TOGGLE_TAG_EXPANDED', tagPath: tagNode.path })}
                />
                <div className={`nn-tag-children ${isExpanded ? 'nn-expanded' : ''}`}>
                    <div className="nn-tag-children-inner">
                        {isExpanded && Array.from(tagNode.children.values())
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(child => renderBacklinkNode(child, level + 1))}
                    </div>
                </div>
            </React.Fragment>
        );
    };

    // Count untagged files only when needed
    const untaggedCount = useMemo(() => {
        if (!plugin.settings.showUntagged) {
            return 0;
        }
        
        const excludedProperties = parseExcludedProperties(plugin.settings.excludedFiles);
        return app.vault.getMarkdownFiles().filter(file => {
            if (excludedProperties.length && shouldExcludeFile(file, excludedProperties, app) || file.path.startsWith(plugin.settings.backlinksFolderPath)) {
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
        }).length;
    }, [plugin.settings.showUntagged, app.vault, app.metadataCache, plugin.settings.excludedFiles, refreshCounter]);

    // Get root nodes and sort them
    const rootNodes = Array.from(tagTree.values()).sort((a, b) => a.name.localeCompare(b.name));

    // Don't render if there are no tags and no untagged files
    if (rootNodes.length === 0 && untaggedCount === 0) {
        return null;
    }

    return (
        <div className="nn-tag-list-container">
            <div className="nn-section-header">Tag Links</div>
            <div className="nn-tag-list">
                {rootNodes.map(node => renderBacklinkNode(node, 0))}
            </div>
        </div>
    );
}