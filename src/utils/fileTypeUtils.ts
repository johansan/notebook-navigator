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

import { App, TFile } from 'obsidian';
import { ExtendedApp } from '../types/obsidian-extended';

/**
 * File visibility options for the navigator
 */
export const FILE_VISIBILITY = {
    DOCUMENTS: 'documents',
    SUPPORTED: 'supported',
    ALL: 'all'
} as const;

/**
 * Type derived from FILE_VISIBILITY values
 */
export type FileVisibility = (typeof FILE_VISIBILITY)[keyof typeof FILE_VISIBILITY];

export function isFileVisibility(value: unknown): value is FileVisibility {
    return value === FILE_VISIBILITY.DOCUMENTS || value === FILE_VISIBILITY.SUPPORTED || value === FILE_VISIBILITY.ALL;
}

/**
 * Core file types that Obsidian supports natively
 * This is a fallback list in case we can't access the view registry
 */
const CORE_OBSIDIAN_EXTENSIONS = new Set([
    'md', // Markdown
    'canvas', // Obsidian Canvas
    'base', // Obsidian database files
    'pdf' // PDF viewer
]);

const supportedExtensionsCache = new WeakMap<App, Set<string>>();

function getSupportedExtensions(app: App): Set<string> {
    const cached = supportedExtensionsCache.get(app);
    if (cached) {
        return cached;
    }

    const extensions = new Set<string>(CORE_OBSIDIAN_EXTENSIONS);

    try {
        // Try to get registered view types from Obsidian's view registry
        const extendedApp = app as ExtendedApp;

        if (extendedApp.viewRegistry?.typeByExtension) {
            const typeByExtension = extendedApp.viewRegistry.typeByExtension;
            if (typeByExtension && typeof typeByExtension === 'object') {
                for (const ext of Object.keys(typeByExtension)) {
                    if (typeof ext === 'string') {
                        extensions.add(ext);
                    }
                }
            }
        }

        // Also check for registered extensions in the metadataTypeManager
        // This catches some additional file types that plugins might register
        if (extendedApp.metadataTypeManager?.registeredExtensions) {
            const registeredExtensions = extendedApp.metadataTypeManager.registeredExtensions;
            if (Array.isArray(registeredExtensions)) {
                for (const ext of registeredExtensions) {
                    if (typeof ext === 'string') {
                        extensions.add(ext);
                    }
                }
            }
        }
    } catch {
        // If we can't access internal APIs, just use the core extensions
    }

    supportedExtensionsCache.set(app, extensions);
    return extensions;
}

/**
 * Common raster image extensions that can be displayed as generated thumbnails or direct previews.
 * SVG files are excluded from raster helpers; they are rasterized into generated thumbnails instead.
 */
const SUPPORTED_RASTER_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'heic', 'heif', 'bmp'] as const;
const RASTER_IMAGE_EXTENSIONS = new Set<string>(SUPPORTED_RASTER_IMAGE_EXTENSIONS);

export function isSvgExtension(extension: string): boolean {
    if (!extension) {
        return false;
    }
    return extension.toLowerCase() === 'svg';
}

export function isRasterImageExtension(extension: string): boolean {
    if (!extension) {
        return false;
    }
    return RASTER_IMAGE_EXTENSIONS.has(extension.toLowerCase());
}

// Checks if a file extension is PDF (case-insensitive)
function isPdfExtension(extension: string): boolean {
    if (!extension) {
        return false;
    }
    return extension.toLowerCase() === 'pdf';
}

function isPrimaryDocumentExtension(extension: string): boolean {
    if (!extension) {
        return false;
    }
    const normalized = extension.toLowerCase();
    return normalized === 'md' || normalized === 'canvas' || normalized === 'base';
}

export function isPrimaryDocumentFile(file: TFile): boolean {
    if (!file?.extension) {
        return false;
    }
    return isPrimaryDocumentExtension(file.extension);
}

/**
 * Check if a file should be displayed based on the visibility setting
 */
export function shouldDisplayFile(file: TFile, visibility: FileVisibility, app: App): boolean {
    // Validate inputs
    if (!file?.extension) {
        return false;
    }

    switch (visibility) {
        case FILE_VISIBILITY.DOCUMENTS:
            // Primary document types in Obsidian
            return isPrimaryDocumentFile(file);

        case FILE_VISIBILITY.SUPPORTED: {
            const extensions = getSupportedExtensions(app);
            return extensions.has(file.extension);
        }

        case FILE_VISIBILITY.ALL:
            return true;

        default:
            // Default to documents for safety
            return isPrimaryDocumentFile(file);
    }
}

/**
 * Check if a file is a raster image that can be displayed as a generated thumbnail or direct preview.
 */
export function isRasterImageFile(file: TFile): boolean {
    if (!file?.extension) {
        return false;
    }
    return isRasterImageExtension(file.extension);
}

/**
 * Check if a file is an SVG image that can be rasterized into a generated thumbnail.
 */
export function isSvgFile(file: TFile): boolean {
    if (!file?.extension) {
        return false;
    }
    return isSvgExtension(file.extension);
}

// Checks if a TFile is a PDF document
export function isPdfFile(file: TFile): boolean {
    if (!file?.extension) {
        return false;
    }
    return isPdfExtension(file.extension);
}

/**
 * Check if a file's feature image is a thumbnail generated from the file contents (PDF cover pages and rasterized SVG files).
 */
export function isGeneratedThumbnailFile(file: TFile): boolean {
    return isPdfFile(file) || isSvgFile(file);
}

export function isMarkdownPath(path: string): boolean {
    if (!path) {
        return false;
    }
    if (path.length < 3) {
        return false;
    }
    return path.slice(-3).toLowerCase() === '.md';
}

/**
 * Determines whether an inline extension suffix should be shown for a file name.
 * Excludes markdown, canvas, and base files.
 */
export function shouldShowExtensionSuffix(file: TFile): boolean {
    if (!file || !file.extension) return false;
    return !isPrimaryDocumentFile(file);
}

/**
 * Returns the extension suffix for inline display, including the leading dot.
 * Returns an empty string when suffix should not be shown.
 */
export function getExtensionSuffix(file: TFile): string {
    return shouldShowExtensionSuffix(file) ? `.${file.extension}` : '';
}
