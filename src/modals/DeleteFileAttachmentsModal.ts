/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
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

import { App, Modal, setIcon, TFile } from 'obsidian';
import { strings } from '../i18n';
import { isRasterImageFile } from '../utils/fileTypeUtils';

type AttachmentViewMode = 'tree' | 'gallery';

type FolderTreeNode = {
    path: string;
    name: string;
    folders: Map<string, FolderTreeNode>;
    files: TFile[];
};

interface ButtonBinding {
    element: HTMLElement;
    handler: (event: Event) => void;
}

function buildFolderTree(files: readonly TFile[]): FolderTreeNode {
    const root: FolderTreeNode = { path: '', name: '', folders: new Map(), files: [] };

    for (const file of files) {
        const parts = file.path.split('/').filter(Boolean);
        const fileName = parts.pop();
        if (!fileName) {
            root.files.push(file);
            continue;
        }

        let currentNode = root;
        let currentPath = '';
        for (const folderName of parts) {
            currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
            const existing = currentNode.folders.get(folderName);
            if (existing) {
                currentNode = existing;
                continue;
            }

            const created: FolderTreeNode = { path: currentPath, name: folderName, folders: new Map(), files: [] };
            currentNode.folders.set(folderName, created);
            currentNode = created;
        }

        currentNode.files.push(file);
    }

    return root;
}

class DeleteFileAttachmentsModal extends Modal {
    private readonly attachments: readonly TFile[];
    private readonly buttonBindings: ButtonBinding[] = [];
    private hasResolved = false;

    private readonly selectedPaths = new Set<string>();
    private viewMode: AttachmentViewMode = 'tree';

    private readonly fileCheckboxesByPath = new Map<string, HTMLInputElement[]>();
    private readonly selectableElementsByPath = new Map<string, HTMLElement[]>();
    private readonly folderSelectableElementByPath = new Map<string, HTMLElement>();

    private readonly folderCheckboxByPath = new Map<string, HTMLInputElement>();
    private readonly folderDescendantFilesByPath = new Map<string, string[]>();

    private readonly folderCollapsedByPath = new Map<string, boolean>();
    private galleryRendered = false;
    private selectionUiFrame: number | null = null;

    constructor(
        app: App,
        attachments: readonly TFile[],
        private readonly onResolve: (value: readonly TFile[] | null) => void
    ) {
        super(app);
        this.attachments = attachments.slice().sort((a, b) => a.path.localeCompare(b.path));
        this.attachments.forEach(file => {
            this.selectedPaths.add(file.path);
        });
    }

    onOpen(): void {
        this.modalEl.addClass('mod-scrollable-content');
        this.modalEl.addClass('mod-file-browser');
        this.titleEl.setText(strings.modals.fileSystem.deleteFileAttachmentsTitle);

        const description =
            this.attachments.length === 1
                ? strings.modals.fileSystem.deleteFileAttachmentsDescriptionSingle
                : strings.modals.fileSystem.deleteFileAttachmentsDescriptionMultiple;
        this.contentEl.createEl('p', { text: description, cls: 'file-browser-description' });

        const toolbarEl = this.contentEl.createDiv({ cls: 'modal-view-options-toolbar' });
        const listButtonEl = toolbarEl.createDiv({
            cls: ['clickable-icon', 'modal-view-option', 'is-active'],
            attr: { 'aria-label': strings.modals.fileSystem.deleteFileAttachmentsViewFileTreeAriaLabel }
        });
        setIcon(listButtonEl, 'lucide-list');

        const galleryButtonEl = toolbarEl.createDiv({
            cls: ['clickable-icon', 'modal-view-option'],
            attr: { 'aria-label': strings.modals.fileSystem.deleteFileAttachmentsViewGalleryAriaLabel }
        });
        setIcon(galleryButtonEl, 'lucide-image');

        const viewsEl = this.contentEl.createDiv({ cls: 'file-browser-views' });
        const treeEl = viewsEl.createDiv({ cls: 'file-tree' });
        const galleryEl = viewsEl.createDiv({ cls: 'attachments-gallery' });

        this.renderTreeView(treeEl);
        this.applyViewMode(treeEl, galleryEl, listButtonEl, galleryButtonEl);

        this.bindClick(listButtonEl, () => {
            this.viewMode = 'tree';
            this.applyViewMode(treeEl, galleryEl, listButtonEl, galleryButtonEl);
        });
        this.bindClick(galleryButtonEl, () => {
            this.viewMode = 'gallery';
            this.applyViewMode(treeEl, galleryEl, listButtonEl, galleryButtonEl);
        });

        const buttonContainer = this.contentEl.createDiv({ cls: 'modal-button-container' });
        const deleteButton = buttonContainer.createEl('button', { text: strings.common.delete, cls: 'mod-warning' });
        const cancelButton = buttonContainer.createEl('button', { text: strings.common.cancel, cls: 'mod-cancel' });

        this.bindClick(deleteButton, () => {
            const selected = this.attachments.filter(file => this.selectedPaths.has(file.path));
            this.resolveAndClose(selected);
        });
        this.bindClick(cancelButton, () => {
            this.resolveAndClose(null);
        });

        this.scope.register([], 'Enter', evt => {
            evt.preventDefault();
            const selected = this.attachments.filter(file => this.selectedPaths.has(file.path));
            this.resolveAndClose(selected);
        });
        this.scope.register([], 'Escape', evt => {
            evt.preventDefault();
            this.resolveAndClose(null);
        });
    }

