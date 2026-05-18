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
import { Menu, TFile, TFolder } from 'obsidian';
import { Virtualizer } from '@tanstack/react-virtual';
import { useMetadataService, useServices } from '../../context/ServicesContext';
import { strings } from '../../i18n';
import { ListPaneItemType, PINNED_SECTION_HEADER_KEY, type NavigationItemType } from '../../types';
import { runAsyncAction } from '../../utils/async';
import { getFolderNote, openFolderNoteFile } from '../../utils/folderNotes';
import { resolveFolderNoteClickOpenContext } from '../../utils/keyboardOpenContext';
import type { ListPaneItem } from '../../types/virtualization';
import type { NotebookNavigatorSettings } from '../../settings';
import type { SortOption } from '../../settings';
import type { InclusionOperator } from '../../utils/filterSearch';
import type { FolderDecorationModel } from '../../utils/folderDecoration';
import type { NavigateToFolderOptions } from '../../hooks/useNavigatorReveal';
import { FileItem, type FileItemStorageHelpers } from '../FileItem';
import { ServiceIcon } from '../ServiceIcon';
import type { ListPaneAppearanceSettings } from '../../hooks/useListPaneAppearance';
import type { FileNameIconNeedle } from '../../utils/fileIconUtils';
import type { HiddenTagVisibility } from '../../utils/tagPrefixMatcher';
import type { FileItemPillDecorationModel } from '../../utils/fileItemPillDecoration';
import { resolveUXIcon } from '../../utils/uxIcons';
import { hasSolidFileRowBackground } from '../../utils/colorUtils';
import { getManualSortGroupHeaderPropertyKey, shouldShowManualSortGroupHeaderProgress } from '../../utils/manualSort';
import type { ManualSortGroupHeaderData } from '../../utils/manualSort';
import { resolveFolderDecorationColors } from '../../utils/folderDecoration';
import { addManualSortGroupHeaderMenuItems } from '../../utils/contextMenu/manualSortGroupHeaderMenuItems';
import { ManualSortGroupHeaderContent, ManualSortGroupHeaderProgress } from './ManualSortGroupHeaderContent';

export interface PointerClientPosition {
    clientX: number;
    clientY: number;
}

interface FolderGroupHeaderTarget {
    folder: TFolder;
    folderNote: TFile | null;
}

interface HeaderRenderModel {
    index: number;
    label: string;
    isFirstHeader: boolean;
    isPinnedHeader: boolean;
    collapseKey: string | null;
    isCollapsed: boolean;
    isCollapsible: boolean;
    folderGroupHeaderTarget: FolderGroupHeaderTarget | null;
    manualSortHeaderFilePath: string | null;
    manualSortHeader: ManualSortGroupHeaderData | null;
    manualSortHeaderWordCount: number;
    manualSortHeaderTargetWordCount: number | null;
    folderIconId: string | null;
    folderColor: string | null;
    applyFolderColorToLabel: boolean;
}

interface HeaderRenderModels {
    headerModels: HeaderRenderModel[];
    headerModelByIndex: Map<number, HeaderRenderModel>;
}

type VirtualRowStyle = React.CSSProperties & Record<'--item-height', string>;

interface ListPaneGroupHeaderProps {
    header: HeaderRenderModel;
    collapseChevronIcons: {
        collapsed: string;
        expanded: string;
    };
    onPinnedGroupHeaderToggle: () => void;
    onListGroupHeaderToggle: (collapseKey: string) => void;
    onFolderGroupHeaderClick: (event: React.MouseEvent<HTMLSpanElement>, target: FolderGroupHeaderTarget) => void;
    onFolderGroupHeaderMouseDown: (event: React.MouseEvent<HTMLSpanElement>, target: FolderGroupHeaderTarget) => void;
    onManualSortGroupHeaderContextMenu: (event: React.MouseEvent<HTMLDivElement>, filePath: string) => void;
}

