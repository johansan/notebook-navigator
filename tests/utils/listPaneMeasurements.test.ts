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

import { describe, expect, it } from 'vitest';
import {
    calculateNormalListFileRowHeightEstimate,
    getFileItemLayoutState,
    getListPaneMeasurements,
    getSelectedPropertyValuePillToHide,
    getSelectedTagPillToHide,
    hasVisibleTagPills,
    getPropertyRowCount,
    isListPaneCompactMode,
    shouldShowExtensionBadgeThumbnail,
    shouldShowFeatureImageArea,
    shouldShowFileItemParentFolderLine
} from '../../src/utils/listPaneMeasurements';
import { ItemType } from '../../src/types';
import { buildPropertyValueNodeId } from '../../src/utils/propertyTree';
import { createHiddenTagVisibility } from '../../src/utils/tagPrefixMatcher';
import { createTestTFile } from './createTestTFile';

describe('listPaneMeasurements layout helpers', () => {
    const desktopHeights = getListPaneMeasurements(false);

    it('detects compact mode from hidden date, preview, and image sections', () => {
        expect(
            isListPaneCompactMode({
                showDate: false,
                showPreview: false,
                showImage: false
            })
        ).toBe(true);

        expect(
            isListPaneCompactMode({
                showDate: true,
                showPreview: false,
                showImage: false
            })
        ).toBe(false);
    });

    it('keeps the multiline preview slot when the feature image area is visible', () => {
        expect(
            getFileItemLayoutState({
                showDate: true,
                showPreview: true,
                showImage: true,
                isPinned: false,
                hasPreviewContent: false,
                showFeatureImageArea: true,
                hasVisiblePillRows: false
            })
        ).toMatchObject({
            isCompactMode: false,
            shouldShowMultilinePreview: true,
            shouldReplaceEmptyPreviewWithPills: false,
            shouldShowDateForItem: true
        });
    });

    it('collapses empty preview space when pills are visible and no image is shown', () => {
        expect(
            getFileItemLayoutState({
                showDate: true,
                showPreview: true,
                showImage: false,
                isPinned: false,
                hasPreviewContent: false,
                showFeatureImageArea: false,
                hasVisiblePillRows: true
            })
        ).toMatchObject({
            shouldShowMultilinePreview: false,
            shouldReplaceEmptyPreviewWithPills: true,
            shouldShowDateForItem: true
        });
    });

    it('uses a title-only row height when normal rows render no content or image', () => {
        const layoutState = getFileItemLayoutState({
            showDate: false,
            showPreview: true,
            showImage: false,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: false,
            hasVisiblePillRows: false
        });

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 3,
                layoutState,
                showFeatureImageArea: false,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.titleLineHeight);
    });

    it('uses the thumbnail minimum row height for base and canvas extension badges without note content', () => {
        const layoutState = getFileItemLayoutState({
            showDate: false,
            showPreview: false,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            hasVisiblePillRows: false
        });

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 3,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: true,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.featureImageMinHeight);
    });

    it('does not reserve an empty preview slot for base and canvas extension badges', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            showExtensionBadgeThumbnail: true,
            hasVisiblePillRows: false
        });

        expect(layoutState.shouldShowMultilinePreview).toBe(false);
        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 1,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: true,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.featureImageMinHeight);
    });

    it('does not add a metadata line for multi-row base and canvas extension badge titles', () => {
        const layoutState = getFileItemLayoutState({
            showDate: false,
            showPreview: false,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            showExtensionBadgeThumbnail: true,
            hasVisiblePillRows: false
        });

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 3,
                previewRows: 3,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: true,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.titleLineHeight * 3);
    });

    it('sizes base and canvas extension badge rows from actual metadata and pill rows', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            showExtensionBadgeThumbnail: true,
            hasVisiblePillRows: true
        });

        expect(layoutState.shouldShowMultilinePreview).toBe(false);
        expect(layoutState.shouldReplaceEmptyPreviewWithPills).toBe(true);
        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 3,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: true,
                showParentFolderLine: false,
                visiblePillRowCount: 1
            })
        ).toBe(
            desktopHeights.basePadding + desktopHeights.titleLineHeight + desktopHeights.singleTextLineHeight + desktopHeights.tagRowHeight
        );
    });

    it('does not reserve a hidden metadata row for base and canvas extension badges', () => {
        const layoutState = getFileItemLayoutState({
            showDate: false,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            showExtensionBadgeThumbnail: true,
            hasVisiblePillRows: true
        });

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 3,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: true,
                showParentFolderLine: false,
                visiblePillRowCount: 2
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.titleLineHeight + desktopHeights.tagRowHeight * 2);
    });

    it('uses the thumbnail minimum row height for short feature image rows', () => {
        const layoutState = getFileItemLayoutState({
            showDate: false,
            showPreview: false,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            hasVisiblePillRows: false
        });

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 1,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.featureImageMinHeight);
    });

    it('uses a fixed rich row height for feature image rows', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            hasVisiblePillRows: false
        });

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 3,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(
            desktopHeights.basePadding +
                desktopHeights.titleLineHeight +
                desktopHeights.multilineTextLineHeight * 3 +
                desktopHeights.singleTextLineHeight
        );
    });

    it('uses configured preview rows without a feature image', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: true,
            showFeatureImageArea: false,
            hasVisiblePillRows: false
        });

        expect(layoutState.shouldShowMultilinePreview).toBe(true);
        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 2,
                layoutState,
                showFeatureImageArea: false,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(
            desktopHeights.basePadding +
                desktopHeights.titleLineHeight +
                desktopHeights.multilineTextLineHeight * 2 +
                desktopHeights.singleTextLineHeight
        );
    });

    it('uses one preview row for pinned items', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: false,
            isPinned: true,
            hasPreviewContent: true,
            showFeatureImageArea: false,
            hasVisiblePillRows: false
        });
        const pinnedPreviewRows = 1;

        expect(layoutState.shouldShowMultilinePreview).toBe(true);
        expect(layoutState.shouldShowDateForItem).toBe(false);
        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: pinnedPreviewRows,
                layoutState,
                showFeatureImageArea: false,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.titleLineHeight + desktopHeights.multilineTextLineHeight);
    });

    it('does not show the pinned preview slot when preview text is disabled', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: false,
            showImage: false,
            isPinned: true,
            hasPreviewContent: true,
            showFeatureImageArea: false,
            hasVisiblePillRows: false
        });

        expect(layoutState.shouldShowMultilinePreview).toBe(false);
        expect(layoutState.shouldShowDateForItem).toBe(false);
    });

    it('uses the thumbnail minimum row height for pinned feature image rows', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: true,
            hasPreviewContent: true,
            showFeatureImageArea: true,
            hasVisiblePillRows: false
        });
        const pinnedPreviewRows = 1;

        expect(layoutState.isPinnedImageRow).toBe(true);
        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: pinnedPreviewRows,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 0
            })
        ).toBe(desktopHeights.basePadding + desktopHeights.featureImageMinHeight);
    });

    it('keeps date and parent folder in one metadata row after preview rows', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: true,
            showFeatureImageArea: false,
            hasVisiblePillRows: false
        });

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 2,
                layoutState,
                showFeatureImageArea: false,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: true,
                visiblePillRowCount: 0
            })
        ).toBe(
            desktopHeights.basePadding +
                desktopHeights.titleLineHeight +
                desktopHeights.multilineTextLineHeight * 2 +
                desktopHeights.singleTextLineHeight
        );
    });

    it('keeps rich image rows at the same height when the date is hidden', () => {
        const commonParams = {
            heights: desktopHeights,
            titleRows: 1,
            previewRows: 2,
            showFeatureImageArea: true,
            showExtensionBadgeThumbnail: false,
            showParentFolderLine: false,
            visiblePillRowCount: 0
        };
        const layoutStateWithDate = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: true,
            showFeatureImageArea: true,
            hasVisiblePillRows: false
        });
        const layoutStateWithoutDate = getFileItemLayoutState({
            showDate: false,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: true,
            showFeatureImageArea: true,
            hasVisiblePillRows: false
        });

        const heightWithDate = calculateNormalListFileRowHeightEstimate({
            ...commonParams,
            layoutState: layoutStateWithDate
        });
        const heightWithoutDate = calculateNormalListFileRowHeightEstimate({
            ...commonParams,
            layoutState: layoutStateWithoutDate
        });

        expect(heightWithDate).toBe(
            desktopHeights.basePadding +
                desktopHeights.titleLineHeight +
                desktopHeights.multilineTextLineHeight * 2 +
                desktopHeights.singleTextLineHeight
        );
        expect(heightWithoutDate).toBe(heightWithDate);
    });

    it('lets pill rows use the hidden image metadata line when the date is hidden', () => {
        const layoutState = getFileItemLayoutState({
            showDate: false,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: true,
            showFeatureImageArea: true,
            hasVisiblePillRows: true
        });
        const richBaseHeight =
            desktopHeights.basePadding +
            desktopHeights.titleLineHeight +
            desktopHeights.multilineTextLineHeight * 2 +
            desktopHeights.singleTextLineHeight;

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 2,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 1
            })
        ).toBe(richBaseHeight + desktopHeights.tagRowHeight - desktopHeights.singleTextLineHeight);

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 2,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 3
            })
        ).toBe(richBaseHeight + desktopHeights.tagRowHeight * 3 - desktopHeights.singleTextLineHeight);
    });

    it('lets replacement pill rows use the rich preview slot before growing the row', () => {
        const layoutState = getFileItemLayoutState({
            showDate: true,
            showPreview: true,
            showImage: true,
            isPinned: false,
            hasPreviewContent: false,
            showFeatureImageArea: true,
            hasVisiblePillRows: true
        });
        const richBaseHeight =
            desktopHeights.basePadding +
            desktopHeights.titleLineHeight +
            desktopHeights.multilineTextLineHeight * 2 +
            desktopHeights.singleTextLineHeight;

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 2,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 1
            })
        ).toBe(richBaseHeight);

        expect(
            calculateNormalListFileRowHeightEstimate({
                heights: desktopHeights,
                titleRows: 1,
                previewRows: 2,
                layoutState,
                showFeatureImageArea: true,
                showExtensionBadgeThumbnail: false,
                showParentFolderLine: false,
                visiblePillRowCount: 3
            })
        ).toBe(richBaseHeight + desktopHeights.tagRowHeight * 3 - desktopHeights.multilineTextLineHeight * 2);
    });

    it('matches the parent folder line rules for tag and descendant views', () => {
        expect(
            shouldShowFileItemParentFolderLine({
                showParentFolder: true,
                isPinned: false,
                selectionType: 'tag',
                includeDescendantNotes: false,
                parentFolder: 'Projects',
                fileParentPath: 'Projects/Archive'
            })
        ).toBe(true);

        expect(
            shouldShowFileItemParentFolderLine({
                showParentFolder: true,
                isPinned: false,
                selectionType: 'folder',
                includeDescendantNotes: true,
                parentFolder: 'Projects',
                fileParentPath: 'Projects/Archive'
            })
        ).toBe(true);

        expect(
            shouldShowFileItemParentFolderLine({
                showParentFolder: true,
                isPinned: false,
                selectionType: 'folder',
                includeDescendantNotes: true,
                parentFolder: 'Projects',
                fileParentPath: 'Projects'
            })
        ).toBe(false);

        expect(
            shouldShowFileItemParentFolderLine({
                showParentFolder: true,
                isPinned: false,
                selectionType: 'tag',
                includeDescendantNotes: false,
                parentFolder: null,
                fileParentPath: '/'
            })
        ).toBe(false);
    });

    it('keeps feature image visibility aligned for image files and cached thumbnails', () => {
        const markdownFile = createTestTFile('Notes/Daily.md');
        const imageFile = createTestTFile('Images/Cover.png');
        const excalidrawFile = createTestTFile('Drawings/Sketch.excalidraw.md');
        const legacyExcalidrawFile = createTestTFile('Drawings/Sketch.excalidraw');

        expect(
            shouldShowFeatureImageArea({
                showImage: true,
                file: markdownFile,
                featureImageStatus: 'has'
            })
        ).toBe(true);

        expect(
            shouldShowFeatureImageArea({
                showImage: true,
                file: imageFile,
                featureImageStatus: 'unprocessed'
            })
        ).toBe(true);

        expect(
            shouldShowFeatureImageArea({
                showImage: true,
                file: excalidrawFile,
                featureImageStatus: 'none',
                showDrawingFeatureImage: true
            })
        ).toBe(true);

        expect(
            shouldShowFeatureImageArea({
                showImage: true,
                file: legacyExcalidrawFile,
                featureImageStatus: 'none',
                showDrawingFeatureImage: true
            })
        ).toBe(true);
    });

    it('only shows extension badge thumbnails when the feature image area renders', () => {
        const baseFile = createTestTFile('Data/Inventory.base');
        const excalidrawFile = createTestTFile('Drawings/Sketch.excalidraw.md');

        expect(
            shouldShowExtensionBadgeThumbnail({
                showFeatureImageArea: false,
                file: baseFile
            })
        ).toBe(false);

        expect(
            shouldShowExtensionBadgeThumbnail({
                showFeatureImageArea: true,
                file: baseFile
            })
        ).toBe(true);

        expect(
            shouldShowExtensionBadgeThumbnail({
                showFeatureImageArea: true,
                file: baseFile,
                hasFeatureImageUrl: true
            })
        ).toBe(false);

        expect(
            shouldShowExtensionBadgeThumbnail({
                showFeatureImageArea: true,
                file: excalidrawFile,
                showDrawingMissingFeatureImage: true
            })
        ).toBe(true);
    });

    it('counts numeric frontmatter properties as visible property rows', () => {
        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file: createTestTFile('Notes/Numbers.md'),
                wordCount: null,
                properties: [{ fieldKey: 'rating', value: '4.5', valueKind: 'number' }],
                visiblePropertyKeys: new Set<string>(['rating'])
            })
        ).toBe(1);
    });

    it('counts boolean frontmatter properties as visible property rows', () => {
        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file: createTestTFile('Notes/Flags.md'),
                wordCount: null,
                properties: [{ fieldKey: 'flag', value: 'true', valueKind: 'boolean' }],
                visiblePropertyKeys: new Set<string>(['flag'])
            })
        ).toBe(1);
    });

    it('counts frontmatter property rows when separate rows are enabled', () => {
        const file = createTestTFile('Notes/Properties.md');
        const properties = [
            { fieldKey: 'topic', value: 'alpha', valueKind: 'string' as const },
            { fieldKey: 'topic', value: 'beta', valueKind: 'string' as const },
            { fieldKey: 'priority', value: 'high', valueKind: 'string' as const }
        ];

        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file,
                wordCount: null,
                properties,
                visiblePropertyKeys: new Set<string>(['topic', 'priority'])
            })
        ).toBe(1);

        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: true,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file,
                wordCount: null,
                properties,
                visiblePropertyKeys: new Set<string>(['topic', 'priority'])
            })
        ).toBe(2);
    });

    it('hides the selected tag from tag-row visibility checks', () => {
        const selectedTagToHide = getSelectedTagPillToHide({
            selectionType: ItemType.TAG,
            selectedTag: 'ai',
            showSelectedNavigationPills: false
        });
        const hiddenTagVisibility = createHiddenTagVisibility([], false);

        expect(
            hasVisibleTagPills({
                tags: ['ai'],
                hiddenTagVisibility,
                selectedTagToHide
            })
        ).toBe(false);

        expect(
            hasVisibleTagPills({
                tags: ['ai', 'ml'],
                hiddenTagVisibility,
                selectedTagToHide
            })
        ).toBe(true);
    });

    it('reduces property row counts when the selected property value pill is hidden', () => {
        const selectedPropertyValueNodeIdToHide = getSelectedPropertyValuePillToHide({
            selectionType: ItemType.PROPERTY,
            selectedProperty: buildPropertyValueNodeId('status', 'done'),
            showSelectedNavigationPills: false
        });

        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file: createTestTFile('Notes/Status.md'),
                wordCount: null,
                properties: [{ fieldKey: 'status', value: 'done', valueKind: 'string' }],
                visiblePropertyKeys: new Set<string>(['status']),
                hiddenPropertyValueNodeId: selectedPropertyValueNodeIdToHide
            })
        ).toBe(0);

        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file: createTestTFile('Notes/Status.md'),
                wordCount: null,
                properties: [
                    { fieldKey: 'status', value: 'done', valueKind: 'string' },
                    { fieldKey: 'priority', value: 'high', valueKind: 'string' }
                ],
                visiblePropertyKeys: new Set<string>(['status', 'priority']),
                hiddenPropertyValueNodeId: selectedPropertyValueNodeIdToHide
            })
        ).toBe(1);
    });

    it('keeps property row counts correct across repeated calls with different filters', () => {
        const properties = [
            { fieldKey: 'status', value: 'done', valueKind: 'string' as const },
            { fieldKey: 'priority', value: 'high', valueKind: 'string' as const }
        ];

        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file: createTestTFile('Notes/Status.md'),
                wordCount: null,
                properties,
                visiblePropertyKeys: new Set<string>(['status'])
            })
        ).toBe(1);

        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file: createTestTFile('Notes/Status.md'),
                wordCount: null,
                properties,
                visiblePropertyKeys: new Set<string>(['missing'])
            })
        ).toBe(0);

        expect(
            getPropertyRowCount({
                showWordCountProperty: false,
                showFileProperties: true,
                showPropertiesOnSeparateRows: false,
                showFilePropertiesInCompactMode: true,
                isCompactMode: false,
                file: createTestTFile('Notes/Status.md'),
                wordCount: null,
                properties,
                visiblePropertyKeys: new Set<string>(['status'])
            })
        ).toBe(1);
    });
});
