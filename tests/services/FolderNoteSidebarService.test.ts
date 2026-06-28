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

import { describe, expect, it, vi } from 'vitest';
import { App, FileView, Platform, TFolder, type WorkspaceLeaf } from 'obsidian';
import type NotebookNavigatorPlugin from '../../src/main';
import type { CommandQueueService } from '../../src/services/CommandQueueService';
import { FolderNoteSidebarService } from '../../src/services/workspace/FolderNoteSidebarService';
import { NOTEBOOK_NAVIGATOR_CALENDAR_VIEW, NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW } from '../../src/types';
import { createTestTFile } from '../utils/createTestTFile';

interface MutableFolderNoteSidebarService {
    companionLeaf: WorkspaceLeaf | null;
    currentFolderNotePath: string | null;
}

interface TestWorkspaceLeaf {
    leaf: WorkspaceLeaf;
    openFile: ReturnType<typeof vi.fn>;
    detach: ReturnType<typeof vi.fn>;
    setViewState: ReturnType<typeof vi.fn>;
}

interface CreateRightSidebarLeafOptions {
    view?: unknown;
}

interface TestVaultMethods {
    registerFile(file: ReturnType<typeof createTestTFile>): void;
    registerFolder(folder: TFolder): void;
}

function createRightSidebarLeaf(
    viewState: { type: string; state?: Record<string, unknown> },
    rightSplit: object,
    options?: CreateRightSidebarLeafOptions
): TestWorkspaceLeaf {
    const openFile = vi.fn().mockResolvedValue(undefined);
    const detach = vi.fn();
    const setViewState = vi.fn().mockResolvedValue(undefined);
    const leaf = {
        parent: rightSplit,
        view: options?.view ?? {},
        detach,
        getViewState: vi.fn(() => viewState),
        openFile,
        setViewState
    } as unknown as WorkspaceLeaf;

    return { leaf, openFile, detach, setViewState };
}

function getTestVault(app: App): App['vault'] & TestVaultMethods {
    return app.vault as App['vault'] & TestVaultMethods;
}

function createTestFolder(app: App, path: string, parent: TFolder | null = null): TFolder {
    const folder = new TFolder(path) as TFolder & {
        children: Array<TFolder | ReturnType<typeof createTestTFile>>;
        name: string;
        parent: TFolder | null;
        vault: App['vault'];
    };
    folder.name = path === '/' ? '/' : (path.split('/').pop() ?? path);
    folder.children = [];
    folder.parent = parent;
    folder.vault = app.vault;
    parent?.children.push(folder);
    getTestVault(app).registerFolder(folder);
    return folder;
}

function addFileToFolder(app: App, folder: TFolder, path: string): ReturnType<typeof createTestTFile> {
    const file = createTestTFile(path);
    file.parent = folder;
    file.vault = app.vault;
    (folder as TFolder & { children: ReturnType<typeof createTestTFile>[] }).children.push(file);
    getTestVault(app).registerFile(file);
    return file;
}

function createFileView(file: ReturnType<typeof createTestTFile>): FileView {
    return Object.setPrototypeOf({ file }, FileView.prototype) as FileView;
}