interface ListPaneVirtualContentProps {
    listItems: ListPaneItem[];
    rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    scrollContainerRefCallback: (element: HTMLDivElement | null) => void;
    activeFolderDropPath: string | null;
    isCompactMode: boolean;
    isEmptySelection: boolean;
    hasNoFiles: boolean;
    topSpacerHeight: number;
    settings: NotebookNavigatorSettings;
    pinnedGroupExpanded: boolean;
    onPinnedGroupHeaderToggle: () => void;
    onListGroupHeaderToggle: (collapseKey: string) => void;
    selectionType: NavigationItemType | null;
    sortOption?: SortOption;
    searchHighlightQuery?: string;
    isFolderNavigation: boolean;
    lastSelectedFilePath: string | null;
    isFileSelected: (file: TFile) => boolean;
    hoveredFilePath: string | null;
    suppressRowHover: boolean;
    onHoveredFilePathChange: (path: string | null, pointerClientPosition: PointerClientPosition | null) => void;
    onFileClick: (file: TFile, fileIndex: number | undefined, event: React.MouseEvent) => void;
    onModifySearchWithTag: (tag: string, operator: InclusionOperator) => void;
    onModifySearchWithProperty: (key: string, value: string | null, operator: InclusionOperator) => void;
    localDayReference: Date | null;
    fileIconSize: number;
    appearanceSettings: ListPaneAppearanceSettings;
    includeDescendantNotes: boolean;
    hiddenTagVisibility: HiddenTagVisibility;
    fileNameIconNeedles: readonly FileNameIconNeedle[];
    visibleListPropertyKeys: ReadonlySet<string>;
    visibleNavigationPropertyKeys: ReadonlySet<string>;
    fileItemStorage: FileItemStorageHelpers;
    noteShortcutKeysByPath: ReadonlyMap<string, string>;
    onToggleNoteShortcut: (file: TFile, shortcutKey: string | undefined) => Promise<void>;
    onNavigateToFolder: (folderPath: string, options?: NavigateToFolderOptions) => void;
    folderDecorationModel: FolderDecorationModel;
    fileItemPillDecorationModel: FileItemPillDecorationModel;
    getSolidBackground: (color?: string | null) => string | undefined;
}

function getItemAt<T>(items: T[], index: number): T | undefined {
    if (index < 0 || index >= items.length) {
        return undefined;
    }

    return items[index];
}

function getGroupHeaderLabel(listItems: ListPaneItem[], index: number): string | null {
    for (let listIndex = index - 1; listIndex >= 0; listIndex -= 1) {
        const item = getItemAt(listItems, listIndex);
        if (item?.type === ListPaneItemType.HEADER && item.headerKind === 'date' && typeof item.data === 'string') {
            return item.data;
        }
    }

    return null;
}

function getFirstFileAfterHeader(listItems: ListPaneItem[], headerIndex: number): TFile | null {
    for (let listIndex = headerIndex + 1; listIndex < listItems.length; listIndex += 1) {
        const item = getItemAt(listItems, listIndex);

        if (item?.type === ListPaneItemType.HEADER_SPACER) {
            continue;
        }

        if (item?.type === ListPaneItemType.FILE && item.data instanceof TFile) {
            return item.data;
        }

        return null;
    }

    return null;
}

function findActiveHeaderModel(headers: HeaderRenderModel[], firstVisibleIndex: number | null): HeaderRenderModel | null {
    if (firstVisibleIndex === null || headers.length === 0) {
        return null;
    }

    let low = 0;
    let high = headers.length - 1;
    let activeHeader: HeaderRenderModel | null = null;

    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const header = headers[middle];
        if (header.index <= firstVisibleIndex) {
            activeHeader = header;
            low = middle + 1;
            continue;
        }

        high = middle - 1;
    }

    return activeHeader;
}

function shouldHideCollapsedHeaderSeparator(header: HeaderRenderModel | null): boolean {
    return header?.isCollapsed === true;
}

function shouldHideManualSortGoalHeaderSeparator(header: HeaderRenderModel | null): boolean {
    return header?.manualSortHeader
        ? shouldShowManualSortGroupHeaderProgress(header.manualSortHeader, header.manualSortHeaderTargetWordCount)
        : false;
}

