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

import type { CollapsedPinnedContexts, NavigatorContext, PinnedSectionCollapseKey } from '../types';

/**
 * Rebuilds a record into a null-prototype object, optionally validating entries.
 * Prevents keys like "constructor" from resolving to Object.prototype.
 */
export function sanitizeRecord<T>(record: Record<string, T> | undefined, validate?: (value: unknown) => value is T): Record<string, T> {
    // Null prototype avoids pulling values from Object.prototype (e.g., "constructor" keys)
    const sanitized = Object.create(null) as Record<string, T>;
    if (!record) {
        return sanitized;
    }

    // Copy only own properties, optionally filtering by type validator
    for (const key of Object.keys(record)) {
        const value = (record as Record<string, unknown>)[key];
        if (validate && !validate(value)) {
            continue;
        }
        sanitized[key] = value as T;
    }

    return sanitized;
}

/**
 * Ensures a record uses a null prototype and only contains validated entries.
 * Reuses the existing object when already sanitized to avoid unnecessary copies.
 */
export function ensureRecord<T>(record: Record<string, T> | undefined, validate?: (value: unknown) => value is T): Record<string, T> {
    if (!record) {
        return Object.create(null) as Record<string, T>;
    }

    // Check if record already has null prototype to avoid unnecessary rebuild
    const hasNullPrototype = Object.getPrototypeOf(record) === null;
    if (!hasNullPrototype) {
        return sanitizeRecord(record, validate);
    }

    // Record is already safe, just validate and remove invalid entries in-place
    if (!validate) {
        return record;
    }

    Object.keys(record).forEach(key => {
        const value = (record as Record<string, unknown>)[key];
        if (!validate(value)) {
            delete record[key];
        }
    });

    return record;
}

/** Type guard for string values in records */
export function isStringRecordValue(value: unknown): value is string {
    return typeof value === 'string';
}

