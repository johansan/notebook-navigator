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

import * as Obsidian from 'obsidian';
import { App, ButtonComponent, PluginSettingTab, requireApiVersion, Setting } from 'obsidian';
import type { SettingDefinitionItem, SettingDefinitionPage, SettingDefinitionRender } from 'obsidian';
import type NotebookNavigatorPlugin from './main';
import { TIMEOUTS } from './types/obsidian-extended';
import type {
    AddSettingFunction,
    DebouncedTextAreaSettingOptions,
    SettingsTabContext,
    SettingDescription
} from './settings/tabs/SettingsTabContext';
import { strings } from './i18n';
import { createStartResourcesSettingDefinitions } from './settings/tabs/StartResourcesSection';
import { createVaultSetupSettingDefinitions } from './settings/tabs/VaultSetupSection';
import { createSettingGroupFactory } from './settings/settingGroups';
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
 * Obsidian 1.13 renders this tab from native setting definitions.
 * display() remains the fallback for Obsidian versions before native settings pages.
 */
export class NotebookNavigatorSettingTab extends PluginSettingTab {
    plugin: NotebookNavigatorPlugin;
    // Pending debounced updates keyed by setting name
    private debouncedSettingUpdates: Map<string, PendingDebouncedSettingUpdate> = new Map();
    // Registered listeners for show tags visibility changes
    private showTagsListeners: ((visible: boolean) => void)[] = [];
    // Current visibility state of show tags setting
    private currentShowTagsVisible = false;
    private settingsUpdateListenerId = 'settings-tab';
    private tabSettingsUpdateListeners = new Map<string, () => void>();
    private readonly diagnosticsController: SettingsDiagnosticsController;
    private settingsRenderContainerEl: HTMLElement | null = null;
    private activeSettingsPage: { tabId: SettingsPaneId; containerEl: HTMLElement } | null = null;
    private isFallbackSettingsDisplay = false;
    private legacySettingsLandingScrollTop = 0;
    private settingsRenderCleanupCallbacks: (() => void)[] = [];
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
        const host = this.nativeSettingsHost ?? this;
        const refreshDomState: unknown = Reflect.get(host, 'refreshDomState');
        if (typeof refreshDomState === 'function') {
            refreshDomState.call(host);
        }
    }

    private refreshSettingsDomState(): void {
        if (!this.isFallbackSettingsDisplay) {
            this.refreshNativeSettingsDomState();
            return;
        }

        const scrollTop = this.containerEl.scrollTop;
        const activeLegacyTabId = this.activeSettingsPage?.containerEl === this.containerEl ? this.activeSettingsPage.tabId : null;

        if (activeLegacyTabId) {
            this.renderLegacySettingsPage(activeLegacyTabId);
        } else {
            this.renderLegacySettingsLanding();
        }

        this.containerEl.scrollTop = scrollTop;
    }

    private refreshFromExternalSettingsUpdate(): void {
        const renderContainerEl = this.settingsRenderContainerEl ?? this.containerEl;
        const scrollTop = renderContainerEl.scrollTop;

        if (this.isFallbackSettingsDisplay) {
            const activeLegacyTabId = this.activeSettingsPage?.containerEl === this.containerEl ? this.activeSettingsPage.tabId : null;
            if (activeLegacyTabId) {
                this.renderLegacySettingsPage(activeLegacyTabId);
            } else {
                this.renderLegacySettingsLanding();
            }
            this.containerEl.scrollTop = scrollTop;
            return;
        }

        if (this.activeSettingsPage?.containerEl.isConnected) {
            const { tabId, containerEl } = this.activeSettingsPage;
            this.renderNativeSettingsPage(tabId, containerEl);
            containerEl.scrollTop = scrollTop;
            return;
        }

        this.updateNativeSettingsDefinitions();
        renderContainerEl.scrollTop = scrollTop;
    }

    private updateNativeSettingsDefinitions(): void {
        const host = this.nativeSettingsHost ?? this;
        const update: unknown = Reflect.get(host, 'update');
        if (typeof update === 'function') {
            update.call(host);
        }
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

    private addToggleSetting(
        addSetting: AddSettingFunction,
        name: string,
        desc: string,
        getValue: () => boolean,
        setValue: (value: boolean) => void,
        onAfterUpdate?: () => void
    ): Setting {
        return addSetting(setting => {
            setting.setName(name).setDesc(desc);
            setting.addToggle(toggle =>
                toggle.setValue(getValue()).onChange(async value => {
                    setValue(value);
                    await this.plugin.saveSettingsAndUpdate();
                    onAfterUpdate?.();
                })
            );
        });
    }

    private addInfoSetting(
        addSetting: AddSettingFunction,
        cls: string | readonly string[],
        render: (descEl: HTMLElement) => void
    ): Setting {
        return addSetting(setting => {
            setting.setName('').setDesc('');

            const classNames = typeof cls === 'string' ? cls.split(/\s+/) : cls;
            for (const className of classNames) {
                if (className) {
                    setting.settingEl.addClass(className);
                }
            }

            const descEl = setting.descEl;
            descEl.empty();
            render(descEl);
        });
    }

    /**
     * Creates a text setting with debounced onChange handler
     * Prevents excessive updates while user is typing
     * Supports optional validation before applying changes
     * @param container - Container element for the setting
     * @param name - Setting display name
     * @param desc - Setting description
     * @param placeholder - Placeholder text for the input
     * @param getValue - Function to get current value
     * @param setValue - Function to set new value
     * @param validator - Optional validation function
     * @returns The created Setting instance
     */
    private createDebouncedTextSetting(
        container: HTMLElement,
        name: string,
        desc: SettingDescription,
        placeholder: string,
        getValue: () => string,
        setValue: (value: string) => void,
        validator?: (value: string) => boolean,
        onAfterUpdate?: () => void
    ): Setting {
        return this.configureDebouncedTextSetting(
            new Setting(container),
            name,
            desc,
            placeholder,
            getValue,
            setValue,
            validator,
            onAfterUpdate
        );
    }

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
     * Creates a multiline text setting with debounced onChange handler
     * Uses the same debounce timers as single-line inputs
     * @param container - Container element for the setting
     * @param name - Setting display name
     * @param desc - Setting description
     * @param placeholder - Placeholder text for the textarea
     * @param getValue - Function to get current value
     * @param setValue - Function to set new value
     * @param options - Optional configuration for validation and row count
     * @returns The created Setting instance
     */
    private createDebouncedTextAreaSetting(
        container: HTMLElement,
        name: string,
        desc: SettingDescription,
        placeholder: string,
        getValue: () => string,
        setValue: (value: string) => void,
        options?: DebouncedTextAreaSettingOptions
    ): Setting {
        return this.configureDebouncedTextAreaSetting(new Setting(container), name, desc, placeholder, getValue, setValue, options);
    }

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

    /**
     * Fallback used by Obsidian versions before native settings pages.
     */
    display(): void {
        this.renderLegacySettingsLanding();
    }

    private renderLegacySettingsLanding(): void {
        this.ensureSettingsUpdateListener();
        this.isFallbackSettingsDisplay = true;
        this.activeSettingsPage = null;
        this.prepareSettingsRender(this.containerEl);

        const generalDefinition = SETTINGS_PANE_DEFINITION_MAP.get('general');
        generalDefinition?.render(this.createTabContext(this.containerEl));

        const createGroup = createSettingGroupFactory(this.containerEl);
        SETTINGS_PAGE_GROUP_DEFINITIONS.forEach(group => {
            const pageGroup = createGroup(group.getHeading());
            group.items.forEach(tabId => {
                this.addLegacySettingsPageLink(pageGroup.addSetting, tabId);
            });
        });
    }

    private addLegacySettingsPageLink(addSetting: AddSettingFunction, tabId: SettingsPaneId): void {
        const definition = SETTINGS_PANE_DEFINITION_MAP.get(tabId);
        if (!definition) {
            return;
        }

        const name = definition.getLabel();
        const setting = addSetting(setting => {
            setting.setName(name).setDesc(definition.getDescription());
            setting.addExtraButton(button => {
                button.setIcon('lucide-chevron-right').onClick(() => this.openLegacySettingsPage(tabId));
                button.extraSettingsEl.setAttr('aria-label', name);
            });
        });

        setting.settingEl.addClass('nn-settings-legacy-page-link');
        setting.settingEl.tabIndex = 0;
        setting.settingEl.setAttr('role', 'button');
        setting.settingEl.setAttr('aria-label', name);
        setting.settingEl.addEventListener('click', event => {
            if (isLegacySettingsInteractiveTarget(event.target)) {
                return;
            }
            this.openLegacySettingsPage(tabId);
        });
        setting.settingEl.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }
            event.preventDefault();
            this.openLegacySettingsPage(tabId);
        });
    }

    private openLegacySettingsPage(tabId: SettingsPaneId): void {
        this.legacySettingsLandingScrollTop = this.containerEl.scrollTop;
        this.renderLegacySettingsPage(tabId);
    }

    private returnToLegacySettingsLanding(): void {
        const scrollTop = this.legacySettingsLandingScrollTop;
        this.renderLegacySettingsLanding();
        this.containerEl.scrollTop = scrollTop;
    }

    private renderLegacySettingsPage(tabId: SettingsPaneId): void {
        const definition = SETTINGS_PANE_DEFINITION_MAP.get(tabId);
        if (!definition) {
            return;
        }

        this.ensureSettingsUpdateListener();
        this.isFallbackSettingsDisplay = true;
        this.prepareSettingsRender(this.containerEl);
        this.activeSettingsPage = { tabId, containerEl: this.containerEl };
        this.renderLegacySettingsPageTitle(definition.getLabel());
        this.diagnosticsController.handleTabActivation(tabId);
        definition.render(this.createTabContext(this.containerEl));
        this.containerEl.scrollTop = 0;
    }

    private renderLegacySettingsPageTitle(title: string): void {
        const titleSetting = new Setting(this.containerEl).setName(title).setHeading();
        titleSetting.settingEl.addClass('nn-settings-legacy-titlebar');
        titleSetting.nameEl.empty();
        const backButton = new ButtonComponent(titleSetting.nameEl);
        backButton
            .setIcon('lucide-chevron-left')
            .setTooltip(strings.commands.navigateBack)
            .onClick(() => this.returnToLegacySettingsLanding());
        backButton.buttonEl.addClass('clickable-icon');
        backButton.buttonEl.addClass('nn-settings-legacy-back-button');
        backButton.buttonEl.setAttr('aria-label', strings.commands.navigateBack);
        titleSetting.nameEl.createSpan({ text: title });
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        if (!requireApiVersion('1.13.0')) {
            return [];
        }

        this.isFallbackSettingsDisplay = false;
        const context = this.createTabContext(this.containerEl);

        // Native settings index: vault controls and page links come before informational resources.
        const items: SettingDefinitionItem[] = [
            ...createVaultSetupSettingDefinitions(context),
            ...SETTINGS_PAGE_GROUP_DEFINITIONS.map(group => ({
                type: 'group' as const,
                heading: group.getHeading(),
                items: group.items.map(tabId => this.createNativeSettingsPageDefinition(tabId))
            })),
            ...createStartResourcesSettingDefinitions(context)
        ];

        return this.createNativeDefinitionItems(
            items,
            () => this.prepareNativeSettingsIndexRender(),
            () => this.finishNativeSettingsIndexRender()
        );
    }

    // Native controls route through the same plugin save/update pipeline as legacy rows.
    getControlValue(key: string): unknown {
        if (isAppearanceBehaviorControlKey(key)) {
            return getAppearanceBehaviorControlValue(this.plugin.settings, key);
        }

        if (isNativeSettingControlKey(key)) {
            return getNativeSettingControlValue(this.plugin.settings, key);
        }

        return this.getObsidianControlValue(key);
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
            await this.setObsidianControlValue(key, value);
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

    // Obsidian calls native control hooks only for 1.13 settings pages.
    private getObsidianControlValue(key: string): unknown {
        if (requireApiVersion('1.13.0')) {
            return super.getControlValue(key);
        }

        return undefined;
    }

    private async setObsidianControlValue(key: string, value: unknown): Promise<void> {
        if (requireApiVersion('1.13.0')) {
            await super.setControlValue(key, value);
        }
    }

    private handleNativeSettingControlPreSaveSideEffects(key: NativeSettingControlKey): void {
        if (key === 'showTags') {
            this.currentShowTagsVisible = this.plugin.settings.showTags;
            this.showTagsListeners.forEach(callback => callback(this.currentShowTagsVisible));
            return;
        }

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
        const definitionItems = definition?.createDefinitions?.(this.createTabContext(this.containerEl));
        if (definitionItems) {
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

        return {
            type: 'page' as const,
            name,
            desc,
            page: () =>
                createNativeSettingsPage({
                    title: name,
                    display: containerEl => this.renderNativeSettingsPage(tabId, containerEl),
                    hide: containerEl => this.hideNativeSettingsPage(containerEl)
                })
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

    private renderNativeSettingsPage(tabId: SettingsPaneId, containerEl: HTMLElement): void {
        const definition = SETTINGS_PANE_DEFINITION_MAP.get(tabId);
        if (!definition) {
            return;
        }

        this.ensureSettingsUpdateListener();
        this.settingsRenderContainerEl = containerEl;
        this.activeSettingsPage = { tabId, containerEl };
        containerEl.empty();
        containerEl.addClass('nn-settings-tab-root');
        this.resetRenderedSettingsState();
        this.diagnosticsController.handleTabActivation(tabId);
        definition.render(this.createTabContext(containerEl));
    }

    private hideNativeSettingsPage(containerEl: HTMLElement): void {
        containerEl.removeClass('nn-settings-tab-root');
        if (this.settingsRenderContainerEl === containerEl) {
            this.settingsRenderContainerEl = null;
        }
        if (this.activeSettingsPage?.containerEl === containerEl) {
            this.activeSettingsPage = null;
        }
        this.resetRenderedSettingsState();
    }

    private prepareSettingsRender(containerEl: HTMLElement): void {
        this.settingsRenderContainerEl = containerEl;
        containerEl.empty();
        containerEl.addClass('nn-settings-tab-root');

        this.resetRenderedSettingsState();
    }

    private prepareNativeSettingsIndexRender(): void {
        this.ensureSettingsUpdateListener();
        this.activeSettingsPage = null;
        this.settingsRenderContainerEl = this.containerEl;
        this.containerEl.addClass('nn-settings-tab-root');
        this.resetRenderedSettingsState();
    }

    private prepareNativeSettingsPageDefinitionRender(tabId: SettingsPaneId, containerEl: HTMLElement): void {
        this.ensureSettingsUpdateListener();
        this.activeSettingsPage = null;
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
        this.showTagsListeners = [];
        this.currentShowTagsVisible = this.plugin.settings.showTags;
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
    private createTabContext(container: HTMLElement): SettingsTabContext {
        return {
            app: this.app,
            plugin: this.plugin,
            containerEl: container,
            addToggleSetting: (addSetting, name, desc, getValue, setValue, onAfterUpdate) =>
                this.addToggleSetting(addSetting, name, desc, getValue, setValue, onAfterUpdate),
            addInfoSetting: (addSetting, cls, render) => this.addInfoSetting(addSetting, cls, render),
            createDebouncedTextSetting: (parent, name, desc, placeholder, getValue, setValue, validator, onAfterUpdate) =>
                this.createDebouncedTextSetting(parent, name, desc, placeholder, getValue, setValue, validator, onAfterUpdate),
            configureDebouncedTextSetting: (setting, name, desc, placeholder, getValue, setValue, validator, onAfterUpdate) =>
                this.configureDebouncedTextSetting(setting, name, desc, placeholder, getValue, setValue, validator, onAfterUpdate),
            createDebouncedTextAreaSetting: (parent, name, desc, placeholder, getValue, setValue, options) =>
                this.createDebouncedTextAreaSetting(parent, name, desc, placeholder, getValue, setValue, options),
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
                this.refreshSettingsDomState();
            },
            ensureStatisticsInterval: () => {
                this.diagnosticsController.ensureStatisticsInterval();
            },
            registerShowTagsListener: listener => {
                this.showTagsListeners.push(listener);
                listener(this.currentShowTagsVisible);
            },
            notifyShowTagsVisibility: visible => {
                this.currentShowTagsVisible = visible;
                this.showTagsListeners.forEach(callback => callback(visible));
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
        this.showTagsListeners = [];
        this.activeSettingsPage = null;
        this.settingsRenderContainerEl?.removeClass('nn-settings-tab-root');
        this.settingsRenderContainerEl = null;
        this.containerEl.removeClass('nn-settings-tab-root');
    }
}

function isLegacySettingsInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return Boolean(target.closest('button, a, input, select, textarea, .clickable-icon, [contenteditable="true"]'));
}

interface NotebookNavigatorSettingsPageOptions {
    title: string;
    display(containerEl: HTMLElement): void;
    hide(containerEl: HTMLElement): void;
}

type NativeSettingPage = ReturnType<NonNullable<SettingDefinitionPage['page']>>;
type NativeSettingPageConstructor = new () => NativeSettingPage;

// Bridge for Obsidian 1.13 SettingPage while keeping this module loadable on 1.11.
function isNativeSettingPageConstructor(value: unknown): value is NativeSettingPageConstructor {
    return typeof value === 'function';
}

function isHtmlElement(value: unknown): value is HTMLElement {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const instanceOf: unknown = Reflect.get(value, 'instanceOf');
    if (typeof instanceOf !== 'function') {
        return false;
    }

    const result: unknown = Reflect.apply(instanceOf, value, [HTMLElement]);
    return result === true;
}

function getNativeSettingPageConstructor(): NativeSettingPageConstructor {
    if (!requireApiVersion('1.13.0')) {
        throw new Error('Obsidian SettingPage API is unavailable.');
    }

    const settingPageConstructor = Reflect.get(Obsidian, 'SettingPage');
    if (!isNativeSettingPageConstructor(settingPageConstructor)) {
        throw new Error('Obsidian SettingPage API is unavailable.');
    }

    return settingPageConstructor;
}

function getNativeSettingPageContainer(page: NativeSettingPage): HTMLElement {
    const containerEl = Reflect.get(page, 'containerEl');
    if (!isHtmlElement(containerEl)) {
        throw new Error('Obsidian SettingPage container is unavailable.');
    }

    return containerEl;
}

function hideNativeSettingPageBase(page: NativeSettingPage, pageConstructor: NativeSettingPageConstructor): void {
    const hide: unknown = Reflect.get(pageConstructor.prototype, 'hide');
    if (typeof hide === 'function') {
        Reflect.apply(hide, page, []);
    }
}

function createNativeSettingsPage(options: NotebookNavigatorSettingsPageOptions): NativeSettingPage {
    const SettingPageBase = getNativeSettingPageConstructor();

    return new (class NotebookNavigatorSettingsPage extends SettingPageBase {
        constructor() {
            super();
            Reflect.set(this, 'title', options.title);
        }

        display(): void {
            options.display(getNativeSettingPageContainer(this));
        }

        hide(): void {
            hideNativeSettingPageBase(this, SettingPageBase);
            options.hide(getNativeSettingPageContainer(this));
        }
    })();
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
export { DEFAULT_SETTINGS } from './settings/defaultSettings';
