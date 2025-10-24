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

import { App, Notice, TFile, TFolder, normalizePath } from 'obsidian';
import { strings } from '../i18n';
import { FolderNoteType, FOLDER_NOTE_TYPE_EXTENSIONS } from '../types/folderNote';
import { createDatabaseContent } from './fileCreationUtils';
import { CommandQueueService } from '../services/CommandQueueService';

/**
 * Settings required for detecting folder notes
 */
export interface FolderNoteDetectionSettings {
    enableFolderNotes: boolean;
    folderNoteName: string;
}

/**
 * Settings required for creating folder notes
 * Note: folderNoteType excludes 'ask' because by the time this function is called,
 * the user has already selected a specific type (via modal or settings)
 */
export interface FolderNoteCreationSettings {
    folderNoteType: Exclude<FolderNoteType, 'ask'>;
    folderNoteName: string;
    folderNoteProperties: string[];
}

/** Set of file extensions that are valid for folder notes */
const SUPPORTED_FOLDER_NOTE_EXTENSIONS = new Set<string>(Object.values(FOLDER_NOTE_TYPE_EXTENSIONS));

/**
 * Checks if a file extension is supported for folder notes
 * @param extension - The file extension to check
 * @returns True if the extension is supported
 */
export function isSupportedFolderNoteExtension(extension: string): boolean {
    return SUPPORTED_FOLDER_NOTE_EXTENSIONS.has(extension);
}

/**
 * Gets the folder note for a folder if it exists
 * @param folder - The folder to check for a folder note
 * @param settings - Settings for folder note detection
 * @returns The folder note file or null if not found
 */
export function getFolderNote(folder: TFolder, settings: FolderNoteDetectionSettings): TFile | null {
    if (!settings.enableFolderNotes) {
        return null;
    }

    for (const child of folder.children) {
        if (!(child instanceof TFile)) {
            continue;
        }

        if (child.parent?.path !== folder.path) {
            continue;
        }

        if (!SUPPORTED_FOLDER_NOTE_EXTENSIONS.has(child.extension)) {
            continue;
        }

        const expectedName = settings.folderNoteName || folder.name;
        if (child.basename === expectedName) {
            return child;
        }
    }

    return null;
}

/**
 * Checks if a file is a folder note for a given folder
 * @param file - The file to check
 * @param folder - The folder to check against
 * @param settings - Settings for folder note detection
 * @returns True if the file is a folder note for the given folder
 */
export function isFolderNote(file: TFile, folder: TFolder, settings: FolderNoteDetectionSettings): boolean {
    if (!settings.enableFolderNotes) {
        return false;
    }

    if (!SUPPORTED_FOLDER_NOTE_EXTENSIONS.has(file.extension)) {
        return false;
    }

    if (file.parent?.path !== folder.path) {
        return false;
    }

    const expectedName = settings.folderNoteName || folder.name;
    return file.basename === expectedName;
}

/**
 * Creates a new folder note for a folder
 * @param app - The Obsidian app instance
 * @param folder - The folder to create a folder note for
 * @param settings - Settings for folder note creation
 * @param commandQueue - Optional command queue service for opening the note
 * @returns The created folder note file, or null if creation failed
 */
export async function createFolderNote(
    app: App,
    folder: TFolder,
    settings: FolderNoteCreationSettings,
    commandQueue?: CommandQueueService | null
): Promise<TFile | null> {
    const extension = FOLDER_NOTE_TYPE_EXTENSIONS[settings.folderNoteType];
    const baseName = settings.folderNoteName || folder.name;
    const noteFileName = `${baseName}.${extension}`;
    const notePath = normalizePath(`${folder.path}/${noteFileName}`);

    const existingNote = getFolderNote(folder, {
        enableFolderNotes: true,
        folderNoteName: settings.folderNoteName
    });

    if (existingNote) {
        new Notice(strings.fileSystem.errors.folderNoteAlreadyExists);
        return null;
    }

    const conflictingItem = app.vault.getAbstractFileByPath(notePath);
    if (conflictingItem) {
        new Notice(strings.fileSystem.errors.folderNoteAlreadyExists);
        return null;
    }

    // Generate content based on folder note type
    let content = '';

    if (settings.folderNoteType === 'markdown') {
        if (settings.folderNoteProperties.length > 0) {
            const properties = settings.folderNoteProperties.map(prop => `${prop}: true`).join('\n');
            content = `---\n${properties}\n---\n`;
        }
    } else if (settings.folderNoteType === 'canvas') {
        content = '{}';
    } else if (settings.folderNoteType === 'base') {
        content = createDatabaseContent();
    }

    try {
        const file = await app.vault.create(notePath, content);
        if (commandQueue) {
            await commandQueue.executeOpenFolderNote(folder.path, async () => {
                await app.workspace.getLeaf().openFile(file);
            });
        } else {
            await app.workspace.getLeaf().openFile(file);
        }
        return file;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        new Notice(strings.fileSystem.errors.createFile.replace('{error}', message));
    }
    return null;
}
