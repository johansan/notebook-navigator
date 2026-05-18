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

import { TFile, TFolder } from 'obsidian';
import {
    normalizeListSortOverride,
    type AlphabeticalDateMode,
    type AlphaSortOrder,
    type ListSortOverrideValue,
    type SortOption,
    type NotebookNavigatorSettings,
    type PropertySortSecondaryOption
} from '../settings/types';
import { NavigationItemType, ItemType, type ItemType as ItemTypeValue } from '../types';
import { casefold, getMatchingRecordValue } from './recordUtils';
import { isRecord } from './typeGuards';
import type { UXIconId } from './uxIcons';

export function isDateSortOption(sortOption: SortOption): boolean {
    return sortOption.startsWith('modified') || sortOption.startsWith('created');
}

function isAlphabeticalSortOption(sortOption: SortOption): boolean {
    return !isDateSortOption(sortOption);
}

export function isPropertySortOption(sortOption: SortOption): sortOption is 'property-asc' | 'property-desc' {
    return sortOption === 'property-asc' || sortOption === 'property-desc';
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'modified' | 'created' | 'title' | 'filename' | 'property';

export interface EffectiveListSort {
    option: SortOption;
    propertyKey: string;
    propertySortSecondary: PropertySortSecondaryOption;
}

export type SortOverrideRecordKey = 'folderSortOverrides' | 'tagSortOverrides' | 'propertySortOverrides';
type PropertySortKeyMapper = (key: string, normalizedKey: string) => string | null;

export const SORT_OVERRIDE_RECORD_KEYS: readonly SortOverrideRecordKey[] = [
    'folderSortOverrides',
    'tagSortOverrides',
    'propertySortOverrides'
];

const SORT_FIELD_TOOLBAR_ICON_IDS: Record<SortField, UXIconId> = {
    modified: 'list-sort-modified',
    created: 'list-sort-created',
    title: 'list-sort-title',
    filename: 'list-sort-filename',
    property: 'list-sort-property'
};

function normalizePropertySortKeyList(value: unknown, mapper?: PropertySortKeyMapper): string[] {
    if (typeof value !== 'string') {
        return [];
    }

    const keys: string[] = [];
    const seen = new Set<string>();

    value.split(',').forEach(rawKey => {
        const key = rawKey.trim();
        const normalizedKey = casefold(key);
        if (!normalizedKey) {
            return;
        }

        const nextKey = mapper ? mapper(key, normalizedKey) : key;
        if (!nextKey) {
            return;
        }

        const normalizedNextKey = casefold(nextKey);
        if (!normalizedNextKey || seen.has(normalizedNextKey)) {
            return;
        }

        seen.add(normalizedNextKey);
        keys.push(nextKey);
    });

    return keys;
}

export function parsePropertySortKeys(value: unknown): string[] {
    return normalizePropertySortKeyList(value);
}

export function getMatchingPropertySortKey(value: unknown, propertyKey: string): string {
    const normalizedPropertyKey = casefold(propertyKey);
    if (!normalizedPropertyKey) {
        return '';
    }

    return parsePropertySortKeys(value).find(configuredKey => casefold(configuredKey) === normalizedPropertyKey) ?? '';
}

export function appendPropertySortKey(value: unknown, propertyKey: string): string {
    const key = propertyKey.trim();
    const normalizedKey = casefold(key);
    const keys = parsePropertySortKeys(value);

    if (!normalizedKey) {
        return keys.join(', ');
    }

    if (keys.some(configuredKey => casefold(configuredKey) === normalizedKey)) {
        return keys.join(', ');
    }

    return [...keys, key].join(', ');
}

export function getManualSortPropertyKey(settings: Pick<NotebookNavigatorSettings, 'manualSortPropertyKey'>): string {
    return typeof settings.manualSortPropertyKey === 'string' ? settings.manualSortPropertyKey.trim() : '';
}

export function isManualSortPropertyKey(settings: Pick<NotebookNavigatorSettings, 'manualSortPropertyKey'>, propertyKey: string): boolean {
    const normalizedManualSortPropertyKey = casefold(getManualSortPropertyKey(settings));
    return normalizedManualSortPropertyKey.length > 0 && casefold(propertyKey.trim()) === normalizedManualSortPropertyKey;
}

function extractPropertySortParts(value: unknown): string[] {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? [trimmed] : [];
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? [value.toString()] : [];
    }

    if (typeof value === 'boolean') {
        return [value ? 'true' : 'false'];
    }

    if (Array.isArray(value)) {
        const parts: string[] = [];
        for (const entry of value) {
            parts.push(...extractPropertySortParts(entry));
        }
        return parts;
    }

    return [];
}

