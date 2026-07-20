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

import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import type { TFile } from 'obsidian';
import { TIMEOUTS } from '../../types/obsidian-extended';
import type { ContentProviderType, FileContentType } from '../../interfaces/IContentProvider';
import type { ContentProviderRegistry } from '../../services/content/ContentProviderRegistry';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { calculateFileDiff } from '../../storage/diffCalculator';
import { type FileData as DBFileData } from '../../storage/IndexedDBStorage';
import { getDBInstance, recordFileChanges, removeFilesFromCache } from '../../storage/fileOperations';
import { runAsyncAction } from '../../utils/async';
import {
    getActiveHiddenFileNames,
    getActiveHiddenFileTags,
    getActiveHiddenFileProperties,
    getActiveHiddenFolders
} from '../../utils/vaultProfiles';
import { clearCacheRebuildNoticeState, getCacheRebuildNoticeState, setCacheRebuildNoticeState } from './cacheRebuildNoticeStorage';
import { getCacheRebuildProgressTypes, getMetadataDependentTypes, haveStringArraysChanged } from './storageContentTypes';
import {
    clearFrontmatterMetadataCacheSignature,
    haveFrontmatterMetadataCacheSettingsChanged,
    markFrontmatterMetadataCacheCurrent
} from '../../utils/frontmatterMetadataCache';

/**
 * Reacts to settings/profile changes that affect storage and derived content.
 *
 * The settings UI can emit many changes in a short time (toggling switches, editing lists, changing profiles).
 * This hook batches those changes and ensures only one async "settings reaction" runs at a time.
 *
 * It handles two categories of updates:
 * - Content provider settings: forwarded to `ContentProviderRegistry.handleSettingsChange()` and then used to queue
 *   any required regeneration work.
 * - Exclusions (hidden folders/file properties): triggers a diff so the database and navigation trees reflect the
 *   new visibility rules.
 */
