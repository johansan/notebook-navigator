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

import { 
    App, 
    Plugin, 
    ItemView, 
    WorkspaceLeaf, 
    TFile, 
    TFolder, 
    TAbstractFile,
    Menu,
    setIcon,
    Notice,
    Platform
} from 'obsidian';
import { SortOption, NotebookNavigatorSettings, DEFAULT_SETTINGS, NotebookNavigatorSettingTab } from './settings';
import { LocalStorageKeys, NavigatorElementAttributes, VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT, STORAGE_KEYS } from './types';
import { DateUtils } from './utils/DateUtils';
import { PreviewTextUtils } from './utils/PreviewTextUtils';
import { FileSystemOperations } from './services/FileSystemService';
import { MetadataService } from './services/MetadataService';
import { NotebookNavigatorView } from './view/NotebookNavigatorView';
import { strings } from './i18n';

/**
 * Main plugin class for Notebook Navigator
 * Provides a Notes-style file explorer for Obsidian with two-pane layout
 * Manages plugin lifecycle, settings, and view registration
 */
export default class NotebookNavigatorPlugin extends Plugin {
    settings: NotebookNavigatorSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;
    metadataService: MetadataService | null = null;
    // A map of callbacks to notify open React views of changes
    private settingsUpdateListeners = new Map<string, () => void>();
    // Track if we're in the process of unloading
    private isUnloading = false;

    // LocalStorage keys for state persistence
    // These keys are used to save and restore the plugin's state between sessions
    keys: LocalStorageKeys = STORAGE_KEYS;

