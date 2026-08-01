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

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { App, TFile } from 'obsidian';
import type { FeatureImageStatus, FileContentChange, IndexedDBStorage, PropertyItem } from '../../storage/IndexedDBStorage';
import { getCachedFileTags } from '../../utils/tagUtils';
import { isRasterImageFile } from '../../utils/fileTypeUtils';
import { arePropertyItemsEqual, clonePropertyItems } from '../../utils/propertyUtils';
import { areStringArraysEqual } from '../../utils/arrayUtils';
import { getVersionedResourcePath } from '../../utils/resourcePath';

const FEATURE_IMAGE_REGEN_THROTTLE_MS = 10000;

export type FileItemContentDb = Pick<
    IndexedDBStorage,
    'getCachedPreviewText' | 'getFile' | 'onFileContentChange' | 'ensurePreviewTextLoaded' | 'getFeatureImageBlob'
>;

export interface FileItemCacheSnapshot {
    previewText: string;
    tags: string[];
    featureImageKey: string | null;
    featureImageStatus: FeatureImageStatus;
    featureImageUrl: string | null;
    properties: PropertyItem[] | null;
    wordCount: number | null;
    characterCountWithSpaces: number | null;
    characterCountWithoutSpaces: number | null;
    taskTotal: number | null;
    taskUnfinished: number | null;
}

export interface FileItemContentLoadOptions {
    loadPreviewText?: boolean;
    loadTags?: boolean;
    loadFeatureImage?: boolean;
    loadProperties?: boolean;
    loadWordCount?: boolean;
    loadCharacterCount?: boolean;
    loadTaskCounts?: boolean;
}

type ResolvedFileItemContentLoadOptions = Required<FileItemContentLoadOptions>;

export interface UseFileItemContentStateParams {
    app: App;
    file: TFile;
    showPreview: boolean;
    showImage: boolean;
    skipFeatureImage?: boolean;
    fileStatMtime?: number;
    getDB: () => FileItemContentDb;
    regenerateFeatureImageForFile: (file: TFile) => Promise<void>;
    loadOptions?: FileItemContentLoadOptions;
    refreshMetadataVersionOnFeatureImageChange?: boolean;
}

export interface FileItemContentState {
    previewText: string;
    tags: string[];
    featureImageKey: string | null;
    featureImageStatus: FeatureImageStatus;
    featureImageUrl: string | null;
    properties: PropertyItem[] | null;
    wordCount: number | null;
    characterCountWithSpaces: number | null;
    characterCountWithoutSpaces: number | null;
    taskTotal: number | null;
    taskUnfinished: number | null;
    metadataVersion: number;
}

export function subscribeToFileItemContentState(params: {
    db: FileItemContentDb;
    filePath: string;
    loadSnapshot: () => FileItemCacheSnapshot;
    applySnapshot: (snapshot: FileItemCacheSnapshot) => void;
    onChange: (changes: FileContentChange['changes']) => void;
}): () => void {
    const { db, filePath, loadSnapshot, applySnapshot, onChange } = params;
    const unsubscribe = db.onFileContentChange(filePath, onChange);
    applySnapshot(loadSnapshot());
    return unsubscribe;
}

export function shouldRefreshFileItemMetadataVersionForContentChange({
    changes,
    shouldLoadFeatureImage,
    refreshMetadataVersionOnFeatureImageChange
}: {
    changes: FileContentChange['changes'];
    shouldLoadFeatureImage: boolean;
    refreshMetadataVersionOnFeatureImageChange: boolean;
}): boolean {
    if (changes.metadata !== undefined) {
        return true;
    }

    const hasFeatureImageChange = changes.featureImageKey !== undefined || changes.featureImageStatus !== undefined;
    return hasFeatureImageChange && !shouldLoadFeatureImage && refreshMetadataVersionOnFeatureImageChange;
}

function resolveFileItemContentLoadOptions(loadOptions?: FileItemContentLoadOptions): ResolvedFileItemContentLoadOptions {
    return {
        loadPreviewText: loadOptions?.loadPreviewText ?? true,
        loadTags: loadOptions?.loadTags ?? true,
        loadFeatureImage: loadOptions?.loadFeatureImage ?? true,
        loadProperties: loadOptions?.loadProperties ?? true,
        loadWordCount: loadOptions?.loadWordCount ?? true,
        loadCharacterCount: loadOptions?.loadCharacterCount ?? true,
        loadTaskCounts: loadOptions?.loadTaskCounts ?? true
    };
}