export function getPropertySortValueFromRecord(frontmatter: unknown, propertyKey: string): string | null {
    if (!isRecord(frontmatter)) {
        return null;
    }

    const parts = extractPropertySortParts(getMatchingRecordValue(frontmatter, propertyKey));
    if (parts.length === 0) {
        return null;
    }

    const joined = parts.join(' ').trim();
    return joined.length > 0 ? joined : null;
}

export function replacePropertySortKey(value: string, oldKeyNormalized: string, newKeyDisplay: string | null): string {
    return normalizePropertySortKeyList(value, (key, normalizedKey) => (normalizedKey === oldKeyNormalized ? newKeyDisplay : key)).join(
        ', '
    );
}

export function getSortDirection(sortOption: SortOption): SortDirection {
    return sortOption.endsWith('-desc') ? 'desc' : 'asc';
}

export function getSortField(sortOption: SortOption): SortField {
    if (sortOption.startsWith('modified')) {
        return 'modified';
    }
    if (sortOption.startsWith('created')) {
        return 'created';
    }
    if (sortOption.startsWith('title')) {
        return 'title';
    }
    if (sortOption.startsWith('filename')) {
        return 'filename';
    }
    return 'property';
}

export function buildSortOption(field: SortField, direction: SortDirection): SortOption {
    return `${field}-${direction}`;
}

export function createListSortOverride(option: SortOption, propertyKey?: string | null): ListSortOverrideValue {
    const normalizedPropertyKey = propertyKey?.trim() ?? '';
    if (isPropertySortOption(option) && normalizedPropertyKey.length > 0) {
        return { option, propertyKey: normalizedPropertyKey };
    }

    return option;
}

export function cloneListSortOverride(sortOverride: ListSortOverrideValue): ListSortOverrideValue {
    return typeof sortOverride === 'string' ? sortOverride : { ...sortOverride };
}

export function pruneUnavailablePropertySortOverrides(settings: NotebookNavigatorSettings): boolean {
    const configuredPropertyKeys = parsePropertySortKeys(settings.propertySortKey);
    const configuredPropertyKeySet = new Set(configuredPropertyKeys.map(key => casefold(key)));
    const manualSortPropertyKey = getManualSortPropertyKey(settings);
    const availablePropertyKeys = new Set(configuredPropertyKeySet);
    const normalizedManualSortPropertyKey = casefold(manualSortPropertyKey);
    if (normalizedManualSortPropertyKey) {
        availablePropertyKeys.add(normalizedManualSortPropertyKey);
    }
    let changed = false;

    SORT_OVERRIDE_RECORD_KEYS.forEach(recordKey => {
        const record = settings[recordKey] as Record<string, ListSortOverrideValue> | undefined;
        if (!record) {
            return;
        }

        Object.keys(record).forEach(key => {
            const normalizedOverride = normalizeListSortOverride((record as Record<string, unknown>)[key]);
            if (!normalizedOverride) {
                return;
            }

            if (typeof normalizedOverride === 'string') {
                if (configuredPropertyKeySet.size === 0 && isPropertySortOption(normalizedOverride)) {
                    delete record[key];
                    changed = true;
                }
                return;
            }

            const normalizedPropertyKey = casefold(normalizedOverride.propertyKey ?? '');
            if (!normalizedPropertyKey || availablePropertyKeys.has(normalizedPropertyKey)) {
                return;
            }

            delete record[key];
            changed = true;
        });
    });

    return changed;
}

function getMatchingConfiguredPropertySortKey(configuredPropertyKeys: readonly string[], propertyKey: string): string {
    const normalizedPropertyKey = casefold(propertyKey);
    if (!normalizedPropertyKey) {
        return '';
    }

    return configuredPropertyKeys.find(configuredKey => casefold(configuredKey) === normalizedPropertyKey) ?? '';
}

function getMatchingAvailablePropertySortKey(
    configuredPropertyKeys: readonly string[],
    manualSortPropertyKey: string,
    propertyKey: string
): string {
    if (manualSortPropertyKey && casefold(propertyKey) === casefold(manualSortPropertyKey)) {
        return manualSortPropertyKey;
    }

    return getMatchingConfiguredPropertySortKey(configuredPropertyKeys, propertyKey);
}

function getListSortOverrideSignature(sortOverride: ListSortOverrideValue | undefined): string {
    const normalized = normalizeListSortOverride(sortOverride);
    if (!normalized) {
        return '';
    }

    if (typeof normalized === 'string') {
        return normalized;
    }

    return `${normalized.option}\u0000${casefold(normalized.propertyKey ?? '')}`;
}

