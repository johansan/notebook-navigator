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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App, PluginManifest } from 'obsidian';

vi.mock('obsidian', async importOriginal => {
    const original = await importOriginal<typeof import('obsidian')>();
    const fallbackClass = class {};
    return {
        ...original,
        FuzzySuggestModal: fallbackClass,
        AbstractInputSuggest: fallbackClass,
        ItemView: fallbackClass
    };
});

vi.mock('../src/settings/LazyNotebookNavigatorSettingTab', () => ({
    LazyNotebookNavigatorSettingTab: class {}
}));

const { whatsNewModalMock, whatsNewModalOpen } = vi.hoisted(() => {
    const whatsNewModalOpen = vi.fn();
    const whatsNewModalMock = vi.fn(function (_app: unknown, _releaseNotes: unknown, _onClose?: () => void) {
        return { open: whatsNewModalOpen };
    });
    return { whatsNewModalMock, whatsNewModalOpen };
});

vi.mock('../src/modals/WhatsNewModal', () => ({
    WhatsNewModal: whatsNewModalMock
}));

import NotebookNavigatorPlugin from '../src/main.ts';
import { DEFAULT_SETTINGS } from '../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../src/settings/types';
import type { MetadataCleanupResult } from '../src/services/metadata';

interface SettingsControllerHarness {
    settings: NotebookNavigatorSettings;
    applySettingsRecord: ReturnType<typeof vi.fn>;
    prepareImportedUiScalePersistence: ReturnType<typeof vi.fn>;
    mirrorAllSyncModeSettingsToLocalStorage: ReturnType<typeof vi.fn>;
    saveSettings: ReturnType<typeof vi.fn>;
    clearAllLocalStorage: ReturnType<typeof vi.fn>;
    setLocalStorageVersion: ReturnType<typeof vi.fn>;
    getPersistableDefaultSettings: ReturnType<typeof vi.fn>;
    getLastShownVersion: ReturnType<typeof vi.fn>;
    advanceLastShownVersion: ReturnType<typeof vi.fn>;
}

interface PreferencesControllerHarness {
    syncMirrorsFromSettings: ReturnType<typeof vi.fn>;
    syncCollapsedPinnedContextsFromLocalStorage: ReturnType<typeof vi.fn>;
    initializeRecentDataManager: ReturnType<typeof vi.fn>;
    notifyUXPreferencesUpdate: ReturnType<typeof vi.fn>;
    resetUXPreferencesToDefaults: ReturnType<typeof vi.fn>;
}

interface MetadataServiceHarness {
    cleanupAllMetadata: ReturnType<typeof vi.fn<() => Promise<MetadataCleanupResult>>>;
}

interface PluginHarness {
    manifest: { dir?: string; version?: string };
    app: {
        vault: {
            adapter: {
                exists(path: string): Promise<boolean>;
                read(path: string): Promise<string>;
                write(path: string, contents: string): Promise<void>;
            };
        };
    };
    settings: NotebookNavigatorSettings;
    settingsController: SettingsControllerHarness;
    preferencesController: PreferencesControllerHarness;
    metadataService: MetadataServiceHarness | null;
    isUnloading: boolean;
    hasStartedWithSettings: boolean;
    isRestoringDefaultSettings: boolean;
    loadSettings: ReturnType<typeof vi.fn>;
    notifySettingsUpdateWithFullRefresh: ReturnType<typeof vi.fn>;
    onSettingsUpdate: ReturnType<typeof vi.fn>;
    saveSettingsAndUpdate: ReturnType<typeof vi.fn>;
    onExternalSettingsChange(): Promise<void>;
    importSettingsTransfer(transferData: unknown): Promise<void>;
    resetAllSettings(): Promise<void>;
    runMetadataCleanup(): Promise<boolean>;
    restoreDefaultSettingsFile(): Promise<void>;
    advanceLastShownVersion(version: string): Promise<void>;
    checkForVersionUpdate(params: { isFirstLaunch: boolean }): Promise<void>;
}

