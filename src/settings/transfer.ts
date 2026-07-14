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

import { DEFAULT_SETTINGS } from './defaultSettings';
import type { NotebookNavigatorSettings } from './types';
import { isRecord } from '../utils/typeGuards';

// These keys are stored locally or regenerated from local state and are intentionally excluded
// from transfer exports and imports.
const NON_TRANSFERABLE_SETTING_KEYS = new Set([
    'hiddenTags',
    'fileVisibility',
    'recentColors',
    'lastReleaseCheckAt',
    'latestKnownRelease',
    'searchProvider',
    'showCalendar',
    'calendarCustomPromptForTitle',
    'saveMetadataToFrontmatter',
    'propertyFields'
]);

const SETTINGS_TRANSFER_PLUGIN_ID = 'notebook-navigator';

function padTimestampPart(value: number): string {
    return value.toString().padStart(2, '0');
}

function formatSettingsTransferTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = padTimestampPart(date.getMonth() + 1);
    const day = padTimestampPart(date.getDate());
    const hours = padTimestampPart(date.getHours());
    const minutes = padTimestampPart(date.getMinutes());
    const seconds = padTimestampPart(date.getSeconds());

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export function createSettingsTransferBaseName(date = new Date()): string {
    return `notebook-navigator-settings_${formatSettingsTransferTimestamp(date)}`;
}

export function createSettingsTransferFilename(date = new Date()): string {
    return `${createSettingsTransferBaseName(date)}.json`;
}

function createImportBaseSettings(currentSettings: NotebookNavigatorSettings): Record<string, unknown> {
    const nextSettings = structuredClone(DEFAULT_SETTINGS) as unknown as Record<string, unknown>;
    const currentSettingsRecord = currentSettings as unknown as Record<string, unknown>;

    NON_TRANSFERABLE_SETTING_KEYS.forEach(key => {
        if (!hasOwnKey(currentSettingsRecord, key)) {
            return;
        }

        nextSettings[key] = structuredClone(currentSettingsRecord[key]);
    });

    return nextSettings;
}

function createFilteredTransferValue(base: unknown, current: unknown): unknown {
    if (Array.isArray(base)) {
        return Array.isArray(current) ? structuredClone(current) : structuredClone(base);
    }

    if (isRecord(base)) {
        if (!isRecord(current)) {
            return structuredClone(base);
        }

        const baseKeys = Object.keys(base);
        if (baseKeys.length === 0) {
            return structuredClone(current);
        }

        const result: Record<string, unknown> = {};
        baseKeys.forEach(key => {
            if (!hasOwnKey(current, key)) {
                result[key] = structuredClone(base[key]);
                return;
            }

            result[key] = createFilteredTransferValue(base[key], current[key]);
        });

        return result;
    }

    return structuredClone(current);
}

function createTransferableSettingsSnapshot(settings: NotebookNavigatorSettings): Record<string, unknown> {
    const snapshotRecord: Record<string, unknown> = {};
    const settingsRecord = settings as unknown as Record<string, unknown>;
    const defaultRecord = DEFAULT_SETTINGS as unknown as Record<string, unknown>;

    Object.keys(defaultRecord).forEach(key => {
        if (NON_TRANSFERABLE_SETTING_KEYS.has(key)) {
            return;
        }

        snapshotRecord[key] = createFilteredTransferValue(defaultRecord[key], settingsRecord[key]);
    });

    return snapshotRecord;
}

function hasOwnKey(record: Record<string, unknown>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(record, key) === true;
}

function isTransferableSettingKey(key: string): boolean {
    const defaultRecord = DEFAULT_SETTINGS as unknown as Record<string, unknown>;
    return hasOwnKey(defaultRecord, key) && !NON_TRANSFERABLE_SETTING_KEYS.has(key);
}

function validateSettingsTransferDiff(transferSettings: Record<string, unknown>): void {
    const transferKeys = Object.keys(transferSettings);
    if (transferKeys.length === 0 || transferKeys.some(isTransferableSettingKey)) {
        return;
    }

    throw new Error('Settings import must contain Notebook Navigator settings.');
}

function areEquivalentValues(left: unknown, right: unknown): boolean {
    if (left === right) {
        return true;
    }

    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
            return false;
        }

        return left.every((value, index) => areEquivalentValues(value, right[index]));
    }

    if (isRecord(left) || isRecord(right)) {
        if (!isRecord(left) || !isRecord(right)) {
            return false;
        }

        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        if (leftKeys.length !== rightKeys.length) {
            return false;
        }

        return leftKeys.every(key => hasOwnKey(right, key) && areEquivalentValues(left[key], right[key]));
    }

    return false;
}

