/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
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

/**
 * Storage system type definitions
 */

/**
 * Represents a node in the hierarchical tag tree.
 * Each node contains information about a tag and its nested children.
 */
export interface TagTreeNode {
    /** The name of this part of the tag (e.g., "processing" for "inbox/processing") */
    name: string;
    /** The full path of the tag without # prefix - ALWAYS LOWERCASE for logic (e.g., "inbox/processing") */
    path: string;
    /** The canonical display path with original casing for UI (e.g., "Inbox/Processing") */
    displayPath: string;
    /** Map of child tag nodes, keyed by their lowercase name */
    children: Map<string, TagTreeNode>;
    /** Set of file paths that have this exact tag */
    notesWithTag: Set<string>;
}

export type PropertyTreeNodeId = `key:${string}` | `key:${string}=${string}`;

export interface PropertyTreeNode {
    id: PropertyTreeNodeId;
    kind: 'key' | 'value';
    /** Canonical lowercase property key used for lookups (for example "status"). */
    key: string;
    /** Canonical lowercase value ("a/b/c") for value nodes, null for key nodes. */
    valuePath: string | null;
    /** Display label for this node (key name or value). */
    name: string;
    /** Canonical display path for UI. Key nodes use the display key, value nodes use the value label. */
    displayPath: string;
    /** Original frontmatter string written when applying this value node to files. */
    assignmentValue?: string;
    children: Map<string, PropertyTreeNode>;
    /** Set of file paths that have this exact key/value (key nodes include any value for the key). */
    notesWithValue: Set<string>;
}
