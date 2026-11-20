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
import { LIMITS } from '../../constants/limits';
import { type ContentProviderType } from '../../interfaces/IContentProvider';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { FileData } from '../../storage/IndexedDBStorage';
import { getDBInstance } from '../../storage/fileOperations';
import { markTagSourceCacheCurrent } from '../../utils/tagSourceCache';
import { extractFileTagsFromRawTags, getMetadataTags } from '../../utils/tagUtils';
import { BaseContentProvider, type ContentProviderProcessResult } from './BaseContentProvider';

/**
 * Content provider for extracting tags from files
 */
export class TagContentProvider extends BaseContentProvider {
    // When tags are regenerated due to a metadata-only change, `markFilesForRegeneration()` resets `tagsMtime` to 0.
    // If Obsidian has not populated tags in the metadata cache yet, defer clearing existing tags for a few retries.
    // Tracks consecutive empty-tag reads for files with `tagsMtime === 0`.
    // Returning `processed:false` triggers BaseContentProvider retry scheduling.
    private readonly emptyTagRetryCounts = new Map<string, number>();

    getContentType(): ContentProviderType {
        return 'tags';
    }

    getRelevantSettings(): (keyof NotebookNavigatorSettings)[] {
        return ['showTags', 'tagSource'];
    }

    shouldRegenerate(oldSettings: NotebookNavigatorSettings, newSettings: NotebookNavigatorSettings): boolean {
        // Clear if tags are disabled
        if (!newSettings.showTags && oldSettings.showTags) {
            return true;
        }

        // Regenerate if tags are enabled and weren't before
        if (newSettings.showTags && !oldSettings.showTags) {
            return true;
        }

        // Clearing to null instead of resetting tagsMtime, because the empty-tag retry below would keep body tags
        // that the new source no longer reads until its retries run out.
        if (newSettings.showTags && newSettings.tagSource !== oldSettings.tagSource) {
            return true;
        }

        return false;
    }

    async clearContent(context?: { oldSettings: NotebookNavigatorSettings; newSettings: NotebookNavigatorSettings }): Promise<void> {
        const db = getDBInstance();
        await db.batchClearAllFileContent('tags');
        this.emptyTagRetryCounts.clear();
        if (context) {
            // Recorded after the clear, so a restart in between still finds a mismatch and clears again
            markTagSourceCacheCurrent(context.newSettings.tagSource);
        }
    }

    protected needsProcessing(fileData: FileData | null, file: TFile, settings: NotebookNavigatorSettings): boolean {
        if (!settings.showTags) {
            return false;
        }

        if (file.extension !== 'md') {
            return false;
        }

        const needsRefresh = fileData !== null && fileData.tagsMtime !== file.stat.mtime;
        return !fileData || fileData.tags === null || needsRefresh;
    }

    protected async processFile(
        job: { file: TFile; path: string },
        fileData: FileData | null,
        settings: NotebookNavigatorSettings
    ): Promise<ContentProviderProcessResult> {
        if (!settings.showTags) {
            return { update: null, processed: true };
        }

        if (job.file.extension !== 'md') {
            return { update: null, processed: true };
        }

        try {
            const metadata = this.app.metadataCache.getFileCache(job.file);
            if (!metadata) {
                this.emptyTagRetryCounts.delete(job.path);
                return { update: null, processed: false };
            }

            const rawTags = getMetadataTags(metadata, settings.tagSource);
            const tags = extractFileTagsFromRawTags(rawTags);

            const shouldDeferExistingTagClearing =
                fileData !== null && fileData.tagsMtime === 0 && fileData.tags !== null && fileData.tags.length > 0 && tags.length === 0;
            const shouldDeferInitialEmptyTags =
                fileData !== null &&
                fileData.tagsMtime === 0 &&
                fileData.tags === null &&
                tags.length === 0 &&
                Date.now() - job.file.stat.mtime <= LIMITS.contentProvider.metadataCache.recentFileWindowMs;
            const shouldDeferClearing = shouldDeferExistingTagClearing || shouldDeferInitialEmptyTags;

            if (!shouldDeferClearing) {
                this.emptyTagRetryCounts.delete(job.path);
            }

            if (shouldDeferClearing) {
                const attempts = this.emptyTagRetryCounts.get(job.path) ?? 0;
                if (attempts < LIMITS.contentProvider.metadataCache.emptyValueRetryLimit) {
                    this.emptyTagRetryCounts.set(job.path, attempts + 1);
                    return { update: null, processed: false };
                }

                this.emptyTagRetryCounts.delete(job.path);
            }

            // Only return update if tags changed
            if (fileData && this.tagsEqual(fileData.tags, tags)) {
                return { update: null, processed: true };
            }

            return { update: { path: job.path, tags }, processed: true };
        } catch (error) {
            console.error(`Error extracting tags for ${job.path}:`, error);
            return { update: null, processed: false };
        }
    }

    /**
     * Check if two tag arrays are equal.
     * Handles null values properly.
     *
     * @param tags1 - First tag array (can be null)
     * @param tags2 - Second tag array (can be null)
     * @returns True if tags are equal
     */
    private tagsEqual(tags1: string[] | null, tags2: string[] | null): boolean {
        if (tags1 === tags2) return true; // Both null or same reference
        if (tags1 === null || tags2 === null) return false; // One is null
        if (tags1.length !== tags2.length) return false;
        return tags1.every((tag, i) => tag === tags2[i]);
    }
}
