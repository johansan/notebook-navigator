import { App, TFile, TFolder, TAbstractFile, Notice } from 'obsidian';
import { InputModal } from '../modals/InputModal';
import { ConfirmModal } from '../modals/ConfirmModal';

export class FileSystemOperations {
    constructor(private app: App) {}

    async createNewFolder(parent: TFolder, onSuccess?: (path: string) => void): Promise<void> {
        const modal = new InputModal(this.app, 'New Folder', 'Enter folder name:', async (name) => {
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

    async renameFolder(folder: TFolder): Promise<void> {
        const modal = new InputModal(this.app, 'Rename Folder', 'Enter new name:', async (newName) => {
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

    async renameFile(file: TFile): Promise<void> {
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
                } catch (error) {
                    new Notice(`Failed to rename file: ${error.message}`);
                }
            }
        }, file.basename);
        modal.open();
    }

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

    isDescendant(parent: TAbstractFile, child: TAbstractFile): boolean {
        let current = child.parent;
        while (current) {
            if (current === parent) return true;
            current = current.parent;
        }
        return false;
    }
}