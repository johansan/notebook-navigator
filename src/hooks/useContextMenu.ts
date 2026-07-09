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

// src/hooks/useContextMenu.ts
import { useEffect, useCallback, useState } from 'react';
import { Menu, TFile, TFolder } from 'obsidian';
import { useExpansionState, useExpansionDispatch } from '../context/ExpansionContext';
import { useSelectionState, useSelectionDispatch } from '../context/SelectionContext';
import {
    useServices,
    useFileSystemOps,
    useMetadataService,
    useTagOperations,
    usePropertyOperations,
    useCommandQueue
} from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUIDispatch } from '../context/UIStateContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { ItemType } from '../types';
import {
    MenuConfig,
    MenuServices,
    MenuState,
    MenuDispatchers,
    buildFolderMenu,
    buildTagMenu,
    buildPropertyMenu,
    buildFileMenu,
    buildEmptyListMenu,
    EMPTY_LIST_MENU_TYPE
} from '../utils/contextMenu';
import { getFolderNote } from '../utils/folderNoteLookup';

// Tracks the currently open navigator context menu so it can be closed before opening another
let activeNavigatorMenu: Menu | null = null;

/**
 * Hides the currently active navigator context menu if one is open.
 */
export function hideNavigatorContextMenu() {
    if (activeNavigatorMenu) {
        activeNavigatorMenu.hide();
        activeNavigatorMenu = null;
    }
}

/**
 * Custom hook that attaches a context menu to an element.
 * Provides right-click context menu functionality for files, folders, and tags.
 *
 * @param elementRef - React ref to the element to attach the context menu to
 * @param config - Configuration object containing menu type and item, or null to disable
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement | null>(null);
 * useContextMenu(ref, { type: 'file', item: file });
 *
 * return <div ref={ref}>Right-click me</div>;
 * ```
 */
