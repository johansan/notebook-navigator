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

import React, { useCallback, useMemo, useState } from 'react';
import { TFile, TFolder, type App } from 'obsidian';
import { PointerSensor, type DragEndEvent, type DragStartEvent, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { showNotice } from '../../utils/noticeUtils';
import {
    extractFilePathsFromDataTransfer,
    hasPotentialObsidianFileDragType,
    parsePropertyDragPayload,
    parseTagDragPayload
} from '../../utils/dragData';
import { runAsyncAction } from '../../utils/async';
import { PROPERTY_DRAG_MIME, TAG_DRAG_MIME } from '../../types/obsidian-extended';
import { SHORTCUT_POINTER_CONSTRAINT } from '../../utils/dndConfig';
import type { ShortcutEntry } from '../../types/shortcuts';
import { ShortcutType, SHORTCUT_DRAG_MIME } from '../../types/shortcuts';
import { strings } from '../../i18n';
import type { ListReorderHandlers } from '../../types/listReorder';

interface HydratedShortcutDndItem {
    key: string;
}

interface UseNavigationPaneShortcutDnDProps {
    app: App;
    isMobile: boolean;
    isRootReorderMode: boolean;
    isShortcutContextMenuOpen: boolean;
    shortcutsExpanded: boolean;
    showShortcuts: boolean;
    hydratedShortcuts: HydratedShortcutDndItem[];
    hasFolderShortcut: (path: string) => boolean;
    hasNoteShortcut: (path: string) => boolean;
    reorderShortcuts: (orderedKeys: string[]) => Promise<boolean>;
    addTagShortcut: (tagPath: string, options?: { index?: number }) => Promise<boolean>;
    addPropertyShortcut: (nodeId: string, options?: { index?: number }) => Promise<boolean>;
    addShortcutsBatch: (entries: ShortcutEntry[], options?: { index?: number }) => Promise<number>;
}

export function useNavigationPaneShortcutDnD({
    app,
    isMobile,
    isRootReorderMode,
    isShortcutContextMenuOpen,
    shortcutsExpanded,
    showShortcuts,
    hydratedShortcuts,
    hasFolderShortcut,
    hasNoteShortcut,
    reorderShortcuts,
    addTagShortcut,
    addPropertyShortcut,
    addShortcutsBatch
}: UseNavigationPaneShortcutDnDProps) {
    const shortcutCount = hydratedShortcuts.length;
    const isShortcutDnDEnabled = shortcutsExpanded && shortcutCount > 0 && showShortcuts;
    const shortcutIds = useMemo(() => hydratedShortcuts.map(entry => entry.key), [hydratedShortcuts]);
    const shortcutSensors = useSensors(useSensor(PointerSensor, { activationConstraint: SHORTCUT_POINTER_CONSTRAINT }));
    const shouldUseShortcutDnd = isShortcutDnDEnabled && shortcutIds.length > 1 && !isRootReorderMode && !isShortcutContextMenuOpen;
    const [activeShortcutId, setActiveShortcutId] = useState<string | null>(null);
    const isShortcutSorting = shouldUseShortcutDnd && Boolean(activeShortcutId);

    const showShortcutDragHandles = isMobile && isShortcutDnDEnabled;
    const shortcutDragHandleConfig = useMemo(() => {
        if (!showShortcutDragHandles) {
            return undefined;
        }
        return {
            visible: true,
            only: true
        } as const;
    }, [showShortcutDragHandles]);

    const shortcutPositionMap = useMemo(() => {
        const map = new Map<string, number>();
        hydratedShortcuts.forEach((entry, index) => {
            map.set(entry.key, index);
        });
        return map;
    }, [hydratedShortcuts]);

    const handleShortcutDragStart = useCallback((event: DragStartEvent) => {
        setActiveShortcutId(String(event.active.id));
    }, []);

    const handleShortcutDragEnd = useCallback(
        (event: DragEndEvent) => {
            const activeId = String(event.active.id);
            const overId = event.over ? String(event.over.id) : undefined;
            setActiveShortcutId(null);

            if (!overId || activeId === overId) {
                return;
            }

            const oldIndex = shortcutIds.indexOf(activeId);
            const newIndex = shortcutIds.indexOf(overId);
            if (oldIndex === -1 || newIndex === -1) {
                return;
            }

            const nextOrder = arrayMove(shortcutIds, oldIndex, newIndex);
            runAsyncAction(async () => {
                await reorderShortcuts(nextOrder);
            });
        },
        [reorderShortcuts, shortcutIds]
    );

    const handleShortcutDragCancel = useCallback(() => {
        setActiveShortcutId(null);
    }, []);

    const computeShortcutInsertIndex = useCallback(
        (event: React.DragEvent<HTMLElement> | DragEvent, key: string) => {
            const shortcutIndex = shortcutPositionMap.get(key);
            if (shortcutIndex === undefined) {
                return hydratedShortcuts.length;
            }

            const element = event.currentTarget;
            if (!(element instanceof HTMLElement)) {
                return shortcutIndex;
            }

            const bounds = element.getBoundingClientRect();
            const offset = event.clientY - bounds.top;
            const shouldInsertBefore = offset < bounds.height / 2;
            return shouldInsertBefore ? shortcutIndex : shortcutIndex + 1;
        },
        [hydratedShortcuts.length, shortcutPositionMap]
    );

    const shortcutRootDropKey = '__shortcuts-root__';

    const handleShortcutDragOver = useCallback(
        (event: React.DragEvent<HTMLElement> | DragEvent) => {
            const { dataTransfer } = event;
            if (!dataTransfer) {
                return false;
            }

            if (!shortcutsExpanded || !showShortcuts) {
                return false;
            }

            const types = Array.from(dataTransfer.types ?? []);
            if (types.includes(SHORTCUT_DRAG_MIME)) {
                return false;
            }

            const hasObsidianFiles = hasPotentialObsidianFileDragType(types);
            const hasTagPayload = types.includes(TAG_DRAG_MIME);
            const hasPropertyPayload = types.includes(PROPERTY_DRAG_MIME);
            if (!hasObsidianFiles && !hasTagPayload && !hasPropertyPayload) {
                return false;
            }

            event.preventDefault();
            dataTransfer.dropEffect = 'copy';
            return true;
        },
        [shortcutsExpanded, showShortcuts]
    );

    const getDragPathType = useCallback(
        (path: string): 'file' | 'folder' | null => {
            const target = app.vault.getAbstractFileByPath(path);
            if (target instanceof TFile) {
                return 'file';
            }
            if (target instanceof TFolder) {
                return 'folder';
            }
            return null;
        },
        [app.vault]
    );

    const handleShortcutDrop = useCallback(
        (event: React.DragEvent<HTMLElement> | DragEvent, key: string) => {
            const { dataTransfer } = event;
            if (!dataTransfer) {
                return false;
            }

            if (!shortcutsExpanded || !showShortcuts) {
                return false;
            }

            const types = Array.from(dataTransfer.types ?? []);
            if (types.includes(SHORTCUT_DRAG_MIME)) {
                return false;
            }

            const tagPayloadRaw = dataTransfer.getData(TAG_DRAG_MIME);
            if (tagPayloadRaw) {
                const droppedTagPath = parseTagDragPayload(tagPayloadRaw);
                if (droppedTagPath) {
                    event.preventDefault();
                    event.stopPropagation();

                    const baseInsertIndex = computeShortcutInsertIndex(event, key);
                    runAsyncAction(async () => {
                        await addTagShortcut(droppedTagPath, { index: Math.max(0, baseInsertIndex) });
                    });

                    return true;
                }
            }

            const propertyPayloadRaw = dataTransfer.getData(PROPERTY_DRAG_MIME);
            if (propertyPayloadRaw) {
                const droppedNodeId = parsePropertyDragPayload(propertyPayloadRaw);
                if (droppedNodeId) {
                    event.preventDefault();
                    event.stopPropagation();

                    const baseInsertIndex = computeShortcutInsertIndex(event, key);
                    runAsyncAction(async () => {
                        await addPropertyShortcut(droppedNodeId, { index: Math.max(0, baseInsertIndex) });
                    });

                    return true;
                }
            }

            const rawPaths = extractFilePathsFromDataTransfer(dataTransfer, {
                getPathType: getDragPathType,
                vaultName: app.vault.getName()
            });
            if (!rawPaths || rawPaths.length === 0) {
                return false;
            }

            const seen = new Set<string>();
            const orderedPaths = rawPaths.filter(path => {
                if (seen.has(path)) {
                    return false;
                }
                seen.add(path);
                return true;
            });

            if (orderedPaths.length === 0) {
                return false;
            }

            const additions: ShortcutEntry[] = [];
            let duplicateFolderCount = 0;
            let duplicateNoteCount = 0;
            orderedPaths.forEach(path => {
                const target = app.vault.getAbstractFileByPath(path);
                if (target instanceof TFolder) {
                    if (target.path === '/') {
                        return;
                    }
                    if (hasFolderShortcut(target.path)) {
                        duplicateFolderCount += 1;
                        return;
                    }
                    additions.push({ type: ShortcutType.FOLDER, path: target.path });
                } else if (target instanceof TFile) {
                    if (hasNoteShortcut(target.path)) {
                        duplicateNoteCount += 1;
                        return;
                    }
                    additions.push({ type: ShortcutType.NOTE, path: target.path });
                }
            });

            if (duplicateFolderCount > 0) {
                showNotice(strings.shortcuts.folderExists, { variant: 'warning' });
            }
            if (duplicateNoteCount > 0) {
                showNotice(strings.shortcuts.noteExists, { variant: 'warning' });
            }

            if (additions.length === 0) {
                return false;
            }

            event.preventDefault();
            event.stopPropagation();

            const baseInsertIndex = computeShortcutInsertIndex(event, key);

            runAsyncAction(async () => {
                await addShortcutsBatch(additions, { index: Math.max(0, baseInsertIndex) });
            });

            return true;
        },
        [
            addPropertyShortcut,
            addShortcutsBatch,
            addTagShortcut,
            app.vault,
            computeShortcutInsertIndex,
            getDragPathType,
            hasFolderShortcut,
            hasNoteShortcut,
            showShortcuts,
            shortcutsExpanded
        ]
    );

    const allowEmptyShortcutDrop = shortcutsExpanded && showShortcuts && hydratedShortcuts.length === 0;

    const handleShortcutRootDragOver = useCallback(
        (event: React.DragEvent<HTMLElement>) => {
            if (!allowEmptyShortcutDrop) {
                return;
            }
            handleShortcutDragOver(event);
        },
        [allowEmptyShortcutDrop, handleShortcutDragOver]
    );

    const handleShortcutRootDrop = useCallback(
        (event: React.DragEvent<HTMLElement>) => {
            if (!allowEmptyShortcutDrop) {
                return;
            }
            handleShortcutDrop(event, shortcutRootDropKey);
        },
        [allowEmptyShortcutDrop, handleShortcutDrop]
    );

    const buildShortcutExternalHandlers = useCallback(
        (key: string): ListReorderHandlers => ({
            onDragOver: event => {
                handleShortcutDragOver(event);
            },
            onDrop: event => {
                handleShortcutDrop(event, key);
            }
        }),
        [handleShortcutDragOver, handleShortcutDrop]
    );

    return {
        activeShortcutId,
        shouldUseShortcutDnd,
        allowEmptyShortcutDrop,
        shortcutDragHandleConfig,
        shortcutIds,
        shortcutSensors,
        handleShortcutDragStart,
        handleShortcutDragEnd,
        handleShortcutDragCancel,
        isShortcutSorting,
        handleShortcutRootDragOver,
        handleShortcutRootDrop,
        buildShortcutExternalHandlers
    };
}
