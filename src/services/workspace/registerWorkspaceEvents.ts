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

import { TFile, TFolder } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { strings } from '../../i18n';
import { getIconService } from '../icons';
import { runAsyncAction } from '../../utils/async';
import { NOTEBOOK_NAVIGATOR_ICON_ID } from '../../constants/notebookNavigatorIcon';
import { removeHiddenFolderExactMatches, updateHiddenFolderExactMatches } from '../../utils/vaultProfiles';
import {
    invalidateVaultIconSvgCache,
    isVaultIconFile,
    isVaultIconPath,
    updateVaultIconListCacheForCreate,
    updateVaultIconListCacheForDelete,
    updateVaultIconListCacheForRename
} from '../icons/providers/VaultIconProvider';

/**
 * Registers all workspace-related event listeners for the plugin
 */
export default function registerWorkspaceEvents(plugin: NotebookNavigatorPlugin): void {
    const iconService = getIconService();
    let iconAssetNotifyTimer: number | null = null;
    const scheduleIconAssetsChanged = (): void => {
        if (iconAssetNotifyTimer !== null) {
            return;
        }

        if (typeof window === 'undefined') {
            iconService.notifyIconAssetsChanged();
            return;
        }

        iconAssetNotifyTimer = window.setTimeout(() => {
            iconAssetNotifyTimer = null;
            iconService.notifyIconAssetsChanged();
        }, 50);
    };

    plugin.register(() => {
        if (iconAssetNotifyTimer !== null && typeof window !== 'undefined') {
            window.clearTimeout(iconAssetNotifyTimer);
        }
        iconAssetNotifyTimer = null;
    });

    const syncHiddenFolderRename = async (previousPath: string, nextPath: string): Promise<void> => {
        const updated = updateHiddenFolderExactMatches(plugin.settings, previousPath, nextPath);
        if (!updated) {
            return;
        }

        try {
            await plugin.saveSettingsAndUpdate();
        } catch (error) {
            console.error('Failed to persist hidden folder rename updates', error);
        }
    };

    const removeHiddenFolderPath = async (targetPath: string): Promise<void> => {
        const removed = removeHiddenFolderExactMatches(plugin.settings, targetPath);
        if (!removed) {
            return;
        }

        try {
            await plugin.saveSettingsAndUpdate();
        } catch (error) {
            console.error('Failed to persist hidden folder removal updates', error);
        }
    };

    // Add "Reveal in Navigator" to editor context menu
    plugin.registerEvent(
        plugin.app.workspace.on('editor-menu', (menu, _, view) => {
            const file = view.file;
            if (!file) {
                return;
            }

            menu.addSeparator();
            menu.addItem(item => {
                item.setTitle(strings.plugin.revealInNavigator)
                    .setIcon('lucide-folder-open')
                    .onClick(() => {
                        // Wrap file reveal with error handling
                        runAsyncAction(async () => {
                            await plugin.activateView();
                            await plugin.revealFileInActualFolder(file, { showHiddenFileNotice: true });
                        });
                    });
            });
        })
    );

    // Add Notebook Navigator option to the folder explorer menu
    plugin.registerEvent(
        plugin.app.workspace.on('file-menu', (menu, file) => {
            // Add navigate option for folders
            if (file instanceof TFolder) {
                menu.addItem(item => {
                    item.setTitle(strings.plugin.revealInNavigator)
                        .setIcon(NOTEBOOK_NAVIGATOR_ICON_ID)
                        .onClick(() => {
                            // Wrap folder navigation with error handling
                            runAsyncAction(async () => {
                                await plugin.navigateToFolder(file, { preserveNavigationFocus: true });
                            });
                        });
                });
            }
        })
    );

    // Add ribbon icon to open the navigator
    plugin.ribbonIconEl = plugin.addRibbonIcon(NOTEBOOK_NAVIGATOR_ICON_ID, strings.plugin.ribbonTooltip, () => {
        // Activate navigator view with error handling
        runAsyncAction(() => plugin.activateView());
    });

    // Track file opens for recent notes history
    plugin.registerEvent(
        plugin.app.workspace.on('file-open', file => {
            if (!(file instanceof TFile) || plugin.isFileInRightSidebar(file)) {
                return;
            }

            plugin.recentNotesService?.recordFileOpen(file);
        })
    );

    // Record the initially active file if it exists
    const initialActiveFile = plugin.app.workspace.getActiveFile();
    if (initialActiveFile instanceof TFile && !plugin.isFileInRightSidebar(initialActiveFile)) {
        plugin.recentNotesService?.recordFileOpen(initialActiveFile);
    }

    // Handle file and folder renames
    plugin.registerEvent(
        plugin.app.vault.on('rename', (file, oldPath) => {
            runAsyncAction(async () => {
                if (plugin.isShuttingDown()) {
                    return;
                }

                if (file instanceof TFolder) {
                    await syncHiddenFolderRename(oldPath, file.path);
                    // Update folder metadata (colors, icons, etc.) to use new path
                    await plugin.metadataService?.handleFolderRename(oldPath, file.path);
                    return;
                }

                if (!(file instanceof TFile)) {
                    return;
                }

                const isNavigatorPathChange = plugin.commandQueue?.isChangingFilePaths() ?? false;
                const didTouchVaultIcon = isVaultIconPath(oldPath) || isVaultIconPath(file.path);
                if (didTouchVaultIcon) {
                    updateVaultIconListCacheForRename(file, oldPath);
                    invalidateVaultIconSvgCache(oldPath);
                    invalidateVaultIconSvgCache(file.path);
                    iconService.invalidateIconValidationCache();
                    scheduleIconAssetsChanged();
                }

                // Update recent notes history with new path
                plugin.recentNotesService?.renameEntry(oldPath, file.path);
                await plugin.metadataService?.handleFileRename(oldPath, file.path);

                // Helper to extract parent folder path from file path
                const getParentPath = (path: string): string => {
                    const lastSlash = path.lastIndexOf('/');
                    return lastSlash > 0 ? path.substring(0, lastSlash) : '/';
                };

                // Auto-reveal active file if it was moved to a different folder
                const movedToDifferentFolder = getParentPath(oldPath) !== getParentPath(file.path);
                if (movedToDifferentFolder && file === plugin.app.workspace.getActiveFile()) {
                    // Skip reveal if the path change was initiated from within the Navigator
                    if (!isNavigatorPathChange) {
                        await plugin.revealFileInActualFolder(file);
                    }
                }

                // Notify selection context to update stored file paths
                plugin.notifyFileRenameListeners(oldPath, file.path);
            });
        })
    );

    // Handle new files
    plugin.registerEvent(
        plugin.app.vault.on('create', file => {
            runAsyncAction(async () => {
                if (plugin.isShuttingDown()) {
                    return;
                }

                if (!(file instanceof TFile) || !isVaultIconFile(file)) {
                    return;
                }

                updateVaultIconListCacheForCreate(file);
                invalidateVaultIconSvgCache(file.path);
                iconService.invalidateIconValidationCache();
                scheduleIconAssetsChanged();
            });
        })
    );

    // Handle icon file content changes
    plugin.registerEvent(
        plugin.app.vault.on('modify', file => {
            runAsyncAction(async () => {
                if (plugin.isShuttingDown()) {
                    return;
                }

                if (!(file instanceof TFile) || !isVaultIconFile(file)) {
                    return;
                }

                invalidateVaultIconSvgCache(file.path);
                scheduleIconAssetsChanged();
            });
        })
    );

    // Handle file and folder deletions
    plugin.registerEvent(
        plugin.app.vault.on('delete', file => {
            runAsyncAction(async () => {
                if (plugin.isShuttingDown()) {
                    return;
                }

                if (file instanceof TFolder) {
                    await removeHiddenFolderPath(file.path);
                    // Clean up folder metadata (colors, icons, etc.)
                    await plugin.metadataService?.handleFolderDelete(file.path);
                    return;
                }

                if (!(file instanceof TFile)) {
                    return;
                }

                // Remove from recent notes history
                plugin.recentNotesService?.removeEntry(file.path);
                if (plugin.metadataService) {
                    await plugin.metadataService.handleFileDelete(file.path);
                }

                if (isVaultIconFile(file)) {
                    updateVaultIconListCacheForDelete(file.path);
                    invalidateVaultIconSvgCache(file.path);
                    iconService.invalidateIconValidationCache();
                    scheduleIconAssetsChanged();
                }
            });
        })
    );
}
