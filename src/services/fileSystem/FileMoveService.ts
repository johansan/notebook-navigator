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

import { App, TAbstractFile, TFile, TFolder, normalizePath } from 'obsidian';

import { strings } from '../../i18n';
import { FolderSuggestModal } from '../../modals/FolderSuggestModal';
import { MoveFileConflictModal, type MoveFileConflictItem, type MoveFileConflictResolution } from '../../modals/MoveFileConflictModal';
import type { ISettingsProvider } from '../../interfaces/ISettingsProvider';
import { showNotice } from '../../utils/noticeUtils';
import { TIMEOUTS } from '../../types/obsidian-extended';
import { buildFilePathInFolder, buildPathInFolder, generateUniqueFilename } from '../../utils/fileCreationUtils';
import { EXCALIDRAW_BASENAME_SUFFIX, stripExcalidrawSuffix, isExcalidrawFile } from '../../utils/fileNameUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import type { MoveFilesCommandData } from '../CommandQueueService';
import type { CommandQueueService } from '../CommandQueueService';
import type { MaybePromise } from '../../utils/async';
import type { MoveFileConflictsSetting } from '../../settings/types';
import { resolveMoveFileConflictsSetting } from '../../settings/types';
import { FolderPathSettingsSync } from './FolderPathSettingsSync';
import type { MoveFilesOptions, MoveFilesResult, MoveFolderModalResult, MoveFolderResult } from './types';
import type { MovedFileSelectionUpdate } from '../../context/selection/types';

interface PlannedFileMove {
    file: TFile;
    originalPath: string;
    targetPath: string;
    overwrite: boolean;
}

interface DeferredMoveConflict {
    file: TFile;
    originalPath: string;
    desiredPath: string;
    suggestedPath: string;
    canOverwrite: boolean;
}

interface PlannedMoveExecutionOutcomeMoved {
    status: 'moved';
    originalPath: string;
}

interface PlannedMoveExecutionOutcomeSkipped {
    status: 'skipped';
}

interface PlannedMoveExecutionOutcomeErrored {
    status: 'error';
    originalPath: string;
    error: unknown;
}

type PlannedMoveExecutionOutcome =
    PlannedMoveExecutionOutcomeMoved | PlannedMoveExecutionOutcomeSkipped | PlannedMoveExecutionOutcomeErrored;

const FILE_MOVE_BATCH_SIZE = 12;

export class FolderMoveError extends Error {
    constructor(
        public readonly code: 'invalid-target' | 'destination-exists' | 'verification-failed',
        message?: string
    ) {
        super(message ?? code);
        this.name = 'FolderMoveError';
    }
}

class CancelAwareFolderSuggestModal extends FolderSuggestModal {
    constructor(
        app: App,
        onChooseFolder: (folder: TFolder) => MaybePromise,
        placeholderText: string,
        actionText: string,
        excludePaths: Set<string>,
        private readonly onCancel: () => void
    ) {
        super(app, onChooseFolder, placeholderText, actionText, excludePaths);
    }

    onClose(): void {
        super.onClose();
        this.onCancel();
    }
}

interface FileMoveServiceOptions {
    app: App;
    settingsProvider: ISettingsProvider;
    getCommandQueue: () => CommandQueueService | null;
    resolveFolderDisplayLabel: (folder: TFolder) => string;
    folderPathSettingsSync: FolderPathSettingsSync;
}

export class FileMoveService {
    private readonly app: App;
    private readonly settingsProvider: ISettingsProvider;
    private readonly getCommandQueue: () => CommandQueueService | null;
    private readonly resolveFolderDisplayLabel: (folder: TFolder) => string;
    private readonly folderPathSettingsSync: FolderPathSettingsSync;

    constructor(options: FileMoveServiceOptions) {
        this.app = options.app;
        this.settingsProvider = options.settingsProvider;
        this.getCommandQueue = options.getCommandQueue;
        this.resolveFolderDisplayLabel = options.resolveFolderDisplayLabel;
        this.folderPathSettingsSync = options.folderPathSettingsSync;
    }

