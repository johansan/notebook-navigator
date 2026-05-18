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

import { Platform, parseYaml, type CachedMetadata, type FrontMatterCache, type TFile } from 'obsidian';
import { LIMITS } from '../../constants/limits';
import { type ContentProviderType } from '../../interfaces/IContentProvider';
import { NotebookNavigatorSettings } from '../../settings';
import { type PropertyItem, type PropertyValueKind, FileData } from '../../storage/IndexedDBStorage';
import { getDBInstance } from '../../storage/fileOperations';
import { areStringArraysEqual } from '../../utils/arrayUtils';
import {
    arePropertyItemsEqual,
    getPropertyFrontmatterFields,
    getPropertyFrontmatterFieldSignature,
    hasPropertyFrontmatterFields
} from '../../utils/propertyUtils';
import {
    type FenceMarkerChar,
    isFenceClose,
    isMarkdownWhitespace,
    parseBlockquotePrefix,
    parseFenceOpen,
    skipMarkdownWhitespace
} from '../../utils/codeRangeUtils';
import { PreviewTextUtils } from '../../utils/previewTextUtils';
import { createCaseInsensitiveKeyMatcher, findMatchingRecordKey } from '../../utils/recordUtils';
import { countWordsForNoteProperty } from '../../utils/wordCountUtils';
import {
    getDrawingDirectFeatureImageKey,
    getDrawingSourceProviderIdWithFrontmatter,
    type DrawingFeatureImageProviderId
} from '../../utils/drawingFeatureImages';
import type { ContentProviderProcessResult } from './BaseContentProvider';
import { findFeatureImageReference, type FeatureImageReference } from './featureImageReferenceResolver';
import { FeatureImageContentProvider } from './FeatureImageContentProvider';

type MarkdownPipelineContext = {
    file: TFile;
    fileData: FileData | null;
    settings: NotebookNavigatorSettings;
    content: string;
    frontmatter: FrontMatterCache | null;
    bodyStartIndex: number;
    isDrawing: boolean;
    drawingProviderId: DrawingFeatureImageProviderId | null;
    fileModified: boolean;
    propertiesEnabled: boolean;
    propertyNameFields: readonly string[];
    hasContent: boolean;
    featureImageReference: FeatureImageReference | null;
    featureImageExcluded: boolean;
};

type MarkdownPipelineUpdate = {
    wordCount?: number | null;
    taskTotal?: number | null;
    taskUnfinished?: number | null;
    preview?: string;
    properties?: FileData['properties'];
    featureImageKey?: string | null;
    featureImage?: Blob | null;
};

type MarkdownPipelineProcessorId = 'preview' | 'wordCount' | 'tasks' | 'properties' | 'featureImage';

type MarkdownPipelineProcessor = {
    id: MarkdownPipelineProcessorId;
    needsProcessing: (context: MarkdownPipelineContext) => boolean;
    run: (context: MarkdownPipelineContext) => Promise<MarkdownPipelineUpdate | null>;
};

function resolveMarkdownBodyStartIndex(metadata: CachedMetadata, content: string): number {
    const rawOffset = metadata.frontmatterPosition?.end?.offset;
    if (typeof rawOffset !== 'number' || rawOffset <= 0) {
        return 0;
    }

    let index = Math.min(Math.max(0, rawOffset), content.length);

    while (index < content.length) {
        const char = content[index];
        if (char !== '\n' && char !== '\r') {
            break;
        }
        index += 1;
    }

    return index;
}

function extractYamlFrontmatter(content: string): string | null {
    // Parse only the leading YAML block so drawing frontmatter can be recovered from fresh file content.
    const firstLineEnd = content.indexOf('\n');
    const firstLine = firstLineEnd === -1 ? content : content.slice(0, firstLineEnd);
    const normalizedFirstLine = firstLine.charCodeAt(0) === 0xfeff ? firstLine.slice(1) : firstLine;

    if (normalizedFirstLine.trim() !== '---' || firstLineEnd === -1) {
        return null;
    }

    const yamlStart = firstLineEnd + 1;
    let lineStart = yamlStart;
    while (lineStart <= content.length) {
        const nextLineEnd = content.indexOf('\n', lineStart);
        const lineEnd = nextLineEnd === -1 ? content.length : nextLineEnd;
        const line = content.slice(lineStart, lineEnd);
        const trimmed = line.trim();

        if (trimmed === '---' || trimmed === '...') {
            return content.slice(yamlStart, lineStart).trim();
        }

        if (nextLineEnd === -1) {
            break;
        }

        lineStart = lineEnd + 1;
    }

    return null;
}

function detectDrawingProviderFromContent(file: TFile, content: string): DrawingFeatureImageProviderId | null {
    const yamlText = extractYamlFrontmatter(content);
    if (!yamlText) {
        return null;
    }

    try {
        const parsed: unknown = parseYaml(yamlText);
        return getDrawingSourceProviderIdWithFrontmatter(file, parsed);
    } catch {
        return null;
    }
}

