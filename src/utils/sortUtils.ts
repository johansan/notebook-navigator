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
import { DEFAULT_SETTINGS } from '../settings/defaultSettings';
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

/**
 * Returns the configured sorting property keys available as sort choices.
 * The manual-sort property is excluded because manual sort has its own menu entry and is never
 * offered as a regular property sort choice.
 */
export function getAvailablePropertySortKeys(
    settings: Pick<NotebookNavigatorSettings, 'propertySortKey' | 'manualSortPropertyKey'>
): string[] {
    return parsePropertySortKeys(settings.propertySortKey).filter(propertyKey => !isManualSortPropertyKey(settings, propertyKey));
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

/**
 * A frontmatter value converted the way Obsidian Bases converts note properties before sorting
 * them (`fromFrontMatter` in Obsidian 1.14). Bases reads the YAML type of the value and ignores the
 * type assigned to the property, so a quoted "-202" is text even in a Number property.
 * - `text` is what Bases compares when two values are not both numbers or both dates: a link's
 *   alias when it has one, otherwise the value's printed text.
 * - `truthy` is what Bases compares when either value is a boolean. It differs from `text` being
 *   empty: `[""]` and `[[Note|]]` are truthy with empty text.
 */
export type PropertySortValue =
    | { type: 'boolean'; value: boolean }
    | { type: 'number'; value: number }
    | { type: 'date'; time: number; text: string }
    | { type: 'text'; text: string; truthy: boolean };

// Bases reads only these ISO forms as dates; other date formats stay text.
const BASES_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(?:\.\d{1,9})?)?(Z|[+-]\d{2}(:?\d{2})?)?$/;
const BASES_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number, length = 2): string {
    return String(value).padStart(length, '0');
}

/**
 * Parses a string Bases reads as a date. A date without a time is local midnight. The text is how
 * Bases prints the date in local time, which is what it compares against non-date values.
 * Invalid dates such as "2024-13-45" still parse, with a NaN time, as they do in Bases.
 */
function parseBasesDate(value: string): { time: number; text: string } | null {
    const hasTime = BASES_DATE_TIME_PATTERN.test(value);
    if (!hasTime && !BASES_DATE_PATTERN.test(value)) {
        return null;
    }

    const date = new Date(hasTime ? value : `${value}T00:00:00`);
    const day = `${padDatePart(date.getFullYear(), 4)}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
    if (!hasTime) {
        return { time: date.getTime(), text: day };
    }
    const time = `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
    return { time: date.getTime(), text: `${day}T${time}` };
}

// Bases reads the `tags` property, in any letter case, as a tag list whose entries print with "#".
function isTagsKey(key: string | number): boolean {
    return typeof key === 'string' && key.toLowerCase() === 'tags';
}

function formatBasesTag(tag: string): string {
    return tag.charAt(0) === '#' ? tag : `#${tag}`;
}

/**
 * Prints a frontmatter value the way Bases' `Value.toString()` does, used for list entries and
 * object fields. Lists print string, number and boolean entries unchanged, so a date string inside
 * a list keeps its original text, while dates in object fields are reformatted. Links print as
 * their raw `[[target|alias]]` text here; only a top-level link compares by its alias.
 */
function getBasesValueText(key: string | number, value: unknown): string {
    if (value === null || value === undefined) {
        return 'null';
    }
    if (typeof value === 'string') {
        if (isTagsKey(key)) {
            return formatBasesTag(value);
        }
        return parseBasesDate(value)?.text ?? value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        if (isTagsKey(key) && value.every(entry => typeof entry === 'string')) {
            return value.map(formatBasesTag).join(', ');
        }
        return value
            .map((entry: unknown, index) =>
                typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean'
                    ? String(entry)
                    : getBasesValueText(index, entry)
            )
            .join(', ');
    }
    if (!isRecord(value)) {
        // YAML frontmatter only produces mappings beyond the types above; Bases reads anything else,
        // such as a function, as null.
        return 'null';
    }
    const fields: Record<string, string> = {};
    for (const [fieldKey, fieldValue] of Object.entries(value)) {
        fields[fieldKey] = getBasesValueText(fieldKey, fieldValue);
    }
    return JSON.stringify(fields);
}

/**
 * Reads the frontmatter value of a property as Bases reads it for sorting.
 * Returns null when the property is missing or set to null. Other values, including empty
 * strings and empty lists, are values, as in Bases.
 */
