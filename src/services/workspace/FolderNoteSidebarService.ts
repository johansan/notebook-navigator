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

import { FileView, Platform, TFile, TFolder, type ViewState, type WorkspaceLeaf } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW } from '../../types';
import { runAsyncAction } from '../../utils/async';
import { getFolderNote } from '../../utils/folderNoteLookup';
import { getLeafSplitLocation } from '../../utils/workspaceSplit';

const SETTINGS_LISTENER_ID = 'folder-note-sidebar-service';
const SIDEBAR_OPEN_SUPPRESSION_MS = 1000;
const PLACEHOLDER_VIEW_STATE: ViewState = { type: NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW, state: {} };
const FOLDER_NOTE_DOCUMENT_VIEW_TYPES = new Set(['markdown', 'canvas', 'base', 'excalidraw']);

interface WorkspaceWithActiveLeaf {
    activeLeaf?: WorkspaceLeaf | null;
}

export class FolderNoteSidebarService {
    private readonly plugin: NotebookNavigatorPlugin;
    private isStarted = false;
    private companionLeaf: WorkspaceLeaf | null = null;
    private currentFolderNotePath: string | null = null;
    private selectedFolder: TFolder | null | undefined = undefined;
    private workspaceReady = false;
    private syncRequestId = 0;
    private suppressedSidebarOpenPath: string | null = null;
    private suppressionTimer: number | null = null;

    constructor(plugin: NotebookNavigatorPlugin) {
        this.plugin = plugin;
    }

    start(): void {
        if (this.isStarted) {
            return;
        }

        this.isStarted = true;
        this.plugin.registerSettingsUpdateListener(SETTINGS_LISTENER_ID, () => this.handleSettingsUpdate());
    }

    dispose(): void {
        this.isStarted = false;
        this.plugin.unregisterSettingsUpdateListener(SETTINGS_LISTENER_ID);
        this.clearSidebarOpenSuppression();
    }

    handleWorkspaceReady(): void | Promise<void> {
        this.workspaceReady = true;
        const selectedFolder = this.selectedFolder;
        if (selectedFolder !== undefined) {
            const syncPromise = this.syncToSelectedFolder(selectedFolder);
            runAsyncAction(() => syncPromise);
            return syncPromise;
        }
    }

    isSuppressingSidebarOpen(path: string): boolean {
        return this.suppressedSidebarOpenPath === path;
    }

    async openFolderNote(folderNote: TFile): Promise<void> {
        const requestId = ++this.syncRequestId;
        await this.applyResolvedFolderNote(folderNote, requestId);
    }

    async syncToSelectedFolder(folder: TFolder | null): Promise<void> {
        this.selectedFolder = folder;
        if (!this.workspaceReady || this.plugin.isShuttingDown() || !this.shouldFollowRelatedFolderNotes) {
            return;
        }

        const requestId = ++this.syncRequestId;
        const folderNote = folder ? this.findNearestFolderNoteForFolder(folder) : null;
        await this.applyResolvedFolderNote(folderNote, requestId);
    }

    private get canUseRightSidebar(): boolean {
        const settings = this.plugin.settings;
        return settings.enableFolderNotes && settings.folderNoteOpenLocation === 'right-sidebar';
    }

    private get shouldFollowRelatedFolderNotes(): boolean {
        return this.canUseRightSidebar && this.plugin.settings.showNearestFolderNoteInSidebar;
    }

    private handleSettingsUpdate(): void {
        if (!this.workspaceReady || this.plugin.isShuttingDown()) {
            return;
        }

        if (!this.canUseRightSidebar) {
            runAsyncAction(() => this.detachCompanionLeaf());
            return;
        }

        if (this.shouldFollowRelatedFolderNotes) {
            const selectedFolder = this.selectedFolder;
            if (selectedFolder !== undefined) {
                runAsyncAction(() => this.syncToSelectedFolder(selectedFolder));
            }
        }
    }

