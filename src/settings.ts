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

import { App, PluginSettingTab, Setting } from 'obsidian';
import type { SettingDefinitionItem, SettingDefinitionPage, SettingDefinitionRender } from 'obsidian';
import type NotebookNavigatorPlugin from './main';
import { TIMEOUTS } from './types/obsidian-extended';
import type { DebouncedTextAreaSettingOptions, SettingsTabContext, SettingDescription } from './settings/tabs/SettingsTabContext';
import { createStartResourcesSettingDefinitions } from './settings/tabs/StartResourcesSection';
import { advanceMarkdownPointBanner, createMarkdownPointBannerDefinitions } from './settings/markdownPointBanner';
import { createVaultSetupSettingDefinitions } from './settings/tabs/VaultSetupSection';
import { runAsyncAction } from './utils/async';
import { NOTEBOOK_NAVIGATOR_ICON_ID } from './constants/notebookNavigatorIcon';
import { SettingsDiagnosticsController } from './settings/SettingsDiagnosticsController';
import { SETTINGS_PAGE_GROUP_DEFINITIONS, SETTINGS_PANE_DEFINITION_MAP, type SettingsPaneId } from './settings/SettingsPaneDefinitions';
import {
    applyAppearanceBehaviorControlValue,
    getAppearanceBehaviorControlValue,
    isAppearanceBehaviorControlKey,
    needsAppearanceBehaviorDomStateRefresh
} from './settings/tabs/AppearanceBehaviorControlBindings';
import {
    applyNativeSettingControlValue,
    getNativeSettingControlValue,
    isNativeSettingControlKey,
    NATIVE_SETTING_DOM_STATE_REFRESH_KEYS,
    type NativeSettingControlKey
} from './settings/nativeSettingControls';

type DebouncedSettingUpdater = () => Promise<void> | void;

interface PendingDebouncedSettingUpdate {
    timer: number;
    updater: DebouncedSettingUpdater;
}

/**
 * Settings tab for configuring the Notebook Navigator plugin
 * Obsidian renders this tab from the native setting definitions returned by getSettingDefinitions().
 */
export class NotebookNavigatorSettingTab extends PluginSettingTab {
    plugin: NotebookNavigatorPlugin;
    // Pending debounced updates keyed by setting name
    private debouncedSettingUpdates: Map<string, PendingDebouncedSettingUpdate> = new Map();
    private settingsUpdateListenerId = 'settings-tab';
    private tabSettingsUpdateListeners = new Map<string, () => void>();
    private readonly diagnosticsController: SettingsDiagnosticsController;
    private settingsRenderContainerEl: HTMLElement | null = null;
    private settingsRenderCleanupCallbacks: (() => void)[] = [];
    // MarkdownPoint banner position for this settings open; hide() clears it so the next open moves on
    private markdownPointBannerPosition: number | null = null;
    // Registered settings tab that Obsidian renders native setting definitions on.
    // Obsidian stores rendered definition state on that tab, so DOM-state refreshes must run on it.
    private nativeSettingsHost: PluginSettingTab | null = null;

    /**
     * Creates a new settings tab
     * @param app - The Obsidian app instance
     * @param plugin - The plugin instance to configure
     */
    constructor(app: App, plugin: NotebookNavigatorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.diagnosticsController = new SettingsDiagnosticsController({
            app: this.app,
            plugin: this.plugin,
            registerInterval: intervalId => this.plugin.registerInterval(intervalId),
            scheduleDebouncedUpdate: (name, updater) => this.scheduleDebouncedSettingUpdate(name, updater)
        });

        this.icon = NOTEBOOK_NAVIGATOR_ICON_ID;
    }

    private ensureSettingsUpdateListener(): void {
        this.plugin.registerSettingsUpdateListener(this.settingsUpdateListenerId, () => {
            if (this.plugin.isExternalSettingsUpdate()) {
                this.refreshFromExternalSettingsUpdate();
                return;
            }

            this.refreshNativeSettingsDomState();
            const listeners = Array.from(this.tabSettingsUpdateListeners.values());
            listeners.forEach(callback => {
                try {
                    callback();
                } catch {
                    // Ignore errors from settings-tab UI callbacks
                }
            });
        });
    }

    setNativeSettingsHost(host: PluginSettingTab): void {
        this.nativeSettingsHost = host;
    }

    private refreshNativeSettingsDomState(): void {
        (this.nativeSettingsHost ?? this).refreshDomState();
    }

