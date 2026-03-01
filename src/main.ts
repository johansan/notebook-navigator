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

import { Platform, Plugin, TFile, FileView, TFolder, WorkspaceLeaf, addIcon } from 'obsidian';
import { NotebookNavigatorSettings, DEFAULT_SETTINGS, NotebookNavigatorSettingTab } from './settings';
import { migrateRecentColors, migrateReleaseCheckState } from './settings/migrations/localPreferences';
import { migrateMomentDateFormats } from './settings/migrations/momentFormats';
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
    migrateSearchShortcutNegationSyntax,
    migrateFolderNoteTemplateSetting,
    migrateLegacySyncedSettings
} from './settings/migrations/syncedSettings';
import {
    LocalStorageKeys,
    MAX_PANE_TRANSITION_DURATION_MS,
    MIN_PANE_TRANSITION_DURATION_MS,
    NOTEBOOK_NAVIGATOR_CALENDAR_VIEW,
    NOTEBOOK_NAVIGATOR_VIEW,
    STORAGE_KEYS,
    type DualPaneOrientation,
    type NavigationPaneSide,
    type UXPreferences,
    type VisibilityPreferences
} from './types';
import { ISettingsProvider } from './interfaces/ISettingsProvider';
import { MetadataService, type MetadataCleanupSummary } from './services/MetadataService';
import { PropertyOperations } from './services/PropertyOperations';
import { TagOperations } from './services/TagOperations';
import { TagTreeService } from './services/TagTreeService';
import { PropertyTreeService } from './services/PropertyTreeService';
import { CommandQueueService } from './services/CommandQueueService';
import { OmnisearchService } from './services/OmnisearchService';
import { FileSystemOperations } from './services/FileSystemService';
import { getIconService } from './services/icons';
import { VaultIconProvider } from './services/icons/providers/VaultIconProvider';
import { RecentNotesService } from './services/RecentNotesService';
import RecentDataManager from './services/recent/RecentDataManager';
import { ExternalIconProviderController } from './services/icons/external/ExternalIconProviderController';
import { ExternalIconProviderId } from './services/icons/external/providerRegistry';
import type { NavigateToFolderOptions } from './hooks/useNavigatorReveal';
import ReleaseCheckService, { type ReleaseUpdateNotice } from './services/ReleaseCheckService';
import { NotebookNavigatorView } from './view/NotebookNavigatorView';
import { NotebookNavigatorCalendarView } from './view/NotebookNavigatorCalendarView';
import { getDefaultDateFormat, getDefaultTimeFormat } from './i18n';
import { localStorage, LOCALSTORAGE_VERSION } from './utils/localStorage';
import { NotebookNavigatorAPI } from './api/NotebookNavigatorAPI';
import { initializeDatabase, shutdownDatabase } from './storage/fileOperations';
import { ExtendedApp } from './types/obsidian-extended';
import { getLeafSplitLocation } from './utils/workspaceSplit';
import { sanitizeKeyboardShortcuts } from './utils/keyboardShortcuts';
import {
    normalizeCanonicalIconId,
    normalizeFileNameIconMapKey,
    normalizeFileTypeIconMapKey,
    normalizeIconMapRecord
} from './utils/iconizeFormat';
import { normalizeUXIconMapRecord } from './utils/uxIcons';
import {
    clonePinnedNotesRecord,
    isBooleanRecordValue,
    isPlainObjectRecordValue,
    isStringRecordValue,
    sanitizeRecord
} from './utils/recordUtils';
import { isRecord } from './utils/typeGuards';
import { runAsyncAction } from './utils/async';
import { resetHiddenToggleIfNoSources } from './utils/exclusionUtils';
import { ensureVaultProfiles, DEFAULT_VAULT_PROFILE_ID, clearHiddenFolderMatcherCache } from './utils/vaultProfiles';
import { clearHiddenFileNameMatcherCache } from './utils/fileFilters';
import WorkspaceCoordinator from './services/workspace/WorkspaceCoordinator';
import HomepageController from './services/workspace/HomepageController';
import registerNavigatorCommands from './services/commands/registerNavigatorCommands';
import registerWorkspaceEvents from './services/workspace/registerWorkspaceEvents';
import type { RevealFileOptions } from './hooks/useNavigatorReveal';
import type { FolderAppearance } from './hooks/useListPaneAppearance';
import {
    type CalendarPlacement,
    type CalendarLeftPlacement,
    type CalendarWeeksToShow,
    type AlphaSortOrder,
    isCalendarPlacement,
    isCalendarLeftPlacement,
    isCalendarWeekendDays,
    isAlphaSortOrder,
    isRecentNotesHideMode,
    isPropertySortSecondaryOption,
    resolveDeleteAttachmentsSetting,
    resolveMoveFileConflictsSetting,
    isSettingSyncMode,
    isSortOption,
    isTagSortOrder,
    SYNC_MODE_SETTING_IDS,
    type SettingSyncMode,
    type SyncModeSettingId,
    type SortOption,
    type TagSortOrder,
    type VaultProfile
} from './settings/types';
import { clearHiddenTagPatternCache } from './utils/tagPrefixMatcher';
import { getPathPatternCacheKey } from './utils/pathPatternMatcher';
import { sanitizeUIScale } from './utils/uiScale';
import { MAX_RECENT_COLORS } from './constants/colorPalette';
import { NOTEBOOK_NAVIGATOR_ICON_ID, NOTEBOOK_NAVIGATOR_ICON_SVG } from './constants/notebookNavigatorIcon';
import { createSyncModeRegistry, type SyncModeRegistry } from './services/settings/syncModeRegistry';

const UX_PREFERENCES_DEFAULTS = {
    base: {
        // Local-only UX preferences (per-device, stored in localStorage only)
        searchActive: false,
        showCalendar: false,
        showHiddenItems: false,
        pinShortcuts: true,

        // UX preferences that mirror settings (sync-mode controlled)
        includeDescendantNotes: DEFAULT_SETTINGS.includeDescendantNotes
    },
    platform: {
        // Platform-specific default overrides.
        // Applied before merging stored localStorage UX preferences; stored values override defaults.
        mobile: {},
        desktop: {}
    }
} satisfies {
    base: UXPreferences;
    platform: {
        mobile: Partial<UXPreferences>;
        desktop: Partial<UXPreferences>;
    };
};

type UXPreferenceKey = keyof typeof UX_PREFERENCES_DEFAULTS.base;

const UX_PREFERENCE_KEYS = Object.keys(UX_PREFERENCES_DEFAULTS.base).filter((key): key is UXPreferenceKey => {
    return key in UX_PREFERENCES_DEFAULTS.base;
});

function getDefaultUXPreferences(): UXPreferences {
    // Used on first launch and when newly-added UX preference keys are missing from localStorage.
    const overrides = Platform.isMobile ? UX_PREFERENCES_DEFAULTS.platform.mobile : UX_PREFERENCES_DEFAULTS.platform.desktop;

    return {
        ...UX_PREFERENCES_DEFAULTS.base,
        ...overrides
    };
}

// Settings that historically lived in localStorage only.
// During upgrades (no stored syncModes), these default to local to preserve per-device behavior.
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

/**
 * Main plugin class for Notebook Navigator
 * Provides a Notes-style file explorer for Obsidian with two-pane layout
 * Manages plugin lifecycle, settings, and view registration
 */
export default class NotebookNavigatorPlugin extends Plugin implements ISettingsProvider {
    settings: NotebookNavigatorSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;
    metadataService: MetadataService | null = null;
    tagOperations: TagOperations | null = null;
    propertyOperations: PropertyOperations | null = null;
    tagTreeService: TagTreeService | null = null;
    propertyTreeService: PropertyTreeService | null = null;
    commandQueue: CommandQueueService | null = null;
    fileSystemOps: FileSystemOperations | null = null;
    omnisearchService: OmnisearchService | null = null;
    externalIconController: ExternalIconProviderController | null = null;
    api: NotebookNavigatorAPI | null = null;
    recentNotesService: RecentNotesService | null = null;
    releaseCheckService: ReleaseCheckService | null = null;
    // Map of callbacks to notify open React views when settings change
    private settingsUpdateListeners = new Map<string, () => void>();
    // Map of callbacks to notify open React views when files are renamed
    private fileRenameListeners = new Map<string, (oldPath: string, newPath: string) => void>();
    private recentDataListeners = new Map<string, () => void>();
    private updateNoticeListeners = new Map<string, (notice: ReleaseUpdateNotice | null) => void>();
    // Flag indicating plugin is being unloaded to prevent operations during shutdown
    private isUnloading = false;
    private isHandlingExternalSettingsUpdate = false;
    // User preference for dual-pane mode (persisted in localStorage, not settings)
    private dualPanePreference = true;
    // User preference for dual-pane orientation (persisted in localStorage)
    private dualPaneOrientationPreference: DualPaneOrientation = 'horizontal';
    // Manages recent notes and icons data persistence
    private recentDataManager: RecentDataManager | null = null;
    // Coordinates workspace interactions with the navigator view
    private workspaceCoordinator: WorkspaceCoordinator | null = null;
    // Handles homepage file opening and startup behavior
    private homepageController: HomepageController | null = null;
    private pendingUpdateNotice: ReleaseUpdateNotice | null = null;
    private uxPreferences: UXPreferences = getDefaultUXPreferences();
    private uxPreferenceListeners = new Map<string, () => void>();
    private syncModeRegistry: SyncModeRegistry | null = null;
    // TODO: Remove legacy UI scale flags and migration when desktopScale/mobileScale are fully dropped
    // Track whether legacy scales still need to be kept in persisted settings until this device migrates them
    private shouldPersistDesktopScale = false;
    private shouldPersistMobileScale = false;
    private hasWorkspaceLayoutReady = false;
    private lastCalendarPlacement: CalendarPlacement | null = null;
    private calendarPlacementRequestId = 0;
    private hiddenFolderCacheKey: string | null = null;
    private hiddenTagCacheKey: string | null = null;
    private hiddenFileNamesCacheKey: string | null = null;

