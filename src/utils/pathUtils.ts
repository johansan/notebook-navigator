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

import { normalizePath } from 'obsidian';

/**
 * Removes a trailing slash from a path unless it is the vault root.
 */
export function stripTrailingSlash(path: string): string {
    if (path === '/') {
        return path;
    }
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * Returns the final segment of a path after trimming trailing slashes.
 */
export function getPathBaseName(path: string): string {
    const trimmed = stripTrailingSlash(path);
    if (!trimmed) {
        return '';
    }

    const segments = trimmed.split('/').filter(Boolean);
    if (segments.length === 0) {
        return trimmed || '/';
    }

    return segments[segments.length - 1];
}

/**
 * Returns the parent folder path for a vault path.
 * Root-level paths return "/".
 */
export function getParentFolderPath(path: string): string {
    const separatorIndex = path.lastIndexOf('/');
    if (separatorIndex === -1 || separatorIndex === 0) {
        return '/';
    }
    return path.slice(0, separatorIndex);
}

/**
 * Checks whether the candidate path is the folder itself or within the folder hierarchy.
 */
export function doesFolderContainPath(folderPath: string, candidatePath: string): boolean {
    if (folderPath === '/') {
        return true;
    }
    if (folderPath === candidatePath) {
        return true;
    }
    const normalizedFolderPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    return candidatePath.startsWith(normalizedFolderPath);
}

/**
 * Normalizes an optional vault file path and returns null for empty values.
 */
export function normalizeOptionalVaultFilePath(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed === '/') {
        return null;
    }

    const normalized = normalizePath(trimmed);
    if (!normalized || normalized === '.' || normalized === '/') {
        return null;
    }

    const withoutLeadingSlash = normalized.replace(/^\/+/u, '');
    if (!withoutLeadingSlash || withoutLeadingSlash === '.') {
        return null;
    }

    return withoutLeadingSlash;
}

/**
 * Normalizes an optional vault folder path and keeps root path as "/" when provided.
 */
export function normalizeOptionalVaultFolderPath(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed === '/') {
        return '/';
    }

    if (/^\/+$/u.test(trimmed)) {
        return null;
    }

    const normalized = normalizePath(trimmed);
    const collapsed = normalized.replace(/\/{2,}/gu, '/');
    if (!collapsed || collapsed === '.' || collapsed === '/') {
        return null;
    }

    const withoutLeadingSlash = collapsed.replace(/^\/+/u, '');
    if (!withoutLeadingSlash || withoutLeadingSlash === '.') {
        return null;
    }

    const withoutTrailingSlash = withoutLeadingSlash.replace(/\/+$/u, '');
    return withoutTrailingSlash.length > 0 ? withoutTrailingSlash : null;
}

/** Formats a vault folder path for display with a leading slash, so the root and nested folders read the same way. */
export function formatFolderPathForDisplay(folderPath: string): string {
    return folderPath === '/' || folderPath === '' ? '/' : `/${folderPath}`;
}