type MarkdownTaskMarker = 'complete' | 'unfinished';
function parseMarkdownTaskMarker(line: string, startIndex: number): MarkdownTaskMarker | null {
    let index = skipMarkdownWhitespace(line, startIndex);
    if (index >= line.length) {
        return null;
    }

    const listMarker = line[index];
    if (listMarker === '-' || listMarker === '*') {
        index += 1;
    } else {
        const firstDigit = line.charCodeAt(index);
        if (firstDigit < 49 || firstDigit > 57) {
            return null;
        }

        index += 1;
        while (index < line.length) {
            const digit = line.charCodeAt(index);
            if (digit < 48 || digit > 57) {
                break;
            }
            index += 1;
        }

        if (line[index] !== '.') {
            return null;
        }
        index += 1;
    }

    if (index >= line.length || !isMarkdownWhitespace(line.charCodeAt(index))) {
        return null;
    }
    index = skipMarkdownWhitespace(line, index);

    if (index + 2 >= line.length) {
        return null;
    }
    if (line[index] !== '[' || line[index + 2] !== ']') {
        return null;
    }

    if (line.slice(index + 3).trim().length === 0) {
        return null;
    }

    const marker = line[index + 1];
    if (marker === ' ') {
        return 'unfinished';
    }
    if (marker === 'x' || marker === 'X') {
        return 'complete';
    }
    return null;
}

function countMarkdownTasks(content: string, bodyStartIndex: number): { taskTotal: number; taskUnfinished: number } {
    const safeBodyStartIndex = Math.min(Math.max(0, bodyStartIndex), content.length);
    const body = safeBodyStartIndex === 0 ? content : content.slice(safeBodyStartIndex);

    if (body.length === 0) {
        return { taskTotal: 0, taskUnfinished: 0 };
    }

    let taskTotal = 0;
    let taskUnfinished = 0;
    let lineStart = 0;
    let inFence = false;
    let fenceChar: FenceMarkerChar | '' = '';
    let fenceLength = 0;
    let fenceDepth = 0;

    while (lineStart < body.length) {
        const nextLineEnd = body.indexOf('\n', lineStart);
        const lineEnd = nextLineEnd === -1 ? body.length : nextLineEnd;
        let line = body.slice(lineStart, lineEnd);
        if (line.endsWith('\r')) {
            line = line.slice(0, -1);
        }
        const prefix = parseBlockquotePrefix(line);

        if (inFence) {
            if (fenceChar !== '' && isFenceClose(line, fenceDepth, fenceChar, fenceLength, prefix)) {
                inFence = false;
                fenceChar = '';
                fenceLength = 0;
                fenceDepth = 0;
            }
        } else {
            const openMatch = parseFenceOpen(line, prefix);
            if (openMatch) {
                inFence = true;
                fenceChar = openMatch.markerChar;
                fenceLength = openMatch.markerLength;
                fenceDepth = openMatch.depth;
            } else {
                const marker = parseMarkdownTaskMarker(line, prefix.nextIndex);
                if (marker) {
                    taskTotal += 1;
                    if (marker === 'unfinished') {
                        taskUnfinished += 1;
                    }
                }
            }
        }

        if (nextLineEnd === -1) {
            break;
        }

        lineStart = lineEnd + 1;
    }

    return { taskTotal, taskUnfinished };
}

type ExtractedPropertyValue = {
    value: string;
    valueKind?: PropertyValueKind;
};

// Converts frontmatter values into a list of pill strings.
// Supports scalars and nested arrays; treats null as unassigned; skips empty strings and non-finite numbers.
function extractFrontmatterValues(value: unknown): ExtractedPropertyValue[] {
    if (value === null) {
        return [{ value: '' }];
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? [{ value: trimmed, valueKind: 'string' }] : [];
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            return [];
        }
        return [{ value: value.toString(), valueKind: 'number' }];
    }

    if (typeof value === 'boolean') {
        return [{ value: value ? 'true' : 'false', valueKind: 'boolean' }];
    }

    if (Array.isArray(value)) {
        const parts: ExtractedPropertyValue[] = [];
        for (const entry of value) {
            parts.push(...extractFrontmatterValues(entry));
        }
        return parts;
    }

    return [];
}

