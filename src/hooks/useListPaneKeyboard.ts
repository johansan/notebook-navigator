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
 * useListPaneKeyboard - Keyboard navigation for the list pane
 *
 * This hook handles list-specific keyboard interactions:
 * - File selection and navigation
 * - Multi-selection support (Shift+arrows, Cmd/Ctrl+A)
 * - Range selection (Shift+Home/End)
 * - File opening and deletion
 * - Tab/arrow navigation to editor or back to navigation pane
 * - Page navigation
 */

import { useCallback, useRef } from 'react';
import { TFile, FileView } from 'obsidian';
import { Virtualizer } from '@tanstack/react-virtual';
import { useFileSelection, useNavigationSelection, useSelectionDispatch, resolvePrimarySelectedFile } from '../context/SelectionContext';
import { useServices, useFileSystemOps } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useUIDispatch } from '../context/UIStateContext';
import { getSupportedLeaves, ListPaneItemType } from '../types';
import type { ListPaneItem } from '../types/virtualization';
import { deleteSelectedFiles } from '../utils/deleteOperations';
import { getFilesInRange, mergeFilesIntoSelection } from '../utils/selectionUtils';
import { useKeyboardNavigation, KeyboardNavigationHelpers } from './useKeyboardNavigation';
import { useMultiSelection } from './useMultiSelection';
import { useFileOpener } from './useFileOpener';
import { matchesShortcut, KeyboardShortcutAction } from '../utils/keyboardShortcuts';
import { runAsyncAction } from '../utils/async';
import { openFileInContext } from '../utils/openFileInContext';
import { isEnterKey, resolveKeyboardEnterAction } from '../utils/keyboardOpenContext';
import type { Align } from '../types/scroll';

/**
 * Check if a list item is selectable (file, not header or spacer)
 */
const isSelectableListItem = (item: ListPaneItem): boolean => {
    return item.type === ListPaneItemType.FILE;
};

interface UseListPaneKeyboardProps {
    /** Whether list pane keyboard handling is active */
    enabled?: boolean;
    /** List items to navigate through */
    items: ListPaneItem[];
    /** Virtualizer instance for scroll management */
    virtualizer: Virtualizer<HTMLDivElement, Element>;
    /** Container element for event attachment */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /** Map from file paths to their index in items */
    pathToIndex: Map<string, number>;
    /** Array of visible files in rendered order */
    orderedFiles: TFile[];
    /** Map from file paths to their position in visible file order */
    orderedFileIndexMap: Map<string, number>;
    /** Handler for selecting a file from keyboard actions */
    onSelectFile: (file: TFile, options?: { markKeyboardNavigation?: boolean; suppressOpen?: boolean; debounceOpen?: boolean }) => void;
    /** Scrolls a list index into view while accounting for list overlays */
    scrollToIndexSafely: (index: number, align: Align) => void;
    /** Keep debounced open aligned when selection cannot move (e.g. ArrowDown at end of list) */
    onScheduleKeyboardOpen?: () => void;
    /** Schedule a debounced open for a specific file (used for Shift+Arrow multi-selection) */
    onScheduleKeyboardOpenForFile?: (file: TFile) => void;
    /** Commit selection by opening the currently selected file */
    onCommitKeyboardOpen?: () => void;
    /** Reorder the selected property-sorted file block */
    onReorderPropertySort?: (direction: 'up' | 'down') => boolean;
    /** Starts inline rename for the current file when available */
    onStartRename?: () => boolean;
}

/**
 * Hook for keyboard navigation in the list pane.
 * Handles file-specific keyboard interactions and multi-selection.
 */
