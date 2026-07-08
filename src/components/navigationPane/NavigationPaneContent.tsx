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

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Platform, TFile, TFolder } from 'obsidian';
import { Virtualizer } from '@tanstack/react-virtual';
import { useExpansionDispatch, useExpansionState } from '../../context/ExpansionContext';
import { useNavigationSelection, useSelectionDispatch } from '../../context/SelectionContext';
import { useServices, useMetadataService, useCommandQueue } from '../../context/ServicesContext';
import { useSettingsState, useSettingsUpdate, useActiveProfile } from '../../context/SettingsContext';
import { useUXPreferences } from '../../context/UXPreferencesContext';
import { useFileCache } from '../../context/StorageContext';
import { useUIState, useUIDispatch } from '../../context/UIStateContext';
import { useNavigationPaneKeyboard } from '../../hooks/useNavigationPaneKeyboard';
import { useNavigationPaneData } from '../../hooks/navigationPane/useNavigationPaneData';
import { useNavigationPaneScroll } from '../../hooks/useNavigationPaneScroll';
import { useNavigationRootReorder } from '../../hooks/useNavigationRootReorder';
import { useMeasuredElementHeight } from '../../hooks/useMeasuredElementHeight';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import { useSurfaceColorVariables } from '../../hooks/useSurfaceColorVariables';
import { useNavigationPaneShortcuts } from '../../hooks/navigationPane/useNavigationPaneShortcuts';
import { useNavigationPaneTreeInteractions } from '../../hooks/navigationPane/useNavigationPaneTreeInteractions';
import { useNavigationSearchHighlights } from '../../hooks/navigationPane/useNavigationSearchHighlights';
import { useStableHandlerFacade } from '../../hooks/useStableHandlerFacade';
import { buildNavigationInlineRenameTarget, matchNavigationInlineRenameTarget, replacePathLeaf } from './navigationRenameTarget';
import type { SearchNavFilterState } from '../../types/search';
import type { NoteCountInfo } from '../../types/noteCounts';
import type { InclusionOperator } from '../../utils/filterSearch';
import {
    IOS_FLOATING_TOOLBAR_HEIGHT_PX,
    ItemType,
    NavigationPaneItemType,
    NavigationSectionId,
    NAVIGATION_PANE_DIMENSIONS,
    RECENT_NOTES_VIRTUAL_FOLDER_ID,
    SHORTCUTS_VIRTUAL_FOLDER_ID,
    TAGS_ROOT_VIRTUAL_FOLDER_ID,
    type CSSPropertiesWithVars
} from '../../types';
import { STORAGE_KEYS } from '../../types';
import { Calendar } from '../calendar';
import { NavigationBanner } from '../NavigationBanner';
import { NavigationRootReorderPanel } from '../NavigationRootReorderPanel';
import { NavigationToolbar } from '../NavigationToolbar';
import { localStorage } from '../../utils/localStorage';
import { getSelectedPath } from '../../utils/selectionUtils';
import {
    buildIndentGuideLevelsMap,
    getNavigationIndex,
    getNavigationItemRenderKey,
    normalizeNavigationPath
} from '../../utils/navigationIndex';
import { collectAllTagPaths } from '../../utils/tagTree';
import { getNavigationExpansionTargetForItem, toggleNavigationExpansionTarget } from '../../utils/navigationExpansion';
import type { TagTreeNode } from '../../types/storage';
import { normalizeNavigationSectionOrderInput } from '../../utils/navigationSections';
import { compositeWithBase } from '../../utils/colorUtils';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import { PropertyKeyVisibilityModal } from '../../modals/PropertyKeyVisibilityModal';
import type { NavigateToFolderOptions, RevealPropertyOptions, RevealTagOptions } from '../../hooks/useNavigatorReveal';
import { NAVIGATION_PANE_SURFACE_COLOR_MAPPINGS } from '../../constants/surfaceColorMappings';
import { showNavigationSectionContextMenu } from '../../utils/contextMenu';
import { verticalAxisOnly } from '../../utils/dndConfig';
import type { CombinedNavigationItem } from '../../types/virtualization';
import { NavigationPaneItemRenderer } from './NavigationPaneItemRenderer';
import { NavigationPaneLayout } from './NavigationPaneLayout';
import type { NavigationInlineRenameTarget, NavigationPaneRowContext, NavigationPaneRowHotState } from './NavigationPaneItemRenderer.types';
import { isNavigationItemFilled, isNavigationItemSelected } from './navigationPaneItemState';
import type {
    NavigationPaneShortcutRowHandlers,
    NavigationPaneShortcutUiState
} from '../../hooks/navigationPane/navigationPaneShortcutTypes';
import type { NavigationRainbowState } from '../../hooks/useNavigationRainbowState';
import type { NavigationPaneSourceState } from '../../hooks/navigationPane/data/useNavigationPaneSourceState';
import type { NavigationPaneTreeSectionsResult } from '../../hooks/navigationPane/data/useNavigationPaneTreeSections';
import type { FolderDecorationModel } from '../../utils/folderDecoration';
import { focusElementPreventScroll } from '../../utils/domUtils';

const EMPTY_INDENT_GUIDE_MAP = new Map<string, number[]>();

export interface NavigationPaneHandle {
    getIndexOfPath: (itemType: ItemType, path: string) => number;
    virtualizer: Virtualizer<HTMLDivElement, Element> | null;
    scrollContainerRef: HTMLDivElement | null;
    requestScroll: (path: string, options: { align?: 'auto' | 'center' | 'start' | 'end'; itemType: ItemType }) => void;
    triggerSelectedItemCollapse: () => boolean;
    openShortcutByNumber: (shortcutNumber: number) => Promise<boolean>;
}

interface NavigationPaneProps {
    style?: React.CSSProperties;
    uiScale: number;
    rootContainerRef: React.RefObject<HTMLDivElement | null>;
    navigationSourceState: NavigationPaneSourceState;
    navigationTreeSections: NavigationPaneTreeSectionsResult;
    folderDecorationModel: FolderDecorationModel;
    navRainbowState: NavigationRainbowState;
    searchNavFilters?: SearchNavFilterState;
    onExecuteSearchShortcut?: (shortcutKey: string, searchShortcut: import('../../types/shortcuts').SearchShortcut) => Promise<void> | void;
    onNavigateToFolder: (folderPath: string, options?: NavigateToFolderOptions) => void;
    onRevealTag: (tagPath: string, options?: RevealTagOptions) => void;
    onRevealProperty: (propertyNodeId: string, options?: RevealPropertyOptions) => boolean;
    onRevealFile: (file: TFile) => void;
    onRevealShortcutFile?: (file: TFile) => void;
    onModifySearchWithTag: (tag: string, operator: InclusionOperator) => void;
    onModifySearchWithProperty: (key: string, value: string | null, operator: InclusionOperator) => void;
    onModifySearchWithDateFilter: (dateToken: string) => void;
}

