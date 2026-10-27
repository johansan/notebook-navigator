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
import { Menu, TFolder, type App } from 'obsidian';
import type { AlphaSortOrder, NotebookNavigatorSettings, TagSortOrder } from '../settings/types';
import type { PropertyTreeNode, TagTreeNode } from '../types/storage';
import type { CombinedNavigationItem } from '../types/virtualization';
import { NavigationPaneItemType, UNTAGGED_TAG_ID, STORAGE_KEYS, NavigationSectionId } from '../types';
import { strings } from '../i18n';
import type { MetadataService } from '../services/MetadataService';
import { localStorage } from '../utils/localStorage';
import { areStringArraysEqual } from '../utils/arrayUtils';
import { RootFolderReorderItem } from '../components/RootFolderReorderItem';
import { runAsyncAction } from '../utils/async';
import { mergeNavigationSectionOrder, sanitizeNavigationSectionOrder } from '../utils/navigationSections';
import type { ActiveProfileState } from '../context/SettingsContext';
import { shouldExcludeFolder } from '../utils/fileFilters';
import { createHiddenTagMatcher, matchesHiddenTagPattern } from '../utils/tagPrefixMatcher';
import { NOTEBOOK_NAVIGATOR_ICON_ID } from '../constants/notebookNavigatorIcon';
import { resolveUXIcon } from '../utils/uxIcons';
import { resolveFolderDisplayName } from '../utils/folderDisplayName';
import { buildPropertyKeyNodeId, buildPropertyValueNodeIdFromKeyNodeId, getTotalPropertyNoteCount } from '../utils/propertyTree';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { getChildOrder, getTagChildName, mergeDisplayedOrder, sortFolderSiblings } from '../utils/treeFlattener';
import { findTagNode } from '../utils/tagTree';
import { compareByAlphaSortOrder } from '../utils/sortUtils';
import {
    comparePropertyValueNodesAlphabetically,
    compareTagAlphabetically,
    createPropertyComparator,
    type TagComparator
} from './navigationPane/data/navigationComparators';
import { sanitizeRecord } from '../utils/recordUtils';
import { getChildFolderPath } from '../utils/pathUtils';
import { resolveFolderDecorationColors, type FolderDecorationModel } from '../utils/folderDecoration';
import { ObsidianIcon } from '../components/ObsidianIcon';

export type ReorderTreeType = 'folder' | 'tag' | 'property';

/**
 * A row in a reorder mode tree. `key` identifies the row and is the parent key of its children: a folder path, a
 * tag path, or a property node id. `name` is what the parent's stored order holds: a folder name, a root tag path
 * or nested tag name, or a property key or value path. A missing row is a stored name with nothing behind it.
 */
export interface ReorderTreeNode {
    key: string;
    name: string;
    parentPath: string;
    hasChildren: boolean;
    props: React.ComponentProps<typeof RootFolderReorderItem>;
}

/** One category's tree in reorder mode */
export interface ReorderTreeSource {
    type: ReorderTreeType;
    getChildren: (parentPath: string) => ReorderTreeNode[];
    /** The navigation tree's expanded rows, shared so the expand/collapse all button works in reorder mode */
    expanded: ReadonlySet<string>;
    onToggle: (key: string) => void;
    canReorder: boolean;
}

type ChildOrderSettingsKey = 'folderChildOrder' | 'tagChildOrder' | 'propertyChildOrder';

export interface RootTagDescriptor {
    key: string;
    tag: TagTreeNode | null;
    isMissing?: boolean;
    isVirtualRoot?: boolean;
    isUntagged?: boolean;
}

export interface RootPropertyDescriptor {
    key: string;
    node: PropertyTreeNode | null;
    isMissing?: boolean;
}

export type RootReorderRenderItem = {
    key: string;
    props: React.ComponentProps<typeof RootFolderReorderItem>;
};

export type SectionReorderRenderItem = RootReorderRenderItem & {
    sectionId: NavigationSectionId;
};

const TAGS_VIRTUAL_REORDER_KEY = '__nn-tags-root__';
export interface UseNavigationRootReorderOptions {
    app: App;
    items: CombinedNavigationItem[];
    settings: NotebookNavigatorSettings;
    showHiddenItems: boolean;
    updateSettings: (updater: (settings: NotebookNavigatorSettings) => void) => Promise<void>;
    sectionOrder: NavigationSectionId[];
    setSectionOrder: React.Dispatch<React.SetStateAction<NavigationSectionId[]>>;
    getFolderSortName: (folder: TFolder) => string;
    folderDecorationModel: FolderDecorationModel;
    tagComparator: TagComparator | undefined;
    resolvedRootTagKeys: string[];
    rootOrderingTagTree: Map<string, TagTreeNode>;
    missingRootTagPaths: string[];
    resolvedRootPropertyKeys: string[];
    rootOrderingPropertyTree: Map<string, PropertyTreeNode>;
    missingRootPropertyKeys: string[];
    metadataService: MetadataService;
    foldersSectionExpanded: boolean;
    tagsSectionExpanded: boolean;
    propertiesSectionExpanded: boolean;
    propertiesSectionActive: boolean;
    handleToggleFoldersSection: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleToggleTagsSection: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleTogglePropertiesSection: (event: React.MouseEvent<HTMLDivElement>) => void;
    activeProfile: ActiveProfileState;
}

export interface NavigationRootReorderState {
    reorderableRootTags: RootTagDescriptor[];
    reorderableRootProperties: RootPropertyDescriptor[];
    sectionReorderItems: SectionReorderRenderItem[];
    getFolderReorderChildren: (parentPath: string) => ReorderTreeNode[];
    getTagReorderChildren: (parentPath: string) => ReorderTreeNode[];
    getPropertyReorderChildren: (parentKey: string) => ReorderTreeNode[];
    canReorderSections: boolean;
    canReorderFolders: boolean;
    canReorderTags: boolean;
    canReorderProperties: boolean;
    canReorderRootItems: boolean;
    showRootFolderSection: boolean;
    showRootTagSection: boolean;
    showRootPropertySection: boolean;
    handleResetFolderOrder: () => Promise<void>;
    handleResetTagOrder: () => Promise<void>;
    handleResetPropertyOrder: () => Promise<void>;
    reorderSectionOrder: (orderedKeys: NavigationSectionId[]) => Promise<void>;
    reorderTreeChildren: (type: ReorderTreeType, parentPath: string, orderedNames: string[]) => Promise<void>;
}

