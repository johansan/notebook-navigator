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

/**
 * useNavigationPaneKeyboard - Keyboard navigation for the navigation pane
 *
 * This hook handles navigation-specific keyboard interactions:
 * - Folder/tag selection with arrow keys
 * - Expand/collapse with left/right arrows
 * - Navigate to parent items
 * - Delete folders
 * - Tab/arrow navigation to switch panes
 * - Page navigation
 */

import { useCallback } from 'react';
import { TFolder } from 'obsidian';
import { Virtualizer } from '@tanstack/react-virtual';
import { useExpansionState, useExpansionDispatch } from '../context/ExpansionContext';
import { useSelectionState, useSelectionDispatch } from '../context/SelectionContext';
import { useServices, useFileSystemOps } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useUIState, useUIDispatch } from '../context/UIStateContext';
import { NavigationPaneItemType, ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID } from '../types';
import type { CombinedNavigationItem, VirtualFolderItem } from '../types/virtualization';
import { deleteSelectedFolder } from '../utils/deleteOperations';
import { useKeyboardNavigation, KeyboardNavigationHelpers } from './useKeyboardNavigation';
import { matchesShortcut, KeyboardShortcutAction } from '../utils/keyboardShortcuts';
import { runAsyncAction } from '../utils/async';
import { getNavigationIndex } from '../utils/navigationIndex';
import { getFolderNote, openFolderNoteFile } from '../utils/folderNotes';
import { isEnterKey, resolveFolderNoteDefaultOpenContext, resolveKeyboardEnterAction } from '../utils/keyboardOpenContext';
import { buildPropertyKeyNodeId } from '../utils/propertyTree';
import { getNavigationExpansionTargetForItem, toggleNavigationExpansionTarget } from '../utils/navigationExpansion';

type VirtualTagCollectionItem = VirtualFolderItem & { tagCollectionId: string };
type VirtualPropertyCollectionItem = VirtualFolderItem & { propertyCollectionId: string };

/**
 * Check if a navigation item is selectable
 */
const isSelectableNavigationItem = (item: CombinedNavigationItem): boolean => {
    return (
        item.type === NavigationPaneItemType.FOLDER ||
        item.type === NavigationPaneItemType.TAG ||
        item.type === NavigationPaneItemType.UNTAGGED ||
        item.type === NavigationPaneItemType.PROPERTY_KEY ||
        item.type === NavigationPaneItemType.PROPERTY_VALUE ||
        ((isVirtualTagCollection(item) || isVirtualPropertyCollection(item)) && Boolean(item.isSelectable))
    );
};

function isVirtualTagCollection(item: CombinedNavigationItem): item is VirtualTagCollectionItem {
    return (
        item.type === NavigationPaneItemType.VIRTUAL_FOLDER && typeof item.tagCollectionId === 'string' && item.tagCollectionId.length > 0
    );
}

function isVirtualPropertyCollection(item: CombinedNavigationItem): item is VirtualPropertyCollectionItem {
    return (
        item.type === NavigationPaneItemType.VIRTUAL_FOLDER &&
        typeof item.propertyCollectionId === 'string' &&
        item.propertyCollectionId.length > 0
    );
}

function isShiftTab(event: KeyboardEvent): boolean {
    return event.key === 'Tab' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
}

interface UseNavigationPaneKeyboardProps {
    /** Navigation items to navigate through */
    items: CombinedNavigationItem[];
    /** Virtualizer instance for scroll management */
    virtualizer: Virtualizer<HTMLDivElement, Element>;
    /** Container element for event attachment */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /** Combined navigation index map */
    pathToIndex: Map<string, number>;
    /** Starts inline rename for the current item when available */
    onStartRename?: () => boolean;
}

/**
 * Hook for keyboard navigation in the navigation pane.
 * Handles folder/tag-specific keyboard interactions.
 */
