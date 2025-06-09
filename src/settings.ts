/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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

import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import NotebookNavigatorPlugin from './main';

/**
 * Available sort options for file listing
 */
export type SortOption = 'modified' | 'created' | 'title';

/**
 * Plugin settings interface defining all configurable options
 * These settings control the appearance and behavior of the navigator
 */
export interface NotebookNavigatorSettings {
    // File organization
    sortOption: SortOption;
    groupByDate: boolean;
    showNotesFromSubfolders: boolean;
    autoRevealActiveFile: boolean;
    excludedFiles: string;
    ignoreFolders: string;
    // File display
    showFilePreview: boolean;
    skipHeadingsInPreview: boolean;
    skipNonTextInPreview: boolean;
    showFeatureImage: boolean;
    featureImageProperty: string;
    // Folder display
    showRootFolder: boolean;
    showFolderFileCount: boolean;
    // Tag display
    showTags: boolean;
    showUntagged: boolean;
    // Backlink display
    showBacklinks: boolean;
    backlinksFolderPath: string;
    // Appearance
    dateFormat: string;
    // Advanced
    confirmBeforeDelete: boolean;
    // Internal
    leftPaneWidth: number;
    pinnedNotes: Record<string, string[]>;
    folderIcons: Record<string, string>;
    folderColors: Record<string, string>;
    recentlyUsedIcons: string[];
}

/**
 * Default settings for the plugin
 * Used when plugin is first installed or settings are reset
 */
export const DEFAULT_SETTINGS: NotebookNavigatorSettings = {
    // File organization
    sortOption: 'modified',
    groupByDate: true,
    showNotesFromSubfolders: false,
    autoRevealActiveFile: true,
    excludedFiles: '',
    ignoreFolders: '',
    // File display
    showFilePreview: true,
    skipHeadingsInPreview: false,
    skipNonTextInPreview: true,
    showFeatureImage: true,
    featureImageProperty: 'feature',
    // Folder display
    showRootFolder: false,
    showFolderFileCount: true,
    // Tag display
    showTags: true,
    showUntagged: false,
    // Backlink display
    showBacklinks: true,
    backlinksFolderPath: "",
    // Appearance
    dateFormat: 'MMM d, yyyy',
    // Advanced
    confirmBeforeDelete: true,
    // Internal
    leftPaneWidth: 300,
    pinnedNotes: {},
    folderIcons: {},
    folderColors: {},
    recentlyUsedIcons: []
}

/**
 * Settings tab for configuring the Notebook Navigator plugin
 * Provides organized sections for different aspects of the plugin
 * Implements debounced text inputs to prevent excessive updates
 */
export class NotebookNavigatorSettingTab extends PluginSettingTab {
    plugin: NotebookNavigatorPlugin;
    // Map of active debounce timers for text inputs
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