// Builds the property pill list from frontmatter.
// - `nameFields` produce the pill values (all matching fields are included)
function resolvePropertyItemsFromFrontmatter(frontmatter: FrontMatterCache | null, nameFields: readonly string[]): PropertyItem[] {
    if (!frontmatter) {
        return [];
    }

    // Property items are persisted without styling metadata.
    // Rendering derives property and property:value colors from `fieldKey` and raw value.
    const entries: PropertyItem[] = [];

    for (let fieldIndex = 0; fieldIndex < nameFields.length; fieldIndex += 1) {
        const field = nameFields[fieldIndex];
        const matchingField = findMatchingRecordKey(frontmatter, field);
        if (!matchingField) {
            continue;
        }

        const values = extractFrontmatterValues(frontmatter[matchingField]);
        if (values.length === 0) {
            continue;
        }

        for (let valueIndex = 0; valueIndex < values.length; valueIndex += 1) {
            const value = values[valueIndex];
            entries.push({ fieldKey: matchingField, value: value.value, valueKind: value.valueKind });
        }
    }

    return entries;
}

export class MarkdownPipelineContentProvider extends FeatureImageContentProvider {
    protected readonly PARALLEL_LIMIT: number = LIMITS.contentProvider.parallelLimit;
    private readonly readFailureAttemptsByPath = new Map<string, number>();
    private readonly emptyFrontmatterRetryCounts = new Map<string, number>();

    private readonly processors: MarkdownPipelineProcessor[] = [
        {
            id: 'preview',
            needsProcessing: context => {
                return (
                    context.settings.showFilePreview &&
                    (!context.fileData || context.fileModified || context.fileData.previewStatus === 'unprocessed') &&
                    (context.hasContent || context.isDrawing)
                );
            },
            run: async context => await this.processPreview(context)
        },
        {
            id: 'wordCount',
            needsProcessing: context => {
                if (!context.fileData || context.fileModified || context.fileData.wordCount === null) {
                    return context.isDrawing || context.hasContent;
                }

                return false;
            },
            run: async context => await this.processWordCount(context)
        },
        {
            id: 'tasks',
            needsProcessing: context => {
                if (
                    !context.fileData ||
                    context.fileModified ||
                    context.fileData.taskTotal === null ||
                    context.fileData.taskUnfinished === null
                ) {
                    return context.isDrawing || context.hasContent;
                }

                return false;
            },
            run: async context => await this.processTasks(context)
        },
        {
            id: 'properties',
            needsProcessing: context => {
                if (!context.propertiesEnabled) {
                    return false;
                }
                return !context.fileData || context.fileModified || context.fileData.properties === null;
            },
            run: async context => await this.processProperties(context)
        },
        {
            id: 'featureImage',
            needsProcessing: context => {
                if (!context.settings.showFeatureImage) {
                    return false;
                }

                if (!context.isDrawing && !context.featureImageReference && !context.hasContent && !context.featureImageExcluded) {
                    return false;
                }

                return (
                    !context.fileData ||
                    context.fileModified ||
                    context.fileData.featureImageKey === null ||
                    context.fileData.featureImageStatus === 'unprocessed' ||
                    (!context.featureImageExcluded &&
                        context.drawingProviderId !== null &&
                        context.fileData.featureImageKey !== getDrawingDirectFeatureImageKey(context.file, context.drawingProviderId))
                );
            },
            run: async context => await this.processFeatureImage(context)
        }
    ];

    getContentType(): ContentProviderType {
        return 'markdownPipeline';
    }

    getRelevantSettings(): (keyof NotebookNavigatorSettings)[] {
        return [
            'showFilePreview',
            'skipHeadingsInPreview',
            'skipCodeBlocksInPreview',
            'stripHtmlInPreview',
            'stripLatexInPreview',
            'previewProperties',
            'previewPropertiesFallback',
            'showFeatureImage',
            'featureImageProperties',
            'featureImageExcludeProperties',
            'featureImagePixelSize',
            'downloadExternalFeatureImages'
        ];
    }

    private recordReadFailure(path: string): { attempts: number; shouldFallback: boolean } {
        const previous = this.readFailureAttemptsByPath.get(path) ?? 0;
        const attempts = previous + 1;
        this.readFailureAttemptsByPath.set(path, attempts);
        return { attempts, shouldFallback: attempts >= LIMITS.contentProvider.retry.maxAttempts };
    }

    private clearReadFailures(path: string): void {
        this.readFailureAttemptsByPath.delete(path);
    }