    // Keys used for persisting UI state in browser localStorage
    keys: LocalStorageKeys = STORAGE_KEYS;

    public getSyncMode(settingId: SyncModeSettingId): SettingSyncMode {
        return this.settings.syncModes?.[settingId] === 'local' ? 'local' : 'synced';
    }

    public isLocal(settingId: SyncModeSettingId): boolean {
        return this.getSyncMode(settingId) === 'local';
    }

    public isSynced(settingId: SyncModeSettingId): boolean {
        return this.getSyncMode(settingId) === 'synced';
    }

    public async setSyncMode(settingId: SyncModeSettingId, mode: SettingSyncMode): Promise<void> {
        const nextMode: SettingSyncMode = mode === 'local' ? 'local' : 'synced';
        const currentMode = this.getSyncMode(settingId);
        if (currentMode === nextMode) {
            return;
        }

        // Ensure switching to local starts from the current value.
        if (nextMode === 'local') {
            this.seedLocalValue(settingId);
        }

        const next = sanitizeRecord<SettingSyncMode>(this.settings.syncModes, isSettingSyncMode);
        next[settingId] = nextMode;
        this.settings.syncModes = next;

        await this.saveSettingsAndUpdate();
    }

    private persistSyncModeSettingUpdate(settingId: SyncModeSettingId): void {
        if (this.isLocal(settingId)) {
            this.notifySettingsUpdate();
            return;
        }

        runAsyncAction(() => this.saveSettingsAndUpdate());
    }

    private async persistSyncModeSettingUpdateAsync(settingId: SyncModeSettingId): Promise<void> {
        if (this.isLocal(settingId)) {
            this.notifySettingsUpdate();
            return;
        }

        await this.saveSettingsAndUpdate();
    }

    private updateSettingAndMirrorToLocalStorage<K extends SyncModeSettingId & keyof NotebookNavigatorSettings>(params: {
        settingId: K;
        localStorageKey: string;
        nextValue: NotebookNavigatorSettings[K];
    }): void {
        if (this.settings[params.settingId] === params.nextValue) {
            return;
        }

        this.settings[params.settingId] = params.nextValue;
        localStorage.set(params.localStorageKey, params.nextValue);
        this.persistSyncModeSettingUpdate(params.settingId);
    }

    private updateBoundedNumberSettingAndMirror(params: {
        settingId: 'paneTransitionDuration' | 'navIndent' | 'navItemHeight' | 'compactItemHeight';
        localStorageKey: string;
        rawValue: number;
        min: number;
        max: number;
        fallback: number;
    }): void {
        const parsed = this.parseFiniteNumber(params.rawValue);
        const next = parsed !== null ? Math.min(params.max, Math.max(params.min, parsed)) : params.fallback;
        this.updateSettingAndMirrorToLocalStorage({
            settingId: params.settingId,
            localStorageKey: params.localStorageKey,
            nextValue: next
        });
    }

