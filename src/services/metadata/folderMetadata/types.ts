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

export interface FolderDisplayData {
    displayName?: string;
    color?: string;
    backgroundColor?: string;
    icon?: string;
}

export interface FolderDisplayResolveOptions {
    includeDisplayName: boolean;
    includeColor: boolean;
    includeBackgroundColor: boolean;
    includeIcon: boolean;
    includeInheritedColors: boolean;
}

export interface FolderStyleUpdate {
    icon?: string | null;
    color?: string | null;
    backgroundColor?: string | null;
}

export interface FolderStyleValues {
    icon?: string;
    color?: string;
    backgroundColor?: string;
}

export interface FolderFrontmatterFields {
    iconField?: string;
    colorField?: string;
    backgroundField?: string;
}

export interface FolderNoteMetadata extends FolderStyleValues {
    name?: string;
}

export interface FolderDisplayCacheSettingsSnapshot {
    useFrontmatterMetadata: boolean;
    enableFolderNotes: boolean;
    inheritFolderColors: boolean;
    folderNoteNamePattern: string;
    frontmatterNameField: string;
    frontmatterIconField: string;
    frontmatterColorField: string;
    frontmatterBackgroundField: string;
}

export interface FolderStyleRecordSource {
    icons: Record<string, string> | undefined;
    colors: Record<string, string> | undefined;
    backgrounds: Record<string, string> | undefined;
}

export interface FolderStyleWriteResult {
    icon: boolean;
    color: boolean;
    backgroundColor: boolean;
}
