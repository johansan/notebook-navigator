/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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

import { MenuItem, Notice, Platform, TFolder, TFile } from 'obsidian';
import { FolderMenuBuilderParams } from './menuTypes';
import { strings } from '../../i18n';
import { getInternalPlugin, isFolderAncestor } from '../../utils/typeGuards';
import { getFolderNote, createFolderNote } from '../../utils/folderNotes';
import { ExtendedApp } from '../../types/obsidian-extended';
import { cleanupExclusionPatterns, isFolderInExcludedFolder } from '../../utils/fileFilters';
import { ItemType } from '../../types';

/**
 * Adds folder creation commands (new note/folder/canvas/base/drawing) to a menu.
 */
export function addFolderCreationMenuItems(params: FolderMenuBuilderParams): void {
    const { folder, menu, services, state, dispatchers } = params;
    const { app, fileSystemOps } = services;
    const { selectionState, expandedFolders } = state;
    const { selectionDispatch, expansionDispatch, uiDispatch } = dispatchers;

    const ensureFolderSelected = () => {
        if (
            selectionState.selectionType === ItemType.FOLDER &&
            selectionState.selectedFolder &&
            selectionState.selectedFolder.path === folder.path
        ) {
            return;
        }

        selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder });
    };

    // Selects newly created file and switches focus to files pane
    const handleFileCreation = (file: TFile | null | undefined) => {
        if (!file) {
            return;
        }

        // Select the newly created file in the list
        selectionDispatch({ type: 'SET_SELECTED_FILE', file });
        // Switch focus to the files pane to show the selection
        uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
    };

    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.newNote)
            .setIcon('lucide-pen-box')
            .onClick(async () => {
                ensureFolderSelected();
                const createdFile = await fileSystemOps.createNewFile(folder);
                handleFileCreation(createdFile);
            });
    });

    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.newFolder)
            .setIcon('lucide-folder-plus')
            .onClick(async () => {
                ensureFolderSelected();
                await fileSystemOps.createNewFolder(folder, () => {
                    if (!expandedFolders.has(folder.path)) {
                        expansionDispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderPath: folder.path });
                    }
                });
            });
    });

    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.newCanvas)
            .setIcon('lucide-layout-grid')
            .onClick(async () => {
                ensureFolderSelected();
                const createdCanvas = await fileSystemOps.createCanvas(folder);
                handleFileCreation(createdCanvas);
            });
    });

    const basesPlugin = getInternalPlugin(app, 'bases');
    if (basesPlugin?.enabled) {
        menu.addItem((item: MenuItem) => {
            item.setTitle(strings.contextMenu.folder.newBase)
                .setIcon('lucide-database')
                .onClick(async () => {
                    ensureFolderSelected();
                    const createdBase = await fileSystemOps.createBase(folder);
                    handleFileCreation(createdBase);
                });
        });
    }

    const isExcalidrawInstalled = !!(app as ExtendedApp).plugins?.plugins?.['obsidian-excalidraw-plugin'];
    if (isExcalidrawInstalled) {
        menu.addItem((item: MenuItem) => {
            item.setTitle(strings.contextMenu.folder.newDrawing)
                .setIcon('lucide-pencil')
                .onClick(async () => {
                    ensureFolderSelected();
                    const createdDrawing = await fileSystemOps.createNewDrawing(folder);
                    handleFileCreation(createdDrawing);
                });
        });
    }
}

/**
 * Builds the context menu for a folder
 */
