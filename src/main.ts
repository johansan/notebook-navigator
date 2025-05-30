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
import { VIEW_TYPE_NOTEBOOK, LocalStorageKeys, NavigatorElementAttributes } from './types';
import { DateUtils } from './utils/DateUtils';
import { PreviewTextUtils } from './utils/PreviewTextUtils';
import { KeyboardHandler } from './handlers/KeyboardHandler';
import { FileSystemOperations } from './operations/FileSystemOperations';

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
            VIEW_TYPE_NOTEBOOK,
            (leaf) => new NotebookNavigatorView(leaf, this)
        );

        this.addCommand({
            id: 'open-notebook-navigator',
            name: 'Open Notebook Navigator',
            callback: async () => {
                await this.activateView(true);
            }
        });

        this.addCommand({
            id: 'reveal-active-file',
            name: 'Reveal active file in Notebook Navigator',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile && activeFile.parent) {
                    await this.revealFileInNavigator(activeFile);
                }
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

        // Set initial selection color
        this.updateSelectionColor();

        // Ribbon Icon For Opening
        this.refreshIconRibbon();
        
        // Clean up pinned notes after workspace is ready
        this.app.workspace.onLayoutReady(() => {
            this.cleanupPinnedNotes();
        });
    }

    /**
     * Plugin cleanup - called when plugin is disabled
     * Removes all UI elements and detaches views to prevent memory leaks
     * Ensures clean shutdown of all plugin components
     */
    onunload() {
        // Clean up the ribbon icon
        this.ribbonIconEl?.remove();
        
        // Properly detach all notebook navigator leaves
        this.detachNotebookNavigatorLeaves();
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
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK);

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
                await leaf.setViewState({ type: VIEW_TYPE_NOTEBOOK, active: true });
                if (showAfterAttach) {
                    workspace.revealLeaf(leaf);
                }
            }
        }

        // No need to store reference anymore

        return leaf;
    }

    /**
     * Detaches all Notebook Navigator views from the workspace
     * Used during plugin cleanup to ensure no orphaned views remain
     * Iterates through all leaves of our view type and detaches them
     */
    private async detachNotebookNavigatorLeaves() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK);
        for (const leaf of leaves) {
            leaf.detach();
        }
    }

    /**
     * Updates the selection color CSS variable based on user settings
     * Allows dynamic theming of selected items in the navigator
     * Applied globally via CSS custom property
     */
    updateSelectionColor() {
        // Update CSS variable for selection color
        document.documentElement.style.setProperty('--nn-selection-color', this.settings.selectionColor);
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
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK);
        if (leaves.length === 0) {
            await this.activateView(true);
        }
        
        // Find and update the navigator view
        const navigatorLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK);
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
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK);
        leaves.forEach(leaf => {
            const view = leaf.view;
            if (view instanceof NotebookNavigatorView) {
                view.refresh();
            }
        });
        
        // Update selection color
        this.updateSelectionColor();
    }

    /**
     * Creates or recreates the ribbon icon for quick access to the navigator
     * Removes existing icon before creating new one to prevent duplicates
     * Icon appears in Obsidian's left sidebar ribbon
     */
    refreshIconRibbon() {
        this.ribbonIconEl?.remove();
        this.ribbonIconEl = this.addRibbonIcon('folder-tree', 'Notebook Navigator', async () => {
            await this.activateView(true);
        });
    }

    /**
     * Completely refreshes the navigator by recreating all views
     * Used when major changes require full view reconstruction
     * More aggressive than view.refresh() which updates existing views
     */
    async refreshView() {
        // Detach existing views and create a new one
        await this.detachNotebookNavigatorLeaves();
        await this.activateView(true);
    }

}

/**
 * Main view class implementing the two-pane file navigator interface
 * Manages folder tree (left pane) and file list (right pane) with Notes-style UI
 * Handles all user interactions, state management, and rendering
 */
class NotebookNavigatorView extends ItemView {
    plugin: NotebookNavigatorPlugin;
    private folderTree: HTMLElement;  // Left pane folder hierarchy
    private fileList: HTMLElement;    // Right pane file listing
    private selectedFolder: TFolder | null = null;  // Currently selected folder
    private previousFolder: TFolder | null = null;  // Previously selected folder for change detection
    private selectedFile: TFile | null = null;      // Currently selected file
    private expandedFolders: Set<string> = new Set();  // Tracks which folders are expanded
    private focusedPane: 'folders' | 'files' = 'folders';  // Which pane has keyboard focus
    private focusedFolderIndex: number = 0;  // Index of focused folder for keyboard navigation
    private focusedFileIndex: number = 0;    // Index of focused file for keyboard navigation
    private leftPane: HTMLElement;           // Container for folder tree
    private splitContainer: HTMLElement;     // Main container with both panes
    private resizing: boolean = false;       // Flag for resize operation in progress
    private eventRefs: Array<() => void> = [];  // Cleanup functions for event listeners
    private resizeMouseMoveHandler: ((e: MouseEvent) => void) | null = null;  // Handler for pane resizing
    private resizeMouseUpHandler: ((e: MouseEvent) => void) | null = null;    // Handler for resize completion
    private isLoading: boolean = true;       // Flag to track initial load state
    private fileListRefreshTimer?: NodeJS.Timeout;  // Debounce timer for file list updates
    private pendingCountUpdate: boolean = false;    // Flag for pending folder count updates
    private keyboardHandler: KeyboardHandler;       // Handles keyboard navigation logic
    private pendingFolderSelection: string | null = null;  // Path of folder to select after refresh
    private fileSystemOps: FileSystemOperations;    // Handles file/folder operations

    /**
     * Initializes the view with plugin reference and file system operations
     * @param leaf - The workspace leaf containing this view
     * @param plugin - Reference to the main plugin instance
     */
    constructor(leaf: WorkspaceLeaf, plugin: NotebookNavigatorPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.fileSystemOps = new FileSystemOperations(this.app);
    }

    /**
     * Returns the unique identifier for this view type
     * Used by Obsidian to register and manage view instances
     * @returns The view type identifier constant
     */
    getViewType() {
        return VIEW_TYPE_NOTEBOOK;
    }

    /**
     * Returns the display name shown in the view header
     * @returns Human-readable name for the view
     */
    getDisplayText() {
        return 'Notebook Navigator';
    }

    /**
     * Returns the icon identifier for the view
     * Displayed in tabs and view headers
     * @returns Icon identifier from Obsidian's icon set
     */
    getIcon() {
        return 'folder-tree';
    }

    /**
     * View initialization - creates the UI structure and sets up event handlers
     * Called when the view is opened or revealed
     * Builds the two-pane layout with folder tree and file list
     * Restores saved state and sets up keyboard navigation
     */
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('notebook-navigator');

        this.splitContainer = container.createDiv('nn-split-container');
        
        this.leftPane = this.splitContainer.createDiv('nn-left-pane');
        this.leftPane.style.width = `${this.plugin.settings.leftPaneWidth}px`;
        const folderHeader = this.leftPane.createDiv('nn-pane-header');
        
        const folderActions = folderHeader.createDiv('nn-header-actions');
        const newFolderBtn = folderActions.createEl('button', { 
            cls: 'nn-icon-button',
            attr: { 'aria-label': 'New Folder' }
        });
        setIcon(newFolderBtn, 'folder-plus');
        const newFolderClickHandler = () => this.createNewFolder();
        newFolderBtn.addEventListener('click', newFolderClickHandler);
        this.eventRefs.push(() => newFolderBtn.removeEventListener('click', newFolderClickHandler));

        this.folderTree = this.leftPane.createDiv('nn-folder-tree');
        
        // Add resize handle
        const resizeHandle = this.splitContainer.createDiv('nn-resize-handle');
        this.setupResizeHandle(resizeHandle);
        
        const rightPane = this.splitContainer.createDiv('nn-right-pane');
        const fileHeader = rightPane.createDiv('nn-pane-header');
        
        const fileActions = fileHeader.createDiv('nn-header-actions');
        
        const newFileBtn = fileActions.createEl('button', { 
            cls: 'nn-icon-button',
            attr: { 'aria-label': 'New File' }
        });
        setIcon(newFileBtn, 'create-new');
        const newFileClickHandler = () => this.createNewFile();
        newFileBtn.addEventListener('click', newFileClickHandler);
        this.eventRefs.push(() => newFileBtn.removeEventListener('click', newFileClickHandler));

        this.fileList = rightPane.createDiv('nn-file-list');

