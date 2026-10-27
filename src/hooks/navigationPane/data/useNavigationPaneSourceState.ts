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

import { useCallback, useMemo } from 'react';
import { TFolder, type App } from 'obsidian';
import type { ShortcutsContextValue } from '../../../context/ShortcutsContext';
import type { ActiveProfileState } from '../../../context/SettingsContext';
import type { StorageFileData } from '../../../context/storage/storageFileData';
import type { NotebookNavigatorSettings } from '../../../settings/types';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../../../types';
import type { PropertyTreeNode, TagTreeNode } from '../../../types/storage';
import { isPropertyShortcut } from '../../../types/shortcuts';
import { createFileHiddenMatcher, getEffectiveFrontmatterExclusions } from '../../../utils/exclusionUtils';
import {
    createFrontmatterPropertyExclusionMatcher,
    createHiddenFileNameMatcherForVisibility,
    type HiddenFileNameMatcher
} from '../../../utils/fileFilters';
import { getDirectPropertyKeyNoteCount, getTotalPropertyNoteCount } from '../../../utils/propertyTree';
import { createHiddenTagVisibility } from '../../../utils/tagPrefixMatcher';
import { excludeFromTagTree, findTagNode } from '../../../utils/tagTree';
import { compareByAlphaSortOrder } from '../../../utils/sortUtils';
import { getTagChildName } from '../../../utils/treeFlattener';
import { useChildOrderAppend } from '../../useChildOrderAppend';
import { getPropertyKeySet } from '../../../utils/vaultProfiles';
import type { FolderNavigationSourceState } from '../../useFolderNavigationSourceState';
import { useRootPropertyOrder } from '../../useRootPropertyOrder';
import { useRootTagOrder } from '../../useRootTagOrder';
import {
    comparePropertyKeyNodesAlphabetically,
    comparePropertyValueNodesAlphabetically,
    compareTagAlphabetically,
    createPropertyComparator,
    createTagComparator,
    type PropertyNodeComparator,
    type TagComparator
} from './navigationComparators';

export interface UseNavigationPaneSourceStateParams {
    app: App;
    settings: NotebookNavigatorSettings;
    activeProfile: ActiveProfileState;
    folderNavigationSource: FolderNavigationSourceState;
    fileData: StorageFileData;
    hydratedShortcuts: ShortcutsContextValue['hydratedShortcuts'];
    showHiddenItems: boolean;
    includeDescendantNotes: boolean;
}

export interface NavigationPaneSourceState {
    effectiveFrontmatterExclusions: string[];
    hiddenFolders: string[];
    descendantExcludedFolders: string[];
    hiddenTags: string[];
    hiddenFileProperties: string[];
    hiddenFileNames: string[];
    hiddenFileTags: string[];
    fileVisibility: ActiveProfileState['fileVisibility'];
    navigationBannerPath: string | null;
    folderCountFileNameMatcher: HiddenFileNameMatcher | null;
    hiddenFilePropertyMatcher: ReturnType<typeof createFrontmatterPropertyExclusionMatcher>;
    rootFolders: TFolder[];
    tagTree: Map<string, TagTreeNode>;
    propertyTree: Map<string, PropertyTreeNode>;
    untaggedCount: number;
    visibleTaggedCount: number;
    hiddenTagMatcher: ReturnType<typeof createHiddenTagVisibility>['matcher'];
    hiddenMatcherHasRules: boolean;
    visibleTagTree: Map<string, TagTreeNode>;
    hasRootPropertyShortcut: boolean;
    tagComparator: TagComparator | undefined;
    hiddenRootTagNodes: Map<string, TagTreeNode>;
    tagTreeForOrdering: Map<string, TagTreeNode>;
    rootTagOrderMap: Map<string, number>;
    missingRootTagPaths: string[];
    propertyKeyComparator: PropertyNodeComparator;
    rootPropertyOrderMap: Map<string, number>;
    missingRootPropertyKeys: string[];
    visiblePropertyNavigationKeySet: ReadonlySet<string>;
    metadataDecorationVersion: number;
    metadataVisibilityVersion: number;
    tagDataVersion: number;
    propertyDataVersion: number;
    getFolderSortName: (folder: TFolder) => string;
    folderExclusionByFolderNote: ((folder: TFolder) => boolean) | undefined;
    recentNotesHiddenFileMatcher: ReturnType<typeof createFileHiddenMatcher>;
    fileChangeVersion: number;
    folderChangeVersion: number;
}

