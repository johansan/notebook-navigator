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
import { ItemType } from '../../src/types';
import { buildListGroupCollapseKey, normalizeStoredCollapsedListGroupKeys } from '../../src/utils/listGroupCollapse';

describe('normalizeStoredCollapsedListGroupKeys', () => {
    it('keeps string keys, trims empty entries, and deduplicates', () => {
        expect(normalizeStoredCollapsedListGroupKeys([' group:a ', '', 'group:a', 7, null, 'group:b'])).toEqual(['group:a', 'group:b']);
    });

    it('returns an empty list for non-array values', () => {
        expect(normalizeStoredCollapsedListGroupKeys({ key: 'group:a' })).toEqual([]);
        expect(normalizeStoredCollapsedListGroupKeys(null)).toEqual([]);
    });

    it('migrates legacy none grouping keys to custom grouping', () => {
        expect(normalizeStoredCollapsedListGroupKeys(['scope=folder:%2F;group=none;id=section%3Aunsorted'])).toEqual([
            'scope=folder:%2F;group=custom;id=section%3Aunsorted'
        ]);
    });
});

describe('buildListGroupCollapseKey', () => {
    it('scopes keys by navigation selection and grouping mode', () => {
        expect(
            buildListGroupCollapseKey({
                selectionType: ItemType.TAG,
                selectedFolderPath: '/',
                selectedTag: 'work/client a',
                selectedProperty: null,
                groupingMode: 'date',
                groupId: 'date:mtime:relative:today'
            })
        ).toBe('scope=tag:work%2Fclient%20a;group=date;id=date%3Amtime%3Arelative%3Atoday');
    });
});
