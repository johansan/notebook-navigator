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
import { App } from 'obsidian';
import type { FrontMatterCache } from 'obsidian';
import { buildSearchableNameData, filterListPaneFiles } from '../../../src/hooks/listPaneData/searchPipeline';
import type { IndexedDBStorage } from '../../../src/storage/IndexedDBStorage';
import { parseFilterSearchTokens } from '../../../src/utils/filterSearch';
import { createTestTFile } from '../../utils/createTestTFile';

describe('buildSearchableNameData', () => {
    it('preserves alias display values and folds searchable values', () => {
        const frontmatter: FrontMatterCache = {
            aliases: ['NN', 'Résumé']
        };

        expect(buildSearchableNameData('Café Notes', frontmatter)).toEqual({
            foldedDisplayName: 'cafe notes',
            aliases: ['NN', 'Résumé'],
            foldedAliases: ['nn', 'resume']
        });
    });

    it('uses Obsidian alias parsing for the legacy singular field', () => {
        const frontmatter: FrontMatterCache = {
            alias: 'Notebook Navigator, NN'
        };

        expect(buildSearchableNameData('Project Note', frontmatter)).toEqual({
            foldedDisplayName: 'project note',
            aliases: ['Notebook Navigator', 'NN'],
            foldedAliases: ['notebook navigator', 'nn']
        });
    });
});

describe('filterListPaneFiles alias metadata', () => {
    it('returns the alias that satisfied an internal name search', () => {
        const app = new App();
        const file = createTestTFile('Notes/Notebook Navigator.md');
        const searchableName = buildSearchableNameData('Notebook Navigator', { aliases: ['NN'] });
        const db = {
            getFile: () => null
        } as IndexedDBStorage;

        const result = filterListPaneFiles({
            app,
            baseFiles: [file],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            omnisearchResult: null,
            searchTokens: parseFilterSearchTokens('nn'),
            searchableNames: new Map([[file.path, searchableName]]),
            settings: { alphabeticalDateMode: 'modified' },
            sortOption: 'alphabetical-asc',
            trimmedQuery: 'nn',
            useOmnisearch: false
        });

        expect(result.files).toEqual([file]);
        expect(result.matchedAliases.get(file.path)).toEqual([
            {
                value: 'NN',
                foldedTerms: ['nn']
            }
        ]);
    });

    it('returns every alias that contributes to a multi-token name search', () => {
        const app = new App();
        const file = createTestTFile('Notes/My note.md');
        const searchableName = buildSearchableNameData('My note', { aliases: ['No1', 'Favorite'] });
        const db = {
            getFile: () => null
        } as IndexedDBStorage;

        const result = filterListPaneFiles({
            app,
            baseFiles: [file],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            omnisearchResult: null,
            searchTokens: parseFilterSearchTokens('no1 fav'),
            searchableNames: new Map([[file.path, searchableName]]),
            settings: { alphabeticalDateMode: 'modified' },
            sortOption: 'alphabetical-asc',
            trimmedQuery: 'no1 fav',
            useOmnisearch: false
        });

        expect(result.files).toEqual([file]);
        expect(result.matchedAliases.get(file.path)).toEqual([
            {
                value: 'No1',
                foldedTerms: ['no1', 'fav']
            },
            {
                value: 'Favorite',
                foldedTerms: ['no1', 'fav']
            }
        ]);
    });

    it('does not report an alias when the display name satisfies the query', () => {
        const app = new App();
        const file = createTestTFile('Notes/Notebook Navigator.md');
        const searchableName = buildSearchableNameData('Notebook Navigator', { aliases: ['Notebook'] });
        const db = {
            getFile: () => null
        } as IndexedDBStorage;

        const result = filterListPaneFiles({
            app,
            baseFiles: [file],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            omnisearchResult: null,
            searchTokens: parseFilterSearchTokens('notebook'),
            searchableNames: new Map([[file.path, searchableName]]),
            settings: { alphabeticalDateMode: 'modified' },
            sortOption: 'alphabetical-asc',
            trimmedQuery: 'notebook',
            useOmnisearch: false
        });

        expect(result.files).toEqual([file]);
        expect(result.matchedAliases.size).toBe(0);
    });
});
