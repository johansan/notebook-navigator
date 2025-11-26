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

// src/components/NotebookNavigatorComponent.tsx
import React, { useEffect, useImperativeHandle, forwardRef, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { TFile, TFolder } from 'obsidian';
import { useSelectionState, useSelectionDispatch } from '../context/SelectionContext';
import { useServices } from '../context/ServicesContext';
import { useSettingsState, useSettingsUpdate } from '../context/SettingsContext';
import { useUIState, useUIDispatch } from '../context/UIStateContext';
import { useShortcuts } from '../context/ShortcutsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useDragNavigationPaneActivation } from '../hooks/useDragNavigationPaneActivation';
import { useNavigatorReveal, type RevealFileOptions, type NavigateToFolderOptions } from '../hooks/useNavigatorReveal';
import { useNavigatorEventHandlers } from '../hooks/useNavigatorEventHandlers';
import { useResizablePane } from '../hooks/useResizablePane';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { useMobileSwipeNavigation } from '../hooks/useSwipeGesture';
import { useTagNavigation } from '../hooks/useTagNavigation';
import { useFileCache } from '../context/StorageContext';
import { strings } from '../i18n';
import { runAsyncAction } from '../utils/async';
import { useUpdateNotice } from '../hooks/useUpdateNotice';
import { FolderSuggestModal } from '../modals/FolderSuggestModal';
import { TagSuggestModal } from '../modals/TagSuggestModal';
import { FILE_PANE_DIMENSIONS, ItemType, NAVPANE_MEASUREMENTS, type BackgroundMode, type DualPaneOrientation } from '../types';
import { getSelectedPath, getFilesForSelection } from '../utils/selectionUtils';
import { normalizeNavigationPath } from '../utils/navigationIndex';
import { deleteSelectedFiles, deleteSelectedFolder } from '../utils/deleteOperations';
import { localStorage } from '../utils/localStorage';
import { calculateCompactListMetrics } from '../utils/listPaneMetrics';
import { getNavigationPaneSizing } from '../utils/paneSizing';
import { getBackgroundClasses } from '../utils/paneLayout';
import { confirmRemoveAllTagsFromFiles, openAddTagToFilesModal, removeTagFromFilesWithPrompt } from '../utils/tagModalHelpers';
import { useNavigatorScale } from '../hooks/useNavigatorScale';
import { ListPane } from './ListPane';
import type { ListPaneHandle } from './ListPane';
import { NavigationPane } from './NavigationPane';
import type { NavigationPaneHandle } from './NavigationPane';
import type { SearchShortcut } from '../types/shortcuts';
import { UpdateNoticeBanner } from './UpdateNoticeBanner';
import { UpdateNoticeIndicator } from './UpdateNoticeIndicator';
import { showNotice } from '../utils/noticeUtils';
import { EMPTY_SEARCH_TAG_FILTER_STATE, type SearchTagFilterState } from '../types/search';
import { getListPaneMeasurements } from '../utils/listPaneMeasurements';

// Checks if two string arrays have identical content in the same order
const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a === b) {
        return true;
    }
    if (a.length !== b.length) {
        return false;
    }
    for (let index = 0; index < a.length; index += 1) {
        if (a[index] !== b[index]) {
            return false;
        }
    }
    return true;
};

export interface NotebookNavigatorHandle {
    // Navigates to a file by revealing it in its actual parent folder
    navigateToFile: (file: TFile, options?: RevealFileOptions) => void;
    // Reveals a file while preserving the current navigation context when possible
    revealFileInNearestFolder: (file: TFile, options?: RevealFileOptions) => void;
    focusVisiblePane: () => void;
    focusNavigationPane: () => void;
    refresh: () => void;
    deleteActiveFile: () => void;
    createNoteInSelectedFolder: () => Promise<void>;
    moveSelectedFiles: () => Promise<void>;
    addShortcutForCurrentSelection: () => Promise<void>;
    navigateToFolder: (folderPath: string, options?: NavigateToFolderOptions) => void;
    navigateToFolderWithModal: () => void;
    navigateToTagWithModal: () => void;
    addTagToSelectedFiles: () => Promise<void>;
    removeTagFromSelectedFiles: () => Promise<void>;
    removeAllTagsFromSelectedFiles: () => Promise<void>;
    toggleSearch: () => void;
    isSearchOpen: () => boolean;
    focusSearch: () => void;
    triggerCollapse: () => void;
    stopContentProcessing: () => void;
    rebuildCache: () => Promise<void>;
    selectNextFile: () => Promise<boolean>;
    selectPreviousFile: () => Promise<boolean>;
}

