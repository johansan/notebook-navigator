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

import { Menu, MenuItem, TFile, TFolder, App, Platform, FileSystemAdapter } from 'obsidian';
import { FileMenuBuilderParams } from './menuTypes';
import { strings } from '../../i18n';
import { getInternalPlugin } from '../../utils/typeGuards';
import { getFileDisplayName } from '../../utils/fileNameUtils';
import { FILE_VISIBILITY, getExtensionSuffix, shouldDisplayFile, shouldShowExtensionSuffix } from '../../utils/fileTypeUtils';
import { NavigatorContext } from '../../types';
import { ShortcutType } from '../../types/shortcuts';
import { MetadataService } from '../../services/MetadataService';
import { FileSystemOperations } from '../../services/FileSystemService';
import { SelectionState, SelectionAction } from '../../context/SelectionContext';
import type { ShortcutsContextValue } from '../../context/ShortcutsContext';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { CommandQueueService } from '../../services/CommandQueueService';
import { addCopyPathSubmenu, setAsyncOnClick, tryCreateSubmenu } from './menuAsyncHelpers';
import { addShortcutRenameMenuItem } from './shortcutRenameMenuItem';
import { openFileInContext } from '../openFileInContext';
import { confirmRemoveAllTagsFromFiles, openAddTagToFilesModal, removeTagFromFilesWithPrompt } from '../tagModalHelpers';
import { addFolderStyleChangeActions, addFolderStyleMenu, addStyleMenu } from './styleMenuBuilder';
import { resolveIconForMenu, resolveUXIconForMenu } from '../uxIcons';
import { isFolderNote } from '../../utils/folderNoteLookup';
import { getFilesForNavigationSelection, getNavigatorPinContext, orderFilesByReference } from '../selectionUtils';
import { collectFileMenuPropertyActions, type FileMenuPropertyAction } from '../../utils/propertyMenuActions';
import { INTERNAL_NOTEBOOK_NAVIGATOR_API } from '../../api/NotebookNavigatorAPI';
import { getManualSortGroupHeaderPropertyKey } from '../manualSort';
import { getEffectiveListSort, isManualSortPropertyKey } from '../sortUtils';
import { addManualSortGroupHeaderMenuItems } from './manualSortGroupHeaderMenuItems';
import { addMergeNotesMenuItem } from './mergeNotesMenuItems';
import { resolveEffectiveListGroupingForSort, resolveListGrouping } from '../listGrouping';
import { resolveFileIconId } from '../fileIconUtils';

type FileStyleTarget = { type: 'folder'; folderPath: string } | { type: 'files'; files: TFile[] };

interface ResolveFileStyleTargetParams {
    file: TFile;
    isFolderNoteFile: boolean;
    shouldShowMultiOptions: boolean;
    selectedFiles: TFile[];
}

interface AddStyleActionsForFileContextParams {
    menu: Menu;
    app: App;
    metadataService: MetadataService;
    settings: NotebookNavigatorSettings;
    file: TFile;
    styleTarget: FileStyleTarget;
}

interface FileStyleActionsParams {
    menu: Menu;
    app: App;
    metadataService: MetadataService;
    settings: NotebookNavigatorSettings;
    file: TFile;
    targetFiles: TFile[];
}

interface FolderStyleActionsParams {
    menu: Menu;
    app: App;
    metadataService: MetadataService;
    settings: NotebookNavigatorSettings;
    folderPath: string;
}

interface FileStyleRemovalAvailability {
    hasRemovableIcon: boolean;
    hasRemovableColor: boolean;
    hasRemovableBackground: boolean;
}

interface AddManualSortGroupHeaderActionParams {
    menu: Menu;
    app: App;
    metadataService: MetadataService;
    settings: NotebookNavigatorSettings;
    file: TFile;
    source: NonNullable<FileMenuBuilderParams['options']>['source'] | undefined;
    selectionState: SelectionState;
    shouldShowMultiOptions: boolean;
}

/**
 * Resolves an icon for a file-menu property action.
 */
function resolveFileMenuPropertyActionIcon(
    settings: NotebookNavigatorSettings,
    metadataService: MetadataService,
    action: FileMenuPropertyAction
): string {
    const valueIcon = metadataService.getPropertyIcon(action.nodeId);
    const menuValueIcon = resolveIconForMenu(valueIcon);
    if (menuValueIcon) {
        return menuValueIcon;
    }

    const keyIcon = metadataService.getPropertyIcon(action.keyNodeId);
    const menuKeyIcon = resolveIconForMenu(keyIcon);
    if (menuKeyIcon) {
        return menuKeyIcon;
    }

    return resolveUXIconForMenu(settings.interfaceIcons, 'nav-property-value', 'lucide-equal');
}

/**
 * Builds the context menu for a file
 */
