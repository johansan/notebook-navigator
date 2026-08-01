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

import { useEffect, useMemo, useState } from 'react';
import type { App, TFile } from 'obsidian';
import type { MetadataService } from '../../../services/MetadataService';
import type { NotebookNavigatorSettings } from '../../../settings/types';
import {
    NavigationPaneItemType,
    NavigationSectionId,
    RECENT_NOTES_VIRTUAL_FOLDER_ID,
    SHORTCUTS_VIRTUAL_FOLDER_ID,
    type NavigationSectionId as NavigationSectionIdType
} from '../../../types';
import type { CombinedNavigationItem } from '../../../types/virtualization';
import type { NavigationRainbowState } from '../../useNavigationRainbowState';
import type { FolderDecorationModel } from '../../../utils/folderDecoration';
import { buildNavigationPathIndexMap } from '../../../utils/navigationIndex';
import {
    buildPropertyRainbowColors,
    buildRecentRainbowColors,
    buildShortcutRainbowColors,
    buildTagRainbowColors
} from '../../../utils/navigationRainbow';
import { sanitizeNavigationSectionOrder } from '../../../utils/navigationSections';
import {
    buildFolderSeparatorKey,
    buildPropertySeparatorKey,
    buildSectionSeparatorKey,
    buildTagSeparatorKey,
    parseNavigationSeparatorKey
} from '../../../utils/navigationSeparators';
import { normalizePropertyNodeId } from '../../../utils/propertyTree';
import type { FileNameIconNeedle } from '../../../utils/fileIconUtils';
import { createNavigationItemDecorator, type NavigationRainbowColors } from './decorateNavigationItems';
import { insertRootSpacing, SPACER_ITEM_TYPES } from './rootSpacing';

interface SectionItems {
    id: NavigationSectionIdType;
    items: CombinedNavigationItem[];
}

export interface UseNavigationPaneItemPipelineParams {
    app: App;
    settings: NotebookNavigatorSettings;
    metadataService: MetadataService;
    fileNameIconNeedles: readonly FileNameIconNeedle[];
    getFileDisplayName: (file: TFile) => string;
    folderDecorationModel: FolderDecorationModel;
    navRainbowState: NavigationRainbowState;
    sectionOrder: NavigationSectionIdType[];
    showHiddenItems: boolean;
    pinShortcuts: boolean;
    shouldPinRecentNotes: boolean;
    propertiesSectionActive: boolean;
    folderItems: CombinedNavigationItem[];
    tagItems: CombinedNavigationItem[];
    propertyItems: CombinedNavigationItem[];
    shortcutItems: CombinedNavigationItem[];
    recentNotesItems: CombinedNavigationItem[];
    parsedExcludedFolders: string[];
    metadataDecorationVersion: number;
}

export interface NavigationPaneItemPipelineResult {
    items: CombinedNavigationItem[];
    itemsWithMetadata: CombinedNavigationItem[];
    firstSectionId: NavigationSectionIdType | null;
    firstInlineFolderPath: string | null;
    shortcutItemsWithMetadata: CombinedNavigationItem[];
    pinnedRecentNotesItems: CombinedNavigationItem[];
    pathToIndex: Map<string, number>;
}

const isShortcutNavigationItem = (item: CombinedNavigationItem): boolean => {
    if (item.type === NavigationPaneItemType.VIRTUAL_FOLDER) {
        return item.data.id === SHORTCUTS_VIRTUAL_FOLDER_ID;
    }

    return (
        item.type === NavigationPaneItemType.SHORTCUT_FOLDER ||
        item.type === NavigationPaneItemType.SHORTCUT_NOTE ||
        item.type === NavigationPaneItemType.SHORTCUT_SEARCH ||
        item.type === NavigationPaneItemType.SHORTCUT_TAG ||
        item.type === NavigationPaneItemType.SHORTCUT_PROPERTY ||
        item.type === NavigationPaneItemType.SHORTCUT_HEADER
    );
};

const isRecentNavigationItem = (item: CombinedNavigationItem): boolean => {
    if (item.type === NavigationPaneItemType.VIRTUAL_FOLDER) {
        return item.data.id === RECENT_NOTES_VIRTUAL_FOLDER_ID;
    }
    return item.type === NavigationPaneItemType.RECENT_NOTE;
};

