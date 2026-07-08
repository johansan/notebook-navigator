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

import { TFile, TFolder } from 'obsidian';
import type { PaneType, WorkspaceLeaf } from 'obsidian';

const BACKGROUND_OPEN_MARKER_TTL_MS = 250;

/**
 * Types of operations that can be tracked by the command queue
 */
export enum OperationType {
    MOVE_FILE = 'move-file',
    RENAME_FOLDER = 'rename-folder',
    DELETE_FILES = 'delete-files',
    OPEN_FOLDER_NOTE = 'open-folder-note',
    OPEN_VERSION_HISTORY = 'open-version-history',
    OPEN_IN_NEW_CONTEXT = 'open-in-new-context',
    OPEN_BACKGROUND_FILE = 'open-background-file',
    OPEN_ACTIVE_FILE = 'open-active-file',
    OPEN_HOMEPAGE = 'open-homepage'
}

/**
 * Base interface for all operations
 */
interface BaseOperation {
    id: string;
    type: OperationType;
    timestamp: number;
}

/**
 * Operation for tracking file moves
 */
interface MoveFileOperation extends BaseOperation {
    type: OperationType.MOVE_FILE;
    files: TFile[];
    targetFolder: TFolder;
}

/**
 * Operation for tracking folder renames
 */
interface RenameFolderOperation extends BaseOperation {
    type: OperationType.RENAME_FOLDER;
    folderPath: string;
}

/**
 * Operation for tracking batch file deletions
 */
interface DeleteFilesOperation extends BaseOperation {
    type: OperationType.DELETE_FILES;
    files: TFile[];
}

/**
 * Operation for tracking folder note opening
 */
interface OpenFolderNoteOperation extends BaseOperation {
    type: OperationType.OPEN_FOLDER_NOTE;
    folderPath: string;
}

/**
 * Operation for tracking version history opening
 */
interface OpenVersionHistoryOperation extends BaseOperation {
    type: OperationType.OPEN_VERSION_HISTORY;
    file: TFile;
}

/**
 * Operation for tracking opening files in new contexts
 */
interface OpenInNewContextOperation extends BaseOperation {
    type: OperationType.OPEN_IN_NEW_CONTEXT;
    file: TFile;
    context: PaneType;
}

/**
 * Operation for opening a file without changing the active editor context.
 */
interface OpenBackgroundFileOperation extends BaseOperation {
    type: OperationType.OPEN_BACKGROUND_FILE;
    file: TFile;
}

/**
 * Operation for opening the active file in the current context
 */
interface OpenActiveFileOperation extends BaseOperation {
    type: OperationType.OPEN_ACTIVE_FILE;
    file: TFile;
    active: boolean;
}

/**
 * Operation for tracking homepage file opening
 */
interface OpenHomepageOperation extends BaseOperation {
    type: OperationType.OPEN_HOMEPAGE;
    file: TFile;
}

interface BackgroundOpenMarker {
    operationId: string;
    filePath: string;
    leaf: WorkspaceLeaf | null;
    leafId?: string;
    completedAt?: number;
    fileOpenSeen: boolean;
    activeLeafChangeSeen: boolean;
}

interface OpenActiveFileOptions {
    active?: boolean;
    getLeaf?: () => WorkspaceLeaf | null;
}

interface BackgroundFileOpenOptions {
    getLeaf?: () => WorkspaceLeaf | null;
}

type Operation =
    | MoveFileOperation
    | RenameFolderOperation
    | DeleteFilesOperation
    | OpenFolderNoteOperation
    | OpenVersionHistoryOperation
    | OpenInNewContextOperation
    | OpenBackgroundFileOperation
    | OpenActiveFileOperation
    | OpenHomepageOperation;

/**
 * Result of a command execution
 */
export interface CommandResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
}

export interface MoveFilesCommandData {
    movedCount: number;
    skippedCount: number;
    cancelledCount: number;
    movedSourcePaths: string[];
    errors: { filePath: string; error: unknown }[];
}

/**
 * Service for managing operations and their context, replacing global window flags.
 * This provides a centralized, encapsulated way to track ongoing operations
 * and coordinate between the React UI and Obsidian's event system.
 */
