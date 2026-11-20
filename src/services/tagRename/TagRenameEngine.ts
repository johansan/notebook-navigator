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

import { App, TFile, parseFrontMatterAliases, parseFrontMatterTags, TagCache } from 'obsidian';
import type { TagSourceSetting } from '../../settings/types';
import { normalizeCaseInsensitiveIdentifierPreservingWhitespace } from '../../utils/recordUtils';
import { normalizeTagPathValue } from '../../utils/tagPrefixMatcher';
import { mutateFrontmatterTagFields } from './frontmatterTagMutator';

/**
 * Describes a tag and provides helper utilities for normalization.
 * Preserves the original casing supplied at construction while exposing
 * canonical lowercase variants for comparisons.
 */
export class TagDescriptor {
    readonly tag: string;
    readonly name: string;
    readonly canonical: string;
    readonly canonicalPrefix: string;
    readonly canonicalName: string;

    constructor(name: string) {
        const normalizedTag = TagDescriptor.ensureHashPrefix(name.trim());
        const canonicalName = normalizeTagPathValue(normalizedTag);
        this.tag = normalizedTag;
        this.name = normalizedTag.slice(1);
        this.canonicalName = canonicalName;
        this.canonical = canonicalName.length > 0 ? `#${canonicalName}` : '#';
        this.canonicalPrefix = canonicalName.length > 0 ? `${this.canonical}/` : this.canonical;
    }

    /**
     * Checks whether the provided text represents this tag or one of its descendants.
     * Comparison is case-insensitive and accepts values with or without a leading hash.
     */
    matches(text: string): boolean {
        if (!text) {
            return false;
        }
        const normalized = normalizeTagPathValue(text);
        if (normalized.length === 0) {
            return false;
        }
        return normalized === this.canonicalName || normalized.startsWith(`${this.canonicalName}/`);
    }

    toString(): string {
        return this.tag;
    }

    static isTag(value: string): boolean {
        return value.startsWith('#');
    }

    static ensureHashPrefix(name: string): string {
        let tagName = name;
        while (tagName.startsWith('##')) {
            tagName = tagName.slice(1);
        }
        return tagName.startsWith('#') ? tagName : `#${tagName}`;
    }
}

/**
 * Checks if a tag rename would move a tag into itself or one of its descendants
 */
export function isDescendantRename(source: TagDescriptor, target: TagDescriptor): boolean {
    return target.canonical.startsWith(source.canonicalPrefix);
}

/**
 * Performs string substitutions for tag rename operations.
 * Maintains a cache to reuse computed replacements across different variants
 * (e.g., original casing, lowercase, nested paths).
 */
export class TagReplacement {
    private readonly cache: Map<string, string>;

    constructor(
        private readonly fromTag: TagDescriptor,
        private readonly toTag: TagDescriptor
    ) {
        this.cache = new Map();
        // Pre-cache common transformations for faster lookup
        this.cache.set(this.fromTag.tag, this.toTag.tag);
        this.cache.set(this.fromTag.name, this.toTag.name);
        this.cache.set(normalizeCaseInsensitiveIdentifierPreservingWhitespace(this.fromTag.tag), this.toTag.tag);
        if (this.fromTag.name.length > 0) {
            this.cache.set(normalizeCaseInsensitiveIdentifierPreservingWhitespace(this.fromTag.name), this.toTag.name);
        }
    }

    getSourceTag(): TagDescriptor {
        return this.fromTag;
    }

    getTargetTag(): TagDescriptor {
        return this.toTag;
    }

    private replaceMatchedValue(value: string): string {
        const cached = this.lookup(value);
        if (cached !== value) {
            return cached;
        }

        const normalizedValue = normalizeCaseInsensitiveIdentifierPreservingWhitespace(value);
        const normalizedCached = this.lookup(normalizedValue);
        if (normalizedCached !== normalizedValue) {
            return this.cacheValue(value, normalizedValue, normalizedCached);
        }

        if (normalizedValue.startsWith(this.fromTag.canonicalPrefix)) {
            const substituted = this.replaceMatchedTagPrefix(value, true);
            return this.cacheValue(value, normalizedValue, substituted);
        }

        if (`#${normalizedValue}`.startsWith(this.fromTag.canonicalPrefix)) {
            const substituted = this.replaceMatchedTagPrefix(value, false);
            return this.cacheValue(value, normalizedValue, substituted);
        }

        return value;
    }