export function loadFileItemCacheSnapshot({
    app,
    file,
    showPreview,
    showImage,
    skipFeatureImage,
    fileStatMtime = file.stat.mtime,
    db,
    loadOptions
}: {
    app: App;
    file: TFile;
    showPreview: boolean;
    showImage: boolean;
    skipFeatureImage?: boolean;
    fileStatMtime?: number;
    db: FileItemContentDb;
    loadOptions?: FileItemContentLoadOptions;
}): FileItemCacheSnapshot {
    const {
        loadPreviewText: shouldLoadPreviewText,
        loadTags: shouldLoadTags,
        loadFeatureImage: shouldLoadFeatureImage,
        loadProperties: shouldLoadProperties,
        loadWordCount: shouldLoadWordCount,
        loadCharacterCount: shouldLoadCharacterCount,
        loadTaskCounts: shouldLoadTaskCounts
    } = resolveFileItemContentLoadOptions(loadOptions);
    const shouldReadFileRecord =
        shouldLoadTags ||
        shouldLoadFeatureImage ||
        shouldLoadProperties ||
        shouldLoadWordCount ||
        shouldLoadCharacterCount ||
        shouldLoadTaskCounts;
    const preview = shouldLoadPreviewText && showPreview && file.extension === 'md' ? db.getCachedPreviewText(file.path) : '';
    const record = shouldReadFileRecord ? db.getFile(file.path) : null;
    const tags = shouldLoadTags ? [...getCachedFileTags({ app, file, db, fileData: record })] : [];
    const isDirectImageFile = shouldLoadFeatureImage && showImage && !skipFeatureImage && isRasterImageFile(file);
    const featureImageKey =
        shouldLoadFeatureImage && record?.featureImageKey
            ? record.featureImageKey
            : isDirectImageFile
              ? `direct-image:${file.path}@${fileStatMtime}`
              : null;
    const featureImageStatus: FeatureImageStatus = shouldLoadFeatureImage ? (record?.featureImageStatus ?? 'unprocessed') : 'unprocessed';
    const properties = shouldLoadProperties ? clonePropertyItems(record?.properties ?? null) : null;
    const wordCount = shouldLoadWordCount ? (record?.wordCount ?? null) : null;
    const characterCountWithSpaces = shouldLoadCharacterCount ? (record?.characterCountWithSpaces ?? null) : null;
    const characterCountWithoutSpaces = shouldLoadCharacterCount ? (record?.characterCountWithoutSpaces ?? null) : null;
    const taskTotal = shouldLoadTaskCounts ? (record?.taskTotal ?? null) : null;
    const taskUnfinished = shouldLoadTaskCounts ? (record?.taskUnfinished ?? null) : null;

    let featureImageUrl: string | null = null;
    if (isDirectImageFile) {
        try {
            featureImageUrl = getVersionedResourcePath(app, file, fileStatMtime);
        } catch {
            featureImageUrl = null;
        }
    }

    return {
        previewText: preview,
        tags,
        featureImageKey,
        featureImageStatus,
        featureImageUrl,
        properties,
        wordCount,
        characterCountWithSpaces,
        characterCountWithoutSpaces,
        taskTotal,
        taskUnfinished
    };
}

/** Cached row content fields stored together with metadata refresh bookkeeping. */
export type FileItemContentBox = Omit<FileItemContentState, 'featureImageUrl'>;

function boxFromSnapshot(snapshot: FileItemCacheSnapshot): FileItemContentBox {
    return {
        previewText: snapshot.previewText,
        tags: snapshot.tags,
        featureImageKey: snapshot.featureImageKey,
        featureImageStatus: snapshot.featureImageStatus,
        properties: snapshot.properties,
        wordCount: snapshot.wordCount,
        characterCountWithSpaces: snapshot.characterCountWithSpaces,
        characterCountWithoutSpaces: snapshot.characterCountWithoutSpaces,
        taskTotal: snapshot.taskTotal,
        taskUnfinished: snapshot.taskUnfinished,
        metadataVersion: 0
    };
}

