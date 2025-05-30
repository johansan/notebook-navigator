import { TFile, TFolder, TAbstractFile, Platform } from 'obsidian';

/**
 * Interface defining the context required for keyboard navigation
 * Provides access to DOM elements, state, and callback functions
 * Used to decouple keyboard handling logic from the main view class
 */
export interface KeyboardNavigationContext {
    folderTree: HTMLElement;
    fileList: HTMLElement;
    focusedPane: 'folders' | 'files';
    focusedFolderIndex: number;
    focusedFileIndex: number;
    expandedFolders: Set<string>;
    selectedFile: TFile | null;
    
    selectFolder(folder: TFolder): void;
    toggleFolder(folder: TFolder): void;
    updateFocus(): void;
    updateFileSelection(): void;
    previewFile(file: TFile): void;
    saveState(): void;
    openFile(file: TFile): void;
    refreshFileList(): void;
    deleteFolder(folder: TFolder): void;
    deleteFile(file: TFile): void;
    
    app: {
        vault: {
            getAbstractFileByPath(path: string): TAbstractFile | null;
        };
    };
}

/**
 * Handles all keyboard navigation for the Notebook Navigator
 * Implements arrow key navigation, Tab switching, Enter selection, and Delete operations
 * Manages focus state between folder tree and file list panes
 */
export class KeyboardHandler {
    /**
     * Creates a new keyboard handler with access to navigation context
     * @param context - The navigation context providing state and callbacks
     */
    constructor(private context: KeyboardNavigationContext) {}

    /**
     * Main entry point for keyboard event handling
     * Routes keyboard events to appropriate handlers based on key pressed
     * Retrieves current folder and file items for context
     * @param e - The keyboard event to handle
     */
    handleKeyboardNavigation(e: KeyboardEvent): void {
        const folderItems = Array.from(this.context.folderTree.querySelectorAll('.nn-folder-item'));
        const fileItems = Array.from(this.context.fileList.querySelectorAll('.nn-file-item'));

        switch (e.key) {
            case 'ArrowUp':
                this.handleArrowUp(e, folderItems, fileItems);
                break;
            case 'ArrowDown':
                this.handleArrowDown(e, folderItems, fileItems);
                break;
            case 'ArrowLeft':
                this.handleArrowLeft(e, folderItems);
                break;
            case 'ArrowRight':
                this.handleArrowRight(e, folderItems, fileItems);
                break;
            case 'Tab':
                this.handleTab(e, folderItems, fileItems);
                break;
            case 'Backspace':
            case 'Delete':
                this.handleDelete(e, folderItems, fileItems);
                break;
        }
    }