export function useListPaneKeyboard({
    enabled = true,
    items,
    virtualizer,
    containerRef,
    pathToIndex,
    orderedFiles,
    orderedFileIndexMap,
    onSelectFile,
    scrollToIndexSafely,
    onScheduleKeyboardOpen,
    onScheduleKeyboardOpenForFile,
    onCommitKeyboardOpen,
    onReorderPropertySort,
    onStartRename
}: UseListPaneKeyboardProps) {
    const { app, commandQueue, isMobile, tagTreeService, propertyTreeService } = useServices();
    const openFileInWorkspace = useFileOpener();
    const fileSystemOps = useFileSystemOps();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const fileSelection = useFileSelection();
    const fileSelectionRef = useRef(fileSelection);
    fileSelectionRef.current = fileSelection;
    const navigationSelection = useNavigationSelection();
    const navigationSelectionRef = useRef(navigationSelection);
    navigationSelectionRef.current = navigationSelection;
    const selectionDispatch = useSelectionDispatch();
    const uiDispatch = useUIDispatch();
    const { handleShiftArrowSelection, selectAll } = useMultiSelection();

    /**
     * Get current selection index
     */
    const getCurrentIndex = useCallback(() => {
        const selectedFile = fileSelectionRef.current.selectedFile;
        if (selectedFile?.path) {
            return pathToIndex.get(selectedFile.path) ?? -1;
        }
        return -1;
    }, [pathToIndex]);

    /**
     * Select item at given index
     */
    const selectItemAtIndex = useCallback(
        (item: ListPaneItem, options?: { suppressOpen?: boolean; debounceOpen?: boolean }) => {
            if (item.type === ListPaneItemType.FILE) {
                const file = item.data instanceof TFile ? item.data : null;
                if (!file) return;

                onSelectFile(file, {
                    markKeyboardNavigation: true,
                    suppressOpen: options?.suppressOpen,
                    debounceOpen: options?.debounceOpen
                });
            }
        },
        [onSelectFile]
    );

    /**
     * Handle range selection with Home/End
     */
    const handleRangeSelection = useCallback(
        (direction: 'home' | 'end', currentFileIndex: number) => {
            const targetIndex = direction === 'home' ? 0 : orderedFiles.length - 1;
            const targetFile = orderedFiles[targetIndex];
            if (!targetFile) return;

            // Get files in range
            const filesInRange = getFilesInRange(
                orderedFiles,
                direction === 'home' ? 0 : currentFileIndex,
                direction === 'home' ? currentFileIndex : orderedFiles.length - 1
            );

            const currentFileSelection = fileSelectionRef.current;
            const { selectedFiles, changed: selectionChanged } = mergeFilesIntoSelection(currentFileSelection.selectedFiles, filesInRange);

            // Move cursor to target position
            selectionDispatch({
                type: 'APPLY_FILE_SELECTION',
                selectedFiles,
                selectedFile: targetFile,
                lastMovementDirection: selectionChanged ? null : currentFileSelection.lastMovementDirection
            });

            // Open the file without changing focus
            if (!settings.enterToOpenFiles) {
                openFileInWorkspace(targetFile);
            }

            if (direction === 'home') {
                virtualizer.scrollToIndex(0, { align: 'start' });
                return;
            }

            const targetListIndex = pathToIndex.get(targetFile.path);
            if (targetListIndex !== undefined) {
                scrollToIndexSafely(targetListIndex, 'auto');
            }
        },
        [orderedFiles, selectionDispatch, settings.enterToOpenFiles, openFileInWorkspace, virtualizer, pathToIndex, scrollToIndexSafely]
    );

    /**
     * List pane-specific keyboard handler
     */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent, helpers: KeyboardNavigationHelpers<ListPaneItem>) => {
            if (!enabled) {
                return;
            }

            const currentIndex = getCurrentIndex();
            const currentFileSelection = fileSelectionRef.current;
            const shortcuts = settings.keyboardShortcuts;
            const isRTL = helpers.isRTL();
            let targetIndex = -1;
            // Tracks whether to scroll to the top of the list after selection
            let shouldScrollToTop = false;
            /**
             * Whether ListPane should debounce opening the selected file.
             *
             * Selection changes happen on keydown, but opening the file can be delayed to avoid
             * `leaf.openFile(...)` on every step during rapid navigation.
             *
             * The debounced open path is used only for the physical Arrow/Page keys:
             * - ArrowUp / ArrowDown -> move by one selectable item
             * - PageUp / PageDown -> jump by a "page" of items
             *
             * When the same actions are triggered via custom shortcut bindings (e.g. mapping `j`
             * to move down), `e.key` is not an Arrow/Page key and we do not debounce.
             */
            let shouldDebounceOpen = false;

            // Returns the index of the first selectable item in the list
            const getFirstSelectableIndex = () => helpers.findNextIndex(-1);
            const getVisibleSelectablePageSize = () => {
                const virtualItems = virtualizer.getVirtualItems();
                const scrollElement = virtualizer.scrollElement;
                if (virtualItems.length === 0 || !scrollElement) {
                    return helpers.getPageSize();
                }

                const viewportStart = virtualizer.scrollOffset ?? scrollElement.scrollTop;
                const viewportEnd = viewportStart + scrollElement.clientHeight;
                let visibleSelectableCount = 0;

                for (const virtualItem of virtualItems) {
                    const item = helpers.getItemAt(virtualItem.index);
                    if (!item || !isSelectableListItem(item)) {
                        continue;
                    }

                    const itemStart = virtualItem.start;
                    const itemEnd = itemStart + virtualItem.size;
                    if (itemEnd > viewportStart && itemStart < viewportEnd) {
                        visibleSelectableCount += 1;
                    }
                }

                if (visibleSelectableCount === 0) {
                    return helpers.getPageSize();
                }

                // Keep one selectable row visible beyond the target so paging preserves visual context.
                return Math.max(1, visibleSelectableCount - 2);
            };

            const findSelectablePageTarget = (startIndex: number, direction: 'up' | 'down') => {
                const pageSize = getVisibleSelectablePageSize();
                let targetIndex = startIndex;

                for (let remaining = pageSize; remaining > 0; remaining -= 1) {
                    const nextIndex = direction === 'down' ? helpers.findNextIndex(targetIndex) : helpers.findPreviousIndex(targetIndex);
                    if (nextIndex < 0 || nextIndex === targetIndex) {
                        break;
                    }

                    targetIndex = nextIndex;
                }

                return targetIndex;
            };

            if (settings.enterToOpenFiles && isEnterKey(e)) {
                const action = resolveKeyboardEnterAction(e, settings);
                if (action === 'rename') {
                    e.preventDefault();
                    onStartRename?.();
                    return;
                }

                const selectedFile = resolvePrimarySelectedFile(app, currentFileSelection);
                if (!selectedFile) {
                    return;
                }

                e.preventDefault();

                if (action) {
                    runAsyncAction(() =>
                        openFileInContext({
                            app,
                            commandQueue,
                            file: selectedFile,
                            context: action,
                            active: false
                        })
                    );
                    return;
                }

                openFileInWorkspace(selectedFile);
                return;
            }

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_RENAME) && onStartRename?.()) {
                e.preventDefault();
                return;
            }

            const openFileFromShiftSelection = (file: TFile, shouldDebounceOpen: boolean) => {
                // Debounce workspace opens while holding ArrowUp/ArrowDown so keyup can commit the final selection.
                if (shouldDebounceOpen && onScheduleKeyboardOpenForFile) {
                    onScheduleKeyboardOpenForFile(file);
                    return;
                }
                openFileInWorkspace(file);
            };

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_MANUAL_SORT_DOWN)) {
                if (onReorderPropertySort?.('down') === true) {
                    e.preventDefault();
                    return;
                }
            }

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_MANUAL_SORT_UP)) {
                if (onReorderPropertySort?.('up') === true) {
                    e.preventDefault();
                    return;
                }
            }

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_EXTEND_SELECTION_DOWN)) {
                e.preventDefault();
                if (!isMobile && currentFileSelection.selectedFile?.path) {
                    const currentFileIndex = orderedFileIndexMap.get(currentFileSelection.selectedFile.path);
                    if (currentFileIndex !== undefined && currentFileIndex !== -1) {
                        // Only debounce workspace opens for physical arrow keys so keyup can commit the final selection.
                        const shouldDebounceOpen = e.key === 'ArrowDown';
                        const finalFileIndex = handleShiftArrowSelection('down', currentFileIndex, orderedFiles, {
                            openFile: file => openFileFromShiftSelection(file, shouldDebounceOpen)
                        });
                        if (finalFileIndex === -1 && shouldDebounceOpen) {
                            // No movement possible (end of list). Keep the pending debounced open aligned with the current selection.
                            onScheduleKeyboardOpen?.();
                        }
                        if (finalFileIndex >= 0) {
                            const finalFile = orderedFiles[finalFileIndex];
                            const itemIndex = pathToIndex.get(finalFile.path);
                            if (itemIndex !== undefined) {
                                scrollToIndexSafely(itemIndex, 'auto');
                            }
                        }
                    }
                }
                return;
            }

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_EXTEND_SELECTION_UP)) {
                e.preventDefault();
                if (!isMobile && currentFileSelection.selectedFile?.path) {
                    const currentFileIndex = orderedFileIndexMap.get(currentFileSelection.selectedFile.path);
                    if (currentFileIndex !== undefined && currentFileIndex !== -1) {
                        // Only debounce workspace opens for physical arrow keys so keyup can commit the final selection.
                        const shouldDebounceOpen = e.key === 'ArrowUp';
                        const finalFileIndex = handleShiftArrowSelection('up', currentFileIndex, orderedFiles, {
                            openFile: file => openFileFromShiftSelection(file, shouldDebounceOpen)
                        });
                        if (finalFileIndex === -1 && shouldDebounceOpen) {
                            // No movement possible (top of list). Keep the pending debounced open aligned with the current selection.
                            onScheduleKeyboardOpen?.();
                        }
                        if (finalFileIndex >= 0) {
                            const finalFile = orderedFiles[finalFileIndex];
                            const itemIndex = pathToIndex.get(finalFile.path);
                            if (itemIndex !== undefined) {
                                scrollToIndexSafely(itemIndex, 'auto');
                            }
                        }
                    }
                }
                return;
            }

            if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_MOVE_DOWN)) {
                e.preventDefault();
                targetIndex = helpers.findNextIndex(currentIndex);
                if (targetIndex === currentIndex && currentIndex >= 0) {
                    if (e.key === 'ArrowDown') {
                        // No movement possible, but ArrowDown is still a keyboard-navigation signal.
                        // Schedule a debounced open for the current selection so keyup can commit it.
                        onScheduleKeyboardOpen?.();
                    }
                    return;
                }
                shouldDebounceOpen = e.key === 'ArrowDown';
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_MOVE_UP)) {
                e.preventDefault();
                if (currentIndex === -1) {
                    targetIndex = helpers.findNextIndex(-1);
                } else {
                    targetIndex = helpers.findPreviousIndex(currentIndex);
                    if (targetIndex === currentIndex && currentIndex >= 0) {
                        if (e.key === 'ArrowUp') {
                            // No movement possible, but ArrowUp is still a keyboard-navigation signal.
                            // Schedule a debounced open for the current selection so keyup can commit it.
                            onScheduleKeyboardOpen?.();
                        }
                        return;
                    }
                }
                shouldDebounceOpen = e.key === 'ArrowUp';
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_PAGE_DOWN)) {
                e.preventDefault();
                if (currentIndex !== -1) {
                    targetIndex = findSelectablePageTarget(currentIndex, 'down');
                }
                shouldDebounceOpen = e.key === 'PageDown';
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_PAGE_UP)) {
                e.preventDefault();
                const firstSelectableIndex = getFirstSelectableIndex();

                if (currentIndex === -1) {
                    targetIndex = firstSelectableIndex;
                    if (firstSelectableIndex >= 0) {
                        shouldScrollToTop = true;
                    }
                } else {
                    const nearestSelectable = findSelectablePageTarget(currentIndex, 'up');

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
                shouldDebounceOpen = e.key === 'PageUp';
            } else if (
                matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_FOCUS_EDITOR, {
                    isRTL,
                    directional: 'horizontal'
                })
            ) {
                if (currentFileSelection.selectedFile) {
                    e.preventDefault();
                    const leaves = getSupportedLeaves(app);
                    const targetLeaf = leaves.find(leaf => {
                        const view = leaf.view;
                        return view instanceof FileView && view.file?.path === currentFileSelection.selectedFile?.path;
                    });
                    if (targetLeaf) {
                        app.workspace.setActiveLeaf(targetLeaf, { focus: true });
                    }
                }
            } else if (
                matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_FOCUS_NAVIGATION, {
                    isRTL,
                    directional: 'horizontal'
                })
            ) {
                e.preventDefault();
                uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.DELETE_SELECTED)) {
                if (currentFileSelection.selectedFile || currentFileSelection.selectedFiles.size > 0) {
                    e.preventDefault();
                    const selectionStateForDelete = {
                        ...navigationSelectionRef.current,
                        selectedFiles: currentFileSelection.selectedFiles,
                        selectedFile: currentFileSelection.selectedFile
                    };
                    // Delete selected files
                    runAsyncAction(() =>
                        deleteSelectedFiles({
                            app,
                            fileSystemOps,
                            settings,
                            visibility: { includeDescendantNotes, showHiddenItems },
                            selectionState: selectionStateForDelete,
                            selectionDispatch,
                            tagTreeService,
                            propertyTreeService,
                            orderedFiles
                        })
                    );
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_SELECT_ALL)) {
                e.preventDefault();
                const allFiles = items
                    .filter(item => item.type === ListPaneItemType.FILE)
                    .map(item => {
                        const fileItem = item;
                        return fileItem.data instanceof TFile ? fileItem.data : null;
                    })
                    .filter((file): file is TFile => file !== null);

                selectAll(allFiles);
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_RANGE_TO_START)) {
                e.preventDefault();
                if (!isMobile && currentFileSelection.selectedFile?.path) {
                    const currentFileIndex = orderedFileIndexMap.get(currentFileSelection.selectedFile.path);
                    if (currentFileIndex !== undefined && currentFileIndex !== -1) {
                        handleRangeSelection('home', currentFileIndex);
                    }
                }
                return;
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.LIST_RANGE_TO_END)) {
                e.preventDefault();
                if (!isMobile && currentFileSelection.selectedFile?.path) {
                    const currentFileIndex = orderedFileIndexMap.get(currentFileSelection.selectedFile.path);
                    if (currentFileIndex !== undefined && currentFileIndex !== -1) {
                        handleRangeSelection('end', currentFileIndex);
                    }
                }
                return;
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_HOME)) {
                e.preventDefault();
                const firstSelectableIndex = getFirstSelectableIndex();
                targetIndex = firstSelectableIndex;
                if (firstSelectableIndex >= 0) {
                    shouldScrollToTop = true;
                }
            } else if (matchesShortcut(e, shortcuts, KeyboardShortcutAction.PANE_END)) {
                e.preventDefault();
                for (let i = items.length - 1; i >= 0; i--) {
                    const item = helpers.getItemAt(i);
                    if (item && isSelectableListItem(item)) {
                        targetIndex = i;
                        break;
                    }
                }
            }

            if (targetIndex >= 0 && targetIndex < items.length) {
                const item = helpers.getItemAt(targetIndex);
                if (item && isSelectableListItem(item)) {
                    selectItemAtIndex(item, { debounceOpen: shouldDebounceOpen });
                    if (shouldScrollToTop) {
                        virtualizer.scrollToIndex(0, { align: 'start' });
                    } else {
                        scrollToIndexSafely(targetIndex, 'auto');
                    }
                }
            } else if (shouldScrollToTop) {
                virtualizer.scrollToIndex(0, { align: 'start' });
            }
        },
        [
            getCurrentIndex,
            enabled,
            settings,
            isMobile,
            orderedFileIndexMap,
            handleShiftArrowSelection,
            orderedFiles,
            pathToIndex,
            app,
            commandQueue,
            uiDispatch,
            fileSystemOps,
            tagTreeService,
            propertyTreeService,
            selectionDispatch,
            selectAll,
            selectItemAtIndex,
            handleRangeSelection,
            items,
            virtualizer,
            includeDescendantNotes,
            showHiddenItems,
            openFileInWorkspace,
            onScheduleKeyboardOpen,
            onScheduleKeyboardOpenForFile,
            onReorderPropertySort,
            onStartRename,
            scrollToIndexSafely
        ]
    );

    const handleKeyUp = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled) {
                return;
            }
            if (!onCommitKeyboardOpen) {
                return;
            }

            // Shift is allowed so Shift+Arrow range selection can commit the final debounced open on keyup.
            if (e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }

            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'PageUp' && e.key !== 'PageDown') {
                return;
            }

            // Commit the last pending debounced open so the final selection opens immediately.
            onCommitKeyboardOpen();
        },
        [enabled, onCommitKeyboardOpen]
    );

    // Use the base keyboard navigation hook
    useKeyboardNavigation({
        items,
        virtualizer,
        focusedPane: 'files',
        containerRef,
        isSelectable: isSelectableListItem,
        _getCurrentIndex: getCurrentIndex,
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp
    });
}