describe('FolderNoteSidebarService', () => {
    it('creates a new companion leaf when the remembered right sidebar leaf was repurposed', async () => {
        const rightSplit = {};
        const staleCalendarLeaf = createRightSidebarLeaf({ type: NOTEBOOK_NAVIGATOR_CALENDAR_VIEW, state: {} }, rightSplit);
        const newFolderNoteLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const folderNote = createTestTFile('Projects/index.md');
        const getRightLeaf = vi.fn((split: boolean) => (split ? newFolderNoteLeaf.leaf : null));
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf,
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(staleCalendarLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        const plugin = {
            app: {
                workspace
            },
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar'
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);
        const mutableService = service as unknown as MutableFolderNoteSidebarService;
        mutableService.companionLeaf = staleCalendarLeaf.leaf;
        mutableService.currentFolderNotePath = folderNote.path;

        await service.openFolderNote(folderNote);

        expect(staleCalendarLeaf.openFile).not.toHaveBeenCalled();
        expect(getRightLeaf).toHaveBeenCalledWith(true);
        expect(newFolderNoteLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(newFolderNoteLeaf.leaf);
    });

    it('marks companion opens as background file opens', async () => {
        const rightSplit = {};
        const companionLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const folderNote = createTestTFile('Projects/index.md');
        const executeBackgroundFileOpen = vi.fn(
            async (
                _folderNote: unknown,
                openFile: (targetLeaf: WorkspaceLeaf | null) => Promise<void>,
                options: { getLeaf: () => WorkspaceLeaf | null }
            ) => {
                await openFile(options.getLeaf());
                return { success: true };
            }
        );
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(() => companionLeaf.leaf),
            iterateAllLeaves: vi.fn(),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        const plugin = {
            app: {
                workspace
            },
            commandQueue: {
                executeBackgroundFileOpen
            } as unknown as CommandQueueService,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar'
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.openFolderNote(folderNote);

        expect(executeBackgroundFileOpen).toHaveBeenCalledTimes(1);
        const call = executeBackgroundFileOpen.mock.calls[0];
        expect(call?.[0]).toBe(folderNote);
        expect(call?.[1]).toEqual(expect.any(Function));
        expect(call?.[2].getLeaf()).toBe(companionLeaf.leaf);
        expect(companionLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(companionLeaf.leaf);
    });

    it('switches the companion leaf to the folder note placeholder when no folder note resolves', async () => {
        const app = new App();
        const rightSplit = {};
        const companionLeaf = createRightSidebarLeaf({ type: 'markdown', state: { file: 'Projects/index.md' } }, rightSplit);
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(() => companionLeaf.leaf),
            iterateAllLeaves: vi.fn(),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                showNearestFolderNoteInSidebar: true,
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);
        const mutableService = service as unknown as MutableFolderNoteSidebarService;
        mutableService.companionLeaf = companionLeaf.leaf;
        mutableService.currentFolderNotePath = 'Projects/index.md';

        void service.handleWorkspaceReady();
        await service.syncToSelectedFolder(null);

        expect(companionLeaf.detach).not.toHaveBeenCalled();
        expect(companionLeaf.setViewState).toHaveBeenCalledWith({
            type: NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW,
            state: {}
        });
    });

    it('does not create a placeholder leaf before a folder note has opened in the sidebar', async () => {
        const app = new App();
        const rightSplit = {};
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(),
            iterateAllLeaves: vi.fn(),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                showNearestFolderNoteInSidebar: true,
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        void service.handleWorkspaceReady();
        await service.syncToSelectedFolder(null);

        expect(workspace.getRightLeaf).not.toHaveBeenCalled();
    });

    it('reuses the folder note placeholder leaf when opening a folder note', async () => {
        const rightSplit = {};
        const placeholderLeaf = createRightSidebarLeaf({ type: NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW, state: {} }, rightSplit);
        const folderNote = createTestTFile('Projects/index.md');
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(placeholderLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        const plugin = {
            app: {
                workspace
            },
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar'
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.openFolderNote(folderNote);

        expect(workspace.getRightLeaf).not.toHaveBeenCalled();
        expect(placeholderLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(placeholderLeaf.leaf);
    });

    it('preserves unrelated empty right sidebar leaves before opening a folder note', async () => {
        const rightSplit = {};
        const restoredEmptyLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const newFolderNoteLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const folderNote = createTestTFile('Projects/index.md');
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn((split: boolean) => (split ? newFolderNoteLeaf.leaf : null)),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(restoredEmptyLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        const plugin = {
            app: {
                workspace
            },
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar'
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.openFolderNote(folderNote);

        expect(restoredEmptyLeaf.detach).not.toHaveBeenCalled();
        expect(newFolderNoteLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(newFolderNoteLeaf.leaf);
    });

    it('reuses restored Excalidraw folder-note leaves before opening a folder note', async () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const folderNote = addFileToFolder(app, projects, 'Projects/index.excalidraw.md');
        const rightSplit = {};
        const restoredExcalidrawLeaf = createRightSidebarLeaf({ type: 'excalidraw', state: { file: folderNote.path } }, rightSplit);
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(restoredExcalidrawLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.openFolderNote(folderNote);

        expect(workspace.getRightLeaf).not.toHaveBeenCalled();
        expect(restoredExcalidrawLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(restoredExcalidrawLeaf.leaf);
    });

    it('preserves unrelated right sidebar panels that expose a file state before opening a folder note', async () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const folderNote = addFileToFolder(app, projects, 'Projects/index.md');
        const rightSplit = {};
        const infoLeaf = createRightSidebarLeaf({ type: 'file-properties', state: { file: folderNote.path } }, rightSplit);
        const newFolderNoteLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn((split: boolean) => (split ? newFolderNoteLeaf.leaf : null)),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(infoLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.openFolderNote(folderNote);

        expect(infoLeaf.openFile).not.toHaveBeenCalled();
        expect(infoLeaf.setViewState).not.toHaveBeenCalled();
        expect(infoLeaf.detach).not.toHaveBeenCalled();
        expect(newFolderNoteLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(newFolderNoteLeaf.leaf);
    });

    it('preserves unrelated FileView right sidebar panels before opening a folder note', async () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const folderNote = addFileToFolder(app, projects, 'Projects/index.md');
        const rightSplit = {};
        const infoView = createFileView(folderNote);
        const infoLeaf = createRightSidebarLeaf({ type: 'file-properties', state: {} }, rightSplit, { view: infoView });
        const newFolderNoteLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn((split: boolean) => (split ? newFolderNoteLeaf.leaf : null)),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(infoLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.openFolderNote(folderNote);

        expect(infoLeaf.openFile).not.toHaveBeenCalled();
        expect(infoLeaf.setViewState).not.toHaveBeenCalled();
        expect(infoLeaf.detach).not.toHaveBeenCalled();
        expect(newFolderNoteLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(newFolderNoteLeaf.leaf);
    });

    it('does not replace unrelated right sidebar panels that expose a file state when clearing the companion leaf', async () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const folderNote = addFileToFolder(app, projects, 'Projects/index.md');
        const rightSplit = {};
        const infoLeaf = createRightSidebarLeaf({ type: 'file-properties', state: { file: folderNote.path } }, rightSplit);
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(infoLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                showNearestFolderNoteInSidebar: true,
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);
        const mutableService = service as unknown as MutableFolderNoteSidebarService;
        mutableService.companionLeaf = infoLeaf.leaf;
        mutableService.currentFolderNotePath = folderNote.path;

        void service.handleWorkspaceReady();
        await service.syncToSelectedFolder(null);

        expect(infoLeaf.setViewState).not.toHaveBeenCalled();
        expect(infoLeaf.detach).not.toHaveBeenCalled();
        expect(workspace.getRightLeaf).not.toHaveBeenCalled();
    });

    it('preserves unrelated right sidebar panels when a settings update clears the companion leaf', () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const folderNote = addFileToFolder(app, projects, 'Projects/index.md');
        const rightSplit = {};
        const infoLeaf = createRightSidebarLeaf({ type: 'file-properties', state: { file: folderNote.path } }, rightSplit);
        let settingsUpdateListener: (() => void) | null = null;
        const registerSettingsUpdateListener = vi.fn((_id: string, callback: () => void) => {
            settingsUpdateListener = callback;
        });
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(infoLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            registerSettingsUpdateListener,
            unregisterSettingsUpdateListener: vi.fn(),
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'current-tab',
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);
        const mutableService = service as unknown as MutableFolderNoteSidebarService;
        mutableService.companionLeaf = infoLeaf.leaf;
        mutableService.currentFolderNotePath = folderNote.path;

        service.start();
        void service.handleWorkspaceReady();
        settingsUpdateListener?.();

        expect(registerSettingsUpdateListener).toHaveBeenCalled();
        expect(infoLeaf.setViewState).not.toHaveBeenCalled();
        expect(infoLeaf.detach).not.toHaveBeenCalled();
        expect(workspace.getRightLeaf).not.toHaveBeenCalled();
    });

    it('preserves user-opened right sidebar folder notes when a settings update runs while sidebar folder notes are disabled', () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const folderNote = addFileToFolder(app, projects, 'Projects/index.md');
        const rightSplit = {};
        const userOpenedFolderNoteLeaf = createRightSidebarLeaf({ type: 'markdown', state: { file: folderNote.path } }, rightSplit);
        let settingsUpdateListener: (() => void) | null = null;
        const registerSettingsUpdateListener = vi.fn((_id: string, callback: () => void) => {
            settingsUpdateListener = callback;
        });
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(),
            iterateAllLeaves: vi.fn((callback: (leaf: WorkspaceLeaf) => void) => {
                callback(userOpenedFolderNoteLeaf.leaf);
            }),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            registerSettingsUpdateListener,
            unregisterSettingsUpdateListener: vi.fn(),
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'current-tab',
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        service.start();
        void service.handleWorkspaceReady();
        settingsUpdateListener?.();

        expect(registerSettingsUpdateListener).toHaveBeenCalled();
        expect(userOpenedFolderNoteLeaf.setViewState).not.toHaveBeenCalled();
        expect(userOpenedFolderNoteLeaf.detach).not.toHaveBeenCalled();
        expect(workspace.getRightLeaf).not.toHaveBeenCalled();
    });

    it('opens folder notes in the right sidebar without revealing the sidebar on mobile', async () => {
        const previousIsMobile = Platform.isMobile;
        Platform.isMobile = true;

        try {
            const rightSplit = {};
            const companionLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
            const folderNote = createTestTFile('Projects/index.md');
            const workspace = {
                rootSplit: {},
                leftSplit: {},
                rightSplit,
                activeLeaf: null,
                getRightLeaf: vi.fn(() => companionLeaf.leaf),
                iterateAllLeaves: vi.fn(),
                revealLeaf: vi.fn().mockResolvedValue(undefined),
                setActiveLeaf: vi.fn()
            };
            const plugin = {
                app: {
                    workspace
                },
                settings: {
                    enableFolderNotes: true,
                    folderNoteOpenLocation: 'right-sidebar'
                },
                isShuttingDown: () => false
            } as unknown as NotebookNavigatorPlugin;
            const service = new FolderNoteSidebarService(plugin);

            await service.openFolderNote(folderNote);

            expect(companionLeaf.openFile).toHaveBeenCalledWith(folderNote, { active: false });
            expect(workspace.revealLeaf).not.toHaveBeenCalled();
        } finally {
            Platform.isMobile = previousIsMobile;
        }
    });

    it('opens the closest folder note for the selected folder', async () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const child = createTestFolder(app, 'Projects/Feature', projects);
        const projectsFolderNote = addFileToFolder(app, projects, 'Projects/index.md');
        const rightSplit = {};
        const companionLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(() => companionLeaf.leaf),
            iterateAllLeaves: vi.fn(),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                showNearestFolderNoteInSidebar: true,
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.handleWorkspaceReady();
        await service.syncToSelectedFolder(child);

        expect(companionLeaf.openFile).toHaveBeenCalledWith(projectsFolderNote, { active: false });
        expect(workspace.revealLeaf).toHaveBeenCalledWith(companionLeaf.leaf);
    });

    it('uses the pending selected folder after the workspace becomes ready', async () => {
        const app = new App();
        const root = createTestFolder(app, '/');
        const projects = createTestFolder(app, 'Projects', root);
        const projectsFolderNote = addFileToFolder(app, projects, 'Projects/index.md');
        const rightSplit = {};
        const companionLeaf = createRightSidebarLeaf({ type: 'empty', state: {} }, rightSplit);
        const workspace = {
            rootSplit: {},
            leftSplit: {},
            rightSplit,
            activeLeaf: null,
            getRightLeaf: vi.fn(() => companionLeaf.leaf),
            iterateAllLeaves: vi.fn(),
            revealLeaf: vi.fn().mockResolvedValue(undefined),
            setActiveLeaf: vi.fn()
        };
        app.workspace = workspace as unknown as App['workspace'];
        const plugin = {
            app,
            settings: {
                enableFolderNotes: true,
                folderNoteOpenLocation: 'right-sidebar',
                showNearestFolderNoteInSidebar: true,
                folderNoteName: 'index',
                folderNoteNamePattern: ''
            },
            isShuttingDown: () => false
        } as unknown as NotebookNavigatorPlugin;
        const service = new FolderNoteSidebarService(plugin);

        await service.syncToSelectedFolder(projects);
        expect(companionLeaf.openFile).not.toHaveBeenCalled();

        await service.handleWorkspaceReady();

        expect(companionLeaf.openFile).toHaveBeenCalledWith(projectsFolderNote, { active: false });
    });
});
