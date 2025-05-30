import { 
    App, 
    TFolder, 
    TFile, 
    TAbstractFile,
    Menu,
    setIcon
} from 'obsidian';

/**
 * Callbacks for FolderTree to communicate with parent component
 */
export interface FolderTreeCallbacks {
    // Selection events
    onFolderSelect: (folder: TFolder) => void;
    onFolderToggle: (folder: TFolder) => void;
    onFolderFocusChange: (folderIndex: number) => void;
    
    // CRUD operations
    onCreateFolder: (parent: TFolder) => void;
    onRenameFolder: (folder: TFolder) => void;
    onDeleteFolder: (folder: TFolder) => void;
    
    // Drag and drop
    onFolderDrop: (draggedItem: TAbstractFile, targetFolder: TFolder) => void;
    
    // Context menu
    onShowFolderContextMenu: (folder: TFolder, event: MouseEvent) => void;
}

/**
 * State managed by FolderTree component
 */
export interface FolderTreeState {
    expandedFolders: Set<string>;
    selectedFolder: TFolder | null;
    focusedFolderIndex: number;
}

/**
 * Settings that affect folder tree rendering
 */
export interface FolderTreeSettings {
    ignoreFolders: string;
    showRootFolder: boolean;
    showFolderFileCount: boolean;
}

/**
 * Props for creating a FolderTree instance
 */
export interface FolderTreeProps {
    container: HTMLElement;
    app: App;
    callbacks: FolderTreeCallbacks;
    state: FolderTreeState;
    settings: FolderTreeSettings;
}

/**
 * FolderTree component for rendering and managing the folder hierarchy
 */
export class FolderTree {
    private container: HTMLElement;
    private app: App;
    private callbacks: FolderTreeCallbacks;
    private state: FolderTreeState;
    private settings: FolderTreeSettings;
    private globalFolderIndex: number = 0;
    
    constructor(props: FolderTreeProps) {
        this.container = props.container;
        this.app = props.app;
        this.callbacks = props.callbacks;
        this.state = props.state;
        this.settings = props.settings;
    }

    /**
     * Render the entire folder tree
     */
    render(): void {
        this.renderFolderTree();
    }