    onClose(): void {
        if (this.selectionUiFrame !== null) {
            window.cancelAnimationFrame(this.selectionUiFrame);
            this.selectionUiFrame = null;
        }

        for (const binding of this.buttonBindings) {
            binding.element.removeEventListener('click', binding.handler);
            if (binding.element.instanceOf(HTMLInputElement)) {
                binding.element.removeEventListener('change', binding.handler);
            }
        }

        if (!this.hasResolved) {
            this.onResolve(null);
            this.hasResolved = true;
        }
    }

    private applyViewMode(treeEl: HTMLElement, galleryEl: HTMLElement, listButtonEl: HTMLElement, galleryButtonEl: HTMLElement): void {
        const isTree = this.viewMode === 'tree';
        if (!isTree && !this.galleryRendered) {
            this.renderGalleryView(galleryEl);
            this.galleryRendered = true;
        }

        treeEl.style.display = isTree ? '' : 'none';
        galleryEl.style.display = isTree ? 'none' : '';

        listButtonEl.toggleClass('is-active', isTree);
        galleryButtonEl.toggleClass('is-active', !isTree);
    }

    private renderTreeView(containerEl: HTMLElement): void {
        const root = buildFolderTree(this.attachments);
        const rootChildren = root.folders.size > 0 || root.files.length > 0;
        if (!rootChildren) {
            return;
        }

        const sortedRootFolders = Array.from(root.folders.values()).sort((a, b) => a.path.localeCompare(b.path));
        const sortedRootFiles = root.files.slice().sort((a, b) => a.path.localeCompare(b.path));

        for (const file of sortedRootFiles) {
            this.renderFileNode(containerEl, file, file.name);
        }

        for (const folderNode of sortedRootFolders) {
            this.renderFolderNode(containerEl, folderNode);
        }

        this.updateSelectionUI();
    }

