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

import { TFile, App, getAllTags, Plugin } from 'obsidian';
import { cache } from 'react';


/**
 * Interface that covers the necessary parts of LinkCache and FrontmatterLinkCache
 * to filter backlinks correctly.
 */
export interface GenericLinkCache {
    displayText?: string; // The text displayed for the link
    link: string; // The link path
    original: string; // The original link text
    key?: string; // Unique key for the link (Frontmatter only)
    position?: {
        start: { line: number; col: number }; // Start position of the link in the file
        end: { line: number; col: number }; // End position of the link in the file
    }; // Position in the file (optional)
}

/**
 * Represents a node in the hierarchical backlink tree.
 * Each node contains information about a backlink and its nested children.
 */
export interface BacklinkTreeNode {
    /** The name of this part of the tag (e.g., "processing" for "#inbox/processing") */
    name: string;
    /** The full path of the backlink (e.g., "inbox/processing") */
    path: string;
    /** Map of child backlink nodes, keyed by their name */
    children: Map<string, BacklinkTreeNode>;
    /** Set of file paths that have this exact backlink */
    notesWithTag: Set<string>;
}

/**
 * Builds a hierarchical tree structure from flat backlinks
 * Backlinks like "inbox/processing" will create nested nodes
*  if backlinksFolderPath is set
 * 
 * @param allFiles - Array of markdown files to process
 * @param folderPath - Path of the folder, if applicable (otherwise empty string) which contains tag backlink files
 * @param app - Obsidian app instance for metadata access
 * @returns Map of root-level backlink nodes
 */
export function buildBacklinkTree(allFiles: TFile[], folderPath: string, app: App): Map<string, BacklinkTreeNode> {
    const root = new Map<string, BacklinkTreeNode>();
    
    // Early return for empty file list
    if (!allFiles || allFiles.length === 0) {
        return root;
    }
    
    const allBacklinksCache = new Map<string, Set<string>>();

    // First pass: collect all backlinks and their associated files
    for (const file of allFiles) {
        const fileCache = app.metadataCache.getFileCache(file);
        if (!fileCache) continue;

        const links = (fileCache.links as GenericLinkCache[] | undefined)?.concat(fileCache.frontmatterLinks || []);
        if (!links || links.length === 0) continue;
        for (const link of links) {
            // Get file from link
            const linkFile = app.metadataCache.getFirstLinkpathDest(link.link, file.path);
            if (!linkFile) continue;
            if (!linkFile.path.startsWith(folderPath)) continue;
            let backlinkPath;
            if (folderPath) {
                backlinkPath = linkFile.path.replace(folderPath + '/', '');
            } else {
                backlinkPath = linkFile.path; // Use full path if no folderPath is set
            }
            // Remove any extension if present
            backlinkPath = backlinkPath.replace(/\.(md|canvas|base)$/, '');
            if (!allBacklinksCache.has(backlinkPath)) {
                allBacklinksCache.set(backlinkPath, new Set());
            }
            allBacklinksCache.get(backlinkPath)!.add(file.path);
        }
    }

    // Second pass: build the tree structure
    allBacklinksCache.forEach((notes, backlink) => {
        // Remove any remaining / prefix and split by /
        if (backlink.startsWith('/')) {
            backlink = backlink.substring(1);
        }
        const parts = backlink.split('/');
        let currentLevel = root;

        parts.forEach((part, index) => {
            // Rebuild the full path up to this point
            const currentPath = parts.slice(0, index + 1).join('/');

            if (!currentLevel.has(part)) {
                currentLevel.set(part, {
                    name: part,
                    path: currentPath,
                    children: new Map(),
                    notesWithTag: new Set(),
                });
            }

            const node = currentLevel.get(part)!;

            // If this is the last part, it's the actual tag with notes
            if (index === parts.length - 1) {
                node.notesWithTag = notes;
            }

            currentLevel = node.children;
        });
    });

    return root;
}

// Cache for total note counts to avoid recalculation
const noteCountCache = new WeakMap<BacklinkTreeNode, number>();

/**
 * Gets the total count of notes for a backlink node including all its children.
 * This is useful for showing aggregate counts in parent backlink.
 * Uses memoization to improve performance.
 * 
 * @param node - The backlink node to count
 * @returns Total number of notes with this backlink or any child backlink
 */
export function getTotalNoteCount(node: BacklinkTreeNode): number {
    // Check cache first
    const cached = noteCountCache.get(node);
    if (cached !== undefined) {
        return cached;
    }
    
    let count = node.notesWithTag.size;
    
    for (const child of node.children.values()) {
        count += getTotalNoteCount(child);
    }
    
    // Cache the result
    noteCountCache.set(node, count);
    
    return count;
}

/**
 * Collects all backlink paths from a node and its descendants.
 * Used when filtering files by a parent tag.
 * 
 * @param node - The root node to start from
 * @param paths - Set to collect paths into (optional)
 * @returns Set of all backlink paths in this subtree
 */
export function collectAllBacklinkPaths(node: BacklinkTreeNode, paths: Set<string> = new Set()): Set<string> {
    paths.add(node.path);
    
    for (const child of node.children.values()) {
        collectAllBacklinkPaths(child, paths);
    }
    
    return paths;
}

/**
 * Finds a backlink node by its path in the tree.
 * 
 * @param path - The backlink path to find (e.g., "inbox/processing")
 * @param tree - The root tree to search in
 * @returns The tag node if found, null otherwise
 */
export function findBacklinkNode(path: string, tree: Map<string, BacklinkTreeNode>): BacklinkTreeNode | null {
    // Validate input
    if (!path || path.length <= 1) {
        return null;
    }

    // Remove leading slash if present
    if (path.startsWith('/')) {
        path = path.substring(1);
    } 
    
    const parts = path.split('/').filter(part => part.length > 0);
    if (parts.length === 0) {
        return null;
    }
    
    let currentLevel = tree;
    let currentNode: BacklinkTreeNode | undefined;

    for (const part of parts) {
        currentNode = currentLevel.get(part);
        if (!currentNode) return null;
        currentLevel = currentNode.children;
    }

    return currentNode || null;
}
