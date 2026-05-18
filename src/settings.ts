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

import { App, ButtonComponent, PluginSettingTab, Setting } from 'obsidian';
import NotebookNavigatorPlugin from './main';
import { strings } from './i18n';
import { TIMEOUTS } from './types/obsidian-extended';
import { renderGeneralTab } from './settings/tabs/GeneralTab';
import { renderNavigationPaneTab } from './settings/tabs/NavigationTab';
import { renderShortcutsTab } from './settings/tabs/ShortcutsTab';
import { renderCalendarTab } from './settings/tabs/CalendarTab';
import { renderFoldersTab } from './settings/tabs/FoldersTab';
import { renderTagsTab } from './settings/tabs/TagsTab';
import { renderPropertiesTab } from './settings/tabs/PropertiesTab';
import { renderListPaneTab } from './settings/tabs/ListTab';
import { renderFrontmatterTab } from './settings/tabs/FrontmatterTab';
import { renderNotesTab } from './settings/tabs/NotesTab';
import { renderFilesTab } from './settings/tabs/FilesTab';
import { renderIconPacksTab } from './settings/tabs/IconPacksTab';
import { renderAdvancedTab } from './settings/tabs/AdvancedTab';
import type {
    AddSettingFunction,
    DebouncedTextAreaSettingOptions,
    SettingsTabId,
    SettingsTabContext,
    SettingDescription
} from './settings/tabs/SettingsTabContext';
import { runAsyncAction } from './utils/async';
import { NOTEBOOK_NAVIGATOR_ICON_ID } from './constants/notebookNavigatorIcon';
import { getIconService } from './services/icons';
import { resolveFileTypeIconId } from './utils/fileIconUtils';
import { resolveUXIcon, type UXIconId } from './utils/uxIcons';
import { SettingsDiagnosticsController } from './settings/SettingsDiagnosticsController';

/** Identifiers for different settings tab panes */
type SettingsPaneId = SettingsTabId;

/** Top-level group buttons for settings navigation */
type SettingsGroupId = 'general' | 'navigation-pane' | 'list-pane' | 'calendar';

const SETTINGS_GROUP_IDS: SettingsGroupId[] = ['general', 'navigation-pane', 'list-pane', 'calendar'];

type SettingsTabIconDefinition =
    | { kind: 'fixed'; iconId: string }
    | { kind: 'ux'; uxIconId: UXIconId }
    | { kind: 'fileType'; fileTypeKey: string; fallbackIconId: string };

const SETTINGS_TAB_ICONS: Record<SettingsPaneId, SettingsTabIconDefinition> = {
    general: { kind: 'fixed', iconId: 'settings' },
    'navigation-pane': { kind: 'fixed', iconId: 'panel-left' },
    'list-pane': { kind: 'fixed', iconId: 'list' },
    calendar: { kind: 'fixed', iconId: 'calendar-days' },
    files: { kind: 'fixed', iconId: 'file' },
    'icon-packs': { kind: 'fixed', iconId: 'package' },
    advanced: { kind: 'fixed', iconId: 'sliders-horizontal' },
    shortcuts: { kind: 'ux', uxIconId: 'nav-shortcuts' },
    folders: { kind: 'ux', uxIconId: 'nav-folder-closed' },
    tags: { kind: 'ux', uxIconId: 'nav-tag' },
    properties: { kind: 'ux', uxIconId: 'nav-property' },
    frontmatter: { kind: 'ux', uxIconId: 'nav-properties' },
    notes: { kind: 'fileType', fileTypeKey: 'md', fallbackIconId: 'file' }
};

const SETTINGS_GROUP_SECONDARY_TAB_IDS: Record<SettingsGroupId, SettingsPaneId[]> = {
    general: ['files', 'icon-packs', 'advanced'],
    'navigation-pane': ['shortcuts', 'folders', 'tags', 'properties'],
    'list-pane': ['frontmatter', 'notes'],
    calendar: []
};

const SETTINGS_TAB_GROUP_MAP: Record<SettingsPaneId, SettingsGroupId> = {
    general: 'general',
    files: 'general',
    'icon-packs': 'general',
    advanced: 'general',
    'navigation-pane': 'navigation-pane',
    shortcuts: 'navigation-pane',
    folders: 'navigation-pane',
    tags: 'navigation-pane',
    properties: 'navigation-pane',
    'list-pane': 'list-pane',
    frontmatter: 'list-pane',
    notes: 'list-pane',
    calendar: 'calendar'
};

