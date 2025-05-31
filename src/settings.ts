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
    skipNonTextInPreview: boolean;
    showFeatureImage: boolean;
    featureImageProperty: string;
    // Folder display
    showRootFolder: boolean;
    showFolderFileCount: boolean;
    // Appearance
    selectionColor: string;
    dateFormat: string;
    // Advanced
    confirmBeforeDelete: boolean;
    // Internal
    leftPaneWidth: number;
    pinnedNotes: Record<string, string[]>;
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
    skipNonTextInPreview: true,
    showFeatureImage: false,
    featureImageProperty: 'feature',
    // Folder display
    showRootFolder: true,
    showFolderFileCount: true,
    // Appearance
    selectionColor: '#B3D9FF',
    dateFormat: 'MMM d, yyyy',
    // Advanced
    confirmBeforeDelete: true,
    // Internal
    leftPaneWidth: 300,
    pinnedNotes: {}
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
        validator?: (value: string) => boolean
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
                            } else {
                                // For color setting that only updates CSS
                                this.plugin.updateSelectionColor();
                            }
                        }
                        
                        this.debounceTimers.delete(timerId);
                    }, 500);
                    
                    this.debounceTimers.set(timerId, timer);
                }));
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
        new Setting(containerEl)
            .setName('File organization')
            .setHeading();

        const sortSetting = new Setting(containerEl)
            .setName('Sort files by')
            .setDesc('Choose how files are sorted in the file list.')
            .addDropdown(dropdown => dropdown
                .addOption('modified', 'Date edited')
                .addOption('created', 'Date created')
                .addOption('title', 'Title')
                .setValue(this.plugin.settings.sortOption)
                .onChange(async (value: SortOption) => {
                    this.plugin.settings.sortOption = value;
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                    // Update group by date visibility
                    updateGroupByDateVisibility(value !== 'title');
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
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                }));

        new Setting(containerEl)
            .setName('Show notes from subfolders')
            .setDesc('Display all notes from subfolders in the current folder view.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showNotesFromSubfolders)
                .onChange(async (value) => {
                    this.plugin.settings.showNotesFromSubfolders = value;
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                }));

        new Setting(containerEl)
            .setName('Auto-reveal active file')
            .setDesc('Automatically reveal and select files when opened from Quick Switcher, links, or search.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoRevealActiveFile)
                .onChange(async (value) => {
                    this.plugin.settings.autoRevealActiveFile = value;
                    await this.plugin.saveSettings();
                }));

        this.createDebouncedTextSetting(
            containerEl,
            'Excluded files',
            'Comma-separated list of frontmatter properties. Files containing any of these properties will be hidden (e.g., draft, private, archived).',
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

        // Section 2: File display
        new Setting(containerEl)
            .setName('File display')
            .setHeading();

        const showPreviewSetting = new Setting(containerEl)
            .setName('Show file preview')
            .setDesc('Display preview text beneath file names.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFilePreview)
                .onChange(async (value) => {
                    this.plugin.settings.showFilePreview = value;
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                    updatePreviewSettingsVisibility(value);
                }));

        // Container for preview-related settings
        const previewSettingsEl = containerEl.createDiv('preview-settings');

        new Setting(previewSettingsEl)
            .setName('Skip non-text in preview')
            .setDesc('Exclude headings, images, and embeds from preview text.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.skipNonTextInPreview)
                .onChange(async (value) => {
                    this.plugin.settings.skipNonTextInPreview = value;
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                }));

        const showFeatureImageSetting = new Setting(containerEl)
            .setName('Show feature image')
            .setDesc('Display thumbnail images from frontmatter. Tip: Use the "Featured Image" plugin to automatically set feature images for all your documents.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFeatureImage)
                .onChange(async (value) => {
                    this.plugin.settings.showFeatureImage = value;
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                    updateFeatureImageSettingsVisibility(value);
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
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                }));

        new Setting(containerEl)
            .setName('Show folder file count')
            .setDesc('Display the number of files in each folder.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFolderFileCount)
                .onChange(async (value) => {
                    this.plugin.settings.showFolderFileCount = value;
                    await this.plugin.saveSettings();
                    this.plugin.onSettingsChange();
                }));

        // Section 4: Appearance
        new Setting(containerEl)
            .setName('Appearance')
            .setHeading();

        new Setting(containerEl)
            .setName('Selection color')
            .setDesc('Background color for selected items')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.selectionColor)
                .onChange(async (value) => {
                    this.plugin.settings.selectionColor = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateSelectionColor();
                }))
            .addText(text => text
                .setPlaceholder('#B3D9FF')
                .setValue(this.plugin.settings.selectionColor)
                .onChange(async (value) => {
                    // Validate hex color format
                    if (/^#[0-9A-F]{6}$/i.test(value) || value === '') {
                        this.plugin.settings.selectionColor = value || '#B3D9FF';
                        await this.plugin.saveSettings();
                        this.plugin.updateSelectionColor();
                    }
                }));

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

        // Section 5: Advanced
        new Setting(containerEl)
            .setName('Advanced')
            .setHeading();

        new Setting(containerEl)
            .setName('Confirm before deleting files')
            .setDesc('Show confirmation dialog when deleting files or folders')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.confirmBeforeDelete)
                .onChange(async (value) => {
                    this.plugin.settings.confirmBeforeDelete = value;
                    await this.plugin.saveSettings();
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
                    localStorage.removeItem(this.plugin.keys.selectedFolderKey);
                    localStorage.removeItem(this.plugin.keys.selectedFileKey);
                    localStorage.removeItem(this.plugin.keys.leftPaneWidthKey);
                    
                    // Reset the plugin settings for left pane width
                    this.plugin.settings.leftPaneWidth = 300;
                    await this.plugin.saveSettings();
                    
                    new Notice('Navigator state cleared. Refresh the view to see changes.');
                }));

        // Visibility update functions
        const updateGroupByDateVisibility = (show: boolean) => {
            dateGroupingEl.style.display = show ? 'block' : 'none';
        };

        const updatePreviewSettingsVisibility = (show: boolean) => {
            previewSettingsEl.style.display = show ? 'block' : 'none';
        };

        const updateFeatureImageSettingsVisibility = (show: boolean) => {
            featureImageSettingsEl.style.display = show ? 'block' : 'none';
        };

        // Set initial visibility
        updateGroupByDateVisibility(this.plugin.settings.sortOption !== 'title');
        updatePreviewSettingsVisibility(this.plugin.settings.showFilePreview);
        updateFeatureImageSettingsVisibility(this.plugin.settings.showFeatureImage);
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