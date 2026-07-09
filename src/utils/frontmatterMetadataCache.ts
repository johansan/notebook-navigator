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

import type { TFile } from 'obsidian';
import type { NotebookNavigatorSettings } from '../settings/types';
import { STORAGE_KEYS } from '../types';
import { localStorage } from './localStorage';
import type { FileData } from '../storage/IndexedDBStorage';
import { extractFreshMetadataFromFileData, type ProcessedMetadata } from './metadataExtractor';

export const FRONTMATTER_METADATA_CACHE_SETTINGS = [
    'useFrontmatterMetadata',
    'frontmatterNameField',
    'frontmatterIconField',
    'frontmatterColorField',
    'frontmatterBackgroundField',
    'frontmatterCreatedField',
    'frontmatterModifiedField',
    'frontmatterDateFormat'
] as const satisfies readonly (keyof NotebookNavigatorSettings)[];

type FrontmatterMetadataCacheSettings = Pick<NotebookNavigatorSettings, (typeof FRONTMATTER_METADATA_CACHE_SETTINGS)[number]>;

let storedSignatureCache: string | null | undefined;
let lastSignatureValues: unknown[] | null = null;
let lastSignature = '';

export function getFrontmatterMetadataCacheSignature(settings: FrontmatterMetadataCacheSettings): string {
    const values = FRONTMATTER_METADATA_CACHE_SETTINGS.map(settingKey => settings[settingKey]);
    if (lastSignatureValues && values.every((value, index) => value === lastSignatureValues?.[index])) {
        return lastSignature;
    }

    lastSignatureValues = values;
    lastSignature = JSON.stringify(values);
    return lastSignature;
}

export function haveFrontmatterMetadataCacheSettingsChanged(
    oldSettings: FrontmatterMetadataCacheSettings,
    newSettings: FrontmatterMetadataCacheSettings
): boolean {
    return FRONTMATTER_METADATA_CACHE_SETTINGS.some(settingKey => oldSettings[settingKey] !== newSettings[settingKey]);
}

function getStoredFrontmatterMetadataCacheSignature(): string | null {
    if (storedSignatureCache !== undefined) {
        return storedSignatureCache;
    }

    const stored = localStorage.get<unknown>(STORAGE_KEYS.frontmatterMetadataCacheSignatureKey);
    storedSignatureCache = typeof stored === 'string' ? stored : null;
    return storedSignatureCache;
}

export function isFrontmatterMetadataCacheCurrent(settings: FrontmatterMetadataCacheSettings): boolean {
    if (!settings.useFrontmatterMetadata) {
        return false;
    }

    return getStoredFrontmatterMetadataCacheSignature() === getFrontmatterMetadataCacheSignature(settings);
}

export function markFrontmatterMetadataCacheCurrent(settings: FrontmatterMetadataCacheSettings): void {
    if (!settings.useFrontmatterMetadata) {
        clearFrontmatterMetadataCacheSignature();
        return;
    }

    const signature = getFrontmatterMetadataCacheSignature(settings);
    storedSignatureCache = signature;
    localStorage.set(STORAGE_KEYS.frontmatterMetadataCacheSignatureKey, signature);
}

export function clearFrontmatterMetadataCacheSignature(): void {
    storedSignatureCache = null;
    localStorage.remove(STORAGE_KEYS.frontmatterMetadataCacheSignatureKey);
}

export function extractCurrentFrontmatterMetadataFromFileData(
    file: TFile,
    fileData: FileData | null,
    settings: FrontmatterMetadataCacheSettings
): ProcessedMetadata | null {
    if (!isFrontmatterMetadataCacheCurrent(settings)) {
        return null;
    }

    return extractFreshMetadataFromFileData(file, fileData);
}
