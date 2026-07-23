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

import { FileSystemAdapter, MenuItem, Platform, TFolder, TFile } from 'obsidian';
import { FolderMenuBuilderParams } from './menuTypes';
import { strings } from '../../i18n';
import { showNotice } from '../noticeUtils';
import { executeCommand, getInternalPlugin, isFolderAncestor, isPluginInstalled } from '../../utils/typeGuards';
import { getFolderNote, createFolderNote } from '../../utils/folderNotes';
import {
    cleanupExclusionPatterns,
    hasSubfolders,
    isFolderInExcludedFolder,
    shouldExcludeFolderFromDescendants
} from '../../utils/fileFilters';
import { ItemType } from '../../types';
import { addCopyPathSubmenu, setAsyncOnClick, tryCreateSubmenu } from './menuAsyncHelpers';
import { addShortcutRenameMenuItem } from './shortcutRenameMenuItem';
import { resolveNavigationFolderIcon, resolveUXIconForMenu } from '../uxIcons';
import {
    getActiveHiddenFolders,
    getActiveVaultProfile,
    getHiddenFolderPatternMatch,
    normalizeHiddenFolderPath
} from '../../utils/vaultProfiles';
import { casefold } from '../../utils/recordUtils';
import { EXCALIDRAW_PLUGIN_ID, TLDRAW_PLUGIN_ID } from '../../constants/pluginIds';
import { addFolderStyleChangeActions, addFolderStyleMenu } from './styleMenuBuilder';
import { getTemplaterCreateNewNoteFromTemplate } from '../templaterIntegration';
import { resolveFolderDisplayName } from '../folderDisplayName';
import { INTERNAL_NOTEBOOK_NAVIGATOR_API } from '../../api/NotebookNavigatorAPI';
import { expandNavigationTreeItems, getFolderAncestorPaths } from '../navigationExpansion';

/**
 * Adds folder creation commands (new note/folder/canvas/base/drawing) to a menu.
 */