const SETTINGS_SECONDARY_TAB_IDS_ORDERED: SettingsPaneId[] = [
    ...SETTINGS_GROUP_SECONDARY_TAB_IDS.general,
    ...SETTINGS_GROUP_SECONDARY_TAB_IDS['navigation-pane'],
    ...SETTINGS_GROUP_SECONDARY_TAB_IDS['list-pane'],
    ...SETTINGS_GROUP_SECONDARY_TAB_IDS.calendar
];

/** Definition of a settings pane with its ID, label resolver, and render function */
interface SettingsPaneDefinition {
    id: SettingsPaneId;
    getLabel: () => string;
    render: (context: SettingsTabContext) => void;
}

const SETTINGS_PANE_DEFINITIONS: SettingsPaneDefinition[] = [
    { id: 'general', getLabel: () => strings.settings.sections.general, render: renderGeneralTab },
    { id: 'calendar', getLabel: () => strings.settings.sections.calendar, render: renderCalendarTab },
    { id: 'navigation-pane', getLabel: () => strings.settings.sections.navigationPane, render: renderNavigationPaneTab },
    { id: 'shortcuts', getLabel: () => strings.navigationPane.shortcutsHeader, render: renderShortcutsTab },
    {
        id: 'folders',
        getLabel: () => strings.settings.sections.folders,
        render: renderFoldersTab
    },
    { id: 'tags', getLabel: () => strings.settings.sections.tags, render: renderTagsTab },
    { id: 'properties', getLabel: () => strings.navigationPane.properties, render: renderPropertiesTab },
    { id: 'list-pane', getLabel: () => strings.settings.sections.listPane, render: renderListPaneTab },
    { id: 'frontmatter', getLabel: () => strings.settings.groups.notes.frontmatter, render: renderFrontmatterTab },
    { id: 'notes', getLabel: () => strings.settings.sections.notes, render: renderNotesTab },
    { id: 'files', getLabel: () => strings.settings.sections.files, render: renderFilesTab },
    { id: 'icon-packs', getLabel: () => strings.settings.sections.icons, render: renderIconPacksTab },
    { id: 'advanced', getLabel: () => strings.settings.sections.advanced, render: renderAdvancedTab }
];

const SETTINGS_PANE_DEFINITION_MAP = new Map<SettingsPaneId, SettingsPaneDefinition>(
    SETTINGS_PANE_DEFINITIONS.map(definition => [definition.id, definition])
);

/**
 * Settings tab for configuring the Notebook Navigator plugin
 * Provides organized sections for different aspects of the plugin
 * Implements debounced text inputs to prevent excessive updates
 */
export class NotebookNavigatorSettingTab extends PluginSettingTab {
    plugin: NotebookNavigatorPlugin;
    // Map of active debounce timers for text inputs
    private debounceTimers: Map<string, number> = new Map();
    // Map of tab IDs to their content elements
    private tabContentMap: Map<SettingsPaneId, HTMLElement> = new Map();
    // Map of tab IDs to their button components
    private tabButtons: Map<SettingsPaneId, ButtonComponent> = new Map();
    private tabIconElements: Map<SettingsPaneId, HTMLElement> = new Map();
    private primaryNavEl: HTMLElement | null = null;
    private secondaryNavEl: HTMLElement | null = null;
    // Tracks the most recently active tab during the current session
    private lastActiveTabId: SettingsPaneId | null = null;
    // Registered listeners for show tags visibility changes
    private showTagsListeners: ((visible: boolean) => void)[] = [];
    // Current visibility state of show tags setting
    private currentShowTagsVisible = false;
    private settingsUpdateListenerId = 'settings-tab';
    private tabSettingsUpdateListeners = new Map<string, () => void>();
    private readonly diagnosticsController: SettingsDiagnosticsController;

    private getGroupIdForTab(tabId: SettingsPaneId): SettingsGroupId {
        return SETTINGS_TAB_GROUP_MAP[tabId];
    }