    public async moveFilesToFolder(options: MoveFilesOptions): Promise<MoveFilesResult> {
        const { files, targetFolder, selectionContext, showNotifications = true } = options;
        const result: MoveFilesResult = { movedCount: 0, skippedCount: 0, cancelledCount: 0, errors: [] };

        if (files.length === 0) {
            return result;
        }

        // Original paths are captured before the move because Obsidian rewrites TFile.path in place during a
        // rename, and the moved-path result from the command queue is keyed by the pre-move path.
        const originalPathsByFile = new Map(files.map(file => [file, file.path] as const));
        const commandQueue = this.getCommandQueue();
        if (commandQueue) {
            const moveConflictsSetting = this.resolveMoveFileConflictsSetting();
            const targetFolderLabel = this.resolveFolderDisplayLabel(targetFolder);

            const performMove = async (): Promise<MoveFilesCommandData> => {
                let cancelledCount = 0;
                const movedSourcePaths: string[] = [];
                const errors: { filePath: string; error: unknown }[] = [];

                const plannedMoves: PlannedFileMove[] = [];
                const deferredConflicts: DeferredMoveConflict[] = [];
                const existingDestinationEntries = new Map<string, TAbstractFile>();
                const reservedPaths = new Set<string>();
                const suggestionReservedPaths = new Set<string>();

                targetFolder.children.forEach(child => {
                    const childPath = normalizePath(child.path);
                    existingDestinationEntries.set(childPath, child);
                    suggestionReservedPaths.add(childPath);
                });

                const computeUniqueTargetPath = (file: TFile, additionalReserved: ReadonlySet<string>, useVaultLookup: boolean): string => {
                    const excalidraw = isExcalidrawFile(file);
                    const baseName = excalidraw ? stripExcalidrawSuffix(file.basename) : file.basename;
                    const uniqueFileName = generateUniqueFilename(targetFolder.path, baseName, file.extension, this.app, {
                        occupiedPaths: additionalReserved,
                        useVaultLookup,
                        baseNameSuffix: excalidraw ? EXCALIDRAW_BASENAME_SUFFIX : ''
                    });
                    return buildFilePathInFolder(targetFolder.path, uniqueFileName, file.extension);
                };

                for (const file of files) {
                    const originalPath = file.path;
                    const desiredPath = buildPathInFolder(targetFolder.path, file.name);

                    if (desiredPath === originalPath) {
                        continue;
                    }

                    const reservedCollision = reservedPaths.has(desiredPath);
                    const existingEntry = reservedCollision ? null : (existingDestinationEntries.get(desiredPath) ?? null);

                    if (!reservedCollision && !existingEntry) {
                        plannedMoves.push({ file, originalPath, targetPath: desiredPath, overwrite: false });
                        reservedPaths.add(desiredPath);
                        suggestionReservedPaths.add(desiredPath);
                        continue;
                    }

                    const suggestedPath = computeUniqueTargetPath(file, suggestionReservedPaths, false);
                    suggestionReservedPaths.add(suggestedPath);
                    const canOverwrite = existingEntry instanceof TFile;

                    if (moveConflictsSetting === 'rename') {
                        plannedMoves.push({ file, originalPath, targetPath: suggestedPath, overwrite: false });
                        reservedPaths.add(suggestedPath);
                        continue;
                    }

                    deferredConflicts.push({
                        file,
                        originalPath,
                        desiredPath,
                        suggestedPath,
                        canOverwrite
                    });
                }

                if (moveConflictsSetting === 'ask' && deferredConflicts.length > 0) {
                    const conflictItems: MoveFileConflictItem[] = deferredConflicts.map(conflict => {
                        const suggestedFileName = conflict.suggestedPath.split('/').pop() ?? conflict.file.name;
                        return {
                            sourceFileName: conflict.file.name,
                            suggestedFileName,
                            canOverwrite: conflict.canOverwrite
                        };
                    });

                    const resolution = await new Promise<MoveFileConflictResolution | null>(resolve => {
                        const modal = new MoveFileConflictModal(this.app, {
                            targetFolderName: targetFolderLabel,
                            conflicts: conflictItems,
                            onResolve: resolve
                        });
                        modal.open();
                    });

                    if (!resolution) {
                        cancelledCount = deferredConflicts.length;
                        return { movedCount: 0, skippedCount: 0, cancelledCount, movedSourcePaths: [], errors: [] };
                    }

                    for (const conflict of deferredConflicts) {
                        const shouldOverwrite =
                            resolution === 'overwrite' && conflict.canOverwrite && !reservedPaths.has(conflict.desiredPath);
                        let targetPath = shouldOverwrite ? conflict.desiredPath : conflict.suggestedPath;

                        if (!shouldOverwrite && reservedPaths.has(targetPath)) {
                            targetPath = computeUniqueTargetPath(conflict.file, suggestionReservedPaths, false);
                            suggestionReservedPaths.add(targetPath);
                        }

                        plannedMoves.push({
                            file: conflict.file,
                            originalPath: conflict.originalPath,
                            targetPath,
                            overwrite: shouldOverwrite
                        });
                        reservedPaths.add(targetPath);
                    }
                }

                let movedCount = 0;
                let skippedCount = 0;

                const executePlannedMove = async (plan: PlannedFileMove): Promise<PlannedMoveExecutionOutcome> => {
                    let finalTargetPath = plan.targetPath;

                    if (!plan.overwrite && this.app.vault.getAbstractFileByPath(finalTargetPath)) {
                        finalTargetPath = computeUniqueTargetPath(plan.file, reservedPaths, true);
                        reservedPaths.add(finalTargetPath);
                    }

                    try {
                        if (plan.overwrite) {
                            const entryToOverwrite = this.app.vault.getAbstractFileByPath(finalTargetPath);
                            if (entryToOverwrite instanceof TFile) {
                                await this.app.fileManager.trashFile(entryToOverwrite);
                            } else if (entryToOverwrite) {
                                return { status: 'skipped' };
                            }
                        }

                        await this.app.fileManager.renameFile(plan.file, finalTargetPath);
                        return {
                            status: 'moved',
                            originalPath: plan.originalPath
                        };
                    } catch (error) {
                        console.error('Error moving file:', plan.originalPath, error);
                        return {
                            status: 'error',
                            originalPath: plan.originalPath,
                            error
                        };
                    }
                };

                for (let index = 0; index < plannedMoves.length; index += FILE_MOVE_BATCH_SIZE) {
                    const batch = plannedMoves.slice(index, index + FILE_MOVE_BATCH_SIZE);
                    const outcomes = await Promise.all(batch.map(plan => executePlannedMove(plan)));

                    for (const outcome of outcomes) {
                        if (outcome.status === 'moved') {
                            movedCount += 1;
                            movedSourcePaths.push(outcome.originalPath);
                            continue;
                        }

                        if (outcome.status === 'skipped') {
                            skippedCount += 1;
                            continue;
                        }

                        errors.push({ filePath: outcome.originalPath, error: outcome.error });
                    }
                }

                return { movedCount, skippedCount, cancelledCount, movedSourcePaths, errors };
            };

            const moveResult = await commandQueue.executeMoveFiles(files, targetFolder, performMove);
            if (!moveResult.success || !moveResult.data) {
                if (moveResult.error) {
                    console.error('Error during move operation:', moveResult.error);
                    throw moveResult.error;
                }
                throw new Error('Move operation failed');
            }

            result.movedCount = moveResult.data.movedCount;
            result.skippedCount = moveResult.data.skippedCount;
            result.cancelledCount = moveResult.data.cancelledCount;

            if (selectionContext) {
                // Only files that actually moved are reported; skipped and cancelled files keep their paths and
                // their selection. Files that stay in the list are reported too so the reducer can re-key them.
                const movedPathSet = new Set(moveResult.data.movedSourcePaths);
                const movedFiles: MovedFileSelectionUpdate[] = [];
                for (const file of files) {
                    const originalPath = originalPathsByFile.get(file);
                    if (originalPath === undefined || !movedPathSet.has(originalPath)) {
                        continue;
                    }
                    movedFiles.push({ file, originalPath, inCurrentList: selectionContext.isFileInCurrentList(file) });
                }

                if (movedFiles.length > 0) {
                    selectionContext.dispatch({ type: 'CLEANUP_MOVED_FILES', movedFiles });
                }
            }

            if (Array.isArray(moveResult.data.errors) && moveResult.data.errors.length > 0) {
                for (const err of moveResult.data.errors) {
                    const existingFile = this.app.vault.getFileByPath(err.filePath);
                    if (existingFile) {
                        result.errors.push({ file: existingFile, error: err.error });
                        continue;
                    }

                    const fallbackFile = files.find(file => file.path === err.filePath) ?? files[0];
                    result.errors.push({ file: fallbackFile, error: err.error });
                }
            }
        }

        if (showNotifications) {
            if (result.skippedCount > 0) {
                const message =
                    files.length === 1
                        ? strings.dragDrop.errors.itemAlreadyExists.replace('{name}', files[0].name)
                        : strings.dragDrop.notifications.filesAlreadyExist.replace('{count}', result.skippedCount.toString());
                showNotice(message, { timeout: TIMEOUTS.NOTICE_ERROR, variant: 'warning' });
            }

            if (result.errors.length > 0 && files.length === 1) {
                const firstError = result.errors[0]?.error;
                showNotice(strings.dragDrop.errors.failedToMove.replace('{error}', getErrorMessage(firstError)), { variant: 'warning' });
            }
        }

        return result;
    }

