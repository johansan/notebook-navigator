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
import { LIMITS } from '../../constants/limits';
import { strings } from '../../i18n';
import type { ITagTreeProvider } from '../../interfaces/ITagTreeProvider';
import type { MetadataService } from '../MetadataService';
import {
    collectRenameFiles,
    RenameFile,
    TagDescriptor,
    TagReplacement,
    isDescendantRename,
    type RenameFileSkipReason
} from '../tagRename/TagRenameEngine';
import { TagRenameModal } from '../../modals/TagRenameModal';
import { buildUsageSummary, confirmInlineTagParsingRisk, yieldToEventLoop } from './TagOperationUtils';
import type { TagRenameEventPayload } from './types';
import { TagFileMutations } from './TagFileMutations';
import { showNotice } from '../../utils/noticeUtils';

const RENAME_BATCH_SIZE = LIMITS.operations.metadataMutationYieldBatchSize;

export interface TagRenameAnalysis {
    oldTag: TagDescriptor;
    newTag: TagDescriptor;
    replacement: TagReplacement;
    targets: RenameFile[];
    mergeConflict: [TagDescriptor, TagDescriptor] | null;
}

export interface TagRenameResult {
    renamed: number;
    total: number;
    skipped: number;
    failed: number;
}

export interface TagRenameHooks {
    executeRename: (analysis: TagRenameAnalysis) => Promise<TagRenameResult>;
    updateTagMetadataAfterRename: (oldTagPath: string, newTagPath: string, preserveDestination: boolean) => Promise<void>;
    updateTagShortcutsAfterRename: (oldTagPath: string, newTagPath: string) => Promise<void>;
    notifyTagRenamed: (payload: TagRenameEventPayload) => void;
}

/**
 * Handles the workflow for renaming tags across the vault
 * Includes modal prompt, batch processing, and metadata updates
 */
export class TagRenameWorkflow {
    constructor(
        private readonly app: App,
        private readonly fileMutations: TagFileMutations,
        private readonly getTagTreeService: () => ITagTreeProvider | null,
        private readonly getMetadataService: () => MetadataService | null,
        private readonly resolveDisplayTagPathInternal: (tagPath: string) => string,
        private readonly getHooks: () => TagRenameHooks
    ) {}

    /**
     * Prompts user to rename a tag with validation
     * Shows affected files and prevents invalid renames
     */
    async promptRenameTag(tagPath: string, initialValue?: string): Promise<void> {
        const displayPath = this.resolveDisplayTagPathInternal(tagPath);
        const oldTagDescriptor = new TagDescriptor(displayPath);
        const presetTargets = collectRenameFiles(this.app, oldTagDescriptor);
        const usage = buildUsageSummary(this.app, presetTargets);

        if (usage.total === 0) {
            showNotice(`#${displayPath}: ${strings.listPane.emptyStateNoNotes}`, { variant: 'warning' });
            return;
        }

        const modal = new TagRenameModal(this.app, {
            tagPath: displayPath,
            affectedCount: usage.total,
            sampleFiles: usage.sample,
            initialValue: this.getInitialInputValue(initialValue, displayPath),
            onSubmit: async newName => {
                return this.submitRename(displayPath, oldTagDescriptor, newName, presetTargets);
            }
        });
        modal.open();
    }

    /**
     * Renames a tag from an already-collected target path.
     */
    async renameTag(tagPath: string, newTagPath: string): Promise<boolean> {
        const displayPath = this.resolveDisplayTagPathInternal(tagPath);
        const oldTagDescriptor = new TagDescriptor(displayPath);
        const presetTargets = collectRenameFiles(this.app, oldTagDescriptor);
        const usage = buildUsageSummary(this.app, presetTargets);

        if (usage.total === 0) {
            showNotice(`#${displayPath}: ${strings.listPane.emptyStateNoNotes}`, { variant: 'warning' });
            return false;
        }

        return this.submitRename(displayPath, oldTagDescriptor, newTagPath, presetTargets);
    }

