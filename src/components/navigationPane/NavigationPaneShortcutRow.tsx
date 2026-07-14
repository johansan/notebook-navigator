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

import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { ItemType, NavigationPaneItemType } from '../../types';
import type { ShortcutContextMenuTarget } from '../../hooks/navigationPane/navigationPaneShortcutTypes';
import { isFolderShortcut, isNoteShortcut, isPropertyShortcut, isTagShortcut } from '../../types/shortcuts';
import { runAsyncAction } from '../../utils/async';
import { resolveUXIcon } from '../../utils/uxIcons';
import { getFolderNote } from '../../utils/folderNoteLookup';
import { getExtensionSuffix, shouldShowExtensionSuffix } from '../../utils/fileTypeUtils';
import { shouldExcludeFolderFromDescendants } from '../../utils/fileFilters';
import { getPathBaseName } from '../../utils/pathUtils';
import { buildFileTooltip, buildFolderTooltip } from '../../utils/navigationTooltipUtils';
import { ShortcutItem } from '../ShortcutItem';
import type { NavigationPaneRowProps } from './NavigationPaneItemRenderer.types';

interface SortableShortcutItemProps extends React.ComponentProps<typeof ShortcutItem> {
    sortableId: string;
    canReorder: boolean;
}

function SortableShortcutItem({ sortableId, canReorder, ...rest }: SortableShortcutItemProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isSorting } = useSortable({
        id: sortableId,
        disabled: !canReorder
    });
    const dragStyle = transform ? { transform: CSS.Transform.toString(transform), transition } : undefined;

    return (
        <ShortcutItem
            {...rest}
            dragRef={setNodeRef}
            dragHandleRef={setActivatorNodeRef}
            dragAttributes={attributes}
            dragListeners={listeners}
            dragStyle={dragStyle}
            isSorting={isSorting}
        />
    );
}

