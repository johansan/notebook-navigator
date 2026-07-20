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
 * useListPaneData - Manages file list data for the ListPane component
 *
 * This hook handles:
 * - File collection from folders and tags
 * - Sorting and grouping files by date
 * - Separating pinned and unpinned files
 * - Building list items with headers and spacers
 * - Listening to vault changes and updating the file list
 * - Creating efficient lookup maps for file access
 */

import { useMemo, useState } from 'react';
import { TFile, TFolder } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { useFileCache } from '../context/StorageContext';
import { useLocalDayKey } from './useLocalDayKey';
import { ItemType, ListPaneItemType } from '../types';
import type { VisibilityPreferences } from '../types';
import type { ListPaneItem } from '../types/virtualization';
import { createFrontmatterPropertyExclusionMatcher } from '../utils/fileFilters';
import { parseFilterSearchTokens, filterSearchHasActiveCriteria, filterSearchNeedsPropertyLookup } from '../utils/filterSearch';
import type { ListNoteGroupingOption, NotebookNavigatorSettings } from '../settings/types';
import type { FilterSearchTokens } from '../utils/filterSearch';
import type { SearchResultMeta } from '../types/search';
import type { ActiveProfileState } from '../context/SettingsContext';
import type { SearchProvider } from '../types/search';
import type { PropertySelectionNodeId } from '../utils/propertyTree';
import { getFilesForNavigationSelection } from '../utils/selectionUtils';
import { getListSortOverrideForSelection, isManualSortPropertyKey, resolveListSort } from '../utils/sortUtils';
import { applyManualSortMarkdownOrder, getManualSortGroupHeaderPropertyKey } from '../utils/manualSort';
import { getPropertyFieldsFromPropertyKeys } from '../utils/vaultProfiles';
import { buildHiddenFileState, filterListPaneFiles, useOmnisearchListResult, useSearchableNames } from './listPaneData/searchPipeline';
import {
    buildFileIndexMap,
    buildFilePathToIndexMap,
    buildListItems,
    buildOrderedFiles,
    type ListPaneConfig
} from './listPaneData/listItems';
import { useListPaneRefresh } from './listPaneData/useListPaneRefresh';

const EMPTY_SEARCH_META = new Map<string, SearchResultMeta>();

/**
 * Parameters for the useListPaneData hook
 */
interface UseListPaneDataParams {
    /** The type of selection (folder, tag, or property) */
    selectionType: ItemType | null;
    /** The currently selected folder, if any */
    selectedFolder: TFolder | null;
    /** The currently selected tag, if any */
    selectedTag: string | null;
    /** The currently selected property key/value, if any */
    selectedProperty: PropertySelectionNodeId | null;
    /** Plugin settings */
    settings: NotebookNavigatorSettings;
    /** Active profile-derived values */
    activeProfile: ActiveProfileState;
    /** Effective grouping for the current list selection */
    groupBy: ListNoteGroupingOption;
    /** Whether the pinned section is expanded in the current context */
    pinnedGroupExpanded: boolean;
    /** Collapsed list group keys for the current vault */
    collapsedListGroups: ReadonlySet<string>;
    /** Active search provider to use for filtering */
    searchProvider: SearchProvider;
    /** Optional search query to filter files */
    searchQuery?: string;
    /** Pre-parsed search tokens matching the debounced query */
    searchTokens?: FilterSearchTokens;
    /** Visibility preferences that control descendant notes and hidden items */
    visibility: VisibilityPreferences;
    /** Optional markdown path order applied before list items are built */
    propertySortOrderOverride?: readonly string[] | null;
}

/**
 * Return value of the useListPaneData hook
 */
interface UseListPaneDataResult {
    /** List items including headers, files, and spacers for rendering */
    listItems: ListPaneItem[];
    /** Ordered array of files (without headers) for multi-selection */
    orderedFiles: TFile[];
    /** Map from file path to index within orderedFiles array */
    orderedFileIndexMap: Map<string, number>;
    /** Map from file path to list item index for O(1) lookups */
    filePathToIndex: Map<string, number>;
    /** Map from file path to position in files array for multi-selection */
    fileIndexMap: Map<string, number>;
    /** Raw array of files before grouping */
    files: TFile[];
    /** Hidden-state lookup for files shown through the hidden-items override */
    hiddenFileState: ReadonlyMap<string, boolean>;
    /** Search metadata keyed by file path (populated when using Omnisearch) */
    searchMeta: Map<string, SearchResultMeta>;
    /** Local day key in YYYY-MM-DD format */
    localDayKey: string;
}

