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
import type { TFile } from 'obsidian';
import { useMetadataService, useServices } from '../../context/ServicesContext';
import { useNavigationSelection } from '../../context/SelectionContext';
import { useTagNavigation } from '../../hooks/useTagNavigation';
import type { PropertyItem } from '../../storage/IndexedDBStorage';
import type { PropertySearchMatch, PropertySearchValueMatch } from '../../types/search';
import { showsCharacterCount, showsWordCount, type NotebookNavigatorSettings } from '../../settings/types';
import { runAsyncAction } from '../../utils/async';
import {
    forEachVisibleFrontmatterProperty,
    getSelectedPropertyValuePillToHide,
    getSelectedTagPillToHide,
    getTagPillDisplayName,
    type VisibleFrontmatterPropertyEntry
} from '../../utils/listPaneMeasurements';
import { naturalCompare } from '../../utils/sortUtils';
import { getTagSearchModifierOperator, normalizeTagPath } from '../../utils/tagUtils';
import {
    buildPropertySearchEvidence,
    isSupportedCssColor,
    parsePropertyLinkTarget,
    resolvePropertyDisplayText,
    type PropertyLinkTarget,
    type PropertySearchEvidenceGroup
} from '../../utils/propertyUtils';
import { casefold, foldSearchText } from '../../utils/recordUtils';
import { resolveUXIcon } from '../../utils/uxIcons';
import { getFoldedSearchHighlightRanges } from '../../utils/searchHighlight';
import type { InclusionOperator } from '../../utils/filterSearch';
import {
    buildPropertyKeyNodeId,
    getPropertyKeyNodeIdFromNodeId,
    normalizePropertyNodeId,
    parsePropertyNodeId
} from '../../utils/propertyTree';
import type { HiddenTagVisibility } from '../../utils/tagPrefixMatcher';
import {
    resolveFileItemPropertyDecorationColors,
    resolveFileItemTagDecorationColors,
    type FileItemPillDecorationModel
} from '../../utils/fileItemPillDecoration';
import {
    compareFileItemPropertyKeysByNavigationOrder,
    compareFileItemTagsByNavigationOrder,
    type FileItemPillOrderModel
} from '../../utils/fileItemPillOrder';
import { renderTextWithHighlightRanges } from './searchHighlightRendering';
import { ServiceIcon } from '../ServiceIcon';

type PropertyPill = {
    value: string;
    label: string;
    linkTarget: PropertyLinkTarget | null;
    iconId?: string;
    fieldKey?: string;
    propertyKeyNodeId?: string;
    color?: string;
    background?: string;
    propertyNodeId?: string;
    propertySearchKey?: string;
    propertySearchValuePath?: string | null;
    canNavigateToProperty?: boolean;
    hasCustomColor?: boolean;
    searchMatchTerms?: readonly string[];
};

export interface UseFileItemPillsParams {
    file: TFile;
    isCompactMode: boolean;
    tags: string[];
    properties: PropertyItem[] | null;
    wordCount: number | null;
    characterCount: number | null;
    wordCountDisplayText: string | null;
    characterCountDisplayText: string | null;
    settings: NotebookNavigatorSettings;
    visiblePropertyKeys: ReadonlySet<string>;
    visibleNavigationPropertyKeys: ReadonlySet<string>;
    matchedProperties?: readonly PropertySearchMatch[];
    hiddenTagVisibility: HiddenTagVisibility;
    onModifySearchWithTag?: (tag: string, operator: InclusionOperator) => void;
    onModifySearchWithProperty?: (key: string, value: string | null, operator: InclusionOperator) => void;
    fileItemPillDecorationModel: FileItemPillDecorationModel;
    fileItemPillOrderModel: FileItemPillOrderModel;
}

export interface FileItemPillsState {
    shouldShowFileTags: boolean;
    shouldShowProperty: boolean;
    shouldShowTextCountProperty: boolean;
    hasVisiblePillRows: boolean;
    propertySearchEvidenceGroups: readonly PropertySearchEvidenceGroup[];
    propertySearchEvidenceHiddenGroupCount: number;
    pillRows: React.ReactNode;
}

type TagPillColorData = { color?: string; background?: string; hasCustomColor: boolean };

const EMPTY_COLOR_MAP = new Map<string, TagPillColorData>();
const EXTERNAL_PROPERTY_LINK_ICON_ID = 'external-link';

