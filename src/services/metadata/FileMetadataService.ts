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
import { BaseMetadataService } from './BaseMetadataService';
import type { CleanupValidators } from '../MetadataService';
import { ItemType, NavigatorContext } from '../../types';
import { isNoteShortcut } from '../../types/shortcuts';
import type { NotebookNavigatorSettings } from '../../settings';
import { getDBInstance } from '../../storage/fileOperations';
import { deserializeIconFromFrontmatterCompat, normalizeCanonicalIconId, serializeIconForFrontmatter } from '../../utils/iconizeFormat';
import { findMatchingRecordKey, normalizePinnedNoteContext } from '../../utils/recordUtils';
import { createShortcutTargetPathEventMatcher } from '../../utils/shortcutPathResolver';

/**
 * Service for managing file-specific metadata operations
 * Handles pinned notes and file-related cleanup operations
 */

/**
 * Result object returned by metadata migration operations
 */
export interface FileMetadataMigrationResult {
    iconsBefore: number;
    colorsBefore: number;
    migratedIcons: number;
    migratedColors: number;
    filesUpdated: number;
    failures: number;
}

export class FileMetadataService extends BaseMetadataService {
    private static readonly VAULT_ICON_PROVIDER_ID = 'vault';

    /**
     * Gets a TFile instance from a file path
     * @param filePath - Path to the file
     * @returns TFile instance or null if not found or not a file
     */
    private getFile(filePath: string): TFile | null {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        return file instanceof TFile ? file : null;
    }

    /**
     * Checks if frontmatter storage is enabled for file metadata
     * @returns True if frontmatter metadata is enabled
     */
    private shouldUseFrontmatterForFiles(): boolean {
        const settings = this.settingsProvider.settings;
        return settings.useFrontmatterMetadata;
    }

    /**
     * Returns true when the path points to an SVG file.
     */
    private isVaultSvgIconPath(path: string): boolean {
        return path.trim().toLowerCase().endsWith('.svg');
    }

    /**
     * Formats a vault icon identifier for a vault file path.
     */
    private formatVaultIconId(path: string): string {
        return `${FileMetadataService.VAULT_ICON_PROVIDER_ID}:${path}`;
    }

    /**
     * Replaces matching icon ids in a string record.
     */
    private replaceIconValues(record: Record<string, string> | undefined, oldIconId: string, newIconId: string): boolean {
        if (!record) {
            return false;
        }

        let changed = false;
        Object.entries(record).forEach(([key, value]) => {
            if (value !== oldIconId) {
                return;
            }
            record[key] = newIconId;
            changed = true;
        });

        return changed;
    }

    private updateVaultIconReferencesInSettings(settings: NotebookNavigatorSettings, oldIconId: string, newIconId: string): boolean {
        let changed = false;

        changed = this.replaceIconValues(settings.folderIcons, oldIconId, newIconId) || changed;
        changed = this.replaceIconValues(settings.tagIcons, oldIconId, newIconId) || changed;
        changed = this.replaceIconValues(settings.fileIcons, oldIconId, newIconId) || changed;
        changed = this.replaceIconValues(settings.interfaceIcons, oldIconId, newIconId) || changed;
        changed = this.replaceIconValues(settings.fileNameIconMap, oldIconId, newIconId) || changed;
        changed = this.replaceIconValues(settings.fileTypeIconMap, oldIconId, newIconId) || changed;

        const vaultPrefix = `${FileMetadataService.VAULT_ICON_PROVIDER_ID}:`;
        if (oldIconId.startsWith(vaultPrefix) && newIconId.startsWith(vaultPrefix)) {
            const oldPath = oldIconId.substring(vaultPrefix.length);
            const newPath = newIconId.substring(vaultPrefix.length);

            // Icon maps store values in frontmatter format, so vault icons may be stored without the provider prefix.
            changed = this.replaceIconValues(settings.fileNameIconMap, oldPath, newPath) || changed;
            changed = this.replaceIconValues(settings.fileTypeIconMap, oldPath, newPath) || changed;
        }

        return changed;
    }