export function NavigationPaneShortcutRow({ item, context, adjacentFilledClassName, isDragSource }: NavigationPaneRowProps) {
    const { app, settings, showHiddenItems, getFileDisplayName, getSolidBackground, shortcuts, shortcutUiState } = context;
    const shouldShowTooltip = !context.isMobile && settings.showTooltips;

    switch (item.type) {
        case NavigationPaneItemType.SHORTCUT_FOLDER: {
            const folder = item.folder;
            const isMissing = Boolean(item.isMissing);
            const canInteract = Boolean(folder) && !isMissing;
            if (!canInteract && !isMissing) {
                return null;
            }

            const folderPath = isFolderShortcut(item.shortcut) ? item.shortcut.path : '';
            const isRootShortcut = folderPath === '/';
            const folderName = (() => {
                if (isRootShortcut) {
                    return item.displayName || settings.customVaultName || app.vault.getName();
                }
                if (canInteract && folder) {
                    return item.displayName || folder.name;
                }
                return getPathBaseName(folderPath);
            })();
            const folderCountInfo =
                canInteract && folder && shortcutUiState.shouldShowShortcutCounts ? shortcuts.getFolderShortcutCount(folder) : undefined;
            const isFolderHiddenFromParents = Boolean(
                canInteract &&
                folder &&
                context.descendantExcludedFolders.length > 0 &&
                shouldExcludeFolderFromDescendants(folder.name, context.descendantExcludedFolders, folder.path)
            );
            const folderNote =
                canInteract && folder && settings.enableFolderNotes && settings.enableFolderNoteLinks
                    ? getFolderNote(folder, settings)
                    : null;
            const folderAlias = isFolderShortcut(item.shortcut) ? item.shortcut.alias : undefined;
            const folderLabel = folderAlias && folderAlias.length > 0 ? folderAlias : folderName;
            const contextTarget: ShortcutContextMenuTarget =
                canInteract && folder ? { type: 'folder', key: item.key, folder } : { type: 'missing', key: item.key, kind: 'folder' };
            const shortcutBackground = isMissing ? undefined : getSolidBackground(item.backgroundColor);
            const tooltip =
                canInteract && folder && shouldShowTooltip
                    ? buildFolderTooltip({
                          app,
                          folder,
                          displayName: folderLabel,
                          fileVisibility: context.fileVisibility,
                          hiddenFolders: context.hiddenFolders,
                          settings,
                          showHiddenItems
                      })
                    : undefined;
            const shortcutProps = {
                icon: isMissing
                    ? 'lucide-alert-triangle'
                    : item.isExcluded && !showHiddenItems
                      ? 'lucide-eye-off'
                      : (item.icon ?? 'lucide-folder'),
                color: isMissing ? undefined : item.color,
                backgroundColor: shortcutBackground,
                adjacentFilledClassName,
                label: folderLabel,
                description: undefined,
                level: item.level,
                type: 'folder' as const,
                countInfo: !isMissing ? folderCountInfo : undefined,
                badge: shortcutUiState.shortcutNumberBadgesByKey.get(item.key),
                tooltip,
                forceShowCount: shortcutUiState.shouldShowShortcutCounts,
                isHiddenFromParents: isFolderHiddenFromParents,
                isExcluded: !isMissing ? item.isExcluded : undefined,
                isDisabled: isMissing,
                isMissing,
                onClick: () => {
                    if (!folder) {
                        return;
                    }
                    shortcuts.handleShortcutFolderActivate(folder, item.key);
                },
                onRemove: () => {
                    runAsyncAction(() => shortcuts.removeShortcut(item.key));
                },
                onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => shortcuts.handleShortcutContextMenu(event, contextTarget),
                dragHandlers: shortcuts.buildShortcutExternalHandlers(item.key),
                dragHandleConfig: shortcutUiState.shortcutDragHandleConfig,
                hasFolderNote: !isMissing && Boolean(folderNote),
                onLabelClick:
                    folder && folderNote
                        ? (event: React.MouseEvent<HTMLSpanElement>) => {
                              shortcuts.handleShortcutFolderNoteClick(folder, item.key, event);
                          }
                        : undefined,
                onLabelMouseDown:
                    folder && folderNote
                        ? (event: React.MouseEvent<HTMLSpanElement>) => shortcuts.handleShortcutFolderNoteMouseDown(folder, event)
                        : undefined
            };

            if (shortcutUiState.shouldUseShortcutDnd) {
                return (
                    <SortableShortcutItem
                        sortableId={item.key}
                        canReorder={shortcutUiState.shouldUseShortcutDnd}
                        isDragSource={isDragSource}
                        {...shortcutProps}
                    />
                );
            }

            return <ShortcutItem {...shortcutProps} isDragSource={isDragSource} />;
        }

        case NavigationPaneItemType.SHORTCUT_NOTE: {
            const note = item.note;
            const isMissing = Boolean(item.isMissing);
            const canInteract = Boolean(note) && !isMissing;
            const notePath = isNoteShortcut(item.shortcut) ? item.shortcut.path : '';
            const noteDisplayName = canInteract && note ? getFileDisplayName(note) : '';
            const extensionSuffix = canInteract && note && shouldShowExtensionSuffix(note) ? getExtensionSuffix(note) : '';
            const defaultLabel = (() => {
                if (!note || !canInteract) {
                    return shortcuts.getMissingNoteLabel(notePath);
                }
                return extensionSuffix ? `${noteDisplayName}${extensionSuffix}` : noteDisplayName;
            })();
            const noteAlias = isNoteShortcut(item.shortcut) ? item.shortcut.alias : undefined;
            const label = noteAlias && noteAlias.length > 0 ? noteAlias : defaultLabel;
            const contextTarget: ShortcutContextMenuTarget =
                canInteract && note ? { type: 'note', key: item.key, file: note } : { type: 'missing', key: item.key, kind: 'note' };
            const shortcutBackground = isMissing ? undefined : getSolidBackground(item.backgroundColor);
            const tooltip =
                canInteract && note && shouldShowTooltip
                    ? buildFileTooltip({
                          file: note,
                          displayName: noteDisplayName,
                          extensionSuffix,
                          settings,
                          getFileTimestamps: context.getFileTimestamps,
                          wordCount: context.getFileWordCount(note)
                      })
                    : undefined;
            const shortcutProps = {
                icon: isMissing
                    ? 'lucide-alert-triangle'
                    : item.isExcluded && !showHiddenItems
                      ? 'lucide-eye-off'
                      : (item.icon ?? 'lucide-file-text'),
                color: isMissing ? undefined : item.color,
                backgroundColor: shortcutBackground,
                adjacentFilledClassName,
                label,
                description: undefined,
                level: item.level,
                type: 'note' as const,
                badge: shortcutUiState.shortcutNumberBadgesByKey.get(item.key),
                tooltip,
                forceShowCount: shortcutUiState.shouldShowShortcutCounts,
                isExcluded: !isMissing ? item.isExcluded : undefined,
                isDisabled: isMissing,
                isMissing,
                onClick: (event: React.MouseEvent<HTMLDivElement>) => {
                    if (!note) {
                        return;
                    }
                    shortcuts.handleShortcutNoteActivate(note, item.key, event);
                },
                onRemove: () => {
                    runAsyncAction(() => shortcuts.removeShortcut(item.key));
                },
                onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => {
                    if (!note || !canInteract) {
                        return;
                    }
                    shortcuts.handleShortcutNoteMouseDown(event, note);
                },
                onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => shortcuts.handleShortcutContextMenu(event, contextTarget),
                dragHandlers: shortcuts.buildShortcutExternalHandlers(item.key),
                dragHandleConfig: shortcutUiState.shortcutDragHandleConfig
            };

            if (shortcutUiState.shouldUseShortcutDnd) {
                return (
                    <SortableShortcutItem
                        sortableId={item.key}
                        canReorder={shortcutUiState.shouldUseShortcutDnd}
                        isDragSource={isDragSource}
                        {...shortcutProps}
                    />
                );
            }

            return <ShortcutItem {...shortcutProps} isDragSource={isDragSource} />;
        }

        case NavigationPaneItemType.SHORTCUT_SEARCH: {
            const searchShortcut = item.searchShortcut;
            const shortcutProps = {
                icon: 'lucide-search',
                color: item.color,
                backgroundColor: getSolidBackground(item.backgroundColor),
                adjacentFilledClassName,
                label: searchShortcut.name,
                level: item.level,
                type: 'search' as const,
                badge: shortcutUiState.shortcutNumberBadgesByKey.get(item.key),
                forceShowCount: shortcutUiState.shouldShowShortcutCounts,
                onRemove: () => {
                    runAsyncAction(() => shortcuts.removeShortcut(item.key));
                },
                onClick: () => shortcuts.handleShortcutSearchActivate(item.key, searchShortcut),
                onContextMenu: (event: React.MouseEvent<HTMLDivElement>) =>
                    shortcuts.handleShortcutContextMenu(event, { type: 'search', key: item.key, searchShortcut }),
                dragHandlers: shortcuts.buildShortcutExternalHandlers(item.key),
                dragHandleConfig: shortcutUiState.shortcutDragHandleConfig
            };

            if (shortcutUiState.shouldUseShortcutDnd) {
                return (
                    <SortableShortcutItem
                        sortableId={item.key}
                        canReorder={shortcutUiState.shouldUseShortcutDnd}
                        isDragSource={isDragSource}
                        {...shortcutProps}
                    />
                );
            }

            return <ShortcutItem {...shortcutProps} isDragSource={isDragSource} />;
        }

        case NavigationPaneItemType.SHORTCUT_TAG: {
            const isMissing = Boolean(item.isMissing);
            const tagPath = isTagShortcut(item.shortcut) ? item.shortcut.tagPath : item.tagPath;
            const tagCountInfo =
                !isMissing && shortcutUiState.shouldShowShortcutCounts ? shortcuts.getTagShortcutCount(tagPath) : undefined;
            const tagAlias = isTagShortcut(item.shortcut) ? item.shortcut.alias : undefined;
            const tagLabel = tagAlias && tagAlias.length > 0 ? tagAlias : item.displayName;
            const contextTarget: ShortcutContextMenuTarget = !isMissing
                ? { type: 'tag', key: item.key, tagPath }
                : { type: 'missing', key: item.key, kind: 'tag' };
            const shortcutBackground = isMissing ? undefined : getSolidBackground(item.backgroundColor);
            const shortcutProps = {
                icon: isMissing
                    ? 'lucide-alert-triangle'
                    : item.isExcluded && !showHiddenItems
                      ? 'lucide-eye-off'
                      : (item.icon ?? 'lucide-tags'),
                color: isMissing ? undefined : item.color,
                backgroundColor: shortcutBackground,
                adjacentFilledClassName,
                label: tagLabel,
                description: undefined,
                level: item.level,
                type: 'tag' as const,
                countInfo: tagCountInfo,
                badge: shortcutUiState.shortcutNumberBadgesByKey.get(item.key),
                forceShowCount: shortcutUiState.shouldShowShortcutCounts,
                isExcluded: !isMissing ? item.isExcluded : undefined,
                isDisabled: isMissing,
                isMissing,
                onClick: () => {
                    if (isMissing) {
                        return;
                    }
                    shortcuts.handleShortcutTagActivate(tagPath, item.key);
                },
                onRemove: () => {
                    runAsyncAction(() => shortcuts.removeShortcut(item.key));
                },
                onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => shortcuts.handleShortcutContextMenu(event, contextTarget),
                dragHandlers: shortcuts.buildShortcutExternalHandlers(item.key),
                dragHandleConfig: shortcutUiState.shortcutDragHandleConfig
            };

            if (shortcutUiState.shouldUseShortcutDnd) {
                return (
                    <SortableShortcutItem
                        sortableId={item.key}
                        canReorder={shortcutUiState.shouldUseShortcutDnd}
                        isDragSource={isDragSource}
                        {...shortcutProps}
                    />
                );
            }

            return <ShortcutItem {...shortcutProps} isDragSource={isDragSource} />;
        }

        case NavigationPaneItemType.SHORTCUT_PROPERTY: {
            const isMissing = Boolean(item.isMissing);
            const propertyNodeId = item.propertyNodeId;
            const propertyCountInfo =
                !isMissing && shortcutUiState.shouldShowShortcutCounts ? shortcuts.getPropertyShortcutCount(propertyNodeId) : undefined;
            const propertyAlias = isPropertyShortcut(item.shortcut) ? item.shortcut.alias : undefined;
            const propertyLabel = propertyAlias && propertyAlias.length > 0 ? propertyAlias : item.displayName;
            const contextTarget: ShortcutContextMenuTarget = !isMissing
                ? { type: 'property', key: item.key, propertyNodeId }
                : { type: 'missing', key: item.key, kind: 'property' };
            const shortcutProps = {
                icon: isMissing ? 'lucide-alert-triangle' : (item.icon ?? resolveUXIcon(settings.interfaceIcons, 'nav-property')),
                color: isMissing ? undefined : item.color,
                backgroundColor: isMissing ? undefined : getSolidBackground(item.backgroundColor),
                adjacentFilledClassName,
                label: propertyLabel,
                description: undefined,
                level: item.level,
                type: 'property' as const,
                countInfo: propertyCountInfo,
                badge: shortcutUiState.shortcutNumberBadgesByKey.get(item.key),
                forceShowCount: shortcutUiState.shouldShowShortcutCounts,
                isDisabled: isMissing,
                isMissing,
                onClick: () => {
                    if (isMissing) {
                        return;
                    }
                    shortcuts.handleShortcutPropertyActivate(propertyNodeId, item.key);
                },
                onRemove: () => {
                    runAsyncAction(() => shortcuts.removeShortcut(item.key));
                },
                onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => shortcuts.handleShortcutContextMenu(event, contextTarget),
                dragHandlers: shortcuts.buildShortcutExternalHandlers(item.key),
                dragHandleConfig: shortcutUiState.shortcutDragHandleConfig
            };

            if (shortcutUiState.shouldUseShortcutDnd) {
                return (
                    <SortableShortcutItem
                        sortableId={item.key}
                        canReorder={shortcutUiState.shouldUseShortcutDnd}
                        isDragSource={isDragSource}
                        {...shortcutProps}
                    />
                );
            }

            return <ShortcutItem {...shortcutProps} isDragSource={isDragSource} />;
        }

        case NavigationPaneItemType.RECENT_NOTE: {
            const note = item.note;
            const displayName = getFileDisplayName(note);
            const extensionSuffix = shouldShowExtensionSuffix(note) ? getExtensionSuffix(note) : '';
            const label = extensionSuffix ? `${displayName}${extensionSuffix}` : displayName;
            const tooltip = shouldShowTooltip
                ? buildFileTooltip({
                      file: note,
                      displayName,
                      extensionSuffix,
                      settings,
                      getFileTimestamps: context.getFileTimestamps,
                      wordCount: context.getFileWordCount(note)
                  })
                : undefined;

            return (
                <ShortcutItem
                    icon={item.icon ?? 'lucide-file-text'}
                    color={item.color}
                    backgroundColor={getSolidBackground(item.backgroundColor)}
                    adjacentFilledClassName={adjacentFilledClassName}
                    label={label}
                    tooltip={tooltip}
                    level={item.level}
                    type="note"
                    onClick={event => shortcuts.handleRecentNoteActivate(note, event)}
                    onMouseDown={event => shortcuts.handleShortcutNoteMouseDown(event, note)}
                    onContextMenu={event => shortcuts.handleRecentFileContextMenu(event, note)}
                    nativeDragData={
                        context.isMobile
                            ? undefined
                            : {
                                  path: note.path,
                                  type: ItemType.FILE,
                                  icon: item.icon ?? 'lucide-file-text',
                                  fallbackIcon: 'file-text',
                                  baseIcon: 'file',
                                  iconColor: item.color,
                                  allowMultiFileDrag: false
                              }
                    }
                />
            );
        }

        default:
            return null;
    }
}
