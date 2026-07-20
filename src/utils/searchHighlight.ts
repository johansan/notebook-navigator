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

import { mergeRanges, type NumericRange } from './arrayUtils';
import { foldSearchText } from './recordUtils';

export type SearchMatchState = 'include' | 'exclude';

// Internal constants not exported to prevent unused exports
const SEARCH_MATCH_INCLUDE_CLASS = 'nn-navitem-content--search-include';
const SEARCH_MATCH_EXCLUDE_CLASS = 'nn-navitem-content--search-exclude';

interface FoldedSearchOffsetMap {
    foldedText: string;
    sourceStarts: number[];
    sourceEnds: number[];
}

function buildFoldedSearchOffsetMap(value: string): FoldedSearchOffsetMap {
    const foldedText = foldSearchText(value);
    const sourceStarts: number[] = [];
    const sourceEnds: number[] = [];
    let previousFoldedLength = 0;
    let sourceStart = 0;

    for (const char of value) {
        const sourceEnd = sourceStart + char.length;
        const foldedPrefixLength = foldSearchText(value.slice(0, sourceEnd)).length;

        for (let foldedIndex = previousFoldedLength; foldedIndex < foldedPrefixLength; foldedIndex += 1) {
            sourceStarts[foldedIndex] = sourceStart;
            sourceEnds[foldedIndex] = sourceEnd;
        }

        // A removed combining mark or a recomposed code point belongs to the preceding visible character.
        // Extending that source range keeps accents inside the highlighted grapheme.
        if (foldedPrefixLength === previousFoldedLength && foldedPrefixLength > 0) {
            sourceEnds[foldedPrefixLength - 1] = sourceEnd;
        }

        previousFoldedLength = foldedPrefixLength;
        sourceStart = sourceEnd;
    }

    return { foldedText, sourceStarts, sourceEnds };
}

/**
 * Maps folded internal-search terms back to source-text ranges.
 * Returns merged UTF-16 ranges for every occurrence, or an empty array when no term matches.
 */
export function getFoldedSearchHighlightRanges(text: string, foldedTerms: readonly string[]): NumericRange[] {
    if (!text || foldedTerms.length === 0) {
        return [];
    }

    const offsetMap = buildFoldedSearchOffsetMap(text);
    const ranges: NumericRange[] = [];
    const seenTerms = new Set<string>();

    for (const term of foldedTerms) {
        if (!term || seenTerms.has(term)) {
            continue;
        }
        seenTerms.add(term);

        let foldedStart = offsetMap.foldedText.indexOf(term);
        while (foldedStart !== -1) {
            const foldedEnd = foldedStart + term.length;
            const sourceRangeStart = offsetMap.sourceStarts[foldedStart];
            const sourceRangeEnd = offsetMap.sourceEnds[foldedEnd - 1];
            if (sourceRangeStart !== undefined && sourceRangeEnd !== undefined) {
                ranges.push({ start: sourceRangeStart, end: sourceRangeEnd });
            }
            foldedStart = offsetMap.foldedText.indexOf(term, foldedStart + term.length);
        }
    }

    return mergeRanges(ranges);
}

/**
 * Build the class name for navigation item content that may be search-highlighted.
 * Ensures include/exclude styling remains consistent across components.
 */
export function buildSearchMatchContentClass(baseClasses: readonly string[], searchMatch?: SearchMatchState): string {
    const classes = [...baseClasses];

    if (searchMatch === 'include') {
        classes.push(SEARCH_MATCH_INCLUDE_CLASS);
    } else if (searchMatch === 'exclude') {
        classes.push(SEARCH_MATCH_EXCLUDE_CLASS);
    }

    return classes.join(' ');
}
