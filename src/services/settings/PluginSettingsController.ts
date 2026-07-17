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

import { DEFAULT_SETTINGS } from '../../settings/defaultSettings';
import { migrateRecentColors, migrateReleaseCheckState } from '../../settings/migrations/localPreferences';
import { migrateMomentDateFormats } from '../../settings/migrations/momentFormats';
import {
    applyExistingUserDefaults,
    applyLegacyPropertyFieldsMigration,
    applyLegacyPeriodicNotesFolderMigration,
    applyLegacyShortcutsMigration,
    applyLegacyVisibilityMigration,
    extractLegacyPropertyFields,
    extractLegacyPeriodicNotesFolder,
    extractLegacyShortcuts,
    extractLegacyVisibilitySettings,
    migrateFolderNoteTemplateSetting,
    migrateLegacySyncedSettings,
    migrateSearchShortcutNegationSyntax
} from '../../settings/migrations/syncedSettings';
import {
    type AlphaSortOrder,
    type CalendarLeftPlacement,
    type CalendarPlacement,
    type CalendarWeeksToShow,
    type HomepageSetting,
    type ListSortOverrideValue,
    NARROW_SIDEBAR_CUSTOM_WIDTH_MAX,
    NARROW_SIDEBAR_CUSTOM_WIDTH_MIN,
    SYNC_MODE_SETTING_IDS,
    type SettingSyncMode,
    type SyncModeSettingId,
    type TagSortOrder,
    type VaultProfile,
    isAlphaSortOrder,
    isCalendarMonthHeadingFormat,
    isCalendarLeftPlacement,
    isCalendarPeriodicNotesLocaleSource,
    isCalendarPlacement,
    isCalendarWeekendDays,
    isEnterKeyAction,
    isFeatureImagePixelSizeSetting,
    isFeatureImageSizeSetting,
    isFolderNoteOpenLocation,
    isHomepageSource,
    isMouseBackForwardAction,
    isManualSortNewNotePlacement,
    isPropertySortSecondaryOption,
    isNarrowSidebarTriggerMode,
    normalizeNarrowSidebarLayout,
    isRecentNotesHideMode,
    isSettingSyncMode,
    isSortOption,
    isTagSortOrder,
    normalizeAppearanceGroupBy,
    normalizeListSortOverride,
    resolveDeleteAttachmentsSetting,
    type NotebookNavigatorSettings,
    resolveMoveFileConflictsSetting
} from '../../settings/types';
import { LOCALSTORAGE_VERSION, localStorage } from '../../utils/localStorage';
import { clearHiddenFileNameMatcherCache } from '../../utils/fileFilters';
import {
    normalizeCanonicalIconId,
    normalizeFileNameIconMapKey,
    normalizeFileTypeIconMapKey,
    normalizeIconMapRecord
} from '../../utils/iconizeFormat';
import { getDefaultDateFormat, getDefaultTimeFormat } from '../../i18n';
import {
    cloneCollapsedPinnedContextsRecord,
    clonePinnedNotesRecord,
    isBooleanRecordValue,
    isPlainObjectRecordValue,
    isStringRecordValue,
    sanitizeRecord
} from '../../utils/recordUtils';
import { clearHiddenTagPatternCache, normalizeTagPathValue } from '../../utils/tagPrefixMatcher';
import { ensureVaultProfiles, DEFAULT_VAULT_PROFILE_ID, clearHiddenFolderMatcherCache } from '../../utils/vaultProfiles';
import { getPathPatternCacheKey } from '../../utils/pathPatternMatcher';
import { normalizePropertyKeyNodeId, normalizePropertyNodeId } from '../../utils/propertyTree';
import { normalizeNavigationSeparatorKey } from '../../utils/navigationSeparators';
import { normalizeUXIconMapRecord } from '../../utils/uxIcons';
import { sanitizeKeyboardShortcuts } from '../../utils/keyboardShortcuts';
import { isPropertySortOption, pruneUnavailablePropertySortOverrides } from '../../utils/sortUtils';
import { isRecord } from '../../utils/typeGuards';
import { normalizeOptionalVaultFilePath } from '../../utils/pathUtils';
import { isFileTypeIconPreset } from '../../utils/fileTypeIconPresets';
import {
    MAX_PANE_TRANSITION_DURATION_MS,
    MIN_PANE_TRANSITION_DURATION_MS,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    STORAGE_KEYS,
    type LocalStorageKeys,
    type UXPreferences
} from '../../types';
import type { FolderAppearance } from '../../hooks/useListPaneAppearance';
import { createSyncModeRegistry, type SyncModeRegistry } from './syncModeRegistry';
import { getDefaultUXPreferences, isUXPreferencesRecord } from './uxPreferences';

interface PluginSettingsControllerOptions {
    keys: LocalStorageKeys;
    loadData: () => Promise<unknown>;
    saveData: (data: unknown) => Promise<void>;
    mirrorUXPreferences: (update: Partial<UXPreferences>) => void;
}

/**
 * Result of loading persisted settings.
 * - 'loaded': a stored settings record was read and applied
 * - 'missing': no settings file exists; current settings are kept
 * - 'unavailable': the settings file exists but could not be read or parsed; current settings are kept
 */
export type SettingsLoadResult = 'loaded' | 'missing' | 'unavailable';

/**
 * Result of the startup settings load.
 * - 'first-launch': the settings file stayed missing on a device without prior plugin state; defaults were applied
 * - 'loaded': a stored settings record was read and applied
 * - 'unavailable': the settings file could not be established; startup must abort without writing
 * - 'cancelled': plugin shutdown cancelled the retry before settings were established
 */
export type StartupSettingsLoadResult = 'first-launch' | 'loaded' | 'unavailable' | 'cancelled';

// Keep the startup grace period below Obsidian's slow-plugin warning while polling for a settings file from sync.
const STARTUP_SETTINGS_RETRY_ATTEMPTS = 4;
const STARTUP_SETTINGS_RETRY_DELAY_MS = 500;

function resolveTaskBackgroundColor(value: unknown, fallback: string): string {
    if (typeof value !== 'string') {
        return fallback;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return fallback;
    }

    return trimmed;
}

const LEGACY_LOCAL_SYNC_MODE_SETTING_IDS = new Set<SyncModeSettingId>([
    'vaultProfile',
    'tagSortOrder',
    'includeDescendantNotes',
    'dualPane',
    'dualPaneOrientation',
    'paneTransitionDuration',
    'toolbarVisibility',
    'navIndent',
    'navItemHeight',
    'navItemHeightScaleText',
    'calendarWeeksToShow',
    'compactItemHeight',
    'compactItemHeightScaleText',
    'uiScale'
]);

function hasLegacyNoneGroupingInAppearanceMap(value: unknown): boolean {
    if (!isRecord(value)) {
        return false;
    }

    return Object.values(value).some(appearance => isRecord(appearance) && appearance.groupBy === 'none');
}

function containsLegacyNoneGroupingInStoredData(storedData: Record<string, unknown> | null): boolean {
    if (!storedData) {
        return false;
    }

    return (
        storedData.noteGrouping === 'none' ||
        hasLegacyNoneGroupingInAppearanceMap(storedData.folderAppearances) ||
        hasLegacyNoneGroupingInAppearanceMap(storedData.tagAppearances) ||
        hasLegacyNoneGroupingInAppearanceMap(storedData.propertyAppearances)
    );
}