export function useNavigationPaneKeyboard({
    items,
    virtualizer,
    containerRef,
    pathToIndex,
    onStartRename
}: UseNavigationPaneKeyboardProps) {
    const { app, commandQueue, plugin } = useServices();
    const fileSystemOps = useFileSystemOps();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const selectionState = useSelectionState();
    const selectionDispatch = useSelectionDispatch();
    const expansionState = useExpansionState();
    const expansionDispatch = useExpansionDispatch();
    const uiState = useUIState();
    const uiDispatch = useUIDispatch();
    const resolveIndex = useCallback(
        (path: string | null | undefined, type: ItemType | null) => {
            if (!path) {
                return -1;
            }

            if (type) {
                const exactMatch = getNavigationIndex(pathToIndex, type, path);
                if (exactMatch !== undefined) {
                    return exactMatch;
                }
            }

            const folderIndex = getNavigationIndex(pathToIndex, ItemType.FOLDER, path);
            if (folderIndex !== undefined) {
                return folderIndex;
            }

            const tagIndex = getNavigationIndex(pathToIndex, ItemType.TAG, path);
            if (tagIndex !== undefined) {
                return tagIndex;
            }

            const propertyIndex = getNavigationIndex(pathToIndex, ItemType.PROPERTY, path);
            if (propertyIndex !== undefined) {
                return propertyIndex;
            }

            return -1;
        },
        [pathToIndex]
    );

    /**
     * Get current selection index
     */
    const getCurrentIndex = useCallback(() => {
        if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder?.path) {
            return resolveIndex(selectionState.selectedFolder.path, ItemType.FOLDER);
        }

        if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
            return resolveIndex(selectionState.selectedTag, ItemType.TAG);
        }

        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
            return resolveIndex(selectionState.selectedProperty, ItemType.PROPERTY);
        }

        return -1;
    }, [selectionState, resolveIndex]);

    /**
     * Select item at given index
     */
    const selectItemAtIndex = useCallback(
        (item: CombinedNavigationItem) => {
            if (item.type === NavigationPaneItemType.FOLDER) {
                if (!(item.data instanceof TFolder)) return;
                const folder = item.data;
                selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder });

                // Auto-expand if enabled and folder has children
                if (settings.autoExpandNavItems && folder.children.some(child => child instanceof TFolder)) {
                    // Only expand if not already expanded
                    if (!expansionState.expandedFolders.has(folder.path)) {
                        const expansionTarget = getNavigationExpansionTargetForItem(item, { showHiddenItems });
                        if (expansionTarget) {
                            toggleNavigationExpansionTarget(expansionTarget, expansionState, expansionDispatch, 'expand', {
                                collapseOtherBranches: settings.collapseOtherBranchesOnExpand
                            });
                        }
                    }
                }
                return;
            } else if (item.type === NavigationPaneItemType.TAG || item.type === NavigationPaneItemType.UNTAGGED) {
                const tagNode = item.data;
                selectionDispatch({ type: 'SET_SELECTED_TAG', tag: tagNode.path });

                // Auto-expand if enabled and tag has children
                if (settings.autoExpandNavItems && tagNode.children.size > 0) {
                    // Only expand if not already expanded
                    if (!expansionState.expandedTags.has(tagNode.path)) {
                        const expansionTarget = getNavigationExpansionTargetForItem(item, { showHiddenItems });
                        if (expansionTarget) {
                            toggleNavigationExpansionTarget(expansionTarget, expansionState, expansionDispatch, 'expand', {
                                collapseOtherBranches: settings.collapseOtherBranchesOnExpand
                            });
                        }
                    }
                }
            } else if (item.type === NavigationPaneItemType.PROPERTY_KEY || item.type === NavigationPaneItemType.PROPERTY_VALUE) {
                const propertyNode = item.data;
                selectionDispatch({
                    type: 'SET_SELECTED_PROPERTY',
                    nodeId: propertyNode.id
                });

                if (settings.autoExpandNavItems && propertyNode.children.size > 0) {
                    if (!expansionState.expandedProperties.has(propertyNode.id)) {
                        const expansionTarget = getNavigationExpansionTargetForItem(item, { showHiddenItems });
                        if (expansionTarget) {
                            toggleNavigationExpansionTarget(expansionTarget, expansionState, expansionDispatch, 'expand', {
                                collapseOtherBranches: settings.collapseOtherBranchesOnExpand
                            });
                        }
                    }
                }
            } else if (isVirtualPropertyCollection(item)) {
                selectionDispatch({
                    type: 'SET_SELECTED_PROPERTY',
                    nodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                });
            } else if (isVirtualTagCollection(item)) {
                // Select virtual tag collection as a tag
                const tagCollectionId = item.tagCollectionId;
                selectionDispatch({ type: 'SET_SELECTED_TAG', tag: tagCollectionId });
            }
        },
        [selectionDispatch, settings, expansionState, expansionDispatch, showHiddenItems]
    );

    /**
     * Navigation pane-specific keyboard handler
     */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent, helpers: KeyboardNavigationHelpers<CombinedNavigationItem>) => {
            const currentIndex = getCurrentIndex();
            const shortcuts = settings.keyboardShortcuts;
            const isRTL = helpers.isRTL();
            let targetIndex = -1;
            let shouldScrollToTop = false;

            if (isShiftTab(e)) {
                e.preventDefault();
                return;
            }

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_RENAME) && onStartRename?.()) {
                e.preventDefault();
                return;
            }

            const getFirstSelectableIndex = () => helpers.findNextIndex(-1);
            const findSelectableBefore = (startIndex: number) => {
                if (items.length === 0) {
                    return -1;
                }

                for (let i = Math.min(startIndex, items.length - 1); i >= 0; i--) {
                    const candidate = helpers.getItemAt(i);
                    if (candidate && isSelectableNavigationItem(candidate)) {
                        return i;
                    }
                }

                return -1;
            };

            if (
                isEnterKey(e) &&
                settings.enableFolderNoteLinks &&
                selectionState.selectionType === ItemType.FOLDER &&
                selectionState.selectedFolder
            ) {
                const folder = selectionState.selectedFolder;
                const folderNote = getFolderNote(folder, settings);
                if (folderNote) {
                    e.preventDefault();

                    const modifierAction = resolveKeyboardEnterAction(e, settings);
                    if (modifierAction === 'rename') {
                        onStartRename?.();
                        return;
                    }

                    const openContext = modifierAction ?? resolveFolderNoteDefaultOpenContext(settings.folderNoteOpenLocation);

                    runAsyncAction(() =>
                        openFolderNoteFile({
                            app,
                            commandQueue,
                            folder,
                            folderNote,
                            context: openContext,
                            active: false,
                            openInRightSidebar: folderNoteFile => plugin.openFolderNoteInRightSidebar(folderNoteFile)
                        })
                    );
                    return;
                }
            }

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_MOVE_DOWN)) {
                e.preventDefault();
                targetIndex = helpers.findNextIndex(currentIndex);
                if (targetIndex === currentIndex && currentIndex >= 0) {
                    return;
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_MOVE_UP)) {
                e.preventDefault();
                if (currentIndex === -1) {
                    targetIndex = helpers.findNextIndex(-1);
                } else {
                    targetIndex = helpers.findPreviousIndex(currentIndex);
                    if (targetIndex === currentIndex && currentIndex >= 0) {
                        return;
                    }
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_PAGE_DOWN)) {
                e.preventDefault();
                if (currentIndex !== -1) {
                    const pageSize = helpers.getPageSize();
                    const newIndex = Math.min(currentIndex + pageSize, items.length - 1);
                    let newTargetIndex = helpers.findNextIndex(newIndex - 1);
                    if (newTargetIndex === currentIndex && currentIndex !== items.length - 1) {
                        for (let i = items.length - 1; i >= 0; i--) {
                            const item = helpers.getItemAt(i);
                            if (item && isSelectableNavigationItem(item)) {
                                newTargetIndex = i;
                                break;
                            }
                        }
                    }
                    targetIndex = newTargetIndex;
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_PAGE_UP)) {
                e.preventDefault();
                const firstSelectableIndex = getFirstSelectableIndex();

                if (currentIndex === -1) {
                    targetIndex = firstSelectableIndex;
                    if (firstSelectableIndex >= 0) {
                        shouldScrollToTop = true;
                    }
                } else {
                    const pageSize = helpers.getPageSize();
                    const newIndex = Math.max(0, currentIndex - pageSize);
                    const nearestSelectable = findSelectableBefore(newIndex);

                    if (nearestSelectable >= 0) {
                        targetIndex = nearestSelectable;
                        if (firstSelectableIndex >= 0 && nearestSelectable === firstSelectableIndex) {
                            shouldScrollToTop = true;
                        }
                    } else {
                        targetIndex = firstSelectableIndex;
                        if (firstSelectableIndex >= 0) {
                            shouldScrollToTop = true;
                        }
                    }
                }
            } else if (
                matchesShortcut(e, shortcuts, KeyboardShortcutAction.NAV_EXPAND_OR_FOCUS_LIST, {
                    isRTL,
                    directional: 'horizontal'
                })
            ) {
                e.preventDefault();
                if (currentIndex >= 0) {
                    const item = helpers.getItemAt(currentIndex);
                    if (!item) {
                        return;
                    }

                    const expansionTarget = getNavigationExpansionTargetForItem(item, { showHiddenItems });
                    const expandedInThisAction = expansionTarget
                        ? toggleNavigationExpansionTarget(expansionTarget, expansionState, expansionDispatch, 'expand', {
                              collapseOtherBranches: settings.collapseOtherBranchesOnExpand
                          })
                        : false;
                    const shouldSwitchPane = !expandedInThisAction;

                    if (expandedInThisAction && uiState.singlePane && settings.autoExpandNavItems) {
                        uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                    } else if (shouldSwitchPane) {
                        if (!uiState.singlePane) {
                            selectionDispatch({ type: 'SET_KEYBOARD_NAVIGATION', isKeyboardNavigation: true });
                        }
                        uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
                    }
                }
            } else if (
                matchesShortcut(e, shortcuts, KeyboardShortcutAction.NAV_COLLAPSE_OR_PARENT, {
                    isRTL,
                    directional: 'horizontal'
                })
            ) {
                e.preventDefault();
                if (currentIndex >= 0) {
                    const item = helpers.getItemAt(currentIndex);
                    if (!item) {
                        return;
                    }

                    const expansionTarget = getNavigationExpansionTargetForItem(item, { showHiddenItems });
                    const collapseItem = () =>
                        expansionTarget
                            ? toggleNavigationExpansionTarget(expansionTarget, expansionState, expansionDispatch, 'collapse')
                            : false;

                    const selectTaggedRootParent = () => {
                        if (!settings.showAllTagsFolder) {
                            return;
                        }
                        const parentIndex = resolveIndex(TAGGED_TAG_ID, ItemType.TAG);
                        if (parentIndex >= 0) {
                            const parentItem = helpers.getItemAt(parentIndex);
                            if (parentItem) {
                                selectItemAtIndex(parentItem);
                                helpers.scrollToIndex(parentIndex);
                            }
                        }
                    };

                    if (item.type === NavigationPaneItemType.FOLDER) {
                        if (!(item.data instanceof TFolder)) {
                            return;
                        }
                        const folder = item.data;
                        if (!collapseItem() && folder.parent && (!settings.showRootFolder || folder.path !== '/')) {
                            const parentPath = folder.parent.path;
                            const parentIndex = resolveIndex(parentPath, ItemType.FOLDER);
                            if (parentIndex >= 0) {
                                const parentItem = helpers.getItemAt(parentIndex);
                                if (parentItem) {
                                    selectItemAtIndex(parentItem);
                                    helpers.scrollToIndex(parentIndex);
                                }
                            }
                        }
                    } else if (item.type === NavigationPaneItemType.TAG) {
                        const tag = item.data;
                        if (!collapseItem()) {
                            const lastSlashIndex = tag.path.lastIndexOf('/');
                            if (lastSlashIndex > 0) {
                                const parentPath = tag.path.substring(0, lastSlashIndex);
                                const parentIndex = resolveIndex(parentPath, ItemType.TAG);
                                if (parentIndex >= 0) {
                                    const parentItem = helpers.getItemAt(parentIndex);
                                    if (parentItem) {
                                        selectItemAtIndex(parentItem);
                                        helpers.scrollToIndex(parentIndex);
                                    }
                                }
                            } else {
                                selectTaggedRootParent();
                            }
                        }
                    } else if (item.type === NavigationPaneItemType.UNTAGGED) {
                        selectTaggedRootParent();
                    } else if (item.type === NavigationPaneItemType.PROPERTY_KEY || item.type === NavigationPaneItemType.PROPERTY_VALUE) {
                        const propertyNode = item.data;

                        if (!collapseItem()) {
                            if (propertyNode.kind === 'value') {
                                const parentNodeId = buildPropertyKeyNodeId(propertyNode.key);
                                const parentIndex = resolveIndex(parentNodeId, ItemType.PROPERTY);
                                if (parentIndex >= 0) {
                                    const parentItem = helpers.getItemAt(parentIndex);
                                    if (parentItem) {
                                        selectItemAtIndex(parentItem);
                                        helpers.scrollToIndex(parentIndex);
                                    }
                                }
                            } else {
                                const parentIndex = resolveIndex(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, ItemType.PROPERTY);
                                if (parentIndex >= 0) {
                                    const parentItem = helpers.getItemAt(parentIndex);
                                    if (parentItem) {
                                        selectItemAtIndex(parentItem);
                                        helpers.scrollToIndex(parentIndex);
                                    }
                                }
                            }
                        }
                    } else if (isVirtualTagCollection(item) || isVirtualPropertyCollection(item)) {
                        collapseItem();
                    }
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.NAV_FOCUS_LIST)) {
                e.preventDefault();
                if (!uiState.singlePane) {
                    selectionDispatch({ type: 'SET_KEYBOARD_NAVIGATION', isKeyboardNavigation: true });
                }
                uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.DELETE_SELECTED)) {
                if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
                    e.preventDefault();
                    // Delete selected folder
                    runAsyncAction(() =>
                        deleteSelectedFolder({
                            app,
                            fileSystemOps,
                            settings,
                            visibility: { includeDescendantNotes, showHiddenItems },
                            selectionState,
                            selectionDispatch
                        })
                    );
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_HOME)) {
                e.preventDefault();
                targetIndex = getFirstSelectableIndex();
                if (targetIndex >= 0) {
                    shouldScrollToTop = true;
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_END)) {
                e.preventDefault();
                for (let i = items.length - 1; i >= 0; i--) {
                    const item = helpers.getItemAt(i);
                    if (item && isSelectableNavigationItem(item)) {
                        targetIndex = i;
                        break;
                    }
                }
            }

            if (targetIndex >= 0 && targetIndex < items.length) {
                const item = helpers.getItemAt(targetIndex);
                if (item && isSelectableNavigationItem(item)) {
                    selectItemAtIndex(item);
                    if (shouldScrollToTop) {
                        virtualizer.scrollToIndex(0, { align: 'start' });
                    }
                    helpers.scrollToIndex(targetIndex);
                }
            } else if (shouldScrollToTop) {
                virtualizer.scrollToIndex(0, { align: 'start' });
            }
        },
        [
            getCurrentIndex,
            settings,
            items.length,
            expansionState,
            expansionDispatch,
            uiState.singlePane,
            uiDispatch,
            selectionDispatch,
            resolveIndex,
            selectItemAtIndex,
            selectionState,
            app,
            commandQueue,
            plugin,
            fileSystemOps,
            virtualizer,
            includeDescendantNotes,
            showHiddenItems,
            onStartRename
        ]
    );

    // Use the base keyboard navigation hook
    useKeyboardNavigation({
        items,
        virtualizer,
        focusedPane: 'navigation',
        containerRef,
        isSelectable: isSelectableNavigationItem,
        _getCurrentIndex: getCurrentIndex,
        onKeyDown: handleKeyDown
    });
}