export const NavigationPane = React.memo(
    forwardRef<NavigationPaneHandle, NavigationPaneProps>(function NavigationPane(props, ref) {
        const { app, isMobile, plugin, fileSystemOps, propertyTreeService, tagOperations, propertyOperations } = useServices();
        const commandQueue = useCommandQueue();
        const metadataService = useMetadataService();
        const expansionState = useExpansionState();
        const expansionDispatch = useExpansionDispatch();
        const selectionState = useNavigationSelection();
        const selectionDispatch = useSelectionDispatch();
        const settings = useSettingsState();
        const activeProfile = useActiveProfile();
        const updateSettings = useSettingsUpdate();
        const uxPreferences = useUXPreferences();
        const uiState = useUIState();
        const uiDispatch = useUIDispatch();
        const { fileData, getFile, getFileDisplayName, getFileTimestamps, isStorageReady } = useFileCache();
        const getFileWordCount = useCallback(
            (file: TFile): number | null => {
                return getFile(file.path)?.wordCount ?? null;
            },
            [getFile]
        );
        const { startPointerDrag } = usePointerDrag();
        const {
            searchNavFilters,
            onExecuteSearchShortcut,
            rootContainerRef,
            onNavigateToFolder,
            onRevealTag,
            onRevealProperty,
            onRevealFile,
            onRevealShortcutFile,
            onModifySearchWithTag,
            onModifySearchWithProperty,
            onModifySearchWithDateFilter,
            uiScale
        } = props;

        const showHiddenItems = uxPreferences.showHiddenItems;
        const showCalendar = uxPreferences.showCalendar;
        const isVerticalDualPane = !uiState.singlePane && uiState.effectiveDualPaneOrientation === 'vertical';
        const shouldRenderCalendarOverlay =
            settings.calendarEnabled &&
            settings.calendarPlacement === 'left-sidebar' &&
            showCalendar &&
            ((!uiState.singlePane && !isVerticalDualPane) ||
                (uiState.singlePane && settings.calendarLeftPlacement === 'navigation' && uiState.currentSinglePaneView === 'navigation'));

        const [calendarWeekCount, setCalendarWeekCount] = useState<number>(() => settings.calendarWeeksToShow);
        useEffect(() => {
            if (settings.calendarWeeksToShow !== 6) {
                setCalendarWeekCount(settings.calendarWeeksToShow);
            }
        }, [settings.calendarWeeksToShow]);

        const navigationPaneRef = useRef<HTMLDivElement | null>(null);
        const navigationBannerRef = useRef<HTMLDivElement | null>(null);
        const pinnedShortcutsContainerRef = useRef<HTMLDivElement | null>(null);
        const [pinnedShortcutsScrollElement, setPinnedShortcutsScrollElement] = useState<HTMLDivElement | null>(null);
        const [pinnedShortcutsHasOverflow, setPinnedShortcutsHasOverflow] = useState(false);
        const pinnedShortcutsResizeFrameRef = useRef<number | null>(null);
        const pinnedShortcutsResizeHeightRef = useRef<number>(0);
        const scaleFactor = Number.isFinite(uiScale) && uiScale > 0 ? uiScale : 1;

        const pinnedShortcutsScrollRefCallback = useCallback((node: HTMLDivElement | null) => {
            setPinnedShortcutsScrollElement(node);
        }, []);

        const [pinnedShortcutsMaxHeight, setPinnedShortcutsMaxHeight] = useState<number | null>(() => {
            const stored = localStorage.get<number>(STORAGE_KEYS.pinnedShortcutsMaxHeightKey);
            if (typeof stored !== 'number' || !Number.isFinite(stored) || stored <= 0) {
                return null;
            }
            return Math.max(NAVIGATION_PANE_DIMENSIONS.pinnedShortcutsMinHeight, Math.round(stored));
        });
        const [isPinnedShortcutsResizing, setIsPinnedShortcutsResizing] = useState(false);

        const updatePinnedShortcutsOverflow = useCallback(
            (element?: HTMLDivElement | null) => {
                const target = element ?? pinnedShortcutsScrollElement;
                if (!target) {
                    setPinnedShortcutsHasOverflow(false);
                    return;
                }

                const hasOverflow = target.scrollHeight - target.clientHeight > 1;
                setPinnedShortcutsHasOverflow(prev => (prev === hasOverflow ? prev : hasOverflow));
            },
            [pinnedShortcutsScrollElement]
        );

        const schedulePinnedShortcutsHeightUpdate = useCallback((height: number) => {
            pinnedShortcutsResizeHeightRef.current = height;
            if (pinnedShortcutsResizeFrameRef.current !== null) {
                return;
            }
            pinnedShortcutsResizeFrameRef.current = window.requestAnimationFrame(() => {
                pinnedShortcutsResizeFrameRef.current = null;
                setPinnedShortcutsMaxHeight(pinnedShortcutsResizeHeightRef.current);
            });
        }, []);

        useEffect(() => {
            return () => {
                if (pinnedShortcutsResizeFrameRef.current !== null) {
                    cancelAnimationFrame(pinnedShortcutsResizeFrameRef.current);
                    pinnedShortcutsResizeFrameRef.current = null;
                }
            };
        }, []);

        useLayoutEffect(() => {
            const element = pinnedShortcutsScrollElement;
            if (!element) {
                setPinnedShortcutsHasOverflow(false);
                return;
            }

            updatePinnedShortcutsOverflow(element);

            if (typeof ResizeObserver === 'undefined') {
                return;
            }

            const resizeObserver = new ResizeObserver(() => {
                updatePinnedShortcutsOverflow(element);
            });
            resizeObserver.observe(element);

            return () => {
                resizeObserver.disconnect();
            };
        }, [pinnedShortcutsScrollElement, updatePinnedShortcutsOverflow]);

        const handlePinnedShortcutsResizePointerDown = useCallback(
            (event: React.PointerEvent<HTMLDivElement>) => {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }

                const pinnedElement = pinnedShortcutsContainerRef.current;
                const scrollElement = pinnedShortcutsScrollElement;
                if (!pinnedElement || !scrollElement) {
                    return;
                }

                const shouldTrackResizeState = !isMobile;
                const handleHeight = Math.round(event.currentTarget.getBoundingClientRect().height / scaleFactor);
                const maxAllowed = Math.round(scrollElement.scrollHeight + handleHeight);
                const minAllowed = Math.min(NAVIGATION_PANE_DIMENSIONS.pinnedShortcutsMinHeight, maxAllowed);
                const startMaxHeight = Math.min(Math.round(pinnedElement.getBoundingClientRect().height / scaleFactor), maxAllowed);
                const startY = event.clientY;
                let currentMaxHeight = startMaxHeight;

                event.preventDefault();
                event.stopPropagation();

                if (shouldTrackResizeState) {
                    setIsPinnedShortcutsResizing(true);
                }

                const clamp = (value: number) => Math.min(Math.max(value, minAllowed), maxAllowed);
                schedulePinnedShortcutsHeightUpdate(currentMaxHeight);

                startPointerDrag({
                    event,
                    onMove: (moveEvent: PointerEvent) => {
                        const deltaY = (moveEvent.clientY - startY) / scaleFactor;
                        currentMaxHeight = clamp(startMaxHeight + deltaY);
                        schedulePinnedShortcutsHeightUpdate(currentMaxHeight);
                    },
                    onEnd: () => {
                        if (pinnedShortcutsResizeFrameRef.current !== null) {
                            cancelAnimationFrame(pinnedShortcutsResizeFrameRef.current);
                            pinnedShortcutsResizeFrameRef.current = null;
                        }
                        const contentFitHeight = Math.round(scrollElement.scrollHeight + handleHeight);
                        if (currentMaxHeight >= contentFitHeight - 2) {
                            setPinnedShortcutsMaxHeight(null);
                            localStorage.remove(STORAGE_KEYS.pinnedShortcutsMaxHeightKey);
                        } else {
                            localStorage.set(STORAGE_KEYS.pinnedShortcutsMaxHeightKey, currentMaxHeight);
                            setPinnedShortcutsMaxHeight(currentMaxHeight);
                        }
                        if (shouldTrackResizeState) {
                            setIsPinnedShortcutsResizing(false);
                        }
                    }
                });
            },
            [isMobile, pinnedShortcutsScrollElement, scaleFactor, schedulePinnedShortcutsHeightUpdate, startPointerDrag]
        );

        const [sectionOrder, setSectionOrder] = useState<NavigationSectionId[]>(() => {
            const stored = localStorage.get<unknown>(STORAGE_KEYS.navigationSectionOrderKey);
            return normalizeNavigationSectionOrderInput(stored);
        });
        const [foldersSectionExpanded, setFoldersSectionExpanded] = useState(true);
        const [tagsSectionExpanded, setTagsSectionExpanded] = useState(true);
        const [propertiesSectionExpanded, setPropertiesSectionExpanded] = useState(true);
        const [inlineRenameTarget, setInlineRenameTarget] = useState<NavigationInlineRenameTarget | null>(null);
        const handleToggleFoldersSection = useCallback(() => {
            setFoldersSectionExpanded(prev => !prev);
        }, []);
        const handleToggleTagsSection = useCallback(() => {
            setTagsSectionExpanded(prev => !prev);
        }, []);
        const handleTogglePropertiesSection = useCallback(() => {
            setPropertiesSectionExpanded(prev => !prev);
        }, []);
        const [isRootReorderMode, setRootReorderMode] = useState(false);

        const handleConfigurePropertyKeysFromSectionMenu = useCallback(() => {
            const profile = getActiveVaultProfile(plugin.settings);
            const modal = new PropertyKeyVisibilityModal(app, {
                initialKeys: profile.propertyKeys,
                onSave: async nextKeys => {
                    profile.propertyKeys = nextKeys;
                    await plugin.saveSettingsAndUpdate();
                }
            });
            modal.open();
        }, [app, plugin]);

        const folderCountsRef = useRef<Map<string, NoteCountInfo>>(new Map());
        const tagCountsRef = useRef<Map<string, NoteCountInfo>>(new Map());
        const propertyCountsRef = useRef<Map<string, NoteCountInfo>>(new Map());

        const shortcuts = useNavigationPaneShortcuts({
            rootContainerRef,
            isRootReorderMode,
            onExecuteSearchShortcut,
            onNavigateToFolder,
            onRevealTag,
            onRevealProperty,
            onRevealFile,
            onRevealShortcutFile,
            getFolderCounts: () => folderCountsRef.current,
            getTagCounts: () => tagCountsRef.current,
            getPropertyCounts: () => propertyCountsRef.current,
            onConfigurePropertyKeys: handleConfigurePropertyKeysFromSectionMenu
        });

        const shortcutsRef = useRef(shortcuts);
        shortcutsRef.current = shortcuts;

        // Identity-stable facade; calls forward to the latest shortcut handlers through a ref.
        // Only handler members may be listed here; values rows read during render belong in
        // shortcutUiState so row memoization sees them change. The count getters read the same
        // folder/tag/property count maps that rowContext depends on, so rows re-render through
        // rowContext when counts change and these reads stay fresh.
        const shortcutRowHandlers: NavigationPaneShortcutRowHandlers = useStableHandlerFacade(shortcuts, [
            'removeShortcut',
            'handleShortcutFolderActivate',
            'handleShortcutFolderNoteClick',
            'handleShortcutFolderNoteMouseDown',
            'handleShortcutNoteActivate',
            'handleShortcutNoteMouseDown',
            'handleRecentNoteActivate',
            'handleShortcutSearchActivate',
            'handleShortcutTagActivate',
            'handleShortcutPropertyActivate',
            'handleShortcutContextMenu',
            'handleRecentFileContextMenu',
            'handleShortcutRootDragOver',
            'handleShortcutRootDrop',
            'buildShortcutExternalHandlers',
            'getFolderShortcutCount',
            'getTagShortcutCount',
            'getPropertyShortcutCount',
            'getMissingNoteLabel'
        ]);

        const shortcutUiState = useMemo<NavigationPaneShortcutUiState>(
            () => ({
                shouldUseShortcutDnd: shortcuts.shouldUseShortcutDnd,
                allowEmptyShortcutDrop: shortcuts.allowEmptyShortcutDrop,
                shortcutDragHandleConfig: shortcuts.shortcutDragHandleConfig,
                shortcutHeaderTrailingAction: shortcuts.shortcutHeaderTrailingAction,
                propertiesHeaderTrailingAction: shortcuts.propertiesHeaderTrailingAction,
                shortcutNumberBadgesByKey: shortcuts.shortcutNumberBadgesByKey,
                shouldShowShortcutCounts: shortcuts.shouldShowShortcutCounts
            }),
            [
                shortcuts.shouldUseShortcutDnd,
                shortcuts.allowEmptyShortcutDrop,
                shortcuts.shortcutDragHandleConfig,
                shortcuts.shortcutHeaderTrailingAction,
                shortcuts.propertiesHeaderTrailingAction,
                shortcuts.shortcutNumberBadgesByKey,
                shortcuts.shouldShowShortcutCounts
            ]
        );

        const isVisible = uiState.dualPane || uiState.currentSinglePaneView === 'navigation';
        const {
            items,
            firstSectionId,
            firstInlineFolderPath,
            shortcutItems,
            pinnedRecentNotesItems,
            shouldPinRecentNotes,
            tagsVirtualFolderHasChildren,
            propertiesSectionActive,
            pathToIndex,
            tagCounts,
            propertyCounts,
            folderCounts,
            rootLevelFolders,
            missingRootFolderPaths,
            resolvedRootTagKeys,
            rootOrderingTagTree,
            missingRootTagPaths,
            resolvedRootPropertyKeys,
            rootOrderingPropertyTree,
            missingRootPropertyKeys,
            vaultChangeVersion,
            navigationBannerPath
        } = useNavigationPaneData({
            settings,
            isVisible,
            sourceState: props.navigationSourceState,
            treeSections: props.navigationTreeSections,
            folderDecorationModel: props.folderDecorationModel,
            navRainbowState: props.navRainbowState,
            shortcutsExpanded: shortcuts.shortcutsExpanded,
            recentNotesExpanded: shortcuts.recentNotesExpanded,
            pinShortcuts: uiState.pinShortcuts && settings.showShortcuts,
            sectionOrder
        });
        folderCountsRef.current = folderCounts;
        tagCountsRef.current = tagCounts;
        propertyCountsRef.current = propertyCounts;

        const tree = useNavigationPaneTreeInteractions({
            app,
            commandQueue,
            isMobile,
            settings,
            uiState,
            expansionState,
            expansionDispatch,
            selectionState,
            selectionDispatch,
            uiDispatch,
            propertyTreeService,
            tagTree: props.navigationTreeSections.renderTagTree,
            propertyTree: props.navigationTreeSections.renderPropertyTree,
            tagsVirtualFolderHasChildren,
            setShortcutsExpanded: shortcuts.setShortcutsExpanded,
            setRecentNotesExpanded: shortcuts.setRecentNotesExpanded,
            clearActiveShortcut: shortcuts.clearActiveShortcut,
            openFolderNoteInRightSidebar: folderNote => plugin.openFolderNoteInRightSidebar(folderNote),
            onModifySearchWithTag,
            onModifySearchWithProperty
        });

        const searchHighlights = useNavigationSearchHighlights({ searchNavFilters });

        useEffect(() => {
            if (!isStorageReady) {
                return;
            }

            const shouldCleanupTags = expansionState.expandedTags.size > 0;
            const shouldCleanupProperties = expansionState.expandedProperties.size > 0;
            if (!shouldCleanupTags && !shouldCleanupProperties) {
                return;
            }

            const existingTags = shouldCleanupTags ? new Set<string>() : null;
            const existingPropertyNodeIds = shouldCleanupProperties ? new Set<string>() : null;

            if (existingTags) {
                const visitedTagNodes = new Set<TagTreeNode>();
                fileData.tagTree.forEach(rootTagNode => {
                    collectAllTagPaths(rootTagNode, existingTags, visitedTagNodes);
                });
            }

            if (existingPropertyNodeIds) {
                fileData.propertyTree.forEach(keyNode => {
                    existingPropertyNodeIds.add(keyNode.id);
                    keyNode.children.forEach(valueNode => {
                        existingPropertyNodeIds.add(valueNode.id);
                    });
                });
            }

            if (existingTags) {
                expansionDispatch({ type: 'CLEANUP_DELETED_TAGS', existingTags });
            }

            if (existingPropertyNodeIds) {
                expansionDispatch({ type: 'CLEANUP_DELETED_PROPERTIES', existingPropertyNodeIds });
            }
        }, [
            expansionDispatch,
            expansionState.expandedProperties.size,
            expansionState.expandedTags.size,
            fileData.propertyTree,
            fileData.tagTree,
            isStorageReady
        ]);

        const indentGuideLevelsByKey = useMemo(
            () => (settings.showIndentGuides ? buildIndentGuideLevelsMap(items, getNavigationItemRenderKey) : EMPTY_INDENT_GUIDE_MAP),
            [items, settings.showIndentGuides]
        );

        const pinnedNavigationItems = useMemo(() => {
            const pinnedShortcutItems = uiState.pinShortcuts && settings.showShortcuts ? shortcutItems : [];
            const pinnedRecentItems = shouldPinRecentNotes ? pinnedRecentNotesItems : [];
            const pinnedNavigationOrder = normalizeNavigationSectionOrderInput(sectionOrder);

            const ordered: CombinedNavigationItem[] = [];
            pinnedNavigationOrder.forEach(sectionId => {
                if (sectionId === NavigationSectionId.RECENT && shouldPinRecentNotes) {
                    ordered.push(...pinnedRecentItems);
                }
                if (sectionId === NavigationSectionId.SHORTCUTS && uiState.pinShortcuts && settings.showShortcuts) {
                    ordered.push(...pinnedShortcutItems);
                }
            });
            return ordered;
        }, [pinnedRecentNotesItems, sectionOrder, settings.showShortcuts, shortcutItems, shouldPinRecentNotes, uiState.pinShortcuts]);

        const shouldRenderNavigationBanner = Boolean(navigationBannerPath && !isRootReorderMode);
        const navigationBannerContent =
            shouldRenderNavigationBanner && navigationBannerPath ? <NavigationBanner path={navigationBannerPath} /> : null;
        const shouldRenderPinnedShortcuts = pinnedNavigationItems.length > 0 && !isRootReorderMode;

        useLayoutEffect(() => {
            updatePinnedShortcutsOverflow(pinnedShortcutsScrollElement);
        }, [pinnedNavigationItems, pinnedShortcutsScrollElement, updatePinnedShortcutsOverflow]);

        const navigationBannerHeight = useMeasuredElementHeight(navigationBannerRef, {
            enabled: Boolean(navigationBannerContent) && !settings.pinNavigationBanner
        });
        const navigationScrollMargin = navigationBannerHeight;
        const hasNavigationBannerConfigured = Boolean(navigationBannerPath);

        const { color: navSurfaceColor, version: navSurfaceVersion } = useSurfaceColorVariables(navigationPaneRef, {
            app,
            rootContainerRef,
            variables: NAVIGATION_PANE_SURFACE_COLOR_MAPPINGS
        });
        const activeNavRainbow = props.navRainbowState.navRainbow;
        const solidBackgroundCacheRef = useRef<Map<string, string | undefined>>(new Map());
        // Cache inputs are compared during render so the commit that changes the surface recomposites row backgrounds
        const solidBackgroundCacheInputsRef = useRef<{
            rainbow: typeof activeNavRainbow;
            color: typeof navSurfaceColor;
            version: number;
        } | null>(null);
        const solidBackgroundCacheInputs = solidBackgroundCacheInputsRef.current;
        if (
            !solidBackgroundCacheInputs ||
            solidBackgroundCacheInputs.rainbow !== activeNavRainbow ||
            solidBackgroundCacheInputs.color !== navSurfaceColor ||
            solidBackgroundCacheInputs.version !== navSurfaceVersion
        ) {
            solidBackgroundCacheRef.current.clear();
            solidBackgroundCacheInputsRef.current = { rainbow: activeNavRainbow, color: navSurfaceColor, version: navSurfaceVersion };
        }

        const getSolidBackground = useCallback(
            (color?: string | null) => {
                // Identity tracks navSurfaceVersion so memoized rows re-render when surface variables change
                void navSurfaceVersion;
                if (!color) {
                    return undefined;
                }
                const trimmed = color.trim();
                if (!trimmed) {
                    return undefined;
                }
                const cache = solidBackgroundCacheRef.current;
                if (cache.has(trimmed)) {
                    return cache.get(trimmed);
                }
                const pane = navigationPaneRef.current;
                const solidColor = compositeWithBase(navSurfaceColor, trimmed, { container: pane ?? null });
                cache.set(trimmed, solidColor);
                return solidColor;
            },
            [navSurfaceColor, navSurfaceVersion]
        );

        const {
            reorderableRootFolders,
            reorderableRootTags,
            reorderableRootProperties,
            sectionReorderItems,
            folderReorderItems,
            tagReorderItems,
            propertyReorderItems,
            canReorderSections,
            canReorderRootFolders,
            canReorderRootTags,
            canReorderRootProperties,
            canReorderRootItems,
            showRootFolderSection,
            showRootTagSection,
            showRootPropertySection,
            resetRootTagOrderLabel,
            resetRootPropertyOrderLabel,
            handleResetRootFolderOrder,
            handleResetRootTagOrder,
            handleResetRootPropertyOrder,
            reorderSectionOrder,
            reorderRootFolderOrder,
            reorderRootTagOrder,
            reorderRootPropertyOrder
        } = useNavigationRootReorder({
            app,
            items,
            settings,
            showHiddenItems,
            updateSettings,
            sectionOrder,
            setSectionOrder,
            rootLevelFolders,
            missingRootFolderPaths,
            resolvedRootTagKeys,
            rootOrderingTagTree,
            missingRootTagPaths,
            resolvedRootPropertyKeys,
            rootOrderingPropertyTree,
            missingRootPropertyKeys,
            metadataService,
            foldersSectionExpanded,
            tagsSectionExpanded,
            propertiesSectionExpanded,
            propertiesSectionActive,
            handleToggleFoldersSection,
            handleToggleTagsSection,
            handleTogglePropertiesSection,
            activeProfile
        });

        useEffect(() => {
            if (isRootReorderMode && !canReorderRootItems) {
                setRootReorderMode(false);
            }
        }, [canReorderRootItems, isRootReorderMode]);

        const handleToggleRootReorder = useCallback(() => {
            if (!canReorderRootItems) {
                return;
            }
            setRootReorderMode(prev => !prev);
        }, [canReorderRootItems]);

        const isAndroid = Platform.isAndroidApp;
        const shouldUseFloatingToolbars = isMobile && Platform.isIosApp && settings.useFloatingToolbars;
        const scrollPaddingEnd = useMemo(() => {
            if (!shouldUseFloatingToolbars) {
                return 0;
            }
            return IOS_FLOATING_TOOLBAR_HEIGHT_PX;
        }, [shouldUseFloatingToolbars]);

        const { rowVirtualizer, scrollContainerRef, scrollContainerRefCallback, requestScroll } = useNavigationPaneScroll({
            items,
            pathToIndex,
            isVisible,
            activeShortcutKey: shortcuts.activeShortcutKey,
            scrollMargin: navigationScrollMargin,
            scrollPaddingEnd
        });

        const restoreNavigationPaneFocus = useCallback(() => {
            const restore = () => {
                const target = scrollContainerRef.current ?? navigationPaneRef.current ?? props.rootContainerRef.current;
                if (target) {
                    focusElementPreventScroll(target);
                }
            };

            if (typeof window.requestAnimationFrame === 'function') {
                window.requestAnimationFrame(restore);
                return;
            }

            window.setTimeout(restore, 0);
        }, [props.rootContainerRef, scrollContainerRef]);

        useEffect(() => {
            if (isRootReorderMode) {
                return;
            }
            rowVirtualizer.measure();
        }, [
            isRootReorderMode,
            navigationScrollMargin,
            reorderableRootFolders,
            reorderableRootProperties,
            reorderableRootTags,
            rowVirtualizer,
            sectionOrder
        ]);

        useEffect(() => {
            if (!isRootReorderMode) {
                return;
            }
            rowVirtualizer.scrollToOffset(0, { align: 'start', behavior: 'auto' });
            const scroller = scrollContainerRef.current;
            if (scroller) {
                scroller.scrollTo({ top: 0, behavior: 'auto' });
            }
        }, [isRootReorderMode, rowVirtualizer, scrollContainerRef]);

        const handleTreeUpdateComplete = useCallback(() => {
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
            requestScroll(normalizeNavigationPath(itemType, selectedPath), { align: 'auto', itemType });
        }, [requestScroll, selectionState]);

        const prevCalendarOverlayVisibleRef = useRef<boolean>(shouldRenderCalendarOverlay);
        const prevCalendarWeekCountRef = useRef<number>(calendarWeekCount);
        const prevShowAllTagsFolder = useRef(settings.showAllTagsFolder);
        useEffect(() => {
            const wasVisible = prevCalendarOverlayVisibleRef.current;
            const prevWeekCount = prevCalendarWeekCountRef.current;
            const becameVisible = shouldRenderCalendarOverlay && !wasVisible;
            const weekCountChanged = shouldRenderCalendarOverlay && calendarWeekCount !== prevWeekCount;

            prevCalendarOverlayVisibleRef.current = shouldRenderCalendarOverlay;
            prevCalendarWeekCountRef.current = calendarWeekCount;

            if (!becameVisible && !weekCountChanged) {
                return;
            }

            const scheduleScroll = () => handleTreeUpdateComplete();
            if (typeof requestAnimationFrame !== 'undefined') {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(scheduleScroll);
                });
                return;
            }

            window.setTimeout(scheduleScroll, 0);
        }, [calendarWeekCount, handleTreeUpdateComplete, shouldRenderCalendarOverlay]);

        useEffect(() => {
            if (settings.showAllTagsFolder) {
                const shouldAutoExpandTags = !prevShowAllTagsFolder.current && settings.showAllTagsFolder;
                if (shouldAutoExpandTags && !expansionState.expandedVirtualFolders.has(TAGS_ROOT_VIRTUAL_FOLDER_ID)) {
                    expansionDispatch({ type: 'TOGGLE_VIRTUAL_FOLDER_EXPANDED', folderId: TAGS_ROOT_VIRTUAL_FOLDER_ID });
                }
            }
            prevShowAllTagsFolder.current = settings.showAllTagsFolder;
        }, [expansionDispatch, expansionState.expandedVirtualFolders, settings.showAllTagsFolder]);

        const getSelectedRenderedItem = useCallback((): CombinedNavigationItem | null => {
            if (isRootReorderMode) {
                return null;
            }

            const resolveItem = (itemType: ItemType, path: string): CombinedNavigationItem | null => {
                const index = getNavigationIndex(pathToIndex, itemType, path);
                if (index === undefined) {
                    return null;
                }
                return items[index] ?? null;
            };

            if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder?.path) {
                return resolveItem(ItemType.FOLDER, selectionState.selectedFolder.path);
            }

            if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
                return resolveItem(ItemType.TAG, selectionState.selectedTag);
            }

            if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
                return resolveItem(ItemType.PROPERTY, selectionState.selectedProperty);
            }

            return null;
        }, [
            isRootReorderMode,
            items,
            pathToIndex,
            selectionState.selectedFolder,
            selectionState.selectedProperty,
            selectionState.selectedTag,
            selectionState.selectionType
        ]);

        const buildRenameTarget = useCallback(
            (item: CombinedNavigationItem): NavigationInlineRenameTarget | null =>
                buildNavigationInlineRenameTarget(item, folder => fileSystemOps.getFolderDisplayNameRenameInput(folder).initialValue),
            [fileSystemOps]
        );

        const handleStartInlineRename = useCallback((): boolean => {
            const item = getSelectedRenderedItem();
            if (!item) {
                return false;
            }

            const target = buildRenameTarget(item);
            if (!target) {
                return false;
            }

            setInlineRenameTarget(target);
            return true;
        }, [buildRenameTarget, getSelectedRenderedItem]);

        const handleStartFolderInlineRename = useCallback(
            (folder: TFolder): boolean => {
                if (isRootReorderMode) {
                    return false;
                }

                const index = getNavigationIndex(pathToIndex, ItemType.FOLDER, folder.path);
                if (index === undefined) {
                    return false;
                }

                const item = items[index];
                if (!item || item.type !== NavigationPaneItemType.FOLDER) {
                    return false;
                }

                const target = buildRenameTarget(item);
                if (!target) {
                    return false;
                }

                setInlineRenameTarget(target);
                requestScroll(folder.path, { align: 'auto', itemType: ItemType.FOLDER });
                return true;
            },
            [buildRenameTarget, isRootReorderMode, items, pathToIndex, requestScroll]
        );

        const handleCancelInlineRename = useCallback(() => {
            setInlineRenameTarget(null);
        }, []);

        const handleCommitInlineRename = useCallback(
            async (target: NavigationInlineRenameTarget, value: string): Promise<boolean> => {
                const trimmed = value.trim();

                if (target.type === 'folder') {
                    const folder = target.id === '/' ? app.vault.getRoot() : app.vault.getFolderByPath(target.id);
                    if (!(folder instanceof TFolder)) {
                        setInlineRenameTarget(null);
                        return true;
                    }
                    const shouldClose = await fileSystemOps.renameFolderDisplayName(folder, value, settings);
                    if (shouldClose) {
                        setInlineRenameTarget(null);
                    }
                    return shouldClose;
                }

                if (target.type === 'tag') {
                    if (!tagOperations) {
                        return false;
                    }
                    if (trimmed === target.initialValue.trim()) {
                        setInlineRenameTarget(null);
                        return true;
                    }
                    const shouldClose = await tagOperations.renameTag(target.id, replacePathLeaf(target.displayPath, trimmed));
                    if (shouldClose) {
                        setInlineRenameTarget(null);
                    }
                    return shouldClose;
                }

                if (!propertyOperations) {
                    return false;
                }
                if (trimmed === target.initialValue.trim()) {
                    setInlineRenameTarget(null);
                    return true;
                }
                const shouldClose = await propertyOperations.renamePropertyKey(target.normalizedKey, value);
                if (shouldClose) {
                    setInlineRenameTarget(null);
                }
                return shouldClose;
            },
            [app.vault, fileSystemOps, propertyOperations, settings, tagOperations]
        );

        useEffect(() => {
            if (isRootReorderMode) {
                setInlineRenameTarget(null);
            }
        }, [isRootReorderMode]);

        const triggerSelectedItemCollapse = useCallback((): boolean => {
            const item = getSelectedRenderedItem();
            if (!item) {
                return false;
            }

            const target = getNavigationExpansionTargetForItem(item, { showHiddenItems });
            return target
                ? toggleNavigationExpansionTarget(target, expansionState, expansionDispatch, 'toggle', {
                      collapseOtherBranches: settings.collapseOtherBranchesOnExpand
                  })
                : false;
        }, [expansionDispatch, expansionState, getSelectedRenderedItem, settings.collapseOtherBranchesOnExpand, showHiddenItems]);

        useImperativeHandle(
            ref,
            () => ({
                getIndexOfPath: (itemType: ItemType, path: string) => {
                    const index = getNavigationIndex(pathToIndex, itemType, path);
                    return index ?? -1;
                },
                virtualizer: rowVirtualizer,
                scrollContainerRef: scrollContainerRef.current,
                requestScroll,
                triggerSelectedItemCollapse,
                openShortcutByNumber: shortcuts.openShortcutByNumber
            }),
            [pathToIndex, requestScroll, rowVirtualizer, scrollContainerRef, shortcuts.openShortcutByNumber, triggerSelectedItemCollapse]
        );

        const keyboardItems = isRootReorderMode ? [] : items;
        const keyboardPathToIndex = isRootReorderMode ? new Map<string, number>() : pathToIndex;
        useNavigationPaneKeyboard({
            items: keyboardItems,
            virtualizer: rowVirtualizer,
            containerRef: props.rootContainerRef,
            pathToIndex: keyboardPathToIndex,
            onStartRename: handleStartInlineRename
        });

        const navigationPaneStyle = useMemo<CSSPropertiesWithVars>(() => {
            return {
                ...(props.style ?? {}),
                '--nn-calendar-week-count': calendarWeekCount
            };
        }, [calendarWeekCount, props.style]);

        const navigationToolbar = useMemo(() => {
            return (
                <NavigationToolbar
                    onTreeUpdateComplete={handleTreeUpdateComplete}
                    onToggleRootFolderReorder={handleToggleRootReorder}
                    rootReorderActive={isRootReorderMode}
                    rootReorderDisabled={!canReorderRootItems}
                    useFloatingLayout={shouldUseFloatingToolbars}
                />
            );
        }, [canReorderRootItems, handleToggleRootReorder, handleTreeUpdateComplete, isRootReorderMode, shouldUseFloatingToolbars]);

        const showVaultTitleInHeader =
            !isMobile && (settings.vaultProfiles ?? []).length > 1 && (settings.vaultTitle ?? 'navigation') === 'header';
        const shouldShowVaultTitleInNavigationPane =
            !isMobile && (settings.vaultProfiles ?? []).length > 1 && (settings.vaultTitle ?? 'navigation') === 'navigation';

        const handleSectionContextMenu = useCallback(
            (event: React.MouseEvent<HTMLDivElement>, sectionId: NavigationSectionId, options?: { allowSeparator?: boolean }) => {
                // Menu contents come from the latest shortcuts state at open time
                const currentShortcuts = shortcutsRef.current;
                showNavigationSectionContextMenu({
                    app,
                    event,
                    sectionId,
                    allowSeparator: options?.allowSeparator,
                    metadataService,
                    settings,
                    plugin,
                    pinToggleLabel: currentShortcuts.pinToggleLabel,
                    isShortcutsPinned: uiState.pinShortcuts,
                    onToggleShortcutsPin: currentShortcuts.handleShortcutSplitToggle,
                    onConfigurePropertyKeys: handleConfigurePropertyKeysFromSectionMenu,
                    shortcutActions: {
                        shortcutsCount: currentShortcuts.shortcutsCount,
                        tagShortcutKeysByPath: currentShortcuts.tagShortcutKeysByPath,
                        propertyShortcutKeysByNodeId: currentShortcuts.propertyShortcutKeysByNodeId,
                        addTagShortcut: currentShortcuts.addTagShortcut,
                        addPropertyShortcut: currentShortcuts.addPropertyShortcut,
                        removeShortcut: currentShortcuts.removeShortcut,
                        clearShortcuts: currentShortcuts.clearShortcuts
                    }
                });
            },
            [app, handleConfigurePropertyKeysFromSectionMenu, metadataService, plugin, settings, uiState.pinShortcuts]
        );

        const rowContext = useMemo<NavigationPaneRowContext>(
            () => ({
                app,
                settings,
                isMobile,
                indentGuideLevelsByKey,
                firstSectionId,
                firstInlineFolderPath,
                shouldPinShortcuts: uiState.pinShortcuts && settings.showShortcuts,
                showHiddenItems,
                folderCounts,
                tagCounts,
                propertyCounts,
                vaultChangeVersion,
                fileVisibility: activeProfile.fileVisibility,
                hiddenFolders: activeProfile.hiddenFolders,
                descendantExcludedFolders: activeProfile.descendantExcludedFolders,
                getFileDisplayName,
                getFileTimestamps,
                getFileWordCount,
                getSolidBackground,
                shortcuts: shortcutRowHandlers,
                shortcutUiState,
                tree,
                searchHighlights,
                inlineRename: {
                    startFolder: handleStartFolderInlineRename,
                    commit: handleCommitInlineRename,
                    cancel: handleCancelInlineRename,
                    restoreFocus: restoreNavigationPaneFocus
                },
                onSectionContextMenu: handleSectionContextMenu
            }),
            [
                app,
                firstInlineFolderPath,
                firstSectionId,
                folderCounts,
                activeProfile.fileVisibility,
                activeProfile.hiddenFolders,
                activeProfile.descendantExcludedFolders,
                getFileDisplayName,
                getFileTimestamps,
                getFileWordCount,
                getSolidBackground,
                handleSectionContextMenu,
                handleCancelInlineRename,
                handleCommitInlineRename,
                handleStartFolderInlineRename,
                indentGuideLevelsByKey,
                isMobile,
                propertyCounts,
                searchHighlights,
                settings,
                shortcutRowHandlers,
                shortcutUiState,
                showHiddenItems,
                tagCounts,
                tree,
                uiState.pinShortcuts,
                restoreNavigationPaneFocus,
                vaultChangeVersion
            ]
        );

        const getRowHotState = useCallback(
            (item: CombinedNavigationItem): NavigationPaneRowHotState => {
                let isExpanded = false;
                let isDragSource = false;
                switch (item.type) {
                    case NavigationPaneItemType.FOLDER:
                        isExpanded = expansionState.expandedFolders.has(item.data.path);
                        break;
                    case NavigationPaneItemType.VIRTUAL_FOLDER: {
                        const virtualFolderId = item.data.id;
                        isExpanded =
                            virtualFolderId === SHORTCUTS_VIRTUAL_FOLDER_ID
                                ? shortcuts.shortcutsExpanded
                                : virtualFolderId === RECENT_NOTES_VIRTUAL_FOLDER_ID
                                  ? shortcuts.recentNotesExpanded
                                  : expansionState.expandedVirtualFolders.has(virtualFolderId);
                        break;
                    }
                    case NavigationPaneItemType.TAG:
                    case NavigationPaneItemType.UNTAGGED:
                        isExpanded = expansionState.expandedTags.has(item.data.path);
                        break;
                    case NavigationPaneItemType.PROPERTY_KEY:
                    case NavigationPaneItemType.PROPERTY_VALUE:
                        isExpanded = expansionState.expandedProperties.has(item.data.id);
                        break;
                    case NavigationPaneItemType.SHORTCUT_FOLDER:
                    case NavigationPaneItemType.SHORTCUT_NOTE:
                    case NavigationPaneItemType.SHORTCUT_SEARCH:
                    case NavigationPaneItemType.SHORTCUT_TAG:
                    case NavigationPaneItemType.SHORTCUT_PROPERTY:
                        isDragSource = shortcuts.shouldUseShortcutDnd && shortcuts.activeShortcutId === item.key;
                        break;
                    default:
                        break;
                }

                const renameTarget = inlineRenameTarget ? matchNavigationInlineRenameTarget(item, inlineRenameTarget) : null;

                return {
                    isSelected: isNavigationItemSelected(item, selectionState),
                    isExpanded,
                    renameTarget,
                    isDragSource
                };
            },
            [
                expansionState,
                inlineRenameTarget,
                selectionState,
                shortcuts.shortcutsExpanded,
                shortcuts.recentNotesExpanded,
                shortcuts.shouldUseShortcutDnd,
                shortcuts.activeShortcutId
            ]
        );

        const isNavigationItemFilledForAdjacency = useCallback(
            (item: CombinedNavigationItem) =>
                isNavigationItemFilled({
                    item,
                    selectionState,
                    searchHighlights,
                    getSolidBackground
                }),
            [getSolidBackground, searchHighlights, selectionState]
        );

        const renderNavigationItem = useCallback(
            (item: CombinedNavigationItem, adjacentFilledClassName: string | undefined, hotState: NavigationPaneRowHotState) => (
                <NavigationPaneItemRenderer
                    item={item}
                    context={rowContext}
                    adjacentFilledClassName={adjacentFilledClassName}
                    isSelected={hotState.isSelected}
                    isExpanded={hotState.isExpanded}
                    renameTarget={hotState.renameTarget}
                    isDragSource={hotState.isDragSource}
                />
            ),
            [rowContext]
        );

        const rootReorderContent = (
            <NavigationRootReorderPanel
                sectionItems={sectionReorderItems}
                folderItems={folderReorderItems}
                tagItems={tagReorderItems}
                propertyItems={propertyReorderItems}
                showRootFolderSection={showRootFolderSection}
                showRootTagSection={showRootTagSection}
                showRootPropertySection={showRootPropertySection}
                foldersSectionExpanded={foldersSectionExpanded}
                tagsSectionExpanded={tagsSectionExpanded}
                propertiesSectionExpanded={propertiesSectionExpanded}
                showRootFolderReset={settings.rootFolderOrder.length > 0}
                showRootTagReset={settings.rootTagOrder.length > 0}
                showRootPropertyReset={settings.rootPropertyOrder.length > 0}
                resetRootTagOrderLabel={resetRootTagOrderLabel}
                resetRootPropertyOrderLabel={resetRootPropertyOrderLabel}
                onResetRootFolderOrder={handleResetRootFolderOrder}
                onResetRootTagOrder={handleResetRootTagOrder}
                onResetRootPropertyOrder={handleResetRootPropertyOrder}
                onReorderSections={reorderSectionOrder}
                onReorderFolders={reorderRootFolderOrder}
                onReorderTags={reorderRootTagOrder}
                onReorderProperties={reorderRootPropertyOrder}
                canReorderSections={canReorderSections}
                canReorderFolders={canReorderRootFolders}
                canReorderTags={canReorderRootTags}
                canReorderProperties={canReorderRootProperties}
                isMobile={isMobile}
            />
        );

        return (
            <DndContext
                sensors={shortcuts.shouldUseShortcutDnd ? shortcuts.shortcutSensors : []}
                collisionDetection={shortcuts.shouldUseShortcutDnd ? closestCenter : undefined}
                modifiers={shortcuts.shouldUseShortcutDnd ? [verticalAxisOnly] : undefined}
                onDragStart={shortcuts.shouldUseShortcutDnd ? shortcuts.handleShortcutDragStart : undefined}
                onDragEnd={shortcuts.shouldUseShortcutDnd ? shortcuts.handleShortcutDragEnd : undefined}
                onDragCancel={shortcuts.shouldUseShortcutDnd ? shortcuts.handleShortcutDragCancel : undefined}
                autoScroll={shortcuts.shouldUseShortcutDnd ? false : undefined}
            >
                <SortableContext items={shortcuts.shouldUseShortcutDnd ? shortcuts.shortcutIds : []} strategy={verticalListSortingStrategy}>
                    <NavigationPaneLayout
                        navigationPaneRef={navigationPaneRef}
                        navigationPaneStyle={navigationPaneStyle}
                        shouldRenderCalendarOverlay={shouldRenderCalendarOverlay}
                        isShortcutSorting={shortcuts.isShortcutSorting}
                        isMobile={isMobile}
                        isPinnedShortcutsResizing={isPinnedShortcutsResizing}
                        onTreeUpdateComplete={handleTreeUpdateComplete}
                        onToggleRootReorder={handleToggleRootReorder}
                        rootReorderActive={isRootReorderMode}
                        rootReorderDisabled={!canReorderRootItems}
                        showVaultTitleInHeader={showVaultTitleInHeader}
                        shouldShowVaultTitleInNavigationPane={shouldShowVaultTitleInNavigationPane}
                        showAndroidToolbar={isMobile && isAndroid}
                        navigationToolbar={navigationToolbar}
                        pinNavigationBanner={settings.pinNavigationBanner}
                        navigationBannerContent={navigationBannerContent}
                        shouldRenderPinnedShortcuts={shouldRenderPinnedShortcuts}
                        pinnedShortcutsContainerRef={pinnedShortcutsContainerRef}
                        pinnedShortcutsHasOverflow={pinnedShortcutsHasOverflow}
                        pinnedShortcutsMaxHeight={pinnedShortcutsMaxHeight}
                        allowEmptyShortcutDrop={shortcuts.allowEmptyShortcutDrop}
                        onShortcutRootDragOver={shortcuts.handleShortcutRootDragOver}
                        onShortcutRootDrop={shortcuts.handleShortcutRootDrop}
                        pinnedShortcutsScrollRefCallback={pinnedShortcutsScrollRefCallback}
                        pinnedNavigationItems={pinnedNavigationItems}
                        renderNavigationItem={renderNavigationItem}
                        getRowHotState={getRowHotState}
                        isNavigationItemFilled={isNavigationItemFilledForAdjacency}
                        onPinnedShortcutsResizePointerDown={handlePinnedShortcutsResizePointerDown}
                        scrollContainerRefCallback={scrollContainerRefCallback}
                        hasNavigationBannerConfigured={hasNavigationBannerConfigured}
                        navigationBannerRef={navigationBannerRef}
                        rootReorderContent={rootReorderContent}
                        isRootReorderMode={isRootReorderMode}
                        items={items}
                        rowVirtualizer={rowVirtualizer}
                        navigationScrollMargin={navigationScrollMargin}
                        shouldRenderBottomToolbarInsidePanel={isMobile && !isAndroid && shouldUseFloatingToolbars}
                        shouldRenderBottomToolbarOutsidePanel={isMobile && !isAndroid && !shouldUseFloatingToolbars}
                        calendarOverlay={
                            shouldRenderCalendarOverlay ? (
                                <div className="nn-navigation-calendar-overlay">
                                    <Calendar onWeekCountChange={setCalendarWeekCount} onAddDateFilter={onModifySearchWithDateFilter} />
                                </div>
                            ) : null
                        }
                    />
                </SortableContext>
            </DndContext>
        );
    })
);
