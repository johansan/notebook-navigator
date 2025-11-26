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

/**
 * OPTIMIZATIONS:
 *
 * 1. React.memo with forwardRef - Only re-renders on prop changes
 *
 * 2. Virtualization:
 *    - TanStack Virtual for rendering only visible items
 *    - Dynamic height calculation based on content (preview text, tags, metadata)
 *    - Direct memory cache lookups in estimateSize function
 *    - Virtualizer resets only when list order changes (tracked by key)
 *
 * 3. List building optimization:
 *    - useMemo rebuilds list items only when dependencies change
 *    - File filtering happens once during list build
 *    - Sort operations optimized with pre-computed values
 *    - Pinned files handled separately for efficiency
 *
 * 4. Event handling:
 *    - Debounced vault event handlers via forceUpdate
 *    - Selective updates based on file location (folder/tag context)
 *    - Database content changes trigger selective remeasurement
 *
 * 5. Selection handling:
 *    - Stable file index for onClick handlers
 *    - Multi-selection support without re-render
 *    - Keyboard navigation optimized
 */

import React, { useCallback, useRef, useEffect, useImperativeHandle, forwardRef, useState, useMemo } from 'react';
import { TFile, Platform } from 'obsidian';
import { Virtualizer } from '@tanstack/react-virtual';
import { useSelectionState, useSelectionDispatch, resolvePrimarySelectedFile } from '../context/SelectionContext';
import { useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUIState, useUIDispatch } from '../context/UIStateContext';
import { useMultiSelection } from '../hooks/useMultiSelection';
import { useListPaneKeyboard } from '../hooks/useListPaneKeyboard';
import { useListPaneData } from '../hooks/useListPaneData';
import { useListPaneScroll } from '../hooks/useListPaneScroll';
import { useListPaneAppearance } from '../hooks/useListPaneAppearance';
import { useContextMenu } from '../hooks/useContextMenu';
import { useFileOpener } from '../hooks/useFileOpener';
import { strings } from '../i18n';
import { TIMEOUTS } from '../types/obsidian-extended';
import { ListPaneItemType, PINNED_SECTION_HEADER_KEY, UNTAGGED_TAG_ID } from '../types';
import { getEffectiveSortOption } from '../utils/sortUtils';
import { FileItem } from './FileItem';
import { ListPaneHeader } from './ListPaneHeader';
import { ListToolbar } from './ListToolbar';
import { SearchInput } from './SearchInput';
import { ListPaneTitleArea } from './ListPaneTitleArea';
import { SaveSearchShortcutModal } from '../modals/SaveSearchShortcutModal';
import { useShortcuts } from '../context/ShortcutsContext';
import type { SearchShortcut } from '../types/shortcuts';
import { EMPTY_SEARCH_TAG_FILTER_STATE, type SearchTagFilterState } from '../types/search';
import { EMPTY_LIST_MENU_TYPE } from '../utils/contextMenu';
import { useUXPreferenceActions, useUXPreferences } from '../context/UXPreferencesContext';
import { normalizeTagPath } from '../utils/tagUtils';
import { parseFilterSearchTokens, updateFilterQueryWithTag, type InclusionOperator } from '../utils/filterSearch';
import { useSurfaceColorVariables } from '../hooks/useSurfaceColorVariables';
import { LIST_PANE_SURFACE_COLOR_MAPPINGS } from '../constants/surfaceColorMappings';
import { ObsidianIcon } from './ObsidianIcon';
import { runAsyncAction } from '../utils/async';
import { openFileInContext } from '../utils/openFileInContext';
import { getListPaneMeasurements } from '../utils/listPaneMeasurements';

/**
 * Renders the list pane displaying files from the selected folder.
 * Handles file sorting, grouping by date or folder, pinned notes, and auto-selection.
 * Integrates with the app context to manage file selection and navigation.
 *
 * @returns A scrollable list of files grouped by date or folder with empty state handling
 */
interface ExecuteSearchShortcutParams {
    searchShortcut: SearchShortcut;
}

/**
 * Options for selecting a file programmatically
 */
export interface SelectFileOptions {
    /** Mark the selection as keyboard navigation to prevent scroll interference */
    markKeyboardNavigation?: boolean;
    /** Mark the selection as user-initiated to track explicit user actions */
    markUserSelection?: boolean;
    /** Skip opening the file after selection */
    suppressOpen?: boolean;
}

export interface ListPaneHandle {
    getIndexOfPath: (path: string) => number;
    virtualizer: Virtualizer<HTMLDivElement, Element> | null;
    scrollContainerRef: HTMLDivElement | null;
    selectFile: (file: TFile, options?: SelectFileOptions) => void;
    selectAdjacentFile: (direction: 'next' | 'previous') => boolean;
    modifySearchWithTag: (tag: string, operator: InclusionOperator) => void;
    toggleSearch: () => void;
    isSearchOpen: () => boolean;
    focusSearch: () => void;
    executeSearchShortcut: (params: ExecuteSearchShortcutParams) => Promise<void>;
}

interface ListPaneProps {
    /**
     * Reference to the root navigator container (.nn-split-container).
     * This is passed from NotebookNavigatorComponent to ensure keyboard events
     * are captured at the navigator level, not globally. This allows proper
     * keyboard navigation between panes while preventing interference with
     * other Obsidian views.
     */
    rootContainerRef: React.RefObject<HTMLDivElement | null>;
    /**
     * Optional resize handle props for dual-pane mode.
     * When provided, renders a resize handle overlay on the list pane boundary.
     */
    resizeHandleProps?: {
        onMouseDown: (e: React.MouseEvent) => void;
    };
    /**
     * Callback invoked whenever tag-related search tokens change.
     */
    onSearchTokensChange?: (state: SearchTagFilterState) => void;
}

