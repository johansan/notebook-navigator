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
import { FOLDER_NOTE_TYPE_EXTENSIONS } from '../types/folderNote';
import { EXCALIDRAW_BASENAME_SUFFIX, isExcalidrawFile, stripExcalidrawSuffix } from './fileNameUtils';
import { type FolderNoteNameSettings, resolveFolderNoteName } from './folderNoteName';

// Lookup-only helpers used by startup services. Creation and opening behavior stays in folderNotes.ts.

/**
 * Settings required for detecting folder notes
 */
export interface FolderNoteDetectionSettings extends FolderNoteNameSettings {
    enableFolderNotes: boolean;
}

/**
 * Extracts folder note detection settings from a larger settings object.
 */
export function getFolderNoteDetectionSettings(settings: FolderNoteDetectionSettings): FolderNoteDetectionSettings {
    return {
        enableFolderNotes: settings.enableFolderNotes,
        folderNoteNamePattern: settings.folderNoteNamePattern
    };
}

/** Set of file extensions that are valid for folder notes */
const SUPPORTED_FOLDER_NOTE_EXTENSIONS = new Set<string>(Object.values(FOLDER_NOTE_TYPE_EXTENSIONS));

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
 * Gets the folder note for a folder if it exists
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
    const exactCandidates: TFile[] = [];

    for (const extension of Object.values(FOLDER_NOTE_TYPE_EXTENSIONS)) {
        const candidatePath = normalizePath(`${prefix}${expectedName}.${extension}`);
        const candidate = folder.vault.getAbstractFileByPath(candidatePath);

        if (!(candidate instanceof TFile) || candidate.parent?.path !== folder.path) {
            continue;
        }

        if (!SUPPORTED_FOLDER_NOTE_EXTENSIONS.has(candidate.extension)) {
            continue;
        }

        if (candidate.basename === expectedName) {
            exactCandidates.push(candidate);
        }
    }

    let excalidrawCandidate: TFile | null = null;
    const excalidrawPath = normalizePath(`${prefix}${expectedName}${EXCALIDRAW_BASENAME_SUFFIX}.md`);
    const abstractExcalidrawCandidate = folder.vault.getAbstractFileByPath(excalidrawPath);
    if (abstractExcalidrawCandidate instanceof TFile && abstractExcalidrawCandidate.parent?.path === folder.path) {
        if (isExcalidrawFile(abstractExcalidrawCandidate) && stripExcalidrawSuffix(abstractExcalidrawCandidate.basename) === expectedName) {
            excalidrawCandidate = abstractExcalidrawCandidate;
        }
    }

    if (exactCandidates.length === 1) {
        return exactCandidates[0];
    }

    if (exactCandidates.length > 1) {
        const candidatePaths = new Set<string>(exactCandidates.map(candidate => candidate.path));
        for (const child of folder.children) {
            if (!(child instanceof TFile)) {
                continue;
            }

            if (child.parent?.path !== folder.path) {
                continue;
            }

            if (!candidatePaths.has(child.path)) {
                continue;
            }

            return child;
        }

        return exactCandidates[0] ?? null;
    }

    return excalidrawCandidate;
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
    if (file.basename === expectedName) {
        return true;
    }

    if (!isExcalidrawFile(file) || stripExcalidrawSuffix(file.basename) !== expectedName) {
        return false;
    }

    // Use preferred folder note selection so plain notes win over Excalidraw variants.
    const preferred = getFolderNote(folder, settings);
    return preferred?.path === file.path;
}
