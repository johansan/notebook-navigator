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

import { useCallback, useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { App, TFile } from 'obsidian';
import type { TagTreeService } from '../../services/TagTreeService';
import { getDBInstance } from '../../storage/fileOperations';
import type { StorageFileData } from './storageFileData';
import type { TagTreeNode } from '../../types/storage';
import { buildTagTreeFromDatabase } from '../../utils/tagTree';
import { createFileVisibilityChecker } from '../../utils/fileFilters';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { FileVisibility } from '../../utils/fileTypeUtils';
import type { TreeRebuildFn } from './useTreeRebuildScheduler';

/**
 * Builds and maintains the in-memory tag tree derived from the database.
 *
 * The tag tree is constructed from IndexedDB cache records (not direct vault reads) so that:
 * - Counts and tag assignments are consistent with what the storage layer has indexed.
 * - Updates can be driven by database change events from content providers.
 *
 * Rebuilds run through the shared tree rebuild scheduler (`useTreeRebuildScheduler`) because tag-related
 * content updates can arrive in bursts (for example when a large batch of files is processed). The active
 * file path is treated specially: if the active file changes tags, the rebuild is flushed so the UI reflects
 * the change immediately.
 */
type ScheduleTagTreeRebuildOptions = {
    // Executes a pending rebuild immediately.
    flush?: boolean;
};

export function useTagTreeSync(params: {
    app: App;
    settings: NotebookNavigatorSettings;
    showHiddenItems: boolean;
    hiddenFolders: string[];
    hiddenTags: string[];
    hiddenFileProperties: string[];
    hiddenFileTags: string[];
    fileVisibility: FileVisibility;
    profileId: string;
    isStorageReady: boolean;
    isStorageReadyRef: MutableRefObject<boolean>;
    latestSettingsRef: MutableRefObject<NotebookNavigatorSettings>;
    stoppedRef: MutableRefObject<boolean>;
    setFileData: Dispatch<SetStateAction<StorageFileData>>;
    getVisibleMarkdownFiles: () => TFile[];
    tagTreeService: TagTreeService | null;
    scheduleTreeRebuild: (kind: 'tags' | 'properties', options?: { flush?: boolean }) => void;
    tagTreeRebuildFnRef: MutableRefObject<TreeRebuildFn | null>;
}): {
    rebuildTagTree: (getVisibleFiles?: () => TFile[]) => Map<string, TagTreeNode>;
    scheduleTagTreeRebuild: (options?: ScheduleTagTreeRebuildOptions) => void;
} {
    const {
        app,
        settings,
        showHiddenItems,
        hiddenFolders,
        hiddenTags,
        hiddenFileProperties,
        hiddenFileTags,
        fileVisibility,
        profileId,
        isStorageReady,
        isStorageReadyRef,
        latestSettingsRef,
        stoppedRef,
        setFileData,
        getVisibleMarkdownFiles,
        tagTreeService,
        scheduleTreeRebuild,
        tagTreeRebuildFnRef
    } = params;

    const hiddenFoldersRef = useRef(hiddenFolders);
    const hiddenTagsRef = useRef(hiddenTags);

    useEffect(() => {
        hiddenFoldersRef.current = hiddenFolders;
    }, [hiddenFolders]);

    useEffect(() => {
        hiddenTagsRef.current = hiddenTags;
    }, [hiddenTags]);

    // Skips tag tree rebuild effects immediately after storage becomes ready.
    const tagTreeRebuildReadyGateRef = useRef(false);

    // Rebuilds the complete tag tree structure from database contents. Accepts an optional visible-file
    // getter so a scheduler pass can share one vault scan between the tag and property tree rebuilds.
    const rebuildTagTree = useCallback(
        (getVisibleFiles?: () => TFile[]) => {
            const db = getDBInstance();
            // Folder exclusions are handled at the tag-tree level (note counts, untagged counts). When hidden items are
            // shown, we treat excluded folders as visible for counting and tree construction.
            const excludedFolderPatterns = showHiddenItems ? [] : hiddenFoldersRef.current;
            // The database may contain files that are currently hidden by profile settings. The UI tag tree only counts
            // files that would be visible in the current navigation scope.
            const visibleFiles = getVisibleFiles ? getVisibleFiles() : getVisibleMarkdownFiles();
            const includedPaths = new Set(visibleFiles.map(f => f.path));
            const { tagTree, tagged, untagged, hiddenRootTags } = buildTagTreeFromDatabase(
                db,
                excludedFolderPatterns,
                includedPaths,
                hiddenTagsRef.current,
                showHiddenItems
            );

            setFileData(previous => ({ ...previous, tagTree, tagged, untagged, hiddenRootTags }));

            // Propagate updated tag trees to the global TagTreeService for cross-component access
            if (tagTreeService) {
                tagTreeService.updateTagTree(tagTree, tagged, untagged);
            }

            return tagTree;
        },
        [getVisibleMarkdownFiles, setFileData, showHiddenItems, tagTreeService]
    );

    // Exposes the latest rebuild implementation to the shared scheduler.
    tagTreeRebuildFnRef.current = getVisibleFiles => {
        if (!latestSettingsRef.current.showTags) {
            return;
        }
        rebuildTagTree(getVisibleFiles);
    };

    // Requests a tag tree rebuild through the shared scheduler.
    const scheduleTagTreeRebuild = useCallback(
        (options?: ScheduleTagTreeRebuildOptions) => {
            if (stoppedRef.current || !isStorageReadyRef.current) {
                return;
            }

            if (!latestSettingsRef.current.showTags) {
                return;
            }

            scheduleTreeRebuild('tags', options);
        },
        [isStorageReadyRef, latestSettingsRef, scheduleTreeRebuild, stoppedRef]
    );

    /**
     * Effect: Rebuild tag tree when hidden items visibility changes
     */
    useEffect(() => {
        if (!isStorageReady) {
            // Resets the ready gate so the next ready transition is ignored.
            tagTreeRebuildReadyGateRef.current = false;
            return;
        }

        if (!tagTreeRebuildReadyGateRef.current) {
            // Initial cache build creates the tag tree before storage is marked ready.
            tagTreeRebuildReadyGateRef.current = true;
            return;
        }

        if (settings.showTags) {
            scheduleTagTreeRebuild();
        }
    }, [
        showHiddenItems,
        settings.showTags,
        isStorageReady,
        scheduleTagTreeRebuild,
        hiddenFolders,
        hiddenFileProperties,
        hiddenTags,
        fileVisibility,
        profileId
    ]);

    /**
     * Effect: Listen for tag changes in the database to rebuild tag tree
     */
    useEffect(() => {
        if (!isStorageReady || !settings.showTags) {
            return;
        }

        // When files are hidden by tag, a tag change can flip file visibility in either direction, so every
        // tag change schedules a rebuild. Otherwise changed files are checked against the current visibility
        // filters: hidden files are indexed and generate content, but they are not part of the tag tree, so
        // their tag changes do not require a rebuild. Files in excluded folders still pass the check because
        // they contribute hidden root tags to the tree.
        const canSkipHiddenFileChanges = showHiddenItems || hiddenFileTags.length === 0;
        // A frontmatter-driven hidden flip changes tag tree membership without a tag change, so those
        // changes always schedule a rebuild and bypass the visibility skip (the checker already sees the
        // file's new hidden state).
        const shouldRebuildOnFrontmatterVisibilityChanges = !showHiddenItems && hiddenFileProperties.length > 0;

        const db = getDBInstance();
        const unsubscribe = db.onContentChange(changes => {
            if (stoppedRef.current) return;
            let isFileVisible: ((file: TFile) => boolean) | null = null;
            let hasRelevantChanges = false;
            let shouldFlush = false;
            let activeFilePath: string | null = null;
            let activeFileResolved = false;

            for (const change of changes) {
                const hasFrontmatterVisibilityChange = shouldRebuildOnFrontmatterVisibilityChanges && change.metadataHiddenChanged === true;
                if (change.changes.tags === undefined && !hasFrontmatterVisibilityChange) {
                    continue;
                }

                if (!activeFileResolved) {
                    activeFilePath = app.workspace.getActiveFile()?.path ?? null;
                    activeFileResolved = true;
                }
                const isActiveFileChange = activeFilePath !== null && change.path === activeFilePath;

                // Once a rebuild is known to be needed, the only remaining question is whether the active
                // file itself has a relevant change (it decides the flush), so other files skip the
                // visibility work.
                if (hasRelevantChanges && !isActiveFileChange) {
                    continue;
                }

                if (canSkipHiddenFileChanges && !hasFrontmatterVisibilityChange) {
                    const abstract = app.vault.getAbstractFileByPath(change.path);
                    if (!(abstract instanceof TFile)) {
                        // Deleted files leave the tree through the vault diff, which schedules its own rebuild.
                        continue;
                    }
                    if (!isFileVisible) {
                        isFileVisible = createFileVisibilityChecker(app, latestSettingsRef.current, { showHiddenItems });
                    }
                    if (!isFileVisible(abstract)) {
                        continue;
                    }
                }

                hasRelevantChanges = true;

                if (isActiveFileChange) {
                    // Flushes the debounce delay when the active file changes tags so the selection + tag tree state
                    // update together in the next render.
                    shouldFlush = true;
                    break;
                }
            }

            if (hasRelevantChanges) {
                scheduleTagTreeRebuild({ flush: shouldFlush });
            }
        });

        return unsubscribe;
    }, [
        app,
        hiddenFileProperties,
        hiddenFileTags,
        isStorageReady,
        latestSettingsRef,
        settings.showTags,
        scheduleTagTreeRebuild,
        showHiddenItems,
        stoppedRef
    ]);

    return { rebuildTagTree, scheduleTagTreeRebuild };
}
