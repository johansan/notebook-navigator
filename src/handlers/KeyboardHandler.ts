import { TFile, TFolder, TAbstractFile, Platform } from 'obsidian';

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

export class KeyboardHandler {
    constructor(private context: KeyboardNavigationContext) {}

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
            case 'Enter':
                this.handleEnter(e, folderItems, fileItems);
                break;
            case 'Backspace':
            case 'Delete':
                this.handleDelete(e, folderItems, fileItems);
                break;
        }
    }

    private handleArrowUp(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.context.focusedPane === 'folders') {
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

    private handleArrowDown(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.context.focusedPane === 'folders') {
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

    private handleTab(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (e.shiftKey) {
            if (this.context.focusedPane === 'files' && folderItems.length > 0) {
                this.context.focusedPane = 'folders';
            }
        } else {
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

    private handleEnter(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        e.preventDefault();
        e.stopPropagation();

        if (this.context.focusedPane === 'folders') {
            const folderEl = folderItems[this.context.focusedFolderIndex];
            if (folderEl) {
                const path = folderEl.getAttribute('data-path');
                const folder = this.context.app.vault.getAbstractFileByPath(path || '');
                if (folder instanceof TFolder) {
                    if (folder.children.some(child => child instanceof TFolder)) {
                        this.context.toggleFolder(folder);
                    }
                    this.context.selectFolder(folder);
                }
            }
        } else {
            const fileEl = fileItems[this.context.focusedFileIndex];
            if (fileEl) {
                const path = fileEl.getAttribute('data-path');
                const file = this.context.app.vault.getAbstractFileByPath(path || '');
                if (file instanceof TFile) {
                    this.context.selectedFile = file;
                    this.context.refreshFileList();
                    this.context.saveState();
                }
            }
        }
    }

    private handleDelete(e: KeyboardEvent, folderItems: Element[], fileItems: Element[]): void {
        if ((Platform.isMacOS && e.key === 'Backspace') || (!Platform.isMacOS && e.key === 'Delete')) {
            e.preventDefault();
            e.stopPropagation();

            if (this.context.focusedPane === 'folders') {
                const folderEl = folderItems[this.context.focusedFolderIndex];
                if (folderEl) {
                    const path = folderEl.getAttribute('data-path');
                    const folder = this.context.app.vault.getAbstractFileByPath(path || '');
                    if (folder instanceof TFolder) {
                        this.context.deleteFolder(folder);
                    }
                }
            } else {
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