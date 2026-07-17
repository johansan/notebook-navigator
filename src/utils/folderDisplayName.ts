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

import type { App } from 'obsidian';
import type { MetadataService } from '../services/MetadataService';
import type { NotebookNavigatorSettings } from '../settings/types';

interface ResolveFolderDisplayNameParams {
    app: App;
    metadataService: Pick<MetadataService, 'getFolderDisplayData'>;
    settings: Pick<NotebookNavigatorSettings, 'customVaultName'>;
    folderPath: string;
    fallbackName: string;
}

/**
 * Resolves the label used in UI for a folder path.
 */
export function resolveFolderDisplayName(params: ResolveFolderDisplayNameParams): string {
    const { app, metadataService, settings, folderPath, fallbackName } = params;

    const metadataDisplayName = metadataService.getFolderDisplayData(folderPath, {
        includeDisplayName: true,
        includeColor: false,
        includeBackgroundColor: false,
        includeIcon: false
    }).displayName;
    if (metadataDisplayName && metadataDisplayName.length > 0) {
        return metadataDisplayName;
    }

    if (folderPath === '/') {
        return settings.customVaultName || app.vault.getName();
    }

    return fallbackName;
}

interface ResolveFolderDisplayPathParams {
    metadataService: Pick<MetadataService, 'getFolderDisplayData'>;
    folderPath: string;
    baseFolderPath?: string | null;
}

export interface FolderDisplayPathSegment {
    path: string;
    label: string;
}

/**
 * Resolves folder path segments using folder display names where available.
 * baseFolderPath must be the vault root or an ancestor of folderPath; its segments are omitted before metadata is
 * resolved for the visible path.
 */
export function resolveFolderDisplayPathSegments({
    metadataService,
    folderPath,
    baseFolderPath
}: ResolveFolderDisplayPathParams): FolderDisplayPathSegment[] {
    const segments = folderPath.split('/').filter(Boolean);
    const baseDepth = baseFolderPath?.split('/').filter(Boolean).length ?? 0;
    const displaySegments: FolderDisplayPathSegment[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        if (index < baseDepth) {
            return;
        }

        const metadataDisplayName = metadataService.getFolderDisplayData(currentPath, {
            includeDisplayName: true,
            includeColor: false,
            includeBackgroundColor: false,
            includeIcon: false
        }).displayName;

        displaySegments.push({
            path: currentPath,
            label: metadataDisplayName && metadataDisplayName.length > 0 ? metadataDisplayName : segment
        });
    });

    return displaySegments;
}

/**
 * Resolves a folder path using folder display names where available.
 * baseFolderPath follows the ancestor contract documented by resolveFolderDisplayPathSegments.
 */
export function resolveFolderDisplayPath(params: ResolveFolderDisplayPathParams): string {
    return resolveFolderDisplayPathSegments(params)
        .map(segment => segment.label)
        .join('/');
}
