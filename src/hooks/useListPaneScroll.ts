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
 * useListPaneScroll - Orchestrates scrolling for the ListPane component
 *
 * ## Problem this solves:
 * The list pane rebuilds when navigating folders, changing settings, or applying
 * filters. Without proper synchronization, scrolls would execute before the list
 * updates, causing incorrect positioning or failed scrolls.
 *
 * ## Solution:
 * Priority-based scroll queue with version gating. Scrolls are prioritized by
 * importance and wait for list rebuilds before executing.
 *
 * ## Key concepts:
 * - **Priority system**: Higher priority scrolls override lower ones (reveal > navigation > visibility > config)
 * - **Index versioning**: Tracks list rebuilds for proper timing
 * - **Scroll reasons**: Different intents with specific alignment behaviors
 * - **Stabilization**: Handles rapid consecutive rebuilds gracefully
 *
 * ## Handles:
 * - Virtual list initialization with estimated item heights
 * - Folder/tag navigation with file preservation
 * - Configuration changes (descendants, appearance)
 * - Mobile drawer visibility
 * - Reveal operations (show active file)
 * - Search filter changes
 * - Sticky header tracking for date groups
 */

import { useRef, useCallback, useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { TFile, TFolder, type App } from 'obsidian';
import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';
import { useServices } from '../context/ServicesContext';
import { useFileCache } from '../context/StorageContext';
import { ListPaneItemType, OVERSCAN } from '../types';
import { Align, ListScrollIntent, getListAlign, rankListPending } from '../types/scroll';
import type { ListPaneItem } from '../types/virtualization';
import { showsCharacterCount, showsWordCount, type NotebookNavigatorSettings, type SortOption } from '../settings/types';
import type { FileContentChange, FileData, IndexedDBStorage } from '../storage/IndexedDBStorage';
import type { SelectionDispatch, SelectionState } from '../context/SelectionContext';
import { calculateCompactListMetrics } from '../utils/listPaneMetrics';
import {
    estimateFileRowHeight,
    type FileRowHeightConfig,
    type FileRowHeightInputs,
    getSelectedPropertyValuePillToHide,
    getSelectedTagPillToHide,
    hasVisibleTagPills,
    getListPaneHeaderHeight,
    getListPaneMeasurements,
    getPropertyRowCount,
    shouldShowExtensionBadgeThumbnail,
    shouldShowFeatureImageArea,
    shouldShowFileItemParentFolderLine,
    shouldShowFileItemTaskProgress
} from '../utils/listPaneMeasurements';
import type { PropertySelectionNodeId } from '../utils/propertyTree';
import { getCachedFileTags } from '../utils/tagUtils';
import type { HiddenTagVisibility } from '../utils/tagPrefixMatcher';
import { getDrawingFeatureImageSource, resolveDrawingFeatureImageFileForProvider } from '../utils/drawingFeatureImages';
import { useThemeMode } from './useThemeMode';
import type { ThemeMode } from '../utils/themeMode';
import { getListSortOverrideForSelection, resolveListSort } from '../utils/sortUtils';
import type { ListPaneAppearanceSettings } from '../settings/listPaneAppearance';

/**
 * Parameters for the useListPaneScroll hook
 */
interface UseListPaneScrollParams {
    /** Whether scroll orchestration and the virtualizer are active */
    enabled?: boolean;
    /** List items to be rendered in the virtual list */
    listItems: ListPaneItem[];
    /** Map from file paths to their index in listItems */
    filePathToIndex: Map<string, number>;
    /** Currently selected file */
    selectedFile: TFile | null;
    /** Currently selected folder */
    selectedFolder: TFolder | null;
    /** Currently selected tag */
    selectedTag: string | null;
    /** Currently selected property */
    selectedProperty: PropertySelectionNodeId | null;
    /** Plugin settings */
    settings: NotebookNavigatorSettings;
    /** Effective settings for the current folder */
    folderSettings: ListPaneAppearanceSettings;
    /** Whether the list pane is currently visible */
    isVisible: boolean;
    /** Current selection state */
    selectionState: SelectionState;
    /** Selection state dispatcher */
    selectionDispatch: SelectionDispatch;
    /** Current search query (undefined if search is not active) */
    searchQuery?: string;
    /** Suppress scroll-to-top behavior after search filtering (used for mobile shortcuts) */
    suppressSearchTopScrollRef?: { current: boolean } | null;
    /** Height of the synthetic top spacer used ahead of file items */
    topSpacerHeight: number;
    /** Whether descendant notes should be shown */
    includeDescendantNotes: boolean;
    /** Signature that changes when any list group collapse state changes */
    groupCollapseStateSignature: string;
    /** Visible frontmatter property keys for file list rows (normalized keys) */
    visiblePropertyKeys: ReadonlySet<string>;
    /** Stable key signature for visible frontmatter property keys */
    visiblePropertyKeySignature: string;
    /** Hidden tag filter rules shared with file-item pill rendering */
    hiddenTagVisibility: HiddenTagVisibility;
    /** Scroll margin used to offset the visible range and scrollToIndex alignment */
    scrollMargin?: number;
    /**
     * Bottom inset reserved by overlays that sit on top of the scroll content.
     *
     * The list pane can render a mobile floating toolbar at the bottom; scrolling and scrollToIndex
     * should keep the target row above that overlay.
     */
    scrollPaddingEnd?: number;
    /** Called when the virtualizer scrolling state changes */
    onVirtualizerScrollingChange?: (isScrolling: boolean, scrollElement: HTMLDivElement | null) => void;
    /** Called when the physical scroll container is hidden or shown */
    onScrollContainerVisibilityChange?: (isVisible: boolean, scrollElement: HTMLDivElement | null) => void;
}

type ListPaneAppearanceLayoutSettings = UseListPaneScrollParams['folderSettings'];
type PendingScroll =
    | {
          type: 'file';
          filePath: string;
          reason?: ListScrollIntent;
          minIndexVersion?: number;
      }
    | {
          type: 'top';
          reason?: ListScrollIntent;
          minIndexVersion?: number;
      };

/**
 * A file request becomes stale when selection moves to another file or is cleared. A current
 * selection can remain absent from the index while an asynchronous search finishes or a collapsed group expands.
 */
export function isPendingFileScrollStale(pending: PendingScroll, selectedFilePath: string | null): boolean {
    return pending.type === 'file' && pending.filePath !== selectedFilePath;
}

type ListLayoutSignatureSettings = Pick<
    NotebookNavigatorSettings,
    | 'compactItemHeight'
    | 'compactItemHeightScaleText'
    | 'showFilePropertiesInCompactMode'
    | 'showPropertiesOnSeparateRows'
    | 'textCountPlacement'
    | 'characterCountSpaces'
    | 'hideFileTaskProgressWhenComplete'
    | 'showSelectedNavigationPills'
>;

export interface ListFileRowSizingConfig extends FileRowHeightConfig {
    isCompactMode: boolean;
    tagsBaseEnabled: boolean;
    frontmatterPropertyRowsPossible: boolean;
    propertyRowsPossible: boolean;
    showTextCountProperty: boolean;
    showWordCountProperty: boolean;
    showCharacterCountProperty: boolean;
    showFileProperties: boolean;
    showPropertiesOnSeparateRows: boolean;
    showFilePropertiesInCompactMode: boolean;
    characterCountSpaces: NotebookNavigatorSettings['characterCountSpaces'];
    showParentFolder: boolean;
    showTaskProgress: boolean;
    hideTaskProgressWhenComplete: boolean;
    selectionType: SelectionState['selectionType'];
    includeDescendantNotes: boolean;
    selectedTagToHide: string | null;
    selectedPropertyValueNodeIdToHide: string | null;
    hiddenTagVisibility: HiddenTagVisibility;
    visiblePropertyKeys: ReadonlySet<string>;
    themeMode: ThemeMode;
}

export type ListRowHeightAffectingContentChangeConfig = Pick<
    ListFileRowSizingConfig,
    | 'showPreview'
    | 'showImage'
    | 'tagsBaseEnabled'
    | 'frontmatterPropertyRowsPossible'
    | 'showWordCountProperty'
    | 'showCharacterCountProperty'
    | 'characterCountSpaces'
    | 'showTaskProgress'
    | 'hideTaskProgressWhenComplete'
>;

interface ResolveListFileRowHeightInputsParams {
    app: App;
    db: IndexedDBStorage;
    hasPreview: (path: string) => boolean;
    item: ListPaneItem;
    file: TFile;
    config: ListFileRowSizingConfig;
}

/**
 * Return value of the useListPaneScroll hook
 */
interface UseListPaneScrollResult {
    /** TanStack Virtual virtualizer instance */
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    /** Reference to the scroll container element */
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    /** Callback to set the scroll container ref */
    scrollContainerRefCallback: (element: HTMLDivElement | null) => void;
    /** Handler to scroll to top (mobile header tap) */
    handleScrollToTop: () => void;
    /** Scrolls a list index into view while accounting for overlay chrome */
    scrollToIndexSafely: (index: number, align: Align) => void;
}

// Path-index maps can be recreated with the same contents. Keep indexVersion tied to effective mapping changes.
function areFilePathIndexMapsEqual(previous: ReadonlyMap<string, number>, next: ReadonlyMap<string, number>): boolean {
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

interface ListLayoutSignatureParams {
    topSpacerHeight: number;
    folderSettings: ListPaneAppearanceLayoutSettings;
    settings: ListLayoutSignatureSettings;
    themeMode: ThemeMode;
    selectionType: SelectionState['selectionType'];
    selectedTagToHide: string | null;
    selectedPropertyValueNodeIdToHide: string | null;
    includeDescendantNotes: boolean;
    hiddenTagVisibilitySignature: string;
    visiblePropertyKeySignature: string;
    listMeasurements: ReturnType<typeof getListPaneMeasurements>;
}

interface ScrollPreservationSignatureParams {
    includeDescendantNotes: boolean;
    listLayoutSignature: string;
    groupBy: ListPaneAppearanceLayoutSettings['groupBy'];
    noteGrouping: NotebookNavigatorSettings['noteGrouping'];
    stickyGroupHeaders: NotebookNavigatorSettings['stickyGroupHeaders'];
    effectiveSort: SortOption;
    propertySortKey: string;
    propertySortSecondary: NotebookNavigatorSettings['propertySortSecondary'];
}

interface PreviousScrollPreservationConfig {
    signature: string;
    includeDescendantNotes: boolean;
}

function getHiddenTagVisibilitySignature(hiddenTagVisibility: HiddenTagVisibility): string {
    const { matcher } = hiddenTagVisibility;
    return JSON.stringify({
        shouldFilterHiddenTags: hiddenTagVisibility.shouldFilterHiddenTags,
        matcher: {
            prefixes: matcher.prefixes,
            startsWithNames: matcher.startsWithNames,
            endsWithNames: matcher.endsWithNames,
            pathPatterns: matcher.pathPatterns
        }
    });
}

function getListLayoutSignature({
    topSpacerHeight,
    folderSettings,
    settings,
    themeMode,
    selectionType,
    selectedTagToHide,
    selectedPropertyValueNodeIdToHide,
    includeDescendantNotes,
    hiddenTagVisibilitySignature,
    visiblePropertyKeySignature,
    listMeasurements
}: ListLayoutSignatureParams): string {
    return JSON.stringify({
        spacers: {
            topSpacerHeight
        },
        environment: {
            themeMode
        },
        appearance: {
            mode: folderSettings.mode,
            titleRows: folderSettings.titleRows,
            previewRows: folderSettings.previewRows,
            groupBy: folderSettings.groupBy,
            showDate: folderSettings.showDate,
            showParentFolder: folderSettings.showParentFolder,
            showPreview: folderSettings.showPreview,
            showImage: folderSettings.showImage,
            showTags: folderSettings.showTags,
            showProperties: folderSettings.showProperties,
            showTaskProgress: folderSettings.showTaskProgress,
            textCountDisplay: folderSettings.textCountDisplay
        },
        rowContent: {
            showFilePropertiesInCompactMode: settings.showFilePropertiesInCompactMode,
            showPropertiesOnSeparateRows: settings.showPropertiesOnSeparateRows,
            textCountPlacement: settings.textCountPlacement,
            characterCountSpaces: settings.characterCountSpaces,
            showSelectedNavigationPills: settings.showSelectedNavigationPills,
            visiblePropertyKeySignature,
            hideFileTaskProgressWhenComplete: settings.hideFileTaskProgressWhenComplete,
            selectionType: selectionType ?? null,
            selectedTagToHide,
            selectedPropertyValueNodeIdToHide,
            includeDescendantNotes,
            hiddenTagVisibilitySignature
        },
        rowSizing: {
            compactItemHeight: settings.compactItemHeight,
            compactItemHeightScaleText: settings.compactItemHeightScaleText
        },
        measurements: listMeasurements
    });
}

function getScrollPreservationSignature({
    includeDescendantNotes,
    listLayoutSignature,
    groupBy,
    noteGrouping,
    stickyGroupHeaders,
    effectiveSort,
    propertySortKey,
    propertySortSecondary
}: ScrollPreservationSignatureParams): string {
    return JSON.stringify({
        includeDescendantNotes,
        listLayoutSignature,
        groupBy,
        noteGrouping,
        stickyGroupHeaders,
        effectiveSort,
        propertySortKey: propertySortKey ?? null,
        propertySortSecondary
    });
}

export function isListRowHeightAffectingContentChange(
    change: FileContentChange,
    config: ListRowHeightAffectingContentChangeConfig
): boolean {
    const { changes } = change;

    if (changes.previewStatus !== undefined && config.showPreview) {
        return true;
    }

    if ((changes.featureImageKey !== undefined || changes.featureImageStatus !== undefined) && config.showImage) {
        return true;
    }

    if (changes.tags !== undefined && config.tagsBaseEnabled) {
        return true;
    }

    if (changes.properties !== undefined && config.frontmatterPropertyRowsPossible) {
        return true;
    }

    if (changes.wordCount !== undefined && config.showWordCountProperty) {
        return true;
    }

    if (changes.characterCountWithSpaces !== undefined && config.showCharacterCountProperty && config.characterCountSpaces === 'include') {
        return true;
    }

    if (
        changes.characterCountWithoutSpaces !== undefined &&
        config.showCharacterCountProperty &&
        config.characterCountSpaces === 'exclude'
    ) {
        return true;
    }

    if (config.showTaskProgress && change.previousTaskCounters) {
        const previousTaskCounters = change.previousTaskCounters;
        // Notifications publish only changed counters, so retain the previous value when a field is absent. Null is
        // an explicit pending state and must not be treated as an absent field.
        const nextTaskTotal = changes.taskTotal !== undefined ? changes.taskTotal : previousTaskCounters.taskTotal;
        const nextTaskUnfinished = changes.taskUnfinished !== undefined ? changes.taskUnfinished : previousTaskCounters.taskUnfinished;
        const wasTaskProgressVisible = shouldShowFileItemTaskProgress({
            showTaskProgress: true,
            hideWhenComplete: config.hideTaskProgressWhenComplete,
            taskTotal: previousTaskCounters.taskTotal,
            taskUnfinished: previousTaskCounters.taskUnfinished
        });
        const isTaskProgressVisible = shouldShowFileItemTaskProgress({
            showTaskProgress: true,
            hideWhenComplete: config.hideTaskProgressWhenComplete,
            taskTotal: nextTaskTotal,
            taskUnfinished: nextTaskUnfinished
        });
        return wasTaskProgressVisible !== isTaskProgressVisible;
    }

    return false;
}

export function createRemeasureScheduler(measure: () => void): { schedule: () => void; cancel: () => void } {
    let frameId: number | null = null;

    return {
        schedule() {
            if (frameId !== null) {
                return;
            }

            frameId = window.requestAnimationFrame(() => {
                frameId = null;
                measure();
            });
        },
        cancel() {
            if (frameId === null) {
                return;
            }

            window.cancelAnimationFrame(frameId);
            frameId = null;
        }
    };
}

function getStickyHeaderHeightBeforeIndex(
    listItems: ListPaneItem[],
    index: number,
    measurements: ReturnType<typeof getListPaneMeasurements>
): number {
    const item = listItems[index];
    if (item?.type !== ListPaneItemType.FILE || !(item.data instanceof TFile)) {
        return 0;
    }

    for (let listIndex = index - 1; listIndex >= 0; listIndex -= 1) {
        const candidate = listItems[listIndex];
        if (candidate?.type === ListPaneItemType.HEADER) {
            return getListPaneHeaderHeight(candidate, measurements);
        }
    }

    return 0;
}

function shouldReadFileRecordForRowEstimate(item: ListPaneItem, config: ListFileRowSizingConfig): boolean {
    if (config.showImage) {
        return true;
    }

    if (config.propertyRowsPossible) {
        return true;
    }

    if (config.showTaskProgress) {
        return true;
    }

    return config.tagsBaseEnabled && Boolean(item.hasTags) && config.selectedTagToHide !== null;
}

export function resolveListFileRowHeightInputs({
    app,
    db,
    hasPreview,
    item,
    file,
    config
}: ResolveListFileRowHeightInputsParams): FileRowHeightInputs {
    let fileRecord: FileData | null = null;
    if (shouldReadFileRecordForRowEstimate(item, config)) {
        fileRecord = db.getFile(file.path);
    }

    let hasPreviewText = false;
    let hasOmnisearchExcerpt = false;
    if (config.showPreview) {
        if (file.extension === 'md') {
            hasPreviewText = hasPreview(file.path);
        }
        const excerpt = item.searchMeta?.excerpt;
        hasOmnisearchExcerpt = typeof excerpt === 'string' && excerpt.length > 0;
    }
    const hasPreviewContent = hasPreviewText || hasOmnisearchExcerpt;

    let showDrawingFeatureImage = false;
    let showDrawingMissingFeatureImage = false;
    if (config.showImage) {
        const drawingFeatureImageSource = getDrawingFeatureImageSource(app, file);
        showDrawingFeatureImage = drawingFeatureImageSource?.showsFeatureImageBox ?? false;
        showDrawingMissingFeatureImage =
            showDrawingFeatureImage && !drawingFeatureImageSource?.supportsCompanionImages
                ? true
                : showDrawingFeatureImage && drawingFeatureImageSource
                  ? resolveDrawingFeatureImageFileForProvider(app, file, drawingFeatureImageSource.providerId, config.themeMode) === null
                  : false;
    }

    const showFeatureImageArea = shouldShowFeatureImageArea({
        showImage: config.showImage,
        file,
        featureImageStatus: fileRecord?.featureImageStatus ?? null,
        showDrawingFeatureImage
    });
    const showExtensionBadgeThumbnail = shouldShowExtensionBadgeThumbnail({
        showFeatureImageArea,
        file,
        showDrawingMissingFeatureImage
    });

    let hasTagRow = false;
    if (!showDrawingMissingFeatureImage && config.tagsBaseEnabled && item.hasTags) {
        if (!config.selectedTagToHide) {
            hasTagRow = true;
        } else {
            hasTagRow = hasVisibleTagPills({
                tags: getCachedFileTags({ app, file, db, fileData: fileRecord }),
                hiddenTagVisibility: config.hiddenTagVisibility,
                selectedTagToHide: config.selectedTagToHide
            });
        }
    }

    const showParentFolderLine = shouldShowFileItemParentFolderLine({
        showParentFolder: config.showParentFolder,
        isPinned: Boolean(item.isPinned),
        selectionType: config.selectionType,
        includeDescendantNotes: config.includeDescendantNotes,
        parentFolder: item.parentFolder,
        fileParentPath: file.parent?.path ?? null
    });

    // Task counts are only produced for markdown files; other extensions never show the progress element.
    const showTaskProgressLine = shouldShowFileItemTaskProgress({
        showTaskProgress: config.showTaskProgress,
        hideWhenComplete: config.hideTaskProgressWhenComplete,
        taskTotal: file.extension === 'md' ? (fileRecord?.taskTotal ?? null) : null,
        taskUnfinished: file.extension === 'md' ? (fileRecord?.taskUnfinished ?? null) : null
    });

    const propertyRowCount =
        !showDrawingMissingFeatureImage && config.propertyRowsPossible
            ? getPropertyRowCount({
                  showTextCountProperty: config.showTextCountProperty,
                  showFileProperties: config.showFileProperties,
                  showPropertiesOnSeparateRows: config.showPropertiesOnSeparateRows,
                  showFilePropertiesInCompactMode: config.showFilePropertiesInCompactMode,
                  isCompactMode: config.isCompactMode,
                  file,
                  wordCount: config.showWordCountProperty ? (fileRecord?.wordCount ?? undefined) : undefined,
                  characterCount: config.showCharacterCountProperty
                      ? config.characterCountSpaces === 'include'
                          ? (fileRecord?.characterCountWithSpaces ?? undefined)
                          : (fileRecord?.characterCountWithoutSpaces ?? undefined)
                      : undefined,
                  properties: fileRecord?.properties ?? undefined,
                  visiblePropertyKeys: config.visiblePropertyKeys,
                  hiddenPropertyValueNodeId: config.selectedPropertyValueNodeIdToHide
              })
            : 0;

    return {
        isPinned: Boolean(item.isPinned),
        hasPreviewContent,
        showFeatureImageArea,
        showExtensionBadgeThumbnail,
        showParentFolderLine,
        showTaskProgressLine,
        visiblePillRowCount: (hasTagRow ? 1 : 0) + propertyRowCount
    };
}

/**
 * Hook that manages scrolling behavior for the ListPane component.
 * Handles virtualization, scroll position, and various scroll scenarios.
 *
 * @param params - Configuration parameters
 * @returns Virtualizer instance and scroll management utilities
 */
export function useListPaneScroll({
    enabled = true,
    listItems,
    filePathToIndex,
    selectedFile,
    selectedFolder,
    selectedTag,
    selectedProperty,
    settings,
    folderSettings,
    isVisible,
    selectionState,
    selectionDispatch,
    searchQuery,
    suppressSearchTopScrollRef,
    topSpacerHeight,
    includeDescendantNotes,
    groupCollapseStateSignature,
    visiblePropertyKeys,
    visiblePropertyKeySignature,
    hiddenTagVisibility,
    scrollMargin = 0,
    scrollPaddingEnd = 0,
    onVirtualizerScrollingChange,
    onScrollContainerVisibilityChange
}: UseListPaneScrollParams): UseListPaneScrollResult {
    const { app, isMobile } = useServices();
    const listMeasurements = getListPaneMeasurements(isMobile);
    const { hasPreview, getDB, isStorageReady } = useFileCache();
    const themeMode = useThemeMode(app);
    // The list pane only renders after StorageContext marks storage ready.
    const db = getDB();

    // Calculate compact list padding for height estimation in virtualization
    const compactListMetrics = useMemo(
        () =>
            calculateCompactListMetrics({
                compactItemHeight: settings.compactItemHeight,
                scaleText: settings.compactItemHeightScaleText,
                titleLineHeight: listMeasurements.titleLineHeight
            }),
        [listMeasurements.titleLineHeight, settings.compactItemHeight, settings.compactItemHeightScaleText]
    );

    // Reference to the scroll container DOM element
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [scrollContainerEl, setScrollContainerEl] = useState<HTMLDivElement | null>(null);
    const [containerVisible, setContainerVisible] = useState<boolean>(false);
    const containerVisibleRef = useRef(false);
    const onVirtualizerScrollingChangeRef = useRef(onVirtualizerScrollingChange);
    const onScrollContainerVisibilityChangeRef = useRef(onScrollContainerVisibilityChange);

    // Track list state changes and pending scroll operations
    const prevListKeyRef = useRef<string>(''); // Previous folder/tag context to detect navigation
    const prevScrollPreservationConfigRef = useRef<PreviousScrollPreservationConfig | null>(null);
    const prevSearchQueryRef = useRef<string | undefined>(undefined); // Track search query changes
    const prevGroupCollapseStateSignatureRef = useRef<string>(groupCollapseStateSignature);

    // ========== Scroll Orchestration ==========
    const pendingScrollRef = useRef<PendingScroll | null>(null);
    const [pendingScrollVersion, setPendingScrollVersion] = useState(0); // Triggers effect re-run
    // Tracks the currently selected file path to detect stale pending scrolls
    const selectedFilePath = selectedFile?.path ?? null;
    const selectedFilePathRef = useRef<string | null>(selectedFilePath);
    selectedFilePathRef.current = selectedFilePath;

    // ========== Index Version Tracking ==========
    // Increments when list rebuilds to ensure scrolls execute with correct indices
    const indexVersionRef = useRef<number>(0);
    const prevIndexMapSizeRef = useRef<number>(filePathToIndex.size);
    const prevIndexMapObjRef = useRef<Map<string, number> | null>(null);

    // Context tracking for index-version based reorder detection within a list context
    const contextIndexVersionRef = useRef<{ key: string; version: number } | null>(null);
    const lastReportedVirtualizerScrollingRef = useRef(false);

    useEffect(() => {
        onVirtualizerScrollingChangeRef.current = onVirtualizerScrollingChange;
    }, [onVirtualizerScrollingChange]);

    useEffect(() => {
        onScrollContainerVisibilityChangeRef.current = onScrollContainerVisibilityChange;
    }, [onScrollContainerVisibilityChange]);

    const reportContainerVisibility = useCallback((nextVisible: boolean, scrollElement: HTMLDivElement | null) => {
        setContainerVisible(previous => (previous === nextVisible ? previous : nextVisible));

        if (containerVisibleRef.current === nextVisible) {
            return;
        }

        containerVisibleRef.current = nextVisible;
        if (!nextVisible && lastReportedVirtualizerScrollingRef.current) {
            lastReportedVirtualizerScrollingRef.current = false;
            onVirtualizerScrollingChangeRef.current?.(false, scrollElement);
        }
        onScrollContainerVisibilityChangeRef.current?.(nextVisible, scrollElement);
    }, []);

    const isCompactMode = folderSettings.mode === 'compact';
    const revealFileOnListChanges = settings.revealFileOnListChanges;
    const hasSelectedFile = Boolean(selectedFile);
    const selectedTagToHide = useMemo(
        () =>
            getSelectedTagPillToHide({
                selectionType: selectionState.selectionType,
                selectedTag: selectionState.selectedTag,
                showSelectedNavigationPills: settings.showSelectedNavigationPills
            }),
        [selectionState.selectedTag, selectionState.selectionType, settings.showSelectedNavigationPills]
    );
    const selectedPropertyValueNodeIdToHide = useMemo(
        () =>
            getSelectedPropertyValuePillToHide({
                selectionType: selectionState.selectionType,
                selectedProperty: selectionState.selectedProperty,
                showSelectedNavigationPills: settings.showSelectedNavigationPills
            }),
        [selectionState.selectedProperty, selectionState.selectionType, settings.showSelectedNavigationPills]
    );
    const rowSizingConfig = useMemo<ListFileRowSizingConfig>(() => {
        const showTextCountProperty = folderSettings.textCountDisplay !== 'none' && settings.textCountPlacement === 'property';
        const showWordCountProperty = showTextCountProperty && showsWordCount(folderSettings.textCountDisplay);
        const showCharacterCountProperty = showTextCountProperty && showsCharacterCount(folderSettings.textCountDisplay);
        const canShowPropertiesInCurrentMode = !isCompactMode || settings.showFilePropertiesInCompactMode;
        const showFrontmatterPropertyRows = folderSettings.showProperties && visiblePropertyKeys.size > 0;
        const frontmatterPropertyRowsPossible = canShowPropertiesInCurrentMode && showFrontmatterPropertyRows;

        return {
            heights: listMeasurements,
            titleRows: folderSettings.titleRows || 1,
            previewRows: folderSettings.previewRows,
            showDate: folderSettings.showDate,
            showPreview: folderSettings.showPreview,
            showImage: folderSettings.showImage,
            compactPaddingTotal: isMobile ? compactListMetrics.mobilePaddingTotal : compactListMetrics.desktopPaddingTotal,
            isCompactMode,
            tagsBaseEnabled: folderSettings.showTags,
            frontmatterPropertyRowsPossible,
            propertyRowsPossible: canShowPropertiesInCurrentMode && (showFrontmatterPropertyRows || showTextCountProperty),
            showTextCountProperty,
            showWordCountProperty,
            showCharacterCountProperty,
            showFileProperties: folderSettings.showProperties,
            showPropertiesOnSeparateRows: settings.showPropertiesOnSeparateRows,
            showFilePropertiesInCompactMode: settings.showFilePropertiesInCompactMode,
            characterCountSpaces: settings.characterCountSpaces,
            showParentFolder: folderSettings.showParentFolder,
            // Compact mode never renders the metadata line, so disabling the flag there skips
            // per-row record reads during height estimation and task-driven remeasurements.
            showTaskProgress: folderSettings.showTaskProgress,
            hideTaskProgressWhenComplete: settings.hideFileTaskProgressWhenComplete,
            selectionType: selectionState.selectionType,
            includeDescendantNotes,
            selectedTagToHide,
            selectedPropertyValueNodeIdToHide,
            hiddenTagVisibility,
            visiblePropertyKeys,
            themeMode
        };
    }, [
        compactListMetrics.desktopPaddingTotal,
        compactListMetrics.mobilePaddingTotal,
        folderSettings.previewRows,
        folderSettings.showDate,
        folderSettings.showImage,
        folderSettings.showParentFolder,
        folderSettings.showPreview,
        folderSettings.showProperties,
        folderSettings.showTags,
        folderSettings.showTaskProgress,
        folderSettings.textCountDisplay,
        folderSettings.titleRows,
        hiddenTagVisibility,
        includeDescendantNotes,
        isCompactMode,
        isMobile,
        listMeasurements,
        selectedPropertyValueNodeIdToHide,
        selectedTagToHide,
        selectionState.selectionType,
        settings.characterCountSpaces,
        settings.showFilePropertiesInCompactMode,
        settings.hideFileTaskProgressWhenComplete,
        settings.showPropertiesOnSeparateRows,
        settings.textCountPlacement,
        themeMode,
        visiblePropertyKeys
    ]);
    const getListItemKey = useCallback((index: number) => listItems[index]?.key ?? index, [listItems]);

    /**
     * Initialize TanStack Virtual virtualizer with per-item height estimates.
     * Handles different item types (headers, files, spacers) with appropriate heights.
     */
    const effectiveScrollMargin = Number.isFinite(scrollMargin) && scrollMargin > 0 ? scrollMargin : 0;
    const effectiveScrollPaddingEnd = Number.isFinite(scrollPaddingEnd) && scrollPaddingEnd > 0 ? scrollPaddingEnd : 0;
    const rowVirtualizer = useVirtualizer({
        count: enabled ? listItems.length : 0,
        getItemKey: getListItemKey,
        getScrollElement: () => {
            if (!enabled) {
                return null;
            }
            const element = scrollContainerRef.current;
            if (!element) {
                // No element available yet
            }
            return element;
        },
        enabled,
        // Align virtualizer scroll math with the start of the file rows (excluding overlay chrome).
        scrollMargin: effectiveScrollMargin,
        // Ensure scrollToIndex aligns items below the overlay chrome instead of under it.
        scrollPaddingStart: effectiveScrollMargin,
        estimateSize: index => {
            const item = listItems[index];
            const heights = rowSizingConfig.heights;

            if (item.type === ListPaneItemType.HEADER) {
                return getListPaneHeaderHeight(item, heights);
            }
            if (item.type === ListPaneItemType.HEADER_SPACER) {
                return heights.groupHeaderSpacerBefore;
            }

            if (item.type === ListPaneItemType.TOP_SPACER) {
                return topSpacerHeight;
            }
            if (item.type === ListPaneItemType.BOTTOM_SPACER) {
                return heights.bottomSpacer;
            }

            if (item.type === ListPaneItemType.FILE && item.data instanceof TFile) {
                return estimateFileRowHeight(
                    resolveListFileRowHeightInputs({
                        app,
                        db,
                        hasPreview,
                        item,
                        file: item.data,
                        config: rowSizingConfig
                    }),
                    rowSizingConfig
                );
            }

            return heights.titleLineHeight;
        },
        overscan: OVERSCAN,
        scrollPaddingEnd: effectiveScrollPaddingEnd,
        useScrollendEvent: true,
        onChange: instance => {
            if (!enabled) {
                return;
            }
            const nextIsScrolling = instance.isScrolling;
            if (nextIsScrolling && !containerVisibleRef.current) {
                return;
            }
            if (lastReportedVirtualizerScrollingRef.current === nextIsScrolling) {
                return;
            }

            lastReportedVirtualizerScrollingRef.current = nextIsScrolling;
            onVirtualizerScrollingChangeRef.current?.(nextIsScrolling, instance.scrollElement);
        }
    });
    const measureCurrentVirtualizerRef = useRef<() => void>(() => undefined);
    measureCurrentVirtualizerRef.current = () => rowVirtualizer.measure();
    const remeasureSchedulerRef = useRef<ReturnType<typeof createRemeasureScheduler> | null>(null);
    if (remeasureSchedulerRef.current === null) {
        remeasureSchedulerRef.current = createRemeasureScheduler(() => measureCurrentVirtualizerRef.current());
    }

    /**
     * Callback for when scroll container ref is set.
     * Used as a ref callback to capture the DOM element.
     */
    const scrollContainerRefCallback = useCallback(
        (element: HTMLDivElement | null) => {
            scrollContainerRef.current = element;
            setScrollContainerEl(element);
            if (!element) {
                reportContainerVisibility(false, null);
            }
        },
        [reportContainerVisibility]
    );

    /**
     * Track the rendered visibility of the list scroll container.
     * TanStack Virtual scroll calls should not execute while the container (or parent)
     * is hidden because they will fail internally and emit retry errors.
     */
    useLayoutEffect(() => {
        const element = scrollContainerEl;
        if (!enabled) {
            reportContainerVisibility(false, element);
            return;
        }

        if (!element) {
            reportContainerVisibility(false, null);
            return;
        }

        const updateVisibility = () => {
            const rect = element.getBoundingClientRect();
            const isContainerVisible = rect.width > 0 && rect.height > 0;
            reportContainerVisibility(isContainerVisible, element);
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
            reportContainerVisibility(isContainerVisible, element);
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [enabled, reportContainerVisibility, scrollContainerEl]);

    // Container is ready when both the list pane and the physical container are visible
    const isScrollContainerReady = enabled && isVisible && containerVisible;

    // Tracks inputs that affect estimated row heights.
    const hiddenTagVisibilitySignature = useMemo(() => getHiddenTagVisibilitySignature(hiddenTagVisibility), [hiddenTagVisibility]);
    const listLayoutSettings = useMemo<ListLayoutSignatureSettings>(
        () => ({
            compactItemHeight: settings.compactItemHeight,
            compactItemHeightScaleText: settings.compactItemHeightScaleText,
            showFilePropertiesInCompactMode: settings.showFilePropertiesInCompactMode,
            showPropertiesOnSeparateRows: settings.showPropertiesOnSeparateRows,
            textCountPlacement: settings.textCountPlacement,
            characterCountSpaces: settings.characterCountSpaces,
            hideFileTaskProgressWhenComplete: settings.hideFileTaskProgressWhenComplete,
            showSelectedNavigationPills: settings.showSelectedNavigationPills
        }),
        [
            settings.compactItemHeight,
            settings.compactItemHeightScaleText,
            settings.showFilePropertiesInCompactMode,
            settings.showPropertiesOnSeparateRows,
            settings.textCountPlacement,
            settings.characterCountSpaces,
            settings.hideFileTaskProgressWhenComplete,
            settings.showSelectedNavigationPills
        ]
    );
    const listLayoutSignature = useMemo(
        () =>
            getListLayoutSignature({
                topSpacerHeight,
                folderSettings,
                settings: listLayoutSettings,
                themeMode,
                selectionType: selectionState.selectionType,
                selectedTagToHide,
                selectedPropertyValueNodeIdToHide,
                includeDescendantNotes,
                hiddenTagVisibilitySignature,
                visiblePropertyKeySignature,
                listMeasurements
            }),
        [
            topSpacerHeight,
            folderSettings,
            listLayoutSettings,
            themeMode,
            selectionState.selectionType,
            selectedTagToHide,
            selectedPropertyValueNodeIdToHide,
            includeDescendantNotes,
            hiddenTagVisibilitySignature,
            visiblePropertyKeySignature,
            listMeasurements
        ]
    );

    /**
     * Scroll to top handler for mobile header tap.
     */
    const handleScrollToTop = useCallback(() => {
        if (enabled && isMobile && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [enabled, isMobile]);

    const ensureIndexNotCovered = useCallback(
        (index: number) => {
            const scrollElement = scrollContainerRef.current;
            if (!scrollElement) {
                return;
            }

            const row = scrollElement.querySelector(`[data-index="${index}"]`);
            if (!(row instanceof HTMLElement)) {
                return;
            }

            const containerRect = scrollElement.getBoundingClientRect();
            const rowRect = row.getBoundingClientRect();
            const topInset = settings.stickyGroupHeaders ? getStickyHeaderHeightBeforeIndex(listItems, index, listMeasurements) : 0;
            const safeTop = containerRect.top + topInset;
            const safeBottom = containerRect.bottom - effectiveScrollPaddingEnd;

            if (topInset > 0 && rowRect.top < safeTop) {
                scrollElement.scrollTop -= Math.round(safeTop - rowRect.top);
                return;
            }

            if (effectiveScrollPaddingEnd > 0 && rowRect.bottom > safeBottom) {
                scrollElement.scrollTop += Math.round(rowRect.bottom - safeBottom);
            }
        },
        [effectiveScrollPaddingEnd, listItems, listMeasurements, settings.stickyGroupHeaders]
    );

    const scrollToIndexSafely = useCallback(
        (index: number, align: Align) => {
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

    // Get scroll index for a file, adjusting to show top group header when navigating folders
    // This ensures the top group header (pinned or date) is visible when changing folders/tags
    const getSelectionIndex = useCallback(
        (filePath: string) => {
            const fileIndex = filePathToIndex.get(filePath);

            // File not found in index
            if (fileIndex === undefined || fileIndex === -1) {
                return -1;
            }

            let headerIndexBefore = -1;
            for (let listIndex = fileIndex - 1; listIndex >= 0; listIndex -= 1) {
                const item = listItems[listIndex];
                if (item?.type === ListPaneItemType.HEADER_SPACER) {
                    continue;
                }
                if (item?.type === ListPaneItemType.HEADER) {
                    headerIndexBefore = listIndex;
                }
                break;
            }

            if (headerIndexBefore === -1) {
                return fileIndex;
            }

            // Special case: scroll to header for the very first file to show context
            // Index 0 is TOP_SPACER, Index 1 is first header.
            const isFirstFile = headerIndexBefore === 1;
            if (isFirstFile) {
                return headerIndexBefore;
            }

            // For all other files with headers, scroll directly to the file
            return fileIndex;
        },
        [filePathToIndex, listItems]
    );

    /**
     * Increment indexVersion when list structure changes.
     * Critical for ensuring scrolls execute after list rebuilds.
     */
    useLayoutEffect(() => {
        const previousMap = prevIndexMapObjRef.current;
        const mappingChanged = previousMap === null || !areFilePathIndexMapsEqual(previousMap, filePathToIndex);

        if (mappingChanged) {
            prevIndexMapSizeRef.current = filePathToIndex.size;
            prevIndexMapObjRef.current = filePathToIndex;
            indexVersionRef.current = indexVersionRef.current + 1;
            return;
        }

        if (prevIndexMapSizeRef.current !== filePathToIndex.size || prevIndexMapObjRef.current !== filePathToIndex) {
            prevIndexMapSizeRef.current = filePathToIndex.size;
            prevIndexMapObjRef.current = filePathToIndex;
        }
    }, [filePathToIndex, filePathToIndex.size]);

    /**
     * Priority-based scroll queue management.
     * Higher priority scrolls override lower priority ones.
     *
     * Priority order (lowest to highest):
     * 0. top - Scroll to top of list
     * 1. list-structure-change - Settings/layout changes within current context
     * 2. visibility-change - Mobile drawer opened
     * 3. folder-navigation - User changed folders
     * 4. reveal - Show active file command
     */
    const clearPending = useCallback(() => {
        // Drop any stale pending request so new context-specific scrolls can be queued
        if (pendingScrollRef.current) {
            pendingScrollRef.current = null;
            setPendingScrollVersion(v => v + 1);
        }
    }, []);

    const setPending = useCallback((next: PendingScroll) => {
        const current = pendingScrollRef.current;
        if (!current) {
            pendingScrollRef.current = next;
            setPendingScrollVersion(v => v + 1);
            return;
        }

        const nextRank = rankListPending(next);
        const currentRank = rankListPending(current);

        if (nextRank >= currentRank) {
            pendingScrollRef.current = next;
            setPendingScrollVersion(v => v + 1);
        }
    }, []);

    const executePendingScroll = useCallback(
        (pending: PendingScroll): boolean => {
            if (!rowVirtualizer || !isScrollContainerReady) {
                return false;
            }

            // Version gate: Wait for list rebuild if required
            const effectiveMin = pending.minIndexVersion ?? indexVersionRef.current;
            if (indexVersionRef.current < effectiveMin) {
                return false;
            }

            if (pending.type === 'file') {
                const isStructuralChange = pending.reason === 'list-structure-change';

                if (!revealFileOnListChanges && isStructuralChange) {
                    return true;
                }

                if (isPendingFileScrollStale(pending, selectedFilePathRef.current)) {
                    return true;
                }

                const index = getSelectionIndex(pending.filePath);
                if (index < 0) {
                    // Keep pending until file appears in index
                    return false;
                }

                let alignment: Align = getListAlign(pending.reason);
                if (pending.reason === 'reveal' && selectionState.revealSource === 'startup') {
                    alignment = 'center';
                }
                scrollToIndexSafely(index, alignment);

                if (isStructuralChange) {
                    // Stabilization mechanism: Handle rapid consecutive rebuilds
                    const usedIndex = index;
                    const usedPath = pending.filePath;
                    window.requestAnimationFrame(() => {
                        const newIndex = usedPath ? getSelectionIndex(usedPath) : -1;
                        if (usedPath && newIndex >= 0 && newIndex !== usedIndex && revealFileOnListChanges) {
                            setPending({
                                type: 'file',
                                filePath: usedPath,
                                reason: 'list-structure-change',
                                minIndexVersion: indexVersionRef.current
                            });
                        }
                    });
                }

                return true;
            }

            rowVirtualizer.scrollToOffset(0, { align: 'start', behavior: 'auto' });
            return true;
        },
        [
            getSelectionIndex,
            isScrollContainerReady,
            revealFileOnListChanges,
            rowVirtualizer,
            scrollToIndexSafely,
            selectionState.revealSource,
            setPending
        ]
    );

    const requestPendingScroll = useCallback(
        (pending: PendingScroll) => {
            const queued = pendingScrollRef.current;
            if (queued && rankListPending(queued) > rankListPending(pending)) {
                if (executePendingScroll(queued)) {
                    pendingScrollRef.current = null;
                }
                return;
            }

            if (executePendingScroll(pending)) {
                if (queued) {
                    pendingScrollRef.current = null;
                }
                return;
            }

            setPending(pending);
        },
        [executePendingScroll, setPending]
    );

    /**
     * Process pending scrolls when conditions are met.
     * Central execution point for all scroll operations.
     *
     * Execution requirements:
     * 1. List must be visible
     * 2. Virtualizer must be ready
     * 3. indexVersion must meet minimum requirement
     *
     * Alignment policy:
     * - folder-navigation: center on mobile, auto on desktop
     * - visibility-change: auto (minimal movement)
     * - reveal: auto (show if not visible)
     * - list-structure-change: auto (maintain position)
     * - list-reorder: auto (maintain selection visibility)
     */
    useLayoutEffect(() => {
        if (!rowVirtualizer || !pendingScrollRef.current || !isScrollContainerReady) {
            return;
        }

        const pending = pendingScrollRef.current;
        if (executePendingScroll(pending)) {
            pendingScrollRef.current = null;
        }
    }, [executePendingScroll, rowVirtualizer, isScrollContainerReady, pendingScrollVersion, selectedFilePath]);

    /**
     * Subscribe to database content changes and refresh virtualizer size estimates when needed.
     * Handles preview text, feature images, tags, properties, and word count changes.
     */
    useEffect(() => {
        if (!enabled || !rowVirtualizer) return;

        const db = getDB();
        const remeasureScheduler = remeasureSchedulerRef.current;
        const unsubscribe = db.onContentChange(changes => {
            const needsRemeasure = changes.some(change => {
                return filePathToIndex.has(change.path) && isListRowHeightAffectingContentChange(change, rowSizingConfig);
            });

            if (needsRemeasure) {
                remeasureScheduler?.schedule();
            }
        });

        return () => {
            unsubscribe();
            remeasureScheduler?.cancel();
        };
    }, [enabled, filePathToIndex, getDB, rowSizingConfig, rowVirtualizer]);

    /**
     * Listen for mobile drawer visibility events.
     * Ensures selected file is visible when drawer opens.
     * SCROLL_MOBILE_VISIBILITY: Sets pending scroll with 'visibility-change' reason
     */
    useEffect(() => {
        if (!enabled || !isMobile) return;

        const handleVisible = () => {
            // If we have a selected file, set a pending scroll
            // This works regardless of whether auto-reveal has run yet
            if (selectedFile && rowVirtualizer) {
                setPending({
                    type: 'file',
                    filePath: selectedFile.path,
                    reason: 'visibility-change',
                    minIndexVersion: indexVersionRef.current
                });
            }
        };

        window.addEventListener('notebook-navigator-visible', handleVisible);
        return () => window.removeEventListener('notebook-navigator-visible', handleVisible);
    }, [enabled, isMobile, selectedFile, rowVirtualizer, filePathToIndex, setPending]);

    /**
     * Refresh all item size estimates when height-affecting settings change.
     * Includes date display, preview settings, feature images, etc.
     */
    useEffect(() => {
        if (!enabled || !rowVirtualizer) return;

        rowVirtualizer.measure();
    }, [enabled, listLayoutSignature, rowVirtualizer]);

    /**
     * Refresh size estimates when storage becomes ready after cold boot.
     * Ensures estimated heights are correct once preview data is available.
     */
    useLayoutEffect(() => {
        if (enabled && isStorageReady && rowVirtualizer) {
            rowVirtualizer.measure();
        }
    }, [enabled, isStorageReady, rowVirtualizer]);

    /**
     * Handle scrolling when list configuration changes (descendants toggle, appearance, grouping, or sort).
     * Maintains scroll position on the selected file.
     * Effect includes all dependencies but only scrolls when config actually changes.
     */
    // Calculate effective sort order based on current selection and custom overrides.
    const selectedSortOverride = getListSortOverrideForSelection(
        settings,
        selectionState.selectionType,
        selectedFolder,
        selectedTag,
        selectedProperty
    );
    const effectiveSortSpec = useMemo(() => resolveListSort(settings, selectedSortOverride), [settings, selectedSortOverride]);
    const effectiveSort = effectiveSortSpec.option;
    const scrollPreservationSignature = useMemo(
        () =>
            getScrollPreservationSignature({
                includeDescendantNotes,
                listLayoutSignature,
                groupBy: folderSettings.groupBy,
                noteGrouping: settings.noteGrouping,
                stickyGroupHeaders: settings.stickyGroupHeaders,
                effectiveSort,
                propertySortKey: effectiveSortSpec.propertyKey,
                propertySortSecondary: effectiveSortSpec.propertySortSecondary
            }),
        [
            includeDescendantNotes,
            listLayoutSignature,
            folderSettings.groupBy,
            settings.noteGrouping,
            settings.stickyGroupHeaders,
            effectiveSort,
            effectiveSortSpec.propertyKey,
            effectiveSortSpec.propertySortSecondary
        ]
    );
    useLayoutEffect(() => {
        if (!rowVirtualizer || !isScrollContainerReady) {
            return;
        }

        const previousConfig = prevScrollPreservationConfigRef.current;
        if (previousConfig === null) {
            prevScrollPreservationConfigRef.current = {
                signature: scrollPreservationSignature,
                includeDescendantNotes
            };
            return;
        }

        // Check if config actually changed
        if (previousConfig.signature === scrollPreservationSignature) {
            return; // No config change, don't scroll
        }

        // Detect descendants toggle for special handling
        const wasShowingDescendants = previousConfig.includeDescendantNotes;
        const nowShowingDescendants = includeDescendantNotes;

        // Update the ref
        prevScrollPreservationConfigRef.current = {
            signature: scrollPreservationSignature,
            includeDescendantNotes
        };

        // Layout-only changes can keep the same path/index map, so scroll against the current version.
        if (revealFileOnListChanges && selectedFile) {
            requestPendingScroll({
                type: 'file',
                filePath: selectedFile.path,
                reason: 'list-structure-change',
                minIndexVersion: indexVersionRef.current
            });
        } else if (wasShowingDescendants && !nowShowingDescendants) {
            // Special case: When disabling descendants and no file selected, scroll to top
            requestPendingScroll({
                type: 'top',
                reason: 'list-structure-change',
                minIndexVersion: indexVersionRef.current
            });
        }
    }, [
        isScrollContainerReady,
        rowVirtualizer,
        selectedFile,
        includeDescendantNotes,
        revealFileOnListChanges,
        scrollPreservationSignature,
        requestPendingScroll
    ]);

    /**
     * Preserve scroll when the list index changes within the same context (implicit reorders like pin/unpin).
     * Uses indexVersion changes keyed by current folder/tag context. Avoids duplicate triggers on navigation.
     */
    useLayoutEffect(() => {
        if (!rowVirtualizer || !isScrollContainerReady) return;

        const propertySelectionKey = selectedProperty ?? '';
        const contextKey = `${selectedFolder?.path || ''}_${selectedTag || ''}_${propertySelectionKey}`;
        const prev = contextIndexVersionRef.current;
        const groupCollapseStateChanged = prevGroupCollapseStateSignatureRef.current !== groupCollapseStateSignature;
        prevGroupCollapseStateSignatureRef.current = groupCollapseStateSignature;

        // Initialize on first run or when context changes
        if (!prev || prev.key !== contextKey) {
            contextIndexVersionRef.current = { key: contextKey, version: indexVersionRef.current };
            return;
        }

        // Same context: if index version advanced, maintain position on selected file
        if (indexVersionRef.current > prev.version) {
            contextIndexVersionRef.current = { key: contextKey, version: indexVersionRef.current };
            if (groupCollapseStateChanged) {
                return;
            }

            // Only request a file scroll if the selected file exists in the current index.
            const inList = !!(selectedFile && filePathToIndex.has(selectedFile.path));
            if (revealFileOnListChanges && inList && selectedFile) {
                requestPendingScroll({
                    type: 'file',
                    filePath: selectedFile.path,
                    reason: 'list-structure-change',
                    minIndexVersion: indexVersionRef.current
                });
            }
        }
    }, [
        rowVirtualizer,
        isScrollContainerReady,
        selectedFolder?.path,
        selectedTag,
        selectedProperty,
        groupCollapseStateSignature,
        filePathToIndex,
        filePathToIndex.size,
        selectedFile,
        requestPendingScroll,
        revealFileOnListChanges
    ]);

    /**
     * Handle scrolling when navigating between folders/tags.
     * Supports both visible and hidden panes (for single-pane mode).
     * Manages folder navigation flags and list context changes.
     * SCROLL_FOLDER_NAVIGATION: Sets pending scroll with 'folder-navigation' reason
     */
    useLayoutEffect(() => {
        if (!enabled || !rowVirtualizer) {
            return;
        }

        // Create a key representing the current list context
        const propertySelectionKey = selectedProperty ?? '';
        const currentListKey = `${selectedFolder?.path || ''}_${selectedTag || ''}_${propertySelectionKey}`;
        const listChanged = prevListKeyRef.current !== currentListKey;

        if (listChanged) {
            // Context changed while a pending scroll might still target the prior folder/tag
            clearPending();
        }

        // Check if this is a folder navigation where we need to scroll to maintain the selected file
        const isFolderNavigation = selectionState.isFolderNavigation;

        // Determine if we should scroll
        // We scroll in these cases:
        // 1. User navigated to a different folder/tag (isFolderNavigation = true)
        // 2. List context changed (folder/tag change)
        const shouldScroll = listChanged || (isFolderNavigation && hasSelectedFile);

        if (!shouldScroll) {
            if (isFolderNavigation) {
                selectionDispatch({ type: 'SET_FOLDER_NAVIGATION', isFolderNavigation: false });
            }
            return;
        }

        // On initial load, wait for list to be populated
        if (listChanged && listItems.length === 0) {
            return;
        }

        const pendingScroll: PendingScroll = selectedFile
            ? {
                  type: 'file',
                  filePath: selectedFile.path,
                  reason: 'folder-navigation',
                  minIndexVersion: indexVersionRef.current
              }
            : { type: 'top', reason: 'folder-navigation', minIndexVersion: indexVersionRef.current };

        // For single-pane mode, always set pending scroll even if not visible
        // It will be processed when the pane becomes visible
        if (!isScrollContainerReady && (isFolderNavigation || listChanged)) {
            // Update the ref
            if (listChanged) {
                prevListKeyRef.current = currentListKey;
            }

            // Clear the folder navigation flag
            if (isFolderNavigation) {
                selectionDispatch({ type: 'SET_FOLDER_NAVIGATION', isFolderNavigation: false });
            }

            requestPendingScroll(pendingScroll);
            return;
        }

        // For folder navigation when visible, perform scroll immediately without RAF
        // RAF was causing issues with component re-renders cancelling the scroll
        if (isFolderNavigation && listItems.length > 0 && isScrollContainerReady) {
            // Update the ref
            if (listChanged) {
                prevListKeyRef.current = currentListKey;
            }

            // Clear the folder navigation flag
            selectionDispatch({ type: 'SET_FOLDER_NAVIGATION', isFolderNavigation: false });

            requestPendingScroll(pendingScroll);
        } else {
            // For other visible context changes, try the same pre-paint scroll path.
            // If the target index is not ready yet, leave it queued for a later pass.
            if (listChanged) {
                prevListKeyRef.current = currentListKey;
            }

            requestPendingScroll(pendingScroll);
        }
    }, [
        isScrollContainerReady,
        enabled,
        rowVirtualizer,
        selectedFolder?.path,
        selectedTag,
        selectedProperty,
        selectedFile,
        selectionState.isFolderNavigation,
        selectionDispatch,
        filePathToIndex.size,
        listItems.length,
        clearPending,
        requestPendingScroll,
        hasSelectedFile
    ]);

    /**
     * Handle reveal operations (e.g., reveal active file command).
     * Uses pending scroll for proper timing and size estimates.
     * SCROLL_REVEAL_OPERATION: Sets pending scroll with 'reveal' reason
     */
    useLayoutEffect(() => {
        if (selectionState.isRevealOperation && selectedFile && isScrollContainerReady) {
            // Reveal scrolls run immediately when the list is ready, otherwise they stay queued.
            requestPendingScroll({
                type: 'file',
                filePath: selectedFile.path,
                reason: 'reveal',
                minIndexVersion: indexVersionRef.current
            });
            // Reveal behaves like a one-shot event; clear the flag once the list pane has accepted the scroll.
            selectionDispatch({ type: 'CLEAR_REVEAL_OPERATION' });
        }
    }, [selectionState.isRevealOperation, selectedFile, isScrollContainerReady, selectionDispatch, filePathToIndex, requestPendingScroll]);

    /**
     * Handle search query changes.
     * Scrolls to top when search filters change and selected file is not in results.
     * SCROLL_SEARCH: Sets pending scroll to top when appropriate
     */
    useLayoutEffect(() => {
        // Only handle when search is active (searchQuery is defined)
        if (searchQuery === undefined) {
            prevSearchQueryRef.current = searchQuery;
            return;
        }

        if (!selectedFile) {
            prevSearchQueryRef.current = searchQuery;
            return;
        }

        if (!isScrollContainerReady || !rowVirtualizer) {
            // Defer handling until visible/ready without consuming the query change
            return;
        }

        // Check if selected file exists in the filtered list (based on current index)
        const selectedFileInList = filePathToIndex.has(selectedFile.path);

        const queryChanged = prevSearchQueryRef.current !== searchQuery;
        prevSearchQueryRef.current = searchQuery;

        // Scroll to top when search filters remove the selected file, regardless of whether
        // this happened immediately on query change or after the list rebuilt
        // Check if scroll-to-top should be suppressed (used for mobile search shortcuts)
        const suppressTopScroll = suppressSearchTopScrollRef?.current ?? false;

        if (!selectedFileInList && listItems.length > 0) {
            // Skip scroll-to-top if suppressed (mobile shortcut activation)
            if (suppressTopScroll && suppressSearchTopScrollRef) {
                suppressSearchTopScrollRef.current = false;
                return;
            }
            requestPendingScroll({ type: 'top', reason: 'list-structure-change', minIndexVersion: indexVersionRef.current });
            return;
        }

        // Reset suppression flag after checking
        if (suppressTopScroll && suppressSearchTopScrollRef) {
            suppressSearchTopScrollRef.current = false;
        }

        // If the selected file remains in the list, folder-navigation effects handle its visibility
        // No action needed here; keep for completeness when queryChanged
        if (queryChanged) {
            // No-op
        }
    }, [
        searchQuery,
        selectedFile,
        filePathToIndex,
        isScrollContainerReady,
        rowVirtualizer,
        listItems.length,
        requestPendingScroll,
        suppressSearchTopScrollRef
    ]);

    return {
        rowVirtualizer,
        scrollContainerRef,
        scrollContainerRefCallback,
        handleScrollToTop,
        scrollToIndexSafely
    };
}
