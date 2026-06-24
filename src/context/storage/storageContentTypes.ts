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
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { ContentProviderType, FileContentType } from '../../interfaces/IContentProvider';
import { isMarkdownPath } from '../../utils/fileTypeUtils';
import { getActiveHiddenFileProperties } from '../../utils/vaultProfiles';
import { getMarkdownPipelineContentTypes, hasMarkdownPipelineContent } from '../../utils/markdownPipelineContentTypes';

/**
 * Returns provider types that require Obsidian's metadata cache to be ready.
 */
export function getMetadataDependentTypes(settings: NotebookNavigatorSettings): ContentProviderType[] {
    const types: ContentProviderType[] = [];

    if (hasMarkdownPipelineContent(settings)) {
        types.push('markdownPipeline');
    }
    if (settings.showTags) {
        types.push('tags');
    }

    const hiddenFileProperties = getActiveHiddenFileProperties(settings);
    if (settings.useFrontmatterMetadata || hiddenFileProperties.length > 0) {
        types.push('metadata');
    }

    return types;
}

/**
 * Returns content types expected to be rebuilt during a full cache rebuild.
 */
export function getCacheRebuildProgressTypes(settings: NotebookNavigatorSettings): FileContentType[] {
    const types = new Set<FileContentType>();

    getMarkdownPipelineContentTypes(settings).forEach(type => types.add(type));

    for (const providerType of getMetadataDependentTypes(settings)) {
        if (providerType === 'tags' || providerType === 'metadata') {
            types.add(providerType);
        }
    }

    return Array.from(types);
}

/**
 * Returns the number of files that will require processing for the provided content types.
 */
export function getContentWorkTotal(files: TFile[], types: FileContentType[]): number {
    if (files.length === 0 || types.length === 0) {
        return 0;
    }

    const needsFeatureImage = types.includes('featureImage');
    if (needsFeatureImage) {
        return files.length;
    }

    const needsMarkdownContent = types.some(type => type !== 'featureImage');
    if (!needsMarkdownContent) {
        return 0;
    }

    let total = 0;
    for (const file of files) {
        if (isMarkdownPath(file.path)) {
            total += 1;
        }
    }
    return total;
}

/**
 * Filters provider types to those currently enabled in settings.
 */
export function resolveMetadataDependentTypes(
    settings: NotebookNavigatorSettings,
    requested?: ContentProviderType[]
): ContentProviderType[] {
    const baseTypes = requested ?? getMetadataDependentTypes(settings);

    return baseTypes.filter(type => {
        if (type === 'markdownPipeline') {
            return hasMarkdownPipelineContent(settings);
        }
        if (type === 'tags') {
            return settings.showTags;
        }
        if (type === 'metadata') {
            return settings.useFrontmatterMetadata || getActiveHiddenFileProperties(settings).length > 0;
        }
        return false;
    });
}

/**
 * Compares two string arrays for deep equality, handling null/undefined cases.
 */
export function haveStringArraysChanged(prev?: string[] | null, next?: string[] | null): boolean {
    if (prev === next) {
        return false;
    }
    if (!prev || !next) {
        return (prev?.length ?? 0) !== (next?.length ?? 0);
    }
    if (prev.length !== next.length) {
        return true;
    }
    for (let index = 0; index < prev.length; index += 1) {
        if (prev[index] !== next[index]) {
            return true;
        }
    }
    return false;
}
