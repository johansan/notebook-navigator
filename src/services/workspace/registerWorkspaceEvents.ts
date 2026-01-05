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

/*
 * Notebook Navigator - Plugin for Obsidian
 */

import { TFile, TFolder } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { strings } from '../../i18n';
import { runAsyncAction } from '../../utils/async';
import { NOTEBOOK_NAVIGATOR_ICON_ID } from '../../constants/notebookNavigatorIcon';
import { removeHiddenFolderExactMatches, updateHiddenFolderExactMatches } from '../../utils/vaultProfiles';
import { NOTEBOOK_NAVIGATOR_VIEW } from '../../types';

/**
 * Registers all workspace-related event listeners for the plugin
 */
export default function registerWorkspaceEvents(plugin: NotebookNavigatorPlugin): void {
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
                            await plugin.revealFileInActualFolder(file);
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
                    // Skip reveal if the move was initiated from within the Navigator
                    if (!plugin.commandQueue?.isMovingFile()) {
                        await plugin.revealFileInActualFolder(file);
                    }
                }

                // Notify selection context to update stored file paths
                plugin.notifyFileRenameListeners(oldPath, file.path);
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
            });
        })
    );

    // Intercept tag clicks in editor to navigate to tag in Navigator
    plugin.registerDomEvent(
        document,
        'click',
        (event: MouseEvent) => {
            // Only intercept if the setting is enabled
            if (!plugin.settings.interceptTagClicks) {
                return;
            }

            const target = event.target as HTMLElement;
            if (!target) {
                return;
            }

            // Check if the clicked element is a tag or contains a tag
            let tagName: string | null = null;

            // Check for frontmatter/properties tags (multi-select-pill)
            const pillElement = target.closest('.multi-select-pill') as HTMLElement;
            if (pillElement) {
                // Don't intercept clicks on the pill's remove button (the X)
                if (target.closest('.multi-select-pill-remove-button') || target.classList.contains('multi-select-pill-remove-button')) {
                    return; // Let the remove button work normally
                }

                const metadataProperty = pillElement.closest('.metadata-property') as HTMLElement;
                if (metadataProperty) {
                    // Check the data-property-key attribute to ensure it's a tag
                    const propertyKeyAttr = metadataProperty.getAttribute('data-property-key');
                    if (propertyKeyAttr && propertyKeyAttr.toLowerCase().includes('tag')) {
                        const pillContent = pillElement.querySelector('.multi-select-pill-content');
                        tagName = pillContent ? pillContent.textContent : pillElement.textContent;
                    }
                } else {
                    // Fallback: just use the pill text as the tag name
                    const pillContent = pillElement.querySelector('.multi-select-pill-content');
                    tagName = pillContent ? pillContent.textContent : pillElement.textContent;
                }
            }
            // Check if the target itself is a tag (inline tags in reading mode)
            else if (target.classList.contains('tag')) {
                tagName = target.getAttribute('data-tag-name') || target.textContent;
            }
            // Check for editor mode tags (CodeMirror)
            else if (
                target.classList.contains('cm-hashtag') ||
                target.classList.contains('cm-hashtag-begin') ||
                target.classList.contains('cm-hashtag-end')
            ) {
                const hashtagElement = target.closest('.cm-hashtag') as HTMLElement;
                tagName = hashtagElement ? hashtagElement.textContent : target.textContent;
            }
            // Check parent elements for tags
            else if (target.closest('.tag')) {
                const tagElement = target.closest('.tag') as HTMLElement;
                tagName = tagElement.getAttribute('data-tag-name') || tagElement.textContent;
            } else if (target.closest('.cm-hashtag')) {
                const hashtagElement = target.closest('.cm-hashtag') as HTMLElement;
                tagName = hashtagElement ? hashtagElement.textContent : null;
            }

            // If we found a tag, navigate to it
            if (tagName) {
                // Remove leading # if present and trim whitespace
                const cleanedTagName = tagName.replace(/^#/, '').trim();

                if (cleanedTagName) {
                    // Prevent default Obsidian search behavior
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();

                    // Navigate to the tag in Notebook Navigator
                    runAsyncAction(async () => {
                        try {
                            await plugin.activateView();

                            // Get the navigator view
                            const leaves = plugin.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW);

                            if (leaves.length > 0) {
                                const view = leaves[0]?.view;
                                if (view && typeof (view as unknown as { navigateToTag: (tag: string) => void }).navigateToTag === 'function') {
                                    // Call navigateToTag to select the tag
                                    (view as unknown as { navigateToTag: (tag: string) => void }).navigateToTag(cleanedTagName);

                                    // Use requestAnimationFrame to wait for DOM update before clicking
                                    // This respects the plugin's transition timing
                                    requestAnimationFrame(() => {
                                        const navigatorElement = leaves[0].view.containerEl;
                                        const selectedTag = navigatorElement.querySelector('.nn-tag.nn-selected .nn-navitem-content') as HTMLElement;

                                        if (selectedTag) {
                                            selectedTag.click();
                                        }
                                    });
                                }
                            }
                        } catch (error) {
                            console.error('[Notebook Navigator] Failed to navigate to tag:', error);
                        }
                    });
                }
            }
        },
        { capture: true }
    );
}