export function areListSortOverridesEqual(a: ListSortOverrideValue | undefined, b: ListSortOverrideValue | undefined): boolean {
    return getListSortOverrideSignature(a) === getListSortOverrideSignature(b);
}

export function shouldRefreshOnFileModifyForSort(sortOption: SortOption, propertySortSecondary: PropertySortSecondaryOption): boolean {
    return sortOption.startsWith('modified') || (isPropertySortOption(sortOption) && propertySortSecondary === 'modified');
}

export function shouldRefreshOnMetadataChangeForSort(params: {
    sortOption: SortOption;
    propertySortKey: string;
    propertySortSecondary: PropertySortSecondaryOption;
    useFrontmatterMetadata: boolean;
    frontmatterNameField: string;
    frontmatterCreatedField: string;
    frontmatterModifiedField: string;
}): boolean {
    const {
        sortOption,
        propertySortKey,
        propertySortSecondary,
        useFrontmatterMetadata,
        frontmatterNameField,
        frontmatterCreatedField,
        frontmatterModifiedField
    } = params;
    if (!isPropertySortOption(sortOption)) {
        // Date/title sorts depend on frontmatter values when configured; metadata changes must refresh the ordering.
        if (!useFrontmatterMetadata) {
            return false;
        }

        if (sortOption.startsWith('created')) {
            return frontmatterCreatedField.trim().length > 0;
        }

        if (sortOption.startsWith('modified')) {
            return frontmatterModifiedField.trim().length > 0;
        }

        if (sortOption.startsWith('title')) {
            return frontmatterNameField.trim().length > 0;
        }

        return false;
    }

    if (propertySortKey.trim().length > 0) {
        return true;
    }

    if (!useFrontmatterMetadata) {
        return false;
    }

    if (propertySortSecondary === 'created') {
        return frontmatterCreatedField.trim().length > 0;
    }

    if (propertySortSecondary === 'modified') {
        return frontmatterModifiedField.trim().length > 0;
    }

    if (propertySortSecondary === 'title') {
        return frontmatterNameField.trim().length > 0;
    }

    return false;
}

/**
 * Natural string comparison that treats digit sequences as numbers.
 */
const collatorCache = new Map<string, Intl.Collator>();

export function naturalCompare(a: string, b: string): number {
    const cacheKey = 'system';
    let collator = collatorCache.get(cacheKey);
    if (!collator) {
        collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base', usage: 'sort' });
        collatorCache.set(cacheKey, collator);
    }
    return collator.compare(a, b);
}

/**
 * Natural string comparison that applies alphabetical direction.
 */
export function compareByAlphaSortOrder(a: string, b: string, sortOrder: AlphaSortOrder): number {
    const cmp = naturalCompare(a, b);
    if (cmp === 0) {
        return 0;
    }
    return sortOrder === 'alpha-desc' ? -cmp : cmp;
}

interface FolderChildSortOrderSettings {
    folderSortOrder: AlphaSortOrder;
    folderTreeSortOverrides?: Readonly<Record<string, AlphaSortOrder>> | null;
}

/**
 * Resolves the effective child-folder alphabetical order for the given folder path.
 */
export function resolveFolderChildSortOrder(settings: FolderChildSortOrderSettings, folderPath: string): AlphaSortOrder {
    const overrides = settings.folderTreeSortOverrides;
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, folderPath)) {
        return overrides[folderPath] ?? settings.folderSortOrder;
    }

    return settings.folderSortOrder;
}

function compareTextValues(valueA: string, valueB: string, descending: boolean): number {
    const cmp = naturalCompare(valueA, valueB);
    if (cmp !== 0) {
        return descending ? -cmp : cmp;
    }
    if (valueA.length !== valueB.length) {
        return valueA.length - valueB.length;
    }
    return 0;
}

function compareDisplayNames(a: TFile, b: TFile, getDisplayName: ((file: TFile) => string) | undefined, descending: boolean): number {
    const nameA = getDisplayName ? getDisplayName(a) : a.basename;
    const nameB = getDisplayName ? getDisplayName(b) : b.basename;
    return compareTextValues(nameA, nameB, descending);
}

function compareFileNames(a: TFile, b: TFile, descending: boolean): number {
    return compareTextValues(a.basename, b.basename, descending);
}

function compareDates(a: TFile, b: TFile, getDate: (file: TFile) => number, descending: boolean): number {
    const cmp = getDate(a) - getDate(b);
    if (cmp === 0) {
        return 0;
    }
    return descending ? -cmp : cmp;
}

