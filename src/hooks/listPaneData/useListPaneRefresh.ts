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

import { useEffect, useRef } from 'react';
import { TFile } from 'obsidian';
import { debounce } from 'obsidian';
import type { App, TFolder } from 'obsidian';
import type { ListNoteGroupingOption, NotebookNavigatorSettings, PropertySortSecondaryOption, SortOption } from '../../settings/types';
import { TIMEOUTS } from '../../types/obsidian-extended';
import { OperationType, type CommandQueueService } from '../../services/CommandQueueService';
import { shouldExcludeFileWithMatcher } from '../../utils/fileFilters';
import { shouldRefreshOnFileModifyForSort, shouldRefreshOnMetadataChangeForSort } from '../../utils/sortUtils';
import type { FileContentChange, IndexedDBStorage } from '../../storage/IndexedDBStorage';
import type { IPropertyTreeProvider } from '../../interfaces/IPropertyTreeProvider';
import { ItemType } from '../../types';
import type { PropertySelectionNodeId } from '../../utils/propertyTree';
import { createFrontmatterPropertyExclusionMatcher } from '../../utils/fileFilters';
import { getCachedManualSortGroupHeader } from '../../utils/manualSort';
import { DateUtils } from '../../utils/dateUtils';

interface UseListPaneRefreshArgs {
    app: App;
    basePathSet: ReadonlySet<string>;
    commandQueue: CommandQueueService | null;
    customGroupHeaderFilePaths: ReadonlySet<string>;
    dayKey: string;
    files: readonly TFile[];
    getDB: () => IndexedDBStorage;
    groupBy: ListNoteGroupingOption;
    hasDateSearchFilters: boolean;
    hasManualSortWordCountGroupHeaders: boolean;
    hasPropertySearchFilters: boolean;
    hasTaskSearchFilters: boolean;
    hiddenFilePropertyMatcher: ReturnType<typeof createFrontmatterPropertyExclusionMatcher>;
    hiddenFileTags: string[];
    includeDescendantNotes: boolean;
    manualSortGroupHeaderPropertyKey: string | null;
    onRefresh: () => void;
    propertyTreeService: IPropertyTreeProvider | null;
    selectedFolder: TFolder | null;
    selectedProperty: PropertySelectionNodeId | null;
    selectedTag: string | null;
    selectionType: ItemType | null;
    settings: NotebookNavigatorSettings;
    shouldRefreshOnCustomGroupHeaderMetadataChange: boolean;
    showHiddenItems: boolean;
    sortOption: SortOption;
    propertySortKey: string;
    propertySortSecondary: PropertySortSecondaryOption;
}

export function getModifiedSortBoundaryRefreshKey(params: {
    dayKey: string;
    file: TFile;
    files: readonly TFile[];
    groupBy: ListNoteGroupingOption;
    sortOption: SortOption;
}): string | null {
    const { dayKey, file, files, groupBy, sortOption } = params;
    if (files.length === 0) {
        return null;
    }

    let boundaryFile: TFile | undefined;
    if (sortOption === 'modified-desc') {
        boundaryFile = files[0];
    } else if (sortOption === 'modified-asc') {
        boundaryFile = files[files.length - 1];
    } else {
        return null;
    }

    if (boundaryFile?.path !== file.path) {
        return null;
    }

    const dateGroupKey =
        groupBy === 'date' ? DateUtils.getDateGroupInfo(file.stat.mtime, DateUtils.parseLocalDayKey(dayKey) ?? undefined).key : 'ungrouped';

    return `${sortOption}\u0000${groupBy}\u0000${dateGroupKey}\u0000${files.length}`;
}

export function shouldSkipModifiedSortBoundaryRefresh(params: {
    previousBoundaryRefreshKey: string | undefined;
    boundaryRefreshKey: string | null;
    hasDateSearchFilters: boolean;
    showFileDate: boolean;
    showTooltips: boolean;
}): boolean {
    return (
        !params.hasDateSearchFilters &&
        !params.showFileDate &&
        !params.showTooltips &&
        params.boundaryRefreshKey !== null &&
        params.previousBoundaryRefreshKey === params.boundaryRefreshKey
    );
}

/**
 * Property filters read the storage mirror, so a matching cache write must rerun the list filter.
 * The base-path check includes files currently excluded by the filter because they may enter the result.
 */
export function hasPropertySearchContentChange(changes: readonly FileContentChange[], basePathSet: ReadonlySet<string>): boolean {
    return changes.some(change => change.changes.properties !== undefined && basePathSet.has(change.path));
}

