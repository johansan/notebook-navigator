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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TFolder, type App, debounce } from 'obsidian';

import type { ActiveProfileState } from '../context/SettingsContext';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { MetadataService } from '../services/MetadataService';
import { getDBInstance, getDBInstanceOrNull } from '../storage/fileOperations';
import { FOLDER_NOTE_TYPE_EXTENSIONS } from '../types/folderNote';
import { TIMEOUTS } from '../types/obsidian-extended';
import {
    createFrontmatterPropertyExclusionMatcher,
    createHiddenFileNameMatcherForVisibility,
    isFolderInExcludedFolder,
    shouldExcludeFileWithMatcher
} from '../utils/fileFilters';
import { resolveFolderDisplayName } from '../utils/folderDisplayName';
import { resolveFolderNoteName } from '../utils/folderNoteName';
import { getFolderNote, getFolderNoteDetectionSettings } from '../utils/folderNoteLookup';
import { EXCALIDRAW_BASENAME_SUFFIX } from '../utils/fileNameUtils';
import { getParentFolderPath, getPathBaseName } from '../utils/pathUtils';
import { getCachedFileTags } from '../utils/tagUtils';
import { createHiddenTagVisibility } from '../utils/tagPrefixMatcher';
import { type RootFileChangeEvent, useRootFolderOrder } from './useRootFolderOrder';

const FOLDER_SORT_NAME_CACHE_MAX_ENTRIES = 2000;
const FOLDER_NOTE_EXTENSIONS = new Set<string>(Object.values(FOLDER_NOTE_TYPE_EXTENSIONS));

export interface FolderNavigationSourceState {
    hiddenFolders: string[];
    rootFolders: TFolder[];
    rootLevelFolders: TFolder[];
    rootFolderOrderMap: Map<string, number>;
    missingRootFolderPaths: string[];
    fileChangeVersion: number;
    folderChangeVersion: number;
    folderDisplayVersion: number;
    metadataDecorationVersion: number;
    metadataVisibilityVersion: number;
    tagDataVersion: number;
    propertyDataVersion: number;
    getFolderSortName: (folder: TFolder) => string;
    folderExclusionByFolderNote: ((folder: TFolder) => boolean) | undefined;
    isFolderExcluded: (folderPath: string) => boolean;
}

interface UseFolderNavigationSourceStateParams {
    app: App;
    settings: NotebookNavigatorSettings;
    activeProfile: ActiveProfileState;
    metadataService: MetadataService;
    onFileChange?: (change: RootFileChangeEvent) => void;
}

