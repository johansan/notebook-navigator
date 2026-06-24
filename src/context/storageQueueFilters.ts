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
import type { CachedMetadata } from 'obsidian';
import type { ContentProviderType } from '../interfaces/IContentProvider';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { FileData } from '../storage/IndexedDBStorage';
import { getDBInstance } from '../storage/fileOperations';
import { isPdfFile } from '../utils/fileTypeUtils';
import { getActiveHiddenFileProperties } from '../utils/vaultProfiles';
import { getLocalFeatureImageKey } from '../services/content/FeatureImageContentProvider';
import { createCaseInsensitiveKeyMatcher } from '../utils/recordUtils';
import {
    getDrawingDirectFeatureImageKey,
    getDrawingSourceProviderIdWithFrontmatter,
    getNonMarkdownDrawingFeatureImageProviderId
} from '../utils/drawingFeatureImages';
import {
    hasMarkdownCharacterCountConsumer,
    hasMarkdownFeatureImageConsumer,
    hasMarkdownPipelineContent,
    hasMarkdownPreviewConsumer,
    hasMarkdownPropertiesConsumer,
    hasMarkdownTaskConsumer,
    hasMarkdownWordCountConsumer
} from '../utils/markdownPipelineContentTypes';
import { areMarkdownTaskCountsEqual, countMarkdownTasksFromMetadata, hasMarkdownTaskMetadata } from '../utils/markdownTaskCounts';

type MetadataSourceFilterOptions = {
    /**
     * When true, metadata files are treated conservatively when hidden frontmatter rules are active.
     * This avoids false negatives when the provider's hidden-state logic can change without a stat.mtime update.
     */
    conservativeMetadata?: boolean;
    app?: App;
};

function shouldQueueStaleMarkdownTaskRefresh(
    record: Pick<FileData, 'taskTotal' | 'taskUnfinished'>,
    metadata: CachedMetadata | null
): boolean {
    if (!metadata) {
        return true;
    }

    const taskCountsFromMetadata = countMarkdownTasksFromMetadata(metadata);
    return taskCountsFromMetadata === null || !areMarkdownTaskCountsEqual(record, taskCountsFromMetadata);
}

/**
 * Returns files that need metadata-dependent content providers to run.
 * Filters out files that already have cached content for the requested types.
 */