    private refreshFromExternalSettingsUpdate(): void {
        const renderContainerEl = this.settingsRenderContainerEl ?? this.containerEl;
        const scrollTop = renderContainerEl.scrollTop;
        this.updateNativeSettingsDefinitions();
        renderContainerEl.scrollTop = scrollTop;
    }

    private updateNativeSettingsDefinitions(): void {
        (this.nativeSettingsHost ?? this).update();
    }

    /**
     * Ensures only the most recent change for a given setting runs after the debounce delay.
     */
    private scheduleDebouncedSettingUpdate(name: string, updater: DebouncedSettingUpdater): void {
        const timerId = `setting-${name}`;
        const existingUpdate = this.debouncedSettingUpdates.get(timerId);
        if (existingUpdate) {
            window.clearTimeout(existingUpdate.timer);
        }

        const timer = window.setTimeout(() => {
            const pendingUpdate = this.debouncedSettingUpdates.get(timerId);
            if (!pendingUpdate || pendingUpdate.timer !== timer) {
                return;
            }

            this.debouncedSettingUpdates.delete(timerId);
            runAsyncAction(pendingUpdate.updater);
        }, TIMEOUTS.DEBOUNCE_SETTINGS);

        this.debouncedSettingUpdates.set(timerId, { timer, updater });
    }

    private flushDebouncedSettingUpdates(): void {
        const pendingUpdates = Array.from(this.debouncedSettingUpdates.values());
        this.debouncedSettingUpdates.clear();

        pendingUpdates.forEach(update => window.clearTimeout(update.timer));
        if (pendingUpdates.length === 0 || this.plugin.isShuttingDown()) {
            return;
        }

        runAsyncAction(async () => {
            for (const { updater } of pendingUpdates) {
                await updater();
            }
        });
    }

    /**
     * Configures a text setting with a debounced onChange handler
     * Prevents excessive updates while user is typing
     * Supports optional validation before applying changes
     */
    private configureDebouncedTextSetting(
        setting: Setting,
        name: string,
        desc: SettingDescription,
        placeholder: string,
        getValue: () => string,
        setValue: (value: string) => void,
        validator?: (value: string) => boolean,
        onAfterUpdate?: () => void
    ): Setting {
        return setting
            .setName(name)
            .setDesc(desc)
            .addText(text =>
                text
                    .setPlaceholder(placeholder)
                    .setValue(getValue())
                    .onChange(value => {
                        // Schedule debounced update to ensure async operations complete safely
                        this.scheduleDebouncedSettingUpdate(name, async () => {
                            const isValid = !validator || validator(value);
                            if (!isValid) {
                                return;
                            }
                            setValue(value);
                            await this.plugin.saveSettingsAndUpdate();
                            onAfterUpdate?.();
                        });
                    })
            );
    }

    /**
     * Configures a multiline text setting with a debounced onChange handler
     * Uses the same debounce timers as single-line inputs
     */
    private configureDebouncedTextAreaSetting(
        setting: Setting,
        name: string,
        desc: SettingDescription,
        placeholder: string,
        getValue: () => string,
        setValue: (value: string) => void,
        options?: DebouncedTextAreaSettingOptions
    ): Setting {
        const rows = options?.rows ?? 4;

        return setting
            .setName(name)
            .setDesc(desc)
            .addTextArea(textArea => {
                textArea.setPlaceholder(placeholder);
                textArea.setValue(getValue());
                textArea.inputEl.rows = rows;
                textArea.onChange(value => {
                    // Schedule debounced update to ensure async operations complete safely
                    this.scheduleDebouncedSettingUpdate(name, async () => {
                        const validator = options?.validator;
                        const isValid = !validator || validator(value);
                        if (!isValid) {
                            return;
                        }
                        setValue(value);
                        await this.plugin.saveSettingsAndUpdate();
                        options?.onAfterUpdate?.();
                    });
                });
            });
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        const context = this.createTabContext();

        // Native settings index: the MarkdownPoint banner at the top, vault controls, page links, the banner further
        // down when the Advanced setting moves it there, then informational resources.
        const isBannerAtTop = () => this.plugin.settings.showMarkdownPointBannerAtTop;
        const getBannerPosition = () => this.getMarkdownPointBannerPosition();
        const items: SettingDefinitionItem[] = [
            ...createMarkdownPointBannerDefinitions('top', isBannerAtTop, getBannerPosition),
            ...createVaultSetupSettingDefinitions(context),
            ...SETTINGS_PAGE_GROUP_DEFINITIONS.map(group => ({
                type: 'group' as const,
                heading: group.getHeading(),
                items: group.items.map(tabId => this.createNativeSettingsPageDefinition(tabId))
            })),
            ...createMarkdownPointBannerDefinitions('below', isBannerAtTop, getBannerPosition),
            ...createStartResourcesSettingDefinitions(context)
        ];

        return this.createNativeDefinitionItems(
            items,
            () => this.prepareNativeSettingsIndexRender(),
            () => this.finishNativeSettingsIndexRender()
        );
    }

