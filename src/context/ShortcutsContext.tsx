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

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TAbstractFile, TFile, TFolder } from 'obsidian';
import { useSettingsState, useSettingsUpdate } from './SettingsContext';
import { useServices } from './ServicesContext';
import {
    ShortcutEntry,
    ShortcutType,
    SearchShortcut,
    type ShortcutStartTarget,
    getShortcutStartTargetFingerprint,
    getShortcutKey,
    isFolderShortcut,
    isNoteShortcut,
    isSearchShortcut,
    isTagShortcut,
    isPropertyShortcut,
    normalizePropertyShortcutNodeId,
    normalizeSearchShortcutName,
    normalizeShortcutStartTarget
} from '../types/shortcuts';
import type { SearchProvider } from '../types/search';
import { strings } from '../i18n';
import { showNotice } from '../utils/noticeUtils';
import { normalizeTagPath } from '../utils/tagUtils';
import { runAsyncAction } from '../utils/async';
import { findVaultProfileById } from '../utils/vaultProfiles';
import { buildShortcutTargetKeyMaps, foldShortcutTargetPath, resolveShortcutTargets } from '../utils/shortcutPathResolver';

// Generates a unique fingerprint for a shortcut based on its type and key properties
const getShortcutFingerprint = (shortcut: ShortcutEntry): string => {
    if (isFolderShortcut(shortcut) || isNoteShortcut(shortcut) || isTagShortcut(shortcut) || isPropertyShortcut(shortcut)) {
        const path = isTagShortcut(shortcut) ? shortcut.tagPath : isPropertyShortcut(shortcut) ? shortcut.nodeId : shortcut.path;
        return `${shortcut.type}:${path}`;
    }

    const startTarget = getShortcutStartTargetFingerprint(shortcut.startTarget);
    return `${shortcut.type}:${shortcut.name}:${shortcut.query}:${shortcut.provider}:${startTarget}`;
};

// Creates a fingerprint for an array of shortcuts to detect changes
const buildShortcutsFingerprint = (shortcuts: ShortcutEntry[]): string => {
    if (shortcuts.length === 0) {
        return 'empty';
    }
    return shortcuts.map(getShortcutFingerprint).join('|');
};

/**
 * Represents a shortcut with resolved file/folder references and validation state.
 * Hydrated shortcuts have their paths resolved to actual Obsidian file objects.
 */
interface HydratedShortcut {
    key: string;
    shortcut: ShortcutEntry;
    folder: TFolder | null;
    note: TFile | null;
    search: SearchShortcut | null;
    tagPath: string | null;
    propertyNodeId: string | null;
    isMissing: boolean;
}

/**
 * Context value providing shortcut management functionality and state
 */