export function filterFilesRequiringMetadataSources(
    files: TFile[],
    types: ContentProviderType[],
    settings: NotebookNavigatorSettings,
    options?: MetadataSourceFilterOptions
): TFile[] {
    if (files.length === 0 || types.length === 0) {
        return [];
    }

    const db = getDBInstance();
    const records = db.getFiles(files.map(file => file.path));
    const hiddenFileProperties = getActiveHiddenFileProperties(settings);
    const requiresHiddenState = hiddenFileProperties.length > 0;
    const conservativeMetadata = options?.conservativeMetadata ?? false;
    const propertiesEnabled = hasMarkdownPropertiesConsumer(settings);
    const needsMarkdownPipeline = types.includes('markdownPipeline');
    const needsTags = types.includes('tags');
    const needsMetadata = types.includes('metadata');
    const app = options?.app;
    const featureImageExcludeMatcher = createCaseInsensitiveKeyMatcher(settings.featureImageExcludeProperties);
    const markdownPipelineEnabled = hasMarkdownPipelineContent(settings);
    const previewEnabled = hasMarkdownPreviewConsumer(settings);
    const featureImageEnabled = hasMarkdownFeatureImageConsumer(settings);
    const wordCountEnabled = hasMarkdownWordCountConsumer(settings);
    const characterCountEnabled = hasMarkdownCharacterCountConsumer(settings);
    const tasksEnabled = hasMarkdownTaskConsumer(settings);

    return files.filter(file => {
        const record = records.get(file.path);
        // Include files not in database
        if (!record) {
            return true;
        }

        // Include files missing tags
        if (needsTags && file.extension === 'md' && (record.tags === null || record.tagsMtime !== file.stat.mtime)) {
            return true;
        }

        if (needsMarkdownPipeline && markdownPipelineEnabled && file.extension === 'md') {
            const needsPreview = previewEnabled && record.previewStatus === 'unprocessed';
            const cachedMetadata = app?.metadataCache.getFileCache(file) ?? null;
            let needsFeatureImage = featureImageEnabled && (record.featureImageKey === null || record.featureImageStatus === 'unprocessed');
            if (featureImageEnabled && !needsFeatureImage && app) {
                const frontmatter = cachedMetadata?.frontmatter;
                const featureImageExcluded = featureImageExcludeMatcher.matches(frontmatter);
                if (!featureImageExcluded) {
                    const drawingProviderId = getDrawingSourceProviderIdWithFrontmatter(file, frontmatter);
                    const expectedDrawingFeatureImageKey = drawingProviderId
                        ? getDrawingDirectFeatureImageKey(file, drawingProviderId)
                        : null;
                    needsFeatureImage =
                        expectedDrawingFeatureImageKey !== null && record.featureImageKey !== expectedDrawingFeatureImageKey;
                }
            }
            const needsProperties = propertiesEnabled && record.properties === null;
            const needsWordCount = wordCountEnabled && record.wordCount === null;
            const needsCharacterCount =
                characterCountEnabled && (record.characterCountWithSpaces === null || record.characterCountWithoutSpaces === null);
            const needsTasks = tasksEnabled && (record.taskTotal === null || record.taskUnfinished === null);
            const taskCountsFromMetadata = cachedMetadata === null ? null : countMarkdownTasksFromMetadata(cachedMetadata);
            const hasTaskMetadata = cachedMetadata !== null && hasMarkdownTaskMetadata(cachedMetadata);
            const hasTaskCountChanges =
                tasksEnabled &&
                (taskCountsFromMetadata !== null ? !areMarkdownTaskCountsEqual(record, taskCountsFromMetadata) : hasTaskMetadata);
            const needsRefresh = record.markdownPipelineMtime !== file.stat.mtime;
            if (
                needsPreview ||
                needsFeatureImage ||
                needsProperties ||
                needsWordCount ||
                needsCharacterCount ||
                needsTasks ||
                hasTaskCountChanges
            ) {
                return true;
            }

            if (needsRefresh) {
                if (previewEnabled || featureImageEnabled || propertiesEnabled || wordCountEnabled || characterCountEnabled) {
                    return true;
                }

                if (tasksEnabled) {
                    return shouldQueueStaleMarkdownTaskRefresh(record, cachedMetadata);
                }
            }
        }

        // Include files missing metadata or hidden state
        if (needsMetadata && file.extension === 'md') {
            const metadata = record.metadata;
            if (requiresHiddenState && conservativeMetadata) {
                return true;
            }
            if (record.metadataMtime !== file.stat.mtime) {
                return true;
            }
            if (metadata === null) {
                return true;
            }
            if (requiresHiddenState && metadata.hidden === undefined) {
                return true;
            }
        }

        return false;
    });
}

function getFileThumbnailFeatureImageKey(file: TFile): string | null {
    if (isPdfFile(file)) {
        return getLocalFeatureImageKey(file);
    }

    const drawingProviderId = getNonMarkdownDrawingFeatureImageProviderId(file);
    if (!drawingProviderId) {
        return null;
    }

    return getDrawingDirectFeatureImageKey(file, drawingProviderId);
}

export function shouldQueueFileThumbnailProvider(file: TFile): boolean {
    return getFileThumbnailFeatureImageKey(file) !== null;
}

/**
 * Returns non-markdown files that need the file thumbnails provider to run.
 *
 * This resumes forced regeneration across restarts when `fileThumbnailsMtime` was reset without changing FileData.mtime.
 */
export function filterFilesRequiringFileThumbnails(files: TFile[], settings: NotebookNavigatorSettings): TFile[] {
    if (!settings.showFeatureImage || files.length === 0) {
        return [];
    }

    const candidates = files
        .map(file => ({ file, expectedKey: getFileThumbnailFeatureImageKey(file) }))
        .filter((candidate): candidate is { file: TFile; expectedKey: string } => candidate.expectedKey !== null);
    if (candidates.length === 0) {
        return [];
    }

    const db = getDBInstance();
    const records = db.getFiles(candidates.map(({ file }) => file.path));

    return candidates
        .filter(({ file, expectedKey }) => {
            const record = records.get(file.path);
            if (!record) {
                return true;
            }

            const fileMtime = file.stat.mtime;
            if (record.fileThumbnailsMtime !== fileMtime) {
                return true;
            }

            if (record.featureImageStatus === 'unprocessed') {
                return true;
            }

            return record.featureImageKey === null || record.featureImageKey !== expectedKey;
        })
        .map(({ file }) => file);
}
