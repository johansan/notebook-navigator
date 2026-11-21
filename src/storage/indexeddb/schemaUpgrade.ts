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

import { FEATURE_IMAGE_STORE_NAME } from '../FeatureImageBlobStore';
import { isPlainObjectRecordValue } from '../../utils/recordUtils';
import { PRESENTATION_STORE_NAME, PREVIEW_STORE_NAME, STORE_NAME } from './constants';
import type { PreviewStatus } from './fileData';

export function handleUpgradeNeeded(event: IDBVersionChangeEvent): void {
    const target = event.target;
    if (!(target instanceof IDBOpenDBRequest)) {
        return;
    }
    const db = target.result;

    if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Use out-of-line keys since we removed path from FileData
        const store = db.createObjectStore(STORE_NAME);

        store.createIndex('mtime', 'mtime', { unique: false });
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
    }

    if (!db.objectStoreNames.contains(FEATURE_IMAGE_STORE_NAME)) {
        db.createObjectStore(FEATURE_IMAGE_STORE_NAME);
    }

    if (!db.objectStoreNames.contains(PREVIEW_STORE_NAME)) {
        db.createObjectStore(PREVIEW_STORE_NAME);
    }

    // Schema v4 introduces a store of MarkdownPoint presentation readings, empty until presentations are read.
    if (!db.objectStoreNames.contains(PRESENTATION_STORE_NAME)) {
        db.createObjectStore(PRESENTATION_STORE_NAME);
    }

    const transaction = target.transaction;
    if (!transaction) {
        return;
    }

    if (event.oldVersion < 2) {
        // Schema v2 introduces a dedicated feature image blob store.
        // Schema v3 introduces a dedicated preview text store.
        //
        // v1 cache payloads are not migrated; clear stores so the cache is rebuilt.

        try {
            if (transaction.objectStoreNames.contains(STORE_NAME)) {
                transaction.objectStore(STORE_NAME).clear();
            }
        } catch (error: unknown) {
            console.error('[IndexedDB] clear failed during upgrade', { store: STORE_NAME, error });
        }

        try {
            if (transaction.objectStoreNames.contains(FEATURE_IMAGE_STORE_NAME)) {
                transaction.objectStore(FEATURE_IMAGE_STORE_NAME).clear();
            }
        } catch (error: unknown) {
            console.error('[IndexedDB] clear failed during upgrade', { store: FEATURE_IMAGE_STORE_NAME, error });
        }

        try {
            if (transaction.objectStoreNames.contains(PREVIEW_STORE_NAME)) {
                transaction.objectStore(PREVIEW_STORE_NAME).clear();
            }
        } catch (error: unknown) {
            console.error('[IndexedDB] clear failed during upgrade', { store: PREVIEW_STORE_NAME, error });
        }
    }

    if (event.oldVersion < 3) {
        const mainStore = transaction.objectStore(STORE_NAME);
        const previewStore = transaction.objectStore(PREVIEW_STORE_NAME);

        const cursorRequest = mainStore.openCursor();
        cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (!cursor) {
                return;
            }

            const path = cursor.key;
            if (typeof path !== 'string') {
                cursor.continue();
                return;
            }

            const recordValue: unknown = cursor.value;
            if (!isPlainObjectRecordValue(recordValue)) {
                cursor.continue();
                return;
            }

            const record = recordValue as { preview?: unknown; previewStatus?: unknown; featureImage?: unknown };
            const legacyPreview = record.preview;
            const previewText = typeof legacyPreview === 'string' ? legacyPreview : null;

            const persistAndContinue = (nextPreviewStatus: PreviewStatus) => {
                delete record.preview;
                record.previewStatus = nextPreviewStatus;
                record.featureImage = null;

                const updateReq = cursor.update(record);
                updateReq.onsuccess = () => cursor.continue();
                updateReq.onerror = event2 => {
                    event2.preventDefault();
                    console.error('[IndexedDB] cursor.update failed during preview migration', {
                        store: STORE_NAME,
                        path,
                        name: updateReq.error?.name,
                        message: updateReq.error?.message
                    });
                    cursor.continue();
                };
            };

            if (previewText === null) {
                persistAndContinue('unprocessed');
                return;
            }

            if (previewText.length === 0) {
                persistAndContinue('none');
                return;
            }

            const putReq = previewStore.put(previewText, path);
            putReq.onsuccess = () => persistAndContinue('has');
            putReq.onerror = event2 => {
                event2.preventDefault();
                console.error('[IndexedDB] put failed during preview migration', {
                    store: PREVIEW_STORE_NAME,
                    path,
                    name: putReq.error?.name,
                    message: putReq.error?.message
                });
                // Mark as unprocessed so the preview provider can regenerate content.
                persistAndContinue('unprocessed');
            };
        };
        cursorRequest.onerror = () => {
            console.error('[IndexedDB] preview migration cursor failed', {
                store: STORE_NAME,
                name: cursorRequest.error?.name,
                message: cursorRequest.error?.message
            });
        };
    }
}
