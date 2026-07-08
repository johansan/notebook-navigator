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
 * useNavigationPaneData - Manages navigation tree data for the NavigationPane component
 *
 * This hook handles:
 * - Building folder tree from vault structure
 * - Building tag tree with virtual folders
 * - Combining and ordering navigation items
 * - Computing folder and tag counts
 * - Creating efficient lookup maps
 * - Listening to vault changes
 * - Managing tag expansion state
 */

import { TFolder } from 'obsidian';
import { useServices, useMetadataService } from '../../context/ServicesContext';
import { useRecentData } from '../../context/RecentDataContext';
import { useFileCache } from '../../context/StorageContext';
import { useShortcuts } from '../../context/ShortcutsContext';
import { useUXPreferences } from '../../context/UXPreferencesContext';
import type { NavigationSectionId } from '../../types';
import { PropertyTreeNode, TagTreeNode } from '../../types/storage';
import type { CombinedNavigationItem } from '../../types/virtualization';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { NoteCountInfo } from '../../types/noteCounts';
import type { NavigationRainbowState } from '../useNavigationRainbowState';
import { useSettingsDerived } from '../../context/SettingsContext';
import { useNavigationNoteCounts } from './data/useNavigationNoteCounts';
import { useNavigationPaneItemPipeline } from './data/useNavigationPaneItemPipeline';
import { useNavigationPaneListSections } from './data/useNavigationPaneListSections';
import type { NavigationPaneSourceState } from './data/useNavigationPaneSourceState';
import type { NavigationPaneTreeSectionsResult } from './data/useNavigationPaneTreeSections';
import type { FolderDecorationModel } from '../../utils/folderDecoration';

/**
 * Parameters for the useNavigationPaneData hook
 */
interface UseNavigationPaneDataParams {
    /** Plugin settings */
    settings: NotebookNavigatorSettings;
    /** Whether the navigation pane is currently visible */
    isVisible: boolean;
    /** Shared navigation source state */
    sourceState: NavigationPaneSourceState;
    /** Precomputed navigation tree sections shared with file-list decoration */
    treeSections: NavigationPaneTreeSectionsResult;
    /** Shared folder decoration model */
    folderDecorationModel: FolderDecorationModel;
    /** Shared navigation rainbow state */
    navRainbowState: NavigationRainbowState;
    /** Whether the shortcuts virtual folder is expanded */
    shortcutsExpanded: boolean;
    /** Whether the recent files virtual folder is expanded */
    recentNotesExpanded: boolean;
    /** Whether shortcuts should be pinned at the top of the pane */
    pinShortcuts: boolean;
    /** Preferred ordering of navigation sections */
    sectionOrder: NavigationSectionId[];
}

/**
 * Return value of the useNavigationPaneData hook
 */
interface UseNavigationPaneDataResult {
    /** Combined list of navigation items (folders and tags) */
    items: CombinedNavigationItem[];
    /** First visible navigation section when shortcuts are inlined */
    firstSectionId: NavigationSectionId | null;
    /** First folder path rendered inline after spacers when shortcuts are pinned */
    firstInlineFolderPath: string | null;
    /** Shortcuts rendered separately when pinShortcuts is enabled */
    shortcutItems: CombinedNavigationItem[];
    /** Whether the tags virtual folder has visible children */
    tagsVirtualFolderHasChildren: boolean;
    /** Whether the properties section is available in navigation */
    propertiesSectionActive: boolean;
    /** Recent files items rendered in the pinned area when pinning is enabled */
    pinnedRecentNotesItems: CombinedNavigationItem[];
    /** Whether recent files are pinned with shortcuts */
    shouldPinRecentNotes: boolean;
    /** Map from item keys to index in items array */
    pathToIndex: Map<string, number>;
    /** Map from tag path to current/descendant note counts */
    tagCounts: Map<string, NoteCountInfo>;
    /** Map from property node id to current/descendant note counts */
    propertyCounts: Map<string, NoteCountInfo>;
    /** Map from folder path to current/descendant note counts */
    folderCounts: Map<string, NoteCountInfo>;
    /** Ordered list of root-level folders */
    rootLevelFolders: TFolder[];
    /** Paths from settings that are not currently present in the vault */
    missingRootFolderPaths: string[];
    /** Final ordered keys used for rendering root-level tags in navigation */
    resolvedRootTagKeys: string[];
    /** Combined tag tree used for ordering (includes hidden roots) */
    rootOrderingTagTree: Map<string, TagTreeNode>;
    /** Map from tag path to custom order index */
    rootTagOrderMap: Map<string, number>;
    /** Paths for tags in custom order that are not currently present */
    missingRootTagPaths: string[];
    /** Final ordered keys used for rendering root-level properties in navigation */
    resolvedRootPropertyKeys: string[];
    /** Property tree used for ordering (includes configured keys) */
    rootOrderingPropertyTree: Map<string, PropertyTreeNode>;
    /** Map from property key to custom order index */
    rootPropertyOrderMap: Map<string, number>;
    /** Keys for properties in custom order that are not currently present */
    missingRootPropertyKeys: string[];
    /** Version marker that bumps when vault file structure changes */
    vaultChangeVersion: number;
    /** Path to the navigation banner from the active vault profile */
    navigationBannerPath: string | null;
}

