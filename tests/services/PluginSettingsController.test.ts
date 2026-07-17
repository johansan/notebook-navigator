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

const { mockLocalStorageStore, localStorageInit, localStorageGet, localStorageSet, localStorageRemove } = vi.hoisted(() => {
    const mockLocalStorageStore = new Map<string, unknown>();
    const localStorageInit = vi.fn();
    const localStorageGet = vi.fn((key: string) => (mockLocalStorageStore.has(key) ? (mockLocalStorageStore.get(key) ?? null) : null));
    const localStorageSet = vi.fn((key: string, value: unknown) => {
        mockLocalStorageStore.set(key, value);
        return true;
    });
    const localStorageRemove = vi.fn((key: string) => {
        mockLocalStorageStore.delete(key);
        return true;
    });

    return { mockLocalStorageStore, localStorageInit, localStorageGet, localStorageSet, localStorageRemove };
});

vi.mock('../../src/utils/localStorage', () => {
    return {
        localStorage: {
            init: localStorageInit,
            get: localStorageGet,
            set: localStorageSet,
            remove: localStorageRemove
        }
    };
});

import { PluginSettingsController } from '../../src/services/settings/PluginSettingsController';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { STORAGE_KEYS } from '../../src/types';
import { buildPropertySeparatorKey, buildTagSeparatorKey } from '../../src/utils/navigationSeparators';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../src/utils/propertyTree';

beforeEach(() => {
    mockLocalStorageStore.clear();
    vi.clearAllMocks();
});

describe('PluginSettingsController.normalizeTagSettings', () => {
    it('canonicalizes tag metadata keys and hidden-tag rules across NFC and NFD-equivalent forms', () => {
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn().mockResolvedValue(null),
            saveData: vi.fn().mockResolvedValue(undefined),
            mirrorUXPreferences: vi.fn()
        });
        const settings = structuredClone(DEFAULT_SETTINGS);

        settings.tagColors = { 're\u0301union': '#112233' };
        settings.tagBackgroundColors = { '#re\u0301union': '#223344' };
        settings.tagTreeSortOverrides = { 're\u0301union': 'alpha-desc' };
        settings.vaultProfiles[0].hiddenTags = ['re\u0301union', 'réunion'];
        settings.vaultProfiles[0].hiddenFileTags = ['#re\u0301union', 'réunion'];

        controller.settings = settings;
        controller.normalizeTagSettings();

        expect(controller.settings.tagColors).toEqual({ réunion: '#112233' });
        expect(controller.settings.tagBackgroundColors).toEqual({ réunion: '#223344' });
        expect(controller.settings.tagTreeSortOverrides).toEqual({ réunion: 'alpha-desc' });
        expect(controller.settings.vaultProfiles[0].hiddenTags).toEqual(['réunion']);
        expect(controller.settings.vaultProfiles[0].hiddenFileTags).toEqual(['réunion']);
    });
});

describe('PluginSettingsController.normalizeNavigationSeparatorSettings', () => {
    it('canonicalizes tag and property separator keys across NFC and NFD-equivalent forms', () => {
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn().mockResolvedValue(null),
            saveData: vi.fn().mockResolvedValue(undefined),
            mirrorUXPreferences: vi.fn()
        });
        const settings = structuredClone(DEFAULT_SETTINGS);
        const normalizedPropertyKey = buildPropertySeparatorKey(buildPropertyValueNodeId('status', 'todo'));

        settings.navigationSeparators = {
            [buildTagSeparatorKey('re\u0301union')]: true,
            [buildPropertySeparatorKey('key:Status=ToDo')]: true
        };

        controller.settings = settings;
        controller.normalizeNavigationSeparatorSettings();

        expect(controller.settings.navigationSeparators).toEqual({
            [buildTagSeparatorKey('réunion')]: true,
            [normalizedPropertyKey]: true
        });
    });
});

