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
import { type App, type TFolder } from 'obsidian';
import type { NotebookNavigatorSettings } from '../settings/types';
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
import { getPathBaseName } from '../utils/pathUtils';
import type { ActiveProfileState } from '../context/SettingsContext';
import { shouldExcludeFolder } from '../utils/fileFilters';
import { createHiddenTagMatcher, matchesHiddenTagPattern } from '../utils/tagPrefixMatcher';
import { NOTEBOOK_NAVIGATOR_ICON_ID } from '../constants/notebookNavigatorIcon';
import { resolveUXIcon } from '../utils/uxIcons';
import { resolveFolderDisplayName } from '../utils/folderDisplayName';
import { buildPropertyKeyNodeId } from '../utils/propertyTree';

export interface RootFolderDescriptor {
    key: string;
    folder: TFolder | null;
    isVault?: boolean;
    isMissing?: boolean;
}

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
const REMOVE_MISSING_LABEL = strings.common.remove;

export interface UseNavigationRootReorderOptions {
    app: App;
    items: CombinedNavigationItem[];
    settings: NotebookNavigatorSettings;
    showHiddenItems: boolean;
    updateSettings: (updater: (settings: NotebookNavigatorSettings) => void) => Promise<void>;
    sectionOrder: NavigationSectionId[];
    setSectionOrder: React.Dispatch<React.SetStateAction<NavigationSectionId[]>>;
    rootLevelFolders: TFolder[];
    missingRootFolderPaths: string[];
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
    reorderableRootFolders: RootFolderDescriptor[];
    reorderableRootTags: RootTagDescriptor[];
    reorderableRootProperties: RootPropertyDescriptor[];
    sectionReorderItems: SectionReorderRenderItem[];
    folderReorderItems: RootReorderRenderItem[];
    tagReorderItems: RootReorderRenderItem[];
    propertyReorderItems: RootReorderRenderItem[];
    canReorderSections: boolean;
    canReorderRootFolders: boolean;
    canReorderRootTags: boolean;
    canReorderRootProperties: boolean;
    canReorderRootItems: boolean;
    showRootFolderSection: boolean;
    showRootTagSection: boolean;
    showRootPropertySection: boolean;
    resetRootTagOrderLabel: string;
    resetRootPropertyOrderLabel: string;
    vaultRootDescriptor: RootFolderDescriptor | undefined;
    handleResetRootFolderOrder: () => Promise<void>;
    handleResetRootTagOrder: () => Promise<void>;
    handleResetRootPropertyOrder: () => Promise<void>;
    reorderSectionOrder: (orderedKeys: NavigationSectionId[]) => Promise<void>;
    reorderRootFolderOrder: (orderedKeys: string[]) => Promise<void>;
    reorderRootTagOrder: (orderedKeys: string[]) => Promise<void>;
    reorderRootPropertyOrder: (orderedKeys: string[]) => Promise<void>;
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
        rootLevelFolders,
        missingRootFolderPaths,
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
        rootFolderOrder,
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
    const hiddenTagMatcher = useMemo(() => createHiddenTagMatcher(hiddenTags), [hiddenTags]);
    const hasHiddenTagRules = useMemo(() => {
        return (
            hiddenTagMatcher.pathPatterns.length > 0 ||
            hiddenTagMatcher.prefixes.length > 0 ||
            hiddenTagMatcher.startsWithNames.length > 0 ||
            hiddenTagMatcher.endsWithNames.length > 0
        );
    }, [hiddenTagMatcher]);

