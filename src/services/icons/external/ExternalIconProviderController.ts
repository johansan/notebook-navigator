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

import { App, requestUrl } from 'obsidian';
import { IconService } from '../IconService';
import type { ISettingsProvider } from '../../../interfaces/ISettingsProvider';
import type { NotebookNavigatorSettings } from '../../../settings/types';
import { IconAssetDatabase, type IconAssetRecord } from './IconAssetDatabase';
import {
    EXTERNAL_ICON_PROVIDERS,
    type ExternalIconManifest,
    type ExternalIconProviderConfig,
    type ExternalIconProviderId
} from './providerRegistry';
import { FontAwesomeIconProvider } from '../providers/FontAwesomeIconProvider';
import { RpgAwesomeIconProvider } from '../providers/RpgAwesomeIconProvider';
import { BootstrapIconProvider } from '../providers/BootstrapIconProvider';
import { MaterialIconProvider } from '../providers/MaterialIconProvider';
import { PhosphorIconProvider } from '../providers/PhosphorIconProvider';
import { SimpleIconsProvider } from '../providers/SimpleIconsProvider';
import { strings } from '../../../i18n';
import { compareVersions } from '../../../utils/versionUtils';
import { BUNDLED_ICON_MANIFESTS } from './bundledManifests';
import { showNotice } from '../../../utils/noticeUtils';
import { sanitizeRecord } from '../../../utils/recordUtils';
import type { BaseFontIconProvider } from '../providers/BaseFontIconProvider';

interface InstallOptions {
    persistSetting?: boolean;
    manifest?: ExternalIconManifest;
    suppressDownloadNotice?: boolean;
}

interface RemoveOptions {
    persistSetting?: boolean;
}

/**
 * Coordinates external icon providers: downloads assets, stores them, and registers providers with IconService.
 */
export class ExternalIconProviderController {
    private readonly database: IconAssetDatabase;
    private readonly iconService: IconService;
    private readonly settingsProvider: ISettingsProvider & { settings: NotebookNavigatorSettings };
    private downloadChain: Promise<void> = Promise.resolve();
    private readonly downloadTasks = new Map<ExternalIconProviderId, Promise<void>>();
    private readonly installedProviders = new Set<ExternalIconProviderId>();
    private readonly providerVersions = new Map<ExternalIconProviderId, string>();
    private readonly activeProviders = new Map<ExternalIconProviderId, { provider: BaseFontIconProvider; version: string }>();
    // Providers enter this map before font parsing because they must remain disposable across the activation await.
    private readonly preparingProviders = new Map<ExternalIconProviderId, BaseFontIconProvider>();
    // Track which providers have already shown a failure notice to avoid duplicates
    private readonly failedActivationNoticeProviders = new Set<ExternalIconProviderId>();
    private readonly removalNoticeProviders = new Set<ExternalIconProviderId>();
    // Map of ongoing recovery tasks for failed providers
    private readonly recoveryTasks = new Map<ExternalIconProviderId, Promise<void>>();
    // Track recovery attempts to prevent infinite retry loops
    private readonly recoveryAttempts = new Map<ExternalIconProviderId, number>();
    private readonly updateNoticeProviders = new Set<ExternalIconProviderId>();
    private isInitialized = false;
    private isDisposed = false;

    constructor(app: App, iconService: IconService, settingsProvider: ISettingsProvider & { settings: NotebookNavigatorSettings }) {
        this.iconService = iconService;
        this.settingsProvider = settingsProvider;
        this.database = new IconAssetDatabase(app);
    }

    /**
     * Initializes the controller by loading cached provider data and syncing with settings.
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        await this.database.init();
        const records = await this.database.getAll();
        records.forEach(record => {
            const id = record.id as ExternalIconProviderId;
            if (EXTERNAL_ICON_PROVIDERS[id]) {
                this.installedProviders.add(id);
                this.providerVersions.set(id, record.version);
            }
        });

        await this.removeDisabledProviders();

        this.isInitialized = true;

        await this.applyBundledUpdates();
    }

    /**
     * Disposes and unregisters active or preparing providers, then closes the database connection.
     */
    dispose(): void {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;

        const providerIds = new Set([...this.preparingProviders.keys(), ...this.activeProviders.keys()]);
        providerIds.forEach(id => this.deactivateProvider(id));
        this.database.close();
        this.isInitialized = false;
    }

    isProviderInstalled(id: ExternalIconProviderId): boolean {
        return this.installedProviders.has(id);
    }

    isProviderDownloading(id: ExternalIconProviderId): boolean {
        return this.downloadTasks.has(id);
    }

