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

export interface FolderNoteNameSettings {
    folderNoteNamePattern: string;
}

export const FOLDER_NOTE_NAME_PATTERN_TOKEN = '{{folder}}';

const FOLDER_NOTE_NAME_TOKEN_PATTERN = /\{\{\s*folder\s*\}\}/giu;
const LEGACY_FOLDER_NOTE_NAME_TOKEN_PATTERN = /\{\{\s*folder_name\s*\}\}/giu;
const FOLDER_NOTE_NAME_TOKEN_OR_LEGACY_PATTERN = /\{\{\s*folder(?:_name)?\s*\}\}/giu;

/**
 * Normalizes legacy folder note tokens to the current token format.
 */
export function normalizeFolderNoteNamePattern(pattern: string): string {
    LEGACY_FOLDER_NOTE_NAME_TOKEN_PATTERN.lastIndex = 0;
    return pattern.replace(LEGACY_FOLDER_NOTE_NAME_TOKEN_PATTERN, FOLDER_NOTE_NAME_PATTERN_TOKEN);
}

/**
 * Returns true when the naming pattern contains the folder name token.
 */
export function hasFolderNoteNameToken(pattern: string): boolean {
    FOLDER_NOTE_NAME_TOKEN_OR_LEGACY_PATTERN.lastIndex = 0;
    return FOLDER_NOTE_NAME_TOKEN_OR_LEGACY_PATTERN.test(pattern);
}

/**
 * Resolves folder note basename from settings and folder name.
 * A pattern without the folder token is a fixed name, while an empty pattern retains folder-name naming.
 */
export function resolveFolderNoteName(folderName: string, settings: FolderNoteNameSettings): string {
    if (settings.folderNoteNamePattern.length === 0) {
        return folderName;
    }

    const normalizedPattern = normalizeFolderNoteNamePattern(settings.folderNoteNamePattern);
    FOLDER_NOTE_NAME_TOKEN_PATTERN.lastIndex = 0;
    return normalizedPattern.replace(FOLDER_NOTE_NAME_TOKEN_PATTERN, () => folderName) || folderName;
}

/**
 * Returns true when folder note basename depends on the current folder name.
 */
export function shouldRenameFolderNoteWithFolderName(settings: FolderNoteNameSettings): boolean {
    return settings.folderNoteNamePattern.length === 0 || hasFolderNoteNameToken(settings.folderNoteNamePattern);
}
