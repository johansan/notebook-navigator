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

import { App, TFile, parseFrontMatterTags } from 'obsidian';
import { getDBInstance } from '../../storage/fileOperations';
import type { NotebookNavigatorSettings, TagSourceSetting } from '../../settings/types';
import { normalizeTagPathValue } from '../../utils/tagPrefixMatcher';
import {
    getCachedFileTags,
    hasValidTagCharacters,
    isInlineTagValueCompatible,
    isValidTagPrecedingChar,
    OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT
} from '../../utils/tagUtils';
import { mutateFrontmatterTagFields } from '../tagRename/frontmatterTagMutator';
import { mergeRanges, NumericRange } from '../../utils/arrayUtils';
import { findFencedCodeBlockRanges, findInlineCodeRanges, isIndexInRanges } from '../../utils/codeRangeUtils';
import { parseCommaSeparatedList } from '../../utils/commaSeparatedListUtils';
import { findHtmlTagRanges } from '../../utils/htmlParsingUtils';
import { findMatchingRecordKey } from '../../utils/recordUtils';

/**
 * Type for frontmatter objects that may contain a tags property
 */
type TagsFrontmatter = Record<string, unknown> & { tags?: unknown };
const HORIZONTAL_WHITESPACE_SOURCE = '[^\\S\\r\\n]';
const INLINE_TAG_TOKEN_SOURCE = `#[^${OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT}]+`;
const INLINE_TAG_BOUNDARY_SOURCE = `(?=$|[${OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT}])`;

/**
 * Low-level tag mutation operations for individual files
 * Handles both frontmatter and inline tag modifications
 */
export class TagFileMutations {
    // Complete pattern for matching any inline tag token with optional leading horizontal whitespace
    private static readonly INLINE_TAG_PATTERN = new RegExp(`(${HORIZONTAL_WHITESPACE_SOURCE})?${INLINE_TAG_TOKEN_SOURCE}`, 'gu');
    // Pattern for testing if content contains any inline tags (without global flag for test())
    private static readonly INLINE_TAG_TEST_PATTERN = new RegExp(`(?:^|\\s)${INLINE_TAG_TOKEN_SOURCE}`, 'u');

    constructor(
        private readonly app: App,
        private readonly getSettings: () => NotebookNavigatorSettings
    ) {}

    /**
     * The Tag source setting the operations follow: with `frontmatter`, they read and edit only frontmatter tags and
     * leave inline #tags in the note body untouched.
     */
    getTagSource(): TagSourceSetting {
        return this.getSettings().tagSource;
    }

    /**
     * Checks if a file is a markdown file
     */
    isMarkdownFile(file: TFile): boolean {
        return file.extension === 'md';
    }

    /**
     * Validates tag name format according to Obsidian tag rules
     * Rejects empty tags, leading/trailing slashes, and double slashes
     */
    isValidTagName(tag: string): boolean {
        return hasValidTagCharacters(tag);
    }

    /**
     * Extracts the leaf segment from a tag path
     * For "folder/subfolder/tag" returns "tag"
     */
    getTagLeaf(tagPath: string): string {
        const parts = tagPath.split('/');
        return parts[parts.length - 1] ?? tagPath;
    }

    /**
     * Checks if a file has a specific tag or an ancestor tag
     * Returns true if file has an ancestor tag (won't add "project/task" if file has "project")
     */
    async fileHasTagOrAncestor(file: TFile, tag: string): Promise<boolean> {
        if (!this.isMarkdownFile(file)) {
            return false;
        }

        const db = getDBInstance();
        const allTags = getCachedFileTags({ app: this.app, file, db });
        const normalizedTag = normalizeTagPathValue(tag);
        if (normalizedTag.length === 0) {
            return false;
        }

        return allTags.some((existingTag: string) => {
            const normalizedExistingTag = normalizeTagPathValue(existingTag);
            if (normalizedExistingTag.length === 0) {
                return false;
            }
            if (normalizedExistingTag === normalizedTag) {
                return true;
            }
            return normalizedTag.startsWith(`${normalizedExistingTag}/`);
        });
    }