function createSettingsDiff(base: unknown, current: unknown): unknown {
    if (areEquivalentValues(base, current)) {
        return undefined;
    }

    if (Array.isArray(base) || Array.isArray(current)) {
        return structuredClone(current);
    }

    if (isRecord(base) && isRecord(current)) {
        const baseKeys = Object.keys(base);
        const currentKeys = Object.keys(current);
        const currentHasRemovedKeys = baseKeys.some(key => !hasOwnKey(current, key));

        if (currentHasRemovedKeys) {
            return structuredClone(current);
        }

        const diff: Record<string, unknown> = {};
        const keys = new Set([...baseKeys, ...currentKeys]);

        keys.forEach(key => {
            const nextValue = createSettingsDiff(base[key], current[key]);
            if (nextValue !== undefined) {
                diff[key] = nextValue;
            }
        });

        return Object.keys(diff).length > 0 ? diff : undefined;
    }

    return structuredClone(current);
}

function mergeSettingsDiff(base: unknown, override: unknown): unknown {
    if (override === undefined) {
        return structuredClone(base);
    }

    if (Array.isArray(base)) {
        if (!Array.isArray(override)) {
            return structuredClone(base);
        }

        if (base.length === 0) {
            return structuredClone(override);
        }

        return override.map(value => mergeSettingsDiff(base[0], value));
    }

    if (isRecord(base)) {
        if (!isRecord(override)) {
            return structuredClone(base);
        }

        const baseKeys = Object.keys(base);
        if (baseKeys.length === 0) {
            return structuredClone(override);
        }

        const result = structuredClone(base);

        baseKeys.forEach(key => {
            if (!hasOwnKey(override, key)) {
                return;
            }

            result[key] = mergeSettingsDiff(result[key], override[key]);
        });

        return result;
    }

    if (base === null) {
        return override === null || typeof override === 'string' ? structuredClone(override) : null;
    }

    return typeof override === typeof base ? structuredClone(override) : structuredClone(base);
}

export function createModifiedSettingsTransfer(settings: NotebookNavigatorSettings, pluginVersion: string): Record<string, unknown> {
    // Export only the transferable settings that differ from defaults, wrapped in an
    // envelope identifying the plugin and version that produced the export.
    // Import reconstructs the transferable settings state from this diff plus defaults.
    const currentSnapshot = createTransferableSettingsSnapshot(settings);
    const defaultSnapshot = createTransferableSettingsSnapshot(DEFAULT_SETTINGS);
    const diff = createSettingsDiff(defaultSnapshot, currentSnapshot);

    return {
        plugin: SETTINGS_TRANSFER_PLUGIN_ID,
        pluginVersion,
        settings: isRecord(diff) ? diff : {}
    };
}

// Unwraps the settings diff from an export envelope. Objects without a `plugin` key are
// treated as bare diffs from exports created before the envelope format.
function unwrapSettingsTransfer(transferData: Record<string, unknown>): Record<string, unknown> {
    if (!hasOwnKey(transferData, 'plugin')) {
        validateSettingsTransferDiff(transferData);
        return transferData;
    }

    if (transferData.plugin !== SETTINGS_TRANSFER_PLUGIN_ID) {
        throw new Error('Not a Notebook Navigator settings export.');
    }

    const transferSettings = transferData.settings;
    if (!isRecord(transferSettings)) {
        throw new Error('Settings import must contain a settings object.');
    }

    validateSettingsTransferDiff(transferSettings);

    return transferSettings;
}

export function applyModifiedSettingsTransfer(currentSettings: NotebookNavigatorSettings, transferData: unknown): Record<string, unknown> {
    if (!isRecord(transferData)) {
        throw new Error('Settings import must be a JSON object.');
    }

    const transferSettings = unwrapSettingsTransfer(transferData);

    // Import is state restore, not patch merge.
    // Missing transferable keys are restored to their default values.
    const defaultSnapshot = createTransferableSettingsSnapshot(DEFAULT_SETTINGS);
    const mergedSnapshot = mergeSettingsDiff(defaultSnapshot, transferSettings);
    if (!isRecord(mergedSnapshot)) {
        throw new Error('Settings import must be a JSON object.');
    }

    const nextSettingsRecord = createImportBaseSettings(currentSettings);

    Object.entries(defaultSnapshot).forEach(([key]) => {
        nextSettingsRecord[key] = mergedSnapshot[key];
    });

    return nextSettingsRecord;
}