export function buildFolderMenu(params: FolderMenuBuilderParams): void {
    const { folder, menu, services, settings, state, dispatchers } = params;
    const { app, fileSystemOps, metadataService } = services;
    const { selectionState, expandedFolders } = state;
    const { selectionDispatch, expansionDispatch } = dispatchers;

    // Show folder name on mobile
    if (services.isMobile) {
        menu.addItem((item: MenuItem) => {
            item.setTitle(folder.name).setIsLabel(true);
        });
    }

    addFolderCreationMenuItems(params);

    menu.addSeparator();

    // Duplicate folder
    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.duplicateFolder)
            .setIcon('lucide-copy')
            .onClick(async () => {
                await fileSystemOps.duplicateFolder(folder);
            });
    });

    // Search in folder
    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.searchInFolder)
            .setIcon('lucide-search')
            .onClick(() => {
                interface SearchPlugin {
                    enabled: boolean;
                    instance?: {
                        openGlobalSearch(query: string): void;
                    };
                }
                const searchPlugin = getInternalPlugin<SearchPlugin>(app, 'global-search');
                if (searchPlugin?.instance) {
                    searchPlugin.instance.openGlobalSearch(`path:"${folder.path}"`);
                }
            });
    });

    // Reveal in system explorer - desktop only
    if (!services.isMobile) {
        menu.addItem((item: MenuItem) => {
            item.setTitle(fileSystemOps.getRevealInSystemExplorerText())
                .setIcon(Platform.isMacOS ? 'lucide-app-window-mac' : 'lucide-app-window')
                .onClick(async () => {
                    await fileSystemOps.revealInSystemExplorer(folder);
                });
        });
    }

    // Add to shortcuts / Remove from shortcuts
    if (services.shortcuts) {
        const { folderShortcutKeysByPath, addFolderShortcut, removeShortcut } = services.shortcuts;
        const existingShortcutKey = folderShortcutKeysByPath.get(folder.path);

        menu.addItem((item: MenuItem) => {
            if (existingShortcutKey) {
                item.setTitle(strings.shortcuts.remove)
                    .setIcon('lucide-bookmark-x')
                    .onClick(() => {
                        void removeShortcut(existingShortcutKey);
                    });
            } else {
                item.setTitle(strings.shortcuts.add)
                    .setIcon('lucide-bookmark')
                    .onClick(() => {
                        void addFolderShortcut(folder.path);
                    });
            }
        });
    }

    // Folder note operations
    if (settings.enableFolderNotes) {
        menu.addSeparator();

        const folderNote = getFolderNote(folder, settings);

        if (folderNote) {
            // Delete folder note option
            menu.addItem((item: MenuItem) => {
                item.setTitle(strings.contextMenu.folder.deleteFolderNote)
                    .setIcon('lucide-trash')
                    .onClick(async () => {
                        await fileSystemOps.deleteFile(folderNote, settings.confirmBeforeDelete);
                    });
            });
        } else {
            // Create folder note option
            menu.addItem((item: MenuItem) => {
                item.setTitle(strings.contextMenu.folder.createFolderNote)
                    .setIcon('lucide-pen-box')
                    .onClick(async () => {
                        // Helper function to create a folder note with a specific type
                        const createNote = async (folderNoteType: 'markdown' | 'canvas' | 'base') => {
                            const createdNote = await createFolderNote(
                                app,
                                folder,
                                {
                                    folderNoteType,
                                    folderNoteName: settings.folderNoteName,
                                    folderNoteProperties: settings.folderNoteProperties
                                },
                                services.commandQueue
                            );
                            if (createdNote && settings.pinCreatedFolderNote) {
                                try {
                                    if (!metadataService.isFilePinned(createdNote.path, 'folder')) {
                                        await metadataService.togglePin(createdNote.path, 'folder');
                                    }
                                } catch (error) {
                                    console.error('Failed to pin created folder note', {
                                        path: createdNote.path,
                                        error
                                    });
                                }
                            }
                        };

                        // If "ask" is selected, show modal to choose type
                        if (settings.folderNoteType === 'ask') {
                            const { FolderNoteTypeModal } = await import('../../modals/FolderNoteTypeModal');
                            const modal = new FolderNoteTypeModal(app, async selectedType => {
                                await createNote(selectedType);
                            });
                            modal.open();
                        } else {
                            // Otherwise, use the default type from settings
                            await createNote(settings.folderNoteType);
                        }
                    });
            });
        }
    }

    // Only show icon options if folder icons are enabled
    if (settings.showIcons) {
        menu.addSeparator();

        // Change icon
        menu.addItem((item: MenuItem) => {
            item.setTitle(strings.contextMenu.folder.changeIcon)
                .setIcon('lucide-image')
                .onClick(async () => {
                    const { IconPickerModal } = await import('../../modals/IconPickerModal');
                    const modal = new IconPickerModal(app, metadataService, folder.path, ItemType.FOLDER);
                    modal.open();
                });
        });
    }

    // Change color
    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.changeColor)
            .setIcon('lucide-palette')
            .onClick(async () => {
                const { ColorPickerModal } = await import('../../modals/ColorPickerModal');
                const modal = new ColorPickerModal(app, metadataService, folder.path, ItemType.FOLDER, 'foreground');
                modal.open();
            });
    });

    // Change background color
    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.changeBackground)
            .setIcon('lucide-paint-bucket')
            .onClick(async () => {
                const { ColorPickerModal } = await import('../../modals/ColorPickerModal');
                const modal = new ColorPickerModal(app, metadataService, folder.path, ItemType.FOLDER, 'background');
                modal.open();
            });
    });

    menu.addSeparator();

    // Hide folder (not available for root folder or already hidden folders)
    if (folder.path !== '/') {
        // Check if folder is already excluded using proper wildcard pattern matching
        const excludedPatterns = services.plugin.settings.excludedFolders;
        const isExcluded = isFolderInExcludedFolder(folder, excludedPatterns);

        // Only show "Hide folder" if not already excluded
        if (!isExcluded) {
            menu.addItem((item: MenuItem) => {
                item.setTitle(strings.contextMenu.folder.excludeFolder)
                    .setIcon('lucide-eye-off')
                    .onClick(async () => {
                        const currentExcluded = services.plugin.settings.excludedFolders;
                        // Ensure path starts with / for path-based exclusion
                        // Obsidian folder paths don't start with /, so we add it
                        const folderPath = folder.path.startsWith('/') ? folder.path : `/${folder.path}`;

                        // Clean up redundant patterns and add the new one
                        const cleanedPatterns = cleanupExclusionPatterns(currentExcluded, folderPath);

                        services.plugin.settings.excludedFolders = cleanedPatterns;
                        await services.plugin.saveSettingsAndUpdate();

                        new Notice(strings.fileSystem.notices.excludedFolder.replace('{name}', folder.name));
                    });
            });
        }
    }

    // Rename folder
    menu.addItem((item: MenuItem) => {
        item.setTitle(strings.contextMenu.folder.renameFolder)
            .setIcon('lucide-pencil')
            .onClick(async () => {
                // Handle root folder rename differently
                if (folder.path === '/') {
                    const { InputModal } = await import('../../modals/InputModal');
                    const modal = new InputModal(
                        app,
                        strings.modals.fileSystem.renameVaultTitle,
                        strings.modals.fileSystem.renameVaultPrompt,
                        async newName => {
                            // Update custom vault name setting (allow empty string)
                            services.plugin.settings.customVaultName = newName;
                            await services.plugin.saveSettingsAndUpdate();
                        },
                        settings.customVaultName
                    );
                    modal.open();
                } else {
                    await fileSystemOps.renameFolder(folder, settings);
                }
            });
    });

    // Move folder (not available for vault root)
    if (folder.path !== '/') {
        menu.addItem((item: MenuItem) => {
            item.setTitle(strings.contextMenu.folder.moveFolder)
                .setIcon('lucide-folder-input')
                .onClick(async () => {
                    // Open modal to select destination folder for move operation
                    const moveResult = await fileSystemOps.moveFolderWithModal(folder);
                    if (!moveResult) {
                        return;
                    }

                    const { oldPath, newPath, targetFolder } = moveResult;
                    // Verify the moved folder exists at new location
                    const movedEntry = app.vault.getAbstractFileByPath(newPath);
                    if (!movedEntry || !(movedEntry instanceof TFolder)) {
                        return;
                    }

                    // Update selection if the moved folder was selected
                    const selectedFolder = selectionState.selectedFolder;
                    if (selectedFolder === folder) {
                        selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder: movedEntry });
                    }

                    // Update expansion state for all moved folders and their descendants
                    const updatedExpanded = new Set<string>();
                    const oldPrefix = `${oldPath}/`;

                    expandedFolders.forEach(path => {
                        // Update path for the moved folder itself
                        if (path === oldPath) {
                            updatedExpanded.add(newPath);
                            return;
                        }

                        // Update paths for descendants of the moved folder
                        if (path.startsWith(oldPrefix)) {
                            const suffix = path.substring(oldPrefix.length);
                            const updatedPath = suffix.length > 0 ? `${newPath}/${suffix}` : newPath;
                            updatedExpanded.add(updatedPath);
                            return;
                        }

                        // Keep paths for folders not affected by the move
                        updatedExpanded.add(path);
                    });

                    // Expand the destination folder to show the moved folder
                    const parentPath = targetFolder.path;
                    if (parentPath !== '/' && !updatedExpanded.has(parentPath)) {
                        updatedExpanded.add(parentPath);
                    }

                    expansionDispatch({ type: 'SET_EXPANDED_FOLDERS', folders: updatedExpanded });
                });
        });
    }

    // Delete folder (not available for vault root)
    if (folder.path !== '/') {
        menu.addItem((item: MenuItem) => {
            item.setTitle(strings.contextMenu.folder.deleteFolder)
                .setIcon('lucide-trash')
                .onClick(async () => {
                    const parentFolder = folder.parent;

                    await fileSystemOps.deleteFolder(folder, settings.confirmBeforeDelete, () => {
                        // Check if we need to update selection
                        if (selectionState.selectedFolder) {
                            const isSelectedFolderDeleted = folder.path === selectionState.selectedFolder.path;
                            const isAncestorDeleted = isFolderAncestor(folder, selectionState.selectedFolder);

                            if (isSelectedFolderDeleted || isAncestorDeleted) {
                                // If parent exists and is not root (or root is visible), select it
                                if (parentFolder && (parentFolder.path !== '/' || settings.showRootFolder)) {
                                    selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder: parentFolder });
                                } else {
                                    // Clear selection if no valid parent
                                    selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder: null });
                                }
                            }
                        }
                    });
                });
        });
    }
}