export function buildFileMenu(params: FileMenuBuilderParams): void {
    const { file, menu, services, settings, state, dispatchers, options } = params;
    const { app, isMobile, fileSystemOps, metadataService, tagTreeService, propertyTreeService, commandQueue, visibility } = services;
    const { selectionState } = state;
    const { selectionDispatch } = dispatchers;

    // Show file name on mobile
    if (isMobile) {
        menu.addItem((item: MenuItem) => {
            item.setTitle(file.basename).setIsLabel(true);
        });
    }

    // Check if multiple files are selected
    const selectedCount = selectionState.selectedFiles.size;
    const isMultipleSelected = selectedCount > 1;
    const isFileSelected = selectionState.selectedFiles.has(file.path);

    // Determine if this is a markdown file
    const isMarkdown = file.extension === 'md';

    // If right-clicking on an unselected file while having multi-selection,
    // treat it as a single file operation
    const shouldShowMultiOptions = isMultipleSelected && isFileSelected;
    const isFolderNoteFile =
        !shouldShowMultiOptions &&
        settings.enableFolderNotes &&
        file.parent instanceof TFolder &&
        isFolderNote(file, file.parent, settings);

    let cachedFileList: TFile[] | null = null;
    const getCachedFileList = (): TFile[] => {
        if (cachedFileList) {
            return cachedFileList;
        }

        if (
            options?.orderedFiles?.some(orderedFile => orderedFile.path === file.path || selectionState.selectedFiles.has(orderedFile.path))
        ) {
            cachedFileList = [...options.orderedFiles];
            return cachedFileList;
        }

        cachedFileList = getFilesForNavigationSelection(
            {
                selectionType: selectionState.selectionType,
                selectedFolder: selectionState.selectedFolder,
                selectedTag: selectionState.selectedTag,
                selectedProperty: selectionState.selectedProperty
            },
            settings,
            visibility,
            app,
            tagTreeService,
            propertyTreeService
        );

        return cachedFileList;
    };

    // Cache selected files to avoid repeated path-to-file conversions
    const cachedSelectedFiles = shouldShowMultiOptions
        ? resolveSelectedFilesInOrder(selectionState.selectedFiles, app, options?.orderedFiles)
        : [];
    const selectedFilesCount = cachedSelectedFiles.length;

    // Open options - show for single or multiple selection
    if (!shouldShowMultiOptions) {
        addSingleFileOpenOptions(menu, file, app, isMobile, commandQueue);
    } else {
        addMultipleFilesOpenOptions(menu, cachedSelectedFiles, app, isMobile, commandQueue);
    }

    menu.addSeparator();

    const styleTarget = resolveFileStyleTarget({
        file,
        isFolderNoteFile,
        shouldShowMultiOptions,
        selectedFiles: cachedSelectedFiles
    });
    addStyleActionsForFileContext({
        menu,
        app,
        metadataService,
        settings,
        file,
        styleTarget
    });

    menu.addSeparator();

    if (
        addManualSortGroupHeaderAction({
            menu,
            app,
            metadataService,
            settings,
            file,
            source: options?.source,
            selectionState,
            shouldShowMultiOptions
        })
    ) {
        menu.addSeparator();
    }

    const filesForTagOps = shouldShowMultiOptions ? cachedSelectedFiles : [file];
    // Only show tag operations if all files are markdown (tags only work with markdown)
    const canManageTags = filesForTagOps.length > 0 && filesForTagOps.every(f => f.extension === 'md');

    if (canManageTags) {
        // Tag operations
        // Check if files have tags
        const existingTags = services.tagOperations.getTagsFromFiles(filesForTagOps);
        const hasTags = existingTags.length > 0;
        const hasMultipleTags = existingTags.length > 1;

        // Add tag - shown when every selected file supports frontmatter
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.file.addTag).setIcon('lucide-tag'), () => {
                openAddTagToFilesModal({
                    app,
                    plugin: services.plugin,
                    tagOperations: services.tagOperations,
                    files: filesForTagOps
                });
            });
        });

        const propertyActions = collectFileMenuPropertyActions(settings, propertyTreeService);
        if (propertyActions.length > 0) {
            menu.addItem((item: MenuItem) => {
                const submenu = tryCreateSubmenu(item);
                item.setTitle(strings.contextMenu.file.addPropertyKey).setIcon(
                    resolveUXIconForMenu(settings.interfaceIcons, 'nav-property', 'lucide-align-left')
                );
                if (!submenu) {
                    item.setDisabled(true);
                    return;
                }

                propertyActions.forEach(action => {
                    submenu.addItem(subItem => {
                        const configuredItem = subItem.setTitle(action.label);
                        configuredItem.setIcon(resolveFileMenuPropertyActionIcon(settings, metadataService, action));

                        setAsyncOnClick(configuredItem, async () => {
                            await fileSystemOps.applyPropertyNodeToFiles(action.nodeId, filesForTagOps);
                        });
                    });
                });
            });
        }

        // Remove tag - only show if files have tags
        if (hasTags) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.file.removeTag).setIcon('lucide-minus'), async () => {
                    await removeTagFromFilesWithPrompt({
                        app,
                        tagOperations: services.tagOperations,
                        files: filesForTagOps
                    });
                });
            });

            // Remove all tags - only show if files have multiple tags
            if (hasMultipleTags) {
                menu.addItem((item: MenuItem) => {
                    setAsyncOnClick(item.setTitle(strings.contextMenu.file.removeAllTags).setIcon('lucide-x'), () => {
                        confirmRemoveAllTagsFromFiles({
                            app,
                            tagOperations: services.tagOperations,
                            files: filesForTagOps
                        });
                    });
                });
            }
        }

        menu.addSeparator();
    }

    // Add to shortcuts / Remove from shortcuts and Pin/Unpin - single selection only
    if (!shouldShowMultiOptions) {
        if (services.shortcuts) {
            const { noteShortcutKeysByPath, addNoteShortcut, removeShortcut, renameShortcut, shortcutMap } = services.shortcuts;
            const existingShortcutKey = noteShortcutKeysByPath.get(file.path);

            if (existingShortcutKey) {
                const existingShortcut = shortcutMap.get(existingShortcutKey);
                const defaultLabel = shouldShowExtensionSuffix(file)
                    ? `${getFileDisplayName(file)}${getExtensionSuffix(file)}`
                    : getFileDisplayName(file);

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
                            await addNoteShortcut(file.path);
                        }
                    );
                }
            });
        }

        const pinContext = getNavigatorPinContext(selectionState.selectionType);
        addSingleFilePinOption(menu, file, metadataService, pinContext);

        menu.addSeparator();
    }

    // Pin/Unpin for multiple files
    if (shouldShowMultiOptions) {
        if (services.shortcuts) {
            addMultipleFilesShortcutOption(menu, cachedSelectedFiles, selectionState, app, settings, services.shortcuts);
        }

        const pinContext = getNavigatorPinContext(selectionState.selectionType);
        addMultipleFilesPinOption(menu, cachedSelectedFiles, metadataService, pinContext);

        menu.addSeparator();

        const addedMenuExtensions =
            services.plugin.api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].menus.applyFileMenuExtensions({
                menu,
                file,
                selection: { mode: 'multiple', files: [...cachedSelectedFiles] }
            }) ?? 0;
        if (addedMenuExtensions > 0) {
            menu.addSeparator();
        }

        // Move, Duplicate, Delete - grouped together
        addMultipleFilesMergeOption(menu, cachedSelectedFiles, app, commandQueue, fileSystemOps);

        // Move note(s) to folder
        const allMarkdownForMove = cachedSelectedFiles.every(f => f.extension === 'md');
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(
                item
                    .setTitle(
                        allMarkdownForMove
                            ? strings.contextMenu.file.moveMultipleNotesToFolder.replace('{count}', selectedFilesCount.toString())
                            : strings.contextMenu.file.moveMultipleFilesToFolder.replace('{count}', selectedFilesCount.toString())
                    )
                    .setIcon('lucide-folder-input'),
                async () => {
                    // Re-resolve files at action time to handle sync deletions
                    const currentFiles = Array.from(selectionState.selectedFiles)
                        .map(path => app.vault.getFileByPath(path))
                        .filter((f): f is TFile => !!f);

                    await fileSystemOps.moveFilesWithModal(currentFiles, {
                        selectedFile: selectionState.selectedFile,
                        dispatch: selectionDispatch,
                        allFiles: getCachedFileList()
                    });
                }
            );
        });

        // Duplicate note(s)
        addMultipleFilesDuplicateOption(menu, cachedSelectedFiles, selectionState, app, fileSystemOps);

        // Delete note(s)
        addMultipleFilesDeleteOption(
            menu,
            cachedSelectedFiles,
            selectionState,
            settings,
            fileSystemOps,
            selectionDispatch,
            getCachedFileList
        );
    }

    // Copy actions - single selection only
    if (!shouldShowMultiOptions) {
        const adapter = app.vault.adapter;
        const fileSystemAdapter = adapter instanceof FileSystemAdapter ? adapter : null;
        const addedCopyMenu = addCopyPathSubmenu({
            menu,
            getObsidianUrl: () => {
                const vaultName = app.vault.getName();
                const encodedVault = encodeURIComponent(vaultName);
                const encodedFile = encodeURIComponent(file.path);
                return `obsidian://open?vault=${encodedVault}&file=${encodedFile}`;
            },
            getVaultPath: () => file.path,
            getSystemPath: fileSystemAdapter ? () => fileSystemAdapter.getFullPath(file.path) : undefined
        });

        if (addedCopyMenu) {
            menu.addSeparator();
        }
    }

    // Reveal options - single selection only
    if (!shouldShowMultiOptions) {
        // Check if file is already visible in the current folder view
        const isFileInSelectedFolder =
            selectionState.selectedFolder && file.parent && file.parent.path === selectionState.selectedFolder.path;
        // Only allow revealing in folder if file is not already visible
        const canRevealInFolder = !isFileInSelectedFolder;
        // System explorer reveal is desktop-only
        const canRevealInSystemExplorer = !isMobile;

        if (canRevealInFolder) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.file.revealInFolder).setIcon('lucide-folder-search'), async () => {
                    await services.plugin.activateView();
                    await services.plugin.revealFileInActualFolder(file, { showHiddenFileNotice: true });
                });
            });
        }

        if (canRevealInSystemExplorer) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(
                    item
                        .setTitle(fileSystemOps.getRevealInSystemExplorerText())
                        .setIcon(Platform.isMacOS ? 'lucide-app-window-mac' : 'lucide-app-window'),
                    async () => {
                        await fileSystemOps.revealInSystemExplorer(file);
                    }
                );
            });

            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.file.openInDefaultApp).setIcon('lucide-external-link'), async () => {
                    await fileSystemOps.openInDefaultApp(file);
                });
            });
        }

        if (canRevealInFolder || canRevealInSystemExplorer) {
            menu.addSeparator();
        }
    }

    if (!shouldShowMultiOptions) {
        const addedMenuExtensions =
            services.plugin.api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].menus.applyFileMenuExtensions({
                menu,
                file,
                selection: { mode: 'single', files: [file] }
            }) ?? 0;
        if (addedMenuExtensions > 0) {
            menu.addSeparator();
        }
    }

    // Open version history, Rename, Move, Duplicate, Delete - single selection only
    if (!shouldShowMultiOptions) {
        // Open version history (if Sync is enabled)
        const syncPlugin = getInternalPlugin(app, 'sync');
        if (syncPlugin && 'enabled' in syncPlugin && syncPlugin.enabled) {
            menu.addItem((item: MenuItem) => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.file.openVersionHistory).setIcon('lucide-history'), async () => {
                    await fileSystemOps.openVersionHistory(file);
                });
            });
        }

        menu.addItem((item: MenuItem) => {
            const title = isFolderNoteFile
                ? strings.contextMenu.folder.detachFolderNote
                : isMarkdown
                  ? strings.contextMenu.file.renameNote
                  : strings.contextMenu.file.renameFile;
            const iconId = isFolderNoteFile ? 'lucide-unlink' : 'lucide-pencil';
            const menuItem = item.setTitle(title).setIcon(iconId);
            const startInlineRename = isFolderNoteFile ? undefined : options?.onStartInlineRename;

            setAsyncOnClick(menuItem, async () => {
                if (startInlineRename?.(file)) {
                    return;
                }

                await fileSystemOps.renameFile(file);
            });
        });

        // Move to folder
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(
                item
                    .setTitle(isMarkdown ? strings.contextMenu.file.moveNoteToFolder : strings.contextMenu.file.moveFileToFolder)
                    .setIcon('lucide-folder-input'),
                async () => {
                    await fileSystemOps.moveFilesWithModal([file], {
                        selectedFile: selectionState.selectedFile,
                        dispatch: selectionDispatch,
                        allFiles: getCachedFileList()
                    });
                }
            );
        });

        // Duplicate note
        addSingleFileDuplicateOption(menu, file, fileSystemOps);

        // Delete note
        addSingleFileDeleteOption(
            menu,
            file,
            selectionState,
            settings,
            fileSystemOps,
            selectionDispatch,
            isFolderNoteFile,
            getCachedFileList
        );
    }
}

