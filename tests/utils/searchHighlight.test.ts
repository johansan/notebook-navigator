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

import { describe, expect, it } from 'vitest';
import { getFoldedSearchHighlightRanges } from '../../src/utils/searchHighlight';

describe('getFoldedSearchHighlightRanges', () => {
    it('returns each matching alias term range', () => {
        expect(getFoldedSearchHighlightRanges('Notebook Navigator', ['notebook', 'navigator'])).toEqual([
            { start: 0, end: 8 },
            { start: 9, end: 18 }
        ]);
    });

    it('maps folded Latin terms back to accented source text', () => {
        expect(getFoldedSearchHighlightRanges('Résumé', ['resume'])).toEqual([{ start: 0, end: 6 }]);
    });

    it('keeps removed combining marks inside the highlighted grapheme', () => {
        expect(getFoldedSearchHighlightRanges('Cafe\u0301 notes', ['cafe'])).toEqual([{ start: 0, end: 5 }]);
    });

    it('returns no ranges for unmatched terms', () => {
        expect(getFoldedSearchHighlightRanges('Notebook Navigator', ['other'])).toEqual([]);
    });
});
