import { 
    App, 
    Plugin, 
    ItemView, 
    WorkspaceLeaf, 
    TFile, 
    TFolder, 
    TAbstractFile,
    Menu,
    Notice,
    setIcon,
    Modal,
    Setting,
    PluginSettingTab,
    CachedMetadata
} from 'obsidian';
import { format } from 'date-fns';

const VIEW_TYPE_NOTEBOOK = 'notebook-navigator-view';

type SortOption = 'modified' | 'created' | 'title';

interface NotebookNavigatorSettings {
    showFilePreview: boolean;
    skipNonTextInPreview: boolean;
    showFeatureImage: boolean;
    featureImageProperty: string;
    selectionColor: string;
    dateFormat: string;
    animationSpeed: number;
    sortOption: SortOption;
    leftPaneWidth: number;
    showRootFolder: boolean;
    ignoreFolders: string;
    showFolderFileCount: boolean;
    groupByDate: boolean;
    pinnedNotes: Record<string, string[]>;
    showNotesFromSubfolders: boolean;
    autoRevealActiveFile: boolean;
}

const DEFAULT_SETTINGS: NotebookNavigatorSettings = {
    showFilePreview: true,
    skipNonTextInPreview: true,
    showFeatureImage: false,
    featureImageProperty: 'feature',
    selectionColor: '#B3D9FF',
    dateFormat: 'MMM d, yyyy',
    animationSpeed: 200,
    sortOption: 'modified',
    leftPaneWidth: 300,
    showRootFolder: false,
    ignoreFolders: '',
    showFolderFileCount: true,
    groupByDate: true,
    pinnedNotes: {},
    showNotesFromSubfolders: false,
    autoRevealActiveFile: true
}

export default class NotebookNavigatorPlugin extends Plugin {
    settings: NotebookNavigatorSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;

    // LocalStorage keys for state persistence
    keys = {
        expandedFoldersKey: 'notebook-navigator-expanded-folders',
        selectedFolderKey: 'notebook-navigator-selected-folder',
        selectedFileKey: 'notebook-navigator-selected-file',
        leftPaneWidthKey: 'notebook-navigator-left-pane-width'
    };

    async onload() {
        await this.loadSettings();
        
        // Clean up pinned notes for files that no longer exist
        this.cleanupPinnedNotes();

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
            name: 'Reveal Active File in Navigator',
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
    }

    onunload() {
        // Clean up the ribbon icon
        this.ribbonIconEl?.remove();
        
        // Properly detach all notebook navigator leaves
        this.detachNotebookNavigatorLeaves();
    }

    async loadSettings() {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings || data || {});
    }

    async saveSettings() {
        const data = await this.loadData() || {};
        data.settings = this.settings;
        await this.saveData(data);
    }

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

    private async detachNotebookNavigatorLeaves() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK);
        for (const leaf of leaves) {
            leaf.detach();
        }
    }

    updateSelectionColor() {
        // Update CSS variable for selection color
        document.documentElement.style.setProperty('--nn-selection-color', this.settings.selectionColor);
    }
    
    cleanupPinnedNotes() {
        let changed = false;
        const pinnedNotes = this.settings.pinnedNotes;
        
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

    refreshIconRibbon() {
        this.ribbonIconEl?.remove();
        this.ribbonIconEl = this.addRibbonIcon('folder-tree', 'Notebook Navigator', async () => {
            await this.activateView(true);
        });
    }

    async refreshView() {
        // Detach existing views and create a new one
        await this.detachNotebookNavigatorLeaves();
        await this.activateView(true);
    }

}

class NotebookNavigatorView extends ItemView {
    plugin: NotebookNavigatorPlugin;
    private folderTree: HTMLElement;
    private fileList: HTMLElement;
    private selectedFolder: TFolder | null = null;
    private previousFolder: TFolder | null = null;
    private selectedFile: TFile | null = null;
    private expandedFolders: Set<string> = new Set();
    private focusedPane: 'folders' | 'files' = 'folders';
    private focusedFolderIndex: number = 0;
    private focusedFileIndex: number = 0;
    private leftPane: HTMLElement;
    private splitContainer: HTMLElement;
    private resizing: boolean = false;
    private eventRefs: Array<() => void> = [];
    private resizeMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
    private resizeMouseUpHandler: ((e: MouseEvent) => void) | null = null;
    private isLoading: boolean = true;

    constructor(leaf: WorkspaceLeaf, plugin: NotebookNavigatorPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_NOTEBOOK;
    }

    getDisplayText() {
        return 'Notebook Navigator';
    }

