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
import type { AlphaSortOrder, ListNoteGroupingOption, NotebookNavigatorSettings, SortOption } from '../../settings/types';
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
import type { AliasSearchMatch, SearchResultMeta } from '../../types/search';
import type { IndexedDBStorage } from '../../storage/IndexedDBStorage';
import type { PropertySelectionNodeId } from '../../utils/propertyTree';
import type { ListPaneFolderPathSegment } from '../../types/virtualization';

export interface ListPaneConfig {
    filterPinnedByFolder: boolean;
    folderGroupSortOrder: AlphaSortOrder;
    groupBy: ListNoteGroupingOption;
    pinnedGroupExpanded: boolean;
    pinnedNotes: NotebookNavigatorSettings['pinnedNotes'];
    showCurrentFolderFilesAtBottom: boolean;
    showFolderGroupPaths: boolean;
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
    matchedAliases?: ReadonlyMap<string, readonly AliasSearchMatch[]>;
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

export type CollapsedListGroupRevealTarget = { type: 'pinned' } | { type: 'list-group'; collapseKey: string };

function splitFolderPath(path: string): string[] {
    return path.split('/').filter(Boolean);
}

function getLastFolderPathSegment(path: string, fallback: string): string {
    const segments = splitFolderPath(path);
    return segments.length > 0 ? segments[segments.length - 1] : fallback;
}

function buildFolderGroupHeaderSegments(folderPath: string, visiblePath: string): ListPaneFolderPathSegment[] {
    const folderSegments = splitFolderPath(folderPath);
    const visibleSegments = splitFolderPath(visiblePath);
    if (folderSegments.length === 0 || visibleSegments.length === 0) {
        return [];
    }

    const firstVisibleFolderSegmentIndex = Math.max(0, folderSegments.length - visibleSegments.length);
    return visibleSegments.map((label, index) => ({
        label,
        path: folderSegments.slice(0, firstVisibleFolderSegmentIndex + index + 1).join('/')
    }));
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
    matchedAliases,
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
    let activeGroupHeaderItem: ListPaneItem | null = null;
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
    type FileItemOverrides = Partial<
        Omit<ListPaneItem, 'type' | 'data' | 'fileIndex' | 'hasTags' | 'isHidden' | 'key' | 'matchedAliases' | 'searchMeta'>
    >;
    const pushFileItem = (file: TFile, overrides: FileItemOverrides = {}) => {
        activeGroupHeaderItem?.groupFilePaths?.push(file.path);

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
            matchedAliases: matchedAliases?.get(file.path),
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
        headerFolderSegments,
        headerKind,
        collapseKey,
        manualSortHeader,
        manualSortHeaderFilePath,
        groupFiles
    }: Pick<
        ListPaneItem,
        'data' | 'key' | 'headerFolderPath' | 'headerFolderSegments' | 'headerKind' | 'collapseKey' | 'manualSortHeaderFilePath'
    > & {
        manualSortHeader?: ManualSortGroupHeaderData;
        groupFiles?: readonly TFile[];
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
            headerFolderSegments,
            manualSortHeaderFilePath,
            groupFilePaths: groupFiles ? groupFiles.map(file => file.path) : [],
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
        activeGroupHeaderItem = groupFiles ? null : headerItem;
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
            headerKind: 'pinned',
            groupFiles: pinnedFiles
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
                headerKind: 'section',
                groupFiles: sortedFiles
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
                headerKind: 'section',
                groupFiles: unsortedFiles
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
        const basePrefix = baseFolderPath && baseFolderPath !== '/' ? `${baseFolderPath}/` : null;
        const vaultRootLabel = strings.navigationPane.vaultRootLabel;
        const folderGroupSortOrder = listConfig.folderGroupSortOrder;
        const showFolderGroupPaths = listConfig.showFolderGroupPaths;

        const folderGroups = new Map<
            string,
            {
                label: string;
                sortLabel: string;
                files: TFile[];
                isCurrentFolder: boolean;
                folderPath: string | null;
                folderSegments?: ListPaneFolderPathSegment[];
            }
        >();

        const createFolderGroupHeader = (
            folderPath: string,
            visiblePath: string,
            fallbackName: string
        ): { label: string; sortLabel: string; folderPath: string; folderSegments?: ListPaneFolderPathSegment[] } => {
            const normalizedFolderPath = normalizePath(folderPath);
            const label = showFolderGroupPaths ? visiblePath : getLastFolderPathSegment(visiblePath, fallbackName);
            return {
                label,
                sortLabel: visiblePath,
                folderPath: normalizedFolderPath,
                folderSegments: showFolderGroupPaths ? buildFolderGroupHeaderSegments(normalizedFolderPath, visiblePath) : undefined
            };
        };

        const resolveFolderGroup = (
            file: TFile
        ): {
            key: string;
            label: string;
            sortLabel: string;
            isCurrentFolder: boolean;
            folderPath: string | null;
            folderSegments?: ListPaneFolderPathSegment[];
        } => {
            const parent = file.parent;
            if (!(parent instanceof TFolder)) {
                return { key: 'folder:/', label: vaultRootLabel, sortLabel: vaultRootLabel, isCurrentFolder: false, folderPath: null };
            }

            if (selectionType === ItemType.FOLDER && baseFolderPath) {
                if (parent.path === baseFolderPath) {
                    const label = baseFolderName ?? parent.name;
                    return {
                        key: `folder:${baseFolderPath}`,
                        label,
                        sortLabel: label,
                        isCurrentFolder: true,
                        folderPath: baseFolderPath === '/' ? null : baseFolderPath
                    };
                }

                if (baseFolderPath === '/' && parent.path !== '/') {
                    const header = createFolderGroupHeader(parent.path, parent.path, parent.name);
                    return {
                        key: `folder:/${parent.path}`,
                        label: header.label,
                        sortLabel: header.sortLabel,
                        isCurrentFolder: false,
                        folderPath: header.folderPath,
                        folderSegments: header.folderSegments
                    };
                }

                if (basePrefix && parent.path.startsWith(basePrefix)) {
                    const relativePath = parent.path.slice(basePrefix.length);
                    if (relativePath.length > 0) {
                        const header = createFolderGroupHeader(parent.path, relativePath, parent.name);
                        return {
                            key: `folder:${parent.path}`,
                            label: header.label,
                            sortLabel: header.sortLabel,
                            isCurrentFolder: false,
                            folderPath: header.folderPath,
                            folderSegments: header.folderSegments
                        };
                    }
                }
            }

            const parentPath = parent.path === '/' ? '' : parent.path;
            const [topLevel] = parentPath.split('/');
            if (topLevel && topLevel.length > 0) {
                return {
                    key: `folder:/${topLevel}`,
                    label: showFolderGroupPaths ? topLevel : getLastFolderPathSegment(topLevel, topLevel),
                    sortLabel: topLevel,
                    isCurrentFolder: false,
                    folderPath: topLevel,
                    folderSegments: showFolderGroupPaths ? buildFolderGroupHeaderSegments(topLevel, topLevel) : undefined
                };
            }

            return { key: 'folder:/', label: vaultRootLabel, sortLabel: vaultRootLabel, isCurrentFolder: false, folderPath: null };
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
                sortLabel: groupInfo.sortLabel,
                files: [file],
                isCurrentFolder: groupInfo.isCurrentFolder,
                folderPath: groupInfo.folderPath,
                folderSegments: groupInfo.folderSegments
            });
        });

        const orderedGroups = Array.from(folderGroups.entries())
            .map(([key, group]) => ({ key, ...group }))
            .sort((left, right) => {
                const labelCompare = compareByAlphaSortOrder(left.sortLabel, right.sortLabel, folderGroupSortOrder);
                if (labelCompare !== 0) {
                    return labelCompare;
                }

                if (left.key === right.key) {
                    return 0;
                }

                return left.key < right.key ? -1 : 1;
            });

        const currentFolderGroup = orderedGroups.find(group => group.isCurrentFolder) ?? null;
        const childFolderGroups = orderedGroups.filter(group => !group.isCurrentFolder);
        const shouldAddCurrentFolderBoundary =
            currentFolderGroup !== null &&
            ((listConfig.showCurrentFolderFilesAtBottom && (pinnedFiles.length > 0 || childFolderGroups.length > 0)) ||
                (!listConfig.showCurrentFolderFilesAtBottom && pinnedFiles.length > 0));
        const renderFolderGroup = (group: (typeof orderedGroups)[number]): void => {
            if (group.files.length === 0) {
                return;
            }

            if (!group.isCurrentFolder) {
                pushHeaderItem({
                    data: group.label,
                    collapseKey: createCollapseKey(group.key),
                    headerFolderPath: group.folderPath,
                    headerFolderSegments: group.folderSegments,
                    key: `header-${group.key}`,
                    headerKind: 'folder',
                    groupFiles: group.files
                });
            } else if (shouldAddCurrentFolderBoundary) {
                pushHeaderItem({
                    data: strings.listPane.filesSection,
                    key: `header-${group.key}-current-folder-boundary`,
                    headerKind: 'section',
                    groupFiles: group.files
                });
            }

            group.files.forEach(file => {
                pushFileItem(file);
            });
        };

        if (currentFolderGroup && !listConfig.showCurrentFolderFilesAtBottom) {
            renderFolderGroup(currentFolderGroup);
        }

        childFolderGroups.forEach(renderFolderGroup);

        if (currentFolderGroup && listConfig.showCurrentFolderFilesAtBottom) {
            renderFolderGroup(currentFolderGroup);
        }
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

export function findCollapsedListGroupRevealTarget(
    listItems: readonly ListPaneItem[],
    filePath: string,
    pinnedGroupExpanded: boolean
): CollapsedListGroupRevealTarget | null {
    for (const item of listItems) {
        if (item.type !== ListPaneItemType.HEADER || !item.groupFilePaths?.includes(filePath)) {
            continue;
        }

        if (item.key === PINNED_SECTION_HEADER_KEY) {
            if (!pinnedGroupExpanded) {
                return { type: 'pinned' };
            }
            continue;
        }

        if (item.collapseKey && item.isCollapsed === true) {
            return { type: 'list-group', collapseKey: item.collapseKey };
        }
    }

    return null;
}
