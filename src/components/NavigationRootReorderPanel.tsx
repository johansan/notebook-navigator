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
import { DndContext, MouseSensor, TouchSensor, type DragEndEvent, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RootFolderReorderItem } from './RootFolderReorderItem';
import { strings } from '../i18n';
import type { SectionReorderRenderItem, RootReorderRenderItem } from '../hooks/useNavigationRootReorder';
import { NavigationSectionId } from '../types';
import { runAsyncAction } from '../utils/async';
import { ObsidianIcon } from './ObsidianIcon';
import {
    ROOT_REORDER_MOUSE_CONSTRAINT,
    ROOT_REORDER_TOUCH_CONSTRAINT,
    typeFilteredCollisionDetection,
    verticalAxisOnly
} from '../utils/dndConfig';

interface NavigationRootReorderPanelProps {
    sectionItems: SectionReorderRenderItem[];
    folderItems: RootReorderRenderItem[];
    tagItems: RootReorderRenderItem[];
    propertyItems: RootReorderRenderItem[];
    isMobile: boolean;
    showRootFolderSection: boolean;
    showRootTagSection: boolean;
    showRootPropertySection: boolean;
    foldersSectionExpanded: boolean;
    tagsSectionExpanded: boolean;
    propertiesSectionExpanded: boolean;
    showRootFolderReset: boolean;
    showRootTagReset: boolean;
    showRootPropertyReset: boolean;
    resetRootTagOrderLabel: string;
    resetRootPropertyOrderLabel: string;
    onResetRootFolderOrder: () => Promise<void> | void;
    onResetRootTagOrder: () => Promise<void> | void;
    onResetRootPropertyOrder: () => Promise<void> | void;
    onReorderSections: (orderedKeys: NavigationSectionId[]) => Promise<void> | void;
    onReorderFolders: (orderedKeys: string[]) => Promise<void> | void;
    onReorderTags: (orderedKeys: string[]) => Promise<void> | void;
    onReorderProperties: (orderedKeys: string[]) => Promise<void> | void;
    canReorderSections: boolean;
    canReorderFolders: boolean;
    canReorderTags: boolean;
    canReorderProperties: boolean;
}

interface RootSortableEntry {
    sortableId: string;
    item: RootReorderRenderItem;
}

interface SortableItemProps {
    entry: RootSortableEntry;
    canReorder: boolean;
    isMobile: boolean;
}

function SortableRootItem({ entry, canReorder, isMobile }: SortableItemProps) {
    const { item, sortableId } = entry;
    const { attributes, listeners, setNodeRef, transform, transition, isSorting } = useSortable({
        id: sortableId,
        disabled: !canReorder,
        data: { type: item.props.itemType }
    });

    const dragStyle = transform ? { transform: CSS.Transform.toString(transform), transition } : undefined;
    const dragHandleConfig = useMemo(
        () => ({
            visible: isMobile && canReorder,
            icon: 'lucide-grip-horizontal',
            interactive: isMobile && canReorder,
            only: isMobile
        }),
        [canReorder, isMobile]
    );

    return (
        <RootFolderReorderItem
            {...item.props}
            dragRef={setNodeRef}
            dragAttributes={attributes}
            dragListeners={listeners}
            dragStyle={dragStyle}
            isSorting={isSorting}
            dragHandleConfig={dragHandleConfig}
        />
    );
}

interface SortableListProps {
    entries: RootSortableEntry[];
    canReorder: boolean;
    children?: React.ReactNode;
    isMobile: boolean;
}

function SortableList({ entries, canReorder, children, isMobile }: SortableListProps) {
    const itemIds = useMemo(() => entries.map(entry => entry.sortableId), [entries]);
    return (
        <>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {entries.map(entry => (
                    <SortableRootItem key={entry.sortableId} entry={entry} canReorder={canReorder} isMobile={isMobile} />
                ))}
            </SortableContext>
            {children}
        </>
    );
}

interface SectionEntry {
    id: NavigationSectionId;
    item: SectionReorderRenderItem;
}

