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

// src/components/NotebookNavigatorComponent.tsx
import React, { useEffect, useImperativeHandle, forwardRef, useRef, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { TFile, TFolder } from 'obsidian';
import { useExpansionState } from '../context/ExpansionContext';
import { useSelectionState, useSelectionDispatch, resolvePrimarySelectedFile } from '../context/SelectionContext';
import { useServices } from '../context/ServicesContext';
import { useActiveProfile, useSettingsState } from '../context/SettingsContext';
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
import { useFileCache } from '../context/StorageContext';
import { strings } from '../i18n';
import { runAsyncAction } from '../utils/async';
import { useUpdateNotice } from '../hooks/useUpdateNotice';
import { FolderSuggestModal } from '../modals/FolderSuggestModal';
import { buildPropertyNodeSuggestions, PropertyNodeSuggestModal } from '../modals/PropertyNodeSuggestModal';
import { TagSuggestModal } from '../modals/TagSuggestModal';
import {
    ItemType,
    NAVPANE_MEASUREMENTS,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    TAGGED_TAG_ID,
    UNTAGGED_TAG_ID,
    type BackgroundMode,
    type DualPaneOrientation
} from '../types';
import { getSelectedPath, getFilesForSelection, orderFilesByReference } from '../utils/selectionUtils';
import { normalizeNavigationPath } from '../utils/navigationIndex';
import { createIndexMap } from '../utils/arrayUtils';
import { deleteSelectedFiles } from '../utils/deleteOperations';
import { calculateCompactListMetrics } from '../utils/listPaneMetrics';
import { getNavigationPaneSizing } from '../utils/paneSizing';
import { getAndroidFontScale } from '../utils/androidFontScale';
import { getBackgroundClasses } from '../utils/paneLayout';
import { confirmRemoveAllTagsFromFiles, openAddTagToFilesModal, removeTagFromFilesWithPrompt } from '../utils/tagModalHelpers';
import { normalizeTagPath } from '../utils/tagUtils';
import { getTemplaterCreateNewNoteFromTemplate } from '../utils/templaterIntegration';
import { normalizePropertyNodeId } from '../utils/propertyTree';
import { collectFileMenuPropertyActions } from '../utils/propertyMenuActions';
import { openMergeNotesModal } from '../utils/mergeNotesModal';
import { getMarkdownFilesInOrder } from '../utils/noteMerge';
import { useNavigatorScale } from '../hooks/useNavigatorScale';
import { ListPane } from './ListPane';
import type { ListPaneHandle } from './ListPane';
import { NavigationPane } from './NavigationPane';
import type { NavigationPaneHandle } from './NavigationPane';
import type { NavigateToPropertyOptions } from '../utils/propertyNavigation';
import type { NavigateToTagOptions } from '../utils/tagNavigation';
import { Calendar } from './calendar';
import type { SearchShortcut } from '../types/shortcuts';
import { UpdateNoticeBanner } from './UpdateNoticeBanner';
import { showNotice } from '../utils/noticeUtils';
import { EMPTY_SEARCH_NAV_FILTER_STATE, type SearchNavFilterState } from '../types/search';
import { getFeatureImageDisplayMeasurements, getListPaneMeasurements } from '../utils/listPaneMeasurements';
import type { InclusionOperator } from '../utils/filterSearch';
import { useFolderDecorationState } from '../hooks/useFolderDecorationState';
import { useFileItemPillDecorationState } from '../hooks/useFileItemPillDecorationState';
import { useSelectedFolderFileVersion } from '../hooks/useSelectedFolderFileVersion';
import type { FileItemPillOrderModel } from '../utils/fileItemPillOrder';
import { useNavigationPaneTreeSections } from '../hooks/navigationPane/data/useNavigationPaneTreeSections';
import { useNavigationPaneSourceState } from '../hooks/navigationPane/data/useNavigationPaneSourceState';
import type { SelectionHistoryEntry } from '../context/selection/types';
import type { SearchQueryUpdateOptions } from '../hooks/useListPaneSearch';

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

const stringRecordEqual = (a: Record<string, string>, b: Record<string, string>): boolean => {
    if (a === b) {
        return true;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }

    for (const key of aKeys) {
        if (a[key] !== b[key]) {
            return false;
        }
    }

    return true;
};

interface ResolvedSelectionHistoryTarget {
    entry: SelectionHistoryEntry;
    index: number;
}

interface AuxClickState {
    mouseBackForwardAction: 'none' | 'singlePaneSwitch' | 'history';
    singlePane: boolean;
    focusedPane: 'navigation' | 'files' | 'search';
    currentSinglePaneView: 'navigation' | 'files';
    navigateSelectionHistory: (direction: 'back' | 'forward') => boolean;
}

export interface NotebookNavigatorHandle {
    // Navigates to a file by revealing it in its actual parent folder.
    // Returns false when the file is not revealable in navigator context.
    navigateToFile: (file: TFile, options?: RevealFileOptions) => boolean;
    // Reveals a file while preserving the current navigation context when possible
    revealFileInNearestFolder: (file: TFile, options?: RevealFileOptions) => void;
    focusVisiblePane: () => void;
    focusNavigationPane: () => void;
    deleteSelectedFiles: () => void;
    mergeSelectedFiles: () => Promise<void>;
    createNoteInSelectedFolder: (openInNewTab?: boolean) => Promise<void>;
    createNoteFromTemplateInSelectedFolder: () => Promise<void>;
    moveSelectedFiles: () => Promise<void>;
    navigateBack: () => Promise<boolean>;
    navigateForward: () => Promise<boolean>;
    addShortcutForCurrentSelection: () => Promise<void>;
    navigateToFolder: (folder: TFolder | string, options?: NavigateToFolderOptions) => boolean;
    navigateToTag: (tagPath: string, options?: NavigateToTagOptions) => string | null;
    navigateToProperty: (propertyNodeId: string, options?: NavigateToPropertyOptions) => string | null;
    addDateFilterToSearch: (dateToken: string) => void;
    navigateToFolderWithModal: () => void;
    navigateToTagWithModal: () => void;
    navigateToPropertyWithModal: () => void;
    addTagToSelectedFiles: () => Promise<void>;
    setPropertyOnSelectedFiles: () => Promise<void>;
    removeTagFromSelectedFiles: () => Promise<void>;
    removeAllTagsFromSelectedFiles: () => Promise<void>;
    toggleSearch: () => void;
    searchWithDescendants: () => void;
    triggerCollapse: () => void;
    triggerSelectedItemCollapse: () => boolean;
    stopContentProcessing: () => void;
    rebuildCache: () => Promise<void>;
    selectNextFile: () => Promise<boolean>;
    selectPreviousFile: () => Promise<boolean>;
    openShortcutByNumber: (shortcutNumber: number) => Promise<boolean>;
    isDualPaneAutoFallbackActive: () => boolean;
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
        const { app, isMobile, fileSystemOps, plugin, tagTreeService, propertyTreeService, commandQueue, tagOperations } = useServices();
        const settings = useSettingsState();
        const activeProfile = useActiveProfile();
        const expansionState = useExpansionState();
        const uxPreferences = useUXPreferences();
        const uiState = useUIState();
        const uiDispatch = useUIDispatch();
        const uxRef = useRef(uxPreferences);
        useEffect(() => {
            uxRef.current = uxPreferences;
        }, [uxPreferences]);
        const orientation: DualPaneOrientation = uiState.effectiveDualPaneOrientation;
        // Get background mode for desktop layout
        const desktopBackground: BackgroundMode = settings.desktopBackground ?? 'separate';
        const {
            scale: uiScale,
            style: scaleWrapperStyle,
            dataAttr: scaleWrapperDataAttr
        } = useNavigatorScale({
            isMobile,
            desktopScale: settings.desktopScale,
            mobileScale: settings.mobileScale
        });
        const horizontalNavigationPaneSizing = getNavigationPaneSizing('horizontal');
        const verticalNavigationPaneSizing = getNavigationPaneSizing('vertical');
        const navigationPaneSizing = orientation === 'vertical' ? verticalNavigationPaneSizing : horizontalNavigationPaneSizing;
        const selectionState = useSelectionState();
        const selectionDispatch = useSelectionDispatch();
        const selectedFolderForFolderNoteSidebar = selectionState.selectionType === ItemType.FOLDER ? selectionState.selectedFolder : null;
        const selectedFolderFileVersionForFolderNoteSidebar = useSelectedFolderFileVersion(
            app.vault,
            selectedFolderForFolderNoteSidebar,
            settings.enableFolderNotes && settings.folderNoteOpenLocation === 'right-sidebar' && settings.showNearestFolderNoteInSidebar,
            { includeAncestors: true }
        );
        useEffect(() => {
            void selectedFolderFileVersionForFolderNoteSidebar;
            runAsyncAction(() => plugin.syncFolderNoteSidebarToFolder(selectedFolderForFolderNoteSidebar));
        }, [
            plugin,
            selectedFolderFileVersionForFolderNoteSidebar,
            selectedFolderForFolderNoteSidebar,
            settings.enableFolderNotes,
            settings.folderNoteName,
            settings.folderNoteNamePattern,
            settings.folderNoteOpenLocation,
            settings.showNearestFolderNoteInSidebar
        ]);
        const {
            folderShortcutKeysByPath,
            noteShortcutKeysByPath,
            tagShortcutKeysByPath,
            propertyShortcutKeysByNodeId,
            addFolderShortcut,
            addNoteShortcut,
            addTagShortcut,
            addPropertyShortcut,
            removeShortcut,
            hydratedShortcuts
        } = useShortcuts();
        const navigationSelectionScope = useMemo(
            () => ({
                selectionType: selectionState.selectionType,
                selectedFolder: selectionState.selectedFolder,
                selectedTag: selectionState.selectedTag,
                selectedProperty: selectionState.selectedProperty
            }),
            [selectionState.selectedFolder, selectionState.selectedProperty, selectionState.selectedTag, selectionState.selectionType]
        );
        const { stopAllProcessing, rebuildCache, fileData } = useFileCache();
        const { bannerNotice, markAsDisplayed } = useUpdateNotice();
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
        const containerRef = useRef<HTMLDivElement | null>(null);

        const [isNavigatorFocused, setIsNavigatorFocused] = useState(false);
        // Tracks search tokens for highlighting matching tags/properties in navigation pane
        const [searchNavFilters, setSearchNavFilters] = useState<SearchNavFilterState>(EMPTY_SEARCH_NAV_FILTER_STATE);
        const [isPaneTransitioning, setIsPaneTransitioning] = useState(false);
        const [suppressPaneTransitions, setSuppressPaneTransitions] = useState(false);
        const navigationPaneRef = useRef<NavigationPaneHandle | null>(null);
        const listPaneRef = useRef<ListPaneHandle | null>(null);
        const lastDualPaneRef = useRef(uiState.dualPane);
        const auxClickStateRef = useRef<AuxClickState>({
            mouseBackForwardAction: settings.mouseBackForwardAction,
            singlePane: uiState.singlePane,
            focusedPane: uiState.focusedPane,
            currentSinglePaneView: uiState.currentSinglePaneView,
            navigateSelectionHistory: () => false
        });

        // Updates search filter highlight state only when values actually change
        const handleSearchTokensChange = useCallback((next: SearchNavFilterState) => {
            setSearchNavFilters(prev => {
                if (
                    prev.tags.excludeTagged === next.tags.excludeTagged &&
                    prev.tags.includeUntagged === next.tags.includeUntagged &&
                    prev.tags.requireTagged === next.tags.requireTagged &&
                    arraysEqual(prev.tags.include, next.tags.include) &&
                    arraysEqual(prev.tags.exclude, next.tags.exclude) &&
                    stringRecordEqual(prev.tags.includeOperators, next.tags.includeOperators) &&
                    arraysEqual(prev.properties.include, next.properties.include) &&
                    arraysEqual(prev.properties.exclude, next.properties.exclude) &&
                    stringRecordEqual(prev.properties.includeOperators, next.properties.includeOperators)
                ) {
                    return prev;
                }

                return {
                    tags: {
                        include: next.tags.include.slice(),
                        exclude: next.tags.exclude.slice(),
                        includeOperators: { ...next.tags.includeOperators },
                        excludeTagged: next.tags.excludeTagged,
                        includeUntagged: next.tags.includeUntagged,
                        requireTagged: next.tags.requireTagged
                    },
                    properties: {
                        include: next.properties.include.slice(),
                        exclude: next.properties.exclude.slice(),
                        includeOperators: { ...next.properties.includeOperators }
                    }
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

        const getNavigationSearchUpdateOptions = useCallback((): SearchQueryUpdateOptions => {
            return {
                preserveSinglePaneView: uiState.singlePane && uiState.currentSinglePaneView === 'navigation',
                focusSearch: false
            };
        }, [uiState.currentSinglePaneView, uiState.singlePane]);

        const handleModifySearchWithTag = useCallback(
            (tag: string, operator: InclusionOperator) => {
                listPaneRef.current?.modifySearchWithTag(tag, operator, getNavigationSearchUpdateOptions());
            },
            [getNavigationSearchUpdateOptions]
        );

        const handleModifySearchWithProperty = useCallback(
            (key: string, value: string | null, operator: InclusionOperator) => {
                listPaneRef.current?.modifySearchWithProperty(key, value, operator, getNavigationSearchUpdateOptions());
            },
            [getNavigationSearchUpdateOptions]
        );

        const handleModifySearchWithDateFilter = useCallback(
            (dateToken: string) => {
                listPaneRef.current?.modifySearchWithDateToken(dateToken, getNavigationSearchUpdateOptions());
            },
            [getNavigationSearchUpdateOptions]
        );

        const horizontalNavigationPane = useResizablePane({
            orientation: 'horizontal',
            initialSize: horizontalNavigationPaneSizing.defaultSize,
            min: horizontalNavigationPaneSizing.minSize,
            storageKey: horizontalNavigationPaneSizing.storageKey,
            scale: uiScale
        });

        const verticalNavigationPane = useResizablePane({
            orientation: 'vertical',
            initialSize: verticalNavigationPaneSizing.defaultSize,
            min: verticalNavigationPaneSizing.minSize,
            storageKey: verticalNavigationPaneSizing.storageKey,
            scale: uiScale
        });

        const activeNavigationPane = orientation === 'vertical' ? verticalNavigationPane : horizontalNavigationPane;
        const paneSize = activeNavigationPane.paneSize;
        const isResizing = activeNavigationPane.isResizing;
        const resizeHandleProps = activeNavigationPane.resizeHandleProps;

        // Ref callback that stores the navigator root element
        const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
            containerRef.current = node;
        }, []);

        useEffect(() => {
            uiDispatch({ type: 'SET_PANE_WIDTH', width: horizontalNavigationPane.paneSize });
        }, [horizontalNavigationPane.paneSize, uiDispatch]);

        useLayoutEffect(() => {
            const node = containerRef.current;
            if (!node) {
                return;
            }

            const reportWidth = (width: number) => {
                uiDispatch({ type: 'SET_CONTAINER_WIDTH', width });
            };

            reportWidth(node.offsetWidth);

            if (typeof ResizeObserver === 'undefined') {
                const handleWindowResize = () => reportWidth(node.offsetWidth);
                window.addEventListener('resize', handleWindowResize);
                return () => {
                    window.removeEventListener('resize', handleWindowResize);
                };
            }

            const observer = new ResizeObserver(entries => {
                const entry = entries[0];
                if (!entry) {
                    return;
                }
                reportWidth(entry.contentRect.width);
            });

            observer.observe(node);

            return () => observer.disconnect();
        }, [uiDispatch]);

        // Determine CSS classes
        const containerClasses = ['nn-split-container'];

        const hasInitializedSinglePane = useRef(false);
        const preferredSinglePaneView = useRef<'navigation' | 'files'>(settings.startView === 'navigation' ? 'navigation' : 'files');

        // Switch to preferred view when entering single pane (desktop only)
        useLayoutEffect(() => {
            const wasDualPane = lastDualPaneRef.current;
            lastDualPaneRef.current = uiState.dualPane;

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

            if (wasDualPane) {
                setSuppressPaneTransitions(true);
                const raf = window.requestAnimationFrame(() => {
                    setSuppressPaneTransitions(false);
                });
                uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: 'files' });
                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                return () => {
                    window.cancelAnimationFrame(raf);
                };
            }

            const preferredView = preferredSinglePaneView.current;
            uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: preferredView });
            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: preferredView });
        }, [isMobile, uiDispatch, uiState.dualPane]);

        useEffect(() => {
            if (!uiState.singlePane) {
                setIsPaneTransitioning(false);
                return;
            }

            setIsPaneTransitioning(true);
            const timer = window.setTimeout(() => {
                setIsPaneTransitioning(false);
            }, settings.paneTransitionDuration + 20);

            return () => {
                window.clearTimeout(timer);
            };
        }, [settings.paneTransitionDuration, uiState.currentSinglePaneView, uiState.singlePane]);

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
        const {
            revealFileInActualFolder,
            revealFileInNearestFolder,
            navigateToFolder,
            navigateToTag,
            navigateToProperty,
            revealTag,
            revealProperty
        } = useNavigatorReveal({
            app,
            navigationPaneRef,
            focusNavigationPane: focusNavigationPaneCallback,
            focusFilesPane: focusFilesPaneCallback
        });

        const resolveSelectionHistoryEntry = useCallback(
            (entry: SelectionHistoryEntry): SelectionHistoryEntry | null => {
                if (entry.type === ItemType.FOLDER) {
                    const folder = app.vault.getFolderByPath(entry.value);
                    return folder
                        ? {
                              type: ItemType.FOLDER,
                              value: folder.path
                          }
                        : null;
                }

                if (entry.type === ItemType.TAG) {
                    if (!settings.showTags) {
                        return null;
                    }

                    const normalizedTag = normalizeTagPath(entry.value);
                    if (!normalizedTag) {
                        return null;
                    }

                    if (normalizedTag === TAGGED_TAG_ID || normalizedTag === UNTAGGED_TAG_ID) {
                        return {
                            type: ItemType.TAG,
                            value: normalizedTag
                        };
                    }

                    if (!tagTreeService) {
                        return null;
                    }

                    const resolvedTag = tagTreeService.resolveSelectionTagPath(normalizedTag);
                    return resolvedTag
                        ? {
                              type: ItemType.TAG,
                              value: resolvedTag
                          }
                        : null;
                }

                if (entry.type === ItemType.PROPERTY) {
                    if (!settings.showProperties) {
                        return null;
                    }

                    const normalizedNodeId =
                        entry.value === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                            ? PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                            : normalizePropertyNodeId(entry.value);
                    if (!normalizedNodeId) {
                        return null;
                    }

                    if (normalizedNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                        return {
                            type: ItemType.PROPERTY,
                            value: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                        };
                    }

                    if (!propertyTreeService) {
                        return null;
                    }

                    const resolvedNodeId = propertyTreeService.resolveSelectionNodeId(normalizedNodeId);
                    return resolvedNodeId !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                        ? {
                              type: ItemType.PROPERTY,
                              value: resolvedNodeId
                          }
                        : null;
                }

                return null;
            },
            [app.vault, propertyTreeService, settings.showProperties, settings.showTags, tagTreeService]
        );

        const getSelectionHistoryTarget = useCallback(
            (direction: 'back' | 'forward'): ResolvedSelectionHistoryTarget | null => {
                const { navigationHistory } = selectionState;
                if (navigationHistory.length === 0) {
                    return null;
                }

                const startIndex = Math.min(Math.max(selectionState.navigationHistoryIndex, 0), navigationHistory.length - 1);
                const step = direction === 'back' ? -1 : 1;
                for (let index = startIndex + step; index >= 0 && index < navigationHistory.length; index += step) {
                    const resolvedEntry = resolveSelectionHistoryEntry(navigationHistory[index]);
                    if (!resolvedEntry) {
                        continue;
                    }

                    return {
                        entry: resolvedEntry,
                        index
                    };
                }

                return null;
            },
            [resolveSelectionHistoryEntry, selectionState]
        );

        const navigateSelectionHistory = useCallback(
            (direction: 'back' | 'forward'): boolean => {
                const target = getSelectionHistoryTarget(direction);
                if (!target) {
                    return false;
                }

                if (target.entry.type === ItemType.FOLDER) {
                    const folder = app.vault.getFolderByPath(target.entry.value);
                    if (!folder) {
                        return false;
                    }

                    return navigateToFolder(folder, {
                        historyIndex: target.index,
                        skipFocus: true,
                        source: 'manual'
                    });
                }

                if (target.entry.type === ItemType.TAG) {
                    return (
                        navigateToTag(target.entry.value, {
                            historyIndex: target.index,
                            skipFocus: true,
                            source: 'manual'
                        }) !== null
                    );
                }

                return (
                    navigateToProperty(target.entry.value, {
                        historyIndex: target.index,
                        skipFocus: true,
                        source: 'manual'
                    }) !== null
                );
            },
            [app.vault, getSelectionHistoryTarget, navigateToFolder, navigateToProperty, navigateToTag]
        );

        const preserveNavigationFocusForModal = !uiState.singlePane || uiState.currentSinglePaneView === 'navigation';

        // Keeps aux-click behavior current without re-subscribing the DOM listener
        useEffect(() => {
            auxClickStateRef.current = {
                mouseBackForwardAction: settings.mouseBackForwardAction,
                singlePane: uiState.singlePane,
                focusedPane: uiState.focusedPane,
                currentSinglePaneView: uiState.currentSinglePaneView,
                navigateSelectionHistory
            };
        }, [
            navigateSelectionHistory,
            settings.mouseBackForwardAction,
            uiState.currentSinglePaneView,
            uiState.focusedPane,
            uiState.singlePane
        ]);

        // Handle auxiliary mouse buttons on desktop based on the configured action
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

                const { mouseBackForwardAction, singlePane, focusedPane, currentSinglePaneView, navigateSelectionHistory } =
                    auxClickStateRef.current;
                const direction = event.button === 3 ? 'back' : 'forward';

                if (mouseBackForwardAction === 'none') {
                    return;
                }

                if (mouseBackForwardAction === 'history') {
                    event.preventDefault();
                    navigateSelectionHistory(direction);
                    return;
                }

                if (!singlePane) {
                    return;
                }

                event.preventDefault();

                if (focusedPane === 'search') {
                    return;
                }

                const targetView = direction === 'back' ? 'navigation' : 'files';

                if (currentSinglePaneView === targetView) {
                    return;
                }

                uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: targetView });
                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: targetView });
            };

            container.addEventListener('auxclick', handleAuxClick);

            return () => {
                container.removeEventListener('auxclick', handleAuxClick);
            };
        }, [containerRef, isMobile, uiDispatch]);

        // Handles file reveal from shortcuts, using nearest folder navigation
        const handleShortcutNoteReveal = useCallback(
            (file: TFile) => {
                revealFileInNearestFolder(file, { source: 'shortcut' });
            },
            [revealFileInNearestFolder]
        );

        const ensureSelectedNavigationItemVisible = useCallback(() => {
            const selectedPath = getSelectedPath(selectionState);
            if (!selectedPath) {
                return;
            }

            const itemType =
                selectionState.selectionType === ItemType.TAG
                    ? ItemType.TAG
                    : selectionState.selectionType === ItemType.PROPERTY
                      ? ItemType.PROPERTY
                      : ItemType.FOLDER;
            const normalizedPath = normalizeNavigationPath(itemType, selectedPath);
            navigationPaneRef.current?.requestScroll(normalizedPath, {
                align: 'auto',
                itemType
            });
        }, [selectionState]);

        const ensureSelectedFileVisible = useCallback(() => {
            const handle = listPaneRef.current;
            if (!handle) {
                return;
            }

            const selectedFile = resolvePrimarySelectedFile(app, selectionState);
            if (!selectedFile) {
                return;
            }

            const index = handle.getIndexOfPath(selectedFile.path);
            if (index < 0) {
                return;
            }

            handle.virtualizer?.scrollToIndex(index, { align: 'auto' });
        }, [app, selectionState]);

        const scheduleEnsureSelectionsVisible = useCallback(() => {
            const scheduleScroll = () => {
                ensureSelectedNavigationItemVisible();
                ensureSelectedFileVisible();
            };

            if (typeof requestAnimationFrame !== 'undefined') {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(scheduleScroll);
                });
                return;
            }

            window.setTimeout(scheduleScroll, 0);
        }, [ensureSelectedFileVisible, ensureSelectedNavigationItemVisible]);

        const prevSinglePaneCalendarWeekCountRef = useRef<number | null>(null);
        const handleSinglePaneCalendarWeekCountChange = useCallback(
            (count: number) => {
                if (!uiState.singlePane) {
                    return;
                }

                const prevCount = prevSinglePaneCalendarWeekCountRef.current;
                prevSinglePaneCalendarWeekCountRef.current = count;

                if (prevCount === count) {
                    return;
                }

                scheduleEnsureSelectionsVisible();
            },
            [scheduleEnsureSelectionsVisible, uiState.singlePane]
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

            const getSelectedFilesInCurrentListOrder = (): TFile[] => {
                const selectedFiles = getSelectedFiles();
                const orderedFiles = listPaneRef.current?.getOrderedFiles() ?? [];
                return orderFilesByReference(selectedFiles, orderedFiles);
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
                    return revealFileInActualFolder(file, options);
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
                navigateBack: async () => navigateSelectionHistory('back'),
                navigateForward: async () => navigateSelectionHistory('forward'),
                openShortcutByNumber: (shortcutNumber: number) => {
                    const navHandle = navigationPaneRef.current;
                    if (!navHandle) {
                        return Promise.resolve(false);
                    }
                    return navHandle.openShortcutByNumber(shortcutNumber);
                },
                isDualPaneAutoFallbackActive: () => plugin.useDualPane() && !isMobile && uiState.singlePane,
                deleteSelectedFiles: () => {
                    runAsyncAction(async () => {
                        if (!selectionState.selectedFile && selectionState.selectedFiles.size === 0) {
                            return;
                        }

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
                            tagTreeService,
                            propertyTreeService,
                            orderedFiles: listPaneRef.current?.getOrderedFiles() ?? undefined
                        });
                    });
                },
                mergeSelectedFiles: async () => {
                    const selectedFiles = getSelectedFilesInCurrentListOrder();
                    const markdownFiles = getMarkdownFilesInOrder(selectedFiles);
                    if (markdownFiles.length < 2) {
                        showNotice(strings.fileSystem.notifications.mergeNotesRequireMultipleMarkdown, { variant: 'warning' });
                        return;
                    }

                    const firstFile = markdownFiles[0];
                    const outputFolder = firstFile.parent instanceof TFolder ? firstFile.parent : app.vault.getRoot();
                    await openMergeNotesModal({
                        app,
                        commandQueue,
                        fileSystemOps,
                        files: markdownFiles,
                        outputFolder,
                        defaultOutputName: strings.modals.mergeNotes.outputNamePlaceholder
                    });
                },
                createNoteInSelectedFolder: async (openInNewTab = false) => {
                    const manualSortContext = listPaneRef.current?.getManualSortNewFileContext() ?? null;

                    if (selectionState.selectedFolder) {
                        await fileSystemOps.createNewFile(selectionState.selectedFolder, openInNewTab, manualSortContext);
                        return;
                    }

                    if (
                        selectionState.selectionType === ItemType.TAG &&
                        selectionState.selectedTag &&
                        selectionState.selectedTag !== TAGGED_TAG_ID &&
                        selectionState.selectedTag !== UNTAGGED_TAG_ID
                    ) {
                        const sourcePath = selectionState.selectedFile?.path ?? app.workspace.getActiveFile()?.path ?? '';
                        await fileSystemOps.createNewFileForTag(selectionState.selectedTag, sourcePath, openInNewTab, manualSortContext);
                        return;
                    }

                    if (
                        selectionState.selectionType === ItemType.PROPERTY &&
                        selectionState.selectedProperty &&
                        selectionState.selectedProperty !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                    ) {
                        const sourcePath = selectionState.selectedFile?.path ?? app.workspace.getActiveFile()?.path ?? '';
                        await fileSystemOps.createNewFileForProperty(
                            selectionState.selectedProperty,
                            sourcePath,
                            openInNewTab,
                            manualSortContext
                        );
                        return;
                    }

                    showNotice(strings.fileSystem.errors.noFolderSelected, { variant: 'warning' });
                },
                createNoteFromTemplateInSelectedFolder: async () => {
                    if (!selectionState.selectedFolder) {
                        showNotice(strings.fileSystem.errors.noFolderSelected, { variant: 'warning' });
                        return;
                    }

                    const createNewNoteFromTemplate = getTemplaterCreateNewNoteFromTemplate(app);
                    if (!createNewNoteFromTemplate) {
                        return;
                    }

                    await createNewNoteFromTemplate(selectionState.selectedFolder);
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
                        tagTreeService,
                        propertyTreeService
                    );

                    // Move files with modal
                    await fileSystemOps.moveFilesWithModal(selectedFiles, {
                        selectedFile: selectionState.selectedFile,
                        dispatch: selectionDispatch,
                        allFiles
                    });
                },
                addShortcutForCurrentSelection: async () => {
                    const toggleShortcut = async (
                        existingShortcutKey: string | undefined,
                        addShortcut: () => Promise<boolean>
                    ): Promise<void> => {
                        if (existingShortcutKey) {
                            await removeShortcut(existingShortcutKey);
                            return;
                        }

                        await addShortcut();
                    };

                    // Try selected files first
                    const selectedFiles = getSelectedFiles();
                    if (selectedFiles.length > 0) {
                        const selectedFilePath = selectedFiles[0].path;
                        await toggleShortcut(noteShortcutKeysByPath.get(selectedFilePath), () => addNoteShortcut(selectedFilePath));
                        return;
                    }

                    // Try selected tag
                    if (selectionState.selectedTag) {
                        const selectedTagPath = selectionState.selectedTag;
                        const normalizedTagPath = normalizeTagPath(selectedTagPath);
                        await toggleShortcut(normalizedTagPath ? tagShortcutKeysByPath.get(normalizedTagPath) : undefined, () =>
                            addTagShortcut(selectedTagPath)
                        );
                        return;
                    }

                    // Try selected property
                    if (selectionState.selectedProperty) {
                        const selectedPropertyNodeId = selectionState.selectedProperty;
                        const normalizedNodeId =
                            selectedPropertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                                ? PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                                : normalizePropertyNodeId(selectedPropertyNodeId);
                        await toggleShortcut(normalizedNodeId ? propertyShortcutKeysByNodeId.get(normalizedNodeId) : undefined, () =>
                            addPropertyShortcut(selectedPropertyNodeId)
                        );
                        return;
                    }

                    // Try selected folder
                    if (selectionState.selectedFolder) {
                        const selectedFolderPath = selectionState.selectedFolder.path;
                        await toggleShortcut(folderShortcutKeysByPath.get(selectedFolderPath), () => addFolderShortcut(selectedFolderPath));
                        return;
                    }

                    // Fall back to active file
                    const activeFile = app.workspace.getActiveFile();
                    if (activeFile) {
                        await toggleShortcut(noteShortcutKeysByPath.get(activeFile.path), () => addNoteShortcut(activeFile.path));
                        return;
                    }

                    // Show error if nothing is selected
                    showNotice(strings.common.noSelection, { variant: 'warning' });
                },
                navigateToFolder,
                navigateToTag,
                navigateToProperty,
                addDateFilterToSearch: handleModifySearchWithDateFilter,
                navigateToFolderWithModal: () => {
                    // Show the folder selection modal for navigation
                    const modal = new FolderSuggestModal(
                        app,
                        (targetFolder: TFolder) => {
                            // Navigate to the selected folder
                            navigateToFolder(targetFolder, { preserveNavigationFocus: preserveNavigationFocusForModal });
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
                            navigateToTag(tagPath, { preserveNavigationFocus: preserveNavigationFocusForModal });
                        },
                        strings.modals.tagSuggest.navigatePlaceholder,
                        strings.modals.tagSuggest.instructions.select,
                        false // Do not allow creating tags for navigation
                    );
                    modal.open();
                },
                navigateToPropertyWithModal: () => {
                    const suggestions = propertyTreeService ? buildPropertyNodeSuggestions(propertyTreeService.getPropertyTree()) : [];
                    const modal = new PropertyNodeSuggestModal(
                        app,
                        suggestions,
                        nodeId => {
                            navigateToProperty(nodeId, { preserveNavigationFocus: preserveNavigationFocusForModal });
                        },
                        strings.modals.propertySuggest.navigatePlaceholder,
                        strings.modals.propertySuggest.instructions.navigate
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
                setPropertyOnSelectedFiles: async () => {
                    const selectedFiles = getSelectedFiles();
                    if (selectedFiles.length === 0) {
                        showNotice(strings.fileSystem.notifications.noFilesSelected, { variant: 'warning' });
                        return;
                    }

                    if (!selectedFiles.every(file => file.extension === 'md')) {
                        showNotice(strings.fileSystem.notifications.propertiesRequireMarkdown, { variant: 'warning' });
                        return;
                    }

                    const propertyActions = collectFileMenuPropertyActions(settings, propertyTreeService);
                    const suggestions = propertyActions.map(action => ({
                        nodeId: action.nodeId,
                        label: action.label,
                        searchText: action.label,
                        noteCount: 0
                    }));
                    if (suggestions.length === 0) {
                        showNotice(strings.fileSystem.notifications.propertyOperationsNotAvailable, { variant: 'warning' });
                        return;
                    }

                    const modal = new PropertyNodeSuggestModal(
                        app,
                        suggestions,
                        async nodeId => {
                            await fileSystemOps.applyPropertyNodeToFiles(nodeId, selectedFiles);
                        },
                        strings.modals.propertySuggest.placeholder,
                        strings.modals.propertySuggest.instructions.select
                    );
                    modal.open();
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
                searchWithDescendants: () => {
                    listPaneRef.current?.searchWithDescendants();
                },
                triggerCollapse: () => {
                    handleExpandCollapseAll();
                    // Request scroll to selected item after collapse/expand
                    window.requestAnimationFrame(() => {
                        ensureSelectedNavigationItemVisible();
                    });
                },
                triggerSelectedItemCollapse: () => {
                    const didToggle = navigationPaneRef.current?.triggerSelectedItemCollapse() ?? false;
                    if (didToggle) {
                        window.requestAnimationFrame(() => {
                            ensureSelectedNavigationItemVisible();
                        });
                    }
                    return didToggle;
                }
            };
        }, [
            revealFileInActualFolder,
            revealFileInNearestFolder,
            selectionState,
            fileSystemOps,
            commandQueue,
            selectionDispatch,
            navigateToFolder,
            navigateToTag,
            navigateToProperty,
            navigateSelectionHistory,
            uiState.singlePane,
            uiState.currentSinglePaneView,
            preserveNavigationFocusForModal,
            isMobile,
            app,
            settings,
            plugin,
            tagTreeService,
            propertyTreeService,
            focusPane,
            focusNavigationPaneCallback,
            tagOperations,
            handleExpandCollapseAll,
            ensureSelectedNavigationItemVisible,
            navigationPaneRef,
            folderShortcutKeysByPath,
            noteShortcutKeysByPath,
            tagShortcutKeysByPath,
            addFolderShortcut,
            addNoteShortcut,
            addTagShortcut,
            propertyShortcutKeysByNodeId,
            addPropertyShortcut,
            removeShortcut,
            handleModifySearchWithDateFilter
        ]);

        // Add platform class and background mode classes
        if (isMobile) {
            containerClasses.push('nn-mobile');
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
        if (uiState.singlePane && suppressPaneTransitions) {
            containerClasses.push('nn-suppress-pane-transitions');
        }
        if (uiState.singlePane && isPaneTransitioning) {
            containerClasses.push('nn-pane-transitioning');
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

                // Get Android font scale for compensation (1 if not on Android or no scaling)
                const navigatorContainer = containerRef.current.closest('.notebook-navigator');
                const androidFontScale = getAndroidFontScale(navigatorContainer);

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

                // Apply Android font scale compensation to font sizes
                const compensatedFontSize = fontSize / androidFontScale;
                const compensatedMobileFontSize = mobileFontSize / androidFontScale;

                containerRef.current.style.setProperty('--nn-setting-nav-item-height', `${navItemHeight}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-item-height-mobile', `${mobileNavItemHeight}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-font-size', `${compensatedFontSize}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-font-size-mobile', `${compensatedMobileFontSize}px`);
                containerRef.current.style.setProperty('--nn-setting-nav-indent', `${settings.navIndent}px`);
                containerRef.current.style.setProperty('--nn-nav-root-spacing', `${settings.rootLevelSpacing}px`);

                const featureImageDisplayMeasurements = getFeatureImageDisplayMeasurements(settings.featureImageSize);
                // This is only the rendered image ceiling.
                // The image still scales with the row height and content layout until it reaches this max.
                containerRef.current.style.setProperty('--nn-file-thumbnail-max-size', `${featureImageDisplayMeasurements.listMaxSize}px`);

                // Calculate compact list padding and font sizes based on configured item height
                const { titleLineHeight } = getListPaneMeasurements(isMobile);
                const compactMetrics = calculateCompactListMetrics({
                    compactItemHeight: settings.compactItemHeight,
                    scaleText: settings.compactItemHeightScaleText,
                    titleLineHeight
                });

                // Apply Android font scale compensation to compact font sizes
                const compensatedCompactFontSize = compactMetrics.fontSize / androidFontScale;
                const compensatedCompactMobileFontSize = compactMetrics.mobileFontSize / androidFontScale;

                // Apply compact list metrics to CSS custom properties
                containerRef.current.style.setProperty('--nn-file-padding-vertical-compact', `${compactMetrics.desktopPadding}px`);
                containerRef.current.style.setProperty('--nn-file-padding-vertical-compact-mobile', `${compactMetrics.mobilePadding}px`);
                containerRef.current.style.setProperty('--nn-compact-font-size', `${compensatedCompactFontSize}px`);
                containerRef.current.style.setProperty('--nn-compact-font-size-mobile', `${compensatedCompactMobileFontSize}px`);
            }
        }, [
            settings.navItemHeight,
            settings.navItemHeightScaleText,
            settings.navIndent,
            settings.rootLevelSpacing,
            settings.featureImageSize,
            settings.compactItemHeight,
            settings.compactItemHeightScaleText,
            isMobile
        ]);

        useEffect(() => {
            if (!containerRef.current) {
                return;
            }
            containerRef.current.style.setProperty('--nn-pane-transition-duration', `${settings.paneTransitionDuration}ms`);
        }, [containerRef, settings.paneTransitionDuration]);

        // Compute navigation pane style based on orientation and single pane mode
        const navigationPaneStyle = useMemo<React.CSSProperties>(() => {
            if (uiState.singlePane) {
                return { width: '100%', height: '100%' };
            }

            if (orientation === 'vertical') {
                return { width: '100%', flexBasis: `${paneSize}px`, minHeight: `${navigationPaneSizing.minSize}px` };
            }

            return { width: `${paneSize}px`, height: '100%' };
        }, [uiState.singlePane, orientation, paneSize, navigationPaneSizing.minSize]);

        const shouldRenderSinglePaneCalendar =
            uiState.singlePane &&
            settings.calendarEnabled &&
            uxPreferences.showCalendar &&
            settings.calendarPlacement === 'left-sidebar' &&
            settings.calendarLeftPlacement === 'below';
        const { folderNavigationSource, folderDecorationModel, navRainbowState } = useFolderDecorationState();
        const navigationSourceState = useNavigationPaneSourceState({
            app,
            settings,
            activeProfile,
            folderNavigationSource,
            fileData,
            hydratedShortcuts,
            showHiddenItems: uxPreferences.showHiddenItems,
            includeDescendantNotes: uxPreferences.includeDescendantNotes
        });
        const navigationTreeSections = useNavigationPaneTreeSections({
            app,
            settings,
            expansionState,
            showHiddenItems: uxPreferences.showHiddenItems,
            includeDescendantNotes: uxPreferences.includeDescendantNotes,
            sourceState: navigationSourceState,
            selectionScope: navigationSelectionScope,
            tagTreeService,
            propertyTreeService
        });
        const fileItemPillDecorationModel = useFileItemPillDecorationState({
            sourceState: navigationSourceState,
            treeSections: navigationTreeSections,
            includeDescendantNotes: uxPreferences.includeDescendantNotes,
            navRainbowState
        });
        const fileItemPillOrderModel = useMemo<FileItemPillOrderModel>(
            () => ({
                tagTree: navigationSourceState.tagTreeForOrdering,
                rootTagOrderMap: navigationSourceState.rootTagOrderMap,
                tagComparator: navigationSourceState.tagComparator,
                rootPropertyNavigationOrderMap: createIndexMap(navigationTreeSections.resolvedRootPropertyKeys)
            }),
            [
                navigationTreeSections.resolvedRootPropertyKeys,
                navigationSourceState.rootTagOrderMap,
                navigationSourceState.tagComparator,
                navigationSourceState.tagTreeForOrdering
            ]
        );

        return (
            <div className="nn-scale-wrapper" data-ui-scale={scaleWrapperDataAttr} style={scaleWrapperStyle}>
                <div
                    ref={containerCallbackRef}
                    className={containerClasses.join(' ')}
                    data-focus-pane={
                        uiState.singlePane ? (uiState.currentSinglePaneView === 'navigation' ? 'navigation' : 'files') : uiState.focusedPane
                    }
                    data-navigator-focused={isMobile ? 'true' : isNavigatorFocused}
                    data-nav-count-leader-style={settings.navCountLeaderStyle}
                    tabIndex={-1}
                    onKeyDown={() => {
                        // Allow keyboard events to bubble up from child components
                        // The actual keyboard handling is done in NavigationPane and ListPane
                    }}
                >
                    {settings.checkForUpdatesOnStart && <UpdateNoticeBanner notice={bannerNotice} onDismiss={markAsDisplayed} />}
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
                        uiScale={uiScale}
                        rootContainerRef={containerRef}
                        navigationSourceState={navigationSourceState}
                        navigationTreeSections={navigationTreeSections}
                        folderDecorationModel={folderDecorationModel}
                        navRainbowState={navRainbowState}
                        searchNavFilters={searchNavFilters}
                        onExecuteSearchShortcut={handleSearchShortcutExecution}
                        onNavigateToFolder={navigateToFolder}
                        onRevealTag={revealTag}
                        onRevealProperty={revealProperty}
                        onRevealFile={revealFileInNearestFolder}
                        onRevealShortcutFile={handleShortcutNoteReveal}
                        onModifySearchWithTag={handleModifySearchWithTag}
                        onModifySearchWithProperty={handleModifySearchWithProperty}
                        onModifySearchWithDateFilter={handleModifySearchWithDateFilter}
                    />
                    <ListPane
                        ref={listPaneRef}
                        rootContainerRef={containerRef}
                        folderDecorationModel={folderDecorationModel}
                        fileItemPillDecorationModel={fileItemPillDecorationModel}
                        fileItemPillOrderModel={fileItemPillOrderModel}
                        onSearchTokensChange={handleSearchTokensChange}
                        onNavigateToFolder={navigateToFolder}
                        onRevealTag={revealTag}
                        onRevealProperty={revealProperty}
                        resizeHandleProps={!uiState.singlePane ? resizeHandleProps : undefined}
                    />
                    {shouldRenderSinglePaneCalendar ? (
                        <div className="nn-single-pane-calendar">
                            <Calendar
                                onWeekCountChange={handleSinglePaneCalendarWeekCountChange}
                                onAddDateFilter={handleModifySearchWithDateFilter}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    })
);
