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

import { TFile } from 'obsidian';
import type { FileData } from './IndexedDBStorage';
import { getDBInstance } from './fileOperations';

/**
 * DiffCalculator - Vault state synchronization
 *
 * What it does:
 * - Calculates differences between current vault files and cached database state
 * - Identifies files that need to be added, updated, or removed
 *
 * Relationships:
 * - Used by: StorageContext (to detect vault changes)
 * - Uses: IndexedDBStorage (reads cached records through the memory mirror)
 *
 * Key responsibilities:
 * - Compare file paths and modification times against cached records in place
 * - Return lists of files to add, update, and remove
 * - Return the cached records for files to update so recordFileChanges avoids re-fetching them
 */

/**
 * Calculate the difference between the IndexedDB storage and current vault state.
 * Identifies files that need to be added, updated, or removed from the cache.
 * Reads cached records in place through the memory mirror.
 *
 * @param currentFiles - Array of current files in the vault
 * @returns Lists of files to add/update/remove, cached records for the files to update, and the cached record count
 */
export function calculateFileDiff(currentFiles: TFile[]): {
    toAdd: TFile[];
    toUpdate: TFile[];
    toRemove: string[];
    existingData: Map<string, FileData>;
    cachedFileCount: number;
} {
    const db = getDBInstance();
    const toAdd: TFile[] = [];
    const toUpdate: TFile[] = [];
    const toRemove: string[] = [];
    // Cached records for files in toUpdate, consumed by recordFileChanges
    const existingData = new Map<string, FileData>();

    // Track current file paths for quick lookup when scanning for removals.
    const currentPaths = new Set<string>();

    // Check each current file
    for (const file of currentFiles) {
        currentPaths.add(file.path);
        const cached = db.getFile(file.path);

        if (!cached) {
            // New file not in cache
            toAdd.push(file);
        } else if (file.stat.mtime !== cached.mtime) {
            // File modified since last cache
            toUpdate.push(file);
            existingData.set(file.path, cached);
        }
    }

    // Check for deleted files
    db.forEachFile(path => {
        if (!currentPaths.has(path)) {
            toRemove.push(path);
        }
    });

    return { toAdd, toUpdate, toRemove, existingData, cachedFileCount: db.getFileCount() };
}
