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

import { App, FileView, TFile, TFolder, ViewState, WorkspaceLeaf } from 'obsidian';

import type { SelectionDispatch } from '../../context/SelectionContext';
import type { ISettingsProvider } from '../../interfaces/ISettingsProvider';
import { strings } from '../../i18n';
import { ConfirmModal } from '../../modals/ConfirmModal';
import { getSupportedLeaves, type VisibilityPreferences } from '../../types';
import { TIMEOUTS } from '../../types/obsidian-extended';
import { getErrorMessage } from '../../utils/errorUtils';
import { getDrawingCompanionImagePaths, getDrawingFeatureImageSource } from '../../utils/drawingFeatureImages';
import { getFolderNoteDetectionSettings, isFolderNote } from '../../utils/folderNoteLookup';
import { isPrimaryDocumentFile } from '../../utils/fileTypeUtils';
import { showNotice } from '../../utils/noticeUtils';
import { findNextFileAfterRemoval, getFilesForNavigationSelection, updateSelectionAfterFileOperation } from '../../utils/selectionUtils';
import type { PropertyTreeService } from '../PropertyTreeService';
import { TagTreeService } from '../TagTreeService';
import type { CommandQueueService } from '../CommandQueueService';
import type { DeleteAttachmentsSetting } from '../../settings/types';
import { resolveDeleteAttachmentsSetting } from '../../settings/types';
import { FolderPathSettingsSync } from './FolderPathSettingsSync';
import type { SelectionContext } from './types';

interface FileDeletionServiceOptions {
    app: App;
    settingsProvider: ISettingsProvider;
    getTagTreeService: () => TagTreeService | null;
    getPropertyTreeService: () => PropertyTreeService | null;
    getCommandQueue: () => CommandQueueService | null;
    getVisibilityPreferences: () => VisibilityPreferences;
    resolveFolderDisplayLabel: (folder: TFolder) => string;
    notifyError: (template: string, error: unknown, fallback?: string) => void;
    folderPathSettingsSync: FolderPathSettingsSync;
}

export interface FileTrashResult {
    trashedCount: number;
    failedCount: number;
    trashedSourcePaths: string[];
    errors: { file: TFile; error: unknown }[];
}

export class FileDeletionService {
    private readonly app: App;
    private readonly settingsProvider: ISettingsProvider;
    private readonly getTagTreeService: () => TagTreeService | null;
    private readonly getPropertyTreeService: () => PropertyTreeService | null;
    private readonly getCommandQueue: () => CommandQueueService | null;
    private readonly getVisibilityPreferences: () => VisibilityPreferences;
    private readonly resolveFolderDisplayLabel: (folder: TFolder) => string;
    private readonly notifyError: (template: string, error: unknown, fallback?: string) => void;
    private readonly folderPathSettingsSync: FolderPathSettingsSync;

    constructor(options: FileDeletionServiceOptions) {
        this.app = options.app;
        this.settingsProvider = options.settingsProvider;
        this.getTagTreeService = options.getTagTreeService;
        this.getPropertyTreeService = options.getPropertyTreeService;
        this.getCommandQueue = options.getCommandQueue;
        this.getVisibilityPreferences = options.getVisibilityPreferences;
        this.resolveFolderDisplayLabel = options.resolveFolderDisplayLabel;
        this.notifyError = options.notifyError;
        this.folderPathSettingsSync = options.folderPathSettingsSync;
    }

