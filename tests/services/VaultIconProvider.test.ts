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

import { describe, expect, it, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import { VaultIconProvider } from '../../src/services/icons/providers/VaultIconProvider';

// Mirrors Obsidian's fuzzy scoring direction: scores are negative penalties and values closer to 0
// are better matches. Penalties grow with the distance between matched characters and the match start.
vi.mock('obsidian', async importOriginal => {
    const actual = await importOriginal<typeof import('obsidian')>();

    return {
        ...actual,
        prepareFuzzySearch: (query: string) => (text: string) => {
            const normalizedQuery = query.toLowerCase();
            const normalizedText = text.toLowerCase();
            let start = -1;
            let position = 0;

            for (const char of normalizedQuery) {
                const index = normalizedText.indexOf(char, position);
                if (index === -1) {
                    return null;
                }
                if (start === -1) {
                    start = index;
                }
                position = index + 1;
            }

            const span = position - start;
            return { score: -(span - normalizedQuery.length) - start / 1000, matches: [] };
        }
    };
});

function createAppWithFiles(files: TFile[]): App {
    const app = new App();
    app.vault.getFiles = () => files;
    return app;
}

describe('VaultIconProvider.search', () => {
    it('returns every match with the closest match first', () => {
        const scatteredMatches = Array.from({ length: 60 }, (_, index) => new TFile(`icons/mountain-alpha-peak-${index}.svg`));
        const files = [...scatteredMatches.slice(0, 30), new TFile('icons/map.svg'), ...scatteredMatches.slice(30)];
        const provider = new VaultIconProvider(createAppWithFiles(files));

        const results = provider.search('map');

        expect(results).toHaveLength(61);
        expect(results[0]?.id).toBe('icons/map.svg');
    });
});