    /**
     * Adds a tag to a file's frontmatter
     * First removes any descendant tags to avoid redundancy
     */
    async addTagToFile(file: TFile, tag: string): Promise<void> {
        if (!this.isMarkdownFile(file)) {
            return;
        }

        // First, remove any descendant tags of the new tag
        await this.removeDescendantTagsFromFile(file, tag);

        try {
            await this.app.fileManager.processFrontMatter(file, (frontmatter: TagsFrontmatter) => {
                const tagFieldKey = this.resolveFrontmatterTagFieldKey(frontmatter) ?? 'tags';
                const rawTags = frontmatter[tagFieldKey];
                const isEmptyString = typeof rawTags === 'string' && rawTags.trim().length === 0;

                if (rawTags === undefined || rawTags === null || isEmptyString) {
                    frontmatter[tagFieldKey] = [tag];
                    return;
                }

                if (Array.isArray(rawTags)) {
                    const normalizedTags = rawTags
                        .filter((value): value is string => typeof value === 'string')
                        .map(value => value.trim())
                        .filter((value): value is string => value.length > 0);
                    frontmatter[tagFieldKey] = this.dedupeCanonicalTagValues([...normalizedTags, tag]);
                    return;
                }

                if (typeof rawTags === 'string') {
                    const tags = parseCommaSeparatedList(rawTags);
                    frontmatter[tagFieldKey] = this.dedupeCanonicalTagValues([...tags, tag]);
                    return;
                }

                frontmatter[tagFieldKey] = [tag];
            });
        } catch (error: unknown) {
            console.error('[Notebook Navigator] Error adding tag to frontmatter', error);
            throw error;
        }
    }

    /**
     * Removes a specific tag from a file
     * Returns true if the tag was found and removed
     */
    async removeTagFromFile(file: TFile, tag: string): Promise<boolean> {
        if (!this.isMarkdownFile(file)) {
            return false;
        }

        const normalizedTarget = normalizeTagPathValue(tag);
        if (normalizedTarget.length === 0) {
            return false;
        }

        return this.stripTagsFromFile(file, candidate => candidate === normalizedTarget, [tag], 'remove tag from frontmatter');
    }

    /**
     * Removes all descendant tags of a given ancestor tag from a file
     * Used when adding a parent tag to avoid redundancy
     */
    async removeDescendantTagsFromFile(file: TFile, ancestorTag: string): Promise<boolean> {
        if (!this.isMarkdownFile(file)) {
            return false;
        }

        const descendants = this.collectDescendantTags(file, ancestorTag);
        if (!descendants) {
            return false;
        }

        return this.stripTagsFromFile(
            file,
            candidate => descendants.normalizedSet.has(candidate),
            descendants.tags,
            'remove descendant tags from frontmatter'
        );
    }

    /**
     * Collects all descendant tags of the specified ancestor tag from a file
     * Returns tag strings and normalized set for efficient lookup
     */
    collectDescendantTags(file: TFile, ancestorTag: string): { tags: string[]; normalizedSet: Set<string> } | null {
        const normalizedAncestor = normalizeTagPathValue(ancestorTag);
        if (normalizedAncestor.length === 0) {
            return null;
        }

        const currentTags = this.getTagsFromFiles([file]);
        const descendantTags = currentTags.filter(tag => {
            const normalizedTag = normalizeTagPathValue(tag);
            return normalizedTag.startsWith(`${normalizedAncestor}/`);
        });

        if (descendantTags.length === 0) {
            return null;
        }

        const normalizedSet = new Set(
            descendantTags.map(tag => normalizeTagPathValue(tag)).filter((value): value is string => value.length > 0)
        );

        if (normalizedSet.size === 0) {
            return null;
        }

        return {
            tags: descendantTags,
            normalizedSet
        };
    }

