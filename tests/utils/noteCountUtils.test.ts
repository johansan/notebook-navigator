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
import { App, TFile, TFolder } from 'obsidian';
import type { NoteCountInfo } from '../../src/types/noteCounts';
import { FILE_VISIBILITY } from '../../src/utils/fileTypeUtils';
import { calculateFolderNoteCounts } from '../../src/utils/noteCountUtils';
import { createTestTFile } from './createTestTFile';

function createFolder(path: string, children: Array<TFile | TFolder>): TFolder {
    const folder = new TFolder() as TFolder & { children: Array<TFile | TFolder> };
    folder.path = path;
    folder.name = path.split('/').pop() ?? path;
    folder.children = children;
    children.forEach(child => {
        Reflect.set(child, 'parent', folder);
    });
    return folder;
}

describe('calculateFolderNoteCounts', () => {
    it('excludes configured folders only from ancestor descendant counts', () => {
        const rootNote = createTestTFile('Root.md');
        const dailyNote = createTestTFile('Daily/today.md');
        const dailyYearNote = createTestTFile('Daily/2026/day.md');
        const workNote = createTestTFile('Work/work.md');
        const resourceNote = createTestTFile('Work/resources/asset.md');

        const dailyYearFolder = createFolder('Daily/2026', [dailyYearNote]);
        const dailyFolder = createFolder('Daily', [dailyNote, dailyYearFolder]);
        const resourcesFolder = createFolder('Work/resources', [resourceNote]);
        const workFolder = createFolder('Work', [workNote, resourcesFolder]);
        const rootFolder = createFolder('', [rootNote, dailyFolder, workFolder]);

        const app = new App();
        app.metadataCache.getFileCache = () => null;
        const options = {
            app,
            fileVisibility: FILE_VISIBILITY.ALL,
            excludedFiles: [],
            excludedFolders: [],
            descendantExcludedFolders: ['/Daily', 'resources'],
            fileNameMatcher: null,
            hiddenFileTagVisibility: null,
            includeDescendants: true,
            showHiddenFolders: false,
            hideFolderNoteInList: false,
            folderNoteSettings: {
                enableFolderNotes: false,
                folderNoteName: '',
                folderNoteNamePattern: ''
            }
        };

        expect(calculateFolderNoteCounts(rootFolder, options)).toEqual({ current: 1, descendants: 1, total: 2 });
        expect(calculateFolderNoteCounts(dailyFolder, options)).toEqual({ current: 1, descendants: 1, total: 2 });
    });

    it('returns seeded cache entries without walking folder children', () => {
        const note = createTestTFile('Work/work.md');
        const workFolder = createFolder('Work', [note]);

        const app = new App();
        app.metadataCache.getFileCache = () => null;
        const seeded: NoteCountInfo = { current: 42, descendants: 0, total: 42 };
        const cache = new Map<string, NoteCountInfo>([['Work', seeded]]);
        const options = {
            app,
            fileVisibility: FILE_VISIBILITY.ALL,
            excludedFiles: [],
            excludedFolders: [],
            descendantExcludedFolders: [],
            fileNameMatcher: null,
            hiddenFileTagVisibility: null,
            includeDescendants: true,
            showHiddenFolders: false,
            hideFolderNoteInList: false,
            folderNoteSettings: {
                enableFolderNotes: false,
                folderNoteName: '',
                folderNoteNamePattern: ''
            },
            cache
        };

        // The seeded value differs from the real count, so returning it proves the walk was skipped
        expect(calculateFolderNoteCounts(workFolder, options)).toBe(seeded);
    });

    it('caches counts for every visited descendant folder', () => {
        const subNote = createTestTFile('Work/sub/note.md');
        const subFolder = createFolder('Work/sub', [subNote]);
        const workNote = createTestTFile('Work/work.md');
        const workFolder = createFolder('Work', [workNote, subFolder]);

        const app = new App();
        app.metadataCache.getFileCache = () => null;
        const cache = new Map<string, NoteCountInfo>();
        const options = {
            app,
            fileVisibility: FILE_VISIBILITY.ALL,
            excludedFiles: [],
            excludedFolders: [],
            descendantExcludedFolders: [],
            fileNameMatcher: null,
            hiddenFileTagVisibility: null,
            includeDescendants: true,
            showHiddenFolders: false,
            hideFolderNoteInList: false,
            folderNoteSettings: {
                enableFolderNotes: false,
                folderNoteName: '',
                folderNoteNamePattern: ''
            },
            cache
        };

        calculateFolderNoteCounts(workFolder, options);

        expect(cache.get('Work')).toEqual({ current: 1, descendants: 1, total: 2 });
        const cachedSub = cache.get('Work/sub');
        expect(cachedSub).toEqual({ current: 1, descendants: 0, total: 1 });
        // A later pass over the same cache returns the stored info without recomputing
        expect(calculateFolderNoteCounts(subFolder, options)).toBe(cachedSub);
    });
});
