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

import { useMemo } from 'react';
import type { App, TFolder } from 'obsidian';
import type { IPropertyTreeProvider } from '../../../interfaces/IPropertyTreeProvider';
import type { ITagTreeProvider } from '../../../interfaces/ITagTreeProvider';
import { strings } from '../../../i18n';
import type { NotebookNavigatorSettings } from '../../../settings/types';
import {
    ItemType,
    NavigationPaneItemType,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    TAGGED_TAG_ID,
    TAGS_ROOT_VIRTUAL_FOLDER_ID,
    UNTAGGED_TAG_ID,
    type VirtualFolder
} from '../../../types';
import type { NoteCountInfo } from '../../../types/noteCounts';
import type { PropertyTreeNode, TagTreeNode } from '../../../types/storage';
import type { CombinedNavigationItem } from '../../../types/virtualization';
import { getDBInstanceOrNull } from '../../../storage/fileOperations';
import type { NavigationSelectionScope } from '../../../utils/selectionUtils';
import { getFilesForNavigationSelection } from '../../../utils/selectionUtils';
import { buildTagTreeFromFilePaths, excludeFromTagTree } from '../../../utils/tagTree';
import { buildPropertyTreeFromFilePaths, getTotalPropertyNoteCount } from '../../../utils/propertyTree';
import {
    flattenFolderTree,
    flattenTagTree,
    comparePropertyOrderWithFallback,
    compareTagOrderWithFallback
} from '../../../utils/treeFlattener';
import { resolveUXIcon } from '../../../utils/uxIcons';
import { getVirtualTagCollection, VIRTUAL_TAG_COLLECTION_IDS } from '../../../utils/virtualTagCollections';
import {
    comparePropertyValueNodesAlphabetically,
    compareTagAlphabetically,
    createPropertyComparator,
    type PropertyNodeComparator,
    type TagComparator
} from './navigationComparators';
import type { NavigationPaneSourceState } from './useNavigationPaneSourceState';

interface NavigationPaneTreeExpansionState {
    expandedFolders: Set<string>;
    expandedTags: Set<string>;
    expandedProperties: Set<string>;
    expandedVirtualFolders: Set<string>;
}

export interface UseNavigationPaneTreeSectionsParams {
    app: App;
    settings: NotebookNavigatorSettings;
    expansionState: NavigationPaneTreeExpansionState;
    showHiddenItems: boolean;
    includeDescendantNotes: boolean;
    sourceState: NavigationPaneSourceState;
    selectionScope: NavigationSelectionScope;
    tagTreeService: ITagTreeProvider | null;
    propertyTreeService: IPropertyTreeProvider | null;
}

export interface NavigationPaneTreeSectionsResult {
    folderItems: CombinedNavigationItem[];
    tagItems: CombinedNavigationItem[];
    renderTagTree: Map<string, TagTreeNode>;
    renderedRootTagKeys: string[];
    rootOrderingTagTree: Map<string, TagTreeNode>;
    resolvedRootTagKeys: string[];
    tagsVirtualFolderHasChildren: boolean;
    renderPropertyTree: Map<string, PropertyTreeNode>;
    rootOrderingPropertyTree: Map<string, PropertyTreeNode>;
    propertyItems: CombinedNavigationItem[];
    propertiesSectionActive: boolean;
    resolvedRootPropertyKeys: string[];
    propertyCollectionCount: NoteCountInfo | undefined;
}

interface ResolvedRootTagOrdering {
    rootNodeMap: Map<string, TagTreeNode>;
    resolvedRootTagKeys: string[];
    hasVisibleTags: boolean;
}

interface ScopedTagSectionSource {
    visibleTagTree: Map<string, TagTreeNode>;
    visibleTaggedCount: number;
    untaggedCount: number;
}

interface ResolvedRootPropertyOrdering {
    rootNodeMap: Map<string, PropertyTreeNode>;
    resolvedRootPropertyKeys: string[];
}

interface ScopedPropertySectionSource {
    propertyTree: Map<string, PropertyTreeNode>;
}

function getEffectiveRootTagComparator(sourceState: Pick<NavigationPaneSourceState, 'tagComparator' | 'rootTagOrderMap'>): TagComparator {
    const baseComparator = sourceState.tagComparator ?? compareTagAlphabetically;
    if (sourceState.rootTagOrderMap.size === 0) {
        return baseComparator;
    }

    return (a, b) => compareTagOrderWithFallback(a, b, sourceState.rootTagOrderMap, baseComparator);
}

