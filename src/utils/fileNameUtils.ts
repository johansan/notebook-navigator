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

import { TFile } from 'obsidian';

export const EXCALIDRAW_BASENAME_SUFFIX = '.excalidraw';
const EXCALIDRAW_FRONTMATTER_KEY = 'excalidraw-plugin';

type ExcalidrawFrontmatterFlagValue = boolean | number | string | object | null | undefined;

// Pattern matching characters that break Obsidian links: [[, ]], %%, #, |, ^, :
const INVALID_LINK_CHARACTERS_PATTERN = /(\[\[|\]\]|%%|[#|^:])/u;
const INVALID_LINK_CHARACTERS_GLOBAL_PATTERN = /(\[\[|\]\]|%%|[#|^:])/gu;

// Forbidden characters across all platforms: : and /
const FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_PATTERN = /[:/]/u;
const FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_GLOBAL_PATTERN = /[:/]/gu;

// Forbidden characters on Windows (excluding : and / handled in all-platform pattern): < > " \ | ? *
const FORBIDDEN_NAME_CHARACTERS_WINDOWS_PATTERN = /[<>"\\|?*]/u;
const FORBIDDEN_NAME_CHARACTERS_WINDOWS_GLOBAL_PATTERN = /[<>"\\|?*]/gu;

/**
 * Strips leading periods from a name.
 */
export function stripLeadingPeriods(value: string): string {
    if (!value) {
        return '';
    }
    return value.replace(/^\.+/u, '');
}

/**
 * Checks whether a filename ends with the Excalidraw composite extension (.excalidraw.md).
 */
export function isExcalidrawFileName(value: string): boolean {
    if (!value) {
        return false;
    }

    return value.toLowerCase().endsWith(`${EXCALIDRAW_BASENAME_SUFFIX}.md`);
}

/**
 * Removes the Excalidraw basename suffix when present.
 * Returns the original value for non-Excalidraw names.
 */
export function stripExcalidrawSuffix(value: string): string {
    if (!value) {
        return value;
    }
    const lower = value.toLowerCase();
    if (lower.endsWith(EXCALIDRAW_BASENAME_SUFFIX)) {
        return value.slice(0, -EXCALIDRAW_BASENAME_SUFFIX.length);
    }
    return value;
}

/**
 * Checks whether a file uses the Excalidraw composite extension (.excalidraw.md).
 */
export function isExcalidrawFile(file: TFile): boolean {
    return isExcalidrawFileName(file.name);
}

/**
 * Checks if a frontmatter flag value is truthy.
 */
export function isTruthyFrontmatterFlagValue(value: unknown): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return false;
        }
        const normalized = trimmed.toLowerCase();
        return normalized !== 'false' && normalized !== '0';
    }

    return Boolean(value);
}

/**
 * Checks whether an unknown object contains an Excalidraw frontmatter flag.
 */
export function hasExcalidrawFrontmatterFlagValue(frontmatter: unknown): boolean {
    if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
        return false;
    }

    return isTruthyFrontmatterFlagValue((frontmatter as Record<string, unknown>)[EXCALIDRAW_FRONTMATTER_KEY]);
}

/**
 * Checks if a frontmatter record marks the file as an Excalidraw drawing.
 */
export function hasExcalidrawFrontmatterFlag(frontmatter?: Record<string, ExcalidrawFrontmatterFlagValue> | null): boolean {
    return hasExcalidrawFrontmatterFlagValue(frontmatter);
}

/**
 * Removes characters that break Obsidian links (#, |, ^, :, %%, [[, ]]).
 */
export function stripInvalidLinkCharacters(value: string): string {
    if (!value) {
        return value;
    }
    INVALID_LINK_CHARACTERS_GLOBAL_PATTERN.lastIndex = 0;
    return value.replace(INVALID_LINK_CHARACTERS_GLOBAL_PATTERN, '');
}

/**
 * Checks whether a name contains characters that break Obsidian links (#, |, ^, :, %%, [[, ]]).
 */
export function containsInvalidLinkCharacters(value: string): boolean {
    if (!value) {
        return false;
    }
    return INVALID_LINK_CHARACTERS_PATTERN.test(value);
}

/**
 * Removes forbidden name characters across all platforms (: and /).
 */
export function stripForbiddenNameCharactersAllPlatforms(value: string): string {
    if (!value) {
        return value;
    }
    FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_GLOBAL_PATTERN.lastIndex = 0;
    return value.replace(FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_GLOBAL_PATTERN, '');
}

/**
 * Checks whether a name contains forbidden characters across all platforms (: and /).
 */
export function containsForbiddenNameCharactersAllPlatforms(value: string): boolean {
    if (!value) {
        return false;
    }
    return FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_PATTERN.test(value);
}

/**
 * Removes forbidden name characters on Windows (<, >, ", \\, |, ?, *).
 */
export function stripForbiddenNameCharactersWindows(value: string): string {
    if (!value) {
        return value;
    }
    FORBIDDEN_NAME_CHARACTERS_WINDOWS_GLOBAL_PATTERN.lastIndex = 0;
    return value.replace(FORBIDDEN_NAME_CHARACTERS_WINDOWS_GLOBAL_PATTERN, '');
}

/**
 * Checks whether a name contains forbidden characters on Windows (<, >, ", \\, |, ?, *).
 */
export function containsForbiddenNameCharactersWindows(value: string): boolean {
    if (!value) {
        return false;
    }
    return FORBIDDEN_NAME_CHARACTERS_WINDOWS_PATTERN.test(value);
}

/**
 * Returns the file name without its extension, treating `.excalidraw.md` as one extension. Notes with a frontmatter name
 * show `getNoteDisplayName` instead.
 */
export function getFileNameWithoutExtension(file: TFile): string {
    if (isExcalidrawFile(file)) {
        return stripExcalidrawSuffix(file.basename);
    }

    return file.basename;
}
