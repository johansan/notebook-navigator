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

import type { TFile } from 'obsidian';
import { ItemType, ListPaneItemType, type NavigationItemType } from '../types';
import type { FeatureImageStatus, FileData } from '../storage/IndexedDBStorage';
import { type FeatureImageSizeSetting } from '../settings/types';
import type { ListPaneItem } from '../types/virtualization';
import { isImageFile } from './fileTypeUtils';
import {
    buildPropertyKeyNodeId,
    buildPropertyValueNodeId,
    isPropertyKeyOnlyValuePath,
    normalizePropertyNodeId,
    normalizePropertyTreeValuePath,
    parsePropertyNodeId
} from './propertyTree';
import { casefold } from './recordUtils';
import type { HiddenTagVisibility } from './tagPrefixMatcher';
import { normalizeTagPath } from './tagUtils';
import { shouldShowManualSortGroupHeaderProgress } from './manualSort';

/**
 * Layout measurements used by the list pane virtualizer.
 * These values mirror the CSS variables defined in styles.css.
 */
export interface ListPaneMeasurements {
    basePadding: number;
    titleLineHeight: number;
    singleTextLineHeight: number;
    multilineTextLineHeight: number;
    tagRowHeight: number;
    featureImageMinHeight: number;
    groupHeaderHeight: number;
    manualSortGoalHeaderHeight: number;
    groupHeaderSpacerBefore: number;
    fileIconSize: number;
    topSpacer: number;
    bottomSpacer: number;
}

export interface FeatureImageDisplayMeasurements {
    listMaxSize: number;
}

const FEATURE_IMAGE_DISPLAY_MEASUREMENTS: Readonly<Record<FeatureImageSizeSetting, FeatureImageDisplayMeasurements>> = Object.freeze({
    '64': { listMaxSize: 64 },
    '96': { listMaxSize: 96 },
    '128': { listMaxSize: 128 }
});

const DESKTOP_MEASUREMENTS: ListPaneMeasurements = Object.freeze({
    basePadding: 16, // 8px padding on each side
    titleLineHeight: 20,
    singleTextLineHeight: 19,
    multilineTextLineHeight: 18,
    tagRowHeight: 26, // 22px row + 4px gap
    featureImageMinHeight: 42,
    groupHeaderHeight: 27,
    manualSortGoalHeaderHeight: 32,
    groupHeaderSpacerBefore: 20,
    fileIconSize: 16,
    topSpacer: 8,
    bottomSpacer: 20
});

const MOBILE_MEASUREMENTS: ListPaneMeasurements = Object.freeze({
    basePadding: 24, // 12px padding on each side
    titleLineHeight: 21,
    singleTextLineHeight: 20,
    multilineTextLineHeight: 19,
    tagRowHeight: 26, // 22px row + 4px gap
    featureImageMinHeight: 42,
    groupHeaderHeight: 35, // 27px + 8px mobile increment
    manualSortGoalHeaderHeight: 40, // 35px header row + 5px below progress
    groupHeaderSpacerBefore: 20,
    fileIconSize: 20, // 16px + 4px mobile increment
    topSpacer: 8,
    bottomSpacer: 20
});

/**
 * Returns the static measurement set for the current platform.
 */
export function getFeatureImageDisplayMeasurements(featureImageSize: FeatureImageSizeSetting): FeatureImageDisplayMeasurements {
    return FEATURE_IMAGE_DISPLAY_MEASUREMENTS[featureImageSize];
}

export function getListPaneMeasurements(isMobile: boolean): ListPaneMeasurements {
    return isMobile ? MOBILE_MEASUREMENTS : DESKTOP_MEASUREMENTS;
}

export function getListPaneHeaderHeight(item: ListPaneItem | undefined, measurements: ListPaneMeasurements): number {
    if (
        item?.type === ListPaneItemType.HEADER &&
        item.headerKind === 'manual-sort-custom' &&
        item.manualSortHeader !== undefined &&
        shouldShowManualSortGroupHeaderProgress(item.manualSortHeader, item.manualSortHeaderTargetWordCount)
    ) {
        return measurements.manualSortGoalHeaderHeight;
    }

    return measurements.groupHeaderHeight;
}