export class CommandQueueService {
    private activeOperations = new Map<string, Operation>();
    private operationCounter = 0;
    private listeners = new Set<(type: OperationType, active: boolean) => void>();
    // Track active counts per operation type to handle overlapping operations
    private activeCounts = new Map<OperationType, number>();
    private openActiveFileQueue: Promise<void> = Promise.resolve();
    private latestOpenActiveFileOperationId: string | null = null;
    private backgroundOpenMarkers = new Map<string, BackgroundOpenMarker>();

    constructor() {}

    private cleanupBackgroundOpenMarkers(now: number): void {
        for (const [operationId, marker] of this.backgroundOpenMarkers) {
            if (marker.completedAt !== undefined && now - marker.completedAt > BACKGROUND_OPEN_MARKER_TTL_MS) {
                this.backgroundOpenMarkers.delete(operationId);
            }
        }
    }

    private getWorkspaceLeafId(leaf: WorkspaceLeaf | null): string | undefined {
        const candidate = (leaf as { id?: unknown } | null)?.id;
        return typeof candidate === 'string' ? candidate : undefined;
    }

    private createBackgroundOpenMarker(operationId: string, filePath: string, leaf: WorkspaceLeaf | null): void {
        const leafId = this.getWorkspaceLeafId(leaf);

        this.cleanupBackgroundOpenMarkers(Date.now());
        this.backgroundOpenMarkers.set(operationId, {
            operationId,
            filePath,
            leaf,
            leafId,
            fileOpenSeen: false,
            activeLeafChangeSeen: false
        });
    }

    private completeBackgroundOpenMarker(operationId: string): void {
        const marker = this.backgroundOpenMarkers.get(operationId);
        if (!marker) {
            return;
        }

        marker.completedAt = Date.now();
        this.deleteBackgroundOpenMarkerIfConsumed(marker);
        this.cleanupBackgroundOpenMarkers(Date.now());
    }

    private hasExpectedBackgroundOpenEvents(marker: BackgroundOpenMarker): boolean {
        return marker.fileOpenSeen && (marker.leafId === undefined || marker.activeLeafChangeSeen);
    }

    private deleteBackgroundOpenMarkerIfConsumed(marker: BackgroundOpenMarker): void {
        if (this.hasExpectedBackgroundOpenEvents(marker)) {
            this.backgroundOpenMarkers.delete(marker.operationId);
        }
    }

    private leafMatchesBackgroundOpenMarker(marker: BackgroundOpenMarker, leaf: WorkspaceLeaf | null): boolean {
        if (!leaf) {
            return false;
        }

        if (marker.leaf === leaf) {
            return true;
        }

        if (marker.leafId === undefined) {
            return false;
        }

        const leafId = this.getWorkspaceLeafId(leaf);
        return marker.leafId === leafId;
    }

    /**
     * Generate a unique operation ID
     */
    private generateOperationId(): string {
        return `op-${Date.now()}-${++this.operationCounter}`;
    }

