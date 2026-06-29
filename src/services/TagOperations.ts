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

import type { App, TFile } from 'obsidian';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { ITagTreeProvider } from '../interfaces/ITagTreeProvider';
import type { MetadataService } from './MetadataService';
import type { RenameFile, TagDescriptor } from './tagRename/TagRenameEngine';
import { TagBatchOperations } from './tagOperations/TagBatchOperations';
import { TagDeleteWorkflow, type TagDeleteHooks } from './tagOperations/TagDeleteWorkflow';
import { TagFileMutations } from './tagOperations/TagFileMutations';
import { TagRenameWorkflow, type TagRenameAnalysis, type TagRenameHooks, type TagRenameResult } from './tagOperations/TagRenameWorkflow';
import { TagShortcutMutations } from './tagOperations/TagShortcutMutations';
import type { TagDeleteEventPayload, TagRenameEventPayload } from './tagOperations/types';
import { TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import { resolveDisplayTagPath } from './tagOperations/TagOperationUtils';

export type { TagRenameEventPayload, TagDeleteEventPayload } from './tagOperations/types';

/**
 * Facade for tag operations across the vault
 * Coordinates between different tag operation workflows and services
 */
export class TagOperations {
    private readonly tagRenameListeners = new Set<(payload: TagRenameEventPayload) => void>();
    private readonly tagDeleteListeners = new Set<(payload: TagDeleteEventPayload) => void>();

    private readonly fileMutations: TagFileMutations;
    private readonly batchOperations: TagBatchOperations;
    private readonly shortcutMutations: TagShortcutMutations;
    private readonly renameWorkflow: TagRenameWorkflow;
    private readonly deleteWorkflow: TagDeleteWorkflow;

    constructor(
        private readonly app: App,
        private readonly getSettings: () => NotebookNavigatorSettings,
        private readonly getTagTreeService: () => ITagTreeProvider | null,
        private readonly getMetadataService: () => MetadataService | null
    ) {
        this.fileMutations = new TagFileMutations(this.app, this.getSettings);
        this.batchOperations = new TagBatchOperations(this.fileMutations);
        this.shortcutMutations = new TagShortcutMutations(this.getMetadataService);
        this.renameWorkflow = new TagRenameWorkflow(
            this.app,
            this.fileMutations,
            this.getTagTreeService,
            this.getMetadataService,
            tagPath => this.resolveDisplayTagPath(tagPath),
            () => this.createRenameHooks()
        );
        this.deleteWorkflow = new TagDeleteWorkflow(this.app, this.fileMutations, this.getTagTreeService, this.getMetadataService, () =>
            this.createDeleteHooks()
        );
    }

    /**
     * Registers a listener for tag rename events
     * Returns cleanup function to unsubscribe
     */
    addTagRenameListener(listener: (payload: TagRenameEventPayload) => void): () => void {
        this.tagRenameListeners.add(listener);
        return () => {
            this.tagRenameListeners.delete(listener);
        };
    }

    /**
     * Registers a listener for tag deletion events
     * Returns cleanup function to unsubscribe
     */
    addTagDeleteListener(listener: (payload: TagDeleteEventPayload) => void): () => void {
        this.tagDeleteListeners.add(listener);
        return () => {
            this.tagDeleteListeners.delete(listener);
        };
    }

    async addTagToFiles(tag: string, files: TFile[]): Promise<{ added: number; skipped: number }> {
        return this.batchOperations.addTagToFiles(tag, files);
    }

    getTagsFromFiles(files: TFile[]): string[] {
        return this.batchOperations.getTagsFromFiles(files);
    }

    async removeTagFromFiles(tag: string, files: TFile[]): Promise<number> {
        return this.batchOperations.removeTagFromFiles(tag, files);
    }

    async clearAllTagsFromFiles(files: TFile[]): Promise<number> {
        return this.batchOperations.clearAllTagsFromFiles(files);
    }

    async promptRenameTag(tagPath: string): Promise<void> {
        await this.openRenameModal(tagPath);
    }

    async renameTag(tagPath: string, newTagPath: string): Promise<boolean> {
        if (tagPath === TAGGED_TAG_ID || tagPath === UNTAGGED_TAG_ID) {
            return false;
        }
        return this.renameWorkflow.renameTag(tagPath, newTagPath);
    }

    /**
     * Promotes a nested tag to root level
     * Renames "parent/child" to just "child"
     */
    async promoteTagToRoot(sourceTagPath: string): Promise<void> {
        if (sourceTagPath === TAGGED_TAG_ID || sourceTagPath === UNTAGGED_TAG_ID) {
            return;
        }
        const sourceDisplay = this.resolveDisplayTagPath(sourceTagPath);
        if (!sourceDisplay || sourceDisplay.length === 0 || !sourceDisplay.includes('/')) {
            return;
        }
        const leaf = this.fileMutations.getTagLeaf(sourceDisplay);
        if (leaf.length === 0 || leaf === sourceDisplay) {
            return;
        }
        await this.openRenameModal(sourceDisplay, leaf);
    }

    /**
     * Handles tag rename via drag and drop
     * Moves source tag to become child of target tag
     */
    async renameTagByDrag(sourceTagPath: string, targetTagPath: string): Promise<void> {
        if (targetTagPath === TAGGED_TAG_ID || targetTagPath === UNTAGGED_TAG_ID) {
            return;
        }
        const sourceDisplay = this.resolveDisplayTagPath(sourceTagPath);
        const targetDisplay = this.resolveDisplayTagPath(targetTagPath);
        const leaf = this.fileMutations.getTagLeaf(sourceDisplay);
        const newPath = targetDisplay.length > 0 ? `${targetDisplay}/${leaf}` : leaf;
        if (newPath === sourceDisplay) {
            return;
        }
        await this.openRenameModal(sourceDisplay, newPath);
    }

    async promptDeleteTag(tagPath: string): Promise<void> {
        await this.deleteWorkflow.promptDeleteTag(tagPath);
    }

    private async openRenameModal(tagPath: string, initialValue?: string): Promise<void> {
        await this.renameWorkflow.promptRenameTag(tagPath, initialValue);
    }

    protected resolveDisplayTagPath(tagPath: string): string {
        return resolveDisplayTagPath(tagPath, this.getTagTreeService());
    }

    protected async executeRename(analysis: TagRenameAnalysis): Promise<TagRenameResult> {
        return this.renameWorkflow.executeRename(analysis);
    }

    protected async updateTagMetadataAfterRename(oldTagPath: string, newTagPath: string, preserveDestination: boolean): Promise<void> {
        await this.renameWorkflow.updateTagMetadataAfterRename(oldTagPath, newTagPath, preserveDestination);
    }

    protected async updateTagShortcutsAfterRename(oldTagPath: string, newTagPath: string): Promise<void> {
        await this.shortcutMutations.updateTagShortcutsAfterRename(oldTagPath, newTagPath);
    }

    protected async runTagRename(oldTagPath: string, newTagPath: string, presetTargets?: RenameFile[] | null): Promise<boolean> {
        return this.renameWorkflow.runTagRename(oldTagPath, newTagPath, presetTargets ?? null);
    }

    protected async runTagDelete(tagPath: string, presetPaths?: readonly string[] | null): Promise<boolean> {
        return this.deleteWorkflow.runTagDelete(tagPath, presetPaths);
    }

    protected async deleteTagFromFile(file: TFile, tag: TagDescriptor): Promise<boolean> {
        return this.deleteWorkflow.deleteTagFromFile(file, tag);
    }

    protected async removeTagMetadataAfterDelete(tagPath: string): Promise<void> {
        await this.deleteWorkflow.removeTagMetadataAfterDelete(tagPath);
    }

    protected async removeTagShortcutsAfterDelete(tagPath: string): Promise<void> {
        await this.shortcutMutations.removeTagShortcutsAfterDelete(tagPath);
    }

    /**
     * Creates hook callbacks for tag rename workflow
     * Provides controlled access to internal methods
     */
    private createRenameHooks(): TagRenameHooks {
        return {
            executeRename: analysis => this.executeRename(analysis),
            updateTagMetadataAfterRename: (oldTagPath, newTagPath, preserve) =>
                this.updateTagMetadataAfterRename(oldTagPath, newTagPath, preserve),
            updateTagShortcutsAfterRename: (oldTagPath, newTagPath) => this.updateTagShortcutsAfterRename(oldTagPath, newTagPath),
            notifyTagRenamed: payload => this.notifyTagRenamed(payload)
        };
    }

    /**
     * Creates hook callbacks for tag delete workflow
     * Provides controlled access to internal methods
     */
    private createDeleteHooks(): TagDeleteHooks {
        return {
            deleteTagFromFile: (file, tag) => this.deleteTagFromFile(file, tag),
            removeTagMetadataAfterDelete: tagPath => this.removeTagMetadataAfterDelete(tagPath),
            removeTagShortcutsAfterDelete: tagPath => this.removeTagShortcutsAfterDelete(tagPath),
            notifyTagDeleted: payload => this.notifyTagDeleted(payload),
            resolveDisplayTagPath: tagPath => this.resolveDisplayTagPath(tagPath)
        };
    }

    /**
     * Notifies all registered listeners of a successful tag rename
     * Catches and logs any listener errors to prevent cascading failures
     */
    private notifyTagRenamed(payload: TagRenameEventPayload): void {
        if (this.tagRenameListeners.size === 0) {
            return;
        }
        for (const listener of this.tagRenameListeners) {
            try {
                listener(payload);
            } catch (error) {
                console.error('[Notebook Navigator] Tag rename listener failed', error);
            }
        }
    }

    /**
     * Notifies all registered listeners of a successful tag deletion
     * Catches and logs any listener errors to prevent cascading failures
     */
    private notifyTagDeleted(payload: TagDeleteEventPayload): void {
        if (this.tagDeleteListeners.size === 0) {
            return;
        }
        for (const listener of this.tagDeleteListeners) {
            try {
                listener(payload);
            } catch (error) {
                console.error('[Notebook Navigator] Tag delete listener failed', error);
            }
        }
    }
}