function addManualSortGroupHeaderAction(params: AddManualSortGroupHeaderActionParams): boolean {
    const { menu, app, metadataService, settings, file, source, selectionState, shouldShowMultiOptions } = params;
    const propertyKey = getManualSortGroupHeaderPropertyKey(settings);
    if (source !== 'list-pane' || shouldShowMultiOptions || file.extension !== 'md' || !propertyKey) {
        return false;
    }

    const sortSpec = getEffectiveListSort(
        settings,
        selectionState.selectionType,
        selectionState.selectedFolder,
        selectionState.selectedTag,
        selectionState.selectedProperty
    );
    const groupingInfo = resolveListGrouping({
        settings,
        selectionType: selectionState.selectionType,
        folderPath: selectionState.selectedFolder?.path ?? null,
        tag: selectionState.selectedTag ?? null,
        propertyNodeId: selectionState.selectedProperty ?? null
    });
    const effectiveGrouping = resolveEffectiveListGroupingForSort({
        groupBy: groupingInfo.effectiveGrouping,
        sortOption: sortSpec.option,
        selectionType: selectionState.selectionType,
        isManualSortActive: isManualSortPropertyKey(settings, sortSpec.propertyKey)
    });
    if (effectiveGrouping !== 'custom') {
        return false;
    }

    return addManualSortGroupHeaderMenuItems({ menu, app, file, propertyKey, metadataService });
}

