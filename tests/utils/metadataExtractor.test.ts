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
import { extractFreshMetadataFromFileData, extractMetadataFromCache } from '../../src/utils/metadataExtractor';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { createDefaultFileData, METADATA_SENTINEL, type FileData } from '../../src/storage/IndexedDBStorage';
import { createTestTFile } from './createTestTFile';

type CachedMetadata = {
    frontmatter?: Record<string, unknown>;
};

/**
 * Creates test settings with frontmatter metadata enabled
 * @param overrides - Optional settings to override defaults
 * @returns NotebookNavigatorSettings configured for testing
 */
function createSettings(overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        useFrontmatterMetadata: true,
        frontmatterIconField: 'icon',
        ...overrides
    };
}

function createFileData(path: string, overrides: Partial<FileData> = {}): FileData {
    return {
        ...createDefaultFileData({ path, mtime: 0 }),
        ...overrides
    };
}

describe('extractFreshMetadataFromFileData', () => {
    it('returns parsed metadata from a fresh file record', () => {
        const file = createTestTFile('Notes/Cache.md');
        file.stat.mtime = 123;
        const fileData = createFileData(file.path, {
            metadataMtime: 123,
            metadata: {
                name: 'Cached title',
                created: 111,
                modified: 222,
                icon: 'lucide:file-text',
                color: '#ff0000',
                background: '#ffffff'
            }
        });

        expect(extractFreshMetadataFromFileData(file, fileData)).toEqual({
            fn: 'Cached title',
            fc: 111,
            fm: 222,
            icon: 'lucide:file-text',
            color: '#ff0000',
            background: '#ffffff'
        });
    });

    it('preserves date sentinel values from a fresh file record', () => {
        const file = createTestTFile('Notes/Sentinel.md');
        file.stat.mtime = 123;
        const fileData = createFileData(file.path, {
            metadataMtime: 123,
            metadata: {
                created: METADATA_SENTINEL.FIELD_NOT_CONFIGURED,
                modified: METADATA_SENTINEL.PARSE_FAILED
            }
        });

        expect(extractFreshMetadataFromFileData(file, fileData)).toEqual({
            fc: METADATA_SENTINEL.FIELD_NOT_CONFIGURED,
            fm: METADATA_SENTINEL.PARSE_FAILED
        });
    });

    it('returns null when mirrored metadata is missing or stale', () => {
        const file = createTestTFile('Notes/Stale.md');
        file.stat.mtime = 123;

        expect(extractFreshMetadataFromFileData(file, createFileData(file.path, { metadataMtime: 123, metadata: null }))).toBeNull();
        expect(
            extractFreshMetadataFromFileData(
                file,
                createFileData(file.path, {
                    metadataMtime: 122,
                    metadata: {
                        created: 111,
                        modified: 222
                    }
                })
            )
        ).toBeNull();
    });

    it('returns null for non-markdown files', () => {
        const file = createTestTFile('Notes/Renamed.pdf');
        file.stat.mtime = 123;
        const fileData = createFileData(file.path, {
            metadataMtime: 123,
            metadata: {
                name: 'Old markdown title'
            }
        });

        expect(extractFreshMetadataFromFileData(file, fileData)).toBeNull();
    });
});

describe('extractMetadataFromCache - icon extraction', () => {
    it('normalizes plain emoji values to emoji provider format', () => {
        const settings = createSettings();
        const metadata: CachedMetadata = {
            frontmatter: {
                icon: '🔭'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.icon).toBe('emoji:🔭');
    });

    it('accepts legacy provider-prefixed icon values', () => {
        const settings = createSettings();
        const metadata: CachedMetadata = {
            frontmatter: {
                icon: 'emoji:🔭'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.icon).toBe('emoji:🔭');
    });

    it('retains non-emoji icon values', () => {
        const settings = createSettings();
        const metadata: CachedMetadata = {
            frontmatter: {
                icon: 'SiGithub'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.icon).toBe('simple-icons:github');
    });

    it('accepts wikilinked vault svg icon values', () => {
        const settings = createSettings();
        const metadata: CachedMetadata = {
            frontmatter: {
                icon: '[[_resources/icons/TokenTek_Symbol_Black.svg]]'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.icon).toBe('vault:_resources/icons/TokenTek_Symbol_Black.svg');
    });
});

describe('extractMetadataFromCache - name extraction', () => {
    it('uses the first non-empty field from a comma-separated list', () => {
        const settings = createSettings({
            frontmatterNameField: 'title, name'
        });
        const metadata: CachedMetadata = {
            frontmatter: {
                title: '   ',
                name: 'Project X'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.fn).toBe('Project X');
    });

    it('respects field order in a comma-separated list', () => {
        const settings = createSettings({
            frontmatterNameField: 'title, name'
        });
        const metadata: CachedMetadata = {
            frontmatter: {
                title: 'Title value',
                name: 'Name value'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.fn).toBe('Title value');
    });

    it('supports array values and uses the first non-empty string entry', () => {
        const settings = createSettings({
            frontmatterNameField: 'title, name'
        });
        const metadata: CachedMetadata = {
            frontmatter: {
                title: [null, '  ', 'From array'],
                name: 'Fallback'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.fn).toBe('From array');
    });

    it('matches configured name fields across NFC and NFD-equivalent keys', () => {
        const settings = createSettings({
            frontmatterNameField: 'réunion'
        });
        const metadata: CachedMetadata = {
            frontmatter: {
                're\u0301union': 'Project X'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.fn).toBe('Project X');
    });
});

describe('extractMetadataFromCache - background extraction', () => {
    it('extracts background color from configured frontmatter field', () => {
        const settings = createSettings({
            frontmatterBackgroundField: 'background'
        });
        const metadata: CachedMetadata = {
            frontmatter: {
                background: '#112233'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.background).toBe('#112233');
    });

    it('matches configured icon fields across NFC and NFD-equivalent keys', () => {
        const settings = createSettings({
            frontmatterIconField: 'réunion'
        });
        const metadata: CachedMetadata = {
            frontmatter: {
                're\u0301union': 'ph-calendar'
            }
        };

        const result = extractMetadataFromCache(metadata, settings);

        expect(result.icon).toBe('phosphor:calendar');
    });
});