    private getClearFlags(context: { oldSettings: NotebookNavigatorSettings; newSettings: NotebookNavigatorSettings } | undefined): {
        shouldClearPreview: boolean;
        shouldClearProperties: boolean;
        shouldClearFeatureImage: boolean;
    } {
        if (!context) {
            return {
                shouldClearPreview: true,
                shouldClearProperties: true,
                shouldClearFeatureImage: true
            };
        }

        const { oldSettings, newSettings } = context;

        const previewExtractionSettingsChanged =
            oldSettings.skipHeadingsInPreview !== newSettings.skipHeadingsInPreview ||
            oldSettings.skipCodeBlocksInPreview !== newSettings.skipCodeBlocksInPreview ||
            oldSettings.stripHtmlInPreview !== newSettings.stripHtmlInPreview ||
            oldSettings.stripLatexInPreview !== newSettings.stripLatexInPreview ||
            !areStringArraysEqual(oldSettings.previewProperties, newSettings.previewProperties) ||
            oldSettings.previewPropertiesFallback !== newSettings.previewPropertiesFallback;
        const shouldClearPreview =
            previewExtractionSettingsChanged ||
            // Toggling preview clears stale text while the disabled state hides the intermediate empty rows.
            oldSettings.showFilePreview !== newSettings.showFilePreview;

        const shouldClearProperties =
            getPropertyFrontmatterFieldSignature(oldSettings) !== getPropertyFrontmatterFieldSignature(newSettings);

        const featureImagePropertiesChanged = !areStringArraysEqual(oldSettings.featureImageProperties, newSettings.featureImageProperties);
        const featureImageExcludePropertiesChanged = !areStringArraysEqual(
            oldSettings.featureImageExcludeProperties,
            newSettings.featureImageExcludeProperties
        );

        const shouldClearFeatureImage =
            featureImageExcludePropertiesChanged ||
            oldSettings.featureImagePixelSize !== newSettings.featureImagePixelSize ||
            (oldSettings.showFeatureImage && !newSettings.showFeatureImage) ||
            (newSettings.showFeatureImage &&
                (featureImagePropertiesChanged || oldSettings.downloadExternalFeatureImages !== newSettings.downloadExternalFeatureImages));

        return { shouldClearPreview, shouldClearProperties, shouldClearFeatureImage };
    }

    shouldRegenerate(oldSettings: NotebookNavigatorSettings, newSettings: NotebookNavigatorSettings): boolean {
        const { shouldClearPreview, shouldClearProperties, shouldClearFeatureImage } = this.getClearFlags({ oldSettings, newSettings });
        return shouldClearPreview || shouldClearProperties || shouldClearFeatureImage;
    }

    async clearContent(context?: { oldSettings: NotebookNavigatorSettings; newSettings: NotebookNavigatorSettings }): Promise<void> {
        const { shouldClearPreview, shouldClearProperties, shouldClearFeatureImage } = this.getClearFlags(context);

        if (!shouldClearPreview && !shouldClearProperties && !shouldClearFeatureImage) {
            return;
        }

        const db = getDBInstance();

        if (shouldClearPreview) {
            await db.batchClearAllFileContent('preview');
        }

        if (shouldClearProperties) {
            await db.batchClearAllFileContent('properties');
        }

        if (shouldClearFeatureImage) {
            await db.batchClearFeatureImageContent('markdown');
        }

        this.emptyFrontmatterRetryCounts.clear();
    }

    protected needsProcessing(fileData: FileData | null, file: TFile, settings: NotebookNavigatorSettings): boolean {
        if (file.extension !== 'md') {
            return false;
        }

        const propertiesEnabled = hasPropertyFrontmatterFields(settings);

        const needsRefresh = fileData !== null && fileData.markdownPipelineMtime !== file.stat.mtime;
        if (!fileData || needsRefresh) {
            return true;
        }

        const needsPreview = settings.showFilePreview && fileData.previewStatus === 'unprocessed';
        let needsFeatureImage =
            settings.showFeatureImage && (fileData.featureImageKey === null || fileData.featureImageStatus === 'unprocessed');
        if (settings.showFeatureImage && !needsFeatureImage) {
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
            const featureImageExcluded = createCaseInsensitiveKeyMatcher(settings.featureImageExcludeProperties).matches(frontmatter);
            if (!featureImageExcluded) {
                const drawingProviderId = getDrawingSourceProviderIdWithFrontmatter(file, frontmatter);
                const expectedDrawingFeatureImageKey = drawingProviderId ? getDrawingDirectFeatureImageKey(file, drawingProviderId) : null;
                needsFeatureImage = expectedDrawingFeatureImageKey !== null && fileData.featureImageKey !== expectedDrawingFeatureImageKey;
            }
        }
        const needsProperties = propertiesEnabled && fileData.properties === null;
        const needsWordCount = fileData.wordCount === null;
        const needsTasks = fileData.taskTotal === null || fileData.taskUnfinished === null;

        return needsPreview || needsFeatureImage || needsProperties || needsWordCount || needsTasks;
    }

