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
import { casefold, isPlainObjectRecordValue } from '../../utils/recordUtils';

export type FeatureImageStatus = 'unprocessed' | 'none' | 'has';
export type PreviewStatus = 'unprocessed' | 'none' | 'has';
export type PropertyValueKind = 'string' | 'number' | 'boolean';

function isPropertyValueKind(value: unknown): value is PropertyValueKind {
    return value === 'string' || value === 'number' || value === 'boolean';
}

export interface PropertyItem {
    // Frontmatter field name that produced the value.
    // Used at render time for property display metadata lookups.
    fieldKey: string;
    // Rendered pill text (raw frontmatter value after frontmatter flattening).
    value: string;
    // Original frontmatter value type.
    // Omitted in legacy cache entries created before value-kind metadata was stored.
    valueKind?: PropertyValueKind;
}

function isPropertyItem(value: unknown): value is PropertyItem {
    if (!isPlainObjectRecordValue(value)) {
        return false;
    }

    // Validation is applied when reading persisted file data.
    // Invalid entries cause the record to be treated as missing (`properties = null`) so providers can regenerate it.
    // Persisted data must remain JSON-compatible.
    const rawFieldKey = value['fieldKey'];
    if (typeof rawFieldKey !== 'string' || rawFieldKey.trim().length === 0) {
        return false;
    }

    const rawValue = value['value'];
    if (typeof rawValue !== 'string') {
        return false;
    }

    const rawValueKind = value['valueKind'];
    if (rawValueKind !== undefined && !isPropertyValueKind(rawValueKind)) {
        return false;
    }

    return true;
}

export function isPropertyData(value: unknown): value is PropertyItem[] {
    if (!Array.isArray(value)) {
        return false;
    }
    return value.every(entry => isPropertyItem(entry));
}

function buildPropertyValueSignaturesByKey(properties: readonly PropertyItem[] | null): Map<string, string[]> {
    const signaturesByKey = new Map<string, Set<string>>();
    properties?.forEach(property => {
        const normalizedKey = casefold(property.fieldKey.trim());
        if (!normalizedKey) {
            return;
        }

        const signatures = signaturesByKey.get(normalizedKey) ?? new Set<string>();
        signatures.add(JSON.stringify([property.valueKind ?? 'string', property.value]));
        signaturesByKey.set(normalizedKey, signatures);
    });

    return new Map(Array.from(signaturesByKey, ([key, signatures]) => [key, Array.from(signatures).sort()]));
}

/**
 * Returns normalized keys whose tree membership changed between two property snapshots. Value order
 * and duplicates are ignored because property tree nodes store file membership in sets. Callers use
 * this projection to avoid rebuilding configured property trees after an unrelated hidden property changes.
 */
export function getChangedPropertyKeys(previous: readonly PropertyItem[] | null, next: readonly PropertyItem[] | null): string[] {
    const previousByKey = buildPropertyValueSignaturesByKey(previous);
    const nextByKey = buildPropertyValueSignaturesByKey(next);
    const keys = new Set([...previousByKey.keys(), ...nextByKey.keys()]);

    return Array.from(keys)
        .filter(key => {
            const previousSignatures = previousByKey.get(key) ?? [];
            const nextSignatures = nextByKey.get(key) ?? [];
            return (
                previousSignatures.length !== nextSignatures.length ||
                previousSignatures.some((signature, index) => signature !== nextSignatures[index])
            );
        })
        .sort();
}

// Task counters are stored and updated as a pair.
//
// Valid states:
// - `null/null`: pending extraction (or tasks disabled upstream)
// - `number/number`: extracted values (finite integers, >= 0)
//
// Callers must not send partial updates (only `taskTotal` or only `taskUnfinished`).
// Partial/invalid values are normalized to `null/null` so the counters can re-converge.
export function normalizeTaskCounters(
    taskTotal: unknown,
    taskUnfinished: unknown
): { taskTotal: number | null; taskUnfinished: number | null } {
    const hasValidTaskTotal = typeof taskTotal === 'number' && Number.isFinite(taskTotal) && taskTotal >= 0;
    const hasValidTaskUnfinished = typeof taskUnfinished === 'number' && Number.isFinite(taskUnfinished) && taskUnfinished >= 0;

    if (taskTotal === null && taskUnfinished === null) {
        return { taskTotal: null, taskUnfinished: null };
    }

    if (hasValidTaskTotal && hasValidTaskUnfinished) {
        return {
            taskTotal: Math.trunc(taskTotal),
            taskUnfinished: Math.trunc(taskUnfinished)
        };
    }

    return { taskTotal: null, taskUnfinished: null };
}