export function buildFolderCreationMenu(params: FolderMenuBuilderParams, folderDisplayNameOverride?: string): void {
    const { folder, menu, services, state, dispatchers, settings } = params;
    const { app, fileSystemOps, metadataService, plugin } = services;
    const { selectionState, expandedFolders } = state;
    const { selectionDispatch, expansionDispatch, uiDispatch } = dispatchers;
    const folderDisplayName =
        folderDisplayNameOverride ??
        resolveFolderDisplayName({
            app,
            metadataService,
            settings,
            folderPath: folder.path,
            fallbackName: folder.name
        });

    const ensureFolderSelected = (): boolean => {
        if (
            selectionState.selectionType === ItemType.FOLDER &&
            selectionState.selectedFolder &&
            selectionState.selectedFolder.path === folder.path
        ) {
            return false;
        }

        selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder });
        return true;
    };

    // Selects newly created file and switches focus to files pane
    const handleFileCreation = (file: TFile | null | undefined) => {
        if (!file) {
            return;
        }

        // Select the newly created file in the list
        selectionDispatch({ type: 'SET_SELECTED_FILE', file });
        // Switch focus to the files pane to show the selection
        uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
    };

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.newNote).setIcon('lucide-pen-box'), async () => {
            const selectionChanged = ensureFolderSelected();
            const manualSortContext = await fileSystemOps.getManualSortNewFileContextForTarget('folder', folder.path, {
                waitForSelectionUpdate: selectionChanged
            });
            const createdFile = await fileSystemOps.createNewFile(folder, params.settings.createNewNotesInNewTab, manualSortContext);
            handleFileCreation(createdFile);
        });
    });

    const createNewNoteFromTemplate = getTemplaterCreateNewNoteFromTemplate(app);
    if (createNewNoteFromTemplate) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.folder.newNoteFromTemplate).setIcon('templater-icon'), () => {
                ensureFolderSelected();
                return createNewNoteFromTemplate(folder);
            });
        });
    }

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.newFolder).setIcon('lucide-folder-plus'), async () => {
            ensureFolderSelected();
            await fileSystemOps.createNewFolder(folder, () => {
                if (!expandedFolders.has(folder.path)) {
                    const folderPaths = settings.collapseOtherBranchesOnExpand
                        ? [...getFolderAncestorPaths(folder), folder.path]
                        : [folder.path];
                    expandNavigationTreeItems({
                        type: 'folder',
                        ids: folderPaths,
                        collapseOtherBranches: settings.collapseOtherBranchesOnExpand,
                        dispatch: expansionDispatch
                    });
                }
            });
        });
    });

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.newCanvas).setIcon('lucide-layout-grid'), async () => {
            ensureFolderSelected();
            const createdCanvas = await fileSystemOps.createCanvas(folder);
            handleFileCreation(createdCanvas);
        });
    });

    const basesPlugin = getInternalPlugin(app, 'bases');
    if (basesPlugin?.enabled) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.folder.newBase).setIcon('lucide-database'), async () => {
                ensureFolderSelected();
                const createdBase = await fileSystemOps.createBase(folder);
                handleFileCreation(createdBase);
            });
        });
    }

    // Collect available drawing plugins to determine menu structure
    const hasExcalidraw = isPluginInstalled(app, EXCALIDRAW_PLUGIN_ID);
    const hasTldraw = isPluginInstalled(app, TLDRAW_PLUGIN_ID);
    const hasBothDrawingPlugins = hasExcalidraw && hasTldraw;

    if (hasExcalidraw) {
        menu.addItem((item: MenuItem) => {
            const label = hasBothDrawingPlugins ? strings.contextMenu.folder.newExcalidrawDrawing : strings.contextMenu.folder.newDrawing;
            setAsyncOnClick(item.setTitle(label).setIcon('excalidraw-icon'), async () => {
                ensureFolderSelected();
                const createdDrawing = await fileSystemOps.createNewDrawing(folder, 'excalidraw');
                handleFileCreation(createdDrawing);
            });
        });
    }

    if (hasTldraw) {
        menu.addItem((item: MenuItem) => {
            const label = hasBothDrawingPlugins ? strings.contextMenu.folder.newTldrawDrawing : strings.contextMenu.folder.newDrawing;
            setAsyncOnClick(item.setTitle(label).setIcon('lucide-pencil'), async () => {
                ensureFolderSelected();
                const createdDrawing = await fileSystemOps.createNewDrawing(folder, 'tldraw');
                handleFileCreation(createdDrawing);
            });
        });
    }

    // Folder note operations
    if (settings.enableFolderNotes) {
        const folderNote = getFolderNote(folder, settings);
        const canDeleteFolderNote = Boolean(folderNote);
        const canCreateFolderNote = !folderNote;

        if (canDeleteFolderNote || canCreateFolderNote) {
            menu.addSeparator();
        }

        if (folderNote) {
            // Detach folder note option
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.folder.detachFolderNote).setIcon('lucide-unlink'), async () => {
                    await fileSystemOps.renameFile(folderNote);
                });
            });

            // Delete folder note option
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(
                    item.setTitle(strings.contextMenu.folder.deleteFolderNote).setIcon('lucide-trash').setWarning(true),
                    async () => {
                        await fileSystemOps.deleteFile(folderNote, settings.confirmBeforeDelete);
                    }
                );
            });
        } else if (canCreateFolderNote) {
            // Create folder note option
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.folder.createFolderNote).setIcon('lucide-pen-box'), async () => {
                    ensureFolderSelected();
                    const createdNote = await createFolderNote(
                        app,
                        folder,
                        {
                            folderNoteType: settings.folderNoteType,
                            folderNoteName: settings.folderNoteName,
                            folderNoteNamePattern: settings.folderNoteNamePattern,
                            folderNoteTemplate: settings.folderNoteTemplate
                        },
                        services.commandQueue,
                        {
                            folderDisplayName,
                            openContext: settings.folderNoteOpenLocation === 'right-sidebar' ? 'right-sidebar' : null,
                            openInRightSidebar: folderNote => plugin.openFolderNoteInRightSidebar(folderNote)
                        }
                    );
                    handleFileCreation(createdNote);
                    if (createdNote && settings.pinCreatedFolderNote) {
                        try {
                            if (!metadataService.isFilePinned(createdNote.path, 'folder')) {
                                await metadataService.togglePin(createdNote.path, 'folder');
                            }
                        } catch (error: unknown) {
                            console.error('Failed to pin created folder note', {
                                path: createdNote.path,
                                error
                            });
                        }
                    }
                });
            });
        }
    }
}

/**
 * Builds the context menu for a folder
 */