/** Merges a fresh cache snapshot into the previous box, preserving field identity for unchanged values. */
function mergeSnapshotIntoBox(prev: FileItemContentBox, snapshot: FileItemCacheSnapshot): FileItemContentBox {
    const tags = areStringArraysEqual(prev.tags, snapshot.tags) ? prev.tags : snapshot.tags;
    const properties = arePropertyItemsEqual(prev.properties, snapshot.properties) ? prev.properties : snapshot.properties;
    if (
        prev.previewText === snapshot.previewText &&
        tags === prev.tags &&
        prev.featureImageKey === snapshot.featureImageKey &&
        prev.featureImageStatus === snapshot.featureImageStatus &&
        properties === prev.properties &&
        prev.wordCount === snapshot.wordCount &&
        prev.characterCountWithSpaces === snapshot.characterCountWithSpaces &&
        prev.characterCountWithoutSpaces === snapshot.characterCountWithoutSpaces &&
        prev.taskTotal === snapshot.taskTotal &&
        prev.taskUnfinished === snapshot.taskUnfinished
    ) {
        return prev;
    }

    return {
        ...boxFromSnapshot(snapshot),
        tags,
        properties,
        metadataVersion: prev.metadataVersion
    };
}

export function applyFileItemContentChangeToBox({
    prev,
    changes,
    shouldLoadPreviewText,
    shouldLoadTags,
    shouldLoadFeatureImage,
    shouldLoadProperties,
    shouldLoadWordCount,
    shouldLoadCharacterCount,
    shouldLoadTaskCounts,
    showPreview,
    fileExtension,
    shouldRefreshMetadataVersion
}: {
    prev: FileItemContentBox;
    changes: FileContentChange['changes'];
    shouldLoadPreviewText: boolean;
    shouldLoadTags: boolean;
    shouldLoadFeatureImage: boolean;
    shouldLoadProperties: boolean;
    shouldLoadWordCount: boolean;
    shouldLoadCharacterCount: boolean;
    shouldLoadTaskCounts: boolean;
    showPreview: boolean;
    fileExtension: string;
    shouldRefreshMetadataVersion: boolean;
}): FileItemContentBox {
    let next = prev;
    const mutate = (): FileItemContentBox => {
        if (next === prev) {
            next = { ...prev };
        }
        return next;
    };

    if (changes.preview !== undefined && shouldLoadPreviewText && showPreview && fileExtension === 'md') {
        const nextPreview = changes.preview || '';
        if (prev.previewText !== nextPreview) {
            mutate().previewText = nextPreview;
        }
    }

    if (changes.featureImageKey !== undefined && shouldLoadFeatureImage) {
        const nextKey = changes.featureImageKey ?? null;
        if (prev.featureImageKey !== nextKey) {
            mutate().featureImageKey = nextKey;
        }
    }

    if (changes.featureImageStatus !== undefined && shouldLoadFeatureImage) {
        if (prev.featureImageStatus !== changes.featureImageStatus) {
            mutate().featureImageStatus = changes.featureImageStatus;
        }
    }

    if (changes.tags !== undefined && shouldLoadTags) {
        const nextTags = changes.tags ?? [];
        if (!areStringArraysEqual(prev.tags, nextTags)) {
            mutate().tags = [...nextTags];
        }
    }

    if (changes.wordCount !== undefined && shouldLoadWordCount) {
        const nextWordCount = changes.wordCount ?? null;
        if (prev.wordCount !== nextWordCount) {
            mutate().wordCount = nextWordCount;
        }
    }

    if (changes.characterCountWithSpaces !== undefined && shouldLoadCharacterCount) {
        const nextCount = changes.characterCountWithSpaces ?? null;
        if (prev.characterCountWithSpaces !== nextCount) {
            mutate().characterCountWithSpaces = nextCount;
        }
    }

    if (changes.characterCountWithoutSpaces !== undefined && shouldLoadCharacterCount) {
        const nextCount = changes.characterCountWithoutSpaces ?? null;
        if (prev.characterCountWithoutSpaces !== nextCount) {
            mutate().characterCountWithoutSpaces = nextCount;
        }
    }

    if (changes.taskTotal !== undefined && shouldLoadTaskCounts) {
        const nextTaskTotal = changes.taskTotal ?? null;
        if (prev.taskTotal !== nextTaskTotal) {
            mutate().taskTotal = nextTaskTotal;
        }
    }

    if (changes.taskUnfinished !== undefined && shouldLoadTaskCounts) {
        const nextTaskUnfinished = changes.taskUnfinished ?? null;
        if (prev.taskUnfinished !== nextTaskUnfinished) {
            mutate().taskUnfinished = nextTaskUnfinished;
        }
    }

    if (changes.properties !== undefined && shouldLoadProperties) {
        const nextProperties = changes.properties ?? null;
        if (!arePropertyItemsEqual(prev.properties, nextProperties)) {
            mutate().properties = clonePropertyItems(nextProperties);
        }
    }

    if (shouldRefreshMetadataVersion) {
        mutate().metadataVersion = prev.metadataVersion + 1;
    }

    return next;
}