    protected async processFile(
        job: { file: TFile; path: string },
        fileData: FileData | null,
        settings: NotebookNavigatorSettings
    ): Promise<ContentProviderProcessResult> {
        if (job.file.extension !== 'md') {
            return { update: null, processed: true };
        }

        const propertyNameFields = getPropertyFrontmatterFields(settings);
        const propertiesEnabled = propertyNameFields.length > 0;
        const previewPropertiesEnabled = settings.showFilePreview && settings.previewProperties.length > 0;
        const featureImagePropertiesEnabled = settings.showFeatureImage && settings.featureImageProperties.length > 0;
        const featureImageExcludePropertiesEnabled = settings.showFeatureImage && settings.featureImageExcludeProperties.length > 0;

        const cachedMetadata = this.app.metadataCache.getFileCache(job.file);
        if (!cachedMetadata) {
            this.emptyFrontmatterRetryCounts.delete(job.path);
            return { update: null, processed: false };
        }

        const frontmatter = cachedMetadata.frontmatter ?? null;
        let drawingProviderId = getDrawingSourceProviderIdWithFrontmatter(job.file, frontmatter);
        let isDrawing = drawingProviderId !== null;
        const fileModified = fileData !== null && fileData.markdownPipelineMtime !== job.file.stat.mtime;
        const needsPreview =
            settings.showFilePreview && (!fileData || fileModified || fileData.previewStatus === 'unprocessed') && !isDrawing;
        const needsPreviewPropertyFrontmatter = previewPropertiesEnabled && needsPreview;
        const needsPropertyFrontmatter = propertiesEnabled && (fileData === null || fileModified || fileData.properties === null);
        const needsFeatureImage =
            settings.showFeatureImage &&
            (!fileData || fileModified || fileData.featureImageKey === null || fileData.featureImageStatus === 'unprocessed') &&
            !isDrawing;
        const needsFeatureImageFrontmatter = needsFeatureImage && (featureImagePropertiesEnabled || featureImageExcludePropertiesEnabled);
        // Delay processing recent files while metadata cache catches up with frontmatter-backed preview/property/image inputs.
        if (frontmatter === null && (needsPropertyFrontmatter || needsPreviewPropertyFrontmatter || needsFeatureImageFrontmatter)) {
            const attempts = this.emptyFrontmatterRetryCounts.get(job.path) ?? 0;
            const isRecent = Date.now() - job.file.stat.mtime <= LIMITS.contentProvider.metadataCache.recentFileWindowMs;
            if (isRecent && attempts < LIMITS.contentProvider.metadataCache.emptyValueRetryLimit) {
                this.emptyFrontmatterRetryCounts.set(job.path, attempts + 1);
                return { update: null, processed: false };
            }
        }
        const featureImageExcludeMatcher = createCaseInsensitiveKeyMatcher(settings.featureImageExcludeProperties);
        const featureImageExcluded = settings.showFeatureImage && frontmatter !== null && featureImageExcludeMatcher.matches(frontmatter);
        const needsWordCount = !fileData || fileModified || fileData.wordCount === null;
        const needsWordCountContent = needsWordCount && !isDrawing;
        const needsTasks = !fileData || fileModified || fileData.taskTotal === null || fileData.taskUnfinished === null;
        const needsTasksContent = needsTasks && !isDrawing;

        const frontmatterFeatureImageReference =
            needsFeatureImage && frontmatter && !featureImageExcluded
                ? findFeatureImageReference({
                      app: this.app,
                      file: job.file,
                      content: '',
                      settings,
                      frontmatter,
                      bodyStartIndex: 0
                  })
                : null;

        const needsContent =
            needsPreview ||
            needsWordCountContent ||
            needsTasksContent ||
            (needsFeatureImage && !featureImageExcluded && !frontmatterFeatureImageReference);

        const update: {
            path: string;
            wordCount?: number | null;
            taskTotal?: number | null;
            taskUnfinished?: number | null;
            preview?: string;
            featureImage?: Blob | null;
            featureImageKey?: string | null;
            properties?: FileData['properties'];
        } = { path: job.path };

        if (needsContent) {
            const maxMarkdownReadBytes = Platform.isMobile ? LIMITS.markdown.maxReadBytes.mobile : LIMITS.markdown.maxReadBytes.desktop;
            if (job.file.stat.size > maxMarkdownReadBytes) {
                // Large files stay on the metadata-only path, so recent frontmatter-only drawing notes need the same retry window.
                const needsDrawingFrontmatterForFeatureImage =
                    frontmatter === null && !isDrawing && needsFeatureImage && job.file.name.toLowerCase().endsWith('.md');
                if (needsDrawingFrontmatterForFeatureImage) {
                    const attempts = this.emptyFrontmatterRetryCounts.get(job.path) ?? 0;
                    const isRecent = Date.now() - job.file.stat.mtime <= LIMITS.contentProvider.metadataCache.recentFileWindowMs;
                    if (isRecent && attempts < LIMITS.contentProvider.metadataCache.emptyValueRetryLimit) {
                        this.emptyFrontmatterRetryCounts.set(job.path, attempts + 1);
                        return { update: null, processed: false };
                    }
                }

                this.emptyFrontmatterRetryCounts.delete(job.path);

                // Avoid reading full markdown content for large files; only apply updates derived from cached metadata/frontmatter.
                let hasSafeUpdate = false;

                if (needsWordCountContent && (!fileData || fileData.wordCount !== 0)) {
                    update.wordCount = 0;
                    hasSafeUpdate = true;
                }

                if (needsTasksContent && (!fileData || fileData.taskTotal !== 0 || fileData.taskUnfinished !== 0)) {
                    update.taskTotal = 0;
                    update.taskUnfinished = 0;
                    hasSafeUpdate = true;
                }

                if (propertiesEnabled) {
                    const nextProperties = resolvePropertyItemsFromFrontmatter(frontmatter, propertyNameFields);
                    if (!fileData || fileData.properties === null || !arePropertyItemsEqual(fileData.properties, nextProperties)) {
                        update.properties = nextProperties;
                        hasSafeUpdate = true;
                    }
                }

                if (needsPreview) {
                    const shouldClearPreview = !fileData || fileData.previewStatus !== 'none';
                    if (shouldClearPreview) {
                        update.preview = '';
                        hasSafeUpdate = true;
                    }
                }

                if (needsFeatureImage && (frontmatterFeatureImageReference || featureImageExcluded)) {
                    const featureImageUpdate = await this.processMarkdownFeatureImage({
                        file: job.file,
                        fileData,
                        settings,
                        content: '',
                        frontmatter,
                        bodyStartIndex: 0,
                        drawingProviderId,
                        featureImageReference: frontmatterFeatureImageReference,
                        featureImageExcluded
                    });

                    if (featureImageUpdate) {
                        update.featureImageKey = featureImageUpdate.featureImageKey;
                        update.featureImage = featureImageUpdate.featureImage;
                        hasSafeUpdate = true;
                    }
                } else if (needsFeatureImage && !frontmatterFeatureImageReference) {
                    const shouldMarkMissingFeatureImage =
                        !fileData || fileData.featureImageKey === null || fileData.featureImageStatus === 'unprocessed';
                    if (shouldMarkMissingFeatureImage) {
                        update.featureImageKey = fileData?.featureImageKey ?? '';
                        update.featureImage = this.createEmptyBlob();
                        hasSafeUpdate = true;
                    }
                }

                if (hasSafeUpdate) {
                    return { update, processed: true };
                }

                return { update: null, processed: true };
            }
        }

        this.emptyFrontmatterRetryCounts.delete(job.path);

        let content: string;
        let hasContent = false;
        let bodyStartIndex = 0;
        try {
            if (needsContent) {
                content = await this.readFileContent(job.file);
                hasContent = true;
                bodyStartIndex = resolveMarkdownBodyStartIndex(cachedMetadata, content);
                this.clearReadFailures(job.path);
            } else {
                content = '';
            }
        } catch (error) {
            console.error(`Error reading markdown content for ${job.path}:`, error);
            const { shouldFallback } = this.recordReadFailure(job.path);
            let hasSafeUpdate = false;

            // Ensure word count can converge even if content reads fail repeatedly.
            if (needsWordCountContent) {
                const shouldSetWordCountZero = !fileData || fileData.wordCount === null || (shouldFallback && fileData.wordCount !== 0);
                if (shouldSetWordCountZero) {
                    update.wordCount = 0;
                    hasSafeUpdate = true;
                }
            }

            if (needsTasksContent) {
                const shouldSetTasksZero =
                    !fileData ||
                    fileData.taskTotal === null ||
                    fileData.taskUnfinished === null ||
                    (shouldFallback && (fileData.taskTotal !== 0 || fileData.taskUnfinished !== 0));
                if (shouldSetTasksZero) {
                    update.taskTotal = 0;
                    update.taskUnfinished = 0;
                    hasSafeUpdate = true;
                }
            }

            if (propertiesEnabled) {
                const nextProperties = resolvePropertyItemsFromFrontmatter(frontmatter, propertyNameFields);
                if (!fileData || fileData.properties === null || !arePropertyItemsEqual(fileData.properties, nextProperties)) {
                    update.properties = nextProperties;
                    hasSafeUpdate = true;
                }
            }

            if (needsPreview && shouldFallback) {
                const shouldClearPreview = !fileData || fileData.previewStatus !== 'none';
                if (shouldClearPreview) {
                    update.preview = '';
                    hasSafeUpdate = true;
                }
            }

            if (needsFeatureImage && frontmatterFeatureImageReference) {
                const featureImageUpdate = await this.processMarkdownFeatureImage({
                    file: job.file,
                    fileData,
                    settings,
                    content: '',
                    frontmatter,
                    bodyStartIndex: 0,
                    drawingProviderId,
                    featureImageReference: frontmatterFeatureImageReference,
                    featureImageExcluded
                });

                if (featureImageUpdate) {
                    update.featureImageKey = featureImageUpdate.featureImageKey;
                    update.featureImage = featureImageUpdate.featureImage;
                    hasSafeUpdate = true;
                }
            } else if (needsFeatureImage && featureImageExcluded) {
                const featureImageUpdate = await this.processMarkdownFeatureImage({
                    file: job.file,
                    fileData,
                    settings,
                    content: '',
                    frontmatter,
                    bodyStartIndex: 0,
                    drawingProviderId,
                    featureImageReference: null,
                    featureImageExcluded
                });

                if (featureImageUpdate) {
                    update.featureImageKey = featureImageUpdate.featureImageKey;
                    update.featureImage = featureImageUpdate.featureImage;
                    hasSafeUpdate = true;
                }
            } else if (needsFeatureImage && !frontmatterFeatureImageReference && shouldFallback) {
                const shouldMarkMissingFeatureImage =
                    !fileData || fileData.featureImageKey === null || fileData.featureImageStatus === 'unprocessed';
                if (shouldMarkMissingFeatureImage) {
                    update.featureImageKey = fileData?.featureImageKey ?? '';
                    update.featureImage = this.createEmptyBlob();
                    hasSafeUpdate = true;
                }
            }

            if (hasSafeUpdate) {
                // After repeated read failures, fall back to safe defaults and mark as processed to avoid endless retries.
                return { update, processed: shouldFallback };
            }

            return { update: null, processed: shouldFallback };
        }

        if (!isDrawing && frontmatter === null) {
            // Metadata cache can lag behind file reads right after save; recover frontmatter-only drawing detection from content.
            drawingProviderId = detectDrawingProviderFromContent(job.file, content);
            isDrawing = drawingProviderId !== null;
        }

        const context: MarkdownPipelineContext = {
            file: job.file,
            fileData,
            settings,
            content,
            frontmatter,
            bodyStartIndex,
            isDrawing,
            drawingProviderId,
            fileModified,
            propertiesEnabled,
            propertyNameFields,
            hasContent,
            featureImageReference: frontmatterFeatureImageReference,
            featureImageExcluded
        };

        for (const processor of this.processors) {
            if (!processor.needsProcessing(context)) {
                continue;
            }

            const processorUpdate = await processor.run(context);
            if (!processorUpdate) {
                continue;
            }

            if (processorUpdate.wordCount !== undefined) {
                update.wordCount = processorUpdate.wordCount;
            }
            if (processorUpdate.taskTotal !== undefined) {
                update.taskTotal = processorUpdate.taskTotal;
            }
            if (processorUpdate.taskUnfinished !== undefined) {
                update.taskUnfinished = processorUpdate.taskUnfinished;
            }
            if (processorUpdate.preview !== undefined) {
                update.preview = processorUpdate.preview;
            }
            if (processorUpdate.properties !== undefined) {
                update.properties = processorUpdate.properties;
            }
            if (processorUpdate.featureImageKey !== undefined) {
                update.featureImageKey = processorUpdate.featureImageKey;
            }
            if (processorUpdate.featureImage !== undefined) {
                update.featureImage = processorUpdate.featureImage;
            }
        }

        const hasContentUpdate =
            update.wordCount !== undefined ||
            update.taskTotal !== undefined ||
            update.taskUnfinished !== undefined ||
            update.preview !== undefined ||
            update.properties !== undefined ||
            update.featureImageKey !== undefined;

        if (hasContentUpdate) {
            return { update, processed: true };
        }

        return { update: null, processed: true };
    }