export function getSelectedTagPillToHide({
    selectionType,
    selectedTag,
    showSelectedNavigationPills
}: {
    selectionType: NavigationItemType | null | undefined;
    selectedTag: string | null | undefined;
    showSelectedNavigationPills: boolean;
}): string | null {
    if (showSelectedNavigationPills || selectionType !== ItemType.TAG) {
        return null;
    }

    return normalizeTagPath(selectedTag);
}

export function getSelectedPropertyValuePillToHide({
    selectionType,
    selectedProperty,
    showSelectedNavigationPills
}: {
    selectionType: NavigationItemType | null | undefined;
    selectedProperty: string | null | undefined;
    showSelectedNavigationPills: boolean;
}): string | null {
    if (showSelectedNavigationPills || selectionType !== ItemType.PROPERTY || !selectedProperty) {
        return null;
    }

    const parsedNode = parsePropertyNodeId(selectedProperty);
    if (!parsedNode?.valuePath) {
        return null;
    }

    return normalizePropertyNodeId(selectedProperty) ?? selectedProperty;
}

export function hasVisibleTagPills({
    tags,
    hiddenTagVisibility,
    selectedTagToHide
}: {
    tags: readonly string[];
    hiddenTagVisibility?: HiddenTagVisibility | null;
    selectedTagToHide?: string | null;
}): boolean {
    for (const tag of tags) {
        if (hiddenTagVisibility?.shouldFilterHiddenTags && !hiddenTagVisibility.isTagVisible(tag)) {
            continue;
        }

        if (selectedTagToHide && normalizeTagPath(tag) === selectedTagToHide) {
            continue;
        }

        return true;
    }

    return false;
}

type FrontmatterPropertyEntry = NonNullable<FileData['properties']>[number];
type FrontmatterPropertyEntries = NonNullable<FileData['properties']>;

export interface VisibleFrontmatterPropertyEntry {
    entry: FrontmatterPropertyEntry;
    trimmedFieldKey: string;
    rawValue: string;
    normalizedValuePath: string;
    isKeyOnlyValue: boolean;
    propertyNodeId?: string;
}

export function forEachVisibleFrontmatterProperty({
    properties,
    visiblePropertyKeys,
    hiddenPropertyValueNodeId,
    visitor
}: {
    properties: FileData['properties'] | undefined;
    visiblePropertyKeys?: ReadonlySet<string>;
    hiddenPropertyValueNodeId?: string | null;
    visitor: (property: VisibleFrontmatterPropertyEntry) => void | false;
}): void {
    if (!properties || properties.length === 0) {
        return;
    }

    for (const entry of properties) {
        const normalizedFieldKey = casefold(entry.fieldKey);
        if (visiblePropertyKeys && !visiblePropertyKeys.has(normalizedFieldKey)) {
            continue;
        }

        const rawValue = entry.value;
        if (rawValue.trim().length === 0) {
            continue;
        }

        const normalizedValuePath = normalizePropertyTreeValuePath(rawValue);
        const isKeyOnlyValue = entry.valueKind === 'boolean' ? false : isPropertyKeyOnlyValuePath(normalizedValuePath, entry.valueKind);
        if (entry.valueKind === undefined && isKeyOnlyValue) {
            continue;
        }

        const trimmedFieldKey = entry.fieldKey.trim();
        const rawPropertyNodeId =
            trimmedFieldKey.length === 0
                ? undefined
                : isKeyOnlyValue
                  ? buildPropertyKeyNodeId(trimmedFieldKey)
                  : buildPropertyValueNodeId(trimmedFieldKey, normalizedValuePath);
        const propertyNodeId = rawPropertyNodeId ? (normalizePropertyNodeId(rawPropertyNodeId) ?? rawPropertyNodeId) : undefined;

        if (hiddenPropertyValueNodeId && propertyNodeId === hiddenPropertyValueNodeId) {
            continue;
        }

        const result = visitor({
            entry,
            trimmedFieldKey,
            rawValue,
            normalizedValuePath,
            isKeyOnlyValue,
            propertyNodeId
        });
        if (result === false) {
            return;
        }
    }
}

export function isListPaneCompactMode({
    showDate,
    showPreview,
    showImage
}: {
    showDate: boolean;
    showPreview: boolean;
    showImage: boolean;
}): boolean {
    return !showDate && !showPreview && !showImage;
}

