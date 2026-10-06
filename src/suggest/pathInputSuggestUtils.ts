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

import { prepareFuzzySearch, renderMatches, type SearchResult } from 'obsidian';
import { naturalCompare } from '../utils/sortUtils';

interface PathSuggestionCandidate<TItem> {
    item: TItem;
    path: string;
    displayPath: string;
}

export interface PathSuggestionItem<TItem> extends PathSuggestionCandidate<TItem> {
    match: SearchResult | null;
}

interface BuildPathSuggestionItemsParams<TItem> {
    items: readonly TItem[];
    query: string;
    limit: number;
    getPath: (item: TItem) => string;
    getDisplayPath?: (item: TItem, path: string) => string;
}

export function buildPathSuggestionItems<TItem>({
    items,
    query,
    limit,
    getPath,
    getDisplayPath
}: BuildPathSuggestionItemsParams<TItem>): PathSuggestionItem<TItem>[] {
    const toDisplayPath = getDisplayPath ?? ((_item: TItem, path: string) => path);
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        const candidates: PathSuggestionCandidate<TItem>[] = items.map(item => {
            const path = getPath(item);
            return {
                item,
                path,
                displayPath: toDisplayPath(item, path)
            };
        });
        candidates.sort((a, b) => naturalCompare(a.path, b.path));
        return candidates.slice(0, limit).map(candidate => ({ ...candidate, match: null }));
    }

    const search = prepareFuzzySearch(trimmedQuery);
    const matches: PathSuggestionItem<TItem>[] = [];

    for (const item of items) {
        const path = getPath(item);
        const result = search(path);
        if (!result) {
            continue;
        }
        matches.push({
            item,
            path,
            displayPath: toDisplayPath(item, path),
            match: result
        });
    }

    // Obsidian fuzzy scores are negative penalties where values closer to 0 are better matches,
    // so sort descending before applying the limit. Otherwise the closest matches are cut off.
    matches.sort((a, b) => {
        const scoreA = a.match?.score ?? Number.NEGATIVE_INFINITY;
        const scoreB = b.match?.score ?? Number.NEGATIVE_INFINITY;
        if (scoreA === scoreB) {
            return naturalCompare(a.path, b.path);
        }
        return scoreB - scoreA;
    });

    return matches.slice(0, limit);
}

export function renderPathSuggestion(value: { displayPath: string; match: SearchResult | null }, el: HTMLElement): void {
    if (value.match && value.match.matches.length > 0) {
        renderMatches(el, value.displayPath, value.match.matches);
        return;
    }
    el.setText(value.displayPath);
}
