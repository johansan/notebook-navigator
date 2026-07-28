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

import { TFile, getAllTags, type App } from 'obsidian';
import type { MultiSelectModifier, NotebookNavigatorSettings } from '../settings/types';
import { TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import type { FileData } from '../storage/IndexedDBStorage';
import { getDBInstanceOrNull } from '../storage/fileOperations';
import { isMultiSelectModifierPressed } from './keyboardOpenContext';
import { supportsKeyboardInteractions } from './paneLayout';
import { normalizeTagPathValue } from './tagPrefixMatcher';
import { findTagNode } from './tagTree';
import type { TagTreeNode } from '../types/storage';
import type { InclusionOperator } from './filterSearch';

/**
 * Mirrors Obsidian's inline tag tokenization by defining the characters that terminate an inline `#tag`.
 *
 * Obsidian recognizes inline tags using a pattern equivalent to:
 * - `(^|\\s)#([^{DISALLOWED}]+)`
 *
 * This means:
 * - `#` must be at the start of the string/line or preceded by whitespace (not punctuation).
 * - The tag value continues until a disallowed character is encountered.
 *
 * This constant is inserted into a RegExp character class (e.g. `[^${...}]`), so it must be valid
 * character-class content (not wrapped in `[]`).
 */
export const OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT = '\\u2000-\\u206F\\u2E00-\\u2E7F\'!"#$%&()*+,.:;<=>?@^`{|}~[\\]\\\\\\s';

const INLINE_TAG_COMPAT_PATTERN = new RegExp(`^#[^${OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT}]+$`, 'u');
const TAG_ALLOWED_CHAR_PATTERN = /^[\p{L}\p{N}\p{M}_\-/]$/u;
const TAG_COMBINING_MARK_PATTERN = /^\p{M}$/u;
const TAG_ALLOWED_PICTOGRAPHIC_PATTERN = /^\p{Extended_Pictographic}$/u;
const TAG_ALLOWED_REGIONAL_INDICATOR_PATTERN = /^\p{Regional_Indicator}$/u;
const EMOJI_SEQUENCE_JOINERS = new Set(['\u200D', '\uFE0E', '\uFE0F']);

/**
 * Checks if a tag input can be used as a canonical tag path string.
 * Trims whitespace and rejects empty values, whitespace, and hash characters.
 * Rejects leading/trailing slashes and double slashes.
 */
export function hasValidTagCharacters(tagValue: string | null | undefined): boolean {
    if (!tagValue) {
        return false;
    }

    const trimmed = tagValue.trim();
    if (trimmed.length === 0) {
        return false;
    }

    if (/\s/u.test(trimmed)) {
        return false;
    }

    if (trimmed.includes('#')) {
        return false;
    }

    if (trimmed.startsWith('/') || trimmed.endsWith('/')) {
        return false;
    }

    if (trimmed.includes('//')) {
        return false;
    }

    let hasBaseCharacter = false;

    for (const char of trimmed) {
        if (EMOJI_SEQUENCE_JOINERS.has(char)) {
            continue;
        }

        if (TAG_ALLOWED_CHAR_PATTERN.test(char)) {
            if (!TAG_COMBINING_MARK_PATTERN.test(char)) {
                hasBaseCharacter = true;
            }
            continue;
        }

        if (TAG_ALLOWED_PICTOGRAPHIC_PATTERN.test(char)) {
            hasBaseCharacter = true;
            continue;
        }

        if (TAG_ALLOWED_REGIONAL_INDICATOR_PATTERN.test(char)) {
            hasBaseCharacter = true;
            continue;
        }

        return false;
    }

    return hasBaseCharacter;
}

/**
 * Checks whether a tag value can be parsed fully as an inline #tag by Obsidian.
 */
export function isInlineTagValueCompatible(tagValue: string | null | undefined): boolean {
    if (!tagValue) {
        return false;
    }

    const trimmed = tagValue.trim();
    if (trimmed.length === 0) {
        return false;
    }

    const prefixedValue = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    return INLINE_TAG_COMPAT_PATTERN.test(prefixedValue);
}

/**
 * Checks whether `char` is a valid preceding character for an inline `#tag` token.
 *
 * Obsidian only recognizes inline tags when `#` is preceded by whitespace or is at the start of the
 * string/line. This intentionally rejects punctuation-adjacent fragments like `!#anchor` or `/#hash`.
 */
export function isValidTagPrecedingChar(char: string | null | undefined): boolean {
    if (!char) {
        return true; // Start of line/string
    }
    return /\s/u.test(char);
}

/**
 * Normalizes tag paths for internal lookups.
 * Removes leading # when present and returns lowercase path.
 */
export function normalizeTagPath(tagPath: string | null | undefined): string | null {
    if (!tagPath) {
        return null;
    }

    const trimmed = tagPath.trim();
    if (trimmed === '') {
        return null;
    }

    const normalized = normalizeTagPathValue(trimmed);
    return normalized === '' ? null : normalized;
}

/**
 * Resolves the canonical lowercase tag path used across state stores.
 * Returns the node path when available, otherwise the normalized string.
 */
export function resolveCanonicalTagPath(tagPath: string | null | undefined, tagTree?: Map<string, TagTreeNode>): string | null {
    if (tagPath === TAGGED_TAG_ID) {
        return TAGGED_TAG_ID;
    }
    if (tagPath === UNTAGGED_TAG_ID) {
        return UNTAGGED_TAG_ID;
    }

    const normalized = normalizeTagPath(tagPath);
    if (!tagTree || !normalized) {
        return normalized;
    }

    const node = findTagNode(tagTree, normalized);
    return node?.path ?? normalized;
}

/**
 * Extract tags from metadata cache values.
 *
 * Tags are returned without the # prefix, in original casing. Duplicate tags with
 * different casing are deduplicated, keeping the first occurrence.
 */
export function extractFileTagsFromRawTags(rawTags: readonly string[] | null): string[] {
    if (!rawTags || rawTags.length === 0) {
        return [];
    }

    const seen = new Set<string>();
    const uniqueTags: string[] = [];

    for (const tag of rawTags) {
        const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
        if (!cleanTag) {
            continue;
        }
        const canonicalTag = normalizeTagPathValue(cleanTag);
        if (!canonicalTag || seen.has(canonicalTag)) {
            continue;
        }
        seen.add(canonicalTag);
        uniqueTags.push(cleanTag);
    }

    return uniqueTags;
}

export interface CachedFileTagsDB {
    getFile?: (path: string) => FileData | null;
    getCachedTags?: (path: string) => readonly string[];
}

interface TagRevealStorage {
    getFile(path: string): FileData | null;
}

const EMPTY_FILE_TAGS: readonly string[] = [];

export function getCachedFileTags(params: {
    app: App;
    file: TFile;
    db?: CachedFileTagsDB | null;
    fileData?: FileData | null;
}): readonly string[] {
    if (params.file.extension !== 'md') {
        return EMPTY_FILE_TAGS;
    }

    const fileData = params.fileData ?? null;
    if (fileData && fileData.tags !== null) {
        return fileData.tags;
    }

    const db = params.db ?? getDBInstanceOrNull();
    if (db) {
        if (typeof db.getFile === 'function') {
            const record = db.getFile(params.file.path);
            if (record) {
                return record.tags ?? EMPTY_FILE_TAGS;
            }
            return EMPTY_FILE_TAGS;
        }

        if (typeof db.getCachedTags === 'function') {
            const cachedTags = db.getCachedTags(params.file.path);
            return cachedTags.length > 0 ? cachedTags : EMPTY_FILE_TAGS;
        }
    }

    const metadata = params.app.metadataCache.getFileCache(params.file);
    const rawTags = metadata ? getAllTags(metadata) : null;
    if (!rawTags || rawTags.length === 0) {
        return EMPTY_FILE_TAGS;
    }
    return extractFileTagsFromRawTags(rawTags);
}

interface TagModifierState {
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
}

/**
 * Determines which inclusion operator to use when a modifier-click should mutate tag search filters.
 */
export function getTagSearchModifierOperator(
    event: TagModifierState | null | undefined,
    modifierSetting: MultiSelectModifier
): InclusionOperator | null {
    // Modifier-driven filter mutation follows pointer-modifier support (desktop and tablets); phones stay touch-only.
    if (!event || !supportsKeyboardInteractions()) {
        return null;
    }

    const modifierPressed = isMultiSelectModifierPressed(event, modifierSetting);

    if (!modifierPressed) {
        return null;
    }

    return event.shiftKey ? 'OR' : 'AND';
}

/**
 * Gets normalized tags for a file (without # prefix and in lowercase)
 */
function getNormalizedTagsForFile(file: TFile, storage: TagRevealStorage): string[] {
    if (file.extension !== 'md') {
        return [];
    }

    // Get tags from memory cache
    const fileData = storage.getFile(file.path);
    const fileTags = fileData?.tags;

    if (!fileTags || fileTags.length === 0) {
        return [];
    }

    // Tags in cache are already without # prefix, just normalize consistently
    return fileTags.map((tag: string) => normalizeTagPathValue(tag)).filter((value): value is string => value.length > 0);
}

/**
 * Checks if a file has a specific tag - exact match only, no ancestor checking.
 * Comparison is case-insensitive (e.g., "TODO" matches "todo").
 */
function fileHasExactTag(file: TFile, tag: string, storage: TagRevealStorage): boolean {
    const normalizedTags = getNormalizedTagsForFile(file, storage);
    const normalizedSearchTag = normalizeTagPathValue(tag);
    if (normalizedSearchTag.length === 0) {
        return false;
    }

    return normalizedTags.some(fileTag => fileTag === normalizedSearchTag);
}

/**
 * Determines which tag to reveal for a file based on current selection and settings
 */
export function determineTagToReveal(
    file: TFile,
    currentTag: string | null,
    settings: NotebookNavigatorSettings,
    storage: TagRevealStorage,
    includeDescendantNotes: boolean,
    useShortestPath: boolean
): string | null {
    const fileData = storage.getFile(file.path);
    if (!fileData || fileData.tags === null) {
        // Tags are not indexed yet for this file. Keep the current tag selection.
        return currentTag;
    }

    // Check if file has no tags
    const fileTags = getNormalizedTagsForFile(file, storage);
    if (fileTags.length === 0) {
        // If untagged is shown, reveal it
        return settings.showUntagged ? UNTAGGED_TAG_ID : null;
    }

    const originalTags = fileData.tags;

    const getFirstFileTag = () => {
        if (originalTags && originalTags.length > 0) {
            return originalTags[0];
        }
        return fileTags[0] ?? null;
    };

    if (currentTag === TAGGED_TAG_ID) {
        return includeDescendantNotes && useShortestPath ? TAGGED_TAG_ID : getFirstFileTag();
    }

    // Check if we should stay on the current tag
    if (currentTag && currentTag !== UNTAGGED_TAG_ID && currentTag !== TAGGED_TAG_ID) {
        // First check exact match
        if (fileHasExactTag(file, currentTag, storage)) {
            return currentTag; // Stay on current tag
        }

        if (includeDescendantNotes && useShortestPath) {
            // In shortest-path mode, keep parent tags selected when the file has descendant tags.
            const normalizedCurrentTag = normalizeTagPathValue(currentTag);
            if (normalizedCurrentTag.length > 0) {
                const currentTagPrefix = `${normalizedCurrentTag}/`;

                // Check if any of the file's tags are children of the current tag
                for (const fileTag of fileTags) {
                    if (fileTag.startsWith(currentTagPrefix)) {
                        return currentTag; // Stay on parent tag (shortest path)
                    }
                }
            }
        }
    }

    // File has different tags - return the first tag of the file
    return getFirstFileTag();
}

function isTagVisible(tagPath: string, expandedTags: Set<string>): boolean {
    if (!tagPath || tagPath === UNTAGGED_TAG_ID || tagPath === TAGGED_TAG_ID) {
        return true;
    }

    const parts = tagPath.split('/');
    let currentPath = '';

    for (let index = 0; index < parts.length - 1; index++) {
        currentPath = currentPath ? `${currentPath}/${parts[index]}` : parts[index];
        if (!expandedTags.has(currentPath)) {
            return false;
        }
    }

    return true;
}

export function findNearestVisibleTagAncestor(tagPath: string, expandedTags: Set<string>): string {
    if (!tagPath || tagPath === UNTAGGED_TAG_ID || tagPath === TAGGED_TAG_ID) {
        return tagPath;
    }

    const segments = tagPath.split('/');

    for (let length = segments.length; length > 0; length--) {
        const candidate = segments.slice(0, length).join('/');
        if (isTagVisible(candidate, expandedTags)) {
            return candidate;
        }
    }

    return tagPath;
}
