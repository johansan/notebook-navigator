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

import { App, TFile, CachedMetadata } from 'obsidian';
import type { NotebookNavigatorSettings } from '../settings/types';
import { METADATA_SENTINEL, type FileData } from '../storage/IndexedDBStorage';
import { DateUtils } from './dateUtils';
import { getCachedCommaSeparatedList } from './commaSeparatedListUtils';
import { deserializeIconFromFrontmatterCompat } from './iconizeFormat';
import { getMatchingRecordValue } from './recordUtils';
import { isRecord } from './typeGuards';

/**
 * Processed metadata from frontmatter
 */
export interface ProcessedMetadata {
    fn?: string; // frontmatter name
    fc?: number; // frontmatter created timestamp
    fm?: number; // frontmatter modified timestamp
    icon?: string; // frontmatter icon
    color?: string; // frontmatter color
    background?: string; // frontmatter background color
}

/**
 * Extract metadata from a file using the metadata cache
 * @param app - The Obsidian app instance
 * @param file - The file to extract metadata from
 * @param settings - Current plugin settings
 * @returns Processed metadata object
 */
export function extractMetadata(app: App, file: TFile, settings: NotebookNavigatorSettings): ProcessedMetadata {
    const metadata = app.metadataCache.getFileCache(file);
    return extractMetadataFromCache(metadata, settings);
}

export function extractFreshMetadataFromFileData(file: TFile, fileData: FileData | null): ProcessedMetadata | null {
    if (file.extension !== 'md' || !fileData || fileData.metadata === null || fileData.metadataMtime !== file.stat.mtime) {
        return null;
    }

    const metadata = fileData.metadata;
    const result: ProcessedMetadata = {};
    if (metadata.name !== undefined) result.fn = metadata.name;
    if (metadata.created !== undefined) result.fc = metadata.created;
    if (metadata.modified !== undefined) result.fm = metadata.modified;
    if (metadata.icon !== undefined) result.icon = metadata.icon;
    if (metadata.color !== undefined) result.color = metadata.color;
    if (metadata.background !== undefined) result.background = metadata.background;
    return result;
}

export function extractFrontmatterName(app: App, file: TFile, frontmatterNameField: string): string {
    const metadata = app.metadataCache.getFileCache(file);
    return extractFrontmatterNameFromCache(metadata, frontmatterNameField);
}

function extractFrontmatterNameFromCache(metadata: CachedMetadata | null, frontmatterNameField: string): string {
    const frontmatter = metadata?.frontmatter;
    if (!frontmatter) {
        return '';
    }

    const frontmatterValue: unknown = frontmatter;
    if (!isRecord(frontmatterValue)) {
        return '';
    }
    const frontmatterRecord = frontmatterValue;

    const nameFields = getCachedCommaSeparatedList(frontmatterNameField);
    if (nameFields.length === 0) {
        return '';
    }

    for (const field of nameFields) {
        const nameValue = getMatchingRecordValue(frontmatterRecord, field);

        if (typeof nameValue === 'string') {
            const trimmedName = nameValue.trim();
            if (trimmedName) {
                return trimmedName;
            }
        } else if (Array.isArray(nameValue)) {
            for (const entry of nameValue) {
                if (typeof entry === 'string') {
                    const trimmedName = entry.trim();
                    if (trimmedName) {
                        return trimmedName;
                    }
                }
            }
        }
    }

    return '';
}

function extractTrimmedFrontmatterString(value: unknown): string | undefined {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    if (Array.isArray(value)) {
        const firstValue: unknown = value[0];
        if (typeof firstValue === 'string') {
            const trimmed = firstValue.trim();
            return trimmed.length > 0 ? trimmed : undefined;
        }
    }

    return undefined;
}

/**
 * Extract metadata from cached metadata
 * @param metadata - Cached metadata from Obsidian
 * @param settings - Current plugin settings
 * @returns Processed metadata object
 */