    private async processPreview(context: MarkdownPipelineContext): Promise<MarkdownPipelineUpdate | null> {
        try {
            const previewText = context.isDrawing
                ? ''
                : PreviewTextUtils.extractPreviewText(context.content, context.settings, context.frontmatter ?? undefined);

            if (!context.fileData) {
                return { preview: previewText };
            }

            if (previewText.length === 0 && context.fileData.previewStatus === 'none') {
                return null;
            }

            if (context.fileData.previewStatus === 'has') {
                const db = getDBInstance();
                const cachedPreview = db.getCachedPreviewText(context.file.path);
                if (cachedPreview.length > 0 && cachedPreview === previewText) {
                    return null;
                }
            }

            return { preview: previewText };
        } catch (error) {
            console.error(`Error generating preview for ${context.file.path}:`, error);
            if (!context.fileData || context.fileData.previewStatus === 'unprocessed') {
                return { preview: '' };
            }
            return null;
        }
    }

    private async processWordCount(context: MarkdownPipelineContext): Promise<MarkdownPipelineUpdate | null> {
        try {
            const count = context.isDrawing ? 0 : countWordsForNoteProperty(context.content, context.bodyStartIndex);
            if (!context.fileData || context.fileData.wordCount === null || context.fileData.wordCount !== count) {
                return { wordCount: count };
            }
            return null;
        } catch (error) {
            console.error(`Error generating word count for ${context.file.path}:`, error);
            if (!context.fileData || context.fileData.wordCount === null) {
                return { wordCount: 0 };
            }
            return null;
        }
    }

