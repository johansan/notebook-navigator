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

import { useCallback, useMemo } from 'react';
import type { App } from 'obsidian';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { NoteCountInfo } from '../../types/noteCounts';
import { strings } from '../../i18n';
import type { FileVisibility } from '../../utils/fileTypeUtils';
import { getFolderNoteDetectionSettings } from '../../utils/folderNoteLookup';
import { calculateFolderNoteCounts } from '../../utils/noteCountUtils';
import { createTagNoteCountInfo, findTagNode } from '../../utils/tagTree';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../../types';
import { resolvePropertyTreeNode, getDirectPropertyKeyNoteCount, getTotalPropertyNoteCount } from '../../utils/propertyTree';
import { getPathBaseName } from '../../utils/pathUtils';
import { resolveCanonicalTagPath } from '../../utils/tagUtils';
import type { VirtualFolderTrailingAction } from '../../components/VirtualFolderItem';
import type { PropertyTreeService } from '../../services/PropertyTreeService';
import type { PropertyTreeNode, TagTreeNode } from '../../types/storage';

const ZERO_NOTE_COUNT: NoteCountInfo = { current: 0, descendants: 0, total: 0 };

interface UseNavigationPaneShortcutDisplayProps {
    app: App;
    settings: NotebookNavigatorSettings;
    includeDescendantNotes: boolean;
    showHiddenItems: boolean;
    fileVisibility: FileVisibility;
    noteCountDB: ReturnType<typeof import('../../storage/fileOperations').getDBInstanceOrNull>;
    hiddenFolders: string[];
    descendantExcludedFolders: string[];
    effectiveFrontmatterExclusions: string[];
    effectiveFrontmatterExclusionMatcher: ReturnType<typeof import('../../utils/fileFilters').createFrontmatterPropertyExclusionMatcher>;
    folderCountFileNameMatcher: ReturnType<typeof import('../../utils/fileFilters').createHiddenFileNameMatcherForVisibility>;
    hiddenFileTagVisibility: ReturnType<typeof import('../../utils/tagPrefixMatcher').createHiddenTagVisibility> | null;
    getFolderCounts: () => Map<string, NoteCountInfo>;
    getTagCounts: () => Map<string, NoteCountInfo>;
    getPropertyCounts: () => Map<string, NoteCountInfo>;
    tagTree: Map<string, TagTreeNode>;
    propertyTree: Map<string, PropertyTreeNode>;
    propertyTreeService: PropertyTreeService | null;
    onToggleShortcutsPin: () => void;
    isShortcutsPinned: boolean;
    onConfigurePropertyKeys: () => void;
}

