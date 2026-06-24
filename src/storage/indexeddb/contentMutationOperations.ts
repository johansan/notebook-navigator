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

import { isMarkdownPath } from '../../utils/fileTypeUtils';
import { FEATURE_IMAGE_STORE_NAME, computeFeatureImageMutation, type FeatureImageBlobStore } from '../FeatureImageBlobStore';
import { type MemoryFileCache } from '../MemoryFileCache';
import { PREVIEW_STORE_NAME, STORE_NAME } from './constants';
import {
    applyFileMetadataPatch,
    getDefaultPreviewStatusForPath,
    hasMetadataDecorationChanged,
    hasMetadataHiddenChanged,
    hasMetadataNameChanged,
    type FileContentChange,
    type FileData,
    type PreviewStatus
} from './fileData';

interface ContentMutationOperationDeps {
    db: IDBDatabase;
    cache: MemoryFileCache;
    featureImageBlobs: Pick<FeatureImageBlobStore, 'deleteFromCache' | 'clearMemoryCaches'>;
    normalizeFileData: (data: Partial<FileData> & { preview?: string | null }) => FileData;
    emitChanges: (changes: FileContentChange[]) => void;
    normalizeIdbError: (error: unknown, fallbackMessage: string) => Error;
    rejectWithTransactionError: (
        reject: (reason?: unknown) => void,
        transaction: IDBTransaction,
        lastRequestError: DOMException | Error | null,
        fallbackMessage: string
    ) => void;
}