    private async submitRename(
        displayPath: string,
        oldTagDescriptor: TagDescriptor,
        newName: string,
        presetTargets: RenameFile[]
    ): Promise<boolean> {
        const trimmedName = (newName.startsWith('#') ? newName.slice(1) : newName).trim();
        if (!this.fileMutations.isValidTagName(trimmedName)) {
            showNotice(strings.modals.tagOperation.invalidTagName, { variant: 'warning' });
            return false;
        }
        const newDescriptor = new TagDescriptor(trimmedName);
        if (isDescendantRename(oldTagDescriptor, newDescriptor)) {
            showNotice(strings.modals.tagOperation.descendantRenameError, { variant: 'warning' });
            return false;
        }

        const shouldContinue = await confirmInlineTagParsingRisk(this.app, trimmedName);
        if (!shouldContinue) {
            return false;
        }

        return this.runTagRename(displayPath, trimmedName, presetTargets);
    }

    /**
     * Determines the starting value for the rename input
     * Falls back to the current tag path when no override provided
     */
    private getInitialInputValue(initialValue: string | undefined, displayPath: string): string {
        const sourceValue = initialValue ?? displayPath;
        const trimmed = sourceValue.trim();
        if (trimmed.length === 0) {
            return displayPath;
        }
        return trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    }

    /**
     * Analyzes rename operation for conflicts and affected files
     * Detects when rename would merge into existing tags
     */
    private buildRenameAnalysis(oldTagPath: string, newTagPath: string, presetTargets?: RenameFile[] | null): TagRenameAnalysis {
        const oldTag = new TagDescriptor(oldTagPath);
        const newTag = new TagDescriptor(newTagPath);
        const replacement = new TagReplacement(oldTag, newTag);
        const tagTree = this.getTagTreeService();
        const targets = presetTargets ?? collectRenameFiles(this.app, oldTag);
        const existingTags = tagTree ? tagTree.getAllTagPaths().map(path => `#${path}`) : [];
        const mergeConflict = existingTags.length > 0 ? replacement.willMergeTags(existingTags) : null;
        return { oldTag, newTag, replacement, targets, mergeConflict };
    }

    /**
     * Executes rename operation on all affected files in batches
     * Yields to event loop periodically to avoid blocking UI
     */
    async executeRename(analysis: TagRenameAnalysis): Promise<TagRenameResult> {
        const conflict = analysis.mergeConflict;
        if (conflict) {
            const [origin, clash] = conflict;
            showNotice(`${origin.tag} merges into ${clash.tag}`, { variant: 'warning' });
        }

        let renamed = 0;
        let skipped = 0;
        let failed = 0;

        // Skips are expected when the underlying file changes between the tree snapshot
        // and the actual vault read/modify step. The workflow aggregates them for a single
        // summary notice instead of emitting a notice per file.
        const skippedByReason: Record<RenameFileSkipReason, number> = {
            'file-missing': 0,
            'file-changed': 0,
            'no-op': 0
        };
        const skippedSamples: Record<RenameFileSkipReason, string[]> = {
            'file-missing': [],
            'file-changed': [],
            'no-op': []
        };
        const pushSample = (bucket: string[], value: string): void => {
            if (bucket.length >= 8) {
                return;
            }
            bucket.push(value);
        };

        for (let index = 0; index < analysis.targets.length; index++) {
            const target = analysis.targets[index];
            try {
                const applyResult = await target.renamed(analysis.replacement);
                if (applyResult.outcome === 'changed') {
                    renamed += 1;
                } else {
                    skipped += 1;
                    skippedByReason[applyResult.reason] += 1;
                    pushSample(skippedSamples[applyResult.reason], target.filePath);
                }
            } catch (error: unknown) {
                failed += 1;
                console.error(`[Notebook Navigator] Failed to rename tag in ${target.filePath}`, error);
            }
            if ((index + 1) % RENAME_BATCH_SIZE === 0) {
                await yieldToEventLoop();
            }
        }

        if (skipped > 0) {
            console.warn('[Notebook Navigator] Tag rename skipped files', {
                skipped,
                total: analysis.targets.length,
                skippedByReason,
                samples: skippedSamples
            });
        }

        return { renamed, total: analysis.targets.length, skipped, failed };
    }

    /**
     * Updates tag metadata (colors, icons) after rename
     * Preserves destination metadata when merging tags
     */
    async updateTagMetadataAfterRename(oldTagPath: string, newTagPath: string, preserveDestination: boolean): Promise<void> {
        const metadataService = this.getMetadataService();
        if (!metadataService) {
            return;
        }

        const trimmedOld = oldTagPath.trim();
        const trimmedNew = newTagPath.trim();
        if (trimmedOld.length === 0 || trimmedNew.length === 0 || trimmedOld === trimmedNew) {
            return;
        }

        try {
            await metadataService.handleTagRename(trimmedOld, trimmedNew, preserveDestination);
        } catch (error) {
            console.error('[Notebook Navigator] Failed to update tag metadata after rename', error);
        }
    }