function ListPaneGroupHeader({
    header,
    collapseChevronIcons,
    onPinnedGroupHeaderToggle,
    onListGroupHeaderToggle,
    onFolderGroupHeaderClick,
    onFolderGroupHeaderMouseDown,
    onManualSortGroupHeaderContextMenu
}: ListPaneGroupHeaderProps) {
    const folderGroupHeaderTarget = header.folderGroupHeaderTarget;
    const manualSortHeader = header.manualSortHeader;
    const isClickableFolderGroupHeader = Boolean(folderGroupHeaderTarget) && !header.isPinnedHeader;
    const hasManualSortGoal =
        manualSortHeader !== null && shouldShowManualSortGroupHeaderProgress(manualSortHeader, header.manualSortHeaderTargetWordCount);
    const folderColor = header.folderColor ?? undefined;
    const folderIconStyle = folderColor ? { color: folderColor } : undefined;
    const folderLabelStyle = header.applyFolderColorToLabel && folderColor ? { color: folderColor } : undefined;
    const handleCollapseButtonClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            if (header.isPinnedHeader) {
                onPinnedGroupHeaderToggle();
                return;
            }

            if (header.collapseKey) {
                onListGroupHeaderToggle(header.collapseKey);
            }
        },
        [header.collapseKey, header.isPinnedHeader, onListGroupHeaderToggle, onPinnedGroupHeaderToggle]
    );
    const headerClasses = ['nn-list-group-header'];
    if (header.isPinnedHeader) {
        headerClasses.push('nn-pinned-section-header');
    }
    if (manualSortHeader) {
        headerClasses.push('nn-list-group-header--manual-sort');
    }
    const manualSortHeaderFilePath = header.manualSortHeaderFilePath;
    const handleContextMenu = manualSortHeaderFilePath
        ? (event: React.MouseEvent<HTMLDivElement>) => onManualSortGroupHeaderContextMenu(event, manualSortHeaderFilePath)
        : undefined;

    const headerRow = (
        <div className={headerClasses.join(' ')} onContextMenu={hasManualSortGoal ? undefined : handleContextMenu}>
            {manualSortHeader ? (
                <ManualSortGroupHeaderContent
                    header={manualSortHeader}
                    wordCount={header.manualSortHeaderWordCount}
                    targetWordCount={header.manualSortHeaderTargetWordCount}
                />
            ) : (
                <>
                    {header.folderIconId ? (
                        <ServiceIcon
                            iconId={header.folderIconId}
                            className="nn-list-group-header-icon nn-list-group-header-folder-icon"
                            aria-hidden={true}
                            data-has-color={folderColor ? 'true' : 'false'}
                            style={folderIconStyle}
                        />
                    ) : null}
                    <span
                        className={`nn-list-group-header-text ${
                            isClickableFolderGroupHeader ? 'nn-list-group-header-text--folder-note' : ''
                        } ${header.applyFolderColorToLabel ? 'nn-list-group-header-text--custom-color' : ''}`}
                        style={folderLabelStyle}
                        onClick={folderGroupHeaderTarget ? event => onFolderGroupHeaderClick(event, folderGroupHeaderTarget) : undefined}
                        onMouseDown={
                            folderGroupHeaderTarget ? event => onFolderGroupHeaderMouseDown(event, folderGroupHeaderTarget) : undefined
                        }
                    >
                        {header.label}
                    </span>
                </>
            )}
            {header.isCollapsible ? (
                <button
                    type="button"
                    className="nn-list-group-header-collapse-button"
                    aria-label={header.isCollapsed ? strings.listPane.expandGroup : strings.listPane.collapseGroup}
                    aria-expanded={!header.isCollapsed}
                    onClick={handleCollapseButtonClick}
                >
                    <ServiceIcon
                        iconId={header.isCollapsed ? collapseChevronIcons.collapsed : collapseChevronIcons.expanded}
                        className="nn-list-group-header-icon"
                        aria-hidden={true}
                    />
                </button>
            ) : null}
        </div>
    );

    if (hasManualSortGoal) {
        return (
            <div className="nn-manual-sort-group-header-shell" onContextMenu={handleContextMenu}>
                {headerRow}
                <ManualSortGroupHeaderProgress
                    header={manualSortHeader}
                    wordCount={header.manualSortHeaderWordCount}
                    targetWordCount={header.manualSortHeaderTargetWordCount}
                />
            </div>
        );
    }

    return headerRow;
}

