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

import { App } from 'obsidian';
import type { AlphaSortOrder, ListSortOverrideValue, NotebookNavigatorSettings } from '../../settings';
import { ItemType, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../../types';
import { ISettingsProvider } from '../../interfaces/ISettingsProvider';
import { ITagTreeProvider } from '../../interfaces/ITagTreeProvider';
import { BaseMetadataService } from './BaseMetadataService';
import type { CleanupValidators } from '../MetadataService';
import { TagTreeNode } from '../../types/storage';
import { normalizeTagPath } from '../../utils/tagUtils';
import {
    cleanupCollapsedPinnedContextKeys,
    deleteCollapsedPinnedContextKeys,
    hasCollapsedPinnedContextKeys,
    updateCollapsedPinnedContextKeys
} from '../../utils/recordUtils';
import {
    hasHiddenFileTagMatch,
    hasHiddenTagMatch,
    removeHiddenFileTagPrefixMatches,
    removeHiddenTagPrefixMatches,
    updateHiddenFileTagPrefixMatches,
    updateHiddenTagPrefixMatches
} from '../../utils/vaultProfiles';

type SettingsMutation = (settings: NotebookNavigatorSettings) => boolean;

function isValidCollapsedPinnedTagContext(path: string, realTagValidator: (path: string) => boolean): boolean {
    return path === TAGGED_TAG_ID || path === UNTAGGED_TAG_ID || realTagValidator(path);
}

export interface TagColorData {
    color?: string;
    background?: string;
}

/**
 * Service for managing tag-specific metadata operations
 * Handles tag colors, icons, sort overrides, and cleanup operations
 */
export class TagMetadataService extends BaseMetadataService {
    constructor(
        app: App,
        settingsProvider: ISettingsProvider,
        private getTagTreeProvider: () => ITagTreeProvider | null
    ) {
        super(app, settingsProvider);
    }
    /**
     * Sets a custom color for a tag
     * @param tagPath - Path of the tag (e.g., "inbox/processing")
     * @param color - CSS color value
     */
    async setTagColor(tagPath: string, color: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.setEntityColor(ItemType.TAG, normalized, color);
    }

    /**
     * Sets a custom background color for a tag
     * @param tagPath - Path of the tag
     * @param color - CSS color value
     */
    async setTagBackgroundColor(tagPath: string, color: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.setEntityBackgroundColor(ItemType.TAG, normalized, color);
    }

    /**
     * Removes the custom color from a tag
     * @param tagPath - Path of the tag
     */
    async removeTagColor(tagPath: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.removeEntityColor(ItemType.TAG, normalized);
    }

    /**
     * Removes the custom background color from a tag
     * @param tagPath - Path of the tag
     */
    async removeTagBackgroundColor(tagPath: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.removeEntityBackgroundColor(ItemType.TAG, normalized);
    }

    // Resolves tag color/background once, optionally inheriting from ancestor tags when enabled.
    // Uses a shared ancestor traversal so callers can request one or both variants without duplicating work.
    private resolveTagColorData(normalizedTagPath: string, includeColor: boolean, includeBackground: boolean): TagColorData {
        let resolvedColor = includeColor ? this.getEntityColor(ItemType.TAG, normalizedTagPath) : undefined;
        let resolvedBackground = includeBackground ? this.getEntityBackgroundColor(ItemType.TAG, normalizedTagPath) : undefined;

        const shouldInherit =
            this.settingsProvider.settings.inheritTagColors &&
            ((includeColor && !resolvedColor) || (includeBackground && !resolvedBackground));

        if (!shouldInherit) {
            return {
                color: resolvedColor,
                background: resolvedBackground
            };
        }

        let ancestorPath = normalizedTagPath;
        while (ancestorPath.includes('/')) {
            const separatorIndex = ancestorPath.lastIndexOf('/');
            if (separatorIndex <= 0) {
                break;
            }

            ancestorPath = ancestorPath.slice(0, separatorIndex);

            if (includeColor && !resolvedColor) {
                const ancestorColor = this.getEntityColor(ItemType.TAG, ancestorPath);
                if (ancestorColor) {
                    resolvedColor = ancestorColor;
                }
            }

            if (includeBackground && !resolvedBackground) {
                const ancestorBackground = this.getEntityBackgroundColor(ItemType.TAG, ancestorPath);
                if (ancestorBackground) {
                    resolvedBackground = ancestorBackground;
                }
            }

            if ((!includeColor || resolvedColor) && (!includeBackground || resolvedBackground)) {
                break;
            }
        }

        return {
            color: resolvedColor,
            background: resolvedBackground
        };
    }

    getTagColorData(tagPath: string): TagColorData {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return {};
        }
        // Returns resolved values including inheritance settings.
        return this.resolveTagColorData(normalized, true, true);
    }

    /**
     * Gets the custom color for a tag, checking ancestors if not directly set
     * @param tagPath - Path of the tag
     * @returns The color value or undefined
     */
    getTagColor(tagPath: string): string | undefined {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return undefined;
        }
        return this.resolveTagColorData(normalized, true, false).color;
    }

    /**
     * Gets the custom background color for a tag, checking ancestors if not directly set
     * @param tagPath - Path of the tag
     * @returns The background color value or undefined
     */
    getTagBackgroundColor(tagPath: string): string | undefined {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return undefined;
        }
        return this.resolveTagColorData(normalized, false, true).background;
    }

    /**
     * Sets a custom icon for a tag
     * @param tagPath - Path of the tag (e.g., "inbox/processing")
     * @param iconId - Lucide icon identifier
     */
    async setTagIcon(tagPath: string, iconId: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.setEntityIcon(ItemType.TAG, normalized, iconId);
    }

    /**
     * Removes the custom icon from a tag
     * @param tagPath - Path of the tag
     */
    async removeTagIcon(tagPath: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.removeEntityIcon(ItemType.TAG, normalized);
    }

    /**
     * Gets the custom icon for a tag
     * @param tagPath - Path of the tag
     * @returns The icon ID or undefined
     */
    getTagIcon(tagPath: string): string | undefined {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return undefined;
        }
        return this.getEntityIcon(ItemType.TAG, normalized);
    }

    /**
     * Sets a custom sort order for a tag
     * @param tagPath - Path of the tag
     * @param sortOverride - Sort override to apply
     */
    async setTagSortOverride(tagPath: string, sortOverride: ListSortOverrideValue): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.setEntitySortOverride(ItemType.TAG, normalized, sortOverride);
    }

    /**
     * Removes the custom sort order from a tag
     * @param tagPath - Path of the tag
     */
    async removeTagSortOverride(tagPath: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.removeEntitySortOverride(ItemType.TAG, normalized);
    }

    /**
     * Gets the sort override for a tag
     * @param tagPath - Path of the tag
     * @returns The sort override or undefined
     */
    getTagSortOverride(tagPath: string): ListSortOverrideValue | undefined {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return undefined;
        }
        return this.getEntitySortOverride(ItemType.TAG, normalized);
    }

    /**
     * Sets a custom alphabetical sort order for the tag's child tags in the navigation pane.
     */
    async setTagChildSortOrderOverride(tagPath: string, sortOrder: AlphaSortOrder): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.setEntityChildSortOrderOverride(ItemType.TAG, normalized, sortOrder);
    }

    /**
     * Removes the custom child tag sort order from a tag.
     */
    async removeTagChildSortOrderOverride(tagPath: string): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return Promise.resolve();
        }
        return this.removeEntityChildSortOrderOverride(ItemType.TAG, normalized);
    }

    /**
     * Gets the child sort order override for a tag.
     */
    getTagChildSortOrderOverride(tagPath: string): AlphaSortOrder | undefined {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            return undefined;
        }
        return this.getEntityChildSortOrderOverride(ItemType.TAG, normalized);
    }

    /**
     * Checks if metadata exists for a tag path or any of its descendants.
     */
    private hasTagMetadataForPath(settings: NotebookNavigatorSettings, path: string): boolean {
        const prefix = `${path}/`;
        const records: (Record<string, unknown> | undefined)[] = [
            settings.tagColors,
            settings.tagBackgroundColors,
            settings.tagIcons,
            settings.tagSortOverrides,
            settings.tagTreeSortOverrides,
            settings.tagAppearances
        ];

        for (const record of records) {
            if (!record) {
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(record, path)) {
                return true;
            }
            for (const key in record) {
                if (key.startsWith(prefix)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Removes metadata entries matching the specified path or prefix
     * Returns true if any entries were removed
     */
    private removeTagMetadataForPath<T>(metadata: Record<string, T> | undefined, path: string, prefix: string): boolean {
        if (!metadata) {
            return false;
        }

        let changed = false;
        const keys = Object.keys(metadata);
        for (const key of keys) {
            if (key === path || key.startsWith(prefix)) {
                delete metadata[key];
                changed = true;
            }
        }
        return changed;
    }

    /**
     * Checks if updateNestedPaths would modify a metadata record without mutating it
     */
    private willUpdateNestedPaths<T>(
        metadata: Record<string, T> | undefined,
        oldPath: string,
        newPath: string,
        preserveExisting: boolean
    ): boolean {
        if (!metadata) {
            return false;
        }
        const clone = { ...metadata };
        return this.updateNestedPaths(clone, oldPath, newPath, preserveExisting);
    }

    /**
     * Updates all tag metadata entries when a tag is renamed.
     * Migrates direct entries and nested descendants to the new path.
     */
    async handleTagRename(oldPath: string, newPath: string, preserveExisting = false, extraMutation?: SettingsMutation): Promise<void> {
        const normalizedOld = normalizeTagPath(oldPath);
        const normalizedNew = normalizeTagPath(newPath);
        if (!normalizedOld || !normalizedNew || normalizedOld === normalizedNew) {
            if (extraMutation) {
                await this.saveAndUpdate(settings => (extraMutation(settings) ? true : false));
            }
            return;
        }

        const settingsSnapshot = this.settingsProvider.settings;
        const hasMetadata = this.hasTagMetadataForPath(settingsSnapshot, normalizedOld);
        const hasHiddenTags = hasHiddenTagMatch(settingsSnapshot, normalizedOld);
        const hasHiddenFileTags = hasHiddenFileTagMatch(settingsSnapshot, normalizedOld);
        const hasCollapsedPinnedContexts = hasCollapsedPinnedContextKeys(
            settingsSnapshot.collapsedPinnedContexts,
            ItemType.TAG,
            normalizedOld,
            { descendantDelimiter: '/' }
        );

        const requiresUpdate = hasMetadata
            ? this.willUpdateNestedPaths(settingsSnapshot.tagColors, normalizedOld, normalizedNew, preserveExisting) ||
              this.willUpdateNestedPaths(settingsSnapshot.tagBackgroundColors, normalizedOld, normalizedNew, preserveExisting) ||
              this.willUpdateNestedPaths(settingsSnapshot.tagIcons, normalizedOld, normalizedNew, preserveExisting) ||
              this.willUpdateNestedPaths(settingsSnapshot.tagSortOverrides, normalizedOld, normalizedNew, preserveExisting) ||
              this.willUpdateNestedPaths(settingsSnapshot.tagTreeSortOverrides, normalizedOld, normalizedNew, preserveExisting) ||
              this.willUpdateNestedPaths(settingsSnapshot.tagAppearances, normalizedOld, normalizedNew, preserveExisting)
            : false;

        if (!requiresUpdate && !hasHiddenTags && !hasHiddenFileTags && !hasCollapsedPinnedContexts && !extraMutation) {
            return;
        }

        await this.saveAndUpdate(settings => {
            let changed = false;
            if (requiresUpdate) {
                changed = this.updateNestedPaths(settings.tagColors, normalizedOld, normalizedNew, preserveExisting) || changed;
                changed = this.updateNestedPaths(settings.tagBackgroundColors, normalizedOld, normalizedNew, preserveExisting) || changed;
                changed = this.updateNestedPaths(settings.tagIcons, normalizedOld, normalizedNew, preserveExisting) || changed;
                changed = this.updateNestedPaths(settings.tagSortOverrides, normalizedOld, normalizedNew, preserveExisting) || changed;
                changed = this.updateNestedPaths(settings.tagTreeSortOverrides, normalizedOld, normalizedNew, preserveExisting) || changed;
                changed = this.updateNestedPaths(settings.tagAppearances, normalizedOld, normalizedNew, preserveExisting) || changed;
            }
            changed =
                updateCollapsedPinnedContextKeys(settings.collapsedPinnedContexts, ItemType.TAG, normalizedOld, normalizedNew, {
                    descendantDelimiter: '/',
                    preserveExisting
                }) || changed;

            changed = updateHiddenTagPrefixMatches(settings, normalizedOld, normalizedNew) || changed;
            changed = updateHiddenFileTagPrefixMatches(settings, normalizedOld, normalizedNew) || changed;

            if (extraMutation) {
                changed = extraMutation(settings) || changed;
            }

            return changed;
        });
    }

    /**
     * Removes all metadata associated with a tag and its descendants
     * Clears colors, icons, sort overrides, appearances, and hidden tag entries
     */
    async handleTagDelete(tagPath: string, extraMutation?: SettingsMutation): Promise<void> {
        const normalized = normalizeTagPath(tagPath);
        if (!normalized) {
            if (extraMutation) {
                await this.saveAndUpdate(settings => (extraMutation(settings) ? true : false));
            }
            return;
        }

        const settingsSnapshot = this.settingsProvider.settings;
        const hasMetadata =
            this.hasTagMetadataForPath(settingsSnapshot, normalized) ||
            hasHiddenTagMatch(settingsSnapshot, normalized) ||
            hasHiddenFileTagMatch(settingsSnapshot, normalized) ||
            hasCollapsedPinnedContextKeys(settingsSnapshot.collapsedPinnedContexts, ItemType.TAG, normalized, {
                descendantDelimiter: '/'
            });

        if (!hasMetadata && !extraMutation) {
            return;
        }

        const prefix = `${normalized}/`;

        await this.saveAndUpdate(settings => {
            let changed = false;
            if (hasMetadata) {
                changed = this.removeTagMetadataForPath(settings.tagColors, normalized, prefix) || changed;
                changed = this.removeTagMetadataForPath(settings.tagBackgroundColors, normalized, prefix) || changed;
                changed = this.removeTagMetadataForPath(settings.tagIcons, normalized, prefix) || changed;
                changed = this.removeTagMetadataForPath(settings.tagSortOverrides, normalized, prefix) || changed;
                changed = this.removeTagMetadataForPath(settings.tagTreeSortOverrides, normalized, prefix) || changed;
                changed = this.removeTagMetadataForPath(settings.tagAppearances, normalized, prefix) || changed;
            }
            changed =
                deleteCollapsedPinnedContextKeys(settings.collapsedPinnedContexts, ItemType.TAG, normalized, {
                    descendantDelimiter: '/'
                }) || changed;

            changed = removeHiddenTagPrefixMatches(settings, normalized) || changed;
            changed = removeHiddenFileTagPrefixMatches(settings, normalized) || changed;

            if (extraMutation) {
                changed = extraMutation(settings) || changed;
            }

            return changed;
        });
    }

    /**
     * Clean up tag metadata for non-existent tags
     * @returns True if any changes were made
     */
    async cleanupTagMetadata(targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings): Promise<boolean> {
        // Get valid tags from TagTreeService
        const tagTreeProvider = this.getTagTreeProvider();
        const validTagPaths = tagTreeProvider?.getAllTagPaths() || [];

        const validTags = new Set(validTagPaths.map(path => normalizeTagPath(path)).filter((value): value is string => value !== null));
        const validator = (path: string) => {
            const normalized = normalizeTagPath(path);
            return normalized ? validTags.has(normalized) : false;
        };
        const collapsedPinnedContextValidator = (path: string) => isValidCollapsedPinnedTagContext(path, validator);
        const collapsedPinnedContextChanges = cleanupCollapsedPinnedContextKeys(
            targetSettings.collapsedPinnedContexts,
            ItemType.TAG,
            collapsedPinnedContextValidator
        );

        const results = await Promise.all([
            this.cleanupMetadata(targetSettings, 'tagColors', validator),
            this.cleanupMetadata(targetSettings, 'tagBackgroundColors', validator),
            this.cleanupMetadata(targetSettings, 'tagIcons', validator),
            this.cleanupMetadata(targetSettings, 'tagSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'tagTreeSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'tagAppearances', validator)
        ]);

        return collapsedPinnedContextChanges || results.some(changed => changed);
    }

    /**
     * Clean up tag metadata using pre-loaded validators.
     *
     * This method is called during plugin startup as part of a unified cleanup process
     * to remove metadata for tags that no longer exist in the vault.
     *
     * The cleanup process:
     * 1. Called from StorageContext after all tags have been extracted
     * 2. Uses the tag tree passed in validators to ensure we have complete data
     * 3. Gets all valid tag paths from the tag tree (includes nested tags like "parent/child")
     * 4. Removes metadata (colors, icons, sort overrides) for any tags not in the tree
     *
     * @param validators - Pre-loaded data including the complete tag tree
     * @returns True if any tag metadata was removed
     */
    async cleanupWithValidators(
        validators: CleanupValidators,
        targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings
    ): Promise<boolean> {
        const hasProcessedTagData = validators.dbFiles.some(({ data }) => data.tags !== null);

        // Skip destructive tag cleanup until cached tag data has been processed.
        if (validators.tagTree.size === 0 && !hasProcessedTagData) {
            return false;
        }

        // Collect all valid tag paths from the passed tag tree
        const validTagPaths: string[] = [];

        // Extract tag paths from the tag tree in validators
        for (const rootNode of validators.tagTree.values()) {
            const collectPaths = (node: TagTreeNode): void => {
                validTagPaths.push(node.path);
                for (const child of node.children.values()) {
                    collectPaths(child);
                }
            };
            collectPaths(rootNode);
        }

        const validTags = new Set(validTagPaths.map(path => normalizeTagPath(path)).filter((value): value is string => value !== null));
        const validator = (path: string) => {
            const normalized = normalizeTagPath(path);
            return normalized ? validTags.has(normalized) : false;
        };
        const collapsedPinnedContextValidator = (path: string) => isValidCollapsedPinnedTagContext(path, validator);
        const collapsedPinnedContextChanges = cleanupCollapsedPinnedContextKeys(
            targetSettings.collapsedPinnedContexts,
            ItemType.TAG,
            collapsedPinnedContextValidator
        );

        // Clean up all tag metadata types in parallel
        const results = await Promise.all([
            this.cleanupMetadata(targetSettings, 'tagColors', validator),
            this.cleanupMetadata(targetSettings, 'tagBackgroundColors', validator),
            this.cleanupMetadata(targetSettings, 'tagIcons', validator),
            this.cleanupMetadata(targetSettings, 'tagSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'tagTreeSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'tagAppearances', validator)
        ]);

        return collapsedPinnedContextChanges || results.some(changed => changed);
    }
}