function resolveFileStyleTarget(params: ResolveFileStyleTargetParams): FileStyleTarget {
    const { file, isFolderNoteFile, shouldShowMultiOptions, selectedFiles } = params;
    if (isFolderNoteFile && file.parent instanceof TFolder) {
        return { type: 'folder', folderPath: file.parent.path };
    }

    return {
        type: 'files',
        files: shouldShowMultiOptions ? selectedFiles : [file]
    };
}

function resolveSelectedFilesInOrder(selectedPaths: ReadonlySet<string>, app: App, orderedFiles?: readonly TFile[]): TFile[] {
    const selectedFiles = Array.from(selectedPaths)
        .map(path => app.vault.getFileByPath(path))
        .filter((file): file is TFile => file !== null);

    return orderFilesByReference(selectedFiles, orderedFiles);
}

function addStyleActionsForFileContext(params: AddStyleActionsForFileContextParams): void {
    const { menu, app, metadataService, settings, file, styleTarget } = params;
    if (styleTarget.type === 'folder') {
        addFolderStyleActionsForFileContext({
            menu,
            app,
            metadataService,
            settings,
            folderPath: styleTarget.folderPath
        });
        return;
    }

    addFileStyleActionsForFileContext({
        menu,
        app,
        metadataService,
        settings,
        file,
        targetFiles: styleTarget.files
    });
}

