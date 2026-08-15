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

import { App, type PaneType, TFile, TFolder } from 'obsidian';
import type { SelectionDispatch } from '../context/selection/types';
import { strings } from '../i18n';
import { FolderNoteType, FOLDER_NOTE_TYPE_EXTENSIONS, FolderNoteCreationPreference } from '../types/folderNote';
import { buildPathInFolder, createDatabaseContent, createMarkdownFileFromTemplatePreferTemplater } from './fileCreationUtils';
import type { FolderNoteNameSettings } from './folderNoteName';
import { CommandQueueService } from '../services/CommandQueueService';
import { promptForFolderNoteType } from '../modals/FolderNoteTypeModal';
import { showNotice } from './noticeUtils';
import { openFileInContext } from './openFileInContext';
import { normalizeOptionalVaultFilePath } from './pathUtils';
import {
    getFolderNote,
    getFolderNoteDetectionSettings,
    isSupportedFolderNoteExtension,
    resolveFolderNoteNameForFolder
} from './folderNoteLookup';

export {
    getFolderNote,
    getFolderNoteDetectionSettings,
    isFolderNote,
    isSupportedFolderNoteExtension,
    resolveFolderNoteNameForFolder,
    resolveRootFolderNoteSourceName
} from './folderNoteLookup';
export type { FolderNoteDetectionSettings } from './folderNoteLookup';

export type FolderNoteOpenContext = PaneType | 'right-sidebar' | null;

interface OpenFolderNoteFileParams {
    app: App;
    commandQueue: CommandQueueService | null;
    folder: TFolder;
    folderNote: TFile;
    context: FolderNoteOpenContext;
    active?: boolean;
    openInRightSidebar?: (folderNote: TFile) => Promise<void>;
}

/**
 * Settings required for creating folder notes
 */
export interface FolderNoteCreationSettings extends FolderNoteNameSettings {
    folderNoteType: FolderNoteCreationPreference;
    folderNoteTemplate: string | null;
}

interface CreateFolderNoteOptions {
    folderDisplayName?: string;
    openContext?: FolderNoteOpenContext;
    openInRightSidebar?: (folderNote: TFile) => Promise<void>;
}

function getPathExtension(path: string): string {
    const name = path.split('/').pop() ?? '';
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === name.length - 1) {
        return '';
    }

    return name.slice(lastDotIndex + 1);
}

export function isFolderNoteTemplateCompatible(
    templatePath: string | null | undefined,
    folderNoteType: FolderNoteCreationPreference
): boolean {
    const normalizedTemplatePath = normalizeOptionalVaultFilePath(templatePath);
    if (!normalizedTemplatePath) {
        return true;
    }

    const extension = getPathExtension(normalizedTemplatePath);
    if (!isSupportedFolderNoteExtension(extension)) {
        return false;
    }

    if (folderNoteType === 'ask') {
        return true;
    }

    return extension === FOLDER_NOTE_TYPE_EXTENSIONS[folderNoteType];
}

/**
 * Selects a folder note through the existing manual-reveal pipeline so collapsed groups,
 * delayed list rebuilds, and scrolling use the same path as other explicit file reveals.
 */
export function revealFolderNoteInNavigator(selectionDispatch: SelectionDispatch, folderNote: TFile): void {
    selectionDispatch({
        type: 'REVEAL_FILE',
        file: folderNote,
        isManualReveal: true
    });
}

function getFolderNoteTemplateFile(app: App, templatePath: string | null | undefined, folderNoteType: FolderNoteType): TFile | null {
    const normalizedTemplatePath = normalizeOptionalVaultFilePath(templatePath);
    if (!normalizedTemplatePath) {
        return null;
    }

    const expectedExtension = FOLDER_NOTE_TYPE_EXTENSIONS[folderNoteType];
    const entry = app.vault.getAbstractFileByPath(normalizedTemplatePath);
    if (!(entry instanceof TFile)) {
        console.warn('[folder note template] Template file not found', normalizedTemplatePath);
        return null;
    }

    if (entry.extension !== expectedExtension) {
        console.warn('[folder note template] Template file extension does not match folder note type', normalizedTemplatePath);
        return null;
    }

    return entry;
}

