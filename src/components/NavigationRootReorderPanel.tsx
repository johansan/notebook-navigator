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
import type { ReorderTreeNode, ReorderTreeSource, ReorderTreeType, SectionReorderRenderItem } from '../hooks/useNavigationRootReorder';
import { useSettingsState } from '../context/SettingsContext';
import { isRecord } from '../utils/typeGuards';
import { resolveUXIcon } from '../utils/uxIcons';
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
    folderTree: ReorderTreeSource;
    tagTree: ReorderTreeSource;
    propertyTree: ReorderTreeSource;
    isMobile: boolean;
    showRootFolderSection: boolean;
    showRootTagSection: boolean;
    showRootPropertySection: boolean;
    foldersSectionExpanded: boolean;
    tagsSectionExpanded: boolean;
    propertiesSectionExpanded: boolean;
    showFolderReset: boolean;
    showTagReset: boolean;
    showPropertyReset: boolean;
    onResetFolders: () => Promise<void> | void;
    onResetTags: () => Promise<void> | void;
    onResetProperties: () => Promise<void> | void;
    onReorderSections: (orderedKeys: NavigationSectionId[]) => Promise<void> | void;
    onReorderChildren: (type: ReorderTreeType, parentPath: string, orderedNames: string[]) => Promise<void> | void;
    canReorderSections: boolean;
}

interface TreeSortableData {
    type: ReorderTreeType;
    parentPath: string;
    name: string;
}

function isReorderTreeType(value: unknown): value is ReorderTreeType {
    return value === 'folder' || value === 'tag' || value === 'property';
}

function readTreeSortableData(data: unknown): TreeSortableData | null {
    if (!isRecord(data) || !isReorderTreeType(data.type) || typeof data.parentPath !== 'string' || typeof data.name !== 'string') {
        return null;
    }
    return { type: data.type, parentPath: data.parentPath, name: data.name };
}

interface ReorderTreeContext extends ReorderTreeSource {
    expandIcon: string;
    collapseIcon: string;
    isMobile: boolean;
}

interface SortableTreeNodeProps {
    node: ReorderTreeNode;
    tree: ReorderTreeContext;
}

/**
 * One sortable row whose element wraps the row and its expanded children, so the drag transform moves the whole
 * branch. Drag listeners stay on the row (or its grip on mobile), so dragging a nested row moves only that branch.
 */
function SortableTreeNode({ node, tree }: SortableTreeNodeProps) {
    const sortableData: TreeSortableData = { type: tree.type, parentPath: node.parentPath, name: node.name };
    const { attributes, listeners, setNodeRef, transform, transition, isSorting, isDragging } = useSortable({
        id: `${tree.type}:${node.key}`,
        disabled: !tree.canReorder,
        data: sortableData
    });

    const isExpanded = node.hasChildren && tree.expanded.has(node.key);
    // Translate only: dnd-kit scales the dragged item to the hovered item's size, and a hovered
    // row's size includes its expanded children
    const dragStyle = transform ? { transform: CSS.Translate.toString(transform), transition } : undefined;
    const dragHandleConfig = useMemo(
        () => ({
            visible: tree.isMobile && tree.canReorder,
            icon: 'lucide-grip-horizontal',
            interactive: tree.isMobile && tree.canReorder,
            only: tree.isMobile
        }),
        [tree.canReorder, tree.isMobile]
    );
    const { onToggle } = tree;
    const handleToggle = useCallback(() => {
        onToggle(node.key);
    }, [node.key, onToggle]);

    return (
        <div
            ref={setNodeRef}
            style={dragStyle}
            className={isDragging ? 'nn-root-reorder-branch nn-root-reorder-branch--dragging' : 'nn-root-reorder-branch'}
        >
            <RootFolderReorderItem
                {...node.props}
                chevronIcon={node.hasChildren ? (isExpanded ? tree.collapseIcon : tree.expandIcon) : undefined}
                onClick={node.hasChildren ? handleToggle : undefined}
                dragAttributes={attributes}
                dragListeners={listeners}
                isSorting={isSorting}
                dragHandleConfig={dragHandleConfig}
            />
            {/* The dragged row moves alone, so its drop slot opens at the pointer; its children return on drop */}
            {isExpanded && !isDragging ? <ReorderTreeList parentPath={node.key} tree={tree} /> : null}
        </div>
    );
}

interface ReorderTreeListProps {
    parentPath: string;
    tree: ReorderTreeContext;
    children?: React.ReactNode;
}

