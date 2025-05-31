import { App, TFile, TFolder, TAbstractFile, Notice } from 'obsidian';
import { InputModal } from '../modals/InputModal';
import { ConfirmModal } from '../modals/ConfirmModal';

/**
 * Handles all file system operations for the Notebook Navigator
 * Provides centralized methods for creating, renaming, and deleting files/folders
 * Manages user input modals and confirmation dialogs
 */
export class FileSystemOperations {
    /**
     * Creates a new FileSystemOperations instance
     * @param app - The Obsidian app instance for vault operations
     */
    constructor(private app: App) {}

    /**
     * Creates a new folder with user-provided name
     * Shows input modal for folder name and handles creation
     * @param parent - The parent folder to create the new folder in
     * @param onSuccess - Optional callback with the new folder path on successful creation
     */
    async createNewFolder(parent: TFolder, onSuccess?: (path: string) => void): Promise<void> {
        const modal = new InputModal(this.app, 'New folder', 'Enter folder name:', async (name) => {
            if (name) {
                try {
                    const path = parent.path ? `${parent.path}/${name}` : name;
                    await this.app.vault.createFolder(path);
                    if (onSuccess) {
                        onSuccess(path);
                    }
                } catch (error) {
                    new Notice(`Failed to create folder: ${error.message}`);
                }
            }
        });
        modal.open();
    }

    /**
     * Creates a new markdown file with auto-generated "Untitled" name
     * Automatically increments name if "Untitled" already exists
     * Opens the file and triggers rename mode for immediate naming
     * @param parent - The parent folder to create the file in
     * @returns The created file or null if creation failed
     */
    async createNewFile(parent: TFolder): Promise<TFile | null> {
        try {
            // Generate unique "Untitled" name
            let fileName = "Untitled";
            let counter = 1;
            let path = parent.path ? `${parent.path}/${fileName}.md` : `${fileName}.md`;
            
            // Check if file exists and increment counter
            while (this.app.vault.getAbstractFileByPath(path)) {
                fileName = `Untitled ${counter}`;
                path = parent.path ? `${parent.path}/${fileName}.md` : `${fileName}.md`;
                counter++;
            }
            
            // Create the file
            const file = await this.app.vault.create(path, '');
            
            // Open the file
            this.app.workspace.getLeaf(false).openFile(file);
            
            // Put the file in rename mode immediately (similar to Obsidian's default behavior)
            setTimeout(() => {
                this.app.vault.rename(file, path);
            }, 100);
            
            return file;
        } catch (error) {
            new Notice(`Failed to create file: ${error.message}`);
            return null;
        }
    }

    /**
     * Renames a folder with user-provided name
     * Shows input modal pre-filled with current name
     * Validates that new name is different from current
     * @param folder - The folder to rename
     */
    async renameFolder(folder: TFolder): Promise<void> {
        const modal = new InputModal(this.app, 'Rename folder', 'Enter new name:', async (newName) => {
            if (newName && newName !== folder.name) {
                try {
                    const newPath = folder.parent?.path 
                        ? `${folder.parent.path}/${newName}` 
                        : newName;
                    await this.app.fileManager.renameFile(folder, newPath);
                } catch (error) {
                    new Notice(`Failed to rename folder: ${error.message}`);
                }
            }
        }, folder.name);
        modal.open();
    }

    /**
     * Renames a file with user-provided name
     * Shows input modal pre-filled with current basename
     * Automatically adds .md extension if not provided
     * @param file - The file to rename
     */
    async renameFile(file: TFile): Promise<void> {
        const modal = new InputModal(this.app, 'Rename file', 'Enter new name:', async (newName) => {
            if (newName && newName !== file.basename) {
                try {
                    // Ensure .md extension
                    if (!newName.endsWith('.md')) {
                        newName += '.md';
                    }
                    const newPath = file.parent?.path 
                        ? `${file.parent.path}/${newName}` 
                        : newName;
                    await this.app.fileManager.renameFile(file, newPath);
                } catch (error) {
                    new Notice(`Failed to rename file: ${error.message}`);
                }
            }
        }, file.basename);
        modal.open();
    }

    /**
     * Deletes a folder and all its contents
     * Shows confirmation dialog if confirmBeforeDelete is true
     * Recursively deletes all files and subfolders
     * @param folder - The folder to delete
     * @param confirmBeforeDelete - Whether to show confirmation dialog
     * @param onSuccess - Optional callback on successful deletion
     */
    async deleteFolder(folder: TFolder, confirmBeforeDelete: boolean, onSuccess?: () => void): Promise<void> {
        if (confirmBeforeDelete) {
            const confirmModal = new ConfirmModal(
                this.app,
                `Delete "${folder.name}"?`,
                `Are you sure you want to delete this folder and all its contents?`,
                async () => {
                    try {
                        await this.app.vault.delete(folder, true);
                        if (onSuccess) {
                            onSuccess();
                        }
                    } catch (error) {
                        new Notice(`Failed to delete folder: ${error.message}`);
                    }
                }
            );
            confirmModal.open();
        } else {
            // Direct deletion without confirmation
            try {
                await this.app.vault.delete(folder, true);
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error) {
                new Notice(`Failed to delete folder: ${error.message}`);
            }
        }
    }

    /**
     * Deletes a file from the vault
     * Shows confirmation dialog if confirmBeforeDelete is true
     * @param file - The file to delete
     * @param confirmBeforeDelete - Whether to show confirmation dialog
     */
    async deleteFile(file: TFile, confirmBeforeDelete: boolean): Promise<void> {
        if (confirmBeforeDelete) {
            const confirmModal = new ConfirmModal(
                this.app,
                `Delete "${file.basename}"?`,
                `Are you sure you want to delete this file?`,
                async () => {
                    try {
                        await this.app.vault.delete(file);
                    } catch (error) {
                        new Notice(`Failed to delete file: ${error.message}`);
                    }
                }
            );
            confirmModal.open();
        } else {
            // Direct deletion without confirmation
            try {
                await this.app.vault.delete(file);
            } catch (error) {
                new Notice(`Failed to delete file: ${error.message}`);
            }
        }
    }

    /**
     * Checks if one file/folder is a descendant of another
     * Used to prevent invalid drag-and-drop operations
     * Prevents moving a folder into its own subfolder
     * @param parent - The potential parent file/folder
     * @param child - The potential descendant file/folder
     * @returns True if child is a descendant of parent
     */
    isDescendant(parent: TAbstractFile, child: TAbstractFile): boolean {
        let current = child.parent;
        while (current) {
            if (current === parent) return true;
            current = current.parent;
        }
        return false;
    }
}