/**
 * Determines the effective sort option for a given context
 * @param settings - Plugin settings
 * @param selectionType - Active navigation scope
 * @param selectedFolder - The currently selected folder (if any)
 * @param selectedTag - The currently selected tag (if any)
 * @param selectedProperty - The currently selected property node id (if any)
 * @returns The sort option to use
 */
export function getEffectiveSortOption(
    settings: NotebookNavigatorSettings,
    selectionType: NavigationItemType,
    selectedFolder: TFolder | null,
    selectedTag?: string | null,
    selectedProperty?: string | null
): SortOption {
    return getEffectiveListSort(settings, selectionType, selectedFolder, selectedTag, selectedProperty).option;
}

export function resolveListSort(settings: NotebookNavigatorSettings, sortOverride?: ListSortOverrideValue): EffectiveListSort {
    const normalizedOverride = normalizeListSortOverride(sortOverride);
    const rawOption =
        typeof normalizedOverride === 'string' ? normalizedOverride : (normalizedOverride?.option ?? settings.defaultFolderSort);
    const configuredPropertyKeys = parsePropertySortKeys(settings.propertySortKey);
    const configuredPropertyKey = configuredPropertyKeys[0] ?? '';
    const manualSortPropertyKey = getManualSortPropertyKey(settings);
    const overridePropertyKey =
        typeof normalizedOverride === 'object'
            ? getMatchingAvailablePropertySortKey(configuredPropertyKeys, manualSortPropertyKey, normalizedOverride.propertyKey ?? '')
            : '';
    const propertyKey = isPropertySortOption(rawOption) ? overridePropertyKey || configuredPropertyKey : '';
    const option = rawOption === 'property-desc' && isManualSortPropertyKey(settings, propertyKey) ? 'property-asc' : rawOption;

    return {
        option,
        propertyKey,
        propertySortSecondary: settings.propertySortSecondary
    };
}

export function getListSortOverrideForSelection(
    settings: NotebookNavigatorSettings,
    selectionType: ItemTypeValue | null,
    selectedFolder: TFolder | null,
    selectedTag?: string | null,
    selectedProperty?: string | null
): ListSortOverrideValue | undefined {
    if (selectionType === ItemType.FOLDER && selectedFolder) {
        return settings.folderSortOverrides?.[selectedFolder.path];
    }
    if (selectionType === ItemType.TAG && selectedTag) {
        return settings.tagSortOverrides?.[selectedTag];
    }
    if (selectionType === ItemType.PROPERTY && selectedProperty) {
        return settings.propertySortOverrides?.[selectedProperty];
    }
    return undefined;
}

export function getEffectiveListSort(
    settings: NotebookNavigatorSettings,
    selectionType: NavigationItemType,
    selectedFolder: TFolder | null,
    selectedTag?: string | null,
    selectedProperty?: string | null
): EffectiveListSort {
    return resolveListSort(
        settings,
        getListSortOverrideForSelection(settings, selectionType, selectedFolder, selectedTag, selectedProperty)
    );
}

export function getListSortFieldIconId(field: SortField): UXIconId {
    return SORT_FIELD_TOOLBAR_ICON_IDS[field];
}

function getSortDirectionToolbarIconId(sortOption: SortOption): UXIconId {
    return sortOption.endsWith('-desc') ? 'list-sort-descending' : 'list-sort-ascending';
}

function haveSameSortField(left: EffectiveListSort, right: EffectiveListSort): boolean {
    const leftField = getSortField(left.option);
    const rightField = getSortField(right.option);
    if (leftField !== rightField) {
        return false;
    }

    if (leftField !== 'property') {
        return true;
    }

    return casefold(left.propertyKey) === casefold(right.propertyKey);
}

export function getListSortToolbarIconId(settings: NotebookNavigatorSettings, sortOverride?: ListSortOverrideValue): UXIconId {
    const currentSort = resolveListSort(settings, sortOverride);
    if (sortOverride === undefined) {
        return getSortDirectionToolbarIconId(currentSort.option);
    }

    const defaultSort = resolveListSort(settings);
    if (haveSameSortField(currentSort, defaultSort) && getSortDirection(currentSort.option) !== getSortDirection(defaultSort.option)) {
        return getSortDirectionToolbarIconId(currentSort.option);
    }

    return getListSortFieldIconId(getSortField(currentSort.option));
}

/**
 * Sorts an array of files according to the specified sort option using getter functions
 * @param files - Array of files to sort (will be mutated)
 * @param sortOption - How to sort the files
 * @param getCreatedTime - Function to get file created time
 * @param getModifiedTime - Function to get file modified time
 */
