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
import { describe, it, expect } from 'vitest';
import { normalizeUXIconMapRecord, resolveUXIcon, resolveUXIconForMenu } from '../../src/utils/uxIcons';

describe('resolveUXIcon', () => {
    it('returns defaults when no overrides are present', () => {
        expect(resolveUXIcon(undefined, 'list-search')).toBe('search');
        expect(resolveUXIcon(undefined, 'nav-tags')).toBe('tags');
        expect(resolveUXIcon(undefined, 'nav-tag')).toBe('tag');
        expect(resolveUXIcon(undefined, 'file-unfinished-task')).toBe('circle-alert');
    });

    it('deserializes Iconize formatted overrides', () => {
        expect(resolveUXIcon({ 'list-search': 'LiStar' }, 'list-search')).toBe('star');
    });
});

describe('resolveUXIconForMenu', () => {
    it('uses the registered default icon when no explicit fallback is provided', () => {
        expect(resolveUXIconForMenu(undefined, 'list-sort-modified')).toBe('lucide-calendar-clock');
    });

    it('uses the explicit fallback when the override cannot render in an Obsidian menu', () => {
        expect(resolveUXIconForMenu({ 'list-sort-modified': 'icons/custom.svg' }, 'list-sort-modified', 'lucide-calendar')).toBe(
            'lucide-calendar'
        );
    });
});

describe('normalizeUXIconMapRecord', () => {
    it('stores overrides in the frontmatter format and drops unknown keys', () => {
        const normalized = normalizeUXIconMapRecord({
            'list-search': 'star',
            'not-a-real-key': 'LiHome'
        });

        expect(Object.keys(normalized)).toEqual(['list-search']);
        expect(normalized['list-search']).toBe('star');
    });

    it('drops values that resolve to the default icon', () => {
        const normalized = normalizeUXIconMapRecord({
            'list-search': 'LiSearch'
        });

        expect(normalized['list-search']).toBeUndefined();
    });

    it('preserves emoji overrides', () => {
        const normalized = normalizeUXIconMapRecord({
            'folder-closed': '📁'
        });

        expect(normalized['nav-folder-closed']).toBe('📁');
    });
});