function fileIsWithinSelectedFolder(file: TFile, includeDescendantNotes: boolean, selectedFolder: TFolder | null): boolean {
    if (!selectedFolder) {
        return false;
    }

    const fileFolder = file.parent;
    const selectedPath = selectedFolder.path;
    if (fileFolder?.path === selectedPath) {
        return true;
    }
    if (!includeDescendantNotes) {
        return false;
    }
    if (selectedPath === '/') {
        return true;
    }
    return Boolean(fileFolder?.path && fileFolder.path.startsWith(`${selectedPath}/`));
}

export function useListPaneRefresh({
    app,
    basePathSet,
    commandQueue,
    customGroupHeaderFilePaths,
    dayKey,
    files,
    getDB,
    groupBy,
    hasDateSearchFilters,
    hasManualSortWordCountGroupHeaders,
    hasPropertySearchFilters,
    hasTaskSearchFilters,
    hiddenFilePropertyMatcher,
    hiddenFileTags,
    includeDescendantNotes,
    manualSortGroupHeaderPropertyKey,
    onRefresh,
    propertyTreeService,
    selectedFolder,
    selectedProperty,
    selectedTag,
    selectionType,
    settings,
    shouldRefreshOnCustomGroupHeaderMetadataChange,
    showHiddenItems,
    sortOption,
    propertySortKey,
    propertySortSecondary
}: UseListPaneRefreshArgs): void {
    const onRefreshRef = useRef(onRefresh);
    const operationActiveRef = useRef(false);
    const pendingRefreshRef = useRef(false);
    const pendingImmediateRefreshRef = useRef(false);
    const modifiedSortBoundaryRefreshKeysRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        modifiedSortBoundaryRefreshKeysRef.current.clear();
        if (files.length === 0 || (sortOption !== 'modified-desc' && sortOption !== 'modified-asc')) {
            return;
        }

        const boundaryFile = sortOption === 'modified-desc' ? files[0] : files[files.length - 1];
        if (!boundaryFile) {
            return;
        }

        const boundaryRefreshKey = getModifiedSortBoundaryRefreshKey({
            dayKey,
            file: boundaryFile,
            files,
            groupBy,
            sortOption
        });
        if (boundaryRefreshKey !== null) {
            modifiedSortBoundaryRefreshKeysRef.current.set(boundaryFile.path, boundaryRefreshKey);
        }
    }, [dayKey, files, groupBy, sortOption]);

    useEffect(() => {
        const runRefresh = () => {
            pendingRefreshRef.current = false;
            pendingImmediateRefreshRef.current = false;
            onRefreshRef.current();
        };

        const scheduleRefresh = debounce(runRefresh, TIMEOUTS.FILE_OPERATION_DELAY, true);

        const hasActiveDeleteOperation = () => Boolean(commandQueue?.hasActiveOperation(OperationType.DELETE_FILES));
        const hasActiveQueuedOperation = () =>
            Boolean(commandQueue?.hasActiveOperation(OperationType.MOVE_FILE) || hasActiveDeleteOperation());
        operationActiveRef.current = hasActiveQueuedOperation();
        const isTrackedOperationActive = () => operationActiveRef.current || hasActiveQueuedOperation();

        const flushPendingWhenIdle = () => {
            if (!pendingRefreshRef.current || isTrackedOperationActive()) {
                return;
            }

            if (pendingImmediateRefreshRef.current) {
                scheduleRefresh.cancel();
                runRefresh();
                return;
            }

            scheduleRefresh();
        };

        const clearModifiedSortBoundaryRefreshKeys = () => {
            modifiedSortBoundaryRefreshKeysRef.current.clear();
        };

        const queueRefresh = (options?: { immediateWhenIdle?: boolean }) => {
            pendingRefreshRef.current = true;
            if (options?.immediateWhenIdle) {
                pendingImmediateRefreshRef.current = true;
            }

            if (isTrackedOperationActive()) {
                return;
            }

            if (pendingImmediateRefreshRef.current) {
                scheduleRefresh.cancel();
                runRefresh();
                return;
            }

            scheduleRefresh();
        };

        let unsubscribeOperationQueue: (() => void) | null = null;
        if (commandQueue) {
            unsubscribeOperationQueue = commandQueue.onOperationChange((type, active) => {
                if (type === OperationType.MOVE_FILE || type === OperationType.DELETE_FILES) {
                    operationActiveRef.current = active;
                    if (!active) {
                        flushPendingWhenIdle();
                    }
                }
            });
        }
        flushPendingWhenIdle();

        let unsubscribePropertyTree: (() => void) | null = null;
        if (selectionType === ItemType.PROPERTY && selectedProperty && propertyTreeService) {
            unsubscribePropertyTree = propertyTreeService.addTreeUpdateListener(() => {
                queueRefresh();
            });
        }

        const shouldRefreshOnFileModify = shouldRefreshOnFileModifyForSort(sortOption, propertySortSecondary);
        const shouldRefreshOnMetadataChange = shouldRefreshOnMetadataChangeForSort({
            sortOption,
            propertySortKey,
            propertySortSecondary,
            useFrontmatterMetadata: settings.useFrontmatterMetadata,
            frontmatterNameField: settings.frontmatterNameField,
            frontmatterCreatedField: settings.frontmatterCreatedField,
            frontmatterModifiedField: settings.frontmatterModifiedField
        });

        const vaultEvents = [
            app.vault.on('create', () => {
                clearModifiedSortBoundaryRefreshKeys();
                queueRefresh();
            }),
            app.vault.on('delete', () => {
                clearModifiedSortBoundaryRefreshKeys();
                queueRefresh({ immediateWhenIdle: hasActiveDeleteOperation() });
            }),
            app.vault.on('rename', () => {
                clearModifiedSortBoundaryRefreshKeys();
                queueRefresh();
            }),
            app.vault.on('modify', file => {
                if (!shouldRefreshOnFileModify || !(file instanceof TFile) || !basePathSet.has(file.path)) {
                    return;
                }

                const boundaryRefreshKey = getModifiedSortBoundaryRefreshKey({
                    dayKey,
                    file,
                    files,
                    groupBy,
                    sortOption
                });
                if (boundaryRefreshKey !== null) {
                    const previousBoundaryRefreshKey = modifiedSortBoundaryRefreshKeysRef.current.get(file.path);
                    modifiedSortBoundaryRefreshKeysRef.current.set(file.path, boundaryRefreshKey);
                    if (
                        shouldSkipModifiedSortBoundaryRefresh({
                            previousBoundaryRefreshKey,
                            boundaryRefreshKey,
                            hasDateSearchFilters,
                            showFileDate: settings.showFileDate,
                            showTooltips: settings.showTooltips
                        })
                    ) {
                        return;
                    }
                } else {
                    modifiedSortBoundaryRefreshKeysRef.current.delete(file.path);
                }

                queueRefresh();
            })
        ];

        const metadataEvent = app.metadataCache.on('changed', file => {
            if (!(file instanceof TFile)) {
                return;
            }

            const hasHiddenPropertyStateChanged = (): boolean => {
                if (!hiddenFilePropertyMatcher.hasCriteria || file.extension !== 'md') {
                    return false;
                }

                const db = getDB();
                const record = db.getFile(file.path);
                const wasExcluded = Boolean(record?.metadata?.hidden);
                const isCurrentlyExcluded = shouldExcludeFileWithMatcher(file, hiddenFilePropertyMatcher, app);
                return isCurrentlyExcluded !== wasExcluded;
            };

            if (selectionType === ItemType.TAG && selectedTag) {
                if (file.extension !== 'md') {
                    return;
                }

                if (!showHiddenItems && hasHiddenPropertyStateChanged()) {
                    queueRefresh();
                    return;
                }

                if (shouldRefreshOnMetadataChange && basePathSet.has(file.path)) {
                    queueRefresh();
                }
                return;
            }

            if (selectionType === ItemType.PROPERTY && selectedProperty) {
                if (file.extension !== 'md') {
                    return;
                }

                if (!showHiddenItems && hasHiddenPropertyStateChanged()) {
                    queueRefresh();
                    return;
                }

                if (shouldRefreshOnMetadataChange && basePathSet.has(file.path)) {
                    queueRefresh();
                }
                return;
            }

            if (selectionType !== ItemType.FOLDER || !fileIsWithinSelectedFolder(file, includeDescendantNotes, selectedFolder)) {
                return;
            }

            if (shouldRefreshOnCustomGroupHeaderMetadataChange && file.extension === 'md' && basePathSet.has(file.path)) {
                const hadVisibleHeader = customGroupHeaderFilePaths.has(file.path);
                const hasCurrentHeader =
                    manualSortGroupHeaderPropertyKey !== null &&
                    getCachedManualSortGroupHeader(app, file, manualSortGroupHeaderPropertyKey) !== null;
                if (hadVisibleHeader || hasCurrentHeader) {
                    queueRefresh();
                    return;
                }
            }

            if (hiddenFilePropertyMatcher.hasCriteria && file.extension === 'md') {
                if (hasHiddenPropertyStateChanged()) {
                    queueRefresh();
                    return;
                }
            }

            if (
                hasManualSortWordCountGroupHeaders &&
                settings.wordCountTargetProperty.trim().length > 0 &&
                file.extension === 'md' &&
                basePathSet.has(file.path)
            ) {
                queueRefresh();
                return;
            }

            if (shouldRefreshOnMetadataChange && file.extension === 'md' && basePathSet.has(file.path)) {
                queueRefresh();
            }
        });

        const db = getDB();
        const dbUnsubscribe = db.onContentChange(changes => {
            let shouldRefresh = false;
            const isPropertyView = selectionType === ItemType.PROPERTY && selectedProperty;

            const hasTagChanges = changes.some(change => change.changes.tags !== undefined);
            const hasPropertyChanges = changes.some(change => change.changes.properties !== undefined);
            if (hasPropertySearchFilters && hasPropertySearchContentChange(changes, basePathSet)) {
                shouldRefresh = true;
            }
            if (!shouldRefresh && (hasTagChanges || hasPropertyChanges)) {
                const isTagView = selectionType === ItemType.TAG && selectedTag;
                const isFolderView = selectionType === ItemType.FOLDER && selectedFolder;

                if (isTagView && hasTagChanges) {
                    shouldRefresh = true;
                } else if (isFolderView && hasTagChanges && selectedFolder) {
                    const folderPath = selectedFolder.path;
                    const isRootSelection = folderPath === '/';
                    const shouldCheckFolderScope = hiddenFileTags.length > 0;
                    shouldRefresh = changes.some(change => {
                        if (!shouldCheckFolderScope) {
                            return basePathSet.has(change.path);
                        }
                        if (isRootSelection) {
                            return true;
                        }
                        if (!includeDescendantNotes) {
                            const separatorIndex = change.path.lastIndexOf('/');
                            const parentPath = separatorIndex === -1 ? '/' : change.path.slice(0, separatorIndex);
                            return parentPath === folderPath;
                        }
                        return change.path.startsWith(`${folderPath}/`);
                    });
                } else if (isPropertyView) {
                    if (hasPropertyChanges) {
                        shouldRefresh = true;
                    } else if (hasTagChanges) {
                        const hasTagChangesInCurrentList = changes.some(change => basePathSet.has(change.path));
                        const shouldRefreshForTagVisibility = hiddenFileTags.length > 0 && !showHiddenItems;
                        shouldRefresh = hasTagChangesInCurrentList || shouldRefreshForTagVisibility;
                    }
                }
            }

            if (!shouldRefresh && hiddenFilePropertyMatcher.hasCriteria) {
                shouldRefresh = changes.some(change => change.metadataHiddenChanged === true && basePathSet.has(change.path));
            }

            if (!shouldRefresh && (hasTaskSearchFilters || settings.showFileBackgroundUnfinishedTask)) {
                shouldRefresh = changes.some(change => change.changes.taskUnfinished !== undefined && basePathSet.has(change.path));
            }

            if (!shouldRefresh && hasManualSortWordCountGroupHeaders) {
                shouldRefresh = changes.some(
                    change =>
                        (change.changes.wordCount !== undefined || change.changes.properties !== undefined) && basePathSet.has(change.path)
                );
            }

            if (shouldRefresh) {
                queueRefresh();
            }
        });

        return () => {
            vaultEvents.forEach(eventRef => app.vault.offref(eventRef));
            app.metadataCache.offref(metadataEvent);
            dbUnsubscribe();
            unsubscribeOperationQueue?.();
            unsubscribePropertyTree?.();
            scheduleRefresh.cancel();
        };
    }, [
        app,
        basePathSet,
        commandQueue,
        customGroupHeaderFilePaths,
        dayKey,
        files,
        getDB,
        groupBy,
        hasDateSearchFilters,
        hasManualSortWordCountGroupHeaders,
        hasPropertySearchFilters,
        hasTaskSearchFilters,
        hiddenFilePropertyMatcher,
        hiddenFileTags,
        includeDescendantNotes,
        manualSortGroupHeaderPropertyKey,
        propertyTreeService,
        selectedFolder,
        selectedProperty,
        selectedTag,
        selectionType,
        shouldRefreshOnCustomGroupHeaderMetadataChange,
        settings.frontmatterCreatedField,
        settings.frontmatterModifiedField,
        settings.frontmatterNameField,
        propertySortKey,
        propertySortSecondary,
        settings.showFileBackgroundUnfinishedTask,
        settings.showFileDate,
        settings.showTooltips,
        settings.useFrontmatterMetadata,
        settings.wordCountTargetProperty,
        showHiddenItems,
        sortOption
    ]);
}
