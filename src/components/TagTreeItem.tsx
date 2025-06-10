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

import React from 'react';
import { setIcon } from 'obsidian';
import { TagTreeNode } from '../utils/tagUtils';

/**
 * Props for the TagTreeItem component
 */
interface TagTreeItemProps {
    /** The tag node to render */
    tagNode: TagTreeNode;
    /** Nesting level for indentation */
    level: number;
    /** Whether this tag is expanded to show children */
    isExpanded: boolean;
    /** Whether this tag is currently selected */
    isSelected: boolean;
    /** Callback when the expand/collapse chevron is clicked */
    onToggle: () => void;
    /** Callback when the tag name is clicked */
    onClick: () => void;
    /** Total count of files with this tag (including children) */
    fileCount: number;
    /** Whether to show file counts */
    showFileCount: boolean;
    /** Whether this is a backlink item */
    backlink?: boolean;
}

/**
 * Component that renders a single tag in the hierarchical tag tree.
 * Handles indentation, expand/collapse state, and selection state.
 */
export function TagTreeItem({ 
    tagNode, 
    level, 
    isExpanded, 
    isSelected, 
    onToggle, 
    onClick, 
    fileCount,
    showFileCount,
    backlink=false
}: TagTreeItemProps) {
    const chevronRef = React.useRef<HTMLDivElement>(null);
    const hasChildren = tagNode.children.size > 0;

    // Update chevron icon based on expanded state
    React.useEffect(() => {
        if (chevronRef.current && hasChildren) {
            setIcon(chevronRef.current, isExpanded ? 'chevron-down' : 'chevron-right');
        }
    }, [isExpanded, hasChildren]);

    return (
        <div 
            className={`nn-tag-item ${isSelected ? 'nn-selected' : ''} ${backlink ? 'nn-backlink-item' : ''}`} 
            data-tag={tagNode.path}
            style={{ paddingLeft: `${level * 20}px` }}
        >
            <div
                ref={chevronRef}
                className="nn-tag-arrow"
                style={{ 
                    visibility: hasChildren ? 'visible' : 'hidden',
                    cursor: hasChildren ? 'pointer' : 'default',
                    width: '18px',
                    minWidth: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (hasChildren) onToggle();
                }}
            />
            <span className="nn-tag-icon">#</span>
            <span 
                className="nn-tag-name" 
                onClick={onClick}
                style={{ cursor: 'pointer' }}
            >
                {tagNode.name}
            </span>
            {showFileCount && fileCount > 0 && (
                <span className="nn-tag-count">{fileCount}</span>
            )}
        </div>
    );
}