    public async deleteFolder(folder: TFolder, confirmBeforeDelete: boolean, onSuccess?: () => void): Promise<void> {
        const folderDisplayName = this.resolveFolderDisplayLabel(folder);
        const deleteFolderWithCleanup = async () => {
            const deletedPath = folder.path;
            await this.app.fileManager.trashFile(folder);
            await this.folderPathSettingsSync.removeHiddenFolderPathMatch(deletedPath);
            onSuccess?.();
        };

        if (confirmBeforeDelete) {
            const confirmModal = new ConfirmModal(
                this.app,
                strings.modals.fileSystem.deleteFolderTitle.replace('{name}', folderDisplayName),
                strings.modals.fileSystem.deleteFolderConfirm,
                async () => {
                    try {
                        await deleteFolderWithCleanup();
                    } catch (error) {
                        this.notifyError(strings.fileSystem.errors.deleteFolder, error);
                    }
                }
            );
            confirmModal.open();
            return;
        }

        try {
            await deleteFolderWithCleanup();
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.deleteFolder, error);
        }
    }

    public async deleteFile(
        file: TFile,
        confirmBeforeDelete: boolean,
        onSuccess?: () => void,
        preDeleteAction?: () => Promise<void>
    ): Promise<void> {
        const deleteTitle = this.getDeleteFileTitle(file);
        const performDeleteCore = async () => {
            const attachmentDeletion = this.prepareAttachmentDeletionState([file]);
            try {
                if (preDeleteAction) {
                    await preDeleteAction();
                }

                await this.clearOpenLeavesForFileDelete(file);
                await this.app.fileManager.trashFile(file);
                onSuccess?.();
            } catch (error) {
                this.notifyError(strings.fileSystem.errors.deleteFile, error);
                return;
            }

            await this.maybeDeleteAttachmentsAfterFileDelete(
                attachmentDeletion.candidatesBySourcePath,
                new Set([file.path]),
                attachmentDeletion.setting
            );
        };

        if (confirmBeforeDelete) {
            const confirmModal = new ConfirmModal(
                this.app,
                strings.modals.fileSystem.deleteFileTitle.replace('{name}', deleteTitle),
                strings.modals.fileSystem.deleteFileConfirm,
                async () => {
                    const commandQueue = this.getCommandQueue();
                    if (commandQueue) {
                        await commandQueue.executeDeleteFiles([file], performDeleteCore);
                    } else {
                        await performDeleteCore();
                    }
                }
            );
            confirmModal.open();
            return;
        }

        const commandQueue = this.getCommandQueue();
        if (commandQueue) {
            await commandQueue.executeDeleteFiles([file], performDeleteCore);
        } else {
            await performDeleteCore();
        }
    }

    public async deleteSelectedFile(
        file: TFile,
        settings: ISettingsProvider['settings'],
        selectionContext: SelectionContext,
        selectionDispatch: SelectionDispatch,
        confirmBeforeDelete: boolean,
        currentFilesOverride?: readonly TFile[]
    ): Promise<void> {
        const currentFiles =
            currentFilesOverride?.some(currentFile => currentFile.path === file.path) === true
                ? currentFilesOverride
                : getFilesForNavigationSelection(
                      {
                          selectionType: selectionContext.selectionType,
                          selectedFolder: selectionContext.selectedFolder ?? null,
                          selectedTag: selectionContext.selectedTag ?? null,
                          selectedProperty: selectionContext.selectedProperty ?? null
                      },
                      settings,
                      this.getVisibilityPreferences(),
                      this.app,
                      this.getTagTreeService(),
                      this.getPropertyTreeService()
                  );

        let nextFileToSelect: TFile | null = null;
        const currentIndex = currentFiles.findIndex(currentFile => currentFile.path === file.path);
        if (currentIndex !== -1 && currentFiles.length > 1) {
            if (currentIndex < currentFiles.length - 1) {
                nextFileToSelect = currentFiles[currentIndex + 1];
            } else if (currentIndex > 0) {
                nextFileToSelect = currentFiles[currentIndex - 1];
            }
        }

        await this.deleteFile(file, confirmBeforeDelete, undefined, async () => {
            if (nextFileToSelect) {
                const stillExists = this.app.vault.getFileByPath(nextFileToSelect.path);
                if (stillExists) {
                    await updateSelectionAfterFileOperation(stillExists, selectionDispatch, this.app, { openInEditor: false });
                    await this.replaceOpenLeavesForFileDelete(file, stillExists);
                } else {
                    await updateSelectionAfterFileOperation(null, selectionDispatch, this.app);
                }
            } else {
                selectionDispatch({ type: 'SET_SELECTED_FILE', file: null });
            }

            window.setTimeout(() => {
                const fileListEl = activeDocument.querySelector('.nn-list-pane-scroller');
                if (fileListEl instanceof HTMLElement) {
                    fileListEl.focus();
                }
            }, TIMEOUTS.FILE_OPERATION_DELAY);
        });
    }

    public async deleteMultipleFiles(
        files: TFile[],
        confirmBeforeDelete = true,
        preDeleteAction?: () => void | Promise<void>
    ): Promise<void> {
        if (files.length === 0) {
            return;
        }

        const performDeleteCore = async () => {
            const attachmentDeletion = this.prepareAttachmentDeletionState(files);

            if (preDeleteAction) {
                try {
                    await preDeleteAction();
                } catch (error) {
                    console.error('Pre-delete action failed:', error);
                }
            }

            const trashResult = await this.trashFilesWithOpenLeafCleanupCore(files);
            const deletedSourcePaths = new Set(trashResult.trashedSourcePaths);
            const deletedCount = trashResult.trashedCount;
            const { errors } = trashResult;

            await this.maybeDeleteAttachmentsAfterFileDelete(
                attachmentDeletion.candidatesBySourcePath,
                deletedSourcePaths,
                attachmentDeletion.setting
            );

            if (deletedCount > 0) {
                showNotice(strings.fileSystem.notifications.deletedMultipleFiles.replace('{count}', deletedCount.toString()), {
                    variant: 'success'
                });
            }

            if (errors.length > 0) {
                const errorMessage =
                    errors.length === 1
                        ? strings.fileSystem.errors.failedToDeleteFile
                              .replace('{name}', errors[0].file.name)
                              .replace('{error}', getErrorMessage(errors[0].error))
                        : strings.fileSystem.errors.failedToDeleteMultipleFiles.replace('{count}', errors.length.toString());
                showNotice(errorMessage, { variant: 'warning' });
            }
        };

        if (confirmBeforeDelete) {
            const modal = new ConfirmModal(
                this.app,
                strings.fileSystem.confirmations.deleteMultipleFiles.replace('{count}', files.length.toString()),
                strings.fileSystem.confirmations.deleteConfirmation,
                async () => {
                    const commandQueue = this.getCommandQueue();
                    if (commandQueue) {
                        await commandQueue.executeDeleteFiles(files, performDeleteCore);
                    } else {
                        await performDeleteCore();
                    }
                }
            );
            modal.open();
            return;
        }

        const commandQueue = this.getCommandQueue();
        if (commandQueue) {
            await commandQueue.executeDeleteFiles(files, performDeleteCore);
        } else {
            await performDeleteCore();
        }
    }

    public async trashFilesWithOpenLeafCleanup(files: readonly TFile[]): Promise<FileTrashResult> {
        const filesToTrash = [...files];
        if (filesToTrash.length === 0) {
            return {
                trashedCount: 0,
                failedCount: 0,
                trashedSourcePaths: [],
                errors: []
            };
        }

        const commandQueue = this.getCommandQueue();
        if (!commandQueue) {
            return this.trashFilesWithOpenLeafCleanupCore(filesToTrash);
        }

        let trashResult: FileTrashResult = {
            trashedCount: 0,
            failedCount: 0,
            trashedSourcePaths: [],
            errors: []
        };
        let hasTrashResult = false;
        const commandResult = await commandQueue.executeDeleteFiles(filesToTrash, async () => {
            trashResult = await this.trashFilesWithOpenLeafCleanupCore(filesToTrash);
            hasTrashResult = true;
        });

        if (commandResult.success && hasTrashResult) {
            return trashResult;
        }

        const error = commandResult.error ?? new Error('Failed to move files to trash.');
        console.error('Error moving files to trash:', error);
        const trashedSourcePathSet = new Set(trashResult.trashedSourcePaths);
        return {
            trashedCount: trashResult.trashedCount,
            failedCount: filesToTrash.length - trashResult.trashedCount,
            trashedSourcePaths: trashResult.trashedSourcePaths,
            errors: filesToTrash.filter(file => !trashedSourcePathSet.has(file.path)).map(file => ({ file, error }))
        };
    }

    public async deleteFilesWithSmartSelection(
        selectedFiles: Set<string>,
        allFiles: readonly TFile[],
        selectionDispatch: SelectionDispatch,
        confirmBeforeDelete: boolean
    ): Promise<void> {
        const filesToDelete = Array.from(selectedFiles)
            .map(path => this.app.vault.getFileByPath(path))
            .filter((file): file is TFile => file !== null);

        if (filesToDelete.length === 0) {
            return;
        }

        const nextFileToSelect = findNextFileAfterRemoval(allFiles, selectedFiles);

        await this.deleteMultipleFiles(filesToDelete, confirmBeforeDelete, async () => {
            if (nextFileToSelect) {
                const stillExists = this.app.vault.getFileByPath(nextFileToSelect.path);
                if (stillExists) {
                    await updateSelectionAfterFileOperation(stillExists, selectionDispatch, this.app, { openInEditor: false });
                    await this.replaceOpenLeavesForFilesDelete(filesToDelete, stillExists);
                } else {
                    await updateSelectionAfterFileOperation(null, selectionDispatch, this.app);
                }
            } else {
                selectionDispatch({ type: 'CLEAR_FILE_SELECTION' });
            }

            window.setTimeout(() => {
                const fileListEl = activeDocument.querySelector('.nn-list-pane-scroller');
                if (fileListEl instanceof HTMLElement) {
                    fileListEl.focus();
                }
            }, TIMEOUTS.FILE_OPERATION_DELAY);
        });
    }

    private hasOpenLeafForFiles(files: readonly TFile[]): boolean {
        const targetPathSet = new Set(files.map(file => file.path));

        try {
            return getSupportedLeaves(this.app).some(leaf => {
                const { view } = leaf;
                if (!(view instanceof FileView)) {
                    return false;
                }

                const currentFile = view.file;
                if (!currentFile) {
                    return false;
                }

                return targetPathSet.has(currentFile.path);
            });
        } catch {
            return false;
        }
    }

    private async trashFilesWithOpenLeafCleanupCore(files: readonly TFile[]): Promise<FileTrashResult> {
        const sourcePaths = files.map(file => file.path);
        const errors: { file: TFile; error: unknown }[] = [];
        const trashedSourcePaths: string[] = [];

        if (this.hasOpenLeafForFiles(files)) {
            for (let index = 0; index < files.length; index += 1) {
                const file = files[index];
                const sourcePath = sourcePaths[index] ?? file.path;

                try {
                    await this.clearOpenLeavesForFileDelete(file);
                    await this.app.fileManager.trashFile(file);
                    trashedSourcePaths.push(sourcePath);

                    if (index < files.length - 1) {
                        await new Promise<void>(resolve => window.setTimeout(resolve, 0));
                    }
                } catch (error) {
                    errors.push({ file, error });
                    console.error('Error deleting file:', sourcePath, error);
                }
            }
        } else {
            const results = await Promise.allSettled(files.map(file => this.app.fileManager.trashFile(file)));

            results.forEach((result, index) => {
                const file = files[index];
                const sourcePath = sourcePaths[index] ?? file.path;

                if (result.status === 'fulfilled') {
                    trashedSourcePaths.push(sourcePath);
                    return;
                }

                errors.push({ file, error: result.reason });
                console.error('Error deleting file:', sourcePath, result.reason);
            });
        }

        return {
            trashedCount: trashedSourcePaths.length,
            failedCount: errors.length,
            trashedSourcePaths,
            errors
        };
    }

    private isAttachmentFile(file: TFile): boolean {
        return !isPrimaryDocumentFile(file);
    }

    private normalizeAttachmentLinkTarget(rawLink: string): string | null {
        const trimmed = rawLink.trim();
        if (!trimmed) {
            return null;
        }

        const withoutAlias = trimmed.split('|')[0]?.trim() ?? '';
        if (!withoutAlias) {
            return null;
        }

        const withoutSubpath = withoutAlias.split(/[#^]/, 1)[0]?.trim() ?? '';
        if (!withoutSubpath) {
            return null;
        }

        const lower = withoutSubpath.toLowerCase();
        if (lower.includes('://') || lower.startsWith('mailto:')) {
            return null;
        }

        return withoutSubpath;
    }

    private getLinkedAttachmentCandidates(sourceFile: TFile): TFile[] {
        const cache = this.app.metadataCache.getFileCache(sourceFile);
        if (!cache) {
            return [];
        }

        const resolved = new Map<string, TFile>();
        const references = [...(cache.links ?? []), ...(cache.embeds ?? []), ...(cache.frontmatterLinks ?? [])];

        for (const reference of references) {
            const target = this.normalizeAttachmentLinkTarget(reference.link);
            if (!target) {
                continue;
            }

            const destination = this.app.metadataCache.getFirstLinkpathDest(target, sourceFile.path);
            if (!(destination instanceof TFile) || !this.isAttachmentFile(destination)) {
                continue;
            }

            resolved.set(destination.path, destination);
        }

        return Array.from(resolved.values()).sort((left, right) => left.path.localeCompare(right.path));
    }

    private getDrawingCompanionAttachmentCandidates(sourceFile: TFile): TFile[] {
        const source = getDrawingFeatureImageSource(this.app, sourceFile);
        if (!source?.supportsCompanionImages) {
            return [];
        }

        const resolved = new Map<string, TFile>();
        for (const path of getDrawingCompanionImagePaths(sourceFile, source.providerId)) {
            const file = this.app.vault.getFileByPath(path);
            if (!file || !this.isAttachmentFile(file)) {
                continue;
            }

            resolved.set(file.path, file);
        }

        return Array.from(resolved.values()).sort((left, right) => left.path.localeCompare(right.path));
    }

    private getAttachmentCandidates(sourceFile: TFile): TFile[] {
        const resolved = new Map<string, TFile>();
        for (const file of [
            ...this.getLinkedAttachmentCandidates(sourceFile),
            ...this.getDrawingCompanionAttachmentCandidates(sourceFile)
        ]) {
            resolved.set(file.path, file);
        }

        return Array.from(resolved.values()).sort((left, right) => left.path.localeCompare(right.path));
    }

    private getOrphanAttachments(attachmentCandidates: readonly TFile[], deletedSourcePaths: Set<string>): TFile[] {
        if (attachmentCandidates.length === 0) {
            return [];
        }

        const candidatesByPath = new Map<string, TFile>();
        attachmentCandidates.forEach(file => {
            candidatesByPath.set(file.path, file);
        });

        const candidatePaths = new Set<string>(candidatesByPath.keys());
        const usedElsewhere = new Set<string>();

        const { resolvedLinks } = this.app.metadataCache;
        for (const sourcePath of Object.keys(resolvedLinks)) {
            if (deletedSourcePaths.has(sourcePath)) {
                continue;
            }

            const destinations = resolvedLinks[sourcePath];
            for (const destinationPath of Object.keys(destinations)) {
                if (!candidatePaths.has(destinationPath)) {
                    continue;
                }

                usedElsewhere.add(destinationPath);
                if (usedElsewhere.size === candidatePaths.size) {
                    break;
                }
            }

            if (usedElsewhere.size === candidatePaths.size) {
                break;
            }
        }

        const orphaned = Array.from(candidatesByPath.values()).filter(file => !usedElsewhere.has(file.path));
        return orphaned.sort((left, right) => left.path.localeCompare(right.path));
    }

    private resolveAttachmentDeletionSetting(): DeleteAttachmentsSetting {
        return resolveDeleteAttachmentsSetting(this.settingsProvider.settings.deleteAttachments, 'ask');
    }

    private collectAttachmentCandidatesBySourcePath(
        sourceFiles: readonly TFile[],
        setting: DeleteAttachmentsSetting
    ): Map<string, TFile[]> {
        const candidatesBySourcePath = new Map<string, TFile[]>();
        if (setting === 'never') {
            return candidatesBySourcePath;
        }

        sourceFiles.forEach(file => {
            candidatesBySourcePath.set(file.path, this.getAttachmentCandidates(file));
        });
        return candidatesBySourcePath;
    }

    private prepareAttachmentDeletionState(sourceFiles: readonly TFile[]): {
        setting: DeleteAttachmentsSetting;
        candidatesBySourcePath: Map<string, TFile[]>;
    } {
        const setting = this.resolveAttachmentDeletionSetting();
        return {
            setting,
            candidatesBySourcePath: this.collectAttachmentCandidatesBySourcePath(sourceFiles, setting)
        };
    }

    private getAttachmentCandidatesForDeletedSources(
        candidatesBySourcePath: ReadonlyMap<string, readonly TFile[]>,
        deletedSourcePaths: Set<string>
    ): TFile[] {
        if (candidatesBySourcePath.size === 0 || deletedSourcePaths.size === 0) {
            return [];
        }

        const dedupedCandidatesByPath = new Map<string, TFile>();
        deletedSourcePaths.forEach(path => {
            const candidates = candidatesBySourcePath.get(path);
            if (!candidates || candidates.length === 0) {
                return;
            }

            candidates.forEach(candidate => {
                if (!deletedSourcePaths.has(candidate.path)) {
                    dedupedCandidatesByPath.set(candidate.path, candidate);
                }
            });
        });

        return Array.from(dedupedCandidatesByPath.values());
    }

    private async maybeDeleteAttachmentsAfterFileDelete(
        candidatesBySourcePath: ReadonlyMap<string, readonly TFile[]>,
        deletedSourcePaths: Set<string>,
        setting: DeleteAttachmentsSetting
    ): Promise<void> {
        if (setting === 'never' || deletedSourcePaths.size === 0) {
            return;
        }

        const attachmentCandidates = this.getAttachmentCandidatesForDeletedSources(candidatesBySourcePath, deletedSourcePaths);
        if (attachmentCandidates.length === 0) {
            return;
        }

        try {
            await this.maybeDeleteOrphanedAttachments(attachmentCandidates, deletedSourcePaths, setting);
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.deleteAttachments, error);
        }
    }

    private async maybeDeleteOrphanedAttachments(
        attachmentCandidates: readonly TFile[],
        deletedSourcePaths: Set<string>,
        setting: DeleteAttachmentsSetting
    ): Promise<void> {
        if (setting === 'never') {
            return;
        }

        const orphaned = this.getOrphanAttachments(attachmentCandidates, deletedSourcePaths);
        if (orphaned.length === 0) {
            return;
        }

        let attachmentsToDelete: readonly TFile[] | null = orphaned;
        if (setting === 'ask') {
            const { promptDeleteFileAttachments } = await import('../../modals/DeleteFileAttachmentsModal');
            attachmentsToDelete = await promptDeleteFileAttachments(this.app, orphaned);
        }

        if (!attachmentsToDelete || attachmentsToDelete.length === 0) {
            return;
        }

        const results = await Promise.allSettled(attachmentsToDelete.map(file => this.app.fileManager.trashFile(file)));
        const failures: { file: TFile; error: unknown }[] = [];
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                failures.push({ file: attachmentsToDelete[index], error: result.reason });
                console.error('Error deleting attachment:', attachmentsToDelete[index].path, result.reason);
            }
        });

        if (failures.length === 0) {
            return;
        }

        const errorMessage =
            failures.length === 1
                ? strings.fileSystem.errors.failedToDeleteFile
                      .replace('{name}', failures[0].file.name)
                      .replace('{error}', getErrorMessage(failures[0].error))
                : strings.fileSystem.errors.failedToDeleteMultipleFiles.replace('{count}', failures.length.toString());
        showNotice(errorMessage, { variant: 'warning' });
    }

    private getDeleteFileTitle(file: TFile): string {
        const settings = this.settingsProvider.settings;
        const parent = file.parent;
        if (!(parent instanceof TFolder)) {
            return file.basename;
        }

        const detectionSettings = getFolderNoteDetectionSettings(settings);
        if (!isFolderNote(file, parent, detectionSettings)) {
            return file.basename;
        }

        return file.path;
    }

    private getLeavesDisplayingFile(file: TFile): WorkspaceLeaf[] {
        try {
            const matches: WorkspaceLeaf[] = [];
            const supportedLeaves = getSupportedLeaves(this.app);
            for (const leaf of supportedLeaves) {
                const view = leaf.view;
                if (!(view instanceof FileView) || view.file?.path !== file.path) {
                    continue;
                }

                matches.push(leaf);
            }

            return matches;
        } catch {
            return [];
        }
    }

    private getActiveFileViewLeaf(): WorkspaceLeaf | null {
        try {
            const view = this.app.workspace.getActiveViewOfType(FileView);
            return view?.leaf ?? null;
        } catch {
            return null;
        }
    }

    private async clearOpenLeavesForFileDelete(file: TFile): Promise<void> {
        const leavesDisplayingDeletedFile = this.getLeavesDisplayingFile(file);
        if (leavesDisplayingDeletedFile.length === 0) {
            return;
        }

        const activeLeaf = this.getActiveFileViewLeaf();
        const emptyViewState: ViewState = { type: 'empty', state: {} };
        for (const leaf of leavesDisplayingDeletedFile) {
            try {
                await leaf.setViewState(emptyViewState);
            } catch {
                // Ignore failures when clearing leaf state. The file delete still runs.
            }

            if (activeLeaf && leaf === activeLeaf) {
                continue;
            }

            try {
                leaf.detach();
            } catch {
                // Ignore failures when detaching leaves. The file delete still runs.
            }
        }
    }

    private async replaceOpenLeavesForFileDelete(fileToReplace: TFile, replacement: TFile): Promise<void> {
        const leaves = this.getLeavesDisplayingFile(fileToReplace);
        if (leaves.length === 0) {
            const fallbackLeaf = this.app.workspace.getLeaf(false);
            if (!fallbackLeaf) {
                return;
            }

            try {
                await fallbackLeaf.openFile(replacement, { active: true });
            } catch {
                // Ignore failures when opening a replacement file. The delete still runs.
            }
            return;
        }

        const activeLeaf = this.getActiveFileViewLeaf();
        const replacementLeaf = activeLeaf && leaves.includes(activeLeaf) ? activeLeaf : (leaves[0] ?? null);
        if (replacementLeaf) {
            try {
                // Keep the replacement note as the workspace active file so calendar follow mode updates after delete.
                await replacementLeaf.openFile(replacement, { active: true });
            } catch {
                // Ignore failures when opening a replacement file. The delete still runs.
            }

            const emptyViewState: ViewState = { type: 'empty', state: {} };
            for (const leaf of leaves) {
                if (leaf === replacementLeaf) {
                    continue;
                }

                try {
                    await leaf.setViewState(emptyViewState);
                } catch {
                    // Ignore failures when clearing leaf state. The delete still runs.
                }

                try {
                    leaf.detach();
                } catch {
                    // Ignore failures when detaching leaves. The delete still runs.
                }
            }

            return;
        }
    }

    private async replaceOpenLeavesForFilesDelete(filesToReplace: readonly TFile[], replacement: TFile): Promise<void> {
        const uniqueLeaves = new Set<WorkspaceLeaf>();
        for (const fileToReplace of filesToReplace) {
            this.getLeavesDisplayingFile(fileToReplace).forEach(leaf => {
                uniqueLeaves.add(leaf);
            });
        }

        if (uniqueLeaves.size === 0) {
            const fallbackLeaf = this.app.workspace.getLeaf(false);
            if (!fallbackLeaf) {
                return;
            }

            try {
                await fallbackLeaf.openFile(replacement, { active: true });
            } catch {
                // Ignore failures when opening a replacement file. The delete still runs.
            }
            return;
        }

        const activeLeaf = this.getActiveFileViewLeaf();
        const replacementLeaf = activeLeaf && uniqueLeaves.has(activeLeaf) ? activeLeaf : (Array.from(uniqueLeaves)[0] ?? null);
        if (replacementLeaf) {
            try {
                // Keep the replacement note as the workspace active file so calendar follow mode updates after delete.
                await replacementLeaf.openFile(replacement, { active: true });
            } catch {
                // Ignore failures when opening a replacement file. The delete still runs.
            }

            const emptyViewState: ViewState = { type: 'empty', state: {} };
            for (const leaf of uniqueLeaves) {
                if (leaf === replacementLeaf) {
                    continue;
                }

                try {
                    await leaf.setViewState(emptyViewState);
                } catch {
                    // Ignore failures when clearing leaf state. The delete still runs.
                }

                try {
                    leaf.detach();
                } catch {
                    // Ignore failures when detaching leaves. The delete still runs.
                }
            }

            return;
        }
    }
}