    private getSyncModeRegistry(): SyncModeRegistry {
        if (this.syncModeRegistry) {
            return this.syncModeRegistry;
        }

        this.syncModeRegistry = createSyncModeRegistry({
            keys: this.keys,
            defaultSettings: DEFAULT_SETTINGS,
            isLocal: settingId => this.isLocal(settingId),
            getSettings: () => this.settings,
            resolveActiveVaultProfileId: () => this.resolveActiveVaultProfileId(),
            sanitizeVaultProfileId: value => this.sanitizeVaultProfileId(value),
            parseDualPanePreference: raw => this.parseDualPanePreference(raw),
            parseDualPaneOrientation: raw => this.parseDualPaneOrientation(raw),
            sanitizeBooleanSetting: (value, fallback) => this.sanitizeBooleanSetting(value, fallback),
            sanitizeDualPaneOrientationSetting: value => this.sanitizeDualPaneOrientationSetting(value),
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
            defaultUXPreferences: getDefaultUXPreferences(),
            isUXPreferencesRecord: value => this.isUXPreferencesRecord(value),
            mirrorUXPreferences: update => {
                this.uxPreferences = {
                    ...this.uxPreferences,
                    ...update
                };
                this.persistUXPreferences(false);
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

    private normalizeSyncModes(params: { storedData: Record<string, unknown> | null; isFirstLaunch: boolean }): void {
        const { storedData, isFirstLaunch } = params;
        const storedModes = storedData?.['syncModes'];
        const source = isPlainObjectRecordValue(storedModes) ? storedModes : null;

        const resolved = sanitizeRecord<SettingSyncMode>(undefined);
        SYNC_MODE_SETTING_IDS.forEach(settingId => {
            // First launch: initialize all sync-mode settings as synced.
            // Upgrade (missing per-setting mode): keep legacy local-only settings local and default new settings to synced.
            const defaultMode: SettingSyncMode = isFirstLaunch
                ? 'synced'
                : LEGACY_LOCAL_SYNC_MODE_SETTING_IDS.has(settingId)
                  ? 'local'
                  : 'synced';
            const value = source ? source[settingId] : undefined;
            resolved[settingId] = isSettingSyncMode(value) ? value : defaultMode;
        });

        this.settings.syncModes = resolved;
    }

    /**
     * Called when external changes to settings are detected (e.g., from sync)
     * This method is called automatically by Obsidian when the data.json file
     * is modified externally while the plugin is running
     */
    async onExternalSettingsChange() {
        if (this.isUnloading) {
            return;
        }

        try {
            await this.loadSettings();
            this.dualPanePreference = this.settings.dualPane;
            this.dualPaneOrientationPreference = this.settings.dualPaneOrientation;
            const previousIncludeDescendantNotes = this.uxPreferences.includeDescendantNotes;
            this.uxPreferences = {
                ...this.uxPreferences,
                includeDescendantNotes: this.settings.includeDescendantNotes
            };
            this.initializeRecentDataManager();
            this.isHandlingExternalSettingsUpdate = true;
            this.onSettingsUpdate();
            if (previousIncludeDescendantNotes !== this.uxPreferences.includeDescendantNotes) {
                this.notifyUXPreferencesUpdate();
            }
        } finally {
            this.isHandlingExternalSettingsUpdate = false;
        }
    }

    /**
     * Loads plugin settings from Obsidian's data storage
     * Returns true if this is the first launch (no saved data)
     */
    async loadSettings(): Promise<boolean> {
        // Load raw data and validate it is a plain object before treating as settings
        const rawData: unknown = await this.loadData();
        const storedData: Record<string, unknown> | null = isRecord(rawData) ? rawData : null;
        const hadLegacyPropertyFieldsInStoredData = Boolean(
            storedData && Object.prototype.hasOwnProperty.call(storedData, 'propertyFields')
        );
        const storedSettings = storedData as Partial<NotebookNavigatorSettings> | null;
        const isFirstLaunch = storedData === null; // No saved data means first launch
        this.shouldPersistDesktopScale = Boolean(storedData && 'desktopScale' in storedData);
        this.shouldPersistMobileScale = Boolean(storedData && 'mobileScale' in storedData);

        // Start with default settings
        this.settings = { ...DEFAULT_SETTINGS, ...(storedSettings ?? {}) };
        const hadLegacySearchProviderInSettings = Boolean(storedData && 'searchProvider' in storedData);
        const hadLegacyLastAnnouncedReleaseInSettings = Boolean(storedData && 'lastAnnouncedRelease' in storedData);
        const storedSearchProvider = localStorage.get<unknown>(this.keys.searchProviderKey);
        if (storedSearchProvider === 'internal' || storedSearchProvider === 'omnisearch') {
            this.settings.searchProvider = storedSearchProvider;
        } else {
            this.settings.searchProvider = 'internal';
            localStorage.set(this.keys.searchProviderKey, 'internal');
        }

        const settingsRecord = this.settings as unknown as Record<string, unknown>;
        delete settingsRecord['showCalendar'];
        delete settingsRecord['calendarCustomPromptForTitle'];
        delete settingsRecord['saveMetadataToFrontmatter'];
        delete settingsRecord['lastAnnouncedRelease'];
        // Validate and normalize keyboard shortcuts to use standard modifier names
        this.settings.keyboardShortcuts = sanitizeKeyboardShortcuts(this.settings.keyboardShortcuts);
        this.normalizeSyncModes({ storedData, isFirstLaunch });
        const syncModeRegistry = this.getSyncModeRegistry();

        migrateLegacySyncedSettings({
            settings: this.settings,
            storedData,
            keys: this.keys,
            defaultSettings: DEFAULT_SETTINGS
        });

        this.sanitizeSettingsRecords();

        const migratedMomentFormats = migrateMomentDateFormats({
            settings: this.settings,
            defaultDateFormat: getDefaultDateFormat(),
            defaultTimeFormat: getDefaultTimeFormat(),
            defaultSettings: DEFAULT_SETTINGS
        });

        // Set language-specific date/time formats if not already set
        if (!this.settings.dateFormat) {
            this.settings.dateFormat = getDefaultDateFormat();
        }
        if (!this.settings.timeFormat) {
            this.settings.timeFormat = getDefaultTimeFormat();
        }

        if (typeof this.settings.recentNotesCount !== 'number' || this.settings.recentNotesCount <= 0) {
            this.settings.recentNotesCount = DEFAULT_SETTINGS.recentNotesCount;
        }

        if (!isRecentNotesHideMode(this.settings.hideRecentNotes)) {
            this.settings.hideRecentNotes = DEFAULT_SETTINGS.hideRecentNotes;
        }

        if (!isPropertySortSecondaryOption(this.settings.propertySortSecondary)) {
            this.settings.propertySortSecondary = DEFAULT_SETTINGS.propertySortSecondary;
        }

        if (!isCalendarWeekendDays(this.settings.calendarWeekendDays)) {
            this.settings.calendarWeekendDays = DEFAULT_SETTINGS.calendarWeekendDays;
        }

        if (!isAlphaSortOrder(this.settings.folderSortOrder)) {
            this.settings.folderSortOrder = DEFAULT_SETTINGS.folderSortOrder;
        }

        this.settings.deleteAttachments = resolveDeleteAttachmentsSetting(
            this.settings.deleteAttachments,
            DEFAULT_SETTINGS.deleteAttachments
        );

        this.settings.moveFileConflicts = resolveMoveFileConflictsSetting(
            this.settings.moveFileConflicts,
            DEFAULT_SETTINGS.moveFileConflicts
        );

        let uiScaleMigrated = false;
        SYNC_MODE_SETTING_IDS.forEach(settingId => {
            const entry = syncModeRegistry[settingId];
            if (entry.loadPhase !== 'preProfiles') {
                return;
            }
            const result = entry.resolveOnLoad({ storedData });
            if (settingId === 'uiScale') {
                uiScaleMigrated = result.migrated;
            }
        });

        if (!Array.isArray(this.settings.rootFolderOrder)) {
            this.settings.rootFolderOrder = [];
        }

        if (!Array.isArray(this.settings.rootTagOrder)) {
            this.settings.rootTagOrder = [];
        }

        if (!Array.isArray(this.settings.rootPropertyOrder)) {
            this.settings.rootPropertyOrder = [];
        }

        const migratedReleaseState = migrateReleaseCheckState({ settings: this.settings, storedData, keys: this.keys });
        const migratedRecentColors = migrateRecentColors({ settings: this.settings, storedData, keys: this.keys });
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

        migrateFolderNoteTemplateSetting({ settings: this.settings, defaultSettings: DEFAULT_SETTINGS });
        applyExistingUserDefaults({ settings: this.settings });

        // Extract legacy exclusion settings and migrate to vault profile system
        const legacyVisibility = extractLegacyVisibilitySettings({ settings: this.settings, storedData });
        const legacyPropertyFields = extractLegacyPropertyFields({ settings: this.settings, storedData });
        const legacyShortcuts = extractLegacyShortcuts({ storedData });
        const legacyPeriodicNotesFolder = extractLegacyPeriodicNotesFolder({ settings: this.settings });

        // Initialize vault profiles and apply legacy profile migrations
        ensureVaultProfiles(this.settings);
        applyLegacyPeriodicNotesFolderMigration({ settings: this.settings, legacyPeriodicNotesFolder });
        applyLegacyVisibilityMigration({ settings: this.settings, migration: legacyVisibility });
        applyLegacyPropertyFieldsMigration({ settings: this.settings, legacyPropertyFields });
        applyLegacyShortcutsMigration({ settings: this.settings, legacyShortcuts });
        const migratedShortcutNegationSyntax = migrateSearchShortcutNegationSyntax({ settings: this.settings });
        this.normalizeIconSettings(this.settings);
        this.normalizeFileIconMapSettings(this.settings);
        this.normalizeInterfaceIconsSettings(this.settings);
        syncModeRegistry.vaultProfile.resolveOnLoad({ storedData });
        this.refreshMatcherCachesIfNeeded();

        const needsPersistedCleanup =
            migratedReleaseState ||
            migratedRecentColors ||
            hadLocalValuesInSettings ||
            hadLegacySearchProviderInSettings ||
            hadLegacyLastAnnouncedReleaseInSettings ||
            hadLegacyPropertyFieldsInStoredData ||
            uiScaleMigrated ||
            migratedMomentFormats ||
            migratedShortcutNegationSyntax;

        if (needsPersistedCleanup) {
            await this.saveData(this.getPersistableSettings());
        }

        return isFirstLaunch;
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

    private sanitizeDualPaneOrientationSetting(value: unknown): DualPaneOrientation {
        const parsed = this.parseDualPaneOrientation(value);
        return parsed ?? DEFAULT_SETTINGS.dualPaneOrientation;
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

    private sanitizeTagSortOrderSetting(value: unknown): TagSortOrder {
        return typeof value === 'string' && isTagSortOrder(value) ? value : DEFAULT_SETTINGS.tagSortOrder;
    }

    private sanitizeFolderSortOrderSetting(value: unknown): AlphaSortOrder {
        return typeof value === 'string' && isAlphaSortOrder(value) ? value : DEFAULT_SETTINGS.folderSortOrder;
    }

    private sanitizeVaultProfileId(candidate: unknown): string {
        const profiles = this.settings.vaultProfiles;
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

    /**
     * Resolves the active vault profile ID using localStorage first, then stored settings, falling back to default.
     */
    private resolveActiveVaultProfileId(): string {
        const profiles = this.settings.vaultProfiles;

        const findMatchingProfileId = (candidate: unknown): string | null => {
            if (typeof candidate !== 'string' || !candidate) {
                return null;
            }
            const match = profiles.find(profile => profile.id === candidate);
            return match ? match.id : null;
        };

        const storedLocal = localStorage.get<string>(this.keys.vaultProfileKey);
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

    /**
     * Sets up the recent data manager and loads persisted data.
     */
    private initializeRecentDataManager(): void {
        // Create manager instance on first call
        if (!this.recentDataManager) {
            this.recentDataManager = new RecentDataManager({
                settings: this.settings,
                keys: this.keys,
                onRecentDataChange: () => this.notifyRecentDataUpdate()
            });
        }

        // Load recent notes and icons from local storage
        this.recentDataManager.initialize(this.settings.vaultProfile);
    }

    /**
     * Returns the list of recent note paths from local storage
     */
    public getRecentNotes(): string[] {
        return this.recentDataManager?.getRecentNotes() ?? [];
    }

    /**
     * Stores the list of recent note paths to local storage
     */
    public setRecentNotes(recentNotes: string[]): void {
        this.recentDataManager?.setRecentNotes(recentNotes);
    }

    /**
     * Trims the recent notes list to the configured maximum count
     */
    public applyRecentNotesLimit(): void {
        this.recentDataManager?.applyRecentNotesLimit();
    }

    /**
     * Registers a listener to be notified when recent data changes
     */
    public registerRecentDataListener(id: string, callback: () => void): void {
        this.recentDataListeners.set(id, callback);
    }

    /**
     * Unregisters a recent data change listener
     */
    public unregisterRecentDataListener(id: string): void {
        this.recentDataListeners.delete(id);
    }

    /**
     * Registers a listener that will be notified when release update notices change.
     */
    public registerUpdateNoticeListener(id: string, callback: (notice: ReleaseUpdateNotice | null) => void): void {
        this.updateNoticeListeners.set(id, callback);
    }

    /**
     * Removes an update notice listener.
     */
    public unregisterUpdateNoticeListener(id: string): void {
        this.updateNoticeListeners.delete(id);
    }

    /**
     * Returns the current pending update notice, if any.
     */
    public getPendingUpdateNotice(): ReleaseUpdateNotice | null {
        return this.pendingUpdateNotice;
    }

    /**
     * Dismisses the current update notice for the active session.
     */
    public markUpdateNoticeAsDisplayed(version: string): void {
        if (this.pendingUpdateNotice && this.pendingUpdateNotice.version === version) {
            this.setPendingUpdateNotice(null);
        }
    }

    /**
     * Returns the map of recent icon IDs per provider from local storage
     */
    public getRecentIcons(): Record<string, string[]> {
        return this.recentDataManager?.getRecentIcons() ?? {};
    }

    /**
     * Stores the map of recent icon IDs per provider to local storage
     */
    public setRecentIcons(recentIcons: Record<string, string[]>): void {
        this.recentDataManager?.setRecentIcons(recentIcons);
    }

    /**
     * Checks if the given file is open in the right sidebar
     */
    public isFileInRightSidebar(file: TFile): boolean {
        if (!this.settings.autoRevealIgnoreRightSidebar) {
            return false;
        }

        const view = this.app.workspace.getActiveViewOfType(FileView);
        if (!view?.file || view.file.path !== file.path) {
            return false;
        }

        const split = getLeafSplitLocation(this.app, view.leaf ?? null);
        return split === 'right-sidebar';
    }

    /**
     * Plugin initialization - called when plugin is enabled
     */
    async onload() {
        // Initialize localStorage before database so version checks work
        localStorage.init(this.app);

        if (typeof addIcon === 'function') {
            addIcon(NOTEBOOK_NAVIGATOR_ICON_ID, NOTEBOOK_NAVIGATOR_ICON_SVG);
        }

        // Initialize database early for StorageContext consumers
        const appId = (this.app as ExtendedApp).appId || '';
        // Use a fixed per-platform LRU size for feature image blobs.
        const featureImageCacheMaxEntries = Platform.isMobile ? 200 : 1000;
        // Use a fixed per-platform LRU size for preview text strings.
        const previewTextCacheMaxEntries = Platform.isMobile ? 10000 : 50000;
        // Limit the number of preview text paths processed per load flush.
        const previewLoadMaxBatch = Platform.isMobile ? 20 : 50;
        runAsyncAction(
            async () => {
                try {
                    await initializeDatabase(appId, { featureImageCacheMaxEntries, previewTextCacheMaxEntries, previewLoadMaxBatch });
                } catch (error: unknown) {
                    console.error('Failed to initialize database:', error);
                }
            },
            {
                onError: (error: unknown) => {
                    console.error('Failed to initialize database:', error);
                }
            }
        );

        // Load settings and check if this is first launch
        const isFirstLaunch = await this.loadSettings();
        this.dualPanePreference = this.settings.dualPane;
        this.dualPaneOrientationPreference = this.settings.dualPaneOrientation;
        const storedLocalStorageVersion = localStorage.get<number>(STORAGE_KEYS.localStorageVersionKey);
        this.loadUXPreferences();

        // Handle first launch initialization
        if (isFirstLaunch) {
            // Normalize all tag settings to lowercase
            this.normalizeTagSettings();

            // Clear all localStorage data (if plugin was reinstalled)
            this.clearAllLocalStorage();

            // Re-seed per-device mirrors cleared above
            this.uxPreferences = getDefaultUXPreferences();
            const syncModeRegistry = this.getSyncModeRegistry();
            SYNC_MODE_SETTING_IDS.forEach(settingId => {
                syncModeRegistry[settingId].mirrorToLocalStorage();
            });

            this.dualPanePreference = this.settings.dualPane;
            this.dualPaneOrientationPreference = this.settings.dualPaneOrientation;

            // Ensure root folder is expanded on first launch (default is enabled)
            if (this.settings.showRootFolder) {
                const expandedFolders = ['/'];
                localStorage.set(STORAGE_KEYS.expandedFoldersKey, expandedFolders);
            }

            // Set localStorage version
            localStorage.set(STORAGE_KEYS.localStorageVersionKey, LOCALSTORAGE_VERSION);
            await this.saveData(this.getPersistableSettings());
        } else {
            // Check localStorage version for potential migrations
            const versionNumber =
                typeof storedLocalStorageVersion === 'number' ? storedLocalStorageVersion : Number(storedLocalStorageVersion ?? Number.NaN);
            if (!versionNumber || versionNumber !== LOCALSTORAGE_VERSION) {
                // Future localStorage migration logic can go here
                localStorage.set(STORAGE_KEYS.localStorageVersionKey, LOCALSTORAGE_VERSION);
            }
        }

        // Initialize recent data management
        this.initializeRecentDataManager();

        this.recentNotesService = new RecentNotesService(this);

        // Initialize workspace and homepage coordination
        this.workspaceCoordinator = new WorkspaceCoordinator(this);
        this.homepageController = new HomepageController(this, this.workspaceCoordinator);

        // Initialize services
        this.tagTreeService = new TagTreeService();
        this.propertyTreeService = new PropertyTreeService();
        this.metadataService = new MetadataService(
            this.app,
            this,
            () => this.tagTreeService,
            () => this.propertyTreeService
        );
        this.tagOperations = new TagOperations(
            this.app,
            () => this.settings,
            () => this.tagTreeService,
            () => this.metadataService
        );
        this.propertyOperations = new PropertyOperations(
            this.app,
            () => this.settings,
            () => this.saveSettingsAndUpdate(),
            () => this.propertyTreeService
        );
        this.commandQueue = new CommandQueueService();
        this.fileSystemOps = new FileSystemOperations(
            this.app,
            () => this.tagTreeService,
            () => this.propertyTreeService,
            () => this.commandQueue,
            () => this.metadataService,
            (): VisibilityPreferences => ({
                includeDescendantNotes: this.uxPreferences.includeDescendantNotes,
                showHiddenItems: this.uxPreferences.showHiddenItems
            }),
            this
        );
        this.omnisearchService = new OmnisearchService(this.app);
        if (this.settings.searchProvider === 'omnisearch' && !this.omnisearchService.isAvailable()) {
            this.setSearchProvider('internal');
        }
        this.api = new NotebookNavigatorAPI(this, this.app);
        this.metadataService.setFolderStyleChangeListener(folderPath => {
            if (this.isUnloading || !this.api) {
                return;
            }

            this.api.metadata.emitFolderChangedForPath(folderPath);
        });
        this.releaseCheckService = new ReleaseCheckService(this);

        const iconService = getIconService();
        iconService.registerProvider(new VaultIconProvider(this.app));
        this.externalIconController = new ExternalIconProviderController(this.app, iconService, this);
        const iconController = this.externalIconController;
        if (iconController) {
            runAsyncAction(
                async () => {
                    await iconController.initialize();
                    await iconController.syncWithSettings();
                },
                {
                    onError: (error: unknown) => {
                        console.error('External icon controller init failed:', error);
                    }
                }
            );
        }

        // Re-sync icon settings when settings update
        this.registerSettingsUpdateListener('external-icon-controller', () => {
            const controller = this.externalIconController;
            if (controller) {
                runAsyncAction(() => controller.syncWithSettings());
            }
        });

        // Register view
        this.registerView(NOTEBOOK_NAVIGATOR_VIEW, leaf => {
            return new NotebookNavigatorView(leaf, this);
        });
        this.registerView(NOTEBOOK_NAVIGATOR_CALENDAR_VIEW, leaf => {
            return new NotebookNavigatorCalendarView(leaf, this);
        });

        // Register commands
        registerNavigatorCommands(this);

        // ==== Settings tab ====
        this.addSettingTab(new NotebookNavigatorSettingTab(this.app, this));

        // Register editor context menu
        registerWorkspaceEvents(this);

        // Post-layout initialization
        // Only auto-create the navigator view on first launch; upgrades restore existing leaves themselves
        const shouldActivateOnStartup = isFirstLaunch;

        this.app.workspace.onLayoutReady(() => {
            this.hasWorkspaceLayoutReady = true;
            // Execute startup tasks asynchronously to avoid blocking the layout
            runAsyncAction(async () => {
                if (this.isUnloading) {
                    return;
                }

                await this.homepageController?.handleWorkspaceReady({ shouldActivateOnStartup });

                if (isFirstLaunch) {
                    const { WelcomeModal } = await import('./modals/WelcomeModal');
                    new WelcomeModal(this.app).open();
                }

                // Check for version updates after a short delay.
                // Obsidian Sync can update the plugin settings shortly after startup, so defer the check to avoid using cached settings.
                const versionUpdateGracePeriodMs = 1000;
                if (typeof window === 'undefined') {
                    await this.checkForVersionUpdate({ isFirstLaunch });
                } else {
                    window.setTimeout(() => {
                        runAsyncAction(async () => {
                            if (this.isUnloading) {
                                return;
                            }
                            await this.checkForVersionUpdate({ isFirstLaunch });
                        });
                    }, versionUpdateGracePeriodMs);
                }

                // Trigger Style Settings plugin to parse our settings
                this.app.workspace.trigger('parse-style-settings');

                this.applyCalendarPlacementView({ force: true, reveal: false });

                // Check for new GitHub releases if enabled, without blocking startup
                if (this.settings.checkForUpdatesOnStart) {
                    runAsyncAction(() => this.runReleaseUpdateCheck());
                }
            });
        });
    }

    /**
     * Register a callback to be notified when settings are updated
     * Used by React views to trigger re-renders
     */
    public registerSettingsUpdateListener(id: string, callback: () => void): void {
        this.settingsUpdateListeners.set(id, callback);
    }

    public isExternalSettingsUpdate(): boolean {
        return this.isHandlingExternalSettingsUpdate;
    }

    /**
     * Returns whether dual-pane mode is enabled
     */
    public useDualPane(): boolean {
        return this.dualPanePreference;
    }

    public isShuttingDown(): boolean {
        return this.isUnloading;
    }

    /**
     * Updates the dual-pane preference and persists to local storage
     */
    public setDualPanePreference(enabled: boolean): void {
        const next = Boolean(enabled);
        if (this.dualPanePreference === next) {
            return;
        }

        this.dualPanePreference = next;
        this.settings.dualPane = next;
        localStorage.set(this.keys.dualPaneKey, next ? '1' : '0');
        this.persistSyncModeSettingUpdate('dualPane');
    }

    /**
     * Toggles the dual-pane preference between enabled and disabled
     */
    public toggleDualPanePreference(): void {
        this.setDualPanePreference(!this.dualPanePreference);
    }

    /**
     * Returns the active dual-pane orientation for this device
     */
    public getDualPaneOrientation(): DualPaneOrientation {
        return this.dualPaneOrientationPreference;
    }

    /**
     * Updates the dual-pane orientation and persists to vault-scoped local storage.
     */
    public async setDualPaneOrientation(orientation: DualPaneOrientation): Promise<void> {
        // Normalize value to valid orientation
        const normalized: DualPaneOrientation = orientation === 'vertical' ? 'vertical' : 'horizontal';
        if (this.dualPaneOrientationPreference === normalized) {
            return;
        }

        // Update in-memory preference and persist
        this.dualPaneOrientationPreference = normalized;
        this.settings.dualPaneOrientation = normalized;
        localStorage.set(this.keys.dualPaneOrientationKey, normalized);
        await this.persistSyncModeSettingUpdateAsync('dualPaneOrientation');
    }

    /**
     * Returns the navigation pane side preference (left or right).
     */
    public getNavigationPaneSide(): NavigationPaneSide {
        if (this.isLocal('navigationPaneSide')) {
            const stored = localStorage.get<NavigationPaneSide>(this.keys.navigationPaneSideKey);
            return stored === 'left' || stored === 'right' ? stored : 'left';
        }
        return this.settings.navigationPaneSide === 'right' ? 'right' : 'left';
    }

    /**
     * Updates the navigation pane side and persists to storage.
     */
    public setNavigationPaneSide(side: NavigationPaneSide): void {
        const sanitized: NavigationPaneSide = side === 'right' ? 'right' : 'left';
        
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'navigationPaneSide',
            localStorageKey: this.keys.navigationPaneSideKey,
            nextValue: sanitized
        });
        
        this.persistSyncModeSettingUpdate('navigationPaneSide');
    }

    /**
     * Returns the UI scale for this device.
     */
    public getUIScale(): number {
        const current = Platform.isMobile ? this.settings.mobileScale : this.settings.desktopScale;
        return sanitizeUIScale(current);
    }

    /**
     * Updates the UI scale for this device and persists to vault-local storage.
     */
    public setUIScale(scale: number): void {
        const next = sanitizeUIScale(scale);
        const isMobile = Platform.isMobile;
        const current = sanitizeUIScale(isMobile ? this.settings.mobileScale : this.settings.desktopScale);
        if (isMobile) {
            this.settings.mobileScale = next;
        } else {
            this.settings.desktopScale = next;
        }
        localStorage.set(this.keys.uiScaleKey, next);
        if (current === next) {
            return;
        }
        this.persistSyncModeSettingUpdate('uiScale');
    }

    /**
     * Returns the current tag sort order preference.
     */
    public getTagSortOrder(): TagSortOrder {
        return this.settings.tagSortOrder;
    }

    /**
     * Returns the current property sort order preference.
     */
    public getPropertySortOrder(): TagSortOrder {
        return this.settings.propertySortOrder;
    }

    /**
     * Returns the current folder sort order preference.
     */
    public getFolderSortOrder(): AlphaSortOrder {
        return this.settings.folderSortOrder;
    }

    /**
     * Updates the tag sort order preference and persists to local storage.
     */
    public setTagSortOrder(order: TagSortOrder): void {
        if (!isTagSortOrder(order) || this.settings.tagSortOrder === order) {
            return;
        }
        this.settings.tagSortOrder = order;
        localStorage.set(this.keys.tagSortOrderKey, order);
        this.persistSyncModeSettingUpdate('tagSortOrder');
    }

    /**
     * Updates the property sort order preference and persists to local storage.
     */
    public setPropertySortOrder(order: TagSortOrder): void {
        if (!isTagSortOrder(order) || this.settings.propertySortOrder === order) {
            return;
        }
        this.settings.propertySortOrder = order;
        localStorage.set(this.keys.propertySortOrderKey, order);
        this.persistSyncModeSettingUpdate('propertySortOrder');
    }

    /**
     * Updates the folder sort order preference and persists to local storage.
     */
    public setFolderSortOrder(order: AlphaSortOrder): void {
        if (!isAlphaSortOrder(order) || this.settings.folderSortOrder === order) {
            return;
        }
        this.settings.folderSortOrder = order;
        localStorage.set(this.keys.folderSortOrderKey, order);
        this.persistSyncModeSettingUpdate('folderSortOrder');
    }

    /**
     * Returns the timestamp of the last release check (local-only).
     */
    public getReleaseCheckTimestamp(): number | null {
        const value = localStorage.get<unknown>(this.keys.releaseCheckTimestampKey);
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        return null;
    }

    /**
     * Persists the last release check timestamp to local storage.
     */
    public setReleaseCheckTimestamp(timestamp: number): void {
        localStorage.set(this.keys.releaseCheckTimestampKey, timestamp);
    }

    /**
     * Returns the latest known release version discovered by this device.
     */
    public getLatestKnownRelease(): string {
        const value = localStorage.get<unknown>(this.keys.latestKnownReleaseKey);
        if (typeof value === 'string') {
            return value;
        }
        return '';
    }

    /**
     * Persists the latest known release version to local storage.
     */
    public setLatestKnownRelease(version: string): void {
        if (!version) {
            return;
        }
        localStorage.set(this.keys.latestKnownReleaseKey, version);
    }

    /**
     * Retrieves recent colors history from vault-local storage.
     */
    public getRecentColors(): string[] {
        const stored = localStorage.get<unknown>(this.keys.recentColorsKey);
        if (!Array.isArray(stored)) {
            return [];
        }
        return stored.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    }

    /**
     * Persists recent colors history to vault-local storage.
     */
    public setRecentColors(recentColors: string[]): void {
        const sanitized = Array.isArray(recentColors)
            ? recentColors.filter(color => typeof color === 'string' && color.trim().length > 0)
            : [];
        const capped = sanitized.slice(0, MAX_RECENT_COLORS);
        localStorage.set(this.keys.recentColorsKey, capped);
    }

    /**
     * Returns the active search provider preference.
     */
    public getSearchProvider(): 'internal' | 'omnisearch' {
        const value = this.settings.searchProvider;
        if (value === 'omnisearch') {
            return 'omnisearch';
        }
        return 'internal';
    }

    /**
     * Updates the search provider preference and persists to local storage.
     */
    public setSearchProvider(provider: 'internal' | 'omnisearch'): void {
        const isOmnisearchAvailable = this.omnisearchService?.isAvailable() ?? false;
        const normalized = provider === 'omnisearch' && isOmnisearchAvailable ? 'omnisearch' : 'internal';
        if (this.settings.searchProvider === normalized) {
            return;
        }

        this.settings.searchProvider = normalized;
        localStorage.set(this.keys.searchProviderKey, normalized);
        this.notifySettingsUpdate();
    }

    /**
     * Updates the single-pane transition duration and persists to local storage.
     */
    public setPaneTransitionDuration(durationMs: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'paneTransitionDuration',
            localStorageKey: this.keys.paneTransitionDurationKey,
            rawValue: durationMs,
            min: MIN_PANE_TRANSITION_DURATION_MS,
            max: MAX_PANE_TRANSITION_DURATION_MS,
            fallback: DEFAULT_SETTINGS.paneTransitionDuration
        });
    }

    /**
     * Persists toolbar button visibility to local storage.
     */
    public persistToolbarVisibility(): void {
        localStorage.set(this.keys.toolbarVisibilityKey, this.settings.toolbarVisibility);
        this.notifySettingsUpdate();
        if (this.isLocal('toolbarVisibility')) {
            return;
        }
        runAsyncAction(() => this.saveSettings());
    }

    /**
     * Updates whether floating toolbars are used.
     */
    public setUseFloatingToolbars(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'useFloatingToolbars',
            localStorageKey: this.keys.useFloatingToolbarsKey,
            nextValue: Boolean(enabled)
        });
    }

    /**
     * Updates whether the navigation banner is pinned to the top of the navigation pane.
     */
    public setPinNavigationBanner(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'pinNavigationBanner',
            localStorageKey: this.keys.pinNavigationBannerKey,
            nextValue: enabled
        });
    }