    getProviderVersion(id: ExternalIconProviderId): string | null {
        return this.providerVersions.get(id) ?? null;
    }

    /**
     * Downloads and installs an external icon provider's assets.
     */
    async installProvider(id: ExternalIconProviderId, options: InstallOptions = {}): Promise<void> {
        await this.ensureInitialized();

        const existingTask = this.downloadTasks.get(id);
        if (existingTask) {
            return existingTask;
        }

        const task = this.enqueue(() => this.installProviderWithinQueue(id, options));

        this.downloadTasks.set(id, task);
        try {
            await task;
        } finally {
            this.downloadTasks.delete(id);
        }
    }

    /** Performs one install inside the controller queue so recovery can reuse it without enqueuing behind itself. */
    private async installProviderWithinQueue(id: ExternalIconProviderId, options: InstallOptions): Promise<void> {
        const config = this.requireProviderConfig(id);

        const manifest = options.manifest ?? (await this.fetchManifest(config));
        const record = await this.downloadAssets(config, manifest);

        await this.database.put(record);
        this.installedProviders.add(id);
        this.providerVersions.set(id, record.version);
        this.removalNoticeProviders.delete(id);

        if (options.persistSetting !== false) {
            this.markProviderSetting(id, true);
        }

        const activated = await this.activateIfEnabled(config, record);
        if (activated && !options.suppressDownloadNotice) {
            this.showDownloadNotice(config);
        }

        if (options.persistSetting !== false) {
            await this.settingsProvider.saveSettingsAndUpdate();
        } else if (activated) {
            this.settingsProvider.notifySettingsUpdate();
        }
    }

    private async applyBundledUpdates(): Promise<void> {
        const tasks: Promise<void>[] = [];

        (Object.entries(BUNDLED_ICON_MANIFESTS) as [ExternalIconProviderId, ExternalIconManifest][]).forEach(([id, manifest]) => {
            if (!this.installedProviders.has(id)) {
                return;
            }

            const previousVersion = this.providerVersions.get(id);
            if (!previousVersion) {
                return;
            }

            if (compareVersions(manifest.version, previousVersion) <= 0) {
                return;
            }

            const config = this.requireProviderConfig(id);

            tasks.push(
                this.installProvider(id, {
                    persistSetting: false,
                    manifest,
                    suppressDownloadNotice: true
                })
                    .then(async () => {
                        const updatedVersion = this.providerVersions.get(id);
                        if (!updatedVersion || compareVersions(updatedVersion, previousVersion) <= 0) {
                            return;
                        }

                        if (this.updateNoticeProviders.has(id)) {
                            return;
                        }
                        this.updateNoticeProviders.add(id);
                        this.showUpdateNotice(config, updatedVersion);
                    })
                    .catch(error => {
                        console.error(`[IconProviders] Failed to update ${id} to version ${manifest.version}:`, error);
                    })
            );
        });

        if (tasks.length === 0) {
            return;
        }

        await Promise.all(tasks);
    }

    /**
     * Removes an installed provider and its cached assets.
     */
    async removeProvider(id: ExternalIconProviderId, options: RemoveOptions = {}): Promise<void> {
        await this.ensureInitialized();

        const config = this.requireProviderConfig(id);

        // Wait for any in-flight download before removing
        const existingTask = this.downloadTasks.get(id);
        if (existingTask) {
            try {
                await existingTask;
            } catch {
                // ignore download failure when removing
            }
        }

        await this.enqueue(async () => {
            const wasActive = this.deactivateProvider(config.id);
            await this.database.delete(config.id);
            this.installedProviders.delete(config.id);
            this.providerVersions.delete(config.id);
            this.updateNoticeProviders.delete(config.id);
            this.showRemovalNotice(config);

            if (options.persistSetting !== false) {
                this.markProviderSetting(config.id, false);
                await this.settingsProvider.saveSettingsAndUpdate();
            } else if (wasActive) {
                this.settingsProvider.notifySettingsUpdate();
            }
        });
    }