    /**
     * Removes all tags from a file's frontmatter, and from its inline content unless the tag source is `frontmatter`
     * Returns true if any tags were removed
     */
    async clearAllTagsFromFile(file: TFile): Promise<boolean> {
        if (!this.isMarkdownFile(file)) {
            return false;
        }

        let hadTags = false;

        try {
            await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                const tagFieldKey = this.resolveFrontmatterTagFieldKey(frontmatter);
                if (!tagFieldKey) {
                    return;
                }

                const rawTags = frontmatter[tagFieldKey];
                const hasTags =
                    typeof rawTags === 'string'
                        ? rawTags.trim().length > 0
                        : Array.isArray(rawTags)
                          ? rawTags.length > 0
                          : Boolean(rawTags);

                if (hasTags) {
                    hadTags = true;
                    this.cleanupFrontmatterTags(frontmatter, tagFieldKey);
                }
            });
        } catch (error) {
            console.error('[Notebook Navigator] Error clearing frontmatter tags', error);
            throw error;
        }

        if (this.getTagSource() === 'frontmatter') {
            return hadTags;
        }

        const content = await this.app.vault.read(file);
        if (this.hasInlineTags(content)) {
            await this.app.vault.process(file, current => {
                const { content: nextContent } = this.removeInlineTagsWithPattern(current, TagFileMutations.INLINE_TAG_PATTERN);
                if (nextContent !== current) {
                    hadTags = true;
                }
                return nextContent;
            });
        }

        return hadTags;
    }

    /**
     * Removes tags from frontmatter, and from inline content unless the tag source is `frontmatter`
     * Uses predicate function to determine which tags to remove
     */
    async stripTagsFromFile(
        file: TFile,
        shouldRemove: (normalizedTag: string) => boolean,
        inlineTags: string[],
        failureContext: string
    ): Promise<boolean> {
        let frontmatterChanged = false;
        let frontmatterError: Error | null = null;

        // Frontmatter mutations can fail if the YAML block is malformed or if Obsidian cannot
        // safely read/parse/write the file. Inline tag removal can still succeed, so the method
        // attempts both phases and throws after inline processing when frontmatter fails.
        try {
            frontmatterChanged = await this.stripTagsFromFrontmatter(file, shouldRemove, failureContext);
        } catch (error: unknown) {
            frontmatterError = error instanceof Error ? error : new Error(String(error));
        }

        const inlineChanged = inlineTags.length > 0 && this.getTagSource() === 'all' ? await this.stripInlineTags(file, inlineTags) : false;

        if (frontmatterError !== null) {
            throw frontmatterError;
        }
        return frontmatterChanged || inlineChanged;
    }

    /**
     * Gets all unique tags from multiple files
     * Returns sorted array of tag strings without # prefix
     */
    getTagsFromFiles(files: TFile[]): string[] {
        const canonicalTags = new Map<string, string>();
        const db = getDBInstance();

        for (const file of files) {
            if (!this.isMarkdownFile(file)) {
                continue;
            }

            const tags = getCachedFileTags({ app: this.app, file, db });
            tags.forEach(tag => {
                const normalizedTag = normalizeTagPathValue(tag);
                if (normalizedTag.length === 0) {
                    return;
                }
                if (!canonicalTags.has(normalizedTag)) {
                    canonicalTags.set(normalizedTag, tag);
                }
            });
        }

        return Array.from(canonicalTags.values()).sort();
    }

    private async stripTagsFromFrontmatter(
        file: TFile,
        shouldRemove: (normalizedTag: string) => boolean,
        failureContext: string
    ): Promise<boolean> {
        let changed = false;
        try {
            await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                let removedCanonicalTagFieldKey: string | null = null;
                const mutated = mutateFrontmatterTagFields(frontmatter, field => {
                    if (Array.isArray(field.value)) {
                        if (field.isAlias) {
                            const result = this.filterAliasValues(field.value as string[], shouldRemove);
                            if (!result.changed) {
                                return;
                            }
                            if (result.nextValue === undefined) {
                                field.remove();
                            } else {
                                field.set(result.nextValue);
                            }
                            return;
                        }

                        const result = this.filterFrontmatterTags(field.value as string[], shouldRemove);
                        if (!result.changed) {
                            return;
                        }
                        if (result.nextValue === undefined) {
                            field.remove();
                            if (field.lowerKey === 'tags' || field.lowerKey === 'tag') {
                                removedCanonicalTagFieldKey = removedCanonicalTagFieldKey ?? field.key;
                            }
                        } else {
                            field.set(result.nextValue);
                        }
                        return;
                    }

                    const targetValue = field.value;
                    if (typeof targetValue !== 'string') {
                        return;
                    }

                    if (field.isAlias) {
                        const result = this.filterAliasValues(targetValue, shouldRemove);
                        if (!result.changed) {
                            return;
                        }
                        if (result.nextValue === undefined) {
                            field.remove();
                        } else {
                            field.set(result.nextValue);
                        }
                        return;
                    }

                    const result = this.filterFrontmatterTags(targetValue, shouldRemove);
                    if (!result.changed) {
                        return;
                    }
                    if (result.nextValue === undefined) {
                        field.remove();
                        if (field.lowerKey === 'tags' || field.lowerKey === 'tag') {
                            removedCanonicalTagFieldKey = removedCanonicalTagFieldKey ?? field.key;
                        }
                    } else {
                        field.set(result.nextValue);
                    }
                });

                if (removedCanonicalTagFieldKey) {
                    this.cleanupFrontmatterTags(frontmatter, removedCanonicalTagFieldKey);
                }

                if (mutated || removedCanonicalTagFieldKey !== null) {
                    changed = true;
                }
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                error.message = `[Notebook Navigator] Failed to ${failureContext}: ${error.message}`;
                throw error;
            }
            throw Object.assign(new Error(`[Notebook Navigator] Failed to ${failureContext}`), { cause: error });
        }
        return changed;
    }

    private filterFrontmatterTags(
        value: string | string[],
        shouldRemove: (normalizedTag: string) => boolean
    ): { nextValue?: string | string[]; changed: boolean } {
        if (Array.isArray(value)) {
            const { filtered, removed } = this.filterStringArrayEntries(
                value,
                entry => normalizeTagPathValue(entry),
                normalized => normalized.length === 0 || shouldRemove(normalized)
            );

            if (!removed) {
                return { nextValue: value, changed: false };
            }

            return {
                nextValue: filtered.length === 0 ? undefined : (filtered as string[]),
                changed: true
            };
        }

        if (typeof value === 'string') {
            const parsed = parseFrontMatterTags({ tags: value }) ?? [];
            if (parsed.length === 0) {
                return { nextValue: value, changed: false };
            }

            const { filtered, removed } = this.filterStringArrayEntries(
                parsed,
                entry => normalizeTagPathValue(entry),
                normalized => normalized.length === 0 || shouldRemove(normalized)
            );

            if (!removed) {
                return { nextValue: value, changed: false };
            }

            const filteredTags = filtered.filter((entry): entry is string => typeof entry === 'string');
            if (filteredTags.length === 0) {
                return { changed: true };
            }

            return {
                nextValue: filteredTags.length === 1 ? filteredTags[0] : filteredTags,
                changed: true
            };
        }

        return { nextValue: value, changed: false };
    }

    private filterAliasValues(
        value: string | string[],
        shouldRemove: (normalizedTag: string) => boolean
    ): { nextValue?: string | string[]; changed: boolean } {
        if (Array.isArray(value)) {
            const { filtered, removed } = this.filterStringArrayEntries(
                value,
                entry => {
                    const trimmed = entry.trim();
                    if (!trimmed.startsWith('#')) {
                        return null;
                    }
                    const normalized = normalizeTagPathValue(trimmed);
                    if (normalized.length === 0) {
                        return null;
                    }
                    return normalized;
                },
                shouldRemove
            );

            if (!removed) {
                return { nextValue: value, changed: false };
            }

            return {
                nextValue: filtered.length === 0 ? undefined : (filtered as string[]),
                changed: true
            };
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed.startsWith('#')) {
                return { nextValue: value, changed: false };
            }

            const normalized = normalizeTagPathValue(trimmed);
            if (normalized.length === 0 || !shouldRemove(normalized)) {
                return { nextValue: value, changed: false };
            }

            return { changed: true };
        }

        return { nextValue: value, changed: false };
    }

    private filterStringArrayEntries(
        entries: unknown[],
        normalize: (entry: string) => string | null,
        shouldRemove: (normalized: string) => boolean
    ): { filtered: unknown[]; removed: boolean } {
        let removed = false;
        const filtered: unknown[] = [];

        for (const entry of entries) {
            if (typeof entry !== 'string') {
                filtered.push(entry);
                continue;
            }

            const trimmed = entry.trim();
            if (trimmed.length === 0) {
                removed = true;
                continue;
            }

            const normalized = normalize(trimmed);
            if (normalized === null) {
                filtered.push(trimmed);
                continue;
            }

            if (shouldRemove(normalized)) {
                removed = true;
                continue;
            }

            filtered.push(trimmed);
        }

        return { filtered, removed };
    }

    private resolveFrontmatterTagFieldKey(frontmatter: Record<string, unknown>): string | null {
        return findMatchingRecordKey(frontmatter, 'tags') ?? findMatchingRecordKey(frontmatter, 'tag');
    }

    private dedupeCanonicalTagValues(tags: readonly string[]): string[] {
        const uniqueTags: string[] = [];
        const seen = new Set<string>();

        tags.forEach(tag => {
            const trimmed = tag.trim();
            if (trimmed.length === 0) {
                return;
            }

            const normalized = normalizeTagPathValue(trimmed);
            if (!normalized || seen.has(normalized)) {
                return;
            }

            seen.add(normalized);
            uniqueTags.push(trimmed);
        });

        return uniqueTags;
    }

    private cleanupFrontmatterTags(frontmatter: Record<string, unknown>, tagFieldKey: string = 'tags'): void {
        const settings = this.getSettings();
        const keepProperty = Boolean(settings?.keepEmptyTagsProperty);
        if (keepProperty) {
            frontmatter[tagFieldKey] = [];
            return;
        }
        if (Reflect.has(frontmatter, tagFieldKey)) {
            delete frontmatter[tagFieldKey];
        }
    }

    private async stripInlineTags(file: TFile, tags: string[]): Promise<boolean> {
        const uniqueTags = this.dedupeCanonicalTagValues(tags);
        if (uniqueTags.length === 0) {
            return false;
        }

        const inlineCompatibleTags = uniqueTags.filter(tag => isInlineTagValueCompatible(tag));
        if (inlineCompatibleTags.length === 0) {
            return false;
        }

        inlineCompatibleTags.sort((a, b) => b.length - a.length);
        const tagPatterns = inlineCompatibleTags.map(tag => ({
            tag,
            pattern: this.buildSpecificTagPattern(tag)
        }));

        let hasInlineMatch = false;
        let cachedContent: string | undefined;
        // Access the vault's read method if it exists (not all vault implementations have it)
        const vaultWithRead = this.app.vault as { read?: (file: TFile) => Promise<string> };
        if (typeof vaultWithRead.read === 'function') {
            try {
                cachedContent = await vaultWithRead.read(file);
                if (typeof cachedContent === 'string') {
                    const contentToCheck = cachedContent;
                    hasInlineMatch = tagPatterns.some(({ pattern }) => this.matchesPattern(contentToCheck, pattern));
                }
            } catch (error: unknown) {
                console.error('[Notebook Navigator] Failed to read file while stripping inline tags', error);
                throw error instanceof Error ? error : new Error('[Notebook Navigator] Failed to read file while stripping inline tags');
            }
        } else {
            hasInlineMatch = true;
        }

        if (!hasInlineMatch) {
            return false;
        }

        if (typeof cachedContent === 'string') {
            const result = this.applyInlineTagRemoval(cachedContent, tagPatterns);
            if (!result.changed) {
                return false;
            }

            await this.app.vault.modify(file, result.content);
            return true;
        }

        let changed = false;
        await this.app.vault.process(file, content => {
            const result = this.applyInlineTagRemoval(content, tagPatterns);
            if (result.changed) {
                changed = true;
            }
            return result.content;
        });
        return changed;
    }

    /**
     * Removes inline tags from content based on provided patterns.
     * Returns the modified content and whether any changes were made.
     */
    private applyInlineTagRemoval(content: string, tagPatterns: { tag: string; pattern: RegExp }[]): { content: string; changed: boolean } {
        if (tagPatterns.length === 0) {
            return { content, changed: false };
        }

        let updatedContent = content;
        let changed = false;
        // Calculate ranges where tags should not be removed (code blocks, inline code, HTML)
        let exclusionRanges = this.computeInlineTagExclusionRanges(updatedContent);

        for (const { pattern } of tagPatterns) {
            const { content: nextContent, exclusionRanges: nextRanges } = this.removeInlineTagsWithPattern(
                updatedContent,
                pattern,
                exclusionRanges
            );
            if (nextContent !== updatedContent) {
                changed = true;
                updatedContent = nextContent;
            }
            exclusionRanges = nextRanges;
        }

        return { content: updatedContent, changed };
    }

    private hasInlineTags(content: string): boolean {
        return TagFileMutations.INLINE_TAG_TEST_PATTERN.test(content);
    }

    private buildSpecificTagPattern(tag: string): RegExp {
        const trimmed = tag.trim();
        const sanitized = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
        const escapedTag = this.escapeRegExp(sanitized);
        return new RegExp(`(${HORIZONTAL_WHITESPACE_SOURCE})?#${escapedTag}${INLINE_TAG_BOUNDARY_SOURCE}`, 'giu');
    }

    /**
     * Removes inline tags matching the pattern while preserving tags in protected contexts
     */
    private removeInlineTagsWithPattern(
        content: string,
        pattern: RegExp,
        exclusionRanges?: NumericRange[]
    ): { content: string; exclusionRanges: NumericRange[] } {
        pattern.lastIndex = 0;
        const ranges = exclusionRanges ?? this.computeInlineTagExclusionRanges(content);
        // Track removals to update exclusion ranges correctly
        const removals: { start: number; length: number }[] = [];
        const updatedContent = content.replace(pattern, (match: string, leadingWhitespace: string | undefined, offset: number) => {
            const whitespaceLength = leadingWhitespace?.length ?? 0;
            const tagIndex = offset + whitespaceLength;
            const precedingChar = tagIndex > 0 ? content.charAt(tagIndex - 1) : null;
            if (!isValidTagPrecedingChar(precedingChar)) {
                return match;
            }
            // Skip removal if tag is within protected context
            if (isIndexInRanges(tagIndex, ranges)) {
                return match;
            }
            removals.push({ start: offset, length: match.length });
            return '';
        });
        // Adjust exclusion ranges to account for removed text
        if (removals.length > 0) {
            let delta = 0;
            for (const removal of removals) {
                const adjustedStart = removal.start - delta;
                this.shiftRangesAfterRemoval(ranges, adjustedStart, removal.length);
                delta += removal.length;
            }
        }
        return {
            content: updatedContent,
            exclusionRanges: ranges
        };
    }

    private matchesPattern(content: string, pattern: RegExp): boolean {
        pattern.lastIndex = 0;
        return pattern.test(content);
    }

    private escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Identifies text ranges where inline tags should be preserved (code blocks, inline code, HTML tags)
     */
    private computeInlineTagExclusionRanges(content: string): NumericRange[] {
        const fencedBlocks = findFencedCodeBlockRanges(content);
        const inlineCodeSpans = findInlineCodeRanges(content, fencedBlocks);
        const htmlTagRanges = findHtmlTagRanges(content);
        return mergeRanges([...fencedBlocks, ...inlineCodeSpans, ...htmlTagRanges]);
    }

    /**
     * Shifts ranges forward to account for removed text before the range start.
     * Requires ranges to be sorted and non-overlapping; callers always supply merged ranges.
     */
    private shiftRangesAfterRemoval(ranges: NumericRange[], removalStart: number, removalLength: number): void {
        if (removalLength <= 0) {
            return;
        }
        const removalEnd = removalStart + removalLength;
        for (const range of ranges) {
            // Range is completely before removal - no adjustment needed
            if (range.end <= removalStart) {
                continue;
            }
            // Range is completely after removal - shift both start and end
            if (range.start >= removalEnd) {
                range.start -= removalLength;
                range.end -= removalLength;
                continue;
            }
            // Range partially overlaps with removal - adjust end only
            range.end = Math.max(range.start, range.end - removalLength);
        }
    }
}