export function useFileItemContentState({
    app,
    file,
    showPreview,
    showImage,
    skipFeatureImage = false,
    fileStatMtime = file.stat.mtime,
    getDB,
    regenerateFeatureImageForFile,
    loadOptions,
    refreshMetadataVersionOnFeatureImageChange = false
}: UseFileItemContentStateParams): FileItemContentState {
    const loadPreviewTextOption = loadOptions?.loadPreviewText;
    const loadTagsOption = loadOptions?.loadTags;
    const loadFeatureImageOption = loadOptions?.loadFeatureImage;
    const loadPropertiesOption = loadOptions?.loadProperties;
    const loadWordCountOption = loadOptions?.loadWordCount;
    const loadCharacterCountOption = loadOptions?.loadCharacterCount;
    const loadTaskCountsOption = loadOptions?.loadTaskCounts;
    const resolvedLoadOptions = useMemo(
        () =>
            resolveFileItemContentLoadOptions({
                loadPreviewText: loadPreviewTextOption,
                loadTags: loadTagsOption,
                loadFeatureImage: loadFeatureImageOption,
                loadProperties: loadPropertiesOption,
                loadWordCount: loadWordCountOption,
                loadCharacterCount: loadCharacterCountOption,
                loadTaskCounts: loadTaskCountsOption
            }),
        [
            loadCharacterCountOption,
            loadFeatureImageOption,
            loadPreviewTextOption,
            loadPropertiesOption,
            loadTagsOption,
            loadTaskCountsOption,
            loadWordCountOption
        ]
    );
    const {
        loadPreviewText: shouldLoadPreviewText,
        loadTags: shouldLoadTags,
        loadFeatureImage: shouldLoadFeatureImage,
        loadProperties: shouldLoadProperties,
        loadWordCount: shouldLoadWordCount,
        loadCharacterCount: shouldLoadCharacterCount,
        loadTaskCounts: shouldLoadTaskCounts
    } = resolvedLoadOptions;
    const loadSnapshot = useCallback(() => {
        return loadFileItemCacheSnapshot({
            app,
            file,
            showPreview,
            showImage,
            skipFeatureImage,
            fileStatMtime,
            db: getDB(),
            loadOptions: resolvedLoadOptions
        });
    }, [app, file, fileStatMtime, getDB, resolvedLoadOptions, showImage, showPreview, skipFeatureImage]);

    const initialDataRef = useRef<FileItemCacheSnapshot | null>(null);
    const initialData = initialDataRef.current ?? loadSnapshot();
    initialDataRef.current = initialData;

    const [box, setBox] = useState<FileItemContentBox>(() => boxFromSnapshot(initialData));
    const [featureImageUrl, setFeatureImageUrl] = useState<string | null>(initialData.featureImageUrl);

    const featureImageObjectUrlRef = useRef<string | null>(null);
    const lastFeatureImageRegenRef = useRef<{ key: string; at: number } | null>(null);
    useLayoutEffect(() => {
        const db = getDB();
        const unsubscribe = subscribeToFileItemContentState({
            db,
            filePath: file.path,
            loadSnapshot,
            applySnapshot: initialSnapshot => {
                setBox(prev => mergeSnapshotIntoBox(prev, initialSnapshot));
            },
            onChange: (changes: FileContentChange['changes']) => {
                const shouldRefreshMetadataVersion = shouldRefreshFileItemMetadataVersionForContentChange({
                    changes,
                    shouldLoadFeatureImage,
                    refreshMetadataVersionOnFeatureImageChange
                });

                setBox(prev =>
                    applyFileItemContentChangeToBox({
                        prev,
                        changes,
                        shouldLoadPreviewText,
                        shouldLoadTags,
                        shouldLoadFeatureImage,
                        shouldLoadProperties,
                        shouldLoadWordCount,
                        shouldLoadCharacterCount,
                        shouldLoadTaskCounts,
                        showPreview,
                        fileExtension: file.extension,
                        shouldRefreshMetadataVersion
                    })
                );
            }
        });

        if (shouldLoadPreviewText && showPreview && file.extension === 'md') {
            void db.ensurePreviewTextLoaded(file.path);
        }

        return () => {
            unsubscribe();
        };
    }, [
        file,
        file.path,
        getDB,
        loadSnapshot,
        shouldLoadCharacterCount,
        shouldLoadFeatureImage,
        shouldLoadPreviewText,
        shouldLoadProperties,
        shouldLoadTags,
        shouldLoadTaskCounts,
        shouldLoadWordCount,
        refreshMetadataVersionOnFeatureImageChange,
        showPreview
    ]);

    useEffect(() => {
        return () => {
            if (featureImageObjectUrlRef.current) {
                URL.revokeObjectURL(featureImageObjectUrlRef.current);
                featureImageObjectUrlRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        if (featureImageObjectUrlRef.current) {
            URL.revokeObjectURL(featureImageObjectUrlRef.current);
            featureImageObjectUrlRef.current = null;
        }

        if (!shouldLoadFeatureImage || !showImage || skipFeatureImage) {
            setFeatureImageUrl(null);
            return () => {
                isActive = false;
            };
        }

        if (isRasterImageFile(file)) {
            try {
                setFeatureImageUrl(getVersionedResourcePath(app, file, fileStatMtime));
            } catch {
                setFeatureImageUrl(null);
            }

            return () => {
                isActive = false;
            };
        }

        if (box.featureImageStatus !== 'has' || !box.featureImageKey) {
            setFeatureImageUrl(null);
            return () => {
                isActive = false;
            };
        }

        const db = getDB();
        const expectedKey = box.featureImageKey;
        void db.getFeatureImageBlob(file.path, expectedKey).then(blob => {
            if (!isActive) {
                return;
            }

            if (!blob) {
                setFeatureImageUrl(null);
                const now = Date.now();
                const last = lastFeatureImageRegenRef.current;
                const shouldTrigger = !last || last.key !== expectedKey || now - last.at >= FEATURE_IMAGE_REGEN_THROTTLE_MS;
                if (shouldTrigger) {
                    lastFeatureImageRegenRef.current = { key: expectedKey, at: now };
                    void regenerateFeatureImageForFile(file);
                }
                return;
            }

            const nextUrl = URL.createObjectURL(blob);
            featureImageObjectUrlRef.current = nextUrl;
            setFeatureImageUrl(nextUrl);
        });

        return () => {
            isActive = false;
        };
    }, [
        app,
        box.featureImageKey,
        box.featureImageStatus,
        file,
        fileStatMtime,
        getDB,
        regenerateFeatureImageForFile,
        shouldLoadFeatureImage,
        showImage,
        skipFeatureImage
    ]);

    return {
        previewText: box.previewText,
        tags: box.tags,
        featureImageKey: box.featureImageKey,
        featureImageStatus: box.featureImageStatus,
        featureImageUrl,
        properties: box.properties,
        wordCount: box.wordCount,
        characterCountWithSpaces: box.characterCountWithSpaces,
        characterCountWithoutSpaces: box.characterCountWithoutSpaces,
        taskTotal: box.taskTotal,
        taskUnfinished: box.taskUnfinished,
        metadataVersion: box.metadataVersion
    };
}
