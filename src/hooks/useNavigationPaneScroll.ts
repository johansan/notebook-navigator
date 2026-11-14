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
 * useNavigationPaneScroll - Orchestrates scrolling for the NavigationPane component
 *
 * ## Problem this solves:
 * When the tree structure changes (e.g., toggling "show hidden items"), the indices
 * of items shift. Without proper synchronization, scrolling to a "remembered" index
 * would land on the wrong item because the tree has changed underneath.
 *
 * ## Solution:
 * Version-based synchronization with intent-driven scrolling. Each tree rebuild
 * increments an indexVersion, and scrolls are gated to only execute when the
 * version meets requirements.
 *
 * ## Key concepts:
 * - **Index versioning**: Increments when pathToIndex changes (tree rebuild)
 * - **Pending scrolls**: Path-based requests that execute when conditions are met
 * - **Intent types**: Different scroll reasons (selection, visibilityToggle, etc.)
 * - **Version gating**: Scrolls wait for minIndexVersion before executing
 * - **Late resolution**: Index is resolved from path at execution time, not storage time
 *
 * ## Handles:
 * - Virtual list initialization with TanStack Virtual
 * - Selection changes (folder/tag selection)
 * - Visibility toggles (show/hide hidden items)
 * - Mobile drawer visibility
 * - External scroll requests (reveal operations)
 * - Settings changes (line height, indentation)
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';
import { useServices } from '../context/ServicesContext';
import { useNavigationSelection, useSelectionReveal } from '../context/SelectionContext';
import { useUIState } from '../context/UIStateContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { NavigationPaneItemType, ItemType, NAVPANE_MEASUREMENTS, OVERSCAN } from '../types';
import { Align, NavScrollIntent, getNavAlign } from '../types/scroll';
import type { CombinedNavigationItem } from '../types/virtualization';
import { getNavigationIndex, getNavigationItemRenderKey, normalizeNavigationPath } from '../utils/navigationIndex';

/**
 * Parameters for the useNavigationPaneScroll hook
 */
interface UseNavigationPaneScrollParams {
    /** Navigation items to be rendered */
    items: CombinedNavigationItem[];
    /** Map from paths to their index in items */
    pathToIndex: Map<string, number>;
    /** Whether the navigation pane is currently visible */
    isVisible: boolean;
    /** Currently active shortcut id (if any) */
    activeShortcutKey: string | null;
    /**
     * Height of non-virtualized content rendered above the virtual list inside the scroll container.
     *
     * This should include any normal-flow content that sits above the virtualized tree rows, such as
     * an unpinned navigation banner rendered inside the scroller.
     *
     * TanStack Virtual uses this to align:
     * - visible range calculations with the first tree row,
     * - scrollToIndex offsets relative to the start of the tree rows.
     */
    scrollMargin: number;
    /**
     * Bottom inset reserved by overlays that cover the scroll content.
     *
     * Use this when a bottom overlay can sit on top of the scroller and cover tree rows. TanStack Virtual uses this as
     * scrollPaddingEnd, and it is also used by post-scroll safety adjustments.
     */
    scrollPaddingEnd: number;
}

/**
 * Return value of the useNavigationPaneScroll hook
 */
interface UseNavigationPaneScrollResult {
    /** TanStack Virtual virtualizer instance */
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    /** Reference to the scroll container element */
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    /** Ref callback for the scroll container element */
    scrollContainerRefCallback: (element: HTMLDivElement | null) => void;
    /** Handler to scroll to top (mobile header tap) */
    handleScrollToTop: () => void;
    /** Request a scroll to a specific path */
    requestScroll: (path: string, options: { align?: Align; itemType: ItemType }) => void;
    /** Version counter for pending scrolls */
    pendingScrollVersion: number;
}

function areNavigationPathIndexMapsEqual(previous: ReadonlyMap<string, number>, next: ReadonlyMap<string, number>): boolean {
    if (previous === next) {
        return true;
    }
    if (previous.size !== next.size) {
        return false;
    }

    for (const [path, index] of next) {
        if (previous.get(path) !== index) {
            return false;
        }
    }

    return true;
}

