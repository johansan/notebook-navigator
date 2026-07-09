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

import { useMemo } from 'react';
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
import { getDirectPropertyKeyNoteCount } from '../../../utils/propertyTree';
import { createHiddenTagVisibility } from '../../../utils/tagPrefixMatcher';
import { excludeFromTagTree } from '../../../utils/tagTree';
import { getPropertyKeySet } from '../../../utils/vaultProfiles';
import type { FolderNavigationSourceState } from '../../useFolderNavigationSourceState';
import { useRootPropertyOrder } from '../../useRootPropertyOrder';
import { useRootTagOrder } from '../../useRootTagOrder';
import {
    comparePropertyKeyNodesAlphabetically,
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
    rootLevelFolders: TFolder[];
    rootFolderOrderMap: Map<string, number>;
    missingRootFolderPaths: string[];
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
        rootLevelFolders,
        rootFolderOrderMap,
        missingRootFolderPaths,
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
            rootLevelFolders,
            rootFolderOrderMap,
            missingRootFolderPaths,
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
            rootLevelFolders,
            rootFolderOrderMap,
            missingRootFolderPaths,
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
