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
import { createDefaultFileData, IndexedDBStorage, type FileData } from './IndexedDBStorage';
import { recordStartupDiagnostic } from '../services/diagnostics/DebugLoggingService';
import type { ContentProviderType } from '../interfaces/IContentProvider';
import { getProviderProcessedMtimeField } from './providerMtime';

/**
 * FileOperations - IndexedDB storage access layer and cache management
 *
 * What it does:
 * - Manages singleton IndexedDB storage instance
 * - Provides simplified API for file operations
 * - Handles content invalidation when files change
 *
 * Relationships:
 * - Uses: IndexedDBStorage (maintains singleton instance)
 * - Used by: StorageContext, ContentProviders, DiffCalculator, Statistics
 *
 * Key responsibilities:
 * - Initialize and provide database access
 * - Extract tags from Obsidian metadata
 * - Detect file modifications and clear stale content
 * - Batch update files efficiently
 * - Clear content when mtime or tags change
 */

// Global IndexedDB storage instance
let dbInstance: IndexedDBStorage | null = null;
let appId: string | null = null;
let isInitializing = false;
let isShuttingDown = false;
let isShutdownState = false;
let initializationPromise: Promise<void> | null = null;
// Configured feature image blob cache size for the current platform.
let featureImageCacheMaxEntries: number | null = null;
// Configured preview text LRU size for the current platform.
let previewTextCacheMaxEntries: number | null = null;
// Configured preview text load batch size for the current platform.
let previewLoadMaxBatch: number | null = null;

/**
 * Indicates whether a database shutdown is currently in progress.
 * Used to avoid issuing write operations during teardown cycles.
 */
export function isShutdownInProgress(): boolean {
    return isShuttingDown || isShutdownState;
}

/**
 * Get the singleton IndexedDB storage instance.
 * Creates the instance on first call.
 *
 * @returns The global IndexedDB storage instance
 */
export function getDBInstance(): IndexedDBStorage {
    if (!dbInstance) {
        if (!appId) {
            throw new Error('Database not initialized. Call initializeDatabase(appId) first.');
        }
        // Build the constructor options from the configured module-level settings.
        const options: {
            featureImageCacheMaxEntries?: number;
            previewTextCacheMaxEntries?: number;
            previewLoadMaxBatch?: number;
        } = {};
        if (featureImageCacheMaxEntries !== null) {
            options.featureImageCacheMaxEntries = featureImageCacheMaxEntries;
        }
        if (previewTextCacheMaxEntries !== null) {
            options.previewTextCacheMaxEntries = previewTextCacheMaxEntries;
        }
        if (previewLoadMaxBatch !== null) {
            options.previewLoadMaxBatch = previewLoadMaxBatch;
        }

        // Only pass options when at least one value is configured.
        dbInstance = new IndexedDBStorage(appId, Object.keys(options).length > 0 ? options : undefined);
    }
    return dbInstance;
}

/**
 * Returns the global database instance when initialized, otherwise null.
 *
 * This avoids throwing during early startup when callers only need best-effort cache reads.
 */
export function getDBInstanceOrNull(): IndexedDBStorage | null {
    if (isShutdownInProgress() || !appId) {
        return null;
    }
    return getDBInstance();
}

/**
 * Initialize the database connection.
 * Must be called before using any other file operations.
 *
 * @param appIdParam - The app ID to use for database naming
 */
