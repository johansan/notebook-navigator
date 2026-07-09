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

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { localStorageGet, localStorageSet, localStorageRemove, mockLocalStorageStore } = vi.hoisted(() => {
    const mockLocalStorageStore = new Map<string, unknown>();
    const localStorageGet = vi.fn((key: string) => (mockLocalStorageStore.has(key) ? (mockLocalStorageStore.get(key) ?? null) : null));
    const localStorageSet = vi.fn((key: string, value: unknown) => {
        mockLocalStorageStore.set(key, value);
        return true;
    });
    const localStorageRemove = vi.fn((key: string) => {
        mockLocalStorageStore.delete(key);
        return true;
    });

    return { localStorageGet, localStorageSet, localStorageRemove, mockLocalStorageStore };
});

vi.mock('../../src/utils/localStorage', () => {
    return {
        localStorage: {
            get: localStorageGet,
            set: localStorageSet,
            remove: localStorageRemove
        }
    };
});

import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { createDefaultFileData, type FileData } from '../../src/storage/IndexedDBStorage';
import { STORAGE_KEYS } from '../../src/types';
import {
    clearFrontmatterMetadataCacheSignature,
    extractCurrentFrontmatterMetadataFromFileData,
    getFrontmatterMetadataCacheSignature,
    haveFrontmatterMetadataCacheSettingsChanged,
    markFrontmatterMetadataCacheCurrent
} from '../../src/utils/frontmatterMetadataCache';
import { createTestTFile } from './createTestTFile';

function createSettings(overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        useFrontmatterMetadata: true,
        frontmatterNameField: 'title',
        frontmatterCreatedField: 'created',
        ...overrides
    };
}

function createFileData(path: string, overrides: Partial<FileData> = {}): FileData {
    return {
        ...createDefaultFileData({ path, mtime: 0 }),
        ...overrides
    };
}

describe('frontmatter metadata cache signature', () => {
    beforeEach(() => {
        mockLocalStorageStore.clear();
        clearFrontmatterMetadataCacheSignature();
        vi.clearAllMocks();
    });

    it('tracks frontmatter metadata settings changes', () => {
        const settings = createSettings();

        expect(haveFrontmatterMetadataCacheSettingsChanged(settings, { ...settings, frontmatterDateFormat: 'YYYY-MM-DD' })).toBe(true);
        expect(haveFrontmatterMetadataCacheSettingsChanged(settings, { ...settings })).toBe(false);
    });

    it('extracts mirrored metadata only when the whole-cache signature is current', () => {
        const file = createTestTFile('Notes/Cache.md');
        file.stat.mtime = 123;
        const fileData = createFileData(file.path, {
            metadataMtime: 123,
            metadata: {
                name: 'Cached title',
                created: 111
            }
        });
        const settings = createSettings();

        expect(extractCurrentFrontmatterMetadataFromFileData(file, fileData, settings)).toBeNull();

        markFrontmatterMetadataCacheCurrent(settings);

        expect(mockLocalStorageStore.get(STORAGE_KEYS.frontmatterMetadataCacheSignatureKey)).toBe(
            getFrontmatterMetadataCacheSignature(settings)
        );
        expect(extractCurrentFrontmatterMetadataFromFileData(file, fileData, settings)).toEqual({
            fn: 'Cached title',
            fc: 111
        });
    });

    it('rejects mirrored metadata after frontmatter settings change', () => {
        const file = createTestTFile('Notes/Cache.md');
        file.stat.mtime = 123;
        const fileData = createFileData(file.path, {
            metadataMtime: 123,
            metadata: {
                name: 'Old title'
            }
        });
        const oldSettings = createSettings({ frontmatterNameField: 'title' });
        const newSettings = createSettings({ frontmatterNameField: 'name' });
        markFrontmatterMetadataCacheCurrent(oldSettings);

        expect(extractCurrentFrontmatterMetadataFromFileData(file, fileData, newSettings)).toBeNull();
    });
});