    /**
     * Synchronizes installed providers with user settings, installing/removing as needed.
     */
    async syncWithSettings(): Promise<void> {
        await this.ensureInitialized();
        const settings = this.settingsProvider.settings;
        const map = sanitizeRecord(settings.externalIconProviders);
        const tasks: Promise<void>[] = [];
        let shouldNotifyAfterLoop = false;

        (Object.keys(EXTERNAL_ICON_PROVIDERS) as ExternalIconProviderId[]).forEach(id => {
            const shouldEnable = !!map[id];
            if (shouldEnable) {
                const config = this.requireProviderConfig(id);
                tasks.push(
                    this.ensureProviderAvailable(config, { persistSetting: false }).catch(error => {
                        console.error(`[IconProviders] Failed to initialize provider ${id}:`, error);
                    })
                );
            } else {
                if (this.installedProviders.has(id)) {
                    shouldNotifyAfterLoop = true;
                    tasks.push(
                        this.removeProvider(id, { persistSetting: false }).catch(error => {
                            console.error(`[IconProviders] Failed to remove provider ${id}:`, error);
                        })
                    );
                } else if (this.deactivateProvider(id)) {
                    shouldNotifyAfterLoop = true;
                }
            }
        });

        await Promise.all(tasks);

        if (shouldNotifyAfterLoop) {
            this.settingsProvider.notifySettingsUpdate();
        }
    }

    /**
     * Ensures a provider is installed and activated if enabled in settings.
     */
    private async ensureProviderAvailable(config: ExternalIconProviderConfig, options: InstallOptions): Promise<void> {
        if (!this.isProviderInstalled(config.id)) {
            await this.installProvider(config.id, options);
            return;
        }

        const record = await this.database.get(config.id);
        if (!record) {
            this.installedProviders.delete(config.id);
            this.providerVersions.delete(config.id);
            await this.installProvider(config.id, options);
            return;
        }

        this.providerVersions.set(config.id, record.version);
        const activated = await this.activateIfEnabled(config, record);
        if (activated && options.persistSetting === false) {
            this.settingsProvider.notifySettingsUpdate();
        }
    }

    /**
     * Updates the provider's enabled/disabled state in settings.
     */
    private markProviderSetting(id: ExternalIconProviderId, enabled: boolean): void {
        const { settings } = this.settingsProvider;
        // Rebuild providers map with null prototype to prevent prototype pollution
        const providers = sanitizeRecord(settings.externalIconProviders);
        providers[id] = enabled;
        settings.externalIconProviders = providers;
    }

    /**
     * Deactivates and unregisters a provider from the IconService.
     */
    private deactivateProvider(id: ExternalIconProviderId): boolean {
        const preparingProvider = this.preparingProviders.get(id);
        const entry = this.activeProviders.get(id);
        let changed = false;
        if (preparingProvider) {
            // Preparation is not cancellable, so disposal makes its eventual completion stale before it can register.
            preparingProvider.dispose();
            this.preparingProviders.delete(id);
            changed = true;
        }
        if (entry) {
            entry.provider.dispose();
            this.activeProviders.delete(id);
            changed = true;
        }
        this.iconService.unregisterProvider(id);
        return changed;
    }

    /**
     * Activates a provider if it's enabled in settings.
     */
    private async activateIfEnabled(config: ExternalIconProviderConfig, record: IconAssetRecord): Promise<boolean> {
        const settings = this.settingsProvider.settings;
        if (this.isDisposed || !settings.externalIconProviders || !settings.externalIconProviders[config.id]) {
            return false;
        }

        const activeEntry = this.activeProviders.get(config.id);
        if (activeEntry && activeEntry.version === record.version) {
            return false;
        }

        if (activeEntry) {
            this.deactivateProvider(config.id);
        }

        const provider = this.createProvider(config, record);
        if (!provider) {
            // Provider creation failed - show error and attempt recovery
            this.showActivationFailureNotice(config);
            this.scheduleRecovery(config);
            return false;
        }

        if (!provider.isAvailable()) {
            provider.dispose();
            // Provider not available - show error and attempt recovery
            this.showActivationFailureNotice(config);
            this.scheduleRecovery(config);
            return false;
        }

        const previousPreparingProvider = this.preparingProviders.get(config.id);
        if (previousPreparingProvider) {
            previousPreparingProvider.dispose();
        }
        this.preparingProviders.set(config.id, provider);

        const activationDocument = activeDocument;
        try {
            // Registration and the success notice must wait until a document has parsed the font. Otherwise valid
            // metadata can advertise a pack whose glyphs cannot render in any document.
            await provider.prepare(activationDocument);
        } catch (error) {
            provider.dispose();
            const isCurrentPreparation = this.preparingProviders.get(config.id) === provider;
            if (!isCurrentPreparation || this.isDisposed || !this.isProviderEnabled(config.id)) {
                if (isCurrentPreparation) {
                    this.preparingProviders.delete(config.id);
                }
                return false;
            }
            this.preparingProviders.delete(config.id);
            console.error(`[IconProviders] Failed to prepare ${config.id} in the active document:`, error);
            this.showActivationFailureNotice(config);
            this.scheduleRecovery(config);
            return false;
        }

        // Settings changes and shutdown can run while the font parser is pending. Only the provider that still owns
        // this activation slot may register after the await; every other completion belongs to stale controller state.
        const isCurrentPreparation = this.preparingProviders.get(config.id) === provider;
        if (!isCurrentPreparation || this.isDisposed || !this.isProviderEnabled(config.id)) {
            if (isCurrentPreparation) {
                this.preparingProviders.delete(config.id);
            }
            provider.dispose();
            return false;
        }
        this.preparingProviders.delete(config.id);

        this.iconService.registerProvider(provider);
        const registered = this.iconService.getProvider(config.id);
        if (registered !== provider) {
            provider.dispose();
            // Registration failed - show error and attempt recovery
            this.showActivationFailureNotice(config);
            this.scheduleRecovery(config);
            return false;
        }

        // Successfully activated - track the provider and clear failure state
        this.activeProviders.set(config.id, { provider, version: record.version });
        this.failedActivationNoticeProviders.delete(config.id);
        this.recoveryAttempts.delete(config.id);
        this.removalNoticeProviders.delete(config.id);
        return true;
    }

