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
import type { ISettingsProvider } from '../../interfaces/ISettingsProvider';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../../types';
import type { CleanupValidators } from '../MetadataService';
import { getDBInstance } from '../../storage/fileOperations';
import {
    createConfiguredPropertyNodeValidator,
    getPropertyKeyNodeIdFromNodeId,
    normalizePropertyKeyNodeId,
    normalizePropertyNodeId
} from '../../utils/propertyTree';
import { casefold, cleanupCollapsedPinnedContextKeys } from '../../utils/recordUtils';
import { getActivePropertyFields } from '../../utils/vaultProfiles';
import { BaseMetadataService } from './BaseMetadataService';

export interface PropertyColorData {
    color?: string;
    background?: string;
}

export class PropertyMetadataService extends BaseMetadataService {
    constructor(app: App, settingsProvider: ISettingsProvider) {
        super(app, settingsProvider);
    }

    async setPropertyColor(nodeId: string, color: string): Promise<void> {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.setEntityColor(ItemType.PROPERTY, normalized, color);
    }

    async setPropertyBackgroundColor(nodeId: string, color: string): Promise<void> {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.setEntityBackgroundColor(ItemType.PROPERTY, normalized, color);
    }

    async removePropertyColor(nodeId: string): Promise<void> {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.removeEntityColor(ItemType.PROPERTY, normalized);
    }

    async removePropertyBackgroundColor(nodeId: string): Promise<void> {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.removeEntityBackgroundColor(ItemType.PROPERTY, normalized);
    }

    private resolvePropertyColorData(normalizedNodeId: string, includeColor: boolean, includeBackground: boolean): PropertyColorData {
        let resolvedColor = includeColor ? this.getEntityColor(ItemType.PROPERTY, normalizedNodeId) : undefined;
        let resolvedBackground = includeBackground ? this.getEntityBackgroundColor(ItemType.PROPERTY, normalizedNodeId) : undefined;

        const shouldInherit =
            this.settingsProvider.settings.inheritPropertyColors &&
            ((includeColor && !resolvedColor) || (includeBackground && !resolvedBackground));

        if (!shouldInherit) {
            return { color: resolvedColor, background: resolvedBackground };
        }

        const keyNodeId = getPropertyKeyNodeIdFromNodeId(normalizedNodeId);
        if (!keyNodeId || keyNodeId === normalizedNodeId) {
            return { color: resolvedColor, background: resolvedBackground };
        }

        if (includeColor && !resolvedColor) {
            resolvedColor = this.getEntityColor(ItemType.PROPERTY, keyNodeId);
        }

        if (includeBackground && !resolvedBackground) {
            resolvedBackground = this.getEntityBackgroundColor(ItemType.PROPERTY, keyNodeId);
        }

        return { color: resolvedColor, background: resolvedBackground };
    }

    getPropertyColorData(nodeId: string): PropertyColorData {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return {};
        }