describe('PluginSettingsController.prepareImportedUiScalePersistence', () => {
    it('preserves the opposite-platform scale across an import save and reload when uiScale is local', async () => {
        let storedData: Record<string, unknown> | null = null;

        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => (storedData ? structuredClone(storedData) : null)),
            saveData: vi.fn(async data => {
                storedData = structuredClone(data) as Record<string, unknown>;
            }),
            mirrorUXPreferences: vi.fn()
        });
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.syncModes.uiScale = 'local';
        settings.desktopScale = 1.3;
        settings.mobileScale = 0.9;

        controller.settings = settings;
        controller.prepareImportedUiScalePersistence();
        controller.mirrorAllSyncModeSettingsToLocalStorage();
        await controller.saveSettings();
        await controller.loadSettings();
        await controller.saveSettings();

        expect(mockLocalStorageStore.get(STORAGE_KEYS.uiScaleKey)).toBe(1.3);
        expect(controller.settings.desktopScale).toBe(1.3);
        expect(controller.settings.mobileScale).toBe(0.9);
        expect(storedData?.['desktopScale']).toBeUndefined();
        expect(storedData?.['mobileScale']).toBe(0.9);
    });
});

describe('PluginSettingsController.loadSettings', () => {
    it('migrates legacy folder note new-tab setting to folder note open location', async () => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => ({
                openFolderNotesInNewTab: true
            })),
            saveData,
            mirrorUXPreferences: vi.fn()
        });

        await controller.loadSettings();

        expect(controller.settings.folderNoteOpenLocation).toBe('new-tab');
        expect(saveData).toHaveBeenCalledTimes(1);
        const savedSettings = saveData.mock.calls[0][0] as Record<string, unknown>;
        expect(savedSettings.folderNoteOpenLocation).toBe('new-tab');
        expect(savedSettings.openFolderNotesInNewTab).toBeUndefined();
    });

    it('persists cleanup when legacy folder color title setting is migrated', async () => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => ({
                useFolderColorForFileTitles: true
            })),
            saveData,
            mirrorUXPreferences: vi.fn()
        });

        await controller.loadSettings();

        expect(controller.settings.useFolderColorForTitles).toBe(true);
        expect(saveData).toHaveBeenCalledTimes(1);
        const savedSettings = saveData.mock.calls[0][0] as Record<string, unknown>;
        expect(savedSettings.useFolderColorForTitles).toBe(true);
        expect(savedSettings.useFolderColorForFileTitles).toBeUndefined();
    });

    it('removes the obsolete full parent folder path setting from persisted data', async () => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => ({
                showParentFolderFullPath: false
            })),
            saveData,
            mirrorUXPreferences: vi.fn()
        });

        await controller.loadSettings();

        expect((controller.settings as unknown as Record<string, unknown>).showParentFolderFullPath).toBeUndefined();
        expect(saveData).toHaveBeenCalledTimes(1);
        const savedSettings = saveData.mock.calls[0][0] as Record<string, unknown>;
        expect(savedSettings.showParentFolderFullPath).toBeUndefined();
    });

    it('persists cleanup when property sort overrides target unavailable sort keys', async () => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const statusNodeId = buildPropertyKeyNodeId('status');
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => ({
                propertySortKey: 'status',
                folderSortOverrides: {
                    Books: { option: 'property-asc', propertyKey: 'published' },
                    Notes: { option: 'property-desc', propertyKey: 'Status' }
                },
                propertySortOverrides: {
                    [statusNodeId]: { option: 'property-asc', propertyKey: 'published' }
                }
            })),
            saveData,
            mirrorUXPreferences: vi.fn()
        });

        await controller.loadSettings();

        expect(controller.settings.folderSortOverrides.Books).toBeUndefined();
        expect(controller.settings.folderSortOverrides.Notes).toEqual({ option: 'property-desc', propertyKey: 'Status' });
        expect(controller.settings.propertySortOverrides[statusNodeId]).toBeUndefined();
        expect(saveData).toHaveBeenCalledTimes(1);
    });

    it('sanitizes invalid property sort key settings before pruning overrides', async () => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => ({
                propertySortKey: ['status'],
                manualSortPropertyKey: ['sort_index'],
                folderSortOverrides: {
                    Books: { option: 'property-asc', propertyKey: 'published' }
                }
            })),
            saveData,
            mirrorUXPreferences: vi.fn()
        });

        await controller.loadSettings();

        expect(controller.settings.propertySortKey).toBe(DEFAULT_SETTINGS.propertySortKey);
        expect(controller.settings.manualSortPropertyKey).toBe(DEFAULT_SETTINGS.manualSortPropertyKey);
        expect(controller.settings.folderSortOverrides.Books).toBeUndefined();
        expect(saveData).toHaveBeenCalledTimes(1);
        expect((saveData.mock.calls[0][0] as Record<string, unknown>).propertySortKey).toBe(DEFAULT_SETTINGS.propertySortKey);
        expect((saveData.mock.calls[0][0] as Record<string, unknown>).manualSortPropertyKey).toBe(DEFAULT_SETTINGS.manualSortPropertyKey);
    });

    it('persists cleanup when legacy none grouping is migrated', async () => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const statusNodeId = buildPropertyKeyNodeId('status');
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => ({
                noteGrouping: 'none',
                folderAppearances: {
                    Inbox: { groupBy: 'none' }
                },
                tagAppearances: {
                    '#work': { groupBy: 'none' }
                },
                propertyAppearances: {
                    [statusNodeId]: { groupBy: 'none' }
                }
            })),
            saveData,
            mirrorUXPreferences: vi.fn()
        });

        await controller.loadSettings();

        expect(controller.settings.noteGrouping).toBe('custom');
        expect(controller.settings.folderAppearances.Inbox?.groupBy).toBe('custom');
        // Tag appearance keys are canonicalized by the settings pipeline, so '#work' is stored as 'work'
        expect(controller.settings.tagAppearances['work']?.groupBy).toBe('custom');
        expect(controller.settings.propertyAppearances[statusNodeId]?.groupBy).toBe('custom');
        expect(saveData).toHaveBeenCalledTimes(1);
        const savedSettings = saveData.mock.calls[0][0] as Record<string, unknown>;
        expect(savedSettings.noteGrouping).toBe('custom');
        expect((savedSettings.folderAppearances as Record<string, Record<string, unknown>>).Inbox?.groupBy).toBe('custom');
        expect((savedSettings.tagAppearances as Record<string, Record<string, unknown>>)['work']?.groupBy).toBe('custom');
        expect((savedSettings.propertyAppearances as Record<string, Record<string, unknown>>)[statusNodeId]?.groupBy).toBe('custom');
    });
});