function getHoveredFilePathFromTarget(target: EventTarget | null): string | null {
    if (!(target instanceof Element)) {
        return null;
    }

    const fileElement = target.closest('.nn-file');
    return fileElement instanceof HTMLElement ? (fileElement.dataset.path ?? null) : null;
}

export function getHoveredFilePathAtPointer(
    scrollContainer: HTMLElement | null,
    pointerClientPosition: PointerClientPosition | null
): string | null {
    if (!scrollContainer || !pointerClientPosition) {
        return null;
    }

    const ownerDocument = scrollContainer.ownerDocument;
    if (!ownerDocument) {
        return null;
    }

    const target = ownerDocument.elementFromPoint(pointerClientPosition.clientX, pointerClientPosition.clientY);
    if (!(target instanceof Element) || !scrollContainer.contains(target)) {
        return null;
    }

    return getHoveredFilePathFromTarget(target);
}

export function ListPaneVirtualContent({
    listItems,
    rowVirtualizer,
    scrollContainerRefCallback,
    activeFolderDropPath,
    isCompactMode,
    isEmptySelection,
    hasNoFiles,
    topSpacerHeight,
    settings,
    pinnedGroupExpanded,
    onPinnedGroupHeaderToggle,
    onListGroupHeaderToggle,
    selectionType,
    sortOption,
    searchHighlightQuery,
    isFolderNavigation,
    lastSelectedFilePath,
    isFileSelected,
    hoveredFilePath,
    suppressRowHover,
    onHoveredFilePathChange,
    onFileClick,
    onModifySearchWithTag,
    onModifySearchWithProperty,
    localDayReference,
    fileIconSize,
    appearanceSettings,
    includeDescendantNotes,
    hiddenTagVisibility,
    fileNameIconNeedles,
    visibleListPropertyKeys,
    visibleNavigationPropertyKeys,
    fileItemStorage,
    noteShortcutKeysByPath,
    onToggleNoteShortcut,
    onNavigateToFolder,
    folderDecorationModel,
    fileItemPillDecorationModel,
    getSolidBackground
}: ListPaneVirtualContentProps) {
    const { app, commandQueue, isMobile } = useServices();
    const metadataService = useMetadataService();
    const collapseChevronIcons = useMemo(
        () => ({
            collapsed: resolveUXIcon(settings.interfaceIcons, 'nav-tree-expand'),
            expanded: resolveUXIcon(settings.interfaceIcons, 'nav-tree-collapse')
        }),
        [settings.interfaceIcons]
    );
    const manualSortGroupHeaderPropertyKey = useMemo(
        () =>
            getManualSortGroupHeaderPropertyKey({
                manualSortGroupHeaderProperty: settings.manualSortGroupHeaderProperty,
                manualSortPropertyKey: settings.manualSortPropertyKey
            }),
        [settings.manualSortGroupHeaderProperty, settings.manualSortPropertyKey]
    );

    const folderGroupHeaderTargets = useMemo(() => {
        const targets = new Map<string, FolderGroupHeaderTarget>();

        listItems.forEach(item => {
            if (item.type !== ListPaneItemType.HEADER) {
                return;
            }

            const folderPath = item.headerFolderPath;
            if (!folderPath || targets.has(folderPath)) {
                return;
            }

            const folder = app.vault.getFolderByPath(folderPath);
            if (!folder) {
                return;
            }

            const folderNote =
                settings.enableFolderNotes && settings.enableFolderNoteLinks
                    ? getFolderNote(folder, {
                          enableFolderNotes: settings.enableFolderNotes,
                          folderNoteName: settings.folderNoteName,
                          folderNoteNamePattern: settings.folderNoteNamePattern
                      })
                    : null;

            targets.set(folderPath, { folder, folderNote });
        });

        return targets;
    }, [
        app.vault,
        listItems,
        settings.enableFolderNoteLinks,
        settings.enableFolderNotes,
        settings.folderNoteName,
        settings.folderNoteNamePattern
    ]);

    const { headerModels, headerModelByIndex } = useMemo<HeaderRenderModels>(() => {
        const models: HeaderRenderModel[] = [];
        const modelsByIndex = new Map<number, HeaderRenderModel>();
        let hasSeenFile = false;

        // Build one header model set for both virtual rows and the sticky overlay so click behavior stays identical.
        listItems.forEach((item, index) => {
            if (item.type === ListPaneItemType.FILE) {
                hasSeenFile = true;
                return;
            }

            if (item.type !== ListPaneItemType.HEADER || typeof item.data !== 'string') {
                return;
            }

            const headerFolderPath = item.headerFolderPath ?? null;
            const isPinnedHeader = item.key === PINNED_SECTION_HEADER_KEY;
            const collapseKey = item.collapseKey ?? null;
            const isCollapsed = isPinnedHeader ? !pinnedGroupExpanded : item.isCollapsed === true;
            const manualSortHeader = item.headerKind === 'manual-sort-custom' ? (item.manualSortHeader ?? null) : null;
            const folderGroupDecorationPath = item.headerKind === 'folder' ? (headerFolderPath ?? '/') : null;
            let folderIconId: string | null = null;
            let folderColor: string | null = null;
            const shouldResolveFolderIcon = settings.showFolderIcons;
            const shouldResolveFolderColor = settings.showFolderIcons || !settings.colorIconOnly;
            if (folderGroupDecorationPath !== null && (shouldResolveFolderIcon || shouldResolveFolderColor)) {
                const folderDisplayData = metadataService.getFolderDisplayData(folderGroupDecorationPath, {
                    includeDisplayName: false,
                    includeColor: shouldResolveFolderColor,
                    includeBackgroundColor: false,
                    includeIcon: shouldResolveFolderIcon,
                    includeInheritedColors: shouldResolveFolderColor
                });
                folderIconId = shouldResolveFolderIcon
                    ? (folderDisplayData.icon ??
                      resolveUXIcon(
                          settings.interfaceIcons,
                          folderGroupDecorationPath === '/' ? 'nav-folder-root' : isCollapsed ? 'nav-folder-closed' : 'nav-folder-open'
                      ))
                    : null;
                if (shouldResolveFolderColor) {
                    folderColor =
                        resolveFolderDecorationColors({
                            model: folderDecorationModel,
                            folderPath: folderGroupDecorationPath,
                            color: folderDisplayData.color,
                            backgroundColor: undefined
                        }).color ?? null;
                }
            }
            const model: HeaderRenderModel = {
                index,
                label: item.data,
                isFirstHeader: models.length === 0 && !hasSeenFile,
                isPinnedHeader,
                collapseKey,
                isCollapsed,
                isCollapsible: isPinnedHeader || collapseKey !== null,
                folderGroupHeaderTarget: headerFolderPath !== null ? (folderGroupHeaderTargets.get(headerFolderPath) ?? null) : null,
                manualSortHeaderFilePath: item.headerKind === 'manual-sort-custom' ? (item.manualSortHeaderFilePath ?? null) : null,
                manualSortHeader,
                manualSortHeaderWordCount: item.manualSortHeaderWordCount ?? 0,
                manualSortHeaderTargetWordCount: item.manualSortHeaderTargetWordCount ?? null,
                folderIconId,
                folderColor,
                applyFolderColorToLabel: folderColor !== null && !settings.colorIconOnly
            };
            models.push(model);
            modelsByIndex.set(index, model);
        });

        return {
            headerModels: models,
            headerModelByIndex: modelsByIndex
        };
    }, [
        folderDecorationModel,
        folderGroupHeaderTargets,
        listItems,
        metadataService,
        pinnedGroupExpanded,
        settings.colorIconOnly,
        settings.interfaceIcons,
        settings.showFolderIcons
    ]);

    const handleFolderGroupHeaderClick = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>, target: FolderGroupHeaderTarget) => {
            event.stopPropagation();
            const folderNote = target.folderNote;

            const navigateOptions: NavigateToFolderOptions = {
                source: 'manual',
                suppressAutoSelect: Boolean(folderNote)
            };
            onNavigateToFolder(target.folder.path, navigateOptions);

            if (!folderNote) {
                return;
            }

            const openContext = resolveFolderNoteClickOpenContext(
                event,
                settings.openFolderNotesInNewTab,
                settings.multiSelectModifier,
                isMobile
            );

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder: target.folder,
                    folderNote,
                    context: openContext
                })
            );
        },
        [app, commandQueue, isMobile, onNavigateToFolder, settings.multiSelectModifier, settings.openFolderNotesInNewTab]
    );

    const handleFolderGroupHeaderMouseDown = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>, target: FolderGroupHeaderTarget) => {
            const folderNote = target.folderNote;
            if (event.button !== 1 || !folderNote) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            onNavigateToFolder(target.folder.path, { source: 'manual', suppressAutoSelect: true });

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder: target.folder,
                    folderNote,
                    context: 'tab'
                })
            );
        },
        [app, commandQueue, onNavigateToFolder]
    );

    const handleManualSortGroupHeaderContextMenu = useCallback(
        (event: React.MouseEvent<HTMLDivElement>, filePath: string) => {
            if (!manualSortGroupHeaderPropertyKey) {
                return;
            }

            const file = app.vault.getFileByPath(filePath);
            if (!(file instanceof TFile) || file.extension !== 'md') {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const menu = new Menu();
            addManualSortGroupHeaderMenuItems({ menu, app, file, propertyKey: manualSortGroupHeaderPropertyKey, metadataService });
            menu.showAtMouseEvent(event.nativeEvent);
        },
        [app, manualSortGroupHeaderPropertyKey, metadataService]
    );

    const handleListMouseMove = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            onHoveredFilePathChange(getHoveredFilePathFromTarget(event.target), {
                clientX: event.clientX,
                clientY: event.clientY
            });
        },
        [onHoveredFilePathChange]
    );

    const handleListMouseLeave = useCallback(() => {
        onHoveredFilePathChange(null, null);
    }, [onHoveredFilePathChange]);

    const hasFileCustomBackground = useCallback(
        (item: ListPaneItem | undefined) => {
            if (item?.type !== ListPaneItemType.FILE || !(item.data instanceof TFile)) {
                return false;
            }

            const file = item.data;
            const taskUnfinished = settings.showFileBackgroundUnfinishedTask
                ? fileItemStorage.getDB().getFile(file.path)?.taskUnfinished
                : undefined;
            return hasSolidFileRowBackground({
                customBackgroundColor: metadataService.getFileBackgroundColor(file.path),
                taskUnfinished,
                showUnfinishedTaskBackground: settings.showFileBackgroundUnfinishedTask,
                unfinishedTaskBackgroundColor: settings.unfinishedTaskBackgroundColor,
                getSolidBackground
            });
        },
        [
            fileItemStorage,
            getSolidBackground,
            metadataService,
            settings.showFileBackgroundUnfinishedTask,
            settings.unfinishedTaskBackgroundColor
        ]
    );

    const virtualItems = rowVirtualizer.getVirtualItems();
    const scrollOffset = rowVirtualizer.scrollOffset ?? 0;
    const stickyGroupHeaders = settings.stickyGroupHeaders;
    const stickyOffset =
        stickyGroupHeaders && (topSpacerHeight === 0 || scrollOffset >= topSpacerHeight) ? Math.max(0, scrollOffset + 0.5) : null;
    const firstVisibleItem =
        stickyOffset !== null && listItems.length > 0 ? rowVirtualizer.getVirtualItemForOffset(stickyOffset) : undefined;
    const stickyHeader = stickyGroupHeaders ? findActiveHeaderModel(headerModels, firstVisibleItem?.index ?? null) : null;

    return (
        <div
            ref={scrollContainerRefCallback}
            className={`nn-list-pane-scroller ${!isEmptySelection && !hasNoFiles && isCompactMode ? 'nn-compact-mode' : ''}`}
            data-drop-zone={activeFolderDropPath ? 'folder' : undefined}
            data-drop-path={activeFolderDropPath ?? undefined}
            data-allow-internal-drop={activeFolderDropPath ? 'false' : undefined}
            data-allow-external-drop={activeFolderDropPath ? 'true' : undefined}
            data-pane="files"
            role="list"
            tabIndex={-1}
            onMouseMove={handleListMouseMove}
            onMouseLeave={handleListMouseLeave}
        >
            {stickyHeader ? (
                <div className="nn-list-sticky-header">
                    <ListPaneGroupHeader
                        header={stickyHeader}
                        collapseChevronIcons={collapseChevronIcons}
                        onPinnedGroupHeaderToggle={onPinnedGroupHeaderToggle}
                        onListGroupHeaderToggle={onListGroupHeaderToggle}
                        onFolderGroupHeaderClick={handleFolderGroupHeaderClick}
                        onFolderGroupHeaderMouseDown={handleFolderGroupHeaderMouseDown}
                        onManualSortGroupHeaderContextMenu={handleManualSortGroupHeaderContextMenu}
                    />
                </div>
            ) : null}
            <div className="nn-list-pane-content">
                {isEmptySelection ? (
                    <div className="nn-empty-state">
                        <div className="nn-empty-message">{strings.listPane.emptyStateNoSelection}</div>
                    </div>
                ) : hasNoFiles ? (
                    <div className="nn-empty-state">
                        <div className="nn-empty-message">{strings.listPane.emptyStateNoNotes}</div>
                    </div>
                ) : listItems.length > 0 ? (
                    <div
                        className="nn-virtual-container"
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`
                        }}
                    >
                        {virtualItems.map(virtualItem => {
                            const item = getItemAt(listItems, virtualItem.index);
                            if (!item) {
                                return null;
                            }

                            let isSelected = false;
                            if (item.type === ListPaneItemType.FILE && item.data instanceof TFile) {
                                isSelected = isFileSelected(item.data);
                                if (!isSelected && isFolderNavigation && lastSelectedFilePath) {
                                    isSelected = item.data.path === lastSelectedFilePath;
                                }
                            }

                            const nextItem = getItemAt(listItems, virtualItem.index + 1);
                            const previousItem = getItemAt(listItems, virtualItem.index - 1);
                            const isFileRow = item.type === ListPaneItemType.FILE && item.data instanceof TFile;
                            const hasCustomBackground = hasFileCustomBackground(item);
                            const hasPreviousCustomBackground = hasCustomBackground && hasFileCustomBackground(previousItem);
                            const hasNextCustomBackground = isFileRow && hasFileCustomBackground(nextItem);
                            const isLastFile =
                                item.type === ListPaneItemType.FILE &&
                                (virtualItem.index === listItems.length - 1 ||
                                    (nextItem &&
                                        (nextItem.type === ListPaneItemType.HEADER ||
                                            nextItem.type === ListPaneItemType.HEADER_SPACER ||
                                            nextItem.type === ListPaneItemType.TOP_SPACER ||
                                            nextItem.type === ListPaneItemType.BOTTOM_SPACER)));

                            const hasSelectedAbove =
                                item.type === ListPaneItemType.FILE &&
                                previousItem?.type === ListPaneItemType.FILE &&
                                previousItem.data instanceof TFile &&
                                isFileSelected(previousItem.data);
                            const hasSelectedBelow =
                                item.type === ListPaneItemType.FILE &&
                                nextItem?.type === ListPaneItemType.FILE &&
                                nextItem.data instanceof TFile &&
                                isFileSelected(nextItem.data);

                            const groupHeaderLabel =
                                item.type === ListPaneItemType.FILE ? getGroupHeaderLabel(listItems, virtualItem.index) : null;
                            const shortcutKey =
                                item.type === ListPaneItemType.FILE && item.data instanceof TFile
                                    ? noteShortcutKeysByPath.get(item.data.path)
                                    : undefined;

                            const headerModel = headerModelByIndex.get(virtualItem.index) ?? null;
                            const firstFileAfterHeader = headerModel ? getFirstFileAfterHeader(listItems, virtualItem.index) : null;
                            const shouldHideHeaderSeparatorForGroup =
                                shouldHideCollapsedHeaderSeparator(headerModel) || shouldHideManualSortGoalHeaderSeparator(headerModel);
                            const hideFileSeparator =
                                item.type === ListPaneItemType.FILE &&
                                ((isSelected && !hasSelectedBelow) ||
                                    (!isSelected &&
                                        nextItem?.type === ListPaneItemType.FILE &&
                                        nextItem.data instanceof TFile &&
                                        isFileSelected(nextItem.data)));
                            const hideHeaderSeparator = firstFileAfterHeader !== null && isFileSelected(firstFileAfterHeader);
                            const hideSeparator = hideFileSeparator || hideHeaderSeparator;

                            const virtualItemStyle: VirtualRowStyle = {
                                top: Math.max(0, virtualItem.start),
                                '--item-height': `${virtualItem.size}px`
                            };
                            const virtualItemClasses = ['nn-virtual-item'];
                            if (item.type === ListPaneItemType.FILE) {
                                virtualItemClasses.push('nn-virtual-file-item');
                            }
                            if (headerModel) {
                                virtualItemClasses.push('nn-virtual-list-group-header');
                            }
                            if (shouldHideHeaderSeparatorForGroup) {
                                virtualItemClasses.push('nn-hide-list-group-header-separator');
                            }
                            if (isLastFile) {
                                virtualItemClasses.push('nn-last-file');
                            }
                            if (hideSeparator) {
                                virtualItemClasses.push('nn-hide-separator-selection');
                            }
                            if (hasCustomBackground) {
                                virtualItemClasses.push('nn-virtual-file-item-has-custom-background');
                            }
                            if (hasPreviousCustomBackground) {
                                virtualItemClasses.push('nn-virtual-file-item-has-custom-background-previous');
                            }
                            if (hasNextCustomBackground) {
                                virtualItemClasses.push('nn-virtual-file-item-has-custom-background-next');
                            }

                            return (
                                <div
                                    key={virtualItem.key}
                                    className={virtualItemClasses.join(' ')}
                                    style={virtualItemStyle}
                                    data-index={virtualItem.index}
                                >
                                    {headerModel ? (
                                        <ListPaneGroupHeader
                                            header={headerModel}
                                            collapseChevronIcons={collapseChevronIcons}
                                            onPinnedGroupHeaderToggle={onPinnedGroupHeaderToggle}
                                            onListGroupHeaderToggle={onListGroupHeaderToggle}
                                            onFolderGroupHeaderClick={handleFolderGroupHeaderClick}
                                            onFolderGroupHeaderMouseDown={handleFolderGroupHeaderMouseDown}
                                            onManualSortGroupHeaderContextMenu={handleManualSortGroupHeaderContextMenu}
                                        />
                                    ) : item.type === ListPaneItemType.HEADER_SPACER ? (
                                        <div className="nn-list-group-header-spacer" />
                                    ) : item.type === ListPaneItemType.TOP_SPACER ? (
                                        <div className="nn-list-top-spacer" style={{ height: `${topSpacerHeight}px` }} />
                                    ) : item.type === ListPaneItemType.BOTTOM_SPACER ? (
                                        <div className="nn-list-bottom-spacer" />
                                    ) : item.type === ListPaneItemType.FILE && item.data instanceof TFile ? (
                                        <FileItem
                                            key={item.key}
                                            file={item.data}
                                            isSelected={isSelected}
                                            hasSelectedAbove={hasSelectedAbove}
                                            hasSelectedBelow={hasSelectedBelow}
                                            showQuickActionsPanel={!suppressRowHover && hoveredFilePath === item.data.path}
                                            onFileClick={onFileClick}
                                            fileIndex={item.fileIndex}
                                            selectionType={selectionType}
                                            groupHeaderLabel={groupHeaderLabel}
                                            sortOption={sortOption}
                                            parentFolder={item.parentFolder}
                                            isPinned={item.isPinned}
                                            searchQuery={searchHighlightQuery}
                                            searchMeta={item.searchMeta}
                                            isHidden={Boolean(item.isHidden)}
                                            onModifySearchWithTag={onModifySearchWithTag}
                                            onModifySearchWithProperty={onModifySearchWithProperty}
                                            localDayReference={localDayReference}
                                            fileIconSize={fileIconSize}
                                            appearanceSettings={appearanceSettings}
                                            includeDescendantNotes={includeDescendantNotes}
                                            hiddenTagVisibility={hiddenTagVisibility}
                                            fileNameIconNeedles={fileNameIconNeedles}
                                            visiblePropertyKeys={visibleListPropertyKeys}
                                            visibleNavigationPropertyKeys={visibleNavigationPropertyKeys}
                                            fileItemStorage={fileItemStorage}
                                            shortcutKey={shortcutKey}
                                            onToggleNoteShortcut={onToggleNoteShortcut}
                                            folderDecorationModel={folderDecorationModel}
                                            fileItemPillDecorationModel={fileItemPillDecorationModel}
                                            getSolidBackground={getSolidBackground}
                                        />
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
