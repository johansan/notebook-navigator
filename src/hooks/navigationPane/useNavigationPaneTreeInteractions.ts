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

import React, { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { App, TFile, TFolder } from 'obsidian';
import type { IPropertyTreeProvider } from '../../interfaces/IPropertyTreeProvider';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { CommandQueueService } from '../../services/CommandQueueService';
import type { ExpansionAction } from '../../context/ExpansionContext';
import type { NavigationSelectionState, SelectionAction } from '../../context/SelectionContext';
import type { UIAction } from '../../context/UIStateContext';
import { localStorage } from '../../utils/localStorage';
import {
    STORAGE_KEYS,
    ItemType,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    RECENT_NOTES_VIRTUAL_FOLDER_ID,
    SHORTCUTS_VIRTUAL_FOLDER_ID,
    TAGGED_TAG_ID,
    TAGS_ROOT_VIRTUAL_FOLDER_ID,
    UNTAGGED_TAG_ID
} from '../../types';
import type { PropertyTreeNode, TagTreeNode } from '../../types/storage';
import type { InclusionOperator } from '../../utils/filterSearch';
import { getFolderNote, openFolderNoteFile, type FolderNoteOpenContext } from '../../utils/folderNotes';
import { runAsyncAction } from '../../utils/async';
import { resolveFolderNoteClickOpenContext, resolveFolderNoteDefaultOpenContext } from '../../utils/keyboardOpenContext';
import { findTagNode } from '../../utils/tagTree';
import { resolveCanonicalTagPath } from '../../utils/tagUtils';
import { getTagSearchModifierOperator } from '../../utils/tagUtils';
import { isVirtualTagCollectionId } from '../../utils/virtualTagCollections';
import {
    getFolderAncestorPaths,
    getPropertyAncestorNodeIds,
    getTagAncestorPaths,
    toggleNavigationExpansionTarget
} from '../../utils/navigationExpansion';
import { useStableHandlerFacade } from '../useStableHandlerFacade';

interface ExpansionStateLike {
    expandedFolders: Set<string>;
    expandedTags: Set<string>;
    expandedProperties: Set<string>;
    expandedVirtualFolders: Set<string>;
}

interface UIStateLike {
    singlePane: boolean;
}

interface UseNavigationPaneTreeInteractionsProps {
    app: App;
    commandQueue: CommandQueueService | null;
    isMobile: boolean;
    settings: NotebookNavigatorSettings;
    uiState: UIStateLike;
    expansionState: ExpansionStateLike;
    expansionDispatch: Dispatch<ExpansionAction>;
    selectionState: NavigationSelectionState;
    selectionDispatch: Dispatch<SelectionAction>;
    uiDispatch: Dispatch<UIAction>;
    propertyTreeService: IPropertyTreeProvider | null;
    tagTree: Map<string, TagTreeNode>;
    propertyTree: Map<string, PropertyTreeNode>;
    tagsVirtualFolderHasChildren: boolean;
    setShortcutsExpanded: Dispatch<SetStateAction<boolean>>;
    setRecentNotesExpanded: Dispatch<SetStateAction<boolean>>;
    clearActiveShortcut: () => void;
    openFolderNoteInRightSidebar: (folderNote: TFile) => Promise<void>;
    onModifySearchWithTag: (tag: string, operator: InclusionOperator) => void;
    onModifySearchWithProperty: (key: string, value: string | null, operator: InclusionOperator) => void;
}

export interface NavigationPaneTreeInteractionsResult {
    handleFolderToggle: (path: string) => void;
    handleFolderClick: (folder: TFolder, options?: { fromShortcut?: boolean }) => void;
    handleFolderNameClick: (folder: TFolder, event?: React.MouseEvent<HTMLSpanElement>) => void;
    handleFolderNameMouseDown: (folder: TFolder, event: React.MouseEvent<HTMLSpanElement>) => void;
    handleFolderToggleAllSiblings: (folder: TFolder) => void;
    handleTagToggle: (path: string) => void;
    handleTagToggleAllSiblings: (tagPath: string) => void;
    handlePropertyToggle: (nodeId: string) => void;
    handlePropertyToggleAllSiblings: (propertyNode: PropertyTreeNode) => void;
    handleVirtualFolderToggle: (folderId: string) => void;
    handleVirtualFolderToggleAllSiblings: (folderId: string) => void;
    handleTagClick: (tagPath: string, event?: React.MouseEvent, options?: { fromShortcut?: boolean }) => void;
    handleTagCollectionClick: (tagCollectionId: string, event: React.MouseEvent<HTMLDivElement>) => void;
    handlePropertyCollectionClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    handlePropertyClick: (propertyNode: PropertyTreeNode, event?: React.MouseEvent, options?: { fromShortcut?: boolean }) => void;
}

export function useNavigationPaneTreeInteractions({
    app,
    commandQueue,
    isMobile,
    settings,
    uiState,
    expansionState,
    expansionDispatch,
    selectionState,
    selectionDispatch,
    uiDispatch,
    propertyTreeService,
    tagTree,
    propertyTree,
    tagsVirtualFolderHasChildren,
    setShortcutsExpanded,
    setRecentNotesExpanded,
    clearActiveShortcut,
    openFolderNoteInRightSidebar,
    onModifySearchWithTag,
    onModifySearchWithProperty
}: UseNavigationPaneTreeInteractionsProps): NavigationPaneTreeInteractionsResult {
    const focusListPaneAfterRightSidebarFolderNoteSelection = useCallback(
        (openContext: FolderNoteOpenContext) => {
            if (!uiState.singlePane || openContext !== 'right-sidebar') {
                return;
            }

            uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
        },
        [uiDispatch, uiState.singlePane]
    );

    const handleFolderToggle = useCallback(
        (path: string) => {
            if (settings.collapseOtherBranchesOnExpand) {
                const folder = app.vault.getFolderByPath(path);
                if (folder) {
                    toggleNavigationExpansionTarget(
                        {
                            type: 'folder',
                            id: path,
                            hasChildren: folder.children.some(child => child instanceof TFolder),
                            ancestorIds: getFolderAncestorPaths(folder)
                        },
                        expansionState,
                        expansionDispatch,
                        'toggle',
                        { collapseOtherBranches: true }
                    );
                    return;
                }
            }

            expansionDispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderPath: path });
        },
        [app.vault, expansionDispatch, expansionState, settings.collapseOtherBranchesOnExpand]
    );

    const handleFolderClick = useCallback(
        (folder: TFolder, options?: { fromShortcut?: boolean }) => {
            if (!options?.fromShortcut) {
                clearActiveShortcut();
            }

            const hasChildFolders = folder.children.some(child => child instanceof TFolder);
            const isExpanded = expansionState.expandedFolders.has(folder.path);
            const isSelectedFolder =
                selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder?.path === folder.path;
            const shouldCollapseOnSelect =
                settings.autoExpandNavItems && !uiState.singlePane && hasChildFolders && isExpanded && isSelectedFolder;
            const shouldExpandOnly = uiState.singlePane && settings.autoExpandNavItems && hasChildFolders && !isExpanded;

            selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder });

            if (shouldCollapseOnSelect) {
                handleFolderToggle(folder.path);
                uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                return;
            }

            if (settings.autoExpandNavItems && hasChildFolders && !isExpanded) {
                handleFolderToggle(folder.path);
            }

            if (uiState.singlePane) {
                if (shouldExpandOnly) {
                    uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                } else {
                    uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
                }
                return;
            }

            uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
        },
        [
            clearActiveShortcut,
            expansionState.expandedFolders,
            handleFolderToggle,
            selectionDispatch,
            selectionState.selectedFolder,
            selectionState.selectionType,
            settings,
            uiDispatch,
            uiState.singlePane
        ]
    );

    const handleFolderNameClick = useCallback(
        (folder: TFolder, event?: React.MouseEvent<HTMLSpanElement>) => {
            if (!settings.enableFolderNotes || !settings.enableFolderNoteLinks) {
                handleFolderClick(folder);
                return;
            }

            const folderNote = getFolderNote(folder, settings);
            if (!folderNote) {
                handleFolderClick(folder);
                return;
            }

            const wasSelectedFolder =
                selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder?.path === folder.path;
            selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder, autoSelectedFile: null });

            const openContext = event
                ? resolveFolderNoteClickOpenContext(event, settings.folderNoteOpenLocation, settings.multiSelectModifier, isMobile)
                : resolveFolderNoteDefaultOpenContext(settings.folderNoteOpenLocation);
            focusListPaneAfterRightSidebarFolderNoteSelection(openContext);

            if (openContext === 'right-sidebar' && settings.showNearestFolderNoteInSidebar && !wasSelectedFolder) {
                return;
            }

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder,
                    folderNote,
                    context: openContext,
                    openInRightSidebar: openFolderNoteInRightSidebar
                })
            );
        },
        [
            app,
            commandQueue,
            focusListPaneAfterRightSidebarFolderNoteSelection,
            handleFolderClick,
            isMobile,
            openFolderNoteInRightSidebar,
            selectionDispatch,
            selectionState.selectedFolder,
            selectionState.selectionType,
            settings
        ]
    );

    const handleFolderNameMouseDown = useCallback(
        (folder: TFolder, event: React.MouseEvent<HTMLSpanElement>) => {
            if (event.button !== 1 || !settings.enableFolderNotes || !settings.enableFolderNoteLinks) {
                return;
            }

            const folderNote = getFolderNote(folder, settings);
            if (!folderNote) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder, autoSelectedFile: null });

            runAsyncAction(() => openFolderNoteFile({ app, commandQueue, folder, folderNote, context: 'tab' }));
        },
        [app, commandQueue, selectionDispatch, settings]
    );

    const handleTagToggle = useCallback(
        (path: string) => {
            if (settings.collapseOtherBranchesOnExpand) {
                const tagNode = findTagNode(tagTree, path);
                if (tagNode) {
                    toggleNavigationExpansionTarget(
                        {
                            type: 'tag',
                            id: tagNode.path,
                            hasChildren: tagNode.children.size > 0,
                            ancestorIds: getTagAncestorPaths(tagNode.path)
                        },
                        expansionState,
                        expansionDispatch,
                        'toggle',
                        { collapseOtherBranches: true }
                    );
                    return;
                }
            }

            expansionDispatch({ type: 'TOGGLE_TAG_EXPANDED', tagPath: path });
        },
        [expansionDispatch, expansionState, settings.collapseOtherBranchesOnExpand, tagTree]
    );

    const handlePropertyToggle = useCallback(
        (nodeId: string) => {
            if (settings.collapseOtherBranchesOnExpand) {
                const propertyNode =
                    propertyTreeService?.findNode(nodeId) ??
                    Array.from(propertyTree.values()).find(node => node.id === nodeId || node.children.has(nodeId)) ??
                    null;
                const targetNode = propertyNode?.id === nodeId ? propertyNode : propertyNode?.children.get(nodeId);
                if (targetNode) {
                    toggleNavigationExpansionTarget(
                        {
                            type: 'property',
                            id: targetNode.id,
                            hasChildren: targetNode.children.size > 0,
                            ancestorIds: getPropertyAncestorNodeIds(targetNode.id)
                        },
                        expansionState,
                        expansionDispatch,
                        'toggle',
                        { collapseOtherBranches: true }
                    );
                    return;
                }
            }

            expansionDispatch({ type: 'TOGGLE_PROPERTY_EXPANDED', propertyNodeId: nodeId });
        },
        [expansionDispatch, expansionState, propertyTree, propertyTreeService, settings.collapseOtherBranchesOnExpand]
    );

    const handleVirtualFolderToggle = useCallback(
        (folderId: string) => {
            if (folderId === SHORTCUTS_VIRTUAL_FOLDER_ID) {
                setShortcutsExpanded(prev => {
                    const next = !prev;
                    localStorage.set(STORAGE_KEYS.shortcutsExpandedKey, next ? '1' : '0');
                    return next;
                });
                return;
            }

            if (folderId === RECENT_NOTES_VIRTUAL_FOLDER_ID) {
                setRecentNotesExpanded(prev => {
                    const next = !prev;
                    localStorage.set(STORAGE_KEYS.recentNotesExpandedKey, next ? '1' : '0');
                    return next;
                });
                return;
            }

            expansionDispatch({ type: 'TOGGLE_VIRTUAL_FOLDER_EXPANDED', folderId });
        },
        [expansionDispatch, setRecentNotesExpanded, setShortcutsExpanded]
    );

    const getAllDescendantFolders = useCallback((folder: TFolder): string[] => {
        const descendants: string[] = [];

        const collectDescendants = (currentFolder: TFolder) => {
            currentFolder.children.forEach(child => {
                if (child instanceof TFolder) {
                    descendants.push(child.path);
                    collectDescendants(child);
                }
            });
        };

        collectDescendants(folder);
        return descendants;
    }, []);

    const getAllTagPaths = useCallback((): string[] => {
        const tagPaths: string[] = [];
        const visited = new Set<TagTreeNode>();

        const collectPaths = (node: TagTreeNode) => {
            if (visited.has(node)) {
                return;
            }
            visited.add(node);
            tagPaths.push(node.path);
            node.children.forEach(child => collectPaths(child));
        };

        tagTree.forEach(node => collectPaths(node));
        return tagPaths;
    }, [tagTree]);

    const getAllDescendantTags = useCallback(
        (tagPath: string): string[] => {
            const descendants: string[] = [];
            const tagNode = findTagNode(tagTree, tagPath);
            if (!tagNode) {
                return descendants;
            }

            const collectDescendants = (node: TagTreeNode) => {
                node.children.forEach(child => {
                    descendants.push(child.path);
                    collectDescendants(child);
                });
            };

            collectDescendants(tagNode);
            return descendants;
        },
        [tagTree]
    );

    const getAllPropertyNodeIds = useCallback((): string[] => {
        const nodeIds: string[] = [];
        const visited = new Set<PropertyTreeNode>();

        const collectIds = (node: PropertyTreeNode) => {
            if (visited.has(node)) {
                return;
            }
            visited.add(node);
            nodeIds.push(node.id);
            node.children.forEach(child => collectIds(child));
        };

        propertyTree.forEach(node => collectIds(node));
        return nodeIds;
    }, [propertyTree]);

    const getAllDescendantPropertyNodeIds = useCallback(
        (propertyNode: PropertyTreeNode): string[] => {
            const serviceNode = propertyTreeService?.findNode(propertyNode.id) ?? null;
            if (serviceNode === propertyNode) {
                return Array.from(propertyTreeService?.collectDescendantNodeIds(propertyNode.id) ?? []);
            }

            const descendants: string[] = [];
            const collectDescendants = (node: PropertyTreeNode) => {
                node.children.forEach(child => {
                    descendants.push(child.id);
                    collectDescendants(child);
                });
            };

            collectDescendants(propertyNode);
            return descendants;
        },
        [propertyTreeService]
    );

    const focusAfterTreeSelection = useCallback(
        (keepNavigationFocus: boolean) => {
            if (uiState.singlePane) {
                if (keepNavigationFocus) {
                    uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                } else {
                    uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
                }
                return;
            }

            uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
        },
        [uiDispatch, uiState.singlePane]
    );

    const applyTreeSelection = useCallback(
        (params: {
            hasChildren: boolean;
            isExpanded: boolean;
            isSelected: boolean;
            fromShortcut?: boolean;
            onSelect: () => void;
            onToggleExpand: () => void;
        }) => {
            const { hasChildren, isExpanded, isSelected, fromShortcut, onSelect, onToggleExpand } = params;

            if (!fromShortcut) {
                clearActiveShortcut();
            }

            onSelect();

            const shouldCollapseOnSelect = settings.autoExpandNavItems && !uiState.singlePane && hasChildren && isExpanded && isSelected;
            if (shouldCollapseOnSelect) {
                onToggleExpand();
                uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                return;
            }

            const shouldExpandOnly = uiState.singlePane && settings.autoExpandNavItems && hasChildren && !isExpanded;
            if (settings.autoExpandNavItems && hasChildren && !isExpanded) {
                onToggleExpand();
            }

            focusAfterTreeSelection(shouldExpandOnly);
        },
        [clearActiveShortcut, focusAfterTreeSelection, settings.autoExpandNavItems, uiDispatch, uiState.singlePane]
    );

    const handleTagClick = useCallback(
        (tagPath: string, event?: React.MouseEvent, options?: { fromShortcut?: boolean }) => {
            const tagNode = findTagNode(tagTree, tagPath);
            const canonicalPath = resolveCanonicalTagPath(tagPath, tagTree);
            if (!canonicalPath) {
                return;
            }

            const isVirtualCollection = isVirtualTagCollectionId(canonicalPath);
            const operator = getTagSearchModifierOperator(event ?? null, settings.multiSelectModifier, isMobile);
            if (operator && !isVirtualCollection && canonicalPath !== UNTAGGED_TAG_ID) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                onModifySearchWithTag(canonicalPath, operator);
                return;
            }

            const isVirtualTagRoot = settings.showAllTagsFolder && canonicalPath === TAGGED_TAG_ID;
            const isExpanded = isVirtualTagRoot
                ? expansionState.expandedVirtualFolders.has(TAGS_ROOT_VIRTUAL_FOLDER_ID)
                : Boolean(tagNode && expansionState.expandedTags.has(tagNode.path));
            const isSelectedTag = selectionState.selectionType === ItemType.TAG && selectionState.selectedTag === canonicalPath;
            const hasChildren = isVirtualTagRoot ? tagsVirtualFolderHasChildren : Boolean(tagNode && tagNode.children.size > 0);
            applyTreeSelection({
                hasChildren,
                isExpanded,
                isSelected: isSelectedTag,
                fromShortcut: options?.fromShortcut,
                onSelect: () => {
                    selectionDispatch({ type: 'SET_SELECTED_TAG', tag: canonicalPath });
                },
                onToggleExpand: () => {
                    if (isVirtualTagRoot) {
                        expansionDispatch({ type: 'TOGGLE_VIRTUAL_FOLDER_EXPANDED', folderId: TAGS_ROOT_VIRTUAL_FOLDER_ID });
                    } else if (tagNode) {
                        handleTagToggle(tagNode.path);
                    }
                }
            });
        },
        [
            applyTreeSelection,
            expansionDispatch,
            expansionState.expandedTags,
            expansionState.expandedVirtualFolders,
            handleTagToggle,
            isMobile,
            onModifySearchWithTag,
            selectionDispatch,
            selectionState.selectedTag,
            selectionState.selectionType,
            settings.multiSelectModifier,
            settings.showAllTagsFolder,
            tagTree,
            tagsVirtualFolderHasChildren
        ]
    );

    const handleTagCollectionClick = useCallback(
        (tagCollectionId: string, event: React.MouseEvent<HTMLDivElement>) => {
            handleTagClick(tagCollectionId, event);
        },
        [handleTagClick]
    );

    const handlePropertyCollectionClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            void event;

            const rootId = PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
            const selectedPropertyNodeId = selectionState.selectionType === ItemType.PROPERTY ? selectionState.selectedProperty : null;

            applyTreeSelection({
                hasChildren: propertyTree.size > 0,
                isExpanded: expansionState.expandedVirtualFolders.has(rootId),
                isSelected: selectedPropertyNodeId === rootId,
                onSelect: () => {
                    selectionDispatch({
                        type: 'SET_SELECTED_PROPERTY',
                        nodeId: rootId
                    });
                },
                onToggleExpand: () => {
                    handleVirtualFolderToggle(rootId);
                }
            });
        },
        [
            applyTreeSelection,
            expansionState.expandedVirtualFolders,
            handleVirtualFolderToggle,
            propertyTree,
            selectionDispatch,
            selectionState.selectedProperty,
            selectionState.selectionType
        ]
    );

    const handlePropertyClick = useCallback(
        (propertyNode: PropertyTreeNode, event?: React.MouseEvent, options?: { fromShortcut?: boolean }) => {
            const operator = getTagSearchModifierOperator(event ?? null, settings.multiSelectModifier, isMobile);
            if (operator) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                const valuePath = propertyNode.kind === 'value' && propertyNode.valuePath ? propertyNode.valuePath : null;
                onModifySearchWithProperty(propertyNode.key, valuePath, operator);
                return;
            }

            const hasChildren = propertyNode.children.size > 0;
            const isExpanded = expansionState.expandedProperties.has(propertyNode.id);
            const selectedPropertyNodeId = selectionState.selectionType === ItemType.PROPERTY ? selectionState.selectedProperty : null;
            applyTreeSelection({
                hasChildren,
                isExpanded,
                isSelected: selectedPropertyNodeId === propertyNode.id,
                fromShortcut: options?.fromShortcut,
                onSelect: () => {
                    selectionDispatch({
                        type: 'SET_SELECTED_PROPERTY',
                        nodeId: propertyNode.id,
                        source: options?.fromShortcut ? 'shortcut' : undefined
                    });
                },
                onToggleExpand: () => {
                    handlePropertyToggle(propertyNode.id);
                }
            });
        },
        [
            applyTreeSelection,
            expansionState.expandedProperties,
            handlePropertyToggle,
            isMobile,
            onModifySearchWithProperty,
            selectionDispatch,
            selectionState.selectedProperty,
            selectionState.selectionType,
            settings.multiSelectModifier
        ]
    );

    const handleFolderToggleAllSiblings = useCallback(
        (folder: TFolder) => {
            const isCurrentlyExpanded = expansionState.expandedFolders.has(folder.path);
            handleFolderToggle(folder.path);
            const descendantPaths = getAllDescendantFolders(folder);
            if (descendantPaths.length > 0) {
                expansionDispatch({ type: 'TOGGLE_DESCENDANT_FOLDERS', descendantPaths, expand: !isCurrentlyExpanded });
            }
        },
        [expansionDispatch, expansionState.expandedFolders, getAllDescendantFolders, handleFolderToggle]
    );

    const handleTagToggleAllSiblings = useCallback(
        (tagPath: string) => {
            const isCurrentlyExpanded = expansionState.expandedTags.has(tagPath);
            handleTagToggle(tagPath);
            const descendantPaths = getAllDescendantTags(tagPath);
            if (descendantPaths.length > 0) {
                expansionDispatch({ type: 'TOGGLE_DESCENDANT_TAGS', descendantPaths, expand: !isCurrentlyExpanded });
            }
        },
        [expansionDispatch, expansionState.expandedTags, getAllDescendantTags, handleTagToggle]
    );

    const handlePropertyToggleAllSiblings = useCallback(
        (propertyNode: PropertyTreeNode) => {
            const isCurrentlyExpanded = expansionState.expandedProperties.has(propertyNode.id);
            handlePropertyToggle(propertyNode.id);
            const descendantNodeIds = getAllDescendantPropertyNodeIds(propertyNode);
            if (descendantNodeIds.length > 0) {
                expansionDispatch({ type: 'TOGGLE_DESCENDANT_PROPERTIES', descendantNodeIds, expand: !isCurrentlyExpanded });
            }
        },
        [expansionDispatch, expansionState.expandedProperties, getAllDescendantPropertyNodeIds, handlePropertyToggle]
    );

    const handleVirtualFolderToggleAllSiblings = useCallback(
        (folderId: string) => {
            const isCurrentlyExpanded = expansionState.expandedVirtualFolders.has(folderId);
            handleVirtualFolderToggle(folderId);
            if (folderId === TAGS_ROOT_VIRTUAL_FOLDER_ID) {
                const descendantPaths = getAllTagPaths();
                if (descendantPaths.length > 0) {
                    expansionDispatch({ type: 'TOGGLE_DESCENDANT_TAGS', descendantPaths, expand: !isCurrentlyExpanded });
                }
                return;
            }
            if (folderId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                const descendantNodeIds = getAllPropertyNodeIds();
                if (descendantNodeIds.length > 0) {
                    expansionDispatch({ type: 'TOGGLE_DESCENDANT_PROPERTIES', descendantNodeIds, expand: !isCurrentlyExpanded });
                }
            }
        },
        [expansionDispatch, expansionState.expandedVirtualFolders, getAllPropertyNodeIds, getAllTagPaths, handleVirtualFolderToggle]
    );

    const interactions: NavigationPaneTreeInteractionsResult = {
        handleFolderToggle,
        handleFolderClick,
        handleFolderNameClick,
        handleFolderNameMouseDown,
        handleFolderToggleAllSiblings,
        handleTagToggle,
        handleTagToggleAllSiblings,
        handlePropertyToggle,
        handlePropertyToggleAllSiblings,
        handleVirtualFolderToggle,
        handleVirtualFolderToggleAllSiblings,
        handleTagClick,
        handleTagCollectionClick,
        handlePropertyCollectionClick,
        handlePropertyClick
    };

    // Identity-stable facade; calls forward to the latest handlers through a ref
    return useStableHandlerFacade(interactions, [
        'handleFolderToggle',
        'handleFolderClick',
        'handleFolderNameClick',
        'handleFolderNameMouseDown',
        'handleFolderToggleAllSiblings',
        'handleTagToggle',
        'handleTagToggleAllSiblings',
        'handlePropertyToggle',
        'handlePropertyToggleAllSiblings',
        'handleVirtualFolderToggle',
        'handleVirtualFolderToggleAllSiblings',
        'handleTagClick',
        'handleTagCollectionClick',
        'handlePropertyCollectionClick',
        'handlePropertyClick'
    ]);
}