function getOwnOverride(overrides: Record<string, AlphaSortOrder>, key: string): AlphaSortOrder | undefined {
    return Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : undefined;
}

function getSortLabel(order: TagSortOrder, options: { alphaAsc: string; alphaDesc: string; lowToHigh: string; highToLow: string }): string {
    switch (order) {
        case 'alpha-desc':
            return options.alphaDesc;
        case 'frequency-asc':
            return options.lowToHigh;
        case 'frequency-desc':
            return options.highToLow;
        default:
            return options.alphaAsc;
    }
}

/**
 * Builds a parent's rows: stored names in stored order, with stored names whose child is missing as missing rows,
 * then the displayed children the order does not list, in tree order. Stored names of children that exist but are
 * not displayed (hidden) are skipped. The panel calls the row builders while rendering, so rows always reflect the
 * current vault and trees.
 */
function orderChildRows<T>(params: {
    storedOrder: readonly string[];
    displayed: readonly T[];
    allChildNames: ReadonlySet<string>;
    getName: (child: T) => string;
    buildRow: (child: T) => ReorderTreeNode;
    buildMissingRow: (name: string) => ReorderTreeNode;
}): ReorderTreeNode[] {
    const { storedOrder, displayed, allChildNames, getName, buildRow, buildMissingRow } = params;
    const storedNames = new Set(storedOrder);
    const displayedByName = new Map(displayed.map(child => [getName(child), child]));
    const rows: ReorderTreeNode[] = [];
    storedOrder.forEach(name => {
        const child = displayedByName.get(name);
        if (child !== undefined) {
            rows.push(buildRow(child));
        } else if (!allChildNames.has(name)) {
            rows.push(buildMissingRow(name));
        }
    });
    displayed.forEach(child => {
        if (!storedNames.has(getName(child))) {
            rows.push(buildRow(child));
        }
    });
    return rows;
}