    /**
     * Replaces the matched tag within a string literal at the specified position.
     * When `matchedValue` is provided, its length is used for the splice.
     */
    inString(text: string, position = 0, matchedValue?: string): string {
        const targetValue = matchedValue ?? (position === 0 ? text : this.fromTag.tag);
        const replacement = this.replaceMatchedValue(targetValue);
        return `${text.slice(0, position)}${replacement}${text.slice(position + targetValue.length)}`;
    }

    private replaceMatchedTagPrefix(value: string, includeHash: boolean): string {
        const rawValue = includeHash ? value.slice(1) : value;
        const sourceDepth = this.fromTag.canonicalName.split('/').filter(Boolean).length;
        if (sourceDepth === 0) {
            return value;
        }

        const suffixSegments = rawValue.split('/').slice(sourceDepth);
        const targetValue = includeHash ? this.toTag.tag : this.toTag.name;
        if (suffixSegments.length === 0) {
            return targetValue;
        }

        return `${targetValue}/${suffixSegments.join('/')}`;
    }

    /**
     * Replaces tag occurrences within an array of values. Handles nested arrays,
     * comma-separated strings, and tag aliases that may or may not include '#'.
     */
    inArray(values: unknown[], skipOddEntries: boolean, isAlias: boolean): unknown[] {
        return values.map((value, index) => {
            if (skipOddEntries && index & 1) {
                return value;
            }

            if (typeof value !== 'string' || value.length === 0) {
                return value;
            }

            if (isAlias) {
                if (!TagDescriptor.isTag(value)) {
                    return value;
                }
            } else if (/[ ,\n]/.test(value)) {
                const segments = value.split(/([, \n]+)/u);
                const replaced = this.inArray(segments, true, false).join('');
                return replaced;
            }

            return this.replaceMatchedValue(value);
        });
    }

    /**
     * Detects whether renaming will merge multiple tags by checking if any existing tag
     * will collide with an already existing canonical tag after replacement.
     *
     * @param tagNames Existing tags (including '#')
     * @returns The first detected collision as a tuple of original and conflicting tags, or null.
     */
    willMergeTags(tagNames: string[]): [TagDescriptor, TagDescriptor] | null {
        if (this.fromTag.canonical === this.toTag.canonical) {
            return null;
        }

        const existing = new Set(tagNames.map(name => normalizeCaseInsensitiveIdentifierPreservingWhitespace(name)));

        for (const tagName of tagNames.filter(name => this.fromTag.matches(name))) {
            const renamed = this.inString(tagName);
            if (existing.has(normalizeCaseInsensitiveIdentifierPreservingWhitespace(renamed))) {
                return [new TagDescriptor(tagName), new TagDescriptor(renamed)];
            }
        }

        return null;
    }

    /**
     * Looks up a replacement value from the cache, returning the original key if not found
     */
    private lookup(key: string): string {
        return this.cache.get(key) ?? key;
    }

    /**
     * Caches a replacement value for both original and canonical lookup variants.
     */
    private cacheValue(original: string, normalized: string, value: string): string {
        this.cache.set(original, value);
        this.cache.set(normalized, value);
        return value;
    }
}

export type RenameFileOutcome = 'changed' | 'skipped';
export type RenameFileSkipReason = 'file-missing' | 'file-changed' | 'no-op';

export type RenameFileApplyResult =
    | {
          outcome: 'changed';
      }
    | {
          outcome: 'skipped';
          reason: RenameFileSkipReason;
      };

/**
 * Represents a file that contains tag occurrences slated for renaming.
 * Stores inline tag positions and whether frontmatter contains matching tags.
 */
export class RenameFile {
    constructor(
        private readonly app: App,
        private readonly path: string,
        private readonly tagPositions: TagCache[],
        private readonly hasFrontMatterMatches: boolean
    ) {}

    get filePath(): string {
        return this.path;
    }