export function getDefaultPreviewStatusForPath(path: string): PreviewStatus {
    return isMarkdownPath(path) ? 'unprocessed' : 'none';
}

export function createDefaultFileData(params: { mtime: number; path: string }): FileData {
    const isMarkdown = isMarkdownPath(params.path);
    return {
        mtime: params.mtime,
        markdownPipelineMtime: 0,
        tagsMtime: 0,
        metadataMtime: 0,
        fileThumbnailsMtime: 0,
        tags: isMarkdown ? null : [],
        wordCount: isMarkdown ? null : 0,
        characterCountWithSpaces: isMarkdown ? null : 0,
        characterCountWithoutSpaces: isMarkdown ? null : 0,
        taskTotal: isMarkdown ? null : 0,
        taskUnfinished: isMarkdown ? null : 0,
        properties: null,
        previewStatus: getDefaultPreviewStatusForPath(params.path),
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: isMarkdown ? null : {}
    };
}

/**
 * Sentinel values for metadata date fields
 */
export const METADATA_SENTINEL = {
    /** Indicates that the frontmatter field name is empty/not configured */
    FIELD_NOT_CONFIGURED: 0,
    /** Indicates that parsing the date value failed */
    PARSE_FAILED: -1
} as const;

export interface FileData {
    /**
     * Last observed vault mtime for the file path.
     *
     * Content providers use provider-specific processed mtimes (e.g. `markdownPipelineMtime`)
     * to determine whether their cached output is stale for the current file version.
     */
    mtime: number;
    /**
     * Last file mtime processed by the markdown pipeline provider.
     *
     * Used to detect markdown changes even when existing preview/feature image/property values remain visible
     * until regeneration completes.
     */
    markdownPipelineMtime: number;
    /**
     * Last file mtime processed by the tags provider.
     */
    tagsMtime: number;
    /**
     * Last file mtime processed by the metadata provider.
     */
    metadataMtime: number;
    /**
     * Last file mtime processed by the file thumbnails provider (non-markdown thumbnails like PDF covers).
     */
    fileThumbnailsMtime: number;
    tags: string[] | null; // null = not extracted yet (e.g. when tags disabled)
    wordCount: number | null; // null = not generated yet
    characterCountWithSpaces: number | null; // null = not generated yet
    characterCountWithoutSpaces: number | null; // null = not generated yet
    taskTotal: number | null; // null = not generated yet
    taskUnfinished: number | null; // null = not generated yet
    properties: PropertyItem[] | null; // null = not generated yet
    /**
     * Preview text processing state.
     *
     * Semantics:
     * - `unprocessed`: content provider has not run yet for this file
     * - `none`: processed, but no preview text was produced
     * - `has`: processed and a non-empty preview string exists in the preview store
     */
    previewStatus: PreviewStatus;
    /**
     * Feature image placeholder for the main record.
     * Always null in the main store; blobs live in a dedicated blob store.
     * Empty blobs are not persisted; the featureImageKey is the durable marker for "processed but no thumbnail".
     */
    featureImage: Blob | null;
    /**
     * Feature image processing state.
     *
     * Semantics:
     * - `unprocessed`: content provider has not run yet for this file
     * - `none`: processed, but no thumbnail blob is stored (no reference or thumbnail generation failed)
     * - `has`: processed and a thumbnail blob is stored in the blob store
     */
    featureImageStatus: FeatureImageStatus;
    /**
     * Stable key describing the selected feature image source.
     *
     * Semantics:
     * - `null`: not generated yet (pending content generation)
     * - `''`: generated and resolved, but no image reference is selected
     * - `f:<path>@<mtime>`: local vault file reference (image embeds, PDF cover thumbnails)
     * - `e:<url>`: external https URL reference (normalized, without hash)
     * - `y:<videoId>`: YouTube thumbnail reference
     * - `d:<provider>:<path>`: drawing file with provider-owned preview rendering
     */
    featureImageKey: string | null;
    metadata: {
        name?: string;
        created?: number; // Valid timestamp, 0 = field not configured, -1 = parse failed
        modified?: number; // Valid timestamp, 0 = field not configured, -1 = parse failed
        icon?: string;
        color?: string;
        background?: string;
        hidden?: boolean; // Whether file matches frontmatter exclusion patterns
    } | null; // null = not generated yet
}