export interface ShortcutsContextValue {
    shortcuts: ShortcutEntry[];
    hydratedShortcuts: HydratedShortcut[];
    shortcutMap: Map<string, ShortcutEntry>;
    folderShortcutKeysByPath: Map<string, string>;
    noteShortcutKeysByPath: Map<string, string>;
    tagShortcutKeysByPath: Map<string, string>;
    propertyShortcutKeysByNodeId: Map<string, string>;
    searchShortcutsByName: Map<string, SearchShortcut>;
    addFolderShortcut: (path: string, options?: { index?: number }) => Promise<boolean>;
    addNoteShortcut: (path: string, options?: { index?: number }) => Promise<boolean>;
    addTagShortcut: (tagPath: string, options?: { index?: number }) => Promise<boolean>;
    addPropertyShortcut: (nodeId: string, options?: { index?: number }) => Promise<boolean>;
    addSearchShortcut: (
        input: { name: string; query: string; provider: SearchProvider; startTarget?: ShortcutStartTarget },
        options?: { index?: number }
    ) => Promise<boolean>;
    addShortcutsBatch: (entries: ShortcutEntry[], options?: { index?: number }) => Promise<number>;
    removeShortcut: (key: string) => Promise<boolean>;
    renameShortcut: (key: string, alias: string, defaultLabel?: string) => Promise<boolean>;
    removeSearchShortcut: (name: string) => Promise<boolean>;
    clearShortcuts: () => Promise<boolean>;
    reorderShortcuts: (orderedKeys: string[]) => Promise<boolean>;
    hasFolderShortcut: (path: string) => boolean;
    hasNoteShortcut: (path: string) => boolean;
    hasTagShortcut: (tagPath: string) => boolean;
    hasPropertyShortcut: (nodeId: string) => boolean;
    findSearchShortcut: (name: string) => SearchShortcut | undefined;
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

// Type guard to check if an abstract file is a folder
function isFolder(file: TAbstractFile | null): file is TFolder {
    return file instanceof TFolder;
}

// Type guard to check if an abstract file is a file
function isFile(file: TAbstractFile | null): file is TFile {
    return file instanceof TFile;
}

interface ShortcutsProviderProps {
    children: React.ReactNode;
}

/**
 * Provider component that manages shortcuts state and operations.
 * Handles adding, removing, reordering shortcuts and maintains lookup maps for fast access.
 */
export function ShortcutsProvider({ children }: ShortcutsProviderProps) {
    const settings = useSettingsState();
    const updateSettings = useSettingsUpdate();
    const { app } = useServices();
    const [vaultChangeVersion, setVaultChangeVersion] = useState(0);
    // Caches fingerprints to track which profiles have been checked for normalization
    const normalizationFingerprintsRef = useRef<Map<string, string>>(new Map());

    // Retrieves the active vault profile from settings
    const activeProfile = useMemo(
        () => findVaultProfileById(settings.vaultProfiles, settings.vaultProfile),
        [settings.vaultProfiles, settings.vaultProfile]
    );
    const activeProfileId = activeProfile.id;
    const rawShortcuts = useMemo(() => activeProfile.shortcuts ?? [], [activeProfile]);
    // Creates snapshots of shortcuts for all vault profiles with their fingerprints
    const profileShortcutSnapshots = useMemo(
        () =>
            settings.vaultProfiles.map(profile => {
                const shortcuts = profile.shortcuts ?? [];
                return {
                    id: profile.id,
                    shortcuts,
                    fingerprint: buildShortcutsFingerprint(shortcuts)
                };
            }),
        [settings.vaultProfiles]
    );

    // TODO: remove migration once tag shortcuts are normalized across active installs
    // Normalize stored tag shortcut paths for consistent lookups
    useEffect(() => {
        const fingerprintCache = normalizationFingerprintsRef.current;
        const activeProfileIds = new Set(profileShortcutSnapshots.map(snapshot => snapshot.id));
        fingerprintCache.forEach((_value, key) => {
            if (!activeProfileIds.has(key)) {
                fingerprintCache.delete(key);
            }
        });

        if (profileShortcutSnapshots.length === 0) {
            return;
        }

        const profilesNeedingCheck = profileShortcutSnapshots.filter(snapshot => {
            const cachedFingerprint = fingerprintCache.get(snapshot.id);
            return cachedFingerprint !== snapshot.fingerprint;
        });

        if (profilesNeedingCheck.length === 0) {
            return;
        }

        const targets = profilesNeedingCheck.filter(snapshot =>
            snapshot.shortcuts.some(shortcut => {
                if (isTagShortcut(shortcut)) {
                    const normalized = normalizeTagPath(shortcut.tagPath);
                    return normalized !== null && normalized !== shortcut.tagPath;
                }

                if (isPropertyShortcut(shortcut)) {
                    const normalized = normalizePropertyShortcutNodeId(shortcut.nodeId);
                    return normalized !== null && normalized !== shortcut.nodeId;
                }

                return false;
            })
        );

        const targetIds = new Set(targets.map(target => target.id));
        profilesNeedingCheck.forEach(snapshot => {
            if (!targetIds.has(snapshot.id)) {
                fingerprintCache.set(snapshot.id, snapshot.fingerprint);
            }
        });

        if (targets.length === 0) {
            return;
        }

        runAsyncAction(async () => {
            await updateSettings(current => {
                targets.forEach(target => {
                    const profile = current.vaultProfiles.find(entry => entry.id === target.id);
                    if (!profile || !Array.isArray(profile.shortcuts)) {
                        fingerprintCache.set(target.id, target.fingerprint);
                        return;
                    }

                    let mutated = false;
                    const normalizedShortcuts = profile.shortcuts.map(entry => {
                        if (!isTagShortcut(entry)) {
                            if (!isPropertyShortcut(entry)) {
                                return entry;
                            }

                            const normalized = normalizePropertyShortcutNodeId(entry.nodeId);
                            if (!normalized || normalized === entry.nodeId) {
                                return entry;
                            }

                            mutated = true;
                            return {
                                ...entry,
                                nodeId: normalized
                            };
                        }
                        const normalized = normalizeTagPath(entry.tagPath);
                        if (!normalized || normalized === entry.tagPath) {
                            return entry;
                        }
                        mutated = true;
                        return {
                            ...entry,
                            tagPath: normalized
                        };
                    });

                    if (mutated) {
                        profile.shortcuts = normalizedShortcuts;
                        fingerprintCache.set(target.id, buildShortcutsFingerprint(normalizedShortcuts));
                        return;
                    }

                    const currentFingerprint = buildShortcutsFingerprint(profile.shortcuts ?? []);
                    fingerprintCache.set(target.id, currentFingerprint);
                });
            });
        });
    }, [profileShortcutSnapshots, updateSettings]);

    // Updates shortcuts for the currently active vault profile
    const updateActiveProfileShortcuts = useCallback(
        async (mutate: (current: ShortcutEntry[]) => ShortcutEntry[] | null | undefined) => {
            if (!activeProfileId) {
                return false;
            }

            let didChange = false;
            await updateSettings(current => {
                const profile = current.vaultProfiles.find(entry => entry.id === activeProfileId);
                if (!profile) {
                    return;
                }

                const existing = Array.isArray(profile.shortcuts) ? profile.shortcuts : [];
                const next = mutate(existing);
                if (!next) {
                    return;
                }
                profile.shortcuts = next;
                didChange = true;
            });

            return didChange;
        },
        [activeProfileId, updateSettings]
    );

    // Creates map of shortcuts by their unique keys for O(1) lookup
    const shortcutMap = useMemo(() => {
        const map = new Map<string, ShortcutEntry>();
        rawShortcuts.forEach(shortcut => {
            map.set(getShortcutKey(shortcut), shortcut);
        });
        return map;
    }, [rawShortcuts]);

    const shortcutTargetResolution = useMemo(() => {
        void vaultChangeVersion;
        return resolveShortcutTargets(app, rawShortcuts);
    }, [app, rawShortcuts, vaultChangeVersion]);

    // Maps folder paths to their shortcut keys for duplicate detection
    const shortcutTargetKeyMaps = useMemo(
        () => buildShortcutTargetKeyMaps(rawShortcuts, shortcutTargetResolution),
        [rawShortcuts, shortcutTargetResolution]
    );

    const folderShortcutKeysByPath = shortcutTargetKeyMaps.folderShortcutKeysByPath;

    // Maps note paths to their shortcut keys for duplicate detection
    const noteShortcutKeysByPath = shortcutTargetKeyMaps.noteShortcutKeysByPath;

    // Maps tag paths to their shortcut keys for duplicate detection
    const tagShortcutKeysByPath = useMemo(() => {
        const map = new Map<string, string>();
        rawShortcuts.forEach(shortcut => {
            if (isTagShortcut(shortcut)) {
                const normalized = normalizeTagPath(shortcut.tagPath);
                if (normalized) {
                    map.set(normalized, getShortcutKey(shortcut));
                }
            }
        });
        return map;
    }, [rawShortcuts]);

    const propertyShortcutKeysByNodeId = useMemo(() => {
        const map = new Map<string, string>();
        rawShortcuts.forEach(shortcut => {
            if (isPropertyShortcut(shortcut)) {
                const normalized = normalizePropertyShortcutNodeId(shortcut.nodeId);
                if (normalized) {
                    map.set(normalized, getShortcutKey(shortcut));
                }
            }
        });
        return map;
    }, [rawShortcuts]);

    // Maps search shortcut names in canonical form to shortcuts for fast lookup
    const searchShortcutsByName = useMemo(() => {
        const map = new Map<string, SearchShortcut>();
        rawShortcuts.forEach(shortcut => {
            if (isSearchShortcut(shortcut)) {
                const normalizedName = normalizeSearchShortcutName(shortcut.name);
                if (normalizedName) {
                    map.set(normalizedName, shortcut);
                }
            }
        });
        return map;
    }, [rawShortcuts]);

    // Monitors vault changes for shortcut target files to trigger re-hydration when they are created/deleted/renamed
    useEffect(() => {
        const folderPaths = new Map(folderShortcutKeysByPath);
        const notePaths = new Map(noteShortcutKeysByPath);
        const foldedFolderPaths = new Set(Array.from(folderPaths.keys(), foldShortcutTargetPath));
        const foldedNotePaths = new Set(Array.from(notePaths.keys(), foldShortcutTargetPath));

        if (folderPaths.size === 0 && notePaths.size === 0) {
            return;
        }

        const vault = app.vault;

        const matchesShortcutExactPath = (path: string): boolean => folderPaths.has(path) || notePaths.has(path);

        const matchesShortcutPath = (file: TFile | TFolder, path: string): boolean => {
            if (matchesShortcutExactPath(path)) {
                return true;
            }

            if (isFolder(file)) {
                return foldedFolderPaths.has(foldShortcutTargetPath(path));
            }

            return foldedNotePaths.has(foldShortcutTargetPath(path));
        };

        const handleCreate = (file: TAbstractFile) => {
            if (!isFolder(file) && !isFile(file)) {
                return;
            }
            if (matchesShortcutPath(file, file.path)) {
                setVaultChangeVersion(value => value + 1);
            }
        };

        const handleDelete = (file: TAbstractFile) => {
            if (!isFolder(file) && !isFile(file)) {
                return;
            }
            if (matchesShortcutPath(file, file.path)) {
                setVaultChangeVersion(value => value + 1);
            }
        };

        const handleRename = (file: TAbstractFile, oldPath: string) => {
            if (!isFolder(file) && !isFile(file)) {
                return;
            }
            if (matchesShortcutPath(file, oldPath) || matchesShortcutPath(file, file.path)) {
                setVaultChangeVersion(value => value + 1);
            }
        };

        const createRef = vault.on('create', handleCreate);
        const deleteRef = vault.on('delete', handleDelete);
        const renameRef = vault.on('rename', (file, oldPath) => {
            handleRename(file, oldPath);
        });

        return () => {
            vault.offref(createRef);
            vault.offref(deleteRef);
            vault.offref(renameRef);
        };
    }, [app.vault, folderShortcutKeysByPath, noteShortcutKeysByPath]);

    const hydratedShortcuts = useMemo<HydratedShortcut[]>(() => {
        return rawShortcuts.map(shortcut => {
            const key = getShortcutKey(shortcut);

            if (isFolderShortcut(shortcut)) {
                const target = shortcutTargetResolution.folderTargetsByPath.get(shortcut.path) ?? null;
                if (isFolder(target)) {
                    return {
                        key,
                        shortcut,
                        folder: target,
                        note: null,
                        search: null,
                        tagPath: null,
                        propertyNodeId: null,
                        isMissing: false
                    };
                }
                return {
                    key,
                    shortcut,
                    folder: null,
                    note: null,
                    search: null,
                    tagPath: null,
                    propertyNodeId: null,
                    isMissing: true
                };
            }

            if (isNoteShortcut(shortcut)) {
                const target = shortcutTargetResolution.noteTargetsByPath.get(shortcut.path) ?? null;
                if (isFile(target)) {
                    return {
                        key,
                        shortcut,
                        folder: null,
                        note: target,
                        search: null,
                        tagPath: null,
                        propertyNodeId: null,
                        isMissing: false
                    };
                }
                return {
                    key,
                    shortcut,
                    folder: null,
                    note: null,
                    search: null,
                    tagPath: null,
                    propertyNodeId: null,
                    isMissing: true
                };
            }

            if (isTagShortcut(shortcut)) {
                const normalizedTagPath = normalizeTagPath(shortcut.tagPath);
                return {
                    key,
                    shortcut,
                    folder: null,
                    note: null,
                    search: null,
                    tagPath: normalizedTagPath ?? shortcut.tagPath,
                    propertyNodeId: null,
                    isMissing: !normalizedTagPath
                };
            }

            if (isPropertyShortcut(shortcut)) {
                const normalizedNodeId = normalizePropertyShortcutNodeId(shortcut.nodeId);
                return {
                    key,
                    shortcut,
                    folder: null,
                    note: null,
                    search: null,
                    tagPath: null,
                    propertyNodeId: normalizedNodeId ?? shortcut.nodeId,
                    isMissing: !normalizedNodeId
                };
            }

            // Search shortcut
            return {
                key,
                shortcut,
                folder: null,
                note: null,
                search: shortcut,
                tagPath: null,
                propertyNodeId: null,
                isMissing: false
            };
        });
    }, [rawShortcuts, shortcutTargetResolution]);

    // Inserts a shortcut at the specified index or appends to the end
    const insertShortcut = useCallback(
        async (shortcut: ShortcutEntry, index?: number) => {
            return updateActiveProfileShortcuts(existing => {
                const next = [...existing];
                const insertAt = typeof index === 'number' ? Math.max(0, Math.min(index, next.length)) : next.length;
                next.splice(insertAt, 0, shortcut);
                return next;
            });
        },
        [updateActiveProfileShortcuts]
    );

    // Adds multiple shortcuts, validating each type and showing notices for duplicates or invalid entries
    const addShortcutsBatch = useCallback(
        async (entries: ShortcutEntry[], options?: { index?: number }) => {
            if (entries.length === 0) {
                return 0;
            }

            // Create sets of existing paths/names for O(1) duplicate checking
            const folderPaths = new Set(folderShortcutKeysByPath.keys());
            const notePaths = new Set(noteShortcutKeysByPath.keys());
            const tagPaths = new Set(tagShortcutKeysByPath.keys());
            const propertyNodeIds = new Set(propertyShortcutKeysByNodeId.keys());
            const searchNames = new Set(searchShortcutsByName.keys());

            // Track validation errors to show notices after processing all entries
            let duplicateFolder = false;
            let duplicateNote = false;
            let duplicateTag = false;
            let invalidTag = false;
            let duplicateProperty = false;
            let invalidProperty = false;
            let duplicateSearch = false;
            let emptySearchName = false;
            let emptySearchQuery = false;

            // Validate and normalize each entry, tracking errors
            const normalizedEntries: ShortcutEntry[] = [];
            entries.forEach(entry => {
                if (entry.type === ShortcutType.FOLDER) {
                    if (folderPaths.has(entry.path)) {
                        duplicateFolder = true;
                        return;
                    }
                    folderPaths.add(entry.path);
                    normalizedEntries.push(entry);
                    return;
                }

                if (entry.type === ShortcutType.NOTE) {
                    if (notePaths.has(entry.path)) {
                        duplicateNote = true;
                        return;
                    }
                    notePaths.add(entry.path);
                    normalizedEntries.push(entry);
                    return;
                }

                if (entry.type === ShortcutType.TAG) {
                    const normalizedPath = normalizeTagPath(entry.tagPath);
                    if (!normalizedPath) {
                        invalidTag = true;
                        return;
                    }
                    if (tagPaths.has(normalizedPath)) {
                        duplicateTag = true;
                        return;
                    }
                    tagPaths.add(normalizedPath);
                    normalizedEntries.push({
                        ...entry,
                        tagPath: normalizedPath
                    });
                    return;
                }

                if (entry.type === ShortcutType.PROPERTY) {
                    const normalizedNodeId = normalizePropertyShortcutNodeId(entry.nodeId);
                    if (!normalizedNodeId) {
                        invalidProperty = true;
                        return;
                    }
                    if (propertyNodeIds.has(normalizedNodeId)) {
                        duplicateProperty = true;
                        return;
                    }
                    propertyNodeIds.add(normalizedNodeId);
                    if (normalizedNodeId === entry.nodeId) {
                        normalizedEntries.push(entry);
                        return;
                    }

                    normalizedEntries.push({
                        ...entry,
                        nodeId: normalizedNodeId
                    });
                    return;
                }

                if (entry.type === ShortcutType.SEARCH) {
                    const normalizedName = entry.name.trim();
                    const normalizedQuery = entry.query.trim();
                    const normalizedStartTarget = normalizeShortcutStartTarget(entry.startTarget);
                    if (!normalizedName) {
                        emptySearchName = true;
                        return;
                    }
                    if (!normalizedQuery) {
                        emptySearchQuery = true;
                        return;
                    }
                    const lookupKey = normalizeSearchShortcutName(normalizedName);
                    if (searchNames.has(lookupKey)) {
                        duplicateSearch = true;
                        return;
                    }
                    searchNames.add(lookupKey);
                    normalizedEntries.push({
                        ...entry,
                        name: normalizedName,
                        query: normalizedQuery,
                        startTarget: normalizedStartTarget
                    });
                }
            });

            // Show notices for any validation errors found
            if (duplicateFolder) {
                showNotice(strings.shortcuts.folderExists, { variant: 'warning' });
            }
            if (duplicateNote) {
                showNotice(strings.shortcuts.noteExists, { variant: 'warning' });
            }
            if (duplicateTag) {
                showNotice(strings.shortcuts.tagExists, { variant: 'warning' });
            }
            if (invalidTag) {
                showNotice(strings.modals.tagOperation.invalidTagName, { variant: 'warning' });
            }
            if (duplicateProperty) {
                showNotice(strings.shortcuts.propertyExists, { variant: 'warning' });
            }
            if (invalidProperty) {
                showNotice(strings.shortcuts.invalidProperty, { variant: 'warning' });
            }
            if (duplicateSearch) {
                showNotice(strings.shortcuts.searchExists, { variant: 'warning' });
            }
            if (emptySearchName) {
                showNotice(strings.shortcuts.emptySearchName, { variant: 'warning' });
            }
            if (emptySearchQuery) {
                showNotice(strings.shortcuts.emptySearchQuery, { variant: 'warning' });
            }

            if (normalizedEntries.length === 0) {
                return 0;
            }

            // Insert normalized entries at specified index, shifting subsequent items
            const updated = await updateActiveProfileShortcuts(existing => {
                const next = [...existing];
                let insertAt = typeof options?.index === 'number' ? Math.max(0, Math.min(options.index, next.length)) : next.length;

                normalizedEntries.forEach(entry => {
                    next.splice(insertAt, 0, entry);
                    insertAt += 1;
                });

                return next;
            });

            return updated ? normalizedEntries.length : 0;
        },
        [
            folderShortcutKeysByPath,
            noteShortcutKeysByPath,
            tagShortcutKeysByPath,
            propertyShortcutKeysByNodeId,
            searchShortcutsByName,
            updateActiveProfileShortcuts
        ]
    );

    // Adds a folder shortcut if it doesn't already exist
    const addFolderShortcut = useCallback(
        async (path: string, options?: { index?: number }) => {
            if (folderShortcutKeysByPath.has(path)) {
                showNotice(strings.shortcuts.folderExists, { variant: 'warning' });
                return false;
            }
            return insertShortcut({ type: ShortcutType.FOLDER, path }, options?.index);
        },
        [insertShortcut, folderShortcutKeysByPath]
    );

    // Adds a note shortcut if it doesn't already exist
    const addNoteShortcut = useCallback(
        async (path: string, options?: { index?: number }) => {
            if (noteShortcutKeysByPath.has(path)) {
                showNotice(strings.shortcuts.noteExists, { variant: 'warning' });
                return false;
            }
            return insertShortcut({ type: ShortcutType.NOTE, path }, options?.index);
        },
        [insertShortcut, noteShortcutKeysByPath]
    );

    // Adds a tag shortcut if it doesn't already exist
    const addTagShortcut = useCallback(
        async (tagPath: string, options?: { index?: number }) => {
            const normalizedPath = normalizeTagPath(tagPath);
            if (!normalizedPath) {
                return false;
            }
            if (tagShortcutKeysByPath.has(normalizedPath)) {
                showNotice(strings.shortcuts.tagExists, { variant: 'warning' });
                return false;
            }
            return insertShortcut({ type: ShortcutType.TAG, tagPath: normalizedPath }, options?.index);
        },
        [insertShortcut, tagShortcutKeysByPath]
    );

    const addPropertyShortcut = useCallback(
        async (nodeId: string, options?: { index?: number }) => {
            const normalizedNodeId = normalizePropertyShortcutNodeId(nodeId);
            if (!normalizedNodeId) {
                showNotice(strings.shortcuts.invalidProperty, { variant: 'warning' });
                return false;
            }
            if (propertyShortcutKeysByNodeId.has(normalizedNodeId)) {
                showNotice(strings.shortcuts.propertyExists, { variant: 'warning' });
                return false;
            }
            return insertShortcut({ type: ShortcutType.PROPERTY, nodeId: normalizedNodeId }, options?.index);
        },
        [insertShortcut, propertyShortcutKeysByNodeId]
    );

    // Adds a search shortcut with validation for name and query uniqueness
    const addSearchShortcut = useCallback(
        async (
            {
                name,
                query,
                provider,
                startTarget
            }: { name: string; query: string; provider: SearchProvider; startTarget?: ShortcutStartTarget },
            options?: { index?: number }
        ) => {
            const normalizedQuery = query.trim();
            if (!normalizedQuery) {
                showNotice(strings.shortcuts.emptySearchQuery, { variant: 'warning' });
                return false;
            }

            const normalizedName = name.trim();
            if (!normalizedName) {
                showNotice(strings.shortcuts.emptySearchName, { variant: 'warning' });
                return false;
            }

            const nameKey = normalizeSearchShortcutName(normalizedName);
            if (searchShortcutsByName.has(nameKey)) {
                showNotice(strings.shortcuts.searchExists, { variant: 'warning' });
                return false;
            }

            const normalizedStartTarget = normalizeShortcutStartTarget(startTarget);
            return insertShortcut(
                {
                    type: ShortcutType.SEARCH,
                    name: normalizedName,
                    query: normalizedQuery,
                    provider,
                    startTarget: normalizedStartTarget
                },
                options?.index
            );
        },
        [insertShortcut, searchShortcutsByName]
    );

    // Removes a shortcut by its unique key
    const removeShortcut = useCallback(
        async (key: string) => {
            if (!shortcutMap.has(key)) {
                return false;
            }

            return updateActiveProfileShortcuts(existing => {
                const filtered = existing.filter(entry => getShortcutKey(entry) !== key);
                return filtered.length === existing.length ? null : filtered;
            });
        },
        [shortcutMap, updateActiveProfileShortcuts]
    );

    const renameShortcut = useCallback(
        async (key: string, alias: string, defaultLabel?: string) => {
            const existing = shortcutMap.get(key);
            if (!existing || existing.type === ShortcutType.SEARCH) {
                return false;
            }

            const trimmedAlias = alias.trim();
            const trimmedDefaultLabel = defaultLabel?.trim();
            const nextAlias =
                trimmedAlias.length === 0 || (trimmedDefaultLabel && trimmedAlias === trimmedDefaultLabel) ? undefined : trimmedAlias;

            return updateActiveProfileShortcuts(current => {
                let changed = false;
                const next = current.map(entry => {
                    if (getShortcutKey(entry) !== key || entry.type === ShortcutType.SEARCH) {
                        return entry;
                    }

                    const normalizedCurrent = entry.alias && entry.alias.length > 0 ? entry.alias : undefined;
                    if (normalizedCurrent === nextAlias) {
                        return entry;
                    }

                    changed = true;
                    return { ...entry, alias: nextAlias };
                });

                return changed ? next : null;
            });
        },
        [shortcutMap, updateActiveProfileShortcuts]
    );

    // Removes a search shortcut by its name (case-insensitive)
    const removeSearchShortcut = useCallback(
        async (name: string) => {
            const shortcut = searchShortcutsByName.get(normalizeSearchShortcutName(name));
            if (!shortcut) {
                return false;
            }

            return removeShortcut(getShortcutKey(shortcut));
        },
        [removeShortcut, searchShortcutsByName]
    );

    // Removes all shortcuts from the active profile
    const clearShortcuts = useCallback(async () => {
        return updateActiveProfileShortcuts(() => []);
    }, [updateActiveProfileShortcuts]);

    // Reorders shortcuts based on provided key order (for drag & drop functionality)
    // Validates that all keys are present before applying the new order
    const reorderShortcuts = useCallback(
        async (orderedKeys: string[]) => {
            if (orderedKeys.length !== rawShortcuts.length) {
                return false;
            }

            const orderedEntries: ShortcutEntry[] = [];
            for (const key of orderedKeys) {
                const entry = shortcutMap.get(key);
                if (!entry) {
                    return false;
                }
                orderedEntries.push(entry);
            }

            return updateActiveProfileShortcuts(() => orderedEntries);
        },
        [rawShortcuts.length, shortcutMap, updateActiveProfileShortcuts]
    );

    // Checks if a folder shortcut exists for the given path
    const hasFolderShortcut = useCallback((path: string) => folderShortcutKeysByPath.has(path), [folderShortcutKeysByPath]);
    // Checks if a note shortcut exists for the given path
    const hasNoteShortcut = useCallback((path: string) => noteShortcutKeysByPath.has(path), [noteShortcutKeysByPath]);
    // Checks if a tag shortcut exists for the given tag path
    const hasTagShortcut = useCallback(
        (tagPath: string) => {
            const normalized = normalizeTagPath(tagPath);
            return normalized ? tagShortcutKeysByPath.has(normalized) : false;
        },
        [tagShortcutKeysByPath]
    );

    const hasPropertyShortcut = useCallback(
        (nodeId: string) => {
            const normalizedNodeId = normalizePropertyShortcutNodeId(nodeId);
            return normalizedNodeId ? propertyShortcutKeysByNodeId.has(normalizedNodeId) : false;
        },
        [propertyShortcutKeysByNodeId]
    );

    // Finds a search shortcut by name (case-insensitive)
    const findSearchShortcut = useCallback(
        (name: string) => searchShortcutsByName.get(normalizeSearchShortcutName(name)),
        [searchShortcutsByName]
    );

    const value: ShortcutsContextValue = useMemo(
        () => ({
            shortcuts: rawShortcuts,
            hydratedShortcuts,
            shortcutMap,
            folderShortcutKeysByPath,
            noteShortcutKeysByPath,
            tagShortcutKeysByPath,
            propertyShortcutKeysByNodeId,
            searchShortcutsByName,
            addFolderShortcut,
            addNoteShortcut,
            addTagShortcut,
            addPropertyShortcut,
            addSearchShortcut,
            addShortcutsBatch,
            removeShortcut,
            renameShortcut,
            removeSearchShortcut,
            clearShortcuts,
            reorderShortcuts,
            hasFolderShortcut,
            hasNoteShortcut,
            hasTagShortcut,
            hasPropertyShortcut,
            findSearchShortcut
        }),
        [
            rawShortcuts,
            hydratedShortcuts,
            shortcutMap,
            folderShortcutKeysByPath,
            noteShortcutKeysByPath,
            tagShortcutKeysByPath,
            propertyShortcutKeysByNodeId,
            searchShortcutsByName,
            addFolderShortcut,
            addNoteShortcut,
            addTagShortcut,
            addPropertyShortcut,
            addSearchShortcut,
            addShortcutsBatch,
            removeShortcut,
            renameShortcut,
            removeSearchShortcut,
            clearShortcuts,
            reorderShortcuts,
            hasFolderShortcut,
            hasNoteShortcut,
            hasTagShortcut,
            hasPropertyShortcut,
            findSearchShortcut
        ]
    );

    return <ShortcutsContext.Provider value={value}>{children}</ShortcutsContext.Provider>;
}

/**
 * Hook to access the shortcuts context.
 * Must be used within a ShortcutsProvider.
 */
export function useShortcuts() {
    const context = useContext(ShortcutsContext);
    if (!context) {
        throw new Error('useShortcuts must be used within a ShortcutsProvider');
    }
    return context;
}