    private renderFolderNode(parentEl: HTMLElement, node: FolderTreeNode): void {
        const treeItemEl = parentEl.createDiv({ cls: 'tree-item' });
        const selfEl = treeItemEl.createDiv({ cls: ['tree-item-self', 'is-clickable', 'mod-collapsible', 'mod-folder'] });
        this.folderSelectableElementByPath.set(node.path, selfEl);

        const collapseIconEl = selfEl.createDiv({ cls: ['tree-item-icon', 'collapse-icon'] });
        setIcon(collapseIconEl, 'chevron-down');

        const innerEl = selfEl.createDiv({ cls: ['tree-item-inner', 'file-tree-item'] });
        const checkboxEl = innerEl.createEl('input', { cls: 'file-tree-item-checkbox', type: 'checkbox' });
        this.folderCheckboxByPath.set(node.path, checkboxEl);

        const iconEl = innerEl.createDiv({ cls: 'file-tree-item-icon' });
        setIcon(iconEl, 'lucide-folder');
        innerEl.createDiv({ cls: 'file-tree-item-title', text: node.name });

        const childrenEl = treeItemEl.createDiv({ cls: 'tree-item-children' });

        const folderFiles = node.files.slice().sort((a, b) => a.path.localeCompare(b.path));
        for (const file of folderFiles) {
            this.renderFileNode(childrenEl, file, file.name);
        }

        const folderChildren = Array.from(node.folders.values()).sort((a, b) => a.path.localeCompare(b.path));
        for (const child of folderChildren) {
            this.renderFolderNode(childrenEl, child);
        }

        const descendantFilePaths: string[] = [];
        folderFiles.forEach(file => {
            descendantFilePaths.push(file.path);
        });
        for (const child of folderChildren) {
            const childDescendantPaths = this.folderDescendantFilesByPath.get(child.path);
            if (childDescendantPaths) {
                descendantFilePaths.push(...childDescendantPaths);
            }
        }
        this.folderDescendantFilesByPath.set(node.path, descendantFilePaths);

        const updateFolderCollapsed = (collapsed: boolean) => {
            this.folderCollapsedByPath.set(node.path, collapsed);
            childrenEl.style.display = collapsed ? 'none' : '';
            collapseIconEl.toggleClass('is-collapsed', collapsed);
            setIcon(collapseIconEl, collapsed ? 'chevron-right' : 'chevron-down');
        };

        updateFolderCollapsed(this.folderCollapsedByPath.get(node.path) ?? false);

        this.bindChange(checkboxEl, () => {
            const descendantPaths = this.folderDescendantFilesByPath.get(node.path) ?? [];
            const shouldSelect = checkboxEl.checked;
            let changed = false;

            descendantPaths.forEach(path => {
                const isSelected = this.selectedPaths.has(path);
                if (shouldSelect) {
                    if (!isSelected) {
                        this.selectedPaths.add(path);
                        changed = true;
                    }
                    return;
                }

                if (isSelected) {
                    this.selectedPaths.delete(path);
                    changed = true;
                }
            });

            if (changed) {
                this.scheduleSelectionUIUpdate();
            }
        });

        this.bindClick(selfEl, evt => {
            if (evt.targetNode?.instanceOf(HTMLInputElement)) {
                return;
            }
            const currentCollapsed = this.folderCollapsedByPath.get(node.path) ?? false;
            updateFolderCollapsed(!currentCollapsed);
        });
    }

    private renderFileNode(parentEl: HTMLElement, file: TFile, label: string): void {
        const treeItemEl = parentEl.createDiv({ cls: 'tree-item' });
        const selfEl = treeItemEl.createDiv({ cls: ['tree-item-self', 'is-clickable', 'mod-file'] });
        this.registerSelectableElement(file.path, selfEl);

        const innerEl = selfEl.createDiv({ cls: ['tree-item-inner', 'file-tree-item'] });
        const checkboxEl = innerEl.createEl('input', { cls: 'file-tree-item-checkbox', type: 'checkbox' });
        this.registerFileCheckbox(file.path, checkboxEl);

        const iconEl = innerEl.createDiv({ cls: 'file-tree-item-icon' });
        setIcon(iconEl, 'lucide-file');
        innerEl.createDiv({ cls: 'file-tree-item-title', text: label });

        this.bindChange(checkboxEl, () => {
            this.setPathSelection(file.path, checkboxEl.checked);
        });

        this.bindClick(selfEl, evt => {
            if (evt.targetNode?.instanceOf(HTMLInputElement)) {
                return;
            }
            this.togglePathSelection(file.path);
        });
    }