function getNavigationMeasurementSignature(items: readonly CombinedNavigationItem[]): string {
    return items
        .map(item => {
            if (item.type === NavigationPaneItemType.ROOT_SPACER) {
                return `${item.type}:${item.spacing}`;
            }

            return item.type;
        })
        .join('\u0001');
}

/**
 * Hook that manages scrolling behavior for the NavigationPane component.
 * Handles virtualization, scroll position, and various scroll scenarios.
 *
 * @param params - Configuration parameters
 * @returns Virtualizer instance and scroll management utilities
 */
export function useNavigationPaneScroll({
    items,
    pathToIndex,
    isVisible,
    activeShortcutKey,
    scrollMargin,
    scrollPaddingEnd
}: UseNavigationPaneScrollParams): UseNavigationPaneScrollResult {
    const { isMobile } = useServices();
    const selectionState = useNavigationSelection();
    const selectionReveal = useSelectionReveal();
    const uiState = useUIState();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const showHiddenItems = uxPreferences.showHiddenItems;

    // Reference to the scroll container DOM element
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [scrollContainerEl, setScrollContainerEl] = useState<HTMLDivElement | null>(null);
    const [containerVisible, setContainerVisible] = useState<boolean>(false);

    /**
     * Ref callback to keep local state in sync with the rendered scroll container.
     */
    const scrollContainerRefCallback = useCallback((element: HTMLDivElement | null) => {
        scrollContainerRef.current = element;
        setScrollContainerEl(element);
        if (!element) {
            setContainerVisible(false);
        }
    }, []);

    /**
     * Track the physical visibility of the scroll container using ResizeObserver.
     * When the element (or any parent) is hidden, TanStack Virtual scroll calls
     * will fail. We gate scroll execution on this state instead of relying on
     * logical pane visibility alone.
     */
    useEffect(() => {
        const element = scrollContainerEl;
        if (!element) {
            setContainerVisible(false);
            return;
        }

        const updateVisibility = () => {
            const rect = element.getBoundingClientRect();
            const isContainerVisible = rect.width > 0 && rect.height > 0;
            setContainerVisible(prev => (prev === isContainerVisible ? prev : isContainerVisible));
        };

        updateVisibility();

        if (typeof ResizeObserver === 'undefined') {
            const handleWindowResize = () => updateVisibility();
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
            const { width, height } = entry.contentRect;
            const isContainerVisible = width > 0 && height > 0;
            setContainerVisible(prev => (prev === isContainerVisible ? prev : isContainerVisible));
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [scrollContainerEl]);

    // Container is ready when both the navigation pane and the physical container are visible
    const isScrollContainerReady = isVisible && containerVisible;

    // Resolves a path to its index in the navigation items array
    const resolveIndex = useCallback(
        (path: string | null | undefined, itemType?: ItemType) => {
            if (!path) {
                return undefined;
            }

            if (itemType) {
                return getNavigationIndex(pathToIndex, itemType, path);
            }

            // Try folder first, then tag if not found
            const folderIndex = getNavigationIndex(pathToIndex, ItemType.FOLDER, path);
            if (folderIndex !== undefined) {
                return folderIndex;
            }

            const tagIndex = getNavigationIndex(pathToIndex, ItemType.TAG, path);
            if (tagIndex !== undefined) {
                return tagIndex;
            }

            return getNavigationIndex(pathToIndex, ItemType.PROPERTY, path);
        },
        [pathToIndex]
    );

    // ========== Scroll Orchestration ==========
    // Intent types determine scroll priority and behavior
    type ScrollIntent = NavScrollIntent;

    // Pending scroll stores the request until conditions are met
    type PendingScroll = {
        path: string; // Target path to scroll to (resolved to index at execution)
        align?: Align;
        intent?: ScrollIntent; // Why this scroll was requested
        minIndexVersion?: number; // Don't execute until indexVersion >= this value
        itemType: ItemType; // Item type for resolving correct index map
    };
    const pendingScrollRef = useRef<PendingScroll | null>(null);
    const [pendingScrollVersion, setPendingScrollVersion] = useState(0); // Triggers effect re-run

    // ========== Index Version Tracking ==========
    // Increments each time the tree rebuilds to ensure scrolls execute with correct indices
    const indexVersionRef = useRef<number>(0);
    const prevPathToIndexObjRef = useRef<Map<string, number> | null>(null);

    // Track previous values to detect actual changes
    const prevSelectedPathRef = useRef<string | null>(null);
    const prevVisibleRef = useRef<boolean>(false);
    const prevFocusedPaneRef = useRef<string | null>(null);
    const prevSelectedDeferredPathRef = useRef<string | null>(null);
    const prevNavSettingsKeyRef = useRef<string>('');
    const prevShowHiddenItemsRef = useRef<boolean>(showHiddenItems);
    const prevPathToIndexSizeRef = useRef<number>(pathToIndex.size);
    const prevMeasurementSignatureRef = useRef<string>('');

    /**
     * Initialize TanStack Virtual virtualizer with dynamic heights for navigation items
     */
    const effectiveScrollMargin = Number.isFinite(scrollMargin) && scrollMargin > 0 ? scrollMargin : 0;
    const effectiveScrollPaddingEnd = Number.isFinite(scrollPaddingEnd) && scrollPaddingEnd > 0 ? scrollPaddingEnd : 0;
    const getVirtualItemKey = useCallback(
        (index: number) => {
            const item = items[index];
            return item ? getNavigationItemRenderKey(item) : index;
        },
        [items]
    );

    const ensureIndexNotCovered = useCallback(
        (index: number) => {
            const scrollElement = scrollContainerRef.current;
            if (!scrollElement) {
                return;
            }

            if (effectiveScrollPaddingEnd <= 0) {
                return;
            }

            // Navigation rows set `data-index` in `src/components/navigationPane/NavigationPaneLayout.tsx`; use it to find the
            // rendered row TanStack Virtual scrolled to so we can keep it within the safe viewport (scrollPaddingEnd).
            const row = scrollElement.querySelector(`[data-index="${index}"]`);
            if (!(row instanceof HTMLElement)) {
                return;
            }

            const containerRect = scrollElement.getBoundingClientRect();
            const rowRect = row.getBoundingClientRect();
            const safeBottom = containerRect.bottom - effectiveScrollPaddingEnd;

            if (rowRect.bottom > safeBottom) {
                scrollElement.scrollTop += Math.round(rowRect.bottom - safeBottom);
            }
        },
        [effectiveScrollPaddingEnd]
    );

    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getItemKey: getVirtualItemKey,
        getScrollElement: () => scrollContainerRef.current,
        // Align virtualizer scroll math with the start of the tree rows (excluding non-virtualized scroll content).
        scrollMargin: effectiveScrollMargin,
        scrollPaddingEnd: effectiveScrollPaddingEnd,
        estimateSize: index => {
            const item = items[index];

            // Use dynamic line height settings for folder and tag items
            const itemHeight = isMobile ? settings.navItemHeight + NAVPANE_MEASUREMENTS.mobileHeightIncrement : settings.navItemHeight;

            switch (item.type) {
                case NavigationPaneItemType.TOP_SPACER:
                    return NAVPANE_MEASUREMENTS.topSpacer;
                case NavigationPaneItemType.BOTTOM_SPACER:
                    return NAVPANE_MEASUREMENTS.bottomSpacer;
                case NavigationPaneItemType.LIST_SPACER:
                    return NAVPANE_MEASUREMENTS.listSpacer;
                case NavigationPaneItemType.ROOT_SPACER:
                    return item.spacing;
                case NavigationPaneItemType.FOLDER:
                case NavigationPaneItemType.VIRTUAL_FOLDER:
                    return itemHeight;
                case NavigationPaneItemType.TAG:
                case NavigationPaneItemType.UNTAGGED:
                    return itemHeight;
                default:
                    return itemHeight; // fallback
            }
        },
        overscan: OVERSCAN
    });
    const measurementSignature = useMemo(() => getNavigationMeasurementSignature(items), [items]);

    /**
     * Increment indexVersion and invalidate cached row measurements when tree structure or measured row layout changes.
     * This is critical for version gating and for selection-scoped nav rebuilds where the row
     * types or spacer layout can change without a height-setting change.
     */
    useEffect(() => {
        const previousMap = prevPathToIndexObjRef.current;
        const mappingChanged = previousMap === null || !areNavigationPathIndexMapsEqual(previousMap, pathToIndex);
        const measurementChanged = prevMeasurementSignatureRef.current !== measurementSignature;

        if (mappingChanged) {
            const prevVersion = indexVersionRef.current;
            indexVersionRef.current = prevVersion + 1;
            prevPathToIndexSizeRef.current = pathToIndex.size;
            prevPathToIndexObjRef.current = pathToIndex;
            prevMeasurementSignatureRef.current = measurementSignature;
            rowVirtualizer.measure();
            return;
        }

        if (measurementChanged) {
            prevMeasurementSignatureRef.current = measurementSignature;
            rowVirtualizer.measure();
        }

        if (prevPathToIndexSizeRef.current !== pathToIndex.size || prevPathToIndexObjRef.current !== pathToIndex) {
            prevPathToIndexSizeRef.current = pathToIndex.size;
            prevPathToIndexObjRef.current = pathToIndex;
        }
    }, [measurementSignature, pathToIndex, pathToIndex.size, rowVirtualizer]);

    const scrollToIndexSafely = useCallback(
        (index: number, align: Align) => {
            // Use TanStack Virtual for the primary scroll, then run a small post-adjustment step to keep the selected
            // row within the safe viewport defined by scrollPaddingEnd.
            rowVirtualizer.scrollToIndex(index, { align });

            let attempts = 0;
            const adjust = () => {
                attempts += 1;
                ensureIndexNotCovered(index);
                if (attempts < 3) {
                    window.requestAnimationFrame(adjust);
                }
            };
            window.requestAnimationFrame(adjust);
        },
        [ensureIndexNotCovered, rowVirtualizer]
    );

    /**
     * Scroll to top handler for mobile header tap
     */
    const handleScrollToTop = useCallback(() => {
        if (isMobile && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isMobile]);

    /**
     * Request a scroll to a specific path
     * Used by external components like useNavigatorReveal
     */
    const requestScroll = useCallback((path: string, options: { align?: Align; itemType: ItemType }) => {
        const normalizedPath = normalizeNavigationPath(options.itemType, path);
        pendingScrollRef.current = {
            path: normalizedPath,
            align: options.align,
            intent: 'external',
            minIndexVersion: indexVersionRef.current,
            itemType: options.itemType
        };
        setPendingScrollVersion(v => v + 1);
    }, []);

    const selectedItemType: ItemType | null =
        selectionState.selectionType === ItemType.TAG
            ? ItemType.TAG
            : selectionState.selectionType === ItemType.PROPERTY
              ? ItemType.PROPERTY
              : selectionState.selectionType === ItemType.FOLDER
                ? ItemType.FOLDER
                : null;

    // Extract and normalize the currently selected path from selection state
    const selectedPath =
        selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder
            ? normalizeNavigationPath(ItemType.FOLDER, selectionState.selectedFolder.path)
            : selectionState.selectionType === ItemType.TAG && selectionState.selectedTag
              ? normalizeNavigationPath(ItemType.TAG, selectionState.selectedTag)
              : selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty
                ? selectionState.selectedProperty
                : null;

    /**
     * Scroll to selected folder/tag when needed
     * Only scrolls when:
     * 1. Selection actually changes (not just tree structure changes)
     * 2. Pane becomes visible or gains focus
     * 3. During reveal operations (handled separately)
     * NAV_SCROLL_SELECTION: Auto-scrolls to selected folder/tag
     */
    useEffect(() => {
        if (!selectedPath || !rowVirtualizer || !isScrollContainerReady) return;

        if (selectionReveal.isRevealOperation) {
            // Reveal operations issue explicit `requestScroll(...)` calls. Keep the previous-state refs in sync but
            // skip selection-driven auto-scroll while the reveal flag is set.
            prevSelectedPathRef.current = selectedPath;
            prevVisibleRef.current = isScrollContainerReady;
            prevFocusedPaneRef.current = uiState.focusedPane;
            return;
        }

        const currentSelectionType = selectedItemType ?? ItemType.FOLDER;
        const suppressShortcutScroll = selectionReveal.revealSource === 'shortcut';

        // Check if this is an actual selection change vs just a tree structure update
        const isSelectionChange = prevSelectedPathRef.current !== selectedPath;

        // Check if pane just became visible or gained focus
        const justBecameVisible = !prevVisibleRef.current && isScrollContainerReady;
        const justGainedFocus = prevFocusedPaneRef.current !== 'navigation' && uiState.focusedPane === 'navigation';

        // Update the refs for next comparison
        prevSelectedPathRef.current = selectedPath;
        prevVisibleRef.current = isScrollContainerReady;
        prevFocusedPaneRef.current = uiState.focusedPane;

        if (suppressShortcutScroll) {
            return;
        }

        // Only scroll on actual selection changes or visibility/focus changes
        if (!isSelectionChange && !justBecameVisible && !justGainedFocus) return;

        // Skip scroll when a shortcut is active (prevents interference)
        if (activeShortcutKey) {
            return;
        }

        // CRITICAL: Guard against race condition during visibility toggle
        // When showHiddenItems changes, the tree will rebuild with different indices.
        // We must defer this scroll until AFTER the rebuild completes.
        if (prevShowHiddenItemsRef.current !== showHiddenItems) {
            pendingScrollRef.current = {
                path: selectedPath,
                align: 'auto',
                intent: 'visibilityToggle',
                minIndexVersion: indexVersionRef.current + 1, // Wait for next version
                itemType: currentSelectionType
            };
            setPendingScrollVersion(v => v + 1);
            return;
        }

        const index = resolveIndex(selectedPath, currentSelectionType);

        if (index !== undefined && index >= 0) {
            scrollToIndexSafely(index, getNavAlign('selection'));
        }
    }, [
        selectedPath,
        rowVirtualizer,
        isScrollContainerReady,
        selectionReveal.isRevealOperation,
        uiState.focusedPane,
        showHiddenItems,
        selectedItemType,
        selectionReveal.revealSource,
        resolveIndex,
        activeShortcutKey,
        scrollToIndexSafely
    ]);

    /**
     * Special handling for startup deferred scrolling.
     * Tag/property selections can be restored before their navigation rows are available,
     * so this retries scrolling when indices are rebuilt.
     */
    useEffect(() => {
        if (!selectedPath || !selectedItemType || !rowVirtualizer || !isScrollContainerReady) {
            return;
        }

        if (selectionReveal.isRevealOperation) {
            // Tag/property reveals request scroll explicitly. This deferred-scroll effect is for restored selections
            // where the navigation rows may not exist yet.
            prevSelectedDeferredPathRef.current = selectedPath;
            return;
        }

        if (selectedItemType !== ItemType.TAG && selectedItemType !== ItemType.PROPERTY) {
            return;
        }

        if (activeShortcutKey) {
            prevSelectedDeferredPathRef.current = selectedPath;
            return;
        }

        const suppressShortcutScroll = selectionReveal.revealSource === 'shortcut';
        if (suppressShortcutScroll) {
            prevSelectedDeferredPathRef.current = selectedPath;
            return;
        }

        const isSelectionChange = prevSelectedDeferredPathRef.current !== selectedPath;
        prevSelectedDeferredPathRef.current = selectedPath;
        if (!isSelectionChange) {
            return;
        }

        if (prevShowHiddenItemsRef.current !== showHiddenItems) {
            pendingScrollRef.current = {
                path: selectedPath,
                align: 'auto',
                intent: 'visibilityToggle',
                minIndexVersion: indexVersionRef.current + 1,
                itemType: selectedItemType
            };
            setPendingScrollVersion(v => v + 1);
            return;
        }

        const index = resolveIndex(selectedPath, selectedItemType);

        if (index !== undefined && index >= 0) {
            scrollToIndexSafely(index, getNavAlign('selection'));
        }
    }, [
        pathToIndex,
        selectedItemType,
        selectedPath,
        rowVirtualizer,
        isScrollContainerReady,
        selectionReveal.isRevealOperation,
        showHiddenItems,
        resolveIndex,
        activeShortcutKey,
        selectionReveal.revealSource,
        scrollToIndexSafely
    ]);

    /**
     * Process pending scrolls when conditions are met.
     * This is the heart of the scroll orchestration system.
     *
     * Execution requirements:
     * 1. Pane must be visible
     * 2. Virtualizer must be ready
     * 3. indexVersion must meet minimum requirement
     * 4. During visibility toggles, only visibilityToggle intents execute
     */
    useEffect(() => {
        if (!rowVirtualizer || !pendingScrollRef.current || !isScrollContainerReady) return;

        const { path, align, intent, minIndexVersion, itemType } = pendingScrollRef.current;

        // Priority check: During visibility toggle, only process toggle-intent scrolls
        // This prevents stale selection scrolls from executing with wrong indices
        if (prevShowHiddenItemsRef.current !== showHiddenItems && intent !== 'visibilityToggle') {
            return;
        }

        // Version gate: Wait for tree rebuild if required
        // This is what prevents scrolling to wrong indices after tree changes
        const effectiveMin = minIndexVersion ?? indexVersionRef.current;
        if (indexVersionRef.current < effectiveMin) return;

        const index = resolveIndex(path, itemType);

        if (index !== undefined && index !== -1) {
            const finalAlign: Align = align ?? getNavAlign(intent);
            scrollToIndexSafely(index, finalAlign);
            pendingScrollRef.current = null;

            // Stabilization mechanism: Handle rare double rebuilds
            // Some operations trigger multiple rapid tree rebuilds. After executing
            // a visibilityToggle scroll, we check if the index changed again and
            // queue a follow-up scroll if needed.
            if (intent === 'visibilityToggle') {
                const usedIndex = index;
                const usedPath = path;
                window.requestAnimationFrame(() => {
                    const newIndex = resolveIndex(usedPath, itemType);
                    if (newIndex !== undefined && newIndex !== usedIndex) {
                        pendingScrollRef.current = {
                            path: usedPath,
                            align: 'auto',
                            intent: 'visibilityToggle',
                            minIndexVersion: indexVersionRef.current + 1,
                            itemType
                        };
                        setPendingScrollVersion(v => v + 1);
                    }
                });
            }
        }
        // If index not found, keep the pending scroll for next rebuild
    }, [rowVirtualizer, isScrollContainerReady, pendingScrollVersion, showHiddenItems, resolveIndex, scrollToIndexSafely]);

    /**
     * Listen for mobile drawer visibility events
     * NAV_SCROLL_MOBILE_VISIBILITY: Auto-scrolls when drawer becomes visible
     */
    useEffect(() => {
        if (!isMobile) return;

        const handleVisible = () => {
            // Skip mobile visibility scroll when a shortcut is active
            if (activeShortcutKey) {
                return;
            }
            // If we have a selected folder or tag, scroll to it
            if (!selectedPath) {
                return;
            }

            const targetType = selectedItemType ?? ItemType.FOLDER;

            if (rowVirtualizer && isScrollContainerReady) {
                const index = resolveIndex(selectedPath, targetType);
                if (index !== undefined && index >= 0) {
                    scrollToIndexSafely(index, 'auto');
                    return;
                }
            }

            // Defer scroll until the pane reports as ready or indices rebuild
            pendingScrollRef.current = {
                path: selectedPath,
                align: 'auto',
                intent: 'mobile-visibility',
                minIndexVersion: indexVersionRef.current,
                itemType: targetType
            };
            setPendingScrollVersion(v => v + 1);
        };

        window.addEventListener('notebook-navigator-visible', handleVisible);
        return () => window.removeEventListener('notebook-navigator-visible', handleVisible);
    }, [
        isMobile,
        selectedPath,
        rowVirtualizer,
        selectedItemType,
        resolveIndex,
        activeShortcutKey,
        isScrollContainerReady,
        scrollToIndexSafely
    ]);

    /**
     * Re-measure all items when vertical navigation metrics change
     * This ensures the virtualizer immediately updates when settings are adjusted
     */
    useEffect(() => {
        if (!rowVirtualizer) return;

        // Re-measure all items with new heights
        rowVirtualizer.measure();
    }, [settings.navItemHeight, settings.rootLevelSpacing, rowVirtualizer]);

    /**
     * Scroll to maintain position only when settings actually change
     * Uses a settings key to detect real changes
     */
    useEffect(() => {
        const settingsKey = `${settings.navItemHeight}-${settings.rootLevelSpacing}`;
        const settingsChanged = prevNavSettingsKeyRef.current && prevNavSettingsKeyRef.current !== settingsKey;

        // Skip settings-triggered scroll when a shortcut is active
        if (activeShortcutKey) {
            prevNavSettingsKeyRef.current = settingsKey;
            return;
        }

        if (settingsChanged) {
            if (selectedPath && isScrollContainerReady && rowVirtualizer) {
                const index = resolveIndex(selectedPath, selectedItemType ?? ItemType.FOLDER);
                if (index !== undefined && index >= 0) {
                    // Use requestAnimationFrame to ensure measurements are complete
                    window.requestAnimationFrame(() => {
                        scrollToIndexSafely(index, 'auto');
                    });
                }
            }
        }

        prevNavSettingsKeyRef.current = settingsKey;
    }, [
        settings.navItemHeight,
        settings.rootLevelSpacing,
        selectedPath,
        isScrollContainerReady,
        rowVirtualizer,
        resolveIndex,
        selectedItemType,
        activeShortcutKey,
        scrollToIndexSafely
    ]);

    const prevScrollInsetsRef = useRef<{ top: number; bottom: number } | null>(null);
    useEffect(() => {
        if (!isScrollContainerReady) {
            return;
        }

        const prevInsets = prevScrollInsetsRef.current;
        const nextInsets = { top: effectiveScrollMargin, bottom: effectiveScrollPaddingEnd };
        prevScrollInsetsRef.current = nextInsets;

        if (!prevInsets) {
            return;
        }

        if (prevInsets.top === nextInsets.top && prevInsets.bottom === nextInsets.bottom) {
            return;
        }

        if (activeShortcutKey) {
            return;
        }

        if (!selectedPath) {
            return;
        }

        const selectedType = selectedItemType ?? ItemType.FOLDER;
        const index = resolveIndex(selectedPath, selectedType);
        if (index === undefined || index < 0) {
            return;
        }

        window.requestAnimationFrame(() => {
            scrollToIndexSafely(index, 'auto');
        });
    }, [
        activeShortcutKey,
        effectiveScrollMargin,
        effectiveScrollPaddingEnd,
        isScrollContainerReady,
        resolveIndex,
        scrollToIndexSafely,
        selectedPath,
        selectedItemType
    ]);

    /**
     * Track showHiddenItems setting changes specifically
     * This is what triggers the tag tree rebuild issue
     */
    useEffect(() => {
        if (prevShowHiddenItemsRef.current !== showHiddenItems) {
            // When showHiddenItems changes and we have a selected tag/property item, defer scrolling until the tree rebuilds
            if (
                selectedPath &&
                (selectedItemType === ItemType.TAG || selectedItemType === ItemType.PROPERTY) &&
                isScrollContainerReady &&
                rowVirtualizer
            ) {
                // Set a pending scroll to be processed after the next index rebuild
                pendingScrollRef.current = {
                    path: selectedPath,
                    align: 'auto',
                    intent: 'visibilityToggle',
                    minIndexVersion: indexVersionRef.current + 1,
                    itemType: selectedItemType ?? ItemType.FOLDER
                };
                setPendingScrollVersion(v => v + 1);
            }

            prevShowHiddenItemsRef.current = showHiddenItems;
        }
    }, [selectedItemType, showHiddenItems, selectedPath, isScrollContainerReady, rowVirtualizer]);

    return {
        rowVirtualizer,
        scrollContainerRef,
        scrollContainerRefCallback,
        handleScrollToTop,
        requestScroll,
        pendingScrollVersion
    };
}
