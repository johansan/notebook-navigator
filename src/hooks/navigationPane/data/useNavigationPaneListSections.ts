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
import { TFile, type App } from 'obsidian';
import type { ShortcutsContextValue } from '../../../context/ShortcutsContext';
import { strings } from '../../../i18n';
import type { NotebookNavigatorSettings } from '../../../settings/types';
import {
    NavigationPaneItemType,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    RECENT_NOTES_VIRTUAL_FOLDER_ID,
    SHORTCUTS_VIRTUAL_FOLDER_ID
} from '../../../types';
import type { TagTreeNode } from '../../../types/storage';
import { isFolderShortcut, isNoteShortcut, isPropertyShortcut, isSearchShortcut, isTagShortcut } from '../../../types/shortcuts';
import type { CombinedNavigationItem } from '../../../types/virtualization';
import { isFolderInExcludedFolder, shouldExcludeFileName, shouldExcludeFileWithMatcher } from '../../../utils/fileFilters';
import { getDBInstance } from '../../../storage/fileOperations';
import { getVirtualTagCollection, isVirtualTagCollectionId } from '../../../utils/virtualTagCollections';
import { createHiddenTagVisibility, matchesHiddenTagPattern } from '../../../utils/tagPrefixMatcher';
import { findTagNode } from '../../../utils/tagTree';
import { getCachedFileTags, resolveCanonicalTagPath } from '../../../utils/tagUtils';
import { parsePropertyNodeId, resolvePropertyShortcutNodeId, resolvePropertyTreeNode } from '../../../utils/propertyTree';
import { resolveUXIcon } from '../../../utils/uxIcons';
import type { NavigationPaneSourceState } from './useNavigationPaneSourceState';

export interface UseNavigationPaneListSectionsParams {
    app: App;
    settings: NotebookNavigatorSettings;
    sourceState: NavigationPaneSourceState;
    hydratedShortcuts: ShortcutsContextValue['hydratedShortcuts'];
    recentNotes: string[];
    shortcutsExpanded: boolean;
    recentNotesExpanded: boolean;
    pinShortcuts: boolean;
    propertiesSectionActive: boolean;
}

export interface NavigationPaneListSectionsResult {
    shortcutItems: CombinedNavigationItem[];
    recentNotesItems: CombinedNavigationItem[];
    shouldPinRecentNotes: boolean;
}