export function useNavigationRootReorder(options: UseNavigationRootReorderOptions): NavigationRootReorderState {
    const {
        app,
        items,
        settings,
        showHiddenItems,
        updateSettings,
        sectionOrder,
        setSectionOrder,
        getFolderSortName,
        folderDecorationModel,
        tagComparator,
        resolvedRootTagKeys,
        rootOrderingTagTree,
        missingRootTagPaths,
        resolvedRootPropertyKeys,
        rootOrderingPropertyTree,
        missingRootPropertyKeys,
        metadataService,
        foldersSectionExpanded,
        tagsSectionExpanded,
        propertiesSectionExpanded,
        propertiesSectionActive,
        handleToggleFoldersSection,
        handleToggleTagsSection,
        handleTogglePropertiesSection,
        activeProfile
    } = options;

    const {
        showRootFolder,
        folderChildOrder,
        folderSortOrder,
        folderTreeSortOverrides,
        tagChildOrder,
        tagTreeSortOverrides,
        propertyChildOrder,
        propertyTreeSortOverrides,
        rootTagOrder,
        rootPropertyOrder,
        showUntagged,
        tagSortOrder,
        propertySortOrder,
        showShortcuts,
        showRecentNotes,
        showTags,
        customVaultName
    } = settings;

    const { hiddenFolders, hiddenTags } = activeProfile;
    const { includeDescendantNotes } = useUXPreferences();
    const hiddenTagMatcher = useMemo(() => createHiddenTagMatcher(hiddenTags), [hiddenTags]);
    const hasHiddenTagRules = useMemo(() => {
        return (
            hiddenTagMatcher.pathPatterns.length > 0 ||
            hiddenTagMatcher.prefixes.length > 0 ||
            hiddenTagMatcher.startsWithNames.length > 0 ||
            hiddenTagMatcher.endsWithNames.length > 0
        );
    }, [hiddenTagMatcher]);

    const rootTagDescriptors = useMemo<RootTagDescriptor[]>(() => {
        const descriptors: RootTagDescriptor[] = [];
        const tagMap = new Map<string, TagTreeNode>();
        rootOrderingTagTree.forEach((node, key) => {
            tagMap.set(key, node);
        });

        const seen = new Set<string>();
        const addDescriptor = (descriptor: RootTagDescriptor) => {
            if (seen.has(descriptor.key)) {
                return;
            }
            seen.add(descriptor.key);
            descriptors.push(descriptor);
        };

        if (tagMap.size > 0) {
            addDescriptor({ key: TAGS_VIRTUAL_REORDER_KEY, tag: null, isVirtualRoot: true });
        }

        resolvedRootTagKeys.forEach(key => {
            if (key === UNTAGGED_TAG_ID) {
                if (showUntagged) {
                    addDescriptor({ key: UNTAGGED_TAG_ID, tag: null, isUntagged: true });
                }
                return;
            }
            const node = tagMap.get(key);
            if (node) {
                addDescriptor({ key: node.path, tag: node });
            }
        });

        rootTagOrder.forEach(path => {
            if (path === UNTAGGED_TAG_ID) {
                return;
            }
            if (seen.has(path)) {
                return;
            }
            if (!tagMap.has(path)) {
                addDescriptor({ key: path, tag: null, isMissing: true });
            }
        });

        missingRootTagPaths.forEach(path => {
            if (path === UNTAGGED_TAG_ID) {
                return;
            }
            if (!seen.has(path)) {
                addDescriptor({ key: path, tag: null, isMissing: true });
            }
        });

        return descriptors;
    }, [missingRootTagPaths, resolvedRootTagKeys, rootOrderingTagTree, rootTagOrder, showUntagged]);

    const rootPropertyDescriptors = useMemo<RootPropertyDescriptor[]>(() => {
        const descriptors: RootPropertyDescriptor[] = [];
        const nodeMap = new Map<string, PropertyTreeNode>();
        rootOrderingPropertyTree.forEach((node, key) => {
            nodeMap.set(key, node);
        });

        const seen = new Set<string>();
        const addDescriptor = (descriptor: RootPropertyDescriptor) => {
            if (seen.has(descriptor.key)) {
                return;
            }
            seen.add(descriptor.key);
            descriptors.push(descriptor);
        };

        resolvedRootPropertyKeys.forEach(key => {
            const node = nodeMap.get(key);
            if (node) {
                addDescriptor({ key: node.key, node });
            }
        });

        rootPropertyOrder.forEach(key => {
            if (seen.has(key)) {
                return;
            }
            if (!nodeMap.has(key)) {
                addDescriptor({ key, node: null, isMissing: true });
            }
        });

        missingRootPropertyKeys.forEach(key => {
            if (!seen.has(key)) {
                addDescriptor({ key, node: null, isMissing: true });
            }
        });

        return descriptors;
    }, [missingRootPropertyKeys, resolvedRootPropertyKeys, rootOrderingPropertyTree, rootPropertyOrder]);

    const isFolderDisplayed = useCallback(
        (folder: TFolder): boolean => {
            return showHiddenItems || hiddenFolders.length === 0 || !shouldExcludeFolder(folder.name, hiddenFolders, folder.path);
        },
        [hiddenFolders, showHiddenItems]
    );

    // Folder availability is read from the vault, not from expanded reorder rows, so collapsing the
    // branch that holds the only reorderable siblings does not close reorder mode
    const vaultRoot = app.vault.getRoot();
    const hasRootFolders = vaultRoot.children.some(child => child instanceof TFolder) || getChildOrder(folderChildOrder, '/').length > 0;
    const canReorderFolders = useMemo(() => {
        // The navigation items change with every folder create, delete and rename, so availability is
        // recomputed from the vault when the folder structure changes
        void items;
        return app.vault.getAllFolders(true).some(folder => {
            let displayedChildCount = 0;
            return folder.children.some(child => {
                if (child instanceof TFolder && isFolderDisplayed(child)) {
                    displayedChildCount += 1;
                }
                return displayedChildCount > 1;
            });
        });
    }, [app.vault, isFolderDisplayed, items]);

    const reorderableRootTags = useMemo<RootTagDescriptor[]>(() => {
        return rootTagDescriptors.filter(entry => {
            if (entry.isVirtualRoot) {
                return false;
            }
            if (!showHiddenItems) {
                if (hasHiddenTagRules && entry.tag && matchesHiddenTagPattern(entry.tag.path, entry.tag.name, hiddenTagMatcher)) {
                    return false;
                }
            }
            return true;
        });
    }, [hasHiddenTagRules, hiddenTagMatcher, rootTagDescriptors, showHiddenItems]);

    const reorderableRootProperties = useMemo<RootPropertyDescriptor[]>(() => {
        return rootPropertyDescriptors.slice();
    }, [rootPropertyDescriptors]);

    const sectionOrderWithDefaults = useMemo<NavigationSectionId[]>(() => {
        return sanitizeNavigationSectionOrder(sectionOrder);
    }, [sectionOrder]);

    const sectionDisplayOrder = useMemo<NavigationSectionId[]>(() => {
        if (showHiddenItems) {
            return sectionOrderWithDefaults;
        }
        return sectionOrderWithDefaults.filter(identifier => {
            if (identifier === NavigationSectionId.SHORTCUTS) {
                return showShortcuts;
            }
            if (identifier === NavigationSectionId.RECENT) {
                return showRecentNotes;
            }
            if (identifier === NavigationSectionId.FOLDERS) {
                return hasRootFolders;
            }
            if (identifier === NavigationSectionId.TAGS) {
                return showTags && reorderableRootTags.length > 0;
            }
            if (identifier === NavigationSectionId.PROPERTIES) {
                return propertiesSectionActive;
            }
            return true;
        });
    }, [
        hasRootFolders,
        reorderableRootTags.length,
        propertiesSectionActive,
        sectionOrderWithDefaults,
        showHiddenItems,
        showRecentNotes,
        showShortcuts,
        showTags
    ]);

    const canReorderSections = sectionDisplayOrder.length > 1;

    const reorderSectionOrder = useCallback(
        async (orderedKeys: NavigationSectionId[]) => {
            const merged = mergeNavigationSectionOrder(orderedKeys, sectionOrderWithDefaults);
            if (areStringArraysEqual(merged, sectionOrderWithDefaults)) {
                return;
            }
            setSectionOrder(merged);
            localStorage.set(STORAGE_KEYS.navigationSectionOrderKey, merged);
        },
        [sectionOrderWithDefaults, setSectionOrder]
    );

    const showRootFolderSection = hasRootFolders;
    const showRootTagSection = reorderableRootTags.length > 0;
    const showRootPropertySection = reorderableRootProperties.length > 0;

    const rootItemMaps = useMemo(() => {
        const folderIconMap = new Map<string, string | undefined>();
        const folderColorMap = new Map<string, string | undefined>();
        const tagIconMap = new Map<string, string | undefined>();
        const tagColorMap = new Map<string, string | undefined>();
        const propertyIconMap = new Map<string, string | undefined>();
        const propertyColorMap = new Map<string, string | undefined>();

        items.forEach(item => {
            if (item.type === NavigationPaneItemType.FOLDER) {
                const path = item.data.path;
                folderIconMap.set(path, item.icon);
                folderColorMap.set(path, item.color);
                return;
            }
            if (item.type === NavigationPaneItemType.TAG) {
                const path = item.data.path;
                tagIconMap.set(path, item.icon);
                tagColorMap.set(path, item.color);
                return;
            }
            if (item.type === NavigationPaneItemType.PROPERTY_KEY) {
                const key = item.data.key;
                propertyIconMap.set(key, item.icon);
                propertyColorMap.set(key, item.color);
            }
        });

        return {
            rootFolderIconMap: folderIconMap,
            rootFolderColorMap: folderColorMap,
            rootTagIconMap: tagIconMap,
            rootTagColorMap: tagColorMap,
            rootPropertyIconMap: propertyIconMap,
            rootPropertyColorMap: propertyColorMap
        };
    }, [items]);

    const { rootFolderIconMap, rootFolderColorMap, rootTagIconMap, rootTagColorMap, rootPropertyIconMap, rootPropertyColorMap } =
        rootItemMaps;
    const reorderChildOrder = useCallback(
        async (settingsKey: ChildOrderSettingsKey, parentKey: string, orderedNames: string[]) => {
            const storedOrder = getChildOrder(settings[settingsKey], parentKey);
            const nextOrder = mergeDisplayedOrder(storedOrder, orderedNames);
            if (areStringArraysEqual(nextOrder, storedOrder)) {
                return;
            }
            await updateSettings(current => {
                const nextRecord = sanitizeRecord(current[settingsKey]);
                nextRecord[parentKey] = nextOrder;
                current[settingsKey] = nextRecord;
            });
        },
        [settings, updateSettings]
    );

    const handleRootTagOrderChange = useCallback(
        async (orderedPaths: string[]) => {
            const normalizedOrder = orderedPaths.slice();
            if (areStringArraysEqual(normalizedOrder, rootTagOrder)) {
                return;
            }
            await updateSettings(current => {
                current.rootTagOrder = normalizedOrder;
            });
        },
        [rootTagOrder, updateSettings]
    );

    const handleRootPropertyOrderChange = useCallback(
        async (orderedKeys: string[]) => {
            const normalizedOrder = orderedKeys.slice();
            if (areStringArraysEqual(normalizedOrder, rootPropertyOrder)) {
                return;
            }
            await updateSettings(current => {
                current.rootPropertyOrder = normalizedOrder;
            });
        },
        [rootPropertyOrder, updateSettings]
    );

    /** Writes a drop in any reorder tree; root tags and root property keys keep their own stored orders */
    const reorderTreeChildren = useCallback(
        async (type: ReorderTreeType, parentPath: string, orderedNames: string[]) => {
            if (type === 'folder') {
                await reorderChildOrder('folderChildOrder', parentPath, orderedNames);
            } else if (type === 'tag') {
                await (parentPath === '/'
                    ? handleRootTagOrderChange(orderedNames)
                    : reorderChildOrder('tagChildOrder', parentPath, orderedNames));
            } else {
                await (parentPath === '/'
                    ? handleRootPropertyOrderChange(orderedNames)
                    : reorderChildOrder('propertyChildOrder', parentPath, orderedNames));
            }
        },
        [handleRootPropertyOrderChange, handleRootTagOrderChange, reorderChildOrder]
    );

    const removeMissingChildName = useCallback(
        async (settingsKey: ChildOrderSettingsKey, parentKey: string, name: string) => {
            await updateSettings(current => {
                const storedOrder = getChildOrder(current[settingsKey], parentKey);
                if (!storedOrder.includes(name)) {
                    return;
                }
                const nextOrder = storedOrder.filter(entry => entry !== name);
                const nextRecord = sanitizeRecord(current[settingsKey]);
                if (nextOrder.length > 0) {
                    nextRecord[parentKey] = nextOrder;
                } else {
                    delete nextRecord[parentKey];
                }
                current[settingsKey] = nextRecord;
            });
        },
        [updateSettings]
    );

    const handleRemoveMissingRootTag = useCallback(
        async (path: string) => {
            if (!path) {
                return;
            }
            await updateSettings(current => {
                if (!Array.isArray(current.rootTagOrder)) {
                    current.rootTagOrder = [];
                    return;
                }
                if (!current.rootTagOrder.includes(path)) {
                    return;
                }
                current.rootTagOrder = current.rootTagOrder.filter(entry => entry !== path);
            });
        },
        [updateSettings]
    );

    const handleRemoveMissingRootProperty = useCallback(
        async (key: string) => {
            if (!key) {
                return;
            }
            await updateSettings(current => {
                if (!Array.isArray(current.rootPropertyOrder)) {
                    current.rootPropertyOrder = [];
                    return;
                }
                if (!current.rootPropertyOrder.includes(key)) {
                    return;
                }
                current.rootPropertyOrder = current.rootPropertyOrder.filter(entry => entry !== key);
            });
        },
        [updateSettings]
    );

    const buildRemoveMissingAction = useCallback((path: string, removeCallback: (targetPath: string) => Promise<void>) => {
        const invokeRemoval = () => {
            runAsyncAction(() => removeCallback(path));
        };
        return (
            <span
                role="button"
                tabIndex={0}
                className="nn-root-reorder-remove"
                onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    invokeRemoval();
                }}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        invokeRemoval();
                    }
                }}
            >
                {strings.common.remove}
            </span>
        );
    }, []);

    /**
     * Returns the reorder mode badge for a parent's child order: a numbered-list icon for a manual order, ↑ or ↓ for
     * an alphabetical override, nothing for the default order. A manual order wins over an override because it
     * decides the listed children; the override only sorts the unlisted rest. Shown with note counts, as the tree's
     * ↑/↓ is.
     */
    const renderSortBadge = useCallback(
        (childOrder: Record<string, string[]>, overrides: Record<string, AlphaSortOrder>, parentKey: string): React.ReactNode => {
            if (!settings.showNoteCount) {
                return undefined;
            }
            if (getChildOrder(childOrder, parentKey).length > 0) {
                return (
                    <span className="nn-navitem-count nn-root-reorder-manual-badge" aria-label={strings.paneHeader.manualSort}>
                        <ObsidianIcon name="lucide-list-ordered" />
                    </span>
                );
            }
            if (!Object.prototype.hasOwnProperty.call(overrides, parentKey)) {
                return undefined;
            }
            return <span className="nn-navitem-count">{overrides[parentKey] === 'alpha-desc' ? '↓' : '↑'}</span>;
        },
        [settings.showNoteCount]
    );

    /**
     * Returns a child sort menu handler for a row. Default, A to Z and Z to A go through the same service calls as
     * the tree's `Change sort order` menu, so they also clear the manual order. Manual sort only shows whether a
     * manual order is active, because dragging is the only way to set one.
     */
    const createSortContextMenu = useCallback(
        (params: {
            hasManualOrder: boolean;
            override: AlphaSortOrder | undefined;
            defaultLabel: string;
            onDefault: () => Promise<void>;
            onAlpha: (order: AlphaSortOrder) => Promise<void>;
        }): ((event: React.MouseEvent<HTMLDivElement>) => void) => {
            const { hasManualOrder, override, defaultLabel, onDefault, onAlpha } = params;
            return event => {
                event.preventDefault();
                event.stopPropagation();
                const menu = new Menu();
                menu.addItem(item => {
                    item.setTitle(`${strings.folderAppearance.defaultLabel} (${defaultLabel})`)
                        .setChecked(!hasManualOrder && !override)
                        .onClick(() => {
                            runAsyncAction(onDefault);
                        });
                });
                menu.addSeparator();
                // Alphabetical choices stay unchecked while a manual order decides the child order
                menu.addItem(item => {
                    item.setTitle(strings.settings.items.folderSortOrder.options.alphaAsc)
                        .setChecked(!hasManualOrder && override === 'alpha-asc')
                        .onClick(() => {
                            runAsyncAction(() => onAlpha('alpha-asc'));
                        });
                });
                menu.addItem(item => {
                    item.setTitle(strings.settings.items.folderSortOrder.options.alphaDesc)
                        .setChecked(!hasManualOrder && override === 'alpha-desc')
                        .onClick(() => {
                            runAsyncAction(() => onAlpha('alpha-desc'));
                        });
                });
                menu.addItem(item => {
                    item.setTitle(strings.paneHeader.manualSort).setChecked(hasManualOrder).setDisabled(!hasManualOrder);
                });
                menu.showAtMouseEvent(event.nativeEvent);
            };
        },
        []
    );

    const folderDefaultSortLabel =
        folderSortOrder === 'alpha-desc'
            ? strings.settings.items.folderSortOrder.options.alphaDesc
            : strings.settings.items.folderSortOrder.options.alphaAsc;
    const tagDefaultSortLabel = getSortLabel(tagSortOrder, strings.settings.items.tagSortOrder.options);
    const propertyDefaultSortLabel = getSortLabel(propertySortOrder, strings.settings.items.propertySortOrder.options);

    const getFolderReorderChildren = useCallback(
        (parentPath: string): ReorderTreeNode[] => {
            const parent = parentPath === '/' ? app.vault.getRoot() : app.vault.getFolderByPath(parentPath);
            const childFolders = parent ? parent.children.filter((child): child is TFolder => child instanceof TFolder) : [];
            // Root-level folders sit one level below the folders section header
            const level = parentPath === '/' ? 1 : parentPath.split('/').length + 1;

            const buildRow = (folder: TFolder): ReorderTreeNode => {
                const displayData = metadataService.getFolderDisplayData(folder.path);
                const { color } = resolveFolderDecorationColors({
                    model: folderDecorationModel,
                    folderPath: folder.path,
                    color: displayData.color,
                    backgroundColor: displayData.backgroundColor
                });
                const grandchildNames = new Set<string>();
                let hasChildren = false;
                folder.children.forEach(child => {
                    if (child instanceof TFolder) {
                        grandchildNames.add(child.name);
                        hasChildren = hasChildren || isFolderDisplayed(child);
                    }
                });
                // A stored name without a folder still renders as a missing row, so its parent must expand
                const hasManualOrder = getChildOrder(folderChildOrder, folder.path).length > 0;
                hasChildren = hasChildren || getChildOrder(folderChildOrder, folder.path).some(name => !grandchildNames.has(name));
                const isHidden = hiddenFolders.length > 0 && shouldExcludeFolder(folder.name, hiddenFolders, folder.path);

                return {
                    key: folder.path,
                    name: folder.name,
                    parentPath,
                    hasChildren,
                    props: {
                        icon: displayData.icon ?? resolveUXIcon(settings.interfaceIcons, 'nav-folder-closed'),
                        color,
                        label: displayData.displayName || folder.name,
                        level,
                        isMissing: false,
                        itemType: 'folder',
                        className: showHiddenItems && isHidden ? 'nn-excluded' : undefined,
                        countSlot: renderSortBadge(folderChildOrder, folderTreeSortOverrides, folder.path),
                        onContextMenu:
                            hasChildren || hasManualOrder
                                ? createSortContextMenu({
                                      hasManualOrder,
                                      override: getOwnOverride(folderTreeSortOverrides, folder.path),
                                      defaultLabel: folderDefaultSortLabel,
                                      onDefault: () => metadataService.removeFolderChildSortOrderOverride(folder.path),
                                      onAlpha: order => metadataService.setFolderChildSortOrderOverride(folder.path, order)
                                  })
                                : undefined
                    }
                };
            };

            const buildMissingRow = (name: string): ReorderTreeNode => {
                const key = getChildFolderPath(parentPath, name);
                return {
                    key,
                    name,
                    parentPath,
                    hasChildren: false,
                    props: {
                        icon: 'lucide-folder-off',
                        label: name,
                        level,
                        isMissing: true,
                        itemType: 'folder',
                        trailingAccessory: buildRemoveMissingAction(key, () => removeMissingChildName('folderChildOrder', parentPath, name))
                    }
                };
            };

            return orderChildRows({
                storedOrder: getChildOrder(folderChildOrder, parentPath),
                displayed: sortFolderSiblings(childFolders.filter(isFolderDisplayed), parentPath, {
                    childOrder: folderChildOrder,
                    defaultSortOrder: folderSortOrder,
                    childSortOrderOverrides: folderTreeSortOverrides,
                    getFolderSortName
                }),
                allChildNames: new Set(childFolders.map(folder => folder.name)),
                getName: folder => folder.name,
                buildRow,
                buildMissingRow
            });
        },
        [
            app.vault,
            buildRemoveMissingAction,
            createSortContextMenu,
            folderChildOrder,
            folderDecorationModel,
            folderDefaultSortLabel,
            folderSortOrder,
            folderTreeSortOverrides,
            getFolderSortName,
            hiddenFolders,
            isFolderDisplayed,
            metadataService,
            removeMissingChildName,
            renderSortBadge,
            settings.interfaceIcons,
            showHiddenItems
        ]
    );

    const tagReorderItems = useMemo<RootReorderRenderItem[]>(() => {
        return reorderableRootTags.map(entry => {
            const isUntagged = entry.isUntagged === true;
            const isMissing = entry.isMissing === true;
            const isHidden =
                !isUntagged && hasHiddenTagRules && entry.tag && matchesHiddenTagPattern(entry.tag.path, entry.tag.name, hiddenTagMatcher);

            let displayIcon: string;
            let label: string;
            if (isUntagged) {
                displayIcon = metadataService.getTagIcon(entry.key) ?? resolveUXIcon(settings.interfaceIcons, 'nav-tag');
                label = strings.tagList.untaggedLabel;
            } else {
                const iconFromTree = rootTagIconMap.get(entry.key);
                const metadataIcon = metadataService.getTagIcon(entry.key);
                displayIcon =
                    iconFromTree ?? metadataIcon ?? (isMissing ? 'lucide-tag-off' : resolveUXIcon(settings.interfaceIcons, 'nav-tag'));
                label = entry.tag ? `#${entry.tag.displayPath}` : `#${entry.key}`;
            }

            const metadataColor = isUntagged ? undefined : metadataService.getTagColor(entry.key);
            const iconColor = rootTagColorMap.get(entry.key) ?? metadataColor;
            const removeAction = isMissing ? buildRemoveMissingAction(entry.key, handleRemoveMissingRootTag) : undefined;

            return {
                key: entry.key,
                props: {
                    icon: displayIcon,
                    color: iconColor,
                    label,
                    level: 1,
                    dragHandlers: undefined,
                    isDragSource: false,
                    isMissing,
                    itemType: 'tag',
                    className: showHiddenItems && isHidden ? 'nn-excluded' : undefined,
                    trailingAccessory: removeAction
                }
            };
        });
    }, [
        reorderableRootTags,
        rootTagIconMap,
        rootTagColorMap,
        metadataService,
        settings.interfaceIcons,
        buildRemoveMissingAction,
        handleRemoveMissingRootTag,
        hasHiddenTagRules,
        hiddenTagMatcher,
        showHiddenItems
    ]);

    const propertyReorderItems = useMemo<RootReorderRenderItem[]>(() => {
        return reorderableRootProperties.map(entry => {
            const isMissing = entry.isMissing === true;
            const nodeId = entry.node?.id ?? buildPropertyKeyNodeId(entry.key);
            const iconFromTree = rootPropertyIconMap.get(entry.key);
            const colorFromTree = rootPropertyColorMap.get(entry.key);
            const iconFromMetadata = metadataService.getPropertyIcon(nodeId);
            const colorFromMetadata = metadataService.getPropertyColor(nodeId);
            const displayIcon = iconFromTree ?? iconFromMetadata ?? resolveUXIcon(settings.interfaceIcons, 'nav-property');
            const iconColor = colorFromTree ?? colorFromMetadata;
            const label = entry.node ? entry.node.name : entry.key;
            const removeAction = isMissing ? buildRemoveMissingAction(entry.key, handleRemoveMissingRootProperty) : undefined;

            return {
                key: entry.key,
                props: {
                    icon: displayIcon,
                    color: iconColor,
                    label,
                    level: 1,
                    dragHandlers: undefined,
                    isDragSource: false,
                    isMissing,
                    itemType: 'property',
                    trailingAccessory: removeAction
                }
            };
        });
    }, [
        reorderableRootProperties,
        rootPropertyIconMap,
        rootPropertyColorMap,
        metadataService,
        settings.interfaceIcons,
        buildRemoveMissingAction,
        handleRemoveMissingRootProperty
    ]);

    const isTagDisplayed = useCallback(
        (node: TagTreeNode): boolean =>
            showHiddenItems || !hasHiddenTagRules || !matchesHiddenTagPattern(node.path, node.name, hiddenTagMatcher),
        [hasHiddenTagRules, hiddenTagMatcher, showHiddenItems]
    );

    // A stored name without a child still renders as a missing row, so its parent must expand
    const tagHasChildren = useCallback(
        (node: TagTreeNode): boolean => {
            const childNames = new Set(Array.from(node.children.values()).map(child => getTagChildName(child.path)));
            return (
                Array.from(node.children.values()).some(isTagDisplayed) ||
                getChildOrder(tagChildOrder, node.path).some(name => !childNames.has(name))
            );
        },
        [isTagDisplayed, tagChildOrder]
    );

    const createTagSortMenu = useCallback(
        (tagPath: string) =>
            createSortContextMenu({
                hasManualOrder: getChildOrder(tagChildOrder, tagPath).length > 0,
                override: getOwnOverride(tagTreeSortOverrides, tagPath),
                defaultLabel: tagDefaultSortLabel,
                onDefault: () => metadataService.removeTagChildSortOrderOverride(tagPath),
                onAlpha: order => metadataService.setTagChildSortOrderOverride(tagPath, order)
            }),
        [createSortContextMenu, metadataService, tagChildOrder, tagDefaultSortLabel, tagTreeSortOverrides]
    );

    const getTagReorderChildren = useCallback(
        (parentPath: string): ReorderTreeNode[] => {
            if (parentPath === '/') {
                // Root rows follow the root tag order, which also holds Untagged and missing roots
                return reorderableRootTags.map((entry, index) => {
                    const node = entry.tag;
                    const hasChildren = node ? tagHasChildren(node) : false;
                    const hasManualOrder = getChildOrder(tagChildOrder, entry.key).length > 0;
                    return {
                        key: entry.key,
                        name: entry.key,
                        parentPath,
                        hasChildren,
                        props: {
                            ...tagReorderItems[index].props,
                            countSlot: node ? renderSortBadge(tagChildOrder, tagTreeSortOverrides, entry.key) : undefined,
                            onContextMenu: node && (hasChildren || hasManualOrder) ? createTagSortMenu(entry.key) : undefined
                        }
                    };
                });
            }

            const parent = findTagNode(rootOrderingTagTree, parentPath);
            const children = parent ? Array.from(parent.children.values()) : [];
            const override = getOwnOverride(tagTreeSortOverrides, parentPath);
            const compare: TagComparator = override
                ? (a, b) => compareByAlphaSortOrder(a.name, b.name, override)
                : (tagComparator ?? compareTagAlphabetically);
            const level = parentPath.split('/').length + 1;

            return orderChildRows({
                storedOrder: getChildOrder(tagChildOrder, parentPath),
                displayed: children.filter(isTagDisplayed).sort(compare),
                allChildNames: new Set(children.map(child => getTagChildName(child.path))),
                getName: child => getTagChildName(child.path),
                buildRow: node => {
                    const hasChildren = tagHasChildren(node);
                    const hasManualOrder = getChildOrder(tagChildOrder, node.path).length > 0;
                    const isHidden = hasHiddenTagRules && matchesHiddenTagPattern(node.path, node.name, hiddenTagMatcher);
                    return {
                        key: node.path,
                        name: getTagChildName(node.path),
                        parentPath,
                        hasChildren,
                        props: {
                            icon: metadataService.getTagIcon(node.path) ?? resolveUXIcon(settings.interfaceIcons, 'nav-tag'),
                            color: metadataService.getTagColor(node.path),
                            label: node.name,
                            level,
                            isMissing: false,
                            itemType: 'tag',
                            className: showHiddenItems && isHidden ? 'nn-excluded' : undefined,
                            countSlot: renderSortBadge(tagChildOrder, tagTreeSortOverrides, node.path),
                            onContextMenu: hasChildren || hasManualOrder ? createTagSortMenu(node.path) : undefined
                        }
                    };
                },
                buildMissingRow: name => {
                    const key = `${parentPath}/${name}`;
                    return {
                        key,
                        name,
                        parentPath,
                        hasChildren: false,
                        props: {
                            icon: 'lucide-tag-off',
                            label: name,
                            level,
                            isMissing: true,
                            itemType: 'tag',
                            trailingAccessory: buildRemoveMissingAction(key, () =>
                                removeMissingChildName('tagChildOrder', parentPath, name)
                            )
                        }
                    };
                }
            });
        },
        [
            buildRemoveMissingAction,
            createTagSortMenu,
            hasHiddenTagRules,
            hiddenTagMatcher,
            isTagDisplayed,
            metadataService,
            removeMissingChildName,
            renderSortBadge,
            reorderableRootTags,
            rootOrderingTagTree,
            settings.interfaceIcons,
            showHiddenItems,
            tagChildOrder,
            tagComparator,
            tagHasChildren,
            tagReorderItems,
            tagTreeSortOverrides
        ]
    );

    const createPropertySortMenu = useCallback(
        (keyNodeId: string) =>
            createSortContextMenu({
                hasManualOrder: getChildOrder(propertyChildOrder, keyNodeId).length > 0,
                override: getOwnOverride(propertyTreeSortOverrides, keyNodeId),
                defaultLabel: propertyDefaultSortLabel,
                onDefault: () => metadataService.removePropertyChildSortOrderOverride(keyNodeId),
                onAlpha: order => metadataService.setPropertyChildSortOrderOverride(keyNodeId, order)
            }),
        [createSortContextMenu, metadataService, propertyChildOrder, propertyDefaultSortLabel, propertyTreeSortOverrides]
    );

    const getPropertyReorderChildren = useCallback(
        (parentKey: string): ReorderTreeNode[] => {
            if (parentKey === '/') {
                // Root rows follow the root property order; a key row's children are keyed by its node id
                return reorderableRootProperties.map((entry, index) => {
                    const keyNode = entry.node;
                    const keyNodeId = keyNode?.id ?? buildPropertyKeyNodeId(entry.key);
                    const valueNames = new Set(keyNode ? Array.from(keyNode.children.values()).map(child => child.valuePath ?? '') : []);
                    const hasChildren =
                        keyNode !== null &&
                        (keyNode.children.size > 0 || getChildOrder(propertyChildOrder, keyNodeId).some(name => !valueNames.has(name)));
                    const hasManualOrder = getChildOrder(propertyChildOrder, keyNodeId).length > 0;
                    return {
                        key: keyNodeId,
                        name: entry.key,
                        parentPath: parentKey,
                        hasChildren,
                        props: {
                            ...propertyReorderItems[index].props,
                            countSlot: keyNode ? renderSortBadge(propertyChildOrder, propertyTreeSortOverrides, keyNodeId) : undefined,
                            onContextMenu: keyNode && (hasChildren || hasManualOrder) ? createPropertySortMenu(keyNodeId) : undefined
                        }
                    };
                });
            }

            const keyNode = Array.from(rootOrderingPropertyTree.values()).find(node => node.id === parentKey);
            const values = keyNode ? Array.from(keyNode.children.values()) : [];
            const compare = createPropertyComparator({
                order: getOwnOverride(propertyTreeSortOverrides, parentKey) ?? propertySortOrder,
                compareAlphabetically: comparePropertyValueNodesAlphabetically,
                // Same frequency as the navigation tree, so a drop keeps the unlisted values in the order shown there
                getFrequency: node =>
                    includeDescendantNotes && keyNode && node.valuePath
                        ? getTotalPropertyNoteCount(keyNode, node.valuePath)
                        : node.notesWithValue.size
            });

            return orderChildRows({
                storedOrder: getChildOrder(propertyChildOrder, parentKey),
                displayed: values.slice().sort(compare),
                allChildNames: new Set(values.map(value => value.valuePath ?? '')),
                getName: value => value.valuePath ?? '',
                buildRow: value => ({
                    key: value.id,
                    name: value.valuePath ?? '',
                    parentPath: parentKey,
                    hasChildren: false,
                    props: {
                        icon: metadataService.getPropertyIcon(value.id) ?? resolveUXIcon(settings.interfaceIcons, 'nav-property-value'),
                        color: metadataService.getPropertyColor(value.id),
                        label: value.name,
                        level: 2,
                        isMissing: false,
                        itemType: 'property'
                    }
                }),
                buildMissingRow: name => {
                    const key = buildPropertyValueNodeIdFromKeyNodeId(parentKey, name);
                    return {
                        key,
                        name,
                        parentPath: parentKey,
                        hasChildren: false,
                        props: {
                            icon: 'lucide-circle-off',
                            label: name,
                            level: 2,
                            isMissing: true,
                            itemType: 'property',
                            trailingAccessory: buildRemoveMissingAction(key, () =>
                                removeMissingChildName('propertyChildOrder', parentKey, name)
                            )
                        }
                    };
                }
            });
        },
        [
            buildRemoveMissingAction,
            createPropertySortMenu,
            metadataService,
            propertyChildOrder,
            propertyReorderItems,
            propertySortOrder,
            propertyTreeSortOverrides,
            removeMissingChildName,
            renderSortBadge,
            reorderableRootProperties,
            rootOrderingPropertyTree,
            settings.interfaceIcons,
            includeDescendantNotes
        ]
    );

    // Availability covers every level, read from the trees rather than expanded rows
    const canReorderTags = useMemo(() => {
        if (reorderableRootTags.length > 1) {
            return true;
        }
        const hasReorderableChildren = (node: TagTreeNode): boolean =>
            Array.from(node.children.values()).filter(isTagDisplayed).length > 1 ||
            Array.from(node.children.values()).some(child => isTagDisplayed(child) && hasReorderableChildren(child));
        return Array.from(rootOrderingTagTree.values()).some(node => isTagDisplayed(node) && hasReorderableChildren(node));
    }, [isTagDisplayed, reorderableRootTags.length, rootOrderingTagTree]);
    const canReorderProperties =
        reorderableRootProperties.length > 1 || Array.from(rootOrderingPropertyTree.values()).some(node => node.children.size > 1);
    const canReorderRootItems = canReorderSections || canReorderFolders || canReorderTags || canReorderProperties;

    const sectionReorderItems = useMemo<SectionReorderRenderItem[]>(() => {
        return sectionDisplayOrder.map(identifier => {
            const isHidden =
                (identifier === NavigationSectionId.SHORTCUTS && !showShortcuts) ||
                (identifier === NavigationSectionId.RECENT && !showRecentNotes) ||
                (identifier === NavigationSectionId.FOLDERS && !showRootFolder && !hasRootFolders) ||
                (identifier === NavigationSectionId.TAGS && !showTags) ||
                (identifier === NavigationSectionId.PROPERTIES && !propertiesSectionActive);
            let icon = 'lucide-circle';
            let label = '';
            let chevronIcon: string | undefined;
            let onClick: ((event: React.MouseEvent<HTMLDivElement>) => void) | undefined;
            let color: string | undefined;
            let countSlot: React.ReactNode;
            let onContextMenu: ((event: React.MouseEvent<HTMLDivElement>) => void) | undefined;

            if (identifier === NavigationSectionId.SHORTCUTS) {
                icon = resolveUXIcon(settings.interfaceIcons, 'nav-shortcuts');
                label = strings.navigationPane.shortcutsHeader;
            } else if (identifier === NavigationSectionId.RECENT) {
                icon = resolveUXIcon(settings.interfaceIcons, 'nav-recent-files');
                label = strings.navigationPane.recentFilesHeader;
            } else if (identifier === NavigationSectionId.FOLDERS) {
                if (showRootFolder) {
                    const vaultIcon = rootFolderIconMap.get(vaultRoot.path);
                    color = rootFolderColorMap.get(vaultRoot.path);
                    // The vault root row is the folders section header here, so it carries the root's sort indicator
                    countSlot = renderSortBadge(folderChildOrder, folderTreeSortOverrides, vaultRoot.path);
                    const hasManualRootOrder = getChildOrder(folderChildOrder, vaultRoot.path).length > 0;
                    onContextMenu =
                        hasRootFolders || hasManualRootOrder
                            ? createSortContextMenu({
                                  hasManualOrder: hasManualRootOrder,
                                  override: getOwnOverride(folderTreeSortOverrides, vaultRoot.path),
                                  defaultLabel: folderDefaultSortLabel,
                                  onDefault: () => metadataService.removeFolderChildSortOrderOverride(vaultRoot.path),
                                  onAlpha: order => metadataService.setFolderChildSortOrderOverride(vaultRoot.path, order)
                              })
                            : undefined;
                    if (vaultIcon) {
                        icon = vaultIcon;
                    } else {
                        icon = foldersSectionExpanded ? 'open-vault' : 'vault';
                    }
                    label = resolveFolderDisplayName({
                        app,
                        metadataService,
                        settings: { customVaultName },
                        folderPath: vaultRoot.path,
                        fallbackName: vaultRoot.name
                    });
                } else {
                    icon = NOTEBOOK_NAVIGATOR_ICON_ID;
                    label = strings.navigationPane.folders;
                }
                chevronIcon = foldersSectionExpanded ? 'lucide-chevron-down' : 'lucide-chevron-right';
                onClick = handleToggleFoldersSection;
            } else if (identifier === NavigationSectionId.TAGS) {
                icon = resolveUXIcon(settings.interfaceIcons, 'nav-tags');
                label = strings.navigationPane.tags;
                chevronIcon = tagsSectionExpanded ? 'lucide-chevron-down' : 'lucide-chevron-right';
                onClick = handleToggleTagsSection;
            } else if (identifier === NavigationSectionId.PROPERTIES) {
                icon = resolveUXIcon(settings.interfaceIcons, 'nav-properties');
                label = strings.navigationPane.properties;
                chevronIcon = propertiesSectionExpanded ? 'lucide-chevron-down' : 'lucide-chevron-right';
                onClick = handleTogglePropertiesSection;
            }

            return {
                key: identifier,
                sectionId: identifier,
                props: {
                    icon,
                    label,
                    level: 0,
                    dragHandlers: undefined,
                    isDragSource: false,
                    color,
                    onClick,
                    chevronIcon,
                    countSlot,
                    onContextMenu,
                    itemType: 'section',
                    className: isHidden ? 'nn-excluded' : undefined
                }
            };
        });
    }, [
        sectionDisplayOrder,
        showShortcuts,
        showRecentNotes,
        showTags,
        propertiesSectionActive,
        hasRootFolders,
        showRootFolder,
        vaultRoot,
        rootFolderIconMap,
        rootFolderColorMap,
        customVaultName,
        app,
        metadataService,
        settings,
        createSortContextMenu,
        folderChildOrder,
        folderDefaultSortLabel,
        folderTreeSortOverrides,
        renderSortBadge,
        foldersSectionExpanded,
        tagsSectionExpanded,
        handleToggleFoldersSection,
        handleToggleTagsSection,
        propertiesSectionExpanded,
        handleTogglePropertiesSection
    ]);

    // Clears the manual order of every folder level; a single folder resets from its context menu
    const handleResetFolderOrder = useCallback(async () => {
        await updateSettings(current => {
            current.folderChildOrder = sanitizeRecord<string[]>(undefined);
        });
    }, [updateSettings]);

    // Each category's reset clears every level: the root order and every nested manual order
    const handleResetTagOrder = useCallback(async () => {
        await updateSettings(current => {
            current.rootTagOrder = [];
            current.tagChildOrder = sanitizeRecord<string[]>(undefined);
        });
    }, [updateSettings]);

    const handleResetPropertyOrder = useCallback(async () => {
        await updateSettings(current => {
            current.rootPropertyOrder = [];
            current.propertyChildOrder = sanitizeRecord<string[]>(undefined);
        });
    }, [updateSettings]);

    return {
        reorderableRootTags,
        reorderableRootProperties,
        sectionReorderItems,
        getFolderReorderChildren,
        getTagReorderChildren,
        getPropertyReorderChildren,
        canReorderSections,
        canReorderFolders,
        canReorderTags,
        canReorderProperties,
        canReorderRootItems,
        showRootFolderSection,
        showRootTagSection,
        showRootPropertySection,
        handleResetFolderOrder,
        handleResetTagOrder,
        handleResetPropertyOrder,
        reorderSectionOrder,
        reorderTreeChildren
    };
}
