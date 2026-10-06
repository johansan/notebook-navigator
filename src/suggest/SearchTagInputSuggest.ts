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

import { AbstractInputSuggest, App, prepareFuzzySearch, renderMatches, SearchResult } from 'obsidian';
import { naturalCompare } from '../utils/sortUtils';
import { TagTreeNode } from '../types/storage';
import { OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT, isValidTagPrecedingChar } from '../utils/tagUtils';

interface TagSuggestionItem {
    displayPath: string;
    match: SearchResult | null;
}

interface ActiveTagRange {
    start: number;
    end: number;
    query: string;
}

interface SearchTagInputSuggestOptions {
    getTags: () => readonly TagTreeNode[];
    onApply: (nextValue: string, cursor: number) => void;
    isMobile: boolean;
}

const TAG_LIMIT = 50;
const TAG_FRAGMENT_PATTERN = new RegExp(`^[^${OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT}]*$`, 'u');
const TAG_FRAGMENT_PREFIX = new RegExp(`^[^${OBSIDIAN_INLINE_TAG_DISALLOWED_CLASS_CONTENT}]*`, 'u');

/**
 * Provides inline tag suggestions when typing '#' inside the Notebook Navigator search input.
 * Uses Obsidian's built-in suggest popover so the UI matches the rest of the app.
 */
export class SearchTagInputSuggest extends AbstractInputSuggest<TagSuggestionItem> {
    declare containerEl: HTMLElement;
    private readonly getTags: SearchTagInputSuggestOptions['getTags'];
    private readonly applySuggestion: SearchTagInputSuggestOptions['onApply'];
    private readonly searchInputEl: HTMLInputElement;
    private readonly isMobile: boolean;
    private activeRange: ActiveTagRange | null = null;

    constructor(app: App, inputEl: HTMLInputElement, options: SearchTagInputSuggestOptions) {
        super(app, inputEl);
        this.getTags = options.getTags;
        this.applySuggestion = options.onApply;
        this.searchInputEl = inputEl;
        this.limit = TAG_LIMIT;
        this.isMobile = options.isMobile;
    }

    getSuggestions(_input: string): TagSuggestionItem[] {
        const range = this.resolveActiveRange();
        if (!range) {
            this.activeRange = null;
            return [];
        }

        this.activeRange = range;
        const tags = this.getTags();
        if (tags.length === 0) {
            return [];
        }

        if (range.query.length === 0) {
            return tags.slice(0, this.limit).map(tag => ({
                displayPath: tag.displayPath,
                match: null
            }));
        }

        const search = prepareFuzzySearch(range.query);
        const matches: TagSuggestionItem[] = [];

        for (const tag of tags) {
            const result = search(tag.displayPath);
            if (result) {
                matches.push({
                    displayPath: tag.displayPath,
                    match: result
                });
            }
        }

        // Obsidian fuzzy scores are negative penalties where values closer to 0 are better matches,
        // so sort descending before applying the limit. Otherwise the closest matches are cut off.
        matches.sort((a, b) => {
            const scoreA = a.match?.score ?? Number.NEGATIVE_INFINITY;
            const scoreB = b.match?.score ?? Number.NEGATIVE_INFINITY;
            if (scoreA === scoreB) {
                return naturalCompare(a.displayPath, b.displayPath);
            }
            return scoreB - scoreA;
        });

        return matches.slice(0, this.limit);
    }

    renderSuggestion(item: TagSuggestionItem, el: HTMLElement): void {
        el.addClass('nn-search-tag-suggestion');
        const container = el.createDiv({ cls: 'nn-search-tag-suggestion__label' });
        container.createSpan({ cls: 'nn-search-tag-suggestion__prefix', text: '#' });
        const textEl = container.createSpan({ cls: 'nn-search-tag-suggestion__text' });

        if (item.match && item.match.matches.length > 0) {
            renderMatches(textEl, item.displayPath, item.match.matches);
        } else {
            textEl.setText(item.displayPath);
        }
    }

    selectSuggestion(item: TagSuggestionItem): void {
        if (!this.activeRange) {
            this.close();
            return;
        }

        const { start, end } = this.activeRange;
        const currentValue = this.searchInputEl.value;
        const before = currentValue.substring(0, start);
        const after = currentValue.substring(end);
        const replacement = `#${item.displayPath}`;
        const nextValue = `${before}${replacement}${after}`;
        const cursor = start + replacement.length;

        this.applySuggestion(nextValue, cursor);
        this.close();
    }

    dispose(): void {
        this.close();
    }

    onOpen(): void {
        if (!this.isMobile) {
            return;
        }

        if (!this.containerEl) {
            console.error('[SearchTagInputSuggest] containerEl missing on open');
            return;
        }

        this.containerEl.addClass('nn-mobile');
    }

    private resolveActiveRange(): ActiveTagRange | null {
        const inputEl = this.searchInputEl;
        const value = inputEl.value;
        if (!value) {
            return null;
        }

        const cursor = inputEl.selectionStart ?? value.length;
        const selectionEnd = inputEl.selectionEnd ?? cursor;
        if (cursor !== selectionEnd) {
            return null;
        }

        const hashIndex = value.lastIndexOf('#', cursor - 1);
        if (hashIndex === -1) {
            return null;
        }

        if (hashIndex > 0) {
            const beforeChar = value.charAt(hashIndex - 1);
            if (beforeChar && !isValidTagPrecedingChar(beforeChar)) {
                return null;
            }
        }

        const fragmentBeforeCursor = value.slice(hashIndex + 1, cursor);
        if (!TAG_FRAGMENT_PATTERN.test(fragmentBeforeCursor)) {
            return null;
        }

        const trailingMatch = value.slice(cursor).match(TAG_FRAGMENT_PREFIX);
        const trailing = trailingMatch?.[0] ?? '';
        const combinedFragment = fragmentBeforeCursor + trailing;
        if (!TAG_FRAGMENT_PATTERN.test(combinedFragment)) {
            return null;
        }

        return {
            start: hashIndex,
            end: cursor + trailing.length,
            query: combinedFragment
        };
    }
}
