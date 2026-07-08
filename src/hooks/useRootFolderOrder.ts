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

import { useEffect, useRef, useState } from 'react';
import { TFile, TFolder, debounce } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { useSettingsUpdate } from '../context/SettingsContext';
import type { NotebookNavigatorSettings } from '../settings/types';
import { naturalCompare } from '../utils/sortUtils';
import { areStringArraysEqual, createIndexMap } from '../utils/arrayUtils';
import { compareFolderOrderWithFallback } from '../utils/treeFlattener';
import { TIMEOUTS } from '../types/obsidian-extended';
import { stripTrailingSlash } from '../utils/pathUtils';
import { runAsyncAction } from '../utils/async';

const ROOT_PATH = '/';

/**
 * Tracks pending changes to root folder order that haven't been applied yet
 */
interface PendingRootOrderChanges {
    renames: Map<string, string>; // Maps old paths to new paths for renamed folders
    removals: Set<string>; // Folders that have been deleted
    additions: Set<string>; // Newly created folders
}

/**
 * Parameters for the useRootFolderOrder hook
 */
export interface RootFileChangeEvent {
    type: 'create' | 'delete' | 'rename';
    path: string;
    oldPath?: string;
}

export interface UseRootFolderOrderParams {
    settings: NotebookNavigatorSettings;
    onFileChange?: (change: RootFileChangeEvent) => void; // Callback triggered when files change
    onFolderChange?: () => void; // Callback triggered when folders are created, deleted, or renamed
}

/**
 * State returned by the useRootFolderOrder hook
 */
export interface RootFolderOrderState {
    rootFolders: TFolder[]; // Folders to display as roots (may include vault root)
    rootLevelFolders: TFolder[]; // All top-level folders in custom order
    rootFolderOrderMap: Map<string, number>; // Maps folder paths to their order index
    missingRootFolderPaths: string[]; // Stored paths that are not currently present in the vault
}

/**
 * Checks if a path represents a top-level folder (direct child of vault root)
 */
function isRootLevelPath(path: string): boolean {
    if (!path) {
        return false;
    }
    const normalized = stripTrailingSlash(path);
    if (normalized === ROOT_PATH) {
        return false;
    }
    return !normalized.includes('/');
}

/**
 * Result from normalizing root folder order data.
 */
interface NormalizedRootOrder {
    normalizedOrder: string[];
    missingPaths: string[];
}

/**
 * Normalizes the folder order by deduplicating paths, retaining unresolved folders,
 * and appending newly discovered folders in natural order.
 */
function normalizeRootFolderOrder(existingOrder: string[], folders: TFolder[]): NormalizedRootOrder {
    const folderMap = new Map<string, TFolder>();
    folders.forEach(folder => {
        folderMap.set(stripTrailingSlash(folder.path), folder);
    });

    const seen = new Set<string>();
    const normalizedOrder: string[] = [];
    const missingPaths: string[] = [];

    // Process existing order, preserving paths even if folders are missing
    existingOrder.forEach(pathValue => {
        const normalizedPath = stripTrailingSlash(pathValue);
        if (!normalizedPath || normalizedPath === ROOT_PATH) {
            return;
        }
        // Skip duplicates
        if (seen.has(normalizedPath)) {
            return;
        }
        seen.add(normalizedPath);
        normalizedOrder.push(normalizedPath);
        // Track paths that exist in settings but not in vault
        if (!folderMap.has(normalizedPath)) {
            missingPaths.push(normalizedPath);
        }
    });

    // Find folders that exist but aren't in the saved order
    const appendedFolders = folders
        .filter(folder => !seen.has(stripTrailingSlash(folder.path)))
        .sort((a, b) => naturalCompare(a.name, b.name))
        .map(folder => stripTrailingSlash(folder.path));

    // Append new folders to the end of the order
    appendedFolders.forEach(path => {
        if (!seen.has(path)) {
            seen.add(path);
            normalizedOrder.push(path);
        }
    });

    return {
        normalizedOrder,
        missingPaths
    };
}

/**
 * Sorts folders according to the custom order map with fallback to natural sorting
 */
function sortFoldersByOrder(folders: TFolder[], orderMap: Map<string, number>): TFolder[] {
    return folders.slice().sort((a, b) => compareFolderOrderWithFallback(a, b, orderMap));
}

/**
 * Hook that manages the custom ordering of root-level folders.
 * Tracks folder creation, deletion, and renaming to maintain order consistency.
 */