export function buildFolderMenu(params: FolderMenuBuilderParams): void {
    const { folder, menu, services, settings, state, dispatchers, options } = params;
    const { app, fileSystemOps, metadataService, plugin } = services;
    const { selectionState, expandedFolders } = state;
    const { selectionDispatch, expansionDispatch } = dispatchers;
    const folderDisplayName = resolveFolderDisplayName({
        app,
        metadataService,
        settings,
        folderPath: folder.path,
        fallbackName: folder.name
    });

    // Show folder name on mobile
    if (services.isMobile) {
        menu.addItem((item: MenuItem) => {
            item.setTitle(folderDisplayName).setIsLabel(true);
        });
    }

    buildFolderCreationMenu(params, folderDisplayName);

    menu.addSeparator();

    // Customization options: icon, color, background, separator
    addFolderStyleChangeActions({
        menu,
        app,
        metadataService,
        folderPath: folder.path,
        showFolderIcons: settings.showFolderIcons,
        defaultIcon: resolveNavigationFolderIcon({
            interfaceIcons: settings.interfaceIcons,
            isRoot: folder.path === '/',
            hasChildren: hasSubfolders(folder, getActiveHiddenFolders(settings), services.visibility.showHiddenItems),
            isExpanded: expandedFolders.has(folder.path)
        })
    });

    addFolderStyleMenu({
        menu,
        metadataService,
        folderPath: folder.path,
        inheritFolderColors: settings.inheritFolderColors,
        showFolderIcons: settings.showFolderIcons
    });

    // Child folder sort order
    if (typeof MenuItem.prototype.setSubmenu === 'function') {
        menu.addSeparator();

        menu.addItem((item: MenuItem) => {
            const currentOverride = metadataService.getFolderChildSortOrderOverride(folder.path);
            const effectiveOrder = currentOverride ?? settings.folderSortOrder;
            const sortIcon = currentOverride
                ? effectiveOrder === 'alpha-desc'
                    ? 'lucide-sort-desc'
                    : 'lucide-sort-asc'
                : 'lucide-sliders-horizontal';

            const sortOrderSubmenu = tryCreateSubmenu(item);
            if (!sortOrderSubmenu) {
                item.setTitle(strings.paneHeader.changeChildSortOrder).setIcon(sortIcon).setDisabled(true);
                return;
            }

            const globalDefaultLabel =
                settings.folderSortOrder === 'alpha-desc'
                    ? strings.settings.items.folderSortOrder.options.alphaDesc
                    : strings.settings.items.folderSortOrder.options.alphaAsc;

            item.setTitle(strings.paneHeader.changeChildSortOrder).setIcon(sortIcon);

            sortOrderSubmenu.addItem(subItem => {
                subItem.setTitle(`${strings.folderAppearance.defaultLabel} (${globalDefaultLabel})`).setChecked(!currentOverride);
                setAsyncOnClick(subItem, async () => {
                    await metadataService.removeFolderChildSortOrderOverride(folder.path);
                    app.workspace.requestSaveLayout();
                });
            });

            sortOrderSubmenu.addSeparator();

            sortOrderSubmenu.addItem(subItem => {
                subItem.setTitle(strings.settings.items.folderSortOrder.options.alphaAsc).setChecked(currentOverride === 'alpha-asc');
                setAsyncOnClick(subItem, async () => {
                    await metadataService.setFolderChildSortOrderOverride(folder.path, 'alpha-asc');
                    app.workspace.requestSaveLayout();
                });
            });

            sortOrderSubmenu.addItem(subItem => {
                subItem.setTitle(strings.settings.items.folderSortOrder.options.alphaDesc).setChecked(currentOverride === 'alpha-desc');
                setAsyncOnClick(subItem, async () => {
                    await metadataService.setFolderChildSortOrderOverride(folder.path, 'alpha-desc');
                    app.workspace.requestSaveLayout();
                });
            });
        });
    }

    const folderSeparatorTarget = { type: 'folder', path: folder.path } as const;
    const hasSeparator = metadataService.hasNavigationSeparator(folderSeparatorTarget);
    const disableNavigationSeparatorActions = Boolean(options?.disableNavigationSeparatorActions);

    menu.addSeparator();

    // Add to shortcuts / Remove from shortcuts
    if (services.shortcuts) {
        const { folderShortcutKeysByPath, addFolderShortcut, removeShortcut, renameShortcut, shortcutMap } = services.shortcuts;
        const existingShortcutKey = folderShortcutKeysByPath.get(folder.path);

        if (existingShortcutKey) {
            const existingShortcut = shortcutMap.get(existingShortcutKey);
            const defaultLabel = folderDisplayName;

            addShortcutRenameMenuItem({
                app,
                menu,
                shortcutKey: existingShortcutKey,
                defaultLabel,
                existingShortcut,
                title: strings.shortcuts.rename,
                placeholder: strings.searchInput.shortcutNamePlaceholder,
                renameShortcut
            });
        }

        menu.addItem((item: MenuItem) => {
            if (existingShortcutKey) {
                setAsyncOnClick(
                    item
                        .setTitle(strings.shortcuts.remove)
                        .setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'nav-shortcuts', 'lucide-star-off')),
                    async () => {
                        await removeShortcut(existingShortcutKey);
                    }
                );
            } else {
                setAsyncOnClick(
                    item
                        .setTitle(strings.shortcuts.add)
                        .setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'nav-shortcuts', 'lucide-star')),
                    async () => {
                        await addFolderShortcut(folder.path);
                    }
                );
            }
        });
    }

    if (!disableNavigationSeparatorActions) {
        menu.addItem((item: MenuItem) => {
            const title = hasSeparator ? strings.contextMenu.navigation.removeSeparator : strings.contextMenu.navigation.addSeparator;
            setAsyncOnClick(item.setTitle(title).setIcon('lucide-separator-horizontal'), async () => {
                if (hasSeparator) {
                    await metadataService.removeNavigationSeparator(folderSeparatorTarget);
                    return;
                }
                await metadataService.addNavigationSeparator(folderSeparatorTarget);
            });
        });
    }

    menu.addSeparator();

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

    if (folder.path === '/') {
        menu.addItem((item: MenuItem) => {
            item.setTitle(strings.commands.navigateToFolder)
                .setIcon('lucide-folder')
                .onClick(() => {
                    executeCommand(app, `${plugin.manifest.id}:navigate-to-folder`);
                });
        });
    }

    menu.addSeparator();

    // Copy actions
    const adapter = app.vault.adapter;
    const fileSystemAdapter = adapter instanceof FileSystemAdapter ? adapter : null;
    const addedCopyMenu = addCopyPathSubmenu({
        menu,
        getVaultPath: () => folder.path,
        getSystemPath: fileSystemAdapter ? () => fileSystemAdapter.getFullPath(folder.path) : undefined
    });

    if (addedCopyMenu) {
        menu.addSeparator();
    }

    // Reveal in system explorer - desktop only
    if (!services.isMobile) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(
                item
                    .setTitle(fileSystemOps.getRevealInSystemExplorerText())
                    .setIcon(Platform.isMacOS ? 'lucide-app-window-mac' : 'lucide-app-window'),
                async () => {
                    await fileSystemOps.revealInSystemExplorer(folder);
                }
            );
        });

        menu.addSeparator();
    }

    const addedMenuExtensions =
        services.plugin.api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].menus.applyFolderMenuExtensions({ menu, folder }) ?? 0;
    if (addedMenuExtensions > 0) {
        menu.addSeparator();
    }

    // Hide/Unhide folder (not available for root folder)
    if (folder.path !== '/') {
        // Get the active vault profile to access its hidden folder patterns
        const activeProfile = getActiveVaultProfile(services.plugin.settings);
        const excludedPatterns = activeProfile.hiddenFolders;
        const isExcluded = isFolderInExcludedFolder(folder, excludedPatterns);
        const normalizedFolderPath = casefold(normalizeHiddenFolderPath(folder.path));
        const matchingHiddenPattern = excludedPatterns.find(pattern => {
            const match = getHiddenFolderPatternMatch(pattern);
            return Boolean(match && casefold(match.normalizedPrefix) === normalizedFolderPath);
        });

        if (matchingHiddenPattern) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.folder.unhideFolder).setIcon('lucide-eye'), async () => {
                    const currentExcluded = activeProfile.hiddenFolders;
                    activeProfile.hiddenFolders = currentExcluded.filter(pattern => pattern !== matchingHiddenPattern);
                    await services.plugin.saveSettingsAndUpdate();

                    showNotice(strings.fileSystem.notices.showFolder.replace('{name}', folderDisplayName), { variant: 'success' });
                });
            });
        } else if (!isExcluded) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.folder.excludeFolder).setIcon('lucide-eye-off'), async () => {
                    const currentExcluded = activeProfile.hiddenFolders;
                    // Ensure path starts with / for path-based exclusion
                    // Obsidian folder paths don't start with /, so we add it
                    const folderPath = folder.path.startsWith('/') ? folder.path : `/${folder.path}`;

                    // Clean up redundant patterns and add the new one
                    const cleanedPatterns = cleanupExclusionPatterns(currentExcluded, folderPath);

                    activeProfile.hiddenFolders = cleanedPatterns;
                    await services.plugin.saveSettingsAndUpdate();

                    showNotice(strings.fileSystem.notices.hideFolder.replace('{name}', folderDisplayName), { variant: 'success' });
                });
            });
        }

        const descendantExcludedPatterns = activeProfile.descendantExcludedFolders;
        const isExcludedFromDescendants =
            descendantExcludedPatterns.length > 0 &&
            shouldExcludeFolderFromDescendants(folder.name, descendantExcludedPatterns, folder.path);
        // Exact-path patterns for this folder; the form the "hide from parents" action writes
        const exactDescendantExcludedPatterns = descendantExcludedPatterns.filter(pattern => {
            const trimmed = pattern.trim();
            return (
                trimmed.startsWith('/') && !trimmed.includes('*') && casefold(normalizeHiddenFolderPath(trimmed)) === normalizedFolderPath
            );
        });
        const remainingDescendantExcludedPatterns = descendantExcludedPatterns.filter(
            pattern => !exactDescendantExcludedPatterns.includes(pattern)
        );
        // Only offer "show in parents" when removing the exact-path patterns actually un-excludes the folder.
        // Folders excluded through name or wildcard patterns are managed in settings, matching the hidden-folder menu.
        const canRemoveDescendantExclusion =
            exactDescendantExcludedPatterns.length > 0 &&
            !shouldExcludeFolderFromDescendants(folder.name, remainingDescendantExcludedPatterns, folder.path);

        if (canRemoveDescendantExclusion) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.folder.includeInDescendants).setIcon('lucide-list-plus'), async () => {
                    activeProfile.descendantExcludedFolders = activeProfile.descendantExcludedFolders.filter(
                        pattern => !exactDescendantExcludedPatterns.includes(pattern)
                    );
                    await services.plugin.saveSettingsAndUpdate();

                    showNotice(strings.fileSystem.notices.folderIncludedInDescendants.replace('{name}', folderDisplayName), {
                        variant: 'success'
                    });
                });
            });
        } else if (!isExcludedFromDescendants) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.folder.excludeFromDescendants).setIcon('lucide-list-minus'), async () => {
                    const folderPath = folder.path.startsWith('/') ? folder.path : `/${folder.path}`;
                    activeProfile.descendantExcludedFolders = Array.from(new Set([...activeProfile.descendantExcludedFolders, folderPath]));
                    await services.plugin.saveSettingsAndUpdate();

                    showNotice(strings.fileSystem.notices.folderExcludedFromDescendants.replace('{name}', folderDisplayName), {
                        variant: 'success'
                    });
                });
            });
        }
    }

    menu.addItem((item: MenuItem) => {
        const menuItem = item.setTitle(strings.contextMenu.folder.renameFolder).setIcon('lucide-pencil');
        const startInlineRename = options?.onStartInlineRename;

        setAsyncOnClick(menuItem, async () => {
            if (startInlineRename?.(folder)) {
                return;
            }

            await fileSystemOps.renameFolder(folder, settings);
        });
    });

    // Move folder (not available for vault root)
    if (folder.path !== '/') {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.folder.moveFolder).setIcon('lucide-folder-input'), async () => {
                // Open modal to select destination folder for move operation
                const moveResult = await fileSystemOps.moveFolderWithModal(folder);
                if (moveResult.status !== 'success') {
                    return;
                }

                const { oldPath, newPath, targetFolder } = moveResult.data;
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

    // Duplicate folder
    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.duplicateFolder).setIcon('lucide-copy'), async () => {
            await fileSystemOps.duplicateFolder(folder);
        });
    });

    // Delete folder (not available for vault root)
    if (folder.path !== '/') {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.folder.deleteFolder).setIcon('lucide-trash').setWarning(true), async () => {
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
