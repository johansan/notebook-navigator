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

import type { ContentProviderType } from '../../interfaces/IContentProvider';
import { FeatureImageBlobStore, FEATURE_IMAGE_STORE_NAME, computeFeatureImageMutation } from '../FeatureImageBlobStore';
import { MemoryFileCache } from '../MemoryFileCache';
import { getProviderProcessedMtimeField } from '../providerMtime';
import { PREVIEW_STORE_NAME, STORE_NAME } from './constants';
import {
    createDefaultFileData,
    getChangedPropertyKeys,
    hasMetadataDecorationChanged,
    hasMetadataHiddenChanged,
    hasMetadataNameChanged,
    normalizeTaskCounters,
    type FileContentChange,
    type FileData,
    type PreviewStatus
} from './fileData';
import { rejectWithTransactionError } from './idbErrors';

export interface BatchContentUpdate {
    path: string;
    tags?: string[] | null;
    wordCount?: number | null;
    characterCountWithSpaces?: number | null;
    characterCountWithoutSpaces?: number | null;
    taskTotal?: number | null;
    taskUnfinished?: number | null;
    preview?: string;
    featureImage?: Blob | null;
    featureImageKey?: string | null;
    metadata?: FileData['metadata'];
    properties?: FileData['properties'];
}

export interface ProviderProcessedMtimeUpdate {
    path: string;
    mtime: number;
    expectedPreviousMtime: number;
}

export interface BatchUpdateFileContentAndProviderProcessedMtimesParams {
    contentUpdates: BatchContentUpdate[];
    provider?: ContentProviderType;
    processedMtimeUpdates?: ProviderProcessedMtimeUpdate[];
}

interface BatchContentUpdateOperationDeps {
    db: IDBDatabase;
    cache: MemoryFileCache;
    normalizeFileData: (data: Partial<FileData> & { preview?: string | null }) => FileData;
    featureImageBlobs: Pick<FeatureImageBlobStore, 'deleteFromCache'>;
    emitChanges: (changes: FileContentChange[]) => void;
}