export function getPropertySortValueFromRecord(frontmatter: unknown, propertyKey: string): PropertySortValue | null {
    if (!isRecord(frontmatter)) {
        return null;
    }

    const value = getMatchingRecordValue(frontmatter, propertyKey);
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'boolean') {
        return { type: 'boolean', value };
    }
    if (typeof value === 'number') {
        return { type: 'number', value };
    }
    if (typeof value === 'string' && !isTagsKey(propertyKey)) {
        if (value.startsWith('[[') && value.endsWith(']]')) {
            const target = value.slice(2, -2);
            const aliasSeparator = target.lastIndexOf('|');
            return { type: 'text', text: aliasSeparator === -1 ? value : target.slice(aliasSeparator + 1), truthy: true };
        }
        const date = parseBasesDate(value);
        if (date) {
            return { type: 'date', ...date };
        }
        return { type: 'text', text: value, truthy: value.length > 0 };
    }

    // Lists, tags and objects compare by their printed text and are truthy when not empty.
    const truthy = Array.isArray(value)
        ? value.length > 0
        : typeof value === 'string' || (isRecord(value) && Object.keys(value).length > 0);
    return { type: 'text', text: getBasesValueText(propertyKey, value), truthy };
}

export interface PropertyGroupingValue {
    parts: string[];
    /**
     * Set when the raw frontmatter value is a finite scalar number. Number-keyed groups compare
     * numerically, matching how Obsidian Bases compares number-keyed groups, and order before
     * text groups; quoted numeric strings and lists stay null and use natural string comparison.
     */
    numericValue: number | null;
}

/**
 * Extracts the frontmatter value used for property grouping.
 * Returns null when the property is missing or empty. A single-element list produces the
 * same parts as its scalar value, so `[value]` and `value` land in the same group,
 * matching how Obsidian Bases compares list values against scalars.
 */