function createPluginHarness(): PluginHarness {
    const settings = structuredClone(DEFAULT_SETTINGS);
    const settingsController: SettingsControllerHarness = {
        settings,
        applySettingsRecord: vi.fn(),
        prepareImportedUiScalePersistence: vi.fn(),
        mirrorAllSyncModeSettingsToLocalStorage: vi.fn(),
        saveSettings: vi.fn().mockResolvedValue(undefined),
        clearAllLocalStorage: vi.fn(),
        setLocalStorageVersion: vi.fn(),
        getPersistableDefaultSettings: vi.fn(() => ({ restored: true })),
        getLastShownVersion: vi.fn(() => settings.lastShownVersion),
        advanceLastShownVersion: vi.fn((version: string) => {
            settings.lastShownVersion = version;
            return true;
        })
    };
    const preferencesController: PreferencesControllerHarness = {
        syncMirrorsFromSettings: vi.fn(() => false),
        syncCollapsedPinnedContextsFromLocalStorage: vi.fn(() => false),
        initializeRecentDataManager: vi.fn(),
        notifyUXPreferencesUpdate: vi.fn(),
        resetUXPreferencesToDefaults: vi.fn()
    };
    const metadataService: MetadataServiceHarness = {
        cleanupAllMetadata: vi.fn().mockResolvedValue({ settingsChanged: false, localChanged: false })
    };
    const plugin = new NotebookNavigatorPlugin(
        {} as App,
        {
            id: 'notebook-navigator',
            name: 'Notebook Navigator',
            version: '3.2.4',
            minAppVersion: '1.11.0',
            dir: 'config/plugins/notebook-navigator'
        } as PluginManifest
    ) as unknown as PluginHarness;
    Object.assign(plugin, {
        manifest: { dir: 'config/plugins/notebook-navigator', version: '3.2.4' },
        app: { vault: { adapter: {} } },
        settings,
        settingsController,
        preferencesController,
        metadataService,
        isUnloading: false,
        hasStartedWithSettings: true,
        isRestoringDefaultSettings: false,
        loadSettings: vi.fn().mockResolvedValue('loaded'),
        notifySettingsUpdateWithFullRefresh: vi.fn(),
        onSettingsUpdate: vi.fn(),
        saveSettingsAndUpdate: vi.fn().mockResolvedValue(undefined)
    });
    return plugin;
}

afterEach(() => {
    vi.useRealTimers();
});