    private renderGalleryView(containerEl: HTMLElement): void {
        const resourcePathCache = new Map<string, string>();

        this.attachments.forEach(file => {
            const itemEl = containerEl.createDiv({
                cls: ['download-attachment-item', 'is-selected'],
                attr: { 'aria-label': file.name }
            });
            this.registerSelectableElement(file.path, itemEl);

            const checkboxEl = itemEl.createEl('input', { type: 'checkbox' });
            this.registerFileCheckbox(file.path, checkboxEl);

            const embedEl = itemEl.createDiv({ cls: ['download-attachment-embed', 'media-embed', 'image-embed', 'is-loaded'] });
            if (isRasterImageFile(file)) {
                const src = resourcePathCache.get(file.path) ?? this.app.vault.getResourcePath(file);
                resourcePathCache.set(file.path, src);
                embedEl.createEl('img', { attr: { src, alt: file.name } });
            } else {
                const iconEl = embedEl.createDiv({ cls: 'file-tree-item-icon' });
                setIcon(iconEl, 'lucide-file');
            }

            this.bindChange(checkboxEl, () => {
                this.setPathSelection(file.path, checkboxEl.checked);
            });

            this.bindClick(itemEl, evt => {
                if (evt.targetNode?.instanceOf(HTMLInputElement)) {
                    return;
                }
                this.togglePathSelection(file.path);
            });
        });

        this.updateSelectionUI();
    }

    private setPathSelection(path: string, isSelected: boolean): void {
        const currentlySelected = this.selectedPaths.has(path);
        if (currentlySelected === isSelected) {
            return;
        }

        if (isSelected) {
            this.selectedPaths.add(path);
        } else {
            this.selectedPaths.delete(path);
        }
        this.scheduleSelectionUIUpdate();
    }

    private togglePathSelection(path: string): void {
        this.setPathSelection(path, !this.selectedPaths.has(path));
    }

    private registerFileCheckbox(path: string, checkbox: HTMLInputElement): void {
        const existing = this.fileCheckboxesByPath.get(path);
        if (existing) {
            existing.push(checkbox);
        } else {
            this.fileCheckboxesByPath.set(path, [checkbox]);
        }
    }

    private registerSelectableElement(path: string, element: HTMLElement): void {
        const existing = this.selectableElementsByPath.get(path);
        if (existing) {
            existing.push(element);
        } else {
            this.selectableElementsByPath.set(path, [element]);
        }
    }

    private updateSelectionUI(): void {
        for (const [path, checkboxes] of this.fileCheckboxesByPath) {
            const isSelected = this.selectedPaths.has(path);
            for (const checkbox of checkboxes) {
                checkbox.checked = isSelected;
            }
        }

        for (const [path, elements] of this.selectableElementsByPath) {
            const isSelected = this.selectedPaths.has(path);
            for (const el of elements) {
                el.toggleClass('is-selected', isSelected);
            }
        }

        for (const [folderPath, checkboxEl] of this.folderCheckboxByPath) {
            const descendantPaths = this.folderDescendantFilesByPath.get(folderPath) ?? [];
            const total = descendantPaths.length;

            let selectedCount = 0;
            descendantPaths.forEach(path => {
                if (this.selectedPaths.has(path)) {
                    selectedCount += 1;
                }
            });

            checkboxEl.indeterminate = selectedCount > 0 && selectedCount < total;
            checkboxEl.checked = total > 0 && selectedCount === total;

            const folderEl = this.folderSelectableElementByPath.get(folderPath);
            if (folderEl) {
                folderEl.toggleClass('is-selected', selectedCount > 0);
            }
        }
    }

    private scheduleSelectionUIUpdate(): void {
        if (this.selectionUiFrame !== null) {
            return;
        }

        this.selectionUiFrame = window.requestAnimationFrame(() => {
            this.selectionUiFrame = null;
            this.updateSelectionUI();
        });
    }

    private bindClick(element: HTMLElement, handler: (event: MouseEvent) => void): void {
        const wrapped = (event: Event) => {
            if (event instanceof MouseEvent) {
                handler(event);
            }
        };
        element.addEventListener('click', wrapped);
        this.buttonBindings.push({ element, handler: wrapped });
    }

    private bindChange(element: HTMLInputElement, handler: () => void): void {
        const wrapped = (_event: Event) => {
            handler();
        };
        element.addEventListener('change', wrapped);
        this.buttonBindings.push({ element, handler: wrapped });
    }

    private resolveAndClose(value: readonly TFile[] | null): void {
        if (this.hasResolved) {
            return;
        }
        this.hasResolved = true;
        this.onResolve(value);
        this.close();
    }
}

export function promptDeleteFileAttachments(app: App, attachments: readonly TFile[]): Promise<readonly TFile[] | null> {
    return new Promise(resolve => {
        const modal = new DeleteFileAttachmentsModal(app, attachments, resolve);
        modal.open();
    });
}