function buildPropertySearchValueIdentity(fieldKey: string, valueKind: PropertyItem['valueKind'], rawValue: string): string {
    return `${casefold(fieldKey.trim())}\u0000${valueKind ?? ''}\u0000${rawValue}`;
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

function sortPropertyPillsAlphabetically(pills: PropertyPill[]): void {
    pills.sort((firstPill, secondPill) => {
        const labelCompare = naturalCompare(firstPill.label, secondPill.label);
        if (labelCompare !== 0) {
            return labelCompare;
        }

        const valueCompare = naturalCompare(firstPill.value, secondPill.value);
        if (valueCompare !== 0) {
            return valueCompare;
        }

        return naturalCompare(firstPill.fieldKey ?? '', secondPill.fieldKey ?? '');
    });
}

function sortPropertyPillGroup(pills: readonly PropertyPill[], prioritizeCustomColoredPills: boolean): PropertyPill[] {
    if (pills.length <= 1) {
        return [...pills];
    }

    if (!prioritizeCustomColoredPills) {
        const sortedPills = [...pills];
        sortPropertyPillsAlphabetically(sortedPills);
        return sortedPills;
    }

    const customColoredPills: PropertyPill[] = [];
    const regularPills: PropertyPill[] = [];

    pills.forEach(pill => {
        if (pill.hasCustomColor === true) {
            customColoredPills.push(pill);
            return;
        }

        regularPills.push(pill);
    });

    sortPropertyPillsAlphabetically(customColoredPills);
    sortPropertyPillsAlphabetically(regularPills);

    return [...customColoredPills, ...regularPills];
}

function hasCustomColoredPropertyPill(pills: readonly PropertyPill[] | undefined): boolean {
    if (!pills) {
        return false;
    }

    return pills.some(pill => pill.hasCustomColor === true);
}

function sortPropertyGroupOrder(
    groupOrder: readonly string[],
    groupedPills: ReadonlyMap<string, readonly PropertyPill[]>,
    prioritizeCustomColoredPills: boolean,
    orderModel: FileItemPillOrderModel,
    visibleNavigationPropertyKeys: ReadonlySet<string>
): string[] {
    if (groupOrder.length <= 1) {
        return [...groupOrder];
    }

    const sortedGroupOrder = [...groupOrder];
    sortedGroupOrder.sort((leftGroupKey, rightGroupKey) => {
        if (prioritizeCustomColoredPills) {
            const leftHasCustomColor = hasCustomColoredPropertyPill(groupedPills.get(leftGroupKey));
            const rightHasCustomColor = hasCustomColoredPropertyPill(groupedPills.get(rightGroupKey));
            if (leftHasCustomColor !== rightHasCustomColor) {
                return leftHasCustomColor ? -1 : 1;
            }
        }

        return compareFileItemPropertyKeysByNavigationOrder(
            leftGroupKey,
            rightGroupKey,
            orderModel.rootPropertyNavigationOrderMap,
            visibleNavigationPropertyKeys
        );
    });

    return sortedGroupOrder;
}

function resolveNormalizedPropertyKeyNodeId(fieldKey: string | undefined): string | undefined {
    const trimmedFieldKey = fieldKey?.trim() ?? '';
    if (!trimmedFieldKey) {
        return undefined;
    }

    const rawKeyNodeId = buildPropertyKeyNodeId(trimmedFieldKey);
    return normalizePropertyNodeId(rawKeyNodeId) ?? rawKeyNodeId;
}

function hasOwnRecordEntries(record: Record<string, string> | undefined): boolean {
    if (!record) {
        return false;
    }

    for (const key in record) {
        if (Object.prototype.hasOwnProperty.call(record, key)) {
            return true;
        }
    }

    return false;
}

export function useFileItemPills({
    file,
    isCompactMode,
    tags,
    properties,
    wordCount,
    characterCount,
    wordCountDisplayText,
    characterCountDisplayText,
    settings,
    visiblePropertyKeys,
    visibleNavigationPropertyKeys,
    matchedProperties,
    hiddenTagVisibility,
    onModifySearchWithTag,
    onModifySearchWithProperty,
    fileItemPillDecorationModel,
    fileItemPillOrderModel
}: UseFileItemPillsParams): FileItemPillsState {
    const { app, isMobile } = useServices();
    const metadataService = useMetadataService();
    const { selectionType, selectedTag, selectedProperty } = useNavigationSelection();
    const { navigateToTag, navigateToProperty } = useTagNavigation();
    const wordCountPillIconId = useMemo(() => resolveUXIcon(settings.interfaceIcons, 'file-word-count'), [settings.interfaceIcons]);
    const characterCountPillIconId = useMemo(
        () => resolveUXIcon(settings.interfaceIcons, 'file-character-count'),
        [settings.interfaceIcons]
    );
    const selectedTagToHide = useMemo(() => {
        return getSelectedTagPillToHide({
            selectionType,
            selectedTag,
            showSelectedNavigationPills: settings.showSelectedNavigationPills
        });
    }, [selectedTag, selectionType, settings.showSelectedNavigationPills]);
    const selectedPropertyValueNodeIdToHide = useMemo(() => {
        return getSelectedPropertyValuePillToHide({
            selectionType,
            selectedProperty,
            showSelectedNavigationPills: settings.showSelectedNavigationPills
        });
    }, [selectedProperty, selectionType, settings.showSelectedNavigationPills]);

    const handleTagClick = useCallback(
        (event: React.MouseEvent, tag: string) => {
            event.stopPropagation();

            if (onModifySearchWithTag) {
                const operator = getTagSearchModifierOperator(event, settings.multiSelectModifier, isMobile);
                if (operator) {
                    event.preventDefault();
                    onModifySearchWithTag(tag, operator);
                    return;
                }
            }

            navigateToTag(tag, { preserveNavigationFocus: false });
        },
        [isMobile, navigateToTag, onModifySearchWithTag, settings.multiSelectModifier]
    );

    const handlePropertyClick = useCallback(
        (event: React.MouseEvent, pill: PropertyPill) => {
            const propertyNodeId = pill.propertyNodeId;
            const propertySearchKey = pill.propertySearchKey;
            const canNavigateToProperty = pill.canNavigateToProperty === true;
            event.stopPropagation();

            if (pill.linkTarget?.kind === 'unsupported') {
                return;
            }

            if (canNavigateToProperty && onModifySearchWithProperty && propertySearchKey) {
                const operator = getTagSearchModifierOperator(event, settings.multiSelectModifier, isMobile);
                if (operator) {
                    event.preventDefault();
                    onModifySearchWithProperty(propertySearchKey, pill.propertySearchValuePath ?? null, operator);
                    return;
                }
            }

            const linkTarget = pill.linkTarget;
            if (linkTarget?.kind === 'internal' && settings.enablePropertyInternalLinks) {
                event.preventDefault();
                runAsyncAction(() => app.workspace.openLinkText(linkTarget.target, file.path, false));
                return;
            }

            if (linkTarget?.kind === 'external' && settings.enablePropertyExternalLinks) {
                event.preventDefault();
                window.open(linkTarget.target);
                return;
            }

            if (!canNavigateToProperty || !propertyNodeId || !propertySearchKey) {
                return;
            }

            navigateToProperty(propertyNodeId, { preserveNavigationFocus: false });
        },
        [
            app.workspace,
            file.path,
            isMobile,
            navigateToProperty,
            onModifySearchWithProperty,
            settings.enablePropertyExternalLinks,
            settings.enablePropertyInternalLinks,
            settings.multiSelectModifier
        ]
    );

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

    const shouldShowFileTags = useMemo(() => {
        if (!settings.showTags || !settings.showFileTags) {
            return false;
        }

        if (categorizedTags.length === 0) {
            return false;
        }

        if (isCompactMode && !settings.showFileTagsInCompactMode) {
            return false;
        }

        return true;
    }, [categorizedTags, isCompactMode, settings.showFileTags, settings.showFileTagsInCompactMode, settings.showTags]);

    const visibleFrontmatterProperties = useMemo(() => {
        const entries: VisibleFrontmatterPropertyEntry[] = [];
        forEachVisibleFrontmatterProperty({
            properties,
            visiblePropertyKeys,
            hiddenPropertyValueNodeId: selectedPropertyValueNodeIdToHide,
            visitor: property => {
                entries.push(property);
            }
        });
        return entries;
    }, [properties, selectedPropertyValueNodeIdToHide, visiblePropertyKeys]);

    const propertyColorSignature = useMemo(() => {
        if (!settings.showFileProperties || !settings.colorFileProperties || visibleFrontmatterProperties.length === 0) {
            return '';
        }

        const colorRecord = settings.propertyColors;
        const backgroundRecord = settings.propertyBackgroundColors;
        const inheritSignature = settings.inheritPropertyColors ? 'inherit:1' : 'inherit:0';
        const signatures: string[] = [];
        const seenValueNodeIds = new Set<string>();
        const seenKeyNodeIds = new Set<string>();

        for (const property of visibleFrontmatterProperties) {
            const valueNodeId = property.propertyNodeId;
            if (!valueNodeId) {
                continue;
            }

            if (!seenValueNodeIds.has(valueNodeId)) {
                seenValueNodeIds.add(valueNodeId);
                signatures.push(`v:${valueNodeId}\u0000${colorRecord?.[valueNodeId] ?? ''}\u0000${backgroundRecord?.[valueNodeId] ?? ''}`);
            }

            const keyNodeId = getPropertyKeyNodeIdFromNodeId(valueNodeId);
            if (!keyNodeId || seenKeyNodeIds.has(keyNodeId)) {
                continue;
            }

            seenKeyNodeIds.add(keyNodeId);
            signatures.push(`k:${keyNodeId}\u0000${colorRecord?.[keyNodeId] ?? ''}\u0000${backgroundRecord?.[keyNodeId] ?? ''}`);
        }

        if (signatures.length === 0) {
            return inheritSignature;
        }

        if (signatures.length === 1) {
            return `${inheritSignature}\u0001${signatures[0] ?? ''}`;
        }

        signatures.sort();
        return `${inheritSignature}\u0001${signatures.join('\u0001')}`;
    }, [
        settings.colorFileProperties,
        settings.inheritPropertyColors,
        settings.propertyBackgroundColors,
        settings.propertyColors,
        settings.showFileProperties,
        visibleFrontmatterProperties
    ]);

    const canShowPropertyPills = useMemo(() => {
        if (file.extension !== 'md') {
            return false;
        }

        if (isCompactMode && !settings.showFilePropertiesInCompactMode) {
            return false;
        }

        return true;
    }, [file.extension, isCompactMode, settings.showFilePropertiesInCompactMode]);

    // The list filter retains only matching clauses for every result. Resolve concrete cached values
    // here so hidden-property evidence and pill highlights allocate data only for mounted virtual rows.
    const propertySearchValueMatches = useMemo<PropertySearchValueMatch[]>(() => {
        if (!matchedProperties || matchedProperties.length === 0 || !properties || properties.length === 0) {
            return [];
        }

        const matches: PropertySearchValueMatch[] = [];
        const seen = new Set<string>();
        properties.forEach(entry => {
            const normalizedKey = foldSearchText(entry.fieldKey.trim());
            if (!normalizedKey) {
                return;
            }

            let displayValue: string | null = null;
            let foldedDisplayValue: string | null = null;
            matchedProperties.forEach(match => {
                const { clause } = match;
                const keyMatches = clause.value === null ? normalizedKey.startsWith(clause.key) : normalizedKey === clause.key;
                if (!keyMatches) {
                    return;
                }

                displayValue ??= resolvePropertyDisplayText(entry.value);
                if (clause.value !== null) {
                    foldedDisplayValue ??= foldSearchText(displayValue);
                    if (!foldedDisplayValue.includes(clause.value)) {
                        return;
                    }
                }

                const identity = `${clause.key}\u0000${clause.value ?? ''}\u0000${normalizedKey}\u0000${entry.valueKind ?? ''}\u0000${entry.value}`;
                if (seen.has(identity)) {
                    return;
                }
                seen.add(identity);
                matches.push({
                    clause,
                    propertyKey: entry.fieldKey,
                    rawValue: entry.value,
                    valueKind: entry.valueKind,
                    displayValue
                });
            });
        });
        return matches;
    }, [matchedProperties, properties]);

    const propertySearchEvidence = useMemo(() => {
        if (propertySearchValueMatches.length === 0) {
            return { groups: [], hiddenGroupCount: 0 };
        }

        const renderedPropertyValues = new Set<string>();
        if (canShowPropertyPills && settings.showFileProperties) {
            visibleFrontmatterProperties.forEach(({ entry }) => {
                renderedPropertyValues.add(buildPropertySearchValueIdentity(entry.fieldKey, entry.valueKind, entry.value));
            });
        }

        const evidenceMatches = propertySearchValueMatches.filter(
            match =>
                match.clause.value === null ||
                !renderedPropertyValues.has(buildPropertySearchValueIdentity(match.propertyKey, match.valueKind, match.rawValue))
        );
        return buildPropertySearchEvidence(evidenceMatches);
    }, [canShowPropertyPills, propertySearchValueMatches, settings.showFileProperties, visibleFrontmatterProperties]);

    const wordCountPropertyPill = useMemo<PropertyPill | null>(() => {
        if (
            !canShowPropertyPills ||
            !showsWordCount(settings.textCountDisplay) ||
            settings.textCountPlacement !== 'property' ||
            wordCountDisplayText === null
        ) {
            return null;
        }

        if (typeof wordCount !== 'number' || !Number.isFinite(wordCount) || wordCount <= 0) {
            return null;
        }

        const truncatedWordCount = Math.trunc(wordCount);
        return {
            value: truncatedWordCount.toString(),
            label: wordCountDisplayText,
            linkTarget: null,
            iconId: wordCountPillIconId
        };
    }, [
        canShowPropertyPills,
        settings.textCountDisplay,
        settings.textCountPlacement,
        wordCount,
        wordCountDisplayText,
        wordCountPillIconId
    ]);

    const characterCountPropertyPill = useMemo<PropertyPill | null>(() => {
        if (
            !canShowPropertyPills ||
            !showsCharacterCount(settings.textCountDisplay) ||
            settings.textCountPlacement !== 'property' ||
            characterCountDisplayText === null
        ) {
            return null;
        }

        if (typeof characterCount !== 'number' || !Number.isFinite(characterCount) || characterCount <= 0) {
            return null;
        }

        const truncatedCharacterCount = Math.trunc(characterCount);
        return {
            value: truncatedCharacterCount.toString(),
            label: characterCountDisplayText,
            linkTarget: null,
            iconId: characterCountPillIconId
        };
    }, [
        canShowPropertyPills,
        characterCount,
        characterCountDisplayText,
        characterCountPillIconId,
        settings.textCountDisplay,
        settings.textCountPlacement
    ]);

    const textCountPropertyPills = useMemo(
        () => [wordCountPropertyPill, characterCountPropertyPill].filter((pill): pill is PropertyPill => pill !== null),
        [characterCountPropertyPill, wordCountPropertyPill]
    );

    const propertySearchTermsByValue = useMemo(() => {
        const termsByValue = new Map<string, Set<string>>();
        propertySearchValueMatches.forEach(match => {
            if (!match.clause.value) {
                return;
            }

            const identity = buildPropertySearchValueIdentity(match.propertyKey, match.valueKind, match.rawValue);
            let terms = termsByValue.get(identity);
            if (!terms) {
                terms = new Set();
                termsByValue.set(identity, terms);
            }
            terms.add(match.clause.value);
        });
        return termsByValue;
    }, [propertySearchValueMatches]);

    const propertyPills = useMemo<PropertyPill[]>(() => {
        void propertyColorSignature;

        const pills: PropertyPill[] = [];
        const frontmatterPills: PropertyPill[] = [];

        if (!canShowPropertyPills || !settings.showFileProperties || visibleFrontmatterProperties.length === 0) {
            return pills;
        }

        const colorLookupCache = new Map<string, { color?: string; background?: string; hasCustomColor: boolean }>();
        for (const property of visibleFrontmatterProperties) {
            const { entry, rawValue, trimmedFieldKey, normalizedValuePath, isKeyOnlyValue, propertyNodeId } = property;
            const linkTarget = isKeyOnlyValue ? null : parsePropertyLinkTarget(rawValue);
            const label = linkTarget ? linkTarget.displayText : rawValue;
            const cacheKey = propertyNodeId ?? `${entry.fieldKey}\u0000${rawValue}`;
            let colorData = colorLookupCache.get(cacheKey);
            if (!colorData) {
                if (settings.colorFileProperties && propertyNodeId) {
                    const baseColorData = metadataService.getPropertyColorData(propertyNodeId);
                    const hasCustomColor = Boolean(baseColorData.color || baseColorData.background);
                    const resolved = resolveFileItemPropertyDecorationColors({
                        model: fileItemPillDecorationModel,
                        nodeId: propertyNodeId,
                        color: baseColorData.color,
                        backgroundColor: baseColorData.background
                    });
                    colorData = {
                        color: resolved.color,
                        background: resolved.backgroundColor,
                        hasCustomColor
                    };
                } else {
                    colorData = { hasCustomColor: false };
                }
                colorLookupCache.set(cacheKey, colorData);
            }

            const parsedPropertyNode = propertyNodeId ? parsePropertyNodeId(propertyNodeId) : null;
            const propertyKeyNodeId = propertyNodeId
                ? (getPropertyKeyNodeIdFromNodeId(propertyNodeId) ?? resolveNormalizedPropertyKeyNodeId(trimmedFieldKey))
                : resolveNormalizedPropertyKeyNodeId(trimmedFieldKey);
            const propertySearchKey = parsedPropertyNode?.key || trimmedFieldKey;
            const propertySearchValuePath = isKeyOnlyValue ? null : (parsedPropertyNode?.valuePath ?? normalizedValuePath);
            const normalizedPropertySearchKey = casefold(propertySearchKey);
            const canNavigateToProperty =
                propertyNodeId !== undefined &&
                normalizedPropertySearchKey.length > 0 &&
                visibleNavigationPropertyKeys.has(normalizedPropertySearchKey);

            frontmatterPills.push({
                value: rawValue,
                label,
                linkTarget,
                fieldKey: entry.fieldKey,
                propertyKeyNodeId,
                color: colorData.color,
                background: colorData.background,
                hasCustomColor: colorData.hasCustomColor,
                propertyNodeId,
                propertySearchKey: propertySearchKey.length > 0 ? propertySearchKey : undefined,
                propertySearchValuePath,
                canNavigateToProperty,
                searchMatchTerms: Array.from(
                    propertySearchTermsByValue.get(buildPropertySearchValueIdentity(entry.fieldKey, entry.valueKind, entry.value)) ?? []
                )
            });
        }

        const prioritizeColoredPills = settings.prioritizeColoredFileProperties && settings.colorFileProperties;
        const groupedPills = new Map<string, PropertyPill[]>();
        const groupOrder: string[] = [];

        frontmatterPills.forEach(pill => {
            const key = pill.fieldKey ?? '';
            const existingGroup = groupedPills.get(key);
            if (existingGroup) {
                existingGroup.push(pill);
                return;
            }

            groupedPills.set(key, [pill]);
            groupOrder.push(key);
        });

        const sortedGroupOrder = sortPropertyGroupOrder(
            groupOrder,
            groupedPills,
            prioritizeColoredPills,
            fileItemPillOrderModel,
            visibleNavigationPropertyKeys
        );

        sortedGroupOrder.forEach(groupKey => {
            const group = groupedPills.get(groupKey);
            if (!group || group.length === 0) {
                return;
            }

            pills.push(...sortPropertyPillGroup(group, prioritizeColoredPills));
        });

        return pills;
    }, [
        canShowPropertyPills,
        fileItemPillDecorationModel,
        fileItemPillOrderModel,
        metadataService,
        propertyColorSignature,
        propertySearchTermsByValue,
        settings.colorFileProperties,
        settings.prioritizeColoredFileProperties,
        settings.showFileProperties,
        visibleNavigationPropertyKeys,
        visibleFrontmatterProperties
    ]);

    const propertyColorData = useMemo(() => {
        const entries = new Map<
            string,
            {
                style?: (React.CSSProperties & { '--nn-file-tag-custom-bg'?: string }) | undefined;
                hasColor: boolean;
                hasBackground: boolean;
            }
        >();

        if (propertyPills.length === 0) {
            return entries;
        }

        for (const pill of propertyPills) {
            const colorToken = pill.color?.trim() ?? '';
            const backgroundToken = pill.background?.trim() ?? '';
            if (!colorToken && !backgroundToken) {
                continue;
            }

            const cacheKey = `${colorToken}\u0000${backgroundToken}`;
            if (entries.has(cacheKey)) {
                continue;
            }

            const pillStyle: React.CSSProperties & { '--nn-file-tag-custom-bg'?: string } = {};
            let hasColor = false;
            let hasBackground = false;

            if (backgroundToken && isSupportedCssColor(backgroundToken)) {
                pillStyle['--nn-file-tag-custom-bg'] = backgroundToken;
                hasBackground = true;
            }

            if (colorToken && isSupportedCssColor(colorToken)) {
                pillStyle.color = colorToken;
                hasColor = true;
            }

            entries.set(cacheKey, {
                style: hasColor || hasBackground ? pillStyle : undefined,
                hasColor,
                hasBackground
            });
        }

        return entries;
    }, [propertyPills]);

    const shouldShowProperty = propertyPills.length > 0;
    const shouldShowTextCountProperty = textCountPropertyPills.length > 0;

    const propertyRows = useMemo((): PropertyPill[][] => {
        if (!settings.showPropertiesOnSeparateRows) {
            return [];
        }

        const rows: PropertyPill[][] = [];
        const rowsByKey = new Map<string, PropertyPill[]>();
        let unkeyedRow: PropertyPill[] | null = null;

        for (const pill of propertyPills) {
            const fieldKey = pill.fieldKey?.trim() ?? '';
            if (!fieldKey) {
                if (!unkeyedRow) {
                    unkeyedRow = [];
                    rows.push(unkeyedRow);
                }
                unkeyedRow.push(pill);
                continue;
            }

            let row = rowsByKey.get(fieldKey);
            if (!row) {
                row = [];
                rowsByKey.set(fieldKey, row);
                rows.push(row);
            }
            row.push(pill);
        }

        return rows;
    }, [propertyPills, settings.showPropertiesOnSeparateRows]);

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

    const propertyPillIcons = useMemo(() => {
        const icons = new Map<PropertyPill, string>();
        const resolvePropertyPillIconId = (pill: PropertyPill): string | undefined => {
            if (pill.linkTarget?.kind === 'external' && settings.enablePropertyExternalLinks) {
                return EXTERNAL_PROPERTY_LINK_ICON_ID;
            }

            if (pill.iconId) {
                return pill.iconId;
            }

            if (!settings.propertyIcons || !hasOwnRecordEntries(settings.propertyIcons)) {
                return undefined;
            }

            let checkedKeyNodeId: string | null = null;
            if (pill.propertyNodeId) {
                const valueIconId = metadataService.getPropertyIcon(pill.propertyNodeId);
                if (valueIconId) {
                    return valueIconId;
                }

                const keyNodeIdFromNode = getPropertyKeyNodeIdFromNodeId(pill.propertyNodeId);
                if (keyNodeIdFromNode) {
                    checkedKeyNodeId = keyNodeIdFromNode;
                    if (keyNodeIdFromNode !== pill.propertyNodeId) {
                        const keyIconId = metadataService.getPropertyIcon(keyNodeIdFromNode);
                        if (keyIconId) {
                            return keyIconId;
                        }
                    }
                }
            }

            const fallbackKeyNodeId = pill.propertyKeyNodeId;
            if (!fallbackKeyNodeId || checkedKeyNodeId === fallbackKeyNodeId) {
                return undefined;
            }

            return metadataService.getPropertyIcon(fallbackKeyNodeId);
        };

        propertyPills.forEach(pill => {
            const iconId = resolvePropertyPillIconId(pill);
            if (iconId) {
                icons.set(pill, iconId);
            }
        });

        for (const textCountPill of textCountPropertyPills) {
            if (textCountPill.iconId) {
                icons.set(textCountPill, textCountPill.iconId);
            }
        }

        return icons;
    }, [metadataService, propertyPills, settings.enablePropertyExternalLinks, settings.propertyIcons, textCountPropertyPills]);

    const renderPropertyPill = useCallback(
        (pill: PropertyPill, index: number) => {
            const isUnsupportedMarkdownLink = pill.linkTarget?.kind === 'unsupported';
            const canNavigateToProperty = pill.canNavigateToProperty === true && !isUnsupportedMarkdownLink;
            const isPropertyLink =
                (pill.linkTarget?.kind === 'internal' && settings.enablePropertyInternalLinks) ||
                (pill.linkTarget?.kind === 'external' && settings.enablePropertyExternalLinks);
            const isClickable = canNavigateToProperty || isPropertyLink;
            const className = [
                'nn-file-tag',
                'nn-file-property',
                isClickable ? 'nn-clickable-tag' : '',
                isPropertyLink ? 'nn-file-property-link' : ''
            ]
                .filter(classToken => classToken.length > 0)
                .join(' ');
            const colorToken = pill.color?.trim() ?? '';
            const backgroundToken = pill.background?.trim() ?? '';
            const cacheKey = `${colorToken}\u0000${backgroundToken}`;
            const resolvedColorData = colorToken || backgroundToken ? propertyColorData.get(cacheKey) : undefined;
            const hasColor = Boolean(resolvedColorData?.hasColor);
            const hasBackground = Boolean(resolvedColorData?.hasBackground);
            const propertyIconId = propertyPillIcons.get(pill);
            const highlightRanges = getFoldedSearchHighlightRanges(pill.label, pill.searchMatchTerms ?? []);
            const label = renderTextWithHighlightRanges(pill.label, highlightRanges);

            return (
                <span
                    key={index}
                    className={className}
                    data-has-color={hasColor ? 'true' : undefined}
                    data-has-background={hasBackground ? 'true' : undefined}
                    onClick={isClickable ? event => handlePropertyClick(event, pill) : undefined}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    style={resolvedColorData?.style}
                >
                    {propertyIconId ? (
                        <ServiceIcon iconId={propertyIconId} className="nn-file-pill-inline-icon" aria-hidden={true} />
                    ) : null}
                    {label}
                </span>
            );
        },
        [
            handlePropertyClick,
            propertyColorData,
            propertyPillIcons,
            settings.enablePropertyExternalLinks,
            settings.enablePropertyInternalLinks
        ]
    );

    const tagRows = useMemo(() => {
        if (!shouldShowFileTags) {
            return null;
        }

        return (
            <div className="nn-file-tags">
                {categorizedTags.map((tag, index) => {
                    const tagColors = tagColorData.get(tag);
                    const tagColor = tagColors?.color;
                    const tagBackground = tagColors?.background;
                    const displayTag = getTagDisplayName(tag);
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
                            className="nn-file-tag nn-clickable-tag"
                            data-has-color={tagColor ? 'true' : undefined}
                            data-has-background={tagBackground ? 'true' : undefined}
                            onClick={event => handleTagClick(event, tag)}
                            role="button"
                            tabIndex={0}
                            style={tagColor || tagBackground ? tagStyle : undefined}
                        >
                            {tagIconId ? <ServiceIcon iconId={tagIconId} className="nn-file-pill-inline-icon" aria-hidden={true} /> : null}
                            {displayTag}
                        </span>
                    );
                })}
            </div>
        );
    }, [categorizedTags, getTagDisplayName, handleTagClick, shouldShowFileTags, tagColorData, tagPillIcons]);

    const propertyRowsNode = useMemo(() => {
        if (!shouldShowProperty) {
            return null;
        }

        if (!settings.showPropertiesOnSeparateRows) {
            return <div className="nn-file-property-row">{propertyPills.map(renderPropertyPill)}</div>;
        }

        return (
            <>
                {propertyRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="nn-file-property-row">
                        {row.map((pill, index) => renderPropertyPill(pill, index))}
                    </div>
                ))}
            </>
        );
    }, [propertyPills, propertyRows, renderPropertyPill, settings.showPropertiesOnSeparateRows, shouldShowProperty]);

    const textCountRow = useMemo(() => {
        if (!shouldShowTextCountProperty) {
            return null;
        }

        return <div className="nn-file-property-row">{textCountPropertyPills.map(renderPropertyPill)}</div>;
    }, [renderPropertyPill, shouldShowTextCountProperty, textCountPropertyPills]);

    const pillRows = useMemo(() => {
        return (
            <>
                {tagRows}
                {propertyRowsNode}
                {textCountRow}
            </>
        );
    }, [propertyRowsNode, tagRows, textCountRow]);

    return {
        shouldShowFileTags,
        shouldShowProperty,
        shouldShowTextCountProperty,
        hasVisiblePillRows: shouldShowFileTags || shouldShowProperty || shouldShowTextCountProperty,
        propertySearchEvidenceGroups: propertySearchEvidence.groups,
        propertySearchEvidenceHiddenGroupCount: propertySearchEvidence.hiddenGroupCount,
        pillRows
    };
}