    /**
     * Runs the complete tag rename workflow
     * Validates, executes rename, updates metadata and notifies listeners
     */
    async runTagRename(oldTagPath: string, newTagPath: string, presetTargets: RenameFile[] | null = null): Promise<boolean> {
        const hooks = this.getHooks();
        const analysis = this.buildRenameAnalysis(oldTagPath, newTagPath, presetTargets);

        if (isDescendantRename(analysis.oldTag, analysis.newTag)) {
            showNotice(strings.modals.tagOperation.descendantRenameError, { variant: 'warning' });
            return false;
        }

        if (analysis.oldTag.tag === analysis.newTag.tag) {
            showNotice(strings.modals.tagOperation.renameUnchanged.replace('{tag}', analysis.oldTag.tag), { variant: 'warning' });
            return false;
        }

        if (analysis.targets.length === 0) {
            showNotice(`#${analysis.oldTag.name}: ${strings.listPane.emptyStateNoNotes}`, { variant: 'warning' });
            return false;
        }

        const result = await hooks.executeRename(analysis);

        const hasFileIssues = result.skipped > 0 || result.failed > 0;
        const formatBatchNotFinalizedSummary = (): string => {
            const notUpdated = result.skipped + result.failed;
            // This notice is shown when at least one file was skipped or failed. It avoids
            // finalizing tag metadata/shortcuts, because those follow-up operations assume
            // the vault edits were applied to every target file.
            return strings.modals.tagOperation.renameBatchNotFinalized
                .replace('{renamed}', result.renamed.toString())
                .replace('{total}', result.total.toString())
                .replace('{notUpdated}', notUpdated.toString());
        };

        if (result.renamed === 0) {
            // No files were updated; keep the rename modal open so the user can retry
            // without reopening the context menu.
            const summary = hasFileIssues
                ? formatBatchNotFinalizedSummary()
                : strings.modals.tagOperation.renameNoChanges
                      .replace('{oldTag}', analysis.oldTag.tag)
                      .replace('{newTag}', analysis.newTag.tag)
                      .replace('{countLabel}', strings.listPane.emptyStateNoNotes);

            const withConsoleHint =
                hasFileIssues && result.failed > 0 ? `${summary} ${strings.modals.tagOperation.checkConsoleForDetails}` : summary;

            showNotice(
                `${strings.modals.tagOperation.confirmRename}: ${analysis.oldTag.tag} → ${analysis.newTag.tag}. ${withConsoleHint}`,
                {
                    variant: 'warning'
                }
            );
            return false;
        }

        if (hasFileIssues) {
            const summary = formatBatchNotFinalizedSummary();
            const withConsoleHint = result.failed > 0 ? `${summary} ${strings.modals.tagOperation.checkConsoleForDetails}` : summary;

            // Some files changed, but the batch did not fully apply across all targets.
            // Close the modal and show a warning summary; the vault is now in a mixed state.
            showNotice(
                `${strings.modals.tagOperation.confirmRename}: ${analysis.oldTag.tag} → ${analysis.newTag.tag}. ${withConsoleHint}`,
                {
                    variant: 'warning'
                }
            );
            return true;
        }

        await hooks.updateTagMetadataAfterRename(analysis.oldTag.name, analysis.newTag.name, Boolean(analysis.mergeConflict));
        await hooks.updateTagShortcutsAfterRename(analysis.oldTag.name, analysis.newTag.name);

        hooks.notifyTagRenamed({
            oldPath: analysis.oldTag.name,
            newPath: analysis.newTag.name,
            oldCanonicalPath: analysis.oldTag.canonicalName,
            newCanonicalPath: analysis.newTag.canonicalName,
            mergedIntoExisting: Boolean(analysis.mergeConflict)
        });

        showNotice(
            `${strings.modals.tagOperation.confirmRename}: ${analysis.oldTag.tag} → ${analysis.newTag.tag} (${result.renamed}/${result.total})`,
            { variant: 'success' }
        );
        return true;
    }
}