    private isProviderEnabled(id: ExternalIconProviderId): boolean {
        return !!this.settingsProvider.settings.externalIconProviders?.[id];
    }

    /**
     * Creates a provider instance based on config type.
     */
    private createProvider(config: ExternalIconProviderConfig, record: IconAssetRecord): BaseFontIconProvider | null {
        switch (config.id) {
            case 'bootstrap-icons':
                return new BootstrapIconProvider({
                    record,
                    fontFamily: config.fontFamily
                });
            case 'fontawesome-solid':
                return new FontAwesomeIconProvider({
                    record,
                    fontFamily: config.fontFamily
                });
            case 'material-icons':
                return new MaterialIconProvider({
                    record,
                    fontFamily: config.fontFamily
                });
            case 'phosphor':
                return new PhosphorIconProvider({
                    record,
                    fontFamily: config.fontFamily
                });
            case 'rpg-awesome':
                return new RpgAwesomeIconProvider({
                    record,
                    fontFamily: config.fontFamily
                });
            case 'simple-icons':
                return new SimpleIconsProvider({
                    record,
                    fontFamily: config.fontFamily
                });
            default:
                return null;
        }
    }

    /**
     * Fetches the provider's manifest file containing version and asset URLs.
     */
    private async fetchManifest(config: ExternalIconProviderConfig): Promise<ExternalIconManifest> {
        const response = await requestUrl({
            url: config.manifestUrl,
            method: 'GET',
            headers: {
                'User-Agent': 'NotebookNavigator/1.0 (Obsidian Plugin)',
                Accept: 'application/json'
            },
            throw: false
        });

        if (response.status !== 200) {
            throw new Error(`Manifest request for ${config.id} failed with status ${response.status}`);
        }

        if (!response.json) {
            throw new Error(`Manifest response for ${config.id} is empty`);
        }

        const manifest = response.json as ExternalIconManifest;
        return manifest;
    }

