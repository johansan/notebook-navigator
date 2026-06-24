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
import { hasExcalidrawFrontmatterFlag, isExcalidrawFile } from './fileNameUtils';
import { isRasterImageExtension } from './fileTypeUtils';
import type { IconId } from '../services/icons/types';
import { deserializeIconFromFrontmatter } from './iconizeFormat';
import { casefoldPreservingWhitespace } from './recordUtils';
import {
    DEFAULT_FILE_TYPE_ICON_PRESET,
    getFileTypeIconPresetMap,
    isFileTypeIconProviderPreset,
    type FileTypeIconPreset
} from './fileTypeIconPresets';

export type FileIconFallbackMode = 'none' | 'file';

interface MetadataCacheLike {
    getFileCache: (
        file: TFile
    ) => { frontmatter?: Record<string, boolean | number | string | object | null | undefined> } | null | undefined;
}

export interface FileIconResolutionSettings {
    showFilenameMatchIcons: boolean;
    fileNameIconMap: Record<string, string>;
    showCategoryIcons: boolean;
    fileTypeIconMap: Record<string, string>;
    fileTypeIconPreset: FileTypeIconPreset;
    externalIconProviders?: Record<string, boolean>;
}

export interface FileNameIconNeedle {
    needle: string;
    iconId: IconId;
}

export interface ResolveFileIconIdOptions {
    customIconId?: IconId | null;
    metadataCache?: MetadataCacheLike;
    isExternalFile?: boolean;
    allowCategoryIcons?: boolean;
    fallbackMode?: FileIconFallbackMode;
    fileNameNeedles?: readonly FileNameIconNeedle[];
    fileNameForMatch?: string;
}

const BUILT_IN_FILE_TYPE_ICON_MAP = Object.freeze(
    Object.assign(Object.create(null) as Record<string, string>, {
        md: 'file-text',
        'excalidraw.md': 'pencil',
        canvas: 'layout-grid',
        base: 'database',
        pdf: 'file-text'
    })
);

export function resolveFileTypeIconKey(file: TFile, metadataCache?: MetadataCacheLike): string {
    if (isExcalidrawFile(file)) {
        return 'excalidraw.md';
    }

    const extension = file.extension.toLowerCase();
    if (extension === 'md') {
        const fileCache = metadataCache?.getFileCache(file);
        if (hasExcalidrawFrontmatterFlag(fileCache?.frontmatter)) {
            return 'excalidraw.md';
        }
    }

    return extension;
}

export function buildFileNameIconNeedles(iconMap: Record<string, string>): FileNameIconNeedle[] {
    const needles: FileNameIconNeedle[] = [];
    Object.entries(iconMap).forEach(([key, value]) => {
        if (typeof key !== 'string' || typeof value !== 'string') {
            return;
        }

        // Preserve whitespace in the key to allow matching patterns like 'ai ' (with trailing space)
        const needle = casefoldPreservingWhitespace(key);
        const iconId = deserializeIconFromFrontmatter(value.trim()) ?? '';
        // Reject keys that are empty when trimmed, but allow keys with leading/trailing whitespace
        if (needle.trim().length === 0 || !iconId) {
            return;
        }

        needles.push({ needle, iconId });
    });

    needles.sort((a, b) => {
        const lengthDelta = b.needle.length - a.needle.length;
        if (lengthDelta !== 0) {
            return lengthDelta;
        }
        return a.needle.localeCompare(b.needle);
    });

    return needles;
}

export function resolveFileNameMatchIconIdFromNeedles(basename: string, needles: readonly FileNameIconNeedle[]): IconId | null {
    const fileName = casefoldPreservingWhitespace(basename);
    if (!fileName) {
        return null;
    }

    for (const entry of needles) {
        if (!entry.needle || !entry.iconId) {
            continue;
        }
        if (fileName.includes(entry.needle)) {
            return entry.iconId;
        }
    }

    return null;
}

export function resolveFileNameMatchIconId(basename: string, iconMap: Record<string, string>): IconId | null {
    const needles = buildFileNameIconNeedles(iconMap);
    return resolveFileNameMatchIconIdFromNeedles(basename, needles);
}

export function resolveFileTypeIconId(
    fileTypeIconKey: string,
    iconMap: Record<string, string>,
    fileTypeIconPreset: FileTypeIconPreset = DEFAULT_FILE_TYPE_ICON_PRESET,
    externalIconProviders?: Record<string, boolean>
): IconId | null {
    if (!fileTypeIconKey) {
        return null;
    }

    const presetMap =
        isFileTypeIconProviderPreset(fileTypeIconPreset) && externalIconProviders && externalIconProviders[fileTypeIconPreset] !== true
            ? null
            : getFileTypeIconPresetMap(fileTypeIconPreset);
    const resolved = iconMap[fileTypeIconKey] ?? presetMap?.[fileTypeIconKey] ?? BUILT_IN_FILE_TYPE_ICON_MAP[fileTypeIconKey];
    if (resolved) {
        const deserialized = deserializeIconFromFrontmatter(resolved);
        return deserialized ?? resolved;
    }

    if (isRasterImageExtension(fileTypeIconKey)) {
        return 'image';
    }

    return null;
}

export function resolveFileIconId(
    file: TFile,
    settings: FileIconResolutionSettings,
    options: ResolveFileIconIdOptions = {}
): IconId | null {
    const customIconId = options.customIconId;
    if (customIconId) {
        return customIconId;
    }

    if (settings.showFilenameMatchIcons) {
        const fileNameNeedles = options.fileNameNeedles ?? buildFileNameIconNeedles(settings.fileNameIconMap);
        const fileNameForMatch = options.fileNameForMatch ?? file.basename;
        const fileNameMatchIconId = resolveFileNameMatchIconIdFromNeedles(fileNameForMatch, fileNameNeedles);
        if (fileNameMatchIconId) {
            return fileNameMatchIconId;
        }
    }

    const allowCategoryIcons = options.allowCategoryIcons ?? settings.showCategoryIcons;
    if (allowCategoryIcons) {
        const fileTypeIconKey = resolveFileTypeIconKey(file, options.metadataCache);
        const fileTypeIconId = resolveFileTypeIconId(
            fileTypeIconKey,
            settings.fileTypeIconMap,
            settings.fileTypeIconPreset,
            settings.externalIconProviders
        );
        if (fileTypeIconId) {
            return fileTypeIconId;
        }
    }

    if (options.isExternalFile) {
        return 'external-link';
    }

    const fallbackMode = options.fallbackMode ?? (allowCategoryIcons ? 'file' : 'none');
    if (fallbackMode === 'file') {
        return 'file';
    }

    return null;
}

export function resolveFileDragIconId(
    file: TFile,
    fileTypeIconMap: Record<string, string>,
    metadataCache?: MetadataCacheLike,
    preferredIconId?: IconId | null,
    fileTypeIconPreset: FileTypeIconPreset = DEFAULT_FILE_TYPE_ICON_PRESET,
    externalIconProviders?: Record<string, boolean>
): IconId {
    if (preferredIconId) {
        return preferredIconId;
    }

    const fileTypeIconKey = resolveFileTypeIconKey(file, metadataCache);
    return resolveFileTypeIconId(fileTypeIconKey, fileTypeIconMap, fileTypeIconPreset, externalIconProviders) ?? 'file';
}