export async function initializeDatabase(
    appIdParam: string,
    options?: {
        featureImageCacheMaxEntries?: number;
        previewTextCacheMaxEntries?: number;
        previewLoadMaxBatch?: number;
    }
): Promise<void> {
    const initStartMs = performance.now();
    recordStartupDiagnostic('fileOperations.initializeDatabase.start', {
        appId: appIdParam,
        hasExistingInstance: dbInstance !== null
    });
    if (isShuttingDown) {
        recordStartupDiagnostic('fileOperations.initializeDatabase.skipped', { reason: 'shutdown' });
        return;
    }
    if (isShutdownState) {
        isShutdownState = false;
    }

    // Idempotent: if already initialized or in progress, skip
    if (isInitializing) {
        if (initializationPromise) {
            await initializationPromise;
        }
        return;
    }
    const existing = dbInstance;
    if (existing && existing.isInitialized()) {
        return;
    }

    isInitializing = true;
    initializationPromise = (async () => {
        try {
            if (isShutdownInProgress()) {
                recordStartupDiagnostic('fileOperations.initializeDatabase.skipped', { reason: 'shutdownInProgress' });
                return;
            }
            appId = appIdParam;
            if (options?.featureImageCacheMaxEntries !== undefined) {
                // Persist feature image cache size for the singleton instance.
                featureImageCacheMaxEntries = options.featureImageCacheMaxEntries;
            }
            if (options?.previewTextCacheMaxEntries !== undefined) {
                previewTextCacheMaxEntries = options.previewTextCacheMaxEntries;
            }
            if (options?.previewLoadMaxBatch !== undefined) {
                previewLoadMaxBatch = options.previewLoadMaxBatch;
            }
            const db = getDBInstance();
            await db.init();
            if (isShutdownInProgress() || dbInstance !== db) {
                return;
            }
            recordStartupDiagnostic('fileOperations.initializeDatabase.complete', {
                elapsedMs: Math.round(performance.now() - initStartMs)
            });
        } finally {
            isInitializing = false;
        }
    })();

    try {
        await initializationPromise;
    } finally {
        initializationPromise = null;
    }
}

/**
 * Waits for shared database initialization and returns the singleton instance.
 *
 * Returns null when the plugin has not configured the database yet or initialization fails.
 */
export async function waitForDatabaseInitialization(): Promise<IndexedDBStorage | null> {
    if (isShutdownInProgress()) {
        return null;
    }

    if (!appId) {
        const waitStart = Date.now();
        while (!appId && !isShutdownInProgress() && Date.now() - waitStart < 5000) {
            await new Promise<void>(resolve => {
                window.setTimeout(resolve, 50);
            });
        }
    }

    if (isShutdownInProgress() || !appId) {
        return null;
    }

    if (initializationPromise) {
        try {
            await initializationPromise;
        } catch (error) {
            console.error('Failed while waiting for database initialization:', error);
            return null;
        }
    }

    const db = getDBInstanceOrNull();
    if (!db) {
        return null;
    }

    if (!db.isInitialized()) {
        if (isShutdownInProgress() || dbInstance !== db) {
            return null;
        }
        try {
            await db.init();
            if (isShutdownInProgress() || dbInstance !== db) {
                return null;
            }
        } catch (error) {
            console.error('Failed to initialize database while waiting:', error);
            return null;
        }
    }

    return db;
}

/**
 * Dispose the global database instance and clear module singletons.
 * Called on plugin unload to release IndexedDB connection and memory cache.
 */
export function shutdownDatabase(): void {
    // Idempotent: if already shut down or in progress, skip
    if (!dbInstance && !appId && !isInitializing && !initializationPromise) {
        return;
    }
    if (isShuttingDown) return;

    isShuttingDown = true;
    isShutdownState = true;
    try {
        try {
            dbInstance?.close();
        } catch (e) {
            console.error('Failed to close database on shutdown:', e);
        }
    } finally {
        dbInstance = null;
        appId = null;
        isInitializing = false;
        initializationPromise = null;
        featureImageCacheMaxEntries = null;
        previewTextCacheMaxEntries = null;
        previewLoadMaxBatch = null;
        isShuttingDown = false;
    }
}

/**
 * Record file changes in the database.
 *
 * Behavior:
 * - New files: Initialize with null content fields for content generation
 * - Modified files: Update the stored mtime, leaving provider processed mtimes unchanged
 * - Unchanged files: Update the record (useful for sync scenarios)
 *
 * Content providers track their own processed mtimes (e.g. `markdownPipelineMtime`, `tagsMtime`) to detect staleness.
 * On file modification, we keep existing content visible until regeneration completes, avoiding UI flicker.
 *
 * @param files - Array of Obsidian files to record
 * @param existingData - Pre-fetched map of existing file data
 */
