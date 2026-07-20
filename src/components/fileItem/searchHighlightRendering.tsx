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

import React from 'react';
import type { NumericRange } from '../../utils/arrayUtils';

export function renderTextWithHighlightRanges(text: string, ranges: readonly NumericRange[]): React.ReactNode {
    if (!text || ranges.length === 0) {
        return text;
    }

    const parts: React.ReactNode[] = [];
    let cursor = 0;
    ranges.forEach((range, index) => {
        if (range.start > cursor) {
            parts.push(text.slice(cursor, range.start));
        }
        parts.push(
            <mark key={`h-${index}`} className="nn-search-highlight">
                {text.slice(range.start, range.end)}
            </mark>
        );
        cursor = range.end;
    });
    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }
    return <>{parts}</>;
}