/**
 * Hook that manages navigation tree data for the NavigationPane component.
 * Handles folder and tag tree building, counts, and vault change monitoring.
 *
 * @param params - Configuration parameters
 * @returns Navigation items and lookup maps
 */
export function useNavigationPaneData({
    settings,
    isVisible,
    sourceState,
    treeSections,
    folderDecorationModel,
    navRainbowState,
    shortcutsExpanded,
    recentNotesExpanded,
    pinShortcuts,
    sectionOrder
}: UseNavigationPaneDataParams): UseNavigationPaneDataResult {
    const { app } = useServices();
    const { fileNameIconNeedles } = useSettingsDerived();
    const { recentNotes } = useRecentData();
    const metadataService = useMetadataService();
    const { getFileDisplayName } = useFileCache();
    const { hydratedShortcuts } = useShortcuts();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const {
        effectiveFrontmatterExclusions,
        hiddenFolders,
        descendantExcludedFolders,
        hiddenFileTags,
        fileVisibility,
        navigationBannerPath,
        folderCountFileNameMatcher,
        rootLevelFolders,
        missingRootFolderPaths,
        untaggedCount,
        visibleTaggedCount,
        rootTagOrderMap,
        missingRootTagPaths,
        rootPropertyOrderMap,
        missingRootPropertyKeys,
        metadataDecorationVersion,
        metadataVisibilityVersion,
        tagDataVersion,
        fileChangeVersion,
        folderChangeVersion
    } = sourceState;

    const {
        folderItems,
        tagItems,
        rootOrderingTagTree,
        resolvedRootTagKeys,
        tagsVirtualFolderHasChildren,
        renderPropertyTree,
        rootOrderingPropertyTree,
        propertyItems,
        propertiesSectionActive,
        resolvedRootPropertyKeys,
        propertyCollectionCount
    } = treeSections;

    /**
     * Pre-compute parsed excluded folders to avoid repeated parsing
     */
    const parsedExcludedFolders = hiddenFolders;

    const { shortcutItems, recentNotesItems, shouldPinRecentNotes } = useNavigationPaneListSections({
        app,
        settings,
        sourceState,
        hydratedShortcuts,
        recentNotes,
        shortcutsExpanded,
        recentNotesExpanded,
        pinShortcuts,
        propertiesSectionActive
    });

    const {
        items,
        itemsWithMetadata,
        firstSectionId,
        firstInlineFolderPath,
        shortcutItemsWithMetadata,
        pinnedRecentNotesItems,
        pathToIndex
    } = useNavigationPaneItemPipeline({
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
    });

    const { tagCounts, propertyCounts, folderCounts } = useNavigationNoteCounts({
        app,
        isVisible,
        settings,
        propertiesSectionActive,
        itemsWithMetadata,
        includeDescendantNotes,
        visibleTaggedCount,
        untaggedCount,
        renderPropertyTree,
        propertyCollectionCount,
        effectiveFrontmatterExclusions,
        hiddenFolders,
        descendantExcludedFolders,
        hiddenFileTags,
        showHiddenItems,
        folderCountFileNameMatcher,
        fileVisibility,
        folderChangeVersion,
        vaultChangeVersion: fileChangeVersion,
        metadataVisibilityVersion,
        tagDataVersion
    });

    return {
        items,
        firstSectionId,
        firstInlineFolderPath,
        shortcutItems: shortcutItemsWithMetadata,
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
        rootTagOrderMap,
        missingRootTagPaths,
        resolvedRootPropertyKeys,
        rootOrderingPropertyTree,
        rootPropertyOrderMap,
        missingRootPropertyKeys,
        vaultChangeVersion: fileChangeVersion,
        navigationBannerPath
    };
}
