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
import { describe, it, expect, vi } from 'vitest';

// Obsidian's icon registry, which other plugins extend with addIcon() after Notebook Navigator first reads it
const registry = ['lucide-stone', 'lucide-folder'];

vi.mock('obsidian', async importOriginal => {
    const actual = await importOriginal<Record<string, unknown>>();
    return { ...actual, getIconIds: () => [...registry] };
});

import { deserializeIconFromFrontmatterCompat, refreshRegisteredIconIds, serializeIconForFrontmatter } from '../../src/utils/iconizeFormat';
import { LucideIconProvider } from '../../src/services/icons/providers/LucideIconProvider';

describe('registered icon ids', () => {
    it('accepts icons registered after the first read once the list is refreshed', () => {
        const provider = new LucideIconProvider();
        expect(deserializeIconFromFrontmatterCompat('stone')).toBe('stone');

        registry.push('CI-simple-icons-obsidian');

        // The picker and frontmatter parsing read the same snapshot, so neither knows the icon yet
        expect(provider.search('obsidian')).toEqual([]);
        expect(serializeIconForFrontmatter('CI-simple-icons-obsidian')).toBeNull();
        expect(deserializeIconFromFrontmatterCompat('CI-simple-icons-obsidian')).toBeNull();

        expect(refreshRegisteredIconIds()).toBe(true);

        expect(provider.search('obsidian').map(icon => icon.id)).toEqual(['CI-simple-icons-obsidian']);
        expect(serializeIconForFrontmatter('CI-simple-icons-obsidian')).toBe('CI-simple-icons-obsidian');
        expect(deserializeIconFromFrontmatterCompat('CI-simple-icons-obsidian')).toBe('CI-simple-icons-obsidian');
    });

    it('keeps the snapshot when no icon was added or removed', () => {
        expect(refreshRegisteredIconIds()).toBe(false);
    });

    it('drops icons that were removed from the registry', () => {
        registry.splice(registry.indexOf('CI-simple-icons-obsidian'), 1);

        expect(refreshRegisteredIconIds()).toBe(true);
        expect(serializeIconForFrontmatter('CI-simple-icons-obsidian')).toBeNull();
        expect(new LucideIconProvider().search('obsidian')).toEqual([]);
    });
});