export function sortFiles(
    files: TFile[],
    sortOption: SortOption,
    getCreatedTime: (file: TFile) => number,
    getModifiedTime: (file: TFile) => number,
    getDisplayName?: (file: TFile) => string,
    getPropertyValue?: (file: TFile) => string | null,
    propertySortSecondary: PropertySortSecondaryOption = 'title'
): void {
    // Helper function to get timestamp for sorting
    const getTimestamp = (file: TFile, type: 'created' | 'modified'): number => {
        return type === 'created' ? getCreatedTime(file) : getModifiedTime(file);
    };

    switch (sortOption) {
        case 'modified-desc':
            files.sort((a, b) => getTimestamp(b, 'modified') - getTimestamp(a, 'modified'));
            break;
        case 'modified-asc':
            files.sort((a, b) => getTimestamp(a, 'modified') - getTimestamp(b, 'modified'));
            break;
        case 'created-desc':
            files.sort((a, b) => getTimestamp(b, 'created') - getTimestamp(a, 'created'));
            break;
        case 'created-asc':
            files.sort((a, b) => getTimestamp(a, 'created') - getTimestamp(b, 'created'));
            break;
        case 'title-asc':
            files.sort((a, b) => {
                const cmp = compareDisplayNames(a, b, getDisplayName, false);
                if (cmp !== 0) return cmp;
                return a.path.localeCompare(b.path);
            });
            break;
        case 'title-desc':
            files.sort((a, b) => {
                const cmp = compareDisplayNames(a, b, getDisplayName, true);
                if (cmp !== 0) return cmp;
                return a.path.localeCompare(b.path);
            });
            break;
        case 'filename-asc':
            files.sort((a, b) => {
                const cmp = compareFileNames(a, b, false);
                if (cmp !== 0) return cmp;
                return a.path.localeCompare(b.path);
            });
            break;
        case 'filename-desc':
            files.sort((a, b) => {
                const cmp = compareFileNames(a, b, true);
                if (cmp !== 0) return cmp;
                return a.path.localeCompare(b.path);
            });
            break;
        case 'property-asc':
        case 'property-desc': {
            const descending = sortOption === 'property-desc';
            files.sort((a, b) => {
                const valueA = getPropertyValue ? getPropertyValue(a) : null;
                const valueB = getPropertyValue ? getPropertyValue(b) : null;
                const hasValueA = Boolean(valueA);
                const hasValueB = Boolean(valueB);

                if (hasValueA !== hasValueB) {
                    return hasValueA ? -1 : 1;
                }

                if (hasValueA && hasValueB && valueA && valueB) {
                    const cmp = compareTextValues(valueA, valueB, descending);
                    if (cmp !== 0) {
                        return cmp;
                    }
                }

                let secondaryCmp: number;
                if (propertySortSecondary === 'created') {
                    secondaryCmp = compareDates(a, b, getCreatedTime, descending);
                } else if (propertySortSecondary === 'modified') {
                    secondaryCmp = compareDates(a, b, getModifiedTime, descending);
                } else if (propertySortSecondary === 'filename') {
                    secondaryCmp = compareFileNames(a, b, descending);
                } else {
                    secondaryCmp = compareDisplayNames(a, b, getDisplayName, descending);
                }
                if (secondaryCmp !== 0) {
                    return secondaryCmp;
                }

                if (propertySortSecondary !== 'title') {
                    const titleCmp = compareDisplayNames(a, b, getDisplayName, descending);
                    if (titleCmp !== 0) {
                        return titleCmp;
                    }
                }

                return a.path.localeCompare(b.path);
            });
            break;
        }
    }
}

/**
 * Gets the sort icon name based on sort option
 * @param sortOption - The current sort option
 * @returns Icon name for ObsidianIcon component
 */
export function getSortIcon(sortOption: SortOption): string {
    return sortOption.endsWith('-desc') ? 'lucide-sort-desc' : 'lucide-sort-asc';
}

/**
 * Gets the date field to use based on sort option
 * @param sortOption - The current sort option
 * @returns 'ctime' for created sorts, 'mtime' for others
 */
export function getDateField(sortOption: SortOption): 'ctime' | 'mtime' {
    return sortOption.startsWith('created') ? 'ctime' : 'mtime';
}

/**
 * Resolves which date field to use based on sort option and alphabetical date mode setting.
 * For date sorts, uses the sort field; for alphabetical sorts, uses the user preference.
 */
export function resolveDefaultDateField(sortOption: SortOption, alphabeticalDateMode: AlphabeticalDateMode): 'created' | 'modified' {
    if (isAlphabeticalSortOption(sortOption)) {
        return alphabeticalDateMode === 'created' ? 'created' : 'modified';
    }

    return getDateField(sortOption) === 'ctime' ? 'created' : 'modified';
}
