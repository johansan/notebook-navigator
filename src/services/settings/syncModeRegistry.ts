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

import { Platform } from 'obsidian';

import {
    migrateUIScales,
    resolveCalendarPlacement,
    resolveCalendarLeftPlacement,
    resolveCalendarWeeksToShow,
    resolveCompactItemHeight,
    resolveCompactItemHeightScaleText,
    resolveFolderSortOrder,
    resolveNavIndent,
    resolveNavItemHeight,
    resolveNavItemHeightScaleText,
    resolvePaneTransitionDuration,
    resolvePinNavigationBanner,
    resolveTagSortOrder,
    resolvePropertySortOrder,
    resolveToolbarVisibility
} from '../../settings/migrations/localPreferences';
import type { NotebookNavigatorSettings, SyncModeSettingId } from '../../settings/types';
import type { DualPaneOrientation, LocalStorageKeys, UXPreferences } from '../../types';
import { localStorage } from '../../utils/localStorage';
import { normalizeOptionalVaultFilePath } from '../../utils/pathUtils';
import { sanitizeUIScale } from '../../utils/uiScale';

export interface SyncModeRegistryEntry {
    loadPhase: 'preProfiles' | 'postProfiles';
    cleanupOnLoad: boolean;
    hasPersistedValue: (storedData: Record<string, unknown>) => boolean;
    deleteFromPersisted: (persisted: Record<string, unknown>) => void;
    mirrorToLocalStorage: () => void;
    resolveOnLoad: (params: { storedData: Record<string, unknown> | null; preferRecordValue: boolean }) => { migrated: boolean };
}

export type SyncModeRegistry = Record<SyncModeSettingId, SyncModeRegistryEntry>;

interface CreateSyncModeRegistryParams {
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
    isLocal: (settingId: SyncModeSettingId) => boolean;
    getSettings: () => NotebookNavigatorSettings;

    resolveActiveVaultProfileId: () => string;
    sanitizeVaultProfileId: (value: unknown) => string;
    parseDualPanePreference: (raw: unknown) => boolean | null;
    parseDualPaneOrientation: (raw: unknown) => DualPaneOrientation | null;

    sanitizeBooleanSetting: (value: unknown, fallback: boolean) => boolean;
    sanitizeHomepageSetting: (value: unknown) => NotebookNavigatorSettings['homepage'];
    sanitizeDualPaneOrientationSetting: (value: unknown) => DualPaneOrientation;
    sanitizeNarrowSidebarLayoutSetting: (value: unknown) => NotebookNavigatorSettings['narrowSidebarLayout'];
    sanitizeNarrowSidebarTriggerModeSetting: (value: unknown) => NotebookNavigatorSettings['narrowSidebarTriggerMode'];
    sanitizeNarrowSidebarCustomWidthSetting: (value: unknown) => number;
    sanitizeTagSortOrderSetting: (value: unknown) => NotebookNavigatorSettings['tagSortOrder'];
    sanitizeFolderSortOrderSetting: (value: unknown) => NotebookNavigatorSettings['folderSortOrder'];
    sanitizePaneTransitionDurationSetting: (value: unknown) => number;
    sanitizeToolbarVisibilitySetting: (value: unknown) => NotebookNavigatorSettings['toolbarVisibility'];
    sanitizeNavIndentSetting: (value: unknown) => number;
    sanitizeNavItemHeightSetting: (value: unknown) => number;
    sanitizeCalendarPlacementSetting: (value: unknown) => NotebookNavigatorSettings['calendarPlacement'];
    sanitizeCalendarLeftPlacementSetting: (value: unknown) => NotebookNavigatorSettings['calendarLeftPlacement'];
    sanitizeCalendarWeeksToShowSetting: (value: unknown) => NotebookNavigatorSettings['calendarWeeksToShow'];
    sanitizeCompactItemHeightSetting: (value: unknown) => number;
    sanitizeFeatureImageSizeSetting: (value: unknown) => NotebookNavigatorSettings['featureImageSize'];
    sanitizeFeatureImagePixelSizeSetting: (value: unknown) => NotebookNavigatorSettings['featureImagePixelSize'];

