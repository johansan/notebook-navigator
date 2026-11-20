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
import type { App } from 'obsidian';
import { LIMITS } from '../../constants/limits';
import { strings } from '../../i18n';
import type { ITagTreeProvider } from '../../interfaces/ITagTreeProvider';
import type { MetadataService } from '../MetadataService';
import { ConfirmModal } from '../../modals/ConfirmModal';
import { TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../../types';
import { TagDescriptor } from '../tagRename/TagRenameEngine';
import { TagFileMutations } from './TagFileMutations';
import { collectPreviewPaths, yieldToEventLoop, buildUsageSummaryFromPaths } from './TagOperationUtils';
import type { TagDeleteEventPayload } from './types';
import { runAsyncAction } from '../../utils/async';
import { showNotice } from '../../utils/noticeUtils';
import { renderAffectedFilesPreview } from '../operations/OperationBatchUtils';

const DELETE_BATCH_SIZE = LIMITS.operations.metadataMutationYieldBatchSize;
const DELETE_SAMPLE_LIMIT = 8;

type TagDeleteSkipReason = 'file-missing' | 'not-markdown' | 'no-op';

export interface TagDeleteHooks {
    deleteTagFromFile: (file: TFile, tag: TagDescriptor) => Promise<boolean>;
    removeTagMetadataAfterDelete: (tagPath: string) => Promise<void>;
    removeTagShortcutsAfterDelete: (tagPath: string) => Promise<void>;
    notifyTagDeleted: (payload: TagDeleteEventPayload) => void;
    resolveDisplayTagPath: (tagPath: string) => string;
}

/**
 * Handles the workflow for deleting tags from the vault
 * Includes modal confirmation, batch deletion, and metadata cleanup
 */
export class TagDeleteWorkflow {
    constructor(
        private readonly app: App,
        private readonly fileMutations: TagFileMutations,
        private readonly getTagTreeService: () => ITagTreeProvider | null,
        private readonly getMetadataService: () => MetadataService | null,
        private readonly getHooks: () => TagDeleteHooks
    ) {}

    /**
     * Prompts user to confirm tag deletion with a modal
     * Shows affected files and handles special tag IDs
     */
    async promptDeleteTag(tagPath: string): Promise<void> {
        if (tagPath === TAGGED_TAG_ID || tagPath === UNTAGGED_TAG_ID) {
            return;
        }

        const hooks = this.getHooks();
        const tagTree = this.getTagTreeService();
        const displayPath = hooks.resolveDisplayTagPath(tagPath);
        if (displayPath.length === 0) {
            return;
        }

        const descriptor = new TagDescriptor(displayPath);
        const previewPaths = collectPreviewPaths(this.app, descriptor, tagTree, this.fileMutations.getTagSource());

        const uniquePreview = Array.from(new Set(previewPaths));
        const usage = buildUsageSummaryFromPaths(this.app, uniquePreview);
        if (usage.total === 0) {
            showNotice(`#${displayPath}: ${strings.listPane.emptyStateNoNotes}`, { variant: 'warning' });
            return;
        }

        const countLabel = usage.total === 1 ? strings.modals.tagOperation.file : strings.modals.tagOperation.files;
        const modal = new ConfirmModal(
            this.app,
            strings.modals.tagOperation.deleteTitle.replace('{tag}', `#${displayPath}`),
            strings.modals.tagOperation.deleteWarning
                .replace('{tag}', `#${displayPath}`)
                .replace('{count}', usage.total.toString())
                .replace('{files}', countLabel),
            () => {
                // Execute tag deletion with error handling using latest tag data
                runAsyncAction(() => this.runTagDelete(displayPath));
            },
            strings.modals.tagOperation.confirmDelete,
            {
                buildContent: container => renderAffectedFilesPreview(container, usage)
            }
        );
        modal.open();
    }

    /**
     * Executes tag deletion from files in batches
     * Removes tag and all descendant tags, updates metadata and shortcuts
     */
    async runTagDelete(tagPath: string, presetPaths?: readonly string[] | null): Promise<boolean> {
        const hooks = this.getHooks();
        const descriptor = new TagDescriptor(tagPath);
        const targetPathsSet = new Set<string>();

        if (presetPaths && presetPaths.length > 0) {
            presetPaths.forEach(path => {
                if (typeof path === 'string' && path.length > 0) {
                    targetPathsSet.add(path);
                }
            });
        } else {
            const tagTree = this.getTagTreeService();
            const previewPaths = collectPreviewPaths(this.app, descriptor, tagTree, this.fileMutations.getTagSource());
            previewPaths.forEach(path => {
                if (typeof path === 'string' && path.length > 0) {
                    targetPathsSet.add(path);
                }
            });
        }

        if (targetPathsSet.size === 0) {
            showNotice(`#${descriptor.name}: ${strings.listPane.emptyStateNoNotes}`, { variant: 'warning' });
            return false;
        }

        const totalTargets = targetPathsSet.size;
        let removed = 0;
        let skipped = 0;
        let failed = 0;
        let processed = 0;

        // Skips represent paths that were part of the tag snapshot, but where the vault mutation
        // could not be applied safely at execution time (file removed, file type changed, or
        // the file no longer contains the expected tag).
        const skippedByReason: Record<TagDeleteSkipReason, number> = {
            'file-missing': 0,
            'not-markdown': 0,
            'no-op': 0
        };
        const skippedSamples: Record<TagDeleteSkipReason, string[]> = {
            'file-missing': [],
            'not-markdown': [],
            'no-op': []
        };
        const pushSample = (bucket: string[], value: string): void => {
            if (bucket.length >= DELETE_SAMPLE_LIMIT) {
                return;
            }
            bucket.push(value);
        };

        for (const path of targetPathsSet) {
            processed += 1;
            const abstract = this.app.vault.getAbstractFileByPath(path);
            if (!(abstract instanceof TFile)) {
                skipped += 1;
                skippedByReason['file-missing'] += 1;
                pushSample(skippedSamples['file-missing'], path);
            } else if (!this.fileMutations.isMarkdownFile(abstract)) {
                skipped += 1;
                skippedByReason['not-markdown'] += 1;
                pushSample(skippedSamples['not-markdown'], abstract.path);
            } else {
                try {
                    if (await hooks.deleteTagFromFile(abstract, descriptor)) {
                        removed += 1;
                    } else {
                        skipped += 1;
                        skippedByReason['no-op'] += 1;
                        pushSample(skippedSamples['no-op'], abstract.path);
                    }
                } catch (error) {
                    failed += 1;
                    console.error(`[Notebook Navigator] Failed to delete tag ${descriptor.tag} in ${path}`, error);
                }
            }

            if (processed % DELETE_BATCH_SIZE === 0) {
                await yieldToEventLoop();
            }
        }

        if (skipped > 0) {
            console.warn('[Notebook Navigator] Tag delete skipped files', {
                skipped,
                total: totalTargets,
                skippedByReason,
                samples: skippedSamples
            });
        }

        const hasFileIssues = skipped > 0 || failed > 0;
        const formatBatchNotFinalizedSummary = (): string => {
            const notUpdated = skipped + failed;
            // This notice is shown when at least one file was skipped or failed. It avoids
            // finalizing tag metadata/shortcuts, because those follow-up operations assume
            // the vault edits were applied to every target file.
            return strings.modals.tagOperation.deleteBatchNotFinalized
                .replace('{removed}', removed.toString())
                .replace('{total}', totalTargets.toString())
                .replace('{notUpdated}', notUpdated.toString());
        };

        if (removed === 0) {
            const summary = hasFileIssues ? formatBatchNotFinalizedSummary() : strings.fileSystem.notifications.noTagsToRemove;
            const withConsoleHint =
                hasFileIssues && failed > 0 ? `${summary} ${strings.modals.tagOperation.checkConsoleForDetails}` : summary;

            showNotice(`${strings.modals.tagOperation.confirmDelete}: ${descriptor.tag}. ${withConsoleHint}`, { variant: 'warning' });
            return false;
        }

        if (hasFileIssues) {
            const summary = formatBatchNotFinalizedSummary();
            const withConsoleHint = failed > 0 ? `${summary} ${strings.modals.tagOperation.checkConsoleForDetails}` : summary;

            // Some files changed, but the batch did not fully apply across all targets.
            // The vault is now in a mixed state, so metadata/shortcuts are not finalized.
            showNotice(`${strings.modals.tagOperation.confirmDelete}: ${descriptor.tag}. ${withConsoleHint}`, { variant: 'warning' });
            return true;
        }

        await hooks.removeTagMetadataAfterDelete(descriptor.name);
        await hooks.removeTagShortcutsAfterDelete(descriptor.name);

        hooks.notifyTagDeleted({
            path: descriptor.name,
            canonicalPath: descriptor.canonicalName
        });

        if (removed === 1) {
            showNotice(strings.fileSystem.notifications.tagRemovedFromNote, { variant: 'success' });
        } else {
            showNotice(strings.fileSystem.notifications.tagRemovedFromNotes.replace('{count}', removed.toString()), {
                variant: 'success'
            });
        }

        return true;
    }

    /**
     * Deletes a tag and its descendants from a single file
     * Removes from frontmatter, and from inline content unless the tag source is `frontmatter`
     */
    async deleteTagFromFile(file: TFile, tag: TagDescriptor): Promise<boolean> {
        if (!this.fileMutations.isMarkdownFile(file)) {
            return false;
        }

        const normalizedTarget = tag.canonicalName;
        if (normalizedTarget.length === 0) {
            return false;
        }

        const descendants = this.fileMutations.collectDescendantTags(file, tag.name);
        const normalizedDescendants = descendants?.normalizedSet ?? new Set<string>();
        const descendantTags = descendants?.tags ?? [];

        const targets = new Set<string>(normalizedDescendants);
        targets.add(normalizedTarget);

        const inlineTags = descendantTags.length > 0 ? [tag.name, ...descendantTags] : [tag.name];
        return this.fileMutations.stripTagsFromFile(
            file,
            candidate => targets.has(candidate),
            inlineTags,
            'remove tag hierarchy from frontmatter'
        );
    }

    /**
     * Removes tag metadata entries after deletion
     * Cleans up tag colors, icons, and other metadata
     */
    async removeTagMetadataAfterDelete(tagPath: string): Promise<void> {
        const metadataService = this.getMetadataService();
        if (!metadataService) {
            return;
        }

        const trimmedPath = tagPath.trim();
        if (trimmedPath.length === 0) {
            return;
        }

        try {
            await metadataService.handleTagDelete(trimmedPath);
        } catch (error) {
            console.error('[Notebook Navigator] Failed to remove tag metadata after delete', error);
        }
    }
}