export function getTagPillDisplayName(tag: string, showFileTagAncestors: boolean): string {
    if (showFileTagAncestors) {
        return tag;
    }

    const segments = tag.split('/').filter(segment => segment.length > 0);
    if (segments.length === 0) {
        return tag;
    }

    return segments[segments.length - 1];
}

export interface FileItemLayoutState {
    isCompactMode: boolean;
    shouldShowMultilinePreview: boolean;
    shouldReplaceEmptyPreviewWithPills: boolean;
    shouldShowDateForItem: boolean;
    isPinnedImageRow: boolean;
}

export function getFileItemLayoutState({
    showDate,
    showPreview,
    showImage,
    isPinned,
    hasPreviewContent,
    showFeatureImageArea,
    showExtensionBadgeThumbnail = false,
    hasVisiblePillRows
}: {
    showDate: boolean;
    showPreview: boolean;
    showImage: boolean;
    isPinned: boolean;
    hasPreviewContent: boolean;
    showFeatureImageArea: boolean;
    showExtensionBadgeThumbnail?: boolean;
    hasVisiblePillRows: boolean;
}): FileItemLayoutState {
    const isCompactMode = isListPaneCompactMode({ showDate, showPreview, showImage });
    const hasImageTextArea = showFeatureImageArea && !showExtensionBadgeThumbnail;
    const isPinnedImageRow = isPinned && hasImageTextArea;
    const shouldReplaceEmptyPreviewWithPills = !hasPreviewContent && hasVisiblePillRows;
    const shouldShowDateForItem = showDate && !isPinned;
    const shouldShowMultilinePreview = showPreview && !shouldReplaceEmptyPreviewWithPills && (hasPreviewContent || hasImageTextArea);

    return {
        isCompactMode,
        shouldShowMultilinePreview,
        shouldReplaceEmptyPreviewWithPills,
        shouldShowDateForItem,
        isPinnedImageRow
    };
}

export function calculateNormalListFileRowHeightEstimate({
    heights,
    titleRows,
    previewRows,
    layoutState,
    showFeatureImageArea,
    showExtensionBadgeThumbnail,
    showParentFolderLine,
    visiblePillRowCount
}: {
    heights: ListPaneMeasurements;
    titleRows: number;
    previewRows: number;
    layoutState: FileItemLayoutState;
    showFeatureImageArea: boolean;
    showExtensionBadgeThumbnail: boolean;
    showParentFolderLine: boolean;
    visiblePillRowCount: number;
}): number {
    const titleContentHeight = heights.titleLineHeight * titleRows;
    const pillRowCount = Math.max(0, visiblePillRowCount);
    const hasPillRows = pillRowCount > 0;
    const hasPreviewSlot = layoutState.shouldShowMultilinePreview;
    const previewSlotHeight = hasPreviewSlot ? heights.multilineTextLineHeight * previewRows : 0;
    const metadataLineHeight = layoutState.shouldShowDateForItem || showParentFolderLine ? heights.singleTextLineHeight : 0;
    const singleTextLineCount = metadataLineHeight > 0 ? 1 : 0;
    const contentLineCount = singleTextLineCount + pillRowCount;
    const hasImageTextArea = showFeatureImageArea && !showExtensionBadgeThumbnail;
    const fillsPreviewSlotWithPills = layoutState.shouldReplaceEmptyPreviewWithPills && hasImageTextArea;
    const replacementPreviewSlotHeight = fillsPreviewSlotWithPills ? heights.multilineTextLineHeight * previewRows : 0;
    const canUseBaseHeight = !hasPreviewSlot && !hasImageTextArea;
    const applyFeatureImageFloor = (contentHeight: number): number =>
        showFeatureImageArea ? Math.max(contentHeight, heights.featureImageMinHeight) : contentHeight;

    if (canUseBaseHeight && contentLineCount === 0) {
        return heights.basePadding + applyFeatureImageFloor(titleContentHeight);
    }

    if (canUseBaseHeight && contentLineCount <= 1) {
        const contentLineHeight = Math.max(
            singleTextLineCount > 0 ? heights.singleTextLineHeight : 0,
            hasPillRows ? heights.tagRowHeight : 0
        );

        return heights.basePadding + applyFeatureImageFloor(titleContentHeight + contentLineHeight);
    }

    const reservedPreviewSlotHeight = Math.max(previewSlotHeight, replacementPreviewSlotHeight);
    const reserveImageMetadataLine = hasImageTextArea && !layoutState.isPinnedImageRow;
    const reservedMetadataLineHeight = reserveImageMetadataLine ? heights.singleTextLineHeight : metadataLineHeight;
    const reservedEmptyMetadataLineHeight = reserveImageMetadataLine && metadataLineHeight === 0 ? reservedMetadataLineHeight : 0;
    const richContentHeight = titleContentHeight + reservedPreviewSlotHeight + reservedMetadataLineHeight;
    const pillRowsHeight = heights.tagRowHeight * pillRowCount;
    const pillRowsReservedHeight = replacementPreviewSlotHeight + reservedEmptyMetadataLineHeight;
    const pillRowsExtraHeight = Math.max(0, pillRowsHeight - pillRowsReservedHeight);

    return heights.basePadding + applyFeatureImageFloor(richContentHeight + pillRowsExtraHeight);
}