    private resolveTabButtonIconId(tabId: SettingsPaneId): string | null {
        const iconDefinition = SETTINGS_TAB_ICONS[tabId];
        if (!iconDefinition) {
            return null;
        }

        if (iconDefinition.kind === 'fixed') {
            return iconDefinition.iconId;
        }

        if (iconDefinition.kind === 'ux') {
            return resolveUXIcon(this.plugin.settings.interfaceIcons, iconDefinition.uxIconId);
        }

        return resolveFileTypeIconId(iconDefinition.fileTypeKey, this.plugin.settings.fileTypeIconMap) ?? iconDefinition.fallbackIconId;
    }

    private renderTabButtonIcon(tabId: SettingsPaneId): void {
        const iconEl = this.tabIconElements.get(tabId);
        if (!iconEl) {
            return;
        }

        iconEl.empty();
        const iconId = this.resolveTabButtonIconId(tabId);
        if (!iconId) {
            return;
        }

        getIconService().renderIcon(iconEl, iconId);
    }

    private refreshTabButtonIcons(): void {
        this.tabIconElements.forEach((_iconEl, tabId) => {
            this.renderTabButtonIcon(tabId);
        });
        this.updateTabRowIconVisibility();
    }

    private rowExceedsSingleLine(rowEl: HTMLElement): boolean {
        const overflowTolerance = 1;
        if (rowEl.scrollWidth - rowEl.clientWidth > overflowTolerance) {
            return true;
        }

        const buttons = Array.from(rowEl.querySelectorAll<HTMLElement>('.nn-settings-tab-button')).filter(button => {
            if (button.hasClass('is-hidden')) {
                return false;
            }
            return button.offsetParent !== null;
        });

        if (buttons.length <= 1) {
            return false;
        }

        const firstTop = buttons[0].offsetTop;
        return buttons.some(button => Math.abs(button.offsetTop - firstTop) > overflowTolerance);
    }

    private updateTabRowIconVisibilityForRow(rowEl: HTMLElement | null): void {
        if (!rowEl) {
            return;
        }

        rowEl.toggleClass('is-icons-hidden', false);
        if (rowEl.hasClass('is-hidden')) {
            return;
        }

        if (this.rowExceedsSingleLine(rowEl)) {
            rowEl.toggleClass('is-icons-hidden', true);
        }
    }

    private updateTabRowIconVisibility(): void {
        this.updateTabRowIconVisibilityForRow(this.primaryNavEl);
        this.updateTabRowIconVisibilityForRow(this.secondaryNavEl);
    }

    private updateTabNavigation(activeTabId: SettingsPaneId): void {
        const activeGroupId = this.getGroupIdForTab(activeTabId);
        this.secondaryNavEl?.toggleClass('is-hidden', SETTINGS_GROUP_SECONDARY_TAB_IDS[activeGroupId].length === 0);

        for (const groupId of SETTINGS_GROUP_IDS) {
            const groupButton = this.tabButtons.get(groupId);
            if (!groupButton) {
                continue;
            }

            const isActive = groupId === activeTabId;
            const isGroupActive = groupId === activeGroupId && !isActive;
            groupButton.buttonEl.toggleClass('is-group-active', isGroupActive);
            groupButton.buttonEl.toggleClass('is-active', isActive);
            groupButton.buttonEl.setAttribute('aria-selected', isActive ? 'true' : 'false');

            if (isActive) {
                groupButton.setCta();
            } else {
                groupButton.removeCta();
            }
        }

        for (const tabId of SETTINGS_SECONDARY_TAB_IDS_ORDERED) {
            const tabButton = this.tabButtons.get(tabId);
            if (!tabButton) {
                continue;
            }

            const isVisible = this.getGroupIdForTab(tabId) === activeGroupId;
            tabButton.buttonEl.toggleClass('is-hidden', !isVisible);

            const isActive = tabId === activeTabId;
            tabButton.buttonEl.toggleClass('is-active', isActive);
            tabButton.buttonEl.setAttribute('aria-selected', isActive ? 'true' : 'false');

            // Keep the secondary tab row in the lighter tab-button style.
            tabButton.removeCta();
        }

        this.updateTabRowIconVisibility();
    }

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