export function useFolderNavigationSourceState({
    app,
    settings,
    activeProfile,
    metadataService,
    onFileChange
}: UseFolderNavigationSourceStateParams): FolderNavigationSourceState {
    const { hiddenFolders, hiddenFileProperties, hiddenFileNames, hiddenFileTags } = activeProfile;
    const folderVisibilityFileNameMatcher = useMemo(() => {
        return createHiddenFileNameMatcherForVisibility(hiddenFileNames, false);
    }, [hiddenFileNames]);
    const hiddenFilePropertyMatcher = useMemo(
        () => createFrontmatterPropertyExclusionMatcher(hiddenFileProperties),
        [hiddenFileProperties]
    );
    const folderNoteSettings = useMemo(() => {
        return getFolderNoteDetectionSettings({
            enableFolderNotes: settings.enableFolderNotes,
            folderNoteName: settings.folderNoteName,
            folderNoteNamePattern: settings.folderNoteNamePattern
        });
    }, [settings.enableFolderNotes, settings.folderNoteName, settings.folderNoteNamePattern]);
    const shouldEvaluateFolderNoteExclusions = useMemo(() => {
        return (
            settings.enableFolderNotes &&
            (hiddenFilePropertyMatcher.hasCriteria || folderVisibilityFileNameMatcher !== null || hiddenFileTags.length > 0)
        );
    }, [settings.enableFolderNotes, hiddenFilePropertyMatcher, hiddenFileTags, folderVisibilityFileNameMatcher]);

    const isFolderNoteRelatedPath = useCallback(
        (path: string): boolean => {
            if (!shouldEvaluateFolderNoteExclusions) {
                return false;
            }

            const parentPath = getParentFolderPath(path);
            if (parentPath === '/') {
                return false;
            }

            const fileName = path.split('/').pop();
            if (!fileName) {
                return false;
            }

            const dotIndex = fileName.lastIndexOf('.');
            if (dotIndex <= 0 || dotIndex === fileName.length - 1) {
                return false;
            }

            const basename = fileName.slice(0, dotIndex);
            const extension = fileName.slice(dotIndex + 1).toLowerCase();
            const folderName = getPathBaseName(parentPath);
            const expectedName = resolveFolderNoteName(folderName, folderNoteSettings);

            if (basename === expectedName && FOLDER_NOTE_EXTENSIONS.has(extension)) {
                return true;
            }

            return extension === 'md' && basename === `${expectedName}${EXCALIDRAW_BASENAME_SUFFIX}`;
        },
        [folderNoteSettings, shouldEvaluateFolderNoteExclusions]
    );

    const [folderExclusionVersion, setFolderExclusionVersion] = useState(0);
    const [fileChangeVersion, setFileChangeVersion] = useState(0);
    const [folderChangeVersion, setFolderChangeVersion] = useState(0);

    // Vault file events can arrive once per file during moves, deletes, and syncs.
    // The trailing timer collapses each burst; the max-wait timer refreshes during continuous bursts.
    const fileChangeVersionTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
    const fileChangeVersionMaxWaitTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
    const clearScheduledFileChangeVersionBump = useCallback(() => {
        if (fileChangeVersionTimerRef.current !== null) {
            window.clearTimeout(fileChangeVersionTimerRef.current);
            fileChangeVersionTimerRef.current = null;
        }
        if (fileChangeVersionMaxWaitTimerRef.current !== null) {
            window.clearTimeout(fileChangeVersionMaxWaitTimerRef.current);
            fileChangeVersionMaxWaitTimerRef.current = null;
        }
    }, []);
    const flushFileChangeVersion = useCallback(() => {
        clearScheduledFileChangeVersionBump();
        setFileChangeVersion(value => value + 1);
    }, [clearScheduledFileChangeVersionBump]);
    const scheduleFileChangeVersionBump = useCallback(() => {
        if (fileChangeVersionTimerRef.current !== null) {
            window.clearTimeout(fileChangeVersionTimerRef.current);
        }

        fileChangeVersionTimerRef.current = window.setTimeout(flushFileChangeVersion, TIMEOUTS.NAVIGATION_FILE_CHANGE_DEBOUNCE);
        if (fileChangeVersionMaxWaitTimerRef.current === null) {
            fileChangeVersionMaxWaitTimerRef.current = window.setTimeout(flushFileChangeVersion, TIMEOUTS.NAVIGATION_FILE_CHANGE_MAX_WAIT);
        }
    }, [flushFileChangeVersion]);
    useEffect(() => clearScheduledFileChangeVersionBump, [clearScheduledFileChangeVersionBump]);
    const handleRootFolderChange = useCallback(() => {
        setFolderChangeVersion(value => value + 1);
    }, []);
    const handleRootFileChange = useCallback(
        (change: RootFileChangeEvent) => {
            scheduleFileChangeVersionBump();
            onFileChange?.(change);
            if (isFolderNoteRelatedPath(change.path) || (change.oldPath !== undefined && isFolderNoteRelatedPath(change.oldPath))) {
                setFolderExclusionVersion(value => value + 1);
            }
        },
        [isFolderNoteRelatedPath, onFileChange, scheduleFileChangeVersionBump]
    );

    const { rootFolders, rootLevelFolders, rootFolderOrderMap, missingRootFolderPaths } = useRootFolderOrder({
        settings,
        onFileChange: handleRootFileChange,
        onFolderChange: handleRootFolderChange
    });

    const [folderDisplayVersion, setFolderDisplayVersion] = useState(() => metadataService.getFolderDisplayVersion());
    const [folderDisplayNameVersion, setFolderDisplayNameVersion] = useState(() => metadataService.getFolderDisplayNameVersion());

    useEffect(() => {
        setFolderDisplayVersion(metadataService.getFolderDisplayVersion());
        const applyFolderDisplayVersion = debounce(
            (version: number) => {
                setFolderDisplayVersion(version);
            },
            TIMEOUTS.FILE_OPERATION_DELAY,
            true
        );
        const unsubscribe = metadataService.subscribeToFolderDisplayChanges(version => {
            applyFolderDisplayVersion(version);
        });

        return () => {
            unsubscribe();
            applyFolderDisplayVersion.cancel();
        };
    }, [metadataService]);

    useEffect(() => {
        setFolderDisplayNameVersion(metadataService.getFolderDisplayNameVersion());
        const applyFolderDisplayNameVersion = debounce(
            (version: number) => {
                setFolderDisplayNameVersion(version);
            },
            TIMEOUTS.FILE_OPERATION_DELAY,
            true
        );
        const unsubscribe = metadataService.subscribeToFolderDisplayNameChanges(version => {
            applyFolderDisplayNameVersion(version);
        });

        return () => {
            unsubscribe();
            applyFolderDisplayNameVersion.cancel();
        };
    }, [metadataService]);

    const [metadataDecorationVersion, setMetadataDecorationVersion] = useState(0);
    const [metadataVisibilityVersion, setMetadataVisibilityVersion] = useState(0);
    const [tagDataVersion, setTagDataVersion] = useState(0);
    const [propertyDataVersion, setPropertyDataVersion] = useState(0);

    useEffect(() => {
        const db = getDBInstance();
        const bumpFolderExclusionVersion = debounce(
            () => {
                setFolderExclusionVersion(version => version + 1);
            },
            TIMEOUTS.FILE_OPERATION_DELAY,
            true
        );
        const unsubscribe = db.onContentChange(changes => {
            let hasMetadataDecorationChange = false;
            let hasMetadataVisibilityChange = false;
            let hasTagDataChange = false;
            let hasPropertyDataChange = false;
            let shouldRefreshFolderExclusions = false;
            const folderNotePathByParentPath = new Map<string, string | null>();

            for (const change of changes) {
                const hasTagChange = change.changes.tags !== undefined;
                const hasPropertyChange = change.changes.properties !== undefined;
                const hasMetadataVisibilityChangeForFile = change.metadataHiddenChanged === true;

                if (change.metadataDecorationChanged === true) {
                    hasMetadataDecorationChange = true;
                }
                if (hasMetadataVisibilityChangeForFile) {
                    hasMetadataVisibilityChange = true;
                }
                if (hasTagChange) {
                    hasTagDataChange = true;
                }
                if (hasPropertyChange) {
                    hasPropertyDataChange = true;
                }

                if (!shouldEvaluateFolderNoteExclusions || shouldRefreshFolderExclusions) {
                    continue;
                }

                const canAffectFolderNoteExclusion =
                    (hiddenFilePropertyMatcher.hasCriteria && hasMetadataVisibilityChangeForFile) ||
                    (hiddenFileTags.length > 0 && hasTagChange);
                if (!canAffectFolderNoteExclusion) {
                    continue;
                }

                const parentPath = getParentFolderPath(change.path);
                let cachedFolderNotePath = folderNotePathByParentPath.get(parentPath);
                if (cachedFolderNotePath === undefined) {
                    const parentFolder = app.vault.getFolderByPath(parentPath);
                    cachedFolderNotePath = parentFolder ? (getFolderNote(parentFolder, folderNoteSettings)?.path ?? null) : null;
                    folderNotePathByParentPath.set(parentPath, cachedFolderNotePath);
                }

                if (cachedFolderNotePath === change.path) {
                    shouldRefreshFolderExclusions = true;
                }
            }

            if (hasMetadataDecorationChange) {
                setMetadataDecorationVersion(version => version + 1);
            }
            if (hasMetadataVisibilityChange) {
                setMetadataVisibilityVersion(version => version + 1);
            }
            if (hasTagDataChange) {
                setTagDataVersion(version => version + 1);
            }
            if (hasPropertyDataChange) {
                setPropertyDataVersion(version => version + 1);
            }
            if (shouldRefreshFolderExclusions) {
                bumpFolderExclusionVersion();
            }
        });
        return () => {
            unsubscribe();
            bumpFolderExclusionVersion.cancel();
        };
    }, [app, folderNoteSettings, hiddenFilePropertyMatcher.hasCriteria, hiddenFileTags.length, shouldEvaluateFolderNoteExclusions]);

    const getFolderSortName = useMemo(() => {
        void folderDisplayNameVersion;
        const folderSortNameByPath = new Map<string, string>();
        const cacheFolderSortName = (path: string, name: string): string => {
            if (folderSortNameByPath.size >= FOLDER_SORT_NAME_CACHE_MAX_ENTRIES) {
                folderSortNameByPath.clear();
            }
            folderSortNameByPath.set(path, name);
            return name;
        };

        return (folder: TFolder): string => {
            const cachedName = folderSortNameByPath.get(folder.path);
            if (cachedName !== undefined) {
                return cachedName;
            }

            if (!settings.useFrontmatterMetadata) {
                return cacheFolderSortName(folder.path, folder.name);
            }

            const resolvedName = resolveFolderDisplayName({
                app,
                metadataService,
                settings: {
                    customVaultName: settings.customVaultName
                },
                folderPath: folder.path,
                fallbackName: folder.name
            });
            return cacheFolderSortName(folder.path, resolvedName);
        };
    }, [app, settings.customVaultName, settings.useFrontmatterMetadata, metadataService, folderDisplayNameVersion]);

    const folderExclusionByFolderNote = useMemo(() => {
        void folderExclusionVersion;
        if (!shouldEvaluateFolderNoteExclusions) {
            return undefined;
        }

        const hiddenFileTagVisibility = createHiddenTagVisibility(hiddenFileTags, false);
        const shouldFilterHiddenFileTags = hiddenFileTagVisibility.hasHiddenRules;
        const db = shouldFilterHiddenFileTags ? getDBInstanceOrNull() : null;
        const directExclusionCache = new Map<string, boolean>();
        const inheritedExclusionCache = new Map<string, boolean>();
        const recursionGuard = new Set<string>();

        const isDirectlyExcludedByFolderNote = (folder: TFolder): boolean => {
            const cached = directExclusionCache.get(folder.path);
            if (cached !== undefined) {
                return cached;
            }

            const folderNote = getFolderNote(folder, folderNoteSettings);
            if (!folderNote) {
                directExclusionCache.set(folder.path, false);
                return false;
            }

            let isExcluded = false;
            if (hiddenFilePropertyMatcher.hasCriteria && shouldExcludeFileWithMatcher(folderNote, hiddenFilePropertyMatcher, app)) {
                isExcluded = true;
            }

            if (!isExcluded && folderVisibilityFileNameMatcher && folderVisibilityFileNameMatcher.matches(folderNote)) {
                isExcluded = true;
            }

            if (!isExcluded && shouldFilterHiddenFileTags) {
                const tags = getCachedFileTags({ app, file: folderNote, db });
                if (tags.some(tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue))) {
                    isExcluded = true;
                }
            }

            directExclusionCache.set(folder.path, isExcluded);
            return isExcluded;
        };

        const isExcludedByFolderNote = (folder: TFolder): boolean => {
            if (folder.path === '/') {
                return false;
            }

            const cached = inheritedExclusionCache.get(folder.path);
            if (cached !== undefined) {
                return cached;
            }

            if (recursionGuard.has(folder.path)) {
                return false;
            }
            recursionGuard.add(folder.path);

            let isExcluded = isDirectlyExcludedByFolderNote(folder);
            if (!isExcluded && folder.parent instanceof TFolder) {
                isExcluded = isExcludedByFolderNote(folder.parent);
            }

            recursionGuard.delete(folder.path);
            inheritedExclusionCache.set(folder.path, isExcluded);
            return isExcluded;
        };

        return (folder: TFolder): boolean => isExcludedByFolderNote(folder);
    }, [
        app,
        folderExclusionVersion,
        folderNoteSettings,
        folderVisibilityFileNameMatcher,
        hiddenFilePropertyMatcher,
        hiddenFileTags,
        shouldEvaluateFolderNoteExclusions
    ]);

    const isFolderExcluded = useCallback(
        (folderPath: string): boolean => {
            if (folderPath === '/') {
                return false;
            }

            const folder = app.vault.getFolderByPath(folderPath);
            if (!(folder instanceof TFolder)) {
                return false;
            }

            if (hiddenFolders.length > 0 && isFolderInExcludedFolder(folder, hiddenFolders)) {
                return true;
            }

            return folderExclusionByFolderNote ? folderExclusionByFolderNote(folder) : false;
        },
        [app, folderExclusionByFolderNote, hiddenFolders]
    );

    return useMemo(
        () => ({
            hiddenFolders,
            rootFolders,
            rootLevelFolders,
            rootFolderOrderMap,
            missingRootFolderPaths,
            fileChangeVersion,
            folderChangeVersion,
            folderDisplayVersion,
            metadataDecorationVersion,
            metadataVisibilityVersion,
            tagDataVersion,
            propertyDataVersion,
            getFolderSortName,
            folderExclusionByFolderNote,
            isFolderExcluded
        }),
        [
            folderExclusionByFolderNote,
            folderChangeVersion,
            folderDisplayVersion,
            fileChangeVersion,
            getFolderSortName,
            hiddenFolders,
            isFolderExcluded,
            metadataDecorationVersion,
            metadataVisibilityVersion,
            missingRootFolderPaths,
            propertyDataVersion,
            rootFolders,
            rootFolderOrderMap,
            rootLevelFolders,
            tagDataVersion
        ]
    );
}