export async function runBatchUpdateFileContentAndProviderProcessedMtimes(
    deps: BatchContentUpdateOperationDeps,
    params: BatchUpdateFileContentAndProviderProcessedMtimesParams
): Promise<void> {
    const contentUpdates = params.contentUpdates;
    const processedMtimeUpdates = params.processedMtimeUpdates ?? [];
    const provider = params.provider;

    if (processedMtimeUpdates.length > 0 && !provider) {
        throw new Error('Provider type required when updating processed mtimes');
    }

    if (contentUpdates.length === 0 && processedMtimeUpdates.length === 0) {
        return;
    }

    const contentUpdatesByPath = new Map<string, (typeof contentUpdates)[number]>();
    for (const update of contentUpdates) {
        contentUpdatesByPath.set(update.path, update);
    }

    const processedMtimeUpdatesByPath = new Map<string, (typeof processedMtimeUpdates)[number]>();
    for (const update of processedMtimeUpdates) {
        processedMtimeUpdatesByPath.set(update.path, update);
    }

    const pathsToUpdate = new Set<string>();
    contentUpdatesByPath.forEach((_value, path) => pathsToUpdate.add(path));
    processedMtimeUpdatesByPath.forEach((_value, path) => pathsToUpdate.add(path));

    if (pathsToUpdate.size === 0) {
        return;
    }

    const needsPreviewStore = contentUpdates.some(update => update.preview !== undefined);
    const needsFeatureImageStore = contentUpdates.some(update => update.featureImageKey !== undefined || update.featureImage !== undefined);
    const storeNames: string[] = [STORE_NAME];
    if (needsFeatureImageStore) {
        storeNames.push(FEATURE_IMAGE_STORE_NAME);
    }
    if (needsPreviewStore) {
        storeNames.push(PREVIEW_STORE_NAME);
    }

    const transaction = deps.db.transaction(storeNames, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const blobStore = needsFeatureImageStore ? transaction.objectStore(FEATURE_IMAGE_STORE_NAME) : null;
    const previewStore = needsPreviewStore ? transaction.objectStore(PREVIEW_STORE_NAME) : null;
    const filesToUpdate: { path: string; data: FileData }[] = [];
    const changeNotifications: FileContentChange[] = [];
    const featureImageCacheUpdates = new Set<string>();
    const previewTextUpdates: { path: string; previewText: string; previewStatus: PreviewStatus }[] = [];
    let createdRecordWithoutKnownMtime = 0;
    const createdRecordWithoutKnownMtimeExamples: string[] = [];

    await new Promise<void>((resolve, reject) => {
        const op = 'batchUpdateFileContentAndProviderProcessedMtimes';
        let lastRequestError: DOMException | Error | null = null;
        pathsToUpdate.forEach(path => {
            const update = contentUpdatesByPath.get(path);
            const processedMtimeUpdate = processedMtimeUpdatesByPath.get(path);

            const getReq = store.get(path);
            getReq.onsuccess = () => {
                const existingRaw = (getReq.result as Partial<FileData> | undefined) || null;
                const fallbackMtime = processedMtimeUpdate?.mtime ?? 0;
                const existing = existingRaw
                    ? deps.normalizeFileData(existingRaw)
                    : deps.normalizeFileData(createDefaultFileData({ mtime: fallbackMtime, path }));
                if (!existingRaw && fallbackMtime === 0 && update) {
                    createdRecordWithoutKnownMtime += 1;
                    if (createdRecordWithoutKnownMtimeExamples.length < 5) {
                        createdRecordWithoutKnownMtimeExamples.push(path);
                    }
                }
                const newData: FileData = { ...existing };
                const changes: FileContentChange['changes'] = {};
                let metadataHiddenChanged = false;
                let metadataNameChanged = false;
                let metadataDecorationChanged = false;
                let changedPropertyKeys: string[] | undefined;
                let hasContentChanges = false;
                const providerField = provider ? getProviderProcessedMtimeField(provider) : null;
                const shouldApplyProviderContent =
                    !provider ||
                    !processedMtimeUpdate ||
                    !providerField ||
                    newData[providerField] === processedMtimeUpdate.expectedPreviousMtime;
                const guardedUpdate = shouldApplyProviderContent ? update : null;
                const hasFeatureImageUpdate = guardedUpdate?.featureImageKey !== undefined || guardedUpdate?.featureImage !== undefined;
                const featureImageMutation =
                    guardedUpdate && hasFeatureImageUpdate
                        ? computeFeatureImageMutation({
                              existingKey: existing.featureImageKey,
                              existingStatus: existing.featureImageStatus,
                              featureImageKey: guardedUpdate.featureImageKey,
                              featureImage: guardedUpdate.featureImage
                          })
                        : null;

                if (guardedUpdate) {
                    if (guardedUpdate.tags !== undefined) {
                        newData.tags = guardedUpdate.tags;
                        changes.tags = guardedUpdate.tags;
                        hasContentChanges = true;
                    }
                    if (guardedUpdate.wordCount !== undefined) {
                        newData.wordCount = guardedUpdate.wordCount;
                        changes.wordCount = guardedUpdate.wordCount;
                        hasContentChanges = true;
                    }
                    if (guardedUpdate.characterCountWithSpaces !== undefined) {
                        newData.characterCountWithSpaces = guardedUpdate.characterCountWithSpaces;
                        changes.characterCountWithSpaces = guardedUpdate.characterCountWithSpaces;
                        hasContentChanges = true;
                    }
                    if (guardedUpdate.characterCountWithoutSpaces !== undefined) {
                        newData.characterCountWithoutSpaces = guardedUpdate.characterCountWithoutSpaces;
                        changes.characterCountWithoutSpaces = guardedUpdate.characterCountWithoutSpaces;
                        hasContentChanges = true;
                    }
                    const hasTaskUpdate = guardedUpdate.taskTotal !== undefined || guardedUpdate.taskUnfinished !== undefined;
                    if (hasTaskUpdate) {
                        // Task counters must be written together; normalization preserves pair semantics.
                        const normalizedTaskCounters = normalizeTaskCounters(guardedUpdate.taskTotal, guardedUpdate.taskUnfinished);
                        newData.taskTotal = normalizedTaskCounters.taskTotal;
                        newData.taskUnfinished = normalizedTaskCounters.taskUnfinished;
                        changes.taskTotal = normalizedTaskCounters.taskTotal;
                        changes.taskUnfinished = normalizedTaskCounters.taskUnfinished;
                        hasContentChanges = true;
                    }
                    if (guardedUpdate.properties !== undefined) {
                        changedPropertyKeys = getChangedPropertyKeys(existing.properties, guardedUpdate.properties);
                        newData.properties = guardedUpdate.properties;
                        changes.properties = guardedUpdate.properties;
                        hasContentChanges = true;
                    }
                    if (guardedUpdate.preview !== undefined) {
                        const previewStatus: PreviewStatus = guardedUpdate.preview.length > 0 ? 'has' : 'none';
                        newData.previewStatus = previewStatus;
                        changes.preview = guardedUpdate.preview;
                        if (existing.previewStatus !== previewStatus) {
                            changes.previewStatus = previewStatus;
                        }
                        hasContentChanges = true;
                        if (previewStore && previewStatus === 'has') {
                            const previewReq = previewStore.put(guardedUpdate.preview, path);
                            previewReq.onerror = () => {
                                lastRequestError = previewReq.error || null;
                                console.error('[IndexedDB] put failed', {
                                    store: PREVIEW_STORE_NAME,
                                    op,
                                    path,
                                    name: previewReq.error?.name,
                                    message: previewReq.error?.message
                                });
                            };
                            previewTextUpdates.push({ path, previewText: guardedUpdate.preview, previewStatus });
                        } else if (previewStore) {
                            const deleteReq = previewStore.delete(path);
                            deleteReq.onerror = () => {
                                lastRequestError = deleteReq.error || null;
                                console.error('[IndexedDB] delete failed', {
                                    store: PREVIEW_STORE_NAME,
                                    op,
                                    path,
                                    name: deleteReq.error?.name,
                                    message: deleteReq.error?.message
                                });
                            };
                        }
                    }

                    if (featureImageMutation) {
                        if (featureImageMutation.changes.featureImageKey !== undefined) {
                            changes.featureImageKey = featureImageMutation.changes.featureImageKey;
                            hasContentChanges = true;
                        }
                        if (featureImageMutation.changes.featureImageStatus !== undefined) {
                            changes.featureImageStatus = featureImageMutation.changes.featureImageStatus;
                            hasContentChanges = true;
                        }
                        // Main store records never hold blob data.
                        newData.featureImageKey = featureImageMutation.nextKey;
                        newData.featureImage = null;
                        newData.featureImageStatus = featureImageMutation.nextStatus;

                        if (featureImageMutation.shouldClearCache) {
                            featureImageCacheUpdates.add(path);
                        }
                    }

                    if (guardedUpdate.metadata !== undefined) {
                        metadataHiddenChanged = hasMetadataHiddenChanged(existing.metadata, guardedUpdate.metadata);
                        metadataNameChanged = hasMetadataNameChanged(existing.metadata, guardedUpdate.metadata);
                        metadataDecorationChanged = hasMetadataDecorationChanged(existing.metadata, guardedUpdate.metadata);
                        newData.metadata = guardedUpdate.metadata;
                        changes.metadata = guardedUpdate.metadata;
                        hasContentChanges = true;
                    }
                }

                let hasProviderMtimeChanges = false;
                if (processedMtimeUpdate && provider) {
                    const { mtime, expectedPreviousMtime } = processedMtimeUpdate;
                    const field = getProviderProcessedMtimeField(provider);
                    if (newData[field] === expectedPreviousMtime && newData[field] !== mtime) {
                        newData[field] = mtime;
                        hasProviderMtimeChanges = true;
                    }
                }

                const hasAnyChanges = hasContentChanges || hasProviderMtimeChanges;
                if (hasAnyChanges) {
                    const putReq = store.put(newData, path);
                    putReq.onerror = () => {
                        lastRequestError = putReq.error || null;
                        console.error('[IndexedDB] put failed', {
                            store: STORE_NAME,
                            op,
                            path,
                            name: putReq.error?.name,
                            message: putReq.error?.message
                        });
                    };

                    if (blobStore && featureImageMutation) {
                        if (featureImageMutation.blobUpdate) {
                            // Write the blob record with the current key.
                            const imageReq = blobStore.put(featureImageMutation.blobUpdate, path);
                            imageReq.onerror = () => {
                                lastRequestError = imageReq.error || null;
                                console.error('[IndexedDB] put failed', {
                                    store: FEATURE_IMAGE_STORE_NAME,
                                    op,
                                    path,
                                    name: imageReq.error?.name,
                                    message: imageReq.error?.message
                                });
                            };
                        } else if (featureImageMutation.shouldDeleteBlob) {
                            // Remove any stored blob when the key changes or blob is empty.
                            const deleteReq = blobStore.delete(path);
                            deleteReq.onerror = () => {
                                lastRequestError = deleteReq.error || null;
                                console.error('[IndexedDB] delete failed', {
                                    store: FEATURE_IMAGE_STORE_NAME,
                                    op,
                                    path,
                                    name: deleteReq.error?.name,
                                    message: deleteReq.error?.message
                                });
                            };
                        }
                    }

                    filesToUpdate.push({ path, data: newData });

                    if (hasContentChanges) {
                        const hasContentUpdates =
                            changes.preview !== undefined ||
                            changes.previewStatus !== undefined ||
                            changes.featureImageKey !== undefined ||
                            changes.featureImageStatus !== undefined ||
                            changes.wordCount !== undefined ||
                            changes.characterCountWithSpaces !== undefined ||
                            changes.characterCountWithoutSpaces !== undefined ||
                            changes.taskTotal !== undefined ||
                            changes.taskUnfinished !== undefined ||
                            changes.properties !== undefined;
                        const hasMetadataUpdates = changes.metadata !== undefined || changes.tags !== undefined;
                        const updateType = hasContentUpdates && hasMetadataUpdates ? 'both' : hasContentUpdates ? 'content' : 'metadata';
                        const contentChange: FileContentChange = { path, changes, changeType: updateType };
                        if (changes.properties !== undefined) {
                            contentChange.changedPropertyKeys = changedPropertyKeys;
                        }
                        if (changes.metadata !== undefined) {
                            contentChange.metadataHiddenChanged = metadataHiddenChanged;
                            contentChange.metadataNameChanged = metadataNameChanged;
                            contentChange.metadataDecorationChanged = metadataDecorationChanged;
                        }
                        changeNotifications.push(contentChange);
                    }
                }
                // noop
            };
            getReq.onerror = () => {
                lastRequestError = getReq.error || null;
                console.error('[IndexedDB] get failed', {
                    store: STORE_NAME,
                    op,
                    path,
                    name: getReq.error?.name,
                    message: getReq.error?.message
                });
                try {
                    transaction.abort();
                } catch (e) {
                    void e;
                }
            };
        });
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => {
            console.error('[IndexedDB] transaction aborted', {
                store: STORE_NAME,
                op,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
        };
        transaction.onerror = () => {
            console.error('[IndexedDB] transaction error', {
                store: STORE_NAME,
                op,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
        };
    });

    if (filesToUpdate.length > 0) {
        deps.cache.batchUpdate(filesToUpdate);
        if (previewTextUpdates.length > 0) {
            previewTextUpdates.forEach(update => {
                deps.cache.updateFileContent(update.path, { previewText: update.previewText, previewStatus: update.previewStatus });
            });
        }
        if (changeNotifications.length > 0) {
            deps.emitChanges(changeNotifications);
        }
    }
    if (featureImageCacheUpdates.size > 0) {
        // Drop any cached blobs for updated paths.
        featureImageCacheUpdates.forEach(path => deps.featureImageBlobs.deleteFromCache(path));
    }
    if (createdRecordWithoutKnownMtime > 0) {
        console.error('[IndexedDB] Created file record without known mtime during content update', {
            count: createdRecordWithoutKnownMtime,
            examples: createdRecordWithoutKnownMtimeExamples
        });
    }
}
