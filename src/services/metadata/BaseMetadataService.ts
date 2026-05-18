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
import {
    normalizeListSortOverride,
    type AlphaSortOrder,
    type ListSortOverrideValue,
    type NotebookNavigatorSettings
} from '../../settings/types';
import { ItemType } from '../../types';
import { ISettingsProvider } from '../../interfaces/ISettingsProvider';
import { FolderAppearance, TagAppearance } from '../../hooks/useListPaneAppearance';
import type { ShortcutEntry } from '../../types/shortcuts';
import { mutateVaultProfileShortcuts } from '../../utils/vaultProfiles';
import { normalizeCanonicalIconId } from '../../utils/iconizeFormat';
import { ensureRecord, isStringRecordValue, sanitizeRecord } from '../../utils/recordUtils';

/**
 * Type helper for metadata fields in settings
 * All metadata fields are Record<string, T> objects
 */
type MetadataFields = {
    folderIcons: Record<string, string>;
    folderColors: Record<string, string>;
    folderBackgroundColors: Record<string, string>;
    folderSortOverrides: Record<string, ListSortOverrideValue>;
    folderTreeSortOverrides: Record<string, AlphaSortOrder>;
    folderAppearances: Record<string, FolderAppearance>;
    fileIcons: Record<string, string>;
    fileColors: Record<string, string>;
    fileBackgroundColors: Record<string, string>;
    tagColors: Record<string, string>;
    tagIcons: Record<string, string>;
    tagBackgroundColors: Record<string, string>;
    tagSortOverrides: Record<string, ListSortOverrideValue>;
    tagTreeSortOverrides: Record<string, AlphaSortOrder>;
    tagAppearances: Record<string, TagAppearance>;
    propertyIcons: Record<string, string>;
    propertyColors: Record<string, string>;
    propertyBackgroundColors: Record<string, string>;
    propertySortOverrides: Record<string, ListSortOverrideValue>;
    propertyTreeSortOverrides: Record<string, AlphaSortOrder>;
    propertyAppearances: Record<string, FolderAppearance>;
};

type ColorRecordKey =
    | 'folderColors'
    | 'tagColors'
    | 'propertyColors'
    | 'folderBackgroundColors'
    | 'tagBackgroundColors'
    | 'propertyBackgroundColors'
    | 'fileColors'
    | 'fileBackgroundColors';
type ColorVariant = 'color' | 'background';

type MetadataKey = keyof MetadataFields;

/**
 * Type for entity that can have metadata (folder or tag)
 */
export type EntityType = typeof ItemType.FOLDER | typeof ItemType.TAG | typeof ItemType.PROPERTY | typeof ItemType.FILE;

/**
 * Base class for metadata services
 * Provides shared functionality for managing colors, icons, and sort overrides
 */
export abstract class BaseMetadataService {
    protected updateQueue: Promise<void> = Promise.resolve();
    protected settingsProvider: ISettingsProvider;

    constructor(
        protected app: App,
        settingsProvider: ISettingsProvider
    ) {
        this.settingsProvider = settingsProvider;
    }

    /**
     * Saves settings and triggers UI update
     * Uses a queue to serialize updates and prevent race conditions
     */
    protected async saveAndUpdate(updater: (settings: NotebookNavigatorSettings) => void | boolean): Promise<void> {
        // Queue this update to run after any pending updates
        this.updateQueue = this.updateQueue
            .then(async () => {
                // Update settings
                const result = updater(this.settingsProvider.settings);
                if (result === false) {
                    return;
                }
                // Save settings
                await this.settingsProvider.saveSettingsAndUpdate();
            })
            .catch(error => {
                // Log error but don't break the queue for subsequent updates
                console.error('Failed to save metadata:', error);
                // Re-throw to propagate to caller
                throw error;
            });

        return this.updateQueue;
    }

    /**
     * Applies shortcut mutations in a single pass.
     * @param settings - Settings object to mutate
     * @param mutate - Returns undefined to keep, null to remove, ShortcutEntry to replace
     * @returns True if changes were applied
     */
    protected updateShortcuts(
        settings: NotebookNavigatorSettings,
        mutate: (shortcut: ShortcutEntry) => ShortcutEntry | null | undefined
    ): boolean {
        // Updates shortcuts across all vault profiles using the mutation function
        return mutateVaultProfileShortcuts(settings.vaultProfiles, shortcuts => {
            let changed = false;
            const next: ShortcutEntry[] = [];

            for (const shortcut of shortcuts) {
                const result = mutate(shortcut);
                // undefined means keep the shortcut unchanged
                if (result === undefined) {
                    next.push(shortcut);
                    continue;
                }

                changed = true;
                // null means remove the shortcut, otherwise replace it
                if (result !== null) {
                    next.push(result);
                }
            }

            return changed ? next : null;
        });
    }