export class PluginSettingsController {
    private currentSettings: NotebookNavigatorSettings = structuredClone(DEFAULT_SETTINGS);
    private syncModeRegistry: SyncModeRegistry | null = null;
    private shouldPersistDesktopScale = false;
    private shouldPersistMobileScale = false;
    private hiddenFolderCacheKey: string | null = null;
    private hiddenTagCacheKey: string | null = null;
    private hiddenFileNamesCacheKey: string | null = null;
    private readonly options: PluginSettingsControllerOptions;

    constructor(options: PluginSettingsControllerOptions) {
        this.options = options;
    }

    public get settings(): NotebookNavigatorSettings {
        return this.currentSettings;
    }

    public set settings(settings: NotebookNavigatorSettings) {
        this.currentSettings = settings;
    }

    public getSyncMode(settingId: SyncModeSettingId): SettingSyncMode {
        return this.currentSettings.syncModes?.[settingId] === 'local' ? 'local' : 'synced';
    }

    public isLocal(settingId: SyncModeSettingId): boolean {
        return this.getSyncMode(settingId) === 'local';
    }

    public isSynced(settingId: SyncModeSettingId): boolean {
        return this.getSyncMode(settingId) === 'synced';
    }

    public async setSyncMode(settingId: SyncModeSettingId, mode: SettingSyncMode): Promise<boolean> {
        const nextMode: SettingSyncMode = mode === 'local' ? 'local' : 'synced';
        const currentMode = this.getSyncMode(settingId);
        if (currentMode === nextMode) {
            return false;
        }

        if (nextMode === 'local') {
            this.seedLocalValue(settingId);
        }

        const next = sanitizeRecord<SettingSyncMode>(this.currentSettings.syncModes, isSettingSyncMode);
        next[settingId] = nextMode;
        this.currentSettings.syncModes = next;
        return true;
    }

    public mirrorAllSyncModeSettingsToLocalStorage(): void {
        const registry = this.getSyncModeRegistry();
        SYNC_MODE_SETTING_IDS.forEach(settingId => {
            registry[settingId].mirrorToLocalStorage();
        });
    }

    public prepareImportedUiScalePersistence(): void {
        if (!this.isLocal('uiScale')) {
            return;
        }

        this.shouldPersistDesktopScale = true;
        this.shouldPersistMobileScale = true;
    }

    public clearAllLocalStorage(): void {
        const storageKeyNames = Object.keys(STORAGE_KEYS) as (keyof LocalStorageKeys)[];
        storageKeyNames.forEach(storageKey => {
            if (
                storageKey === 'databaseSchemaVersionKey' ||
                storageKey === 'databaseContentVersionKey' ||
                storageKey === 'debugLoggingEnabledKey'
            ) {
                return;
            }

            const key = STORAGE_KEYS[storageKey];
            localStorage.remove(key);
        });
    }

    public async loadSettings(): Promise<SettingsLoadResult>;
    public async loadSettings(signal: AbortSignal): Promise<SettingsLoadResult | 'cancelled'>;
    public async loadSettings(signal?: AbortSignal): Promise<SettingsLoadResult | 'cancelled'> {
        if (signal?.aborted) {
            return 'cancelled';
        }
        const rawData: unknown = await this.options.loadData();
        if (signal?.aborted) {
            return 'cancelled';
        }
        // Obsidian returns null when data.json does not exist (or contains the literal JSON text `null`) and undefined
        // when it exists but cannot be read or parsed. Neither result applies anything, so a transient sync failure
        // cannot reset current settings; loadSettingsAtStartup decides whether a missing file counts as a first launch.
        if (!isRecord(rawData)) {
            return rawData === null ? 'missing' : 'unavailable';
        }

        const needsPersistedCleanup = this.applySettingsRecord(rawData, { isFirstLaunch: false });
        if (needsPersistedCleanup) {
            if (signal?.aborted) {
                return 'cancelled';
            }
            await this.options.saveData(this.getPersistableSettings());
        }
        return signal?.aborted ? 'cancelled' : 'loaded';
    }

    /**
     * Runs the startup settings load with a bounded retry window.
     * A missing data.json is confirmed as a first launch only when this device has no persisted localStorage version
     * marker, no attempt observed an unreadable file, and the file stays missing through the retry window. Runtime
     * enablement uses the same grace period because sync can install the plugin before delivering data.json.
     * On 'first-launch' the default settings are applied through the settings pipeline without persisting; on
     * 'unavailable' nothing is applied or written.
     */
    public async loadSettingsAtStartup(options: {
        maxAttempts?: number;
        retryDelayMs?: number;
        signal?: AbortSignal;
    }): Promise<StartupSettingsLoadResult> {
        const maxAttempts = Math.max(1, options.maxAttempts ?? STARTUP_SETTINGS_RETRY_ATTEMPTS);
        const retryDelayMs = options.retryDelayMs ?? STARTUP_SETTINGS_RETRY_DELAY_MS;
        const storedVersion = this.getStoredLocalStorageVersion();
        const hasRunOnDevice = storedVersion !== null && storedVersion !== undefined;
        let sawUnavailable = false;
        let lastResult: SettingsLoadResult = 'missing';

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (options.signal?.aborted) {
                return 'cancelled';
            }
            if (attempt > 0) {
                const completedDelay = await this.waitForRetry(retryDelayMs, options.signal);
                if (!completedDelay) {
                    return 'cancelled';
                }
            }

            const attemptResult = options.signal ? await this.loadSettings(options.signal) : await this.loadSettings();
            if (attemptResult === 'cancelled') {
                return 'cancelled';
            }
            lastResult = attemptResult;
            if (lastResult === 'loaded') {
                return 'loaded';
            }
            if (lastResult === 'unavailable') {
                sawUnavailable = true;
                continue;
            }
        }

        if (lastResult === 'missing' && !hasRunOnDevice && !sawUnavailable) {
            this.applySettingsRecord(null, { isFirstLaunch: true });
            return 'first-launch';
        }