/** Type guard for boolean values in records */
export function isBooleanRecordValue(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/** Type guard for plain object values in records */
export function isPlainObjectRecordValue(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Canonicalizes a case-insensitive identifier while preserving surrounding whitespace.
 * Use for user-authored lookup keys where NFC/NFD-equivalent text must match.
 */
export function normalizeCaseInsensitiveIdentifierPreservingWhitespace(value: string): string {
    if (!value) {
        return '';
    }

    return value.normalize('NFC').toLowerCase();
}

/**
 * Canonicalizes a case-insensitive identifier after trimming surrounding whitespace.
 * Use for user-authored lookup keys stored without semantic leading/trailing whitespace.
 */
function normalizeCaseInsensitiveIdentifier(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return '';
    }

    return normalizeCaseInsensitiveIdentifierPreservingWhitespace(trimmed);
}

export function casefoldPreservingWhitespace(value: string): string {
    return normalizeCaseInsensitiveIdentifierPreservingWhitespace(value);
}

export function findMatchingRecordKey(record: Record<string, unknown> | null | undefined, targetKey: string): string | null {
    if (!record) {
        return null;
    }

    const normalizedTargetKey = casefold(targetKey);
    if (!normalizedTargetKey) {
        return null;
    }

    for (const key of Object.keys(record)) {
        if (casefold(key) === normalizedTargetKey) {
            return key;
        }
    }

    return null;
}

export function getMatchingRecordValue(record: Record<string, unknown> | null | undefined, targetKey: string): unknown {
    const matchingKey = findMatchingRecordKey(record, targetKey);
    if (matchingKey === null || !record) {
        return undefined;
    }

    return record[matchingKey];
}

export interface PinnedNoteContextValue {
    folder: boolean;
    tag: boolean;
    property: boolean;
}

const PINNED_SECTION_COLLAPSE_KEY_PREFIXES: readonly `${NavigatorContext}:`[] = ['folder:', 'tag:', 'property:'];

function isPinnedSectionCollapseKey(value: string): value is PinnedSectionCollapseKey {
    return PINNED_SECTION_COLLAPSE_KEY_PREFIXES.some(prefix => value.startsWith(prefix) && value.length > prefix.length);
}

function getPinnedSectionCollapseKeyPrefix(context: NavigatorContext): `${NavigatorContext}:` {
    return `${context}:`;
}

export function getCollapsedPinnedContextTarget(key: string, context: NavigatorContext): string | null {
    const prefix = getPinnedSectionCollapseKeyPrefix(context);
    if (!key.startsWith(prefix) || key.length <= prefix.length) {
        return null;
    }

    return key.slice(prefix.length);
}

function buildCollapsedPinnedContextKey(context: NavigatorContext, target: string): PinnedSectionCollapseKey {
    return `${getPinnedSectionCollapseKeyPrefix(context)}${target}`;
}

interface CollapsedPinnedContextKeyMutationOptions {
    descendantDelimiter?: string;
    preserveExisting?: boolean;
}

function matchesCollapsedPinnedContextTarget(target: string, candidate: string, descendantDelimiter?: string): boolean {
    if (target === candidate) {
        return true;
    }

    return descendantDelimiter !== undefined && target.startsWith(`${candidate}${descendantDelimiter}`);
}

/**
 * Normalizes a pinned note context value into strict boolean fields.
 */
export function normalizePinnedNoteContext(value: unknown): PinnedNoteContextValue {
    if (!isPlainObjectRecordValue(value)) {
        return { folder: false, tag: false, property: false };
    }

    const folder = value.folder === true;
    const tag = value.tag === true;

    return {
        folder,
        tag,
        // Legacy pinned context values only stored folder+tag.
        // Treating both as true implies the file was pinned everywhere before property context existed.
        property: value.property === true || (!Object.prototype.hasOwnProperty.call(value, 'property') && folder && tag)
    };
}

/**
 * Rebuilds pinned notes into a null-prototype record with normalized context values.
 */
export function clonePinnedNotesRecord(value: unknown): Record<string, PinnedNoteContextValue> {
    const cloned = sanitizeRecord<PinnedNoteContextValue>(undefined);
    if (!isPlainObjectRecordValue(value)) {
        return cloned;
    }

    Object.entries(value).forEach(([path, context]) => {
        cloned[path] = normalizePinnedNoteContext(context);
    });

    return cloned;
}

/**
 * Rebuilds the pinned section collapse state as a set-like record of collapsed navigation items.
 */
export function cloneCollapsedPinnedContextsRecord(value: unknown): CollapsedPinnedContexts {
    const cloned = sanitizeRecord<boolean>(undefined) as CollapsedPinnedContexts;
    if (!isPlainObjectRecordValue(value)) {
        return cloned;
    }

    Object.entries(value).forEach(([key, collapsed]) => {
        if (isPinnedSectionCollapseKey(key) && collapsed === true) {
            cloned[key] = true;
        }
    });

    return cloned;
}

/**
 * Updates collapsed pinned section keys when a navigation item path or node id is renamed.
 */
export function updateCollapsedPinnedContextKeys(
    record: CollapsedPinnedContexts | undefined,
    context: NavigatorContext,
    oldTarget: string,
    newTarget: string,
    options: CollapsedPinnedContextKeyMutationOptions = {}
): boolean {
    if (!record || oldTarget === newTarget) {
        return false;
    }

    const descendantPrefix = options.descendantDelimiter !== undefined ? `${oldTarget}${options.descendantDelimiter}` : null;
    const updates: { oldKey: PinnedSectionCollapseKey; newKey: PinnedSectionCollapseKey }[] = [];

    Object.keys(record).forEach(key => {
        const target = getCollapsedPinnedContextTarget(key, context);
        if (target === null || !matchesCollapsedPinnedContextTarget(target, oldTarget, options.descendantDelimiter)) {
            return;
        }

        if (target === oldTarget) {
            updates.push({
                oldKey: key as PinnedSectionCollapseKey,
                newKey: buildCollapsedPinnedContextKey(context, newTarget)
            });
            return;
        }

        if (descendantPrefix) {
            updates.push({
                oldKey: key as PinnedSectionCollapseKey,
                newKey: buildCollapsedPinnedContextKey(context, `${newTarget}${target.slice(oldTarget.length)}`)
            });
        }
    });

    let changed = false;
    updates.forEach(({ oldKey, newKey }) => {
        if (oldKey === newKey) {
            return;
        }

        if (Object.prototype.hasOwnProperty.call(record, newKey) && options.preserveExisting) {
            delete record[oldKey];
            changed = true;
            return;
        }

        if (record[oldKey] === true) {
            record[newKey] = true;
        }
        delete record[oldKey];
        changed = true;
    });

    return changed;
}

/**
 * Removes collapsed pinned section keys when a navigation item is deleted.
 */
export function deleteCollapsedPinnedContextKeys(
    record: CollapsedPinnedContexts | undefined,
    context: NavigatorContext,
    targetToDelete: string,
    options: Pick<CollapsedPinnedContextKeyMutationOptions, 'descendantDelimiter'> = {}
): boolean {
    if (!record) {
        return false;
    }

    let changed = false;

    Object.keys(record).forEach(key => {
        const target = getCollapsedPinnedContextTarget(key, context);
        if (target === null || !matchesCollapsedPinnedContextTarget(target, targetToDelete, options.descendantDelimiter)) {
            return;
        }

        delete record[key as PinnedSectionCollapseKey];
        changed = true;
    });

    return changed;
}

/**
 * Removes collapsed pinned section keys whose navigation target no longer exists.
 */
export function cleanupCollapsedPinnedContextKeys(
    record: CollapsedPinnedContexts | undefined,
    context: NavigatorContext,
    validator: (target: string) => boolean
): boolean {
    if (!record) {
        return false;
    }

    let changed = false;
    Object.keys(record).forEach(key => {
        const target = getCollapsedPinnedContextTarget(key, context);
        if (target === null || validator(target)) {
            return;
        }

        delete record[key as PinnedSectionCollapseKey];
        changed = true;
    });

    return changed;
}

/** Returns whether a record has at least one own enumerable entry. */
export function hasOwnRecordEntries(record: Record<string, string> | undefined): boolean {
    if (!record) {
        return false;
    }

    for (const key in record) {
        if (Object.prototype.hasOwnProperty.call(record, key)) {
            return true;
        }
    }

    return false;
}

export function casefold(value: string): string {
    return normalizeCaseInsensitiveIdentifier(value);
}

// Reference: "Text Normalization: Unicode Forms, Case Folding & Whitespace Handling for NLP"
// https://mbrenndoerfer.com/writing/text-normalization-unicode-nlp

// Matches Unicode combining-mark code points.
const SEARCH_COMBINING_MARK_PATTERN = /\p{M}/u;
// Matches Latin script letters used to gate accent stripping.
const SEARCH_LATIN_LETTER_PATTERN = /\p{Script=Latin}/u;
// Fast path: ASCII-only strings already match after lowercase conversion.
const SEARCH_NORMALIZATION_NON_ASCII_PATTERN = /[\u0080-\uFFFF]/;

const foldSearchLowercaseValue = (lowercaseValue: string): string => {
    // ASCII-only inputs are already in final folded form after lowercase conversion.
    if (!SEARCH_NORMALIZATION_NON_ASCII_PATTERN.test(lowercaseValue)) {
        return lowercaseValue;
    }

    // NFD exposes accents as combining marks so marks can be inspected per code point.
    const decomposed = lowercaseValue.normalize('NFD');
    let folded = '';
    // Tracks whether the previous base character belongs to Latin script.
    // Combining marks are removed only when this flag is true.
    let previousBaseWasLatin = false;

    for (const char of decomposed) {
        // Combining marks are dropped for Latin letters (`cafe` matches `café`).
        // Combining marks are preserved for non-Latin scripts (`مدرس` stays distinct from `مُدَرِّس`).
        if (SEARCH_COMBINING_MARK_PATTERN.test(char)) {
            if (previousBaseWasLatin) {
                continue;
            }
            folded += char;
            continue;
        }

        // Base character: always keep it, then update script tracking for following combining marks.
        folded += char;
        previousBaseWasLatin = SEARCH_LATIN_LETTER_PATTERN.test(char);
    }

    // Recompose so folded strings remain in stable canonical form for storage/comparison.
    return folded.normalize('NFC');
};

/**
 * Folds pre-lowercased search text for accent-insensitive matching on Latin script characters.
 * Combining marks on non-Latin scripts are preserved.
 */
export function foldSearchTextFromLowercase(lowercaseValue: string): string {
    if (!lowercaseValue) {
        return '';
    }

    return foldSearchLowercaseValue(lowercaseValue);
}

/**
 * Folds search text for accent-insensitive matching on Latin script characters.
 * Combining marks on non-Latin scripts are preserved.
 */
export function foldSearchText(value: string): string {
    if (!value) {
        return '';
    }

    return foldSearchLowercaseValue(value.toLowerCase());
}

export function sortAndDedupeByComparator<T>(values: readonly T[], compare: (left: T, right: T) => number): T[] {
    if (values.length === 0) {
        return [];
    }

    const sorted = [...values].sort(compare);
    const unique: T[] = [sorted[0]];

    for (let index = 1; index < sorted.length; index += 1) {
        const current = sorted[index];
        const previous = unique[unique.length - 1];
        if (compare(current, previous) !== 0) {
            unique.push(current);
        }
    }

    return unique;
}

export interface CaseInsensitiveKeyMatcher {
    hasKeys: boolean;
    matches: (record: Record<string, unknown> | null | undefined) => boolean;
}

const EMPTY_CASE_INSENSITIVE_KEY_MATCHER: CaseInsensitiveKeyMatcher = {
    hasKeys: false,
    matches: () => false
};

const caseInsensitiveKeyMatcherCache = new Map<string, CaseInsensitiveKeyMatcher>();

export function createCaseInsensitiveKeyMatcher(keys: string[]): CaseInsensitiveKeyMatcher {
    if (keys.length === 0) {
        return EMPTY_CASE_INSENSITIVE_KEY_MATCHER;
    }

    const normalized = keys.map(casefold).filter(Boolean);
    if (normalized.length === 0) {
        return EMPTY_CASE_INSENSITIVE_KEY_MATCHER;
    }

    const unique = sortAndDedupeByComparator(normalized, (left, right) => left.localeCompare(right));

    const cacheKey = unique.join('\u0000');
    const cached = caseInsensitiveKeyMatcherCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const needleSet = new Set(unique);
    const matcher: CaseInsensitiveKeyMatcher = {
        hasKeys: true,
        matches: (record: Record<string, unknown> | null | undefined): boolean => {
            if (!record) {
                return false;
            }

            for (const key of Object.keys(record)) {
                if (needleSet.has(casefold(key))) {
                    return true;
                }
            }

            return false;
        }
    };

    caseInsensitiveKeyMatcherCache.set(cacheKey, matcher);
    return matcher;
}