export interface FileContentChange {
    path: string;
    changes: {
        preview?: string | null;
        previewStatus?: PreviewStatus;
        featureImage?: Blob | null;
        featureImageKey?: string | null;
        featureImageStatus?: FeatureImageStatus;
        metadata?: FileData['metadata'] | null;
        tags?: string[] | null;
        wordCount?: number | null;
        characterCountWithSpaces?: number | null;
        characterCountWithoutSpaces?: number | null;
        taskTotal?: number | null;
        taskUnfinished?: number | null;
        properties?: FileData['properties'];
    };
    changeType?: 'metadata' | 'content' | 'both';
    /** Normalized property keys whose tree membership changed; omitted when the writer cannot provide a projection. */
    changedPropertyKeys?: string[];
    /** True when metadata.name changes between persisted values */
    metadataNameChanged?: boolean;
    /** True when metadata fields used by navigation/list decorations change between persisted values */
    metadataDecorationChanged?: boolean;
    /** True when metadata.hidden changes between persisted values */
    metadataHiddenChanged?: boolean;
}

type FileMetadata = NonNullable<FileData['metadata']>;
type FileMetadataPatchKey = keyof FileMetadata;
const FILE_METADATA_PATCH_KEYS: readonly FileMetadataPatchKey[] = ['name', 'created', 'modified', 'icon', 'color', 'background', 'hidden'];
const FILE_METADATA_DECORATION_KEYS: readonly Exclude<FileMetadataPatchKey, 'name' | 'hidden' | 'created' | 'modified'>[] = [
    'icon',
    'color',
    'background'
];

function hasOwnMetadataPatchField(patch: Partial<FileMetadata>, key: keyof FileMetadata): boolean {
    return Object.prototype.hasOwnProperty.call(patch, key);
}

function applyMetadataPatchField<K extends FileMetadataPatchKey>(next: FileMetadata, patch: Partial<FileMetadata>, key: K): boolean {
    if (!hasOwnMetadataPatchField(patch, key)) {
        return false;
    }

    const nextValue = patch[key];
    if (nextValue === undefined) {
        if (hasOwnMetadataPatchField(next, key)) {
            delete next[key];
            return true;
        }
        return false;
    }

    if (next[key] === nextValue) {
        return false;
    }

    next[key] = nextValue;
    return true;
}

export function applyFileMetadataPatch(
    existing: FileData['metadata'] | null | undefined,
    patch: Partial<FileMetadata>
): { metadata: FileMetadata; changed: boolean } {
    const next: FileMetadata = { ...(existing ?? {}) };
    let changed = false;

    for (const key of FILE_METADATA_PATCH_KEYS) {
        changed = applyMetadataPatchField(next, patch, key) || changed;
    }

    return { metadata: next, changed };
}

function normalizeMetadataNameForComparison(metadata: FileData['metadata'] | null | undefined): string | undefined {
    const rawName = metadata?.name;
    if (typeof rawName !== 'string') {
        return undefined;
    }

    const normalizedName = rawName.trim();
    if (normalizedName.length === 0) {
        return undefined;
    }
    return normalizedName;
}

export function hasMetadataNameChanged(
    previousMetadata: FileData['metadata'] | null | undefined,
    nextMetadata: FileData['metadata'] | null | undefined
): boolean {
    return normalizeMetadataNameForComparison(previousMetadata) !== normalizeMetadataNameForComparison(nextMetadata);
}

export function hasMetadataDecorationChanged(
    previousMetadata: FileData['metadata'] | null | undefined,
    nextMetadata: FileData['metadata'] | null | undefined
): boolean {
    if (hasMetadataNameChanged(previousMetadata, nextMetadata)) {
        return true;
    }

    return FILE_METADATA_DECORATION_KEYS.some(key => previousMetadata?.[key] !== nextMetadata?.[key]);
}

export function hasMetadataHiddenChanged(
    previousMetadata: FileData['metadata'] | null | undefined,
    nextMetadata: FileData['metadata'] | null | undefined
): boolean {
    return Boolean(previousMetadata?.hidden) !== Boolean(nextMetadata?.hidden);
}