    /**
     * Updates the recent vault icon list when a vault icon id changes.
     */
    private updateVaultIconReferencesInRecents(oldIconId: string, newIconId: string): void {
        const recentIcons = this.settingsProvider.getRecentIcons();
        const providerIconsValue: unknown = recentIcons[FileMetadataService.VAULT_ICON_PROVIDER_ID];
        if (providerIconsValue === undefined) {
            return;
        }

        if (!Array.isArray(providerIconsValue)) {
            delete recentIcons[FileMetadataService.VAULT_ICON_PROVIDER_ID];
            this.settingsProvider.setRecentIcons(recentIcons);
            return;
        }

        let changed = false;
        let sanitized = false;
        const providerIcons = providerIconsValue.filter((iconId): iconId is string => {
            if (typeof iconId === 'string') {
                return true;
            }
            sanitized = true;
            return false;
        });

        if (providerIcons.length === 0) {
            if (sanitized) {
                delete recentIcons[FileMetadataService.VAULT_ICON_PROVIDER_ID];
                this.settingsProvider.setRecentIcons(recentIcons);
            }
            return;
        }

        const nextIcons = providerIcons.map(iconId => {
            if (iconId !== oldIconId) {
                return iconId;
            }
            changed = true;
            return newIconId;
        });

        if (!changed && !sanitized) {
            return;
        }

        if (nextIcons.length === 0) {
            delete recentIcons[FileMetadataService.VAULT_ICON_PROVIDER_ID];
        } else {
            recentIcons[FileMetadataService.VAULT_ICON_PROVIDER_ID] = nextIcons;
        }
        this.settingsProvider.setRecentIcons(recentIcons);
    }

    /**
     * Rewrites frontmatter icon values when a vault icon id changes.
     */
    private async updateVaultIconReferencesInFrontmatter(oldIconId: string, newIconId: string): Promise<void> {
        if (!this.shouldUseFrontmatterForFiles()) {
            return;
        }

        const settings = this.settingsProvider.settings;
        const iconField = settings.frontmatterIconField?.trim();
        if (!iconField) {
            return;
        }

        const db = getDBInstance();
        const candidatePaths: string[] = [];
        db.forEachFile((path, data) => {
            const icon = data.metadata?.icon;
            if (icon === oldIconId) {
                candidatePaths.push(path);
            }
        });

        if (candidatePaths.length === 0) {
            return;
        }

        const replacementValue = serializeIconForFrontmatter(newIconId);
        if (!replacementValue) {
            return;
        }

        for (const path of candidatePaths) {
            const file = this.getFile(path);
            if (!file || file.extension !== 'md') {
                continue;
            }

            let didUpdate = false;
            try {
                await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                    const targetField = findMatchingRecordKey(frontmatter, iconField);
                    if (!targetField) {
                        return;
                    }

                    const currentValue = frontmatter[targetField];
                    if (typeof currentValue === 'string') {
                        const normalized = deserializeIconFromFrontmatterCompat(currentValue);
                        if (normalized !== oldIconId) {
                            return;
                        }
                        frontmatter[targetField] = replacementValue;
                        didUpdate = true;
                        return;
                    }

                    if (Array.isArray(currentValue)) {
                        const currentArray: unknown[] = currentValue;
                        const next = currentArray.map(entry => {
                            if (typeof entry !== 'string') {
                                return entry;
                            }
                            const normalized = deserializeIconFromFrontmatterCompat(entry);
                            if (normalized !== oldIconId) {
                                return entry;
                            }
                            didUpdate = true;
                            return replacementValue;
                        });

                        if (didUpdate) {
                            frontmatter[targetField] = next;
                        }
                    }
                });
            } catch (error: unknown) {
                console.error('Failed to update vault icon reference in frontmatter', { path: file.path, field: iconField, error });
                continue;
            }

