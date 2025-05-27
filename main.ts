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
    PluginSettingTab
} from 'obsidian';

const VIEW_TYPE_NOTEBOOK = 'notebook-navigator-view';

interface NotebookNavigatorSettings {
    replaceDefaultExplorer: boolean;
    showFilePreview: boolean;
    animationSpeed: number;
}

const DEFAULT_SETTINGS: NotebookNavigatorSettings = {
    replaceDefaultExplorer: true,
    showFilePreview: true,
    animationSpeed: 200
}

export default class NotebookNavigatorPlugin extends Plugin {
    settings: NotebookNavigatorSettings;
    private ribbonIcon: HTMLElement;

    async onload() {
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE_NOTEBOOK,
            (leaf) => new NotebookNavigatorView(leaf, this)
        );

        this.addCommand({
            id: 'open-notebook-navigator',
            name: 'Open Notebook Navigator',
            callback: () => {
                this.activateView();
            }
        });

        this.ribbonIcon = this.addRibbonIcon('folder-tree', 'Notebook Navigator', () => {
            this.activateView();
        });

        this.addSettingTab(new NotebookNavigatorSettingTab(this.app, this));

        if (this.settings.replaceDefaultExplorer) {
            this.app.workspace.onLayoutReady(() => {
                this.replaceFileExplorer();
            });
        }
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_NOTEBOOK);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_NOTEBOOK);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getLeftLeaf(false);
            if (leaf) {
                await leaf.setViewState({ type: VIEW_TYPE_NOTEBOOK, active: true });
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    private replaceFileExplorer() {
        const fileExplorerLeaf = this.app.workspace.getLeavesOfType('file-explorer')[0];
        if (fileExplorerLeaf) {
            fileExplorerLeaf.setViewState({ type: VIEW_TYPE_NOTEBOOK, active: true });
        }
    }
}

class NotebookNavigatorView extends ItemView {
    plugin: NotebookNavigatorPlugin;
    private folderTree: HTMLElement;
    private fileList: HTMLElement;
    private selectedFolder: TFolder | null = null;
    private selectedFile: TFile | null = null;
    private expandedFolders: Set<string> = new Set();
    private focusedPane: 'folders' | 'files' = 'folders';
    private focusedFolderIndex: number = 0;
    private focusedFileIndex: number = 0;

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

        const splitContainer = container.createDiv('nn-split-container');
        
        const leftPane = splitContainer.createDiv('nn-left-pane');
        const folderHeader = leftPane.createDiv('nn-pane-header');
        folderHeader.createEl('h3', { text: 'Folders' });
        
        const folderActions = folderHeader.createDiv('nn-header-actions');
        const newFolderBtn = folderActions.createEl('button', { 
            cls: 'nn-icon-button',
            attr: { 'aria-label': 'New Folder' }
        });
        setIcon(newFolderBtn, 'folder-plus');
        newFolderBtn.addEventListener('click', () => this.createNewFolder());

        this.folderTree = leftPane.createDiv('nn-folder-tree');
        
        const rightPane = splitContainer.createDiv('nn-right-pane');
        const fileHeader = rightPane.createDiv('nn-pane-header');
        const fileHeaderTitle = fileHeader.createEl('h3', { text: 'Files' });
        
        const fileActions = fileHeader.createDiv('nn-header-actions');
        const newFileBtn = fileActions.createEl('button', { 
            cls: 'nn-icon-button',
            attr: { 'aria-label': 'New File' }
        });
        setIcon(newFileBtn, 'file-plus');
        newFileBtn.addEventListener('click', () => this.createNewFile());

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

        this.registerDomEvent(container as HTMLElement, 'keydown', (e: KeyboardEvent) => {
            this.handleKeyboardNavigation(e);
        });