/**
 * Main container component for the Notebook Navigator plugin.
 * Provides a two-pane layout with resizable divider, folder tree on the left,
 * and file list on the right. Manages keyboard navigation, drag-and-drop,
 * and auto-reveal functionality for the active file.
 *
 * @param _ - Props (none used)
 * @param ref - Forwarded ref exposing navigation helpers and focus methods
 * @returns A split-pane container with folder tree and file list
 */
export const NotebookNavigatorComponent = React.memo(
    forwardRef<NotebookNavigatorHandle>(function NotebookNavigatorComponent(_, ref) {
        const { app, isMobile, fileSystemOps, plugin, tagTreeService, commandQueue, tagOperations } = useServices();
        const settings = useSettingsState();
        const uxPreferences = useUXPreferences();
        const uxRef = useRef(uxPreferences);
        useEffect(() => {
            uxRef.current = uxPreferences;
        }, [uxPreferences]);
        // Get active orientation from settings
        const orientation: DualPaneOrientation = settings.dualPaneOrientation;
        // Get background modes for desktop and mobile layouts
        const desktopBackground: BackgroundMode = settings.desktopBackground ?? 'separate';
        const mobileBackground: BackgroundMode = settings.mobileBackground ?? 'primary';
        const {
            scale: uiScale,
            style: scaleWrapperStyle,
            dataAttr: scaleWrapperDataAttr
        } = useNavigatorScale({
            isMobile,
            desktopScale: settings.desktopScale,
            mobileScale: settings.mobileScale
        });
        // Retrieve sizing config based on current orientation
        const {
            minSize: navigationPaneMinSize,
            defaultSize: navigationPaneDefaultSize,
            storageKey: navigationPaneStorageKey
        } = getNavigationPaneSizing(orientation);
        const selectionState = useSelectionState();
        const selectionDispatch = useSelectionDispatch();
        const uiState = useUIState();
        const uiDispatch = useUIDispatch();
        const { addFolderShortcut, addNoteShortcut, addTagShortcut } = useShortcuts();
        const { stopAllProcessing, rebuildCache } = useFileCache();
        const { notice: updateNotice, markAsDisplayed } = useUpdateNotice();
        // Keep stable references to avoid stale closures in imperative handles
        const stopProcessingRef = useRef(stopAllProcessing);
        useEffect(() => {
            stopProcessingRef.current = stopAllProcessing;
        }, [stopAllProcessing]);
        const rebuildCacheRef = useRef(rebuildCache);
        useEffect(() => {
            rebuildCacheRef.current = rebuildCache;
        }, [rebuildCache]);

        // Root container reference for the entire navigator
        // This ref is passed to both NavigationPane and ListPane to ensure
        // keyboard events are captured at the navigator level, not globally.
        // This prevents interference with other Obsidian views (e.g., canvas editor).
        const containerRef = useRef<HTMLDivElement>(null);

        const [isNavigatorFocused, setIsNavigatorFocused] = useState(false);
        // Tracks tag-related search tokens for highlighting tags in navigation pane
        const [searchTagFilters, setSearchTagFilters] = useState<SearchTagFilterState>(EMPTY_SEARCH_TAG_FILTER_STATE);
        const navigationPaneRef = useRef<NavigationPaneHandle>(null);
        const listPaneRef = useRef<ListPaneHandle>(null);

        // Updates search tag filters only when values actually change to avoid unnecessary re-renders
        const handleSearchTokensChange = useCallback((next: SearchTagFilterState) => {
            setSearchTagFilters(prev => {
                // Skip update if all values match
                if (
                    prev.excludeTagged === next.excludeTagged &&
                    prev.includeUntagged === next.includeUntagged &&
                    prev.requireTagged === next.requireTagged &&
                    arraysEqual(prev.include, next.include) &&
                    arraysEqual(prev.exclude, next.exclude)
                ) {
                    return prev;
                }

                // Create new state with cloned arrays to prevent mutation
                return {
                    include: next.include.slice(),
                    exclude: next.exclude.slice(),
                    excludeTagged: next.excludeTagged,
                    includeUntagged: next.includeUntagged,
                    requireTagged: next.requireTagged
                };
            });
        }, []);

        // Executes a search shortcut by delegating to the list pane component
        const handleSearchShortcutExecution = useCallback(async (_shortcutKey: string, searchShortcut: SearchShortcut) => {
            const listHandle = listPaneRef.current;
            if (!listHandle) {
                return;
            }
            await listHandle.executeSearchShortcut({ searchShortcut });
        }, []);

        // Enable resizable pane
        const { paneSize, isResizing, resizeHandleProps } = useResizablePane({
            orientation,
            initialSize: navigationPaneDefaultSize,
            min: navigationPaneMinSize,
            storageKey: navigationPaneStorageKey,
            scale: uiScale
        });

        // Get updateSettings from SettingsContext for refresh
        const updateSettings = useSettingsUpdate();

        // Tracks whether initial dual/single pane check has been performed
        const hasCheckedInitialVisibility = useRef(false);

        // Ref callback that stores the navigator root element
        const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
            containerRef.current = node;
        }, []);

        // Checks container width on first render to determine dual/single pane layout
        useLayoutEffect(() => {
            if (isMobile || orientation === 'vertical') {
                return;
            }

            if (hasCheckedInitialVisibility.current) {
                return;
            }

            const savedWidth = localStorage.get<number>(navigationPaneStorageKey);
            if (savedWidth) {
                hasCheckedInitialVisibility.current = true;
                return;
            }

            const node = containerRef.current;
            if (!node) {
                return;
            }

            hasCheckedInitialVisibility.current = true;

            const containerWidth = node.getBoundingClientRect().width;
            if (containerWidth < paneSize + FILE_PANE_DIMENSIONS.minWidth) {
                plugin.setDualPanePreference(false);
            }
        }, [isMobile, orientation, paneSize, plugin, navigationPaneStorageKey]);

        // Determine CSS classes
        const containerClasses = ['nn-split-container'];

        const hasInitializedSinglePane = useRef(false);
        const preferredSinglePaneView = useRef<'navigation' | 'files'>(settings.startView === 'navigation' ? 'navigation' : 'files');

        // Switch to preferred view when entering single pane (desktop only)
        useEffect(() => {
            if (isMobile) {
                return;
            }

            if (uiState.dualPane) {
                hasInitializedSinglePane.current = false;
                return;
            }

            if (hasInitializedSinglePane.current) {
                return;
            }

            hasInitializedSinglePane.current = true;
            const preferredView = preferredSinglePaneView.current;

            uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: preferredView });
            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: preferredView });
        }, [isMobile, uiDispatch, uiState.dualPane]);

        // Enable drag and drop only on desktop
        useDragAndDrop(containerRef);

        // Switches to navigation pane when dragging starts in single pane mode
        const handleDragActivateNavigation = useCallback(() => {
            if (!uiState.singlePane) {
                return;
            }
            uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: 'navigation' });
            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'navigation' });
        }, [uiDispatch, uiState.singlePane]);

        // Restores file list view when drag ends in single pane mode
        const handleDragRestoreFiles = useCallback(() => {
            if (!uiState.singlePane) {
                return;
            }

            if (uiState.currentSinglePaneView !== 'navigation') {
                return;
            }

            uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: 'files' });
            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
        }, [uiDispatch, uiState.singlePane, uiState.currentSinglePaneView]);

        useDragNavigationPaneActivation({
            containerRef,
            isMobile,
            isSinglePane: uiState.singlePane,
            isFilesView: uiState.currentSinglePaneView === 'files',
            onActivateNavigation: handleDragActivateNavigation,
            onRestoreFiles: handleDragRestoreFiles
        });

        // Enable mobile swipe gestures
        useMobileSwipeNavigation(containerRef, isMobile);

        // Use event handlers
        useNavigatorEventHandlers({
            app,
            containerRef,
            setIsNavigatorFocused
        });

        // Handle auxiliary mouse buttons for desktop single-pane switching
        useEffect(() => {
            if (isMobile) {
                return;
            }

            const container = containerRef.current;
            if (!container) {
                return;
            }

            const handleAuxClick = (event: MouseEvent) => {
                if (event.button !== 3 && event.button !== 4) {
                    return;
                }

                if (!uiState.singlePane) {
                    return;
                }

                event.preventDefault();

                if (uiState.focusedPane === 'search') {
                    return;
                }

                const targetView = event.button === 3 ? 'navigation' : 'files';

                if (uiState.currentSinglePaneView === targetView) {
                    return;
                }

                uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: targetView });
                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: targetView });
            };

            container.addEventListener('auxclick', handleAuxClick);

            return () => {
                container.removeEventListener('auxclick', handleAuxClick);
            };
        }, [containerRef, isMobile, uiDispatch, uiState.currentSinglePaneView, uiState.focusedPane, uiState.singlePane]);

        // Get navigation actions
        const { handleExpandCollapseAll } = useNavigationActions();

        const focusPane = useCallback(
            (pane: 'files' | 'navigation', options?: { updateSinglePaneView?: boolean }) => {
                const isOpeningVersionHistory = commandQueue?.isOpeningVersionHistory() || false;
                const isOpeningInNewContext = commandQueue?.isOpeningInNewContext() || false;

                if (uiState.singlePane && options?.updateSinglePaneView && uiState.currentSinglePaneView !== pane) {
                    uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: pane });
                }

                if (uiState.focusedPane !== pane) {
                    uiDispatch({ type: 'SET_FOCUSED_PANE', pane });
                }

                if (!isOpeningVersionHistory && !isOpeningInNewContext) {
                    containerRef.current?.focus();
                }
            },
            [commandQueue, uiDispatch, uiState.singlePane, uiState.currentSinglePaneView, uiState.focusedPane]
        );

        const focusNavigationPaneCallback = useCallback(
            (options?: { updateSinglePaneView?: boolean }) => {
                const updateSinglePaneView = options?.updateSinglePaneView ?? uiState.singlePane;
                focusPane('navigation', { updateSinglePaneView });
            },
            [focusPane, uiState.singlePane]
        );

        const focusFilesPaneCallback = useCallback(
            (options?: { updateSinglePaneView?: boolean }) => {
                const updateSinglePaneView = options?.updateSinglePaneView ?? uiState.singlePane;
                focusPane('files', { updateSinglePaneView });
            },
            [focusPane, uiState.singlePane]
        );

        // Use navigator reveal logic
        const { revealFileInActualFolder, revealFileInNearestFolder, navigateToFolder, revealTag } = useNavigatorReveal({
            app,
            navigationPaneRef,
            listPaneRef,
            focusNavigationPane: focusNavigationPaneCallback,
            focusFilesPane: focusFilesPaneCallback
        });

        // Use tag navigation logic
        const { navigateToTag } = useTagNavigation();

        // Handles file reveal from shortcuts, using nearest folder navigation
        const handleShortcutNoteReveal = useCallback(
            (file: TFile) => {
                revealFileInNearestFolder(file, { source: 'shortcut' });
            },
            [revealFileInNearestFolder]
        );

        // Expose methods via ref
        useImperativeHandle(ref, () => {
            // Retrieves currently selected files or falls back to single selected file
            const getSelectedFiles = (): TFile[] => {
                // Get selected files
                const selectedFiles = Array.from(selectionState.selectedFiles)
                    .map(path => app.vault.getFileByPath(path))
                    .filter((f): f is TFile => !!f);

                if (selectedFiles.length === 0) {
                    // No files selected, try current file
                    if (selectionState.selectedFile) {
                        selectedFiles.push(selectionState.selectedFile);
                    }
                }

                return selectedFiles;
            };

            // Routes adjacent file selection requests through the list pane reference
            const navigateToAdjacentFile = (direction: 'next' | 'previous'): boolean => {
                const listHandle = listPaneRef.current;
                if (!listHandle) {
                    return false;
                }
                return listHandle.selectAdjacentFile(direction);
            };

            return {
                // Forward to the manual reveal implementation
                navigateToFile: (file: TFile, options?: RevealFileOptions) => {
                    revealFileInActualFolder(file, options);
                },
                // Forward to the auto reveal implementation
                revealFileInNearestFolder: (file: TFile, options?: RevealFileOptions) => {
                    revealFileInNearestFolder(file, options);
                },
                focusVisiblePane: () => {
                    if (uiState.singlePane) {
                        focusPane(uiState.currentSinglePaneView);
                    } else {
                        focusPane('files');
                    }
                },
                focusNavigationPane: focusNavigationPaneCallback,
                stopContentProcessing: () => {
                    try {
                        stopProcessingRef.current?.();
                    } catch (e) {
                        console.error('Failed to stop content processing:', e);
                    }
                },
                rebuildCache: async () => {
                    // Trigger complete cache rebuild from storage context
                    await rebuildCacheRef.current?.();
                },
                // Select adjacent files via command palette actions
                selectNextFile: async () => navigateToAdjacentFile('next'),
                selectPreviousFile: async () => navigateToAdjacentFile('previous'),
                refresh: () => {
                    // A no-op update will increment the version and force a re-render
                    runAsyncAction(() => updateSettings(() => {}));
                },
                // Delete focused file based on current pane (files or navigation)
                deleteActiveFile: () => {
                    runAsyncAction(async () => {
                        // Delete files from list pane
                        if (uiState.focusedPane === 'files' && (selectionState.selectedFile || selectionState.selectedFiles.size > 0)) {
                            await deleteSelectedFiles({
                                app,
                                fileSystemOps,
                                settings,
                                visibility: {
                                    includeDescendantNotes: uxRef.current.includeDescendantNotes,
                                    showHiddenItems: uxRef.current.showHiddenItems
                                },
                                selectionState,
                                selectionDispatch,
                                tagTreeService
                            });
                            return;
                        }

                        // Delete folder from navigation pane
                        if (
                            uiState.focusedPane === 'navigation' &&
                            selectionState.selectionType === ItemType.FOLDER &&
                            selectionState.selectedFolder
                        ) {
                            await deleteSelectedFolder({
                                app,
                                fileSystemOps,
                                settings,
                                visibility: {
                                    includeDescendantNotes: uxRef.current.includeDescendantNotes,
                                    showHiddenItems: uxRef.current.showHiddenItems
                                },
                                selectionState,
                                selectionDispatch
                            });
                        }
                    });
                },
                createNoteInSelectedFolder: async () => {
                    if (!selectionState.selectedFolder) {
                        showNotice(strings.fileSystem.errors.noFolderSelected, { variant: 'warning' });
                        return;
                    }

                    // Use the same logic as the context menu
                    await fileSystemOps.createNewFile(selectionState.selectedFolder);
                },
                moveSelectedFiles: async () => {
                    // Get selected files
                    const selectedFiles = getSelectedFiles();

                    if (selectedFiles.length === 0) {
                        showNotice(strings.fileSystem.errors.noFileSelected, { variant: 'warning' });
                        return;
                    }

                    // Get all files in the current view for smart selection
                    const allFiles = getFilesForSelection(
                        selectionState,
                        settings,
                        {
                            includeDescendantNotes: uxRef.current.includeDescendantNotes,
                            showHiddenItems: uxRef.current.showHiddenItems
                        },
                        app,
                        tagTreeService
                    );

                    // Move files with modal
                    await fileSystemOps.moveFilesWithModal(selectedFiles, {
                        selectedFile: selectionState.selectedFile,
                        dispatch: selectionDispatch,
                        allFiles
                    });
                },
                addShortcutForCurrentSelection: async () => {
                    // Try selected files first
                    const selectedFiles = getSelectedFiles();
                    if (selectedFiles.length > 0) {
                        await addNoteShortcut(selectedFiles[0].path);
                        return;
                    }

                    // Try selected tag
                    if (selectionState.selectedTag) {
                        await addTagShortcut(selectionState.selectedTag);
                        return;
                    }

                    // Try selected folder
                    if (selectionState.selectedFolder) {
                        await addFolderShortcut(selectionState.selectedFolder.path);
                        return;
                    }

                    // Fall back to active file
                    const activeFile = app.workspace.getActiveFile();
                    if (activeFile) {
                        await addNoteShortcut(activeFile.path);
                        return;
                    }

                    // Show error if nothing is selected
                    showNotice(strings.common.noSelection, { variant: 'warning' });
                },
                navigateToFolder,
                navigateToFolderWithModal: () => {
                    // Show the folder selection modal for navigation
                    const modal = new FolderSuggestModal(
                        app,
                        (targetFolder: TFolder) => {
                            // Navigate to the selected folder
                            navigateToFolder(targetFolder.path, { preserveNavigationFocus: true });
                        },
                        strings.modals.folderSuggest.navigatePlaceholder,
                        strings.modals.folderSuggest.instructions.select,
                        undefined // No folders to exclude
                    );
                    modal.open();
                },
                navigateToTagWithModal: () => {
                    // Show the tag selection modal for navigation
                    const modal = new TagSuggestModal(
                        app,
                        plugin,
                        (tagPath: string) => {
                            // Use the shared tag navigation logic
                            navigateToTag(tagPath);
                        },
                        strings.modals.tagSuggest.navigatePlaceholder,
                        strings.modals.tagSuggest.instructions.select,
                        true, // Include untagged option
                        false // Do not allow creating tags for navigation
                    );
                    modal.open();
                },
                addTagToSelectedFiles: async () => {
                    if (!tagOperations) {
                        showNotice(strings.fileSystem.notifications.tagOperationsNotAvailable, { variant: 'warning' });
                        return;
                    }

                    // Get selected files
                    const selectedFiles = getSelectedFiles();
                    if (selectedFiles.length === 0) {
                        showNotice(strings.fileSystem.notifications.noFilesSelected, { variant: 'warning' });
                        return;
                    }

                    // Show tag selection modal
                    openAddTagToFilesModal({
                        app,
                        plugin,
                        tagOperations,
                        files: selectedFiles
                    });
                },
                removeTagFromSelectedFiles: async () => {
                    if (!tagOperations) {
                        showNotice(strings.fileSystem.notifications.tagOperationsNotAvailable, { variant: 'warning' });
                        return;
                    }

                    // Get selected files
                    const selectedFiles = getSelectedFiles();
                    if (selectedFiles.length === 0) {
                        showNotice(strings.fileSystem.notifications.noFilesSelected, { variant: 'warning' });
                        return;
                    }

                    await removeTagFromFilesWithPrompt({
                        app,
                        tagOperations,
                        files: selectedFiles
                    });
                },
                removeAllTagsFromSelectedFiles: async () => {
                    if (!tagOperations) {
                        showNotice(strings.fileSystem.notifications.tagOperationsNotAvailable, { variant: 'warning' });
                        return;
                    }

                    // Get selected files
                    const selectedFiles = getSelectedFiles();
                    if (selectedFiles.length === 0) {
                        showNotice(strings.fileSystem.notifications.noFilesSelected, { variant: 'warning' });
                        return;
                    }

                    confirmRemoveAllTagsFromFiles({
                        app,
                        tagOperations,
                        files: selectedFiles
                    });
                },
                toggleSearch: () => {
                    listPaneRef.current?.toggleSearch();
                },
                isSearchOpen: () => {
                    return listPaneRef.current?.isSearchOpen() ?? false;
                },
                focusSearch: () => {
                    listPaneRef.current?.focusSearch();
                },
                triggerCollapse: () => {
                    handleExpandCollapseAll();
                    // Request scroll to selected item after collapse/expand
                    requestAnimationFrame(() => {
                        const selectedPath = getSelectedPath(selectionState);
                        if (selectedPath && navigationPaneRef.current) {
                            const itemType = selectionState.selectionType === ItemType.TAG ? ItemType.TAG : ItemType.FOLDER;
                            const normalizedPath = normalizeNavigationPath(itemType, selectedPath);
                            navigationPaneRef.current.requestScroll(normalizedPath, {
                                align: 'auto',
                                itemType
                            });
                        }
                    });
                }
            };
        }, [
            revealFileInActualFolder,
            revealFileInNearestFolder,
            updateSettings,
            selectionState,
            fileSystemOps,
            selectionDispatch,
            navigateToFolder,
            navigateToTag,
            uiState.singlePane,
            uiState.currentSinglePaneView,
            uiState.focusedPane,
            app,
            settings,
            plugin,
            tagTreeService,
            focusPane,
            focusNavigationPaneCallback,
            tagOperations,
            handleExpandCollapseAll,
            navigationPaneRef,
            addFolderShortcut,
            addNoteShortcut,
            addTagShortcut
        ]);

        // Add platform class and background mode classes
        if (isMobile) {
            containerClasses.push('nn-mobile');
            // Apply mobile background mode (separate, primary, or secondary)
            containerClasses.push(...getBackgroundClasses(mobileBackground));
        } else {
            containerClasses.push('nn-desktop');
            // Apply desktop background mode (separate, primary, or secondary)
            containerClasses.push(...getBackgroundClasses(desktopBackground));
        }

        // Add layout mode class
        if (uiState.singlePane) {
            containerClasses.push('nn-single-pane');
            containerClasses.push(uiState.currentSinglePaneView === 'navigation' ? 'show-navigation' : 'show-files');
        } else {
            containerClasses.push('nn-dual-pane');
            containerClasses.push(`nn-orientation-${orientation}`);
        }
        if (isResizing) {
            containerClasses.push('nn-resizing');
        }

        // Apply dynamic CSS variables for item heights and font size
        useEffect(() => {
            if (containerRef.current) {
                const navItemHeight = settings.navItemHeight;
                const defaultHeight = NAVPANE_MEASUREMENTS.defaultItemHeight;
                const defaultFontSize = NAVPANE_MEASUREMENTS.defaultFontSize;
                const scaleTextWithHeight = settings.navItemHeightScaleText;

                // Calculate font sizes based on item height (default 28px)
                // Desktop: default 13px, 12px if height ≤24, 11px if height ≤22
                let fontSize = defaultFontSize;
                if (scaleTextWithHeight) {
                    if (navItemHeight <= defaultHeight - 6) {
                        // ≤22
                        fontSize = defaultFontSize - 2; // 11px
                    } else if (navItemHeight <= defaultHeight - 4) {
                        // ≤24
                        fontSize = defaultFontSize - 1; // 12px
                    }
                }

                // Mobile adjustments
                const mobileNavItemHeight = navItemHeight + NAVPANE_MEASUREMENTS.mobileHeightIncrement;
                const mobileFontSize = fontSize + NAVPANE_MEASUREMENTS.mobileFontSizeIncrement;

                // Calculate padding: (total height - line height) / 2
                // Line height is fixed at 18px in CSS (--nn-nav-line-height)
                const desktopPadding = Math.floor((navItemHeight - NAVPANE_MEASUREMENTS.lineHeight) / 2);
                const mobilePadding = Math.floor((mobileNavItemHeight - NAVPANE_MEASUREMENTS.lineHeight) / 2);

                containerRef.current.style.setProperty('--nn-setting-nav-item-height', `${navItemHeight}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-item-height-mobile', `${mobileNavItemHeight}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-padding-vertical', `${desktopPadding}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-padding-vertical-mobile', `${mobilePadding}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-font-size', `${fontSize}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-font-size-mobile', `${mobileFontSize}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-indent', `${settings.navIndent}px`);
                containerRef.current.style.setProperty('--nn-nav-root-spacing', `${settings.rootLevelSpacing}px`);

                // Calculate compact list padding and font sizes based on configured item height
                const { titleLineHeight } = getListPaneMeasurements(isMobile);
                const compactMetrics = calculateCompactListMetrics({
                    compactItemHeight: settings.compactItemHeight,
                    scaleText: settings.compactItemHeightScaleText,
                    titleLineHeight
                });

                // Apply compact list metrics to CSS custom properties
                containerRef.current.style.setProperty('--nn-file-padding-vertical-compact', `${compactMetrics.desktopPadding}px`);
                containerRef.current.style.setProperty('--nn-file-padding-vertical-compact-mobile', `${compactMetrics.mobilePadding}px`);
                containerRef.current.style.setProperty('--nn-compact-font-size', `${compactMetrics.fontSize}px`);
                containerRef.current.style.setProperty('--nn-compact-font-size-mobile', `${compactMetrics.mobileFontSize}px`);
            }
        }, [
            settings.navItemHeight,
            settings.navItemHeightScaleText,
            settings.navIndent,
            settings.rootLevelSpacing,
            settings.compactItemHeight,
            settings.compactItemHeightScaleText,
            isMobile
        ]);

        // Compute navigation pane style based on orientation and single pane mode
        const navigationPaneStyle = uiState.singlePane
            ? { width: '100%', height: '100%' }
            : orientation === 'vertical'
              ? { width: '100%', flexBasis: `${paneSize}px`, minHeight: `${navigationPaneMinSize}px` }
              : { width: `${paneSize}px`, height: '100%' };

        return (
            <div className="nn-scale-wrapper" data-ui-scale={scaleWrapperDataAttr} style={scaleWrapperStyle}>
                <div
                    ref={containerCallbackRef}
                    className={containerClasses.join(' ')}
                    data-focus-pane={
                        uiState.singlePane ? (uiState.currentSinglePaneView === 'navigation' ? 'navigation' : 'files') : uiState.focusedPane
                    }
                    data-navigator-focused={isMobile ? 'true' : isNavigatorFocused}
                    tabIndex={-1}
                    onKeyDown={() => {
                        // Allow keyboard events to bubble up from child components
                        // The actual keyboard handling is done in NavigationPane and ListPane
                    }}
                >
                    <UpdateNoticeBanner notice={updateNotice} onDismiss={markAsDisplayed} />
                    {/* Floating indicator button that appears when a new version is available */}
                    <UpdateNoticeIndicator notice={updateNotice} isEnabled={settings.checkForUpdatesOnStart} />
                    {/* KEYBOARD EVENT FLOW:
                1. Both NavigationPane and ListPane receive the same containerRef
                2. Each pane sets up keyboard listeners on this shared container
                3. The listeners check which pane has focus before handling events
                4. This allows Tab/Arrow navigation between panes while keeping
                   all keyboard events scoped to the navigator container only
            */}
                    <NavigationPane
                        ref={navigationPaneRef}
                        style={navigationPaneStyle}
                        rootContainerRef={containerRef}
                        searchTagFilters={searchTagFilters}
                        onExecuteSearchShortcut={handleSearchShortcutExecution}
                        onNavigateToFolder={navigateToFolder}
                        onRevealTag={revealTag}
                        onRevealFile={revealFileInNearestFolder}
                        onRevealShortcutFile={handleShortcutNoteReveal}
                        onModifySearchWithTag={(tag, operator) => {
                            listPaneRef.current?.modifySearchWithTag(tag, operator);
                        }}
                    />
                    <ListPane
                        ref={listPaneRef}
                        rootContainerRef={containerRef}
                        onSearchTokensChange={handleSearchTokensChange}
                        resizeHandleProps={!uiState.singlePane ? resizeHandleProps : undefined}
                    />
                </div>
            </div>
        );
    })
);