export function extractMetadataFromCache(metadata: CachedMetadata | null, settings: NotebookNavigatorSettings): ProcessedMetadata {
    const frontmatter = metadata?.frontmatter;

    if (!frontmatter || !settings.useFrontmatterMetadata) {
        return {};
    }

    const result: ProcessedMetadata = {};
    // Validate frontmatter is a record before accessing properties
    const frontmatterValue: unknown = frontmatter;
    if (!isRecord(frontmatterValue)) {
        return {};
    }
    const frontmatterRecord = frontmatterValue;

    // Extract name if field is specified
    const frontmatterName = extractFrontmatterNameFromCache(metadata, settings.frontmatterNameField);
    if (frontmatterName) {
        result.fn = frontmatterName;
    }

    // Extract icon if field is specified
    // Extract icon from frontmatter field
    if (settings.frontmatterIconField && settings.frontmatterIconField.trim()) {
        const iconValue = getMatchingRecordValue(frontmatterRecord, settings.frontmatterIconField);

        // Helper to extract and convert a stored icon value to canonical format
        const extractIconValue = (value: unknown): string | undefined => {
            if (typeof value !== 'string') {
                return undefined;
            }
            const trimmed = value.trim();
            if (!trimmed) {
                return undefined;
            }

            const parsed = deserializeIconFromFrontmatterCompat(trimmed);
            return parsed ?? undefined;
        };

        if (typeof iconValue === 'string') {
            const normalizedIcon = extractIconValue(iconValue);
            if (normalizedIcon) {
                result.icon = normalizedIcon;
            }
        } else if (Array.isArray(iconValue)) {
            const iconArray: unknown[] = iconValue;
            // Handle array values - use first valid icon
            for (const entry of iconArray) {
                const normalizedIcon = extractIconValue(entry);
                if (normalizedIcon) {
                    result.icon = normalizedIcon;
                    break;
                }
            }
        }
    }

    // Extract color if field is specified
    if (settings.frontmatterColorField && settings.frontmatterColorField.trim()) {
        const colorValue = getMatchingRecordValue(frontmatterRecord, settings.frontmatterColorField);
        const parsedColor = extractTrimmedFrontmatterString(colorValue);
        if (parsedColor) {
            result.color = parsedColor;
        }
    }

    // Extract background color if field is specified
    if (settings.frontmatterBackgroundField && settings.frontmatterBackgroundField.trim()) {
        const backgroundValue = getMatchingRecordValue(frontmatterRecord, settings.frontmatterBackgroundField);
        const parsedBackground = extractTrimmedFrontmatterString(backgroundValue);
        if (parsedBackground) {
            result.background = parsedBackground;
        }
    }

    // Extract created date if field is specified
    if (settings.frontmatterCreatedField && settings.frontmatterCreatedField.trim()) {
        const createdValue = getMatchingRecordValue(frontmatterRecord, settings.frontmatterCreatedField);

        if (createdValue !== undefined) {
            // Field exists, try to parse it
            const createdTimestamp = DateUtils.parseFrontmatterDate(createdValue, settings.frontmatterDateFormat);
            if (createdTimestamp !== undefined) {
                result.fc = createdTimestamp;
            } else {
                // Parsing failed, use sentinel value
                result.fc = METADATA_SENTINEL.PARSE_FAILED;
            }
        }
    } else {
        // Field is empty, use sentinel value to clear the metadata
        result.fc = METADATA_SENTINEL.FIELD_NOT_CONFIGURED;
    }

    // Extract modified date if field is specified
    if (settings.frontmatterModifiedField && settings.frontmatterModifiedField.trim()) {
        const modifiedValue = getMatchingRecordValue(frontmatterRecord, settings.frontmatterModifiedField);

        if (modifiedValue !== undefined) {
            // Field exists, try to parse it
            const modifiedTimestamp = DateUtils.parseFrontmatterDate(modifiedValue, settings.frontmatterDateFormat);
            if (modifiedTimestamp !== undefined) {
                result.fm = modifiedTimestamp;
            } else {
                // Parsing failed, use sentinel value
                result.fm = METADATA_SENTINEL.PARSE_FAILED;
            }
        }
    } else {
        // Field is empty, use sentinel value to clear the metadata
        result.fm = METADATA_SENTINEL.FIELD_NOT_CONFIGURED;
    }

    return result;
}