    private async applyResolvedFolderNote(folderNote: TFile | null, requestId: number): Promise<void> {
        if (requestId !== this.syncRequestId || this.plugin.isShuttingDown() || !this.canUseRightSidebar) {
            return;
        }

        if (!folderNote) {
            await this.clearCompanionLeaf();
            return;
        }

        if (this.currentFolderNotePath === folderNote.path && this.getUsableCompanionLeaf(folderNote.path)) {
            return;
        }

        const leaf = this.getOrCreateCompanionLeaf(folderNote);
        if (!leaf) {
            return;
        }

        const previousActiveLeaf = this.getActiveLeaf();
        this.suppressSidebarOpen(folderNote.path);
        const openCompanionFile = async (targetLeaf: WorkspaceLeaf | null) => {
            if (!targetLeaf) {
                return;
            }
            await targetLeaf.openFile(folderNote, { active: false });
        };
        if (this.plugin.commandQueue) {
            const result = await this.plugin.commandQueue.executeBackgroundFileOpen(folderNote, openCompanionFile, { getLeaf: () => leaf });
            if (!result.success) {
                return;
            }
        } else {
            await openCompanionFile(leaf);
        }
        if (requestId !== this.syncRequestId || this.plugin.isShuttingDown()) {
            return;
        }

        this.currentFolderNotePath = folderNote.path;
        if (!Platform.isMobile) {
            await this.plugin.app.workspace.revealLeaf(leaf);
        }
        if (previousActiveLeaf && previousActiveLeaf !== leaf && !this.plugin.isShuttingDown()) {
            this.plugin.app.workspace.setActiveLeaf(previousActiveLeaf, { focus: false });
        }
    }

    private findNearestFolderNoteForFolder(selectedFolder: TFolder): TFile | null {
        let folder: TFolder | null = selectedFolder;

        while (folder) {
            const folderNote = getFolderNote(folder, this.plugin.settings);
            if (folderNote) {
                return folderNote;
            }

            folder = folder.parent instanceof TFolder ? folder.parent : null;
        }

        return null;
    }

    private getOrCreateCompanionLeaf(folderNote: TFile): WorkspaceLeaf | null {
        const existingLeaf = this.getUsableCompanionLeaf();
        if (existingLeaf) {
            this.pruneRestoredCompanionLeafDuplicates(existingLeaf);
            return existingLeaf;
        }

        const restoredLeaf = this.findRestoredCompanionLeaf(folderNote);
        if (restoredLeaf) {
            this.companionLeaf = restoredLeaf;
            this.pruneRestoredCompanionLeafDuplicates(restoredLeaf);
            return restoredLeaf;
        }

        const leaf = this.plugin.app.workspace.getRightLeaf(true) ?? this.plugin.app.workspace.getRightLeaf(false);
        this.companionLeaf = leaf;
        if (leaf) {
            this.pruneRestoredCompanionLeafDuplicates(leaf);
        }
        return leaf;
    }

    private getUsableCompanionLeaf(expectedFolderNotePath?: string | null): WorkspaceLeaf | null {
        const leaf = this.companionLeaf;
        if (!leaf || getLeafSplitLocation(this.plugin.app, leaf) !== 'right-sidebar') {
            return null;
        }

        const expectedPath = expectedFolderNotePath === undefined ? this.currentFolderNotePath : expectedFolderNotePath;
        if (expectedPath === null) {
            return this.isPlaceholderLeaf(leaf) ? leaf : null;
        }

        return this.getFilePathFromLeaf(leaf) === expectedPath ? leaf : null;
    }

