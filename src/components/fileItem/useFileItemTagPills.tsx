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

import React, { useCallback, useMemo } from 'react';
import { useMetadataService } from '../../context/ServicesContext';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { resolveFileItemTagDecorationColors, type FileItemPillDecorationModel } from '../../utils/fileItemPillDecoration';
import { compareFileItemTagsByNavigationOrder, type FileItemPillOrderModel } from '../../utils/fileItemPillOrder';
import { getTagPillDisplayName } from '../../utils/listPaneMeasurements';
import { hasOwnRecordEntries } from '../../utils/recordUtils';
import type { HiddenTagVisibility } from '../../utils/tagPrefixMatcher';
import { normalizeTagPath } from '../../utils/tagUtils';
import { ServiceIcon } from '../ServiceIcon';

/**
 * Shared tag pill model for list-pane file rows and for file tooltips outside the list pane
 * (shortcuts, recent notes). Both consumers derive filtering, order, colors, icons, and
 * display names from the same hook so tooltip pills match the rendered list pills.
 */

export type TagPillColorData = { color?: string; background?: string; hasCustomColor: boolean };

const EMPTY_COLOR_MAP = new Map<string, TagPillColorData>();

export interface UseFileItemTagPillsParams {
    /** Cached tags of the file before hidden-tag and selection filtering */
    tags: string[];
    settings: NotebookNavigatorSettings;
    hiddenTagVisibility: HiddenTagVisibility;
    /** Normalized path of the tag hidden because it is the current navigation selection; null hides none */
    selectedTagToHide: string | null;
    fileItemPillDecorationModel: FileItemPillDecorationModel;
    fileItemPillOrderModel: FileItemPillOrderModel;
}

export interface FileItemTagPillsState {
    /** Visible tags in pill order: custom-colored tags first when prioritized, then navigation order */
    categorizedTags: string[];
    tagColorData: ReadonlyMap<string, TagPillColorData>;
    tagPillIcons: ReadonlyMap<string, string>;
    getTagDisplayName: (tag: string) => string;
    /** Non-clickable pill row for hover tooltips. Null when tooltip tags are disabled or no tag is visible. */
    tooltipTagRow: React.ReactNode;
}

function sortTagsByNavigationOrder(
    tags: string[],
    orderModel: FileItemPillOrderModel,
    childSortOrderOverrides: NotebookNavigatorSettings['tagTreeSortOverrides']
): void {
    tags.sort((firstTag, secondTag) =>
        compareFileItemTagsByNavigationOrder({
            leftTag: firstTag,
            rightTag: secondTag,
            orderModel,
            childSortOrderOverrides
        })
    );
}

