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
import {
    containsForbiddenNameCharactersAllPlatforms,
    containsForbiddenNameCharactersWindows,
    containsInvalidLinkCharacters,
    getFileNameWithoutExtension,
    stripForbiddenNameCharactersAllPlatforms,
    stripForbiddenNameCharactersWindows,
    stripInvalidLinkCharacters,
    stripLeadingPeriods
} from '../../src/utils/fileNameUtils';
import { createTestTFile } from './createTestTFile';

describe('getFileNameWithoutExtension', () => {
    it('strips composite Excalidraw suffix from markdown files', () => {
        const file = createTestTFile('Drawing 2025-10-24T10-03-10.excalidraw.md');
        expect(getFileNameWithoutExtension(file)).toBe('Drawing 2025-10-24T10-03-10');
    });

    it('returns basename for standard markdown files', () => {
        const file = createTestTFile('Example Note.md');
        expect(getFileNameWithoutExtension(file)).toBe('Example Note');
    });
});

describe('invalid link characters', () => {
    it('detects invalid link characters and patterns', () => {
        expect(containsInvalidLinkCharacters('Normal name')).toBe(false);
        expect(containsInvalidLinkCharacters('Note #1')).toBe(true);
        expect(containsInvalidLinkCharacters('Note %%1')).toBe(true);
        expect(containsInvalidLinkCharacters('[[Note]]')).toBe(true);
        expect(containsInvalidLinkCharacters('Note ]')).toBe(false);
    });

    it('strips invalid link characters and patterns', () => {
        expect(stripInvalidLinkCharacters('Note #1')).toBe('Note 1');
        expect(stripInvalidLinkCharacters('Note %%1')).toBe('Note 1');
        expect(stripInvalidLinkCharacters('[[Note]]')).toBe('Note');
    });
});

describe('forbidden name characters', () => {
    it('strips leading periods', () => {
        expect(stripLeadingPeriods('...Note')).toBe('Note');
        expect(stripLeadingPeriods('.')).toBe('');
        expect(stripLeadingPeriods('Note')).toBe('Note');
    });

    it('detects and strips forbidden characters across all platforms', () => {
        expect(containsForbiddenNameCharactersAllPlatforms('Normal name')).toBe(false);
        expect(containsForbiddenNameCharactersAllPlatforms('Note:1')).toBe(true);
        expect(containsForbiddenNameCharactersAllPlatforms('Folder/Note')).toBe(true);
        expect(stripForbiddenNameCharactersAllPlatforms('Note:1/2')).toBe('Note12');
    });

    it('detects and strips forbidden characters on Windows', () => {
        expect(containsForbiddenNameCharactersWindows('Normal name')).toBe(false);
        expect(containsForbiddenNameCharactersWindows('Note|1')).toBe(true);
        expect(containsForbiddenNameCharactersWindows('Note<1>')).toBe(true);
        expect(containsForbiddenNameCharactersWindows('Note"1"')).toBe(true);
        expect(stripForbiddenNameCharactersWindows('a<b>c"\\\\d|e?f*g')).toBe('abcdefg');
    });
});