    getIcon() {
        return 'folder-tree';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('notebook-navigator');

        this.splitContainer = container.createDiv('nn-split-container');
        
        this.leftPane = this.splitContainer.createDiv('nn-left-pane');
        this.leftPane.style.width = `${this.plugin.settings.leftPaneWidth}px`;
        const folderHeader = this.leftPane.createDiv('nn-pane-header');
        folderHeader.createEl('h3', { text: 'Folders' });
        
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
        const fileHeaderTitle = fileHeader.createEl('h3', { text: 'Files' });
        
        const fileActions = fileHeader.createDiv('nn-header-actions');
        
        const newFileBtn = fileActions.createEl('button', { 
            cls: 'nn-icon-button',
            attr: { 'aria-label': 'New File' }
        });
        setIcon(newFileBtn, 'file-plus');
        const newFileClickHandler = () => this.createNewFile();
        newFileBtn.addEventListener('click', newFileClickHandler);
        this.eventRefs.push(() => newFileBtn.removeEventListener('click', newFileClickHandler));

        this.fileList = rightPane.createDiv('nn-file-list');

        this.registerEvent(
            this.app.vault.on('create', () => this.refresh())
        );
        this.registerEvent(
            this.app.vault.on('delete', () => this.refresh())
        );
        this.registerEvent(
            this.app.vault.on('rename', () => this.refresh())
        );
        this.registerEvent(
            this.app.vault.on('modify', () => this.refreshFileList())
        );
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => this.handleActiveFileChange())
        );

        const keydownHandler = (e: KeyboardEvent) => {
            this.handleKeyboardNavigation(e);
        };
        (container as HTMLElement).addEventListener('keydown', keydownHandler);
        this.eventRefs.push(() => (container as HTMLElement).removeEventListener('keydown', keydownHandler));

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

    refresh() {
        this.renderFolderTree();
        this.refreshFileList();
    }

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

    private globalFolderIndex: number = 0;

    private getFileCount(folder: TFolder): number {
        return folder.children.filter(child => child instanceof TFile).length;
    }

    private renderFolderItem(folder: TFolder, container: HTMLElement, level: number, ignoredFolders: string[]) {
        const index = this.globalFolderIndex++;
        const folderEl = container.createDiv({
            cls: 'nn-folder-item',
            attr: { 
                'data-path': folder.path,
                'data-level': level.toString(),
                'data-index': index.toString()
            }
        });

        if (this.focusedPane === 'folders' && index === this.focusedFolderIndex) {
            folderEl.addClass('nn-focused');
        }

        const folderContent = folderEl.createDiv('nn-folder-content');
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
        setIcon(folderIcon, 'folder');

        const folderName = folderContent.createDiv('nn-folder-name');
        folderName.textContent = folder.name || 'Vault';

        // Add file count
        if (this.plugin.settings.showFolderFileCount) {
            const fileCount = this.getFileCount(folder);
            if (fileCount > 0) {
                const countEl = folderContent.createDiv('nn-folder-count');
                countEl.textContent = fileCount.toString();
            }
        }

        if (this.selectedFolder === folder) {
            folderEl.addClass('nn-selected');
        }

        folderContent.addEventListener('click', () => {
            this.selectFolder(folder);
            // Find the actual index of this folder in the current tree
            const allFolders = Array.from(this.folderTree.querySelectorAll('.nn-folder-item'));
            const clickedIndex = allFolders.findIndex(el => el.getAttribute('data-path') === folder.path);
            if (clickedIndex >= 0) {
                this.focusedFolderIndex = clickedIndex;
            }
            this.focusedPane = 'folders';
            this.updateFocus();
        });

        folderContent.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showFolderContextMenu(folder, e);
        });

        this.setupDragAndDrop(folderEl, folder);

        if (this.expandedFolders.has(folder.path)) {
            const childrenContainer = folderEl.createDiv('nn-folder-children');
            const subfolders = folder.children
                .filter(child => child instanceof TFolder)
                .filter(child => !ignoredFolders.includes(child.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            subfolders.forEach((subfolder) => {
                this.renderFolderItem(subfolder as TFolder, childrenContainer, level + 1, ignoredFolders);
            });
        }
    }

    private toggleFolder(folder: TFolder) {
        const folderEl = this.folderTree.querySelector(`[data-path="${CSS.escape(folder.path)}"]`);
        if (!folderEl) return;

        // Get ignored folders
        const ignoredFolders = this.plugin.settings.ignoreFolders
            .split(',')
            .map(f => f.trim())
            .filter(f => f);

        if (this.expandedFolders.has(folder.path)) {
            this.expandedFolders.delete(folder.path);
            // Remove children container
            const childrenContainer = folderEl.querySelector('.nn-folder-children');
            if (childrenContainer) {
                childrenContainer.remove();
            }
            // Update arrow icon
            const arrow = folderEl.querySelector('.nn-folder-arrow svg');
            if (arrow) {
                setIcon(arrow.parentElement as HTMLElement, 'chevron-right');
            }
        } else {
            this.expandedFolders.add(folder.path);
            // Add children container
            const childrenContainer = folderEl.createDiv('nn-folder-children');
            const subfolders = folder.children
                .filter(child => child instanceof TFolder)
                .filter(child => !ignoredFolders.includes(child.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            subfolders.forEach((subfolder) => {
                this.renderFolderItem(subfolder as TFolder, childrenContainer, 
                    parseInt(folderEl.getAttribute('data-level') || '0') + 1, ignoredFolders);
            });
            // Update arrow icon
            const arrow = folderEl.querySelector('.nn-folder-arrow svg');
            if (arrow) {
                setIcon(arrow.parentElement as HTMLElement, 'chevron-down');
            }
        }
        
        // Save state after toggling folder
        this.saveState();
    }

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

    private ensureFolderVisible(folder: TFolder) {
        // Expand all parent folders to make this folder visible
        let parent = folder.parent;
        const foldersToExpand: TFolder[] = [];
        
        while (parent && parent.path !== '') {
            foldersToExpand.unshift(parent);
            parent = parent.parent;
        }
        
        // Expand folders from root to target
        foldersToExpand.forEach(f => {
            this.expandedFolders.add(f.path);
        });
    }

    private getDateGroup(timestamp: number): string {
        const now = new Date();
        const date = new Date(timestamp);
        
        // Reset times to start of day for comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        
        const fileDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (fileDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (fileDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else if (fileDate > weekAgo) {
            return 'Previous 7 Days';
        } else if (fileDate > monthAgo) {
            return 'Previous 30 Days';
        } else if (date.getFullYear() === now.getFullYear()) {
            // Same year - show month name
            return format(date, 'MMMM');
        } else {
            // Different year - show year
            return date.getFullYear().toString();
        }
    }

    private renderFilesWithDateGroups(files: TFile[]) {
        this.renderUnpinnedFilesWithDateGroups(files, 0);
    }
    
    private renderUnpinnedFilesWithDateGroups(files: TFile[], startIndex: number) {
        const groups = new Map<string, TFile[]>();
        const groupOrder: string[] = [];
        
        // Group files by date
        files.forEach((file) => {
            const timestamp = this.plugin.settings.sortOption === 'modified' 
                ? file.stat.mtime 
                : file.stat.ctime;
            const group = this.getDateGroup(timestamp);
            
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

    private collectFilesRecursively(folder: TFolder, ignoredFolders: string[]): TFile[] {
        let files: TFile[] = [];
        
        folder.children.forEach(child => {
            if (child instanceof TFile) {
                files.push(child);
            } else if (child instanceof TFolder && !ignoredFolders.includes(child.name)) {
                // Recursively collect from subfolders
                files = files.concat(this.collectFilesRecursively(child, ignoredFolders));
            }
        });
        
        return files;
    }
    
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
                .filter(child => child instanceof TFile) as TFile[];
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

    private renderFileItem(file: TFile, index: number) {
        const fileEl = this.fileList.createDiv({
            cls: 'nn-file-item',
            attr: { 
                'data-path': file.path,
                'data-index': index.toString()
            }
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
            fileDate.textContent = this.formatDate(file.stat.ctime);
        } else {
            fileDate.textContent = this.formatDate(file.stat.mtime);
        }
        
        if (this.plugin.settings.showNotesFromSubfolders) {
            // Show parent folder for files in subfolders, preview for files in current folder
            const relativePath = this.getRelativePath(file, this.selectedFolder!);
            if (relativePath) {
                // File is in a subfolder - show parent folder
                const parentFolder = secondLine.createDiv('nn-file-parent-folder');
                parentFolder.textContent = relativePath;
            } else if (this.plugin.settings.showFilePreview) {
                // File is in current folder - show preview
                const preview = secondLine.createDiv('nn-file-preview');
                this.app.vault.cachedRead(file).then(content => {
                    const previewText = this.extractPreviewText(content);
                    preview.textContent = previewText;
                });
            }
        } else if (this.plugin.settings.showFilePreview) {
            // Normal mode - show preview text
            const preview = secondLine.createDiv('nn-file-preview');
            this.app.vault.cachedRead(file).then(content => {
                const previewText = this.extractPreviewText(content);
                preview.textContent = previewText;
            });
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

        fileEl.addEventListener('click', (e) => {
            e.preventDefault();
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
                const container = this.containerEl.querySelector('.notebook-navigator') as HTMLElement;
                if (container) container.focus();
            }, 10);
        });

        fileEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showFileContextMenu(file, e);
        });

        this.setupDragAndDrop(fileEl, file);
    }

    private formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        try {
            return format(date, this.plugin.settings.dateFormat);
        } catch (e) {
            // If invalid format string, fall back to default
            return format(date, 'MMM d, yyyy');
        }
    }

    private openFile(file: TFile) {
        this.app.workspace.getLeaf(false).openFile(file);
    }

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

    private stripMarkdownSyntax(text: string): string {
        // Order matters - process from inside out
        return text
            // Inline code (must be before bold/italic to avoid conflicts)
            .replace(/`([^`]+)`/g, '$1')
            // Bold italic combined
            .replace(/\*\*\*([^\*]+)\*\*\*/g, '$1')
            .replace(/___([^_]+)___/g, '$1')
            // Bold
            .replace(/\*\*([^\*]+)\*\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            // Italic (be careful not to match multiplication)
            .replace(/(?<!\d)\*([^\*\n]+)\*(?!\d)/g, '$1')
            .replace(/(?<![a-zA-Z0-9])_([^_\n]+)_(?![a-zA-Z0-9])/g, '$1')
            // Strikethrough
            .replace(/~~([^~]+)~~/g, '$1')
            // Highlight
            .replace(/==([^=]+)==/g, '$1')
            // Links
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            // Wiki links with display text
            .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
            // Wiki links without display text
            .replace(/\[\[([^\]]+)\]\]/g, '$1')
            // List markers at start of line
            .replace(/^[-*+]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '')
            // Blockquotes
            .replace(/^>\s+/gm, '')
            // Escape characters
            .replace(/\\([*_~`])/g, '$1');
    }

    private extractPreviewText(content: string): string {
        let lines = content.split('\n');
        let startIndex = 0;
        
        // Skip frontmatter
        if (lines[0] === '---') {
            let endIndex = lines.findIndex((line, idx) => idx > 0 && line === '---');
            if (endIndex > 0) {
                startIndex = endIndex + 1;
            }
        }
        
        // Count attachments and web links in the entire document first
        let attachmentCount = 0;
        let webLinkCount = 0;
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for markdown images with URLs (these are web links, not attachments)
            const markdownImages = line.match(/!\[.*?\]\((.*?)\)/g);
            if (markdownImages) {
                markdownImages.forEach(match => {
                    const urlMatch = match.match(/!\[.*?\]\((.*?)\)/);
                    if (urlMatch && urlMatch[1]) {
                        const url = urlMatch[1];
                        // If it's a web URL, count as web link
                        if (url.match(/^https?:\/\/|^www\./)) {
                            webLinkCount++;
                        } else {
                            // Local image, count as attachment
                            attachmentCount++;
                        }
                    }
                });
            }
            
            // Count Obsidian wiki-style embeds: ![[...]] (always attachments)
            const wikiEmbeds = line.match(/!\[\[.*?\]\]/g);
            if (wikiEmbeds) {
                attachmentCount += wikiEmbeds.length;
            }
            
            // Count web links but exclude those that are part of markdown images
            // First remove markdown images and embeds from the line
            const cleanLine = line
                .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
                .replace(/!\[\[.*?\]\]/g, ''); // Remove wiki embeds
            
            // Now count web links in the cleaned line
            const webLinks = cleanLine.match(/(?:https?:\/\/|www\.)[^\s\)]+/g);
            if (webLinks) {
                webLinkCount += webLinks.length;
            }
        }
        
        // Find content lines based on settings
        let previewLines = [];
        let charCount = 0;
        
        for (let i = startIndex; i < lines.length && charCount < 100; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Skip non-text content if enabled
            if (this.plugin.settings.skipNonTextInPreview) {
                // Skip headings
                if (line.match(/^#+\s/)) continue;
                
                // Skip markdown images and embeds
                if (line.match(/^!\[.*?\]\(.*?\)/)) continue;
                
                // Skip Obsidian wiki-style embeds (images, files, etc)
                if (line.match(/^!\[\[.*?\]\]/)) continue;
                
                // Skip standalone links that look like embeds
                if (line.match(/^\[.*\]\(.*\)$/)) continue;
                
                // Skip code blocks
                if (line.startsWith('```')) continue;
                
                // Skip horizontal rules
                if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) continue;
                
                // Skip block quotes that might contain non-text
                if (line.startsWith('>') && line.match(/!\[.*\]\(.*\)/)) continue;
            }
            
            previewLines.push(lines[i]);
            charCount += lines[i].length;
        }
        
        // If no content found, return Apple Notes style message
        if (previewLines.length === 0) {
            if (attachmentCount > 0) {
                // If there are attachments, count both attachments and web links together
                const totalCount = attachmentCount + webLinkCount;
                return totalCount === 1 ? '1 attachment' : `${totalCount} attachments`;
            } else if (webLinkCount > 0) {
                return webLinkCount === 1 ? '1 web link' : `${webLinkCount} web links`;
            }
            return 'No additional text';
        }
        
        let preview = previewLines.join(' ');
        
        // Strip markdown syntax first before truncating
        preview = this.stripMarkdownSyntax(preview);
        
        // Now trim to 100 chars after stripping
        preview = preview.substring(0, 100);
        
        return preview + (preview.length >= 100 ? '...' : '');
    }

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

    private showFolderContextMenu(folder: TFolder, e: MouseEvent) {
        const menu = new Menu();

        menu.addItem((item) =>
            item
                .setTitle('New Folder')
                .setIcon('folder-plus')
                .onClick(() => this.createNewFolder(folder))
        );

        menu.addItem((item) =>
            item
                .setTitle('New File')
                .setIcon('file-plus')
                .onClick(() => this.createNewFile(folder))
        );

        if (folder.path) {
            menu.addSeparator();

            menu.addItem((item) =>
                item
                    .setTitle('Rename')
                    .setIcon('pencil')
                    .onClick(() => this.renameFolder(folder))
            );

            menu.addItem((item) =>
                item
                    .setTitle('Delete')
                    .setIcon('trash')
                    .onClick(() => this.deleteFolder(folder))
            );
        }

        menu.showAtMouseEvent(e);
    }

    private showFileContextMenu(file: TFile, e: MouseEvent) {
        const menu = new Menu();

        menu.addItem((item) =>
            item
                .setTitle('Open')
                .setIcon('file')
                .onClick(() => this.openFile(file))
        );

        menu.addItem((item) =>
            item
                .setTitle('Open in new pane')
                .setIcon('file-plus')
                .onClick(() => this.app.workspace.getLeaf('split').openFile(file))
        );

        menu.addSeparator();
        
        // Add pin/unpin option
        if (this.selectedFolder) {
            const isPinned = this.isFilePinned(file, this.selectedFolder);
            menu.addItem((item) =>
                item
                    .setTitle(isPinned ? 'Unpin Note' : 'Pin Note')
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

        menu.addItem((item) =>
            item
                .setTitle('Rename')
                .setIcon('pencil')
                .onClick(() => this.renameFile(file))
        );

        menu.addItem((item) =>
            item
                .setTitle('Delete')
                .setIcon('trash')
                .onClick(() => this.deleteFile(file))
        );

        menu.showAtMouseEvent(e);
    }

    private async createNewFolder(parent?: TFolder) {
        const targetFolder = parent || this.selectedFolder || this.app.vault.getRoot();
        
        const modal = new InputModal(this.app, 'New Folder', 'Enter folder name:', async (name) => {
            if (name) {
                try {
                    const path = targetFolder.path ? `${targetFolder.path}/${name}` : name;
                    await this.app.vault.createFolder(path);
                    new Notice(`Folder "${name}" created`);
                } catch (error) {
                    new Notice(`Failed to create folder: ${error.message}`);
                }
            }
        });
        modal.open();
    }

    private async createNewFile(parent?: TFolder) {
        const targetFolder = parent || this.selectedFolder || this.app.vault.getRoot();
        
        const modal = new InputModal(this.app, 'New File', 'Enter file name:', async (name) => {
            if (name) {
                try {
                    if (!name.endsWith('.md')) {
                        name += '.md';
                    }
                    const path = targetFolder.path ? `${targetFolder.path}/${name}` : name;
                    const file = await this.app.vault.create(path, '');
                    this.openFile(file);
                    new Notice(`File "${name}" created`);
                } catch (error) {
                    new Notice(`Failed to create file: ${error.message}`);
                }
            }
        });
        modal.open();
    }

    private async renameFolder(folder: TFolder) {
        const modal = new InputModal(this.app, 'Rename Folder', 'Enter new name:', async (newName) => {
            if (newName && newName !== folder.name) {
                try {
                    const newPath = folder.parent?.path 
                        ? `${folder.parent.path}/${newName}` 
                        : newName;
                    await this.app.fileManager.renameFile(folder, newPath);
                    new Notice(`Folder renamed to "${newName}"`);
                } catch (error) {
                    new Notice(`Failed to rename folder: ${error.message}`);
                }
            }
        }, folder.name);
        modal.open();
    }

    private async renameFile(file: TFile) {
        const modal = new InputModal(this.app, 'Rename File', 'Enter new name:', async (newName) => {
            if (newName && newName !== file.basename) {
                try {
                    if (!newName.endsWith('.md')) {
                        newName += '.md';
                    }
                    const newPath = file.parent?.path 
                        ? `${file.parent.path}/${newName}` 
                        : newName;
                    await this.app.fileManager.renameFile(file, newPath);
                    new Notice(`File renamed to "${newName}"`);
                } catch (error) {
                    new Notice(`Failed to rename file: ${error.message}`);
                }
            }
        }, file.basename);
        modal.open();
    }

    private async deleteFolder(folder: TFolder) {
        const confirmModal = new ConfirmModal(
            this.app,
            `Delete "${folder.name}"?`,
            `Are you sure you want to delete this folder and all its contents?`,
            async () => {
                try {
                    await this.app.vault.delete(folder, true);
                    new Notice(`Folder "${folder.name}" deleted`);
                    if (this.selectedFolder === folder) {
                        this.selectedFolder = null;
                        this.refreshFileList();
                    }
                } catch (error) {
                    new Notice(`Failed to delete folder: ${error.message}`);
                }
            }
        );
        confirmModal.open();
    }

    private async deleteFile(file: TFile) {
        const confirmModal = new ConfirmModal(
            this.app,
            `Delete "${file.basename}"?`,
            `Are you sure you want to delete this file?`,
            async () => {
                try {
                    await this.app.vault.delete(file);
                    new Notice(`File "${file.basename}" deleted`);
                } catch (error) {
                    new Notice(`Failed to delete file: ${error.message}`);
                }
            }
        );
        confirmModal.open();
    }

    private setupDragAndDrop(element: HTMLElement, file: TAbstractFile) {
        element.draggable = true;

        element.addEventListener('dragstart', (e) => {
            e.dataTransfer!.effectAllowed = 'move';
            e.dataTransfer!.setData('text/plain', file.path);
            element.addClass('nn-dragging');
        });

        element.addEventListener('dragend', () => {
            element.removeClass('nn-dragging');
        });

        if (file instanceof TFolder) {
            element.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer!.dropEffect = 'move';
                element.addClass('nn-drag-over');
            });

            element.addEventListener('dragleave', () => {
                element.removeClass('nn-drag-over');
            });

            element.addEventListener('drop', async (e) => {
                e.preventDefault();
                element.removeClass('nn-drag-over');

                const sourcePath = e.dataTransfer!.getData('text/plain');
                const sourceFile = this.app.vault.getAbstractFileByPath(sourcePath);

                if (sourceFile && sourceFile !== file && !this.isDescendant(file, sourceFile)) {
                    try {
                        const newPath = `${file.path}/${sourceFile.name}`;
                        await this.app.fileManager.renameFile(sourceFile, newPath);
                        new Notice(`Moved "${sourceFile.name}" to "${file.name}"`);
                    } catch (error) {
                        new Notice(`Failed to move file: ${error.message}`);
                    }
                }
            });
        }
    }

    private isDescendant(parent: TAbstractFile, child: TAbstractFile): boolean {
        let current = child.parent;
        while (current) {
            if (current === parent) return true;
            current = current.parent;
        }
        return false;
    }

    private handleKeyboardNavigation(e: KeyboardEvent) {
        const folders = Array.from(this.folderTree.querySelectorAll('.nn-folder-item'));
        const files = Array.from(this.fileList.querySelectorAll('.nn-file-item'));

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                if (this.focusedPane === 'folders') {
                    this.focusedFolderIndex = Math.max(0, this.focusedFolderIndex - 1);
                    // Auto-select folder on navigation
                    const folderEl = folders[this.focusedFolderIndex];
                    if (folderEl) {
                        const path = folderEl.getAttribute('data-path');
                        const folder = this.app.vault.getAbstractFileByPath(path || '') as TFolder;
                        if (folder) {
                            this.selectFolder(folder);
                        }
                    }
                } else {
                    this.focusedFileIndex = Math.max(0, this.focusedFileIndex - 1);
                    // Update selection in file list
                    if (files[this.focusedFileIndex]) {
                        const path = files[this.focusedFileIndex].getAttribute('data-path');
                        const file = this.app.vault.getAbstractFileByPath(path || '') as TFile;
                        if (file) {
                            this.selectedFile = file;
                            this.updateFileSelection();
                            this.previewFile(file);
                            this.saveState();
                        }
                    }
                }
                this.updateFocus();
                break;

            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                if (this.focusedPane === 'folders') {
                    this.focusedFolderIndex = Math.min(folders.length - 1, this.focusedFolderIndex + 1);
                    // Auto-select folder on navigation
                    const folderEl = folders[this.focusedFolderIndex];
                    if (folderEl) {
                        const path = folderEl.getAttribute('data-path');
                        const folder = this.app.vault.getAbstractFileByPath(path || '') as TFolder;
                        if (folder) {
                            this.selectFolder(folder);
                        }
                    }
                } else {
                    this.focusedFileIndex = Math.min(files.length - 1, this.focusedFileIndex + 1);
                    // Update selection in file list
                    if (files[this.focusedFileIndex]) {
                        const path = files[this.focusedFileIndex].getAttribute('data-path');
                        const file = this.app.vault.getAbstractFileByPath(path || '') as TFile;
                        if (file) {
                            this.selectedFile = file;
                            this.updateFileSelection();
                            this.previewFile(file);
                            this.saveState();
                        }
                    }
                }
                this.updateFocus();
                break;

            case 'ArrowLeft':
                e.preventDefault();
                e.stopPropagation();
                if (this.focusedPane === 'folders') {
                    const folderEl = folders[this.focusedFolderIndex];
                    if (folderEl) {
                        const path = folderEl.getAttribute('data-path');
                        const folder = this.app.vault.getAbstractFileByPath(path || '') as TFolder;
                        if (folder && this.expandedFolders.has(folder.path)) {
                            // Collapse folder if expanded
                            this.toggleFolder(folder);
                        } else if (folder && folder.parent) {
                            // Navigate to parent folder
                            const parentIndex = folders.findIndex(el => 
                                el.getAttribute('data-path') === folder.parent!.path
                            );
                            if (parentIndex >= 0) {
                                this.focusedFolderIndex = parentIndex;
                                // Auto-select parent folder
                                const parentEl = folders[parentIndex];
                                if (parentEl) {
                                    const parentPath = parentEl.getAttribute('data-path');
                                    const parentFolder = this.app.vault.getAbstractFileByPath(parentPath || '') as TFolder;
                                    if (parentFolder) {
                                        this.selectFolder(parentFolder);
                                    }
                                }
                                this.updateFocus();
                            }
                        }
                    }
                } else if (this.focusedPane === 'files' && folders.length > 0) {
                    // Move focus to folder pane
                    this.focusedPane = 'folders';
                    this.updateFocus();
                }
                break;

            case 'ArrowRight':
                e.preventDefault();
                e.stopPropagation();
                if (this.focusedPane === 'folders') {
                    const folderEl = folders[this.focusedFolderIndex];
                    if (folderEl) {
                        const path = folderEl.getAttribute('data-path');
                        const folder = this.app.vault.getAbstractFileByPath(path || '') as TFolder;
                        if (folder) {
                            if (!this.expandedFolders.has(folder.path) && 
                                folder.children.some(child => child instanceof TFolder)) {
                                // Expand folder if it has subfolders
                                this.toggleFolder(folder);
                            } else if (files.length > 0) {
                                // Move focus to file pane
                                this.focusedPane = 'files';
                                this.focusedFileIndex = 0;
                                this.updateFocus();
                            }
                        }
                    }
                }
                break;

            case 'Tab':
                e.preventDefault();
                e.stopPropagation();
                if (!e.shiftKey) {
                    if (this.focusedPane === 'folders' && files.length > 0) {
                        this.focusedPane = 'files';
                        this.focusedFileIndex = 0;
                    } else if (this.focusedPane === 'files') {
                        // Tab from file list opens the selected file
                        const fileEl = files[this.focusedFileIndex];
                        if (fileEl) {
                            const path = fileEl.getAttribute('data-path');
                            const file = this.app.vault.getAbstractFileByPath(path || '') as TFile;
                            if (file) {
                                this.openFile(file);
                            }
                        }
                    }
                } else {
                    if (this.focusedPane === 'files' && folders.length > 0) {
                        this.focusedPane = 'folders';
                    }
                }
                this.updateFocus();
                break;

            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                if (this.focusedPane === 'folders') {
                    const folderEl = folders[this.focusedFolderIndex];
                    if (folderEl) {
                        const path = folderEl.getAttribute('data-path');
                        const folder = this.app.vault.getAbstractFileByPath(path || '') as TFolder;
                        if (folder) {
                            // Toggle expand/collapse on Enter
                            if (folder.children.some(child => child instanceof TFolder)) {
                                this.toggleFolder(folder);
                            }
                            this.selectFolder(folder);
                        }
                    }
                } else {
                    // Enter in file list just selects the file, Tab opens it
                    const fileEl = files[this.focusedFileIndex];
                    if (fileEl) {
                        const path = fileEl.getAttribute('data-path');
                        const file = this.app.vault.getAbstractFileByPath(path || '') as TFile;
                        if (file) {
                            this.selectedFile = file;
                            this.refreshFileList();
                            this.saveState();
                        }
                    }
                }
                break;
        }
    }

    private getPinnedNotesForFolder(folder: TFolder): string[] {
        return this.plugin.settings.pinnedNotes[folder.path] || [];
    }
    
    private isFilePinned(file: TFile, folder: TFolder): boolean {
        const pinnedFiles = this.getPinnedNotesForFolder(folder);
        return pinnedFiles.includes(file.path);
    }
    
    private async pinFile(file: TFile, folder: TFolder) {
        const pinnedNotes = this.plugin.settings.pinnedNotes;
        if (!pinnedNotes[folder.path]) {
            pinnedNotes[folder.path] = [];
        }
        
        if (!pinnedNotes[folder.path].includes(file.path)) {
            pinnedNotes[folder.path].push(file.path);
            await this.plugin.saveSettings();
            this.refreshFileList();
        }
    }
    
    private async unpinFile(file: TFile, folder: TFolder) {
        const pinnedNotes = this.plugin.settings.pinnedNotes;
        if (pinnedNotes[folder.path]) {
            pinnedNotes[folder.path] = pinnedNotes[folder.path].filter(path => path !== file.path);
            if (pinnedNotes[folder.path].length === 0) {
                delete pinnedNotes[folder.path];
            }
            await this.plugin.saveSettings();
            this.refreshFileList();
        }
    }

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

    private handleActiveFileChange() {
        // Only process changes from the main editor area
        const activeLeaf = this.app.workspace.activeLeaf;
        if (!activeLeaf || activeLeaf.getRoot() !== this.app.workspace.rootSplit) {
            return;
        }
        
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile || !this.selectedFolder) return;
        
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



    revealFile(file: TFile) {
        // Ensure parent folders are expanded
        if (file.parent) {
            this.ensureFolderVisible(file.parent);
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

class InputModal extends Modal {
    constructor(
        app: App,
        title: string,
        placeholder: string,
        private onSubmit: (value: string) => void,
        private defaultValue: string = ''
    ) {
        super(app);
        this.titleEl.setText(title);
        
        const inputEl = this.contentEl.createEl('input', {
            type: 'text',
            placeholder: placeholder,
            value: defaultValue
        });
        inputEl.addClass('nn-input');
        
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.close();
                this.onSubmit(inputEl.value);
            }
        });
        
        const buttonContainer = this.contentEl.createDiv('nn-button-container');
        
        const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelBtn.addEventListener('click', () => this.close());
        
        const submitBtn = buttonContainer.createEl('button', { 
            text: 'Submit',
            cls: 'mod-cta'
        });
        submitBtn.addEventListener('click', () => {
            this.close();
            this.onSubmit(inputEl.value);
        });
        
        inputEl.focus();
        if (defaultValue) {
            inputEl.select();
        }
    }
}