    const rootFolderDescriptors = useMemo<RootFolderDescriptor[]>(() => {
        const descriptors: RootFolderDescriptor[] = [];
        if (showRootFolder) {
            const vaultRoot = app.vault.getRoot();
            descriptors.push({ key: vaultRoot.path, folder: vaultRoot, isVault: true });
        }

        const folderMap = new Map<string, TFolder>();
        rootLevelFolders.forEach(folder => {
            folderMap.set(folder.path, folder);
        });

        const missingSet = new Set(missingRootFolderPaths);
        const orderedPaths = rootFolderOrder.length > 0 ? rootFolderOrder : rootLevelFolders.map(folder => folder.path);
        const seen = new Set<string>();

        orderedPaths.forEach(path => {
            if (seen.has(path)) {
                return;
            }
            seen.add(path);
            const existing = folderMap.get(path);
            if (existing) {
                descriptors.push({ key: path, folder: existing });
            } else if (missingSet.has(path)) {
                descriptors.push({ key: path, folder: null, isMissing: true });
            }
        });

        rootLevelFolders.forEach(folder => {
            if (!seen.has(folder.path)) {
                descriptors.push({ key: folder.path, folder });
            }
        });

        return descriptors;
    }, [app.vault, missingRootFolderPaths, rootFolderOrder, rootLevelFolders, showRootFolder]);

    const resetRootTagOrderLabel = useMemo(() => {
        if (tagSortOrder === 'frequency-asc' || tagSortOrder === 'frequency-desc') {
            return strings.navigationPane.resetRootToFrequency;
        }
        return strings.navigationPane.resetRootToAlpha;
    }, [tagSortOrder]);

    const resetRootPropertyOrderLabel = useMemo(() => {
        if (propertySortOrder === 'frequency-asc' || propertySortOrder === 'frequency-desc') {
            return strings.navigationPane.resetRootToFrequency;
        }
        return strings.navigationPane.resetRootToAlpha;
    }, [propertySortOrder]);

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

    const reorderableRootFolders = useMemo<RootFolderDescriptor[]>(() => {
        return rootFolderDescriptors.filter(entry => {
            if (entry.isVault) {
                return false;
            }
            if (!showHiddenItems) {
                const folderName = entry.folder ? entry.folder.name : getPathBaseName(entry.key);
                if (hiddenFolders.length > 0 && shouldExcludeFolder(folderName, hiddenFolders, entry.key)) {
                    return false;
                }
            }
            return true;
        });
    }, [hiddenFolders, rootFolderDescriptors, showHiddenItems]);

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
                return reorderableRootFolders.length > 0;
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
        reorderableRootFolders.length,
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

    const canReorderRootFolders = reorderableRootFolders.length > 1;
    const canReorderRootTags = reorderableRootTags.length > 1;
    const canReorderRootProperties = reorderableRootProperties.length > 1;
    const canReorderRootItems = canReorderSections || canReorderRootFolders || canReorderRootTags || canReorderRootProperties;
    const showRootFolderSection = reorderableRootFolders.length > 0;
    const showRootTagSection = reorderableRootTags.length > 0;
    const showRootPropertySection = reorderableRootProperties.length > 0;