    /**
     * Validates CSS color format (hex, rgb, rgba, hsl, hsla, named colors)
     */
    protected validateColor(color: string): boolean {
        // Basic validation for common CSS color formats
        // Accepts: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl(), hsla(), named colors
        const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+)$/;
        return colorRegex.test(color);
    }

    // ========== Generic Color Management ==========

    /**
     * Sets a custom color for an entity (folder or tag)
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     * @param color - CSS color value
     */
    protected async setEntityColor(entityType: EntityType, path: string, color: string): Promise<void> {
        await this.setEntityColorVariant(entityType, path, color, 'color');
    }

    /**
     * Removes the custom color from an entity
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     */
    protected async removeEntityColor(entityType: EntityType, path: string): Promise<void> {
        await this.removeEntityColorVariant(entityType, path, 'color');
    }

    /**
     * Gets the custom color for an entity
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     * @returns The color value or undefined
     */
    protected getEntityColor(entityType: EntityType, path: string): string | undefined {
        return this.getEntityColorVariant(entityType, path, 'color');
    }

    /**
     * Sets a custom background color for an entity (folder or tag)
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     * @param color - CSS color value
     */
    protected async setEntityBackgroundColor(entityType: EntityType, path: string, color: string): Promise<void> {
        await this.setEntityColorVariant(entityType, path, color, 'background');
    }

    /**
     * Removes the custom background color from an entity
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     */
    protected async removeEntityBackgroundColor(entityType: EntityType, path: string): Promise<void> {
        await this.removeEntityColorVariant(entityType, path, 'background');
    }

    /**
     * Gets the custom background color for an entity
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     */
    protected getEntityBackgroundColor(entityType: EntityType, path: string): string | undefined {
        return this.getEntityColorVariant(entityType, path, 'background');
    }

    // Maps entity type and color variant to the corresponding settings key
    private getColorRecordKey(entityType: EntityType, variant: ColorVariant): ColorRecordKey {
        if (entityType === ItemType.FOLDER) {
            return variant === 'color' ? 'folderColors' : 'folderBackgroundColors';
        }
        if (entityType === ItemType.TAG) {
            return variant === 'color' ? 'tagColors' : 'tagBackgroundColors';
        }
        if (entityType === ItemType.PROPERTY) {
            return variant === 'color' ? 'propertyColors' : 'propertyBackgroundColors';
        }
        return variant === 'color' ? 'fileColors' : 'fileBackgroundColors';
    }

    // Ensures a color record exists in settings and returns it
    private ensureColorRecord(settings: NotebookNavigatorSettings, key: ColorRecordKey): Record<string, string> {
        // Converts to null prototype and validates all values are strings
        const record = ensureRecord(settings[key], isStringRecordValue);
        settings[key] = record;
        return record;
    }

    // Sets a color or background color for an entity after validation
    private async setEntityColorVariant(entityType: EntityType, path: string, color: string, variant: ColorVariant): Promise<void> {
        if (!this.validateColor(color)) {
            return;
        }

        await this.saveAndUpdate(settings => {
            const recordKey = this.getColorRecordKey(entityType, variant);
            const record = this.ensureColorRecord(settings, recordKey);
            record[path] = color;
        });
    }

    // Removes a color or background color from an entity
    private async removeEntityColorVariant(entityType: EntityType, path: string, variant: ColorVariant): Promise<void> {
        const recordKey = this.getColorRecordKey(entityType, variant);
        const record = this.settingsProvider.settings[recordKey];
        if (!record || !(path in record)) {
            return;
        }

        await this.saveAndUpdate(settings => {
            const mutableRecord = settings[recordKey];
            if (mutableRecord) {
                delete mutableRecord[path];
            }
        });
    }

    // Gets a color or background color for an entity
    private getEntityColorVariant(entityType: EntityType, path: string, variant: ColorVariant): string | undefined {
        const recordKey = this.getColorRecordKey(entityType, variant);
        return this.settingsProvider.settings[recordKey]?.[path];
    }

    // ========== Generic Icon Management ==========

    /**
     * Sets a custom icon for an entity (folder or tag)
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     * @param iconId - Lucide icon identifier
     */
    protected async setEntityIcon(entityType: EntityType, path: string, iconId: string): Promise<void> {
        const normalizedIcon = normalizeCanonicalIconId(iconId);
        if (!normalizedIcon) {
            return;
        }

        await this.saveAndUpdate(settings => {
            if (entityType === ItemType.FOLDER) {
                // Ensure null prototype and validate string values before adding icon
                const icons = ensureRecord(settings.folderIcons, isStringRecordValue);
                icons[path] = normalizedIcon;
                settings.folderIcons = icons;
            } else if (entityType === ItemType.TAG) {
                // Ensure null prototype and validate string values before adding icon
                const icons = ensureRecord(settings.tagIcons, isStringRecordValue);
                icons[path] = normalizedIcon;
                settings.tagIcons = icons;
            } else if (entityType === ItemType.PROPERTY) {
                const icons = ensureRecord(settings.propertyIcons, isStringRecordValue);
                icons[path] = normalizedIcon;
                settings.propertyIcons = icons;
            } else {
                // Ensure null prototype and validate string values before adding icon
                const icons = ensureRecord(settings.fileIcons, isStringRecordValue);
                icons[path] = normalizedIcon;
                settings.fileIcons = icons;
            }
        });
    }

    /**
     * Removes the custom icon from an entity
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     */
    protected async removeEntityIcon(entityType: EntityType, path: string): Promise<void> {
        if (entityType === ItemType.FOLDER && this.settingsProvider.settings.folderIcons?.[path]) {
            await this.saveAndUpdate(settings => {
                if (settings.folderIcons) {
                    delete settings.folderIcons[path];
                }
            });
        } else if (entityType === ItemType.TAG && this.settingsProvider.settings.tagIcons?.[path]) {
            await this.saveAndUpdate(settings => {
                if (settings.tagIcons) {
                    delete settings.tagIcons[path];
                }
            });
        } else if (entityType === ItemType.PROPERTY && this.settingsProvider.settings.propertyIcons?.[path]) {
            await this.saveAndUpdate(settings => {
                if (settings.propertyIcons) {
                    delete settings.propertyIcons[path];
                }
            });
        } else if (entityType === ItemType.FILE && this.settingsProvider.settings.fileIcons?.[path]) {
            await this.saveAndUpdate(settings => {
                if (settings.fileIcons) {
                    delete settings.fileIcons[path];
                }
            });
        }
    }

    // Reads an icon entry while ignoring inherited properties and non-string values
    private readIconRecord(record: Record<string, string> | undefined, path: string): string | undefined {
        // Check if property exists as own property to prevent reading from prototype chain
        if (!record || !Object.prototype.hasOwnProperty.call(record, path)) {
            return undefined;
        }
        const icon = record[path];
        // Validate that stored value is a string to handle corrupted data
        if (typeof icon !== 'string') {
            return undefined;
        }
        return normalizeCanonicalIconId(icon);
    }

    /**
     * Gets the custom icon for an entity
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     * @returns The icon ID or undefined
     */
    protected getEntityIcon(entityType: EntityType, path: string): string | undefined {
        if (entityType === ItemType.FOLDER) {
            return this.readIconRecord(this.settingsProvider.settings.folderIcons, path);
        }
        if (entityType === ItemType.TAG) {
            return this.readIconRecord(this.settingsProvider.settings.tagIcons, path);
        }
        if (entityType === ItemType.PROPERTY) {
            return this.readIconRecord(this.settingsProvider.settings.propertyIcons, path);
        }
        return this.readIconRecord(this.settingsProvider.settings.fileIcons, path);
    }

    // ========== Generic Sort Override Management ==========

    /**
     * Sets a custom sort order for an entity.
     * @param entityType - Type of entity ('folder', 'tag', or 'property')
     * @param path - Path of the entity
     * @param sortOverride - Sort override to apply
     */
    protected async setEntitySortOverride(entityType: EntityType, path: string, sortOverride: ListSortOverrideValue): Promise<void> {
        await this.saveAndUpdate(settings => {
            const normalizedOverride = normalizeListSortOverride(sortOverride);
            if (!normalizedOverride) {
                return false;
            }

            if (entityType === ItemType.FOLDER) {
                const overrides = ensureRecord(settings.folderSortOverrides);
                const next = sanitizeRecord(overrides);
                next[path] = normalizedOverride;
                settings.folderSortOverrides = next;
                return;
            }
            if (entityType === ItemType.TAG) {
                const overrides = ensureRecord(settings.tagSortOverrides);
                const next = sanitizeRecord(overrides);
                next[path] = normalizedOverride;
                settings.tagSortOverrides = next;
                return;
            }
            if (entityType === ItemType.PROPERTY) {
                const overrides = ensureRecord(settings.propertySortOverrides);
                const next = sanitizeRecord(overrides);
                next[path] = normalizedOverride;
                settings.propertySortOverrides = next;
                return;
            }

            return false;
        });
    }

    /**
     * Removes the custom sort order from an entity.
     * @param entityType - Type of entity ('folder', 'tag', or 'property')
     * @param path - Path of the entity
     */
    protected async removeEntitySortOverride(entityType: EntityType, path: string): Promise<void> {
        if (entityType === ItemType.FOLDER && this.settingsProvider.settings.folderSortOverrides?.[path]) {
            await this.saveAndUpdate(settings => {
                const overrides = ensureRecord(settings.folderSortOverrides);
                const next = sanitizeRecord(overrides);
                delete next[path];
                settings.folderSortOverrides = next;
            });
        } else if (entityType === ItemType.TAG && this.settingsProvider.settings.tagSortOverrides?.[path]) {
            await this.saveAndUpdate(settings => {
                const overrides = ensureRecord(settings.tagSortOverrides);
                const next = sanitizeRecord(overrides);
                delete next[path];
                settings.tagSortOverrides = next;
            });
        } else if (entityType === ItemType.PROPERTY && this.settingsProvider.settings.propertySortOverrides?.[path]) {
            await this.saveAndUpdate(settings => {
                const overrides = ensureRecord(settings.propertySortOverrides);
                const next = sanitizeRecord(overrides);
                delete next[path];
                settings.propertySortOverrides = next;
            });
        }
    }

    /**
     * Gets the sort override for an entity
     * @param entityType - Type of entity ('folder', 'tag', or 'property')
     * @param path - Path of the entity
     * @returns The sort override or undefined
     */
    protected getEntitySortOverride(entityType: EntityType, path: string): ListSortOverrideValue | undefined {
        if (entityType === ItemType.FOLDER) {
            return this.settingsProvider.settings.folderSortOverrides?.[path];
        }
        if (entityType === ItemType.TAG) {
            return this.settingsProvider.settings.tagSortOverrides?.[path];
        }
        if (entityType === ItemType.PROPERTY) {
            return this.settingsProvider.settings.propertySortOverrides?.[path];
        }
        return undefined;
    }

    // ========== Generic Child Sort Order Overrides (Navigation Tree) ==========

    /**
     * Sets a custom alphabetical sort order for an entity's children in the navigation pane.
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     * @param sortOrder - Alphabetical order to apply
     */
    protected async setEntityChildSortOrderOverride(
        entityType: typeof ItemType.FOLDER | typeof ItemType.TAG | typeof ItemType.PROPERTY,
        path: string,
        sortOrder: AlphaSortOrder
    ) {
        await this.saveAndUpdate(settings => {
            if (entityType === ItemType.FOLDER) {
                const overrides = ensureRecord(settings.folderTreeSortOverrides);
                const next = sanitizeRecord(overrides);
                next[path] = sortOrder;
                settings.folderTreeSortOverrides = next;
            } else if (entityType === ItemType.TAG) {
                const overrides = ensureRecord(settings.tagTreeSortOverrides);
                const next = sanitizeRecord(overrides);
                next[path] = sortOrder;
                settings.tagTreeSortOverrides = next;
            } else {
                const overrides = ensureRecord(settings.propertyTreeSortOverrides);
                const next = sanitizeRecord(overrides);
                next[path] = sortOrder;
                settings.propertyTreeSortOverrides = next;
            }
        });
    }

    /**
     * Removes the custom child sort order from an entity.
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     */
    protected async removeEntityChildSortOrderOverride(
        entityType: typeof ItemType.FOLDER | typeof ItemType.TAG | typeof ItemType.PROPERTY,
        path: string
    ) {
        if (entityType === ItemType.FOLDER) {
            const current = this.settingsProvider.settings.folderTreeSortOverrides;
            if (!current || !Object.prototype.hasOwnProperty.call(current, path)) {
                return;
            }
            await this.saveAndUpdate(settings => {
                const overrides = ensureRecord(settings.folderTreeSortOverrides);
                const next = sanitizeRecord(overrides);
                delete next[path];
                settings.folderTreeSortOverrides = next;
            });
            return;
        }

        if (entityType === ItemType.TAG) {
            const current = this.settingsProvider.settings.tagTreeSortOverrides;
            if (!current || !Object.prototype.hasOwnProperty.call(current, path)) {
                return;
            }
            await this.saveAndUpdate(settings => {
                const overrides = ensureRecord(settings.tagTreeSortOverrides);
                const next = sanitizeRecord(overrides);
                delete next[path];
                settings.tagTreeSortOverrides = next;
            });
            return;
        }

        const current = this.settingsProvider.settings.propertyTreeSortOverrides;
        if (!current || !Object.prototype.hasOwnProperty.call(current, path)) {
            return;
        }
        await this.saveAndUpdate(settings => {
            const overrides = ensureRecord(settings.propertyTreeSortOverrides);
            const next = sanitizeRecord(overrides);
            delete next[path];
            settings.propertyTreeSortOverrides = next;
        });
    }

    /**
     * Gets the child sort order override for an entity.
     * @param entityType - Type of entity ('folder' or 'tag')
     * @param path - Path of the entity
     * @returns The alphabetical sort order override or undefined
     */
    protected getEntityChildSortOrderOverride(
        entityType: typeof ItemType.FOLDER | typeof ItemType.TAG | typeof ItemType.PROPERTY,
        path: string
    ): AlphaSortOrder | undefined {
        if (entityType === ItemType.FOLDER) {
            const record = this.settingsProvider.settings.folderTreeSortOverrides;
            return record && Object.prototype.hasOwnProperty.call(record, path) ? record[path] : undefined;
        }
        if (entityType === ItemType.TAG) {
            const record = this.settingsProvider.settings.tagTreeSortOverrides;
            return record && Object.prototype.hasOwnProperty.call(record, path) ? record[path] : undefined;
        }

        const record = this.settingsProvider.settings.propertyTreeSortOverrides;
        return record && Object.prototype.hasOwnProperty.call(record, path) ? record[path] : undefined;
    }

    // ========== Generic Metadata Cleanup Utilities ==========

    /**
     * Generic cleanup for metadata objects
     * Removes entries that fail validation
     */
    protected async cleanupMetadata<K extends MetadataKey>(
        settings: NotebookNavigatorSettings,
        metadataKey: K,
        validator: (path: string) => boolean
    ): Promise<boolean> {
        // Since we only need to delete properties, we can treat the metadata
        // as a generic object without caring about the specific value type
        const metadata = settings[metadataKey];

        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return false;
        }

        let hasChanges = false;
        // We know metadata is an object with string keys
        const metadataObj = metadata as Record<string, unknown>;
        const metadataPaths = Object.keys(metadataObj);

        for (const path of metadataPaths) {
            if (!validator(path)) {
                delete metadataObj[path];
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    /**
     * Updates nested paths when a parent is renamed
     * Handles both direct matches and nested children
     */
    protected updateNestedPaths<T>(
        metadata: Record<string, T> | undefined,
        oldPath: string,
        newPath: string,
        preserveExisting = false
    ): boolean {
        if (!metadata) return false;

        const oldPrefix = `${oldPath}/`;
        const updates: { oldPath: string; newPath: string; value: T }[] = [];

        // First, handle direct path match
        if (Object.prototype.hasOwnProperty.call(metadata, oldPath)) {
            updates.push({
                oldPath: oldPath,
                newPath: newPath,
                value: metadata[oldPath]
            });
        }

        // Then handle nested paths
        const metadataKeys = Object.keys(metadata);
        for (const path of metadataKeys) {
            if (path.startsWith(oldPrefix)) {
                const newNestedPath = `${newPath}/${path.slice(oldPrefix.length)}`;
                updates.push({
                    oldPath: path,
                    newPath: newNestedPath,
                    value: metadata[path]
                });
            }
        }

        let changed = false;

        // Apply all updates
        for (const update of updates) {
            if (update.oldPath === update.newPath) {
                continue;
            }

            // Check if the new path already has metadata (converts to boolean for clarity)
            const newPathExists = Boolean(Object.prototype.hasOwnProperty.call(metadata, update.newPath));
            if (newPathExists && preserveExisting) {
                if (update.oldPath !== update.newPath) {
                    delete metadata[update.oldPath];
                    changed = true;
                }
                continue;
            }

            metadata[update.newPath] = update.value;
            delete metadata[update.oldPath];
            changed = true;
        }

        return changed;
    }

    /**
     * Deletes nested paths when a parent is deleted
     * Removes both the exact match and all children
     */
    protected deleteNestedPaths<T>(metadata: Record<string, T> | undefined, pathPrefix: string): boolean {
        if (!metadata) return false;

        let hasChanges = false;
        for (const path in metadata) {
            if (path === pathPrefix || path.startsWith(`${pathPrefix}/`)) {
                delete metadata[path];
                hasChanges = true;
            }
        }
        return hasChanges;
    }
}