function addFolderStyleActionsForFileContext(params: FolderStyleActionsParams): void {
    const { menu, app, metadataService, settings, folderPath } = params;

    addFolderStyleChangeActions({
        menu,
        app,
        metadataService,
        folderPath,
        showFolderIcons: settings.showFolderIcons
    });

    addFolderStyleMenu({
        menu,
        metadataService,
        folderPath,
        inheritFolderColors: settings.inheritFolderColors,
        showFolderIcons: settings.showFolderIcons
    });
}

function addFileStyleActionsForFileContext(params: FileStyleActionsParams): void {
    const { menu, app, metadataService, settings, file, targetFiles } = params;
    const fileIcon = metadataService.getFileIcon(file.path);
    const fileColor = metadataService.getFileColor(file.path);
    const fileBackground = metadataService.getFileBackgroundColor(file.path);
    const folderIcon =
        settings.useFolderIconForFiles && file.parent
            ? metadataService.getFolderDisplayData(file.parent.path, { includeIcon: true }).icon
            : undefined;
    const isExternalFile = !shouldDisplayFile(file, FILE_VISIBILITY.SUPPORTED, app);
    // Do not pass temporary row state here because modal previews ignore icons such as the unfinished-task icon.
    const colorIconPlaceholder =
        resolveFileIconId(file, settings, {
            customIconId: folderIcon,
            metadataCache: app.metadataCache,
            isExternalFile,
            allowCategoryIcons: true,
            fallbackMode: 'file',
            fileNameForMatch: getFileDisplayName(file)
        }) ?? 'file';
    const removableStyleAvailability = resolveFileStyleRemovalAvailability(targetFiles, metadataService);
    const { hasRemovableIcon, hasRemovableColor, hasRemovableBackground } = removableStyleAvailability;
    const openAppearanceModal = async (initialTab: 'icon' | 'color' | 'background'): Promise<void> => {
        const { AppearanceModal } = await import('../../modals/AppearanceModal');
        const modal = new AppearanceModal(app, {
            title: file.basename,
            metadataService,
            initialTab,
            colorIconPlaceholder: settings.showFileIcons ? colorIconPlaceholder : null,
            icon: settings.showFileIcons
                ? {
                      initial: metadataService.getFileIcon(file.path) ?? null,
                      apply: async iconId => {
                          await Promise.all(
                              targetFiles.map(selectedFile =>
                                  iconId === null
                                      ? metadataService.removeFileIcon(selectedFile.path)
                                      : metadataService.setFileIcon(selectedFile.path, iconId)
                              )
                          );
                      }
                  }
                : undefined,
            color: {
                initial: metadataService.getFileColor(file.path) ?? null,
                apply: async color => {
                    await Promise.all(
                        targetFiles.map(selectedFile =>
                            color === null
                                ? metadataService.removeFileColor(selectedFile.path)
                                : metadataService.setFileColor(selectedFile.path, color)
                        )
                    );
                }
            },
            background: {
                initial: metadataService.getFileBackgroundColor(file.path) ?? null,
                apply: async color => {
                    await Promise.all(
                        targetFiles.map(selectedFile =>
                            color === null
                                ? metadataService.removeFileBackgroundColor(selectedFile.path)
                                : metadataService.setFileBackgroundColor(selectedFile.path, color)
                        )
                    );
                }
            }
        });
        modal.open();
    };

    if (settings.showFileIcons) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.file.changeIcon).setIcon('lucide-image'), () => {
                return openAppearanceModal('icon');
            });
        });
    }

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.file.changeColor).setIcon('lucide-palette'), () => {
            return openAppearanceModal('color');
        });
    });

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.changeBackground).setIcon('lucide-paint-bucket'), () => {
            return openAppearanceModal('background');
        });
    });

    addStyleMenu({
        menu,
        styleData: {
            icon: fileIcon,
            color: fileColor,
            background: fileBackground
        },
        hasIcon: settings.showFileIcons,
        hasColor: true,
        hasBackground: true,
        applyStyle: async clipboard => {
            const { icon, color, background } = clipboard;
            const actions: Promise<void>[] = [];

            targetFiles.forEach(selectedFile => {
                if (icon) {
                    actions.push(metadataService.setFileIcon(selectedFile.path, icon));
                }
                if (color) {
                    actions.push(metadataService.setFileColor(selectedFile.path, color));
                }
                if (background) {
                    actions.push(metadataService.setFileBackgroundColor(selectedFile.path, background));
                }
            });

            await Promise.all(actions);
        },
        removeIcon: hasRemovableIcon
            ? async () => {
                  const actions = targetFiles
                      .filter(selectedFile => metadataService.getFileIcon(selectedFile.path))
                      .map(selectedFile => metadataService.removeFileIcon(selectedFile.path));
                  await Promise.all(actions);
              }
            : undefined,
        removeColor: hasRemovableColor
            ? async () => {
                  const actions = targetFiles
                      .filter(selectedFile => metadataService.getFileColor(selectedFile.path))
                      .map(selectedFile => metadataService.removeFileColor(selectedFile.path));
                  await Promise.all(actions);
              }
            : undefined,
        removeBackground: hasRemovableBackground
            ? async () => {
                  const actions = targetFiles
                      .filter(selectedFile => metadataService.getFileBackgroundColor(selectedFile.path))
                      .map(selectedFile => metadataService.removeFileBackgroundColor(selectedFile.path));
                  await Promise.all(actions);
              }
            : undefined
    });
}

