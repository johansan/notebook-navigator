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
import {
    hasFolderNoteNameToken,
    normalizeFolderNoteNamePattern,
    resolveFolderNoteName,
    shouldRenameFolderNoteWithFolderName
} from '../../src/utils/folderNoteName';

describe('resolveFolderNoteName', () => {
    it('uses a pattern without the folder token as a fixed name', () => {
        expect(resolveFolderNoteName('ProjectA', { folderNoteNamePattern: 'index' })).toBe('index');
    });

    it('falls back to folder name when the pattern is empty', () => {
        expect(resolveFolderNoteName('ProjectA', { folderNoteNamePattern: '' })).toBe('ProjectA');
    });

    it('applies folder name token in pattern', () => {
        expect(resolveFolderNoteName('ProjectA', { folderNoteNamePattern: '_{{folder}}' })).toBe('_ProjectA');
    });

    it('applies folder name token with whitespace and casing differences', () => {
        expect(resolveFolderNoteName('ProjectA', { folderNoteNamePattern: '{{ Folder }}-note' })).toBe('ProjectA-note');
    });

    it('supports the legacy folder_name token', () => {
        expect(resolveFolderNoteName('ProjectA', { folderNoteNamePattern: '_{{folder_name}}' })).toBe('_ProjectA');
    });

    it('inserts folder names with dollar-sign sequences as literals', () => {
        expect(resolveFolderNoteName('A$&B', { folderNoteNamePattern: '_{{folder}}' })).toBe('_A$&B');
    });
});

describe('hasFolderNoteNameToken', () => {
    it('detects folder name token', () => {
        expect(hasFolderNoteNameToken('_{{folder}}')).toBe(true);
    });

    it('detects legacy folder_name token', () => {
        expect(hasFolderNoteNameToken('_{{folder_name}}')).toBe(true);
    });

    it('returns false when token is missing', () => {
        expect(hasFolderNoteNameToken('_folder')).toBe(false);
    });
});

describe('shouldRenameFolderNoteWithFolderName', () => {
    it('returns true for default folder naming', () => {
        expect(shouldRenameFolderNoteWithFolderName({ folderNoteNamePattern: '' })).toBe(true);
    });

    it('returns true when pattern contains folder token', () => {
        expect(shouldRenameFolderNoteWithFolderName({ folderNoteNamePattern: '_{{folder}}' })).toBe(true);
    });

    it('returns false for static pattern without token', () => {
        expect(shouldRenameFolderNoteWithFolderName({ folderNoteNamePattern: '_folder' })).toBe(false);
    });
});

describe('normalizeFolderNoteNamePattern', () => {
    it('converts the legacy token to the current token', () => {
        expect(normalizeFolderNoteNamePattern('_{{folder_name}}')).toBe('_{{folder}}');
    });

    it('preserves existing current token patterns', () => {
        expect(normalizeFolderNoteNamePattern('_{{folder}}')).toBe('_{{folder}}');
    });
});
