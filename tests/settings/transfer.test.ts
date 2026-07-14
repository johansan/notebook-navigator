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
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import {
    applyModifiedSettingsTransfer,
    createModifiedSettingsTransfer,
    createSettingsTransferBaseName,
    createSettingsTransferFilename
} from '../../src/settings/transfer';

describe('createSettingsTransferFilename', () => {
    it('formats settings transfer filenames with a sortable local timestamp', () => {
        const date = new Date(2026, 6, 3, 14, 22, 33);

        expect(createSettingsTransferBaseName(date)).toBe('notebook-navigator-settings_20260703-142233');
        expect(createSettingsTransferFilename(date)).toBe('notebook-navigator-settings_20260703-142233.json');
    });
});

describe('createModifiedSettingsTransfer', () => {
    it('returns an envelope with an empty settings object when settings match defaults', () => {
        expect(createModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), '3.2.3')).toEqual({
            plugin: 'notebook-navigator',
            pluginVersion: '3.2.3',
            settings: {}
        });
    });

    it('ignores legacy top-level keys that are not part of current settings', () => {
        const settings = structuredClone(DEFAULT_SETTINGS) as unknown as Record<string, unknown>;
        settings.defaultListAppearance = 'slim';
        settings.fileIconColors = {};
        settings.numRecentNotes = 3;

        expect(createModifiedSettingsTransfer(settings as unknown as typeof DEFAULT_SETTINGS, '3.2.3').settings).toEqual({});
    });

    it('exports only transferable settings that differ from defaults', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.folderSortOrder = 'alpha-desc';
        settings.searchProvider = 'omnisearch';

        expect(createModifiedSettingsTransfer(settings, '3.2.3').settings).toEqual({
            folderSortOrder: 'alpha-desc'
        });
    });
});

describe('applyModifiedSettingsTransfer', () => {
    it('applies imported changes onto defaults while preserving non-transferable values from current settings', () => {
        const currentSettings = structuredClone(DEFAULT_SETTINGS);
        currentSettings.folderSortOrder = 'alpha-desc';
        currentSettings.searchProvider = 'omnisearch';

        const nextSettings = applyModifiedSettingsTransfer(currentSettings, {
            tagSortOrder: 'frequency-desc'
        });

        expect(nextSettings.folderSortOrder).toBe(DEFAULT_SETTINGS.folderSortOrder);
        expect(nextSettings.tagSortOrder).toBe('frequency-desc');
        expect(nextSettings.searchProvider).toBe('omnisearch');
    });

    it('rejects non-object transfer payloads', () => {
        expect(() => applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), 'invalid')).toThrow(
            'Settings import must be a JSON object.'
        );
    });

    it('accepts an empty bare legacy diff', () => {
        const currentSettings = structuredClone(DEFAULT_SETTINGS);
        currentSettings.searchProvider = 'omnisearch';

        const nextSettings = applyModifiedSettingsTransfer(currentSettings, {});

        expect(nextSettings.folderSortOrder).toBe(DEFAULT_SETTINGS.folderSortOrder);
        expect(nextSettings.searchProvider).toBe('omnisearch');
    });

    it('unwraps enveloped exports produced by createModifiedSettingsTransfer', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.folderSortOrder = 'alpha-desc';

        const transferData = createModifiedSettingsTransfer(settings, '3.2.3');
        const nextSettings = applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), transferData);

        expect(nextSettings.folderSortOrder).toBe('alpha-desc');
    });

    it('rejects envelopes from other plugins', () => {
        expect(() =>
            applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
                plugin: 'other-plugin',
                settings: { folderSortOrder: 'alpha-desc' }
            })
        ).toThrow('Not a Notebook Navigator settings export.');
    });

    it('rejects envelopes without a settings object', () => {
        expect(() =>
            applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
                plugin: 'notebook-navigator',
                pluginVersion: '3.2.3'
            })
        ).toThrow('Settings import must contain a settings object.');
    });

    it('rejects bare objects without a transferable settings key', () => {
        expect(() =>
            applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
                unrelated: true
            })
        ).toThrow('Settings import must contain Notebook Navigator settings.');
    });

    it('rejects bare objects with only non-transferable settings', () => {
        expect(() =>
            applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
                searchProvider: 'omnisearch'
            })
        ).toThrow('Settings import must contain Notebook Navigator settings.');
    });

    it('rejects envelopes without a transferable settings key', () => {
        expect(() =>
            applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
                plugin: 'notebook-navigator',
                pluginVersion: '3.2.3',
                settings: { unrelated: true }
            })
        ).toThrow('Settings import must contain Notebook Navigator settings.');
    });

    it('ignores unknown top-level keys during import', () => {
        const nextSettings = applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
            defaultListAppearance: 'slim',
            folderSortOrder: 'alpha-desc'
        });

        expect(nextSettings.defaultListAppearance).toBeUndefined();
        expect(nextSettings.folderSortOrder).toBe('alpha-desc');
    });

    it('does not retain unknown top-level keys from current settings during import overwrite', () => {
        const currentSettings = structuredClone(DEFAULT_SETTINGS) as typeof DEFAULT_SETTINGS & Record<string, unknown>;
        currentSettings.searchProvider = 'omnisearch';
        currentSettings.legacyField = { stale: true };

        const nextSettings = applyModifiedSettingsTransfer(currentSettings, {
            folderSortOrder: 'alpha-desc'
        });

        expect(nextSettings.legacyField).toBeUndefined();
        expect(nextSettings.searchProvider).toBe('omnisearch');
        expect(nextSettings.folderSortOrder).toBe('alpha-desc');
    });

    it('rejects invalid values for nullable string settings during import', () => {
        const nextSettings = applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
            homepage: { bad: true },
            folderNoteTemplate: 123
        });

        expect(nextSettings.homepage).toEqual(DEFAULT_SETTINGS.homepage);
        expect(nextSettings.folderNoteTemplate).toBeNull();
    });

    it('rejects invalid values for nested nullable string settings during import', () => {
        const nextSettings = applyModifiedSettingsTransfer(structuredClone(DEFAULT_SETTINGS), {
            vaultProfiles: [
                {
                    ...structuredClone(DEFAULT_SETTINGS.vaultProfiles[0]),
                    navigationBanner: { bad: true }
                }
            ]
        });

        const profiles = nextSettings.vaultProfiles as { navigationBanner: unknown }[];
        expect(profiles[0]?.navigationBanner).toBeNull();
    });
});