    /**
     * Plugin initialization - called when plugin is enabled
     * Sets up views, commands, event handlers, and UI elements
     * Ensures proper initialization order for all plugin components
     */
    async onload() {
        const startTime = performance.now();
        
        await this.loadSettings();
        
        // Initialize metadata service for handling vault events
        this.metadataService = new MetadataService(
            this.app,
            this.settings,
            async (updater) => {
                // Update settings
                updater(this.settings);
                await this.saveSettings();
                // The SettingsContext will handle updates through its listener
            }
        );
        
        this.registerView(
            VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT,
            (leaf) => {
                return new NotebookNavigatorView(leaf, this);
            }
        );

        this.addCommand({
            id: 'open-notebook-navigator',
            name: strings.commands.open,
            callback: async () => {
                await this.activateView(true);
            }
        });

        this.addCommand({
            id: 'reveal-active-file',
            name: strings.commands.revealActiveFile,
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile && activeFile.parent) {
                    if (!checking) {
                        this.revealFileInNavigator(activeFile);
                    }
                    return true;
                }
                return false;
            }
        });

        this.addCommand({
            id: 'focus-file-list',
            name: strings.commands.focusFileList,
            callback: async () => {
                // Ensure navigator is open
                const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
                if (leaves.length === 0) {
                    await this.activateView(true);
                }
                
                // Find and focus the file pane
                const navigatorLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
                navigatorLeaves.forEach(leaf => {
                    const view = leaf.view;
                    if (view instanceof NotebookNavigatorView) {
                        view.focusFilePane();
                    }
                });
            }
        });

        this.addSettingTab(new NotebookNavigatorSettingTab(this.app, this));

        // Listen for when the navigator view becomes active to restore scroll position
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                if (!leaf) return;

                // When the active leaf is our view, tell it to handle the event.
                // This is for restoring scroll state on mobile when returning from the editor.
                if (leaf.view instanceof NotebookNavigatorView) {
                    // The view itself will handle the logic.
                    leaf.view.handleViewBecomeActive();
                }
            })
        );

        // Register editor context menu
        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => {
                const file = view.file;
                if (file) {
                    menu.addSeparator();
                    menu.addItem((item) => {
                        item
                            .setTitle(strings.plugin.revealInNavigator)
                            .setIcon('folder-open')
                            .onClick(async () => {
                                await this.revealFileInNavigator(file);
                            });
                    });
                }
            })
        );

        // Ribbon Icon For Opening
        this.refreshIconRibbon();
        
        // Register rename event handler to update folder metadata
        this.registerEvent(
            this.app.vault.on('rename', async (file, oldPath) => {
                if (file instanceof TFolder && this.metadataService && !this.isUnloading) {
                    await this.metadataService.handleFolderRename(oldPath, file.path);
                    // The metadata service saves settings which triggers reactive updates
                }
            })
        );
        
        // Register delete event handler to clean up folder metadata
        this.registerEvent(
            this.app.vault.on('delete', async (file) => {
                if (!this.metadataService || this.isUnloading) return;
                
                if (file instanceof TFolder) {
                    await this.metadataService.handleFolderDelete(file.path);
                } else if (file instanceof TFile) {
                    await this.metadataService.handleFileDelete(file.path);
                }
                // The metadata service saves settings which triggers reactive updates
            })
        );
        
        // Clean up settings after workspace is ready
        // Use onLayoutReady for more reliable initialization
        this.app.workspace.onLayoutReady(async () => {
            const cleanupStartTime = performance.now();
            
            if (this.metadataService && !this.isUnloading) {
                await this.metadataService.cleanupAllMetadata();
            }
            
            // Always open the view if it doesn't exist
            const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
            if (leaves.length === 0 && !this.isUnloading) {
                await this.activateView(true);
            }
        });
    }

    /**
     * Register a callback to be notified when settings are updated
     * Used by React views to trigger re-renders
     */
    public registerSettingsUpdateListener(id: string, callback: () => void): void {
        this.settingsUpdateListeners.set(id, callback);
    }

    /**
     * Unregister a settings update callback
     * Called when React views unmount to prevent memory leaks
     */
    public unregisterSettingsUpdateListener(id: string): void {
        this.settingsUpdateListeners.delete(id);
    }

    /**
     * Plugin cleanup - called when plugin is disabled or updated
     * Removes ribbon icon but preserves open views to maintain user workspace
     * Per Obsidian guidelines: leaves should not be detached in onunload
     */
    onunload() {
        // Set unloading flag to prevent any new operations
        this.isUnloading = true;
        
        // Clear all listeners first to prevent any callbacks during cleanup
        this.settingsUpdateListeners.clear();
        
        // Clean up the metadata service
        if (this.metadataService) {
            // Clear the reference to break circular dependencies
            this.metadataService = null;
        }
        
        
        // Clean up the ribbon icon
        this.ribbonIconEl?.remove();
        this.ribbonIconEl = undefined;
    }

    /**
     * Loads plugin settings from Obsidian's data storage
     * Merges saved settings with default settings to ensure all required fields exist
     * Called during plugin initialization
     */
    async loadSettings() {
        const data = await this.loadData();
        const isFirstLaunch = !data; // No saved data means first launch
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
        
        // On first launch, if showRootFolder is enabled by default, 
        // ensure the root folder is in the expanded folders list
        if (isFirstLaunch && this.settings.showRootFolder) {
            const storedExpanded = localStorage.getItem(STORAGE_KEYS.expandedFoldersKey);
            const expandedFolders = storedExpanded ? JSON.parse(storedExpanded) : [];
            
            if (!expandedFolders.includes('/')) {
                expandedFolders.push('/');
                localStorage.setItem(STORAGE_KEYS.expandedFoldersKey, JSON.stringify(expandedFolders));
            }
        }
    }

    /**
     * Saves current plugin settings to Obsidian's data storage
     * Persists user preferences between sessions
     * Called whenever settings are modified
     */
    async saveSettings() {
        await this.saveData(this.settings);
        // Notify all listeners that settings have been updated
        this.onSettingsUpdate();
    }

    /**
     * Notifies all running views that the settings have been updated.
     * This triggers a re-render in the React components.
     */
    public onSettingsUpdate() {
        if (this.isUnloading) return;
        
        
        // Create a copy of listeners to avoid issues if a callback modifies the map
        const listeners = Array.from(this.settingsUpdateListeners.values());
        listeners.forEach(callback => {
            try {
                callback();
            } catch (error) {
            }
        });
    }

    /**
     * Activates or creates the Notebook Navigator view
     * Reuses existing view if available, otherwise creates new one in left sidebar
     * @param showAfterAttach - Whether to reveal/focus the view after activation
     * @returns The workspace leaf containing the view, or null if creation failed
     */
    async activateView(showAfterAttach = true) {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);

        if (leaves.length > 0) {
            // View already exists - just reveal it
            leaf = leaves[0];
            if (showAfterAttach) {
                workspace.revealLeaf(leaf);
            }
        } else {
            // Create new leaf only if none exists
            leaf = workspace.getLeftLeaf(false);
            if (leaf) {
                await leaf.setViewState({ type: VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT, active: true });
                if (showAfterAttach) {
                    workspace.revealLeaf(leaf);
                }
            }
        }

        return leaf;
    }


    /**
     * Reveals a specific file in the navigator, opening the view if needed
     * Expands parent folders and scrolls to make the file visible
     * Used by "Reveal in Navigator" commands and context menu actions
     * @param file - The file to reveal in the navigator
     */
    private async revealFileInNavigator(file: TFile) {
        // Ensure navigator is open
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
        if (leaves.length === 0) {
            await this.activateView(true);
        }
        
        // Find all navigator views and reveal the file
        const navigatorLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
        navigatorLeaves.forEach(leaf => {
            const view = leaf.view;
            if (view instanceof NotebookNavigatorView) {
                view.revealFile(file, true); // Pass true for isManualReveal
            }
        });
    }

    /**
     * Refreshes the ribbon icon based on current view state
     * Adds icon to open navigator if no navigator leaves exist
     * Removes icon if navigator is already open
     */
    refreshIconRibbon() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
        
        if (leaves.length === 0 && !this.ribbonIconEl) {
            // Add ribbon icon only if no navigator view exists
            this.ribbonIconEl = this.addRibbonIcon('notebook', strings.plugin.ribbonTooltip, async () => {
                await this.activateView(true);
            });
        } else if (leaves.length > 0 && this.ribbonIconEl) {
            // Remove ribbon icon if navigator view exists
            this.ribbonIconEl.remove();
            this.ribbonIconEl = undefined;
        }
    }

}