export function shouldShowFileItemParentFolderLine({
    showParentFolder,
    isPinned,
    selectionType,
    includeDescendantNotes,
    parentFolder,
    fileParentPath
}: {
    showParentFolder: boolean;
    isPinned: boolean;
    selectionType: NavigationItemType | null | undefined;
    includeDescendantNotes: boolean;
    parentFolder: string | null | undefined;
    fileParentPath: string | null | undefined;
}): boolean {
    if (!showParentFolder || isPinned || !fileParentPath || fileParentPath === '/') {
        return false;
    }

    if (selectionType === 'tag') {
        return true;
    }

    return includeDescendantNotes && Boolean(parentFolder) && fileParentPath !== parentFolder;
}

/**
 * Shared feature image visibility logic for list pane rendering and sizing.
 */
export function shouldShowFeatureImageArea({
    showImage,
    file,
    featureImageStatus,
    hasFeatureImageUrl,
    showDrawingFeatureImage
}: {
    showImage: boolean;
    file: TFile | null;
    featureImageStatus?: FeatureImageStatus | null;
    hasFeatureImageUrl?: boolean;
    showDrawingFeatureImage?: boolean;
}): boolean {
    if (!showImage || !file) {
        return false;
    }

    if (hasFeatureImageUrl) {
        return true;
    }

    if (file.extension === 'canvas' || file.extension === 'base') {
        return true;
    }

    if (isImageFile(file)) {
        return true;
    }

    if (showDrawingFeatureImage) {
        return true;
    }

    return featureImageStatus === 'has';
}

export function shouldShowExtensionBadgeThumbnail({
    showFeatureImageArea,
    file,
    hasFeatureImageUrl,
    showDrawingMissingFeatureImage
}: {
    showFeatureImageArea: boolean;
    file: TFile | null;
    hasFeatureImageUrl?: boolean;
    showDrawingMissingFeatureImage?: boolean;
}): boolean {
    if (!showFeatureImageArea || !file || hasFeatureImageUrl) {
        return false;
    }

    if (showDrawingMissingFeatureImage) {
        return true;
    }

    return file.extension === 'canvas' || file.extension === 'base';
}

type VisibleFrontmatterPropertySummary = {
    hasVisiblePills: boolean;
    separateRowCount: number;
};

const EMPTY_VISIBLE_FRONTMATTER_PROPERTY_SUMMARY: VisibleFrontmatterPropertySummary = {
    hasVisiblePills: false,
    separateRowCount: 0
};

type VisibleFrontmatterPropertySummaryCache = {
    unfiltered: Map<string, VisibleFrontmatterPropertySummary>;
    filtered: WeakMap<ReadonlySet<string>, Map<string, VisibleFrontmatterPropertySummary>>;
};

const visibleFrontmatterPropertySummaryCache = new WeakMap<FrontmatterPropertyEntries, VisibleFrontmatterPropertySummaryCache>();