export function useContextMenu(elementRef: React.RefObject<HTMLElement | null>, config: MenuConfig | null) {
    const { app, plugin, isMobile, tagTreeService, propertyTreeService } = useServices();
    const settings = useSettingsState();
    const fileSystemOps = useFileSystemOps();
    const metadataService = useMetadataService();
    const tagOperations = useTagOperations();
    const propertyOperations = usePropertyOperations();
    const commandQueue = useCommandQueue();
    const shortcuts = useShortcuts();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const selectionState = useSelectionState();
    const { expandedFolders, expandedTags, expandedProperties } = useExpansionState();
    const selectionDispatch = useSelectionDispatch();
    const expansionDispatch = useExpansionDispatch();
    const uiDispatch = useUIDispatch();
    const [attachedElement, setAttachedElement] = useState<HTMLElement | null>(null);

    /**
     * Handles the context menu event.
     * Shows appropriate menu items based on whether the target is a file, folder, or tag.
     *
     * @param e - The mouse event from right-click
     */
    const handleContextMenu = useCallback(
        (e: MouseEvent) => {
            if (!config || !elementRef.current) return;

            const targetNode = e.target;
            if (!(targetNode instanceof Node)) return;

            // Check if the click is on this element or its children
            if (!elementRef.current.contains(targetNode)) return;

            // Get the target element if it's an HTML element
            const targetElement = targetNode.instanceOf(HTMLElement) ? targetNode : targetNode.parentElement;
            let menuElement: HTMLElement = elementRef.current;

            // Folder note override:
            // Right-clicking on a folder name should behave like right-clicking the folder note file.
            let menuConfig: MenuConfig = config;
            if (menuConfig.type === EMPTY_LIST_MENU_TYPE) {
                if (!targetElement) {
                    return;
                }

                const fileTarget = targetElement.closest('.nn-file');
                if (fileTarget instanceof HTMLElement) {
                    const filePath = fileTarget.dataset.path;
                    const file = filePath ? app.vault.getFileByPath(filePath) : null;
                    if (!(file instanceof TFile)) {
                        return;
                    }

                    menuConfig = {
                        type: ItemType.FILE,
                        item: file,
                        options: {
                            source: 'list-pane',
                            orderedFiles: menuConfig.options?.orderedFiles,
                            onStartInlineRename: menuConfig.options?.onStartInlineRename
                        }
                    };
                    menuElement = fileTarget;
                }
            }

            if (settings.enableFolderNoteLinks && menuConfig.type === ItemType.FOLDER && targetElement?.closest('.nn-navitem-name')) {
                const folderNote = getFolderNote(menuConfig.item, settings);
                if (folderNote) {
                    menuConfig = { type: ItemType.FILE, item: folderNote };
                }
            }

            const isFileMenu = menuConfig.type === ItemType.FILE;

            // Menu builder function that will be selected based on item type
            type Builder = (menu: Menu) => void;
            let buildMenu: Builder | null = null;

            if (menuConfig.type === EMPTY_LIST_MENU_TYPE) {
                // Handle context menu for empty areas in the list pane
                const folder = menuConfig.item;
                if (!(folder instanceof TFolder)) {
                    return;
                }
                if (!targetElement) {
                    return;
                }

                // Skip menu if clicking on file items or date headers
                const isFileTarget = targetElement.closest('.nn-file') !== null;
                const isHeaderTarget = targetElement.closest('.nn-list-group-header') !== null;
                if (isFileTarget || isHeaderTarget) {
                    return;
                }

                buildMenu = menuInstance => {
                    buildEmptyListMenu({
                        folder,
                        menu: menuInstance,
                        services,
                        settings,
                        state,
                        dispatchers
                    });
                };
            } else if (menuConfig.type === ItemType.FOLDER) {
                buildMenu = menuInstance => {
                    buildFolderMenu({
                        folder: menuConfig.item,
                        menu: menuInstance,
                        services,
                        settings,
                        state,
                        dispatchers,
                        options: menuConfig.options
                    });
                };
            } else if (menuConfig.type === ItemType.TAG) {
                buildMenu = menuInstance => {
                    buildTagMenu({
                        tagPath: menuConfig.item,
                        menu: menuInstance,
                        services,
                        settings,
                        state,
                        dispatchers
                    });
                };
            } else if (menuConfig.type === ItemType.PROPERTY) {
                buildMenu = menuInstance => {
                    buildPropertyMenu({
                        propertyNodeId: menuConfig.item,
                        menu: menuInstance,
                        services,
                        settings,
                        state,
                        dispatchers
                    });
                };
            } else if (menuConfig.type === ItemType.FILE) {
                buildMenu = menuInstance => {
                    buildFileMenu({
                        file: menuConfig.item,
                        menu: menuInstance,
                        services,
                        settings,
                        state,
                        dispatchers,
                        options: menuConfig.options
                    });
                };
            }

            if (!buildMenu) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            hideNavigatorContextMenu();

            const menu = new Menu();
            activeNavigatorMenu = menu;

            // Add context menu active class to show outline immediately
            menuElement.classList.add('nn-context-menu-active');

            // Handle separator hiding for file items in list pane
            if (isFileMenu) {
                // Find the virtual item wrapper that contains this file item
                const virtualItem = menuElement.closest('.nn-virtual-file-item');
                if (virtualItem instanceof HTMLElement) {
                    // Hide separator below this item
                    virtualItem.classList.add('nn-hide-separator-context-menu');

                    // Find and hide separator of previous item (shows above this item)
                    const prevVirtualItem = virtualItem.previousElementSibling;
                    if (prevVirtualItem instanceof HTMLElement && prevVirtualItem.classList.contains('nn-virtual-file-item')) {
                        prevVirtualItem.classList.add('nn-hide-separator-context-menu');
                    }
                }
            }

            // Prepare common parameters for all builders
            const services: MenuServices = {
                app,
                plugin,
                isMobile,
                fileSystemOps,
                metadataService,
                tagOperations,
                propertyOperations,
                tagTreeService,
                propertyTreeService,
                commandQueue,
                shortcuts,
                visibility: { includeDescendantNotes, showHiddenItems }
            };

            const state: MenuState = {
                selectionState,
                expandedFolders,
                expandedTags,
                expandedProperties
            };

            const dispatchers: MenuDispatchers = {
                selectionDispatch,
                expansionDispatch,
                uiDispatch
            };

            // Call the appropriate builder based on item type
            buildMenu(menu);

            // Show menu at mouse event first, then attach hide handler.
            // This avoids a race where switching from an existing menu could
            // trigger a premature hide on the newly created menu and remove
            // the outline before the menu is actually shown.
            menu.showAtMouseEvent(e);

            // Remove the class when THIS menu is hidden
            menu.onHide(() => {
                if (activeNavigatorMenu === menu) {
                    activeNavigatorMenu = null;
                }
                menuElement.classList.remove('nn-context-menu-active');

                // Remove separator hiding for file items
                if (isFileMenu) {
                    const virtualItem = menuElement.closest('.nn-virtual-file-item');
                    if (virtualItem instanceof HTMLElement) {
                        // Remove separator hiding from this item
                        virtualItem.classList.remove('nn-hide-separator-context-menu');

                        // Remove separator hiding from previous item
                        const prevVirtualItem = virtualItem.previousElementSibling;
                        if (prevVirtualItem instanceof HTMLElement && prevVirtualItem.classList.contains('nn-virtual-file-item')) {
                            prevVirtualItem.classList.remove('nn-hide-separator-context-menu');
                        }
                    }
                }
            });
        },
        [
            config,
            elementRef,
            app,
            plugin,
            settings,
            fileSystemOps,
            metadataService,
            tagOperations,
            propertyOperations,
            selectionState,
            expandedFolders,
            expandedTags,
            expandedProperties,
            selectionDispatch,
            expansionDispatch,
            uiDispatch,
            isMobile,
            tagTreeService,
            propertyTreeService,
            commandQueue,
            shortcuts,
            includeDescendantNotes,
            showHiddenItems
        ]
    );

    useEffect(() => {
        if (!config) {
            if (attachedElement !== null) {
                setAttachedElement(null);
            }
            return;
        }

        const node = elementRef.current;
        if (node !== attachedElement) {
            setAttachedElement(node);
        }
    }, [attachedElement, config, elementRef]);

    useEffect(() => {
        if (!config || !attachedElement) return;

        attachedElement.addEventListener('contextmenu', handleContextMenu);

        return () => {
            // Remove listener on cleanup, but do not forcibly remove the
            // outline class here. Cleanup can run on re-render, which would
            // otherwise clear the outline before the menu appears when
            // switching targets. The class is reliably cleared via menu.onHide
            // when the context menu actually closes.
            attachedElement.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [attachedElement, handleContextMenu, config]);
}