/** The children of one parent; each parent is its own sortable list, so drops stay among siblings. */
function ReorderTreeList({ parentPath, tree, children }: ReorderTreeListProps) {
    const nodes = tree.getChildren(parentPath);
    const itemIds = nodes.map(node => `${tree.type}:${node.key}`);
    return (
        <>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {nodes.map(node => (
                    <SortableTreeNode key={node.key} node={node} tree={tree} />
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
    onReset: () => Promise<void> | void;
}

function ResetAction({ label, onReset }: ResetActionProps) {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        runAsyncAction(async () => {
            await onReset();
        });
    };
    return (
        <div className="nn-root-reorder-actions">
            <button type="button" className="nn-root-reorder-reset nn-support-button" onClick={handleClick}>
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
    folderTree: folderSource,
    tagTree: tagSource,
    propertyTree: propertySource,
    isMobile,
    showRootFolderSection,
    showRootTagSection,
    showRootPropertySection,
    foldersSectionExpanded,
    tagsSectionExpanded,
    propertiesSectionExpanded,
    showFolderReset,
    showTagReset,
    showPropertyReset,
    onResetFolders,
    onResetTags,
    onResetProperties,
    onReorderSections,
    onReorderChildren,
    canReorderSections
}: NavigationRootReorderPanelProps) {
    const settings = useSettingsState();

    const sectionEntries = useMemo<SectionEntry[]>(() => {
        return sectionItems.map(item => ({
            id: item.key as NavigationSectionId,
            item
        }));
    }, [sectionItems]);

    const expandIcon = resolveUXIcon(settings.interfaceIcons, 'nav-tree-expand');
    const collapseIcon = resolveUXIcon(settings.interfaceIcons, 'nav-tree-collapse');
    const folderTree = useMemo<ReorderTreeContext>(
        () => ({ ...folderSource, expandIcon, collapseIcon, isMobile }),
        [collapseIcon, expandIcon, folderSource, isMobile]
    );
    const tagTree = useMemo<ReorderTreeContext>(
        () => ({ ...tagSource, expandIcon, collapseIcon, isMobile }),
        [collapseIcon, expandIcon, isMobile, tagSource]
    );
    const propertyTree = useMemo<ReorderTreeContext>(
        () => ({ ...propertySource, expandIcon, collapseIcon, isMobile }),
        [collapseIcon, expandIcon, isMobile, propertySource]
    );
    const hasRootFolderRows = folderSource.getChildren('/').length > 0;
    const hasRootTagRows = tagSource.getChildren('/').length > 0;
    const hasRootPropertyRows = propertySource.getChildren('/').length > 0;

    const sectionIds = useMemo(() => sectionEntries.map(entry => entry.id), [sectionEntries]);
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

    const hasSortableContent =
        sectionEntries.length > 0 ||
        (showRootFolderSection && hasRootFolderRows) ||
        (showRootTagSection && hasRootTagRows) ||
        (showRootPropertySection && hasRootPropertyRows);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const active = readTreeSortableData(event.active.data.current);
            const over = readTreeSortableData(event.over?.data.current);
            if (!active || !over || over.type !== active.type || over.parentPath !== active.parentPath) {
                return;
            }
            const source = active.type === 'folder' ? folderSource : active.type === 'tag' ? tagSource : propertySource;
            if (!source.canReorder) {
                return;
            }
            const siblingNames = source.getChildren(active.parentPath).map(node => node.name);
            const oldIndex = siblingNames.indexOf(active.name);
            const newIndex = siblingNames.indexOf(over.name);
            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                return;
            }
            const next = arrayMove(siblingNames, oldIndex, newIndex);
            runAsyncAction(async () => {
                await onReorderChildren(active.type, active.parentPath, next);
            });
        },
        [folderSource, onReorderChildren, propertySource, tagSource]
    );

    const folderList = (
        <ReorderTreeList parentPath="/" tree={folderTree}>
            {showFolderReset ? <ResetAction label={strings.navigationPane.resetAllFolders} onReset={onResetFolders} /> : null}
        </ReorderTreeList>
    );
    const tagList = (
        <ReorderTreeList parentPath="/" tree={tagTree}>
            {showTagReset ? <ResetAction label={strings.navigationPane.resetAllTags} onReset={onResetTags} /> : null}
        </ReorderTreeList>
    );
    const propertyList = (
        <ReorderTreeList parentPath="/" tree={propertyTree}>
            {showPropertyReset ? <ResetAction label={strings.navigationPane.resetAllProperties} onReset={onResetProperties} /> : null}
        </ReorderTreeList>
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
                                    item.sectionId === NavigationSectionId.FOLDERS &&
                                    foldersSectionExpanded &&
                                    showRootFolderSection &&
                                    hasRootFolderRows;
                                const shouldRenderTags =
                                    item.sectionId === NavigationSectionId.TAGS &&
                                    tagsSectionExpanded &&
                                    showRootTagSection &&
                                    hasRootTagRows;
                                const shouldRenderProperties =
                                    item.sectionId === NavigationSectionId.PROPERTIES &&
                                    propertiesSectionExpanded &&
                                    showRootPropertySection &&
                                    hasRootPropertyRows;

                                return (
                                    <div key={`section:${item.key}`} className="nn-root-reorder-section">
                                        <RootFolderReorderItem {...item.props} trailingAccessory={trailingAccessory} />
                                        {shouldRenderFolders ? folderList : null}
                                        {shouldRenderTags ? tagList : null}
                                        {shouldRenderProperties ? propertyList : null}
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                {showRootFolderSection && hasRootFolderRows ? (
                                    <div className="nn-root-reorder-section">{folderList}</div>
                                ) : null}
                                {showRootTagSection && hasRootTagRows ? <div className="nn-root-reorder-section">{tagList}</div> : null}
                                {showRootPropertySection && hasRootPropertyRows ? (
                                    <div className="nn-root-reorder-section">{propertyList}</div>
                                ) : null}
                            </>
                        )}
                    </DndContext>
                ) : null}
            </div>
        </div>
    );
}
