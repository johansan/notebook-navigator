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

import { App, TFile, TFolder, type WorkspaceLeaf } from 'obsidian';
import { strings } from '../i18n';
import type { CommandQueueService } from '../services/CommandQueueService';
import type { FileSystemOperations } from '../services/FileSystemService';
import { getErrorMessage } from './errorUtils';
import { getMarkdownFilesInOrder, mergeNotes } from './noteMerge';
import { showNotice } from './noticeUtils';

interface OpenMergeNotesModalParams {
    app: App;
    commandQueue: CommandQueueService | null;
    fileSystemOps: FileSystemOperations;
    files: readonly TFile[];
    outputFolder: TFolder;
    defaultOutputName: string;
}

function haveDifferentParentFolders(files: readonly TFile[]): boolean {
    const parentPaths = new Set<string>();
    files.forEach(file => {
        parentPaths.add(file.parent instanceof TFolder ? file.parent.path : '/');
    });
    return parentPaths.size > 1;
}

async function openMergedNote(app: App, commandQueue: CommandQueueService | null, file: TFile): Promise<void> {
    const getLeaf = () => app.workspace.getLeaf(false);

    const openFile = async (leaf: WorkspaceLeaf | null) => {
        if (!leaf) {
            throw new Error('Unable to open merged note: leaf not available');
        }

        await leaf.openFile(file, { active: true });
    };

    if (commandQueue) {
        const result = await commandQueue.executeOpenActiveFile(file, openFile, { active: true, getLeaf });
        if (!result.success) {
            throw result.error ?? new Error('Failed to open merged note.');
        }
        if (result.data?.skipped === true) {
            throw new Error(strings.fileSystem.errors.mergeNotesOpenSkipped);
        }
        return;
    }

    await openFile(getLeaf());
}

export async function openMergeNotesModal({
    app,
    commandQueue,
    fileSystemOps,
    files,
    outputFolder,
    defaultOutputName
}: OpenMergeNotesModalParams): Promise<void> {
    const markdownFiles = getMarkdownFilesInOrder(files);
    if (markdownFiles.length < 2) {
        return;
    }

    const { MergeNotesModal } = await import('../modals/MergeNotesModal');
    const modal = new MergeNotesModal(app, {
        defaultOutputName,
        destinationFolder: outputFolder,
        noteCount: markdownFiles.length,
        showCrossFolderLinkWarning: haveDifferentParentFolders(markdownFiles),
        onSubmit: async value => {
            try {
                const result = await mergeNotes({
                    app,
                    files: markdownFiles,
                    outputFolder,
                    outputName: value.outputName,
                    separator: value.separator,
                    moveSourcesToTrash: value.moveSourcesToTrash,
                    openOutputFile: file => openMergedNote(app, commandQueue, file),
                    trashSourceFiles: async sourceFiles => {
                        const trashResult = await fileSystemOps.trashFilesWithOpenLeafCleanup(sourceFiles);
                        return trashResult.failedCount;
                    }
                });
                if (result.outputOpenError !== null) {
                    showNotice(
                        strings.fileSystem.errors.mergeNotesOpenOutput
                            .replace('{name}', result.file.name)
                            .replace('{error}', getErrorMessage(result.outputOpenError, strings.common.unknownError)),
                        { variant: 'warning' }
                    );
                    return true;
                }

                showNotice(
                    strings.fileSystem.notices.mergeNotes
                        .replace('{count}', result.sourceCount.toString())
                        .replace('{name}', result.file.name),
                    { variant: 'success' }
                );
                if (result.failedSourceTrashCount > 0) {
                    showNotice(
                        strings.fileSystem.errors.mergeNotesTrashSources.replace('{count}', result.failedSourceTrashCount.toString()),
                        { variant: 'warning' }
                    );
                }
                return true;
            } catch (error) {
                showNotice(strings.fileSystem.errors.mergeNotes.replace('{error}', getErrorMessage(error, strings.common.unknownError)), {
                    variant: 'warning'
                });
                return false;
            }
        }
    });
    modal.open();
}
