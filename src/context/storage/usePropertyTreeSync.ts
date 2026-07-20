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

import { useCallback, useEffect, useMemo, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { App, TAbstractFile, TFile, TFolder } from 'obsidian';
import type { PropertyTreeService } from '../../services/PropertyTreeService';
import { getDBInstance } from '../../storage/fileOperations';
import type { StorageFileData } from './storageFileData';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { FileVisibility } from '../../utils/fileTypeUtils';
import { createFileVisibilityChecker, isPathInExcludedFolder } from '../../utils/fileFilters';
import type { TreeRebuildFn } from './useTreeRebuildScheduler';
import {
    buildPropertyKeyNodeId,
    buildPropertyTreeFromDatabase,
    isPropertyFeatureEnabled,
    registerPropertyKeyDirectPaths
} from '../../utils/propertyTree';
import { casefold } from '../../utils/recordUtils';
import type { PropertyTreeNode } from '../../types/storage';
import { clonePropertyKeys, getActivePropertyFields, getActivePropertyKeySet, getActiveVaultProfile } from '../../utils/vaultProfiles';

type SchedulePropertyTreeRebuildOptions = {
    flush?: boolean;
};

function shouldEnablePropertyTree(settings: NotebookNavigatorSettings): boolean {
    return isPropertyFeatureEnabled(settings);
}

function buildConfiguredPropertyDisplayByKey(settings: NotebookNavigatorSettings): Map<string, string> {
    const displayByKey = new Map<string, string>();
    const profile = getActiveVaultProfile(settings);
    const configuredKeys = clonePropertyKeys(profile.propertyKeys);
    configuredKeys.forEach(entry => {
        const displayName = entry.key.trim();
        const normalizedKey = casefold(displayName);
        if (!displayName || !normalizedKey || displayByKey.has(normalizedKey)) {
            return;
        }

        displayByKey.set(normalizedKey, displayName);
    });
    return displayByKey;
}

function includeConfiguredPropertyKeys(tree: Map<string, PropertyTreeNode>, displayByKey: Map<string, string>): void {
    for (const [normalizedKey, displayName] of displayByKey.entries()) {
        if (tree.has(normalizedKey)) {
            continue;
        }

        const keyNode: PropertyTreeNode = {
            id: buildPropertyKeyNodeId(normalizedKey),
            kind: 'key',
            key: normalizedKey,
            valuePath: null,
            name: displayName,
            displayPath: displayName,
            children: new Map(),
            notesWithValue: new Set()
        };
        tree.set(normalizedKey, keyNode);
        registerPropertyKeyDirectPaths(keyNode);
    }
}

export function usePropertyTreeSync(params: {
    app: App;
    settings: NotebookNavigatorSettings;
    showHiddenItems: boolean;
    hiddenFolders: string[];
    hiddenFileProperties: string[];
    hiddenFileNames: string[];
    hiddenFileTags: string[];
    fileVisibility: FileVisibility;
    profileId: string;
    isStorageReady: boolean;
    isStorageReadyRef: MutableRefObject<boolean>;
    latestSettingsRef: MutableRefObject<NotebookNavigatorSettings>;
    stoppedRef: MutableRefObject<boolean>;
    setFileData: Dispatch<SetStateAction<StorageFileData>>;
    getVisibleMarkdownFiles: () => TFile[];
    propertyTreeService: PropertyTreeService | null;
    scheduleTreeRebuild: (kind: 'tags' | 'properties', options?: { flush?: boolean }) => void;
    propertyTreeRebuildFnRef: MutableRefObject<TreeRebuildFn | null>;
}): {
    rebuildPropertyTree: (getVisibleFiles?: () => TFile[]) => Map<string, PropertyTreeNode>;
    schedulePropertyTreeRebuild: (options?: SchedulePropertyTreeRebuildOptions) => void;
} {
    const {
        app,
        settings,
        showHiddenItems,
        hiddenFolders,
        hiddenFileProperties,
        hiddenFileNames,
        hiddenFileTags,
        fileVisibility,
        profileId,
        isStorageReady,
        isStorageReadyRef,
        latestSettingsRef,
        stoppedRef,
        setFileData,
        getVisibleMarkdownFiles,
        propertyTreeService,
        scheduleTreeRebuild,
        propertyTreeRebuildFnRef
    } = params;

    const hiddenFoldersRef = useRef(hiddenFolders);
    const isPropertyTreeEnabled = useMemo(() => shouldEnablePropertyTree(settings), [settings]);
    const propertyTreeRebuildReadyGateRef = useRef(false);
    const activePropertyFields = getActivePropertyFields(settings);

    useEffect(() => {
        hiddenFoldersRef.current = hiddenFolders;
    }, [hiddenFolders]);

    const clearPropertyTree = useCallback(() => {
        const emptyTree = new Map<string, PropertyTreeNode>();
        setFileData(previous => ({ ...previous, propertyTree: emptyTree }));
        propertyTreeService?.updatePropertyTree(emptyTree);
        return emptyTree;
    }, [propertyTreeService, setFileData]);

    // Rebuilds the property tree from database contents. Accepts an optional visible-file getter so a
    // scheduler pass can share one vault scan between the tag and property tree rebuilds.
    const rebuildPropertyTree = useCallback(
        (getVisibleFiles?: () => TFile[]) => {
            const liveSettings = latestSettingsRef.current;
            const configuredDisplayByKey = buildConfiguredPropertyDisplayByKey(liveSettings);
            const includedPropertyKeys = new Set(configuredDisplayByKey.keys());
            const shouldBuildTree = liveSettings.showProperties && configuredDisplayByKey.size > 0;
            if (!shouldBuildTree) {
                return clearPropertyTree();
            }

            const db = getDBInstance();
            const excludedFolderPatterns = showHiddenItems ? [] : hiddenFoldersRef.current;
            const visibleFiles = getVisibleFiles ? getVisibleFiles() : getVisibleMarkdownFiles();
            const visibleMarkdownPaths = visibleFiles.map(file => file.path);
            const propertyTree = buildPropertyTreeFromDatabase(
                {
                    forEachFile: callback => {
                        visibleMarkdownPaths.forEach(path => {
                            const fileData = db.getFile(path);
                            if (!fileData) {
                                return;
                            }
                            callback(path, fileData);
                        });
                    }
                },
                {
                    excludedFolderPatterns,
                    includedPropertyKeys
                }
            );
            includeConfiguredPropertyKeys(propertyTree, configuredDisplayByKey);

            setFileData(previous => ({ ...previous, propertyTree }));
            propertyTreeService?.updatePropertyTree(propertyTree);
            return propertyTree;
        },
        [clearPropertyTree, getVisibleMarkdownFiles, latestSettingsRef, propertyTreeService, setFileData, showHiddenItems]
    );

    // Exposes the latest rebuild implementation to the shared scheduler. rebuildPropertyTree clears the
    // tree itself when the feature is disabled.
    propertyTreeRebuildFnRef.current = getVisibleFiles => {
        rebuildPropertyTree(getVisibleFiles);
    };

    const schedulePropertyTreeRebuild = useCallback(
        (options?: SchedulePropertyTreeRebuildOptions) => {
            if (stoppedRef.current || !isStorageReadyRef.current) {
                return;
            }

            if (!shouldEnablePropertyTree(latestSettingsRef.current)) {
                clearPropertyTree();
                return;
            }

            scheduleTreeRebuild('properties', options);
        },
        [clearPropertyTree, isStorageReadyRef, latestSettingsRef, scheduleTreeRebuild, stoppedRef]
    );

    useEffect(() => {
        if (!isStorageReady) {
            // Resets the ready gate so the next ready transition is ignored.
            propertyTreeRebuildReadyGateRef.current = false;
            return;
        }

        if (!propertyTreeRebuildReadyGateRef.current) {
            // Initial cache build creates the property tree before storage is marked ready.
            propertyTreeRebuildReadyGateRef.current = true;
            return;
        }

        if (!isPropertyTreeEnabled) {
            clearPropertyTree();
            return;
        }

        schedulePropertyTreeRebuild();
    }, [
        showHiddenItems,
        isStorageReady,
        isPropertyTreeEnabled,
        schedulePropertyTreeRebuild,
        clearPropertyTree,
        getVisibleMarkdownFiles,
        hiddenFolders,
        hiddenFileProperties,
        hiddenFileNames,
        hiddenFileTags,
        fileVisibility,
        profileId,
        activePropertyFields,
        settings.showProperties
    ]);

    useEffect(() => {
        if (!isStorageReady || !isPropertyTreeEnabled) {
            return;
        }

        const shouldRebuildOnTagVisibilityChanges = !showHiddenItems && hiddenFileTags.length > 0;
        const shouldRebuildOnFrontmatterVisibilityChanges = !showHiddenItems && hiddenFileProperties.length > 0;
        const db = getDBInstance();
        const unsubscribe = db.onContentChange(changes => {
            if (stoppedRef.current) {
                return;
            }

            let isFileVisible: ((file: TFile) => boolean) | null = null;
            const excludedFolderPatterns = showHiddenItems ? [] : hiddenFoldersRef.current;
            let hasRelevantChanges = false;
            let shouldFlush = false;
            let activeFilePath: string | null = null;
            let activeFileResolved = false;
            const configuredPropertyKeys = getActivePropertyKeySet(latestSettingsRef.current, 'any');
            for (const change of changes) {
                const changedPropertyKeys = change.changedPropertyKeys;
                const hasPropertyChange =
                    change.changes.properties !== undefined &&
                    (changedPropertyKeys === undefined || changedPropertyKeys.some(key => configuredPropertyKeys.has(key)));
                const hasTagVisibilityChange = shouldRebuildOnTagVisibilityChanges && change.changes.tags !== undefined;
                const hasFrontmatterVisibilityChange = shouldRebuildOnFrontmatterVisibilityChanges && change.metadataHiddenChanged === true;
                if (!hasPropertyChange && !hasTagVisibilityChange && !hasFrontmatterVisibilityChange) {
                    continue;
                }

                // Files in excluded folders never enter the property tree, so no change to them (including
                // visibility flips) affects it.
                if (excludedFolderPatterns.length > 0 && isPathInExcludedFolder(change.path, excludedFolderPatterns)) {
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

                // Visibility-flip changes always rebuild. Plain property changes only rebuild when the file
                // is part of the visible set the tree is built from: hidden files are indexed and generate
                // content, but the tree excludes them, so their property changes do not require a rebuild.
                if (!hasTagVisibilityChange && !hasFrontmatterVisibilityChange) {
                    const abstract = app.vault.getAbstractFileByPath(change.path);
                    if (!(abstract instanceof TFile)) {
                        // Deleted files leave the tree through the vault delete handler, which schedules its own rebuild.
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
                    shouldFlush = true;
                    break;
                }
            }

            if (hasRelevantChanges) {
                // Flush only when the active file is the sole file in the batch.
                const shouldFlushNow = shouldFlush && changes.every(change => change.path === activeFilePath);
                schedulePropertyTreeRebuild({ flush: shouldFlushNow });
            }
        });

        return unsubscribe;
    }, [
        app,
        hiddenFileProperties,
        hiddenFileTags,
        isStorageReady,
        isPropertyTreeEnabled,
        latestSettingsRef,
        schedulePropertyTreeRebuild,
        showHiddenItems,
        stoppedRef
    ]);

    useEffect(() => {
        if (!isStorageReady || !isPropertyTreeEnabled) {
            return;
        }

        // Rebuild property tree when vault delete/rename events change markdown or folder paths.
        const shouldTriggerRebuild = (file: TAbstractFile): boolean => {
            if (file instanceof TFile) {
                return file.extension === 'md';
            }
            return file instanceof TFolder;
        };

        const handleDelete = (file: TAbstractFile) => {
            if (stoppedRef.current) {
                return;
            }
            if (!shouldTriggerRebuild(file)) {
                return;
            }
            schedulePropertyTreeRebuild();
        };

        const handleRename = (file: TAbstractFile) => {
            if (stoppedRef.current) {
                return;
            }
            if (!shouldTriggerRebuild(file)) {
                return;
            }
            schedulePropertyTreeRebuild();
        };

        const deleteRef = app.vault.on('delete', handleDelete);
        const renameRef = app.vault.on('rename', handleRename);

        return () => {
            app.vault.offref(deleteRef);
            app.vault.offref(renameRef);
        };
    }, [app.vault, isStorageReady, isPropertyTreeEnabled, schedulePropertyTreeRebuild, stoppedRef]);

    return { rebuildPropertyTree, schedulePropertyTreeRebuild };
}