    public selectTab(tabId: SettingsTabId, options?: { focus?: boolean }): void {
        this.lastActiveTabId = tabId;

        const contentWrapper = this.containerEl.querySelector<HTMLElement>('.nn-settings-tabs-content');
        if (!contentWrapper) {
            return;
        }

        this.activateTab(tabId, contentWrapper, { focus: options?.focus ?? false });
    }

    private ensureSettingsUpdateListener(): void {
        this.plugin.registerSettingsUpdateListener(this.settingsUpdateListenerId, () => {
            if (this.plugin.isExternalSettingsUpdate()) {
                this.refreshFromExternalSettingsUpdate();
                return;
            }

            this.refreshTabButtonIcons();
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

    private refreshFromExternalSettingsUpdate(): void {
        const contentWrapper = this.containerEl.querySelector<HTMLElement>('.nn-settings-tabs-content');
        const scrollTop = contentWrapper?.scrollTop ?? 0;
        this.renderSettingsTab({ focus: false, restoreScrollTop: scrollTop });
    }

    /**
     * Ensures only the most recent change for a given setting runs after the debounce delay.
     */
    private scheduleDebouncedSettingUpdate(name: string, updater: () => Promise<void> | void): void {
        const timerId = `setting-${name}`;
        const existingTimer = this.debounceTimers.get(timerId);
        if (existingTimer !== undefined) {
            window.clearTimeout(existingTimer);
        }

        const timer = window.setTimeout(() => {
            runAsyncAction(async () => {
                try {
                    await updater();
                } finally {
                    this.debounceTimers.delete(timerId);
                }
            });
        }, TIMEOUTS.DEBOUNCE_SETTINGS);

        this.debounceTimers.set(timerId, timer);
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
     * Renders the settings tab UI
     * Organizes settings into grouped tabs:
     * - General: General, Files, Icon packs, Advanced
     * - Navigation pane: Navigation pane, Shortcuts, Folders, Tags, Properties
     * - List pane: List pane, Frontmatter, Notes
     * - Calendar: Calendar
     */
    display(): void {
        this.ensureSettingsUpdateListener();
        this.renderSettingsTab({ focus: true });
    }

    private renderSettingsTab(options?: { focus?: boolean; restoreScrollTop?: number }): void {
        const shouldFocus = options?.focus ?? false;
        const restoreScrollTop = options?.restoreScrollTop;

        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('nn-settings-tab-root');

        // Reset state for new render
        this.diagnosticsController.prepareForRender();
        this.tabContentMap.clear();
        this.tabButtons.clear();
        this.tabIconElements.clear();
        this.primaryNavEl = null;
        this.secondaryNavEl = null;
        this.tabSettingsUpdateListeners.clear();
        this.showTagsListeners = [];
        this.currentShowTagsVisible = this.plugin.settings.showTags;

        // Create tab navigation structure
        const tabsWrapper = containerEl.createDiv('nn-settings-tabs');
        const navEl = tabsWrapper.createDiv('nn-settings-tabs-nav');
        navEl.setAttribute('role', 'tablist');
        const primaryNavEl = navEl.createDiv('nn-settings-tabs-nav-row nn-settings-tabs-nav-primary');
        this.primaryNavEl = primaryNavEl;
        const secondaryNavEl = navEl.createDiv('nn-settings-tabs-nav-row nn-settings-tabs-nav-secondary');
        this.secondaryNavEl = secondaryNavEl;
        const contentWrapper = tabsWrapper.createDiv('nn-settings-tabs-content');

        const createTabButton = (container: HTMLElement, tabId: SettingsPaneId, variant: 'primary' | 'secondary'): void => {
            const definition = SETTINGS_PANE_DEFINITION_MAP.get(tabId);
            if (!definition) {
                return;
            }

            const buttonComponent = new ButtonComponent(container);
            buttonComponent.setButtonText(definition.getLabel());
            const iconEl = buttonComponent.buttonEl.createSpan('nn-settings-tab-icon');
            iconEl.setAttribute('aria-hidden', 'true');
            buttonComponent.buttonEl.prepend(iconEl);
            this.tabIconElements.set(tabId, iconEl);
            this.renderTabButtonIcon(tabId);
            buttonComponent.removeCta();
            buttonComponent.buttonEl.addClass('nn-settings-tab-button');
            buttonComponent.buttonEl.addClass('clickable-icon');
            buttonComponent.buttonEl.addClass(
                variant === 'primary' ? 'nn-settings-tab-button-primary' : 'nn-settings-tab-button-secondary'
            );
            buttonComponent.buttonEl.setAttribute('role', 'tab');
            buttonComponent.buttonEl.setAttribute('aria-selected', 'false');
            buttonComponent.onClick(() => {
                this.activateTab(tabId, contentWrapper);
            });
            this.tabButtons.set(tabId, buttonComponent);
        };

        SETTINGS_GROUP_IDS.forEach(groupId => {
            createTabButton(primaryNavEl, groupId, 'primary');
        });

        SETTINGS_SECONDARY_TAB_IDS_ORDERED.forEach(tabId => {
            createTabButton(secondaryNavEl, tabId, 'secondary');
        });

        // Activate previously open tab if available, otherwise default to first
        const fallbackTabId = SETTINGS_PANE_DEFINITIONS[0]?.id ?? null;
        const initialTabId =
            this.lastActiveTabId && SETTINGS_PANE_DEFINITION_MAP.has(this.lastActiveTabId) ? this.lastActiveTabId : fallbackTabId;
        if (initialTabId) {
            this.activateTab(initialTabId, contentWrapper, { focus: shouldFocus, preserveScroll: restoreScrollTop !== undefined });
        }
        if (restoreScrollTop !== undefined) {
            contentWrapper.scrollTop = restoreScrollTop;
        }
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
            registerMetadataInfoElement: element => {
                this.diagnosticsController.registerMetadataInfoElement(element);
            },
            registerStatsTextElement: element => {
                this.diagnosticsController.registerStatsTextElement(element);
            },
            requestStatisticsRefresh: () => {
                this.diagnosticsController.requestRefresh();
            },
            ensureStatisticsInterval: () => {
                this.diagnosticsController.ensureStatisticsInterval();
            },
            openSettingsTab: (tabId: SettingsTabId) => {
                const contentWrapper = this.containerEl.querySelector<HTMLElement>('.nn-settings-tabs-content');
                if (!contentWrapper) {
                    return;
                }
                this.activateTab(tabId, contentWrapper, { focus: true });
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
     * Activates a settings tab by ID
     * Creates tab content if it doesn't exist yet (lazy loading)
     * Updates active state for both content and buttons
     */
    private activateTab(id: SettingsPaneId, contentWrapper: HTMLElement, options?: { focus?: boolean; preserveScroll?: boolean }): void {
        const definition = SETTINGS_PANE_DEFINITION_MAP.get(id);
        if (!definition) {
            return;
        }
        const shouldFocus = options?.focus ?? false;

        // Lazy load tab content on first access
        if (!this.tabContentMap.has(id)) {
            const tabContainer = contentWrapper.createDiv('nn-settings-tab');
            const context = this.createTabContext(tabContainer);
            definition.render(context);
            this.tabContentMap.set(id, tabContainer);
        }

        const previousTabId = this.lastActiveTabId;
        if (previousTabId && previousTabId !== id) {
            this.tabContentMap.get(previousTabId)?.toggleClass('is-active', false);
        }

        this.tabContentMap.get(id)?.toggleClass('is-active', true);
        this.lastActiveTabId = id;
        this.updateTabNavigation(id);
        if (!options?.preserveScroll) {
            contentWrapper.scrollTop = 0;
        }

        this.diagnosticsController.handleTabActivation(id);

        if (shouldFocus) {
            this.tabButtons.get(id)?.buttonEl.focus();
        }
    }

    /**
     * Called when settings tab is closed
     * Cleans up any pending debounce timers and intervals to prevent memory leaks
     */
    hide(): void {
        this.plugin.unregisterSettingsUpdateListener(this.settingsUpdateListenerId);

        // Clean up all pending debounce timers when settings tab is closed
        this.debounceTimers.forEach(timer => window.clearTimeout(timer));
        this.debounceTimers.clear();

        this.diagnosticsController.dispose();

        // Clear references and state
        this.primaryNavEl = null;
        this.secondaryNavEl = null;
        this.tabSettingsUpdateListeners.clear();
        this.tabContentMap.clear();
        this.tabButtons.clear();
        this.tabIconElements.clear();
        this.showTagsListeners = [];
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
export { DEFAULT_SETTINGS } from './settings/defaultSettings';