function getVisibleFrontmatterPropertySummary({
    properties,
    visiblePropertyKeys,
    hiddenPropertyValueNodeId
}: {
    properties: FileData['properties'] | undefined;
    visiblePropertyKeys?: ReadonlySet<string>;
    hiddenPropertyValueNodeId?: string | null;
}): VisibleFrontmatterPropertySummary {
    if (!properties || properties.length === 0) {
        return EMPTY_VISIBLE_FRONTMATTER_PROPERTY_SUMMARY;
    }

    let cacheContainer = visibleFrontmatterPropertySummaryCache.get(properties);
    if (!cacheContainer) {
        cacheContainer = {
            unfiltered: new Map<string, VisibleFrontmatterPropertySummary>(),
            filtered: new WeakMap<ReadonlySet<string>, Map<string, VisibleFrontmatterPropertySummary>>()
        };
        visibleFrontmatterPropertySummaryCache.set(properties, cacheContainer);
    }

    let cacheBucket: Map<string, VisibleFrontmatterPropertySummary>;
    if (!visiblePropertyKeys) {
        cacheBucket = cacheContainer.unfiltered;
    } else {
        const existingFilteredBucket = cacheContainer.filtered.get(visiblePropertyKeys);
        if (existingFilteredBucket) {
            cacheBucket = existingFilteredBucket;
        } else {
            cacheBucket = new Map<string, VisibleFrontmatterPropertySummary>();
            cacheContainer.filtered.set(visiblePropertyKeys, cacheBucket);
        }
    }

    const hiddenPropertyCacheKey = hiddenPropertyValueNodeId ?? '';
    const cachedSummary = cacheBucket.get(hiddenPropertyCacheKey);
    if (cachedSummary) {
        return cachedSummary;
    }

    let hasVisiblePills = false;
    let hasUnkeyedRow = false;
    const separateRows = new Set<string>();

    forEachVisibleFrontmatterProperty({
        properties,
        visiblePropertyKeys,
        hiddenPropertyValueNodeId,
        visitor: ({ trimmedFieldKey }) => {
            hasVisiblePills = true;

            if (trimmedFieldKey.length === 0) {
                hasUnkeyedRow = true;
                return;
            }

            separateRows.add(trimmedFieldKey);
        }
    });

    const summary = {
        hasVisiblePills,
        separateRowCount: separateRows.size + (hasUnkeyedRow ? 1 : 0)
    };
    cacheBucket.set(hiddenPropertyCacheKey, summary);
    return summary;
}

export function getPropertyRowCount({
    showWordCountProperty,
    showFileProperties,
    showPropertiesOnSeparateRows,
    showFilePropertiesInCompactMode,
    isCompactMode,
    file,
    wordCount,
    properties,
    visiblePropertyKeys,
    hiddenPropertyValueNodeId
}: {
    showWordCountProperty: boolean;
    showFileProperties: boolean;
    showPropertiesOnSeparateRows: boolean;
    showFilePropertiesInCompactMode: boolean;
    isCompactMode: boolean;
    file: TFile | null;
    wordCount: FileData['wordCount'] | undefined;
    properties: FileData['properties'] | undefined;
    visiblePropertyKeys?: ReadonlySet<string>;
    hiddenPropertyValueNodeId?: string | null;
}): number {
    // Computes the number of visual rows the property area will occupy.
    // This is used by the list pane virtualizer height estimator and must stay consistent with FileItem rendering.
    if (!file || file.extension !== 'md') {
        return 0;
    }

    if (isCompactMode && !showFilePropertiesInCompactMode) {
        return 0;
    }

    const wordCountEnabled = showWordCountProperty && typeof wordCount === 'number' && Number.isFinite(wordCount) && wordCount > 0;
    const propertySummary = showFileProperties
        ? getVisibleFrontmatterPropertySummary({
              properties,
              visiblePropertyKeys,
              hiddenPropertyValueNodeId
          })
        : EMPTY_VISIBLE_FRONTMATTER_PROPERTY_SUMMARY;

    if (!wordCountEnabled && !propertySummary.hasVisiblePills) {
        return 0;
    }

    const wordCountRowCount = wordCountEnabled ? 1 : 0;

    let frontmatterPropertyRowCount = 0;
    if (!showPropertiesOnSeparateRows) {
        frontmatterPropertyRowCount = propertySummary.hasVisiblePills ? 1 : 0;
    } else if (propertySummary.hasVisiblePills) {
        frontmatterPropertyRowCount = propertySummary.separateRowCount;
    }

    if (frontmatterPropertyRowCount === 0) {
        return wordCountRowCount;
    }

    if (!showPropertiesOnSeparateRows) {
        return 1 + wordCountRowCount;
    }

    return frontmatterPropertyRowCount + wordCountRowCount;
}