function resolveRootTagOrdering(params: {
    visibleTagTree: Map<string, TagTreeNode>;
    hiddenRootTagNodes?: Map<string, TagTreeNode>;
    shouldIncludeUntagged: boolean;
    rootTagOrder: string[];
    comparator: TagComparator;
}): ResolvedRootTagOrdering {
    const visibleRootNodes = Array.from(params.visibleTagTree.values());
    const sortedRootNodes = visibleRootNodes.length > 0 ? visibleRootNodes.slice().sort(params.comparator) : visibleRootNodes;
    const rootNodeMap = new Map<string, TagTreeNode>();

    sortedRootNodes.forEach(node => {
        rootNodeMap.set(node.path, node);
    });

    params.hiddenRootTagNodes?.forEach((node, path) => {
        rootNodeMap.set(path, node);
    });

    const defaultKeyOrder = sortedRootNodes.map(node => node.path);
    const allowedKeys = new Set(defaultKeyOrder);

    if (params.shouldIncludeUntagged) {
        allowedKeys.add(UNTAGGED_TAG_ID);
    }

    params.hiddenRootTagNodes?.forEach((_node, path) => {
        allowedKeys.add(path);
        if (!defaultKeyOrder.includes(path)) {
            defaultKeyOrder.push(path);
        }
    });

    const resolvedRootTagKeys: string[] = [];
    params.rootTagOrder.forEach(entry => {
        if (!allowedKeys.has(entry) || resolvedRootTagKeys.includes(entry)) {
            return;
        }
        resolvedRootTagKeys.push(entry);
    });

    defaultKeyOrder.forEach(key => {
        if (!resolvedRootTagKeys.includes(key)) {
            resolvedRootTagKeys.push(key);
        }
    });

    if (params.shouldIncludeUntagged && !resolvedRootTagKeys.includes(UNTAGGED_TAG_ID)) {
        resolvedRootTagKeys.push(UNTAGGED_TAG_ID);
    }

    return {
        rootNodeMap,
        resolvedRootTagKeys,
        hasVisibleTags: sortedRootNodes.length > 0
    };
}

function getEffectiveRootPropertyComparator(
    sourceState: Pick<NavigationPaneSourceState, 'propertyKeyComparator' | 'rootPropertyOrderMap'>
): PropertyNodeComparator {
    if (sourceState.rootPropertyOrderMap.size === 0) {
        return sourceState.propertyKeyComparator;
    }

    return (a, b) => comparePropertyOrderWithFallback(a, b, sourceState.rootPropertyOrderMap, sourceState.propertyKeyComparator);
}

function resolveRootPropertyOrdering(params: {
    propertyTree: Map<string, PropertyTreeNode>;
    comparator: PropertyNodeComparator;
}): ResolvedRootPropertyOrdering {
    const rootNodes = Array.from(params.propertyTree.values());
    const sortedRootNodes = rootNodes.length > 0 ? rootNodes.slice().sort(params.comparator) : rootNodes;
    const rootNodeMap = new Map<string, PropertyTreeNode>();

    sortedRootNodes.forEach(node => {
        rootNodeMap.set(node.key, node);
    });

    return {
        rootNodeMap,
        resolvedRootPropertyKeys: sortedRootNodes.map(node => node.key)
    };
}