export function getPropertyGroupingValueFromRecord(frontmatter: unknown, propertyKey: string): PropertyGroupingValue | null {
    if (!isRecord(frontmatter)) {
        return null;
    }

    const rawValue = getMatchingRecordValue(frontmatter, propertyKey);
    const parts = extractPropertySortParts(rawValue);
    if (parts.length === 0) {
        return null;
    }

    return {
        parts,
        numericValue: typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null
    };
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

/**
 * Returns the direction selected when the sort field changes. Date fields start with the newest
 * notes first, while title, file name, and property fields start in ascending order.
 */
export function getSortDirectionForFieldChange(field: SortField): SortDirection {
    return field === 'modified' || field === 'created' ? 'desc' : 'asc';
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

export interface DefaultReconcileResult {
    /** True when any settings field was mutated; callers persist the settings on change. */
    changed: boolean;
    /** True when the default was reset to its stock value because its property key is unavailable. */
    reset: boolean;
}

/**
 * Validates the default folder sort against the configured sorting properties.
 * A property-based default whose key is missing from the configured list (or points at the
 * manual-sort property) resets both fields to the stock default rather than retargeting another
 * property, so removing a property never silently changes which property sorts the vault.
 * A stale companion key left behind by a built-in default is cleared without counting as a reset.
 */
export function reconcileDefaultFolderSort(settings: NotebookNavigatorSettings): DefaultReconcileResult {
    if (!isPropertySortOption(settings.defaultFolderSort)) {
        if (settings.defaultFolderSortPropertyKey !== '') {
            settings.defaultFolderSortPropertyKey = '';
            return { changed: true, reset: false };
        }
        return { changed: false, reset: false };
    }

    const availablePropertyKeys = getAvailablePropertySortKeys(settings);
    const matchedKey = getMatchingConfiguredPropertySortKey(availablePropertyKeys, settings.defaultFolderSortPropertyKey);
    if (!matchedKey) {
        settings.defaultFolderSort = DEFAULT_SETTINGS.defaultFolderSort;
        settings.defaultFolderSortPropertyKey = DEFAULT_SETTINGS.defaultFolderSortPropertyKey;
        return { changed: true, reset: true };
    }

    return { changed: false, reset: false };
}

/**
 * Rewrites the default folder sort after a frontmatter key rename, or resets it to the stock
 * default when the key is deleted (newKeyDisplay is null). Returns true when settings changed.
 */
export function updateDefaultFolderSortPropertyKey(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    if (!isPropertySortOption(settings.defaultFolderSort)) {
        return false;
    }

    if (casefold(settings.defaultFolderSortPropertyKey.trim()) !== oldKeyNormalized) {
        return false;
    }

    if (newKeyDisplay) {
        settings.defaultFolderSortPropertyKey = newKeyDisplay;
    } else {
        settings.defaultFolderSort = DEFAULT_SETTINGS.defaultFolderSort;
        settings.defaultFolderSortPropertyKey = DEFAULT_SETTINGS.defaultFolderSortPropertyKey;
    }
    return true;
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

/**
 * Returns undefined when the complete selected sort matches the complete default, signaling that
 * the existing override should be removed. A match requires the field, direction, and property key
 * to agree; sharing only one component retains the selected sort as an override.
 */
export function resolveListSortOverrideForDefault(
    selectedSort: ListSortOverrideValue,
    defaultSort: ListSortOverrideValue
): ListSortOverrideValue | undefined {
    return areListSortOverridesEqual(selectedSort, defaultSort) ? undefined : selectedSort;
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

function isPropertySortValueTruthy(value: PropertySortValue | null): boolean {
    if (value === null) {
        return false;
    }
    switch (value.type) {
        case 'boolean':
            return value.value;
        case 'number':
            // 0 and NaN are falsy, as in Bases
            return Boolean(value.value);
        case 'date':
            return true;
        case 'text':
            return value.truthy;
    }
}

function getPropertySortValueText(value: PropertySortValue): string {
    return value.type === 'boolean' || value.type === 'number' ? String(value.value) : value.text;
}

/**
 * Compares two property sort values with the rules of the Obsidian Bases row sort (Obsidian 1.14):
 * - When either value is a boolean, the values compare by truthiness, so a missing value ties with
 *   false and sorts before true in ascending order. This check comes before the missing-value rule.
 * - Otherwise a missing value sorts last in both directions.
 * - Two numbers compare numerically and two dates by time.
 * - Any other pair, including a number against text, compares as text in natural order without a
 *   length tie-break, so `2024` sorts between "2023-06-01" and "2024-01-15".
 *
 * The text rule makes this comparison inconsistent when negative or decimal numbers mix with
 * number-like text: -10 sorts before -2 as numbers, "-2" sorts before "-5x" and "-5x" before "-10"
 * as text. Bases has the same cycle and its order then depends on the input order; this keeps it
 * to match Bases instead of imposing an order Bases does not have.
 *
 * Returns 0 when Bases would move on to its next sort key, and NaN when a NaN number or an invalid
 * date is involved, which Array.sort treats as equal without moving on, as in Bases.
 */
function comparePropertySortValues(valueA: PropertySortValue | null, valueB: PropertySortValue | null, descending: boolean): number {
    if (valueA === null && valueB === null) {
        return 0;
    }

    let cmp: number;
    if (valueA?.type === 'boolean' || valueB?.type === 'boolean') {
        cmp = (isPropertySortValueTruthy(valueA) ? 1 : -1) - (isPropertySortValueTruthy(valueB) ? 1 : -1);
    } else if (valueA === null) {
        return 1;
    } else if (valueB === null) {
        return -1;
    } else if (valueA.type === 'number' && valueB.type === 'number') {
        cmp = valueA.value - valueB.value;
    } else if (valueA.type === 'date' && valueB.type === 'date') {
        cmp = valueA.time - valueB.time;
    } else {
        cmp = naturalCompare(getPropertySortValueText(valueA), getPropertySortValueText(valueB));
    }
    return descending ? -cmp : cmp;
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
    // A property default resolves through its companion key. Legacy bare-string property overrides
    // keep the historical first-configured-property behavior, and the first configured property
    // remains the last-resort fallback for transient states (e.g. sync applied a property list
    // change before reconciliation ran).
    const defaultPropertyKey =
        normalizedOverride === undefined
            ? getMatchingConfiguredPropertySortKey(configuredPropertyKeys, settings.defaultFolderSortPropertyKey)
            : '';
    const propertyKey = isPropertySortOption(rawOption) ? overridePropertyKey || defaultPropertyKey || configuredPropertyKey : '';
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
    getPropertyValue?: (file: TFile) => PropertySortValue | null,
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

                // Missing values are handled inside the comparison because Bases compares a missing
                // value against a boolean by truthiness instead of sorting it last.
                const cmp = comparePropertySortValues(valueA, valueB, descending);
                if (cmp !== 0) {
                    return cmp;
                }

                // Equal values use the configured secondary sort, which stands in for the next sort
                // key of a Bases view.

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