    /**
     * Creates a new settings tab
     * @param app - The Obsidian app instance
     * @param plugin - The plugin instance to configure
     */
    constructor(app: App, plugin: NotebookNavigatorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
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
     * @param refreshView - Whether to refresh the navigator view on change
     * @param validator - Optional validation function
     * @returns The created Setting instance
     */
    private createDebouncedTextSetting(
        container: HTMLElement,
        name: string,
        desc: string,
        placeholder: string,
        getValue: () => string,
        setValue: (value: string) => void,
        refreshView: boolean = true,
        validator?: (value: string) => boolean,
    ): Setting {
        return new Setting(container)
            .setName(name)
            .setDesc(desc)
            .addText(text => text
                .setPlaceholder(placeholder)
                .setValue(getValue())
                .onChange(async (value) => {
                    // Clear existing timer for this setting
                    const timerId = `setting-${name}`;
                    if (this.debounceTimers.has(timerId)) {
                        clearTimeout(this.debounceTimers.get(timerId)!);
                    }
                    
                    // Set new timer
                    const timer = setTimeout(async () => {
                        // Validate if validator provided
                        if (!validator || validator(value)) {
                            setValue(value);
                            await this.plugin.saveSettings();
                            
                            if (refreshView) {
                                this.plugin.onSettingsChange();
                            }
                        }
                        
                        this.debounceTimers.delete(timerId);
                    }, 500);
                    
                    this.debounceTimers.set(timerId, timer);
                }));
    }

    /**
     * Helper function to toggle element visibility using CSS class
     * @param element - The HTML element to show/hide
     * @param show - Whether to show (true) or hide (false) the element
     */
    private setElementVisibility(element: HTMLElement, show: boolean): void {
        element.toggleClass('nn-setting-hidden', !show);
    }

    /**
     * Helper to save settings and optionally refresh the view
     * @param refresh - Whether to refresh the navigator view after saving
     */
    private async saveAndRefresh(refresh: boolean = true): Promise<void> {
        await this.plugin.saveSettings();
        if (refresh) {
            this.plugin.onSettingsChange();
        }
    }

    /**
     * Renders the settings tab UI
     * Organizes settings into logical sections:
     * - File organization
     * - File display
     * - Folder display
     * - Appearance
     * - Advanced
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Section 1: File organization
        // Not shown to follow Obsidian plugin guidelines
        // new Setting(containerEl)
        //     .setName('File organization')
        //     .setHeading();

        const sortSetting = new Setting(containerEl)
            .setName('Sort notes by')
            .setDesc('Choose how notes are sorted in the note list.')
            .addDropdown(dropdown => dropdown
                .addOption('modified', 'Date edited')
                .addOption('created', 'Date created')
                .addOption('title', 'Title')
                .setValue(this.plugin.settings.sortOption)
                .onChange(async (value: SortOption) => {
                    this.plugin.settings.sortOption = value;
                    await this.saveAndRefresh();
                    // Update group by date visibility
                    this.setElementVisibility(dateGroupingEl, value !== 'title');
                }));

        // Container for conditional group by date setting
        const dateGroupingEl = containerEl.createDiv('date-grouping-settings');

        new Setting(dateGroupingEl)
            .setName('Group notes by date')
            .setDesc('When sorted by date, group notes under date headers.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.groupByDate)
                .onChange(async (value) => {
                    this.plugin.settings.groupByDate = value;
                    await this.saveAndRefresh();
                }));

        new Setting(containerEl)
            .setName('Show notes from subfolders')
            .setDesc('Display all notes from subfolders in the current folder view.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showNotesFromSubfolders)
                .onChange(async (value) => {
                    this.plugin.settings.showNotesFromSubfolders = value;
                    await this.saveAndRefresh();
                }));

        new Setting(containerEl)
            .setName('Auto-reveal active note')
            .setDesc('Automatically reveal and select notes when opened from Quick Switcher, links, or search.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoRevealActiveFile)
                .onChange(async (value) => {
                    this.plugin.settings.autoRevealActiveFile = value;
                    await this.saveAndRefresh(false);
                }));

        this.createDebouncedTextSetting(
            containerEl,
            'Excluded notes',
            'Comma-separated list of frontmatter properties. Notes containing any of these properties will be hidden (e.g., draft, private, archived).',
            'draft, private',
            () => this.plugin.settings.excludedFiles,
            (value) => { this.plugin.settings.excludedFiles = value; }
        );

        this.createDebouncedTextSetting(
            containerEl,
            'Excluded folders',
            'Comma-separated list of folders to hide (e.g., resources, templates).',
            'folder1, folder2',
            () => this.plugin.settings.ignoreFolders,
            (value) => { this.plugin.settings.ignoreFolders = value; }
        );

        // Section 2: Note display
        new Setting(containerEl)
            .setName('Note display')
            .setHeading();

        const showPreviewSetting = new Setting(containerEl)
            .setName('Show note preview')
            .setDesc('Display preview text beneath note names.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFilePreview)
                .onChange(async (value) => {
                    this.plugin.settings.showFilePreview = value;
                    await this.saveAndRefresh();
                    this.setElementVisibility(previewSettingsEl, value);
                }));

        // Container for preview-related settings
        const previewSettingsEl = containerEl.createDiv('preview-settings');

        new Setting(previewSettingsEl)
            .setName('Skip headings in preview')
            .setDesc('Skip heading lines when generating preview text.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.skipHeadingsInPreview)
                .onChange(async (value) => {
                    this.plugin.settings.skipHeadingsInPreview = value;
                    await this.saveAndRefresh();
                }));

        new Setting(previewSettingsEl)
            .setName('Skip non-text in preview')
            .setDesc('Skip images, embeds, and other non-text elements from preview text.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.skipNonTextInPreview)
                .onChange(async (value) => {
                    this.plugin.settings.skipNonTextInPreview = value;
                    await this.saveAndRefresh();
                }));

        const showFeatureImageSetting = new Setting(containerEl)
            .setName('Show feature image')
            .setDesc('Display thumbnail images from frontmatter. Tip: Use the "Featured Image" plugin to automatically set feature images for all your documents.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFeatureImage)
                .onChange(async (value) => {
                    this.plugin.settings.showFeatureImage = value;
                    await this.saveAndRefresh();
                    this.setElementVisibility(featureImageSettingsEl, value);
                }));

        // Container for feature image settings
        const featureImageSettingsEl = containerEl.createDiv('feature-image-settings');

        this.createDebouncedTextSetting(
            featureImageSettingsEl,
            'Feature image property',
            'The frontmatter property name for thumbnail images.',
            'feature',
            () => this.plugin.settings.featureImageProperty,
            (value) => { this.plugin.settings.featureImageProperty = value || 'feature'; }
        );

        // Section 3: Folder display
        new Setting(containerEl)
            .setName('Folder display')
            .setHeading();

        new Setting(containerEl)
            .setName('Show root folder')
            .setDesc('Display "Vault" as the root folder in the tree.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showRootFolder)
                .onChange(async (value) => {
                    this.plugin.settings.showRootFolder = value;
                    await this.saveAndRefresh();
                }));

        new Setting(containerEl)
            .setName('Show folder note count')
            .setDesc('Display the number of notes in each folder.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFolderFileCount)
                .onChange(async (value) => {
                    this.plugin.settings.showFolderFileCount = value;
                    await this.saveAndRefresh();
                }));

        // Section 4: Tag display
        new Setting(containerEl)
            .setName('Tag display')
            .setHeading();

        const showTagsSetting = new Setting(containerEl)
            .setName('Show tags')
            .setDesc('Display tags section below folders in the navigator.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showTags)
                .onChange(async (value) => {
                    this.plugin.settings.showTags = value;
                    await this.saveAndRefresh();
                    // Update untagged visibility
                    this.setElementVisibility(untaggedSettingEl, value);
                }));

        // Container for untagged setting
        const untaggedSettingEl = containerEl.createDiv();

        new Setting(untaggedSettingEl)
            .setName('Show untagged notes')
            .setDesc('Display "Untagged" item for notes without any tags.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showUntagged)
                .onChange(async (value) => {
                    this.plugin.settings.showUntagged = value;
                    await this.saveAndRefresh();
                }));

        // Section 5: Backlink display
        new Setting(containerEl)
            .setName('Tag Link display')
            .setHeading();

        const showBacklinksSetting = new Setting(containerEl)
            .setName('Show tag links')
            .setDesc('Display tag links section below folders in the navigator.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showBacklinks)
                .onChange(async (value) => {
                    this.plugin.settings.showBacklinks = value;
                    await this.saveAndRefresh();
                }));

        this.createDebouncedTextSetting(
            containerEl,
            'Tag links folder path',
            'Root folder for tag links (to use if you have a tags folder and want to exclude all other backlinks). Leave empty to use the whole vault.',
            '',
            () => this.plugin.settings.backlinksFolderPath,
            (value) => { this.plugin.settings.backlinksFolderPath = value || ''; },
        );


        // Section 6: Appearance
        new Setting(containerEl)
            .setName('Appearance')
            .setHeading();

        this.createDebouncedTextSetting(
            containerEl,
            'Date format',
            'Format for displaying dates (uses date-fns format).',
            'MMM d, yyyy',
            () => this.plugin.settings.dateFormat,
            (value) => { this.plugin.settings.dateFormat = value || 'MMM d, yyyy'; }
        ).addExtraButton(button => button
            .setIcon('help')
            .setTooltip('Click for format reference')
            .onClick(() => {
                new Notice('Common formats:\nMMM d, yyyy = May 25, 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nTokens:\nyyyy/yy = year\nMMMM/MMM/MM = month\ndd/d = day\nEEEE/EEE = weekday', 10000);
            }));

        // Section 7: Advanced
        new Setting(containerEl)
            .setName('Advanced')
            .setHeading();

        new Setting(containerEl)
            .setName('Confirm before deleting notes')
            .setDesc('Show confirmation dialog when deleting notes or folders')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.confirmBeforeDelete)
                .onChange(async (value) => {
                    this.plugin.settings.confirmBeforeDelete = value;
                    await this.saveAndRefresh(false);
                }));

        new Setting(containerEl)
            .setName('Clear saved state')
            .setDesc('Reset expanded folders, selections, and pane width to defaults.')
            .addButton(button => button
                .setButtonText('Clear state')
                .setCta()  // Makes it a primary button
                .onClick(async () => {
                    // Clear all localStorage keys
                    localStorage.removeItem(this.plugin.keys.expandedFoldersKey);
                    localStorage.removeItem(this.plugin.keys.expandedTagsKey);
                    localStorage.removeItem(this.plugin.keys.selectedFolderKey);
                    localStorage.removeItem(this.plugin.keys.selectedFileKey);
                    localStorage.removeItem(this.plugin.keys.leftPaneWidthKey);
                    
                    // Reset the plugin settings for left pane width
                    this.plugin.settings.leftPaneWidth = 300;
                    await this.plugin.saveSettings();
                    
                    new Notice('Navigator state cleared. Refresh the view to see changes.');
                }));

        // Sponsor section
        new Setting(containerEl)
            .setName('Support development')
            .setDesc('If you enjoy using Notebook Navigator, please consider supporting its continued development.')
            .addButton((button) => {
                button
                    .setButtonText('❤️ Sponsor on GitHub')
                    .onClick(() => window.open('https://github.com/sponsors/johansan/'))
                    .buttonEl.addClass('nn-sponsor-button');
            });

        // Set initial visibility
        this.setElementVisibility(dateGroupingEl, this.plugin.settings.sortOption !== 'title');
        this.setElementVisibility(previewSettingsEl, this.plugin.settings.showFilePreview);
        this.setElementVisibility(featureImageSettingsEl, this.plugin.settings.showFeatureImage);
        this.setElementVisibility(untaggedSettingEl, this.plugin.settings.showTags);
    }

    /**
     * Called when settings tab is closed
     * Cleans up any pending debounce timers to prevent memory leaks
     */
    hide(): void {
        // Clean up all pending debounce timers when settings tab is closed
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }
}