    /**
     * Downloads font and metadata files for a provider.
     */
    private async downloadAssets(config: ExternalIconProviderConfig, manifest: ExternalIconManifest): Promise<IconAssetRecord> {
        const fontResponse = await requestUrl({
            url: manifest.font,
            method: 'GET',
            headers: {
                'User-Agent': 'NotebookNavigator/1.0 (Obsidian Plugin)'
            },
            throw: false
        });
        const metadataResponse = await requestUrl({
            url: manifest.metadata,
            method: 'GET',
            headers: {
                'User-Agent': 'NotebookNavigator/1.0 (Obsidian Plugin)',
                Accept: 'application/json'
            },
            throw: false
        });

        if (fontResponse.status !== 200) {
            throw new Error(`Font download for ${config.id} failed with status ${fontResponse.status}`);
        }

        if (metadataResponse.status !== 200) {
            throw new Error(`Metadata download for ${config.id} failed with status ${metadataResponse.status}`);
        }

        const data = fontResponse.arrayBuffer;
        const metadata = metadataResponse.text;

        if (!data) {
            throw new Error(`Failed to download font for provider ${config.id}`);
        }

        if (!metadata) {
            throw new Error(`Failed to download metadata for provider ${config.id}`);
        }

        return {
            id: config.id,
            version: manifest.version,
            mimeType: manifest.fontMimeType ?? 'font/woff2',
            data,
            metadataFormat: manifest.metadataFormat ?? 'json',
            metadata,
            updated: Date.now()
        };
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Removes installed providers that are disabled in settings.
     */
    private async removeDisabledProviders(): Promise<void> {
        if (this.installedProviders.size === 0) {
            return;
        }

        const settings = this.settingsProvider.settings;
        const map = settings.externalIconProviders || {};
        const toRemove: ExternalIconProviderId[] = [];

        this.installedProviders.forEach(id => {
            if (!map[id]) {
                toRemove.push(id);
            }
        });

        if (toRemove.length === 0) {
            return;
        }

        await Promise.all(
            toRemove.map(async id => {
                this.deactivateProvider(id);
                this.installedProviders.delete(id);
                this.providerVersions.delete(id);
                this.updateNoticeProviders.delete(id);
                try {
                    await this.database.delete(id);
                } catch (error) {
                    console.error(`[IconProviders] Failed to delete cached assets for ${id}:`, error);
                }
            })
        );
    }

    /**
     * Queues async tasks to prevent concurrent database operations.
     */
    private enqueue(task: () => Promise<void>): Promise<void> {
        const wrappedTask = async () => {
            await task();
        };
        const run = this.downloadChain.then(wrappedTask);
        this.downloadChain = run.then(() => undefined).catch(() => undefined);
        return run;
    }

    private requireProviderConfig(id: ExternalIconProviderId): ExternalIconProviderConfig {
        const config = EXTERNAL_ICON_PROVIDERS[id];
        if (!config) {
            throw new Error(`Unknown external icon provider: ${id}`);
        }
        return config;
    }

    /**
     * Shows a notification when an icon pack fails to activate
     * Only shows one notification per provider to avoid spam
     */
    private showActivationFailureNotice(config: ExternalIconProviderConfig): void {
        // Check if we've already shown a notice for this provider
        if (this.failedActivationNoticeProviders.has(config.id)) {
            return;
        }
        this.failedActivationNoticeProviders.add(config.id);
        const message = strings.fileSystem.notifications.iconPackLoadFailed.replace('{provider}', config.name);
        showNotice(message, { variant: 'warning' });
    }

    /**
     * Schedules automatic recovery for a failed icon pack
     * Will attempt to re-download and reinstall the pack once
     * This handles cases where downloads fail or assets become corrupted
     */
    private scheduleRecovery(config: ExternalIconProviderConfig): void {
        const attempts = this.recoveryAttempts.get(config.id) ?? 0;
        // Only try recovery once per provider and skip if already in progress
        if (attempts >= 1 || this.recoveryTasks.has(config.id)) {
            return;
        }

        this.recoveryAttempts.set(config.id, attempts + 1);

        const task = this.enqueue(async () => {
            // Clean up the failed provider completely
            this.deactivateProvider(config.id);
            this.installedProviders.delete(config.id);
            this.providerVersions.delete(config.id);

            // Attempt to delete cached assets
            try {
                await this.database.delete(config.id);
            } catch (error) {
                console.error(`[IconProviders] Failed to delete cached assets for ${config.id} during recovery:`, error);
            }

            // Try to reinstall the provider fresh
            try {
                // This recovery task already owns the queue. Calling the public install method here would enqueue
                // behind this task while this task waits for it, so recovery performs the install directly.
                await this.installProviderWithinQueue(config.id, { persistSetting: false });
            } catch (error) {
                console.error(`[IconProviders] Failed to reinstall provider ${config.id} after activation failure:`, error);
            }
        })
            .catch(error => {
                console.error(`[IconProviders] Recovery task for ${config.id} failed:`, error);
            })
            .finally(() => {
                // Clean up the recovery task from tracking
                this.recoveryTasks.delete(config.id);
            });

        this.recoveryTasks.set(config.id, task);
    }

    /**
     * Shows a success notification when an icon pack is downloaded
     */
    private showDownloadNotice(config: ExternalIconProviderConfig): void {
        const message = strings.fileSystem.notifications.iconPackDownloaded.replace('{provider}', config.name);
        showNotice(message, { variant: 'success' });
    }

    /**
     * Shows a notification when an icon pack is removed
     */
    private showRemovalNotice(config: ExternalIconProviderConfig): void {
        if (this.removalNoticeProviders.has(config.id)) {
            return;
        }
        this.removalNoticeProviders.add(config.id);
        const message = strings.fileSystem.notifications.iconPackRemoved.replace('{provider}', config.name);
        showNotice(message);
    }

    private showUpdateNotice(config: ExternalIconProviderConfig, version: string): void {
        const message = strings.fileSystem.notifications.iconPackUpdated.replace('{provider}', config.name).replace('{version}', version);
        showNotice(message, { variant: 'success' });
    }
}