export function useNavigationPaneListSections({
    app,
    settings,
    sourceState,
    hydratedShortcuts,
    recentNotes,
    shortcutsExpanded,
    recentNotesExpanded,
    pinShortcuts,
    propertiesSectionActive
}: UseNavigationPaneListSectionsParams): NavigationPaneListSectionsResult {
    const {
        hiddenFileNames,
        hiddenFilePropertyMatcher,
        hiddenFileTags,
        hiddenFolders,
        hiddenMatcherHasRules,
        hiddenTagMatcher,
        metadataVisibilityVersion,
        propertyTree,
        recentNotesHiddenFileMatcher,
        tagDataVersion,
        tagTreeForOrdering
    } = sourceState;

    const shortcutItems = useMemo((): CombinedNavigationItem[] => {
        void metadataVisibilityVersion;
        void tagDataVersion;

        if (!settings.showShortcuts) {
            return [];
        }

        const headerLevel = 0;
        const itemLevel = headerLevel + 1;

        const fileVisibilityCache = new Map<string, boolean>();
        const tagVisibilityCache = new Map<string, boolean>();
        const hiddenFileTagVisibility = createHiddenTagVisibility(hiddenFileTags, false);
        const shouldFilterHiddenFileTags = hiddenFileTagVisibility.hasHiddenRules;
        const db = shouldFilterHiddenFileTags ? getDBInstance() : null;

        const items: CombinedNavigationItem[] = [
            {
                type: NavigationPaneItemType.VIRTUAL_FOLDER,
                key: SHORTCUTS_VIRTUAL_FOLDER_ID,
                level: headerLevel,
                data: {
                    id: SHORTCUTS_VIRTUAL_FOLDER_ID,
                    name: strings.navigationPane.shortcutsHeader,
                    icon: resolveUXIcon(settings.interfaceIcons, 'nav-shortcuts')
                },
                hasChildren: hydratedShortcuts.length > 0
            }
        ];

        if (!shortcutsExpanded) {
            return items;
        }

        const isFileVisibleWhenHiddenItemsOff = (path: string): boolean => {
            if (fileVisibilityCache.has(path)) {
                return fileVisibilityCache.get(path) ?? false;
            }

            const abstractFile = app.vault.getAbstractFileByPath(path);
            if (!(abstractFile instanceof TFile)) {
                fileVisibilityCache.set(path, false);
                return false;
            }

            if (abstractFile.extension !== 'md') {
                fileVisibilityCache.set(path, false);
                return false;
            }

            if (hiddenFilePropertyMatcher.hasCriteria && shouldExcludeFileWithMatcher(abstractFile, hiddenFilePropertyMatcher, app)) {
                fileVisibilityCache.set(path, false);
                return false;
            }

            if (hiddenFileNames.length > 0 && shouldExcludeFileName(abstractFile, hiddenFileNames)) {
                fileVisibilityCache.set(path, false);
                return false;
            }

            if (
                shouldFilterHiddenFileTags &&
                getCachedFileTags({ app, file: abstractFile, db }).some(tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue))
            ) {
                fileVisibilityCache.set(path, false);
                return false;
            }

            if (hiddenFolders.length > 0 && abstractFile.parent !== null && isFolderInExcludedFolder(abstractFile.parent, hiddenFolders)) {
                fileVisibilityCache.set(path, false);
                return false;
            }

            fileVisibilityCache.set(path, true);
            return true;
        };

        const isTagVisibleWhenHiddenItemsOff = (tagPath: string): boolean => {
            if (tagVisibilityCache.has(tagPath)) {
                return tagVisibilityCache.get(tagPath) ?? false;
            }

            if (isVirtualTagCollectionId(tagPath)) {
                tagVisibilityCache.set(tagPath, true);
                return true;
            }

            const rootNode = findTagNode(tagTreeForOrdering, tagPath);
            if (!rootNode) {
                tagVisibilityCache.set(tagPath, false);
                return false;
            }

            const stack: TagTreeNode[] = [rootNode];
            const visited = new Set<TagTreeNode>();

            while (stack.length > 0) {
                const current = stack.pop();
                if (!current) {
                    continue;
                }
                if (visited.has(current)) {
                    continue;
                }
                visited.add(current);

                if (
                    hiddenMatcherHasRules &&
                    !isVirtualTagCollectionId(current.path) &&
                    matchesHiddenTagPattern(current.path, current.name, hiddenTagMatcher)
                ) {
                    continue;
                }

                for (const filePath of current.notesWithTag) {
                    if (isFileVisibleWhenHiddenItemsOff(filePath)) {
                        tagVisibilityCache.set(tagPath, true);
                        return true;
                    }
                }

                for (const child of current.children.values()) {
                    stack.push(child);
                }
            }

            tagVisibilityCache.set(tagPath, false);
            return false;
        };

        hydratedShortcuts.forEach(entry => {
            const { key, shortcut, folder, note, search, tagPath, propertyNodeId } = entry;

            if (isFolderShortcut(shortcut)) {
                if (!folder) {
                    items.push({
                        type: NavigationPaneItemType.SHORTCUT_FOLDER,
                        key,
                        level: itemLevel,
                        shortcut,
                        folder: null,
                        isMissing: true,
                        missingLabel: shortcut.path
                    });
                    return;
                }

                const isExcluded = hiddenFolders.length > 0 && isFolderInExcludedFolder(folder, hiddenFolders);
                items.push({
                    type: NavigationPaneItemType.SHORTCUT_FOLDER,
                    key,
                    level: itemLevel,
                    shortcut,
                    folder,
                    isExcluded
                });
                return;
            }

            if (isNoteShortcut(shortcut)) {
                if (!note) {
                    items.push({
                        type: NavigationPaneItemType.SHORTCUT_NOTE,
                        key,
                        level: itemLevel,
                        shortcut,
                        note: null,
                        isMissing: true,
                        missingLabel: shortcut.path
                    });
                    return;
                }
                const isExcluded =
                    (note.extension === 'md' &&
                        hiddenFilePropertyMatcher.hasCriteria &&
                        shouldExcludeFileWithMatcher(note, hiddenFilePropertyMatcher, app)) ||
                    (note.extension === 'md' &&
                        shouldFilterHiddenFileTags &&
                        getCachedFileTags({ app, file: note, db }).some(tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue))) ||
                    (hiddenFileNames.length > 0 && shouldExcludeFileName(note, hiddenFileNames)) ||
                    (hiddenFolders.length > 0 && note.parent !== null && isFolderInExcludedFolder(note.parent, hiddenFolders));
                items.push({
                    type: NavigationPaneItemType.SHORTCUT_NOTE,
                    key,
                    level: itemLevel,
                    shortcut,
                    note,
                    isExcluded
                });
                return;
            }

            if (isSearchShortcut(shortcut)) {
                items.push({
                    type: NavigationPaneItemType.SHORTCUT_SEARCH,
                    key,
                    level: itemLevel,
                    shortcut,
                    searchShortcut: search ?? shortcut
                });
                return;
            }

            if (isTagShortcut(shortcut)) {
                const resolvedPath = tagPath ?? shortcut.tagPath;
                if (!resolvedPath) {
                    return;
                }

                const canonicalPath = resolveCanonicalTagPath(resolvedPath, tagTreeForOrdering);
                if (!canonicalPath) {
                    return;
                }

                const tagNode = findTagNode(tagTreeForOrdering, canonicalPath);
                let displayPath = tagNode?.displayPath ?? resolvedPath;
                let isMissing = !tagNode;
                const isExcluded = !isTagVisibleWhenHiddenItemsOff(canonicalPath);

                if (isVirtualTagCollectionId(canonicalPath)) {
                    displayPath = getVirtualTagCollection(canonicalPath).getLabel();
                    isMissing = false;
                }

                items.push({
                    type: NavigationPaneItemType.SHORTCUT_TAG,
                    key,
                    level: itemLevel,
                    shortcut,
                    tagPath: canonicalPath,
                    displayName: displayPath,
                    isMissing,
                    isExcluded,
                    missingLabel: isMissing ? resolvedPath : undefined
                });
                return;
            }

            if (isPropertyShortcut(shortcut)) {
                const rawNodeId = propertyNodeId ?? shortcut.nodeId;
                const resolvedNodeId = resolvePropertyShortcutNodeId(propertyNodeId, shortcut.nodeId);
                if (resolvedNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                    const isMissing = !propertiesSectionActive;
                    items.push({
                        type: NavigationPaneItemType.SHORTCUT_PROPERTY,
                        key,
                        level: itemLevel,
                        shortcut,
                        propertyNodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
                        displayName: strings.navigationPane.properties,
                        isMissing,
                        missingLabel: isMissing ? strings.navigationPane.properties : undefined
                    });
                    return;
                }
                const parsed = resolvedNodeId ? parsePropertyNodeId(resolvedNodeId) : null;
                if (!resolvedNodeId || !parsed) {
                    items.push({
                        type: NavigationPaneItemType.SHORTCUT_PROPERTY,
                        key,
                        level: itemLevel,
                        shortcut,
                        propertyNodeId: rawNodeId,
                        displayName: rawNodeId,
                        isMissing: true,
                        missingLabel: rawNodeId
                    });
                    return;
                }

                const resolvedNode = resolvePropertyTreeNode({
                    nodeId: resolvedNodeId,
                    propertyTree
                });
                if (!resolvedNode) {
                    const keyNode = propertyTree.get(parsed.key);
                    if (!keyNode) {
                        const valueLabel = parsed.valuePath?.trim();
                        const missingLabel = valueLabel && valueLabel.length > 0 ? valueLabel : parsed.key;
                        items.push({
                            type: NavigationPaneItemType.SHORTCUT_PROPERTY,
                            key,
                            level: itemLevel,
                            shortcut,
                            propertyNodeId: resolvedNodeId,
                            displayName: missingLabel,
                            isMissing: true,
                            missingLabel
                        });
                        return;
                    }

                    const valueLabel = parsed.valuePath?.trim();
                    const missingLabel = valueLabel && valueLabel.length > 0 ? valueLabel : keyNode.name;
                    items.push({
                        type: NavigationPaneItemType.SHORTCUT_PROPERTY,
                        key,
                        level: itemLevel,
                        shortcut,
                        propertyNodeId: resolvedNodeId,
                        displayName: missingLabel,
                        isMissing: true,
                        missingLabel
                    });
                    return;
                }

                const propertyNode = resolvedNode.node;
                items.push({
                    type: NavigationPaneItemType.SHORTCUT_PROPERTY,
                    key,
                    level: itemLevel,
                    shortcut,
                    propertyNodeId: propertyNode.id,
                    displayName: propertyNode.name
                });
            }
        });

        return items;
    }, [
        app,
        hiddenFileNames,
        hiddenFilePropertyMatcher,
        hiddenFileTags,
        hiddenFolders,
        hiddenMatcherHasRules,
        hiddenTagMatcher,
        hydratedShortcuts,
        metadataVisibilityVersion,
        propertyTree,
        propertiesSectionActive,
        settings.interfaceIcons,
        settings.showShortcuts,
        shortcutsExpanded,
        tagDataVersion,
        tagTreeForOrdering
    ]);

    const recentNotesItems = useMemo((): CombinedNavigationItem[] => {
        void metadataVisibilityVersion;
        void tagDataVersion;

        if (!settings.showRecentNotes) {
            return [];
        }

        const headerLevel = 0;
        const itemLevel = headerLevel + 1;
        const limit = Math.max(1, settings.recentNotesCount ?? 1);
        const recentPaths = recentNotes.slice(0, limit);
        // Notes listed under shortcuts are left out of recent files. Stored entries are kept, so a note shows here
        // again when its shortcut is removed. Opens of shortcut notes are not recorded (RecentNotesService).
        const shortcutNotePaths = new Set<string>();
        if (settings.showShortcuts) {
            hydratedShortcuts.forEach(({ shortcut, note }) => {
                if (isNoteShortcut(shortcut) && note) {
                    shortcutNotePaths.add(note.path);
                }
            });
        }
        const getVisibleRecentFile = (path: string): TFile | null => {
            const file = app.vault.getAbstractFileByPath(path);
            if (!(file instanceof TFile) || shortcutNotePaths.has(file.path)) {
                return null;
            }

            return recentNotesHiddenFileMatcher(file) ? null : file;
        };

        const recentHeaderName = strings.navigationPane.recentFilesHeader;

        if (!recentNotesExpanded) {
            let hasChildren = false;
            for (const path of recentPaths) {
                if (getVisibleRecentFile(path)) {
                    hasChildren = true;
                    break;
                }
            }
            return [
                {
                    type: NavigationPaneItemType.VIRTUAL_FOLDER,
                    key: RECENT_NOTES_VIRTUAL_FOLDER_ID,
                    level: headerLevel,
                    data: {
                        id: RECENT_NOTES_VIRTUAL_FOLDER_ID,
                        name: recentHeaderName,
                        icon: resolveUXIcon(settings.interfaceIcons, 'nav-recent-files')
                    },
                    hasChildren
                }
            ];
        }

        const childItems: CombinedNavigationItem[] = [];
        recentPaths.forEach(path => {
            const file = getVisibleRecentFile(path);
            if (file) {
                childItems.push({
                    type: NavigationPaneItemType.RECENT_NOTE,
                    key: `recent-${path}`,
                    level: itemLevel,
                    note: file
                });
            }
        });

        const items: CombinedNavigationItem[] = [
            {
                type: NavigationPaneItemType.VIRTUAL_FOLDER,
                key: RECENT_NOTES_VIRTUAL_FOLDER_ID,
                level: headerLevel,
                data: {
                    id: RECENT_NOTES_VIRTUAL_FOLDER_ID,
                    name: recentHeaderName,
                    icon: resolveUXIcon(settings.interfaceIcons, 'nav-recent-files')
                },
                hasChildren: childItems.length > 0
            }
        ];

        if (childItems.length === 0) {
            return items;
        }

        items.push(...childItems);
        return items;
    }, [
        app,
        hydratedShortcuts,
        metadataVisibilityVersion,
        recentNotes,
        recentNotesExpanded,
        recentNotesHiddenFileMatcher,
        settings.interfaceIcons,
        settings.recentNotesCount,
        settings.showRecentNotes,
        settings.showShortcuts,
        tagDataVersion
    ]);

    const shouldPinRecentNotes = pinShortcuts && settings.pinRecentNotesWithShortcuts && settings.showRecentNotes;

    return {
        shortcutItems,
        recentNotesItems,
        shouldPinRecentNotes
    };
}