    public async moveFilesWithModal(files: TFile[], selectionContext?: MoveFilesOptions['selectionContext']): Promise<void> {
        if (files.length === 0) {
            return;
        }

        const excludePaths = new Set<string>();
        if (files.length === 1 && files[0].parent) {
            excludePaths.add(files[0].parent.path);
        }

        const isMultiple = files.length > 1;
        const placeholderText = this.getMovePlaceholder(this.getMoveTargetLabelForFiles(files), !isMultiple);

        const modal = new FolderSuggestModal(
            this.app,
            async targetFolder => {
                const result = await this.moveFilesToFolder({
                    files,
                    targetFolder,
                    selectionContext,
                    showNotifications: true
                });

                if (files.length > 1 && result.movedCount > 0) {
                    showNotice(
                        strings.fileSystem.notifications.movedMultipleFiles
                            .replace('{count}', result.movedCount.toString())
                            .replace('{folder}', targetFolder.name),
                        { variant: 'success' }
                    );
                }
            },
            placeholderText,
            strings.modals.folderSuggest.instructions.move,
            excludePaths
        );

        modal.open();
    }

    public async moveFolderWithModal(folder: TFolder): Promise<MoveFolderModalResult> {
        const folderDisplayName = this.resolveFolderDisplayLabel(folder);
        const excludePaths = new Set<string>();

        const collectPaths = (current: TFolder) => {
            excludePaths.add(current.path);
            current.children.forEach(child => {
                if (child instanceof TFolder) {
                    collectPaths(child);
                }
            });
        };

        collectPaths(folder);

        return new Promise(resolve => {
            let isResolved = false;

            const finish = (result: MoveFolderModalResult) => {
                if (!isResolved) {
                    isResolved = true;
                    resolve(result);
                }
            };

            const modal = new CancelAwareFolderSuggestModal(
                this.app,
                async targetFolder => {
                    if (targetFolder.path === folder.path || targetFolder.path.startsWith(`${folder.path}/`)) {
                        showNotice(strings.dragDrop.errors.cannotMoveIntoSelf, { variant: 'warning' });
                        return;
                    }

                    const newPath = buildPathInFolder(targetFolder.path, folder.name);
                    if (newPath === folder.path) {
                        modal.close();
                        finish({ status: 'cancelled' });
                        return;
                    }

                    try {
                        const moveData = await this.moveFolderToTarget(folder, targetFolder);
                        showNotice(strings.fileSystem.notifications.folderMoved.replace('{name}', folderDisplayName), {
                            variant: 'success'
                        });
                        modal.close();
                        finish({ status: 'success', data: moveData });
                    } catch (error) {
                        if (error instanceof FolderMoveError) {
                            if (error.code === 'destination-exists') {
                                showNotice(strings.fileSystem.errors.folderAlreadyExists.replace('{name}', folderDisplayName), {
                                    variant: 'warning'
                                });
                                return;
                            }

                            if (error.code === 'invalid-target') {
                                showNotice(strings.dragDrop.errors.cannotMoveIntoSelf, { variant: 'warning' });
                                return;
                            }
                        }

                        console.error('Failed to move folder via modal:', error);
                        showNotice(strings.dragDrop.errors.failedToMoveFolder.replace('{name}', folderDisplayName), { variant: 'warning' });
                        modal.close();
                        finish({ status: 'error', error });
                    }
                },
                this.getMovePlaceholder(folderDisplayName, true),
                strings.modals.folderSuggest.instructions.move,
                excludePaths,
                () => finish({ status: 'cancelled' })
            );

            modal.open();
        });
    }