export function useRootFolderOrder({ settings, onFileChange, onFolderChange }: UseRootFolderOrderParams): RootFolderOrderState {
    const { app } = useServices();
    const updateSettings = useSettingsUpdate();
    const [rootFolders, setRootFolders] = useState<TFolder[]>([]);
    const [rootLevelFolders, setRootLevelFolders] = useState<TFolder[]>([]);
    const [rootFolderOrderMap, setRootFolderOrderMap] = useState<Map<string, number>>(new Map());
    const [missingRootFolderPaths, setMissingRootFolderPaths] = useState<string[]>([]);
    const pendingRootOrderChangesRef = useRef<PendingRootOrderChanges>({
        renames: new Map(),
        removals: new Set(),
        additions: new Set()
    });
    const rootFolderOrderRef = useRef<string[]>(settings.rootFolderOrder);

    useEffect(() => {
        rootFolderOrderRef.current = settings.rootFolderOrder.slice();
    }, [settings.rootFolderOrder]);

    useEffect(() => {
        const pendingChanges = pendingRootOrderChangesRef.current;

        // Rebuilds the folder structure and applies pending changes
        const buildFolders = () => {
            const vault = app.vault;
            const root = vault.getRoot();
            const rootChildren = root.children.filter((child): child is TFolder => child instanceof TFolder);

            let workingOrder = rootFolderOrderRef.current.slice();

            if (pendingChanges.renames.size > 0 || pendingChanges.removals.size > 0 || pendingChanges.additions.size > 0) {
                pendingChanges.renames.forEach((newPath, oldPath) => {
                    const index = workingOrder.indexOf(oldPath);
                    if (index !== -1) {
                        workingOrder[index] = newPath;
                    }
                });

                if (pendingChanges.removals.size > 0) {
                    workingOrder = workingOrder.filter(path => !pendingChanges.removals.has(path));
                }

                pendingChanges.additions.forEach(path => {
                    if (!workingOrder.includes(path)) {
                        workingOrder.push(path);
                    }
                });

                pendingChanges.renames.clear();
                pendingChanges.removals.clear();
                pendingChanges.additions.clear();
            }

            if (rootFolderOrderRef.current.length === 0) {
                const direction = settings.folderSortOrder === 'alpha-desc' ? -1 : 1;
                const alphabeticalChildren = rootChildren.slice().sort((a, b) => naturalCompare(a.name, b.name) * direction);

                pendingChanges.renames.clear();
                pendingChanges.removals.clear();
                pendingChanges.additions.clear();

                setRootLevelFolders(alphabeticalChildren);

                if (settings.showRootFolder) {
                    setRootFolders([root]);
                } else {
                    setRootFolders(alphabeticalChildren);
                }

                setRootFolderOrderMap(new Map());
                setMissingRootFolderPaths(prev => (prev.length === 0 ? prev : []));
                return;
            }

            const { normalizedOrder, missingPaths } = normalizeRootFolderOrder(workingOrder, rootChildren);
            const orderMap = createIndexMap(normalizedOrder);
            const orderedChildren = sortFoldersByOrder(rootChildren, orderMap);

            if (!areStringArraysEqual(normalizedOrder, rootFolderOrderRef.current)) {
                rootFolderOrderRef.current = normalizedOrder;
                runAsyncAction(async () => {
                    await updateSettings(current => {
                        current.rootFolderOrder = normalizedOrder;
                    });
                });
            }

            setMissingRootFolderPaths(prev => (areStringArraysEqual(prev, missingPaths) ? prev : missingPaths));
            setRootLevelFolders(orderedChildren);

            if (settings.showRootFolder) {
                setRootFolders([root]);
            } else {
                setRootFolders(orderedChildren);
            }

            setRootFolderOrderMap(orderMap);
        };

        // Notifies parent component of file changes
        const notifyFileChange = (change: RootFileChangeEvent) => {
            if (onFileChange) {
                onFileChange(change);
            }
        };

        // Notifies parent component of folder structure changes ahead of the debounced rebuild
        const notifyFolderChange = () => {
            if (onFolderChange) {
                onFolderChange();
            }
        };

        buildFolders();

        const rebuildFolders = debounce(buildFolders, TIMEOUTS.FILE_OPERATION_DELAY, true);

        // Handles creation of new folders, adding them to pending additions if at root level
        const handleFolderCreate = (file: TFolder) => {
            const normalizedPath = stripTrailingSlash(file.path);
            if (file.parent === app.vault.getRoot() && normalizedPath !== ROOT_PATH) {
                pendingChanges.additions.add(normalizedPath);
            }
            rebuildFolders();
        };

        // Handles folder deletion, marking root-level folders for removal
        const handleFolderDelete = (file: TFolder) => {
            const normalizedPath = stripTrailingSlash(file.path);
            if (isRootLevelPath(normalizedPath)) {
                pendingChanges.removals.add(normalizedPath);
            }
            rebuildFolders();
        };

        // Handles folder renaming, tracking changes to maintain order across renames
        const handleFolderRename = (file: TFolder, oldPath: string) => {
            const normalizedOldPath = stripTrailingSlash(oldPath);
            const normalizedNewPath = stripTrailingSlash(file.path);
            const isNowRoot = file.parent === app.vault.getRoot();
            const wasRoot = isRootLevelPath(normalizedOldPath);

            if (wasRoot && isNowRoot) {
                if (normalizedOldPath !== normalizedNewPath) {
                    pendingChanges.renames.set(normalizedOldPath, normalizedNewPath);
                }
            } else if (wasRoot && !isNowRoot) {
                pendingChanges.removals.add(normalizedOldPath);
            } else if (!wasRoot && isNowRoot) {
                pendingChanges.additions.add(normalizedNewPath);
            }

            rebuildFolders();
        };

        const events = [
            app.vault.on('create', file => {
                if (file instanceof TFolder) {
                    handleFolderCreate(file);
                    notifyFolderChange();
                }
                if (file instanceof TFile) {
                    notifyFileChange({ type: 'create', path: file.path });
                }
            }),
            app.vault.on('delete', file => {
                if (file instanceof TFolder) {
                    handleFolderDelete(file);
                    notifyFolderChange();
                }
                if (file instanceof TFile) {
                    notifyFileChange({ type: 'delete', path: file.path });
                }
            }),
            app.vault.on('rename', (file, oldPath) => {
                if (file instanceof TFolder) {
                    handleFolderRename(file, oldPath);
                    notifyFolderChange();
                }
                if (file instanceof TFile) {
                    notifyFileChange({ type: 'rename', path: file.path, oldPath });
                }
            })
        ];

        return () => {
            events.forEach(eventRef => app.vault.offref(eventRef));
            rebuildFolders.cancel();
        };
    }, [app, onFileChange, onFolderChange, settings.showRootFolder, settings.rootFolderOrder, settings.folderSortOrder, updateSettings]);

    return {
        rootFolders,
        rootLevelFolders,
        rootFolderOrderMap,
        missingRootFolderPaths
    };
}