    /**
     * Applies tag replacement across inline content and frontmatter.
     * Skips the file if inline positions no longer match cached tag values.
     *
     * @returns Result describing whether updates were applied, or why the file was skipped.
     */
    async renamed(replacement: TagReplacement): Promise<RenameFileApplyResult> {
        const file = this.app.vault.getAbstractFileByPath(this.path);
        if (!file || !(file instanceof TFile)) {
            return { outcome: 'skipped', reason: 'file-missing' };
        }

        const original = await this.app.vault.read(file);
        let updatedText = original;
        const sourceTag = replacement.getSourceTag();

        for (const tagCache of this.tagPositions) {
            const { start, end } = tagCache.position;
            const extracted = original.slice(start.offset, end.offset);
            const cacheTag = tagCache.tag;
            const matchesExtracted = sourceTag.matches(extracted);
            const matchesCache = typeof cacheTag === 'string' ? sourceTag.matches(cacheTag) : false;
            if (!matchesExtracted || !matchesCache) {
                return { outcome: 'skipped', reason: 'file-changed' };
            }
            updatedText = replacement.inString(updatedText, start.offset, extracted);
        }

        const inlineChanged = updatedText !== original;
        if (inlineChanged) {
            await this.app.vault.modify(file, updatedText);
        }

        const frontmatterChanged = this.hasFrontMatterMatches ? await this.renameFrontmatter(replacement) : false;
        if (inlineChanged || frontmatterChanged) {
            return { outcome: 'changed' };
        }
        return { outcome: 'skipped', reason: 'no-op' };
    }

    private async renameFrontmatter(replacement: TagReplacement): Promise<boolean> {
        const file = this.app.vault.getAbstractFileByPath(this.path);
        if (!file || !(file instanceof TFile)) {
            return false;
        }

        let changed = false;

        await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
            const renameStringValue = (value: string, isAlias: boolean): [string, boolean] => {
                const segments = value.split(isAlias ? /(^\s+|\s*,\s*|\s+$)/u : /([\s,]+)/u);
                const replacedSegments = replacement.inArray(segments, true, isAlias);
                const nextValue = replacedSegments.map(segment => (typeof segment === 'string' ? segment : String(segment))).join('');
                return [nextValue, nextValue !== value];
            };

            const renameArrayValue = (values: unknown[], isAlias: boolean): [unknown[], boolean] => {
                let localChanged = false;
                const updated = values.map(entry => {
                    if (typeof entry !== 'string') {
                        return entry;
                    }
                    const result = replacement.inArray([entry], false, isAlias)[0];
                    if (result !== entry) {
                        localChanged = true;
                    }
                    return result;
                });
                return [updated, localChanged];
            };

            const mutated = mutateFrontmatterTagFields(frontmatter, field => {
                if (Array.isArray(field.value)) {
                    const [next, localChanged] = renameArrayValue(field.value, field.isAlias);
                    if (!localChanged) {
                        return;
                    }
                    field.set(next);
                    return;
                }

                const [next, localChanged] = renameStringValue(field.value, field.isAlias);
                if (!localChanged) {
                    return;
                }
                field.set(next);
            });

            if (mutated) {
                changed = true;
            }
        });

        return changed;
    }
}

/**
 * Collects files that contain the specified tag or any descendant tags.
 * Produces a list of RenameFile instances that capture inline tag positions
 * and whether matching values exist in frontmatter. With the `frontmatter` tag source, inline tags are left out, so a
 * file is collected only for frontmatter matches and its note body is never edited.
 */
export function collectRenameFiles(app: App, tag: TagDescriptor, tagSource: TagSourceSetting): RenameFile[] {
    const targets: RenameFile[] = [];
    const metadataCache = app.metadataCache;
    const filesToInspect = app.vault.getMarkdownFiles();

    for (const file of filesToInspect) {
        const path = file.path;
        const cache = metadataCache.getCache(path);
        if (!cache) {
            continue;
        }

        const inlineTags =
            tagSource === 'all' && Array.isArray(cache.tags)
                ? cache.tags.filter(tagCache => typeof tagCache.tag === 'string' && tag.matches(tagCache.tag)).reverse()
                : [];

        const frontmatter = cache.frontmatter;
        const frontmatterTags = (parseFrontMatterTags(frontmatter) ?? []).map(value => TagDescriptor.ensureHashPrefix(value));
        const aliasValues = (parseFrontMatterAliases(frontmatter) ?? []).filter(value => TagDescriptor.isTag(value));

        const frontmatterMatches = frontmatterTags.filter(value => tag.matches(value));
        const aliasMatches = aliasValues.filter(value => tag.matches(value));
        const hasFrontmatter = frontmatterMatches.length > 0 || aliasMatches.length > 0;

        if (inlineTags.length === 0 && !hasFrontmatter) {
            continue;
        }

        targets.push(new RenameFile(app, path, inlineTags, hasFrontmatter));
    }

    return targets;
}