    private renderFolderTree() {
        this.container.empty();
        const rootFolder = this.app.vault.getRoot();
        this.globalFolderIndex = 0;
        
        // Get ignored folders
        const ignoredFolders = this.settings.ignoreFolders
            .split(',')
            .map(f => f.trim())
            .filter(f => f);
        
        if (this.settings.showRootFolder) {
            this.renderFolderItem(rootFolder, this.container, 0, ignoredFolders);
        } else {
            // Render root's children directly
            const children = rootFolder.children
                .filter(child => child instanceof TFolder)
                .filter(child => !ignoredFolders.includes(child.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            children.forEach(child => {
                this.renderFolderItem(child as TFolder, this.container, 0, ignoredFolders);
            });
        }
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

        if (index === this.state.focusedFolderIndex) {
            folderEl.addClass('nn-focused');
        }

        const folderContent = folderEl.createDiv('nn-folder-content');
        folderContent.style.paddingLeft = `${level * 20}px`;

        if (folder.children.some(child => child instanceof TFolder)) {
            const arrow = folderContent.createDiv('nn-folder-arrow');
            setIcon(arrow, this.state.expandedFolders.has(folder.path) ? 'chevron-down' : 'chevron-right');
            arrow.addEventListener('click', (e) => {
                e.stopPropagation();
                this.callbacks.onFolderToggle(folder);
            });
        } else {
            folderContent.createDiv('nn-folder-arrow nn-no-children');
        }

        const folderIcon = folderContent.createDiv('nn-folder-icon');
        setIcon(folderIcon, 'folder');

        const folderName = folderContent.createDiv('nn-folder-name');
        folderName.textContent = folder.name || 'Vault';

        // Add file count
        if (this.settings.showFolderFileCount) {
            const fileCount = this.getFileCount(folder);
            if (fileCount > 0) {
                const countEl = folderContent.createDiv('nn-folder-count');
                countEl.textContent = fileCount.toString();
            }
        }

        if (this.state.selectedFolder === folder) {
            folderEl.addClass('nn-selected');
        }

        folderContent.addEventListener('click', () => {
            this.callbacks.onFolderSelect(folder);
            // Find the actual index of this folder in the current tree
            const allFolders = Array.from(this.container.querySelectorAll('.nn-folder-item'));
            const clickedIndex = allFolders.findIndex(el => el.getAttribute('data-path') === folder.path);
            if (clickedIndex >= 0) {
                this.callbacks.onFolderFocusChange(clickedIndex);
            }
        });

        folderContent.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.callbacks.onShowFolderContextMenu(folder, e);
        });

        this.setupDragAndDrop(folderEl, folder, folderContent);

        if (this.state.expandedFolders.has(folder.path)) {
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

    private getFileCount(folder: TFolder): number {
        return folder.children.filter(child => child instanceof TFile).length;
    }

    /**
     * Update file counts without re-rendering the entire tree
     */
    updateFolderCounts(): void {
        if (!this.settings.showFolderFileCount) return;

        const folderElements = this.container.querySelectorAll('.nn-folder-item');
        folderElements.forEach(folderEl => {
            const folderPath = folderEl.getAttribute('data-path');
            if (!folderPath) return;

            const folder = this.app.vault.getAbstractFileByPath(folderPath);
            if (!(folder instanceof TFolder)) return;

            const folderContent = folderEl.querySelector('.nn-folder-content');
            const countEl = folderEl.querySelector('.nn-folder-count');
            const newCount = this.getFileCount(folder);
            
            if (newCount > 0) {
                if (countEl) {
                    // Update existing count
                    countEl.textContent = newCount.toString();
                } else if (folderContent) {
                    // Add count element if it doesn't exist
                    const newCountEl = (folderContent as HTMLElement).createDiv('nn-folder-count');
                    newCountEl.textContent = newCount.toString();
                }
            } else if (countEl) {
                // Remove count element if count is 0
                countEl.remove();
            }
        });
    }

    /**
     * Scroll the selected folder into view
     */
    scrollToSelected(): void {
        if (!this.state.selectedFolder) return;
        
        const folderEl = this.container.querySelector(`[data-path="${CSS.escape(this.state.selectedFolder.path)}"]`);
        if (folderEl) {
            folderEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Calculate the focused folder index based on current selection
     */
    calculateFocusedIndex(): void {
        if (!this.state.selectedFolder) return;
        
        const allFolders = Array.from(this.container.querySelectorAll('.nn-folder-item'));
        const selectedIndex = allFolders.findIndex(el => 
            el.getAttribute('data-path') === this.state.selectedFolder?.path
        );
        
        if (selectedIndex >= 0) {
            this.state.focusedFolderIndex = selectedIndex;
        }
    }

    /**
     * Ensure a folder is visible by expanding all parent folders
     */
    ensureFolderVisible(folder: TFolder): boolean {
        let parent = folder.parent;
        let changed = false;
        
        // Expand all parent folders
        while (parent) {
            if (!this.state.expandedFolders.has(parent.path)) {
                this.state.expandedFolders.add(parent.path);
                changed = true;
            }
            parent = parent.parent;
        }
        
        return changed;
    }

    /**
     * Get the currently focused folder element
     */
    getFocusedFolderElement(): HTMLElement | null {
        const folderItems = this.container.querySelectorAll('.nn-folder-item');
        return folderItems[this.state.focusedFolderIndex] as HTMLElement || null;
    }

    /**
     * Get all folder item elements
     */
    getAllFolderElements(): NodeListOf<Element> {
        return this.container.querySelectorAll('.nn-folder-item');
    }

    /**
     * Update the focused state of folder items
     */
    updateFocusedState(focusedPane: 'folders' | 'files'): void {
        // Remove all focused states
        this.container.querySelectorAll('.nn-focused').forEach(el => {
            el.removeClass('nn-focused');
        });

        // Add focused state if folders pane is focused
        if (focusedPane === 'folders') {
            const focusedElement = this.getFocusedFolderElement();
            if (focusedElement) {
                focusedElement.addClass('nn-focused');
            }
        }
    }

    private setupDragAndDrop(folderEl: HTMLElement, folder: TFolder, folderContent: HTMLElement): void {
        // Make folder draggable
        folderEl.draggable = true;
        
        folderEl.addEventListener('dragstart', (e) => {
            if (!e.dataTransfer) return;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', folder.path);
            folderEl.addClass('nn-dragging');
        });
        
        folderEl.addEventListener('dragend', () => {
            folderEl.removeClass('nn-dragging');
        });
        
        // Make folder a drop target
        folderContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
            folderContent.addClass('nn-drag-over');
        });
        
        folderContent.addEventListener('dragleave', (e) => {
            if (e.target === folderContent || folderContent.contains(e.relatedTarget as Node)) {
                return;
            }
            folderContent.removeClass('nn-drag-over');
        });
        
        folderContent.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            folderContent.removeClass('nn-drag-over');
            
            if (!e.dataTransfer) return;
            
            const draggedPath = e.dataTransfer.getData('text/plain');
            const draggedItem = this.app.vault.getAbstractFileByPath(draggedPath);
            
            if (draggedItem && draggedItem !== folder && !this.isChildOf(draggedItem, folder)) {
                this.callbacks.onFolderDrop(draggedItem, folder);
            }
        });
    }

    private isChildOf(item: TAbstractFile, potentialParent: TFolder): boolean {
        let parent = item.parent;
        while (parent) {
            if (parent === potentialParent) {
                return true;
            }
            parent = parent.parent;
        }
        return false;
    }

    /**
     * Clean up any resources
     */
    destroy(): void {
        this.container.empty();
    }
}