    /**
     * Handles up arrow key navigation
     * Moves selection up in the current pane (folders or files)
     * Updates visual focus and triggers preview for files
     * @param e - The keyboard event
     * @param folderItems - Array of folder DOM elements
     * @param fileItems - Array of file DOM elements
     */
    private handleArrowUp(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.context.focusedPane === 'folders') {
            // Navigate up in folder tree
            this.context.focusedFolderIndex = Math.max(0, this.context.focusedFolderIndex - 1);
            const folderEl = folderItems[this.context.focusedFolderIndex];
            if (folderEl) {
                const path = folderEl.getAttribute('data-path');
                const folder = this.context.app.vault.getAbstractFileByPath(path || '');
                if (folder instanceof TFolder) {
                    this.context.selectFolder(folder);
                }
            }
        } else {
            // Navigate up in file list
            this.context.focusedFileIndex = Math.max(0, this.context.focusedFileIndex - 1);
            if (fileItems[this.context.focusedFileIndex]) {
                const path = fileItems[this.context.focusedFileIndex].getAttribute('data-path');
                const file = this.context.app.vault.getAbstractFileByPath(path || '');
                if (file instanceof TFile) {
                    this.context.selectedFile = file;
                    this.context.updateFileSelection();
                    this.context.previewFile(file);
                    this.context.saveState();
                }
            }
        }
        this.context.updateFocus();
    }

    /**
     * Handles down arrow key navigation
     * Moves selection down in the current pane (folders or files)
     * Updates visual focus and triggers preview for files
     * @param e - The keyboard event
     * @param folderItems - Array of folder DOM elements
     * @param fileItems - Array of file DOM elements
     */
    private handleArrowDown(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.context.focusedPane === 'folders') {
            // Navigate down in folder tree
            this.context.focusedFolderIndex = Math.min(folderItems.length - 1, this.context.focusedFolderIndex + 1);
            const folderEl = folderItems[this.context.focusedFolderIndex];
            if (folderEl) {
                const path = folderEl.getAttribute('data-path');
                const folder = this.context.app.vault.getAbstractFileByPath(path || '');
                if (folder instanceof TFolder) {
                    this.context.selectFolder(folder);
                }
            }
        } else {
            // Navigate down in file list
            this.context.focusedFileIndex = Math.min(fileItems.length - 1, this.context.focusedFileIndex + 1);
            if (fileItems[this.context.focusedFileIndex]) {
                const path = fileItems[this.context.focusedFileIndex].getAttribute('data-path');
                const file = this.context.app.vault.getAbstractFileByPath(path || '');
                if (file instanceof TFile) {
                    this.context.selectedFile = file;
                    this.context.updateFileSelection();
                    this.context.previewFile(file);
                    this.context.saveState();
                }
            }
        }
        this.context.updateFocus();
    }

    /**
     * Handles left arrow key navigation
     * In folders: Collapses expanded folder or moves to parent
     * In files: Switches focus to folder pane
     * Implements hierarchical navigation in folder tree
     * @param e - The keyboard event
     * @param folderItems - Array of folder DOM elements
     */
    private handleArrowLeft(e: KeyboardEvent, folderItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.context.focusedPane === 'folders') {
            const folderEl = folderItems[this.context.focusedFolderIndex];
            if (folderEl) {
                const path = folderEl.getAttribute('data-path');
                const folder = this.context.app.vault.getAbstractFileByPath(path || '');
                
                if (folder instanceof TFolder && this.context.expandedFolders.has(folder.path)) {
                    // Collapse the folder if expanded
                    this.context.toggleFolder(folder);
                } else if (folder instanceof TFolder && folder.parent) {
                    // Move to parent folder
                    const parentIndex = folderItems.findIndex(item => 
                        item.getAttribute('data-path') === folder.parent!.path
                    );
                    if (parentIndex >= 0) {
                        this.context.focusedFolderIndex = parentIndex;
                        const parentEl = folderItems[parentIndex];
                        if (parentEl) {
                            const parentPath = parentEl.getAttribute('data-path');
                            const parentFolder = this.context.app.vault.getAbstractFileByPath(parentPath || '');
                            if (parentFolder instanceof TFolder) {
                                this.context.selectFolder(parentFolder);
                            }
                        }
                        this.context.updateFocus();
                    }
                }
            }
        } else if (this.context.focusedPane === 'files' && folderItems.length > 0) {
            // Switch to folders pane
            this.context.focusedPane = 'folders';
            this.context.updateFocus();
        }
    }

    /**
     * Handles right arrow key navigation
     * In folders: Expands collapsed folder or switches to file pane
     * Maintains selection state when switching panes
     * @param e - The keyboard event
     * @param folderItems - Array of folder DOM elements
     * @param fileItems - Array of file DOM elements
     */
    private handleArrowRight(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.context.focusedPane === 'folders') {
            const folderEl = folderItems[this.context.focusedFolderIndex];
            if (folderEl) {
                const path = folderEl.getAttribute('data-path');
                const folder = this.context.app.vault.getAbstractFileByPath(path || '');
                
                if (folder instanceof TFolder) {
                    if (!this.context.expandedFolders.has(folder.path) && 
                        folder.children.some(child => child instanceof TFolder)) {
                        // Expand the folder if it has subfolders
                        this.context.toggleFolder(folder);
                    } else if (fileItems.length > 0) {
                        // Switch to files pane
                        this.context.focusedPane = 'files';
                        // If there's a selected file, find its index
                        if (this.context.selectedFile) {
                            const selectedIndex = fileItems.findIndex(item => 
                                item.getAttribute('data-path') === this.context.selectedFile!.path
                            );
                            this.context.focusedFileIndex = selectedIndex >= 0 ? selectedIndex : 0;
                        } else {
                            this.context.focusedFileIndex = 0;
                        }
                        
                        this.context.updateFocus();
                    }
                }
            }
        }
    }

    /**
     * Handles Tab key navigation
     * Tab: Switches from folders to files pane, or opens file if in files pane
     * Shift+Tab: Switches from files to folders pane
     * Maintains focus on selected items when switching
     * @param e - The keyboard event
     * @param folderItems - Array of folder DOM elements
     * @param fileItems - Array of file DOM elements
     */
    private handleTab(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (e.shiftKey) {
            // Shift+Tab: Move backwards (files -> folders)
            if (this.context.focusedPane === 'files' && folderItems.length > 0) {
                this.context.focusedPane = 'folders';
            }
        } else {
            // Tab: Move forwards (folders -> files) or open file
            if (this.context.focusedPane === 'folders' && fileItems.length > 0) {
                this.context.focusedPane = 'files';
                // If there's a selected file, find its index
                if (this.context.selectedFile) {
                    const selectedIndex = fileItems.findIndex(item => 
                        item.getAttribute('data-path') === this.context.selectedFile!.path
                    );
                    this.context.focusedFileIndex = selectedIndex >= 0 ? selectedIndex : 0;
                } else {
                    this.context.focusedFileIndex = 0;
                }                
            } else if (this.context.focusedPane === 'files') {
                // Tab on file opens it
                const fileEl = fileItems[this.context.focusedFileIndex];
                if (fileEl) {
                    const path = fileEl.getAttribute('data-path');
                    const file = this.context.app.vault.getAbstractFileByPath(path || '');
                    if (file instanceof TFile) {
                        this.context.openFile(file);
                    }
                }
            }
        }
        this.context.updateFocus();
    }


    /**
     * Handles Delete/Backspace key for item deletion
     * Uses platform-specific keys: Backspace on macOS, Delete on others
     * Deletes the currently focused folder or file
     * Deletion confirmation is handled by the delete methods
     * @param e - The keyboard event
     * @param folderItems - Array of folder DOM elements
     * @param fileItems - Array of file DOM elements
     */
    private handleDelete(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        // Platform-specific delete key handling
        if ((Platform.isMacOS && e.key === 'Backspace') || (!Platform.isMacOS && e.key === 'Delete')) {
            e.preventDefault();
            e.stopPropagation();

            if (this.context.focusedPane === 'folders') {
                // Delete focused folder
                const folderEl = folderItems[this.context.focusedFolderIndex];
                if (folderEl) {
                    const path = folderEl.getAttribute('data-path');
                    const folder = this.context.app.vault.getAbstractFileByPath(path || '');
                    if (folder instanceof TFolder) {
                        this.context.deleteFolder(folder);
                    }
                }
            } else {
                // Delete focused file
                const fileEl = fileItems[this.context.focusedFileIndex];
                if (fileEl) {
                    const path = fileEl.getAttribute('data-path');
                    const file = this.context.app.vault.getAbstractFileByPath(path || '');
                    if (file instanceof TFile) {
                        this.context.deleteFile(file);
                    }
                }
            }
        }
    }
}