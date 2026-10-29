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

import { TFile, type TFolder, normalizePath } from 'obsidian';
import { FOLDER_NOTE_TYPE_EXTENSIONS, type FolderNoteCreationPreference, type FolderNoteType } from '../types/folderNote';
import { EXCALIDRAW_BASENAME_SUFFIX, isExcalidrawFile, stripExcalidrawSuffix } from './fileNameUtils';
import { type FolderNoteNameSettings, resolveFolderNoteName } from './folderNoteName';

// Lookup-only helpers used by startup services. Creation and opening behavior stays in folderNotes.ts.

/**
 * Settings required for detecting folder notes
 */
export interface FolderNoteDetectionSettings extends FolderNoteNameSettings {
    enableFolderNotes: boolean;
    /** Type that wins when a folder has same-named folder notes of several types. 'ask' keeps the default order. */
    folderNoteType: FolderNoteCreationPreference;
}

/**
 * Extracts folder note detection settings from a larger settings object.
 */
export function getFolderNoteDetectionSettings(settings: FolderNoteDetectionSettings): FolderNoteDetectionSettings {
    return {
        enableFolderNotes: settings.enableFolderNotes,
        folderNoteNamePattern: settings.folderNoteNamePattern,
        folderNoteType: settings.folderNoteType
    };
}

/** Set of file extensions that are valid for folder notes */
const SUPPORTED_FOLDER_NOTE_EXTENSIONS = new Set<string>(Object.values(FOLDER_NOTE_TYPE_EXTENSIONS));

/** Order in which same-named folder notes of different types win when no preferred type is set */
const DEFAULT_FOLDER_NOTE_TYPE_ORDER: readonly FolderNoteType[] = ['markdown', 'canvas', 'base'];

/**
 * Returns the extensions to try for a folder note, the preferred type first and then the default order.
 */
function getFolderNoteExtensionOrder(folderNoteType: FolderNoteCreationPreference): string[] {
    const order =
        folderNoteType === 'ask'
            ? DEFAULT_FOLDER_NOTE_TYPE_ORDER
            : [folderNoteType, ...DEFAULT_FOLDER_NOTE_TYPE_ORDER.filter(type => type !== folderNoteType)];
    return order.map(type => FOLDER_NOTE_TYPE_EXTENSIONS[type]);
}

interface RootFolderNoteVault {
    getName?: () => string;
}

export function resolveRootFolderNoteSourceName(folder: TFolder, vaultOverride?: RootFolderNoteVault): string {
    const vault = vaultOverride ?? (folder as TFolder & { vault?: RootFolderNoteVault }).vault;
    const vaultName = typeof vault?.getName === 'function' ? vault.getName() : '';
    if (typeof vaultName === 'string' && vaultName.trim().length > 0) {
        return vaultName;
    }

    const folderName = typeof folder.name === 'string' ? folder.name : '';
    if (folderName.trim().length > 0 && folderName !== '/') {
        return folderName;
    }

    return 'Vault';
}

export function resolveFolderNoteNameForFolder(folder: TFolder, settings: FolderNoteNameSettings): string {
    return resolveFolderNoteName(folder.path === '/' ? resolveRootFolderNoteSourceName(folder) : folder.name, settings);
}

/**
 * Checks if a file extension is supported for folder notes
 * @param extension - The file extension to check
 * @returns True if the extension is supported
 */
export function isSupportedFolderNoteExtension(extension: string): boolean {
    return SUPPORTED_FOLDER_NOTE_EXTENSIONS.has(extension);
}

/**
 * Gets the folder note for a folder if it exists.
 * When the folder has same-named folder notes of several types, the configured folder note type wins, then
 * Markdown, Canvas and Base in that order. An Excalidraw drawing is used only when no exact name matches.
 * @param folder - The folder to check for a folder note
 * @param settings - Settings for folder note detection
 * @returns The folder note file or null if not found
 */
export function getFolderNote(folder: TFolder, settings: FolderNoteDetectionSettings): TFile | null {
    if (!settings.enableFolderNotes) {
        return null;
    }

    const expectedName = resolveFolderNoteNameForFolder(folder, settings);
    const prefix = folder.path === '/' ? '' : `${folder.path}/`;

    for (const extension of getFolderNoteExtensionOrder(settings.folderNoteType)) {
        const candidatePath = normalizePath(`${prefix}${expectedName}.${extension}`);
        const candidate = folder.vault.getAbstractFileByPath(candidatePath);

        if (candidate instanceof TFile && candidate.parent?.path === folder.path && candidate.basename === expectedName) {
            return candidate;
        }
    }

    const excalidrawPath = normalizePath(`${prefix}${expectedName}${EXCALIDRAW_BASENAME_SUFFIX}.md`);
    const excalidrawCandidate = folder.vault.getAbstractFileByPath(excalidrawPath);
    if (
        excalidrawCandidate instanceof TFile &&
        excalidrawCandidate.parent?.path === folder.path &&
        isExcalidrawFile(excalidrawCandidate) &&
        stripExcalidrawSuffix(excalidrawCandidate.basename) === expectedName
    ) {
        return excalidrawCandidate;
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

    const expectedName = resolveFolderNoteNameForFolder(folder, settings);
    if (file.basename !== expectedName && (!isExcalidrawFile(file) || stripExcalidrawSuffix(file.basename) !== expectedName)) {
        return false;
    }

    // Only the file getFolderNote selects is the folder note, so a same-named file of another type or an
    // Excalidraw variant beside an exact match stays a regular file in counts, menus and the list pane.
    return getFolderNote(folder, settings)?.path === file.path;
}