export function useNavigationPaneItemPipeline({
    app,
    settings,
    metadataService,
    fileNameIconNeedles,
    getFileDisplayName,
    folderDecorationModel,
    navRainbowState,
    sectionOrder,
    showHiddenItems,
    pinShortcuts,
    shouldPinRecentNotes,
    propertiesSectionActive,
    folderItems,
    tagItems,
    propertyItems,
    shortcutItems,
    recentNotesItems,
    parsedExcludedFolders,
    metadataDecorationVersion
}: UseNavigationPaneItemPipelineParams): NavigationPaneItemPipelineResult {
    const normalizedSectionOrder = useMemo(() => sanitizeNavigationSectionOrder(sectionOrder), [sectionOrder]);
    const { navRainbow, navRainbowPalettes } = navRainbowState;

    const { items, sectionSpacerMap, firstSectionId } = useMemo(() => {
        const allItems: CombinedNavigationItem[] = [];
        const spacerMap = new Map<NavigationSectionId, string>();
        let firstVisibleSectionId: NavigationSectionIdType | null = null;

        allItems.push({
            type: NavigationPaneItemType.TOP_SPACER,
            key: 'top-spacer'
        });

        const shouldIncludeShortcutsSection = settings.showShortcuts && shortcutItems.length > 0 && !pinShortcuts;
        const shouldIncludeRecentSection = settings.showRecentNotes && recentNotesItems.length > 0 && !shouldPinRecentNotes;
        const shouldIncludeFoldersSection = folderItems.length > 0;
        const shouldIncludeTagsSection = settings.showTags && tagItems.length > 0;
        const shouldIncludePropertiesSection = propertiesSectionActive && propertyItems.length > 0;

        const orderedSections: SectionItems[] = [];

        normalizedSectionOrder.forEach(identifier => {
            switch (identifier) {
                case NavigationSectionId.SHORTCUTS:
                    if (shouldIncludeShortcutsSection) {
                        orderedSections.push({ id: identifier, items: shortcutItems });
                    }
                    break;
                case NavigationSectionId.RECENT:
                    if (shouldIncludeRecentSection) {
                        orderedSections.push({ id: identifier, items: recentNotesItems });
                    }
                    break;
                case NavigationSectionId.FOLDERS:
                    if (shouldIncludeFoldersSection) {
                        orderedSections.push({ id: identifier, items: folderItems });
                    }
                    break;
                case NavigationSectionId.TAGS:
                    if (shouldIncludeTagsSection) {
                        orderedSections.push({ id: identifier, items: tagItems });
                    }
                    break;
                case NavigationSectionId.PROPERTIES:
                    if (shouldIncludePropertiesSection) {
                        orderedSections.push({ id: identifier, items: propertyItems });
                    }
                    break;
                default:
                    break;
            }
        });

        const visibleSections = orderedSections.filter(section => section.items.length > 0);

        if (visibleSections.length > 0) {
            firstVisibleSectionId = visibleSections[0].id;
            spacerMap.set(visibleSections[0].id, 'top-spacer');
        }

        visibleSections.forEach((section, index) => {
            allItems.push(...section.items);
            if (index < visibleSections.length - 1) {
                const nextSection = visibleSections[index + 1];
                const spacerKey = buildSectionSeparatorKey(nextSection.id);
                spacerMap.set(nextSection.id, spacerKey);
                allItems.push({
                    type: NavigationPaneItemType.LIST_SPACER,
                    key: spacerKey
                });
            }
        });

        allItems.push({
            type: NavigationPaneItemType.BOTTOM_SPACER,
            key: 'bottom-spacer'
        });

        return { items: allItems, sectionSpacerMap: spacerMap, firstSectionId: firstVisibleSectionId };
    }, [
        folderItems,
        normalizedSectionOrder,
        pinShortcuts,
        propertiesSectionActive,
        propertyItems,
        recentNotesItems,
        settings.showRecentNotes,
        settings.showShortcuts,
        settings.showTags,
        shortcutItems,
        shouldPinRecentNotes,
        tagItems
    ]);

    const [navigationSeparatorVersion, setNavigationSeparatorVersion] = useState(() => metadataService.getNavigationSeparatorsVersion());

    useEffect(() => {
        return metadataService.subscribeToNavigationSeparatorChanges(version => {
            setNavigationSeparatorVersion(version);
        });
    }, [metadataService]);

    const navigationSeparatorSnapshot = useMemo(() => {
        return {
            version: navigationSeparatorVersion,
            record: settings.navigationSeparators || {}
        };
    }, [navigationSeparatorVersion, settings.navigationSeparators]);

    const parsedNavigationSeparators = useMemo(() => {
        const separatorRecord = navigationSeparatorSnapshot.record;
        const folderSeparators = new Set<string>();
        const tagSeparators = new Set<string>();
        const propertySeparators = new Set<string>();
        const sectionSeparatorIds = new Set<NavigationSectionIdType>();
        let useSectionSpacerForRootFolder = false;

        Object.entries(separatorRecord || {}).forEach(([key, enabled]) => {
            if (!enabled) {
                return;
            }

            const descriptor = parseNavigationSeparatorKey(key);
            if (!descriptor) {
                return;
            }

            if (descriptor.type === 'section') {
                if (descriptor.id === NavigationSectionId.TAGS && !settings.showAllTagsFolder) {
                    return;
                }
                if (descriptor.id === NavigationSectionId.PROPERTIES && !propertiesSectionActive) {
                    return;
                }
                sectionSeparatorIds.add(descriptor.id);
                return;
            }

            if (descriptor.type === 'folder') {
                if (descriptor.path === '/') {
                    // The root separator follows the effective root visibility; gating on the setting alone
                    // would make the root context menu separator action have no visible effect while show
                    // hidden items reveals the root
                    useSectionSpacerForRootFolder = settings.showRootFolder || showHiddenItems;
                } else {
                    folderSeparators.add(descriptor.path);
                }
                return;
            }

            if (descriptor.type === 'tag') {
                tagSeparators.add(descriptor.path);
                return;
            }

            if (descriptor.type === 'property') {
                const normalizedNodeId = normalizePropertyNodeId(descriptor.nodeId);
                if (normalizedNodeId) {
                    propertySeparators.add(normalizedNodeId);
                }
            }
        });

        const hasAnySeparators =
            folderSeparators.size > 0 ||
            tagSeparators.size > 0 ||
            propertySeparators.size > 0 ||
            sectionSeparatorIds.size > 0 ||
            useSectionSpacerForRootFolder;

        return {
            folderSeparators,
            tagSeparators,
            propertySeparators,
            sectionSeparatorIds,
            useSectionSpacerForRootFolder,
            hasAnySeparators
        };
    }, [navigationSeparatorSnapshot, propertiesSectionActive, settings.showAllTagsFolder, settings.showRootFolder, showHiddenItems]);

    const itemsWithSeparators = useMemo(() => {
        const {
            folderSeparators,
            tagSeparators,
            propertySeparators,
            sectionSeparatorIds,
            useSectionSpacerForRootFolder,
            hasAnySeparators
        } = parsedNavigationSeparators;

        if (!hasAnySeparators) {
            return items;
        }

        const spacerKeysWithSeparators = new Set<string>();
        const effectiveSectionIds = new Set(sectionSeparatorIds);
        if (pinShortcuts) {
            effectiveSectionIds.delete(NavigationSectionId.SHORTCUTS);
            if (firstSectionId) {
                effectiveSectionIds.delete(firstSectionId);
            }
        }

        effectiveSectionIds.forEach(sectionId => {
            const spacerKey = sectionSpacerMap.get(sectionId);
            if (spacerKey) {
                spacerKeysWithSeparators.add(spacerKey);
            }
        });

        const shouldIncludeRootSectionSeparator =
            useSectionSpacerForRootFolder && (!pinShortcuts || firstSectionId !== NavigationSectionId.FOLDERS);
        if (shouldIncludeRootSectionSeparator) {
            const spacerKey = sectionSpacerMap.get(NavigationSectionId.FOLDERS);
            if (spacerKey) {
                spacerKeysWithSeparators.add(spacerKey);
            }
        }

        if (
            spacerKeysWithSeparators.size === 0 &&
            folderSeparators.size === 0 &&
            tagSeparators.size === 0 &&
            propertySeparators.size === 0
        ) {
            return items;
        }

        const createCustomSeparator = (key: string): CombinedNavigationItem => ({
            type: NavigationPaneItemType.LIST_SPACER,
            key,
            hasSeparator: true
        });

        const result: CombinedNavigationItem[] = [];

        items.forEach(item => {
            if (item.type === NavigationPaneItemType.TOP_SPACER || item.type === NavigationPaneItemType.LIST_SPACER) {
                if (spacerKeysWithSeparators.has(item.key)) {
                    result.push({ ...item, hasSeparator: true });
                } else {
                    result.push(item);
                }
                return;
            }

            const shouldHideFolderSeparator = item.type === NavigationPaneItemType.FOLDER && item.isExcluded && !showHiddenItems;

            if (item.type === NavigationPaneItemType.FOLDER) {
                if (!shouldHideFolderSeparator && folderSeparators.has(item.data.path)) {
                    result.push(createCustomSeparator(buildFolderSeparatorKey(item.data.path)));
                }
            } else if (
                (item.type === NavigationPaneItemType.TAG || item.type === NavigationPaneItemType.UNTAGGED) &&
                tagSeparators.has(item.data.path)
            ) {
                result.push(createCustomSeparator(buildTagSeparatorKey(item.data.path)));
            } else if (
                (item.type === NavigationPaneItemType.PROPERTY_KEY || item.type === NavigationPaneItemType.PROPERTY_VALUE) &&
                propertySeparators.has(item.data.id)
            ) {
                result.push(createCustomSeparator(buildPropertySeparatorKey(item.data.id)));
            }

            result.push(item);
        });

        return result;
    }, [firstSectionId, items, parsedNavigationSeparators, pinShortcuts, sectionSpacerMap, showHiddenItems]);

    const tagRainbowColors = useMemo(() => {
        const palette = navRainbowPalettes.tag;
        if (!palette) {
            return { colorsByPath: new Map<string, string>(), rootColor: undefined, getInheritedColor: (_path: string) => undefined };
        }

        return buildTagRainbowColors({
            items: tagItems,
            palette,
            scope: navRainbow.tags.scope,
            rootLevel: settings.showAllTagsFolder ? 1 : 0,
            showAllTagsFolder: settings.showAllTagsFolder,
            inheritColors: settings.inheritTagColors
        });
    }, [navRainbow.tags.scope, navRainbowPalettes.tag, settings.inheritTagColors, settings.showAllTagsFolder, tagItems]);

    const propertyRainbowColors = useMemo(() => {
        const palette = navRainbowPalettes.property;
        if (!palette) {
            return { colorsByNodeId: new Map<string, string>(), rootColor: undefined, rootColorsByKey: new Map<string, string>() };
        }

        return buildPropertyRainbowColors({
            items: propertyItems,
            palette,
            scope: navRainbow.properties.scope,
            showAllPropertiesFolder: settings.showAllPropertiesFolder
        });
    }, [navRainbow.properties.scope, navRainbowPalettes.property, propertyItems, settings.showAllPropertiesFolder]);

    const shortcutRainbowColors = useMemo(() => {
        const palette = navRainbowPalettes.shortcut;
        if (!palette) {
            return { colorsByKey: new Map<string, string>(), rootColor: undefined };
        }

        return buildShortcutRainbowColors({
            items: shortcutItems,
            palette
        });
    }, [navRainbowPalettes.shortcut, shortcutItems]);

    const recentRainbowColors = useMemo(() => {
        const palette = navRainbowPalettes.recent;
        if (!palette) {
            return { colorsByKey: new Map<string, string>(), rootColor: undefined };
        }

        return buildRecentRainbowColors({
            items: recentNotesItems,
            palette
        });
    }, [navRainbowPalettes.recent, recentNotesItems]);

    const navRainbowColors = useMemo<NavigationRainbowColors>(
        () => ({
            tag: tagRainbowColors,
            property: propertyRainbowColors,
            shortcut: shortcutRainbowColors,
            recent: recentRainbowColors
        }),
        [propertyRainbowColors, recentRainbowColors, shortcutRainbowColors, tagRainbowColors]
    );
    const decorateItem = useMemo(() => {
        void metadataDecorationVersion;
        return createNavigationItemDecorator({
            app,
            settings,
            navRainbow,
            fileNameIconNeedles,
            getFileDisplayName,
            metadataService,
            parsedExcludedFolders,
            folderDecorationModel,
            navRainbowPalettes,
            navRainbowColors
        });
    }, [
        app,
        fileNameIconNeedles,
        getFileDisplayName,
        metadataDecorationVersion,
        metadataService,
        folderDecorationModel,
        navRainbow,
        navRainbowColors,
        navRainbowPalettes,
        parsedExcludedFolders,
        settings
    ]);

    const itemsWithMetadata = useMemo(() => itemsWithSeparators.map(decorateItem), [decorateItem, itemsWithSeparators]);
    const decoratedRecentNotes = useMemo(() => itemsWithMetadata.filter(isRecentNavigationItem), [itemsWithMetadata]);

    const shortcutItemsWithMetadata = useMemo((): CombinedNavigationItem[] => {
        if (!pinShortcuts) {
            return [];
        }
        return shortcutItems.map(decorateItem);
    }, [decorateItem, pinShortcuts, shortcutItems]);

    const pinnedRecentNotesItems = useMemo((): CombinedNavigationItem[] => {
        if (!shouldPinRecentNotes) {
            return [];
        }
        if (decoratedRecentNotes.length > 0) {
            return decoratedRecentNotes;
        }
        return recentNotesItems.map(decorateItem);
    }, [decorateItem, decoratedRecentNotes, recentNotesItems, shouldPinRecentNotes]);

    const filteredItems = useMemo(() => {
        const baseItems = itemsWithMetadata.filter(current => {
            if (pinShortcuts && isShortcutNavigationItem(current)) {
                return false;
            }
            if (shouldPinRecentNotes && isRecentNavigationItem(current)) {
                return false;
            }
            return true;
        });

        if (showHiddenItems) {
            return baseItems;
        }

        return baseItems.filter(item => {
            if (item.type === NavigationPaneItemType.FOLDER && item.isExcluded) {
                return false;
            }
            return true;
        });
    }, [itemsWithMetadata, pinShortcuts, shouldPinRecentNotes, showHiddenItems]);

    const firstInlineFolderPath = useMemo(() => {
        if (!pinShortcuts) {
            return null;
        }

        let firstInlineItem: CombinedNavigationItem | null = null;
        for (const item of filteredItems) {
            if (SPACER_ITEM_TYPES.has(item.type)) {
                continue;
            }
            firstInlineItem = item;
            break;
        }

        if (!firstInlineItem) {
            return null;
        }

        if (firstInlineItem.type === NavigationPaneItemType.FOLDER) {
            return firstInlineItem.data.path;
        }

        return null;
    }, [filteredItems, pinShortcuts]);

    const filteredItemsForDisplay = useMemo(() => {
        if (!pinShortcuts) {
            return filteredItems;
        }
        if (!firstInlineFolderPath) {
            return filteredItems;
        }

        const { folderSeparators } = parsedNavigationSeparators;
        const hasSeparator = folderSeparators.has(firstInlineFolderPath);
        if (!hasSeparator) {
            return filteredItems;
        }

        const suppressedKey = buildFolderSeparatorKey(firstInlineFolderPath);
        let matchIndex = -1;
        for (let i = 0; i < filteredItems.length; i += 1) {
            const item = filteredItems[i];
            if (item.type === NavigationPaneItemType.LIST_SPACER && item.key === suppressedKey) {
                matchIndex = i;
                break;
            }
        }

        if (matchIndex === -1) {
            return filteredItems;
        }

        const nextItems = filteredItems.slice();
        nextItems.splice(matchIndex, 1);
        return nextItems;
    }, [filteredItems, firstInlineFolderPath, parsedNavigationSeparators, pinShortcuts]);

    const itemsWithRootSpacing = useMemo(() => {
        const tagRootLevel = settings.showAllTagsFolder ? 1 : 0;
        const propertyRootLevel = settings.showAllPropertiesFolder ? 1 : 0;
        return insertRootSpacing(filteredItemsForDisplay, settings.rootLevelSpacing, {
            // Show hidden items reveals the vault root, which nests top-level folders one level deeper;
            // spacing candidates must follow the effective root visibility or root spacers disappear
            showRootFolder: settings.showRootFolder || showHiddenItems,
            tagRootLevel,
            propertyRootLevel
        });
    }, [
        filteredItemsForDisplay,
        settings.rootLevelSpacing,
        settings.showAllPropertiesFolder,
        settings.showAllTagsFolder,
        settings.showRootFolder,
        showHiddenItems
    ]);

    const pathToIndex = useMemo(() => buildNavigationPathIndexMap(itemsWithRootSpacing), [itemsWithRootSpacing]);

    return {
        items: itemsWithRootSpacing,
        itemsWithMetadata,
        firstSectionId,
        firstInlineFolderPath,
        shortcutItemsWithMetadata,
        pinnedRecentNotesItems,
        pathToIndex
    };
}