const PINNED_SECTION_ICON_VARIABLE = '--nn-style-pinned-section-icon';
const DEFAULT_PINNED_SECTION_ICON = 'lucide-pin';

function sanitizePinnedSectionIcon(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return '';
    }
    const withoutLeadingQuotes = trimmed.replace(/^['"]+/, '');
    const withoutTrailingQuotes = withoutLeadingQuotes.replace(/['"]+$/, '');
    const sanitized = withoutTrailingQuotes.trim();
    if (sanitized === '#' || sanitized.length === 0) {
        return '';
    }
    return sanitized;
}

function resolvePinnedSectionIcon(): string {
    if (typeof window === 'undefined' || !window.document?.body) {
        return DEFAULT_PINNED_SECTION_ICON;
    }

    try {
        const computed = window.getComputedStyle(window.document.body);
        const rawValue = computed.getPropertyValue(PINNED_SECTION_ICON_VARIABLE);
        const iconName = sanitizePinnedSectionIcon(rawValue);
        return iconName.length > 0 ? iconName : DEFAULT_PINNED_SECTION_ICON;
    } catch {
        return DEFAULT_PINNED_SECTION_ICON;
    }
}

export const ListPane = React.memo(
    forwardRef<ListPaneHandle, ListPaneProps>(function ListPane(props, ref) {
        const { app, commandQueue, isMobile, plugin } = useServices();
        const openFileInWorkspace = useFileOpener();
        const selectionState = useSelectionState();
        const selectionDispatch = useSelectionDispatch();
        const settings = useSettingsState();
        const uxPreferences = useUXPreferences();
        const includeDescendantNotes = uxPreferences.includeDescendantNotes;
        const showHiddenItems = uxPreferences.showHiddenItems;
        const { setSearchActive } = useUXPreferenceActions();
        const appearanceSettings = useListPaneAppearance();
        const uiState = useUIState();
        const uiDispatch = useUIDispatch();
        const shortcuts = useShortcuts();
        const { addSearchShortcut, removeSearchShortcut, searchShortcutsByName } = shortcuts;
        const listPaneRef = useRef<HTMLDivElement>(null);
        /** Maps semi-transparent theme color variables to their pre-composited solid equivalents (see constants/surfaceColorMappings). */
        useSurfaceColorVariables(listPaneRef, {
            app,
            rootContainerRef: props.rootContainerRef,
            variables: LIST_PANE_SURFACE_COLOR_MAPPINGS
        });
        const searchShortcuts = useMemo(() => Array.from(searchShortcutsByName.values()), [searchShortcutsByName]);
        const [isSavingSearchShortcut, setIsSavingSearchShortcut] = useState(false);
        const currentSearchProvider = settings.searchProvider ?? 'internal';
        const listPaneTitle = settings.listPaneTitle ?? 'header';
        const shouldShowDesktopTitleArea = !isMobile && listPaneTitle === 'list';
        const listMeasurements = getListPaneMeasurements(isMobile);
        const [pinnedSectionIcon, setPinnedSectionIcon] = useState(DEFAULT_PINNED_SECTION_ICON);
        const topSpacerHeight = shouldShowDesktopTitleArea ? 0 : listMeasurements.topSpacer;
        const iconColumnStyle = useMemo(() => {
            if (settings.showFileIcons) {
                return undefined;
            }
            return {
                '--nn-file-icon-slot-width': '0px',
                '--nn-file-icon-slot-width-mobile': '0px',
                '--nn-file-icon-slot-gap': '0px'
            } as React.CSSProperties;
        }, [settings.showFileIcons]);

        // Search state - use directly from settings for sync across devices
        const isSearchActive = uxPreferences.searchActive;
        const [searchQuery, setSearchQuery] = useState('');
        // Debounced search query used for data filtering to avoid per-keystroke spikes
        const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
        const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
        // Callback to notify parent component of tag filter changes
        const { onSearchTokensChange } = props;

        // Pre-parsed search tokens matching the debounced query
        const debouncedSearchTokens = useMemo(
            () => parseFilterSearchTokens(isSearchActive ? debouncedSearchQuery : ''),
            [debouncedSearchQuery, isSearchActive]
        );
        const debouncedSearchMode = debouncedSearchTokens.mode;

        // Disable inline highlight when search is operating in tag filter mode
        const searchHighlightQuery = useMemo(() => {
            if (!isSearchActive) {
                return undefined;
            }
            if (debouncedSearchMode === 'tag') {
                return undefined;
            }
            return searchQuery;
        }, [isSearchActive, debouncedSearchMode, searchQuery]);

        // Check if the current search query matches any saved search
        const activeSearchShortcut = useMemo(() => {
            const normalizedQuery = searchQuery.trim();
            if (!normalizedQuery) {
                return null;
            }

            for (const saved of searchShortcuts) {
                if (saved.query === normalizedQuery && saved.provider === currentSearchProvider) {
                    return saved;
                }
            }

            return null;
        }, [searchQuery, searchShortcuts, currentSearchProvider]);

        // Clear search query when search is deactivated externally
        useEffect(() => {
            if (!isSearchActive && searchQuery) {
                setSearchQuery('');
            }
        }, [isSearchActive, searchQuery]);

        // Debounce the query passed into the data hook; keep immediate input for UI/HL
        useEffect(() => {
            if (!isSearchActive) {
                // Clear debounced value when search is not active
                if (debouncedSearchQuery) setDebouncedSearchQuery('');
                return;
            }
            // Skip scheduling if values are already in sync
            if (debouncedSearchQuery === searchQuery) {
                return;
            }
            const id = window.setTimeout(() => {
                setDebouncedSearchQuery(searchQuery);
            }, TIMEOUTS.DEBOUNCE_KEYBOARD);
            return () => window.clearTimeout(id);
        }, [searchQuery, isSearchActive, debouncedSearchQuery]);

        // Extract tag-related tokens from search query and notify parent for navigation pane highlighting
        useEffect(() => {
            if (!onSearchTokensChange) {
                return;
            }

            const trimmed = searchQuery.trim();
            if (!trimmed) {
                onSearchTokensChange(EMPTY_SEARCH_TAG_FILTER_STATE);
                return;
            }

            const tokens = parseFilterSearchTokens(trimmed);
            // Normalize and collect included tag tokens
            const includeSet = new Set<string>();
            tokens.includedTagTokens.forEach(token => {
                const normalized = normalizeTagPath(token);
                if (normalized) {
                    includeSet.add(normalized);
                }
            });

            // Normalize and collect excluded tag tokens
            const excludeSet = new Set<string>();
            tokens.excludeTagTokens.forEach(token => {
                const normalized = normalizeTagPath(token);
                if (normalized) {
                    excludeSet.add(normalized);
                }
            });

            onSearchTokensChange({
                include: Array.from(includeSet),
                exclude: Array.from(excludeSet),
                excludeTagged: tokens.excludeTagged,
                includeUntagged: tokens.includeUntagged,
                requireTagged: tokens.requireTagged
            });
        }, [searchQuery, onSearchTokensChange]);

        useEffect(() => {
            if (typeof window === 'undefined') {
                return;
            }

            const updatePinnedIcon = () => {
                const resolvedIcon = resolvePinnedSectionIcon();
                setPinnedSectionIcon(current => (current === resolvedIcon ? current : resolvedIcon));
            };

            updatePinnedIcon();

            const target = window.document?.body;
            if (!target || typeof MutationObserver === 'undefined') {
                return;
            }

            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === 'attributes') {
                        updatePinnedIcon();
                        break;
                    }
                }
            });

            observer.observe(target, { attributes: true, attributeFilter: ['style', 'class'] });

            return () => observer.disconnect();
        }, []);

        // Helper to toggle search state using UX preferences action
        const setIsSearchActive = useCallback(
            (active: boolean) => {
                setSearchActive(active);
            },
            [setSearchActive]
        );

        // Android uses toolbar at top, iOS at bottom
        const isAndroid = Platform.isAndroidApp;

        // Track if the file selection is from user click vs auto-selection
        const isUserSelectionRef = useRef(false);

        // Keep track of the last selected file path to maintain visual selection during transitions
        const lastSelectedFilePathRef = useRef<string | null>(null);

        // Initialize multi-selection hook
        const multiSelection = useMultiSelection();

        /**
         * Selects a file from the list pane and opens it in the active leaf.
         * Shared between keyboard navigation and command handlers.
         */
        const selectFileFromList = useCallback(
            (file: TFile, options?: SelectFileOptions) => {
                if (!file) {
                    return;
                }

                // Track whether this selection originated from explicit user interaction
                isUserSelectionRef.current = options?.markUserSelection ?? false;

                // Update the selected file in global state
                selectionDispatch({ type: 'SET_SELECTED_FILE', file });

                // Mark as keyboard-driven to prevent automatic scroll interference
                if (options?.markKeyboardNavigation) {
                    selectionDispatch({ type: 'SET_KEYBOARD_NAVIGATION', isKeyboardNavigation: true });
                }

                // Open file in the active leaf without moving focus
                if (!options?.suppressOpen) {
                    openFileInWorkspace(file);
                }
            },
            [selectionDispatch, openFileInWorkspace]
        );

        // Track render count
        const renderCountRef = useRef(0);

        const { selectionType, selectedFolder, selectedTag, selectedFile } = selectionState;

        // Determine if list pane is visible early to optimize
        const isVisible = !uiState.singlePane || uiState.currentSinglePaneView === 'files';

        // Use the new data hook
        const { listItems, orderedFiles, orderedFileIndexMap, filePathToIndex, fileIndexMap, files } = useListPaneData({
            selectionType,
            selectedFolder,
            selectedTag,
            settings,
            // Use debounced value for filtering
            searchQuery: isSearchActive ? debouncedSearchQuery : undefined,
            searchTokens: isSearchActive ? debouncedSearchTokens : undefined,
            visibility: { includeDescendantNotes, showHiddenItems }
        });

        // Determine the target folder path for drag-and-drop of external files
        const activeFolderDropPath = useMemo(() => {
            if (selectionType !== 'folder' || !selectedFolder) {
                return null;
            }
            return selectedFolder.path;
        }, [selectionType, selectedFolder]);

        // Flag to prevent automatic scroll to top when search is triggered from shortcut
        const suppressSearchTopScrollRef = useRef(false);

        // Use the new scroll hook
        const { rowVirtualizer, scrollContainerRef, scrollContainerRefCallback, handleScrollToTop } = useListPaneScroll({
            listItems,
            filePathToIndex,
            selectedFile,
            selectedFolder,
            selectedTag,
            settings,
            folderSettings: appearanceSettings,
            isVisible,
            selectionState,
            selectionDispatch,
            // Use debounced value for scroll orchestration to align with filtering
            searchQuery: isSearchActive ? debouncedSearchQuery : undefined,
            suppressSearchTopScrollRef,
            topSpacerHeight,
            includeDescendantNotes
        });

        // Attach context menu to empty areas in the list pane for file creation
        useContextMenu(scrollContainerRef, selectedFolder ? { type: EMPTY_LIST_MENU_TYPE, item: selectedFolder } : null);

        // Check if we're in compact mode
        const isCompactMode = !appearanceSettings.showDate && !appearanceSettings.showPreview && !appearanceSettings.showImage;

        // Ensure the list has a valid selection for the current filter
        const ensureSelectionForCurrentFilter = useCallback(
            (options?: { openInEditor?: boolean; clearIfEmpty?: boolean; selectFallback?: boolean }) => {
                const openInEditor = options?.openInEditor ?? false;
                const clearIfEmpty = options?.clearIfEmpty ?? false;
                const selectFallback = options?.selectFallback ?? true;
                const hasNoSelection = !selectedFile;
                const selectedFileInList = selectedFile ? filePathToIndex.has(selectedFile.path) : false;
                const needsSelection = hasNoSelection || !selectedFileInList;

                if (needsSelection) {
                    if (selectFallback && orderedFiles.length > 0) {
                        const firstFile = orderedFiles[0];
                        selectFileFromList(firstFile, { suppressOpen: !openInEditor });
                    } else if (!selectFallback && clearIfEmpty && orderedFiles.length === 0) {
                        selectionDispatch({ type: 'SET_SELECTED_FILE', file: null });
                    }
                }
            },
            [selectedFile, orderedFiles, filePathToIndex, selectionDispatch, selectFileFromList]
        );

        /**
         * Handles saving the current search query as a shortcut.
         * Opens a modal to get the shortcut name from the user.
         */
        const handleSaveSearchShortcut = useCallback(() => {
            const normalizedQuery = searchQuery.trim();
            if (!normalizedQuery || isSavingSearchShortcut) {
                return;
            }

            const modal = new SaveSearchShortcutModal(app, {
                initialName: normalizedQuery,
                onSubmit: async name => {
                    setIsSavingSearchShortcut(true);
                    let success = false;
                    try {
                        success = await addSearchShortcut({ name, query: normalizedQuery, provider: currentSearchProvider });
                        return success;
                    } finally {
                        setIsSavingSearchShortcut(false);
                    }
                }
            });
            modal.open();
        }, [app, addSearchShortcut, currentSearchProvider, isSavingSearchShortcut, searchQuery]);

        /**
         * Handles removing the currently active search shortcut.
         * Called when user clicks the remove button for a saved search.
         */
        const handleRemoveSearchShortcut = useCallback(async () => {
            if (!activeSearchShortcut || isSavingSearchShortcut) {
                return;
            }

            setIsSavingSearchShortcut(true);
            try {
                await removeSearchShortcut(activeSearchShortcut.name);
            } finally {
                setIsSavingSearchShortcut(false);
            }
        }, [activeSearchShortcut, isSavingSearchShortcut, removeSearchShortcut]);

        /**
         * Advances the selection to the next or previous file and syncs scroll position
         */
        const selectAdjacentFile = useCallback(
            (direction: 'next' | 'previous') => {
                if (orderedFiles.length === 0) {
                    return false;
                }

                // Resolve the currently selected file from state
                const currentFile = resolvePrimarySelectedFile(app, selectionState);
                const currentIndex = currentFile ? (orderedFileIndexMap.get(currentFile.path) ?? -1) : -1;

                // Calculate the target index based on direction, wrapping to start or end if no current selection
                const targetIndex =
                    currentIndex === -1
                        ? direction === 'next'
                            ? 0
                            : orderedFiles.length - 1
                        : direction === 'next'
                          ? currentIndex + 1
                          : currentIndex - 1;

                // Return false if target is out of bounds
                if (targetIndex < 0 || targetIndex >= orderedFiles.length) {
                    return false;
                }

                // Select the target file and scroll to it in the virtualized list
                const targetFile = orderedFiles[targetIndex];
                selectFileFromList(targetFile, { markKeyboardNavigation: true, markUserSelection: true });
                const virtualIndex = filePathToIndex.get(targetFile.path);
                if (virtualIndex !== undefined) {
                    rowVirtualizer?.scrollToIndex(virtualIndex, { align: 'auto' });
                }

                return true;
            },
            [orderedFiles, orderedFileIndexMap, selectFileFromList, rowVirtualizer, app, selectionState, filePathToIndex]
        );

        const handleFileClick = useCallback(
            (file: TFile, e: React.MouseEvent, fileIndex?: number, orderedFiles?: TFile[]) => {
                // Ignore middle mouse button clicks - they're handled by onMouseDown
                if (e.button === 1) {
                    return;
                }

                isUserSelectionRef.current = true; // Mark this as a user selection

                const isShiftKey = e.shiftKey;
                const isCmdCtrlClick = e.metaKey || e.ctrlKey;
                const isOptionClick = e.altKey;
                const prefersCmdCtrl = settings.multiSelectModifier === 'cmdCtrl';

                const shouldMultiSelect = !isMobile && ((prefersCmdCtrl && isCmdCtrlClick) || (!prefersCmdCtrl && isOptionClick));

                const shouldOpenInNewTab =
                    !isMobile && !shouldMultiSelect && settings.multiSelectModifier === 'optionAlt' && isCmdCtrlClick;

                if (shouldMultiSelect) {
                    multiSelection.handleMultiSelectClick(file, fileIndex, orderedFiles);
                } else if (!isMobile && isShiftKey && fileIndex !== undefined && orderedFiles) {
                    multiSelection.handleRangeSelectClick(file, fileIndex, orderedFiles);
                } else {
                    selectFileFromList(file, {
                        markUserSelection: true,
                        suppressOpen: shouldOpenInNewTab
                    });
                }

                // Always ensure list pane has focus when clicking a file
                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });

                if (!shouldMultiSelect && !isShiftKey) {
                    if (shouldOpenInNewTab) {
                        runAsyncAction(() => openFileInContext({ app, commandQueue, file, context: 'tab' }));
                    }
                }

                // Collapse left sidebar on mobile after opening file
                if (isMobile && app.workspace.leftSplit && !shouldMultiSelect && !isShiftKey) {
                    app.workspace.leftSplit.collapse();
                }
            },
            [app, commandQueue, isMobile, multiSelection, selectFileFromList, settings.multiSelectModifier, uiDispatch]
        );

        /**
         * Utility to wait for next animation frame for UI updates.
         * Ensures DOM changes are rendered before proceeding.
         */
        const waitForNextFrame = useCallback(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())), []);

        // Wait for mobile pane transition animation to complete
        const waitForMobilePaneTransition = useCallback(async () => {
            if (!isMobile) {
                return;
            }

            const container = props.rootContainerRef.current;
            if (!container) {
                return;
            }

            const targetClass = 'show-files';
            const TRANSITION_MS = 200;
            const SAFETY_MS = 20;
            const deadline = performance.now() + TRANSITION_MS + SAFETY_MS;

            while (performance.now() < deadline && container.isConnected && !container.classList.contains(targetClass)) {
                await new Promise(requestAnimationFrame);
            }
        }, [isMobile, props.rootContainerRef]);

        // Move focus to the list pane scroll container
        const focusListScroller = useCallback(() => {
            const scope = props.rootContainerRef.current ?? document;
            const listPaneScroller = scope.querySelector('.nn-list-pane-scroller');
            if (listPaneScroller instanceof HTMLElement) {
                listPaneScroller.focus();
            }
        }, [props.rootContainerRef]);

        /**
         * Executes a saved search from a shortcut.
         * Switches search provider if needed and applies the saved query.
         */
        const executeSearchShortcut = useCallback(
            async ({ searchShortcut }: ExecuteSearchShortcutParams) => {
                const normalizedQuery = searchShortcut.query.trim();
                const targetProvider = searchShortcut.provider ?? 'internal';
                const currentProviderSetting = plugin.settings.searchProvider ?? 'internal';

                // Check if provider needs to be switched
                let providerChanged = false;
                if (currentProviderSetting !== targetProvider) {
                    plugin.settings.searchProvider = targetProvider;
                    providerChanged = true;
                }

                const needsSearchActivation = !isSearchActive;
                if (uiState.singlePane) {
                    uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: 'files' });
                }
                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });

                // Prevent scroll to top on mobile when activating from shortcut
                if (isMobile) {
                    suppressSearchTopScrollRef.current = true;
                    await waitForMobilePaneTransition();
                }

                // Activate search or save provider change
                if (needsSearchActivation) {
                    setIsSearchActive(true);
                } else if (providerChanged) {
                    await plugin.saveSettingsAndUpdate();
                }

                // Set the search query
                setShouldFocusSearch(false);
                setSearchQuery(normalizedQuery);
                setDebouncedSearchQuery(normalizedQuery);

                await waitForNextFrame();
                await waitForNextFrame();

                if (!isMobile) {
                    ensureSelectionForCurrentFilter({ openInEditor: false, clearIfEmpty: true, selectFallback: true });
                }

                focusListScroller();
            },
            [
                plugin,
                isSearchActive,
                setIsSearchActive,
                uiState.singlePane,
                uiDispatch,
                isMobile,
                waitForMobilePaneTransition,
                setSearchQuery,
                setDebouncedSearchQuery,
                waitForNextFrame,
                ensureSelectionForCurrentFilter,
                focusListScroller,
                suppressSearchTopScrollRef
            ]
        );

        // Scroll to top handler for mobile header click
        // Get effective sort option for the current view
        const effectiveSortOption = getEffectiveSortOption(settings, selectionType, selectedFolder, selectedTag);

        // Create a stable onClick handler for FileItem that uses pre-calculated fileIndex
        const handleFileItemClick = useCallback(
            (file: TFile, fileIndex: number | undefined, event: React.MouseEvent) => {
                handleFileClick(file, event, fileIndex, orderedFiles);
            },
            [handleFileClick, orderedFiles]
        );

        // Returns array element at index or undefined if out of bounds
        const safeGetItem = <T,>(array: T[], index: number): T | undefined => {
            return index >= 0 && index < array.length ? array[index] : undefined;
        };

        useEffect(() => {
            if (selectedFile) {
                lastSelectedFilePathRef.current = selectedFile.path;
            }
        }, [selectedFile]);

        // Auto-open file when it's selected via folder/tag change (not user click or keyboard navigation)
        useEffect(() => {
            // Check if this is a reveal operation - if so, skip auto-open
            const isRevealOperation = selectionState.isRevealOperation;
            const isFolderChangeWithAutoSelect = selectionState.isFolderChangeWithAutoSelect;
            const isKeyboardNavigation = selectionState.isKeyboardNavigation;

            // Skip auto-open if this is a reveal operation or keyboard navigation
            if (isRevealOperation || isKeyboardNavigation) {
                // Clear the keyboard navigation flag after processing
                if (isKeyboardNavigation) {
                    selectionDispatch({ type: 'SET_KEYBOARD_NAVIGATION', isKeyboardNavigation: false });
                }
                return;
            }

            // If search is active and auto-select is enabled, we need to select the first filtered file
            if (isSearchActive && settings.autoSelectFirstFileOnFocusChange && !isMobile && isFolderChangeWithAutoSelect) {
                // Ensure selection respects current filter and optionally clear selection if none
                ensureSelectionForCurrentFilter({ openInEditor: true, clearIfEmpty: true });
                isUserSelectionRef.current = false;
                return;
            }

            if (selectedFile && !isUserSelectionRef.current && settings.autoSelectFirstFileOnFocusChange && !isMobile) {
                // Check if we're actively navigating the navigator
                const navigatorEl = document.querySelector('.nn-split-container');
                const hasNavigatorFocus = navigatorEl && navigatorEl.contains(document.activeElement);

                // Open the file if we're not actively using the navigator OR if this is a folder change with auto-select
                if (!hasNavigatorFocus || isFolderChangeWithAutoSelect) {
                    openFileInWorkspace(selectedFile);
                }
            }
            // Reset the flag after processing
            isUserSelectionRef.current = false;
        }, [
            selectedFile,
            settings.autoSelectFirstFileOnFocusChange,
            isMobile,
            selectionState.isRevealOperation,
            selectionState.isFolderChangeWithAutoSelect,
            selectionState.isKeyboardNavigation,
            selectionDispatch,
            isSearchActive,
            files,
            ensureSelectionForCurrentFilter,
            openFileInWorkspace
        ]);

        // Auto-select first file when navigating to files pane with keyboard in dual-pane mode
        useEffect(() => {
            // Only run in dual-pane mode on desktop when using keyboard navigation
            if (uiState.singlePane || isMobile) return;

            // Check if we just gained focus AND it's from keyboard navigation
            if (uiState.focusedPane === 'files' && selectionState.isKeyboardNavigation) {
                // Clear the keyboard navigation flag
                selectionDispatch({ type: 'SET_KEYBOARD_NAVIGATION', isKeyboardNavigation: false });

                // Determine if we need to select a file
                const hasNoSelection = !selectedFile;
                const selectedFileNotInFilteredList = selectedFile && !files.some(f => f.path === selectedFile.path);
                const needsSelection = hasNoSelection || selectedFileNotInFilteredList;

                if (needsSelection && files.length > 0) {
                    // Prefer currently active editor file if visible, otherwise ensure selection using helper
                    const activeFile = app.workspace.getActiveFile();
                    const activeFileInFilteredList = activeFile && files.some(f => f.path === activeFile.path);

                    if (activeFileInFilteredList) {
                        selectionDispatch({ type: 'SET_SELECTED_FILE', file: activeFile });
                    } else {
                        ensureSelectionForCurrentFilter({ openInEditor: true });
                    }
                }
            }
        }, [
            uiState.focusedPane,
            uiState.singlePane,
            isMobile,
            selectionState.isKeyboardNavigation,
            selectedFile,
            files,
            selectionDispatch,
            app.workspace,
            ensureSelectionForCurrentFilter
        ]);

        renderCountRef.current++;

        // Expose the virtualizer instance and file lookup method via the ref
        const modifySearchWithTag = useCallback(
            (tag: string, operator: InclusionOperator) => {
                const normalizedTag = normalizeTagPath(tag);
                if (!normalizedTag || normalizedTag === UNTAGGED_TAG_ID) {
                    return;
                }

                if (!isSearchActive) {
                    setIsSearchActive(true);
                    if (uiState.singlePane) {
                        uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: 'files' });
                    }
                }

                setShouldFocusSearch(true);
                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });

                let nextQueryValue: string | null = null;

                setSearchQuery(prev => {
                    const result = updateFilterQueryWithTag(prev, normalizedTag, operator);
                    nextQueryValue = result.query;
                    return result.query;
                });

                if (nextQueryValue !== null) {
                    setDebouncedSearchQuery(nextQueryValue);
                }
            },
            [
                setIsSearchActive,
                uiDispatch,
                setShouldFocusSearch,
                setSearchQuery,
                setDebouncedSearchQuery,
                isSearchActive,
                uiState.singlePane
            ]
        );

        useImperativeHandle(
            ref,
            () => ({
                getIndexOfPath: (path: string) => filePathToIndex.get(path) ?? -1,
                virtualizer: rowVirtualizer,
                scrollContainerRef: scrollContainerRef.current,
                // Allow parent components to trigger file selection programmatically
                selectFile: selectFileFromList,
                // Provide imperative adjacent navigation for command handlers
                selectAdjacentFile,
                // Toggle or modify search query to include/exclude a tag with AND/OR operator
                modifySearchWithTag,
                // Toggle search mode on/off or focus existing search
                toggleSearch: () => {
                    if (isSearchActive) {
                        // Search is already open - just focus the search input
                        setTimeout(() => {
                            const scope = props.rootContainerRef.current ?? document;
                            const searchInput = scope.querySelector('.nn-search-input') as HTMLInputElement;
                            if (searchInput) {
                                searchInput.focus();
                                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });
                            }
                        }, 0);
                    } else {
                        // Opening search - activate with focus
                        setShouldFocusSearch(true);
                        setIsSearchActive(true);
                        if (uiState.singlePane) {
                            uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: 'files' });
                        }
                        uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });
                    }
                },
                isSearchOpen: () => isSearchActive,
                focusSearch: () => {
                    if (isSearchActive) {
                        setTimeout(() => {
                            const scope = props.rootContainerRef.current ?? document;
                            const searchInput = scope.querySelector('.nn-search-input') as HTMLInputElement;
                            if (searchInput) {
                                searchInput.focus();
                                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });
                            }
                        }, 0);
                    }
                },
                executeSearchShortcut
            }),
            [
                filePathToIndex,
                rowVirtualizer,
                scrollContainerRef,
                isSearchActive,
                uiDispatch,
                setIsSearchActive,
                setShouldFocusSearch,
                props.rootContainerRef,
                uiState.singlePane,
                executeSearchShortcut,
                selectFileFromList,
                selectAdjacentFile,
                modifySearchWithTag
            ]
        );

        // Add keyboard navigation
        // Note: We pass the root container ref, not the scroll container ref.
        // This ensures keyboard events work across the entire navigator, allowing
        // users to navigate between panes (navigation <-> files) with Tab/Arrow keys.
        useListPaneKeyboard({
            items: listItems,
            virtualizer: rowVirtualizer,
            containerRef: props.rootContainerRef,
            pathToIndex: filePathToIndex,
            files,
            fileIndexMap,
            onSelectFile: file => selectFileFromList(file, { markKeyboardNavigation: true })
        });

        // Determine if we're showing empty state
        const isEmptySelection = !selectedFolder && !selectedTag;
        const hasNoFiles = files.length === 0;

        // Single return with conditional content
        return (
            <div
                ref={listPaneRef}
                className={`nn-list-pane ${isSearchActive ? 'nn-search-active' : ''}`}
                style={iconColumnStyle ?? undefined}
            >
                {props.resizeHandleProps && <div className="nn-resize-handle" {...props.resizeHandleProps} />}
                <ListPaneHeader
                    onHeaderClick={handleScrollToTop}
                    isSearchActive={isSearchActive}
                    onSearchToggle={() => {
                        if (!isSearchActive) {
                            // Opening search - activate with focus
                            setShouldFocusSearch(true);
                            setIsSearchActive(true);
                            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });
                        } else {
                            // Closing search
                            setIsSearchActive(false);
                            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                        }
                    }}
                />
                {/* Search bar - collapsible */}
                <div className={`nn-search-bar-container ${isSearchActive ? 'nn-search-bar-visible' : ''}`}>
                    {isSearchActive && (
                        <SearchInput
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            shouldFocus={shouldFocusSearch}
                            onFocusComplete={() => setShouldFocusSearch(false)}
                            onClose={() => {
                                setIsSearchActive(false);
                            }}
                            onFocusFiles={() => {
                                // Ensure selection exists when focusing list from search (no editor open)
                                ensureSelectionForCurrentFilter({ openInEditor: false });
                            }}
                            containerRef={props.rootContainerRef}
                            onSaveShortcut={!activeSearchShortcut ? handleSaveSearchShortcut : undefined}
                            onRemoveShortcut={activeSearchShortcut ? handleRemoveSearchShortcut : undefined}
                            isShortcutSaved={Boolean(activeSearchShortcut)}
                            isShortcutDisabled={isSavingSearchShortcut}
                        />
                    )}
                </div>
                {/* Android - toolbar at top */}
                {isMobile && isAndroid && (
                    <ListToolbar
                        isSearchActive={isSearchActive}
                        onSearchToggle={() => {
                            if (!isSearchActive) {
                                // Opening search - activate with focus
                                setShouldFocusSearch(true);
                                setIsSearchActive(true);
                                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });
                            } else {
                                setIsSearchActive(false);
                                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                            }
                        }}
                    />
                )}

                {/* Conditional content rendering */}
                {isEmptySelection ? (
                    <div
                        ref={scrollContainerRefCallback}
                        className="nn-list-pane-scroller nn-empty-state"
                        // Drop zone type (folder or tag)
                        data-drop-zone={activeFolderDropPath ? 'folder' : undefined}
                        // Target path for the drop operation
                        data-drop-path={activeFolderDropPath ?? undefined}
                        // Block internal file moves to empty state drop zones
                        data-allow-internal-drop={activeFolderDropPath ? 'false' : undefined}
                        // Allow external file imports to empty state drop zones
                        data-allow-external-drop={activeFolderDropPath ? 'true' : undefined}
                    >
                        <div className="nn-empty-message">{strings.listPane.emptyStateNoSelection}</div>
                    </div>
                ) : hasNoFiles ? (
                    <div
                        ref={scrollContainerRefCallback}
                        className="nn-list-pane-scroller nn-empty-state"
                        // Drop zone type (folder or tag)
                        data-drop-zone={activeFolderDropPath ? 'folder' : undefined}
                        // Target path for the drop operation
                        data-drop-path={activeFolderDropPath ?? undefined}
                        // Block internal file moves to empty state drop zones
                        data-allow-internal-drop={activeFolderDropPath ? 'false' : undefined}
                        // Allow external file imports to empty state drop zones
                        data-allow-external-drop={activeFolderDropPath ? 'true' : undefined}
                    >
                        <div className="nn-empty-message">{strings.listPane.emptyStateNoNotes}</div>
                    </div>
                ) : (
                    <>
                        {shouldShowDesktopTitleArea && <ListPaneTitleArea isVisible={shouldShowDesktopTitleArea} />}
                        <div
                            ref={scrollContainerRefCallback}
                            className={`nn-list-pane-scroller ${isCompactMode ? 'nn-compact-mode' : ''}`}
                            // Drop zone type (folder or tag)
                            data-drop-zone={activeFolderDropPath ? 'folder' : undefined}
                            // Target path for the drop operation
                            data-drop-path={activeFolderDropPath ?? undefined}
                            // Block internal file moves to non-item areas
                            data-allow-internal-drop={activeFolderDropPath ? 'false' : undefined}
                            // Allow external file imports to non-item areas
                            data-allow-external-drop={activeFolderDropPath ? 'true' : undefined}
                            data-pane="files"
                            role="list"
                            tabIndex={-1}
                        >
                            {/* Virtual list */}
                            {listItems.length > 0 && (
                                <div
                                    className="nn-virtual-container"
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map(virtualItem => {
                                        const item = safeGetItem(listItems, virtualItem.index);
                                        if (!item) return null;
                                        // Check if file is selected
                                        let isSelected = false;
                                        if (item.type === ListPaneItemType.FILE && item.data instanceof TFile) {
                                            isSelected = multiSelection.isFileSelected(item.data);

                                            // During folder navigation transitions, if nothing is selected in the current list,
                                            // maintain the last selected file's visual selection to prevent flicker
                                            if (!isSelected && selectionState.isFolderNavigation && lastSelectedFilePathRef.current) {
                                                isSelected = item.data.path === lastSelectedFilePathRef.current;
                                            }
                                        }

                                        // Check if this is the last file item
                                        const nextItem = safeGetItem(listItems, virtualItem.index + 1);
                                        const isLastFile =
                                            item.type === ListPaneItemType.FILE &&
                                            (virtualItem.index === listItems.length - 1 ||
                                                (nextItem &&
                                                    (nextItem.type === ListPaneItemType.HEADER ||
                                                        nextItem.type === ListPaneItemType.TOP_SPACER ||
                                                        nextItem.type === ListPaneItemType.BOTTOM_SPACER)));

                                        // Check if adjacent items are selected (for styling purposes)
                                        const prevItem = safeGetItem(listItems, virtualItem.index - 1);
                                        const hasSelectedAbove =
                                            item.type === ListPaneItemType.FILE &&
                                            prevItem?.type === ListPaneItemType.FILE &&
                                            prevItem.data instanceof TFile &&
                                            multiSelection.isFileSelected(prevItem.data);
                                        const hasSelectedBelow =
                                            item.type === ListPaneItemType.FILE &&
                                            nextItem?.type === ListPaneItemType.FILE &&
                                            nextItem.data instanceof TFile &&
                                            multiSelection.isFileSelected(nextItem.data);

                                        // Check if this is the first header (same logic as in estimateSize)
                                        // Index 1 because TOP_SPACER is at index 0
                                        const isFirstHeader = item.type === ListPaneItemType.HEADER && virtualItem.index === 1;
                                        const isPinnedHeader =
                                            item.type === ListPaneItemType.HEADER && item.key === PINNED_SECTION_HEADER_KEY;
                                        const headerLabel =
                                            item.type === ListPaneItemType.HEADER && typeof item.data === 'string' ? item.data : '';

                                        // Find current date group for file items
                                        let dateGroup: string | null = null;
                                        if (item.type === ListPaneItemType.FILE) {
                                            // Look backwards to find the most recent header
                                            for (let i = virtualItem.index - 1; i >= 0; i--) {
                                                const prevItem = safeGetItem(listItems, i);
                                                if (prevItem && prevItem.type === ListPaneItemType.HEADER) {
                                                    dateGroup = prevItem.data as string;
                                                    break;
                                                }
                                            }
                                        }

                                        // Compute separator visibility (class-based, not relational selectors)
                                        // - Hide the current row's separator when this row is the last in a contiguous
                                        //   selected block (selected && !hasSelectedBelow)
                                        // - Also hide the current row's separator when the next row starts a selected block
                                        //   (!selected && next is selected) to remove the line just before a selection.
                                        const hideSeparator =
                                            item.type === ListPaneItemType.FILE &&
                                            ((isSelected && !hasSelectedBelow) ||
                                                (!isSelected &&
                                                    nextItem?.type === ListPaneItemType.FILE &&
                                                    nextItem.data instanceof TFile &&
                                                    multiSelection.isFileSelected(nextItem.data)));

                                        return (
                                            <div
                                                key={virtualItem.key}
                                                // Apply a lightweight class to control separator visibility
                                                className={`nn-virtual-item ${
                                                    item.type === ListPaneItemType.FILE ? 'nn-virtual-file-item' : ''
                                                } ${isLastFile ? 'nn-last-file' : ''} ${hideSeparator ? 'nn-hide-separator-selection' : ''}`}
                                                style={
                                                    {
                                                        top: virtualItem.start,
                                                        '--item-height': `${virtualItem.size}px`
                                                    } as React.CSSProperties
                                                }
                                                data-index={virtualItem.index}
                                            >
                                                {item.type === ListPaneItemType.HEADER ? (
                                                    <div
                                                        className={`nn-date-group-header ${isFirstHeader ? 'nn-first-header' : ''} ${
                                                            isPinnedHeader ? 'nn-pinned-section-header' : ''
                                                        }`}
                                                    >
                                                        {isPinnedHeader ? (
                                                            <>
                                                                {settings.showPinnedIcon ? (
                                                                    <ObsidianIcon
                                                                        name={pinnedSectionIcon}
                                                                        className="nn-date-group-header-icon"
                                                                        aria-hidden={true}
                                                                    />
                                                                ) : null}
                                                                <span className="nn-date-group-header-text">{headerLabel}</span>
                                                            </>
                                                        ) : (
                                                            <span className="nn-date-group-header-text">{headerLabel}</span>
                                                        )}
                                                    </div>
                                                ) : item.type === ListPaneItemType.TOP_SPACER ? (
                                                    <div className="nn-list-top-spacer" style={{ height: `${topSpacerHeight}px` }} />
                                                ) : item.type === ListPaneItemType.BOTTOM_SPACER ? (
                                                    <div className="nn-list-bottom-spacer" />
                                                ) : item.type === ListPaneItemType.FILE && item.data instanceof TFile ? (
                                                    <FileItem
                                                        key={item.key} // Ensures each file gets a fresh component instance, preventing stale data from previous files
                                                        file={item.data}
                                                        isSelected={isSelected}
                                                        hasSelectedAbove={hasSelectedAbove}
                                                        hasSelectedBelow={hasSelectedBelow}
                                                        onFileClick={handleFileItemClick}
                                                        fileIndex={item.fileIndex}
                                                        selectionType={selectionType}
                                                        dateGroup={dateGroup}
                                                        sortOption={effectiveSortOption}
                                                        parentFolder={item.parentFolder}
                                                        isPinned={item.isPinned}
                                                        searchQuery={searchHighlightQuery}
                                                        searchMeta={item.searchMeta}
                                                        // Pass hidden state for muted rendering style
                                                        isHidden={Boolean(item.isHidden)}
                                                        onModifySearchWithTag={modifySearchWithTag}
                                                        fileIconSize={listMeasurements.fileIconSize}
                                                    />
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* iOS - toolbar at bottom */}
                {isMobile && !isAndroid && (
                    <ListToolbar
                        isSearchActive={isSearchActive}
                        onSearchToggle={() => {
                            if (!isSearchActive) {
                                // Opening search - activate with focus
                                setShouldFocusSearch(true);
                                setIsSearchActive(true);
                                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });
                            } else {
                                setIsSearchActive(false);
                                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
                            }
                        }}
                    />
                )}
            </div>
        );
    })
);