function resolveFileStyleRemovalAvailability(targetFiles: TFile[], metadataService: MetadataService): FileStyleRemovalAvailability {
    let hasRemovableIcon = false;
    let hasRemovableColor = false;
    let hasRemovableBackground = false;

    for (const selectedFile of targetFiles) {
        if (!hasRemovableIcon && metadataService.getFileIcon(selectedFile.path)) {
            hasRemovableIcon = true;
        }

        if (!hasRemovableColor && metadataService.getFileColor(selectedFile.path)) {
            hasRemovableColor = true;
        }

        if (!hasRemovableBackground && metadataService.getFileBackgroundColor(selectedFile.path)) {
            hasRemovableBackground = true;
        }

        if (hasRemovableIcon && hasRemovableColor && hasRemovableBackground) {
            break;
        }
    }

    return {
        hasRemovableIcon,
        hasRemovableColor,
        hasRemovableBackground
    };
}

/**
 * Add open options for a single file
 */
function addSingleFileOpenOptions(menu: Menu, file: TFile, app: App, isMobile: boolean, commandQueue: CommandQueueService | null): void {
    // Open in new tab
    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.file.openInNewTab).setIcon('lucide-file-plus'), async () => {
            await openFileInContext({ app, commandQueue, file, context: 'tab' });
        });
    });

    // Open to the right
    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.file.openToRight).setIcon('lucide-separator-vertical'), async () => {
            await openFileInContext({ app, commandQueue, file, context: 'split' });
        });
    });

    // Open in new window - desktop only
    if (!isMobile) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.file.openInNewWindow).setIcon('lucide-external-link'), async () => {
                await openFileInContext({ app, commandQueue, file, context: 'window' });
            });
        });
    }
}

/**
 * Add open options for multiple files
 */