/**
 * Hook that manages file list data for the ListPane component.
 * Handles file collection, sorting, grouping, and vault change monitoring.
 *
 * @param params - Configuration parameters
 * @returns File list data and lookup maps
 */
export function useListPaneData({
    selectionType,
    selectedFolder,
    selectedTag,
    selectedProperty,
    settings,
    activeProfile,
    groupBy,
    pinnedGroupExpanded,
    collapsedListGroups,
    searchProvider,
    searchQuery,
    searchTokens,
    visibility,
    propertySortOrderOverride
}: UseListPaneDataParams): UseListPaneDataResult {
    const { app, tagTreeService, propertyTreeService, commandQueue, omnisearchService } = useServices();
    const { getFileTimestamps, getDB, getFileDisplayName } = useFileCache();
    const { includeDescendantNotes, showHiddenItems } = visibility;
    const dayKey = useLocalDayKey();

    const [updateKey, setUpdateKey] = useState(0);

    const trimmedQuery = searchQuery?.trim() ?? '';
    const hasSearchQuery = trimmedQuery.length > 0;
    const isOmnisearchAvailable = omnisearchService?.isAvailable() ?? false;
    const useOmnisearch = searchProvider === 'omnisearch' && isOmnisearchAvailable && hasSearchQuery;
    const activeFilterSearchTokens = useMemo(() => {
        if (!trimmedQuery || useOmnisearch) {
            return null;
        }

        const tokens = searchTokens ?? parseFilterSearchTokens(trimmedQuery);
        if (!filterSearchHasActiveCriteria(tokens)) {
            return null;
        }

        return tokens;
    }, [trimmedQuery, useOmnisearch, searchTokens]);
    const hasTaskSearchFilters =
        activeFilterSearchTokens !== null &&
        (activeFilterSearchTokens.requireUnfinishedTasks || activeFilterSearchTokens.excludeUnfinishedTasks);
    const hasPropertySearchFilters = activeFilterSearchTokens !== null && filterSearchNeedsPropertyLookup(activeFilterSearchTokens);
    const hasDateSearchFilters =
        activeFilterSearchTokens !== null &&
        (activeFilterSearchTokens.dateRanges.length > 0 || activeFilterSearchTokens.excludeDateRanges.length > 0);
    const omnisearchPathScope = useMemo(() => {
        if (selectionType !== ItemType.FOLDER || !selectedFolder) {
            return undefined;
        }
        if (selectedFolder.path === '/') {
            return undefined;
        }
        return selectedFolder.path;
    }, [selectionType, selectedFolder]);
    const { hiddenFolders, descendantExcludedFolders, hiddenFileProperties, hiddenFileNames, hiddenTags, hiddenFileTags, fileVisibility } =
        activeProfile;
    const hiddenFilePropertyMatcher = useMemo(
        () => createFrontmatterPropertyExclusionMatcher(hiddenFileProperties),
        [hiddenFileProperties]
    );
    const selectedFolderPath = selectionType === ItemType.FOLDER ? (selectedFolder?.path ?? null) : null;
    const selectedSortOverride = getListSortOverrideForSelection(settings, selectionType, selectedFolder, selectedTag, selectedProperty);
    const selectedFolderGroupSortOrder = settings.folderTreeSortOverrides?.[selectedFolderPath ?? '/'] ?? settings.folderSortOrder;
    const listConfig = useMemo<ListPaneConfig>(
        () => ({
            pinnedNotes: settings.pinnedNotes,
            filterPinnedByFolder: settings.filterPinnedByFolder,
            pinnedGroupExpanded,
            showTags: settings.showTags,
            showFileTags: settings.showFileTags,
            showFolderGroupPaths: settings.showFolderGroupPaths,
            showCurrentFolderFilesAtBottom: settings.showCurrentFolderFilesAtBottom,
            groupBy,
            folderGroupSortOrder: selectedFolderGroupSortOrder
        }),
        [
            settings.filterPinnedByFolder,
            selectedFolderGroupSortOrder,
            groupBy,
            pinnedGroupExpanded,
            settings.pinnedNotes,
            settings.showCurrentFolderFilesAtBottom,
            settings.showFolderGroupPaths,
            settings.showFileTags,
            settings.showTags
        ]
    );

    const sortSpec = useMemo(() => resolveListSort(settings, selectedSortOverride), [settings, selectedSortOverride]);
    const sortOption = sortSpec.option;
    const activePropertyFields = useMemo(() => getPropertyFieldsFromPropertyKeys(activeProfile.propertyKeys), [activeProfile.propertyKeys]);

    const baseFiles = useMemo(() => {
        return getFilesForNavigationSelection(
            {
                selectionType,
                selectedFolder,
                selectedTag,
                selectedProperty
            },
            settings,
            visibility,
            app,
            tagTreeService,
            propertyTreeService
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps -- updateKey refreshes storage data while getFilesForNavigationSelection is static.
    }, [
        selectionType,
        selectedFolder,
        selectedTag,
        selectedProperty,
        activeProfile.profile.id,
        activeProfile.hiddenFolders,
        descendantExcludedFolders,
        activeProfile.hiddenFileProperties,
        activeProfile.hiddenFileNames,
        activeProfile.hiddenTags,
        activeProfile.hiddenFileTags,
        activeProfile.fileVisibility,
        settings.enableFolderNotes,
        settings.hideFolderNoteInList,
        settings.hideDrawingPreviewImages,
        settings.folderNoteName,
        settings.folderNoteNamePattern,
        settings.useFrontmatterMetadata,
        settings.frontmatterNameField,
        settings.frontmatterCreatedField,
        settings.frontmatterModifiedField,
        settings.frontmatterDateFormat,
        settings.filterPinnedByFolder,
        settings.pinnedNotes,
        settings.defaultFolderSort,
        settings.propertySortKey,
        settings.manualSortPropertyKey,
        settings.propertySortSecondary,
        activePropertyFields,
        settings.showProperties,
        selectedSortOverride,
        propertyTreeService,
        includeDescendantNotes,
        showHiddenItems,
        app,
        tagTreeService,
        updateKey
    ]);

    const basePathSet = useMemo(() => new Set(baseFiles.map(file => file.path)), [baseFiles]);
    const omnisearchResult = useOmnisearchListResult({
        basePathSet,
        omnisearchPathScope,
        omnisearchService,
        trimmedQuery,
        useOmnisearch
    });
    const searchableNames = useSearchableNames({ app, baseFiles, getFileDisplayName });
    const filterSettings = useMemo(() => ({ alphabeticalDateMode: settings.alphabeticalDateMode }), [settings.alphabeticalDateMode]);

    const filterResult = useMemo(() => {
        return filterListPaneFiles({
            app,
            baseFiles,
            getDB,
            getFileTimestamps,
            omnisearchResult,
            searchTokens,
            searchableNames,
            settings: filterSettings,
            sortOption,
            trimmedQuery,
            useOmnisearch
        });
    }, [
        app,
        baseFiles,
        getDB,
        getFileTimestamps,
        filterSettings,
        omnisearchResult,
        searchTokens,
        searchableNames,
        sortOption,
        trimmedQuery,
        useOmnisearch
    ]);
    const filteredFiles = filterResult.files;

    const files = useMemo(() => {
        if (!propertySortOrderOverride || propertySortOrderOverride.length === 0) {
            return filteredFiles;
        }

        return applyManualSortMarkdownOrder(filteredFiles, propertySortOrderOverride);
    }, [filteredFiles, propertySortOrderOverride]);

    const hiddenFileState = useMemo(() => {
        return buildHiddenFileState({
            app,
            files,
            getDB,
            hiddenFileNames,
            hiddenFilePropertyMatcher,
            hiddenFileTags,
            hiddenFolders,
            hideDrawingPreviewImages: settings.hideDrawingPreviewImages,
            showHiddenItems
        });
    }, [
        files,
        getDB,
        hiddenFolders,
        hiddenFilePropertyMatcher,
        hiddenFileNames,
        hiddenFileTags,
        settings.hideDrawingPreviewImages,
        showHiddenItems,
        app
    ]);

    const searchMetaMap = useMemo(() => {
        if (useOmnisearch && omnisearchResult) {
            return omnisearchResult.meta;
        }
        return EMPTY_SEARCH_META;
    }, [useOmnisearch, omnisearchResult]);
    const isManualSortActive = useMemo(
        () => isManualSortPropertyKey({ manualSortPropertyKey: settings.manualSortPropertyKey }, sortSpec.propertyKey),
        [settings.manualSortPropertyKey, sortSpec.propertyKey]
    );
    const manualSortGroupHeaderPropertyKey = getManualSortGroupHeaderPropertyKey(settings);
    const shouldRefreshOnCustomGroupHeaderMetadataChange = groupBy === 'custom' && manualSortGroupHeaderPropertyKey !== null;

    const listItems = useMemo(() => {
        return buildListItems({
            app,
            dayKey,
            fileVisibility,
            files,
            getDB,
            getFileTimestamps,
            hiddenFileState,
            hiddenTags,
            listConfig,
            collapsedListGroups,
            matchedAliases: filterResult.matchedAliases,
            matchedProperties: filterResult.matchedProperties,
            searchMetaMap,
            selectedFolder,
            selectedTag,
            selectedProperty,
            selectionType,
            showHiddenItems,
            sortOption,
            propertySortKey: sortSpec.propertyKey,
            isManualSortActive,
            manualSortGroupHeaderPropertyKey,
            wordCountTargetProperty: settings.wordCountTargetProperty
        });
    }, [
        app,
        dayKey,
        fileVisibility,
        files,
        getDB,
        getFileTimestamps,
        hiddenFileState,
        hiddenTags,
        listConfig,
        collapsedListGroups,
        filterResult.matchedAliases,
        filterResult.matchedProperties,
        selectedFolder,
        selectedTag,
        selectedProperty,
        selectionType,
        searchMetaMap,
        showHiddenItems,
        sortOption,
        sortSpec.propertyKey,
        isManualSortActive,
        manualSortGroupHeaderPropertyKey,
        settings.wordCountTargetProperty
    ]);

    const filePathToIndex = useMemo(() => {
        return buildFilePathToIndexMap(listItems);
    }, [listItems]);

    const fileIndexMap = useMemo(() => {
        return buildFileIndexMap(files);
    }, [files]);

    const { orderedFiles, orderedFileIndexMap } = useMemo<{
        orderedFiles: TFile[];
        orderedFileIndexMap: Map<string, number>;
    }>(() => {
        return buildOrderedFiles(listItems);
    }, [listItems]);
    const customGroupHeaderState = useMemo(() => {
        const filePaths = new Set<string>();
        let hasWordCountGroupHeaders = false;

        listItems.forEach(item => {
            if (item.type !== ListPaneItemType.HEADER || item.headerKind !== 'manual-sort-custom') {
                return;
            }

            if (item.manualSortHeaderFilePath) {
                filePaths.add(item.manualSortHeaderFilePath);
            }

            if (item.manualSortHeaderShowsWordCount === true) {
                hasWordCountGroupHeaders = true;
            }
        });

        return { filePaths, hasWordCountGroupHeaders };
    }, [listItems]);

    useListPaneRefresh({
        app,
        basePathSet,
        commandQueue,
        customGroupHeaderFilePaths: customGroupHeaderState.filePaths,
        dayKey,
        files,
        getDB,
        groupBy,
        hasDateSearchFilters,
        hasManualSortWordCountGroupHeaders: customGroupHeaderState.hasWordCountGroupHeaders,
        hasPropertySearchFilters,
        hasTaskSearchFilters,
        hiddenFilePropertyMatcher,
        hiddenFileTags,
        includeDescendantNotes,
        manualSortGroupHeaderPropertyKey,
        onRefresh: () => setUpdateKey(current => current + 1),
        propertyTreeService,
        selectedFolder,
        selectedProperty,
        selectedTag,
        selectionType,
        settings,
        shouldRefreshOnCustomGroupHeaderMetadataChange,
        showHiddenItems,
        sortOption,
        propertySortKey: sortSpec.propertyKey,
        propertySortSecondary: sortSpec.propertySortSecondary
    });

    return {
        listItems,
        orderedFiles,
        orderedFileIndexMap,
        filePathToIndex,
        fileIndexMap,
        files,
        hiddenFileState,
        searchMeta: searchMetaMap,
        localDayKey: dayKey
    };
}