    // Native controls route through the plugin save/update pipeline.
    getControlValue(key: string): unknown {
        if (isAppearanceBehaviorControlKey(key)) {
            return getAppearanceBehaviorControlValue(this.plugin.settings, key);
        }

        if (isNativeSettingControlKey(key)) {
            return getNativeSettingControlValue(this.plugin.settings, key);
        }

        return super.getControlValue(key);
    }

    async setControlValue(key: string, value: unknown): Promise<void> {
        if (isAppearanceBehaviorControlKey(key)) {
            const didApply = applyAppearanceBehaviorControlValue(this.plugin.settings, key, value);
            if (!didApply) {
                return;
            }

            if (needsAppearanceBehaviorDomStateRefresh(key)) {
                this.refreshNativeSettingsDomState();
            }

            await this.plugin.saveSettingsAndUpdate();
            return;
        }

        if (!isNativeSettingControlKey(key)) {
            await super.setControlValue(key, value);
            return;
        }

        const didApply = applyNativeSettingControlValue(this.plugin.settings, key, value);
        if (!didApply) {
            return;
        }

        this.handleNativeSettingControlPreSaveSideEffects(key);

        if (NATIVE_SETTING_DOM_STATE_REFRESH_KEYS.has(key)) {
            this.refreshNativeSettingsDomState();
        }

        await this.plugin.saveSettingsAndUpdate();
        await this.handleNativeSettingControlPostSaveSideEffects(key);
    }

    private handleNativeSettingControlPreSaveSideEffects(key: NativeSettingControlKey): void {
        if (key === 'checkForUpdatesOnStart' && !this.plugin.settings.checkForUpdatesOnStart) {
            this.plugin.dismissPendingUpdateNotice();
        }
    }

    private async handleNativeSettingControlPostSaveSideEffects(key: NativeSettingControlKey): Promise<void> {
        if (key === 'checkForUpdatesOnStart' && this.plugin.settings.checkForUpdatesOnStart) {
            await this.plugin.runReleaseUpdateCheck(true);
        }
    }

    private createNativeSettingsPageDefinition(tabId: SettingsPaneId): SettingDefinitionPage {
        const definition = SETTINGS_PANE_DEFINITION_MAP.get(tabId);
        const name = definition?.getLabel() ?? tabId;
        const desc = definition?.getDescription() ?? '';
        const definitionItems = definition?.createDefinitions(this.createTabContext()) ?? [];
        let pageContainerEl: HTMLElement | null = null;
        return {
            type: 'page' as const,
            name,
            desc,
            items: this.createNativeDefinitionItems(
                definitionItems,
                group => {
                    pageContainerEl = group.listEl;
                    this.prepareNativeSettingsPageDefinitionRender(tabId, group.listEl);
                },
                () => {
                    if (pageContainerEl) {
                        this.hideNativeSettingsPage(pageContainerEl);
                        pageContainerEl = null;
                    }
                }
            )
        };
    }

    private createNativeDefinitionItems(
        items: SettingDefinitionItem[],
        onFirstRender: (group: Parameters<SettingDefinitionRender['render']>[1]) => void,
        onLastCleanup: () => void
    ): SettingDefinitionItem[] {
        // Hidden sentinel provides page/index lifecycle hooks while Obsidian renders the visible rows.
        const lifecycleDefinition: SettingDefinitionRender = {
            name: '',
            searchable: false,
            visible: false,
            render: (setting, group) => {
                group.addClass('nn-settings-lifecycle-group');
                setting.settingEl.detach();
                onFirstRender(group);
                return onLastCleanup;
            }
        };

        return [lifecycleDefinition, ...items];
    }

    private hideNativeSettingsPage(containerEl: HTMLElement): void {
        containerEl.removeClass('nn-settings-tab-root');
        if (this.settingsRenderContainerEl === containerEl) {
            this.settingsRenderContainerEl = null;
        }
        this.resetRenderedSettingsState();
    }

