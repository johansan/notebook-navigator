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

import type { InclusionOperator } from '../utils/filterSearchTypes';

/**
 * Search providers supported by Notebook Navigator.
 */
export type SearchProvider = 'internal' | 'omnisearch';

/**
 * Individual match returned by search providers that support excerpts (e.g., Omnisearch).
 */
export interface SearchResultMatch {
    offset: number;
    length: number;
    text: string;
}

/**
 * Metadata captured for search results when using external providers.
 */
export interface SearchResultMeta {
    score: number;
    terms: string[];
    matches: SearchResultMatch[];
    excerpt?: string;
}

export interface AliasSearchMatch {
    value: string;
    /** Folded internal-search name terms used to calculate highlights when the virtualized row renders. */
    foldedTerms: readonly string[];
}

/**
 * Captures navigation-related filters derived from the search query.
 * Used to highlight matching tags and properties inside the navigation tree.
 */
export type SearchNavInclusionOperatorMap = Record<string, InclusionOperator>;

export interface SearchNavFilterState {
    tags: {
        include: string[];
        exclude: string[];
        includeOperators: SearchNavInclusionOperatorMap;
        excludeTagged: boolean;
        includeUntagged: boolean;
        requireTagged: boolean;
    };
    properties: {
        include: string[];
        exclude: string[];
        includeOperators: SearchNavInclusionOperatorMap;
    };
}

export const EMPTY_SEARCH_NAV_FILTER_STATE: SearchNavFilterState = {
    tags: {
        include: [],
        exclude: [],
        includeOperators: {},
        excludeTagged: false,
        includeUntagged: false,
        requireTagged: false
    },
    properties: {
        include: [],
        exclude: [],
        includeOperators: {}
    }
};
