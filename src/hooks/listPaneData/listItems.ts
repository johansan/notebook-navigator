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

import { TFile, TFolder, normalizePath } from 'obsidian';
import type { App } from 'obsidian';
import type { AlphaSortOrder, NotebookNavigatorSettings, SortOption } from '../../settings';
import { ListPaneItemType, ItemType, PINNED_SECTION_HEADER_KEY } from '../../types';
import type { ListPaneItem } from '../../types/virtualization';
import { strings } from '../../i18n';
import { FILE_VISIBILITY, type FileVisibility } from '../../utils/fileTypeUtils';
import { compareByAlphaSortOrder, getDateField, isDateSortOption, isPropertySortOption } from '../../utils/sortUtils';
import { partitionPinnedFiles } from '../../utils/fileFinder';
import {
    formatManualSortGroupHeaderLabel,
    getCachedManualSortGroupHeader,
    getCachedManualSortRank,
    normalizeManualSortGroupHeaderWordCount,
    shouldShowManualSortGroupHeaderWordCount,
    type ManualSortGroupHeaderData
} from '../../utils/manualSort';
import { getCachedWordCountTargetFromFrontmatter, getWordCountTargetFromProperties } from '../../utils/wordCountUtils';
import { createHiddenTagVisibility } from '../../utils/tagPrefixMatcher';
import { getCachedFileTags } from '../../utils/tagUtils';
import { DateUtils } from '../../utils/dateUtils';
import { buildListGroupCollapseKey } from '../../utils/listGroupCollapse';
import type { SearchResultMeta } from '../../types/search';
import type { IndexedDBStorage } from '../../storage/IndexedDBStorage';
import type { ListNoteGroupingOption } from '../../settings/types';
import type { PropertySelectionNodeId } from '../../utils/propertyTree';

export interface ListPaneConfig {
    filterPinnedByFolder: boolean;
    folderGroupSortOrder: AlphaSortOrder;
    groupBy: ListNoteGroupingOption;
    pinnedGroupExpanded: boolean;
    pinnedNotes: NotebookNavigatorSettings['pinnedNotes'];
    showFileTags: boolean;
    showTags: boolean;
}

interface BuildListItemsArgs {
    app: App;
    dayKey: string;
    fileVisibility: FileVisibility;
    files: TFile[];
    getDB: () => IndexedDBStorage;
    getFileTimestamps: (file: TFile) => { created: number; modified: number };
    hiddenFileState: ReadonlyMap<string, boolean>;
    hiddenTags: string[];
    listConfig: ListPaneConfig;
    collapsedListGroups?: ReadonlySet<string>;
    searchMetaMap: ReadonlyMap<string, SearchResultMeta>;
    selectedFolder: TFolder | null;
    selectedTag?: string | null;
    selectedProperty?: PropertySelectionNodeId | null;
    selectionType: ItemType | null;
    showHiddenItems: boolean;
    sortOption: SortOption;
    propertySortKey?: string;
    isManualSortActive?: boolean;
    manualSortGroupHeaderPropertyKey?: string | null;
    wordCountTargetProperty?: string;
}

