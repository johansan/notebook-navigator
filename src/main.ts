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
    Notice
} from 'obsidian';
import { SortOption, NotebookNavigatorSettings, DEFAULT_SETTINGS, NotebookNavigatorSettingTab } from './settings';
import { LocalStorageKeys, NavigatorElementAttributes, VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT } from './types';
import { DateUtils } from './utils/DateUtils';
import { PreviewTextUtils } from './utils/PreviewTextUtils';
import { FileSystemOperations } from './services/FileSystemService';
import { NotebookNavigatorView } from './view/NotebookNavigatorView';

/**
 * Main plugin class for Notebook Navigator
 * Provides a Notes-style file explorer for Obsidian with two-pane layout
 * Manages plugin lifecycle, settings, and view registration
 */
export default class NotebookNavigatorPlugin extends Plugin {
    settings: NotebookNavigatorSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;

    // LocalStorage keys for state persistence
    // These keys are used to save and restore the plugin's state between sessions
    keys: LocalStorageKeys = {
        expandedFoldersKey: 'notebook-navigator-expanded-folders',
        expandedTagsKey: 'notebook-navigator-expanded-tags',
        expandedBacklinksKey: 'notebook-navigator-expanded-backlinks',
        selectedFolderKey: 'notebook-navigator-selected-folder',
        selectedFileKey: 'notebook-navigator-selected-file',
        leftPaneWidthKey: 'notebook-navigator-left-pane-width'
    };

    /**
     * Plugin initialization - called when plugin is enabled
     * Sets up views, commands, event handlers, and UI elements
     * Ensures proper initialization order for all plugin components
     */
    async onload() {
        await this.loadSettings();
        
        this.registerView(
            VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT,
            (leaf) => new NotebookNavigatorView(leaf, this)
        );

        this.addCommand({
            id: 'open-notebook-navigator',
            name: 'Open',
            callback: async () => {
                await this.activateView(true);
            }
        });

        this.addCommand({
            id: 'reveal-active-file',
            name: 'Reveal active file',
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

        this.addSettingTab(new NotebookNavigatorSettingTab(this.app, this));

        // Register editor context menu
        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => {
                const file = view.file;
                if (file) {
                    menu.addSeparator();
                    menu.addItem((item) => {
                        item
                            .setTitle('Reveal in Notebook Navigator')
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
        
        // Clean up pinned notes after workspace is ready
        this.app.workspace.onLayoutReady(async () => {
            this.cleanupPinnedNotes();
            
            // Always open the view if it doesn't exist
            const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
            if (leaves.length === 0) {
                await this.activateView(true);
            }
        });
    }

    /**
     * Plugin cleanup - called when plugin is disabled or updated
     * Removes ribbon icon but preserves open views to maintain user workspace
     * Per Obsidian guidelines: leaves should not be detached in onunload
     */
    onunload() {
        // Clean up the ribbon icon
        this.ribbonIconEl?.remove();
    }

    /**
     * Loads plugin settings from Obsidian's data storage
     * Merges saved settings with default settings to ensure all required fields exist
     * Called during plugin initialization
     */
    async loadSettings() {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
    }

    /**
     * Saves current plugin settings to Obsidian's data storage
     * Persists user preferences between sessions
     * Called whenever settings are modified
     */
    async saveSettings() {
        await this.saveData(this.settings);
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

        // No need to store reference anymore

        return leaf;
    }


    
    /**
     * Removes references to deleted pinned notes from settings
     * Validates all pinned note paths and removes invalid entries
     * Prevents accumulation of orphaned references over time
     * Called after workspace is ready to ensure vault is fully loaded
     */
    cleanupPinnedNotes() {
        let changed = false;
        const pinnedNotes = this.settings.pinnedNotes;
        
        // Ensure pinnedNotes exists
        if (!pinnedNotes || typeof pinnedNotes !== 'object') {
            return;
        }
        
        // Iterate through all folders
        for (const folderPath in pinnedNotes) {
            const filePaths = pinnedNotes[folderPath];
            const validFiles = filePaths.filter(filePath => {
                const file = this.app.vault.getAbstractFileByPath(filePath);
                return file instanceof TFile;
            });
            
            if (validFiles.length !== filePaths.length) {
                pinnedNotes[folderPath] = validFiles;
                changed = true;
            }
            
            // Remove empty entries
            if (validFiles.length === 0) {
                delete pinnedNotes[folderPath];
                changed = true;
            }
        }
        
        if (changed) {
            this.saveSettings();
        }
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
        
        // Find and update the navigator view
        const navigatorLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
        navigatorLeaves.forEach(leaf => {
            const view = leaf.view;
            if (view instanceof NotebookNavigatorView) {
                view.revealFile(file);
            }
        });
    }

    /**
     * Handles settings changes by refreshing all active navigator views
     * Ensures UI stays in sync with user preferences
     * Called by settings tab when any setting is modified
     */
    onSettingsChange() {
        // Update all active views when settings change
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK_NAVIGATOR_REACT);
        leaves.forEach(leaf => {
            const view = leaf.view;
            if (view instanceof NotebookNavigatorView) {
                view.refresh();
            }
        });
    }

    /**
     * Creates or recreates the ribbon icon for quick access to the navigator
     * Removes existing icon before creating new one to prevent duplicates
     * Icon appears in Obsidian's left sidebar ribbon
     */
    refreshIconRibbon() {
        this.ribbonIconEl?.remove();
        this.ribbonIconEl = this.addRibbonIcon('notebook', 'Notebook Navigator', async () => {
            await this.activateView(true);
        });
    }


}