interface ResetActionProps {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function ResetAction({ label, onClick }: ResetActionProps) {
    return (
        <div className="nn-root-reorder-actions">
            <button type="button" className="nn-root-reorder-reset nn-support-button" onClick={onClick}>
                <span className="nn-root-reorder-reset-icon" aria-hidden="true">
                    Aa
                </span>
                <span>{label}</span>
            </button>
        </div>
    );
}

export function NavigationRootReorderPanel({
    sectionItems,
    folderItems,
    tagItems,
    propertyItems,
    isMobile,
    showRootFolderSection,
    showRootTagSection,
    showRootPropertySection,
    foldersSectionExpanded,
    tagsSectionExpanded,
    propertiesSectionExpanded,
    showRootFolderReset,
    showRootTagReset,
    showRootPropertyReset,
    resetRootTagOrderLabel,
    resetRootPropertyOrderLabel,
    onResetRootFolderOrder,
    onResetRootTagOrder,
    onResetRootPropertyOrder,
    onReorderSections,
    onReorderFolders,
    onReorderTags,
    onReorderProperties,
    canReorderSections,
    canReorderFolders,
    canReorderTags,
    canReorderProperties
}: NavigationRootReorderPanelProps) {
    const handleResetFolders = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            runAsyncAction(async () => {
                await onResetRootFolderOrder();
            });
        },
        [onResetRootFolderOrder]
    );

    const handleResetTags = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            runAsyncAction(async () => {
                await onResetRootTagOrder();
            });
        },
        [onResetRootTagOrder]
    );

    const handleResetProperties = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            runAsyncAction(async () => {
                await onResetRootPropertyOrder();
            });
        },
        [onResetRootPropertyOrder]
    );

    const sectionEntries = useMemo<SectionEntry[]>(() => {
        return sectionItems.map(item => ({
            id: item.key as NavigationSectionId,
            item
        }));
    }, [sectionItems]);

    const folderEntries = useMemo<RootSortableEntry[]>(() => {
        return folderItems.map(item => ({
            sortableId: `folder:${item.key}`,
            item
        }));
    }, [folderItems]);

    const tagEntries = useMemo<RootSortableEntry[]>(() => {
        return tagItems.map(item => ({
            sortableId: `tag:${item.key}`,
            item
        }));
    }, [tagItems]);

    const propertyEntries = useMemo<RootSortableEntry[]>(() => {
        return propertyItems.map(item => ({
            sortableId: `property:${item.key}`,
            item
        }));
    }, [propertyItems]);

    const sortableRegistry = useMemo(() => {
        const map = new Map<string, { type: 'folder' | 'tag' | 'property'; key: string }>();
        folderEntries.forEach(entry => {
            map.set(entry.sortableId, { type: 'folder', key: entry.item.key });
        });
        tagEntries.forEach(entry => {
            map.set(entry.sortableId, { type: 'tag', key: entry.item.key });
        });
        propertyEntries.forEach(entry => {
            map.set(entry.sortableId, { type: 'property', key: entry.item.key });
        });
        return map;
    }, [folderEntries, propertyEntries, tagEntries]);

    const sectionIds = useMemo(() => sectionEntries.map(entry => entry.id), [sectionEntries]);
    const folderIds = useMemo(() => folderEntries.map(entry => entry.item.key), [folderEntries]);
    const tagIds = useMemo(() => tagEntries.map(entry => entry.item.key), [tagEntries]);
    const propertyIds = useMemo(() => propertyEntries.map(entry => entry.item.key), [propertyEntries]);
    const sectionIndexMap = useMemo(() => {
        return new Map<NavigationSectionId, number>(sectionIds.map((id, index) => [id, index]));
    }, [sectionIds]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: ROOT_REORDER_MOUSE_CONSTRAINT }),
        useSensor(TouchSensor, { activationConstraint: ROOT_REORDER_TOUCH_CONSTRAINT })
    );

    const moveSection = useCallback(
        (sectionId: NavigationSectionId, delta: number) => {
            if (!canReorderSections) {
                return;
            }
            const currentIndex = sectionIds.indexOf(sectionId);
            const targetIndex = currentIndex + delta;
            if (currentIndex === -1 || targetIndex < 0 || targetIndex >= sectionIds.length) {
                return;
            }
            const next = arrayMove(sectionIds, currentIndex, targetIndex);
            runAsyncAction(async () => {
                await onReorderSections(next);
            });
        },
        [canReorderSections, onReorderSections, sectionIds]
    );

    const createSectionMoveHandler = useCallback(
        (sectionId: NavigationSectionId, delta: number) => {
            return (event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                moveSection(sectionId, delta);
            };
        },
        [moveSection]
    );

    const handlePropertyDragEnd = useCallback(
        (activeKey: string, overKey: string) => {
            if (!canReorderProperties) {
                return;
            }
            const oldIndex = propertyIds.indexOf(activeKey);
            const newIndex = propertyIds.indexOf(overKey);
            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                return;
            }
            const next = arrayMove(propertyIds, oldIndex, newIndex);
            runAsyncAction(async () => {
                await onReorderProperties(next);
            });
        },
        [canReorderProperties, onReorderProperties, propertyIds]
    );

    const hasSortableContent =
        sectionEntries.length > 0 ||
        (showRootFolderSection && folderEntries.length > 0) ||
        (showRootTagSection && tagEntries.length > 0) ||
        (showRootPropertySection && propertyEntries.length > 0);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const activeId = event.active.id as string;
            const overId = event.over?.id as string | undefined;
            if (!overId) {
                return;
            }

            const active = sortableRegistry.get(activeId);
            const over = sortableRegistry.get(overId);
            if (!active || !over) {
                return;
            }
            if (active.type !== over.type) {
                return;
            }

            if (active.type === 'folder') {
                if (!canReorderFolders) {
                    return;
                }
                const oldIndex = folderIds.indexOf(active.key);
                const newIndex = folderIds.indexOf(over.key);
                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                    return;
                }
                const next = arrayMove(folderIds, oldIndex, newIndex);
                runAsyncAction(async () => {
                    await onReorderFolders(next);
                });
                return;
            }

            if (active.type === 'tag') {
                if (!canReorderTags) {
                    return;
                }
                const oldIndex = tagIds.indexOf(active.key);
                const newIndex = tagIds.indexOf(over.key);
                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                    return;
                }
                const next = arrayMove(tagIds, oldIndex, newIndex);
                runAsyncAction(async () => {
                    await onReorderTags(next);
                });
                return;
            }

            handlePropertyDragEnd(active.key, over.key);
        },
        [canReorderFolders, canReorderTags, folderIds, handlePropertyDragEnd, onReorderFolders, onReorderTags, sortableRegistry, tagIds]
    );

    return (
        <div className="nn-root-reorder-panel">
            <div className="nn-root-reorder-header">
                <span className="nn-root-reorder-title">{strings.navigationPane.reorderRootFoldersTitle}</span>
                <span className="nn-root-reorder-hint">{strings.navigationPane.reorderRootFoldersHint}</span>
            </div>

            <div className="nn-root-reorder-list" role="presentation">
                {hasSortableContent ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={typeFilteredCollisionDetection}
                        modifiers={[verticalAxisOnly]}
                        onDragEnd={handleDragEnd}
                    >
                        {sectionEntries.length > 0 ? (
                            sectionEntries.map(entry => {
                                const item = entry.item;
                                const sectionId = entry.id;
                                const sectionIndex = sectionIndexMap.get(sectionId) ?? -1;
                                const canMoveUp = canReorderSections && sectionIndex > 0;
                                const canMoveDown = canReorderSections && sectionIndex >= 0 && sectionIndex < sectionIds.length - 1;
                                const showControls = canReorderSections && sectionIds.length > 1;
                                const trailingAccessory = showControls ? (
                                    <div className="nn-root-reorder-section-controls">
                                        <button
                                            type="button"
                                            className="nn-icon-button nn-root-reorder-section-button"
                                            aria-label={strings.settings.items.vaultProfiles.moveUp}
                                            onClick={createSectionMoveHandler(sectionId, -1)}
                                            disabled={!canMoveUp}
                                        >
                                            <ObsidianIcon name="lucide-arrow-up" />
                                        </button>
                                        <button
                                            type="button"
                                            className="nn-icon-button nn-root-reorder-section-button"
                                            aria-label={strings.settings.items.vaultProfiles.moveDown}
                                            onClick={createSectionMoveHandler(sectionId, 1)}
                                            disabled={!canMoveDown}
                                        >
                                            <ObsidianIcon name="lucide-arrow-down" />
                                        </button>
                                    </div>
                                ) : undefined;

                                const shouldRenderFolders =
                                    item.sectionId === NavigationSectionId.FOLDERS && foldersSectionExpanded && showRootFolderSection;
                                const shouldRenderTags =
                                    item.sectionId === NavigationSectionId.TAGS && tagsSectionExpanded && showRootTagSection;
                                const shouldRenderProperties =
                                    item.sectionId === NavigationSectionId.PROPERTIES &&
                                    propertiesSectionExpanded &&
                                    showRootPropertySection;

                                return (
                                    <div key={`section:${item.key}`} className="nn-root-reorder-section">
                                        <RootFolderReorderItem {...item.props} trailingAccessory={trailingAccessory} />

                                        {shouldRenderFolders && folderEntries.length > 0 ? (
                                            <SortableList entries={folderEntries} canReorder={canReorderFolders} isMobile={isMobile}>
                                                {showRootFolderReset ? (
                                                    <ResetAction
                                                        label={strings.navigationPane.resetRootToAlpha}
                                                        onClick={handleResetFolders}
                                                    />
                                                ) : null}
                                            </SortableList>
                                        ) : null}

                                        {shouldRenderTags && tagEntries.length > 0 ? (
                                            <SortableList entries={tagEntries} canReorder={canReorderTags} isMobile={isMobile}>
                                                {showRootTagReset ? (
                                                    <ResetAction label={resetRootTagOrderLabel} onClick={handleResetTags} />
                                                ) : null}
                                            </SortableList>
                                        ) : null}

                                        {shouldRenderProperties && propertyEntries.length > 0 ? (
                                            <SortableList entries={propertyEntries} canReorder={canReorderProperties} isMobile={isMobile}>
                                                {showRootPropertyReset ? (
                                                    <ResetAction label={resetRootPropertyOrderLabel} onClick={handleResetProperties} />
                                                ) : null}
                                            </SortableList>
                                        ) : null}
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                {showRootFolderSection && folderEntries.length > 0 ? (
                                    <div className="nn-root-reorder-section">
                                        <SortableList entries={folderEntries} canReorder={canReorderFolders} isMobile={isMobile}>
                                            {showRootFolderReset ? (
                                                <ResetAction label={strings.navigationPane.resetRootToAlpha} onClick={handleResetFolders} />
                                            ) : null}
                                        </SortableList>
                                    </div>
                                ) : null}

                                {showRootTagSection && tagEntries.length > 0 ? (
                                    <div className="nn-root-reorder-section">
                                        <SortableList entries={tagEntries} canReorder={canReorderTags} isMobile={isMobile}>
                                            {showRootTagReset ? (
                                                <ResetAction label={resetRootTagOrderLabel} onClick={handleResetTags} />
                                            ) : null}
                                        </SortableList>
                                    </div>
                                ) : null}

                                {showRootPropertySection && propertyEntries.length > 0 ? (
                                    <div className="nn-root-reorder-section">
                                        <SortableList entries={propertyEntries} canReorder={canReorderProperties} isMobile={isMobile}>
                                            {showRootPropertyReset ? (
                                                <ResetAction label={resetRootPropertyOrderLabel} onClick={handleResetProperties} />
                                            ) : null}
                                        </SortableList>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </DndContext>
                ) : null}
            </div>
        </div>
    );
}