    /**
     * Updates navigation tree indentation and persists to local storage.
     */
    public setNavIndent(indent: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'navIndent',
            localStorageKey: this.keys.navIndentKey,
            rawValue: indent,
            min: 10,
            max: 24,
            fallback: DEFAULT_SETTINGS.navIndent
        });
    }

    /**
     * Updates navigation item height and persists to local storage.
     */
    public setNavItemHeight(height: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'navItemHeight',
            localStorageKey: this.keys.navItemHeightKey,
            rawValue: height,
            min: 20,
            max: 28,
            fallback: DEFAULT_SETTINGS.navItemHeight
        });
    }

    /**
     * Updates navigation text scaling with item height and persists to local storage.
     */
    public setNavItemHeightScaleText(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'navItemHeightScaleText',
            localStorageKey: this.keys.navItemHeightScaleTextKey,
            nextValue: enabled
        });
    }

    /**
     * Updates calendar weeks to show and persists to local storage.
     */
    public setCalendarWeeksToShow(weeks: CalendarWeeksToShow): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'calendarWeeksToShow',
            localStorageKey: this.keys.calendarWeeksToShowKey,
            nextValue: weeks
        });
    }

    public setCalendarPlacement(placement: CalendarPlacement): void {
        const previousPlacement = this.settings.calendarPlacement;
        if (previousPlacement === placement) {
            return;
        }

        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'calendarPlacement',
            localStorageKey: this.keys.calendarPlacementKey,
            nextValue: placement
        });

        if (previousPlacement === 'right-sidebar' && placement === 'left-sidebar') {
            this.setShowCalendar(true);
        }
    }

    public setCalendarLeftPlacement(placement: CalendarLeftPlacement): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'calendarLeftPlacement',
            localStorageKey: this.keys.calendarLeftPlacementKey,
            nextValue: placement
        });
    }

    /**
     * Updates compact list item height and persists to local storage.
     */
    public setCompactItemHeight(height: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'compactItemHeight',
            localStorageKey: this.keys.compactItemHeightKey,
            rawValue: height,
            min: 20,
            max: 28,
            fallback: DEFAULT_SETTINGS.compactItemHeight
        });
    }

    /**
     * Updates compact list text scaling with item height and persists to local storage.
     */
    public setCompactItemHeightScaleText(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'compactItemHeightScaleText',
            localStorageKey: this.keys.compactItemHeightScaleTextKey,
            nextValue: enabled
        });
    }

    /**
     * Sets the active vault profile and synchronizes hidden folder, tag, and note patterns.
     */
    public setVaultProfile(profileId: string): void {
        ensureVaultProfiles(this.settings);
        const nextProfile =
            this.settings.vaultProfiles.find(profile => profile.id === profileId) ??
            this.settings.vaultProfiles.find(profile => profile.id === DEFAULT_VAULT_PROFILE_ID) ??
            this.settings.vaultProfiles[0];

        if (!nextProfile) {
            return;
        }

        if (this.settings.vaultProfile === nextProfile.id) {
            return;
        }

        this.settings.vaultProfile = nextProfile.id;
        localStorage.set(this.keys.vaultProfileKey, nextProfile.id);
        this.initializeRecentDataManager();

        resetHiddenToggleIfNoSources({
            settings: this.settings,
            showHiddenItems: this.getUXPreferences().showHiddenItems,
            setShowHiddenItems: value => this.setShowHiddenItems(value)
        });

        this.refreshMatcherCachesIfNeeded();
        this.persistSyncModeSettingUpdate('vaultProfile');
    }

    public getUXPreferences(): UXPreferences {
        return { ...this.uxPreferences };
    }

    public registerUXPreferencesListener(id: string, callback: () => void): void {
        this.uxPreferenceListeners.set(id, callback);
    }

    public unregisterUXPreferencesListener(id: string): void {
        this.uxPreferenceListeners.delete(id);
    }

    public setSearchActive(value: boolean): void {
        this.updateUXPreference('searchActive', value);
    }

    public setIncludeDescendantNotes(value: boolean): void {
        const next = Boolean(value);
        if (this.uxPreferences.includeDescendantNotes === next) {
            return;
        }

        this.settings.includeDescendantNotes = next;
        this.updateUXPreference('includeDescendantNotes', next);
        this.persistSyncModeSettingUpdate('includeDescendantNotes');
    }

    public toggleIncludeDescendantNotes(): void {
        this.setIncludeDescendantNotes(!this.uxPreferences.includeDescendantNotes);
    }

    public setShowHiddenItems(value: boolean): void {
        this.updateUXPreference('showHiddenItems', value);
    }

    public toggleShowHiddenItems(): void {
        this.setShowHiddenItems(!this.uxPreferences.showHiddenItems);
    }

    public setPinShortcuts(value: boolean): void {
        this.updateUXPreference('pinShortcuts', value);
    }

    public setShowCalendar(value: boolean): void {
        const next = Boolean(value);
        if (this.uxPreferences.showCalendar === next) {
            return;
        }
        this.updateUXPreference('showCalendar', next);
    }

    public toggleShowCalendar(): void {
        this.setShowCalendar(!this.uxPreferences.showCalendar);
    }

    private updateUXPreference(key: keyof UXPreferences, value: boolean): void {
        if (this.uxPreferences[key] === value) {
            return;
        }

        this.uxPreferences = {
            ...this.uxPreferences,
            [key]: value
        };
        this.persistUXPreferences();
    }

    private loadUXPreferences(): void {
        const defaults = getDefaultUXPreferences();
        const stored = localStorage.get<unknown>(this.keys.uxPreferencesKey);
        if (this.isUXPreferencesRecord(stored)) {
            this.uxPreferences = {
                ...defaults,
                ...stored
            };

            const hasAllKeys = UX_PREFERENCE_KEYS.every(key => {
                return typeof stored[key] === 'boolean';
            });

            if (!hasAllKeys) {
                this.persistUXPreferences(false);
            }
        } else {
            this.uxPreferences = defaults;
            this.persistUXPreferences(false);
        }
    }

    private persistUXPreferences(notify = true): void {
        localStorage.set(this.keys.uxPreferencesKey, this.uxPreferences);
        if (notify) {
            this.notifyUXPreferencesUpdate();
        }
    }

    private isUXPreferencesRecord(value: unknown): value is Partial<UXPreferences> {
        if (value === null || typeof value !== 'object') {
            return false;
        }

        const record = value as Record<string, unknown>;
        for (const key of UX_PREFERENCE_KEYS) {
            const entry = record[key];
            if (typeof entry !== 'undefined' && typeof entry !== 'boolean') {
                return false;
            }
        }
        return true;
    }

    private notifyUXPreferencesUpdate(): void {
        if (this.uxPreferenceListeners.size === 0) {
            return;
        }

        for (const [id, listener] of this.uxPreferenceListeners) {
            try {
                listener();
            } catch (error) {
                console.error(`Failed to notify UX preferences listener "${id}"`, error);
            }
        }
    }

    /**
     * Parses dual-pane preference from local storage string value
     */
    private parseDualPanePreference(raw: unknown): boolean | null {
        if (typeof raw === 'string') {
            if (raw === '1') {
                return true;
            }
            if (raw === '0') {
                return false;
            }
            return null;
        }

        return null;
    }

    /**
     * Parses dual-pane orientation from local storage
     */
    private parseDualPaneOrientation(raw: unknown): DualPaneOrientation | null {
        if (raw === 'vertical') {
            return 'vertical';
        }
        if (raw === 'horizontal') {
            return 'horizontal';
        }
        return null;
    }

    /**
     * Unregister a settings update callback
     * Called when React views unmount to prevent memory leaks
     */
    public unregisterSettingsUpdateListener(id: string): void {
        this.settingsUpdateListeners.delete(id);
    }

    /**
     * Rebuilds the entire Notebook Navigator cache.
     * Activates the view if needed and delegates to the view's rebuild method.
     * Throws if plugin is unloading or view is not available.
     */
    public async rebuildCache(): Promise<void> {
        // Prevent rebuild if plugin is being unloaded
        if (this.isUnloading) {
            throw new Error('Plugin is unloading');
        }

        // Ensure the Navigator view is active before rebuilding
        await this.activateView();

        // Find the Navigator view leaf in the workspace
        const leaf = this.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW)[0];
        if (!leaf) {
            throw new Error('Notebook Navigator view not available');
        }

        // Get the view instance and delegate the rebuild operation
        const { view } = leaf;
        if (!(view instanceof NotebookNavigatorView)) {
            throw new Error('Notebook Navigator view not found');
        }

        await view.rebuildCache();
    }

    public isExternalIconProviderInstalled(providerId: ExternalIconProviderId): boolean {
        return this.externalIconController?.isProviderInstalled(providerId) ?? false;
    }

    public isExternalIconProviderDownloading(providerId: ExternalIconProviderId): boolean {
        return this.externalIconController?.isProviderDownloading(providerId) ?? false;
    }

    public getExternalIconProviderVersion(providerId: ExternalIconProviderId): string | null {
        return this.externalIconController?.getProviderVersion(providerId) ?? null;
    }

    public async downloadExternalIconProvider(providerId: ExternalIconProviderId): Promise<void> {
        if (!this.externalIconController) {
            throw new Error('External icon controller not initialized');
        }
        await this.externalIconController.installProvider(providerId);
    }

    public async removeExternalIconProvider(providerId: ExternalIconProviderId): Promise<void> {
        if (!this.externalIconController) {
            throw new Error('External icon controller not initialized');
        }
        await this.externalIconController.removeProvider(providerId);
    }

    /**
     * Register a callback to be notified when files are renamed
     * Used by React views to update selection state
     */
    public registerFileRenameListener(id: string, callback: (oldPath: string, newPath: string) => void): void {
        this.fileRenameListeners.set(id, callback);
    }

    /**
     * Unregister a file rename callback
     * Called when React views unmount to prevent memory leaks
     */
    public unregisterFileRenameListener(id: string): void {
        this.fileRenameListeners.delete(id);
    }

    public notifyFileRenameListeners(oldPath: string, newPath: string): void {
        this.fileRenameListeners.forEach(callback => {
            try {
                callback(oldPath, newPath);
            } catch (error) {
                console.error('Error in file rename listener:', error);
            }
        });
    }

    /**
     * Guards against duplicate teardown and flushes critical services before
     * either Obsidian quits or the plugin unloads.
     */
    private initiateShutdown(): void {
        if (this.isUnloading) {
            return;
        }

        this.isUnloading = true;

        try {
            // Ensure recent notes/icons hit disk before the process exits
            this.recentDataManager?.flushPendingPersists();
        } catch (error) {
            console.error('Failed to flush recent data during shutdown:', error);
        }

        if (this.commandQueue) {
            // Drop any queued operations so listeners stop reacting
            this.commandQueue.clearAllOperations();
        }

        this.stopNavigatorContentProcessing();

        shutdownDatabase();
    }

    /**
     * Stops background processing inside every mounted navigator view to avoid
     * running content providers while shutdown is in progress.
     */
    private stopNavigatorContentProcessing(): void {
        try {
            const navigatorLeaves = this.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW);
            for (const leaf of navigatorLeaves) {
                const view = leaf.view;
                if (view instanceof NotebookNavigatorView) {
                    // Halt preview/tag generation loops inside each React view
                    view.stopContentProcessing();
                }
            }

            const calendarLeaves = this.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_CALENDAR_VIEW);
            for (const leaf of calendarLeaves) {
                const view = leaf.view;
                if (view instanceof NotebookNavigatorCalendarView) {
                    view.stopContentProcessing();
                }
            }
        } catch (error) {
            console.error('Failed stopping content processing during shutdown:', error);
        }
    }

    /**
     * Plugin cleanup - called when plugin is disabled or updated
     * Removes ribbon icon but preserves open views to maintain user workspace
     * Per Obsidian guidelines: leaves should not be detached in onunload
     */
    onunload() {
        this.initiateShutdown();

        this.recentDataManager?.dispose();

        // Clear all listeners first to prevent any callbacks during cleanup
        this.settingsUpdateListeners.clear();
        this.fileRenameListeners.clear();
        this.recentDataListeners.clear();

        if (this.externalIconController) {
            this.externalIconController.dispose();
            this.externalIconController = null;
        }

        // Clean up the metadata service
        if (this.metadataService) {
            this.metadataService.dispose();
            // Clear the reference to break circular dependencies
            this.metadataService = null;
        }

        // Clean up the tag operations service
        if (this.tagOperations) {
            this.tagOperations = null;
        }

        if (this.propertyOperations) {
            this.propertyOperations = null;
        }

        if (this.propertyTreeService) {
            this.propertyTreeService = null;
        }

        // Clean up the command queue service
        if (this.commandQueue) {
            this.commandQueue = null;
        }

        // Clean up the ribbon icon
        this.ribbonIconEl?.remove();
        this.ribbonIconEl = undefined;

        this.omnisearchService = null;
        this.recentDataManager = null;
    }

    /**
     * Clears localStorage data for the plugin.
     * Called on fresh install to ensure a clean start.
     * Preserves database version markers used for IndexedDB rebuild detection.
     */
    private clearAllLocalStorage() {
        // Clear all known localStorage keys
        // Get key names to enable proper TypeScript typing and avoid losing type information
        const storageKeyNames = Object.keys(STORAGE_KEYS) as (keyof LocalStorageKeys)[];
        storageKeyNames.forEach(storageKey => {
            if (storageKey === 'databaseSchemaVersionKey' || storageKey === 'databaseContentVersionKey') {
                return;
            }
            const key = STORAGE_KEYS[storageKey];
            localStorage.remove(key);
        });
    }

    // Rebuilds all settings records with null prototypes to prevent prototype pollution attacks
    private sanitizeSettingsRecords(): void {
        // Type-specific sanitizers that validate values match expected types
        const sanitizeStringMap = (record?: Record<string, string>): Record<string, string> => sanitizeRecord(record, isStringRecordValue);
        const sanitizeSortMap = (record?: Record<string, SortOption>): Record<string, SortOption> => sanitizeRecord(record, isSortOption);
        const sanitizeAlphaSortOrderMap = (
            record?: Record<string, 'alpha-asc' | 'alpha-desc'>
        ): Record<string, 'alpha-asc' | 'alpha-desc'> => sanitizeRecord(record, isAlphaSortOrder);
        const isAppearanceValue = (value: unknown): value is FolderAppearance => isPlainObjectRecordValue(value);
        const sanitizeAppearanceMap = (record?: Record<string, FolderAppearance>): Record<string, FolderAppearance> =>
            sanitizeRecord(record, isAppearanceValue);
        const sanitizeBooleanMap = (record?: Record<string, boolean>): Record<string, boolean> =>
            sanitizeRecord(record, isBooleanRecordValue);
        const sanitizeSettingsSyncMap = (record?: Record<string, SettingSyncMode>): Record<string, SettingSyncMode> =>
            sanitizeRecord(record, isSettingSyncMode);

        // Rebuild maps with null prototypes so keys like "constructor" never resolve to Object.prototype
        this.settings.folderColors = sanitizeStringMap(this.settings.folderColors);
        this.settings.folderBackgroundColors = sanitizeStringMap(this.settings.folderBackgroundColors);
        this.settings.fileColors = sanitizeStringMap(this.settings.fileColors);
        this.settings.tagColors = sanitizeStringMap(this.settings.tagColors);
        this.settings.tagBackgroundColors = sanitizeStringMap(this.settings.tagBackgroundColors);
        this.settings.propertyColors = sanitizeStringMap(this.settings.propertyColors);
        this.settings.propertyBackgroundColors = sanitizeStringMap(this.settings.propertyBackgroundColors);
        this.settings.folderSortOverrides = sanitizeSortMap(this.settings.folderSortOverrides);
        this.settings.tagSortOverrides = sanitizeSortMap(this.settings.tagSortOverrides);
        this.settings.folderTreeSortOverrides = sanitizeAlphaSortOrderMap(this.settings.folderTreeSortOverrides);
        this.settings.tagTreeSortOverrides = sanitizeAlphaSortOrderMap(this.settings.tagTreeSortOverrides);
        this.settings.propertyTreeSortOverrides = sanitizeAlphaSortOrderMap(this.settings.propertyTreeSortOverrides);
        this.settings.folderAppearances = sanitizeAppearanceMap(this.settings.folderAppearances);
        this.settings.tagAppearances = sanitizeAppearanceMap(this.settings.tagAppearances);
        this.settings.navigationSeparators = sanitizeBooleanMap(this.settings.navigationSeparators);
        this.settings.externalIconProviders = sanitizeBooleanMap(this.settings.externalIconProviders);
        this.settings.syncModes = sanitizeSettingsSyncMap(this.settings.syncModes);
        this.settings.pinnedNotes = clonePinnedNotesRecord(this.settings.pinnedNotes);
    }

    private normalizeIconSettings(settings: NotebookNavigatorSettings): void {
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

        settings.folderIcons = normalizeRecord(settings.folderIcons);
        settings.tagIcons = normalizeRecord(settings.tagIcons);
        settings.propertyIcons = normalizeRecord(settings.propertyIcons);
        settings.fileIcons = normalizeRecord(settings.fileIcons);
    }

    private normalizeFileIconMapSettings(settings: NotebookNavigatorSettings): void {
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

        if (typeof settings.showCategoryIcons !== 'boolean') {
            settings.showCategoryIcons = DEFAULT_SETTINGS.showCategoryIcons;
        }

        if (typeof settings.showFileIconUnfinishedTask !== 'boolean') {
            settings.showFileIconUnfinishedTask = DEFAULT_SETTINGS.showFileIconUnfinishedTask;
        }

        if (typeof settings.showFilenameMatchIcons !== 'boolean') {
            settings.showFilenameMatchIcons = DEFAULT_SETTINGS.showFilenameMatchIcons;
        }

        settings.fileTypeIconMap = normalizeIconMap(
            settings.fileTypeIconMap,
            normalizeFileTypeIconMapKey,
            DEFAULT_SETTINGS.fileTypeIconMap
        );

        settings.fileNameIconMap = normalizeIconMap(
            settings.fileNameIconMap,
            normalizeFileNameIconMapKey,
            DEFAULT_SETTINGS.fileNameIconMap
        );
    }

    private normalizeInterfaceIconsSettings(settings: NotebookNavigatorSettings): void {
        const raw = settings.interfaceIcons;
        if (!isPlainObjectRecordValue(raw)) {
            settings.interfaceIcons = sanitizeRecord(DEFAULT_SETTINGS.interfaceIcons, isStringRecordValue);
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

        settings.interfaceIcons = sanitizeRecord(normalizeUXIconMapRecord(source), isStringRecordValue);
    }

    /**
     * Normalizes tag-related settings to use lowercase keys
     * Ensures consistency regardless of manual edits or external changes
     * Preserves values while standardizing keys to lowercase
     */
    private normalizeTagSettings() {
        const normalizeRecord = <T>(record: Record<string, T> | undefined): Record<string, T> => {
            if (!record) return Object.create(null) as Record<string, T>;

            const normalized = Object.create(null) as Record<string, T>;
            // Remove inherited properties before normalizing to lowercase
            const sanitized = sanitizeRecord(record);
            for (const [key, value] of Object.entries(sanitized)) {
                const lowerKey = key.toLowerCase();
                // If there's a conflict (e.g., both "TODO" and "todo"), last one wins
                normalized[lowerKey] = value;
            }
            return normalized;
        };

        const normalizeArray = (array: string[] | undefined): string[] => {
            if (!array) return [];
            // Use Set to deduplicate in case of "TODO" and "todo" both present
            return [...new Set(array.map(s => s.toLowerCase()))];
        };

        if (this.settings.tagColors) {
            this.settings.tagColors = normalizeRecord(this.settings.tagColors);
        }

        if (this.settings.tagBackgroundColors) {
            this.settings.tagBackgroundColors = normalizeRecord(this.settings.tagBackgroundColors);
        }

        if (this.settings.tagIcons) {
            this.settings.tagIcons = normalizeRecord(this.settings.tagIcons);
        }

        if (this.settings.tagSortOverrides) {
            this.settings.tagSortOverrides = normalizeRecord(this.settings.tagSortOverrides);
        }

        if (this.settings.tagAppearances) {
            this.settings.tagAppearances = normalizeRecord(this.settings.tagAppearances);
        }

        if (Array.isArray(this.settings.vaultProfiles)) {
            this.settings.vaultProfiles.forEach(profile => {
                profile.hiddenTags = normalizeArray(profile.hiddenTags);
                profile.hiddenFileTags = normalizeArray(profile.hiddenFileTags);
            });
        }
    }

    /**
     * Returns a copy of settings without transient fields that should not be synced.
     */
    private getPersistableSettings(): NotebookNavigatorSettings {
        const rest = { ...this.settings } as Record<string, unknown>;
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
        const syncModeRegistry = this.getSyncModeRegistry();
        SYNC_MODE_SETTING_IDS.forEach(settingId => {
            if (!this.isLocal(settingId)) {
                return;
            }
            syncModeRegistry[settingId].deleteFromPersisted(rest);
        });
        return rest as unknown as NotebookNavigatorSettings;
    }

    private buildPatternCacheKey(selector: (profile: VaultProfile) => string[]): string {
        const profiles = Array.isArray(this.settings.vaultProfiles) ? this.settings.vaultProfiles : [];
        if (profiles.length === 0) {
            return '';
        }
        const entries = profiles.map(profile => ({
            id: profile.id ?? '',
            key: getPathPatternCacheKey(selector(profile) ?? [])
        }));
        entries.sort((a, b) => a.id.localeCompare(b.id));
        return entries.map(entry => `${entry.id}:${entry.key}`).join('\u0002');
    }

    // Clears matcher caches only when the associated patterns change.
    private refreshMatcherCachesIfNeeded(): void {
        const folderKey = this.buildPatternCacheKey(profile => profile.hiddenFolders);
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

    private async saveSettings(): Promise<void> {
        ensureVaultProfiles(this.settings);
        this.refreshMatcherCachesIfNeeded();
        const dataToPersist = this.getPersistableSettings();
        await this.saveData(dataToPersist);
    }

    /**
     * Saves current plugin settings to Obsidian's data storage and notifies listeners
     * Persists user preferences between sessions and triggers UI updates
     * Called whenever settings are modified
     */
    async saveSettingsAndUpdate() {
        await this.saveSettings();
        // Notify all listeners that settings have been updated
        this.onSettingsUpdate();
    }

    /**
     * Resets all persisted settings and local preferences back to defaults.
     * Clears plugin localStorage state (except IndexedDB version markers) and clears persisted settings so defaults apply.
     */
    public async resetAllSettings(): Promise<void> {
        if (this.isUnloading) {
            throw new Error('Plugin is unloading');
        }

        const preservedSyncModes = sanitizeRecord<SettingSyncMode>(this.settings.syncModes, isSettingSyncMode);

        // Clear local storage first so subsequent loads seed fresh defaults.
        this.clearAllLocalStorage();

        // Clear persisted settings; loadSettings will repopulate from DEFAULT_SETTINGS.
        await this.saveData({});
        await this.loadSettings();
        this.settings.syncModes = preservedSyncModes;
        await this.saveSettingsAndUpdate();

        // Reset per-device preferences not handled by loadSettings.
        this.dualPanePreference = this.settings.dualPane;
        localStorage.set(this.keys.dualPaneKey, this.dualPanePreference ? '1' : '0');
        this.dualPaneOrientationPreference = this.settings.dualPaneOrientation;
        localStorage.set(this.keys.dualPaneOrientationKey, this.dualPaneOrientationPreference);

        const defaults = getDefaultUXPreferences();
        this.uxPreferences = {
            ...defaults,
            includeDescendantNotes: this.settings.includeDescendantNotes
        };
        localStorage.set(this.keys.uxPreferencesKey, this.uxPreferences);
        localStorage.set(STORAGE_KEYS.localStorageVersionKey, LOCALSTORAGE_VERSION);

        if (this.settings.showRootFolder) {
            localStorage.set(STORAGE_KEYS.expandedFoldersKey, ['/']);
        }

        this.initializeRecentDataManager();
        this.onSettingsUpdate();
        this.notifyUXPreferencesUpdate();
    }

    /**
     * Notifies all registered listeners that settings have changed
     */
    public notifySettingsUpdate(): void {
        this.onSettingsUpdate();
    }

    private isObsidianSettingsModalOpen(): boolean {
        if (typeof document === 'undefined') {
            return false;
        }

        return document.querySelector('.modal.mod-settings, .modal-container.mod-settings') !== null;
    }

    private applyCalendarPlacementView(options: { force?: boolean; reveal?: boolean; activate?: boolean } = {}): void {
        if (this.isUnloading || !this.hasWorkspaceLayoutReady) {
            return;
        }

        const coordinator = this.workspaceCoordinator;
        if (!coordinator) {
            return;
        }

        const nextPlacement = this.settings.calendarPlacement;
        const previousPlacement = this.lastCalendarPlacement;
        const force = options.force ?? false;

        if (!force && previousPlacement === nextPlacement) {
            return;
        }

        this.lastCalendarPlacement = nextPlacement;
        const requestId = ++this.calendarPlacementRequestId;

        if (nextPlacement === 'right-sidebar') {
            const reveal = options.reveal ?? false;
            const activate = options.activate ?? reveal;
            runAsyncAction(() =>
                coordinator.ensureCalendarViewInRightSidebar({
                    reveal,
                    activate,
                    shouldContinue: () =>
                        !this.isUnloading &&
                        this.hasWorkspaceLayoutReady &&
                        this.calendarPlacementRequestId === requestId &&
                        this.settings.calendarPlacement === 'right-sidebar'
                })
            );
            return;
        }

        coordinator.detachCalendarViewLeaves();
    }

    /**
     * Removes unused metadata entries from settings and saves
     */
    public async runMetadataCleanup(): Promise<boolean> {
        if (!this.metadataService || this.isUnloading) {
            return false;
        }

        const changesMade = await this.metadataService.cleanupAllMetadata();
        if (changesMade) {
            await this.saveSettingsAndUpdate();
        }

        return changesMade;
    }

    /**
     * Returns a summary of how many unused metadata entries exist
     */
    public async getMetadataCleanupSummary(): Promise<MetadataCleanupSummary> {
        if (!this.metadataService || this.isUnloading) {
            return { folders: 0, tags: 0, properties: 0, files: 0, pinnedNotes: 0, separators: 0, total: 0 };
        }

        return this.metadataService.getCleanupSummary();
    }

    /**
     * Notifies all running views that the settings have been updated.
     * This triggers a re-render in the React components.
     */
    public onSettingsUpdate() {
        if (this.isUnloading) return;

        // Update API caches with new settings
        if (this.api) {
            if (this.api.metadata) {
                this.api.metadata.updateFromSettings(this.settings);
            }
        }

        // Create a copy of listeners to avoid issues if a callback modifies the map
        const listeners = Array.from(this.settingsUpdateListeners.values());
        listeners.forEach(callback => {
            try {
                callback();
            } catch {
                // Silently ignore errors from settings update callbacks
            }
        });

        const shouldRevealCalendarView =
            this.lastCalendarPlacement !== 'right-sidebar' && this.settings.calendarPlacement === 'right-sidebar';
        const shouldActivateCalendarView = shouldRevealCalendarView && !this.isObsidianSettingsModalOpen();
        this.applyCalendarPlacementView({ reveal: shouldRevealCalendarView, activate: shouldActivateCalendarView });
    }

    /**
     * Notifies all registered listeners about recent data changes
     */
    private notifyRecentDataUpdate(): void {
        if (this.isUnloading) {
            return;
        }

        // Call each registered listener callback
        const listeners = Array.from(this.recentDataListeners.values());
        listeners.forEach(callback => {
            try {
                callback();
            } catch {
                // Silently ignore errors from recent data callbacks
            }
        });
    }

    /**
     * Activates or creates the Notebook Navigator view
     * Reuses existing view if available, otherwise creates new one in left sidebar
     * Always reveals the view to ensure it's visible
     * @returns The workspace leaf containing the view, or null if creation failed
     */
    async activateView() {
        return this.workspaceCoordinator?.activateNavigatorView() ?? null;
    }

    /**
     * Gets all workspace leaves containing the navigator view
     */
    public getNavigatorLeaves(): WorkspaceLeaf[] {
        return this.workspaceCoordinator?.getNavigatorLeaves() ?? this.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW);
    }

    /**
     * Opens the navigator view, focuses the navigation pane, and selects the given folder
     * @param folder - Folder instance to highlight
     */
    async navigateToFolder(folder: TFolder, options?: NavigateToFolderOptions): Promise<void> {
        await this.activateView();

        const navigatorLeaves = this.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW);
        if (navigatorLeaves.length === 0) {
            return;
        }

        const leaf = navigatorLeaves[0];
        const view = leaf.view;
        if (view instanceof NotebookNavigatorView) {
            view.navigateToFolder(folder, options);
        }
    }

    /**
     * Navigates to a specific file in the navigator
     * Expands parent folders and scrolls to make the file visible
     * Note: This does NOT activate/show the view - callers must do that if needed
     * @param file - The file to navigate to in the navigator
     */
    async revealFileInActualFolder(file: TFile, options?: RevealFileOptions) {
        this.workspaceCoordinator?.revealFileInActualFolder(file, options);
    }

    /**
     * Reveals a file while preserving the nearest visible folder/tag context
     * @param file - File to surface in the navigator
     * @param options - Reveal behavior options
     */
    async revealFileInNearestFolder(file: TFile, options?: RevealFileOptions) {
        this.workspaceCoordinator?.revealFileInNearestFolder(file, options);
    }

    public resolveHomepageFile(): TFile | null {
        return this.homepageController?.resolveHomepageFile() ?? null;
    }

    public async openHomepage(trigger: 'startup' | 'command'): Promise<boolean> {
        return this.homepageController?.open(trigger) ?? false;
    }

    /**
     * Checks for new GitHub releases and updates the pending notice if a newer version is found.
     * @param force - If true, bypasses the minimum check interval
     */
    public async runReleaseUpdateCheck(force = false): Promise<void> {
        await this.evaluateReleaseUpdates(force);
    }

    /**
     * Clears the pending update notice without marking it as displayed.
     */
    public dismissPendingUpdateNotice(): void {
        this.setPendingUpdateNotice(null);
    }

    /**
     * Performs the actual release check and updates the pending notice.
     */
    private async evaluateReleaseUpdates(force = false): Promise<void> {
        if (!this.releaseCheckService || this.isUnloading) {
            return;
        }

        if (!this.settings.checkForUpdatesOnStart && !force) {
            return;
        }

        try {
            const notice = await this.releaseCheckService.checkForUpdates(force);
            this.setPendingUpdateNotice(notice ?? null);
        } catch {
            // Ignore release check failures silently
        }
    }

    /**
     * Updates the pending notice and notifies all listeners.
     * Skips notification if the notice hasn't actually changed.
     */
    private setPendingUpdateNotice(notice: ReleaseUpdateNotice | null): void {
        const currentVersion = this.pendingUpdateNotice?.version ?? null;
        const incomingVersion = notice?.version ?? null;
        const hasNotice = !!notice;
        const hadNotice = !!this.pendingUpdateNotice;

        // Skip if notice hasn't changed
        if (currentVersion === incomingVersion && hasNotice === hadNotice) {
            return;
        }

        this.pendingUpdateNotice = notice;

        if (!notice) {
            this.releaseCheckService?.clearPendingNotice();
        }

        this.notifyUpdateNoticeListeners();
    }

    /**
     * Notifies all registered listeners about the current update notice state.
     */
    private notifyUpdateNoticeListeners(): void {
        if (this.isUnloading) {
            return;
        }

        const listeners = Array.from(this.updateNoticeListeners.values());
        listeners.forEach(callback => {
            try {
                callback(this.pendingUpdateNotice);
            } catch {
                // Ignore listener errors to avoid breaking notification flow
            }
        });
    }

    /**
     * Check if the plugin has been updated and show release notes if needed
     */
    private async checkForVersionUpdate(params: { isFirstLaunch: boolean }): Promise<void> {
        const { isFirstLaunch } = params;
        // Get current version from manifest
        const currentVersion = this.manifest.version;

        // Get last shown version from settings
        const lastShownVersion = this.settings.lastShownVersion;

        // Initialize lastShownVersion on first install.
        if (!lastShownVersion) {
            if (isFirstLaunch) {
                this.settings.lastShownVersion = currentVersion;
                await this.saveSettingsAndUpdate();
                return;
            }

            const { getLatestReleaseNotes, isReleaseAutoDisplayEnabled } = await import('./releaseNotes');

            if (!isReleaseAutoDisplayEnabled(currentVersion)) {
                this.settings.lastShownVersion = currentVersion;
                await this.saveSettingsAndUpdate();
                return;
            }

            const { WhatsNewModal } = await import('./modals/WhatsNewModal');

            const releaseNotes = getLatestReleaseNotes();
            new WhatsNewModal(this.app, releaseNotes, this.settings.dateFormat, () => {
                // Save version after 1 second delay when user closes the modal
                setTimeout(() => {
                    // Wrap in runAsyncAction to handle async without blocking callback
                    runAsyncAction(async () => {
                        this.settings.lastShownVersion = currentVersion;
                        await this.saveSettingsAndUpdate();
                    });
                }, 1000);
            }).open();
            return;
        }

        // Check if version has changed
        if (lastShownVersion !== currentVersion) {
            // Import release notes helpers dynamically
            const {
                getReleaseNotesBetweenVersions,
                getLatestReleaseNotes,
                compareVersions,
                isReleaseAutoDisplayEnabled,
                shouldAutoDisplayReleaseNotesForUpdate
            } = await import('./releaseNotes');

            const isUpgrade = compareVersions(currentVersion, lastShownVersion) > 0;
            if (isUpgrade) {
                // For upgrades, auto-display is enabled when any release note in (lastShownVersion, currentVersion]
                // has showOnUpdate not explicitly set to false.
                if (!shouldAutoDisplayReleaseNotesForUpdate(lastShownVersion, currentVersion)) {
                    return;
                }
            } else if (!isReleaseAutoDisplayEnabled(currentVersion)) {
                return;
            }

            const { WhatsNewModal } = await import('./modals/WhatsNewModal');

            // Get release notes between versions
            let releaseNotes;
            if (isUpgrade) {
                // Show notes from last shown to current
                releaseNotes = getReleaseNotesBetweenVersions(lastShownVersion, currentVersion);
            } else {
                // Downgraded or same version - just show latest 5 releases
                releaseNotes = getLatestReleaseNotes();
            }

            // Show the info modal when version changes
            new WhatsNewModal(this.app, releaseNotes, this.settings.dateFormat, () => {
                // Save version after 1 second delay when user closes the modal
                setTimeout(() => {
                    // Wrap in runAsyncAction to handle async without blocking callback
                    runAsyncAction(async () => {
                        this.settings.lastShownVersion = currentVersion;
                        await this.saveSettingsAndUpdate();
                    });
                }, 1000);
            }).open();
        }
    }
}
