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

import type { PropertyTreeNode, TagTreeNode } from '../../types/storage';

/**
 * In-memory data used by the navigator UI (tag tree + counts).
 */
export interface StorageFileData {
    tagTree: Map<string, TagTreeNode>;
    propertyTree: Map<string, PropertyTreeNode>;
    tagged: number;
    untagged: number;
    hiddenRootTags: Map<string, TagTreeNode>;
    /** Tag paths, with their ancestors, carried by files in excluded folders (`buildTagTreeFromDatabase`) */
    excludedTagPaths: Set<string>;
}