    const rootItemMaps = useMemo(() => {
        const folderIconMap = new Map<string, string | undefined>();
        const folderColorMap = new Map<string, string | undefined>();
        const folderDisplayNameMap = new Map<string, string | undefined>();
        const tagIconMap = new Map<string, string | undefined>();
        const tagColorMap = new Map<string, string | undefined>();
        const propertyIconMap = new Map<string, string | undefined>();
        const propertyColorMap = new Map<string, string | undefined>();

        items.forEach(item => {
            if (item.type === NavigationPaneItemType.FOLDER) {
                const path = item.data.path;
                folderIconMap.set(path, item.icon);
                folderColorMap.set(path, item.color);
                folderDisplayNameMap.set(path, item.displayName);
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
            rootFolderDisplayNameMap: folderDisplayNameMap,
            rootTagIconMap: tagIconMap,
            rootTagColorMap: tagColorMap,
            rootPropertyIconMap: propertyIconMap,
            rootPropertyColorMap: propertyColorMap
        };
    }, [items]);

    const {
        rootFolderIconMap,
        rootFolderColorMap,
        rootFolderDisplayNameMap,
        rootTagIconMap,
        rootTagColorMap,
        rootPropertyIconMap,
        rootPropertyColorMap
    } = rootItemMaps;
    const vaultRootDescriptor = useMemo(() => rootFolderDescriptors.find(entry => entry.isVault), [rootFolderDescriptors]);

    const handleRootOrderChange = useCallback(
        async (orderedPaths: string[]) => {
            const normalizedOrder = orderedPaths.slice();
            if (areStringArraysEqual(normalizedOrder, rootFolderOrder)) {
                return;
            }
            await updateSettings(current => {
                current.rootFolderOrder = normalizedOrder;
            });
        },
        [rootFolderOrder, updateSettings]
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

    const reorderRootFolderOrder = useCallback(
        async (orderedKeys: string[]) => {
            await handleRootOrderChange(orderedKeys);
        },
        [handleRootOrderChange]
    );

    const reorderRootTagOrder = useCallback(
        async (orderedKeys: string[]) => {
            await handleRootTagOrderChange(orderedKeys);
        },
        [handleRootTagOrderChange]
    );

    const reorderRootPropertyOrder = useCallback(
        async (orderedKeys: string[]) => {
            await handleRootPropertyOrderChange(orderedKeys);
        },
        [handleRootPropertyOrderChange]
    );

    const handleRemoveMissingRootFolder = useCallback(
        async (path: string) => {
            if (!path) {
                return;
            }
            await updateSettings(current => {
                if (!Array.isArray(current.rootFolderOrder)) {
                    current.rootFolderOrder = [];
                    return;
                }
                if (!current.rootFolderOrder.includes(path)) {
                    return;
                }
                current.rootFolderOrder = current.rootFolderOrder.filter(entry => entry !== path);
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
                {REMOVE_MISSING_LABEL}
            </span>
        );
    }, []);

    const folderReorderItems = useMemo<RootReorderRenderItem[]>(() => {
        return reorderableRootFolders.map(entry => {
            const isMissing = entry.isMissing === true;
            const baseName = entry.folder ? entry.folder.name : getPathBaseName(entry.key);
            const isHidden = hiddenFolders.length > 0 && shouldExcludeFolder(baseName, hiddenFolders, entry.key);
            const displayLabel =
                entry.folder === null
                    ? getPathBaseName(entry.key)
                    : rootFolderDisplayNameMap.get(entry.key) ||
                      resolveFolderDisplayName({
                          app,
                          metadataService,
                          settings: { customVaultName },
                          folderPath: entry.key,
                          fallbackName: entry.folder.name
                      });
            // Hidden roots are not present in navigation maps, so read icon data directly from metadata
            const iconName = rootFolderIconMap.get(entry.key) ?? (isMissing ? undefined : metadataService.getFolderIcon(entry.key));
            const iconColor = rootFolderColorMap.get(entry.key) ?? (isMissing ? undefined : metadataService.getFolderColor(entry.key));

            let displayIcon = resolveUXIcon(settings.interfaceIcons, 'nav-folder-closed');
            if (isMissing) {
                displayIcon = 'lucide-folder-off';
            } else if (iconName) {
                displayIcon = iconName;
            }

            const removeAction = isMissing ? buildRemoveMissingAction(entry.key, handleRemoveMissingRootFolder) : undefined;

            return {
                key: entry.key,
                props: {
                    icon: displayIcon,
                    color: iconColor,
                    label: displayLabel,
                    level: 1,
                    dragHandlers: undefined,
                    isDragSource: false,
                    isMissing,
                    itemType: 'folder',
                    className: showHiddenItems && isHidden ? 'nn-excluded' : undefined,
                    trailingAccessory: removeAction
                }
            };
        });
    }, [
        app,
        reorderableRootFolders,
        rootFolderIconMap,
        rootFolderColorMap,
        rootFolderDisplayNameMap,
        metadataService,
        settings.interfaceIcons,
        customVaultName,
        buildRemoveMissingAction,
        handleRemoveMissingRootFolder,
        hiddenFolders,
        showHiddenItems
    ]);

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

    const sectionReorderItems = useMemo<SectionReorderRenderItem[]>(() => {
        return sectionDisplayOrder.map(identifier => {
            const isHidden =
                (identifier === NavigationSectionId.SHORTCUTS && !showShortcuts) ||
                (identifier === NavigationSectionId.RECENT && !showRecentNotes) ||
                (identifier === NavigationSectionId.FOLDERS && rootFolderDescriptors.length === 0) ||
                (identifier === NavigationSectionId.TAGS && !showTags) ||
                (identifier === NavigationSectionId.PROPERTIES && !propertiesSectionActive);
            let icon = 'lucide-circle';
            let label = '';
            let chevronIcon: string | undefined;
            let onClick: ((event: React.MouseEvent<HTMLDivElement>) => void) | undefined;
            let color: string | undefined;

            if (identifier === NavigationSectionId.SHORTCUTS) {
                icon = resolveUXIcon(settings.interfaceIcons, 'nav-shortcuts');
                label = strings.navigationPane.shortcutsHeader;
            } else if (identifier === NavigationSectionId.RECENT) {
                icon = resolveUXIcon(settings.interfaceIcons, 'nav-recent-files');
                label = strings.navigationPane.recentFilesHeader;
            } else if (identifier === NavigationSectionId.FOLDERS) {
                if (vaultRootDescriptor) {
                    const vaultIcon = rootFolderIconMap.get(vaultRootDescriptor.key);
                    color = rootFolderColorMap.get(vaultRootDescriptor.key);
                    if (vaultIcon) {
                        icon = vaultIcon;
                    } else {
                        icon = foldersSectionExpanded ? 'open-vault' : 'vault';
                    }
                    label = resolveFolderDisplayName({
                        app,
                        metadataService,
                        settings: { customVaultName },
                        folderPath: vaultRootDescriptor.key,
                        fallbackName: vaultRootDescriptor.folder?.name ?? app.vault.getRoot().name
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
        rootFolderDescriptors.length,
        vaultRootDescriptor,
        rootFolderIconMap,
        rootFolderColorMap,
        customVaultName,
        app,
        metadataService,
        settings.interfaceIcons,
        foldersSectionExpanded,
        tagsSectionExpanded,
        handleToggleFoldersSection,
        handleToggleTagsSection,
        propertiesSectionExpanded,
        handleTogglePropertiesSection
    ]);

    const handleResetRootFolderOrder = useCallback(async () => {
        await updateSettings(current => {
            current.rootFolderOrder = [];
        });
    }, [updateSettings]);

    const handleResetRootTagOrder = useCallback(async () => {
        await updateSettings(current => {
            current.rootTagOrder = [];
        });
    }, [updateSettings]);

    const handleResetRootPropertyOrder = useCallback(async () => {
        await updateSettings(current => {
            current.rootPropertyOrder = [];
        });
    }, [updateSettings]);

    return {
        reorderableRootFolders,
        reorderableRootTags,
        reorderableRootProperties,
        sectionReorderItems,
        folderReorderItems,
        tagReorderItems,
        propertyReorderItems,
        canReorderSections,
        canReorderRootFolders,
        canReorderRootTags,
        canReorderRootProperties,
        canReorderRootItems,
        showRootFolderSection,
        showRootTagSection,
        showRootPropertySection,
        resetRootTagOrderLabel,
        resetRootPropertyOrderLabel,
        vaultRootDescriptor,
        handleResetRootFolderOrder,
        handleResetRootTagOrder,
        handleResetRootPropertyOrder,
        reorderSectionOrder,
        reorderRootFolderOrder,
        reorderRootTagOrder,
        reorderRootPropertyOrder
    };
}