describe('PluginSettingsController.loadSettings result classification', () => {
    const createController = (loadData: () => Promise<unknown>) => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const loadDataMock = vi.fn(loadData);
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: loadDataMock,
            saveData,
            mirrorUXPreferences: vi.fn()
        });
        return { controller, saveData, loadDataMock };
    };

    it('returns missing without applying or saving anything when the settings file does not exist', async () => {
        const { controller, saveData } = createController(async () => null);

        await expect(controller.loadSettings()).resolves.toBe('missing');

        expect(saveData).not.toHaveBeenCalled();
        expect(controller.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('treats an empty stored record as loaded', async () => {
        const { controller } = createController(async () => ({}));

        await expect(controller.loadSettings()).resolves.toBe('loaded');
    });

    it('returns unavailable without saving when the settings file cannot be read', async () => {
        const { controller, saveData } = createController(async () => undefined);

        await expect(controller.loadSettings()).resolves.toBe('unavailable');

        expect(saveData).not.toHaveBeenCalled();
        expect(controller.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('returns unavailable without saving for non-record settings data', async () => {
        const { controller, saveData } = createController(async () => ['not', 'a', 'record']);

        await expect(controller.loadSettings()).resolves.toBe('unavailable');

        expect(saveData).not.toHaveBeenCalled();
    });

    it('preserves loaded settings when later loads return missing or unreadable data', async () => {
        let stored: unknown = { recentNotesCount: 17 };
        const { controller, saveData } = createController(async () => stored);

        await expect(controller.loadSettings()).resolves.toBe('loaded');
        expect(controller.settings.recentNotesCount).toBe(17);
        const saveCallsAfterLoad = saveData.mock.calls.length;

        stored = undefined;
        await expect(controller.loadSettings()).resolves.toBe('unavailable');
        expect(controller.settings.recentNotesCount).toBe(17);

        stored = null;
        await expect(controller.loadSettings()).resolves.toBe('missing');
        expect(controller.settings.recentNotesCount).toBe(17);
        expect(saveData.mock.calls.length).toBe(saveCallsAfterLoad);
    });

    it('replaces settings from the stored record after an unavailable load', async () => {
        let stored: unknown = { recentNotesCount: 17 };
        const { controller } = createController(async () => stored);

        await expect(controller.loadSettings()).resolves.toBe('loaded');

        stored = undefined;
        await expect(controller.loadSettings()).resolves.toBe('unavailable');
        expect(controller.settings.recentNotesCount).toBe(17);

        stored = { recentNotesCount: 23 };
        await expect(controller.loadSettings()).resolves.toBe('loaded');
        expect(controller.settings.recentNotesCount).toBe(23);
    });

    it('preserves first-launch settings when a later load returns missing data', async () => {
        const { controller, saveData } = createController(async () => null);

        controller.applySettingsRecord(null, { isFirstLaunch: true });
        controller.settings.recentNotesCount = 25;

        await expect(controller.loadSettings()).resolves.toBe('missing');

        expect(controller.settings.recentNotesCount).toBe(25);
        expect(saveData).not.toHaveBeenCalled();
    });
});

describe('PluginSettingsController.loadSettingsAtStartup', () => {
    const createController = (loadData: () => Promise<unknown>) => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const loadDataMock = vi.fn(loadData);
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: loadDataMock,
            saveData,
            mirrorUXPreferences: vi.fn()
        });
        return { controller, saveData, loadDataMock };
    };

    it('uses the retry window before confirming first launch for a missing file', async () => {
        const { controller, saveData, loadDataMock } = createController(async () => null);

        await expect(controller.loadSettingsAtStartup({ maxAttempts: 3, retryDelayMs: 0 })).resolves.toBe('first-launch');

        expect(loadDataMock).toHaveBeenCalledTimes(3);
        expect(saveData).not.toHaveBeenCalled();
        expect(controller.settings.recentNotesCount).toBe(DEFAULT_SETTINGS.recentNotesCount);
    });

    it('loads a settings file that appears during the retry window', async () => {
        let attempts = 0;
        const { controller, saveData, loadDataMock } = createController(async () => {
            attempts += 1;
            return attempts < 3 ? null : { recentNotesCount: 17 };
        });

        await expect(controller.loadSettingsAtStartup({ maxAttempts: 4, retryDelayMs: 0 })).resolves.toBe('loaded');

        expect(loadDataMock).toHaveBeenCalledTimes(3);
        expect(controller.settings.recentNotesCount).toBe(17);
        expect(saveData).not.toHaveBeenCalled();
    });

    it('confirms first launch without saving when the file stays missing through the retry window', async () => {
        const { controller, saveData, loadDataMock } = createController(async () => null);

        await expect(controller.loadSettingsAtStartup({ maxAttempts: 3, retryDelayMs: 0 })).resolves.toBe('first-launch');

        expect(loadDataMock).toHaveBeenCalledTimes(3);
        expect(saveData).not.toHaveBeenCalled();
    });

    it('never confirms first launch after observing an unreadable settings file', async () => {
        const results: unknown[] = [undefined, null, null];
        const { controller, saveData } = createController(async () => results.shift());

        await expect(controller.loadSettingsAtStartup({ maxAttempts: 3, retryDelayMs: 0 })).resolves.toBe('unavailable');

        expect(saveData).not.toHaveBeenCalled();
        expect(controller.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('returns unavailable for a missing file when the device has run the plugin before', async () => {
        mockLocalStorageStore.set(STORAGE_KEYS.localStorageVersionKey, 1);
        const { controller, saveData, loadDataMock } = createController(async () => null);

        await expect(controller.loadSettingsAtStartup({ maxAttempts: 3, retryDelayMs: 0 })).resolves.toBe('unavailable');

        expect(loadDataMock).toHaveBeenCalledTimes(3);
        expect(saveData).not.toHaveBeenCalled();
        expect(controller.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('loads a valid record after an unavailable attempt', async () => {
        const results: unknown[] = [undefined, { recentNotesCount: 23 }];
        const { controller, saveData, loadDataMock } = createController(async () => results.shift());

        await expect(controller.loadSettingsAtStartup({ maxAttempts: 3, retryDelayMs: 0 })).resolves.toBe('loaded');

        expect(loadDataMock).toHaveBeenCalledTimes(2);
        expect(controller.settings.recentNotesCount).toBe(23);
        expect(saveData).not.toHaveBeenCalled();
    });

    it('cancels startup loading without applying defaults or waiting for another attempt', async () => {
        const { controller, saveData, loadDataMock } = createController(async () => null);
        const abortController = new AbortController();

        const result = controller.loadSettingsAtStartup({ maxAttempts: 3, retryDelayMs: 10000, signal: abortController.signal });
        abortController.abort();

        await expect(result).resolves.toBe('cancelled');
        expect(loadDataMock).toHaveBeenCalledTimes(1);
        expect(saveData).not.toHaveBeenCalled();
        expect(controller.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('cancels an in-flight settings read without applying or persisting its result', async () => {
        let resolveLoad: (value: unknown) => void = () => {};
        const pendingLoad = new Promise<unknown>(resolve => {
            resolveLoad = resolve;
        });
        const { controller, saveData, loadDataMock } = createController(async () => await pendingLoad);
        const abortController = new AbortController();

        const result = controller.loadSettingsAtStartup({ maxAttempts: 3, retryDelayMs: 0, signal: abortController.signal });
        expect(loadDataMock).toHaveBeenCalledTimes(1);
        abortController.abort();
        resolveLoad({ recentNotesCount: 23, showWordCount: true });

        await expect(result).resolves.toBe('cancelled');
        expect(controller.settings).toEqual(DEFAULT_SETTINGS);
        expect(saveData).not.toHaveBeenCalled();
    });
});

describe('PluginSettingsController.applySettingsRecord', () => {
    const createController = () => {
        const saveData = vi.fn().mockResolvedValue(undefined);
        const loadDataMock = vi.fn();
        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: loadDataMock,
            saveData,
            mirrorUXPreferences: vi.fn()
        });
        return { controller, saveData, loadDataMock };
    };

    it('sanitizes malformed values in memory without reading from disk or persisting', () => {
        const { controller, saveData, loadDataMock } = createController();

        controller.applySettingsRecord(
            {
                shiftEnterOpenContext: 'bogus',
                recentNotesCount: -4,
                propertySortKey: ['status']
            },
            { isFirstLaunch: false }
        );

        expect(controller.settings.shiftEnterOpenContext).toBe(DEFAULT_SETTINGS.shiftEnterOpenContext);
        expect(controller.settings.recentNotesCount).toBe(DEFAULT_SETTINGS.recentNotesCount);
        expect(controller.settings.propertySortKey).toBe(DEFAULT_SETTINGS.propertySortKey);
        expect(loadDataMock).not.toHaveBeenCalled();
        expect(saveData).not.toHaveBeenCalled();
    });

    it('applies an empty record as defaults for reset', () => {
        const { controller, saveData } = createController();
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.recentNotesCount = 40;
        controller.settings = settings;

        controller.applySettingsRecord({}, { isFirstLaunch: false });

        expect(controller.settings.recentNotesCount).toBe(DEFAULT_SETTINGS.recentNotesCount);
        expect(saveData).not.toHaveBeenCalled();
    });

    it('uses imported values instead of existing device mirrors for local-mode settings', () => {
        const { controller } = createController();
        const syncModes = structuredClone(DEFAULT_SETTINGS.syncModes);
        syncModes.folderSortOrder = 'local';
        syncModes.includeDescendantNotes = 'local';
        syncModes.vaultProfile = 'local';
        syncModes.dualPane = 'local';
        syncModes.uiScale = 'local';
        mockLocalStorageStore.set(STORAGE_KEYS.folderSortOrderKey, 'alpha-asc');
        mockLocalStorageStore.set(STORAGE_KEYS.uxPreferencesKey, { includeDescendantNotes: false });
        mockLocalStorageStore.set(STORAGE_KEYS.vaultProfileKey, 'default');
        mockLocalStorageStore.set(STORAGE_KEYS.dualPaneKey, '0');
        mockLocalStorageStore.set(STORAGE_KEYS.uiScaleKey, 1.1);
        const secondaryProfile = structuredClone(DEFAULT_SETTINGS.vaultProfiles[0]);
        secondaryProfile.id = 'secondary';
        secondaryProfile.name = 'Secondary';

        controller.applySettingsRecord(
            {
                syncModes,
                vaultProfiles: [structuredClone(DEFAULT_SETTINGS.vaultProfiles[0]), secondaryProfile],
                vaultProfile: 'secondary',
                folderSortOrder: 'alpha-desc',
                includeDescendantNotes: true,
                dualPane: true,
                desktopScale: 1.3,
                mobileScale: 0.9
            },
            { isFirstLaunch: false, preferRecordLocalValues: true }
        );

        expect(controller.settings.folderSortOrder).toBe('alpha-desc');
        expect(controller.settings.includeDescendantNotes).toBe(true);
        expect(controller.settings.vaultProfile).toBe('secondary');
        expect(controller.settings.dualPane).toBe(true);
        expect(controller.settings.desktopScale).toBe(1.3);
        expect(controller.settings.mobileScale).toBe(0.9);
        expect(mockLocalStorageStore.get(STORAGE_KEYS.folderSortOrderKey)).toBe('alpha-desc');
        expect(mockLocalStorageStore.get(STORAGE_KEYS.uxPreferencesKey)).toMatchObject({ includeDescendantNotes: true });
        expect(mockLocalStorageStore.get(STORAGE_KEYS.vaultProfileKey)).toBe('secondary');
        expect(mockLocalStorageStore.get(STORAGE_KEYS.dualPaneKey)).toBe('1');
        expect(mockLocalStorageStore.get(STORAGE_KEYS.uiScaleKey)).toBe(1.3);
    });

    it('builds persistable first-launch defaults without changing current settings or local mirrors', () => {
        const { controller } = createController();
        const currentSettings = structuredClone(DEFAULT_SETTINGS);
        currentSettings.recentNotesCount = 40;
        controller.settings = currentSettings;
        mockLocalStorageStore.set(STORAGE_KEYS.folderSortOrderKey, 'alpha-desc');

        const persistedDefaults = controller.getPersistableDefaultSettings() as unknown as Record<string, unknown>;

        expect(persistedDefaults.recentNotesCount).toBe(DEFAULT_SETTINGS.recentNotesCount);
        expect(persistedDefaults.desktopScale).toBe(DEFAULT_SETTINGS.desktopScale);
        expect(persistedDefaults.mobileScale).toBe(DEFAULT_SETTINGS.mobileScale);
        expect(controller.settings.recentNotesCount).toBe(40);
        expect(mockLocalStorageStore.get(STORAGE_KEYS.folderSortOrderKey)).toBe('alpha-desc');
    });

    it('builds the same persisted defaults as the canonical first-launch pipeline', () => {
        const { controller } = createController();
        const persistedDefaults = controller.getPersistableDefaultSettings();
        const { controller: firstLaunchController } = createController();

        firstLaunchController.applySettingsRecord(null, { isFirstLaunch: true });

        expect(persistedDefaults).toEqual(firstLaunchController.getPersistableSettings());
    });

    it('does not mutate DEFAULT_SETTINGS through the settings pipeline', () => {
        const pristineDefaults = structuredClone(DEFAULT_SETTINGS);
        const { controller } = createController();

        controller.applySettingsRecord(null, { isFirstLaunch: true });
        controller.settings.vaultProfiles[0].name = 'Edited';
        controller.settings.vaultProfiles[0].hiddenFolders.push('secret');
        controller.applySettingsRecord({}, { isFirstLaunch: false });
        controller.getPersistableDefaultSettings();

        expect(DEFAULT_SETTINGS).toEqual(pristineDefaults);
    });

    it('produces identical persisted defaults across consecutive resets', () => {
        const { controller } = createController();

        controller.applySettingsRecord({}, { isFirstLaunch: false });
        const firstResetSettings = structuredClone(controller.getPersistableSettings());

        controller.settings.vaultProfiles[0].name = 'Edited';
        controller.settings.vaultProfiles[0].hiddenFolders.push('secret');
        controller.applySettingsRecord({}, { isFirstLaunch: false });

        expect(controller.getPersistableSettings()).toEqual(firstResetSettings);
    });
});

describe('PluginSettingsController.saveSettings', () => {
    it('updates local homepage storage when homepage is local', async () => {
        let storedData: Record<string, unknown> | null = null;

        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => (storedData ? structuredClone(storedData) : null)),
            saveData: vi.fn(async data => {
                storedData = structuredClone(data) as Record<string, unknown>;
            }),
            mirrorUXPreferences: vi.fn()
        });
        const settings = structuredClone(DEFAULT_SETTINGS);

        settings.syncModes.homepage = 'local';
        settings.homepage = {
            source: 'daily-note',
            file: null,
            createMissingPeriodicNote: true
        };

        mockLocalStorageStore.set(STORAGE_KEYS.homepageKey, {
            source: 'file',
            file: 'old-note.md',
            createMissingPeriodicNote: false
        });

        controller.settings = settings;
        await controller.saveSettings();

        expect(mockLocalStorageStore.get(STORAGE_KEYS.homepageKey)).toEqual({
            source: 'daily-note',
            file: null,
            createMissingPeriodicNote: true
        });
        expect(storedData?.['homepage']).toBeUndefined();

        const reloadedController = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn(async () => (storedData ? structuredClone(storedData) : null)),
            saveData: vi.fn().mockResolvedValue(undefined),
            mirrorUXPreferences: vi.fn()
        });

        await reloadedController.loadSettings();

        expect(reloadedController.settings.homepage).toEqual({
            source: 'daily-note',
            file: null,
            createMissingPeriodicNote: true
        });
    });

    it('keeps property sort overrides during save when their targets are no longer configured', async () => {
        let storedData: Record<string, unknown> | null = null;
        const statusNodeId = buildPropertyKeyNodeId('status');

        const controller = new PluginSettingsController({
            keys: STORAGE_KEYS,
            loadData: vi.fn().mockResolvedValue(null),
            saveData: vi.fn(async data => {
                storedData = structuredClone(data) as Record<string, unknown>;
            }),
            mirrorUXPreferences: vi.fn()
        });
        const settings = structuredClone(DEFAULT_SETTINGS);

        settings.propertySortKey = 'status';
        settings.folderSortOverrides = {
            Books: { option: 'property-asc', propertyKey: 'published' },
            Notes: { option: 'property-desc', propertyKey: 'Status' },
            Archive: 'title-asc'
        };
        settings.tagSortOverrides = {
            clips: { option: 'property-desc', propertyKey: 'published' }
        };
        settings.propertySortOverrides = {
            [statusNodeId]: { option: 'property-asc', propertyKey: 'published' }
        };

        controller.settings = settings;
        await controller.saveSettings();

        expect(controller.settings.folderSortOverrides.Books).toEqual({ option: 'property-asc', propertyKey: 'published' });
        expect(controller.settings.folderSortOverrides.Notes).toEqual({ option: 'property-desc', propertyKey: 'Status' });
        expect(controller.settings.folderSortOverrides.Archive).toBe('title-asc');
        expect(controller.settings.tagSortOverrides.clips).toEqual({ option: 'property-desc', propertyKey: 'published' });
        expect(controller.settings.propertySortOverrides[statusNodeId]).toEqual({ option: 'property-asc', propertyKey: 'published' });
        expect((storedData?.['folderSortOverrides'] as Record<string, unknown>).Books).toEqual({
            option: 'property-asc',
            propertyKey: 'published'
        });
    });
});