async function readFolderNoteTemplateContent(
    app: App,
    templatePath: string | null | undefined,
    folderNoteType: FolderNoteType
): Promise<string | null> {
    const templateFile = getFolderNoteTemplateFile(app, templatePath, folderNoteType);
    if (!templateFile) {
        return null;
    }

    try {
        return await app.vault.read(templateFile);
    } catch (error) {
        console.error('Failed to read folder note template', templateFile.path, error);
        return null;
    }
}

/**
 * Opens the folder note for a folder, optionally in a new workspace context.
 * Uses CommandQueueService when available to track folder note opens.
 */
export async function openFolderNoteFile({
    app,
    commandQueue,
    folder,
    folderNote,
    context,
    active = true,
    openInRightSidebar
}: OpenFolderNoteFileParams): Promise<void> {
    const openFile = async () => {
        if (context === 'right-sidebar') {
            if (openInRightSidebar) {
                await openInRightSidebar(folderNote);
                return;
            }

            const leaf = app.workspace.getRightLeaf(true) ?? app.workspace.getRightLeaf(false);
            if (!leaf) {
                return;
            }

            await leaf.openFile(folderNote, { active: false });
            await app.workspace.revealLeaf(leaf);
            return;
        }

        if (context) {
            await openFileInContext({ app, commandQueue, file: folderNote, context, active });
            return;
        }

        const leaf = app.workspace.getLeaf(false);
        if (!leaf) {
            return;
        }
        await leaf.openFile(folderNote, { active });
    };

    if (commandQueue) {
        await commandQueue.executeOpenFolderNote(folder.path, openFile);
        return;
    }

    await openFile();
}

/**
 * Creates a new folder note for a folder
 * @param app - The Obsidian app instance
 * @param folder - The folder to create a folder note for
 * @param settings - Settings for folder note creation
 * @param commandQueue - Optional command queue service for opening the note
 * @param options - Optional display metadata for folder note UI prompts
 * @returns The created folder note file, or null if creation failed
 */
export async function createFolderNote(
    app: App,
    folder: TFolder,
    settings: FolderNoteCreationSettings,
    commandQueue?: CommandQueueService | null,
    options?: CreateFolderNoteOptions
): Promise<TFile | null> {
    const existingNote = getFolderNote(
        folder,
        getFolderNoteDetectionSettings({
            enableFolderNotes: true,
            folderNoteNamePattern: settings.folderNoteNamePattern
        })
    );

    if (existingNote) {
        showNotice(strings.fileSystem.errors.folderNoteAlreadyExists, { variant: 'warning' });
        return null;
    }

    let selectedType: FolderNoteType | null;

    if (settings.folderNoteType === 'ask') {
        selectedType = await promptForFolderNoteType(app, folder, options?.folderDisplayName);
        if (!selectedType) {
            return null;
        }
    } else {
        selectedType = settings.folderNoteType;
    }

    const extension = FOLDER_NOTE_TYPE_EXTENSIONS[selectedType];
    const baseName = resolveFolderNoteNameForFolder(folder, settings);
    const noteFileName = `${baseName}.${extension}`;
    const notePath = buildPathInFolder(folder.path, noteFileName);

    const conflictingItem = app.vault.getAbstractFileByPath(notePath);
    if (conflictingItem) {
        showNotice(strings.fileSystem.errors.folderNoteAlreadyExists, { variant: 'warning' });
        return null;
    }

    try {
        let file: TFile;
        const templatePath = isFolderNoteTemplateCompatible(settings.folderNoteTemplate, selectedType) ? settings.folderNoteTemplate : null;
        if (selectedType === 'markdown') {
            file = await createMarkdownFileFromTemplatePreferTemplater({
                app,
                folder,
                baseName,
                templatePath,
                templateErrorContext: 'folder note'
            });
        } else if (selectedType === 'canvas') {
            const templateContent = await readFolderNoteTemplateContent(app, templatePath, selectedType);
            file = await app.vault.create(notePath, templateContent ?? '{}');
        } else {
            const templateContent = await readFolderNoteTemplateContent(app, templatePath, selectedType);
            file = await app.vault.create(notePath, templateContent ?? createDatabaseContent());
        }

        await openFolderNoteFile({
            app,
            commandQueue: commandQueue ?? null,
            folder,
            folderNote: file,
            context: options?.openContext ?? null,
            active: true,
            openInRightSidebar: options?.openInRightSidebar
        });
        return file;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        showNotice(strings.fileSystem.errors.createFile.replace('{error}', message), { variant: 'warning' });
    }
    return null;
}