        return 'unavailable';
    }

    private async waitForRetry(delayMs: number, signal?: AbortSignal): Promise<boolean> {
        if (signal?.aborted) {
            return false;
        }
        if (typeof window === 'undefined' || delayMs <= 0) {
            return true;
        }
        return await new Promise<boolean>(resolve => {
            const complete = (completedDelay: boolean) => {
                signal?.removeEventListener('abort', onAbort);
                resolve(completedDelay);
            };
            const timeoutId = window.setTimeout(() => complete(true), delayMs);
            const onAbort = () => {
                window.clearTimeout(timeoutId);
                complete(false);
            };
            signal?.addEventListener('abort', onAbort, { once: true });
        });
    }

    /**
     * Applies a raw settings record through the full normalization and migration pipeline without persisting.
     * Pass null with isFirstLaunch to build default settings for a fresh installation. Returns whether legacy
     * migrations require the cleaned-up settings to be written back to data.json.
     */
    public applySettingsRecord(
        storedData: Record<string, unknown> | null,
        options: { isFirstLaunch: boolean; preferRecordLocalValues?: boolean }
    ): boolean {
        const { isFirstLaunch } = options;
        const preferRecordValue = options.preferRecordLocalValues ?? false;
        const hadLegacyPropertyFieldsInStoredData = Boolean(
            storedData && Object.prototype.hasOwnProperty.call(storedData, 'propertyFields')
        );
        const hadLegacyHomepageSettingsInStoredData = Boolean(
            storedData &&
            (typeof storedData['homepage'] === 'string' ||
                Object.prototype.hasOwnProperty.call(storedData, 'mobileHomepage') ||
                Object.prototype.hasOwnProperty.call(storedData, 'useMobileHomepage'))
        );
        const hadLegacyFolderColorTitleSettingInStoredData = Boolean(
            storedData && Object.prototype.hasOwnProperty.call(storedData, 'useFolderColorForFileTitles')
        );
        const hadShowPinnedIconInStoredData = Boolean(storedData && Object.prototype.hasOwnProperty.call(storedData, 'showPinnedIcon'));
        const hadShowPinnedGroupHeaderInStoredData = Boolean(
            storedData && Object.prototype.hasOwnProperty.call(storedData, 'showPinnedGroupHeader')
        );
        const hadShowParentFolderFullPathInStoredData = Boolean(
            storedData && Object.prototype.hasOwnProperty.call(storedData, 'showParentFolderFullPath')
        );
        const storedInterfaceIcons = storedData?.['interfaceIcons'];
        const hadPinnedSectionIconInStoredData = Boolean(
            isRecord(storedInterfaceIcons) && Object.prototype.hasOwnProperty.call(storedInterfaceIcons, 'pinned-section')
        );
        const hadInvalidPropertySortKeyInStoredData = Boolean(
            storedData &&
            Object.prototype.hasOwnProperty.call(storedData, 'propertySortKey') &&
            typeof storedData['propertySortKey'] !== 'string'
        );
        const hadInvalidManualSortPropertyKeyInStoredData = Boolean(
            storedData &&
            Object.prototype.hasOwnProperty.call(storedData, 'manualSortPropertyKey') &&
            typeof storedData['manualSortPropertyKey'] !== 'string'
        );
        const hadUnavailableDefaultFolderSortInStoredData = Boolean(
            storedData &&
            Object.prototype.hasOwnProperty.call(storedData, 'defaultFolderSort') &&
            (!isSortOption(storedData['defaultFolderSort']) || isPropertySortOption(storedData['defaultFolderSort']))
        );
        const hadLegacyNoneGroupingInStoredData = containsLegacyNoneGroupingInStoredData(storedData);
        const hadLegacyOpenFolderNotesInNewTabInStoredData = Boolean(
            storedData && Object.prototype.hasOwnProperty.call(storedData, 'openFolderNotesInNewTab')
        );
        const hadInvalidShiftEnterOpenContextInStoredData = Boolean(
            storedData &&
            Object.prototype.hasOwnProperty.call(storedData, 'shiftEnterOpenContext') &&
            !isEnterKeyAction(storedData['shiftEnterOpenContext'])
        );
        const hadInvalidCmdCtrlEnterOpenContextInStoredData = Boolean(
            storedData &&
            Object.prototype.hasOwnProperty.call(storedData, 'cmdCtrlEnterOpenContext') &&
            !isEnterKeyAction(storedData['cmdCtrlEnterOpenContext'])
        );
        const storedSettings = storedData as Partial<NotebookNavigatorSettings> | null;
        this.shouldPersistDesktopScale = Boolean(storedData && 'desktopScale' in storedData);
        this.shouldPersistMobileScale = Boolean(storedData && 'mobileScale' in storedData);

        // Deep-clone the defaults so later in-place normalization (e.g. ensureVaultProfiles) cannot mutate DEFAULT_SETTINGS
        // through nested references when stored data omits a key.
        this.currentSettings = { ...structuredClone(DEFAULT_SETTINGS), ...(storedSettings ?? {}) };
        const hadLegacySearchProviderInSettings = Boolean(storedData && 'searchProvider' in storedData);
        const hadLegacyLastAnnouncedReleaseInSettings = Boolean(storedData && 'lastAnnouncedRelease' in storedData);
        const storedSearchProvider = localStorage.get<unknown>(this.options.keys.searchProviderKey);
        if (storedSearchProvider === 'internal' || storedSearchProvider === 'omnisearch') {
            this.currentSettings.searchProvider = storedSearchProvider;
        } else {
            this.currentSettings.searchProvider = 'internal';
            localStorage.set(this.options.keys.searchProviderKey, 'internal');
        }

        const settingsRecord = this.currentSettings as unknown as Record<string, unknown>;
        delete settingsRecord['showCalendar'];
        delete settingsRecord['calendarCustomPromptForTitle'];
        delete settingsRecord['saveMetadataToFrontmatter'];
        delete settingsRecord['lastAnnouncedRelease'];
        delete settingsRecord['optimizeNoteHeight'];

        if (!isFolderNoteOpenLocation(storedData?.['folderNoteOpenLocation'])) {
            this.currentSettings.folderNoteOpenLocation =
                storedData?.['openFolderNotesInNewTab'] === true ? 'new-tab' : DEFAULT_SETTINGS.folderNoteOpenLocation;
        }
        delete settingsRecord['openFolderNotesInNewTab'];

        if (typeof this.currentSettings.propertySortKey !== 'string') {
            this.currentSettings.propertySortKey = DEFAULT_SETTINGS.propertySortKey;
        }

        if (typeof this.currentSettings.manualSortPropertyKey !== 'string') {
            this.currentSettings.manualSortPropertyKey = DEFAULT_SETTINGS.manualSortPropertyKey;
        }

        if (!isSortOption(this.currentSettings.defaultFolderSort) || isPropertySortOption(this.currentSettings.defaultFolderSort)) {
            this.currentSettings.defaultFolderSort = DEFAULT_SETTINGS.defaultFolderSort;
        }

        if (typeof this.currentSettings.manualSortGroupHeaderProperty !== 'string') {
            this.currentSettings.manualSortGroupHeaderProperty = DEFAULT_SETTINGS.manualSortGroupHeaderProperty;
        }

        this.currentSettings.keyboardShortcuts = sanitizeKeyboardShortcuts(this.currentSettings.keyboardShortcuts);
        if (!isEnterKeyAction(this.currentSettings.shiftEnterOpenContext)) {
            this.currentSettings.shiftEnterOpenContext = DEFAULT_SETTINGS.shiftEnterOpenContext;
        }
        if (!isEnterKeyAction(this.currentSettings.cmdCtrlEnterOpenContext)) {
            this.currentSettings.cmdCtrlEnterOpenContext = DEFAULT_SETTINGS.cmdCtrlEnterOpenContext;
        }
        this.normalizeSyncModes({ storedData, isFirstLaunch });
        const syncModeRegistry = this.getSyncModeRegistry();

        migrateLegacySyncedSettings({
            settings: this.currentSettings,
            storedData,
            keys: this.options.keys,
            defaultSettings: DEFAULT_SETTINGS
        });

        this.sanitizeSettingsRecords();
        const prunedUnavailablePropertySortOverrides = pruneUnavailablePropertySortOverrides(this.currentSettings);

        const migratedMomentFormats = migrateMomentDateFormats({
            settings: this.currentSettings,
            defaultDateFormat: getDefaultDateFormat(),
            defaultTimeFormat: getDefaultTimeFormat(),
            defaultSettings: DEFAULT_SETTINGS
        });

        if (!this.currentSettings.dateFormat) {
            this.currentSettings.dateFormat = getDefaultDateFormat();
        }
        if (!this.currentSettings.timeFormat) {
            this.currentSettings.timeFormat = getDefaultTimeFormat();
        }

        if (typeof this.currentSettings.recentNotesCount !== 'number' || this.currentSettings.recentNotesCount <= 0) {
            this.currentSettings.recentNotesCount = DEFAULT_SETTINGS.recentNotesCount;
        }

        if (!isRecentNotesHideMode(this.currentSettings.hideRecentNotes)) {
            this.currentSettings.hideRecentNotes = DEFAULT_SETTINGS.hideRecentNotes;
        }

        this.currentSettings.calendarEnabled = this.sanitizeBooleanSetting(
            this.currentSettings.calendarEnabled,
            DEFAULT_SETTINGS.calendarEnabled
        );

        if (!isPropertySortSecondaryOption(this.currentSettings.propertySortSecondary)) {
            this.currentSettings.propertySortSecondary = DEFAULT_SETTINGS.propertySortSecondary;
        }

        if (!isManualSortNewNotePlacement(this.currentSettings.manualSortNewNotePlacement)) {
            this.currentSettings.manualSortNewNotePlacement = DEFAULT_SETTINGS.manualSortNewNotePlacement;
        }

        if (!isCalendarWeekendDays(this.currentSettings.calendarWeekendDays)) {
            this.currentSettings.calendarWeekendDays = DEFAULT_SETTINGS.calendarWeekendDays;
        }

        if (!isCalendarMonthHeadingFormat(this.currentSettings.calendarMonthHeadingFormat)) {
            this.currentSettings.calendarMonthHeadingFormat = DEFAULT_SETTINGS.calendarMonthHeadingFormat;
        }

        if (!isCalendarPeriodicNotesLocaleSource(this.currentSettings.calendarPeriodicNotesLocaleSource)) {
            this.currentSettings.calendarPeriodicNotesLocaleSource = DEFAULT_SETTINGS.calendarPeriodicNotesLocaleSource;
        }

        if (!isFeatureImageSizeSetting(this.currentSettings.featureImageSize)) {
            this.currentSettings.featureImageSize = DEFAULT_SETTINGS.featureImageSize;
        }

        if (!isFeatureImagePixelSizeSetting(this.currentSettings.featureImagePixelSize)) {
            this.currentSettings.featureImagePixelSize = DEFAULT_SETTINGS.featureImagePixelSize;
        }

        if (!isMouseBackForwardAction(this.currentSettings.mouseBackForwardAction)) {
            this.currentSettings.mouseBackForwardAction = DEFAULT_SETTINGS.mouseBackForwardAction;
        }

        if (!isAlphaSortOrder(this.currentSettings.folderSortOrder)) {
            this.currentSettings.folderSortOrder = DEFAULT_SETTINGS.folderSortOrder;
        }

        this.currentSettings.deleteAttachments = resolveDeleteAttachmentsSetting(
            this.currentSettings.deleteAttachments,
            DEFAULT_SETTINGS.deleteAttachments
        );

        this.currentSettings.moveFileConflicts = resolveMoveFileConflictsSetting(
            this.currentSettings.moveFileConflicts,
            DEFAULT_SETTINGS.moveFileConflicts
        );

        let uiScaleMigrated = false;
        SYNC_MODE_SETTING_IDS.forEach(settingId => {
            const entry = syncModeRegistry[settingId];
            if (entry.loadPhase !== 'preProfiles') {
                return;
            }

            const result = entry.resolveOnLoad({ storedData, preferRecordValue });
            if (settingId === 'uiScale') {
                uiScaleMigrated = result.migrated;
            }
        });

        if (!Array.isArray(this.currentSettings.rootFolderOrder)) {
            this.currentSettings.rootFolderOrder = [];
        }

        if (!Array.isArray(this.currentSettings.rootTagOrder)) {
            this.currentSettings.rootTagOrder = [];
        }

        if (!Array.isArray(this.currentSettings.rootPropertyOrder)) {
            this.currentSettings.rootPropertyOrder = [];
        }

        const migratedReleaseState = migrateReleaseCheckState({
            settings: this.currentSettings,
            storedData,
            keys: this.options.keys
        });
        const migratedRecentColors = migrateRecentColors({ settings: this.currentSettings, storedData, keys: this.options.keys });
        const hadLocalValuesInSettings = Boolean(
            storedData &&
            SYNC_MODE_SETTING_IDS.some(settingId => {
                const entry = syncModeRegistry[settingId];
                if (!entry.cleanupOnLoad) {
                    return false;
                }
                if (!this.isLocal(settingId)) {
                    return false;
                }
                return entry.hasPersistedValue(storedData);
            })
        );

        migrateFolderNoteTemplateSetting({ settings: this.currentSettings, defaultSettings: DEFAULT_SETTINGS });
        applyExistingUserDefaults({ settings: this.currentSettings });

        const legacyVisibility = extractLegacyVisibilitySettings({ settings: this.currentSettings, storedData });
        const legacyPropertyFields = extractLegacyPropertyFields({ settings: this.currentSettings, storedData });
        const legacyShortcuts = extractLegacyShortcuts({ storedData });
        const legacyPeriodicNotesFolder = extractLegacyPeriodicNotesFolder({ settings: this.currentSettings });

        ensureVaultProfiles(this.currentSettings);
        applyLegacyPeriodicNotesFolderMigration({ settings: this.currentSettings, legacyPeriodicNotesFolder });
        applyLegacyVisibilityMigration({ settings: this.currentSettings, migration: legacyVisibility });
        applyLegacyPropertyFieldsMigration({ settings: this.currentSettings, legacyPropertyFields });
        applyLegacyShortcutsMigration({ settings: this.currentSettings, legacyShortcuts });
        const migratedShortcutNegationSyntax = migrateSearchShortcutNegationSyntax({ settings: this.currentSettings });
        this.normalizeIconSettings();
        this.normalizeTaskSettings();
        this.normalizeFileIconMapSettings();
        this.normalizeInterfaceIconsSettings();
        syncModeRegistry.vaultProfile.resolveOnLoad({ storedData, preferRecordValue });
        this.normalizeTagSettings();
        this.normalizePropertySettings();
        this.normalizeNavigationSeparatorSettings();
        this.refreshMatcherCachesIfNeeded();

        const needsPersistedCleanup =
            migratedReleaseState ||
            migratedRecentColors ||
            hadLocalValuesInSettings ||
            hadLegacySearchProviderInSettings ||
            hadLegacyLastAnnouncedReleaseInSettings ||
            hadLegacyPropertyFieldsInStoredData ||
            hadLegacyHomepageSettingsInStoredData ||
            hadLegacyFolderColorTitleSettingInStoredData ||
            hadShowPinnedIconInStoredData ||
            hadShowPinnedGroupHeaderInStoredData ||
            hadShowParentFolderFullPathInStoredData ||
            hadPinnedSectionIconInStoredData ||
            hadInvalidPropertySortKeyInStoredData ||
            hadInvalidManualSortPropertyKeyInStoredData ||
            hadUnavailableDefaultFolderSortInStoredData ||
            hadLegacyNoneGroupingInStoredData ||
            hadLegacyOpenFolderNotesInNewTabInStoredData ||
            hadInvalidShiftEnterOpenContextInStoredData ||
            hadInvalidCmdCtrlEnterOpenContextInStoredData ||
            prunedUnavailablePropertySortOverrides ||
            uiScaleMigrated ||
            migratedMomentFormats ||
            migratedShortcutNegationSyntax;

        return needsPersistedCleanup;
    }

    public normalizeTagSettings(): void {
        const normalizeRecord = <T>(record: Record<string, T> | undefined): Record<string, T> => {
            if (!record) {
                return Object.create(null) as Record<string, T>;
            }

            const normalized = Object.create(null) as Record<string, T>;
            const sanitized = sanitizeRecord(record);
            for (const [key, value] of Object.entries(sanitized)) {
                const canonicalKey = normalizeTagPathValue(key);
                if (!canonicalKey) {
                    continue;
                }
                normalized[canonicalKey] = value;
            }
            return normalized;
        };

        const normalizeArray = (array: string[] | undefined): string[] => {
            if (!array) {
                return [];
            }

            return [...new Set(array.map(value => normalizeTagPathValue(value)).filter(value => value.length > 0))];
        };

        if (this.currentSettings.tagColors) {
            this.currentSettings.tagColors = normalizeRecord(this.currentSettings.tagColors);
        }

        if (this.currentSettings.tagBackgroundColors) {
            this.currentSettings.tagBackgroundColors = normalizeRecord(this.currentSettings.tagBackgroundColors);
        }

        if (this.currentSettings.tagIcons) {
            this.currentSettings.tagIcons = normalizeRecord(this.currentSettings.tagIcons);
        }

        if (this.currentSettings.tagSortOverrides) {
            this.currentSettings.tagSortOverrides = normalizeRecord(this.currentSettings.tagSortOverrides);
        }

        if (this.currentSettings.tagTreeSortOverrides) {
            this.currentSettings.tagTreeSortOverrides = normalizeRecord(this.currentSettings.tagTreeSortOverrides);
        }

        if (this.currentSettings.tagAppearances) {
            this.currentSettings.tagAppearances = normalizeRecord(this.currentSettings.tagAppearances);
        }

        if (Array.isArray(this.currentSettings.vaultProfiles)) {
            this.currentSettings.vaultProfiles.forEach(profile => {
                profile.hiddenTags = normalizeArray(profile.hiddenTags);
                profile.hiddenFileTags = normalizeArray(profile.hiddenFileTags);
            });
        }
    }

    public normalizePropertySettings(): void {
        const normalizePropertyNodeRecord = <T>(record: Record<string, T> | undefined): Record<string, T> => {
            if (!record) {
                return Object.create(null) as Record<string, T>;
            }

            const normalized = Object.create(null) as Record<string, T>;
            const sanitized = sanitizeRecord(record);
            for (const [key, value] of Object.entries(sanitized)) {
                const normalizedKey =
                    key === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID ? PROPERTIES_ROOT_VIRTUAL_FOLDER_ID : normalizePropertyNodeId(key);
                if (!normalizedKey) {
                    continue;
                }
                normalized[normalizedKey] = value;
            }
            return normalized;
        };

        const normalizePropertyKeyRecord = <T>(record: Record<string, T> | undefined): Record<string, T> => {
            if (!record) {
                return Object.create(null) as Record<string, T>;
            }

            const normalized = Object.create(null) as Record<string, T>;
            const sanitized = sanitizeRecord(record);
            for (const [key, value] of Object.entries(sanitized)) {
                const normalizedKey = normalizePropertyKeyNodeId(key);
                if (!normalizedKey) {
                    continue;
                }
                normalized[normalizedKey] = value;
            }
            return normalized;
        };

        if (this.currentSettings.propertyColors) {
            this.currentSettings.propertyColors = normalizePropertyNodeRecord(this.currentSettings.propertyColors);
        }

        if (this.currentSettings.propertyBackgroundColors) {
            this.currentSettings.propertyBackgroundColors = normalizePropertyNodeRecord(this.currentSettings.propertyBackgroundColors);
        }

        if (this.currentSettings.propertyIcons) {
            this.currentSettings.propertyIcons = normalizePropertyNodeRecord(this.currentSettings.propertyIcons);
        }

        if (this.currentSettings.propertySortOverrides) {
            this.currentSettings.propertySortOverrides = normalizePropertyNodeRecord(this.currentSettings.propertySortOverrides);
        }

        if (this.currentSettings.propertyTreeSortOverrides) {
            this.currentSettings.propertyTreeSortOverrides = normalizePropertyKeyRecord(this.currentSettings.propertyTreeSortOverrides);
        }

        if (this.currentSettings.propertyAppearances) {
            this.currentSettings.propertyAppearances = normalizePropertyNodeRecord(this.currentSettings.propertyAppearances);
        }
    }

    public normalizeNavigationSeparatorSettings(): void {
        const normalized = Object.create(null) as Record<string, boolean>;
        const sanitized = sanitizeRecord(this.currentSettings.navigationSeparators, isBooleanRecordValue);

        for (const [key, value] of Object.entries(sanitized)) {
            const normalizedKey = normalizeNavigationSeparatorKey(key);
            if (!normalizedKey) {
                continue;
            }

            normalized[normalizedKey] = value;
        }

        this.currentSettings.navigationSeparators = normalized;
    }

    public async saveSettings(): Promise<void> {
        ensureVaultProfiles(this.currentSettings);
        this.refreshMatcherCachesIfNeeded();
        localStorage.set(this.options.keys.homepageKey, this.currentSettings.homepage);
        await this.options.saveData(this.getPersistableSettings());
    }

    public getPersistableSettings(): NotebookNavigatorSettings {
        const rest = { ...this.currentSettings } as Record<string, unknown>;
        this.removeNonPersistableSettings(rest);

        const syncModeRegistry = this.getSyncModeRegistry();
        SYNC_MODE_SETTING_IDS.forEach(settingId => {
            if (!this.isLocal(settingId)) {
                return;
            }

            syncModeRegistry[settingId].deleteFromPersisted(rest);
        });

        return rest as unknown as NotebookNavigatorSettings;
    }

    /** Returns the first-launch defaults in their data.json representation without mutating settings or localStorage. */
    public getPersistableDefaultSettings(): NotebookNavigatorSettings {
        const defaults = structuredClone(DEFAULT_SETTINGS);
        // Normalize the cloned defaults the same way the first-launch pipeline does before persisting.
        ensureVaultProfiles(defaults);
        const rest = defaults as unknown as Record<string, unknown>;
        this.removeNonPersistableSettings(rest);
        return rest as unknown as NotebookNavigatorSettings;
    }

    private removeNonPersistableSettings(rest: Record<string, unknown>): void {
        delete rest.hiddenTags;
        delete rest.fileVisibility;
        delete rest.recentColors;
        delete rest.lastReleaseCheckAt;
        delete rest.latestKnownRelease;
        delete rest.searchProvider;
        delete rest.showCalendar;
        delete rest.calendarCustomPromptForTitle;
        delete rest.saveMetadataToFrontmatter;
        delete rest.propertyFields;
        delete rest.notePropertyType;
        delete rest.optimizeNoteHeight;
        delete rest.showPinnedIcon;
        delete rest.showPinnedGroupHeader;
        delete rest.showWordCount;
        delete rest.wordCountPlacement;
        delete rest.wordCharacterCountDisplay;
        delete rest.characterCountMode;
    }

    public refreshMatcherCachesIfNeeded(): void {
        const folderKey = `${this.buildPatternCacheKey(profile => profile.hiddenFolders)}\u0003${this.buildPatternCacheKey(
            profile => profile.descendantExcludedFolders
        )}`;
        const hiddenTagKey = this.buildPatternCacheKey(profile => profile.hiddenTags);
        const hiddenFileTagKey = this.buildPatternCacheKey(profile => profile.hiddenFileTags);
        const tagKey = `${hiddenTagKey}\u0003${hiddenFileTagKey}`;
        const fileNameKey = this.buildPatternCacheKey(profile => profile.hiddenFileNames);

        if (folderKey !== this.hiddenFolderCacheKey) {
            clearHiddenFolderMatcherCache();
            this.hiddenFolderCacheKey = folderKey;
        }

        if (tagKey !== this.hiddenTagCacheKey) {
            clearHiddenTagPatternCache();
            this.hiddenTagCacheKey = tagKey;
        }

        if (fileNameKey !== this.hiddenFileNamesCacheKey) {
            clearHiddenFileNameMatcherCache();
            this.hiddenFileNamesCacheKey = fileNameKey;
        }
    }

    public setLocalStorageVersion(): void {
        localStorage.set(STORAGE_KEYS.localStorageVersionKey, LOCALSTORAGE_VERSION);
    }

    public getStoredLocalStorageVersion(): unknown {
        return localStorage.get<unknown>(STORAGE_KEYS.localStorageVersionKey);
    }

    public getCurrentLocalStorageVersion(): number {
        return LOCALSTORAGE_VERSION;
    }

    private parseFiniteNumber(value: unknown): number | null {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
        return null;
    }

    private sanitizeBoundedIntegerSetting(value: unknown, params: { min: number; max: number; fallback: number }): number {
        const parsed = this.parseFiniteNumber(value);
        if (parsed === null) {
            return params.fallback;
        }

        const rounded = Math.round(parsed);
        if (rounded < params.min || rounded > params.max) {
            return params.fallback;
        }
        return rounded;
    }

    private sanitizeBooleanSetting(value: unknown, fallback: boolean): boolean {
        return typeof value === 'boolean' ? value : fallback;
    }

    private sanitizeHomepageSetting(value: unknown): HomepageSetting {
        if (typeof value !== 'object' || value === null) {
            return { ...DEFAULT_SETTINGS.homepage };
        }

        const record = value as Record<string, unknown>;
        const source = isHomepageSource(record.source) ? record.source : DEFAULT_SETTINGS.homepage.source;
        const file = normalizeOptionalVaultFilePath(typeof record.file === 'string' ? record.file : null);
        const createMissingPeriodicNote =
            typeof record.createMissingPeriodicNote === 'boolean'
                ? record.createMissingPeriodicNote
                : DEFAULT_SETTINGS.homepage.createMissingPeriodicNote;

        return {
            source,
            file,
            createMissingPeriodicNote
        };
    }

    private sanitizeDualPaneOrientationSetting(value: unknown) {
        const parsed = this.parseDualPaneOrientation(value);
        return parsed ?? DEFAULT_SETTINGS.dualPaneOrientation;
    }

    private sanitizeNarrowSidebarLayoutSetting(value: unknown) {
        return normalizeNarrowSidebarLayout(value) ?? DEFAULT_SETTINGS.narrowSidebarLayout;
    }

    private sanitizeNarrowSidebarTriggerModeSetting(value: unknown) {
        return isNarrowSidebarTriggerMode(value) ? value : DEFAULT_SETTINGS.narrowSidebarTriggerMode;
    }

    private sanitizeNarrowSidebarCustomWidthSetting(value: unknown): number {
        return this.sanitizeBoundedIntegerSetting(value, {
            min: NARROW_SIDEBAR_CUSTOM_WIDTH_MIN,
            max: NARROW_SIDEBAR_CUSTOM_WIDTH_MAX,
            fallback: DEFAULT_SETTINGS.narrowSidebarCustomWidth
        });
    }

    private sanitizePaneTransitionDurationSetting(value: unknown): number {
        return this.sanitizeBoundedIntegerSetting(value, {
            min: MIN_PANE_TRANSITION_DURATION_MS,
            max: MAX_PANE_TRANSITION_DURATION_MS,
            fallback: DEFAULT_SETTINGS.paneTransitionDuration
        });
    }

    private sanitizeNavIndentSetting(value: unknown): number {
        return this.sanitizeBoundedIntegerSetting(value, { min: 10, max: 24, fallback: DEFAULT_SETTINGS.navIndent });
    }

    private sanitizeNavItemHeightSetting(value: unknown): number {
        return this.sanitizeBoundedIntegerSetting(value, { min: 20, max: 28, fallback: DEFAULT_SETTINGS.navItemHeight });
    }

    private sanitizeCalendarPlacementSetting(value: unknown): CalendarPlacement {
        return isCalendarPlacement(value) ? value : DEFAULT_SETTINGS.calendarPlacement;
    }

    private sanitizeCalendarLeftPlacementSetting(value: unknown): CalendarLeftPlacement {
        return isCalendarLeftPlacement(value) ? value : DEFAULT_SETTINGS.calendarLeftPlacement;
    }

    private sanitizeCalendarWeeksToShowSetting(value: unknown): CalendarWeeksToShow {
        const parsed = this.parseFiniteNumber(value);
        if (parsed === null) {
            return DEFAULT_SETTINGS.calendarWeeksToShow;
        }

        const rounded = Math.round(parsed);
        if (rounded === 1 || rounded === 2 || rounded === 3 || rounded === 4 || rounded === 5 || rounded === 6) {
            return rounded;
        }
        return DEFAULT_SETTINGS.calendarWeeksToShow;
    }

    private sanitizeCompactItemHeightSetting(value: unknown): number {
        return this.sanitizeBoundedIntegerSetting(value, { min: 20, max: 28, fallback: DEFAULT_SETTINGS.compactItemHeight });
    }

    private sanitizeFeatureImageSizeSetting(value: unknown): NotebookNavigatorSettings['featureImageSize'] {
        return isFeatureImageSizeSetting(value) ? value : DEFAULT_SETTINGS.featureImageSize;
    }

    private sanitizeFeatureImagePixelSizeSetting(value: unknown): NotebookNavigatorSettings['featureImagePixelSize'] {
        return isFeatureImagePixelSizeSetting(value) ? value : DEFAULT_SETTINGS.featureImagePixelSize;
    }

    private sanitizeTagSortOrderSetting(value: unknown): TagSortOrder {
        return typeof value === 'string' && isTagSortOrder(value) ? value : DEFAULT_SETTINGS.tagSortOrder;
    }

    private sanitizeFolderSortOrderSetting(value: unknown): AlphaSortOrder {
        return typeof value === 'string' && isAlphaSortOrder(value) ? value : DEFAULT_SETTINGS.folderSortOrder;
    }

    private sanitizeVaultProfileId(candidate: unknown): string {
        const profiles = this.currentSettings.vaultProfiles;
        const match = typeof candidate === 'string' ? profiles.find(profile => profile.id === candidate) : null;
        if (match) {
            return match.id;
        }

        const defaultProfile = profiles.find(profile => profile.id === DEFAULT_VAULT_PROFILE_ID);
        if (defaultProfile) {
            return defaultProfile.id;
        }

        return profiles[0]?.id ?? DEFAULT_VAULT_PROFILE_ID;
    }

    private sanitizeToolbarVisibilitySetting(value: unknown): NotebookNavigatorSettings['toolbarVisibility'] {
        const defaults = DEFAULT_SETTINGS.toolbarVisibility;

        const mergeButtonVisibility = <T extends string>(
            defaultButtons: Record<T, boolean>,
            storedButtons: unknown
        ): Record<T, boolean> => {
            const next: Record<T, boolean> = { ...defaultButtons };
            if (!isPlainObjectRecordValue(storedButtons)) {
                return next;
            }

            (Object.keys(defaultButtons) as T[]).forEach(key => {
                const storedValue = storedButtons[key];
                if (typeof storedValue === 'boolean') {
                    next[key] = storedValue;
                }
            });
            return next;
        };

        if (!isPlainObjectRecordValue(value)) {
            return {
                navigation: { ...defaults.navigation },
                list: { ...defaults.list }
            };
        }

        return {
            navigation: mergeButtonVisibility(defaults.navigation, value.navigation),
            list: mergeButtonVisibility(defaults.list, value.list)
        };
    }

    private resolveActiveVaultProfileId(): string {
        const profiles = this.currentSettings.vaultProfiles;

        const findMatchingProfileId = (candidate: unknown): string | null => {
            if (typeof candidate !== 'string' || !candidate) {
                return null;
            }

            const match = profiles.find(profile => profile.id === candidate);
            return match ? match.id : null;
        };

        const storedLocal = localStorage.get<string>(this.options.keys.vaultProfileKey);
        const localMatch = findMatchingProfileId(storedLocal);
        if (localMatch) {
            return localMatch;
        }

        const defaultProfile = profiles.find(profile => profile.id === DEFAULT_VAULT_PROFILE_ID);
        if (defaultProfile) {
            return defaultProfile.id;
        }

        return profiles[0]?.id ?? DEFAULT_VAULT_PROFILE_ID;
    }

    private normalizeSyncModes(params: { storedData: Record<string, unknown> | null; isFirstLaunch: boolean }): void {
        const { storedData, isFirstLaunch } = params;
        const storedModes = storedData?.['syncModes'];
        const source = isPlainObjectRecordValue(storedModes) ? storedModes : null;

        const resolved = sanitizeRecord<SettingSyncMode>(undefined);
        SYNC_MODE_SETTING_IDS.forEach(settingId => {
            const defaultMode: SettingSyncMode = isFirstLaunch
                ? 'synced'
                : LEGACY_LOCAL_SYNC_MODE_SETTING_IDS.has(settingId)
                  ? 'local'
                  : 'synced';
            const value = source ? source[settingId] : undefined;
            resolved[settingId] = isSettingSyncMode(value) ? value : defaultMode;
        });

        this.currentSettings.syncModes = resolved;
    }

    private getSyncModeRegistry(): SyncModeRegistry {
        if (this.syncModeRegistry) {
            return this.syncModeRegistry;
        }

        this.syncModeRegistry = createSyncModeRegistry({
            keys: this.options.keys,
            defaultSettings: DEFAULT_SETTINGS,
            isLocal: settingId => this.isLocal(settingId),
            getSettings: () => this.currentSettings,
            resolveActiveVaultProfileId: () => this.resolveActiveVaultProfileId(),
            sanitizeVaultProfileId: value => this.sanitizeVaultProfileId(value),
            parseDualPanePreference: raw => this.parseDualPanePreference(raw),
            parseDualPaneOrientation: raw => this.parseDualPaneOrientation(raw),
            sanitizeBooleanSetting: (value, fallback) => this.sanitizeBooleanSetting(value, fallback),
            sanitizeHomepageSetting: value => this.sanitizeHomepageSetting(value),
            sanitizeDualPaneOrientationSetting: value => this.sanitizeDualPaneOrientationSetting(value),
            sanitizeNarrowSidebarLayoutSetting: value => this.sanitizeNarrowSidebarLayoutSetting(value),
            sanitizeNarrowSidebarTriggerModeSetting: value => this.sanitizeNarrowSidebarTriggerModeSetting(value),
            sanitizeNarrowSidebarCustomWidthSetting: value => this.sanitizeNarrowSidebarCustomWidthSetting(value),
            sanitizeTagSortOrderSetting: value => this.sanitizeTagSortOrderSetting(value),
            sanitizeFolderSortOrderSetting: value => this.sanitizeFolderSortOrderSetting(value),
            sanitizePaneTransitionDurationSetting: value => this.sanitizePaneTransitionDurationSetting(value),
            sanitizeToolbarVisibilitySetting: value => this.sanitizeToolbarVisibilitySetting(value),
            sanitizeNavIndentSetting: value => this.sanitizeNavIndentSetting(value),
            sanitizeNavItemHeightSetting: value => this.sanitizeNavItemHeightSetting(value),
            sanitizeCalendarWeeksToShowSetting: value => this.sanitizeCalendarWeeksToShowSetting(value),
            sanitizeCalendarPlacementSetting: value => this.sanitizeCalendarPlacementSetting(value),
            sanitizeCalendarLeftPlacementSetting: value => this.sanitizeCalendarLeftPlacementSetting(value),
            sanitizeCompactItemHeightSetting: value => this.sanitizeCompactItemHeightSetting(value),
            sanitizeFeatureImageSizeSetting: value => this.sanitizeFeatureImageSizeSetting(value),
            sanitizeFeatureImagePixelSizeSetting: value => this.sanitizeFeatureImagePixelSizeSetting(value),
            defaultUXPreferences: getDefaultUXPreferences(),
            isUXPreferencesRecord,
            mirrorUXPreferences: update => {
                this.options.mirrorUXPreferences(update);
            },
            getShouldPersistDesktopScale: () => this.shouldPersistDesktopScale,
            getShouldPersistMobileScale: () => this.shouldPersistMobileScale,
            setShouldPersistDesktopScale: value => {
                this.shouldPersistDesktopScale = value;
            },
            setShouldPersistMobileScale: value => {
                this.shouldPersistMobileScale = value;
            }
        });

        return this.syncModeRegistry;
    }

    private seedLocalValue(settingId: SyncModeSettingId): void {
        this.getSyncModeRegistry()[settingId].mirrorToLocalStorage();
    }

    private sanitizeSettingsRecords(): void {
        const sanitizeStringMap = (record?: Record<string, string>): Record<string, string> => sanitizeRecord(record, isStringRecordValue);
        const sanitizeSortMap = (record?: Record<string, ListSortOverrideValue>): Record<string, ListSortOverrideValue> => {
            const sanitized = Object.create(null) as Record<string, ListSortOverrideValue>;
            if (!record) {
                return sanitized;
            }

            for (const key of Object.keys(record)) {
                const normalized = normalizeListSortOverride((record as Record<string, unknown>)[key]);
                if (normalized) {
                    sanitized[key] = normalized;
                }
            }

            return sanitized;
        };
        const sanitizeAlphaSortOrderMap = (
            record?: Record<string, 'alpha-asc' | 'alpha-desc'>
        ): Record<string, 'alpha-asc' | 'alpha-desc'> => sanitizeRecord(record, isAlphaSortOrder);
        const isAppearanceValue = (value: unknown): value is FolderAppearance => isPlainObjectRecordValue(value);
        const sanitizeAppearanceMap = (record?: Record<string, FolderAppearance>): Record<string, FolderAppearance> => {
            const sanitized = sanitizeRecord(record, isAppearanceValue);
            Object.values(sanitized).forEach(appearance => {
                delete (appearance as Record<string, unknown>)['notePropertyType'];
                normalizeAppearanceGroupBy(appearance);
            });
            return sanitized;
        };
        const sanitizeBooleanMap = (record?: Record<string, boolean>): Record<string, boolean> =>
            sanitizeRecord(record, isBooleanRecordValue);
        const sanitizeSettingsSyncMap = (record?: Record<string, SettingSyncMode>): Record<string, SettingSyncMode> =>
            sanitizeRecord(record, isSettingSyncMode);

        this.currentSettings.folderColors = sanitizeStringMap(this.currentSettings.folderColors);
        this.currentSettings.folderBackgroundColors = sanitizeStringMap(this.currentSettings.folderBackgroundColors);
        this.currentSettings.fileColors = sanitizeStringMap(this.currentSettings.fileColors);
        this.currentSettings.fileBackgroundColors = sanitizeStringMap(this.currentSettings.fileBackgroundColors);
        this.currentSettings.tagColors = sanitizeStringMap(this.currentSettings.tagColors);
        this.currentSettings.tagBackgroundColors = sanitizeStringMap(this.currentSettings.tagBackgroundColors);
        this.currentSettings.propertyColors = sanitizeStringMap(this.currentSettings.propertyColors);
        this.currentSettings.propertyBackgroundColors = sanitizeStringMap(this.currentSettings.propertyBackgroundColors);
        this.currentSettings.virtualFolderColors = sanitizeStringMap(this.currentSettings.virtualFolderColors);
        this.currentSettings.virtualFolderBackgroundColors = sanitizeStringMap(this.currentSettings.virtualFolderBackgroundColors);
        this.currentSettings.folderSortOverrides = sanitizeSortMap(this.currentSettings.folderSortOverrides);
        this.currentSettings.tagSortOverrides = sanitizeSortMap(this.currentSettings.tagSortOverrides);
        this.currentSettings.propertySortOverrides = sanitizeSortMap(this.currentSettings.propertySortOverrides);
        this.currentSettings.folderTreeSortOverrides = sanitizeAlphaSortOrderMap(this.currentSettings.folderTreeSortOverrides);
        this.currentSettings.tagTreeSortOverrides = sanitizeAlphaSortOrderMap(this.currentSettings.tagTreeSortOverrides);
        this.currentSettings.propertyTreeSortOverrides = sanitizeAlphaSortOrderMap(this.currentSettings.propertyTreeSortOverrides);
        this.currentSettings.folderAppearances = sanitizeAppearanceMap(this.currentSettings.folderAppearances);
        this.currentSettings.tagAppearances = sanitizeAppearanceMap(this.currentSettings.tagAppearances);
        this.currentSettings.propertyAppearances = sanitizeAppearanceMap(this.currentSettings.propertyAppearances);
        this.currentSettings.navigationSeparators = sanitizeBooleanMap(this.currentSettings.navigationSeparators);
        this.currentSettings.externalIconProviders = sanitizeBooleanMap(this.currentSettings.externalIconProviders);
        this.currentSettings.syncModes = sanitizeSettingsSyncMap(this.currentSettings.syncModes);
        this.currentSettings.calendarMonthHighlights = sanitizeStringMap(this.currentSettings.calendarMonthHighlights);
        this.currentSettings.pinnedNotes = clonePinnedNotesRecord(this.currentSettings.pinnedNotes);
        this.currentSettings.collapsedPinnedContexts = cloneCollapsedPinnedContextsRecord(this.currentSettings.collapsedPinnedContexts);
    }

    private normalizeTaskSettings(): void {
        if (typeof this.currentSettings.showFileIconUnfinishedTask !== 'boolean') {
            this.currentSettings.showFileIconUnfinishedTask = DEFAULT_SETTINGS.showFileIconUnfinishedTask;
        }

        if (typeof this.currentSettings.showFileBackgroundUnfinishedTask !== 'boolean') {
            this.currentSettings.showFileBackgroundUnfinishedTask = DEFAULT_SETTINGS.showFileBackgroundUnfinishedTask;
        }

        this.currentSettings.unfinishedTaskBackgroundColor = resolveTaskBackgroundColor(
            this.currentSettings.unfinishedTaskBackgroundColor,
            DEFAULT_SETTINGS.unfinishedTaskBackgroundColor
        );
    }

    private normalizeIconSettings(): void {
        const normalizeRecord = (record?: Record<string, string>): Record<string, string> => {
            const sanitized = sanitizeRecord(record, isStringRecordValue);
            Object.keys(sanitized).forEach(key => {
                const canonical = normalizeCanonicalIconId(sanitized[key]);
                if (!canonical) {
                    delete sanitized[key];
                    return;
                }

                sanitized[key] = canonical;
            });
            return sanitized;
        };

        this.currentSettings.folderIcons = normalizeRecord(this.currentSettings.folderIcons);
        this.currentSettings.tagIcons = normalizeRecord(this.currentSettings.tagIcons);
        this.currentSettings.propertyIcons = normalizeRecord(this.currentSettings.propertyIcons);
        this.currentSettings.fileIcons = normalizeRecord(this.currentSettings.fileIcons);
    }

    private normalizeFileIconMapSettings(): void {
        const normalizeIconMap = (input: unknown, normalizeKey: (key: string) => string, fallback: Record<string, string>) => {
            if (!isPlainObjectRecordValue(input)) {
                return normalizeIconMapRecord(fallback, normalizeKey);
            }

            const source = sanitizeRecord<string>(undefined);
            Object.entries(input).forEach(([key, value]) => {
                if (typeof value !== 'string') {
                    return;
                }

                source[key] = value;
            });

            return normalizeIconMapRecord(source, normalizeKey);
        };

        if (typeof this.currentSettings.showCategoryIcons !== 'boolean') {
            this.currentSettings.showCategoryIcons = DEFAULT_SETTINGS.showCategoryIcons;
        }

        if (typeof this.currentSettings.showFilenameMatchIcons !== 'boolean') {
            this.currentSettings.showFilenameMatchIcons = DEFAULT_SETTINGS.showFilenameMatchIcons;
        }

        if (!isFileTypeIconPreset(this.currentSettings.fileTypeIconPreset)) {
            this.currentSettings.fileTypeIconPreset = DEFAULT_SETTINGS.fileTypeIconPreset;
        }

        this.currentSettings.fileTypeIconMap = normalizeIconMap(
            this.currentSettings.fileTypeIconMap,
            normalizeFileTypeIconMapKey,
            DEFAULT_SETTINGS.fileTypeIconMap
        );

        this.currentSettings.fileNameIconMap = normalizeIconMap(
            this.currentSettings.fileNameIconMap,
            normalizeFileNameIconMapKey,
            DEFAULT_SETTINGS.fileNameIconMap
        );
    }

    private normalizeInterfaceIconsSettings(): void {
        const raw = this.currentSettings.interfaceIcons;
        if (!isPlainObjectRecordValue(raw)) {
            this.currentSettings.interfaceIcons = sanitizeRecord(DEFAULT_SETTINGS.interfaceIcons, isStringRecordValue);
            return;
        }

        const source = sanitizeRecord<string>(undefined);
        Object.entries(raw).forEach(([key, value]) => {
            if (typeof value !== 'string') {
                return;
            }
            source[key] = value;
        });

        const legacySortIcon = source['list-sort'];
        if (legacySortIcon && typeof legacySortIcon === 'string') {
            source['list-sort-ascending'] = source['list-sort-ascending'] ?? legacySortIcon;
            source['list-sort-descending'] = source['list-sort-descending'] ?? legacySortIcon;
            delete source['list-sort'];
        }

        this.currentSettings.interfaceIcons = sanitizeRecord(normalizeUXIconMapRecord(source), isStringRecordValue);
    }

    private buildPatternCacheKey(selector: (profile: VaultProfile) => string[]): string {
        const profiles = Array.isArray(this.currentSettings.vaultProfiles) ? this.currentSettings.vaultProfiles : [];
        if (profiles.length === 0) {
            return '';
        }

        const entries = profiles.map(profile => ({
            id: profile.id ?? '',
            key: getPathPatternCacheKey(selector(profile) ?? [])
        }));
        entries.sort((left, right) => left.id.localeCompare(right.id));
        return entries.map(entry => `${entry.id}:${entry.key}`).join('\u0002');
    }

    private parseDualPanePreference(raw: unknown): boolean | null {
        if (typeof raw === 'string') {
            if (raw === '1') {
                return true;
            }
            if (raw === '0') {
                return false;
            }
        }

        return null;
    }

    private parseDualPaneOrientation(raw: unknown): 'vertical' | 'horizontal' | null {
        if (raw === 'vertical') {
            return 'vertical';
        }
        if (raw === 'horizontal') {
            return 'horizontal';
        }
        return null;
    }
}