    /**
     * Subscribe to operation activity changes. Returns an unsubscribe function.
     */
    onOperationChange(listener: (type: OperationType, active: boolean) => void): () => void {
        this.listeners.add(listener);
        this.activeCounts.forEach((count, type) => {
            if (count > 0) {
                this.notifyListener(listener, type, true);
            }
        });
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListener(listener: (type: OperationType, active: boolean) => void, type: OperationType, active: boolean) {
        try {
            listener(type, active);
        } catch (e) {
            // Swallow listener errors to avoid breaking queue
            console.error('CommandQueueService listener error:', e);
        }
    }

    private notify(type: OperationType, active: boolean) {
        this.listeners.forEach(l => {
            this.notifyListener(l, type, active);
        });
    }

    /**
     * Increment active count for type and notify only on transition to active
     */
    private markActive(type: OperationType) {
        const prev = this.activeCounts.get(type) ?? 0;
        const next = prev + 1;
        this.activeCounts.set(type, next);
        if (prev === 0 && next === 1) {
            this.notify(type, true);
        }
    }

    /**
     * Decrement active count for type and notify only on transition to inactive
     */
    private markInactive(type: OperationType) {
        const prev = this.activeCounts.get(type) ?? 0;
        const next = Math.max(0, prev - 1);
        this.activeCounts.set(type, next);
        if (prev > 0 && next === 0) {
            this.notify(type, false);
        }
    }

    /**
     * Check if there's an active operation of a specific type
     */
    hasActiveOperation(type: OperationType): boolean {
        for (const operation of this.activeOperations.values()) {
            if (operation.type === type) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a specific file move operation is active
     */
    isMovingFile(): boolean {
        return this.hasActiveOperation(OperationType.MOVE_FILE);
    }

    /**
     * Check if a folder rename operation is active
     */
    isRenamingFolder(): boolean {
        return this.hasActiveOperation(OperationType.RENAME_FOLDER);
    }

    /**
     * Check if Navigator is performing a path-changing operation that should not trigger active-file auto-reveal
     */
    isChangingFilePaths(): boolean {
        return this.isMovingFile() || this.isRenamingFolder();
    }

    /**
     * Check if deleting files
     */
    isDeletingFiles(): boolean {
        return this.hasActiveOperation(OperationType.DELETE_FILES);
    }

    /**
     * Check if opening a folder note
     */
    isOpeningFolderNote(): boolean {
        return this.hasActiveOperation(OperationType.OPEN_FOLDER_NOTE);
    }

    /**
     * Check if opening the homepage file
     */
    isOpeningHomepage(): boolean {
        return this.hasActiveOperation(OperationType.OPEN_HOMEPAGE);
    }

    /**
     * Check if opening version history
     */
    isOpeningVersionHistory(): boolean {
        return this.hasActiveOperation(OperationType.OPEN_VERSION_HISTORY);
    }

    /**
     * Check if opening in a new context (tab/split only, not window)
     * Window opens in a separate window so doesn't affect current window's focus
     */
    isOpeningInNewContext(): boolean {
        for (const operation of this.activeOperations.values()) {
            if (operation.type === OperationType.OPEN_IN_NEW_CONTEXT) {
                const op = operation;
                // Only tab and split affect the current window
                if (op.context === 'tab' || op.context === 'split') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if any background file open is currently in progress.
     */
    isBackgroundFileOpenInProgress(): boolean {
        for (const operation of this.activeOperations.values()) {
            if (operation.type === OperationType.OPEN_BACKGROUND_FILE) {
                return true;
            }

            if (operation.type === OperationType.OPEN_ACTIVE_FILE && operation.active === false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Consume a file-open event emitted by a known background open.
     */
    consumeBackgroundFileOpen(filePath: string, leaf: WorkspaceLeaf | null): boolean {
        this.cleanupBackgroundOpenMarkers(Date.now());

        const candidates = Array.from(this.backgroundOpenMarkers.values()).filter(marker => {
            return marker.filePath === filePath && !marker.fileOpenSeen;
        });
        const marker = candidates.find(candidate => this.leafMatchesBackgroundOpenMarker(candidate, leaf)) ?? candidates[0];
        if (!marker) {
            return false;
        }

        marker.fileOpenSeen = true;
        this.deleteBackgroundOpenMarkerIfConsumed(marker);
        return true;
    }

    /**
     * Consume an active-leaf-change event emitted by a known background open.
     */
    consumeBackgroundActiveLeafChange(leaf: WorkspaceLeaf | null): boolean {
        this.cleanupBackgroundOpenMarkers(Date.now());

        const marker = Array.from(this.backgroundOpenMarkers.values()).find(candidate => {
            return !candidate.activeLeafChangeSeen && this.leafMatchesBackgroundOpenMarker(candidate, leaf);
        });
        if (!marker) {
            return false;
        }

        marker.activeLeafChangeSeen = true;
        this.deleteBackgroundOpenMarkerIfConsumed(marker);
        return true;
    }

    /**
     * Execute a background file open without affecting active-file open ordering.
     */
    async executeBackgroundFileOpen(
        file: TFile,
        openFile: (targetLeaf: WorkspaceLeaf | null) => Promise<void>,
        options?: BackgroundFileOpenOptions
    ): Promise<CommandResult> {
        const operationId = this.generateOperationId();
        const operation: OpenBackgroundFileOperation = {
            id: operationId,
            type: OperationType.OPEN_BACKGROUND_FILE,
            timestamp: Date.now(),
            file
        };

        this.activeOperations.set(operationId, operation);

        try {
            const targetLeaf = options?.getLeaf?.() ?? null;
            this.createBackgroundOpenMarker(operationId, file.path, targetLeaf);
            await openFile(targetLeaf);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error as Error
            };
        } finally {
            this.activeOperations.delete(operationId);
            this.completeBackgroundOpenMarker(operationId);
        }
    }

    /**
     * Execute a file move operation with proper context tracking
     */
    async executeMoveFiles(
        files: TFile[],
        targetFolder: TFolder,
        performMove: () => Promise<MoveFilesCommandData>
    ): Promise<CommandResult<MoveFilesCommandData>> {
        const operationId = this.generateOperationId();
        const operation: MoveFileOperation = {
            id: operationId,
            type: OperationType.MOVE_FILE,
            timestamp: Date.now(),
            files,
            targetFolder
        };

        this.activeOperations.set(operationId, operation);
        this.markActive(OperationType.MOVE_FILE);

        try {
            const data = await performMove();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error as Error
            };
        } finally {
            // Always clean up the operation
            this.activeOperations.delete(operationId);
            this.markInactive(OperationType.MOVE_FILE);
        }
    }

    /**
     * Execute a folder rename operation with proper context tracking
     */
    async executeRenameFolder(folderPath: string, performRename: () => Promise<void>): Promise<CommandResult<void>> {
        const operationId = this.generateOperationId();
        const operation: RenameFolderOperation = {
            id: operationId,
            type: OperationType.RENAME_FOLDER,
            timestamp: Date.now(),
            folderPath
        };

        this.activeOperations.set(operationId, operation);
        this.markActive(OperationType.RENAME_FOLDER);

        try {
            await performRename();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error as Error
            };
        } finally {
            this.activeOperations.delete(operationId);
            this.markInactive(OperationType.RENAME_FOLDER);
        }
    }

    /**
     * Execute a batch delete operation with proper context tracking
     */
    async executeDeleteFiles(files: TFile[], performDelete: () => Promise<void>): Promise<CommandResult<void>> {
        const operationId = this.generateOperationId();
        const operation: DeleteFilesOperation = {
            id: operationId,
            type: OperationType.DELETE_FILES,
            timestamp: Date.now(),
            files
        };

        this.activeOperations.set(operationId, operation);
        this.markActive(OperationType.DELETE_FILES);

        try {
            await performDelete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error as Error };
        } finally {
            this.activeOperations.delete(operationId);
            this.markInactive(OperationType.DELETE_FILES);
        }
    }

    /**
     * Execute opening a folder note with context tracking
     */
    async executeOpenFolderNote(folderPath: string, openFile: () => Promise<void>): Promise<CommandResult> {
        const operationId = this.generateOperationId();
        const operation: OpenFolderNoteOperation = {
            id: operationId,
            type: OperationType.OPEN_FOLDER_NOTE,
            timestamp: Date.now(),
            folderPath
        };

        this.activeOperations.set(operationId, operation);

        try {
            await openFile();
            // Clean up immediately after the file is opened
            this.activeOperations.delete(operationId);
            return { success: true };
        } catch (error) {
            // Clean up on error as well
            this.activeOperations.delete(operationId);
            return {
                success: false,
                error: error as Error
            };
        }
    }

    /**
     * Execute opening version history with context tracking
     */
    async executeOpenVersionHistory(file: TFile, openHistory: () => Promise<void>): Promise<CommandResult> {
        const operationId = this.generateOperationId();
        const operation: OpenVersionHistoryOperation = {
            id: operationId,
            type: OperationType.OPEN_VERSION_HISTORY,
            timestamp: Date.now(),
            file
        };

        this.activeOperations.set(operationId, operation);

        try {
            await openHistory();
            // Clean up immediately after the version history command is executed
            this.activeOperations.delete(operationId);
            return { success: true };
        } catch (error) {
            // Clean up on error as well
            this.activeOperations.delete(operationId);
            return {
                success: false,
                error: error as Error
            };
        }
    }

    /**
     * Execute opening a file in a new context (tab/split/window) with context tracking
     */
    async executeOpenInNewContext(file: TFile, context: PaneType, openFile: () => Promise<void>): Promise<CommandResult> {
        const operationId = this.generateOperationId();
        const operation: OpenInNewContextOperation = {
            id: operationId,
            type: OperationType.OPEN_IN_NEW_CONTEXT,
            timestamp: Date.now(),
            file,
            context
        };

        this.activeOperations.set(operationId, operation);

        try {
            await openFile();
            // Clean up immediately after the file is opened
            this.activeOperations.delete(operationId);
            return { success: true };
        } catch (error) {
            // Clean up on error as well
            this.activeOperations.delete(operationId);
            return {
                success: false,
                error: error as Error
            };
        }
    }

    /**
     * Execute opening a file in the active leaf. Ensures only the latest request runs
     * while preserving execution order to prevent stale opens from winning the race.
     */
    async executeOpenActiveFile(
        file: TFile,
        openFile: (targetLeaf: WorkspaceLeaf | null) => Promise<void>,
        options?: OpenActiveFileOptions
    ): Promise<CommandResult<{ skipped: boolean }>> {
        const active = options?.active ?? true;
        const operationId = this.generateOperationId();
        const operation: OpenActiveFileOperation = {
            id: operationId,
            type: OperationType.OPEN_ACTIVE_FILE,
            timestamp: Date.now(),
            file,
            active
        };

        this.latestOpenActiveFileOperationId = operationId;

        const run = async (): Promise<CommandResult<{ skipped: boolean }>> => {
            // Skip if a newer operation has been queued
            if (this.latestOpenActiveFileOperationId !== operationId) {
                return { success: true, data: { skipped: true } };
            }

            this.activeOperations.set(operationId, operation);
            this.markActive(OperationType.OPEN_ACTIVE_FILE);

            try {
                const targetLeaf = options?.getLeaf?.() ?? null;
                if (active === false) {
                    this.createBackgroundOpenMarker(operationId, file.path, targetLeaf);
                }
                await openFile(targetLeaf);
                // Clear tracking if this is still the latest
                if (this.latestOpenActiveFileOperationId === operationId) {
                    this.latestOpenActiveFileOperationId = null;
                }
                return { success: true, data: { skipped: false } };
            } catch (error) {
                // Clear tracking on error if this is still the latest
                if (this.latestOpenActiveFileOperationId === operationId) {
                    this.latestOpenActiveFileOperationId = null;
                }
                return {
                    success: false,
                    error: error as Error
                };
            } finally {
                this.activeOperations.delete(operationId);
                this.markInactive(OperationType.OPEN_ACTIVE_FILE);
                if (active === false) {
                    this.completeBackgroundOpenMarker(operationId);
                }
            }
        };

        // Chain task to maintain execution order
        const task = this.openActiveFileQueue.then(run, run);
        this.openActiveFileQueue = task.then(
            () => undefined,
            () => undefined
        );

        return task;
    }

    /**
     * Execute opening the homepage file with context tracking
     */
    async executeHomepageOpen(file: TFile, openFile: () => Promise<void>): Promise<CommandResult> {
        const operationId = this.generateOperationId();
        const operation: OpenHomepageOperation = {
            id: operationId,
            type: OperationType.OPEN_HOMEPAGE,
            timestamp: Date.now(),
            file
        };

        this.activeOperations.set(operationId, operation);
        this.markActive(OperationType.OPEN_HOMEPAGE);

        try {
            await openFile();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error as Error
            };
        } finally {
            this.activeOperations.delete(operationId);
            this.markInactive(OperationType.OPEN_HOMEPAGE);
        }
    }

    /**
     * Get all active operations (for debugging)
     */
    getActiveOperations(): Operation[] {
        return Array.from(this.activeOperations.values());
    }

    /**
     * Clear all operations (useful for cleanup)
     */
    clearAllOperations(): void {
        this.activeOperations.clear();
        this.activeCounts.clear();
        this.backgroundOpenMarkers.clear();
    }
}