            if (didUpdate) {
                await db.updateFileMetadata(file.path, { icon: newIconId });
            }
        }
    }

    /**
     * Writes or deletes file style metadata in a file's frontmatter and syncs to IndexedDB
     * @param file - The file to update
     * @param field - Frontmatter field name to write to
     * @param value - Value to write, or null to delete the field
     * @param metadataKey - Type of metadata being written
     * @returns Object with success status and the normalized value that was written
     */
    private async writeFrontmatterValue(
        file: TFile,
        field: string,
        value: string | null,
        metadataKey: 'icon' | 'color' | 'background'
    ): Promise<{ success: boolean; normalized: string | null }> {
        const trimmedField = field.trim();
        if (!trimmedField) {
            return { success: false, normalized: null };
        }

        let canonicalValue: string | null = null;
        let frontmatterValue: string | null = null;

        if (value !== null) {
            if (metadataKey === 'icon') {
                const normalizedIcon = normalizeCanonicalIconId(value.trim());
                canonicalValue = normalizedIcon && normalizedIcon.length > 0 ? normalizedIcon : null;
                if (canonicalValue) {
                    const serialized = serializeIconForFrontmatter(canonicalValue);
                    if (!serialized) {
                        return { success: false, normalized: null };
                    }
                    frontmatterValue = serialized;
                }
            } else {
                const trimmedColor = value.trim();
                canonicalValue = trimmedColor.length > 0 ? trimmedColor : null;
                frontmatterValue = canonicalValue;
            }
        }

        const normalizedFrontmatterValue = frontmatterValue === null ? null : frontmatterValue.trim();

        try {
            // Update the frontmatter in the file
            await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                const targetField = findMatchingRecordKey(frontmatter, trimmedField) ?? trimmedField;
                if (normalizedFrontmatterValue && normalizedFrontmatterValue.length > 0) {
                    frontmatter[targetField] = normalizedFrontmatterValue;
                    return;
                }

                // Remove the field if it exists and new value is empty
                if (Reflect.has(frontmatter, targetField)) {
                    delete frontmatter[targetField];
                }
            });
            // Sync the change to IndexedDB cache using canonical format
            const db = getDBInstance();
            const metadataUpdate: { icon?: string; color?: string; background?: string } = {};
            if (metadataKey === 'icon') {
                // Store canonical icon format in cache for consistency
                metadataUpdate.icon = canonicalValue && canonicalValue.length > 0 ? canonicalValue : undefined;
            } else if (metadataKey === 'background') {
                metadataUpdate.background = canonicalValue && canonicalValue.length > 0 ? canonicalValue : undefined;
            } else {
                metadataUpdate.color = canonicalValue && canonicalValue.length > 0 ? canonicalValue : undefined;
            }
            await db.updateFileMetadata(file.path, metadataUpdate);
            return { success: true, normalized: normalizedFrontmatterValue ?? null };
        } catch (error: unknown) {
            console.error('Failed to update frontmatter metadata', {
                path: file.path,
                field: trimmedField,
                error
            });
            return { success: false, normalized: null };
        }
    }

    /**
     * Removes a file style entry from settings storage for a specific file
     * Used after successfully migrating metadata to frontmatter
     * @param key - The settings property to clear
     * @param filePath - Path to the file whose entry should be removed
     */
    private async clearSettingsEntry(key: 'fileIcons' | 'fileColors' | 'fileBackgroundColors', filePath: string): Promise<void> {
        const record = this.settingsProvider.settings[key];
        if (!record || record[filePath] === undefined) {
            return;
        }

        await this.saveAndUpdate(settings => {
            const target = settings[key];
            if (target) {
                delete target[filePath];
            }
        });
    }

    /**
     * Toggles the pinned state of a note in a specific context
     * @param filePath - Path of the file to pin/unpin
     * @param context - Context to toggle ('folder', 'tag', or 'property')
     */
    async togglePinnedNote(filePath: string, context: NavigatorContext): Promise<void> {
        await this.saveAndUpdate(settings => {
            if (!settings.pinnedNotes) {
                settings.pinnedNotes = {};
            }

            const existing = settings.pinnedNotes[filePath];
            if (!existing) {
                // Create new pin with only specified context
                settings.pinnedNotes[filePath] = {
                    folder: context === 'folder',
                    tag: context === 'tag',
                    property: context === 'property'
                };
            } else {
                const normalized = normalizePinnedNoteContext(existing);
                settings.pinnedNotes[filePath] = normalized;

                // Toggle the specific context
                normalized[context] = !normalized[context];

                // Remove if unpinned from all contexts
                if (!normalized.folder && !normalized.tag && !normalized.property) {
                    delete settings.pinnedNotes[filePath];
                }
            }
        });
    }

    /**
     * Pins multiple notes in a single settings update.
     * @param filePaths - Paths of files to pin
     * @param context - Context to pin ('folder', 'tag', or 'property')
     * @returns Number of notes newly pinned in the given context
     */
    async pinNotes(filePaths: string[], context: NavigatorContext): Promise<number> {
        const uniquePaths = Array.from(new Set(filePaths)).filter(path => path.length > 0);
        if (uniquePaths.length === 0) {
            return 0;
        }

        let pinnedCount = 0;
        await this.saveAndUpdate(settings => {
            if (!settings.pinnedNotes) {
                settings.pinnedNotes = {};
            }

            let changed = false;
            for (const filePath of uniquePaths) {
                const existing = settings.pinnedNotes[filePath];
                if (!existing) {
                    settings.pinnedNotes[filePath] = {
                        folder: context === 'folder',
                        tag: context === 'tag',
                        property: context === 'property'
                    };
                    changed = true;
                    pinnedCount += 1;
                    continue;
                }

                const normalized = normalizePinnedNoteContext(existing);
                if (!normalized[context]) {
                    normalized[context] = true;
                    settings.pinnedNotes[filePath] = normalized;
                    changed = true;
                    pinnedCount += 1;
                }
            }

            return changed;
        });

        return pinnedCount;
    }

    /**
     * Checks if a note is pinned
     * @param filePath - Path of the file to check
     * @param context - Optional context to check ('folder', 'tag', or 'property')
     * @returns True if the note is pinned (in any context or specified context)
     */
    isPinned(filePath: string, context?: NavigatorContext): boolean {
        const rawContexts = this.settingsProvider.settings.pinnedNotes?.[filePath];
        if (!rawContexts) return false;

        const contexts = normalizePinnedNoteContext(rawContexts);

        if (!context) {
            return contexts.folder || contexts.tag || contexts.property;
        }

        return contexts[context] || false;
    }

    /**
     * Gets all pinned notes
     * @param context - Optional context filter ('folder', 'tag', or 'property')
     * @returns Array of pinned file paths
     */
    getPinnedNotes(context?: NavigatorContext): string[] {
        const pinnedNotes = this.settingsProvider.settings.pinnedNotes || {};

        if (!context) {
            return Object.keys(pinnedNotes);
        }

        return Object.entries(pinnedNotes)
            .filter(([_, rawContexts]) => normalizePinnedNoteContext(rawContexts)[context])
            .map(([path]) => path);
    }

    /**
     * Handles file deletion by removing it from pinned notes
     * @param filePath - Path of the deleted file
     */
    async handleFileDelete(filePath: string): Promise<void> {
        const matchesShortcutPath = createShortcutTargetPathEventMatcher(this.app, 'note', filePath);
        await this.saveAndUpdate(settings => {
            if (settings.pinnedNotes?.[filePath]) {
                delete settings.pinnedNotes[filePath];
            }
            if (settings.fileIcons?.[filePath]) {
                delete settings.fileIcons[filePath];
            }
            if (settings.fileColors?.[filePath]) {
                delete settings.fileColors[filePath];
            }
            if (settings.fileBackgroundColors?.[filePath]) {
                delete settings.fileBackgroundColors[filePath];
            }

            this.updateShortcuts(settings, shortcut => {
                if (!isNoteShortcut(shortcut)) {
                    return undefined;
                }
                return matchesShortcutPath(shortcut.path) ? null : undefined;
            });
        });
    }

    /**
     * Handles file rename by updating pinned notes
     * @param oldPath - Original file path
     * @param newPath - New file path
     */
    async handleFileRename(oldPath: string, newPath: string): Promise<void> {
        const isVaultIconRename = this.isVaultSvgIconPath(oldPath) && this.isVaultSvgIconPath(newPath);
        const oldVaultIconId = isVaultIconRename ? this.formatVaultIconId(oldPath) : null;
        const newVaultIconId = isVaultIconRename ? this.formatVaultIconId(newPath) : null;
        const matchesShortcutPath = createShortcutTargetPathEventMatcher(this.app, 'note', oldPath, newPath);

        await this.saveAndUpdate(settings => {
            let changed = false;
            if (settings.pinnedNotes?.[oldPath]) {
                // Save contexts and delete old entry
                const contexts = settings.pinnedNotes[oldPath];
                delete settings.pinnedNotes[oldPath];
                // Add with new path
                settings.pinnedNotes[newPath] = contexts;
                changed = true;
            }

            changed = this.updateNestedPaths(settings.fileIcons, oldPath, newPath) || changed;
            changed = this.updateNestedPaths(settings.fileColors, oldPath, newPath) || changed;
            changed = this.updateNestedPaths(settings.fileBackgroundColors, oldPath, newPath) || changed;

            if (oldVaultIconId && newVaultIconId) {
                changed = this.updateVaultIconReferencesInSettings(settings, oldVaultIconId, newVaultIconId) || changed;
            }

            changed =
                this.updateShortcuts(settings, shortcut => {
                    if (!isNoteShortcut(shortcut)) {
                        return undefined;
                    }
                    if (!matchesShortcutPath(shortcut.path)) {
                        return undefined;
                    }

                    return {
                        ...shortcut,
                        path: newPath
                    };
                }) || changed;

            return changed;
        });

        if (!oldVaultIconId || !newVaultIconId) {
            return;
        }

        this.updateVaultIconReferencesInRecents(oldVaultIconId, newVaultIconId);
        await this.updateVaultIconReferencesInFrontmatter(oldVaultIconId, newVaultIconId);
    }

    /**
     * Sets an icon for a file, storing in frontmatter if enabled, otherwise in settings
     * @param filePath - Path to the file
     * @param iconId - Icon identifier to set
     */
    async setFileIcon(filePath: string, iconId: string): Promise<void> {
        const file = this.getFile(filePath);
        if (!file) {
            return;
        }

        // Try to save to frontmatter first if enabled and file is markdown
        if (this.shouldUseFrontmatterForFiles() && file.extension === 'md') {
            const field = this.settingsProvider.settings.frontmatterIconField;
            const { success } = await this.writeFrontmatterValue(file, field, iconId, 'icon');
            if (success) {
                // Remove from settings to avoid duplication
                await this.clearSettingsEntry('fileIcons', filePath);
                return;
            }
        }

        // Fall back to settings-based storage
        await this.setEntityIcon(ItemType.FILE, filePath, iconId);
    }

    /**
     * Removes an icon from a file, clearing from frontmatter if enabled, otherwise from settings
     * @param filePath - Path to the file
     */
    async removeFileIcon(filePath: string): Promise<void> {
        const file = this.getFile(filePath);
        // Try to remove from frontmatter first if enabled and file is markdown
        if (file && this.shouldUseFrontmatterForFiles() && file.extension === 'md') {
            const field = this.settingsProvider.settings.frontmatterIconField;
            const { success } = await this.writeFrontmatterValue(file, field, null, 'icon');
            if (success) {
                // Also clear from settings in case it was stored there
                await this.clearSettingsEntry('fileIcons', filePath);
                return;
            }
        }

        // Fall back to settings-based storage
        await this.removeEntityIcon(ItemType.FILE, filePath);
    }

    /**
     * Gets the icon for a file from settings storage
     * @param filePath - Path to the file
     * @returns Icon identifier or undefined if no icon is set
     */
    getFileIcon(filePath: string): string | undefined {
        return this.getEntityIcon(ItemType.FILE, filePath);
    }

    /**
     * Sets a color for a file, storing in frontmatter if enabled, otherwise in settings
     * @param filePath - Path to the file
     * @param color - Color value to set
     */
    async setFileColor(filePath: string, color: string): Promise<void> {
        if (!this.validateColor(color)) {
            return;
        }

        const file = this.getFile(filePath);
        if (!file) {
            return;
        }

        // Try to save to frontmatter first if enabled and file is markdown
        if (this.shouldUseFrontmatterForFiles() && file.extension === 'md') {
            const field = this.settingsProvider.settings.frontmatterColorField;
            const { success } = await this.writeFrontmatterValue(file, field, color, 'color');
            if (success) {
                // Remove from settings to avoid duplication
                await this.clearSettingsEntry('fileColors', filePath);
                return;
            }
        }

        // Fall back to settings-based storage
        await this.setEntityColor(ItemType.FILE, filePath, color);
    }

    /**
     * Removes a color from a file, clearing from frontmatter if enabled, otherwise from settings
     * @param filePath - Path to the file
     */
    async removeFileColor(filePath: string): Promise<void> {
        const file = this.getFile(filePath);
        // Try to remove from frontmatter first if enabled and file is markdown
        if (file && this.shouldUseFrontmatterForFiles() && file.extension === 'md') {
            const field = this.settingsProvider.settings.frontmatterColorField;
            const { success } = await this.writeFrontmatterValue(file, field, null, 'color');
            if (success) {
                // Also clear from settings in case it was stored there
                await this.clearSettingsEntry('fileColors', filePath);
                return;
            }
        }

        // Fall back to settings-based storage
        await this.removeEntityColor(ItemType.FILE, filePath);
    }

    /**
     * Sets a background color for a file, storing in frontmatter if enabled, otherwise in settings
     * @param filePath - Path to the file
     * @param color - Background color value to set
     */
    async setFileBackgroundColor(filePath: string, color: string): Promise<void> {
        if (!this.validateColor(color)) {
            return;
        }

        const file = this.getFile(filePath);
        if (!file) {
            return;
        }

        if (this.shouldUseFrontmatterForFiles() && file.extension === 'md') {
            const field = this.settingsProvider.settings.frontmatterBackgroundField;
            const { success } = await this.writeFrontmatterValue(file, field, color, 'background');
            if (success) {
                await this.clearSettingsEntry('fileBackgroundColors', filePath);
                return;
            }
        }

        await this.setEntityBackgroundColor(ItemType.FILE, filePath, color);
    }

    /**
     * Removes a background color from a file, clearing from frontmatter if enabled, otherwise from settings
     * @param filePath - Path to the file
     */
    async removeFileBackgroundColor(filePath: string): Promise<void> {
        const file = this.getFile(filePath);
        if (file && this.shouldUseFrontmatterForFiles() && file.extension === 'md') {
            const field = this.settingsProvider.settings.frontmatterBackgroundField;
            const { success } = await this.writeFrontmatterValue(file, field, null, 'background');
            if (success) {
                await this.clearSettingsEntry('fileBackgroundColors', filePath);
                return;
            }
        }

        await this.removeEntityBackgroundColor(ItemType.FILE, filePath);
    }

    /**
     * Migrates all file icons and color metadata from settings storage to frontmatter
     * Only processes markdown files and only when frontmatter storage is enabled
     * @returns Statistics about the migration including successes and failures
     */
    async migrateSettingsToFrontmatter(): Promise<FileMetadataMigrationResult> {
        const settings = this.settingsProvider.settings;
        const iconsBefore = Object.keys(settings.fileIcons || {}).length;
        const colorsBefore = Object.keys(settings.fileColors || {}).length + Object.keys(settings.fileBackgroundColors || {}).length;

        // Early return if frontmatter storage is not enabled
        if (!this.shouldUseFrontmatterForFiles()) {
            return {
                iconsBefore,
                colorsBefore,
                migratedIcons: 0,
                migratedColors: 0,
                filesUpdated: 0,
                failures: 0
            };
        }

        const iconEntries = Object.entries(settings.fileIcons || {});
        const colorEntries = Object.entries(settings.fileColors || {});
        const backgroundEntries = Object.entries(settings.fileBackgroundColors || {});
        const migratedFiles = new Set<string>();
        let migratedIcons = 0;
        let migratedColors = 0;
        let failures = 0;

        const iconField = settings.frontmatterIconField.trim();
        const colorField = settings.frontmatterColorField.trim();
        const backgroundField = settings.frontmatterBackgroundField.trim();
        const canMigrateIcons = iconField.length > 0;
        const canMigrateColors = colorField.length > 0;
        const canMigrateBackgrounds = backgroundField.length > 0;

        // Migrate all icons
        if (canMigrateIcons) {
            for (const [path, iconId] of iconEntries) {
                const file = this.getFile(path);
                if (!file || file.extension !== 'md') {
                    failures += 1;
                    continue;
                }

                const { success } = await this.writeFrontmatterValue(file, iconField, iconId, 'icon');
                if (success) {
                    await this.clearSettingsEntry('fileIcons', path);
                    migratedFiles.add(path);
                    migratedIcons += 1;
                } else {
                    failures += 1;
                }
            }
        }

        // Migrate all colors
        if (canMigrateColors) {
            for (const [path, color] of colorEntries) {
                const file = this.getFile(path);
                if (!file || file.extension !== 'md') {
                    failures += 1;
                    continue;
                }

                const { success } = await this.writeFrontmatterValue(file, colorField, color, 'color');
                if (success) {
                    await this.clearSettingsEntry('fileColors', path);
                    migratedFiles.add(path);
                    migratedColors += 1;
                } else {
                    failures += 1;
                }
            }
        }

        if (canMigrateBackgrounds) {
            for (const [path, background] of backgroundEntries) {
                const file = this.getFile(path);
                if (!file || file.extension !== 'md') {
                    failures += 1;
                    continue;
                }

                const { success } = await this.writeFrontmatterValue(file, backgroundField, background, 'background');
                if (success) {
                    await this.clearSettingsEntry('fileBackgroundColors', path);
                    migratedFiles.add(path);
                    migratedColors += 1;
                } else {
                    failures += 1;
                }
            }
        }

        return {
            iconsBefore,
            colorsBefore,
            migratedIcons,
            migratedColors,
            filesUpdated: migratedFiles.size,
            failures
        };
    }

    /**
     * Gets the color for a file from settings storage
     * @param filePath - Path to the file
     * @returns Color value or undefined if no color is set
     */
    getFileColor(filePath: string): string | undefined {
        return this.getEntityColor(ItemType.FILE, filePath) ?? undefined;
    }

    /**
     * Gets the background color for a file from settings storage
     * @param filePath - Path to the file
     * @returns Background color value or undefined if no background color is set
     */
    getFileBackgroundColor(filePath: string): string | undefined {
        return this.getEntityBackgroundColor(ItemType.FILE, filePath) ?? undefined;
    }

    /**
     * Clean up pinned notes using pre-loaded validators
     * @param validators - Pre-loaded data containing vault files
     * @returns True if any metadata was removed/changed
     */
    async cleanupWithValidators(
        validators: CleanupValidators,
        targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings
    ): Promise<boolean> {
        let hasChanges = false;
        const pinnedNotes = targetSettings.pinnedNotes;
        if (pinnedNotes && Object.keys(pinnedNotes).length > 0) {
            const invalidPaths = Object.keys(pinnedNotes).filter(path => !validators.vaultFiles.has(path));

            if (invalidPaths.length > 0) {
                if (targetSettings === this.settingsProvider.settings) {
                    await this.saveAndUpdate(settings => {
                        invalidPaths.forEach(path => {
                            if (settings.pinnedNotes) {
                                delete settings.pinnedNotes[path];
                            }
                        });
                    });
                } else {
                    invalidPaths.forEach(path => {
                        if (targetSettings.pinnedNotes) {
                            delete targetSettings.pinnedNotes[path];
                        }
                    });
                }

                hasChanges = true;
            }
        }

        const fileIconCleanup = await this.cleanupMetadata(targetSettings, 'fileIcons', path => validators.vaultFiles.has(path));
        const fileColorCleanup = await this.cleanupMetadata(targetSettings, 'fileColors', path => validators.vaultFiles.has(path));
        const fileBackgroundCleanup = await this.cleanupMetadata(targetSettings, 'fileBackgroundColors', path =>
            validators.vaultFiles.has(path)
        );

        return hasChanges || fileIconCleanup || fileColorCleanup || fileBackgroundCleanup;
    }

    /**
     * Clean up pinned notes for files that don't exist
     * @returns True if any changes were made
     */
    async cleanupPinnedNotes(targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings): Promise<boolean> {
        const vaultFiles = new Set(this.app.vault.getFiles().map(f => f.path));
        return this.cleanupWithValidators(
            {
                vaultFiles,
                vaultFolders: new Set(),
                dbFiles: [],
                tagTree: new Map()
            },
            targetSettings
        );
    }
}