        return this.resolvePropertyColorData(normalized, true, true);
    }

    getPropertyColor(nodeId: string): string | undefined {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return undefined;
        }

        return this.resolvePropertyColorData(normalized, true, false).color;
    }

    getPropertyBackgroundColor(nodeId: string): string | undefined {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return undefined;
        }

        return this.resolvePropertyColorData(normalized, false, true).background;
    }

    async setPropertyIcon(nodeId: string, iconId: string): Promise<void> {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.setEntityIcon(ItemType.PROPERTY, normalized, iconId);
    }

    async removePropertyIcon(nodeId: string): Promise<void> {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.removeEntityIcon(ItemType.PROPERTY, normalized);
    }

    getPropertyIcon(nodeId: string): string | undefined {
        const normalized = normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return undefined;
        }

        return this.getEntityIcon(ItemType.PROPERTY, normalized);
    }

    async setPropertySortOverride(nodeId: string, sortOverride: ListSortOverrideValue): Promise<void> {
        const normalized = nodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID ? nodeId : normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.setEntitySortOverride(ItemType.PROPERTY, normalized, sortOverride);
    }

    async removePropertySortOverride(nodeId: string): Promise<void> {
        const normalized = nodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID ? nodeId : normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return Promise.resolve();
        }

        return this.removeEntitySortOverride(ItemType.PROPERTY, normalized);
    }

    getPropertySortOverride(nodeId: string): ListSortOverrideValue | undefined {
        const normalized = nodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID ? nodeId : normalizePropertyNodeId(nodeId);
        if (!normalized) {
            return undefined;
        }

        return this.getEntitySortOverride(ItemType.PROPERTY, normalized);
    }

    async setPropertyChildSortOrderOverride(nodeId: string, sortOrder: AlphaSortOrder): Promise<void> {
        const keyNodeId = normalizePropertyKeyNodeId(nodeId);
        if (!keyNodeId) {
            return Promise.resolve();
        }

        return this.setEntityChildSortOrderOverride(ItemType.PROPERTY, keyNodeId, sortOrder);
    }

    async removePropertyChildSortOrderOverride(nodeId: string): Promise<void> {
        const keyNodeId = normalizePropertyKeyNodeId(nodeId);
        if (!keyNodeId) {
            return Promise.resolve();
        }

        return this.removeEntityChildSortOrderOverride(ItemType.PROPERTY, keyNodeId);
    }

    getPropertyChildSortOrderOverride(nodeId: string): AlphaSortOrder | undefined {
        const keyNodeId = normalizePropertyKeyNodeId(nodeId);
        if (!keyNodeId) {
            return undefined;
        }

        return this.getEntityChildSortOrderOverride(ItemType.PROPERTY, keyNodeId);
    }

    private createPropertyNodeValidator(
        targetSettings: NotebookNavigatorSettings,
        validators: CleanupValidators
    ): (nodeId: string) => boolean {
        const validator =
            createConfiguredPropertyNodeValidator({
                propertyFields: getActivePropertyFields(targetSettings),
                dbFiles: validators.dbFiles
            }) ?? (() => false);

        return nodeId => nodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID || validator(nodeId);
    }

    private collectExistingPropertyKeys(validators: CleanupValidators): ReadonlySet<string> {
        const keys = new Set<string>();

        validators.dbFiles.forEach(file => {
            const properties = file.data.properties;
            if (!properties || properties.length === 0) {
                return;
            }

            properties.forEach(entry => {
                const normalizedKey = casefold(entry.fieldKey);
                if (normalizedKey) {
                    keys.add(normalizedKey);
                }
            });
        });

        return keys;
    }

    private pruneConfiguredPropertyKeys(targetSettings: NotebookNavigatorSettings, existingPropertyKeys: ReadonlySet<string>): boolean {
        if (!Array.isArray(targetSettings.vaultProfiles) || targetSettings.vaultProfiles.length === 0) {
            return false;
        }

        let changed = false;

        targetSettings.vaultProfiles.forEach(profile => {
            if (!Array.isArray(profile.propertyKeys) || profile.propertyKeys.length === 0) {
                return;
            }

            const nextPropertyKeys = profile.propertyKeys.filter(entry => {
                const normalizedKey = typeof entry?.key === 'string' ? casefold(entry.key) : '';
                return normalizedKey.length > 0 && existingPropertyKeys.has(normalizedKey);
            });

            if (nextPropertyKeys.length === profile.propertyKeys.length) {
                return;
            }

            profile.propertyKeys = nextPropertyKeys;
            changed = true;
        });

        return changed;
    }

    async cleanupPropertyMetadata(targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings): Promise<boolean> {
        const validators: CleanupValidators = {
            dbFiles: getDBInstance().getAllFiles(),
            tagTree: new Map(),
            vaultFiles: new Set(),
            vaultFolders: new Set()
        };
        return this.cleanupWithValidators(validators, targetSettings);
    }

    async cleanupWithValidators(
        validators: CleanupValidators,
        targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings
    ): Promise<boolean> {
        const validator = this.createPropertyNodeValidator(targetSettings, validators);
        const existingPropertyKeys = this.collectExistingPropertyKeys(validators);
        const collapsedPinnedContextChanges = cleanupCollapsedPinnedContextKeys(
            targetSettings.collapsedPinnedContexts,
            ItemType.PROPERTY,
            validator
        );
        const results = await Promise.all([
            this.cleanupMetadata(targetSettings, 'propertyColors', validator),
            this.cleanupMetadata(targetSettings, 'propertyBackgroundColors', validator),
            this.cleanupMetadata(targetSettings, 'propertyIcons', validator),
            this.cleanupMetadata(targetSettings, 'propertySortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'propertyTreeSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'propertyAppearances', validator)
        ]);
        const propertyKeyChanges = this.pruneConfiguredPropertyKeys(targetSettings, existingPropertyKeys);

        return collapsedPinnedContextChanges || propertyKeyChanges || results.some(changed => changed);
    }
}