export function useStorageSettingsSync(params: {
    settings: NotebookNavigatorSettings;
    stoppedRef: MutableRefObject<boolean>;
    contentRegistryRef: MutableRefObject<ContentProviderRegistry | null>;
    hiddenFolders: string[];
    hiddenFileProperties: string[];
    hiddenFileNames: string[];
    hiddenFileTags: string[];
    scheduleTagTreeRebuild: (options?: { flush?: boolean }) => void;
    schedulePropertyTreeRebuild: (options?: { flush?: boolean }) => void;
    getIndexableFiles: () => TFile[];
    pendingRenameDataRef: MutableRefObject<Map<string, DBFileData>>;
    queueMetadataContentWhenReady: (
        files: TFile[],
        includeTypes?: ContentProviderType[],
        settingsOverride?: NotebookNavigatorSettings
    ) => void;
    queueIndexableFilesForContentGeneration: (files: TFile[], settings: NotebookNavigatorSettings) => { markdownFiles: TFile[] };
    queueIndexableFilesNeedingContentGeneration: (filesToCheck: TFile[], allFiles: TFile[], settings: NotebookNavigatorSettings) => void;
    startCacheRebuildNotice: (total: number, enabledTypes: FileContentType[]) => void;
    clearCacheRebuildNotice: () => void;
}): { resetPendingSettingsChanges: () => void } {
    const {
        settings,
        stoppedRef,
        contentRegistryRef,
        hiddenFolders,
        hiddenFileProperties,
        hiddenFileNames,
        hiddenFileTags,
        scheduleTagTreeRebuild,
        schedulePropertyTreeRebuild,
        getIndexableFiles,
        pendingRenameDataRef,
        queueMetadataContentWhenReady,
        queueIndexableFilesForContentGeneration,
        queueIndexableFilesNeedingContentGeneration,
        startCacheRebuildNotice,
        clearCacheRebuildNotice
    } = params;

    const settingsChangeProcessingRef = useRef(false);
    const pendingSettingsChangeRef = useRef<NotebookNavigatorSettings | null>(null);
    const lastHandledSettingsRef = useRef<NotebookNavigatorSettings | null>(null);
    const pendingSettingsChangeTimeoutIdRef = useRef<number | null>(null);
    const prevSettingsRef = useRef<NotebookNavigatorSettings | null>(null);

    const clearPendingSettingsChangeTimer = useCallback(() => {
        if (pendingSettingsChangeTimeoutIdRef.current === null) {
            return;
        }
        if (typeof window !== 'undefined') {
            window.clearTimeout(pendingSettingsChangeTimeoutIdRef.current);
        }
        pendingSettingsChangeTimeoutIdRef.current = null;
    }, []);

    const resetPendingSettingsChanges = useCallback(() => {
        clearPendingSettingsChangeTimer();
        pendingSettingsChangeRef.current = null;
    }, [clearPendingSettingsChangeTimer]);

    const handleSettingsChanges = useCallback(
        async (oldSettings: NotebookNavigatorSettings, newSettings: NotebookNavigatorSettings) => {
            const registry = contentRegistryRef.current;
            if (!registry) {
                return;
            }

            const clearSettingsNotice = (): void => {
                const state = getCacheRebuildNoticeState();
                if (state?.source !== 'settings') {
                    return;
                }
                clearCacheRebuildNotice();
                clearCacheRebuildNoticeState();
            };

            // Provider-level settings may change which files need content and which providers should run.
            const affectedProviders = await registry.handleSettingsChange(oldSettings, newSettings);
            if (haveFrontmatterMetadataCacheSettingsChanged(oldSettings, newSettings)) {
                if (newSettings.useFrontmatterMetadata) {
                    markFrontmatterMetadataCacheCurrent(newSettings);
                } else {
                    clearFrontmatterMetadataCacheSignature();
                }
            }

            const enabledFeatureImages = oldSettings.showFeatureImage !== newSettings.showFeatureImage && newSettings.showFeatureImage;
            const shouldShowIndexNotice = (affectedProviders.length > 0 || enabledFeatureImages) && !stoppedRef.current;

            if (shouldShowIndexNotice) {
                const enabledTypes = getCacheRebuildProgressTypes(newSettings);
                if (enabledTypes.length > 0) {
                    const state = getCacheRebuildNoticeState();
                    if (state?.source !== 'rebuild') {
                        const db = getDBInstance();
                        const total = db.getFilesNeedingAnyContent(enabledTypes).size;
                        if (total > 0) {
                            setCacheRebuildNoticeState({ total, source: 'settings', types: enabledTypes });
                            startCacheRebuildNotice(total, enabledTypes);
                        } else {
                            clearSettingsNotice();
                        }
                    }
                } else {
                    clearSettingsNotice();
                }
            }

            if (stoppedRef.current || !contentRegistryRef.current) {
                return;
            }

            const metadataDependentTypes = getMetadataDependentTypes(newSettings);
            const affectedProviderTypeSet = new Set<ContentProviderType>(affectedProviders);
            // Queue only metadata providers that were affected by this settings change.
            const metadataTypesToQueue = metadataDependentTypes.filter(type => affectedProviderTypeSet.has(type));
            // Enabling feature images requires markdown pipeline reprocessing for markdown files.
            if (enabledFeatureImages && !metadataTypesToQueue.includes('markdownPipeline')) {
                metadataTypesToQueue.push('markdownPipeline');
            }
            const shouldQueueContent = metadataTypesToQueue.length > 0 || enabledFeatureImages;
            if (!shouldQueueContent) {
                return;
            }

            const allFiles = getIndexableFiles();
            if (stoppedRef.current || !contentRegistryRef.current) {
                return;
            }

            const { markdownFiles } = queueIndexableFilesForContentGeneration(allFiles, newSettings);
            if (metadataTypesToQueue.length > 0) {
                queueMetadataContentWhenReady(markdownFiles, metadataTypesToQueue, newSettings);
            }
        },
        [
            clearCacheRebuildNotice,
            contentRegistryRef,
            getIndexableFiles,
            queueIndexableFilesForContentGeneration,
            queueMetadataContentWhenReady,
            startCacheRebuildNotice,
            stoppedRef
        ]
    );

    const drainPendingSettingsChanges = useCallback(async () => {
        if (settingsChangeProcessingRef.current) {
            return;
        }

        settingsChangeProcessingRef.current = true;

        try {
            while (!stoppedRef.current) {
                const nextSettings = pendingSettingsChangeRef.current;
                if (!nextSettings) {
                    return;
                }
                pendingSettingsChangeRef.current = null;

                const previousHandled = lastHandledSettingsRef.current;
                if (!previousHandled) {
                    lastHandledSettingsRef.current = nextSettings;
                    continue;
                }

                await handleSettingsChanges(previousHandled, nextSettings);
                lastHandledSettingsRef.current = nextSettings;
            }
        } finally {
            settingsChangeProcessingRef.current = false;
        }
    }, [handleSettingsChanges, stoppedRef]);

    const scheduleSettingsChanges = useCallback(
        (oldSettings: NotebookNavigatorSettings, newSettings: NotebookNavigatorSettings) => {
            if (stoppedRef.current) {
                return;
            }

            if (!lastHandledSettingsRef.current) {
                lastHandledSettingsRef.current = oldSettings;
            }

            pendingSettingsChangeRef.current = newSettings;

            if (settingsChangeProcessingRef.current) {
                return;
            }

            clearPendingSettingsChangeTimer();
            if (typeof window === 'undefined') {
                runAsyncAction(() => drainPendingSettingsChanges());
                return;
            }

            // Debounce to collapse rapid settings toggles into a single regeneration pass.
            pendingSettingsChangeTimeoutIdRef.current = window.setTimeout(() => {
                pendingSettingsChangeTimeoutIdRef.current = null;
                runAsyncAction(() => drainPendingSettingsChanges());
            }, TIMEOUTS.DEBOUNCE_CONTENT);
        },
        [clearPendingSettingsChangeTimer, drainPendingSettingsChanges, stoppedRef]
    );

    useEffect(() => {
        const previousSettings = prevSettingsRef.current;
        if (!previousSettings) {
            prevSettingsRef.current = settings;
            return;
        }

        const registry = contentRegistryRef.current;
        const relevantSettings = registry?.getAllRelevantSettings() ?? [];
        const hasRelevantSettingsChange =
            !registry || relevantSettings.some(settingKey => previousSettings[settingKey] !== settings[settingKey]);
        if (hasRelevantSettingsChange) {
            scheduleSettingsChanges(previousSettings, settings);
        }

        // Exclusion settings influence which files exist in the cache. Folder/file changes require a diff-based
        // resync. File name and file tag pattern changes affect navigation visibility but do not require
        // rewriting file records.
        const previousHiddenFolders = getActiveHiddenFolders(previousSettings);
        const excludedFoldersChanged = haveStringArraysChanged(previousHiddenFolders, hiddenFolders);
        const previousHiddenFileProperties = getActiveHiddenFileProperties(previousSettings);
        const excludedFilePropertiesChanged = haveStringArraysChanged(previousHiddenFileProperties, hiddenFileProperties);
        const previousHiddenFileNames = getActiveHiddenFileNames(previousSettings);
        const excludedFileNamesChanged = haveStringArraysChanged(previousHiddenFileNames, hiddenFileNames);
        const previousHiddenFileTags = getActiveHiddenFileTags(previousSettings);
        const excludedFileTagsChanged = haveStringArraysChanged(previousHiddenFileTags, hiddenFileTags);

        if (excludedFoldersChanged || excludedFilePropertiesChanged) {
            runAsyncAction(async () => {
                try {
                    const allFiles = getIndexableFiles();
                    const { toAdd, toUpdate, toRemove, existingData } = calculateFileDiff(allFiles);

                    if (toRemove.length > 0) {
                        await removeFilesFromCache(toRemove);
                    }

                    if (toAdd.length > 0 || toUpdate.length > 0) {
                        await recordFileChanges([...toAdd, ...toUpdate], existingData, pendingRenameDataRef.current);
                    }

                    if (settings.showTags) {
                        scheduleTagTreeRebuild();
                    }
                    schedulePropertyTreeRebuild();

                    queueIndexableFilesNeedingContentGeneration([...toAdd, ...toUpdate], allFiles, settings);
                } catch (error: unknown) {
                    console.error('Error resyncing cache after exclusion changes:', error);
                }
            });
        } else if (excludedFileNamesChanged || excludedFileTagsChanged) {
            if (settings.showTags) {
                scheduleTagTreeRebuild();
            }
            schedulePropertyTreeRebuild();
        }

        prevSettingsRef.current = settings;
    }, [
        contentRegistryRef,
        getIndexableFiles,
        hiddenFileNames,
        hiddenFileTags,
        hiddenFileProperties,
        hiddenFolders,
        pendingRenameDataRef,
        queueIndexableFilesNeedingContentGeneration,
        scheduleSettingsChanges,
        scheduleTagTreeRebuild,
        schedulePropertyTreeRebuild,
        settings
    ]);

    useEffect(() => {
        return () => {
            resetPendingSettingsChanges();
        };
    }, [resetPendingSettingsChanges]);

    return { resetPendingSettingsChanges };
}