        this.refresh();
    }

    async onClose() {
        // Cleanup
    }

    private refresh() {
        this.renderFolderTree();
        this.refreshFileList();
    }

    private renderFolderTree() {
        this.folderTree.empty();
        const rootFolder = this.app.vault.getRoot();
        this.renderFolderItem(rootFolder, this.folderTree, 0);
    }

    private renderFolderItem(folder: TFolder, container: HTMLElement, level: number, index: number = 0) {
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

        if (this.selectedFolder === folder) {
            folderEl.addClass('nn-selected');
        }

        folderContent.addEventListener('click', () => {
            this.selectFolder(folder);
            this.focusedFolderIndex = index;
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
                .sort((a, b) => a.name.localeCompare(b.name));
            
            subfolders.forEach((subfolder, subIndex) => {
                this.renderFolderItem(subfolder as TFolder, childrenContainer, level + 1, index + subIndex + 1);
            });
        }
    }

    private toggleFolder(folder: TFolder) {
        if (this.expandedFolders.has(folder.path)) {
            this.expandedFolders.delete(folder.path);
        } else {
            this.expandedFolders.add(folder.path);
        }
        this.renderFolderTree();
    }

    private selectFolder(folder: TFolder) {
        this.selectedFolder = folder;
        this.renderFolderTree();
        this.refreshFileList();
    }

    private refreshFileList() {
        this.fileList.empty();
        
        if (!this.selectedFolder) {
            this.fileList.createDiv('nn-empty-state').setText('Select a folder to view files');
            return;
        }

        const files = this.selectedFolder.children
            .filter(child => child instanceof TFile)
            .sort((a, b) => (b as TFile).stat.mtime - (a as TFile).stat.mtime) as TFile[];

        if (files.length === 0) {
            this.fileList.createDiv('nn-empty-state').setText('No files in this folder');
            return;
        }

        files.forEach((file, index) => {
            this.renderFileItem(file, index);
        });
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
        
        const fileInfo = fileContent.createDiv('nn-file-info');
        const fileName = fileInfo.createDiv('nn-file-name');
        fileName.textContent = file.basename;

        const fileDate = fileInfo.createDiv('nn-file-date');
        fileDate.textContent = this.formatDate(file.stat.mtime);

        if (this.plugin.settings.showFilePreview) {
            this.app.vault.cachedRead(file).then(content => {
                const preview = fileContent.createDiv('nn-file-preview');
                const previewText = content.substring(0, 100).replace(/^#+\s+/, '');
                preview.textContent = previewText + (content.length > 100 ? '...' : '');
            });
        }

        if (this.selectedFile === file) {
            fileEl.addClass('nn-selected');
        }

        fileEl.addEventListener('click', () => {
            this.selectedFile = file;
            this.focusedFileIndex = index;
            this.focusedPane = 'files';
            this.updateFocus();
            this.openFile(file);
        });

        fileEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showFileContextMenu(file, e);
        });

        this.setupDragAndDrop(fileEl, file);
    }

    private formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    private openFile(file: TFile) {
        this.app.workspace.getLeaf(false).openFile(file);
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
                if (this.focusedPane === 'folders') {
                    this.focusedFolderIndex = Math.max(0, this.focusedFolderIndex - 1);
                } else {
                    this.focusedFileIndex = Math.max(0, this.focusedFileIndex - 1);
                }
                this.updateFocus();
                break;

            case 'ArrowDown':
                e.preventDefault();
                if (this.focusedPane === 'folders') {
                    this.focusedFolderIndex = Math.min(folders.length - 1, this.focusedFolderIndex + 1);
                } else {
                    this.focusedFileIndex = Math.min(files.length - 1, this.focusedFileIndex + 1);
                }
                this.updateFocus();
                break;

            case 'Tab':
                e.preventDefault();
                if (!e.shiftKey) {
                    if (this.focusedPane === 'folders' && files.length > 0) {
                        this.focusedPane = 'files';
                        this.focusedFileIndex = 0;
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
                if (this.focusedPane === 'folders') {
                    const folderEl = folders[this.focusedFolderIndex];
                    if (folderEl) {
                        const path = folderEl.getAttribute('data-path');
                        const folder = this.app.vault.getAbstractFileByPath(path || '') as TFolder;
                        if (folder) {
                            this.selectFolder(folder);
                        }
                    }
                } else {
                    const fileEl = files[this.focusedFileIndex];
                    if (fileEl) {
                        const path = fileEl.getAttribute('data-path');
                        const file = this.app.vault.getAbstractFileByPath(path || '') as TFile;
                        if (file) {
                            this.openFile(file);
                        }
                    }
                }
                break;
        }
    }

    private updateFocus() {
        this.containerEl.querySelectorAll('.nn-focused').forEach(el => {
            el.removeClass('nn-focused');
        });

        if (this.focusedPane === 'folders') {
            const folders = this.folderTree.querySelectorAll('.nn-folder-item');
            const focusedFolder = folders[this.focusedFolderIndex];
            if (focusedFolder) {
                focusedFolder.addClass('nn-focused');
                focusedFolder.scrollIntoView({ block: 'nearest' });
            }
        } else {
            const files = this.fileList.querySelectorAll('.nn-file-item');
            const focusedFile = files[this.focusedFileIndex];
            if (focusedFile) {
                focusedFile.addClass('nn-focused');
                focusedFile.scrollIntoView({ block: 'nearest' });
            }
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

    constructor(app: App, plugin: NotebookNavigatorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Notebook Navigator Settings' });

        new Setting(containerEl)
            .setName('Replace default file explorer')
            .setDesc('Automatically replace Obsidian\'s file explorer with Notebook Navigator')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.replaceDefaultExplorer)
                .onChange(async (value) => {
                    this.plugin.settings.replaceDefaultExplorer = value;
                    await this.plugin.saveSettings();
                    new Notice('Restart Obsidian for this change to take effect');
                }));

        new Setting(containerEl)
            .setName('Show file preview')
            .setDesc('Display a preview of file contents in the file list')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFilePreview)
                .onChange(async (value) => {
                    this.plugin.settings.showFilePreview = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Animation speed')
            .setDesc('Speed of UI animations in milliseconds')
            .addText(text => text
                .setPlaceholder('200')
                .setValue(this.plugin.settings.animationSpeed.toString())
                .onChange(async (value) => {
                    const speed = parseInt(value);
                    if (!isNaN(speed) && speed >= 0) {
                        this.plugin.settings.animationSpeed = speed;
                        await this.plugin.saveSettings();
                    }
                }));
    }
}