export async function recordFileChanges(
    files: TFile[],
    existingData: Map<string, FileData>,
    renamedData?: Map<string, FileData>,
    dbOverride?: Pick<IndexedDBStorage, 'upsertFilesWithPatch'>
): Promise<void> {
    if (isShutdownInProgress()) return;
    const db = dbOverride ?? getDBInstance();
    // Use patch-only upserts for existing records so provider-owned fields cannot be overwritten by stale snapshots.
    const updates: { path: string; create: FileData; patch?: Partial<FileData> }[] = [];

    for (const file of files) {
        const existing = existingData.get(file.path);
        const renamed = renamedData?.get(file.path);

        if (!existing) {
            if (renamed) {
                const clonedData: FileData = {
                    ...renamed,
                    mtime: file.stat.mtime
                };
                updates.push({ path: file.path, create: clonedData });
                renamedData?.delete(file.path);
                continue;
            }
            // New file - initialize with default content and provider bookkeeping fields.
            updates.push({ path: file.path, create: createDefaultFileData({ mtime: file.stat.mtime, path: file.path }) });
        } else if (renamed) {
            // File exists in DB and has pending rename data - merge them
            // This happens when a file is renamed then modified before the rename is fully processed
            const patch: Partial<FileData> = {
                mtime: file.stat.mtime,
                markdownPipelineMtime: renamed.markdownPipelineMtime,
                tagsMtime: renamed.tagsMtime,
                metadataMtime: renamed.metadataMtime,
                fileThumbnailsMtime: renamed.fileThumbnailsMtime,
                tags: renamed.tags,
                wordCount: renamed.wordCount,
                characterCountWithSpaces: renamed.characterCountWithSpaces,
                characterCountWithoutSpaces: renamed.characterCountWithoutSpaces,
                taskTotal: renamed.taskTotal,
                taskUnfinished: renamed.taskUnfinished,
                properties: renamed.properties,
                previewStatus: renamed.previewStatus,
                featureImageStatus: renamed.featureImageStatus,
                featureImageKey: renamed.featureImageKey,
                metadata: renamed.metadata
            };
            const createdData: FileData = { ...renamed, mtime: file.stat.mtime };
            updates.push({ path: file.path, create: createdData, patch });
            renamedData?.delete(file.path);
        } else if (existing.mtime !== file.stat.mtime) {
            // Keep the record mtime in sync with the vault.
            // Regeneration is driven by provider-specific processed mtimes and content status fields.
            const createdData: FileData = { ...existing, mtime: file.stat.mtime };
            // Patch only the stat-derived fields; all other fields come from the stored record.
            updates.push({ path: file.path, create: createdData, patch: { mtime: file.stat.mtime } });
        }
    }

    await db.upsertFilesWithPatch(updates);
}

/**
 * Mark files for content regeneration without clearing existing content fields.
 *
 * This resets provider processed mtimes so providers re-run even when the file mtime has not changed
 * (for example when Obsidian refreshes metadata after a frontmatter edit that preserves timestamps).
 *
 * @param files - Array of Obsidian files to mark for regeneration
 */
export async function markFilesForRegeneration(
    files: TFile[],
    providers?: readonly ContentProviderType[],
    dbOverride?: Pick<IndexedDBStorage, 'getFiles' | 'upsertFilesWithPatch'>
): Promise<void> {
    if (isShutdownInProgress()) return;
    const db = dbOverride ?? getDBInstance();
    const paths = files.map(f => f.path);
    const existingData = db.getFiles(paths);
    const providersToReset = providers && providers.length > 0 ? providers : null;
    // Reset provider processed mtimes without clearing provider output fields.
    const updates: { path: string; create: FileData; patch?: Partial<FileData> }[] = [];

    for (const file of files) {
        const existing = existingData.get(file.path);
        if (!existing) {
            // File not in database yet, record it
            updates.push({ path: file.path, create: createDefaultFileData({ mtime: file.stat.mtime, path: file.path }) });
        } else {
            // Force regeneration by resetting provider processed mtimes without clearing existing content fields.
            const patch: Partial<FileData> = {
                mtime: file.stat.mtime
            };
            if (providersToReset) {
                for (const provider of providersToReset) {
                    patch[getProviderProcessedMtimeField(provider)] = 0;
                }
            } else {
                patch.markdownPipelineMtime = 0;
                patch.tagsMtime = 0;
                patch.metadataMtime = 0;
                patch.fileThumbnailsMtime = 0;
            }
            const createdData: FileData = { ...existing, ...patch };
            updates.push({ path: file.path, create: createdData, patch });
        }
    }

    await db.upsertFilesWithPatch(updates);
}

/**
 * Remove files from the database.
 *
 * @param paths - Array of file paths to remove
 */
export async function removeFilesFromCache(paths: string[]): Promise<void> {
    if (isShutdownInProgress()) return;
    const db = getDBInstance();
    await db.deleteFiles(paths);
}
