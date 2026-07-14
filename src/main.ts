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

import { App, Platform, Plugin, TFile, FileView, TFolder, WorkspaceLeaf, addIcon } from 'obsidian';
import type { NotebookNavigatorSettings } from './settings/types';
import { LazyNotebookNavigatorSettingTab } from './settings/LazyNotebookNavigatorSettingTab';
import type { NarrowSidebarLayout, NarrowSidebarTriggerMode } from './settings/types';
import {
    LocalStorageKeys,
    NOTEBOOK_NAVIGATOR_CALENDAR_VIEW,
    NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW,
    NOTEBOOK_NAVIGATOR_VIEW,
    STORAGE_KEYS,
    type DualPaneOrientation,
    type PinnedSectionCollapseKey,
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
import type { ExternalIconProviderController } from './services/icons/external/ExternalIconProviderController';
import type { ExternalIconProviderId } from './services/icons/external/providerRegistry';
import type { NavigateToFolderOptions } from './hooks/useNavigatorReveal';
import ReleaseCheckService, { type ReleaseUpdateNotice } from './services/ReleaseCheckService';
import { isNotebookNavigatorCalendarView, isNotebookNavigatorView } from './view/viewGuards';
import { localStorage } from './utils/localStorage';
import { INTERNAL_NOTEBOOK_NAVIGATOR_API, NotebookNavigatorAPI } from './api/NotebookNavigatorAPI';
import { initializeDatabase, shutdownDatabase } from './storage/fileOperations';
import { ExtendedApp } from './types/obsidian-extended';
import { getLeafSplitLocation } from './utils/workspaceSplit';
import { cloneCollapsedPinnedContextsRecord, sanitizeRecord } from './utils/recordUtils';
import { runAsyncAction } from './utils/async';
import WorkspaceCoordinator from './services/workspace/WorkspaceCoordinator';
import HomepageController from './services/workspace/HomepageController';
import { FolderNoteSidebarService } from './services/workspace/FolderNoteSidebarService';
import registerWorkspaceEvents from './services/workspace/registerWorkspaceEvents';
import registerNavigatorCommands from './services/commands/registerNavigatorCommands';
import type { RevealFileOptions } from './hooks/useNavigatorReveal';
import {
    type CalendarPlacement,
    type CalendarLeftPlacement,
    type CalendarWeeksToShow,
    type AlphaSortOrder,
    type FeatureImagePixelSizeSetting,
    type FeatureImageSizeSetting,
    isSettingSyncMode,
    type SettingSyncMode,
    type SyncModeSettingId,
    type TagSortOrder
} from './settings/types';
import { NOTEBOOK_NAVIGATOR_ICON_ID, NOTEBOOK_NAVIGATOR_ICON_SVG } from './constants/notebookNavigatorIcon';
import { PluginSettingsController, type SettingsLoadResult } from './services/settings/PluginSettingsController';
import { PluginPreferencesController } from './services/settings/PluginPreferencesController';
import { clearPendingPdfProcessingDiagnostic, consumePendingPdfProcessingDiagnostic } from './services/content/pdf/pdfCrashDiagnostics';
import {
    DebugLoggingService,
    recordStartupDiagnostic,
    recordStartupUserVisible,
    setDebugLoggingService
} from './services/diagnostics/DebugLoggingService';
import { applyModifiedSettingsTransfer, createModifiedSettingsTransfer, createSettingsTransferBaseName } from './settings/transfer';
import { DEFAULT_SETTINGS } from './settings/defaultSettings';
import { buildFilePathInFolder, generateUniqueFilename } from './utils/fileCreationUtils';
import { showNotice } from './utils/noticeUtils';
import { strings } from './i18n';

interface ObsidianSettingsModal {
    open(): void;
    openTabById(id: string): void;
}

interface AppWithSettingsModal extends App {
    setting?: ObsidianSettingsModal;
}

function getSettingsModal(app: App): ObsidianSettingsModal | null {
    const candidate = (app as AppWithSettingsModal).setting;
    if (!candidate || typeof candidate.open !== 'function' || typeof candidate.openTabById !== 'function') {
        return null;
    }

    return candidate;
}

/**
 * Main plugin class for Notebook Navigator
 * Provides a Notes-style file explorer for Obsidian with two-pane layout
 * Manages plugin lifecycle, settings, and view registration
 */
export default class NotebookNavigatorPlugin extends Plugin implements ISettingsProvider {
    ribbonIconEl: HTMLElement | undefined = undefined;
    metadataService: MetadataService | null = null;
    tagOperations: TagOperations | null = null;
    propertyOperations: PropertyOperations | null = null;
    tagTreeService: TagTreeService | null = null;
    propertyTreeService: PropertyTreeService | null = null;
    commandQueue: CommandQueueService | null = null;
    public settings: NotebookNavigatorSettings = { ...DEFAULT_SETTINGS };
    fileSystemOps: FileSystemOperations | null = null;
    omnisearchService: OmnisearchService | null = null;
    externalIconController: ExternalIconProviderController | null = null;
    api: NotebookNavigatorAPI | null = null;
    recentNotesService: RecentNotesService | null = null;
    releaseCheckService: ReleaseCheckService | null = null;
    debugLoggingService: DebugLoggingService | null = null;
    // Keys used for persisting UI state in browser localStorage
    keys: LocalStorageKeys = STORAGE_KEYS;
    // Map of callbacks to notify open React views when settings change
    private settingsUpdateListeners = new Map<string, () => void>();
    // Map of callbacks to notify open React views when files are renamed
    private fileRenameListeners = new Map<string, (oldPath: string, newPath: string) => void>();
    private updateNoticeListeners = new Map<string, (notice: ReleaseUpdateNotice | null) => void>();
    // Flag indicating plugin is being unloaded to prevent operations during shutdown
    private isUnloading = false;
    // Set after onload completes with settings; initialization is aborted when loading fails
    private hasStartedWithSettings = false;
    // Set when an external settings change arrives before initialization completes; drained at the end of onload
    private pendingExternalSettingsChange = false;
    private startupSettingsAbortController: AbortController | null = null;
    private isRestoringDefaultSettings = false;
    private isHandlingExternalSettingsUpdate = false;
    // Coordinates workspace interactions with the navigator view
    private workspaceCoordinator: WorkspaceCoordinator | null = null;
    // Handles homepage file opening and startup behavior
    private homepageController: HomepageController | null = null;
    private folderNoteSidebarService: FolderNoteSidebarService | null = null;
    private settingTab: LazyNotebookNavigatorSettingTab | null = null;
    private pendingUpdateNotice: ReleaseUpdateNotice | null = null;
    private hasWorkspaceLayoutReady = false;
    private lastCalendarPlacement: CalendarPlacement | null = null;
    private calendarPlacementRequestId = 0;
    private calendarCursorDateIso: string | null = null;
    private readonly settingsController = new PluginSettingsController({
        keys: this.keys,
        loadData: () => this.loadData(),
        saveData: data => this.saveData(data),
        mirrorUXPreferences: update => this.preferencesController.mirrorUXPreferences(update)
    });
    private readonly preferencesController = new PluginPreferencesController({
        keys: this.keys,
        getSettings: () => this.settings,
        notifySettingsUpdate: () => this.notifySettingsUpdate(),
        saveSettings: () => this.settingsController.saveSettings(),
        isShuttingDown: () => this.isUnloading,
        isLocal: settingId => this.isLocal(settingId),
        persistSyncModeSettingUpdate: settingId => this.persistSyncModeSettingUpdate(settingId),
        persistSyncModeSettingUpdateAsync: settingId => this.persistSyncModeSettingUpdateAsync(settingId),
        isOmnisearchAvailable: () => this.omnisearchService?.isAvailable() ?? false,
        refreshMatcherCachesIfNeeded: () => this.settingsController.refreshMatcherCachesIfNeeded()
    });

    public getSyncMode(settingId: SyncModeSettingId): SettingSyncMode {
        return this.settingsController.getSyncMode(settingId);
    }

    public isLocal(settingId: SyncModeSettingId): boolean {
        return this.settingsController.isLocal(settingId);
    }

    public isSynced(settingId: SyncModeSettingId): boolean {
        return this.settingsController.isSynced(settingId);
    }

    public openSettings(): boolean {
        const settingsModal = getSettingsModal(this.app);
        if (!settingsModal) {
            return false;
        }

        try {
            settingsModal.open();
            settingsModal.openTabById(this.manifest.id);
            return true;
        } catch {
            return false;
        }
    }

    public isDebugLoggingEnabled(): boolean {
        return this.debugLoggingService?.isEnabled() ?? false;
    }

    public setDebugLoggingEnabled(enabled: boolean): void {
        this.debugLoggingService?.setEnabled(enabled);
        if (!enabled) {
            clearPendingPdfProcessingDiagnostic();
        }
    }

    public async setSyncMode(settingId: SyncModeSettingId, mode: SettingSyncMode): Promise<void> {
        const changed = await this.settingsController.setSyncMode(settingId, mode);
        if (!changed) {
            return;
        }
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

    /**
     * Called when external changes to settings are detected (e.g., from sync)
     * This method is called automatically by Obsidian when the data.json file
     * is modified externally while the plugin is running
     */
    async onExternalSettingsChange() {
        if (this.isUnloading) {
            return;
        }
        if (!this.hasStartedWithSettings) {
            // Queue changes that arrive while onload is still loading settings; processed at the end of onload.
            // After an aborted startup the flag is never drained; restarting Obsidian is the documented recovery.
            this.pendingExternalSettingsChange = true;
            return;
        }

        const loadResult = await this.loadSettings();
        if (loadResult !== 'loaded') {
            // Keep current settings, mirrors, and UI when data.json is missing or unreadable during an external reload
            return;
        }
        const includeDescendantNotesChanged = this.preferencesController.syncMirrorsFromSettings();
        this.preferencesController.initializeRecentDataManager();
        this.notifySettingsUpdateWithFullRefresh();
        if (includeDescendantNotesChanged) {
            this.preferencesController.notifyUXPreferencesUpdate();
        }
    }

    /**
     * Loads plugin settings from Obsidian's data storage
     * Returns whether stored settings were loaded, the settings file is missing, or it exists but cannot be read
     */
    async loadSettings(): Promise<SettingsLoadResult> {
        const result = await this.settingsController.loadSettings();
        this.settings = this.settingsController.settings;
        return result;
    }

    /**
     * Returns the list of recent note paths from local storage
     */
    public getRecentNotes(): string[] {
        return this.preferencesController.getRecentNotes();
    }

    /**
     * Stores the list of recent note paths to local storage
     */
    public setRecentNotes(recentNotes: string[]): void {
        this.preferencesController.setRecentNotes(recentNotes);
    }

    /**
     * Trims the recent notes list to the configured maximum count
     */
    public applyRecentNotesLimit(): void {
        this.preferencesController.applyRecentNotesLimit();
    }

    /**
     * Registers a listener to be notified when recent data changes
     */
    public registerRecentDataListener(id: string, callback: () => void): void {
        this.preferencesController.registerRecentDataListener(id, callback);
    }

    /**
     * Unregisters a recent data change listener
     */
    public unregisterRecentDataListener(id: string): void {
        this.preferencesController.unregisterRecentDataListener(id);
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
        return this.preferencesController.getRecentIcons();
    }

    /**
     * Stores the map of recent icon IDs per provider to local storage
     */
    public setRecentIcons(recentIcons: Record<string, string[]>): void {
        this.preferencesController.setRecentIcons(recentIcons);
    }

    /**
     * Checks if the given file is open in the right sidebar
     */
    public isFileInRightSidebar(file: TFile): boolean {
        if (this.folderNoteSidebarService?.isSuppressingSidebarOpen(file.path)) {
            return true;
        }

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
        this.debugLoggingService = new DebugLoggingService(this.app, { pluginVersion: this.manifest.version });
        setDebugLoggingService(this.debugLoggingService);
        this.debugLoggingService.initialize();
        if (!this.debugLoggingService.isEnabled()) {
            clearPendingPdfProcessingDiagnostic();
        }
        recordStartupDiagnostic('onload.start', {
            pluginVersion: this.manifest.version,
            minAppVersion: this.manifest.minAppVersion
        });

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
        recordStartupDiagnostic('database.init.scheduled', {
            featureImageCacheMaxEntries,
            previewTextCacheMaxEntries,
            previewLoadMaxBatch
        });
        runAsyncAction(
            async () => {
                try {
                    recordStartupDiagnostic('database.init.start');
                    await initializeDatabase(appId, { featureImageCacheMaxEntries, previewTextCacheMaxEntries, previewLoadMaxBatch });
                    recordStartupDiagnostic('database.init.complete');
                } catch (error: unknown) {
                    recordStartupDiagnostic('database.init.failed', { error });
                    console.error('Failed to initialize database:', error);
                }
            },
            {
                onError: (error: unknown) => {
                    recordStartupDiagnostic('database.init.failed', { error });
                    console.error('Failed to initialize database:', error);
                }
            }
        );

        // Load settings with a short bounded retry window and check if this is first launch.
        // Runtime enablement uses the same grace period because sync can deliver data.json after the plugin files.
        const startupSettingsAbortController = new AbortController();
        this.startupSettingsAbortController = startupSettingsAbortController;
        const settingsLoadResult = await this.settingsController.loadSettingsAtStartup({
            signal: startupSettingsAbortController.signal
        });
        if (this.startupSettingsAbortController === startupSettingsAbortController) {
            this.startupSettingsAbortController = null;
        }
        if (this.isUnloading || settingsLoadResult === 'cancelled') {
            return;
        }
        this.settings = this.settingsController.settings;
        recordStartupDiagnostic('settings.loaded', { result: settingsLoadResult });
        if (settingsLoadResult === 'unavailable') {
            // data.json could not be read, or is missing on a device that ran the plugin before; stop before any
            // code path can overwrite it with defaults. The command offers explicit recovery for reinstalls and
            // permanently damaged settings files.
            this.registerSettingsRecoveryCommand();
            showNotice(strings.plugin.settingsUnavailableNotice, { timeout: 30000, variant: 'warning' });
            return;
        }
        const isFirstLaunch = settingsLoadResult === 'first-launch';
        this.preferencesController.syncMirrorsFromSettings();
        const storedLocalStorageVersion = this.settingsController.getStoredLocalStorageVersion();
        this.preferencesController.loadUXPreferences();

        // Handle first launch initialization
        if (isFirstLaunch) {
            // Clear all localStorage data (if plugin was reinstalled)
            this.settingsController.clearAllLocalStorage();

            // Re-seed per-device mirrors cleared above
            this.preferencesController.resetUXPreferencesToDefaults();
            this.settingsController.mirrorAllSyncModeSettingsToLocalStorage();
            this.preferencesController.syncMirrorsFromSettings();

            // Ensure root folder is expanded on first launch (default is enabled)
            if (this.settings.showRootFolder) {
                const expandedFolders = ['/'];
                localStorage.set(STORAGE_KEYS.expandedFoldersKey, expandedFolders);
            }

            // Set localStorage version
            this.settingsController.setLocalStorageVersion();
            await this.saveData(this.settingsController.getPersistableSettings());
        } else {
            // Check localStorage version for potential migrations
            const versionNumber =
                typeof storedLocalStorageVersion === 'number' ? storedLocalStorageVersion : Number(storedLocalStorageVersion ?? Number.NaN);
            if (!versionNumber || versionNumber !== this.settingsController.getCurrentLocalStorageVersion()) {
                // Future localStorage migration logic can go here
                this.settingsController.setLocalStorageVersion();
            }
        }

        // Initialize recent data management
        this.preferencesController.initializeRecentDataManager();

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
        this.folderNoteSidebarService = new FolderNoteSidebarService(this);
        this.folderNoteSidebarService.start();
        this.fileSystemOps = new FileSystemOperations(
            this.app,
            () => this.tagTreeService,
            () => this.propertyTreeService,
            () => this.commandQueue,
            () => this.metadataService,
            (): VisibilityPreferences => ({
                includeDescendantNotes: this.preferencesController.getUXPreferences().includeDescendantNotes,
                showHiddenItems: this.preferencesController.getUXPreferences().showHiddenItems
            }),
            this
        );
        this.omnisearchService = new OmnisearchService(this.app);
        this.api = new NotebookNavigatorAPI(this, this.app);
        this.metadataService.setFolderStyleChangeListener(folderPath => {
            if (this.isUnloading || !this.api) {
                return;
            }

            this.api[INTERNAL_NOTEBOOK_NAVIGATOR_API].metadata.emitFolderChangedForPath(folderPath);
        });
        this.releaseCheckService = new ReleaseCheckService(this);
        recordStartupDiagnostic('services.initialized');

        const iconService = getIconService();
        iconService.registerProvider(new VaultIconProvider(this.app));
        if (this.hasEnabledExternalIconProviders()) {
            this.syncExternalIconController();
        }

        // Re-sync icon settings when settings update
        this.registerSettingsUpdateListener('external-icon-controller', () => {
            if (this.externalIconController || this.hasEnabledExternalIconProviders()) {
                this.syncExternalIconController();
            }
        });

        // Register view
        this.registerView(NOTEBOOK_NAVIGATOR_VIEW, leaf => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports -- Obsidian registerView callbacks must construct views synchronously.
            const { NotebookNavigatorView } = require('./view/NotebookNavigatorView') as typeof import('./view/NotebookNavigatorView');
            return new NotebookNavigatorView(leaf, this);
        });
        this.registerView(NOTEBOOK_NAVIGATOR_CALENDAR_VIEW, leaf => {
            const { NotebookNavigatorCalendarView } =
                // eslint-disable-next-line @typescript-eslint/no-require-imports -- Obsidian registerView callbacks must construct views synchronously.
                require('./view/NotebookNavigatorCalendarView') as typeof import('./view/NotebookNavigatorCalendarView');
            return new NotebookNavigatorCalendarView(leaf, this);
        });
        this.registerView(NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW, leaf => {
            const { FolderNoteSidebarPlaceholderView } =
                // eslint-disable-next-line @typescript-eslint/no-require-imports -- Obsidian registerView callbacks must construct views synchronously.
                require('./view/FolderNoteSidebarPlaceholderView') as typeof import('./view/FolderNoteSidebarPlaceholderView');
            return new FolderNoteSidebarPlaceholderView(leaf);
        });

        // Register commands
        registerNavigatorCommands(this);

        // ==== Settings tab ====
        this.settingTab = new LazyNotebookNavigatorSettingTab(this.app, this);
        this.addSettingTab(this.settingTab);

        // Register editor context menu
        registerWorkspaceEvents(this);

        // Post-layout initialization
        // Only auto-create the navigator view on first launch; upgrades restore existing leaves themselves
        const shouldActivateOnStartup = isFirstLaunch;

        this.app.workspace.onLayoutReady(() => {
            this.hasWorkspaceLayoutReady = true;
            recordStartupDiagnostic('layout.ready');
            // Execute startup tasks asynchronously to avoid blocking the layout
            runAsyncAction(async () => {
                recordStartupDiagnostic('layout.readyTasks.start');
                if (this.isUnloading) {
                    return;
                }

                await this.homepageController?.handleWorkspaceReady({ shouldActivateOnStartup });
                await this.folderNoteSidebarService?.handleWorkspaceReady();

                if (isFirstLaunch) {
                    const { WelcomeModal } = await import('./modals/WelcomeModal');
                    new WelcomeModal(this.app).open();
                }

                // PDF_CRASH_DIAGNOSTICS: show the last unfinished mobile PDF path from the previous session.
                const pendingPdfPath = consumePendingPdfProcessingDiagnostic();
                if (pendingPdfPath) {
                    this.debugLoggingService?.logReport('PDF processing from previous run', { path: pendingPdfPath });
                    const { InfoModal } = await import('./modals/InfoModal');
                    new InfoModal(this.app, {
                        title: 'PDF processing from previous run',
                        intro: 'The previous app session ended while this PDF thumbnail was being processed.',
                        items: [
                            `\`${pendingPdfPath}\``,
                            'This can also happen if Obsidian or Android closed the app before cleanup finished.'
                        ]
                    }).open();
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
                recordStartupDiagnostic('layout.readyTasks.complete');
                recordStartupUserVisible({ shouldActivateOnStartup });
            });
        });
        recordStartupDiagnostic('onload.complete');

        // Process external settings changes that arrived while onload was still initializing
        this.hasStartedWithSettings = true;
        if (this.pendingExternalSettingsChange) {
            this.pendingExternalSettingsChange = false;
            runAsyncAction(() => this.onExternalSettingsChange());
        }
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
        return this.preferencesController.useDualPane();
    }

    public isShuttingDown(): boolean {
        return this.isUnloading;
    }

    public async openFolderNoteInRightSidebar(folderNote: TFile): Promise<void> {
        await this.folderNoteSidebarService?.openFolderNote(folderNote);
    }

    public async syncFolderNoteSidebarToFolder(folder: TFolder | null): Promise<void> {
        await this.folderNoteSidebarService?.syncToSelectedFolder(folder);
    }

    /**
     * Updates the dual-pane preference and persists to local storage
     */
    public setDualPanePreference(enabled: boolean): void {
        this.preferencesController.setDualPanePreference(enabled);
    }

    /**
     * Toggles the dual-pane preference between enabled and disabled
     */
    public toggleDualPanePreference(): void {
        this.preferencesController.toggleDualPanePreference();
    }

    /**
     * Returns the active dual-pane orientation for this device
     */
    public getDualPaneOrientation(): DualPaneOrientation {
        return this.preferencesController.getDualPaneOrientation();
    }

    /**
     * Updates the dual-pane orientation and persists to vault-scoped local storage.
     */
    public async setDualPaneOrientation(orientation: DualPaneOrientation): Promise<void> {
        await this.preferencesController.setDualPaneOrientation(orientation);
    }

    /**
     * Updates the narrow sidebar fallback layout and persists it.
     */
    public setNarrowSidebarLayout(layout: NarrowSidebarLayout): void {
        this.preferencesController.setNarrowSidebarLayout(layout);
    }

    /**
     * Updates how the narrow sidebar switch threshold is calculated.
     */
    public setNarrowSidebarTriggerMode(mode: NarrowSidebarTriggerMode): void {
        this.preferencesController.setNarrowSidebarTriggerMode(mode);
    }

    /**
     * Updates the custom narrow sidebar switch width.
     */
    public setNarrowSidebarCustomWidth(width: number): void {
        this.preferencesController.setNarrowSidebarCustomWidth(width);
    }

    /**
     * Returns the UI scale for this device.
     */
    public getUIScale(): number {
        return this.preferencesController.getUIScale();
    }

    /**
     * Updates the UI scale for this device and persists to vault-local storage.
     */
    public setUIScale(scale: number): void {
        this.preferencesController.setUIScale(scale);
    }

    /**
     * Returns the current tag sort order preference.
     */
    public getTagSortOrder(): TagSortOrder {
        return this.preferencesController.getTagSortOrder();
    }

    /**
     * Returns the current property sort order preference.
     */
    public getPropertySortOrder(): TagSortOrder {
        return this.preferencesController.getPropertySortOrder();
    }

    /**
     * Returns the current folder sort order preference.
     */
    public getFolderSortOrder(): AlphaSortOrder {
        return this.preferencesController.getFolderSortOrder();
    }

    /**
     * Updates the tag sort order preference and persists to local storage.
     */
    public setTagSortOrder(order: TagSortOrder): void {
        this.preferencesController.setTagSortOrder(order);
    }

    /**
     * Updates the property sort order preference and persists to local storage.
     */
    public setPropertySortOrder(order: TagSortOrder): void {
        this.preferencesController.setPropertySortOrder(order);
    }

    /**
     * Updates the folder sort order preference and persists to local storage.
     */
    public setFolderSortOrder(order: AlphaSortOrder): void {
        this.preferencesController.setFolderSortOrder(order);
    }

    /**
     * Returns the timestamp of the last release check (local-only).
     */
    public getReleaseCheckTimestamp(): number | null {
        return this.preferencesController.getReleaseCheckTimestamp();
    }

    /**
     * Persists the last release check timestamp to local storage.
     */
    public setReleaseCheckTimestamp(timestamp: number): void {
        this.preferencesController.setReleaseCheckTimestamp(timestamp);
    }

    /**
     * Retrieves recent colors history from vault-local storage.
     */
    public getRecentColors(): string[] {
        return this.preferencesController.getRecentColors();
    }

    /**
     * Persists recent colors history to vault-local storage.
     */
    public setRecentColors(recentColors: string[]): void {
        this.preferencesController.setRecentColors(recentColors);
    }

    /**
     * Returns the active search provider preference.
     */
    public getSearchProvider(): 'internal' | 'omnisearch' {
        return this.preferencesController.getSearchProvider();
    }

    /**
     * Updates the search provider preference and persists to local storage.
     */
    public setSearchProvider(provider: 'internal' | 'omnisearch'): void {
        this.preferencesController.setSearchProvider(provider);
    }

    /**
     * Updates the single-pane transition duration and persists to local storage.
     */
    public setPaneTransitionDuration(durationMs: number): void {
        this.preferencesController.setPaneTransitionDuration(durationMs);
    }

    /**
     * Persists toolbar button visibility to local storage.
     */
    public persistToolbarVisibility(): void {
        this.preferencesController.persistToolbarVisibility();
    }

    /**
     * Updates whether floating toolbars are used.
     */
    public setUseFloatingToolbars(enabled: boolean): void {
        this.preferencesController.setUseFloatingToolbars(enabled);
    }

    /**
     * Updates whether the navigation banner is pinned to the top of the navigation pane.
     */
    public setPinNavigationBanner(enabled: boolean): void {
        this.preferencesController.setPinNavigationBanner(enabled);
    }

    /**
     * Updates navigation tree indentation and persists to local storage.
     */
    public setNavIndent(indent: number): void {
        this.preferencesController.setNavIndent(indent);
    }

    /**
     * Updates navigation item height and persists to local storage.
     */
    public setNavItemHeight(height: number): void {
        this.preferencesController.setNavItemHeight(height);
    }

    /**
     * Updates navigation text scaling with item height and persists to local storage.
     */
    public setNavItemHeightScaleText(enabled: boolean): void {
        this.preferencesController.setNavItemHeightScaleText(enabled);
    }

    /**
     * Updates calendar weeks to show and persists to local storage.
     */
    public setCalendarWeeksToShow(weeks: CalendarWeeksToShow): void {
        this.preferencesController.setCalendarWeeksToShow(weeks);
    }

    public setCalendarPlacement(placement: CalendarPlacement): void {
        this.preferencesController.setCalendarPlacement(placement);
    }

    public setCalendarLeftPlacement(placement: CalendarLeftPlacement): void {
        this.preferencesController.setCalendarLeftPlacement(placement);
    }

    public getCalendarCursorDateIso(): string | null {
        return this.calendarCursorDateIso;
    }

    public setCalendarCursorDateIso(dateIso: string): void {
        this.calendarCursorDateIso = dateIso;
    }

    /**
     * Updates compact list item height and persists to local storage.
     */
    public setCompactItemHeight(height: number): void {
        this.preferencesController.setCompactItemHeight(height);
    }

    /**
     * Updates compact list text scaling with item height and persists to local storage.
     */
    public setCompactItemHeightScaleText(enabled: boolean): void {
        this.preferencesController.setCompactItemHeightScaleText(enabled);
    }

    /**
     * Updates the feature image display size and persists to local storage.
     */
    public setFeatureImageSize(size: FeatureImageSizeSetting): void {
        this.preferencesController.setFeatureImageSize(size);
    }

    /**
     * Updates the feature image thumbnail pixel size and persists to local storage.
     */
    public setFeatureImagePixelSize(size: FeatureImagePixelSizeSetting): void {
        this.preferencesController.setFeatureImagePixelSize(size);
    }

    /**
     * Sets the active vault profile and synchronizes hidden folder, tag, and note patterns.
     */
    public setVaultProfile(profileId: string): void {
        this.preferencesController.setVaultProfile(profileId);
    }

    public getUXPreferences(): UXPreferences {
        return this.preferencesController.getUXPreferences();
    }

    public registerUXPreferencesListener(id: string, callback: () => void): void {
        this.preferencesController.registerUXPreferencesListener(id, callback);
    }

    public unregisterUXPreferencesListener(id: string): void {
        this.preferencesController.unregisterUXPreferencesListener(id);
    }

    public setSearchActive(value: boolean): void {
        this.preferencesController.setSearchActive(value);
    }

    public setIncludeDescendantNotes(value: boolean): void {
        this.preferencesController.setIncludeDescendantNotes(value);
    }

    public toggleIncludeDescendantNotes(): void {
        this.preferencesController.toggleIncludeDescendantNotes();
    }

    public setShowHiddenItems(value: boolean): void {
        this.preferencesController.setShowHiddenItems(value);
    }

    public toggleShowHiddenItems(): void {
        this.preferencesController.toggleShowHiddenItems();
    }

    public setPinShortcuts(value: boolean): void {
        this.preferencesController.setPinShortcuts(value);
    }

    public setShowCalendar(value: boolean): void {
        this.preferencesController.setShowCalendar(value);
    }

    public toggleShowCalendar(): void {
        this.preferencesController.toggleShowCalendar();
    }

    public async togglePinnedGroupCollapsed(collapseKey: PinnedSectionCollapseKey): Promise<void> {
        const collapsedContexts = cloneCollapsedPinnedContextsRecord(this.settings.collapsedPinnedContexts);
        if (collapsedContexts[collapseKey]) {
            delete collapsedContexts[collapseKey];
        } else {
            collapsedContexts[collapseKey] = true;
        }

        this.settings.collapsedPinnedContexts = collapsedContexts;
        await this.saveSettingsAndUpdate();
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
        if (!isNotebookNavigatorView(view)) {
            throw new Error('Notebook Navigator view not found');
        }

        if (!(await view.whenReady())) {
            throw new Error('Notebook Navigator view not ready');
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
        await this.getExternalIconController().installProvider(providerId);
    }

    public async removeExternalIconProvider(providerId: ExternalIconProviderId): Promise<void> {
        await this.getExternalIconController().removeProvider(providerId);
    }

    private hasEnabledExternalIconProviders(): boolean {
        const providers = sanitizeRecord(this.settings.externalIconProviders);
        return Object.values(providers).some(Boolean);
    }

    private getExternalIconController(): ExternalIconProviderController {
        if (!this.externalIconController) {
            const { ExternalIconProviderController } =
                // eslint-disable-next-line @typescript-eslint/no-require-imports -- External icon pack controller is only needed when packs are enabled or managed.
                require('./services/icons/external/ExternalIconProviderController') as typeof import('./services/icons/external/ExternalIconProviderController');
            this.externalIconController = new ExternalIconProviderController(this.app, getIconService(), this);
        }
        return this.externalIconController;
    }

    private syncExternalIconController(): void {
        runAsyncAction(
            async () => {
                const controller = this.getExternalIconController();
                await controller.initialize();
                await controller.syncWithSettings();
            },
            {
                onError: (error: unknown) => {
                    console.error('External icon controller init failed:', error);
                }
            }
        );
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
        this.startupSettingsAbortController?.abort();
        this.startupSettingsAbortController = null;

        try {
            // Ensure recent notes/icons hit disk before the process exits
            this.preferencesController.flushPendingPersists();
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
                if (isNotebookNavigatorView(view)) {
                    // Halt preview/tag generation loops inside each React view
                    view.stopContentProcessing();
                }
            }

            const calendarLeaves = this.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_CALENDAR_VIEW);
            for (const leaf of calendarLeaves) {
                const view = leaf.view;
                if (isNotebookNavigatorCalendarView(view)) {
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
        this.debugLoggingService?.dispose();
        setDebugLoggingService(null);
        this.debugLoggingService = null;

        this.preferencesController.dispose();

        this.folderNoteSidebarService?.dispose();
        this.folderNoteSidebarService = null;

        // Clear all listeners first to prevent any callbacks during cleanup
        this.settingsUpdateListeners.clear();
        this.fileRenameListeners.clear();

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

        this.settingTab = null;
        this.omnisearchService = null;
    }

    async saveSettingsAndUpdate() {
        await this.settingsController.saveSettings();
        this.onSettingsUpdate();
    }

    public createSettingsTransferJson(): string {
        return JSON.stringify(createModifiedSettingsTransfer(this.settings, this.manifest.version), null, 2);
    }

    public async saveSettingsTransferBackupToVaultRoot(): Promise<string> {
        const baseName = createSettingsTransferBaseName();
        const uniqueBaseName = generateUniqueFilename('', baseName, 'json', this.app);
        const filename = buildFilePathInFolder('', uniqueBaseName, 'json');
        const created = await this.app.vault.create(filename, this.createSettingsTransferJson());
        return created.path;
    }

    public async importSettingsTransfer(transferData: unknown): Promise<void> {
        if (this.isUnloading) {
            throw new Error('Plugin is unloading');
        }

        // Apply the merged record through the full settings pipeline in memory, then persist once.
        // No reread from disk: a transiently unreadable data.json cannot fail an import that already persisted.
        const mergedRecord = applyModifiedSettingsTransfer(this.settings, transferData);
        this.settingsController.applySettingsRecord(mergedRecord, { isFirstLaunch: false, preferRecordLocalValues: true });
        this.settings = this.settingsController.settings;
        this.settingsController.prepareImportedUiScalePersistence();
        await this.settingsController.saveSettings();
        const includeDescendantNotesChanged = this.preferencesController.syncMirrorsFromSettings();
        this.preferencesController.initializeRecentDataManager();
        this.notifySettingsUpdateWithFullRefresh();

        if (includeDescendantNotesChanged) {
            this.preferencesController.notifyUXPreferencesUpdate();
        }
    }

    private notifySettingsUpdateWithFullRefresh(): void {
        try {
            this.isHandlingExternalSettingsUpdate = true;
            this.onSettingsUpdate();
        } finally {
            this.isHandlingExternalSettingsUpdate = false;
        }
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

        // Clear local storage first so the settings pipeline reseeds per-device mirrors from defaults.
        this.settingsController.clearAllLocalStorage();

        // Build default settings through the full settings pipeline in memory, then persist once.
        // No disk roundtrip: a transiently unreadable data.json cannot abort the reset halfway.
        this.settingsController.applySettingsRecord({}, { isFirstLaunch: false });
        this.settings = this.settingsController.settings;
        this.settings.syncModes = preservedSyncModes;
        await this.saveSettingsAndUpdate();

        this.preferencesController.resetUXPreferencesToDefaults();
        this.settingsController.mirrorAllSyncModeSettingsToLocalStorage();
        this.preferencesController.syncMirrorsFromSettings();
        this.settingsController.setLocalStorageVersion();

        if (this.settings.showRootFolder) {
            localStorage.set(STORAGE_KEYS.expandedFoldersKey, ['/']);
        }

        this.preferencesController.initializeRecentDataManager();
        this.onSettingsUpdate();
        this.preferencesController.notifyUXPreferencesUpdate();
    }

    /**
     * Registers the recovery command offered when startup aborts because data.json is missing or unreadable.
     * The command replaces the settings file with defaults after confirmation so reinstalls and permanently
     * damaged settings files have an explicit way back to a working plugin.
     */
    private registerSettingsRecoveryCommand(): void {
        this.addCommand({
            id: 'restore-default-settings',
            name: strings.commands.restoreDefaultSettings,
            callback: () => {
                runAsyncAction(async () => {
                    const { ConfirmModal } = await import('./modals/ConfirmModal');
                    new ConfirmModal(
                        this.app,
                        strings.plugin.settingsRecovery.confirmTitle,
                        strings.plugin.settingsRecovery.confirmMessage,
                        () => this.restoreDefaultSettingsFile(),
                        strings.plugin.settingsRecovery.confirmButton
                    ).open();
                });
            }
        });
    }

    /**
     * Replaces data.json with default settings and resets per-device localStorage state after verifying the write.
     * A readable settings file is copied to a timestamped backup in the plugin folder before it is overwritten.
     */
    private async restoreDefaultSettingsFile(): Promise<void> {
        if (this.isRestoringDefaultSettings) {
            return;
        }
        this.isRestoringDefaultSettings = true;

        try {
            await this.restoreDefaultSettingsFileInternal();
        } finally {
            this.isRestoringDefaultSettings = false;
        }
    }

    private async restoreDefaultSettingsFileInternal(): Promise<void> {
        const pluginDir = this.manifest.dir;
        if (!pluginDir) {
            showNotice(strings.plugin.settingsRecovery.failedNotice, { variant: 'warning' });
            return;
        }

        const adapter = this.app.vault.adapter;
        const dataPath = `${pluginDir}/data.json`;
        let backupContents: string | null = null;
        try {
            if (await adapter.exists(dataPath)) {
                backupContents = await adapter.read(dataPath);
            }
        } catch (error: unknown) {
            console.error('Failed to read settings file before recovery:', error);
            showNotice(strings.plugin.settingsRecovery.failedNotice, { variant: 'warning' });
            return;
        }
        if (backupContents !== null) {
            try {
                const backupPath = await this.getAvailableSettingsBackupPath(pluginDir);
                await adapter.write(backupPath, backupContents);
                const verifiedBackup = await adapter.read(backupPath);
                if (verifiedBackup !== backupContents) {
                    throw new Error('Settings backup verification failed');
                }
            } catch (error: unknown) {
                console.error('Failed to back up settings file before recovery:', error);
                showNotice(strings.plugin.settingsRecovery.failedNotice, { variant: 'warning' });
                return;
            }
        }

        const serializedDefaults = JSON.stringify(this.settingsController.getPersistableDefaultSettings(), null, 2);
        try {
            await adapter.write(dataPath, serializedDefaults);
            const verifiedContents = await adapter.read(dataPath);
            if (verifiedContents !== serializedDefaults) {
                throw new Error('Settings file verification failed after recovery write');
            }
        } catch (error: unknown) {
            console.error('Failed to write default settings during recovery:', error);
            showNotice(strings.plugin.settingsRecovery.failedNotice, { variant: 'warning' });
            return;
        }

        this.settingsController.clearAllLocalStorage();
        this.settingsController.applySettingsRecord(null, { isFirstLaunch: true });
        this.settings = this.settingsController.settings;
        this.settingsController.setLocalStorageVersion();
        if (this.settings.showRootFolder) {
            localStorage.set(STORAGE_KEYS.expandedFoldersKey, ['/']);
        }
        showNotice(strings.plugin.settingsRecovery.completedNotice, { timeout: 10000 });
    }

    private async getAvailableSettingsBackupPath(pluginDir: string): Promise<string> {
        const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        const basePath = `${pluginDir}/data-backup-${timestamp}`;
        let suffix = 0;

        while (true) {
            const candidate = `${basePath}${suffix === 0 ? '' : `-${suffix}`}.json`;
            if (!(await this.app.vault.adapter.exists(candidate))) {
                return candidate;
            }
            suffix += 1;
        }
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

        return activeDocument.querySelector('.modal.mod-settings, .modal-container.mod-settings') !== null;
    }

    private applyCalendarPlacementView(options: { force?: boolean; reveal?: boolean; activate?: boolean } = {}): void {
        if (this.isUnloading || !this.hasWorkspaceLayoutReady) {
            return;
        }

        const coordinator = this.workspaceCoordinator;
        if (!coordinator) {
            return;
        }

        const nextPlacement = this.settings.calendarEnabled ? this.settings.calendarPlacement : null;
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
                        this.settings.calendarEnabled &&
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
            this.api[INTERNAL_NOTEBOOK_NAVIGATOR_API].metadata.updateFromSettings(this.settings);
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
            this.lastCalendarPlacement !== 'right-sidebar' &&
            this.settings.calendarEnabled &&
            this.settings.calendarPlacement === 'right-sidebar';
        const shouldActivateCalendarView = shouldRevealCalendarView && !this.isObsidianSettingsModalOpen();
        this.applyCalendarPlacementView({ reveal: shouldRevealCalendarView, activate: shouldActivateCalendarView });
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
        if (isNotebookNavigatorView(view)) {
            view.navigateToFolder(folder, options);
        }
    }

    /**
     * Navigates to a specific file in the navigator
     * Expands parent folders and scrolls to make the file visible
     * Note: This does NOT activate/show the view - callers must do that if needed
     * Hidden files are not revealable while hidden items are off
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

    public canOpenHomepage(): boolean {
        return this.homepageController?.canOpenHomepage() ?? false;
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
            new WhatsNewModal(this.app, releaseNotes, () => {
                // Save version after 1 second delay when user closes the modal
                window.setTimeout(() => {
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
            new WhatsNewModal(this.app, releaseNotes, () => {
                // Save version after 1 second delay when user closes the modal
                window.setTimeout(() => {
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