function addMultipleFilesOpenOptions(
    menu: Menu,
    selectedFiles: TFile[],
    app: App,
    isMobile: boolean,
    commandQueue?: CommandQueueService | null
): void {
    const selectedCount = selectedFiles.length;
    const allMarkdown = selectedFiles.every(f => f.extension === 'md');

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item
                .setTitle(
                    allMarkdown
                        ? strings.contextMenu.file.openMultipleInNewTabs.replace('{count}', selectedCount.toString())
                        : strings.contextMenu.file.openMultipleFilesInNewTabs.replace('{count}', selectedCount.toString())
                )
                .setIcon('lucide-file-plus'),
            async () => {
                for (const selectedFile of selectedFiles) {
                    await openFileInContext({
                        app,
                        commandQueue: commandQueue ?? null,
                        file: selectedFile,
                        context: 'tab'
                    });
                }
            }
        );
    });

    // Open to the right
    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item
                .setTitle(
                    allMarkdown
                        ? strings.contextMenu.file.openMultipleToRight.replace('{count}', selectedCount.toString())
                        : strings.contextMenu.file.openMultipleFilesToRight.replace('{count}', selectedCount.toString())
                )
                .setIcon('lucide-separator-vertical'),
            async () => {
                for (const selectedFile of selectedFiles) {
                    await openFileInContext({
                        app,
                        commandQueue: commandQueue ?? null,
                        file: selectedFile,
                        context: 'split'
                    });
                }
            }
        );
    });

    // Open in new windows - desktop only
    if (!isMobile) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(
                item
                    .setTitle(
                        allMarkdown
                            ? strings.contextMenu.file.openMultipleInNewWindows.replace('{count}', selectedCount.toString())
                            : strings.contextMenu.file.openMultipleFilesInNewWindows.replace('{count}', selectedCount.toString())
                    )
                    .setIcon('lucide-external-link'),
                async () => {
                    for (const selectedFile of selectedFiles) {
                        await openFileInContext({
                            app,
                            commandQueue: commandQueue ?? null,
                            file: selectedFile,
                            context: 'window'
                        });
                    }
                }
            );
        });
    }
}

/**
 * Add pin option for a single file
 */
function addSingleFilePinOption(menu: Menu, file: TFile, metadataService: MetadataService, context: NavigatorContext): void {
    const isPinned = metadataService.isFilePinned(file.path, context);

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item
                .setTitle(
                    isPinned
                        ? file.extension === 'md'
                            ? strings.contextMenu.file.unpinNote
                            : strings.contextMenu.file.unpinFile
                        : file.extension === 'md'
                          ? strings.contextMenu.file.pinNote
                          : strings.contextMenu.file.pinFile
                )
                .setIcon('lucide-pin'),
            async () => {
                if (!file.parent) return;

                await metadataService.togglePin(file.path, context);
            }
        );
    });
}

/**
 * Add shortcuts option for multiple files
 */
function addMultipleFilesShortcutOption(
    menu: Menu,
    selectedFiles: TFile[],
    selectionState: SelectionState,
    app: App,
    settings: NotebookNavigatorSettings,
    shortcuts: ShortcutsContextValue
): void {
    if (selectedFiles.length === 0) {
        return;
    }

    const allMarkdown = selectedFiles.every(file => file.extension === 'md');
    const labelTemplate = allMarkdown ? strings.shortcuts.addNotesCount : strings.shortcuts.addFilesCount;
    const label = labelTemplate.replace('{count}', selectedFiles.length.toString());

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item.setTitle(label).setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'nav-shortcuts', 'lucide-star')),
            async () => {
                // Re-resolve files from selection state to get current paths
                const currentFiles = Array.from(selectionState.selectedFiles)
                    .map(path => app.vault.getFileByPath(path))
                    .filter((f): f is TFile => !!f);
                if (currentFiles.length === 0) {
                    return;
                }

                const entries = currentFiles.map(selectedFile => ({
                    type: ShortcutType.NOTE,
                    path: selectedFile.path
                }));

                await shortcuts.addShortcutsBatch(entries);
            }
        );
    });
}

/**
 * Add pin option for multiple files
 */
function addMultipleFilesPinOption(menu: Menu, selectedFiles: TFile[], metadataService: MetadataService, context: NavigatorContext): void {
    const anyUnpinned = selectedFiles.some(f => {
        return !metadataService.isFilePinned(f.path, context);
    });

    // Check if all files are markdown
    const allMarkdown = selectedFiles.every(f => f.extension === 'md');
    const selectedCount = selectedFiles.length;

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item
                .setTitle(
                    anyUnpinned
                        ? allMarkdown
                            ? strings.contextMenu.file.pinMultipleNotes.replace('{count}', selectedCount.toString())
                            : strings.contextMenu.file.pinMultipleFiles.replace('{count}', selectedCount.toString())
                        : allMarkdown
                          ? strings.contextMenu.file.unpinMultipleNotes.replace('{count}', selectedCount.toString())
                          : strings.contextMenu.file.unpinMultipleFiles.replace('{count}', selectedCount.toString())
                )
                .setIcon('lucide-pin'),
            async () => {
                for (const selectedFile of selectedFiles) {
                    if (anyUnpinned) {
                        // Pin all unpinned files
                        if (!metadataService.isFilePinned(selectedFile.path, context)) {
                            await metadataService.togglePin(selectedFile.path, context);
                        }
                    } else {
                        // Unpin all files
                        await metadataService.togglePin(selectedFile.path, context);
                    }
                }
            }
        );
    });
}