    private async processTasks(context: MarkdownPipelineContext): Promise<MarkdownPipelineUpdate | null> {
        try {
            const counts = context.isDrawing
                ? { taskTotal: 0, taskUnfinished: 0 }
                : countMarkdownTasks(context.content, context.bodyStartIndex);

            if (
                !context.fileData ||
                context.fileData.taskTotal === null ||
                context.fileData.taskUnfinished === null ||
                context.fileData.taskTotal !== counts.taskTotal ||
                context.fileData.taskUnfinished !== counts.taskUnfinished
            ) {
                return {
                    taskTotal: counts.taskTotal,
                    taskUnfinished: counts.taskUnfinished
                };
            }

            return null;
        } catch (error) {
            console.error(`Error generating tasks for ${context.file.path}:`, error);
            if (!context.fileData || context.fileData.taskTotal === null || context.fileData.taskUnfinished === null) {
                return { taskTotal: 0, taskUnfinished: 0 };
            }
            return null;
        }
    }

    private async processProperties(context: MarkdownPipelineContext): Promise<MarkdownPipelineUpdate | null> {
        try {
            const nextValue = resolvePropertyItemsFromFrontmatter(context.frontmatter, context.propertyNameFields);

            if (
                !context.fileData ||
                context.fileData.properties === null ||
                !arePropertyItemsEqual(context.fileData.properties, nextValue)
            ) {
                return { properties: nextValue };
            }

            return null;
        } catch (error) {
            console.error(`Error generating property values for ${context.file.path}:`, error);
            if (!context.fileData || context.fileData.properties === null) {
                return { properties: [] };
            }
            return null;
        }
    }

