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
import {
    NavigationPaneItemType,
    NavigationSectionId,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    RECENT_NOTES_VIRTUAL_FOLDER_ID,
    SHORTCUTS_VIRTUAL_FOLDER_ID,
    TAGGED_TAG_ID,
    TAGS_ROOT_VIRTUAL_FOLDER_ID,
    UNTAGGED_TAG_ID
} from '../../types';
import { FolderItem } from '../FolderItem';
import { PropertyTreeItem } from '../PropertyTreeItem';
import { TagTreeItem } from '../TagTreeItem';
import { VirtualFolderComponent, type VirtualFolderTrailingAction } from '../VirtualFolderItem';
import type { NavigationPaneRowProps } from './NavigationPaneItemRenderer.types';
import { getNavigationItemSearchMatch, isNavigationItemSelected } from './navigationPaneItemState';
import { getNavigationItemRenderKey } from '../../utils/navigationIndex';
import { strings } from '../../i18n';

export function NavigationPaneTreeRow({ item, context, adjacentFilledClassName }: NavigationPaneRowProps) {
    const {
        settings,
        isMobile,
        expansionState,
        expansionDispatch,
        selectionState,
        indentGuideLevelsByKey,
        firstSectionId,
        firstInlineFolderPath,
        shouldPinShortcuts,
        shortcutsExpanded,
        recentNotesExpanded,
        folderCounts,
        tagCounts,
        propertyCounts,
        vaultChangeVersion,
        getSolidBackground,
        shortcuts,
        tree,
        searchHighlights,
        inlineRename,
        onSectionContextMenu
    } = context;

    switch (item.type) {
        case NavigationPaneItemType.FOLDER: {
            const folderPath = item.data.path;
            const countInfo = folderCounts.get(folderPath);
            const indentGuideLevels = indentGuideLevelsByKey.get(getNavigationItemRenderKey(item));
            const shouldHideFolderSeparatorActions =
                shouldPinShortcuts && firstInlineFolderPath !== null && folderPath === firstInlineFolderPath;
            const renameTarget =
                inlineRename.target?.type === 'folder' && inlineRename.target.id === folderPath ? inlineRename.target : null;

            return (
                <FolderItem
                    folder={item.data}
                    displayName={item.displayName}
                    level={item.level}
                    indentGuideLevels={indentGuideLevels}
                    isExpanded={expansionState.expandedFolders.has(item.data.path)}
                    isSelected={isNavigationItemSelected(item, selectionState)}
                    isExcluded={item.isExcluded}
                    onToggle={() => tree.handleFolderToggle(item.data.path)}
                    onClick={() => tree.handleFolderClick(item.data)}
                    onNameClick={event => tree.handleFolderNameClick(item.data, event)}
                    onNameMouseDown={event => tree.handleFolderNameMouseDown(item.data, event)}
                    onToggleAllSiblings={() => {
                        const isCurrentlyExpanded = expansionState.expandedFolders.has(item.data.path);
                        tree.handleFolderToggle(item.data.path);
                        const descendantPaths = tree.getAllDescendantFolders(item.data);
                        if (descendantPaths.length > 0) {
                            expansionDispatch({
                                type: 'TOGGLE_DESCENDANT_FOLDERS',
                                descendantPaths,
                                expand: !isCurrentlyExpanded
                            });
                        }
                    }}
                    icon={item.icon}
                    color={item.color}
                    backgroundColor={getSolidBackground(item.backgroundColor)}
                    adjacentFilledClassName={adjacentFilledClassName}
                    countInfo={countInfo}
                    excludedFolders={item.parsedExcludedFolders || []}
                    vaultChangeVersion={vaultChangeVersion}
                    disableNavigationSeparatorActions={shouldHideFolderSeparatorActions}
                    inlineRename={
                        renameTarget
                            ? {
                                  initialValue: renameTarget.initialValue,
                                  ariaLabel: strings.contextMenu.folder.renameFolder,
                                  onCommit: value => inlineRename.commit(renameTarget, value),
                                  onCancel: inlineRename.cancel,
                                  onRestoreFocus: inlineRename.restoreFocus
                              }
                            : undefined
                    }
                />
            );
        }

        case NavigationPaneItemType.VIRTUAL_FOLDER: {
            const virtualFolder = item.data;
            const indentGuideLevels = indentGuideLevelsByKey.get(getNavigationItemRenderKey(item));
            const isShortcutsGroup = virtualFolder.id === SHORTCUTS_VIRTUAL_FOLDER_ID;
            const isRecentNotesGroup = virtualFolder.id === RECENT_NOTES_VIRTUAL_FOLDER_ID;
            const hasChildren = item.hasChildren ?? false;
            const isExpanded = isShortcutsGroup
                ? shortcutsExpanded
                : isRecentNotesGroup
                  ? recentNotesExpanded
                  : expansionState.expandedVirtualFolders.has(virtualFolder.id);
            const tagCollectionId = item.tagCollectionId ?? null;
            const propertyCollectionId = item.propertyCollectionId ?? null;
            const isTagCollection = Boolean(tagCollectionId);
            const isPropertyCollection = Boolean(propertyCollectionId);
            const isSelected = isNavigationItemSelected(item, selectionState);
            const collectionCountInfo = item.noteCount ?? (tagCollectionId ? tagCounts.get(tagCollectionId) : undefined);
            const showFileCount = item.showFileCount ?? false;
            const collectionSearchMatch = getNavigationItemSearchMatch(item, searchHighlights);
            const dropConfig =
                virtualFolder.id === TAGS_ROOT_VIRTUAL_FOLDER_ID
                    ? {
                          zone: 'tag-root',
                          path: '__nn-tag-root__',
                          allowExternalDrop: false
                      }
                    : undefined;
            const sectionId = isShortcutsGroup
                ? NavigationSectionId.SHORTCUTS
                : isRecentNotesGroup
                  ? NavigationSectionId.RECENT
                  : virtualFolder.id === TAGS_ROOT_VIRTUAL_FOLDER_ID
                    ? NavigationSectionId.TAGS
                    : virtualFolder.id === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
                      ? NavigationSectionId.PROPERTIES
                      : null;
            const shouldDisableFirstSectionMenu =
                shouldPinShortcuts && sectionId !== null && firstSectionId !== null && sectionId === firstSectionId;
            const baseAllowSeparatorActions = !isShortcutsGroup || !shouldPinShortcuts;
            const allowSeparatorActions = baseAllowSeparatorActions && !shouldDisableFirstSectionMenu;
            const sectionContextMenu =
                sectionId !== null
                    ? (event: React.MouseEvent<HTMLDivElement>) =>
                          onSectionContextMenu(event, sectionId, { allowSeparator: allowSeparatorActions })
                    : undefined;
            const isPropertiesGroup = virtualFolder.id === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
            const isTagsGroup = virtualFolder.id === TAGS_ROOT_VIRTUAL_FOLDER_ID;
            const trailingAction: VirtualFolderTrailingAction | undefined = isShortcutsGroup
                ? shortcuts.shortcutHeaderTrailingAction
                : isPropertiesGroup
                  ? shortcuts.propertiesHeaderTrailingAction
                  : undefined;

            return (
                <VirtualFolderComponent
                    virtualFolder={virtualFolder}
                    level={item.level}
                    color={item.color}
                    backgroundColor={getSolidBackground(item.backgroundColor)}
                    adjacentFilledClassName={adjacentFilledClassName}
                    indentGuideLevels={indentGuideLevels}
                    isExpanded={isExpanded}
                    hasChildren={hasChildren}
                    isSelected={Boolean(isSelected)}
                    showFileCount={showFileCount}
                    showCountLeader={!isShortcutsGroup && !isRecentNotesGroup}
                    countInfo={collectionCountInfo}
                    searchMatch={collectionSearchMatch}
                    trailingAction={trailingAction}
                    onSelect={
                        isTagCollection && tagCollectionId
                            ? event => tree.handleTagCollectionClick(tagCollectionId, event)
                            : isPropertyCollection
                              ? tree.handlePropertyCollectionClick
                              : undefined
                    }
                    onToggle={() => tree.handleVirtualFolderToggle(virtualFolder.id)}
                    onToggleAllSiblings={
                        isTagsGroup
                            ? () => {
                                  const isCurrentlyExpanded = expansionState.expandedVirtualFolders.has(virtualFolder.id);
                                  tree.handleVirtualFolderToggle(virtualFolder.id);
                                  const descendantPaths = tree.getAllTagPaths();
                                  if (descendantPaths.length > 0) {
                                      expansionDispatch({
                                          type: 'TOGGLE_DESCENDANT_TAGS',
                                          descendantPaths,
                                          expand: !isCurrentlyExpanded
                                      });
                                  }
                              }
                            : isPropertiesGroup
                              ? () => {
                                    const isCurrentlyExpanded = expansionState.expandedVirtualFolders.has(virtualFolder.id);
                                    tree.handleVirtualFolderToggle(virtualFolder.id);
                                    const descendantNodeIds = tree.getAllPropertyNodeIds();
                                    if (descendantNodeIds.length > 0) {
                                        expansionDispatch({
                                            type: 'TOGGLE_DESCENDANT_PROPERTIES',
                                            descendantNodeIds,
                                            expand: !isCurrentlyExpanded
                                        });
                                    }
                                }
                              : undefined
                    }
                    onDragOver={isShortcutsGroup && shortcuts.allowEmptyShortcutDrop ? shortcuts.handleShortcutRootDragOver : undefined}
                    onDrop={isShortcutsGroup && shortcuts.allowEmptyShortcutDrop ? shortcuts.handleShortcutRootDrop : undefined}
                    dropConfig={dropConfig}
                    onContextMenu={sectionContextMenu}
                />
            );
        }

        case NavigationPaneItemType.TAG:
        case NavigationPaneItemType.UNTAGGED: {
            const tagNode = item.data;
            const indentGuideLevels = indentGuideLevelsByKey.get(getNavigationItemRenderKey(item));
            const searchMatch = getNavigationItemSearchMatch(item, searchHighlights);
            const inclusionOperator = searchMatch === 'include' ? searchHighlights.getTagInclusionOperator(tagNode.path) : undefined;
            const renameTarget =
                inlineRename.target?.type === 'tag' && inlineRename.target.id === tagNode.path ? inlineRename.target : null;

            return (
                <TagTreeItem
                    tagNode={tagNode}
                    level={item.level ?? 0}
                    indentGuideLevels={indentGuideLevels}
                    isExpanded={expansionState.expandedTags.has(tagNode.path)}
                    isSelected={isNavigationItemSelected(item, selectionState)}
                    isHidden={'isHidden' in item ? item.isHidden : false}
                    onToggle={() => tree.handleTagToggle(tagNode.path)}
                    onClick={event => tree.handleTagClick(tagNode.path, event)}
                    color={item.color}
                    backgroundColor={getSolidBackground(item.backgroundColor)}
                    adjacentFilledClassName={adjacentFilledClassName}
                    icon={item.icon}
                    searchMatch={searchMatch}
                    inclusionOperator={inclusionOperator}
                    isDraggable={!isMobile && tagNode.path !== UNTAGGED_TAG_ID && tagNode.path !== TAGGED_TAG_ID}
                    onToggleAllSiblings={() => {
                        const isCurrentlyExpanded = expansionState.expandedTags.has(tagNode.path);
                        tree.handleTagToggle(tagNode.path);
                        const descendantPaths = tree.getAllDescendantTags(tagNode.path);
                        if (descendantPaths.length > 0) {
                            expansionDispatch({
                                type: 'TOGGLE_DESCENDANT_TAGS',
                                descendantPaths,
                                expand: !isCurrentlyExpanded
                            });
                        }
                    }}
                    countInfo={item.noteCount ?? tagCounts.get(tagNode.path)}
                    showFileCount={settings.showNoteCount}
                    inlineRename={
                        renameTarget
                            ? {
                                  initialValue: renameTarget.initialValue,
                                  ariaLabel: strings.modals.tagOperation.confirmRename,
                                  onCommit: value => inlineRename.commit(renameTarget, value),
                                  onCancel: inlineRename.cancel,
                                  onRestoreFocus: inlineRename.restoreFocus
                              }
                            : undefined
                    }
                />
            );
        }

        case NavigationPaneItemType.PROPERTY_KEY:
        case NavigationPaneItemType.PROPERTY_VALUE: {
            const propertyNode = item.data;
            const indentGuideLevels = indentGuideLevelsByKey.get(getNavigationItemRenderKey(item));
            const searchMatch = getNavigationItemSearchMatch(item, searchHighlights);
            const inclusionOperator =
                searchMatch === 'include' ? searchHighlights.getPropertyInclusionOperator(propertyNode.id) : undefined;
            const renameTarget =
                inlineRename.target?.type === 'property' && inlineRename.target.id === propertyNode.id ? inlineRename.target : null;

            return (
                <PropertyTreeItem
                    propertyNode={propertyNode}
                    level={item.level ?? 0}
                    indentGuideLevels={indentGuideLevels}
                    isExpanded={expansionState.expandedProperties.has(propertyNode.id)}
                    isSelected={isNavigationItemSelected(item, selectionState)}
                    onToggle={() => tree.handlePropertyToggle(propertyNode.id)}
                    onClick={event => tree.handlePropertyClick(propertyNode, event)}
                    onToggleAllSiblings={() => {
                        const isCurrentlyExpanded = expansionState.expandedProperties.has(propertyNode.id);
                        tree.handlePropertyToggle(propertyNode.id);
                        const descendantNodeIds = tree.getAllDescendantPropertyNodeIds(propertyNode);
                        if (descendantNodeIds.length > 0) {
                            expansionDispatch({
                                type: 'TOGGLE_DESCENDANT_PROPERTIES',
                                descendantNodeIds,
                                expand: !isCurrentlyExpanded
                            });
                        }
                    }}
                    color={item.color}
                    backgroundColor={getSolidBackground(item.backgroundColor)}
                    adjacentFilledClassName={adjacentFilledClassName}
                    icon={item.icon}
                    searchMatch={searchMatch}
                    inclusionOperator={inclusionOperator}
                    isDraggable={!isMobile}
                    countInfo={propertyCounts.get(propertyNode.id)}
                    showFileCount={settings.showNoteCount}
                    inlineRename={
                        renameTarget
                            ? {
                                  initialValue: renameTarget.initialValue,
                                  ariaLabel: strings.contextMenu.property.renameKey,
                                  onCommit: value => inlineRename.commit(renameTarget, value),
                                  onCancel: inlineRename.cancel,
                                  onRestoreFocus: inlineRename.restoreFocus
                              }
                            : undefined
                    }
                />
            );
        }

        case NavigationPaneItemType.TOP_SPACER: {
            const spacerClass = item.hasSeparator ? 'nn-nav-top-spacer nn-nav-spacer--with-separator' : 'nn-nav-top-spacer';
            return <div className={spacerClass} />;
        }

        case NavigationPaneItemType.BOTTOM_SPACER:
            return <div className="nn-nav-bottom-spacer" />;

        case NavigationPaneItemType.LIST_SPACER: {
            const spacerClass = item.hasSeparator ? 'nn-nav-list-spacer nn-nav-spacer--with-separator' : 'nn-nav-list-spacer';
            return <div className={spacerClass} />;
        }

        case NavigationPaneItemType.ROOT_SPACER:
            return <div className="nn-nav-root-spacer" style={{ height: `${item.spacing}px` }} aria-hidden="true" />;

        default:
            return null;
    }
}