export function useNavigationPaneTreeSections({
    app,
    settings,
    expansionState,
    showHiddenItems,
    includeDescendantNotes,
    sourceState,
    selectionScope,
    tagTreeService,
    propertyTreeService
}: UseNavigationPaneTreeSectionsParams): NavigationPaneTreeSectionsResult {
    const folderItems = useMemo(() => {
        // A root folder present while the setting is off is only visible through the show hidden items
        // toggle. It renders as excluded and always expanded: it has no persisted expansion entry, and a
        // collapsed root would hide the entire folder tree. Deriving this from the root folder list instead
        // of the toggle keeps the frame where the list has not caught up with a toggle change consistent.
        const rootRevealedAsHiddenItem = !settings.showRootFolder && sourceState.rootFolders.some(folder => folder.path === '/');
        const expandedFolders = rootRevealedAsHiddenItem
            ? new Set(expansionState.expandedFolders).add('/')
            : expansionState.expandedFolders;
        const baseFolderExclusion = sourceState.folderExclusionByFolderNote;
        const isFolderExcluded = rootRevealedAsHiddenItem
            ? (folder: TFolder) => (folder.path === '/' ? true : (baseFolderExclusion?.(folder) ?? false))
            : baseFolderExclusion;
        return flattenFolderTree(sourceState.rootFolders, expandedFolders, sourceState.hiddenFolders, 0, new Set(), {
            rootOrderMap: sourceState.rootFolderOrderMap,
            defaultSortOrder: settings.folderSortOrder,
            childSortOrderOverrides: settings.folderTreeSortOverrides,
            getFolderSortName: sourceState.getFolderSortName,
            isFolderExcluded
        });
    }, [
        expansionState.expandedFolders,
        settings.folderSortOrder,
        settings.folderTreeSortOverrides,
        settings.showRootFolder,
        sourceState.folderExclusionByFolderNote,
        sourceState.getFolderSortName,
        sourceState.hiddenFolders,
        sourceState.rootFolderOrderMap,
        sourceState.rootFolders
    ]);

    const isScopedTagContextActive = useMemo(() => {
        if (!settings.showTags || !settings.scopeTagsToCurrentContext) {
            return false;
        }

        if (selectionScope.selectionType === ItemType.FOLDER) {
            return Boolean(selectionScope.selectedFolder);
        }

        if (selectionScope.selectionType === ItemType.PROPERTY) {
            return Boolean(selectionScope.selectedProperty);
        }

        return false;
    }, [
        selectionScope.selectedFolder,
        selectionScope.selectedProperty,
        selectionScope.selectionType,
        settings.scopeTagsToCurrentContext,
        settings.showTags
    ]);
    const scopedTagPropertySelectionVersion = selectionScope.selectionType === ItemType.PROPERTY ? sourceState.propertyDataVersion : 0;
    const scopedTagPropertyTree = selectionScope.selectionType === ItemType.PROPERTY ? sourceState.propertyTree : null;

    const scopedTagSectionSource = useMemo((): ScopedTagSectionSource | null => {
        void sourceState.fileChangeVersion;
        void sourceState.tagDataVersion;
        void scopedTagPropertySelectionVersion;
        void scopedTagPropertyTree;
        void sourceState.metadataVisibilityVersion;

        if (!isScopedTagContextActive) {
            return null;
        }

        const db = getDBInstanceOrNull();
        if (!db) {
            return null;
        }

        const scopedFiles = getFilesForNavigationSelection(
            selectionScope,
            settings,
            { includeDescendantNotes, showHiddenItems },
            app,
            tagTreeService,
            propertyTreeService,
            { orderResults: false }
        );
        const scopedMarkdownPaths = scopedFiles.filter(file => file.extension === 'md').map(file => file.path);
        const { tagTree, tagged, untagged } = buildTagTreeFromFilePaths(
            db,
            scopedMarkdownPaths,
            sourceState.hiddenTags,
            showHiddenItems,
            false
        );
        const visibleTagTree =
            showHiddenItems || !sourceState.hiddenMatcherHasRules ? tagTree : excludeFromTagTree(tagTree, sourceState.hiddenTagMatcher);

        return {
            visibleTagTree,
            visibleTaggedCount: tagged,
            untaggedCount: untagged
        };
    }, [
        app,
        includeDescendantNotes,
        isScopedTagContextActive,
        propertyTreeService,
        selectionScope,
        settings,
        showHiddenItems,
        sourceState.fileChangeVersion,
        sourceState.hiddenMatcherHasRules,
        sourceState.hiddenTagMatcher,
        sourceState.hiddenTags,
        sourceState.metadataVisibilityVersion,
        sourceState.tagDataVersion,
        scopedTagPropertySelectionVersion,
        scopedTagPropertyTree,
        tagTreeService
    ]);

    const renderTagTree = useMemo(() => {
        if (!settings.showTags) {
            return new Map<string, TagTreeNode>();
        }
        return scopedTagSectionSource?.visibleTagTree ?? sourceState.visibleTagTree;
    }, [scopedTagSectionSource, settings.showTags, sourceState.visibleTagTree]);

    const effectiveRootTagComparator = useMemo(
        () =>
            getEffectiveRootTagComparator({
                rootTagOrderMap: sourceState.rootTagOrderMap,
                tagComparator: sourceState.tagComparator
            }),
        [sourceState.rootTagOrderMap, sourceState.tagComparator]
    );

    const globalRootTagOrdering = useMemo(() => {
        if (!settings.showTags) {
            return {
                rootNodeMap: new Map<string, TagTreeNode>(),
                resolvedRootTagKeys: [],
                hasVisibleTags: false
            };
        }

        return resolveRootTagOrdering({
            visibleTagTree: sourceState.visibleTagTree,
            hiddenRootTagNodes: sourceState.hiddenRootTagNodes,
            shouldIncludeUntagged: settings.showUntagged && sourceState.untaggedCount > 0,
            rootTagOrder: settings.rootTagOrder,
            comparator: effectiveRootTagComparator
        });
    }, [
        effectiveRootTagComparator,
        settings.rootTagOrder,
        settings.showTags,
        settings.showUntagged,
        sourceState.hiddenRootTagNodes,
        sourceState.untaggedCount,
        sourceState.visibleTagTree
    ]);

    const renderRootTagOrdering = useMemo(() => {
        if (!scopedTagSectionSource) {
            return globalRootTagOrdering;
        }

        return resolveRootTagOrdering({
            visibleTagTree: renderTagTree,
            hiddenRootTagNodes: new Map<string, TagTreeNode>(),
            shouldIncludeUntagged: settings.showUntagged && scopedTagSectionSource.untaggedCount > 0,
            rootTagOrder: settings.rootTagOrder,
            comparator: effectiveRootTagComparator
        });
    }, [
        effectiveRootTagComparator,
        globalRootTagOrdering,
        renderTagTree,
        scopedTagSectionSource,
        settings.rootTagOrder,
        settings.showUntagged
    ]);

    const rootOrderingTagTree = useMemo(() => globalRootTagOrdering.rootNodeMap, [globalRootTagOrdering.rootNodeMap]);
    const resolvedRootTagKeys = useMemo(() => globalRootTagOrdering.resolvedRootTagKeys, [globalRootTagOrdering.resolvedRootTagKeys]);

    const isScopedTagSectionSource = scopedTagSectionSource !== null;
    const scopedUntaggedCount = scopedTagSectionSource?.untaggedCount;
    const renderedRootUntaggedCount = scopedUntaggedCount ?? sourceState.untaggedCount;
    const renderedRootHiddenTagNodes = isScopedTagSectionSource ? undefined : sourceState.hiddenRootTagNodes;
    const renderedRootNodeMap = renderRootTagOrdering.rootNodeMap;
    const renderedResolvedRootTagKeys = renderRootTagOrdering.resolvedRootTagKeys;

    const renderedRootTagKeys = useMemo((): string[] => {
        if (!settings.showTags) {
            return [];
        }

        const shouldIncludeUntagged = settings.showUntagged && renderedRootUntaggedCount > 0;

        return renderedResolvedRootTagKeys.filter(key => {
            if (renderedRootHiddenTagNodes?.has(key) && !showHiddenItems) {
                return false;
            }

            if (key === UNTAGGED_TAG_ID) {
                return shouldIncludeUntagged;
            }

            return renderedRootNodeMap.has(key);
        });
    }, [
        renderedRootHiddenTagNodes,
        renderedRootNodeMap,
        renderedRootUntaggedCount,
        renderedResolvedRootTagKeys,
        settings.showTags,
        settings.showUntagged,
        showHiddenItems
    ]);

    const { tagItems, tagsVirtualFolderHasChildren } = useMemo((): {
        tagItems: CombinedNavigationItem[];
        tagsVirtualFolderHasChildren: boolean;
    } => {
        if (!settings.showTags) {
            return {
                tagItems: [],
                tagsVirtualFolderHasChildren: false
            };
        }

        const items: CombinedNavigationItem[] = [];
        const shouldHideTags = !showHiddenItems;
        const hasHiddenPatterns = sourceState.hiddenMatcherHasRules;
        const activeTagSectionSource = scopedTagSectionSource;
        const activeVisibleTagTree = renderTagTree;
        const activeTaggedCount = activeTagSectionSource?.visibleTaggedCount ?? sourceState.visibleTaggedCount;
        const activeUntaggedCount = activeTagSectionSource?.untaggedCount ?? sourceState.untaggedCount;
        const activeHiddenRootTagNodes = activeTagSectionSource ? new Map<string, TagTreeNode>() : sourceState.hiddenRootTagNodes;
        const activeResolvedRootTagKeys = renderRootTagOrdering.resolvedRootTagKeys;
        const shouldIncludeUntagged = settings.showUntagged && activeUntaggedCount > 0;
        const matcherForMarking = !shouldHideTags && hasHiddenPatterns ? sourceState.hiddenTagMatcher : undefined;
        const { rootNodeMap, hasVisibleTags } = renderRootTagOrdering;
        const taggedCollectionCount: NoteCountInfo = (() => {
            if (!includeDescendantNotes) {
                return { current: 0, descendants: 0, total: 0 };
            }
            return {
                current: activeTaggedCount,
                descendants: 0,
                total: activeTaggedCount
            };
        })();

        const pushUntaggedNode = (level: number) => {
            if (!shouldIncludeUntagged) {
                return;
            }
            const untaggedNode: TagTreeNode = {
                path: UNTAGGED_TAG_ID,
                displayPath: UNTAGGED_TAG_ID,
                name: getVirtualTagCollection(VIRTUAL_TAG_COLLECTION_IDS.UNTAGGED).getLabel(),
                children: new Map(),
                notesWithTag: new Set()
            };

            items.push({
                type: NavigationPaneItemType.UNTAGGED,
                data: untaggedNode,
                key: UNTAGGED_TAG_ID,
                level,
                noteCount: {
                    current: activeUntaggedCount,
                    descendants: 0,
                    total: activeUntaggedCount
                }
            });
        };

        const addVirtualFolder = (
            id: string,
            name: string,
            icon?: string,
            options?: {
                tagCollectionId?: string;
                propertyCollectionId?: string;
                showFileCount?: boolean;
                noteCount?: NoteCountInfo;
                hasChildren?: boolean;
            }
        ) => {
            const folder: VirtualFolder = { id, name, icon };
            items.push({
                type: NavigationPaneItemType.VIRTUAL_FOLDER,
                data: folder,
                level: 0,
                key: id,
                isSelectable: Boolean(options?.tagCollectionId || options?.propertyCollectionId),
                tagCollectionId: options?.tagCollectionId,
                propertyCollectionId: options?.propertyCollectionId,
                hasChildren: options?.hasChildren,
                showFileCount: options?.showFileCount,
                noteCount: options?.noteCount
            });
        };

        if (activeVisibleTagTree.size === 0) {
            if (settings.showAllTagsFolder) {
                const folderId = TAGS_ROOT_VIRTUAL_FOLDER_ID;
                addVirtualFolder(folderId, strings.tagList.tags, resolveUXIcon(settings.interfaceIcons, 'nav-tags'), {
                    tagCollectionId: TAGGED_TAG_ID,
                    hasChildren: shouldIncludeUntagged,
                    showFileCount: settings.showNoteCount,
                    noteCount: taggedCollectionCount
                });

                if (expansionState.expandedVirtualFolders.has(folderId) && shouldIncludeUntagged) {
                    pushUntaggedNode(1);
                }

                const tagsFolderHasChildren = shouldIncludeUntagged;
                return {
                    tagItems: items,
                    tagsVirtualFolderHasChildren: tagsFolderHasChildren
                };
            }

            if (shouldIncludeUntagged) {
                pushUntaggedNode(0);
                return { tagItems: items, tagsVirtualFolderHasChildren: true };
            }

            return { tagItems: items, tagsVirtualFolderHasChildren: false };
        }

        const hasTagCollectionContent = activeTaggedCount > 0;
        const hasContent = hasVisibleTags || shouldIncludeUntagged || hasTagCollectionContent;
        const tagsFolderHasChildren = hasVisibleTags || shouldIncludeUntagged;

        const appendTagNode = (node: TagTreeNode, level: number) => {
            const tagEntries = flattenTagTree([node], expansionState.expandedTags, level, {
                hiddenMatcher: matcherForMarking,
                comparator: effectiveRootTagComparator,
                childSortOrderOverrides: settings.tagTreeSortOverrides
            });
            items.push(...tagEntries);
        };

        if (settings.showAllTagsFolder) {
            if (hasContent) {
                const folderId = TAGS_ROOT_VIRTUAL_FOLDER_ID;
                addVirtualFolder(folderId, strings.tagList.tags, resolveUXIcon(settings.interfaceIcons, 'nav-tags'), {
                    tagCollectionId: TAGGED_TAG_ID,
                    hasChildren: tagsFolderHasChildren,
                    showFileCount: settings.showNoteCount,
                    noteCount: taggedCollectionCount
                });

                if (expansionState.expandedVirtualFolders.has(folderId)) {
                    activeResolvedRootTagKeys.forEach(key => {
                        if (activeHiddenRootTagNodes.has(key) && !showHiddenItems) {
                            return;
                        }
                        if (key === UNTAGGED_TAG_ID) {
                            pushUntaggedNode(1);
                            return;
                        }
                        const node = rootNodeMap.get(key);
                        if (!node) {
                            return;
                        }
                        appendTagNode(node, 1);
                    });
                }
            }
        } else {
            activeResolvedRootTagKeys.forEach(key => {
                if (activeHiddenRootTagNodes.has(key) && !showHiddenItems) {
                    return;
                }
                if (key === UNTAGGED_TAG_ID) {
                    pushUntaggedNode(0);
                    return;
                }
                const node = rootNodeMap.get(key);
                if (!node) {
                    return;
                }
                appendTagNode(node, 0);
            });
        }

        return { tagItems: items, tagsVirtualFolderHasChildren: tagsFolderHasChildren };
    }, [
        effectiveRootTagComparator,
        expansionState.expandedTags,
        expansionState.expandedVirtualFolders,
        includeDescendantNotes,
        renderTagTree,
        renderRootTagOrdering,
        scopedTagSectionSource,
        settings.interfaceIcons,
        settings.showAllTagsFolder,
        settings.showNoteCount,
        settings.showTags,
        settings.showUntagged,
        settings.tagTreeSortOverrides,
        showHiddenItems,
        sourceState.hiddenMatcherHasRules,
        sourceState.hiddenRootTagNodes,
        sourceState.hiddenTagMatcher,
        sourceState.untaggedCount,
        sourceState.visibleTaggedCount
    ]);

    const globalVisiblePropertyTree = useMemo(() => {
        if (!settings.showProperties) {
            return new Map<string, PropertyTreeNode>();
        }

        const visibleTree = new Map<string, PropertyTreeNode>();
        sourceState.propertyTree.forEach((node, key) => {
            if (!sourceState.visiblePropertyNavigationKeySet.has(node.key)) {
                return;
            }
            visibleTree.set(key, node);
        });
        return visibleTree;
    }, [settings.showProperties, sourceState.propertyTree, sourceState.visiblePropertyNavigationKeySet]);

    const isScopedPropertyContextActive = useMemo(() => {
        if (!settings.showProperties || !settings.scopePropertiesToCurrentContext) {
            return false;
        }

        if (selectionScope.selectionType === ItemType.FOLDER) {
            return Boolean(selectionScope.selectedFolder);
        }

        if (selectionScope.selectionType === ItemType.TAG) {
            return Boolean(selectionScope.selectedTag);
        }

        return false;
    }, [
        selectionScope.selectedFolder,
        selectionScope.selectedTag,
        selectionScope.selectionType,
        settings.scopePropertiesToCurrentContext,
        settings.showProperties
    ]);
    const scopedPropertyTagSelectionVersion =
        selectionScope.selectionType === ItemType.TAG ||
        (selectionScope.selectionType === ItemType.FOLDER && !showHiddenItems && sourceState.hiddenFileTags.length > 0)
            ? sourceState.tagDataVersion
            : 0;
    const scopedPropertyTagTree = selectionScope.selectionType === ItemType.TAG ? sourceState.tagTree : null;

    const scopedPropertySectionSource = useMemo((): ScopedPropertySectionSource | null => {
        void sourceState.fileChangeVersion;
        void sourceState.propertyDataVersion;
        void scopedPropertyTagSelectionVersion;
        void scopedPropertyTagTree;
        void sourceState.metadataVisibilityVersion;

        if (!isScopedPropertyContextActive) {
            return null;
        }

        const db = getDBInstanceOrNull();
        if (!db) {
            return null;
        }

        const scopedFiles = getFilesForNavigationSelection(
            selectionScope,
            settings,
            { includeDescendantNotes, showHiddenItems },
            app,
            tagTreeService,
            propertyTreeService,
            { orderResults: false }
        );
        const scopedMarkdownPaths = scopedFiles.filter(file => file.extension === 'md').map(file => file.path);

        if (sourceState.visiblePropertyNavigationKeySet.size === 0) {
            return {
                propertyTree: new Map<string, PropertyTreeNode>()
            };
        }

        return {
            propertyTree: buildPropertyTreeFromFilePaths(db, scopedMarkdownPaths, {
                includedPropertyKeys: sourceState.visiblePropertyNavigationKeySet
            })
        };
    }, [
        app,
        includeDescendantNotes,
        isScopedPropertyContextActive,
        propertyTreeService,
        selectionScope,
        settings,
        showHiddenItems,
        sourceState.fileChangeVersion,
        sourceState.metadataVisibilityVersion,
        sourceState.propertyDataVersion,
        sourceState.visiblePropertyNavigationKeySet,
        scopedPropertyTagSelectionVersion,
        scopedPropertyTagTree,
        tagTreeService
    ]);

    const renderPropertyTree = useMemo(() => {
        if (!settings.showProperties) {
            return new Map<string, PropertyTreeNode>();
        }
        return scopedPropertySectionSource?.propertyTree ?? globalVisiblePropertyTree;
    }, [globalVisiblePropertyTree, scopedPropertySectionSource, settings.showProperties]);

    const effectiveRootPropertyComparator = useMemo(
        () =>
            getEffectiveRootPropertyComparator({
                propertyKeyComparator: sourceState.propertyKeyComparator,
                rootPropertyOrderMap: sourceState.rootPropertyOrderMap
            }),
        [sourceState.propertyKeyComparator, sourceState.rootPropertyOrderMap]
    );

    const globalRootPropertyOrdering = useMemo(() => {
        if (!settings.showProperties) {
            return {
                rootNodeMap: new Map<string, PropertyTreeNode>(),
                resolvedRootPropertyKeys: []
            };
        }

        return resolveRootPropertyOrdering({
            propertyTree: globalVisiblePropertyTree,
            comparator: effectiveRootPropertyComparator
        });
    }, [effectiveRootPropertyComparator, globalVisiblePropertyTree, settings.showProperties]);

    const renderRootPropertyOrdering = useMemo(() => {
        if (!scopedPropertySectionSource) {
            return globalRootPropertyOrdering;
        }

        return resolveRootPropertyOrdering({
            propertyTree: renderPropertyTree,
            comparator: effectiveRootPropertyComparator
        });
    }, [effectiveRootPropertyComparator, globalRootPropertyOrdering, renderPropertyTree, scopedPropertySectionSource]);

    const rootOrderingPropertyTree = useMemo(() => globalRootPropertyOrdering.rootNodeMap, [globalRootPropertyOrdering.rootNodeMap]);
    const resolvedRootPropertyKeys = useMemo(
        () => globalRootPropertyOrdering.resolvedRootPropertyKeys,
        [globalRootPropertyOrdering.resolvedRootPropertyKeys]
    );

    const propertySectionBase = useMemo((): {
        propertiesSectionActive: boolean;
        keyNodes: PropertyTreeNode[];
        collectionCount: NoteCountInfo | undefined;
    } => {
        if (!settings.showProperties) {
            return {
                propertiesSectionActive: false,
                keyNodes: [],
                collectionCount: undefined
            };
        }

        const keyNodes = renderRootPropertyOrdering.resolvedRootPropertyKeys
            .map(key => renderRootPropertyOrdering.rootNodeMap.get(key) ?? null)
            .filter((node): node is PropertyTreeNode => node !== null);

        let collectionCount: NoteCountInfo | undefined;
        const shouldShowRootFolder = settings.showAllPropertiesFolder;
        const shouldComputeCollectionCount = settings.showNoteCount && (shouldShowRootFolder || sourceState.hasRootPropertyShortcut);

        if (shouldComputeCollectionCount) {
            if (!includeDescendantNotes || keyNodes.length === 0) {
                collectionCount = { current: 0, descendants: 0, total: 0 };
            } else {
                const propertyCollectionFiles = new Set<string>();
                keyNodes.forEach(node => {
                    node.notesWithValue.forEach(path => propertyCollectionFiles.add(path));
                });
                const total = propertyCollectionFiles.size;
                collectionCount = { current: total, descendants: 0, total };
            }
        }

        return {
            propertiesSectionActive: true,
            keyNodes,
            collectionCount
        };
    }, [
        includeDescendantNotes,
        renderRootPropertyOrdering,
        settings.showAllPropertiesFolder,
        settings.showNoteCount,
        settings.showProperties,
        sourceState.hasRootPropertyShortcut
    ]);

    const { propertyItems, propertiesSectionActive } = useMemo((): {
        propertyItems: CombinedNavigationItem[];
        propertiesSectionActive: boolean;
    } => {
        if (!propertySectionBase.propertiesSectionActive) {
            return {
                propertyItems: [],
                propertiesSectionActive: false
            };
        }

        const rootId = PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
        const keyNodes = propertySectionBase.keyNodes;
        const collectionCount = propertySectionBase.collectionCount;
        const shouldShowRootFolder = settings.showAllPropertiesFolder;
        const rootLevel = shouldShowRootFolder ? 1 : 0;
        const childLevel = rootLevel + 1;

        const items: CombinedNavigationItem[] = [];

        if (shouldShowRootFolder) {
            items.push({
                type: NavigationPaneItemType.VIRTUAL_FOLDER,
                data: {
                    id: rootId,
                    name: strings.navigationPane.properties,
                    icon: resolveUXIcon(settings.interfaceIcons, 'nav-properties')
                },
                level: 0,
                key: rootId,
                isSelectable: true,
                propertyCollectionId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
                hasChildren: keyNodes.length > 0,
                showFileCount: settings.showNoteCount,
                noteCount: collectionCount
            });

            if (!expansionState.expandedVirtualFolders.has(rootId)) {
                return { propertyItems: items, propertiesSectionActive: true };
            }
        }

        const sortChildren = (keyNode: PropertyTreeNode, children: Iterable<PropertyTreeNode>): PropertyTreeNode[] => {
            const nodes = Array.from(children);
            if (nodes.length <= 1) {
                return nodes;
            }

            const propertyTreeSortOverrides = settings.propertyTreeSortOverrides;
            const hasChildSortOverride = Boolean(
                propertyTreeSortOverrides && Object.prototype.hasOwnProperty.call(propertyTreeSortOverrides, keyNode.id)
            );
            const childSortOverride = hasChildSortOverride ? propertyTreeSortOverrides?.[keyNode.id] : undefined;
            const comparator = createPropertyComparator({
                order: childSortOverride ?? settings.propertySortOrder,
                compareAlphabetically: comparePropertyValueNodesAlphabetically,
                getFrequency: node =>
                    includeDescendantNotes && node.valuePath ? getTotalPropertyNoteCount(keyNode, node.valuePath) : node.notesWithValue.size
            });

            return nodes.sort(comparator);
        };

        keyNodes.forEach(keyNode => {
            items.push({
                type: NavigationPaneItemType.PROPERTY_KEY,
                data: keyNode,
                level: rootLevel,
                key: keyNode.id
            });

            if (expansionState.expandedProperties.has(keyNode.id) && keyNode.children.size > 0) {
                sortChildren(keyNode, keyNode.children.values()).forEach(child => {
                    items.push({
                        type: NavigationPaneItemType.PROPERTY_VALUE,
                        data: child,
                        level: childLevel,
                        key: child.id
                    });
                });
            }
        });

        return { propertyItems: items, propertiesSectionActive: true };
    }, [
        expansionState.expandedProperties,
        expansionState.expandedVirtualFolders,
        includeDescendantNotes,
        propertySectionBase.collectionCount,
        propertySectionBase.keyNodes,
        propertySectionBase.propertiesSectionActive,
        settings.interfaceIcons,
        settings.propertySortOrder,
        settings.propertyTreeSortOverrides,
        settings.showAllPropertiesFolder,
        settings.showNoteCount
    ]);

    return {
        folderItems,
        tagItems,
        renderTagTree,
        renderedRootTagKeys,
        rootOrderingTagTree,
        resolvedRootTagKeys,
        tagsVirtualFolderHasChildren,
        renderPropertyTree,
        rootOrderingPropertyTree,
        propertyItems,
        propertiesSectionActive,
        resolvedRootPropertyKeys,
        propertyCollectionCount: propertySectionBase.collectionCount
    };
}