    /** Re-renders within one settings open keep the banner the same; it moves on once per open. */
    private getMarkdownPointBannerPosition(): number {
        this.markdownPointBannerPosition ??= advanceMarkdownPointBanner();
        return this.markdownPointBannerPosition;
    }

    private prepareNativeSettingsIndexRender(): void {
        this.ensureSettingsUpdateListener();
        this.settingsRenderContainerEl = this.containerEl;
        this.containerEl.addClass('nn-settings-tab-root');
        this.resetRenderedSettingsState();
    }

    private prepareNativeSettingsPageDefinitionRender(tabId: SettingsPaneId, containerEl: HTMLElement): void {
        this.ensureSettingsUpdateListener();
        this.settingsRenderContainerEl = containerEl;
        containerEl.addClass('nn-settings-tab-root');
        this.resetRenderedSettingsState();
        this.diagnosticsController.handleTabActivation(tabId);
    }

    private finishNativeSettingsIndexRender(): void {
        this.resetRenderedSettingsState();
    }

    private resetRenderedSettingsState(): void {
        this.runSettingsRenderCleanup();
        this.diagnosticsController.prepareForRender();
        this.tabSettingsUpdateListeners.clear();
    }

    private runSettingsRenderCleanup(): void {
        const cleanupCallbacks = this.settingsRenderCleanupCallbacks;
        this.settingsRenderCleanupCallbacks = [];

        cleanupCallbacks.forEach(cleanup => {
            try {
                cleanup();
            } catch {
                // Ignore errors from settings-tab UI cleanup callbacks
            }
        });
    }

    /**
     * Creates a context object for rendering settings tabs
     * Provides access to app, plugin, and utility methods for tab rendering
     */
    private createTabContext(): SettingsTabContext {
        return {
            app: this.app,
            plugin: this.plugin,
            configureDebouncedTextSetting: (setting, name, desc, placeholder, getValue, setValue, validator, onAfterUpdate) =>
                this.configureDebouncedTextSetting(setting, name, desc, placeholder, getValue, setValue, validator, onAfterUpdate),
            configureDebouncedTextAreaSetting: (setting, name, desc, placeholder, getValue, setValue, options) =>
                this.configureDebouncedTextAreaSetting(setting, name, desc, placeholder, getValue, setValue, options),
            registerSettingsUpdateListener: (id, listener) => {
                this.tabSettingsUpdateListeners.set(id, listener);
            },
            unregisterSettingsUpdateListener: id => {
                this.tabSettingsUpdateListeners.delete(id);
            },
            registerSettingsRenderCleanup: cleanup => {
                this.settingsRenderCleanupCallbacks.push(cleanup);
            },
            registerMetadataInfoElement: (element, exportButton) => {
                this.diagnosticsController.registerMetadataInfoElement(element, exportButton);
            },
            registerStatsTextElement: element => {
                this.diagnosticsController.registerStatsTextElement(element);
            },
            requestStatisticsRefresh: () => {
                this.diagnosticsController.requestRefresh();
            },
            refreshSettingsDomState: () => {
                this.refreshNativeSettingsDomState();
            },
            ensureStatisticsInterval: () => {
                this.diagnosticsController.ensureStatisticsInterval();
            }
        };
    }

    /**
     * Called when settings tab is closed
     * Cleans up any pending debounce timers and intervals to prevent memory leaks
     */
    hide(): void {
        this.flushDebouncedSettingUpdates();
        super.hide();
        this.plugin.unregisterSettingsUpdateListener(this.settingsUpdateListenerId);

        this.debouncedSettingUpdates.forEach(update => window.clearTimeout(update.timer));
        this.debouncedSettingUpdates.clear();

        this.runSettingsRenderCleanup();
        this.diagnosticsController.dispose();

        // Clear references and state
        this.tabSettingsUpdateListeners.clear();
        this.markdownPointBannerPosition = null;
        this.settingsRenderContainerEl?.removeClass('nn-settings-tab-root');
        this.settingsRenderContainerEl = null;
        this.containerEl.removeClass('nn-settings-tab-root');
    }
}

export type {
    NotebookNavigatorSettings,
    SortOption,
    ListSortOverride,
    ListSortOverrideValue,
    AlphaSortOrder,
    ItemScope,
    MultiSelectModifier,
    DeleteAttachmentsSetting,
    FeatureImagePixelSizeSetting,
    FeatureImageSizeSetting,
    ListPaneTitleOption,
    PropertySortSecondaryOption,
    AlphabeticalDateMode
} from './settings/types';