    private findRestoredCompanionLeaf(targetFolderNote: TFile | null): WorkspaceLeaf | null {
        let exactMatch: WorkspaceLeaf | null = null;
        let folderNoteLeaf: WorkspaceLeaf | null = null;
        let placeholderLeaf: WorkspaceLeaf | null = null;

        this.plugin.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
            if (exactMatch || getLeafSplitLocation(this.plugin.app, leaf) !== 'right-sidebar') {
                return;
            }

            if (!placeholderLeaf && this.isPlaceholderLeaf(leaf)) {
                placeholderLeaf = leaf;
            }

            const filePath = this.getFilePathFromLeaf(leaf);
            if (!filePath) {
                return;
            }

            if (targetFolderNote && filePath === targetFolderNote.path) {
                exactMatch = leaf;
                return;
            }

            if (!folderNoteLeaf && this.isFolderNotePath(filePath)) {
                folderNoteLeaf = leaf;
            }
        });

        if (targetFolderNote) {
            return exactMatch ?? placeholderLeaf ?? folderNoteLeaf;
        }

        return placeholderLeaf ?? folderNoteLeaf;
    }

    private pruneRestoredCompanionLeafDuplicates(keepLeaf: WorkspaceLeaf | null, options: { includeDocumentLeaves?: boolean } = {}): void {
        const leavesToDetach: WorkspaceLeaf[] = [];
        const includeDocumentLeaves = options.includeDocumentLeaves ?? true;

        // The right sidebar folder-note views and placeholders form one companion slot.
        // Document leaves are pruned only while right-sidebar folder notes are active.
        this.plugin.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
            if (leaf === keepLeaf || getLeafSplitLocation(this.plugin.app, leaf) !== 'right-sidebar') {
                return;
            }

            const filePath = this.getFilePathFromLeaf(leaf);
            if (includeDocumentLeaves && filePath && this.isFolderNotePath(filePath)) {
                leavesToDetach.push(leaf);
                return;
            }

            if (this.isPlaceholderLeaf(leaf)) {
                leavesToDetach.push(leaf);
            }
        });

        leavesToDetach.forEach(leaf => leaf.detach());
    }

    private isPlaceholderLeaf(leaf: WorkspaceLeaf): boolean {
        return leaf.getViewState().type === NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW;
    }

    private getFileFromLeaf(leaf: WorkspaceLeaf): TFile | null {
        const view = leaf.view;
        if (typeof FileView === 'function' && view instanceof FileView && view.file instanceof TFile) {
            return view.file;
        }

        return null;
    }

    private getFilePathFromLeaf(leaf: WorkspaceLeaf): string | null {
        const viewState = leaf.getViewState();
        if (!FOLDER_NOTE_DOCUMENT_VIEW_TYPES.has(viewState.type)) {
            return null;
        }

        const file = this.getFileFromLeaf(leaf);
        if (file) {
            return file.path;
        }

        const filePath = viewState.state?.file;
        return typeof filePath === 'string' && filePath.length > 0 ? filePath : null;
    }

    private isFolderNotePath(path: string): boolean {
        const file = this.plugin.app.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile) || !(file.parent instanceof TFolder)) {
            return false;
        }

        return getFolderNote(file.parent, this.plugin.settings)?.path === file.path;
    }

    private getActiveLeaf(): WorkspaceLeaf | null {
        const workspace = this.plugin.app.workspace as unknown as WorkspaceWithActiveLeaf;
        return workspace.activeLeaf ?? null;
    }

    private async clearCompanionLeaf(): Promise<void> {
        // The placeholder keeps an existing right sidebar tab in Obsidian's workspace layout.
        // Later folder-note opens reuse this leaf, preserving the tab position.
        const leaf = this.getUsableCompanionLeaf() ?? this.findRestoredCompanionLeaf(null);
        this.currentFolderNotePath = null;
        this.companionLeaf = leaf;
        if (!leaf) {
            return;
        }

        if (!this.isPlaceholderLeaf(leaf)) {
            await leaf.setViewState(PLACEHOLDER_VIEW_STATE);
        }
        this.pruneRestoredCompanionLeafDuplicates(leaf);
    }

    private detachCompanionLeaf(): void {
        const leaf = this.getUsableCompanionLeaf();
        this.currentFolderNotePath = null;
        this.companionLeaf = null;
        if (leaf) {
            leaf.detach();
        }

        this.pruneRestoredCompanionLeafDuplicates(leaf, { includeDocumentLeaves: false });
    }

    private suppressSidebarOpen(path: string): void {
        this.clearSidebarOpenSuppression();
        this.suppressedSidebarOpenPath = path;
        if (typeof window === 'undefined') {
            return;
        }

        this.suppressionTimer = window.setTimeout(() => {
            if (this.suppressedSidebarOpenPath === path) {
                this.suppressedSidebarOpenPath = null;
            }
            this.suppressionTimer = null;
        }, SIDEBAR_OPEN_SUPPRESSION_MS);
    }

    private clearSidebarOpenSuppression(): void {
        if (this.suppressionTimer !== null && typeof window !== 'undefined') {
            window.clearTimeout(this.suppressionTimer);
        }
        this.suppressionTimer = null;
        this.suppressedSidebarOpenPath = null;
    }
}