class ConfirmModal extends Modal {
    constructor(
        app: App,
        title: string,
        message: string,
        private onConfirm: () => void
    ) {
        super(app);
        this.titleEl.setText(title);
        this.contentEl.createEl('p', { text: message });
        
        const buttonContainer = this.contentEl.createDiv('nn-button-container');
        
        const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelBtn.addEventListener('click', () => this.close());
        
        const confirmBtn = buttonContainer.createEl('button', { 
            text: 'Delete',
            cls: 'mod-warning'
        });
        confirmBtn.addEventListener('click', () => {
            this.close();
            this.onConfirm();
        });
    }
}

class NotebookNavigatorSettingTab extends PluginSettingTab {
    plugin: NotebookNavigatorPlugin;
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(app: App, plugin: NotebookNavigatorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

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
                .addOption('modified', 'Date Edited')
                .addOption('created', 'Date Created')
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

        this.createDebouncedTextSetting(
            containerEl,
            'Excluded folders',
            'Comma-separated list of folders to hide (e.g., .obsidian, templates).',
            'folder1, folder2',
            () => this.plugin.settings.ignoreFolders,
            (value) => { this.plugin.settings.ignoreFolders = value; }
        );

        new Setting(containerEl)
            .setName('Auto-reveal active file')
            .setDesc('Automatically reveal and select files when opened from Quick Switcher, links, or search.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoRevealActiveFile)
                .onChange(async (value) => {
                    this.plugin.settings.autoRevealActiveFile = value;
                    await this.plugin.saveSettings();
                }));

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

        this.createDebouncedTextSetting(
            containerEl,
            'Selection color',
            'Background color for selected items (hex format).',
            '#B3D9FF',
            () => this.plugin.settings.selectionColor,
            (value) => { this.plugin.settings.selectionColor = value || '#B3D9FF'; },
            false  // Don't refresh view, just update CSS
        );

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

        this.createDebouncedTextSetting(
            containerEl,
            'Animation speed',
            'UI animation duration in milliseconds.',
            '200',
            () => this.plugin.settings.animationSpeed.toString(),
            (value) => {
                const speed = parseInt(value);
                if (!isNaN(speed) && speed >= 0) {
                    this.plugin.settings.animationSpeed = speed;
                }
            },
            false,
            (value) => {
                const speed = parseInt(value);
                return !isNaN(speed) && speed >= 0;
            }
        );

        // Section 5: Advanced
        new Setting(containerEl)
            .setName('Advanced')
            .setHeading();

        new Setting(containerEl)
            .setName('Clear saved state')
            .setDesc('Reset expanded folders, selections, and pane width to defaults.')
            .addButton(button => button
                .setButtonText('Clear State')
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

    hide(): void {
        // Clean up all pending debounce timers when settings tab is closed
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }
}