    private async processFeatureImage(context: MarkdownPipelineContext): Promise<MarkdownPipelineUpdate | null> {
        const featureImageUpdate = await this.processMarkdownFeatureImage({
            file: context.file,
            fileData: context.fileData,
            settings: context.settings,
            content: context.content,
            frontmatter: context.frontmatter,
            bodyStartIndex: context.bodyStartIndex,
            drawingProviderId: context.drawingProviderId,
            featureImageReference: context.featureImageReference,
            featureImageExcluded: context.featureImageExcluded
        });

        if (!featureImageUpdate) {
            return null;
        }

        return {
            featureImageKey: featureImageUpdate.featureImageKey,
            featureImage: featureImageUpdate.featureImage
        };
    }

    private async processMarkdownFeatureImage(params: {
        file: TFile;
        fileData: FileData | null;
        settings: NotebookNavigatorSettings;
        content: string;
        frontmatter: FrontMatterCache | null;
        bodyStartIndex: number;
        drawingProviderId: DrawingFeatureImageProviderId | null;
        featureImageReference: FeatureImageReference | null;
        featureImageExcluded: boolean;
    }): Promise<{ featureImageKey: string; featureImage: Blob } | null> {
        if (params.featureImageExcluded) {
            const featureImageKey = '';
            const isUpToDate = params.fileData?.featureImageKey === featureImageKey && params.fileData.featureImageStatus === 'none';
            if (isUpToDate) {
                return null;
            }

            return {
                featureImageKey,
                featureImage: this.createEmptyBlob()
            };
        }

        if (params.drawingProviderId) {
            const featureImageKey = getDrawingDirectFeatureImageKey(params.file, params.drawingProviderId);
            const isUpToDate = params.fileData?.featureImageKey === featureImageKey && params.fileData.featureImageStatus === 'none';
            if (isUpToDate) {
                return null;
            }

            return {
                featureImageKey,
                featureImage: this.createEmptyBlob()
            };
        }

        const reference =
            params.featureImageReference ??
            findFeatureImageReference({
                app: this.app,
                file: params.file,
                content: params.content,
                settings: params.settings,
                frontmatter: params.frontmatter,
                bodyStartIndex: params.bodyStartIndex
            });

        if (!reference) {
            const featureImageKey = '';
            if (params.fileData && params.fileData.featureImageKey === featureImageKey) {
                return null;
            }
            return {
                featureImageKey,
                featureImage: this.createEmptyBlob()
            };
        }

        const featureImageKey = this.getFeatureImageKey(reference);
        const hasStableThumbnail = params.fileData?.featureImageKey === featureImageKey && params.fileData.featureImageStatus === 'has';

        if (hasStableThumbnail) {
            return null;
        }

        try {
            const thumbnail = await this.createThumbnailBlob(reference, params.settings);
            return {
                featureImageKey,
                featureImage: thumbnail ?? this.createEmptyBlob()
            };
        } catch (error) {
            console.error(`Error generating feature image for ${params.file.path}:`, error);
            // Return an empty blob as a durable "attempted" marker so the file doesn't stay `unprocessed` forever.
            return {
                featureImageKey,
                featureImage: this.createEmptyBlob()
            };
        }
    }
}
