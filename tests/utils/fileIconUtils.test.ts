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
    buildFileNameIconNeedles,
    resolveFileIconId,
    resolveFileNameMatchIconId,
    resolveFileNameMatchIconIdFromNeedles,
    resolveFileTypeIconId,
    resolveFileTypeIconKey
} from '../../src/utils/fileIconUtils';
import { createTestTFile } from './createTestTFile';
import { DEFAULT_FILE_TYPE_ICON_PRESET, FILE_TYPE_ICON_PROVIDER_PRESET_IDS } from '../../src/utils/fileTypeIconPresets';

describe('resolveFileNameMatchIconId', () => {
    it('returns null for empty basenames', () => {
        const needles = buildFileNameIconNeedles({ meeting: 'ph-calendar' });
        expect(resolveFileNameMatchIconIdFromNeedles('', needles)).toBe(null);
    });

    it('matches case-insensitively and prefers longer needles', () => {
        const iconMap = {
            meet: 'ph-book',
            meeting: 'ph-calendar',
            invoice: 'ph-receipt'
        };

        const needles = buildFileNameIconNeedles(iconMap);
        expect(resolveFileNameMatchIconIdFromNeedles('Meeting notes', needles)).toBe('phosphor:calendar');
        expect(resolveFileNameMatchIconIdFromNeedles('Invoice 2025', needles)).toBe('phosphor:receipt');
        expect(resolveFileNameMatchIconId('Invoice 2025', iconMap)).toBe('phosphor:receipt');
    });

    it('breaks ties by needle sort order', () => {
        const iconMap = {
            ab: 'ph-receipt',
            aa: 'ph-calendar'
        };

        const needles = buildFileNameIconNeedles(iconMap);
        expect(resolveFileNameMatchIconIdFromNeedles('aab', needles)).toBe('phosphor:calendar');
    });

    it('ignores empty needles and empty icon IDs', () => {
        const iconMap = {
            meeting: 'ph-calendar',
            '': 'invalid',
            invoice: ''
        };

        const needles = buildFileNameIconNeedles(iconMap);
        expect(resolveFileNameMatchIconIdFromNeedles('Invoice meeting', needles)).toBe('phosphor:calendar');
    });

    it('supports resolving icons from display names', () => {
        const file = createTestTFile('Plain name.md');
        const settings = {
            showFilenameMatchIcons: true,
            fileNameIconMap: { meeting: 'ph-calendar' },
            showCategoryIcons: false,
            fileTypeIconMap: {},
            fileTypeIconPreset: DEFAULT_FILE_TYPE_ICON_PRESET
        };

        expect(resolveFileIconId(file, settings)).toBe(null);
        expect(resolveFileIconId(file, settings, { fileNameForMatch: 'Meeting notes' })).toBe('phosphor:calendar');
    });

    it('supports needles with trailing spaces', () => {
        const needles = buildFileNameIconNeedles({ 'ai ': 'ph-brain' });
        expect(resolveFileNameMatchIconIdFromNeedles('AI notes', needles)).toBe('phosphor:brain');
        expect(resolveFileNameMatchIconIdFromNeedles('AInotes', needles)).toBe(null);
    });

    it('matches NFC rule keys against NFD basenames', () => {
        const needles = buildFileNameIconNeedles({ réunion: 'ph-calendar' });
        expect(resolveFileNameMatchIconIdFromNeedles('re\u0301union notes', needles)).toBe('phosphor:calendar');
    });

    it('matches NFD rule keys against NFC basenames', () => {
        const needles = buildFileNameIconNeedles({ 're\u0301union': 'ph-calendar' });
        expect(resolveFileNameMatchIconIdFromNeedles('réunion notes', needles)).toBe('phosphor:calendar');
    });
});

describe('resolveFileTypeIconKey', () => {
    it('normalizes file extensions to lowercase', () => {
        const file = createTestTFile('Photo.PNG');
        expect(resolveFileTypeIconKey(file)).toBe('png');
    });

    describe('resolveFileTypeIconId', () => {
        it('returns null for empty keys', () => {
            expect(resolveFileTypeIconId('', { md: 'ph-file-text' })).toBe(null);
        });

        it('uses explicit overrides before built-in mappings', () => {
            expect(resolveFileTypeIconId('md', { md: 'ph-book' })).toBe('phosphor:book');
        });

        it('uses explicit overrides before preset mappings', () => {
            expect(resolveFileTypeIconId('md', { md: 'ph-book' }, 'material-icons')).toBe('phosphor:book');
        });

        it('uses preset mappings before built-in mappings', () => {
            expect(resolveFileTypeIconId('md', {}, 'material-icons')).toBe('material-icons:article');
            expect(resolveFileTypeIconId('png', {}, 'phosphor')).toBe('phosphor:image');
        });

        it('uses category icons for Bootstrap and Phosphor', () => {
            expect(resolveFileTypeIconId('docx', {}, 'bootstrap-icons')).toBe('bootstrap-icons:file-earmark-richtext');
            expect(resolveFileTypeIconId('mp4', {}, 'bootstrap-icons')).toBe('bootstrap-icons:play-btn');
            expect(resolveFileTypeIconId('tsx', {}, 'phosphor')).toBe('phosphor:code');
            expect(resolveFileTypeIconId('rs', {}, 'phosphor')).toBe('phosphor:code');
            expect(resolveFileTypeIconId('png', {}, 'rpg-awesome')).toBe('rpg-awesome:mirror');
        });

        it('ignores preset mappings when the provider is not enabled', () => {
            expect(resolveFileTypeIconId('md', {}, 'material-icons', {})).toBe('file-text');
            expect(resolveFileTypeIconId('cpp', {}, 'material-icons', {})).toBe(null);
        });

        it('falls back to built-in mappings when no override exists', () => {
            expect(resolveFileTypeIconId('md', {})).toBe('file-text');
            expect(resolveFileTypeIconId('png', {})).toBe('image');
        });

        it('returns null for unknown types without overrides', () => {
            expect(resolveFileTypeIconId('cpp', {})).toBe(null);
        });

        it('does not expose Simple Icons as a file-type preset', () => {
            expect(FILE_TYPE_ICON_PROVIDER_PRESET_IDS).not.toContain('simple-icons');
        });
    });

    it('returns excalidraw.md for .excalidraw.md filenames', () => {
        const file = createTestTFile('Drawing.excalidraw.md');
        expect(resolveFileTypeIconKey(file)).toBe('excalidraw.md');
    });

    it('returns excalidraw.md when excalidraw frontmatter flag is set', () => {
        const file = createTestTFile('Drawing.md');
        const metadataCacheStub = {
            getFileCache: () => ({ frontmatter: { 'excalidraw-plugin': true } })
        };

        expect(resolveFileTypeIconKey(file, metadataCacheStub)).toBe('excalidraw.md');
    });

    it('ignores false-like excalidraw frontmatter flags', () => {
        const file = createTestTFile('Drawing.md');
        const metadataCacheStub = {
            getFileCache: () => ({ frontmatter: { 'excalidraw-plugin': 'false' } })
        };

        expect(resolveFileTypeIconKey(file, metadataCacheStub)).toBe('md');
    });
});