export function useNavigationPaneSourceState({
    app,
    settings,
    activeProfile,
    folderNavigationSource,
    fileData,
    hydratedShortcuts,
    showHiddenItems,
    includeDescendantNotes
}: UseNavigationPaneSourceStateParams): NavigationPaneSourceState {
    const {
        hiddenFolders: profileHiddenFolders,
        descendantExcludedFolders,
        hiddenFileProperties,
        hiddenFileNames,
        hiddenTags,
        hiddenFileTags,
        fileVisibility,
        navigationBanner
    } = activeProfile;
    const navigationBannerPath = navigationBanner;
    const effectiveFrontmatterExclusions = getEffectiveFrontmatterExclusions(settings, showHiddenItems);

    const folderCountFileNameMatcher = useMemo(() => {
        return createHiddenFileNameMatcherForVisibility(hiddenFileNames, showHiddenItems);
    }, [hiddenFileNames, showHiddenItems]);
    const hiddenFilePropertyMatcher = useMemo(
        () => createFrontmatterPropertyExclusionMatcher(hiddenFileProperties),
        [hiddenFileProperties]
    );

    const {
        hiddenFolders,
        rootFolders,
        fileChangeVersion,
        folderChangeVersion,
        metadataDecorationVersion,
        metadataVisibilityVersion,
        tagDataVersion,
        propertyDataVersion,
        getFolderSortName,
        folderExclusionByFolderNote
    } = folderNavigationSource;

    const tagTree = useMemo(() => fileData.tagTree ?? new Map<string, TagTreeNode>(), [fileData.tagTree]);
    const propertyTree = useMemo(() => fileData.propertyTree ?? new Map<string, PropertyTreeNode>(), [fileData.propertyTree]);
    const untaggedCount = fileData.untagged;

    const hiddenTagVisibility = useMemo(() => createHiddenTagVisibility(hiddenTags, showHiddenItems), [hiddenTags, showHiddenItems]);
    const hiddenTagMatcher = hiddenTagVisibility.matcher;
    const hiddenMatcherHasRules = hiddenTagVisibility.hasHiddenRules;

    const visibleTagTree = useMemo(() => {
        if (!hiddenMatcherHasRules || showHiddenItems) {
            return tagTree;
        }
        return excludeFromTagTree(tagTree, hiddenTagMatcher);
    }, [tagTree, hiddenMatcherHasRules, showHiddenItems, hiddenTagMatcher]);

    const visibleTaggedCount = fileData.tagged ?? 0;

    const hasRootPropertyShortcut = useMemo(() => {
        return hydratedShortcuts.some(({ shortcut, propertyNodeId }) => {
            if (!isPropertyShortcut(shortcut)) {
                return false;
            }

            return propertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID || shortcut.nodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
        });
    }, [hydratedShortcuts]);

    const tagComparator = useMemo(
        () => createTagComparator(settings.tagSortOrder, includeDescendantNotes),
        [settings.tagSortOrder, includeDescendantNotes]
    );

    const hiddenRootTagNodes = useMemo(() => {
        if (!settings.showTags || showHiddenItems) {
            return new Map<string, TagTreeNode>();
        }
        return fileData.hiddenRootTags ?? new Map<string, TagTreeNode>();
    }, [fileData.hiddenRootTags, showHiddenItems, settings.showTags]);

    const tagTreeForOrdering = useMemo(() => {
        if (hiddenRootTagNodes.size === 0) {
            return tagTree;
        }
        const combined = new Map<string, TagTreeNode>(tagTree);
        hiddenRootTagNodes.forEach((node, path) => {
            if (!combined.has(path)) {
                combined.set(path, node);
            }
        });
        return combined;
    }, [hiddenRootTagNodes, tagTree]);

    const { rootTagOrderMap, missingRootTagPaths } = useRootTagOrder({
        settings,
        tagTree: tagTreeForOrdering,
        comparator: tagComparator ?? compareTagAlphabetically
    });

    const propertyKeyComparator = useMemo(() => {
        return createPropertyComparator({
            order: settings.propertySortOrder,
            compareAlphabetically: comparePropertyKeyNodesAlphabetically,
            getFrequency: node => (includeDescendantNotes ? node.notesWithValue.size : getDirectPropertyKeyNoteCount(node))
        });
    }, [includeDescendantNotes, settings.propertySortOrder]);

    const { rootPropertyOrderMap, missingRootPropertyKeys } = useRootPropertyOrder({
        settings,
        propertyTree,
        comparator: propertyKeyComparator
    });

    // New nested tags and property values join the end of a manually ordered parent, in the order the tree shows them
    const getNewTagChildNames = useCallback(
        (parentPath: string, storedOrder: readonly string[]): string[] => {
            const parent = findTagNode(tagTreeForOrdering, parentPath);
            if (!parent) {
                return [];
            }
            const override = Object.prototype.hasOwnProperty.call(settings.tagTreeSortOverrides, parentPath)
                ? settings.tagTreeSortOverrides[parentPath]
                : undefined;
            const compare: TagComparator = override
                ? (a, b) => compareByAlphaSortOrder(a.name, b.name, override)
                : (tagComparator ?? compareTagAlphabetically);
            return Array.from(parent.children.values())
                .filter(child => !storedOrder.includes(getTagChildName(child.path)))
                .sort(compare)
                .map(child => getTagChildName(child.path));
        },
        [settings.tagTreeSortOverrides, tagComparator, tagTreeForOrdering]
    );
    useChildOrderAppend({
        settingsKey: 'tagChildOrder',
        contentType: 'tags',
        getNewChildNames: getNewTagChildNames
    });

    const getNewPropertyValueNames = useCallback(
        (keyNodeId: string, storedOrder: readonly string[]): string[] => {
            const keyNode = Array.from(propertyTree.values()).find(node => node.id === keyNodeId);
            if (!keyNode) {
                return [];
            }
            const compare = createPropertyComparator({
                order: Object.prototype.hasOwnProperty.call(settings.propertyTreeSortOverrides, keyNodeId)
                    ? settings.propertyTreeSortOverrides[keyNodeId]
                    : settings.propertySortOrder,
                compareAlphabetically: comparePropertyValueNodesAlphabetically,
                getFrequency: node =>
                    includeDescendantNotes && node.valuePath ? getTotalPropertyNoteCount(keyNode, node.valuePath) : node.notesWithValue.size
            });
            return Array.from(keyNode.children.values())
                .filter(child => child.valuePath !== null && !storedOrder.includes(child.valuePath))
                .sort(compare)
                .map(child => child.valuePath ?? '');
        },
        [includeDescendantNotes, propertyTree, settings.propertySortOrder, settings.propertyTreeSortOverrides]
    );
    useChildOrderAppend({
        settingsKey: 'propertyChildOrder',
        contentType: 'properties',
        getNewChildNames: getNewPropertyValueNames
    });

    const visiblePropertyNavigationKeySet = useMemo(
        () => getPropertyKeySet(activeProfile.propertyKeys, 'navigation'),
        [activeProfile.propertyKeys]
    );

    const recentNotesHiddenFileMatcher = useMemo(() => {
        return createFileHiddenMatcher(
            {
                hiddenFileProperties,
                hiddenFolders: profileHiddenFolders,
                hiddenFileNames,
                hiddenFileTags,
                hideDrawingPreviewImages: settings.hideDrawingPreviewImages
            },
            app,
            showHiddenItems
        );
    }, [
        app,
        showHiddenItems,
        hiddenFileProperties,
        profileHiddenFolders,
        hiddenFileNames,
        hiddenFileTags,
        settings.hideDrawingPreviewImages
    ]);

    return useMemo(
        () => ({
            effectiveFrontmatterExclusions,
            hiddenFolders,
            descendantExcludedFolders,
            hiddenTags,
            hiddenFileProperties,
            hiddenFileNames,
            hiddenFileTags,
            fileVisibility,
            navigationBannerPath,
            folderCountFileNameMatcher,
            hiddenFilePropertyMatcher,
            rootFolders,
            tagTree,
            propertyTree,
            untaggedCount,
            visibleTaggedCount,
            hiddenTagMatcher,
            hiddenMatcherHasRules,
            visibleTagTree,
            hasRootPropertyShortcut,
            tagComparator,
            hiddenRootTagNodes,
            tagTreeForOrdering,
            rootTagOrderMap,
            missingRootTagPaths,
            propertyKeyComparator,
            rootPropertyOrderMap,
            missingRootPropertyKeys,
            visiblePropertyNavigationKeySet,
            metadataDecorationVersion,
            metadataVisibilityVersion,
            tagDataVersion,
            propertyDataVersion,
            getFolderSortName,
            folderExclusionByFolderNote,
            recentNotesHiddenFileMatcher,
            fileChangeVersion,
            folderChangeVersion
        }),
        [
            effectiveFrontmatterExclusions,
            descendantExcludedFolders,
            hiddenFolders,
            hiddenTags,
            hiddenFileProperties,
            hiddenFileNames,
            hiddenFileTags,
            fileVisibility,
            navigationBannerPath,
            folderCountFileNameMatcher,
            hiddenFilePropertyMatcher,
            rootFolders,
            tagTree,
            propertyTree,
            untaggedCount,
            visibleTaggedCount,
            hiddenTagMatcher,
            hiddenMatcherHasRules,
            visibleTagTree,
            hasRootPropertyShortcut,
            tagComparator,
            hiddenRootTagNodes,
            tagTreeForOrdering,
            rootTagOrderMap,
            missingRootTagPaths,
            propertyKeyComparator,
            rootPropertyOrderMap,
            missingRootPropertyKeys,
            visiblePropertyNavigationKeySet,
            metadataDecorationVersion,
            metadataVisibilityVersion,
            tagDataVersion,
            propertyDataVersion,
            getFolderSortName,
            folderExclusionByFolderNote,
            recentNotesHiddenFileMatcher,
            fileChangeVersion,
            folderChangeVersion
        ]
    );
}