    defaultUXPreferences: UXPreferences;
    isUXPreferencesRecord: (value: unknown) => value is Partial<UXPreferences>;
    mirrorUXPreferences: (update: Partial<UXPreferences>) => void;

    getShouldPersistDesktopScale: () => boolean;
    getShouldPersistMobileScale: () => boolean;
    setShouldPersistDesktopScale: (value: boolean) => void;
    setShouldPersistMobileScale: (value: boolean) => void;
}

export function createSyncModeRegistry(params: CreateSyncModeRegistryParams): SyncModeRegistry {
    type PersistedKey = keyof NotebookNavigatorSettings;

    const setLocalStorage = <T>(key: string, value: T): void => {
        localStorage.set(key, value);
    };

    const mirrorFromSettings = <T>(key: string, getValue: () => T) => {
        return () => {
            setLocalStorage(key, getValue());
        };
    };

    const deletePersistedKeys = (persisted: Record<string, unknown>, keys: readonly PersistedKey[]) => {
        keys.forEach(key => {
            delete persisted[key];
        });
    };

    const hasAnyPersistedKey = (storedData: Record<string, unknown>, keys: readonly PersistedKey[]) => {
        return keys.some(key => key in storedData);
    };

    const createEntry = (entryParams: {
        persistedKeys: readonly PersistedKey[];
        loadPhase: 'preProfiles' | 'postProfiles';
        resolveOnLoad: (entryParams: { storedData: Record<string, unknown> | null; preferRecordValue: boolean }) => {
            migrated: boolean;
        };
        mirrorToLocalStorage: () => void;
        cleanupOnLoad?: boolean;
        hasPersistedValue?: (storedData: Record<string, unknown>) => boolean;
        deleteFromPersisted?: (persisted: Record<string, unknown>) => void;
    }): SyncModeRegistryEntry => {
        const cleanupOnLoad = entryParams.cleanupOnLoad ?? true;
        const hasPersistedValue =
            entryParams.hasPersistedValue ??
            ((storedData: Record<string, unknown>) => hasAnyPersistedKey(storedData, entryParams.persistedKeys));
        const deleteFromPersisted =
            entryParams.deleteFromPersisted ??
            ((persisted: Record<string, unknown>) => deletePersistedKeys(persisted, entryParams.persistedKeys));

        return {
            loadPhase: entryParams.loadPhase,
            cleanupOnLoad,
            hasPersistedValue,
            deleteFromPersisted,
            mirrorToLocalStorage: entryParams.mirrorToLocalStorage,
            resolveOnLoad: entryParams.resolveOnLoad
        };
    };

    const createResolvedLocalStorageEntry = <T>(entryParams: {
        settingId: SyncModeSettingId;
        persistedKeys: readonly PersistedKey[];
        loadPhase: 'preProfiles' | 'postProfiles';
        localStorageKey: string;
        resolveDeviceLocal: (storedData: Record<string, unknown> | null) => { value: T; migrated: boolean };
        sanitizeSynced: () => T;
        getCurrent: () => T;
        setCurrent: (value: T) => void;
        cleanupOnLoad?: boolean;
        hasPersistedValue?: (storedData: Record<string, unknown>) => boolean;
        deleteFromPersisted?: (persisted: Record<string, unknown>) => void;
    }) => {
        return createEntry({
            persistedKeys: entryParams.persistedKeys,
            loadPhase: entryParams.loadPhase,
            cleanupOnLoad: entryParams.cleanupOnLoad,
            hasPersistedValue: entryParams.hasPersistedValue,
            deleteFromPersisted: entryParams.deleteFromPersisted,
            resolveOnLoad: ({ storedData, preferRecordValue }) => {
                if (params.isLocal(entryParams.settingId) && !preferRecordValue) {
                    const resolved = entryParams.resolveDeviceLocal(storedData);
                    entryParams.setCurrent(resolved.value);
                    return { migrated: resolved.migrated };
                }

                const nextValue = entryParams.sanitizeSynced();
                entryParams.setCurrent(nextValue);
                setLocalStorage(entryParams.localStorageKey, nextValue);
                return { migrated: false };
            },
            mirrorToLocalStorage: mirrorFromSettings(entryParams.localStorageKey, entryParams.getCurrent)
        });
    };

    const createResolvedLocalStorageSettingEntry = <K extends SyncModeSettingId & PersistedKey>(entryParams: {
        settingId: K;
        loadPhase: 'preProfiles' | 'postProfiles';
        localStorageKey: string;
        resolveDeviceLocal: (storedData: Record<string, unknown> | null) => { value: NotebookNavigatorSettings[K]; migrated: boolean };
        sanitizeSynced: () => NotebookNavigatorSettings[K];
        cleanupOnLoad?: boolean;
        hasPersistedValue?: (storedData: Record<string, unknown>) => boolean;
        deleteFromPersisted?: (persisted: Record<string, unknown>) => void;
    }) => {
        return createResolvedLocalStorageEntry<NotebookNavigatorSettings[K]>({
            settingId: entryParams.settingId,
            persistedKeys: [entryParams.settingId],
            loadPhase: entryParams.loadPhase,
            localStorageKey: entryParams.localStorageKey,
            resolveDeviceLocal: entryParams.resolveDeviceLocal,
            sanitizeSynced: entryParams.sanitizeSynced,
            getCurrent: () => params.getSettings()[entryParams.settingId],
            setCurrent: value => {
                params.getSettings()[entryParams.settingId] = value;
            },
            cleanupOnLoad: entryParams.cleanupOnLoad,
            hasPersistedValue: entryParams.hasPersistedValue,
            deleteFromPersisted: entryParams.deleteFromPersisted
        });
    };

    const createUXPreferenceEntry = (entryParams: { settingId: 'includeDescendantNotes'; persistedKey: 'includeDescendantNotes' }) => {
        return createEntry({
            persistedKeys: [entryParams.persistedKey],
            loadPhase: 'preProfiles',
            resolveOnLoad: ({ preferRecordValue }) => {
                const storedUXPreferences = localStorage.get<unknown>(params.keys.uxPreferencesKey);
                const storedValid = params.isUXPreferencesRecord(storedUXPreferences);
                const base: UXPreferences = storedValid
                    ? { ...params.defaultUXPreferences, ...storedUXPreferences }
                    : { ...params.defaultUXPreferences };
                const isLocal = params.isLocal(entryParams.settingId);
                const settings = params.getSettings();
                const nextValue =
                    isLocal && !preferRecordValue
                        ? base[entryParams.persistedKey]
                        : params.sanitizeBooleanSetting(
                              settings[entryParams.persistedKey],
                              params.defaultSettings[entryParams.persistedKey]
                          );
                settings[entryParams.persistedKey] = nextValue;

                if (!storedValid || base[entryParams.persistedKey] !== nextValue) {
                    setLocalStorage(params.keys.uxPreferencesKey, {
                        ...base,
                        [entryParams.persistedKey]: nextValue
                    });
                }

                return { migrated: false };
            },
            mirrorToLocalStorage: () => {
                params.mirrorUXPreferences({
                    [entryParams.persistedKey]: params.getSettings()[entryParams.persistedKey]
                });
            }
        });
    };

    const resolveLegacyHomepageLocal = (storedData: Record<string, unknown> | null): NotebookNavigatorSettings['homepage'] => {
        const useMobileHomepage = storedData?.['useMobileHomepage'] === true;
        const mobileHomepage = normalizeOptionalVaultFilePath(
            typeof storedData?.['mobileHomepage'] === 'string' ? storedData.mobileHomepage : null
        );
        const homepage = normalizeOptionalVaultFilePath(typeof storedData?.['homepage'] === 'string' ? storedData.homepage : null);
        const resolvedMobileHomepage = mobileHomepage ?? homepage;

        if (useMobileHomepage) {
            return {
                source: Platform.isMobile ? (resolvedMobileHomepage ? 'file' : 'none') : homepage ? 'file' : 'none',
                file: Platform.isMobile ? resolvedMobileHomepage : homepage,
                createMissingPeriodicNote: params.defaultSettings.homepage.createMissingPeriodicNote
            };
        }

        return {
            source: homepage ? 'file' : 'none',
            file: homepage,
            createMissingPeriodicNote: params.defaultSettings.homepage.createMissingPeriodicNote
        };
    };

    return {
        vaultProfile: createEntry({
            persistedKeys: ['vaultProfile'],
            loadPhase: 'postProfiles',
            resolveOnLoad: ({ preferRecordValue }) => {
                const isLocal = params.isLocal('vaultProfile');
                const settings = params.getSettings();
                settings.vaultProfile =
                    isLocal && !preferRecordValue
                        ? params.resolveActiveVaultProfileId()
                        : params.sanitizeVaultProfileId(settings.vaultProfile);
                setLocalStorage(params.keys.vaultProfileKey, settings.vaultProfile);
                return { migrated: false };
            },
            mirrorToLocalStorage: mirrorFromSettings(params.keys.vaultProfileKey, () => params.getSettings().vaultProfile)
        }),
        homepage: createResolvedLocalStorageSettingEntry({
            settingId: 'homepage',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.homepageKey,
            resolveDeviceLocal: storedData => {
                const storedLocal = localStorage.get<unknown>(params.keys.homepageKey);
                const migrated = storedData
                    ? 'homepage' in storedData || 'mobileHomepage' in storedData || 'useMobileHomepage' in storedData
                    : false;
                const resolved = params.sanitizeHomepageSetting(storedLocal);
                const hasStructuredPersistedHomepage =
                    typeof storedData?.['homepage'] === 'object' &&
                    storedData?.['homepage'] !== null &&
                    !Array.isArray(storedData?.['homepage']);
                const nextValue =
                    storedLocal === null
                        ? hasStructuredPersistedHomepage
                            ? params.sanitizeHomepageSetting(storedData?.['homepage'])
                            : resolveLegacyHomepageLocal(storedData)
                        : resolved;
                setLocalStorage(params.keys.homepageKey, nextValue);
                return { value: nextValue, migrated };
            },
            sanitizeSynced: () => params.sanitizeHomepageSetting(params.getSettings().homepage),
            deleteFromPersisted: persisted => {
                delete persisted['homepage'];
                delete persisted['mobileHomepage'];
                delete persisted['useMobileHomepage'];
            },
            hasPersistedValue: storedData => 'homepage' in storedData || 'mobileHomepage' in storedData || 'useMobileHomepage' in storedData
        }),
        folderSortOrder: createResolvedLocalStorageSettingEntry({
            settingId: 'folderSortOrder',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.folderSortOrderKey,
            resolveDeviceLocal: storedData => ({
                value: resolveFolderSortOrder({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
                migrated: false
            }),
            sanitizeSynced: () => params.sanitizeFolderSortOrderSetting(params.getSettings().folderSortOrder)
        }),
        tagSortOrder: createResolvedLocalStorageSettingEntry({
            settingId: 'tagSortOrder',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.tagSortOrderKey,
            resolveDeviceLocal: storedData => ({
                value: resolveTagSortOrder({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
                migrated: false
            }),
            sanitizeSynced: () => params.sanitizeTagSortOrderSetting(params.getSettings().tagSortOrder)
        }),
        propertySortOrder: createResolvedLocalStorageSettingEntry({
            settingId: 'propertySortOrder',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.propertySortOrderKey,
            resolveDeviceLocal: storedData => ({
                value: resolvePropertySortOrder({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
                migrated: false
            }),
            sanitizeSynced: () => params.sanitizeTagSortOrderSetting(params.getSettings().propertySortOrder)
        }),
        includeDescendantNotes: createUXPreferenceEntry({
            settingId: 'includeDescendantNotes',
            persistedKey: 'includeDescendantNotes'
        }),
        dualPane: createEntry({
            persistedKeys: ['dualPane'],
            loadPhase: 'preProfiles',
            resolveOnLoad: ({ preferRecordValue }) => {
                const isLocal = params.isLocal('dualPane');
                const storedDualPane = localStorage.get<unknown>(params.keys.dualPaneKey);
                const parsedDualPane = params.parseDualPanePreference(storedDualPane);
                const settings = params.getSettings();
                const dualPane =
                    isLocal && !preferRecordValue
                        ? (parsedDualPane ?? params.defaultSettings.dualPane)
                        : params.sanitizeBooleanSetting(settings.dualPane, params.defaultSettings.dualPane);
                settings.dualPane = dualPane;
                setLocalStorage(params.keys.dualPaneKey, dualPane ? '1' : '0');
                return { migrated: false };
            },
            mirrorToLocalStorage: mirrorFromSettings(params.keys.dualPaneKey, () => (params.getSettings().dualPane ? '1' : '0'))
        }),
        dualPaneOrientation: createEntry({
            persistedKeys: ['dualPaneOrientation'],
            loadPhase: 'preProfiles',
            resolveOnLoad: ({ preferRecordValue }) => {
                const isLocal = params.isLocal('dualPaneOrientation');
                const storedDualPaneOrientation = localStorage.get<unknown>(params.keys.dualPaneOrientationKey);
                const parsedDualPaneOrientation = params.parseDualPaneOrientation(storedDualPaneOrientation);
                const settings = params.getSettings();
                const dualPaneOrientation =
                    isLocal && !preferRecordValue
                        ? (parsedDualPaneOrientation ?? params.defaultSettings.dualPaneOrientation)
                        : params.sanitizeDualPaneOrientationSetting(settings.dualPaneOrientation);
                settings.dualPaneOrientation = dualPaneOrientation;
                setLocalStorage(params.keys.dualPaneOrientationKey, dualPaneOrientation);
                return { migrated: false };
            },
            mirrorToLocalStorage: mirrorFromSettings(params.keys.dualPaneOrientationKey, () => params.getSettings().dualPaneOrientation)
        }),
        narrowSidebarLayout: createEntry({
            persistedKeys: ['narrowSidebarLayout'],
            loadPhase: 'preProfiles',
            resolveOnLoad: ({ preferRecordValue }) => {
                const isLocal = params.isLocal('narrowSidebarLayout');
                const storedNarrowSidebarLayout = localStorage.get<unknown>(params.keys.narrowSidebarLayoutKey);
                const settings = params.getSettings();
                const narrowSidebarLayout =
                    isLocal && !preferRecordValue
                        ? params.sanitizeNarrowSidebarLayoutSetting(storedNarrowSidebarLayout)
                        : params.sanitizeNarrowSidebarLayoutSetting(settings.narrowSidebarLayout);
                settings.narrowSidebarLayout = narrowSidebarLayout;
                setLocalStorage(params.keys.narrowSidebarLayoutKey, narrowSidebarLayout);
                return { migrated: false };
            },
            mirrorToLocalStorage: mirrorFromSettings(params.keys.narrowSidebarLayoutKey, () => params.getSettings().narrowSidebarLayout)
        }),
        narrowSidebarTriggerMode: createEntry({
            persistedKeys: ['narrowSidebarTriggerMode'],
            loadPhase: 'preProfiles',
            resolveOnLoad: ({ preferRecordValue }) => {
                const isLocal = params.isLocal('narrowSidebarTriggerMode');
                const storedTriggerMode = localStorage.get<unknown>(params.keys.narrowSidebarTriggerModeKey);
                const settings = params.getSettings();
                const triggerMode =
                    isLocal && !preferRecordValue
                        ? params.sanitizeNarrowSidebarTriggerModeSetting(storedTriggerMode)
                        : params.sanitizeNarrowSidebarTriggerModeSetting(settings.narrowSidebarTriggerMode);
                settings.narrowSidebarTriggerMode = triggerMode;
                setLocalStorage(params.keys.narrowSidebarTriggerModeKey, triggerMode);
                return { migrated: false };
            },
            mirrorToLocalStorage: mirrorFromSettings(
                params.keys.narrowSidebarTriggerModeKey,
                () => params.getSettings().narrowSidebarTriggerMode
            )
        }),
        narrowSidebarCustomWidth: createEntry({
            persistedKeys: ['narrowSidebarCustomWidth'],
            loadPhase: 'preProfiles',
            resolveOnLoad: ({ preferRecordValue }) => {
                const isLocal = params.isLocal('narrowSidebarCustomWidth');
                const storedCustomWidth = localStorage.get<unknown>(params.keys.narrowSidebarCustomWidthKey);
                const settings = params.getSettings();
                const customWidth =
                    isLocal && !preferRecordValue
                        ? params.sanitizeNarrowSidebarCustomWidthSetting(storedCustomWidth)
                        : params.sanitizeNarrowSidebarCustomWidthSetting(settings.narrowSidebarCustomWidth);
                settings.narrowSidebarCustomWidth = customWidth;
                setLocalStorage(params.keys.narrowSidebarCustomWidthKey, customWidth);
                return { migrated: false };
            },
            mirrorToLocalStorage: mirrorFromSettings(
                params.keys.narrowSidebarCustomWidthKey,
                () => params.getSettings().narrowSidebarCustomWidth
            )
        }),
        paneTransitionDuration: createResolvedLocalStorageSettingEntry({
            settingId: 'paneTransitionDuration',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.paneTransitionDurationKey,
            resolveDeviceLocal: storedData =>
                resolvePaneTransitionDuration({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizePaneTransitionDurationSetting(params.getSettings().paneTransitionDuration)
        }),
        toolbarVisibility: createResolvedLocalStorageSettingEntry({
            settingId: 'toolbarVisibility',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.toolbarVisibilityKey,
            resolveDeviceLocal: storedData =>
                resolveToolbarVisibility({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizeToolbarVisibilitySetting(params.getSettings().toolbarVisibility)
        }),
        useFloatingToolbars: createResolvedLocalStorageSettingEntry({
            settingId: 'useFloatingToolbars',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.useFloatingToolbarsKey,
            resolveDeviceLocal: () => {
                const storedLocal = localStorage.get<unknown>(params.keys.useFloatingToolbarsKey);
                const resolved = params.sanitizeBooleanSetting(storedLocal, params.defaultSettings.useFloatingToolbars);
                setLocalStorage(params.keys.useFloatingToolbarsKey, resolved);
                return { value: resolved, migrated: false };
            },
            sanitizeSynced: () =>
                params.sanitizeBooleanSetting(params.getSettings().useFloatingToolbars, params.defaultSettings.useFloatingToolbars)
        }),
        pinNavigationBanner: createResolvedLocalStorageSettingEntry({
            settingId: 'pinNavigationBanner',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.pinNavigationBannerKey,
            resolveDeviceLocal: storedData =>
                resolvePinNavigationBanner({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () =>
                params.sanitizeBooleanSetting(params.getSettings().pinNavigationBanner, params.defaultSettings.pinNavigationBanner)
        }),
        navIndent: createResolvedLocalStorageSettingEntry({
            settingId: 'navIndent',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.navIndentKey,
            resolveDeviceLocal: storedData => resolveNavIndent({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizeNavIndentSetting(params.getSettings().navIndent)
        }),
        navItemHeight: createResolvedLocalStorageSettingEntry({
            settingId: 'navItemHeight',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.navItemHeightKey,
            resolveDeviceLocal: storedData =>
                resolveNavItemHeight({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizeNavItemHeightSetting(params.getSettings().navItemHeight)
        }),
        navItemHeightScaleText: createResolvedLocalStorageSettingEntry({
            settingId: 'navItemHeightScaleText',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.navItemHeightScaleTextKey,
            resolveDeviceLocal: storedData =>
                resolveNavItemHeightScaleText({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () =>
                params.sanitizeBooleanSetting(params.getSettings().navItemHeightScaleText, params.defaultSettings.navItemHeightScaleText)
        }),
        calendarPlacement: createResolvedLocalStorageSettingEntry({
            settingId: 'calendarPlacement',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.calendarPlacementKey,
            resolveDeviceLocal: storedData =>
                resolveCalendarPlacement({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizeCalendarPlacementSetting(params.getSettings().calendarPlacement)
        }),
        calendarLeftPlacement: createResolvedLocalStorageSettingEntry({
            settingId: 'calendarLeftPlacement',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.calendarLeftPlacementKey,
            resolveDeviceLocal: storedData =>
                resolveCalendarLeftPlacement({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizeCalendarLeftPlacementSetting(params.getSettings().calendarLeftPlacement)
        }),
        calendarWeeksToShow: createResolvedLocalStorageSettingEntry({
            settingId: 'calendarWeeksToShow',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.calendarWeeksToShowKey,
            resolveDeviceLocal: storedData =>
                resolveCalendarWeeksToShow({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizeCalendarWeeksToShowSetting(params.getSettings().calendarWeeksToShow)
        }),
        compactItemHeight: createResolvedLocalStorageSettingEntry({
            settingId: 'compactItemHeight',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.compactItemHeightKey,
            resolveDeviceLocal: storedData =>
                resolveCompactItemHeight({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () => params.sanitizeCompactItemHeightSetting(params.getSettings().compactItemHeight)
        }),
        compactItemHeightScaleText: createResolvedLocalStorageSettingEntry({
            settingId: 'compactItemHeightScaleText',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.compactItemHeightScaleTextKey,
            resolveDeviceLocal: storedData =>
                resolveCompactItemHeightScaleText({ storedData, keys: params.keys, defaultSettings: params.defaultSettings }),
            sanitizeSynced: () =>
                params.sanitizeBooleanSetting(
                    params.getSettings().compactItemHeightScaleText,
                    params.defaultSettings.compactItemHeightScaleText
                )
        }),
        featureImageSize: createResolvedLocalStorageSettingEntry({
            settingId: 'featureImageSize',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.featureImageSizeKey,
            resolveDeviceLocal: () => {
                const storedLocal = localStorage.get<unknown>(params.keys.featureImageSizeKey);
                const resolved = params.sanitizeFeatureImageSizeSetting(storedLocal);
                setLocalStorage(params.keys.featureImageSizeKey, resolved);
                return { value: resolved, migrated: false };
            },
            sanitizeSynced: () => params.sanitizeFeatureImageSizeSetting(params.getSettings().featureImageSize)
        }),
        featureImagePixelSize: createResolvedLocalStorageSettingEntry({
            settingId: 'featureImagePixelSize',
            loadPhase: 'preProfiles',
            localStorageKey: params.keys.featureImagePixelSizeKey,
            resolveDeviceLocal: () => {
                const storedLocal = localStorage.get<unknown>(params.keys.featureImagePixelSizeKey);
                const resolved = params.sanitizeFeatureImagePixelSizeSetting(storedLocal);
                setLocalStorage(params.keys.featureImagePixelSizeKey, resolved);
                return { value: resolved, migrated: false };
            },
            sanitizeSynced: () => params.sanitizeFeatureImagePixelSizeSetting(params.getSettings().featureImagePixelSize)
        }),
        uiScale: createEntry({
            persistedKeys: ['desktopScale', 'mobileScale'],
            loadPhase: 'preProfiles',
            cleanupOnLoad: false,
            hasPersistedValue: () => false,
            deleteFromPersisted: (persisted: Record<string, unknown>) => {
                if (!params.getShouldPersistDesktopScale()) {
                    delete persisted['desktopScale'];
                }
                if (!params.getShouldPersistMobileScale()) {
                    delete persisted['mobileScale'];
                }
            },
            resolveOnLoad: ({ storedData, preferRecordValue }) => {
                const isLocal = params.isLocal('uiScale');
                const settings = params.getSettings();
                if (isLocal && !preferRecordValue) {
                    const migratedScales = migrateUIScales({
                        settings,
                        storedData,
                        keys: params.keys,
                        shouldPersistDesktopScale: params.getShouldPersistDesktopScale(),
                        shouldPersistMobileScale: params.getShouldPersistMobileScale()
                    });
                    params.setShouldPersistDesktopScale(migratedScales.shouldPersistDesktopScale);
                    params.setShouldPersistMobileScale(migratedScales.shouldPersistMobileScale);
                    return { migrated: migratedScales.migrated };
                }

                settings.desktopScale = sanitizeUIScale(settings.desktopScale);
                settings.mobileScale = sanitizeUIScale(settings.mobileScale);
                const currentScale = sanitizeUIScale(Platform.isMobile ? settings.mobileScale : settings.desktopScale);
                setLocalStorage(params.keys.uiScaleKey, currentScale);
                return { migrated: false };
            },
            mirrorToLocalStorage: () => {
                const settings = params.getSettings();
                const next = sanitizeUIScale(Platform.isMobile ? settings.mobileScale : settings.desktopScale);
                setLocalStorage(params.keys.uiScaleKey, next);
            }
        })
    };
}