describe('NotebookNavigatorPlugin settings orchestration', () => {
    it('publishes pinned collapse state migrated during an external settings reload', async () => {
        const plugin = createPluginHarness();
        plugin.preferencesController.syncCollapsedPinnedContextsFromLocalStorage.mockReturnValue(true);

        await plugin.onExternalSettingsChange();

        expect(plugin.preferencesController.syncCollapsedPinnedContextsFromLocalStorage).toHaveBeenCalledTimes(1);
        expect(plugin.preferencesController.notifyUXPreferencesUpdate).toHaveBeenCalledTimes(1);
        expect(plugin.notifySettingsUpdateWithFullRefresh).toHaveBeenCalledTimes(1);
    });

    it('applies an import with record-local precedence and persists once without rereading', async () => {
        const plugin = createPluginHarness();
        const calls: string[] = [];
        plugin.settingsController.applySettingsRecord.mockImplementation((record: Record<string, unknown>) => {
            calls.push('apply');
            plugin.settingsController.settings = { ...structuredClone(DEFAULT_SETTINGS), ...record };
        });
        plugin.settingsController.prepareImportedUiScalePersistence.mockImplementation(() => calls.push('prepare-scale'));
        plugin.settingsController.mirrorAllSyncModeSettingsToLocalStorage.mockImplementation(() => calls.push('mirror'));
        plugin.settingsController.saveSettings.mockImplementation(() => {
            calls.push('save');
        });

        await plugin.importSettingsTransfer({ folderSortOrder: 'alpha-desc' });

        expect(plugin.settingsController.applySettingsRecord).toHaveBeenCalledWith(expect.any(Object), {
            isFirstLaunch: false,
            preferRecordLocalValues: true
        });
        expect(plugin.settings.folderSortOrder).toBe('alpha-desc');
        expect(calls).toEqual(['apply', 'prepare-scale', 'save']);
        expect(plugin.settingsController.mirrorAllSyncModeSettingsToLocalStorage).not.toHaveBeenCalled();
        expect(plugin.settingsController.saveSettings).toHaveBeenCalledTimes(1);
    });

    it('resets through the pipeline and invokes one settings save', async () => {
        const plugin = createPluginHarness();
        const preservedSyncModes = structuredClone(plugin.settings.syncModes);
        preservedSyncModes.folderSortOrder = 'local';
        plugin.settings.syncModes = preservedSyncModes;
        plugin.settingsController.applySettingsRecord.mockImplementation(() => {
            const defaults = structuredClone(DEFAULT_SETTINGS);
            defaults.showRootFolder = false;
            plugin.settingsController.settings = defaults;
        });

        await plugin.resetAllSettings();

        expect(plugin.settingsController.clearAllLocalStorage).toHaveBeenCalledTimes(1);
        expect(plugin.settingsController.applySettingsRecord).toHaveBeenCalledWith({}, { isFirstLaunch: false });
        expect(plugin.settings.syncModes.folderSortOrder).toBe('local');
        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(plugin.settingsController.mirrorAllSyncModeSettingsToLocalStorage).toHaveBeenCalledTimes(1);
    });

    it('reports local-only metadata cleanup without saving synced settings', async () => {
        const plugin = createPluginHarness();
        plugin.metadataService?.cleanupAllMetadata.mockResolvedValue({
            settingsChanged: false,
            localChanged: true
        });

        await expect(plugin.runMetadataCleanup()).resolves.toBe(true);

        expect(plugin.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });

    it('saves synced settings when metadata cleanup changes them', async () => {
        const plugin = createPluginHarness();
        plugin.metadataService?.cleanupAllMetadata.mockResolvedValue({
            settingsChanged: true,
            localChanged: false
        });

        await expect(plugin.runMetadataCleanup()).resolves.toBe(true);

        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });
});

describe("NotebookNavigatorPlugin What's new version tracking", () => {
    beforeEach(() => {
        whatsNewModalMock.mockClear();
        whatsNewModalOpen.mockClear();
    });

    it('persists the shared marker only when the controller advances it', async () => {
        const plugin = createPluginHarness();

        await plugin.advanceLastShownVersion('3.3.2');

        expect(plugin.settingsController.advanceLastShownVersion).toHaveBeenCalledWith('3.3.2');
        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);

        plugin.settingsController.advanceLastShownVersion.mockReturnValue(false);
        await plugin.advanceLastShownVersion('3.3.1');

        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('skips the dialog when the effective marker is newer than the running plugin', async () => {
        const plugin = createPluginHarness();
        plugin.manifest.version = '3.3.1';
        plugin.settingsController.getLastShownVersion.mockReturnValue('3.3.2');

        await plugin.checkForVersionUpdate({ isFirstLaunch: false });

        expect(whatsNewModalMock).not.toHaveBeenCalled();
        expect(plugin.settingsController.advanceLastShownVersion).not.toHaveBeenCalled();
        expect(plugin.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });

    it('advances the marker without opening the dialog when release notes are disabled', async () => {
        const plugin = createPluginHarness();
        plugin.manifest.version = '999.0.0';
        plugin.settings.showReleaseNotes = false;
        plugin.settingsController.getLastShownVersion.mockReturnValue('990.0.0');

        await plugin.checkForVersionUpdate({ isFirstLaunch: false });

        expect(whatsNewModalMock).not.toHaveBeenCalled();
        expect(plugin.settingsController.advanceLastShownVersion).toHaveBeenCalledWith('999.0.0');
        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('initializes a missing marker without opening the dialog when release notes are disabled', async () => {
        const plugin = createPluginHarness();
        plugin.manifest.version = '999.0.0';
        plugin.settings.showReleaseNotes = false;
        plugin.settingsController.getLastShownVersion.mockReturnValue('');

        await plugin.checkForVersionUpdate({ isFirstLaunch: false });

        expect(whatsNewModalMock).not.toHaveBeenCalled();
        expect(plugin.settingsController.advanceLastShownVersion).toHaveBeenCalledWith('999.0.0');
        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('does not open the dialog when the current release opts out of automatic display', async () => {
        const plugin = createPluginHarness();
        plugin.manifest.version = '3.3.5';
        plugin.settings.showReleaseNotes = true;
        plugin.settingsController.getLastShownVersion.mockReturnValue('3.3.3');

        await plugin.checkForVersionUpdate({ isFirstLaunch: false });

        expect(whatsNewModalMock).not.toHaveBeenCalled();
        expect(plugin.settingsController.advanceLastShownVersion).toHaveBeenCalledWith('3.3.5');
        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('opens the dialog when the user and current release both opt in', async () => {
        const plugin = createPluginHarness();
        plugin.manifest.version = '3.3.4';
        plugin.settings.showReleaseNotes = true;
        plugin.settingsController.getLastShownVersion.mockReturnValue('3.3.2');

        await plugin.checkForVersionUpdate({ isFirstLaunch: false });

        expect(whatsNewModalMock).toHaveBeenCalledTimes(1);
        expect(whatsNewModalOpen).toHaveBeenCalledTimes(1);
    });

    it('advances both markers after the update dialog closes', async () => {
        vi.useFakeTimers();
        const plugin = createPluginHarness();
        plugin.manifest.version = '999.0.0';
        plugin.settingsController.getLastShownVersion.mockReturnValue('990.0.0');

        await plugin.checkForVersionUpdate({ isFirstLaunch: false });

        expect(whatsNewModalMock).toHaveBeenCalledTimes(1);
        expect(whatsNewModalOpen).toHaveBeenCalledTimes(1);
        const onClose = whatsNewModalMock.mock.calls[0][2];
        expect(onClose).toBeDefined();
        onClose?.();
        await vi.advanceTimersByTimeAsync(1000);

        expect(plugin.settingsController.advanceLastShownVersion).toHaveBeenCalledWith('999.0.0');
        expect(plugin.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('does not save an older marker when a newer version arrives while the dialog is open', async () => {
        vi.useFakeTimers();
        const plugin = createPluginHarness();
        plugin.manifest.version = '999.0.0';
        plugin.settingsController.getLastShownVersion.mockReturnValue('990.0.0');

        await plugin.checkForVersionUpdate({ isFirstLaunch: false });

        const onClose = whatsNewModalMock.mock.calls[0][2];
        expect(onClose).toBeDefined();
        plugin.settingsController.advanceLastShownVersion.mockReturnValue(false);
        onClose?.();
        await vi.advanceTimersByTimeAsync(1000);

        expect(plugin.settingsController.advanceLastShownVersion).toHaveBeenCalledWith('999.0.0');
        expect(plugin.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });
});

describe('NotebookNavigatorPlugin settings recovery', () => {
    it('preserves an existing backup and verifies a new timestamped backup before clearing local state', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-14T12:34:56Z'));
        const plugin = createPluginHarness();
        const pluginDir = plugin.manifest.dir as string;
        const dataPath = `${pluginDir}/data.json`;
        const baseBackupPath = `${pluginDir}/data-backup-20260714123456.json`;
        const collisionBackupPath = `${pluginDir}/data-backup-20260714123456-1.json`;
        const originalSettings = '{"recentNotesCount":17}';
        const files = new Map<string, string>([
            [dataPath, originalSettings],
            [baseBackupPath, 'older-backup']
        ]);
        plugin.app.vault.adapter = {
            exists: vi.fn(async (path: string) => files.has(path)),
            read: vi.fn(async (path: string) => {
                const contents = files.get(path);
                if (contents === undefined) {
                    throw new Error('ENOENT');
                }
                return contents;
            }),
            write: vi.fn(async (path: string, contents: string) => {
                files.set(path, contents);
            })
        };
        plugin.settingsController.applySettingsRecord.mockImplementation(() => {
            const defaults = structuredClone(DEFAULT_SETTINGS);
            defaults.showRootFolder = false;
            plugin.settingsController.settings = defaults;
        });

        await plugin.restoreDefaultSettingsFile();

        expect(files.get(baseBackupPath)).toBe('older-backup');
        expect(files.get(collisionBackupPath)).toBe(originalSettings);
        expect(files.get(dataPath)).toBe(JSON.stringify({ restored: true }, null, 2));
        expect(plugin.settingsController.clearAllLocalStorage).toHaveBeenCalledTimes(1);
        expect(plugin.settingsController.applySettingsRecord).toHaveBeenCalledWith(null, { isFirstLaunch: true });
        expect(plugin.settingsController.setLocalStorageVersion).toHaveBeenCalledTimes(1);
        expect(plugin.isRestoringDefaultSettings).toBe(false);
    });

    it('keeps local state when writing the recovered settings file fails', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-14T12:34:56Z'));
        const plugin = createPluginHarness();
        const pluginDir = plugin.manifest.dir as string;
        const dataPath = `${pluginDir}/data.json`;
        const files = new Map<string, string>([[dataPath, '{broken-json']]);
        plugin.app.vault.adapter = {
            exists: vi.fn(async (path: string) => files.has(path)),
            read: vi.fn(async (path: string) => {
                const contents = files.get(path);
                if (contents === undefined) {
                    throw new Error('ENOENT');
                }
                return contents;
            }),
            write: vi.fn(async (path: string, contents: string) => {
                if (path === dataPath) {
                    throw new Error('write failed');
                }
                files.set(path, contents);
            })
        };

        await plugin.restoreDefaultSettingsFile();

        expect(files.get(dataPath)).toBe('{broken-json');
        expect(plugin.settingsController.clearAllLocalStorage).not.toHaveBeenCalled();
        expect(plugin.settingsController.applySettingsRecord).not.toHaveBeenCalled();
        expect(plugin.settingsController.setLocalStorageVersion).not.toHaveBeenCalled();
        expect(plugin.isRestoringDefaultSettings).toBe(false);
    });

    it('keeps the settings file and local state when the existing file cannot be read for backup', async () => {
        const plugin = createPluginHarness();
        const pluginDir = plugin.manifest.dir as string;
        const dataPath = `${pluginDir}/data.json`;
        const write = vi.fn().mockResolvedValue(undefined);
        plugin.app.vault.adapter = {
            exists: vi.fn(async path => path === dataPath),
            read: vi.fn().mockRejectedValue(new Error('read failed')),
            write
        };

        await plugin.restoreDefaultSettingsFile();

        expect(write).not.toHaveBeenCalled();
        expect(plugin.settingsController.clearAllLocalStorage).not.toHaveBeenCalled();
        expect(plugin.settingsController.applySettingsRecord).not.toHaveBeenCalled();
        expect(plugin.settingsController.setLocalStorageVersion).not.toHaveBeenCalled();
        expect(plugin.isRestoringDefaultSettings).toBe(false);
    });
});