export function useFileItemTagPills({
    tags,
    settings,
    hiddenTagVisibility,
    selectedTagToHide,
    fileItemPillDecorationModel,
    fileItemPillOrderModel
}: UseFileItemTagPillsParams): FileItemTagPillsState {
    const metadataService = useMetadataService();

    const getTagColorData = useCallback(
        (tag: string): { color?: string; background?: string } => {
            return metadataService.getTagColorData(tag);
        },
        [metadataService]
    );

    const visibleTags = useMemo(() => {
        if (tags.length === 0) {
            return tags;
        }

        if (!hiddenTagVisibility.shouldFilterHiddenTags && !selectedTagToHide) {
            return tags;
        }

        return tags.filter(tag => {
            if (hiddenTagVisibility.shouldFilterHiddenTags && !hiddenTagVisibility.isTagVisible(tag)) {
                return false;
            }

            if (!selectedTagToHide) {
                return true;
            }

            return normalizeTagPath(tag) !== selectedTagToHide;
        });
    }, [hiddenTagVisibility, selectedTagToHide, tags]);

    const tagColorData = useMemo(() => {
        void settings.tagColors;
        void settings.tagBackgroundColors;
        void settings.inheritTagColors;

        if (!settings.colorFileTags || visibleTags.length === 0) {
            return EMPTY_COLOR_MAP;
        }

        const entries = new Map<string, TagPillColorData>();
        visibleTags.forEach(tag => {
            const tagColorData = getTagColorData(tag);
            const hasCustomColor = Boolean(tagColorData.color || tagColorData.background);
            const resolved = resolveFileItemTagDecorationColors({
                model: fileItemPillDecorationModel,
                tagPath: tag,
                color: tagColorData.color,
                backgroundColor: tagColorData.background
            });
            if (resolved.color || resolved.backgroundColor) {
                entries.set(tag, {
                    color: resolved.color,
                    background: resolved.backgroundColor,
                    hasCustomColor
                });
            }
        });

        return entries;
    }, [
        fileItemPillDecorationModel,
        getTagColorData,
        settings.colorFileTags,
        settings.inheritTagColors,
        settings.tagBackgroundColors,
        settings.tagColors,
        visibleTags
    ]);

    const categorizedTags = useMemo(() => {
        if (visibleTags.length === 0) {
            return visibleTags;
        }

        if (!settings.prioritizeColoredFileTags || !settings.colorFileTags) {
            const sortedTags = [...visibleTags];
            sortTagsByNavigationOrder(sortedTags, fileItemPillOrderModel, settings.tagTreeSortOverrides);
            return sortedTags;
        }

        const coloredTags: string[] = [];
        const regularTags: string[] = [];

        visibleTags.forEach(tag => {
            const tagColors = tagColorData.get(tag);

            if (tagColors?.hasCustomColor === true) {
                coloredTags.push(tag);
                return;
            }

            regularTags.push(tag);
        });

        sortTagsByNavigationOrder(coloredTags, fileItemPillOrderModel, settings.tagTreeSortOverrides);
        sortTagsByNavigationOrder(regularTags, fileItemPillOrderModel, settings.tagTreeSortOverrides);

        return [...coloredTags, ...regularTags];
    }, [
        fileItemPillOrderModel,
        settings.colorFileTags,
        settings.prioritizeColoredFileTags,
        settings.tagTreeSortOverrides,
        tagColorData,
        visibleTags
    ]);

    const getTagDisplayName = useCallback(
        (tag: string): string => {
            return getTagPillDisplayName(tag, settings.showFileTagAncestors);
        },
        [settings.showFileTagAncestors]
    );

    const tagPillIcons = useMemo(() => {
        const icons = new Map<string, string>();
        if (!settings.tagIcons || !hasOwnRecordEntries(settings.tagIcons) || categorizedTags.length === 0) {
            return icons;
        }

        categorizedTags.forEach(tag => {
            const iconId = metadataService.getTagIcon(tag);
            if (iconId) {
                icons.set(tag, iconId);
            }
        });

        return icons;
    }, [categorizedTags, metadataService, settings.tagIcons]);

    // Tooltip pill row computed from categorizedTags rather than the rendered pills so the
    // tooltip can show tags while the list-pane tag pills are turned off.
    const tooltipTagRow = useMemo((): React.ReactNode => {
        if (!settings.showTooltips || !settings.showTooltipTags || categorizedTags.length === 0) {
            return null;
        }

        return (
            <div className="nn-tooltip-tags">
                {categorizedTags.map((tag, index) => {
                    const tagColors = tagColorData.get(tag);
                    const tagColor = tagColors?.color;
                    const tagBackground = tagColors?.background;
                    const tagIconId = tagPillIcons.get(tag);
                    const tagStyle: React.CSSProperties & { '--nn-file-tag-custom-bg'?: string } = {};

                    if (tagBackground) {
                        tagStyle['--nn-file-tag-custom-bg'] = tagBackground;
                    }

                    if (tagColor) {
                        tagStyle.color = tagColor;
                    }

                    return (
                        <span
                            key={index}
                            className="nn-file-tag"
                            data-has-color={tagColor ? 'true' : undefined}
                            data-has-background={tagBackground ? 'true' : undefined}
                            style={tagColor || tagBackground ? tagStyle : undefined}
                        >
                            {tagIconId ? <ServiceIcon iconId={tagIconId} className="nn-file-pill-inline-icon" aria-hidden={true} /> : null}
                            {getTagDisplayName(tag)}
                        </span>
                    );
                })}
            </div>
        );
    }, [categorizedTags, getTagDisplayName, settings.showTooltips, settings.showTooltipTags, tagColorData, tagPillIcons]);

    return { categorizedTags, tagColorData, tagPillIcons, getTagDisplayName, tooltipTagRow };
}
