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
import { DATE_FILTER_RELATIVE_KEYWORDS, parseDateFieldPrefix } from '../utils/filterSearch';
import { naturalCompare } from '../utils/sortUtils';

interface DateSuggestionItem {
    token: string;
    match: SearchResult | null;
}

interface ActiveDateRange {
    start: number;
    end: number;
    prefix: string;
    query: string;
}

interface SearchDateInputSuggestOptions {
    onApply: (nextValue: string, cursor: number) => void;
    isMobile: boolean;
}

const DATE_LIMIT = 20;
// Pattern matching valid characters in a date filter fragment (digits, separators, field prefixes)
const DATE_FRAGMENT_PATTERN = /^[a-z0-9:./-]*$/i;
const DATE_FRAGMENT_PREFIX = /^[a-z0-9:./-]*/i;

// Checks if the character before @ is valid (whitespace, !, or start of string)
const isValidDatePrecedingChar = (char: string | null | undefined): boolean => {
    if (!char) {
        return true;
    }
    return /\s/.test(char) || char === '!';
};

/**
 * Provides inline date filter suggestions when typing '@' inside the Notebook Navigator search input.
 * Suggestions insert tokens that can be used by Filter search (internal provider).
 */
export class SearchDateInputSuggest extends AbstractInputSuggest<DateSuggestionItem> {
    declare containerEl: HTMLElement;
    private readonly applySuggestion: SearchDateInputSuggestOptions['onApply'];
    private readonly searchInputEl: HTMLInputElement;
    private readonly isMobile: boolean;
    private activeRange: ActiveDateRange | null = null;

    constructor(app: App, inputEl: HTMLInputElement, options: SearchDateInputSuggestOptions) {
        super(app, inputEl);
        this.applySuggestion = options.onApply;
        this.searchInputEl = inputEl;
        this.limit = DATE_LIMIT;
        this.isMobile = options.isMobile;
    }

    getSuggestions(_input: string): DateSuggestionItem[] {
        const range = this.resolveActiveRange();
        if (!range) {
            this.activeRange = null;
            return [];
        }

        this.activeRange = range;
        const trimmedQuery = range.query.trim();
        if (!trimmedQuery) {
            return DATE_FILTER_RELATIVE_KEYWORDS.slice(0, this.limit).map(token => ({ token, match: null }));
        }

        const search = prepareFuzzySearch(trimmedQuery);
        const matches: DateSuggestionItem[] = [];

        for (const token of DATE_FILTER_RELATIVE_KEYWORDS) {
            const result = search(token);
            if (result) {
                matches.push({ token, match: result });
            }
        }

        // Obsidian fuzzy scores are negative penalties where values closer to 0 are better matches,
        // so sort descending before applying the limit. Otherwise the closest matches are cut off.
        matches.sort((a, b) => {
            const scoreA = a.match?.score ?? Number.NEGATIVE_INFINITY;
            const scoreB = b.match?.score ?? Number.NEGATIVE_INFINITY;
            if (scoreA === scoreB) {
                return naturalCompare(a.token, b.token);
            }
            return scoreB - scoreA;
        });

        return matches.slice(0, this.limit);
    }

    renderSuggestion(item: DateSuggestionItem, el: HTMLElement): void {
        el.addClass('nn-search-tag-suggestion');
        const container = el.createDiv({ cls: 'nn-search-tag-suggestion__label' });
        container.createSpan({ cls: 'nn-search-tag-suggestion__prefix', text: '@' });
        const textEl = container.createSpan({ cls: 'nn-search-tag-suggestion__text' });

        if (item.match && item.match.matches.length > 0) {
            renderMatches(textEl, item.token, item.match.matches);
        } else {
            textEl.setText(item.token);
        }
    }

    selectSuggestion(item: DateSuggestionItem): void {
        if (!this.activeRange) {
            this.close();
            return;
        }

        const { start, end, prefix } = this.activeRange;
        const currentValue = this.searchInputEl.value;
        const before = currentValue.substring(0, start);
        const after = currentValue.substring(end);
        const replacement = `@${prefix}${item.token}`;
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
            console.error('[SearchDateInputSuggest] containerEl missing on open');
            return;
        }

        this.containerEl.addClass('nn-mobile');
    }

    // Locates the active @-prefixed date token at the cursor position, if any
    private resolveActiveRange(): ActiveDateRange | null {
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

        const atIndex = value.lastIndexOf('@', cursor - 1);
        if (atIndex === -1) {
            return null;
        }

        if (atIndex > 0) {
            const beforeChar = value.charAt(atIndex - 1);
            if (!isValidDatePrecedingChar(beforeChar)) {
                return null;
            }
        }

        const fragmentBeforeCursor = value.slice(atIndex + 1, cursor);
        if (!DATE_FRAGMENT_PATTERN.test(fragmentBeforeCursor)) {
            return null;
        }

        const trailingMatch = value.slice(cursor).match(DATE_FRAGMENT_PREFIX);
        const trailing = trailingMatch?.[0] ?? '';
        const combinedFragment = fragmentBeforeCursor + trailing;
        if (!DATE_FRAGMENT_PATTERN.test(combinedFragment)) {
            return null;
        }

        const { prefix, remainder: query } = parseDateFieldPrefix(combinedFragment);

        return {
            start: atIndex,
            end: cursor + trailing.length,
            prefix,
            query
        };
    }
}
