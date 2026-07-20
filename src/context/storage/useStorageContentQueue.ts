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

import { useCallback, type MutableRefObject } from 'react';
import { App, TFile } from 'obsidian';
import type { ContentProviderType, FileContentType } from '../../interfaces/IContentProvider';
import type { ContentProviderRegistry } from '../../services/content/ContentProviderRegistry';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { getDBInstance } from '../../storage/fileOperations';
import {
    filterFilesRequiringFileThumbnails,
    filterFilesRequiringMetadataSources,
    shouldQueueFileThumbnailProvider
} from '../storageQueueFilters';
import { getMetadataDependentTypes } from './storageContentTypes';
import { getMarkdownPipelineContentTypes } from '../../utils/markdownPipelineContentTypes';

/**
 * Queues files for derived-content generation.
 *
 * This hook is responsible for deciding which files should be handed to the `ContentProviderRegistry`.
 * It separates:
 * - Markdown files, which are often gated by Obsidian metadata cache readiness.
 * - Non-markdown feature-image files, which only need the thumbnail provider when feature images are enabled.
 */
export function useStorageContentQueue(params: {
    app: App;
    contentRegistryRef: MutableRefObject<ContentProviderRegistry | null>;
    queueMetadataContentWhenReady: (
        files: TFile[],
        includeTypes?: ContentProviderType[],
        settingsOverride?: NotebookNavigatorSettings
    ) => void;
}): {
    queueIndexableFilesForContentGeneration: (files: TFile[], settings: NotebookNavigatorSettings) => { markdownFiles: TFile[] };
    queueIndexableFilesNeedingContentGeneration: (filesToCheck: TFile[], allFiles: TFile[], settings: NotebookNavigatorSettings) => void;
} {
    const { app, contentRegistryRef, queueMetadataContentWhenReady } = params;

    const queueIndexableFilesForContentGeneration = useCallback(
        (files: TFile[], settings: NotebookNavigatorSettings): { markdownFiles: TFile[] } => {
            const registry = contentRegistryRef.current;
            if (!registry || files.length === 0) {
                return { markdownFiles: [] };
            }

            const markdownFiles: TFile[] = [];
            const fileThumbnailFiles: TFile[] = [];

            for (const file of files) {
                if (file.extension === 'md') {
                    markdownFiles.push(file);
                    continue;
                }
                if (shouldQueueFileThumbnailProvider(file)) {
                    fileThumbnailFiles.push(file);
                }
            }

            // Markdown processing is metadata-gated via queueMetadataContentWhenReady().

            if (settings.showFeatureImage && fileThumbnailFiles.length > 0) {
                registry.queueFilesForAllProviders(fileThumbnailFiles, settings, { include: ['fileThumbnails'] });
            }

            return { markdownFiles };
        },
        [contentRegistryRef]
    );

    const queueIndexableFilesNeedingContentGeneration = useCallback(
        (filesToCheck: TFile[], allFiles: TFile[], settings: NotebookNavigatorSettings) => {
            if (!contentRegistryRef.current) {
                return;
            }

            const metadataDependentTypes = getMetadataDependentTypes(settings);

            let filesToProcess: TFile[] = [];

            try {
                const markdownFiles = filesToCheck.filter(file => file.extension === 'md');
                const markdownFilesNeedingContent =
                    metadataDependentTypes.length > 0
                        ? filterFilesRequiringMetadataSources(markdownFiles, metadataDependentTypes, settings, {
                              // Treat missing metadata cache entries as "needs work". This prevents a file from
                              // being skipped just because its metadata hasn't been indexed yet.
                              conservativeMetadata: true,
                              app
                          })
                        : [];

                const filesNeedingThumbnails = filterFilesRequiringFileThumbnails(filesToCheck, settings);

                const uniqueByPath = new Map<string, TFile>();
                for (const file of [...markdownFilesNeedingContent, ...filesNeedingThumbnails]) {
                    uniqueByPath.set(file.path, file);
                }
                filesToProcess = Array.from(uniqueByPath.values());

                if (filesToProcess.length === 0) {
                    // `calculateFileDiff()` only returns changed files. When content settings change, there may be
                    // no "changed files" but still pending derived content in the database. Fall back to checking
                    // the database for any missing content types.
                    const db = getDBInstance();
                    const contentTypesToCheck: FileContentType[] = getMarkdownPipelineContentTypes(settings);
                    if (metadataDependentTypes.includes('tags')) {
                        contentTypesToCheck.push('tags');
                    }
                    if (metadataDependentTypes.includes('metadata')) {
                        contentTypesToCheck.push('metadata');
                    }

                    const pathsNeedingContent = db.getFilesNeedingAnyContent(contentTypesToCheck);

                    if (pathsNeedingContent.size > 0) {
                        filesToProcess = allFiles.filter(file => pathsNeedingContent.has(file.path));
                    }
                }
            } catch (error: unknown) {
                console.error('Failed to check content needs from IndexedDB:', error);
            }

            if (filesToProcess.length === 0) {
                return;
            }

            const { markdownFiles } = queueIndexableFilesForContentGeneration(filesToProcess, settings);
            if (metadataDependentTypes.length > 0) {
                queueMetadataContentWhenReady(markdownFiles, metadataDependentTypes, settings);
            }
        },
        [app, contentRegistryRef, queueIndexableFilesForContentGeneration, queueMetadataContentWhenReady]
    );

    return { queueIndexableFilesForContentGeneration, queueIndexableFilesNeedingContentGeneration };
}