    public async moveFolderToTarget(folder: TFolder, targetFolder: TFolder): Promise<MoveFolderResult> {
        if (targetFolder.path === folder.path || targetFolder.path.startsWith(`${folder.path}/`)) {
            throw new FolderMoveError('invalid-target');
        }

        const newPath = buildPathInFolder(targetFolder.path, folder.name);
        if (newPath === folder.path) {
            throw new FolderMoveError('invalid-target');
        }

        const existingEntry = this.app.vault.getAbstractFileByPath(newPath);
        if (existingEntry) {
            throw new FolderMoveError('destination-exists');
        }

        const oldPath = folder.path;
        await this.app.fileManager.renameFile(folder, newPath);

        const movedEntry = this.app.vault.getAbstractFileByPath(newPath);
        if (!(movedEntry instanceof TFolder)) {
            throw new FolderMoveError('verification-failed');
        }

        await this.folderPathSettingsSync.syncHiddenFolderPathChange(oldPath, newPath);
        return { oldPath, newPath, targetFolder };
    }

    private resolveMoveFileConflictsSetting(): MoveFileConflictsSetting {
        return resolveMoveFileConflictsSetting(this.settingsProvider.settings.moveFileConflicts, 'ask');
    }

    private getMovePlaceholder(targetName: string, shouldQuote: boolean): string {
        const label = shouldQuote ? `'${targetName}'` : targetName;
        return strings.modals.folderSuggest.placeholder(label);
    }

    private getMoveTargetLabelForFiles(files: TFile[]): string {
        if (files.length === 1) {
            return files[0].name;
        }

        return strings.modals.folderSuggest.multipleFilesLabel(files.length);
    }
}