        this.registerEvent(
            this.app.vault.on('create', (file) => {
                if (file instanceof TFolder) {
                    this.refresh(); // Full refresh for folder changes
                } else {
                    this.debouncedFileListRefresh(); // Only refresh file list for files
                }
            })
        );
        this.registerEvent(
            this.app.vault.on('delete', (file) => {
                if (file instanceof TFolder) {
                    this.refresh(); // Full refresh for folder changes
                } else {
                    this.debouncedFileListRefresh(); // Only refresh file list for files
                }
            })
        );
        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => {
                if (file instanceof TFolder) {
                    this.refresh(); // Full refresh for folder changes
                } else {
                    this.debouncedFileListRefresh(); // Only refresh file list for files
                }
            })
        );
        this.registerEvent(
            this.app.vault.on('modify', () => this.debouncedFileListRefresh())
        );
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                this.handleActiveFileChange();
                
                // If this view just became active, ensure selected items are visible
                if (leaf === this.leaf && (this.selectedFile || this.selectedFolder)) {
                    setTimeout(() => {
                        if (this.selectedFolder) {
                            this.scrollSelectedFolderIntoView();
                        }
                        if (this.selectedFile) {
                            this.scrollSelectedFileIntoView();
                        }
                    }, 100);
                }
            })
        );

        // Create the keyboard handler with a context that provides access to current state
        const self = this;
        const keyboardContext = {
            get folderTree() { return self.folderTree; },
            get fileList() { return self.fileList; },
            get focusedPane() { return self.focusedPane; },
            set focusedPane(value: 'folders' | 'files') { self.focusedPane = value; },
            get focusedFolderIndex() { return self.focusedFolderIndex; },
            set focusedFolderIndex(value: number) { self.focusedFolderIndex = value; },
            get focusedFileIndex() { return self.focusedFileIndex; },
            set focusedFileIndex(value: number) { self.focusedFileIndex = value; },
            get expandedFolders() { return self.expandedFolders; },
            get selectedFile() { return self.selectedFile; },
            set selectedFile(value: TFile | null) { self.selectedFile = value; },
            selectFolder: (folder: TFolder) => self.selectFolder(folder),
            toggleFolder: (folder: TFolder) => self.toggleFolder(folder),
            updateFocus: () => self.updateFocus(),
            updateFileSelection: () => self.updateFileSelection(),
            previewFile: (file: TFile) => self.previewFile(file),
            saveState: () => self.saveState(),
            openFile: (file: TFile) => self.openFile(file),
            refreshFileList: () => self.refreshFileList(),
            deleteFolder: (folder: TFolder) => self.deleteFolder(folder),
            deleteFile: (file: TFile) => self.deleteFile(file),
            app: self.app
        };

        this.keyboardHandler = new KeyboardHandler(keyboardContext);

        const keydownHandler = (e: KeyboardEvent) => {
            this.keyboardHandler.handleKeyboardNavigation(e);
        };
        (container as HTMLElement).addEventListener('keydown', keydownHandler);
        this.eventRefs.push(() => (container as HTMLElement).removeEventListener('keydown', keydownHandler));

        // Set up event delegation for drag-and-drop
        this.setupEventDelegation();

        // Set initial focus to container to enable keyboard navigation
        (container as HTMLElement).tabIndex = 0;
        
        // Set initial focus pane
        container.setAttribute('data-focus-pane', this.focusedPane);
        
        // Load saved state before refresh
        await this.loadState();
        
        // First render the folder tree
        if (this.selectedFolder) {
            // Make sure parent folders are expanded before rendering
            this.ensureFolderVisible(this.selectedFolder);
        }
        this.renderFolderTree();
        
        // After folder tree is rendered, restore folder navigation state
        if (this.selectedFolder) {
            // Calculate the focused folder index
            this.calculateFocusedFolderIndex();
            // Scroll selected folder into view after a small delay for DOM to settle
            setTimeout(() => {
                this.scrollSelectedFolderIntoView();
            }, 50);
        }
        
        // Then render the file list
        this.refreshFileList();
        
        // After file list is rendered, restore file navigation state and scroll
        if (this.selectedFile) {
            setTimeout(() => {
                this.calculateFocusedFileIndex();
                this.scrollSelectedFileIntoView();
            }, 150); // Increased delay to ensure async content is loaded
        }
        
        // Mark loading as complete
        this.isLoading = false;
        
        // Focus the container after a short delay to ensure it's ready
        setTimeout(() => {
            (container as HTMLElement).focus();
        }, 100);
    }

    /**
     * View cleanup - called when view is closed
     * Removes all event listeners to prevent memory leaks
     * Saves current state for restoration on next open
     * Ensures proper cleanup of all view resources
     */
    async onClose() {
        // Clean up stored event listeners
        this.eventRefs.forEach(cleanup => cleanup());
        this.eventRefs = [];
        
        // Clean up resize handlers if active
        if (this.resizeMouseMoveHandler) {
            document.removeEventListener('mousemove', this.resizeMouseMoveHandler);
            this.resizeMouseMoveHandler = null;
        }
        if (this.resizeMouseUpHandler) {
            document.removeEventListener('mouseup', this.resizeMouseUpHandler);
            this.resizeMouseUpHandler = null;
        }
        
        // Save state before closing
        await this.saveState();
        
        // No plugin reference to clear anymore
    }

    /**
     * Loads previously saved state from localStorage
     * Restores expanded folders, selected items, and pane width
     * Validates all paths to ensure referenced items still exist
     * Called during view initialization to restore user's last state
     */
    private async loadState() {
        // Load expanded folders from localStorage
        const expandedFoldersJson = localStorage.getItem(this.plugin.keys.expandedFoldersKey);
        if (expandedFoldersJson) {
            try {
                const expandedFolderPaths = JSON.parse(expandedFoldersJson) as string[];
                // Validate that folders still exist
                expandedFolderPaths.forEach(path => {
                    const folder = this.app.vault.getAbstractFileByPath(path);
                    if (folder instanceof TFolder) {
                        this.expandedFolders.add(path);
                    }
                });
            } catch (e) {
                console.error('Failed to load expanded folders:', e);
            }
        }
        
        // Load selected folder from localStorage
        const selectedFolderPath = localStorage.getItem(this.plugin.keys.selectedFolderKey);
        if (selectedFolderPath) {
            const folder = this.app.vault.getAbstractFileByPath(selectedFolderPath);
            if (folder instanceof TFolder) {
                this.selectedFolder = folder;
            }
        }
        
        // Load selected file from localStorage
        const selectedFilePath = localStorage.getItem(this.plugin.keys.selectedFileKey);
        if (selectedFilePath) {
            const file = this.app.vault.getAbstractFileByPath(selectedFilePath);
            if (file instanceof TFile) {
                this.selectedFile = file;
            }
        }
        
        // Load left pane width from localStorage
        const leftPaneWidth = localStorage.getItem(this.plugin.keys.leftPaneWidthKey);
        if (leftPaneWidth) {
            const width = parseInt(leftPaneWidth);
            if (!isNaN(width) && width >= 150 && width <= 600) {
                this.plugin.settings.leftPaneWidth = width;
            }
        }
    }

    /**
     * Saves current view state to localStorage for persistence
     * Stores expanded folders, selected items for restoration on next open
     * Called during view close and after significant state changes
     * Uses localStorage for immediate persistence across sessions
     */
    private async saveState() {
        // Save expanded folders to localStorage
        localStorage.setItem(
            this.plugin.keys.expandedFoldersKey, 
            JSON.stringify(Array.from(this.expandedFolders))
        );
        
        // Save selected folder to localStorage
        if (this.selectedFolder) {
            localStorage.setItem(this.plugin.keys.selectedFolderKey, this.selectedFolder.path);
        } else {
            localStorage.removeItem(this.plugin.keys.selectedFolderKey);
        }
        
        // Save selected file to localStorage
        if (this.selectedFile) {
            localStorage.setItem(this.plugin.keys.selectedFileKey, this.selectedFile.path);
        } else {
            localStorage.removeItem(this.plugin.keys.selectedFileKey);
        }
    }

    /**
     * Sets up drag-to-resize functionality for the divider between panes
     * Allows users to adjust the width of the folder tree pane
     * Saves the new width to both settings and localStorage
     * @param handle - The resize handle element between the two panes
     */
    private setupResizeHandle(handle: HTMLElement) {
        let startX: number;
        let startWidth: number;

        this.resizeMouseMoveHandler = (e: MouseEvent) => {
            if (!this.resizing) return;
            
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(150, Math.min(600, startWidth + deltaX));
            this.leftPane.style.width = `${newWidth}px`;
        };

        this.resizeMouseUpHandler = async (e: MouseEvent) => {
            if (!this.resizing) return;
            
            this.resizing = false;
            
            if (this.resizeMouseMoveHandler) {
                document.removeEventListener('mousemove', this.resizeMouseMoveHandler);
            }
            if (this.resizeMouseUpHandler) {
                document.removeEventListener('mouseup', this.resizeMouseUpHandler);
            }
            
            // Save the new width
            const newWidth = parseInt(this.leftPane.style.width);
            this.plugin.settings.leftPaneWidth = newWidth;
            await this.plugin.saveSettings();
            
            // Also save to localStorage for immediate persistence
            localStorage.setItem(this.plugin.keys.leftPaneWidthKey, newWidth.toString());
        };

        const mouseDownHandler = (e: MouseEvent) => {
            this.resizing = true;
            startX = e.clientX;
            startWidth = this.leftPane.offsetWidth;
            
            document.addEventListener('mousemove', this.resizeMouseMoveHandler!);
            document.addEventListener('mouseup', this.resizeMouseUpHandler!);
            
            e.preventDefault();
        };

        handle.addEventListener('mousedown', mouseDownHandler);
        this.eventRefs.push(() => handle.removeEventListener('mousedown', mouseDownHandler));
    }

    /**
     * Refreshes both folder tree and file list displays
     * Handles pending folder selections (e.g., after creating new folder)
     * Updates focus and scrolls to newly selected items
     * Called when settings change or file system is modified
     */
    refresh() {
        this.renderFolderTree();
        this.refreshFileList();
        
        // Handle pending folder selection after refresh
        if (this.pendingFolderSelection) {
            const folder = this.app.vault.getAbstractFileByPath(this.pendingFolderSelection);
            if (folder instanceof TFolder) {
                // Select the newly created folder
                this.selectFolder(folder);
                
                // Calculate and update the focused folder index
                const allFolders = Array.from(this.folderTree.querySelectorAll('.nn-folder-item'));
                const folderIndex = allFolders.findIndex(el => 
                    el.getAttribute('data-path') === folder.path
                );
                if (folderIndex >= 0) {
                    this.focusedFolderIndex = folderIndex;
                    this.focusedPane = 'folders';
                    this.updateFocus();
                }
                
                // Scroll the folder into view
                setTimeout(() => {
                    this.scrollSelectedFolderIntoView();
                }, 50);
            }
            // Clear the pending selection
            this.pendingFolderSelection = null;
        }
    }

    /**
     * Debounced file list refresh to prevent excessive updates
     * Batches multiple rapid changes into a single refresh
     * Updates folder file counts if enabled in settings
     * Uses 100ms delay to balance responsiveness and performance
     */
    private debouncedFileListRefresh() {
        // Clear any existing timer
        if (this.fileListRefreshTimer) {
            clearTimeout(this.fileListRefreshTimer);
        }
        
        // Mark that we need to update counts
        this.pendingCountUpdate = true;
        
        // Set a new timer
        this.fileListRefreshTimer = setTimeout(() => {
            this.refreshFileList();
            if (this.pendingCountUpdate) {
                this.updateFolderCounts();
                this.pendingCountUpdate = false;
            }
        }, 100); // 100ms debounce
    }

    /**
     * Updates file counts displayed next to folder names
     * Efficiently updates existing DOM elements without full re-render
     * Only runs if showFolderFileCount setting is enabled
     * Called after file system changes that might affect counts
     */
    private updateFolderCounts() {
        if (!this.plugin.settings.showFolderFileCount) return;
        
        // Update counts without rebuilding the tree
        this.folderTree.querySelectorAll('.nn-folder-item').forEach(folderEl => {
            const path = folderEl.getAttribute('data-path');
            if (!path) return;
            
            const folder = this.app.vault.getAbstractFileByPath(path) as TFolder;
            if (!folder || !(folder instanceof TFolder)) return;
            
            const countEl = folderEl.querySelector('.nn-folder-count') as HTMLElement;
            const newCount = this.getFileCount(folder);
            
            if (countEl) {
                // Update existing count element
                countEl.textContent = newCount.toString();
                countEl.setAttribute('data-count', newCount.toString());
            }
        });
    }

    /**
     * Renders the complete folder tree structure in the left pane
     * Respects showRootFolder and ignoreFolders settings
     * Sorts folders alphabetically and maintains expansion state
     * Resets the global folder index for keyboard navigation
     */
    private renderFolderTree() {
        this.folderTree.empty();
        const rootFolder = this.app.vault.getRoot();
        this.globalFolderIndex = 0;
        
        // Get ignored folders
        const ignoredFolders = this.plugin.settings.ignoreFolders
            .split(',')
            .map(f => f.trim())
            .filter(f => f);
        
        if (this.plugin.settings.showRootFolder) {
            this.renderFolderItem(rootFolder, this.folderTree, 0, ignoredFolders);
        } else {
            // Render root's children directly
            const children = rootFolder.children
                .filter(child => child instanceof TFolder)
                .filter(child => !ignoredFolders.includes(child.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            children.forEach(child => {
                this.renderFolderItem(child as TFolder, this.folderTree, 0, ignoredFolders);
            });
        }
    }

    // Global counter for assigning unique indices to folders during rendering
    // Used for keyboard navigation to track folder positions
    private globalFolderIndex: number = 0;

    /**
     * Counts the number of markdown files in a folder
     * Only counts direct children, not files in subfolders
     * Filters for .md extension to exclude images and other files
     * Excludes files with specified frontmatter properties
     * @param folder - The folder to count files in
     * @returns Number of markdown files in the folder
     */
    private getFileCount(folder: TFolder): number {
        const excludedProperties = this.plugin.settings.excludedFiles
            .split(',')
            .map(p => p.trim())
            .filter(p => p);
        
        return folder.children.filter(child => {
            if (!(child instanceof TFile) || !this.isDisplayableFile(child)) return false;
            
            // Check if file should be excluded based on frontmatter
            if (excludedProperties.length > 0 && this.shouldExcludeFile(child, excludedProperties)) {
                return false;
            }
            
            return true;
        }).length;
    }

    /**
     * Renders a single folder item with its UI elements
     * Creates expandable folder with arrow, icon, name, and optional file count
     * Handles click events, context menus, and drag-and-drop
     * Recursively renders child folders if expanded
     * @param folder - The folder to render
     * @param container - Parent container element
     * @param level - Nesting level for indentation
     * @param ignoredFolders - List of folder names to skip
     */
    private renderFolderItem(folder: TFolder, container: HTMLElement, level: number, ignoredFolders: string[]) {
        const index = this.globalFolderIndex++;
        
        // Prepare folder element attributes
        const folderAttrs: NavigatorElementAttributes = {
            'data-path': folder.path,
            'data-level': level.toString(),
            'data-index': index.toString(),
            'data-drop-zone': 'folder',
            'data-drop-path': folder.path,
            'data-expanded': this.expandedFolders.has(folder.path) ? 'true' : 'false'
        };
        
        const folderEl = container.createDiv({
            cls: 'nn-folder-item',
            attr: folderAttrs as any
        });

        if (this.focusedPane === 'folders' && index === this.focusedFolderIndex) {
            folderEl.addClass('nn-focused');
        }

        // Prepare folder content attributes (drag handle)
        const folderContentAttrs: NavigatorElementAttributes = {
            'data-path': folder.path,
            'data-draggable': 'true',
            'data-drag-type': 'folder',
            'data-drag-path': folder.path,
            'data-drag-handle': 'true',
            'data-clickable': 'folder',
            'data-click-path': folder.path,
            'data-context-menu': 'folder',
            'draggable': 'true'
        };
        
        const folderContent = folderEl.createDiv({
            cls: 'nn-folder-content',
            attr: folderContentAttrs as any
        });
        folderContent.style.paddingLeft = `${level * 20}px`;

        if (folder.children.some(child => child instanceof TFolder)) {
            const arrow = folderContent.createDiv('nn-folder-arrow');
            setIcon(arrow, this.expandedFolders.has(folder.path) ? 'chevron-down' : 'chevron-right');
            arrow.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFolder(folder);
            });
        } else {
            folderContent.createDiv('nn-folder-arrow nn-no-children');
        }

        const folderIcon = folderContent.createDiv('nn-folder-icon');
        const customIcon = this.getFolderIcon(folder);
        if (customIcon) {
            // If custom icon is an emoji or text, display it directly
            folderIcon.textContent = customIcon;
        } else {
            // Otherwise use default folder icon
            setIcon(folderIcon, this.expandedFolders.has(folder.path) ? 'folder-open' : 'folder-closed');
        }

        const folderName = folderContent.createDiv('nn-folder-name');
        folderName.textContent = folder.name || 'Vault';

        // Add file count
        if (this.plugin.settings.showFolderFileCount) {
            const fileCount = this.getFileCount(folder);
            const countEl = folderContent.createDiv('nn-folder-count');
            countEl.textContent = fileCount.toString();
            countEl.setAttribute('data-count', fileCount.toString());
        }

        if (this.selectedFolder === folder) {
            folderEl.addClass('nn-selected');
        }

        if (this.expandedFolders.has(folder.path)) {
            const childrenContainer = folderEl.createDiv('nn-folder-children');
            // Mark as expanded without animation for initial render
            childrenContainer.addClass('nn-expanded');
            
            const subfolders = folder.children
                .filter(child => child instanceof TFolder)
                .filter(child => !ignoredFolders.includes(child.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            subfolders.forEach((subfolder) => {
                this.renderFolderItem(subfolder as TFolder, childrenContainer, level + 1, ignoredFolders);
            });
        }
    }

    /**
     * Toggles folder expansion state (expand/collapse)
     * Updates DOM to show/hide child folders with smooth animation
     * Updates arrow icon direction and saves expansion state
     * @param folder - The folder to toggle
     */
    private toggleFolder(folder: TFolder) {
        const folderEl = this.folderTree.querySelector(`[data-path="${CSS.escape(folder.path)}"]`);
        if (!folderEl) return;

        // Get ignored folders
        const ignoredFolders = this.plugin.settings.ignoreFolders
            .split(',')
            .map(f => f.trim())
            .filter(f => f);

        const isExpanded = this.expandedFolders.has(folder.path);
        const arrow = folderEl.querySelector('.nn-folder-arrow svg');
        
        if (isExpanded) {
            // Collapse folder
            this.expandedFolders.delete(folder.path);
            const childrenContainer = folderEl.querySelector('.nn-folder-children') as HTMLElement;
            
            if (childrenContainer) {
                // Animate from current height to 0
                childrenContainer.style.maxHeight = childrenContainer.scrollHeight + 'px';
                childrenContainer.offsetHeight; // Force reflow
                
                childrenContainer.addClass('nn-animating');
                childrenContainer.removeClass('nn-expanded');
                childrenContainer.style.maxHeight = '0px';
                
                setTimeout(() => childrenContainer.remove(), 180);
            }
            
            if (arrow) setIcon(arrow.parentElement as HTMLElement, 'chevron-right');
            
            // Update folder icon
            const folderIcon = folderEl.querySelector('.nn-folder-icon');
            if (folderIcon) setIcon(folderIcon as HTMLElement, 'folder-closed');
        } else {
            // Expand folder
            this.expandedFolders.add(folder.path);
            const childrenContainer = folderEl.createDiv('nn-folder-children');
            
            // Render subfolders
            const subfolders = folder.children
                .filter(child => child instanceof TFolder && !ignoredFolders.includes(child.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            subfolders.forEach(subfolder => {
                this.renderFolderItem(subfolder as TFolder, childrenContainer, 
                    parseInt(folderEl.getAttribute('data-level') || '0') + 1, ignoredFolders);
            });
            
            // Animate from 0 to content height
            const targetHeight = childrenContainer.scrollHeight;
            childrenContainer.style.maxHeight = '0px';
            childrenContainer.offsetHeight; // Force reflow
            
            childrenContainer.addClass('nn-animating');
            childrenContainer.style.maxHeight = targetHeight + 'px';
            
            setTimeout(() => {
                childrenContainer.removeClass('nn-animating');
                childrenContainer.addClass('nn-expanded');
                childrenContainer.style.maxHeight = '';
            }, 180);
            
            if (arrow) setIcon(arrow.parentElement as HTMLElement, 'chevron-down');
            
            // Update folder icon
            const folderIcon = folderEl.querySelector('.nn-folder-icon');
            if (folderIcon) setIcon(folderIcon as HTMLElement, 'folder-open');
        }
        
        // Save state after toggling folder
        this.saveState();
    }

    /**
     * Selects a folder and updates the file list to show its contents
     * Updates visual selection state and triggers file list refresh
     * Saves state unless currently loading to preserve user's selection
     * @param folder - The folder to select
     */
    private selectFolder(folder: TFolder) {
        // Remove previous selection
        const previousSelected = this.folderTree.querySelector('.nn-selected');
        if (previousSelected) {
            previousSelected.removeClass('nn-selected');
        }

        // Add new selection
        const folderEl = this.folderTree.querySelector(`[data-path="${CSS.escape(folder.path)}"]`);
        if (folderEl) {
            folderEl.addClass('nn-selected');
        }

        this.selectedFolder = folder;
        this.refreshFileList();
        
        // Save state after selecting folder
        if (!this.isLoading) {
            this.saveState();
        }
    }

    /**
     * Ensures a folder is visible by expanding all its parent folders
     * Used when revealing files or navigating to hidden folders
     * Builds path from child to root then expands in correct order
     * @param folder - The folder to make visible
     * @returns True if any folders were expanded, false otherwise
     */
    private ensureFolderVisible(folder: TFolder): boolean {
        // Expand all parent folders to make this folder visible
        let parent = folder.parent;
        const foldersToExpand: TFolder[] = [];
        let expandedAny = false;
        
        while (parent && parent.path !== '') {
            foldersToExpand.unshift(parent);
            parent = parent.parent;
        }
        
        // Expand folders from root to target
        foldersToExpand.forEach(f => {
            if (!this.expandedFolders.has(f.path)) {
                this.expandedFolders.add(f.path);
                expandedAny = true;
            }
        });
        
        return expandedAny;
    }


    /**
     * Wrapper method to render files grouped by date
     * Delegates to renderUnpinnedFilesWithDateGroups with starting index 0
     * @param files - Array of files to render with date grouping
     */
    private renderFilesWithDateGroups(files: TFile[]) {
        this.renderUnpinnedFilesWithDateGroups(files, 0);
    }
    
    /**
     * Renders files grouped by date categories (Today, Yesterday, This Week, etc.)
     * Creates sticky headers for each date group with files listed below
     * Groups are based on file modification or creation date per sort settings
     * @param files - Array of files to render
     * @param startIndex - Starting index for keyboard navigation
     */
    private renderUnpinnedFilesWithDateGroups(files: TFile[], startIndex: number) {
        const groups = new Map<string, TFile[]>();
        const groupOrder: string[] = [];
        
        // Group files by date
        files.forEach((file) => {
            const timestamp = this.plugin.settings.sortOption === 'modified' 
                ? file.stat.mtime 
                : file.stat.ctime;
            const group = DateUtils.getDateGroup(timestamp);
            
            if (!groups.has(group)) {
                groups.set(group, []);
                groupOrder.push(group);
            }
            groups.get(group)!.push(file);
        });
        
        // Render each group
        let globalIndex = startIndex;
        groupOrder.forEach((groupName) => {
            // Create group header
            const groupHeader = this.fileList.createDiv('nn-date-group-header');
            groupHeader.setText(groupName);
            
            // Render files in this group
            const groupFiles = groups.get(groupName)!;
            groupFiles.forEach((file) => {
                this.renderFileItem(file, globalIndex);
                globalIndex++;
            });
        });
    }

    /**
     * Recursively collects all markdown files from a folder and its subfolders
     * Respects ignored folders setting and only includes .md files
     * Used when showNotesFromSubfolders setting is enabled
     * @param folder - Root folder to start collection from
     * @param ignoredFolders - List of folder names to skip
     * @returns Array of all markdown files found
     */
    private collectFilesRecursively(folder: TFolder, ignoredFolders: string[]): TFile[] {
        let files: TFile[] = [];
        
        folder.children.forEach(child => {
            if (child instanceof TFile && this.isDisplayableFile(child)) {
                files.push(child);
            } else if (child instanceof TFolder && !ignoredFolders.includes(child.name)) {
                // Recursively collect from subfolders
                files = files.concat(this.collectFilesRecursively(child, ignoredFolders));
            }
        });
        
        return files;
    }

    /**
     * Checks if a file should be displayed in the navigator
     * Currently shows markdown, canvas, and base files
     * @param file - The file to check
     * @returns True if the file should be displayed
     */
    private isDisplayableFile(file: TFile): boolean {
        const supportedExtensions = ['md', 'canvas', 'base'];
        return supportedExtensions.includes(file.extension);
    }

    /**
     * Checks if a file should be excluded based on its frontmatter properties
     * Files are excluded if they contain any of the properties listed in excludedFiles setting
     * @param file - The file to check
     * @param excludedProperties - Array of property names that should cause exclusion
     * @returns True if the file should be excluded
     */
    private shouldExcludeFile(file: TFile, excludedProperties: string[]): boolean {
        if (excludedProperties.length === 0) return false;
        
        const metadata = this.app.metadataCache.getFileCache(file);
        if (!metadata?.frontmatter) return false;
        
        // Check if any excluded property exists in the frontmatter
        return excludedProperties.some(prop => prop in metadata.frontmatter!);
    }
    
    /**
     * Recursively collects paths of all pinned notes in folder hierarchy
     * Includes pinned notes from current folder and all subfolders
     * Used when showNotesFromSubfolders is enabled to gather all pins
     * @param folder - Root folder to start collection from
     * @param ignoredFolders - List of folder names to skip
     * @returns Array of file paths for all pinned notes
     */
    private getPinnedNotesRecursively(folder: TFolder, ignoredFolders: string[]): string[] {
        let pinnedPaths: string[] = [];
        
        // Get pinned notes from current folder
        const currentPinned = this.plugin.settings.pinnedNotes[folder.path] || [];
        pinnedPaths = pinnedPaths.concat(currentPinned);
        
        // Recursively get from subfolders
        folder.children.forEach(child => {
            if (child instanceof TFolder && !ignoredFolders.includes(child.name)) {
                pinnedPaths = pinnedPaths.concat(
                    this.getPinnedNotesRecursively(child, ignoredFolders)
                );
            }
        });
        
        return pinnedPaths;
    }
    
    /**
     * Calculates the relative path from a base folder to a file's parent
     * Used to display parent folder path for files in subfolders
     * Returns empty string if file is directly in the base folder
     * @param file - The file to get relative path for
     * @param baseFolder - The base folder to calculate path from
     * @returns Relative path string (e.g., "subfolder/nested")
     */
    private getRelativePath(file: TFile, baseFolder: TFolder): string {
        if (file.parent === baseFolder) {
            return '';
        }
        
        // Build path from file's parent up to base folder
        let path = '';
        let current = file.parent;
        
        while (current && current !== baseFolder && current.path !== '/') {
            path = current.name + (path ? '/' + path : '');
            current = current.parent;
        }
        
        return path;
    }

    /**
     * Refreshes the file list display for the currently selected folder
     * Handles file collection, sorting, pinning, and rendering
     * Manages auto-selection of files when folder changes
     * Renders files with date groups or flat list based on settings
     */
    private refreshFileList() {
        this.fileList.empty();
        
        if (!this.selectedFolder) {
            this.fileList.createDiv('nn-empty-state').setText('Select a folder to view files');
            return;
        }

        // Get ignored folders
        const ignoredFolders = this.plugin.settings.ignoreFolders
            .split(',')
            .map(f => f.trim())
            .filter(f => f);
        
        let files: TFile[];
        if (this.plugin.settings.showNotesFromSubfolders) {
            files = this.collectFilesRecursively(this.selectedFolder, ignoredFolders);
        } else {
            files = this.selectedFolder.children
                .filter(child => child instanceof TFile && this.isDisplayableFile(child)) as TFile[];
        }

        // Filter out files based on frontmatter properties
        const excludedProperties = this.plugin.settings.excludedFiles
            .split(',')
            .map(p => p.trim())
            .filter(p => p);
        
        if (excludedProperties.length > 0) {
            files = files.filter(file => !this.shouldExcludeFile(file, excludedProperties));
        }

        // Sort files based on current sort option
        const sortOption = this.plugin.settings.sortOption;
        files = files.sort((a, b) => {
            switch (sortOption) {
                case 'modified':
                    return b.stat.mtime - a.stat.mtime;
                case 'created':
                    return b.stat.ctime - a.stat.ctime;
                case 'title':
                    return a.basename.localeCompare(b.basename);
                default:
                    return b.stat.mtime - a.stat.mtime;
            }
        });

        if (files.length === 0) {
            this.fileList.createDiv('nn-empty-state').setText('No files in this folder');
            return;
        }

        // Separate pinned and unpinned files
        const pinnedPaths = this.plugin.settings.showNotesFromSubfolders
            ? this.getPinnedNotesRecursively(this.selectedFolder, ignoredFolders)
            : this.getPinnedNotesForFolder(this.selectedFolder);
        const pinnedFiles: TFile[] = [];
        const unpinnedFiles: TFile[] = [];
        
        files.forEach(file => {
            if (pinnedPaths.includes(file.path)) {
                pinnedFiles.push(file);
            } else {
                unpinnedFiles.push(file);
            }
        });

        // Check if folder changed before setting previousFolder
        const folderChanged = this.selectedFolder !== this.previousFolder;
        this.previousFolder = this.selectedFolder;
        
        // Combine pinned and unpinned files for selection logic
        const allFiles = [...pinnedFiles, ...unpinnedFiles];
        
        // If loading and we have a selected file, restore it
        if (this.isLoading && this.selectedFile && allFiles.some(f => f.path === this.selectedFile!.path)) {
            // Find the index of the selected file
            const selectedIndex = allFiles.findIndex(f => f.path === this.selectedFile!.path);
            if (selectedIndex >= 0) {
                this.focusedFileIndex = selectedIndex;
            }
            this.previewFile(this.selectedFile);
        }
        // Otherwise, auto-select and preview the first file when folder changes
        else if (allFiles.length > 0 && folderChanged && !this.isLoading) {
            this.selectedFile = allFiles[0];
            this.focusedFileIndex = 0;
            this.previewFile(allFiles[0]);
            this.saveState();
        }

        // Render pinned files first if any exist
        let globalIndex = 0;
        if (pinnedFiles.length > 0) {
            // Create pinned group header
            const pinnedHeader = this.fileList.createDiv('nn-date-group-header');
            pinnedHeader.setText('📌 Pinned');
            
            // Render pinned files
            pinnedFiles.forEach(file => {
                this.renderFileItem(file, globalIndex);
                globalIndex++;
            });
        }

        // Now render unpinned files with proper selection
        if (this.plugin.settings.groupByDate && this.plugin.settings.sortOption !== 'title') {
            this.renderUnpinnedFilesWithDateGroups(unpinnedFiles, globalIndex);
        } else {
            unpinnedFiles.forEach((file) => {
                this.renderFileItem(file, globalIndex);
                globalIndex++;
            });
        }
    }

    /**
     * Renders a single file item in the file list
     * Creates file display with name, date, preview/path, and optional feature image
     * Sets up click handlers for selection and preview
     * Handles both normal and subfolder display modes
     * @param file - The file to render
     * @param index - Index for keyboard navigation
     */
    private renderFileItem(file: TFile, index: number) {
        // Prepare file element attributes
        const fileAttrs: NavigatorElementAttributes = {
            'data-path': file.path,
            'data-index': index.toString(),
            'data-draggable': 'true',
            'data-drag-type': 'file',
            'data-drag-path': file.path,
            'data-clickable': 'file',
            'data-click-path': file.path,
            'data-context-menu': 'file',
            'draggable': 'true'
        };
        
        const fileEl = this.fileList.createDiv({
            cls: 'nn-file-item',
            attr: fileAttrs as any
        });

        if (this.focusedPane === 'files' && index === this.focusedFileIndex) {
            fileEl.addClass('nn-focused');
        }

        const fileContent = fileEl.createDiv('nn-file-content');
        
        // Create text content container
        const textContent = fileContent.createDiv('nn-file-text-content');
        
        // File name only
        const fileName = textContent.createDiv('nn-file-name');
        fileName.textContent = file.basename;

        // Create second line with date and either preview or parent folder
        const secondLine = textContent.createDiv('nn-file-second-line');
        
        // Show date based on sort option
        const fileDate = secondLine.createDiv('nn-file-date');
        const sortOption = this.plugin.settings.sortOption;
        if (sortOption === 'created') {
            fileDate.textContent = DateUtils.formatDate(file.stat.ctime, this.plugin.settings.dateFormat);
        } else {
            fileDate.textContent = DateUtils.formatDate(file.stat.mtime, this.plugin.settings.dateFormat);
        }
        
        if (this.plugin.settings.showNotesFromSubfolders) {
            // Show parent folder for files in subfolders, preview for files in current folder
            const relativePath = this.getRelativePath(file, this.selectedFolder!);
            if (relativePath) {
                // File is in a subfolder - show parent folder
                const parentFolder = secondLine.createDiv('nn-file-parent-folder');
                parentFolder.textContent = relativePath;
            } else if (this.plugin.settings.showFilePreview) {
                // File is in current folder - show preview or file type
                const preview = secondLine.createDiv('nn-file-preview');
                if (file.extension === 'canvas') {
                    preview.textContent = 'CANVAS';
                } else if (file.extension === 'base') {
                    preview.textContent = 'BASE';
                } else {
                    // Show preview text for markdown files
                    this.app.vault.cachedRead(file).then(content => {
                        const previewText = PreviewTextUtils.extractPreviewText(content, this.plugin.settings);
                        preview.textContent = previewText;
                    });
                }
            }
        } else if (this.plugin.settings.showFilePreview) {
            // Normal mode - show preview text or file type
            const preview = secondLine.createDiv('nn-file-preview');
            if (file.extension === 'canvas') {
                preview.textContent = 'CANVAS';
            } else if (file.extension === 'base') {
                preview.textContent = 'BASE';
            } else {
                // Show preview text for markdown files
                this.app.vault.cachedRead(file).then(content => {
                    const previewText = PreviewTextUtils.extractPreviewText(content, this.plugin.settings);
                    preview.textContent = previewText;
                });
            }
        }

        // Add feature image if enabled
        if (this.plugin.settings.showFeatureImage) {
            const metadata = this.app.metadataCache.getFileCache(file);
            if (metadata?.frontmatter?.[this.plugin.settings.featureImageProperty]) {
                const imagePath = metadata.frontmatter[this.plugin.settings.featureImageProperty];
                this.renderFeatureImage(fileContent, imagePath, file);
            }
        }

        if (this.selectedFile === file) {
            fileEl.addClass('nn-selected');
        }
    }


    /**
     * Opens a file in the main editor pane
     * Used when user presses Tab on a file in the file list
     * Single click on file uses previewFile() instead
     * @param file - The file to open
     */
    private openFile(file: TFile) {
        this.app.workspace.getLeaf(false).openFile(file);
    }

    /**
     * Opens a file for preview without stealing focus from navigator
     * Allows users to browse files with keyboard while previewing content
     * Maintains focus on navigator for continued navigation
     * @param file - The file to preview
     */
    private previewFile(file: TFile) {
        // Open file in preview mode without stealing focus
        const leaf = this.app.workspace.getLeaf(false);
        leaf.openFile(file, { active: false });
        
        // Restore focus to navigator after a tiny delay
        setTimeout(() => {
            const container = this.containerEl.querySelector('.notebook-navigator') as HTMLElement;
            if (container) {
                container.focus();
            }
        }, 50);
    }


    /**
     * Renders a feature image thumbnail for a file
     * Supports both standard paths and wiki-style links [[image.png]]
     * Resolves image paths relative to the file's location
     * @param container - Container element to add the image to
     * @param imagePath - Path to the image from frontmatter
     * @param file - The file that contains the image reference
     */
    private renderFeatureImage(container: HTMLElement, imagePath: string, file: TFile) {
        const imageContainer = container.createDiv('nn-feature-image');
        const img = imageContainer.createEl('img');
        
        // Resolve the image path relative to the file
        let resolvedPath = imagePath;
        
        // Handle wiki-style links
        if (imagePath.startsWith('[[') && imagePath.endsWith(']]')) {
            resolvedPath = imagePath.slice(2, -2);
        }
        
        // Get the absolute path
        const linkPath = this.app.metadataCache.getFirstLinkpathDest(resolvedPath, file.path);
        if (linkPath) {
            const resourcePath = this.app.vault.getResourcePath(linkPath);
            if (resourcePath) {
                img.src = resourcePath;
                img.alt = 'Feature image';
                img.addClass('nn-feature-image-img');
            }
        }
    }

    /**
     * Shows context menu for folder operations
     * Provides options to create, rename, and delete folders/files
     * Root folder has limited options (no rename/delete)
     * @param folder - The folder to show context menu for
     * @param e - Mouse event for positioning the menu
     */
    private showFolderContextMenu(folder: TFolder, e: MouseEvent) {
        const menu = new Menu();

        // Creation items
        menu.addItem((item) =>
            item
                .setTitle('New note')
                .setIcon('create-new')
                .onClick(() => this.createNewFile(folder))
        );

        menu.addItem((item) =>
            item
                .setTitle('New folder')
                .setIcon('folder-plus')
                .onClick(() => this.createNewFolder(folder))
        );

        menu.addItem((item) =>
            item
                .setTitle('New canvas')
                .setIcon('layout-grid')
                .onClick(() => this.createNewCanvas(folder))
        );

        // Check if Bases plugin is enabled (core plugin in 1.9+)
        const basesPlugin = (this.app as any).internalPlugins?.getPluginById?.('bases');
        if (basesPlugin?.enabled) {
            menu.addItem((item) =>
                item
                    .setTitle('New base')
                    .setIcon('database')
                    .onClick(() => this.createNewBase(folder))
            );
        }

        menu.addSeparator();

        // Folder operations
        menu.addItem((item) =>
            item
                .setTitle('Duplicate folder')
                .setIcon('copy')
                .onClick(() => this.duplicateFolder(folder))
        );

        menu.addItem((item) =>
            item
                .setTitle('Search in folder')
                .setIcon('search')
                .onClick(() => this.searchInFolder(folder))
        );

        if (folder.path) {
            menu.addSeparator();

            menu.addItem((item) =>
                item
                    .setTitle('Rename folder')
                    .setIcon('pencil')
                    .onClick(() => this.renameFolder(folder))
            );

            menu.addItem((item) =>
                item
                    .setTitle('Delete folder')
                    .setIcon('trash')
                    .onClick(() => this.deleteFolder(folder))
            );
        }

        menu.showAtMouseEvent(e);
    }

    /**
     * Shows context menu for file operations
     * Provides options to open, pin/unpin, rename, and delete files
     * Pin option changes based on current pin state
     * @param file - The file to show context menu for
     * @param e - Mouse event for positioning the menu
     */
    private showFileContextMenu(file: TFile, e: MouseEvent) {
        const menu = new Menu();

        // Open options
        menu.addItem((item) =>
            item
                .setTitle('Open in new tab')
                .setIcon('plus')
                .onClick(() => this.app.workspace.getLeaf('tab').openFile(file))
        );

        menu.addItem((item) =>
            item
                .setTitle('Open to the right')
                .setIcon('separator-vertical')
                .onClick(() => this.app.workspace.getLeaf('split').openFile(file))
        );

        menu.addItem((item) =>
            item
                .setTitle('Open in new window')
                .setIcon('maximize')
                .onClick(() => this.app.workspace.getLeaf('window').openFile(file))
        );

        menu.addSeparator();
        
        // Add pin/unpin option
        if (this.selectedFolder) {
            const isPinned = this.isFilePinned(file, this.selectedFolder);
            menu.addItem((item) =>
                item
                    .setTitle(isPinned ? 'Unpin note' : 'Pin note')
                    .setIcon(isPinned ? 'pin-off' : 'pin')
                    .onClick(() => {
                        if (isPinned) {
                            this.unpinFile(file, this.selectedFolder!);
                        } else {
                            this.pinFile(file, this.selectedFolder!);
                        }
                    })
            );
        }

        menu.addSeparator();

        // File operations
        menu.addItem((item) =>
            item
                .setTitle('Duplicate note')
                .setIcon('copy')
                .onClick(() => this.duplicateFile(file))
        );

        // Check if Sync is enabled
        const syncPlugin = (this.app as any).internalPlugins?.getPluginById?.('sync');
        if (syncPlugin?.enabled) {
            menu.addItem((item) =>
                item
                    .setTitle('Open version history')
                    .setIcon('history')
                    .onClick(() => this.openVersionHistory(file))
            );
        }

        menu.addSeparator();

        menu.addItem((item) =>
            item
                .setTitle('Rename note')
                .setIcon('pencil')
                .onClick(() => this.renameFile(file))
        );

        menu.addItem((item) =>
            item
                .setTitle('Delete note')
                .setIcon('trash')
                .onClick(() => this.deleteFile(file))
        );

        menu.showAtMouseEvent(e);
    }

    /**
     * Creates a new folder with user input for name
     * Expands parent folder and selects the new folder after creation
     * Uses FileSystemOperations for the actual creation logic
     * @param parent - Optional parent folder, defaults to selected folder or root
     */
    private async createNewFolder(parent?: TFolder) {
        const targetFolder = parent || this.selectedFolder || this.app.vault.getRoot();
        
        await this.fileSystemOps.createNewFolder(targetFolder, (path) => {
            // Set pending selection before creation
            this.pendingFolderSelection = path;
            // Ensure parent folder will be expanded
            if (targetFolder.path) {
                this.expandedFolders.add(targetFolder.path);
            }
        });
    }

    /**
     * Creates a new markdown file with user input for name
     * Delegates to FileSystemOperations for creation and opening
     * @param parent - Optional parent folder, defaults to selected folder or root
     */
    private async createNewFile(parent?: TFolder) {
        const targetFolder = parent || this.selectedFolder || this.app.vault.getRoot();
        await this.fileSystemOps.createNewFile(targetFolder);
    }

    /**
     * Renames a folder with user input validation
     * Delegates to FileSystemOperations for the rename operation
     * @param folder - The folder to rename
     */
    private async renameFolder(folder: TFolder) {
        await this.fileSystemOps.renameFolder(folder);
    }

    /**
     * Renames a file with user input validation
     * Delegates to FileSystemOperations for the rename operation
     * @param file - The file to rename
     */
    private async renameFile(file: TFile) {
        await this.fileSystemOps.renameFile(file);
    }

    /**
     * Deletes a folder with optional confirmation dialog
     * Clears selection if the deleted folder was selected
     * Handles cleanup of UI state after deletion
     * @param folder - The folder to delete
     */
    private async deleteFolder(folder: TFolder) {
        await this.fileSystemOps.deleteFolder(folder, this.plugin.settings.confirmBeforeDelete, () => {
            if (this.selectedFolder === folder) {
                this.selectedFolder = null;
                this.refreshFileList();
            }
        });
    }

    /**
     * Deletes a file with optional confirmation dialog
     * Respects user's confirmation preference from settings
     * @param file - The file to delete
     */
    private async deleteFile(file: TFile) {
        await this.fileSystemOps.deleteFile(file, this.plugin.settings.confirmBeforeDelete);
    }

    /**
     * Creates a new canvas file in the specified folder
     * Canvas files are JSON-based drawing/diagram files in Obsidian
     * @param folder - The folder to create the canvas in
     */
    private async createNewCanvas(folder: TFolder) {
        try {
            // Generate unique canvas name
            let canvasName = "Untitled Canvas";
            let counter = 1;
            let path = folder.path ? `${folder.path}/${canvasName}.canvas` : `${canvasName}.canvas`;
            
            // Check if canvas exists and increment counter
            while (this.app.vault.getAbstractFileByPath(path)) {
                canvasName = `Untitled Canvas ${counter}`;
                path = folder.path ? `${folder.path}/${canvasName}.canvas` : `${canvasName}.canvas`;
                counter++;
            }
            
            // Create empty canvas content
            const canvasContent = JSON.stringify({
                nodes: [],
                edges: []
            }, null, 2);
            
            const file = await this.app.vault.create(path, canvasContent);
            
            // Open the canvas
            this.app.workspace.getLeaf(false).openFile(file);
            
            // Select the parent folder and the new file
            this.selectFolder(folder);
            this.selectedFile = file;
            this.refreshFileList();
            
        } catch (error) {
            new Notice(`Failed to create canvas: ${error.message}`);
        }
    }

    /**
     * Creates a new base (database view) in the specified folder
     * Bases are a new feature in Obsidian 1.9+ that provide database-like functionality
     * @param folder - The folder to create the base in
     */
    private async createNewBase(folder: TFolder) {
        try {
            // Generate unique base name
            let baseName = "Untitled Base";
            let counter = 1;
            let path = folder.path ? `${folder.path}/${baseName}.base` : `${baseName}.base`;
            
            // Check if base exists and increment counter
            while (this.app.vault.getAbstractFileByPath(path)) {
                baseName = `Untitled Base ${counter}`;
                path = folder.path ? `${folder.path}/${baseName}.base` : `${baseName}.base`;
                counter++;
            }
            
            // Create the base file - Obsidian will handle the base file format
            const file = await this.app.vault.create(path, '');
            
            // Open the base
            this.app.workspace.getLeaf(false).openFile(file);
            
            // Select the parent folder and the new file
            this.selectFolder(folder);
            this.selectedFile = file;
            this.refreshFileList();
            
        } catch (error) {
            new Notice(`Failed to create base: ${error.message}`);
        }
    }

    /**
     * Duplicates a folder and all its contents recursively
     * Uses Obsidian's naming convention: "foldername 1", "foldername 2", etc.
     * @param folder - The folder to duplicate
     */
    private async duplicateFolder(folder: TFolder) {
        try {
            if (!folder.parent) {
                new Notice("Cannot duplicate root folder");
                return;
            }
            
            // Generate unique folder name using Obsidian's naming convention
            let counter = 1;
            let newName = `${folder.name} ${counter}`;
            let newPath = `${folder.parent.path}/${newName}`;
            
            // Check if folder exists and increment counter
            while (this.app.vault.getAbstractFileByPath(newPath)) {
                counter++;
                newName = `${folder.name} ${counter}`;
                newPath = `${folder.parent.path}/${newName}`;
            }
            
            // Create the new folder
            await this.app.vault.createFolder(newPath);
            
            // Recursively copy contents
            await this.copyFolderContents(folder, newPath);
            
            // Select the new folder
            const newFolder = this.app.vault.getAbstractFileByPath(newPath);
            if (newFolder instanceof TFolder) {
                this.selectFolder(newFolder);
                this.pendingFolderSelection = newPath;
                this.refresh();
            }
            
            new Notice(`Folder duplicated as "${newName}"`);
        } catch (error) {
            new Notice(`Failed to duplicate folder: ${error.message}`);
        }
    }

    /**
     * Recursively copies folder contents to a new location
     * Helper method for duplicateFolder
     * @param sourceFolder - The source folder to copy from
     * @param targetPath - The target folder path to copy to
     */
    private async copyFolderContents(sourceFolder: TFolder, targetPath: string) {
        for (const child of sourceFolder.children) {
            if (child instanceof TFile) {
                const content = await this.app.vault.read(child);
                await this.app.vault.create(`${targetPath}/${child.name}`, content);
            } else if (child instanceof TFolder) {
                const newSubfolderPath = `${targetPath}/${child.name}`;
                await this.app.vault.createFolder(newSubfolderPath);
                await this.copyFolderContents(child, newSubfolderPath);
            }
        }
    }

    /**
     * Opens search with a query to search within a specific folder
     * Uses Obsidian's global search with path filter
     * @param folder - The folder to search within
     */
    private searchInFolder(folder: TFolder) {
        // Build search query with path filter
        const searchQuery = `path:"${folder.path}/"`;
        
        // Open search
        (this.app as any).internalPlugins?.getPluginById?.('global-search')?.instance?.openGlobalSearch?.(searchQuery);
        
        // Alternative method if the above doesn't work
        if (!(this.app as any).internalPlugins?.getPluginById?.('global-search')?.instance?.openGlobalSearch) {
            // Use command palette
            (this.app as any).commands.executeCommandById('global-search:open');
            // Set search query after a small delay
            setTimeout(() => {
                const searchView = this.app.workspace.getLeavesOfType('search')[0];
                if (searchView) {
                    const searchComponent = (searchView.view as any).searchComponent;
                    if (searchComponent) {
                        searchComponent.setValue(searchQuery);
                    }
                }
            }, 100);
        }
    }

    /**
     * Gets the custom icon for a folder
     * Returns the icon name/emoji or null if no custom icon is set
     * @param folder - The folder to check for custom icon
     * @returns The icon string or null
     */
    private getFolderIcon(folder: TFolder): string | null {
        // Check if folder has custom icon in plugin settings
        const folderIcons = this.plugin.settings.folderIcons || {};
        return folderIcons[folder.path] || null;
    }

    /**
     * Toggles the custom icon for a folder
     * If folder has icon, removes it; otherwise shows icon picker
     * @param folder - The folder to toggle icon for
     */
    private async toggleFolderIcon(folder: TFolder) {
        const currentIcon = this.getFolderIcon(folder);
        
        if (currentIcon) {
            // Remove icon
            if (!this.plugin.settings.folderIcons) {
                this.plugin.settings.folderIcons = {};
            }
            delete this.plugin.settings.folderIcons[folder.path];
            await this.plugin.saveSettings();
            this.refresh();
            new Notice("Folder icon removed");
        } else {
            // Show icon picker - for now, we'll use a simple prompt
            // In a full implementation, you'd create a proper icon picker modal
            const icon = await this.showIconPicker();
            if (icon) {
                if (!this.plugin.settings.folderIcons) {
                    this.plugin.settings.folderIcons = {};
                }
                this.plugin.settings.folderIcons[folder.path] = icon;
                await this.plugin.saveSettings();
                this.refresh();
                new Notice(`Folder icon set to ${icon}`);
            }
        }
    }

    /**
     * Shows a simple icon picker (placeholder for full implementation)
     * In production, this would show a proper modal with icon options
     * @returns The selected icon or null
     */
    private async showIconPicker(): Promise<string | null> {
        // For now, return a hardcoded emoji
        // In a full implementation, create an IconPickerModal
        const commonIcons = ['📁', '📂', '📚', '📝', '💼', '🎯', '⭐', '🔧', '📊', '🎨'];
        const randomIcon = commonIcons[Math.floor(Math.random() * commonIcons.length)];
        new Notice(`Icon set to ${randomIcon} (icon picker not fully implemented)`);
        return randomIcon;
    }

    /**
     * Duplicates a file with a new name in the same folder
     * Uses Obsidian's naming convention: "filename 1", "filename 2", etc.
     * @param file - The file to duplicate
     */
    private async duplicateFile(file: TFile) {
        try {
            // Generate unique file name using Obsidian's naming convention
            const baseName = file.basename;
            const extension = file.extension;
            let counter = 1;
            let newName = `${baseName} ${counter}`;
            let newPath = file.parent ? `${file.parent.path}/${newName}.${extension}` : `${newName}.${extension}`;
            
            // Check if file exists and increment counter
            while (this.app.vault.getAbstractFileByPath(newPath)) {
                counter++;
                newName = `${baseName} ${counter}`;
                newPath = file.parent ? `${file.parent.path}/${newName}.${extension}` : `${newName}.${extension}`;
            }
            
            // Read original file content
            const content = await this.app.vault.read(file);
            
            // Create the duplicate
            const newFile = await this.app.vault.create(newPath, content);
            
            // Open the duplicated file
            await this.app.workspace.getLeaf(false).openFile(newFile);
            
            // Select the new file
            this.selectedFile = newFile;
            this.updateFileSelection();
            this.saveState();
            
            new Notice(`Note duplicated as "${newName}"`);
        } catch (error) {
            new Notice(`Failed to duplicate note: ${error.message}`);
        }
    }

    /**
     * Opens version history for a file using Obsidian Sync
     * Only available when Sync plugin is enabled
     * @param file - The file to view version history for
     */
    private async openVersionHistory(file: TFile) {
        try {
            // Ensure the file is open and active first
            const leaf = this.app.workspace.getLeaf(false);
            await leaf.openFile(file);
            
            // Wait a bit for the file to be fully loaded
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Try both possible command IDs
            const commandIds = ['sync:show-sync-history', 'sync:view-version-history'];
            let executed = false;
            
            for (const commandId of commandIds) {
                if ((this.app as any).commands.commands[commandId]) {
                    (this.app as any).commands.executeCommandById(commandId);
                    executed = true;
                    break;
                }
            }
            
            if (!executed) {
                new Notice('Version history command not found. Ensure Obsidian Sync is enabled.');
            }
        } catch (error) {
            new Notice(`Failed to open version history: ${error.message}`);
        }
    }

    /**
     * Sets up event delegation for all interactive elements in the navigator
     * Uses container-level event listeners instead of individual element listeners
     * This prevents memory leaks by eliminating the need to clean up listeners when elements are re-rendered
     * 
     * Handles the following events through delegation:
     * - Drag and Drop: dragstart, dragend, dragover, dragleave, drop
     * - User Interaction: click, dblclick, contextmenu
     * 
     * Benefits:
     * - Memory efficient: Only 7 listeners total instead of thousands
     * - Performance: No overhead of attaching/removing listeners during re-renders
     * - Automatic cleanup: Uses Obsidian's registerDomEvent for proper lifecycle management
     * 
     * Implementation details:
     * - Uses data attributes to identify elements and their roles
     * - Maintains exact same behavior as individual listeners
     * - Visual feedback via CSS classes (nn-dragging, nn-drag-over)
     * - All validation logic preserved (no self-moves, no circular moves)
     * 
     * Data attributes used:
     * - data-draggable="true": Marks draggable elements
     * - data-drag-type="file|folder": Type of draggable item
     * - data-drag-path: Path of item being dragged
     * - data-drop-zone="folder": Marks valid drop targets
     * - data-clickable="file|folder": Marks clickable elements
     * - data-context-menu="file|folder": Elements with context menus
     */
    private setupEventDelegation() {
        const container = this.containerEl;
        
        // Helper function to find draggable element
        const findDraggableElement = (target: EventTarget | null): HTMLElement | null => {
            if (!target || !(target instanceof HTMLElement)) return null;
            return target.closest('[data-draggable="true"]') as HTMLElement | null;
        };
        
        // Helper function to find drop zone
        const findDropZone = (target: EventTarget | null): HTMLElement | null => {
            if (!target || !(target instanceof HTMLElement)) return null;
            return target.closest('[data-drop-zone="folder"]') as HTMLElement | null;
        };
        
        // Dragstart handler
        this.registerDomEvent(container, 'dragstart', (e: DragEvent) => {
            const draggable = findDraggableElement(e.target);
            if (!draggable) return;
            
            // Stop propagation to prevent parent folders from starting drag
            e.stopPropagation();
            
            const path = draggable.getAttribute('data-drag-path');
            const type = draggable.getAttribute('data-drag-type');
            if (!path) return;
            
            e.dataTransfer!.effectAllowed = 'move';
            e.dataTransfer!.setData('text/plain', path);
            
            // Add dragging class to the appropriate element
            if (type === 'folder' && draggable.hasAttribute('data-drag-handle')) {
                // For folders, add class to parent folder element
                const folderEl = draggable.closest('.nn-folder-item') as HTMLElement;
                if (folderEl) folderEl.addClass('nn-dragging');
            } else {
                // For files, add class to the element itself
                draggable.addClass('nn-dragging');
            }
        });
        
        // Dragend handler
        this.registerDomEvent(container, 'dragend', (e: DragEvent) => {
            const draggable = findDraggableElement(e.target);
            if (!draggable) return;
            
            const type = draggable.getAttribute('data-drag-type');
            
            // Remove dragging class
            if (type === 'folder' && draggable.hasAttribute('data-drag-handle')) {
                const folderEl = draggable.closest('.nn-folder-item') as HTMLElement;
                if (folderEl) folderEl.removeClass('nn-dragging');
            } else {
                draggable.removeClass('nn-dragging');
            }
            
            // Clean up any remaining drag-over highlights
            container.querySelectorAll('.nn-drag-over').forEach(el => {
                el.removeClass('nn-drag-over');
            });
        });
        
        // Dragover handler
        this.registerDomEvent(container, 'dragover', (e: DragEvent) => {
            const dropZone = findDropZone(e.target);
            if (!dropZone) return;
            
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer!.dropEffect = 'move';
            
            // Clear all existing highlights except for this element
            container.querySelectorAll('.nn-drag-over').forEach(el => {
                if (el !== dropZone) {
                    el.removeClass('nn-drag-over');
                }
            });
            
            // Add highlight to current drop zone
            dropZone.addClass('nn-drag-over');
        });
        
        // Dragleave handler
        this.registerDomEvent(container, 'dragleave', (e: DragEvent) => {
            // Simple dragleave - the dragover handler will manage highlights
            e.stopPropagation();
        });
        
        // Drop handler
        this.registerDomEvent(container, 'drop', async (e: DragEvent) => {
            const dropZone = findDropZone(e.target);
            if (!dropZone) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Remove all drag-over highlights
            container.querySelectorAll('.nn-drag-over').forEach(el => {
                el.removeClass('nn-drag-over');
            });
            
            const targetPath = dropZone.getAttribute('data-drop-path');
            if (!targetPath) return;
            
            const sourcePath = e.dataTransfer!.getData('text/plain');
            const sourceFile = this.app.vault.getAbstractFileByPath(sourcePath);
            const targetFolder = this.app.vault.getAbstractFileByPath(targetPath);
            
            if (!sourceFile || !targetFolder || !(targetFolder instanceof TFolder)) return;
            
            // Validate the move
            if (sourceFile === targetFolder || this.fileSystemOps.isDescendant(sourceFile, targetFolder)) {
                if (sourceFile instanceof TFolder && this.fileSystemOps.isDescendant(sourceFile, targetFolder)) {
                    new Notice(`Cannot move a folder into its own subfolder`);
                }
                return;
            }
            
            try {
                // Check if source already exists in target
                const newPath = `${targetFolder.path}/${sourceFile.name}`;
                const existingFile = this.app.vault.getAbstractFileByPath(newPath);
                
                if (existingFile) {
                    new Notice(`A file or folder named "${sourceFile.name}" already exists in the target location`);
                    return;
                }
                
                await this.app.fileManager.renameFile(sourceFile, newPath);
            } catch (error) {
                new Notice(`Failed to move: ${error.message}`);
            }
        });
        
        // Click handler for files and folders
        this.registerDomEvent(container, 'click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickable = target.closest('[data-clickable]') as HTMLElement | null;
            if (!clickable) return;
            
            const type = clickable.getAttribute('data-clickable');
            const path = clickable.getAttribute('data-click-path');
            if (!path) return;
            
            const file = this.app.vault.getAbstractFileByPath(path);
            if (!file) return;
            
            if (type === 'folder' && file instanceof TFolder) {
                // Handle folder click
                this.selectFolder(file);
                // Find the actual index of this folder in the current tree
                const allFolders = Array.from(this.folderTree.querySelectorAll('.nn-folder-item'));
                const clickedIndex = allFolders.findIndex(el => el.getAttribute('data-path') === file.path);
                if (clickedIndex >= 0) {
                    this.focusedFolderIndex = clickedIndex;
                }
                this.focusedPane = 'folders';
                this.updateFocus();
            } else if (type === 'file' && file instanceof TFile) {
                // Handle file click
                e.preventDefault();
                const fileEl = clickable.closest('.nn-file-item') as HTMLElement;
                const index = parseInt(fileEl?.getAttribute('data-index') || '0');
                
                this.selectedFile = file;
                this.focusedFileIndex = index;
                this.focusedPane = 'files';
                this.updateFileSelection();
                this.updateFocus();
                
                // Preview the file when clicked
                this.previewFile(file);
                
                // Save state after selecting file
                if (!this.isLoading) {
                    this.saveState();
                }
                
                // Keep focus on the navigator
                setTimeout(() => {
                    const navContainer = this.containerEl.querySelector('.notebook-navigator') as HTMLElement;
                    if (navContainer) navContainer.focus();
                }, 10);
            }
        });
        
        // Double-click handler for folders
        this.registerDomEvent(container, 'dblclick', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickable = target.closest('[data-clickable="folder"]') as HTMLElement | null;
            if (!clickable) return;
            
            const path = clickable.getAttribute('data-click-path');
            if (!path) return;
            
            const folder = this.app.vault.getAbstractFileByPath(path);
            if (folder instanceof TFolder) {
                // Only toggle if folder has children
                if (folder.children.some(child => child instanceof TFolder)) {
                    this.toggleFolder(folder);
                }
            }
        });
        
        // Context menu handler
        this.registerDomEvent(container, 'contextmenu', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const contextEl = target.closest('[data-context-menu]') as HTMLElement | null;
            if (!contextEl) return;
            
            e.preventDefault();
            
            const type = contextEl.getAttribute('data-context-menu');
            const path = contextEl.getAttribute('data-click-path') || contextEl.getAttribute('data-path');
            if (!path) return;
            
            const file = this.app.vault.getAbstractFileByPath(path);
            if (!file) return;
            
            if (type === 'folder' && file instanceof TFolder) {
                this.showFolderContextMenu(file, e);
            } else if (type === 'file' && file instanceof TFile) {
                this.showFileContextMenu(file, e);
            }
        });
    }



    /**
     * Gets the list of pinned note paths for a specific folder
     * Returns empty array if no notes are pinned in the folder
     * @param folder - The folder to get pinned notes for
     * @returns Array of file paths that are pinned in this folder
     */
    private getPinnedNotesForFolder(folder: TFolder): string[] {
        return this.plugin.settings.pinnedNotes[folder.path] || [];
    }
    
    /**
     * Checks if a file is pinned in a specific folder
     * Used to determine pin/unpin menu option state
     * @param file - The file to check
     * @param folder - The folder context for pinning
     * @returns True if the file is pinned in this folder
     */
    private isFilePinned(file: TFile, folder: TFolder): boolean {
        const pinnedFiles = this.getPinnedNotesForFolder(folder);
        return pinnedFiles.includes(file.path);
    }
    
    /**
     * Pins a file to the top of its folder's file list
     * Adds file path to pinned notes settings and refreshes display
     * Auto-scrolls to show the newly pinned file at the top
     * @param file - The file to pin
     * @param folder - The folder to pin the file in
     */
    private async pinFile(file: TFile, folder: TFolder) {
        const pinnedNotes = this.plugin.settings.pinnedNotes;
        if (!pinnedNotes[folder.path]) {
            pinnedNotes[folder.path] = [];
        }
        
        if (!pinnedNotes[folder.path].includes(file.path)) {
            pinnedNotes[folder.path].push(file.path);
            await this.plugin.saveSettings();
            this.refreshFileList();
            
            // Auto-scroll to the newly pinned file
            this.selectedFile = file;
            this.updateFileSelection();
            setTimeout(() => {
                this.scrollSelectedFileIntoView();
            }, 100);
        }
    }
    
    /**
     * Unpins a file from the top of its folder's file list
     * Removes file path from pinned notes settings and refreshes display
     * Maintains scroll position if the unpinned file was selected
     * @param file - The file to unpin
     * @param folder - The folder to unpin the file from
     */
    private async unpinFile(file: TFile, folder: TFolder) {
        const pinnedNotes = this.plugin.settings.pinnedNotes;
        if (pinnedNotes[folder.path]) {
            pinnedNotes[folder.path] = pinnedNotes[folder.path].filter(path => path !== file.path);
            if (pinnedNotes[folder.path].length === 0) {
                delete pinnedNotes[folder.path];
            }
            await this.plugin.saveSettings();
            this.refreshFileList();
            
            // If the unpinned file is the selected file, scroll to it
            if (this.selectedFile?.path === file.path) {
                this.updateFileSelection();
                setTimeout(() => {
                    this.scrollSelectedFileIntoView();
                }, 100);
            }
        }
    }

    /**
     * Calculates the index of the currently selected folder
     * Used to restore keyboard navigation position after tree updates
     * Updates focusedFolderIndex for keyboard navigation state
     */
    private calculateFocusedFolderIndex() {
        if (this.selectedFolder) {
            const allFolders = Array.from(this.folderTree.querySelectorAll('.nn-folder-item'));
            const selectedIndex = allFolders.findIndex(el => 
                el.getAttribute('data-path') === this.selectedFolder!.path
            );
            if (selectedIndex >= 0) {
                this.focusedFolderIndex = selectedIndex;
            }
        }
    }
    
    /**
     * Calculates the index of the currently selected file
     * Used to restore keyboard navigation position after list updates
     * Updates focusedFileIndex for keyboard navigation state
     */
    private calculateFocusedFileIndex() {
        if (this.selectedFile) {
            const allFiles = Array.from(this.fileList.querySelectorAll('.nn-file-item'));
            const selectedIndex = allFiles.findIndex(el => 
                el.getAttribute('data-path') === this.selectedFile!.path
            );
            if (selectedIndex >= 0) {
                this.focusedFileIndex = selectedIndex;
            }
        }
    }
    
    /**
     * Scrolls the selected folder into view in the folder tree
     * Centers the folder in the viewport for better visibility
     * Used after folder selection or tree expansion
     */
    private scrollSelectedFolderIntoView() {
        if (this.selectedFolder) {
            const folderEl = this.folderTree.querySelector(
                `[data-path="${CSS.escape(this.selectedFolder.path)}"]`
            );
            if (folderEl) {
                // Use 'center' to ensure it's well visible
                (folderEl as HTMLElement).scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }
    
    /**
     * Scrolls the selected file into view in the file list
     * Handles sticky date headers and centers file in viewport
     * Only scrolls if file is outside visible area
     * Accounts for sticky headers when calculating scroll position
     */
    private scrollSelectedFileIntoView() {
        if (this.selectedFile) {
            const fileEl = this.fileList.querySelector(
                `[data-path="${CSS.escape(this.selectedFile.path)}"]`
            );
            if (fileEl) {
                const container = this.fileList;
                const fileElement = fileEl as HTMLElement;
                
                // Get container and file positions
                const containerRect = container.getBoundingClientRect();
                const fileRect = fileElement.getBoundingClientRect();
                
                // Calculate if we need to scroll
                const isAboveView = fileRect.top < containerRect.top;
                const isBelowView = fileRect.bottom > containerRect.bottom;
                
                if (isAboveView || isBelowView) {
                    // Calculate the file's position relative to the scrollable container
                    const fileOffsetTop = fileElement.offsetTop;
                    
                    // Find all sticky headers above this file
                    let stickyOffset = 0;
                    const allHeaders = container.querySelectorAll('.nn-date-group-header');
                    allHeaders.forEach(header => {
                        const headerEl = header as HTMLElement;
                        if (headerEl.offsetTop < fileOffsetTop) {
                            stickyOffset = headerEl.offsetHeight;
                        }
                    });
                    
                    // Calculate ideal scroll position (center the file in view)
                    const containerHeight = container.clientHeight;
                    const fileHeight = fileElement.offsetHeight;
                    const idealScrollTop = fileOffsetTop - (containerHeight / 2) + (fileHeight / 2) - stickyOffset;
                    
                    // Smooth scroll to position
                    container.scrollTo({
                        top: Math.max(0, idealScrollTop),
                        behavior: 'auto' // Use 'auto' for immediate scroll on load
                    });
                }
            }
        }
    }

    /**
     * Updates visual selection state in the file list
     * Removes previous selection and highlights current file
     * Called when file selection changes via keyboard or mouse
     */
    private updateFileSelection() {
        // Remove previous selection
        this.fileList.querySelectorAll('.nn-selected').forEach(el => {
            el.removeClass('nn-selected');
        });

        // Add selection to the current file
        if (this.selectedFile) {
            const fileEl = this.fileList.querySelector(`[data-path="${CSS.escape(this.selectedFile.path)}"]`);
            if (fileEl) {
                fileEl.addClass('nn-selected');
            }
        }
    }

    /**
     * Handles when the active file changes in the editor
     * Syncs navigator selection with active editor file
     * Respects autoRevealActiveFile setting for folder switching
     * Ignores changes from non-editor panes and ignored folders
     */
    private handleActiveFileChange() {
        // Only process changes from the main editor area
        const activeLeaf = this.app.workspace.activeLeaf;
        if (!activeLeaf || activeLeaf.getRoot() !== this.app.workspace.rootSplit) {
            return;
        }
        
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) return;
        
        // Skip if already selected
        if (this.selectedFile?.path === activeFile.path) return;
        
        // Check if file should be ignored
        const ignoredFolders = this.plugin.settings.ignoreFolders
            .split(',')
            .map(f => f.trim())
            .filter(f => f.length > 0);
        
        const isIgnored = ignoredFolders.some(folder => {
            const folderPath = folder.endsWith('/') ? folder : folder + '/';
            return activeFile.path.startsWith(folderPath);
        });
        
        if (isIgnored) return;
        
        // If no folder is selected, always reveal the file
        if (!this.selectedFolder) {
            this.revealFile(activeFile);
            return;
        }
        
        // Check if auto-reveal is enabled
        if (this.plugin.settings.autoRevealActiveFile) {
            // Always reveal the file, switching folders if needed
            this.revealFile(activeFile);
        } else {
            // Original behavior - only select if visible in current view
            if (this.isFileInCurrentView(activeFile)) {
                // For newly created files, the DOM might not be updated yet
                const fileEl = this.fileList.querySelector(`[data-path="${CSS.escape(activeFile.path)}"]`);
                if (!fileEl) {
                    // File list needs refresh first
                    this.refreshFileList();
                    // Defer selection after DOM update
                    setTimeout(() => {
                        this.selectFileWithoutOpening(activeFile);
                    }, 50);
                } else {
                    this.selectFileWithoutOpening(activeFile);
                }
            }
        }
    }

    /**
     * Checks if a file is visible in the current folder view
     * Accounts for showNotesFromSubfolders setting
     * Used to determine if file selection should update
     * @param file - The file to check visibility for
     * @returns True if file is in current folder or subfolder view
     */
    private isFileInCurrentView(file: TFile): boolean {
        if (!this.selectedFolder) return false;
        
        if (this.plugin.settings.showNotesFromSubfolders) {
            // Check if file is within the folder tree
            let current = file.parent;
            while (current) {
                if (current.path === this.selectedFolder.path) return true;
                current = current.parent;
            }
            return false;
        } else {
            // Check if file is direct child
            return file.parent?.path === this.selectedFolder.path;
        }
    }

    /**
     * Selects a file in the navigator without opening it in editor
     * Updates visual selection and scrolls file into view if needed
     * Used when syncing with active editor to avoid circular updates
     * @param file - The file to select
     */
    private selectFileWithoutOpening(file: TFile) {
        this.selectedFile = file;
        this.updateFileSelection();
        
        // Ensure file is visible in viewport
        const fileEl = this.fileList.querySelector(`[data-path="${CSS.escape(file.path)}"]`) as HTMLElement;
        if (fileEl) {
            const container = this.fileList;
            const containerRect = container.getBoundingClientRect();
            const fileRect = fileEl.getBoundingClientRect();
            
            if (fileRect.top < containerRect.top || fileRect.bottom > containerRect.bottom) {
                fileEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Save state
        localStorage.setItem(this.plugin.keys.selectedFileKey, file.path);
    }

    /**
     * Updates keyboard focus indicator between folder and file panes
     * Adds visual focus ring to current item and scrolls it into view
     * Updates container attribute for CSS styling of active pane
     * Handles smart scrolling to keep focused items visible
     */
    private updateFocus() {
        this.containerEl.querySelectorAll('.nn-focused').forEach(el => {
            el.removeClass('nn-focused');
        });

        // Update the data attribute for CSS styling
        const container = this.containerEl.querySelector('.notebook-navigator') as HTMLElement;
        if (container) {
            container.setAttribute('data-focus-pane', this.focusedPane);
        }

        if (this.focusedPane === 'folders') {
            const folders = this.folderTree.querySelectorAll('.nn-folder-item');
            const focusedFolder = folders[this.focusedFolderIndex];
            if (focusedFolder) {
                focusedFolder.addClass('nn-focused');
                focusedFolder.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        } else {
            const files = this.fileList.querySelectorAll('.nn-file-item');
            const focusedFile = files[this.focusedFileIndex];
            if (focusedFile) {
                focusedFile.addClass('nn-focused');
                // For file list, use a more controlled scrolling approach
                const fileList = this.fileList;
                const fileRect = (focusedFile as HTMLElement).getBoundingClientRect();
                const listRect = fileList.getBoundingClientRect();
                
                // Check if element is outside visible area
                if (fileRect.top < listRect.top) {
                    // Scroll up - the CSS scroll-padding-top will handle the offset
                    (focusedFile as HTMLElement).scrollIntoView({ block: 'start', behavior: 'smooth' });
                } else if (fileRect.bottom > listRect.bottom) {
                    // Scroll down - put item at bottom with some padding
                    (focusedFile as HTMLElement).scrollIntoView({ block: 'end', behavior: 'smooth' });
                }
                // If already visible, don't scroll
            }
        }
    }



    /**
     * Reveals a file in the navigator by expanding folders and selecting it
     * Switches to the file's parent folder if needed
     * Scrolls both folder tree and file list to show the revealed items
     * Public method called by plugin commands and context menus
     * @param file - The file to reveal in the navigator
     */
    revealFile(file: TFile) {
        // Ensure parent folders are expanded
        if (file.parent) {
            const needsTreeRefresh = this.ensureFolderVisible(file.parent);
            
            // If we expanded any folders, we need to refresh the tree to show them
            if (needsTreeRefresh) {
                this.renderFolderTree();
            }
            
            this.selectFolder(file.parent);
            this.selectedFile = file;
            
            // Only refresh file list, not the entire folder tree
            this.refreshFileList();
            
            // Scroll to the selected folder and file
            setTimeout(() => {
                // First scroll to the folder in the tree
                this.scrollSelectedFolderIntoView();
                
                // Then find and focus the file in the list
                const fileEls = this.fileList.querySelectorAll('.nn-file-item');
                fileEls.forEach((el, index) => {
                    if (el.getAttribute('data-path') === file.path) {
                        this.focusedFileIndex = index;
                        this.focusedPane = 'files';
                        this.updateFocus();
                    }
                });
                
                // Scroll to the file as well
                this.scrollSelectedFileIntoView();
            }, 100);
        }
    }
}