export function useNavigationPaneShortcutDisplay({
    app,
    settings,
    includeDescendantNotes,
    showHiddenItems,
    fileVisibility,
    noteCountDB,
    hiddenFolders,
    descendantExcludedFolders,
    effectiveFrontmatterExclusions,
    effectiveFrontmatterExclusionMatcher,
    folderCountFileNameMatcher,
    hiddenFileTagVisibility,
    getFolderCounts,
    getTagCounts,
    getPropertyCounts,
    tagTree,
    propertyTree,
    propertyTreeService,
    onToggleShortcutsPin,
    isShortcutsPinned,
    onConfigurePropertyKeys
}: UseNavigationPaneShortcutDisplayProps) {
    const shouldIncludeRecentInPinLabel = settings.pinRecentNotesWithShortcuts && settings.showRecentNotes;
    const pinShortcutsLabel = shouldIncludeRecentInPinLabel
        ? strings.navigationPane.pinShortcutsAndRecentFiles
        : strings.navigationPane.pinShortcuts;
    const unpinShortcutsLabel = shouldIncludeRecentInPinLabel
        ? strings.navigationPane.unpinShortcutsAndRecentFiles
        : strings.navigationPane.unpinShortcuts;
    const pinToggleLabel = isShortcutsPinned ? unpinShortcutsLabel : pinShortcutsLabel;

    const shortcutHeaderTrailingAction = useMemo<VirtualFolderTrailingAction>(
        () => ({
            actionLabel: pinToggleLabel,
            icon: isShortcutsPinned ? 'lucide-pin-off' : 'lucide-pin',
            onClick: onToggleShortcutsPin
        }),
        [isShortcutsPinned, onToggleShortcutsPin, pinToggleLabel]
    );

    const propertiesHeaderTrailingAction = useMemo<VirtualFolderTrailingAction>(
        () => ({
            actionLabel: strings.contextMenu.property.addKey,
            icon: 'lucide-settings-2',
            onClick: onConfigurePropertyKeys,
            labelMode: 'note-count'
        }),
        [onConfigurePropertyKeys]
    );

    const getFolderShortcutCount = useCallback(
        (folder: import('obsidian').TFolder): NoteCountInfo => {
            if (!settings.showNoteCount) {
                return ZERO_NOTE_COUNT;
            }

            const precomputed = getFolderCounts().get(folder.path);
            if (precomputed) {
                return precomputed;
            }

            const folderNoteSettings = getFolderNoteDetectionSettings({
                enableFolderNotes: settings.enableFolderNotes,
                folderNoteNamePattern: settings.folderNoteNamePattern
            });

            return calculateFolderNoteCounts(folder, {
                app,
                db: noteCountDB,
                fileVisibility,
                excludedFiles: effectiveFrontmatterExclusions,
                excludedFileMatcher: effectiveFrontmatterExclusionMatcher,
                excludedFolders: hiddenFolders,
                descendantExcludedFolders,
                fileNameMatcher: folderCountFileNameMatcher,
                hiddenFileTagVisibility,
                includeDescendants: includeDescendantNotes,
                showHiddenFolders: showHiddenItems,
                hideFolderNoteInList: settings.hideFolderNoteInList,
                folderNoteSettings
            });
        },
        [
            app,
            effectiveFrontmatterExclusionMatcher,
            effectiveFrontmatterExclusions,
            descendantExcludedFolders,
            fileVisibility,
            folderCountFileNameMatcher,
            getFolderCounts,
            hiddenFileTagVisibility,
            hiddenFolders,
            includeDescendantNotes,
            noteCountDB,
            settings,
            showHiddenItems
        ]
    );

    const getTagShortcutCount = useCallback(
        (tagPath: string): NoteCountInfo => {
            const canonicalPath = resolveCanonicalTagPath(tagPath, tagTree);
            if (!canonicalPath || !settings.showNoteCount) {
                return ZERO_NOTE_COUNT;
            }

            const precomputed = getTagCounts().get(canonicalPath);
            if (precomputed) {
                return precomputed;
            }

            const tagNode = findTagNode(tagTree, canonicalPath);
            if (!tagNode) {
                return ZERO_NOTE_COUNT;
            }

            return createTagNoteCountInfo(tagNode, includeDescendantNotes);
        },
        [getTagCounts, includeDescendantNotes, settings.showNoteCount, tagTree]
    );

    const getPropertyShortcutCount = useCallback(
        (propertyNodeId: string): NoteCountInfo => {
            if (!settings.showNoteCount) {
                return ZERO_NOTE_COUNT;
            }

            const precomputed = getPropertyCounts().get(propertyNodeId);
            if (precomputed) {
                return precomputed;
            }
            if (propertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return ZERO_NOTE_COUNT;
            }

            const resolved = resolvePropertyTreeNode({
                nodeId: propertyNodeId,
                propertyTreeService,
                propertyTree
            });
            const resolvedNode = resolved?.node ?? null;
            if (!resolvedNode) {
                return ZERO_NOTE_COUNT;
            }

            if (resolvedNode.kind === 'key') {
                const current = getDirectPropertyKeyNoteCount(resolvedNode);
                if (!includeDescendantNotes) {
                    return { current, descendants: 0, total: current };
                }

                const total = resolvedNode.notesWithValue.size;
                const descendants = Math.max(total - current, 0);
                return { current, descendants, total };
            }

            const current = resolvedNode.notesWithValue.size;
            if (!includeDescendantNotes || !resolvedNode.valuePath) {
                return { current, descendants: 0, total: current };
            }

            const keyNode = propertyTreeService?.getKeyNode(resolvedNode.key) ?? propertyTree.get(resolvedNode.key) ?? null;
            if (!keyNode) {
                return { current, descendants: 0, total: current };
            }

            const total = getTotalPropertyNoteCount(keyNode, resolvedNode.valuePath);
            const descendants = Math.max(total - current, 0);
            return { current, descendants, total };
        },
        [getPropertyCounts, includeDescendantNotes, propertyTree, propertyTreeService, settings.showNoteCount]
    );

    const getMissingNoteLabel = useCallback((path: string): string => {
        const baseName = getPathBaseName(path);
        if (!baseName) {
            return '';
        }
        const dotIndex = baseName.lastIndexOf('.');
        if (dotIndex <= 0) {
            return baseName;
        }
        const namePart = baseName.substring(0, dotIndex);
        const extension = baseName.substring(dotIndex + 1);
        if (extension.toLowerCase() === 'md') {
            return namePart;
        }
        return baseName;
    }, []);

    return {
        pinToggleLabel,
        shortcutHeaderTrailingAction,
        propertiesHeaderTrailingAction,
        getFolderShortcutCount,
        getTagShortcutCount,
        getPropertyShortcutCount,
        getMissingNoteLabel
    };
}