function addMultipleFilesMergeOption(
    menu: Menu,
    selectedFiles: TFile[],
    app: App,
    commandQueue: CommandQueueService | null,
    fileSystemOps: FileSystemOperations
): void {
    if (selectedFiles.length < 2 || !selectedFiles.every(file => file.extension === 'md')) {
        return;
    }

    const firstFile = selectedFiles[0];
    const outputFolder = firstFile.parent instanceof TFolder ? firstFile.parent : app.vault.getRoot();

    addMergeNotesMenuItem({
        menu,
        app,
        commandQueue,
        fileSystemOps,
        files: selectedFiles,
        outputFolder,
        defaultOutputName: strings.modals.mergeNotes.outputNamePlaceholder,
        title: strings.contextMenu.file.mergeNotes.replace('{count}', selectedFiles.length.toString())
    });
}

/**
 * Add duplicate option for a single file
 */
function addSingleFileDuplicateOption(menu: Menu, file: TFile, fileSystemOps: FileSystemOperations): void {
    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item
                .setTitle(file.extension === 'md' ? strings.contextMenu.file.duplicateNote : strings.contextMenu.file.duplicateFile)
                .setIcon('lucide-copy'),
            async () => {
                await fileSystemOps.duplicateNote(file);
            }
        );
    });
}

/**
 * Add duplicate option for multiple files
 */
function addMultipleFilesDuplicateOption(
    menu: Menu,
    selectedFiles: TFile[],
    selectionState: SelectionState,
    app: App,
    fileSystemOps: FileSystemOperations
): void {
    // Check if all files are markdown
    const allMarkdown = selectedFiles.every(f => f.extension === 'md');
    const selectedCount = selectedFiles.length;

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item
                .setTitle(
                    allMarkdown
                        ? strings.contextMenu.file.duplicateMultipleNotes.replace('{count}', selectedCount.toString())
                        : strings.contextMenu.file.duplicateMultipleFiles.replace('{count}', selectedCount.toString())
                )
                .setIcon('lucide-copy'),
            async () => {
                // Re-resolve files at action time to handle sync deletions
                const currentFiles = Array.from(selectionState.selectedFiles)
                    .map(path => app.vault.getFileByPath(path))
                    .filter((f): f is TFile => !!f);

                for (const selectedFile of currentFiles) {
                    await fileSystemOps.duplicateNote(selectedFile);
                }
            }
        );
    });
}

/**
 * Add delete option for a single file
 */
function addSingleFileDeleteOption(
    menu: Menu,
    file: TFile,
    selectionState: SelectionState,
    settings: NotebookNavigatorSettings,
    fileSystemOps: FileSystemOperations,
    selectionDispatch: React.Dispatch<SelectionAction>,
    isFolderNoteFile: boolean,
    getCachedFileList: () => TFile[]
): void {
    menu.addItem((item: MenuItem) => {
        const title = isFolderNoteFile
            ? strings.contextMenu.folder.deleteFolderNote
            : file.extension === 'md'
              ? strings.contextMenu.file.deleteNote
              : strings.contextMenu.file.deleteFile;
        setAsyncOnClick(item.setTitle(title).setIcon('lucide-trash').setWarning(true), async () => {
            // Check if this is the currently selected file
            if (selectionState.selectedFile?.path === file.path) {
                // Use the smart delete handler
                await fileSystemOps.deleteSelectedFile(
                    file,
                    settings,
                    {
                        selectionType: selectionState.selectionType,
                        selectedFolder: selectionState.selectedFolder || undefined,
                        selectedTag: selectionState.selectedTag || undefined,
                        selectedProperty: selectionState.selectedProperty ?? undefined
                    },
                    selectionDispatch,
                    settings.confirmBeforeDelete,
                    getCachedFileList()
                );
            } else {
                // Normal deletion - not the currently selected file
                await fileSystemOps.deleteFile(file, settings.confirmBeforeDelete);
            }
        });
    });
}

/**
 * Add delete option for multiple files
 */
function addMultipleFilesDeleteOption(
    menu: Menu,
    selectedFiles: TFile[],
    selectionState: SelectionState,
    settings: NotebookNavigatorSettings,
    fileSystemOps: FileSystemOperations,
    selectionDispatch: React.Dispatch<SelectionAction>,
    getCachedFileList: () => TFile[]
): void {
    const allMarkdown = selectedFiles.every(f => f.extension === 'md');
    const selectedCount = selectedFiles.length;

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(
            item
                .setTitle(
                    allMarkdown
                        ? strings.contextMenu.file.deleteMultipleNotes.replace('{count}', selectedCount.toString())
                        : strings.contextMenu.file.deleteMultipleFiles.replace('{count}', selectedCount.toString())
                )
                .setIcon('lucide-trash')
                .setWarning(true),
            async () => {
                // Use centralized delete method with smart selection
                await fileSystemOps.deleteFilesWithSmartSelection(
                    selectionState.selectedFiles,
                    getCachedFileList(),
                    selectionDispatch,
                    settings.confirmBeforeDelete
                );
            }
        );
    });
}