export async function runUpdateFileContent(
    deps: ContentMutationOperationDeps,
    params: {
        path: string;
        preview?: string;
        image?: Blob | null;
        metadata?: FileData['metadata'];
        featureImageKey?: string | null;
    }
): Promise<void> {
    const { path, preview, image, metadata, featureImageKey } = params;
    const transaction = deps.db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME, PREVIEW_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
    const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);
    const changes: FileContentChange['changes'] = {};
    let updated: FileData | null = null;
    let metadataHiddenChanged = false;
    let metadataNameChanged = false;
    let metadataDecorationChanged = false;
    let shouldClearFeatureImageCache = false;
    const opUpdate = 'updateFileContent';
    let lastRequestErrorUpdate: DOMException | Error | null = null;

    await new Promise<void>((resolve, reject) => {
        const getReq = store.get(path);
        getReq.onsuccess = () => {
            const existingRaw = (getReq.result as Partial<FileData> | undefined) || null;
            if (!existingRaw) {
                resolve();
                return;
            }
            const existing = deps.normalizeFileData(existingRaw);
            const next: FileData = { ...existing };

            const featureImageMutation = computeFeatureImageMutation({
                existingKey: existing.featureImageKey,
                existingStatus: existing.featureImageStatus,
                featureImageKey,
                featureImage: image
            });
            if (featureImageMutation.changes.featureImageKey !== undefined) {
                changes.featureImageKey = featureImageMutation.changes.featureImageKey;
            }
            if (featureImageMutation.changes.featureImageStatus !== undefined) {
                changes.featureImageStatus = featureImageMutation.changes.featureImageStatus;
            }
            if (featureImageMutation.shouldClearCache) {
                shouldClearFeatureImageCache = true;
            }

            if (preview !== undefined) {
                const previewStatus: PreviewStatus = preview.length > 0 ? 'has' : 'none';
                next.previewStatus = previewStatus;
                changes.preview = preview;
                if (existing.previewStatus !== previewStatus) {
                    changes.previewStatus = previewStatus;
                }
                if (previewStatus === 'has') {
                    const previewReq = previewStore.put(preview, path);
                    previewReq.onerror = () => {
                        lastRequestErrorUpdate = previewReq.error || null;
                        console.error('[IndexedDB] put failed', {
                            store: PREVIEW_STORE_NAME,
                            op: opUpdate,
                            path,
                            name: previewReq.error?.name,
                            message: previewReq.error?.message
                        });
                    };
                } else {
                    const deleteReq = previewStore.delete(path);
                    deleteReq.onerror = () => {
                        lastRequestErrorUpdate = deleteReq.error || null;
                        console.error('[IndexedDB] delete failed', {
                            store: PREVIEW_STORE_NAME,
                            op: opUpdate,
                            path,
                            name: deleteReq.error?.name,
                            message: deleteReq.error?.message
                        });
                    };
                }
            }
            if (metadata !== undefined) {
                next.metadata = metadata;
                changes.metadata = metadata;
                metadataHiddenChanged = hasMetadataHiddenChanged(existing.metadata, metadata);
                metadataNameChanged = hasMetadataNameChanged(existing.metadata, metadata);
                metadataDecorationChanged = hasMetadataDecorationChanged(existing.metadata, metadata);
            }

            // Main store records never hold blob data.
            next.featureImageKey = featureImageMutation.nextKey;
            next.featureImage = null;
            next.featureImageStatus = featureImageMutation.nextStatus;
            updated = next;
            if (featureImageMutation.blobUpdate) {
                // Write the blob record with the current key.
                const imageReq = blobStore.put(featureImageMutation.blobUpdate, path);
                imageReq.onerror = () => {
                    lastRequestErrorUpdate = imageReq.error || null;
                    console.error('[IndexedDB] put failed', {
                        store: FEATURE_IMAGE_STORE_NAME,
                        op: opUpdate,
                        path,
                        name: imageReq.error?.name,
                        message: imageReq.error?.message
                    });
                };
            } else if (featureImageMutation.shouldDeleteBlob) {
                const deleteReq = blobStore.delete(path);
                deleteReq.onerror = () => {
                    lastRequestErrorUpdate = deleteReq.error || null;
                    console.error('[IndexedDB] delete failed', {
                        store: FEATURE_IMAGE_STORE_NAME,
                        op: opUpdate,
                        path,
                        name: deleteReq.error?.name,
                        message: deleteReq.error?.message
                    });
                };
            }
            const putReq = store.put(next, path);
            putReq.onerror = () => {
                lastRequestErrorUpdate = putReq.error || null;
                console.error('[IndexedDB] put failed', {
                    store: STORE_NAME,
                    op: opUpdate,
                    path,
                    name: putReq.error?.name,
                    message: putReq.error?.message
                });
            };
        };
        getReq.onerror = () => {
            lastRequestErrorUpdate = getReq.error || null;
            console.error('[IndexedDB] get failed', {
                store: STORE_NAME,
                op: opUpdate,
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
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => {
            console.error('[IndexedDB] transaction aborted', {
                store: STORE_NAME,
                op: opUpdate,
                path,
                txError: transaction.error?.message,
                reqError: lastRequestErrorUpdate?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestErrorUpdate, 'Transaction aborted');
        };
        transaction.onerror = () => {
            console.error('[IndexedDB] transaction error', {
                store: STORE_NAME,
                op: opUpdate,
                path,
                txError: transaction.error?.message,
                reqError: lastRequestErrorUpdate?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestErrorUpdate, 'Transaction error');
        };
    });

    if (updated) {
        const updatedRecord: FileData = updated;
        deps.cache.updateFile(path, updatedRecord);
        if (preview !== undefined) {
            deps.cache.updateFileContent(path, { previewText: preview, previewStatus: updatedRecord.previewStatus });
        }
        if (shouldClearFeatureImageCache) {
            // Remove any cached blob for the updated path.
            deps.featureImageBlobs.deleteFromCache(path);
        }
        if (Object.keys(changes).length > 0) {
            const hasContentChanges =
                changes.preview !== undefined ||
                changes.previewStatus !== undefined ||
                changes.featureImageKey !== undefined ||
                changes.featureImageStatus !== undefined;
            const hasMetadataChanges = changes.metadata !== undefined;
            const changeType = hasContentChanges && hasMetadataChanges ? 'both' : hasContentChanges ? 'content' : 'metadata';
            const contentChange: FileContentChange = { path, changes, changeType };
            if (changes.metadata !== undefined) {
                contentChange.metadataHiddenChanged = metadataHiddenChanged;
                contentChange.metadataNameChanged = metadataNameChanged;
                contentChange.metadataDecorationChanged = metadataDecorationChanged;
            }
            deps.emitChanges([contentChange]);
        }
    }
}

export async function runUpdateFileMetadata(
    deps: ContentMutationOperationDeps,
    params: {
        path: string;
        metadata: {
            name?: string;
            created?: number;
            modified?: number;
            icon?: string;
            color?: string;
            background?: string;
        };
    }
): Promise<void> {
    const { path, metadata } = params;
    const transaction = deps.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    let updated: FileData | null = null;
    let metadataHiddenChanged = false;
    let metadataNameChanged = false;
    let metadataDecorationChanged = false;
    const opMeta = 'updateFileMetadata';
    let lastRequestErrorMeta: DOMException | Error | null = null;

    await new Promise<void>((resolve, reject) => {
        const getReq = store.get(path);
        getReq.onsuccess = () => {
            const existingRaw = (getReq.result as Partial<FileData> | undefined) || null;
            if (!existingRaw) {
                resolve();
                return;
            }
            const existing = deps.normalizeFileData(existingRaw);
            const metadataPatch = applyFileMetadataPatch(existing.metadata, metadata);
            if (!metadataPatch.changed) {
                resolve();
                return;
            }

            const newMeta = metadataPatch.metadata;
            metadataHiddenChanged = hasMetadataHiddenChanged(existing.metadata, newMeta);
            metadataNameChanged = hasMetadataNameChanged(existing.metadata, newMeta);
            metadataDecorationChanged = hasMetadataDecorationChanged(existing.metadata, newMeta);
            updated = { ...existing, metadata: newMeta };
            const putReq = store.put(updated, path);
            putReq.onerror = () => {
                lastRequestErrorMeta = putReq.error || null;
                console.error('[IndexedDB] put failed', {
                    store: STORE_NAME,
                    op: opMeta,
                    path,
                    name: putReq.error?.name,
                    message: putReq.error?.message
                });
            };
        };
        getReq.onerror = () => {
            lastRequestErrorMeta = getReq.error || null;
            console.error('[IndexedDB] get failed', {
                store: STORE_NAME,
                op: opMeta,
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
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => {
            console.error('[IndexedDB] transaction aborted', {
                store: STORE_NAME,
                op: opMeta,
                path,
                txError: transaction.error?.message,
                reqError: lastRequestErrorMeta?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestErrorMeta, 'Transaction aborted');
        };
        transaction.onerror = () => {
            console.error('[IndexedDB] transaction error', {
                store: STORE_NAME,
                op: opMeta,
                path,
                txError: transaction.error?.message,
                reqError: lastRequestErrorMeta?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestErrorMeta, 'Transaction error');
        };
    });

    if (updated) {
        const updatedRecord: FileData = updated;
        deps.cache.updateFile(path, updatedRecord);
        deps.emitChanges([
            {
                path,
                changes: { metadata: updatedRecord.metadata },
                changeType: 'metadata',
                metadataHiddenChanged,
                metadataNameChanged,
                metadataDecorationChanged
            }
        ]);
    }
}

export async function runClearFileContent(
    deps: ContentMutationOperationDeps,
    params: { path: string; type: 'preview' | 'featureImage' | 'metadata' | 'all' }
): Promise<void> {
    const { path, type } = params;
    const transaction = deps.db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME, PREVIEW_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
    const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);
    const changes: FileContentChange['changes'] = {};
    let updated: FileData | null = null;
    let metadataHiddenChanged = false;
    let metadataNameChanged = false;
    let metadataDecorationChanged = false;
    let shouldClearFeatureImageCache = false;
    const op = 'clearFileContent';
    let lastRequestError: DOMException | Error | null = null;

    await new Promise<void>((resolve, reject) => {
        const getReq = store.get(path);
        getReq.onsuccess = () => {
            const existingRaw = (getReq.result as Partial<FileData> | undefined) || null;
            if (!existingRaw) {
                resolve();
                return;
            }
            const file = { ...deps.normalizeFileData(existingRaw) };
            if (type === 'preview' || type === 'all') {
                const nextPreviewStatus = getDefaultPreviewStatusForPath(path);
                if (file.previewStatus !== nextPreviewStatus) {
                    file.previewStatus = nextPreviewStatus;
                    changes.preview = null;
                    changes.previewStatus = nextPreviewStatus;
                }
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
            if (type === 'featureImage' || type === 'all') {
                // Clear feature image key in the main store and delete blob records.
                if (file.featureImageKey !== null) {
                    file.featureImageKey = null;
                    changes.featureImageKey = null;
                }
                if (file.featureImageStatus !== 'unprocessed') {
                    file.featureImageStatus = 'unprocessed';
                    changes.featureImageStatus = 'unprocessed';
                }
                file.featureImage = null;
                shouldClearFeatureImageCache = true;
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
            if (type === 'metadata' || type === 'all') {
                if (file.metadata !== null) {
                    metadataHiddenChanged = hasMetadataHiddenChanged(file.metadata, null);
                    metadataNameChanged = hasMetadataNameChanged(file.metadata, null);
                    metadataDecorationChanged = hasMetadataDecorationChanged(file.metadata, null);
                    file.metadata = null;
                    changes.metadata = null;
                }
            }
            updated = file;
            const putReq = store.put(file, path);
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
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => {
            console.error('[IndexedDB] transaction aborted', {
                store: STORE_NAME,
                op,
                path,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
        };
        transaction.onerror = () => {
            console.error('[IndexedDB] transaction error', {
                store: STORE_NAME,
                op,
                path,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
        };
    });

    if (updated) {
        deps.cache.updateFile(path, updated);
        if (shouldClearFeatureImageCache) {
            deps.featureImageBlobs.deleteFromCache(path);
        }
        if (Object.keys(changes).length > 0) {
            const hasContentCleared =
                changes.preview === null ||
                changes.previewStatus !== undefined ||
                changes.featureImageKey === null ||
                changes.featureImageStatus !== undefined;
            const hasMetadataCleared = changes.metadata === null;
            const changeType = hasContentCleared && hasMetadataCleared ? 'both' : hasContentCleared ? 'content' : 'metadata';
            const contentChange: FileContentChange = { path, changes, changeType };
            if (changes.metadata !== undefined) {
                contentChange.metadataHiddenChanged = metadataHiddenChanged;
                contentChange.metadataNameChanged = metadataNameChanged;
                contentChange.metadataDecorationChanged = metadataDecorationChanged;
            }
            deps.emitChanges([contentChange]);
        }
    }
}

export async function runBatchClearAllFileContent(
    deps: ContentMutationOperationDeps,
    params: { type: 'preview' | 'featureImage' | 'metadata' | 'tags' | 'wordCount' | 'characterCount' | 'properties' | 'all' }
): Promise<void> {
    const { type } = params;
    const transaction = deps.db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME, PREVIEW_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
    const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);
    const changeNotifications: FileContentChange[] = [];
    const cacheUpdates: { path: string; data: FileData }[] = [];
    const op = 'batchClearAllFileContent';
    let lastRequestError: DOMException | Error | null = null;

    await new Promise<void>((resolve, reject) => {
        if (type === 'preview' || type === 'all') {
            const clearReq = previewStore.clear();
            clearReq.onerror = () => {
                lastRequestError = clearReq.error || null;
                console.error('[IndexedDB] clear failed', {
                    store: PREVIEW_STORE_NAME,
                    op,
                    name: clearReq.error?.name,
                    message: clearReq.error?.message
                });
            };
        }
        if (type === 'featureImage' || type === 'all') {
            // Clear all feature image blobs in one operation.
            const clearReq = blobStore.clear();
            clearReq.onerror = () => {
                lastRequestError = clearReq.error || null;
                console.error('[IndexedDB] clear failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    name: clearReq.error?.name,
                    message: clearReq.error?.message
                });
            };
        }
        const request = store.openCursor();

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                const current = deps.normalizeFileData(cursor.value as Partial<FileData>);
                const updated: FileData = { ...current };
                const changes: FileContentChange['changes'] = {};
                let metadataHiddenChanged = false;
                let metadataNameChanged = false;
                let metadataDecorationChanged = false;
                let hasChanges = false;

                const path = cursor.key;
                if (typeof path !== 'string') {
                    cursor.continue();
                    return;
                }
                const isMarkdown = isMarkdownPath(path);

                if (type === 'preview' || type === 'all') {
                    const nextPreviewStatus = isMarkdown ? 'unprocessed' : 'none';
                    if (updated.previewStatus !== nextPreviewStatus) {
                        updated.previewStatus = nextPreviewStatus;
                        changes.preview = null;
                        changes.previewStatus = nextPreviewStatus;
                        hasChanges = true;
                    }
                }
                if ((type === 'featureImage' || type === 'all') && updated.featureImageKey !== null) {
                    updated.featureImageKey = null;
                    changes.featureImageKey = null;
                    hasChanges = true;
                }
                if (type === 'featureImage' || type === 'all') {
                    updated.featureImage = null;
                    if (updated.featureImageStatus !== 'unprocessed') {
                        updated.featureImageStatus = 'unprocessed';
                        changes.featureImageStatus = 'unprocessed';
                        hasChanges = true;
                    }
                }
                if (type === 'metadata' || type === 'all') {
                    if (isMarkdown) {
                        if (updated.metadata !== null) {
                            metadataHiddenChanged = hasMetadataHiddenChanged(current.metadata, null);
                            metadataNameChanged = hasMetadataNameChanged(current.metadata, null);
                            metadataDecorationChanged = hasMetadataDecorationChanged(current.metadata, null);
                            updated.metadata = null;
                            changes.metadata = null;
                            hasChanges = true;
                        }
                    } else if (updated.metadata === null) {
                        metadataHiddenChanged = hasMetadataHiddenChanged(current.metadata, {});
                        metadataNameChanged = hasMetadataNameChanged(current.metadata, {});
                        metadataDecorationChanged = hasMetadataDecorationChanged(current.metadata, {});
                        updated.metadata = {};
                        changes.metadata = {};
                        hasChanges = true;
                    }
                }
                if (type === 'tags' || type === 'all') {
                    if (isMarkdown) {
                        if (updated.tags !== null) {
                            updated.tags = null;
                            changes.tags = null;
                            hasChanges = true;
                        }
                    } else if (updated.tags === null) {
                        updated.tags = [];
                        changes.tags = [];
                        hasChanges = true;
                    }
                }
                if (type === 'wordCount' || type === 'all') {
                    const nextWordCount = isMarkdown ? null : 0;
                    if (updated.wordCount !== nextWordCount) {
                        updated.wordCount = nextWordCount;
                        changes.wordCount = nextWordCount;
                        hasChanges = true;
                    }
                }
                if (type === 'characterCount' || type === 'all') {
                    const nextCharacterCount = isMarkdown ? null : 0;
                    if (
                        updated.characterCountWithSpaces !== nextCharacterCount ||
                        updated.characterCountWithoutSpaces !== nextCharacterCount
                    ) {
                        updated.characterCountWithSpaces = nextCharacterCount;
                        updated.characterCountWithoutSpaces = nextCharacterCount;
                        changes.characterCountWithSpaces = nextCharacterCount;
                        changes.characterCountWithoutSpaces = nextCharacterCount;
                        hasChanges = true;
                    }
                }
                if ((type === 'properties' || type === 'all') && updated.properties !== null) {
                    updated.properties = null;
                    changes.properties = null;
                    hasChanges = true;
                }

                if (hasChanges) {
                    const updateReq = cursor.update(updated);
                    updateReq.onerror = () => {
                        lastRequestError = updateReq.error || null;
                        console.error('[IndexedDB] cursor.update failed', {
                            store: STORE_NAME,
                            op,
                            path,
                            name: updateReq.error?.name,
                            message: updateReq.error?.message
                        });
                        try {
                            transaction.abort();
                        } catch (e) {
                            void e;
                        }
                    };
                    cacheUpdates.push({ path, data: updated });
                    const hasContentCleared =
                        changes.preview === null ||
                        changes.previewStatus !== undefined ||
                        changes.featureImageKey === null ||
                        changes.featureImageStatus !== undefined ||
                        changes.wordCount !== undefined ||
                        changes.characterCountWithSpaces !== undefined ||
                        changes.characterCountWithoutSpaces !== undefined ||
                        changes.properties === null;
                    const hasMetadataCleared = changes.metadata === null || changes.tags !== undefined;
                    const clearType = hasContentCleared && hasMetadataCleared ? 'both' : hasContentCleared ? 'content' : 'metadata';
                    const contentChange: FileContentChange = { path, changes, changeType: clearType };
                    if (changes.metadata !== undefined) {
                        contentChange.metadataHiddenChanged = metadataHiddenChanged;
                        contentChange.metadataNameChanged = metadataNameChanged;
                        contentChange.metadataDecorationChanged = metadataDecorationChanged;
                    }
                    changeNotifications.push(contentChange);
                }

                cursor.continue();
            }
        };

        request.onerror = () => {
            const requestError = request.error;
            lastRequestError = requestError || null;
            console.error('[IndexedDB] openCursor failed', {
                store: STORE_NAME,
                op,
                name: requestError?.name,
                message: requestError?.message
            });
            reject(deps.normalizeIdbError(requestError, 'Cursor request failed'));
        };

        transaction.oncomplete = () => {
            if (cacheUpdates.length > 0) {
                deps.cache.batchUpdate(cacheUpdates);
                deps.emitChanges(changeNotifications);
            }
            if (type === 'featureImage' || type === 'all') {
                // Reset the in-memory blob cache when all blobs are cleared.
                deps.featureImageBlobs.clearMemoryCaches();
            }
            resolve();
        };
        transaction.onabort = () => {
            console.error('[IndexedDB] transaction aborted', {
                store: STORE_NAME,
                op,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
        };
        transaction.onerror = () => {
            console.error('[IndexedDB] transaction error', {
                store: STORE_NAME,
                op,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
        };
    });
}

export async function runBatchClearFeatureImageContent(
    deps: ContentMutationOperationDeps,
    params: { scope: 'markdown' | 'nonMarkdown' }
): Promise<void> {
    const { scope } = params;
    const transaction = deps.db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
    const changeNotifications: FileContentChange[] = [];
    const cacheUpdates: { path: string; data: FileData }[] = [];
    const blobCacheUpdates: string[] = [];
    const op = 'batchClearFeatureImageContent';
    let lastRequestError: DOMException | Error | null = null;

    await new Promise<void>((resolve, reject) => {
        const request = store.openCursor();

        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) {
                return;
            }

            const path = cursor.key;
            if (typeof path !== 'string') {
                cursor.continue();
                return;
            }

            const isMarkdown = isMarkdownPath(path);
            const shouldClear = scope === 'markdown' ? isMarkdown : !isMarkdown;
            if (!shouldClear) {
                cursor.continue();
                return;
            }

            const current = deps.normalizeFileData(cursor.value as Partial<FileData>);
            const updated: FileData = { ...current };
            const changes: FileContentChange['changes'] = {};
            let hasChanges = false;

            if (updated.featureImageKey !== null) {
                updated.featureImageKey = null;
                changes.featureImageKey = null;
                hasChanges = true;
            }

            updated.featureImage = null;
            if (updated.featureImageStatus !== 'unprocessed') {
                updated.featureImageStatus = 'unprocessed';
                changes.featureImageStatus = 'unprocessed';
                hasChanges = true;
            }

            if (hasChanges) {
                const updateReq = cursor.update(updated);
                updateReq.onerror = () => {
                    lastRequestError = updateReq.error || null;
                    console.error('[IndexedDB] cursor.update failed', {
                        store: STORE_NAME,
                        op,
                        path,
                        name: updateReq.error?.name,
                        message: updateReq.error?.message
                    });
                    try {
                        transaction.abort();
                    } catch (e) {
                        void e;
                    }
                };
                cacheUpdates.push({ path, data: updated });
                changeNotifications.push({ path, changes, changeType: 'content' });
            }

            const shouldDeleteBlob = current.featureImageKey !== null || current.featureImageStatus === 'has';
            if (shouldDeleteBlob) {
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
                blobCacheUpdates.push(path);
            }

            cursor.continue();
        };

        request.onerror = () => {
            const requestError = request.error;
            lastRequestError = requestError || null;
            console.error('[IndexedDB] openCursor failed', {
                store: STORE_NAME,
                op,
                name: requestError?.name,
                message: requestError?.message
            });
            reject(deps.normalizeIdbError(requestError, 'Cursor request failed'));
        };

        transaction.oncomplete = () => resolve();
        transaction.onabort = () => {
            console.error('[IndexedDB] transaction aborted', {
                store: STORE_NAME,
                op,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
        };
        transaction.onerror = () => {
            console.error('[IndexedDB] transaction error', {
                store: STORE_NAME,
                op,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
        };
    });

    if (cacheUpdates.length > 0) {
        deps.cache.batchUpdate(cacheUpdates);
        deps.emitChanges(changeNotifications);
    }
    if (blobCacheUpdates.length > 0) {
        for (const path of blobCacheUpdates) {
            deps.featureImageBlobs.deleteFromCache(path);
        }
    }
}

export async function runBatchClearFileContent(
    deps: ContentMutationOperationDeps,
    params: { paths: string[]; type: 'preview' | 'featureImage' | 'metadata' | 'tags' | 'properties' | 'all' }
): Promise<void> {
    const { paths, type } = params;
    const transaction = deps.db.transaction([STORE_NAME, FEATURE_IMAGE_STORE_NAME, PREVIEW_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const blobStore = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
    const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);
    const updates: { path: string; data: FileData }[] = [];
    const changeNotifications: FileContentChange[] = [];
    const op = 'batchClearFileContent';
    let lastRequestError: DOMException | Error | null = null;

    await new Promise<void>((resolve, reject) => {
        if (paths.length === 0) {
            resolve();
            return;
        }

        paths.forEach(path => {
            const getReq = store.get(path);
            getReq.onsuccess = () => {
                const existingRaw = (getReq.result as Partial<FileData> | undefined) || null;
                if (!existingRaw) {
                    return;
                }
                const file = { ...deps.normalizeFileData(existingRaw) };
                const changes: FileContentChange['changes'] = {};
                let metadataHiddenChanged = false;
                let metadataNameChanged = false;
                let metadataDecorationChanged = false;
                let hasChanges = false;
                if (type === 'preview' || type === 'all') {
                    const nextPreviewStatus = getDefaultPreviewStatusForPath(path);
                    if (file.previewStatus !== nextPreviewStatus) {
                        file.previewStatus = nextPreviewStatus;
                        changes.preview = null;
                        changes.previewStatus = nextPreviewStatus;
                        hasChanges = true;
                    }
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
                if ((type === 'featureImage' || type === 'all') && file.featureImageKey !== null) {
                    file.featureImageKey = null;
                    changes.featureImageKey = null;
                    hasChanges = true;
                }
                if (type === 'featureImage' || type === 'all') {
                    file.featureImage = null;
                    if (file.featureImageStatus !== 'unprocessed') {
                        file.featureImageStatus = 'unprocessed';
                        changes.featureImageStatus = 'unprocessed';
                        hasChanges = true;
                    }
                }
                if ((type === 'metadata' || type === 'all') && file.metadata !== null) {
                    metadataHiddenChanged = hasMetadataHiddenChanged(file.metadata, null);
                    metadataNameChanged = hasMetadataNameChanged(file.metadata, null);
                    metadataDecorationChanged = hasMetadataDecorationChanged(file.metadata, null);
                    file.metadata = null;
                    changes.metadata = null;
                    hasChanges = true;
                }
                if ((type === 'tags' || type === 'all') && file.tags !== null) {
                    file.tags = null;
                    changes.tags = null;
                    hasChanges = true;
                }
                if ((type === 'properties' || type === 'all') && file.properties !== null) {
                    file.properties = null;
                    changes.properties = null;
                    hasChanges = true;
                }
                if (hasChanges) {
                    const putReq = store.put(file, path);
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
                    if (type === 'featureImage' || type === 'all') {
                        // Remove feature image blobs for the cleared paths.
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
                    updates.push({ path, data: file });
                    const hasContentCleared =
                        changes.preview === null ||
                        changes.previewStatus !== undefined ||
                        changes.featureImageKey === null ||
                        changes.featureImageStatus !== undefined ||
                        changes.properties === null;
                    const hasMetadataCleared = changes.metadata === null || changes.tags !== undefined;
                    const clearType = hasContentCleared && hasMetadataCleared ? 'both' : hasContentCleared ? 'content' : 'metadata';
                    const contentChange: FileContentChange = { path, changes, changeType: clearType };
                    if (changes.metadata !== undefined) {
                        contentChange.metadataHiddenChanged = metadataHiddenChanged;
                        contentChange.metadataNameChanged = metadataNameChanged;
                        contentChange.metadataDecorationChanged = metadataDecorationChanged;
                    }
                    changeNotifications.push(contentChange);
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
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction aborted');
        };
        transaction.onerror = () => {
            console.error('[IndexedDB] transaction error', {
                store: STORE_NAME,
                op,
                txError: transaction.error?.message,
                reqError: lastRequestError?.message
            });
            deps.rejectWithTransactionError(reject, transaction, lastRequestError, 'Transaction error');
        };
    });

    if (updates.length > 0) {
        deps.cache.batchUpdate(updates);
        deps.emitChanges(changeNotifications);
    }
    if (type === 'featureImage' || type === 'all') {
        // Drop any cached blobs for the cleared paths.
        for (const path of paths) {
            deps.featureImageBlobs.deleteFromCache(path);
        }
    }
}