export function buildListItems({
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
    searchMetaMap,
    selectedFolder,
    selectedTag = null,
    selectedProperty = null,
    selectionType,
    showHiddenItems,
    sortOption,
    propertySortKey = '',
    isManualSortActive = false,
    manualSortGroupHeaderPropertyKey = null,
    wordCountTargetProperty = ''
}: BuildListItemsArgs): ListPaneItem[] {
    const items: ListPaneItem[] = [
        {
            type: ListPaneItemType.TOP_SPACER,
            data: '',
            key: 'top-spacer'
        }
    ];

    const contextFilter =
        selectionType === ItemType.TAG
            ? ItemType.TAG
            : selectionType === ItemType.FOLDER
              ? ItemType.FOLDER
              : selectionType === ItemType.PROPERTY
                ? ItemType.PROPERTY
                : undefined;
    const db = getDB();
    const pinnedDisplayScope =
        listConfig.filterPinnedByFolder && selectionType === ItemType.FOLDER && selectedFolder
            ? { restrictToFolderPath: selectedFolder.path }
            : undefined;
    const { pinnedFiles, unpinnedFiles } = partitionPinnedFiles(files, listConfig.pinnedNotes, contextFilter, pinnedDisplayScope);
    const shouldDetectTags = listConfig.showTags && listConfig.showFileTags;
    const hiddenTagVisibility = shouldDetectTags ? createHiddenTagVisibility(hiddenTags, showHiddenItems) : null;
    const fileHasTags = shouldDetectTags
        ? (file: TFile) => {
              const tags = getCachedFileTags({ app, file, db });
              if (!hiddenTagVisibility) {
                  return tags.length > 0;
              }
              return hiddenTagVisibility.hasVisibleTags(tags);
          }
        : () => false;

    const groupingMode = listConfig.groupBy;
    const selectedFolderPath = selectedFolder?.path ?? null;
    const createCollapseKey = (groupId: string): string =>
        buildListGroupCollapseKey({
            selectionType,
            selectedFolderPath,
            selectedTag,
            selectedProperty,
            groupingMode,
            groupId
        });

    let activeListGroupCollapsed = false;
    let activeCollapsedHeaderKind: ListPaneItem['headerKind'] | null = null;
    let fileIndexCounter = 0;
    const getFileWordCount = (file: TFile): number => {
        return normalizeManualSortGroupHeaderWordCount(db.getFile(file.path)?.wordCount);
    };
    const getFileWordCountTarget = (file: TFile): number | null => {
        return (
            getWordCountTargetFromProperties(db.getFile(file.path)?.properties, wordCountTargetProperty) ??
            getCachedWordCountTargetFromFrontmatter(app, file, wordCountTargetProperty)
        );
    };
    const manualSortCustomHeaderByPath = new Map<string, ManualSortGroupHeaderData | null>();
    const getManualSortCustomHeaderValue = (file: TFile): ManualSortGroupHeaderData | null => {
        if (groupingMode !== 'custom' || !manualSortGroupHeaderPropertyKey || file.extension !== 'md') {
            return null;
        }

        if (manualSortCustomHeaderByPath.has(file.path)) {
            return manualSortCustomHeaderByPath.get(file.path) ?? null;
        }

        const header = getCachedManualSortGroupHeader(app, file, manualSortGroupHeaderPropertyKey);
        manualSortCustomHeaderByPath.set(file.path, header);
        return header;
    };
    let activeManualSortHeader: {
        item: ListPaneItem;
        header: ManualSortGroupHeaderData;
        wordCount: number;
        targetWordCount: number | null;
    } | null = null;
    const updateActiveManualSortHeaderLabel = (): void => {
        if (!activeManualSortHeader) {
            return;
        }

        activeManualSortHeader.item.data = formatManualSortGroupHeaderLabel(
            activeManualSortHeader.header,
            activeManualSortHeader.wordCount,
            activeManualSortHeader.targetWordCount
        );
        activeManualSortHeader.item.manualSortHeaderWordCount = activeManualSortHeader.wordCount;
        activeManualSortHeader.item.manualSortHeaderTargetWordCount = activeManualSortHeader.targetWordCount;
    };
    type FileItemOverrides = Partial<Omit<ListPaneItem, 'type' | 'data' | 'fileIndex' | 'hasTags' | 'isHidden' | 'key' | 'searchMeta'>>;
    const pushFileItem = (file: TFile, overrides: FileItemOverrides = {}) => {
        if (activeManualSortHeader && shouldShowManualSortGroupHeaderWordCount(activeManualSortHeader.header) && file.extension === 'md') {
            activeManualSortHeader.wordCount += getFileWordCount(file);
            if (activeManualSortHeader.header.targetWordCount === null) {
                const fileTargetWordCount = getFileWordCountTarget(file);
                if (fileTargetWordCount !== null) {
                    activeManualSortHeader.targetWordCount = (activeManualSortHeader.targetWordCount ?? 0) + fileTargetWordCount;
                }
            }
            updateActiveManualSortHeaderLabel();
        }

        if (activeListGroupCollapsed) {
            return;
        }

        const baseItem: ListPaneItem = {
            type: ListPaneItemType.FILE,
            data: file,
            parentFolder: selectedFolder?.path,
            key: file.path,
            fileIndex: fileIndexCounter++,
            searchMeta: searchMetaMap.get(file.path),
            hasTags: fileHasTags(file),
            isHidden: hiddenFileState.get(file.path) ?? false
        };
        items.push({ ...baseItem, ...overrides });
    };

    const pushHeaderItem = ({
        data,
        key,
        headerFolderPath,
        headerKind,
        collapseKey,
        manualSortHeader,
        manualSortHeaderFilePath
    }: Pick<ListPaneItem, 'data' | 'key' | 'headerFolderPath' | 'headerKind' | 'collapseKey' | 'manualSortHeaderFilePath'> & {
        manualSortHeader?: ManualSortGroupHeaderData;
    }) => {
        if (activeListGroupCollapsed && activeCollapsedHeaderKind !== 'manual-sort-custom' && headerKind === 'manual-sort-custom') {
            return;
        }

        const isCollapsed = collapseKey ? collapsedListGroups?.has(collapseKey) === true : false;
        activeListGroupCollapsed = isCollapsed;
        activeCollapsedHeaderKind = isCollapsed ? (headerKind ?? null) : null;
        const useHeaderSpacers = items.length > 1;
        if (useHeaderSpacers) {
            items.push({
                type: ListPaneItemType.HEADER_SPACER,
                data: '',
                key: `${key}-spacer-before`
            });
        }

        const headerItem: ListPaneItem = {
            type: ListPaneItemType.HEADER,
            data,
            headerFolderPath,
            manualSortHeaderFilePath,
            manualSortHeaderShowsWordCount: manualSortHeader ? shouldShowManualSortGroupHeaderWordCount(manualSortHeader) : undefined,
            manualSortHeader,
            manualSortHeaderWordCount: manualSortHeader ? 0 : undefined,
            manualSortHeaderTargetWordCount: manualSortHeader ? manualSortHeader.targetWordCount : undefined,
            headerKind,
            collapseKey,
            isCollapsed,
            key
        };
        items.push(headerItem);
        activeManualSortHeader = null;
        if (headerKind === 'manual-sort-custom' && manualSortHeader) {
            activeManualSortHeader = {
                item: headerItem,
                header: manualSortHeader,
                wordCount: 0,
                targetWordCount: manualSortHeader.targetWordCount
            };
            updateActiveManualSortHeaderLabel();
        }
    };
    const maybePushManualSortCustomHeader = (file: TFile) => {
        const header = getManualSortCustomHeaderValue(file);
        if (!header) {
            return;
        }

        pushHeaderItem({
            data: header.title,
            manualSortHeader: header,
            manualSortHeaderFilePath: file.path,
            headerKind: 'manual-sort-custom',
            collapseKey: createCollapseKey(`manual-sort-custom:${file.path}`),
            key: `manual-sort-custom-header-${file.path}`
        });
    };
    const pushManualSortAwareFileItem = (file: TFile, overrides: FileItemOverrides = {}) => {
        maybePushManualSortCustomHeader(file);
        pushFileItem(file, overrides);
    };

    if (pinnedFiles.length > 0) {
        pushHeaderItem({
            data: strings.listPane.pinnedSection,
            key: PINNED_SECTION_HEADER_KEY,
            headerKind: 'pinned'
        });

        if (listConfig.pinnedGroupExpanded) {
            pinnedFiles.forEach(file => {
                pushManualSortAwareFileItem(file, { isPinned: true });
            });
        }
    }

    const shouldGroupByDate = groupingMode === 'date' && isDateSortOption(sortOption);
    const shouldGroupByFolder = groupingMode === 'folder' && selectionType === ItemType.FOLDER;
    const shouldShowUnsortedSection = isPropertySortOption(sortOption) && isManualSortActive && propertySortKey.trim().length > 0;

    if (!shouldGroupByDate && !shouldGroupByFolder) {
        const sortedFiles: TFile[] = [];
        const unsortedFiles: TFile[] = [];
        if (shouldShowUnsortedSection) {
            unpinnedFiles.forEach(file => {
                if (file.extension === 'md' && getCachedManualSortRank(app, file, propertySortKey) === null) {
                    unsortedFiles.push(file);
                    return;
                }
                sortedFiles.push(file);
            });
        } else {
            sortedFiles.push(...unpinnedFiles);
        }

        const firstSortedFile = sortedFiles[0] ?? null;
        const firstSortedFileHasManualSortCustomHeader =
            groupingMode === 'custom' && firstSortedFile !== null && getManualSortCustomHeaderValue(firstSortedFile) !== null;
        if (pinnedFiles.length > 0 && sortedFiles.length > 0 && !firstSortedFileHasManualSortCustomHeader) {
            const label = fileVisibility === FILE_VISIBILITY.DOCUMENTS ? strings.listPane.notesSection : strings.listPane.filesSection;
            pushHeaderItem({
                data: label,
                key: `header-${label}`,
                headerKind: 'section'
            });
        }

        sortedFiles.forEach(file => {
            pushManualSortAwareFileItem(file);
        });

        if (unsortedFiles.length > 0) {
            pushHeaderItem({
                data: strings.listPane.unsortedSection,
                collapseKey: createCollapseKey('section:unsorted'),
                key: 'header-unsorted',
                headerKind: 'section'
            });
            unsortedFiles.forEach(file => {
                pushManualSortAwareFileItem(file);
            });
        }
    } else if (shouldGroupByDate) {
        const now = DateUtils.parseLocalDayKey(dayKey) ?? new Date();
        const dateField = getDateField(sortOption);
        let currentGroupKey: string | null = null;

        unpinnedFiles.forEach(file => {
            const timestamps = getFileTimestamps(file);
            const timestamp = dateField === 'ctime' ? timestamps.created : timestamps.modified;
            const group = DateUtils.getDateGroupInfo(timestamp, now);
            const groupKey = group.key;
            if (groupKey !== currentGroupKey) {
                currentGroupKey = groupKey;
                pushHeaderItem({
                    data: group.label,
                    collapseKey: createCollapseKey(`date:${dateField}:${groupKey}`),
                    key: `header-${group.label}`,
                    headerKind: 'date'
                });
            }

            pushFileItem(file);
        });
    } else {
        const baseFolderPath = selectedFolder?.path ?? null;
        const baseFolderName = selectedFolder?.name ?? null;
        const basePrefix = baseFolderPath ? `${baseFolderPath}/` : null;
        const vaultRootLabel = strings.navigationPane.vaultRootLabel;
        const folderGroupSortOrder = listConfig.folderGroupSortOrder;

        const folderGroups = new Map<
            string,
            {
                label: string;
                files: TFile[];
                isCurrentFolder: boolean;
                folderPath: string | null;
            }
        >();

        const resolveFolderGroup = (file: TFile): { key: string; label: string; isCurrentFolder: boolean; folderPath: string | null } => {
            const parent = file.parent;
            if (!(parent instanceof TFolder)) {
                return { key: 'folder:/', label: vaultRootLabel, isCurrentFolder: false, folderPath: null };
            }

            if (selectionType === ItemType.FOLDER && baseFolderPath) {
                if (parent.path === baseFolderPath) {
                    return {
                        key: `folder:${baseFolderPath}`,
                        label: baseFolderName ?? parent.name,
                        isCurrentFolder: true,
                        folderPath: baseFolderPath === '/' ? null : baseFolderPath
                    };
                }

                if (basePrefix && parent.path.startsWith(basePrefix)) {
                    const relativePath = parent.path.slice(basePrefix.length);
                    const [firstSegment] = relativePath.split('/');
                    if (firstSegment && firstSegment.length > 0) {
                        return {
                            key: `folder:${baseFolderPath}/${firstSegment}`,
                            label: firstSegment,
                            isCurrentFolder: false,
                            folderPath: normalizePath(
                                !baseFolderPath || baseFolderPath === '/' ? firstSegment : `${baseFolderPath}/${firstSegment}`
                            )
                        };
                    }
                }
            }

            const parentPath = parent.path === '/' ? '' : parent.path;
            const [topLevel] = parentPath.split('/');
            if (topLevel && topLevel.length > 0) {
                return {
                    key: `folder:/${topLevel}`,
                    label: topLevel,
                    isCurrentFolder: false,
                    folderPath: topLevel
                };
            }

            return { key: 'folder:/', label: vaultRootLabel, isCurrentFolder: false, folderPath: null };
        };

        unpinnedFiles.forEach(file => {
            const groupInfo = resolveFolderGroup(file);
            const group = folderGroups.get(groupInfo.key);
            if (group) {
                group.files.push(file);
                return;
            }

            folderGroups.set(groupInfo.key, {
                label: groupInfo.label,
                files: [file],
                isCurrentFolder: groupInfo.isCurrentFolder,
                folderPath: groupInfo.folderPath
            });
        });

        const orderedGroups = Array.from(folderGroups.entries())
            .map(([key, group]) => ({ key, ...group }))
            .sort((left, right) => {
                if (left.isCurrentFolder !== right.isCurrentFolder) {
                    return left.isCurrentFolder ? -1 : 1;
                }

                const labelCompare = compareByAlphaSortOrder(left.label, right.label, folderGroupSortOrder);
                if (labelCompare !== 0) {
                    return labelCompare;
                }

                if (left.key === right.key) {
                    return 0;
                }

                return left.key < right.key ? -1 : 1;
            });

        orderedGroups.forEach(group => {
            if (group.files.length === 0) {
                return;
            }

            if (!group.isCurrentFolder || pinnedFiles.length > 0) {
                pushHeaderItem({
                    data: group.label,
                    collapseKey: createCollapseKey(group.key),
                    headerFolderPath: group.folderPath,
                    key: `header-${group.key}`,
                    headerKind: 'folder'
                });
            }

            group.files.forEach(file => {
                pushFileItem(file);
            });
        });
    }

    items.push({
        type: ListPaneItemType.BOTTOM_SPACER,
        data: '',
        key: 'bottom-spacer'
    });

    return items;
}

export function buildFilePathToIndexMap(listItems: ListPaneItem[]): Map<string, number> {
    const filePathToIndex = new Map<string, number>();
    listItems.forEach((item, index) => {
        if (item.type === ListPaneItemType.FILE && item.data instanceof TFile) {
            filePathToIndex.set(item.data.path, index);
        }
    });
    return filePathToIndex;
}

export function buildFileIndexMap(files: TFile[]): Map<string, number> {
    const fileIndexMap = new Map<string, number>();
    files.forEach((file, index) => {
        fileIndexMap.set(file.path, index);
    });
    return fileIndexMap;
}

export function buildOrderedFiles(listItems: ListPaneItem[]): {
    orderedFiles: TFile[];
    orderedFileIndexMap: Map<string, number>;
} {
    const orderedFiles: TFile[] = [];
    const orderedFileIndexMap = new Map<string, number>();

    listItems.forEach(item => {
        if (item.type === ListPaneItemType.FILE && item.data instanceof TFile) {
            orderedFileIndexMap.set(item.data.path, orderedFiles.length);
            orderedFiles.push(item.data);
        }
    });

    return { orderedFiles, orderedFileIndexMap };
}
