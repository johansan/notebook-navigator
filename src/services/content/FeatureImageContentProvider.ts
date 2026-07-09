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

import { App, Platform, RequestUrlParam, RequestUrlResponse, requestUrl, TFile } from 'obsidian';
import { type ContentProviderType } from '../../interfaces/IContentProvider';
import type { FeatureImagePixelSizeSetting, NotebookNavigatorSettings } from '../../settings/types';
import { FileData } from '../../storage/IndexedDBStorage';
import { getDBInstance } from '../../storage/fileOperations';
import { isGeneratedThumbnailFile, isPdfFile } from '../../utils/fileTypeUtils';
import { getYoutubeThumbnailUrl } from '../../utils/youtubeUtils';
import { BaseContentProvider, type ContentProviderProcessResult } from './BaseContentProvider';
import type { ContentReadCache } from './ContentReadCache';
import { isValidHttpsUrl, type FeatureImageReference } from './featureImageReferenceResolver';
import { renderPdfCoverThumbnail } from './pdf/pdfCoverThumbnail';
import { detectImageMimeTypeFromBuffer, getImageDimensionsPairFromBuffer, normalizeImageMimeType } from './thumbnail/imageDimensions';
import { decodeSvgSourceText, prepareSvgFeatureImageSource } from './thumbnail/svgFeatureImage';
import { createOnceLogger, createRenderBudgetLimiter, createRenderLimiter } from './thumbnail/thumbnailRuntimeUtils';
import { LIMITS } from '../../constants/limits';
import { getDrawingDirectFeatureImageKey, getDrawingFeatureImageSource } from '../../utils/drawingFeatureImages';

type FeatureImageThumbnailDimensions = {
    width: number;
    height: number;
};

const FEATURE_IMAGE_THUMBNAIL_DIMENSIONS: Readonly<Record<FeatureImagePixelSizeSetting, FeatureImageThumbnailDimensions>> = Object.freeze({
    '256': Object.freeze({ width: 256, height: 144 }),
    '384': Object.freeze({ width: 384, height: 216 }),
    '512': Object.freeze({ width: 512, height: 288 })
});

const THUMBNAIL_OUTPUT_MIME = LIMITS.thumbnails.featureImage.output.mimeType;
// iOS Safari has issues with WebP encoding in some contexts, so use PNG as fallback
const IOS_THUMBNAIL_OUTPUT_MIME = LIMITS.thumbnails.featureImage.output.iosMimeType;
const THUMBNAIL_OUTPUT_QUALITY = LIMITS.thumbnails.featureImage.output.quality;
// Per-request timeout for external image fetches.
// YouTube thumbnails try multiple candidates, so total time can exceed this value.
const EXTERNAL_REQUEST_TIMEOUT_MS = LIMITS.thumbnails.featureImage.externalRequest.timeoutMs;
// Maximum lifetime for an external request before releasing the concurrency slot.
// `requestUrl()` does not accept an AbortSignal, so timed-out requests can continue running in the background.
const EXTERNAL_REQUEST_MAX_LIFETIME_MS = LIMITS.thumbnails.featureImage.externalRequest.maxLifetimeMs;
// Maximum number of timed-out external requests that may continue running while new requests proceed.
// This bounds oversubscription when releasing limiter slots on timeout.
const EXTERNAL_REQUEST_TIMEOUT_DEBT_MAX = Platform.isMobile
    ? LIMITS.thumbnails.featureImage.externalRequest.timeoutDebtMax.mobile
    : LIMITS.thumbnails.featureImage.externalRequest.timeoutDebtMax.desktop;
// Maximum total pixels that can be decoded concurrently on mobile devices.
const MOBILE_IMAGE_DECODE_BUDGET_PIXELS = LIMITS.thumbnails.featureImage.imageDecodeBudgetPixels.mobile;
const DESKTOP_IMAGE_DECODE_BUDGET_PIXELS = LIMITS.thumbnails.featureImage.imageDecodeBudgetPixels.desktop;
// Maximum size (in bytes) of images read into memory before decoding/resizing.
const MAX_LOCAL_IMAGE_BYTES = Platform.isMobile
    ? LIMITS.thumbnails.featureImage.maxImageBytes.local.mobile
    : LIMITS.thumbnails.featureImage.maxImageBytes.local.desktop;
const MAX_EXTERNAL_IMAGE_BYTES = Platform.isMobile
    ? LIMITS.thumbnails.featureImage.maxImageBytes.external.mobile
    : LIMITS.thumbnails.featureImage.maxImageBytes.external.desktop;
// Maximum SVG source size (in bytes) accepted for rasterized thumbnails.
const MAX_SVG_SOURCE_BYTES = LIMITS.thumbnails.featureImage.svg.maxSourceBytes;

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/bmp'
]);

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    heic: 'image/heic',
    heif: 'image/heif',
    bmp: 'image/bmp'
};

type ImageBuffer = { buffer: ArrayBuffer; mimeType: string };

type ThumbnailSourceKind = 'local' | 'external';

type ExternalImagePreflight = {
    mimeType: string;
};

export type FeatureImageThumbnailRuntime = {
    externalRequestLimiter: ReturnType<typeof createRenderLimiter>;
    imageDecodeLimiter: ReturnType<typeof createRenderBudgetLimiter>;
    thumbnailCanvasLimiter: ReturnType<typeof createRenderLimiter>;
    thumbnailCanvasPool: (HTMLCanvasElement | OffscreenCanvas)[];
    logOnce: ReturnType<typeof createOnceLogger>;
    inFlightDownloads: Map<string, Promise<ImageBuffer | null>>;
    externalRequestTimeoutDebt: number;
};

export function createFeatureImageThumbnailRuntime(): FeatureImageThumbnailRuntime {
    return {
        externalRequestLimiter: createRenderLimiter(LIMITS.thumbnails.featureImage.externalRequest.parallelLimit),
        imageDecodeLimiter: createRenderBudgetLimiter(
            Platform.isMobile ? MOBILE_IMAGE_DECODE_BUDGET_PIXELS : DESKTOP_IMAGE_DECODE_BUDGET_PIXELS
        ),
        thumbnailCanvasLimiter: createRenderLimiter(LIMITS.thumbnails.featureImage.thumbnailCanvasParallelLimit),
        thumbnailCanvasPool: [],
        logOnce: createOnceLogger(),
        inFlightDownloads: new Map<string, Promise<ImageBuffer | null>>(),
        externalRequestTimeoutDebt: 0
    };
}

export function getLocalFeatureImageKey(file: TFile): string {
    return `f:${file.path}@${file.stat.mtime}`;
}

/**
 * Content provider for finding and storing feature images
 */
export class FeatureImageContentProvider extends BaseContentProvider {
    protected readonly PARALLEL_LIMIT: number = LIMITS.contentProvider.parallelLimit;

    private readonly thumbnailRuntime: FeatureImageThumbnailRuntime;

    constructor(
        app: App,
        readCache: ContentReadCache | null = null,
        thumbnailRuntime: FeatureImageThumbnailRuntime = createFeatureImageThumbnailRuntime()
    ) {
        super(app, readCache);
        this.thumbnailRuntime = thumbnailRuntime;
    }

    /**
     * Returns a response header value using a case-insensitive lookup.
     *
     * HTTP header names are case-insensitive, but `requestUrl()` returns headers as a plain object
     * whose keys are not guaranteed to be normalized. Observed on iOS: the response includes `Content-Type`
     * (capitalized) rather than `content-type` (lowercase), so a direct `headers['content-type']` lookup
     * can return `undefined`.
     */
    private getHeaderValue(headers: Record<string, string>, headerName: string): string | undefined {
        const direct = headers[headerName];
        if (direct !== undefined) {
            return direct;
        }

        const needle = headerName.toLowerCase();
        for (const [key, value] of Object.entries(headers)) {
            if (key.toLowerCase() === needle) {
                return value;
            }
        }

        return undefined;
    }

    getContentType(): ContentProviderType {
        return 'fileThumbnails';
    }

    getRelevantSettings(): (keyof NotebookNavigatorSettings)[] {
        return ['showFeatureImage', 'featureImagePixelSize'];
    }

    shouldRegenerate(oldSettings: NotebookNavigatorSettings, newSettings: NotebookNavigatorSettings): boolean {
        if (oldSettings.featureImagePixelSize !== newSettings.featureImagePixelSize) {
            return true;
        }

        // Clear if feature image is disabled
        if (!newSettings.showFeatureImage && oldSettings.showFeatureImage) {
            return true;
        }

        return false;
    }

    async clearContent(_context?: { oldSettings: NotebookNavigatorSettings; newSettings: NotebookNavigatorSettings }): Promise<void> {
        const db = getDBInstance();
        await db.batchClearFeatureImageContent('nonMarkdown');
    }

    protected needsProcessing(fileData: FileData | null, file: TFile, settings: NotebookNavigatorSettings): boolean {
        if (!settings.showFeatureImage) {
            return false;
        }

        if (file.extension === 'md') {
            return false;
        }

        const fileModified = fileData !== null && fileData.fileThumbnailsMtime !== file.stat.mtime;

        if (isGeneratedThumbnailFile(file)) {
            // PDFs and SVGs can have generated thumbnails; changes need reprocessing.
            const expectedKey = this.getFeatureImageKey({ kind: 'local', file });
            return (
                fileModified ||
                !fileData ||
                fileData.featureImageStatus === 'unprocessed' ||
                fileData.featureImageKey === null ||
                fileData.featureImageKey !== expectedKey
            );
        }

        const drawingSource = getDrawingFeatureImageSource(this.app, file);
        if (drawingSource) {
            const expectedKey = getDrawingDirectFeatureImageKey(file, drawingSource.providerId);
            return (
                fileModified ||
                !fileData ||
                fileData.featureImageStatus === 'unprocessed' ||
                fileData.featureImageKey === null ||
                fileData.featureImageKey !== expectedKey
            );
        }

        // The featureImageKey is the durable "processed" marker even when no blob is stored.
        return fileModified || !fileData || fileData.featureImageKey === null;
    }

    protected async processFile(
        job: { file: TFile; path: string },
        fileData: FileData | null,
        settings: NotebookNavigatorSettings
    ): Promise<ContentProviderProcessResult> {
        if (!settings.showFeatureImage) {
            return { update: null, processed: true };
        }

        if (job.file.extension === 'md') {
            return { update: null, processed: true };
        }

        // Generate thumbnails for PDF files (first page cover) and SVG files (rasterized vector)
        if (isGeneratedThumbnailFile(job.file)) {
            const reference: FeatureImageReference = { kind: 'local', file: job.file };
            const featureImageKey = this.getFeatureImageKey(reference);

            // `featureImageKey` is the durable marker for the selected source (it includes the file mtime).
            // Forced provider-mtime resets must still re-render thumbnails when `fileThumbnailsMtime` is stale.
            const isUpToDate =
                fileData &&
                fileData.featureImageKey === featureImageKey &&
                fileData.fileThumbnailsMtime === job.file.stat.mtime &&
                fileData.featureImageStatus !== 'unprocessed';
            if (isUpToDate) {
                return { update: null, processed: true };
            }

            const thumbnail = await this.createThumbnailBlob(reference, settings);
            if (!thumbnail) {
                const empty = this.createEmptyBlob();
                return { update: { path: job.path, featureImage: empty, featureImageKey }, processed: true };
            }

            return { update: { path: job.path, featureImage: thumbnail, featureImageKey }, processed: true };
        }

        const drawingSource = getDrawingFeatureImageSource(this.app, job.file);
        if (drawingSource) {
            const featureImageKey = getDrawingDirectFeatureImageKey(job.file, drawingSource.providerId);
            const isUpToDate = fileData?.featureImageKey === featureImageKey && fileData.featureImageStatus === 'none';
            if (isUpToDate) {
                return { update: null, processed: true };
            }

            return { update: { path: job.path, featureImage: this.createEmptyBlob(), featureImageKey }, processed: true };
        }

        const nextKey = '';
        const nextImage = this.createEmptyBlob();
        // Empty blobs are used as a processed marker; storage drops them and keeps the key.
        // A new key (reference change) is required before another attempt is recorded.
        if (fileData && fileData.featureImageKey === nextKey) {
            return { update: null, processed: true };
        }
        return { update: { path: job.path, featureImage: nextImage, featureImageKey: nextKey }, processed: true };
    }

    protected createEmptyBlob(): Blob {
        return new Blob([]);
    }

    protected getFeatureImageKey(reference: FeatureImageReference): string {
        if (reference.kind === 'local') {
            // Local references include the source mtime so edits to the image invalidate the key.
            return getLocalFeatureImageKey(reference.file);
        }

        if (reference.kind === 'external') {
            // External references use a normalized https URL as the key.
            return `e:${reference.url}`;
        }

        // YouTube references use the video ID so all thumbnail URLs for a video map to one key.
        return `y:${reference.videoId}`;
    }

    protected async createThumbnailBlob(reference: FeatureImageReference, settings: NotebookNavigatorSettings): Promise<Blob | null> {
        const thumbnailDimensions = this.getThumbnailDimensions(settings.featureImagePixelSize);

        if (reference.kind === 'local') {
            if (isPdfFile(reference.file)) {
                return await renderPdfCoverThumbnail(this.app, reference.file, {
                    maxWidth: thumbnailDimensions.width,
                    maxHeight: thumbnailDimensions.height,
                    mimeType: Platform.isIosApp ? IOS_THUMBNAIL_OUTPUT_MIME : THUMBNAIL_OUTPUT_MIME,
                    quality: THUMBNAIL_OUTPUT_QUALITY
                });
            }

            const imageData = await this.readLocalImage(reference.file);
            if (!imageData) {
                return null;
            }

            return await this.createThumbnailBlobFromBuffer(
                imageData.buffer,
                imageData.mimeType,
                reference.file.path,
                'local',
                thumbnailDimensions
            );
        }

        if (reference.kind === 'external') {
            if (!settings.downloadExternalFeatureImages) {
                return null;
            }
            const imageData = await this.downloadExternalImage(reference.url);
            if (!imageData) {
                return null;
            }
            return await this.createThumbnailBlobFromBuffer(
                imageData.buffer,
                imageData.mimeType,
                reference.url,
                'external',
                thumbnailDimensions
            );
        }

        if (!settings.downloadExternalFeatureImages) {
            return null;
        }
        const imageData = await this.downloadYoutubeThumbnail(reference.videoId);
        if (!imageData) {
            return null;
        }
        return await this.createThumbnailBlobFromBuffer(
            imageData.buffer,
            imageData.mimeType,
            `youtube:${reference.videoId}`,
            'external',
            thumbnailDimensions
        );
    }

    private async readLocalImage(file: TFile): Promise<ImageBuffer | null> {
        const mimeType = this.getMimeTypeFromExtension(file.extension);
        if (!mimeType) {
            return null;
        }

        if (file.stat.size > MAX_LOCAL_IMAGE_BYTES) {
            this.thumbnailRuntime.logOnce(
                `featureImage-local-too-large:${MAX_LOCAL_IMAGE_BYTES}`,
                `[${file.path}] Skipping local image (${file.stat.size} bytes) - file too large`
            );
            return null;
        }

        // SVG sources have a stricter byte cap; checking the file stat avoids reading oversized files into memory.
        if (mimeType === 'image/svg+xml' && file.stat.size > MAX_SVG_SOURCE_BYTES) {
            this.thumbnailRuntime.logOnce(
                `featureImage-svg-too-large:${MAX_SVG_SOURCE_BYTES}:${file.path}`,
                `[${file.path}] Skipping SVG feature image (${file.stat.size} bytes) - source too large`
            );
            return null;
        }

        try {
            const buffer = await this.app.vault.adapter.readBinary(file.path);
            return { buffer, mimeType };
        } catch (error) {
            console.error(`Failed to read image ${file.path}:`, error);
            return null;
        }
    }

    /**
     * Fetches a URL with a timeout and concurrency limit to prevent overwhelming the network.
     */
    private async requestUrlWithTimeout(request: RequestUrlParam, timeoutMs: number): Promise<RequestUrlResponse | null> {
        // Acquire limiter slot to control concurrent external requests
        const releaseLimiter = await this.thumbnailRuntime.externalRequestLimiter.acquire();
        let limiterReleased = false;
        const timerWindow = activeWindow;
        let hardReleaseId: ReturnType<typeof window.setTimeout> | null = null;
        let timeoutDebtAdded = false;
        let timeoutDebtTimerId: ReturnType<typeof window.setTimeout> | null = null;

        const safeReleaseLimiter = () => {
            if (limiterReleased) {
                return;
            }
            limiterReleased = true;
            if (hardReleaseId !== null) {
                timerWindow.clearTimeout(hardReleaseId);
                hardReleaseId = null;
            }
            releaseLimiter();
        };

        const safeReleaseTimeoutDebt = () => {
            if (!timeoutDebtAdded) {
                return;
            }
            timeoutDebtAdded = false;
            if (timeoutDebtTimerId !== null) {
                timerWindow.clearTimeout(timeoutDebtTimerId);
                timeoutDebtTimerId = null;
            }
            this.thumbnailRuntime.externalRequestTimeoutDebt = Math.max(0, this.thumbnailRuntime.externalRequestTimeoutDebt - 1);
        };

        const tryAddTimeoutDebt = (): boolean => {
            if (timeoutDebtAdded) {
                return true;
            }

            if (this.thumbnailRuntime.externalRequestTimeoutDebt >= EXTERNAL_REQUEST_TIMEOUT_DEBT_MAX) {
                return false;
            }

            this.thumbnailRuntime.externalRequestTimeoutDebt += 1;
            timeoutDebtAdded = true;
            timeoutDebtTimerId = timerWindow.setTimeout(() => safeReleaseTimeoutDebt(), EXTERNAL_REQUEST_MAX_LIFETIME_MS);
            return true;
        };

        hardReleaseId = timerWindow.setTimeout(() => safeReleaseLimiter(), EXTERNAL_REQUEST_MAX_LIFETIME_MS);

        let timeoutId: ReturnType<typeof window.setTimeout> | null = null;
        const timeoutPromise = new Promise<null>(resolve => {
            timeoutId = timerWindow.setTimeout(() => {
                // When a request times out, optionally free the limiter slot so other requests can proceed.
                // This can oversubscribe real in-flight requests since `requestUrl()` cannot be aborted, so it is bounded
                // by EXTERNAL_REQUEST_TIMEOUT_DEBT_MAX. When the debt budget is exhausted, we keep the limiter slot until
                // the request settles or the hard release timer fires.
                if (tryAddTimeoutDebt()) {
                    safeReleaseLimiter();
                }
                resolve(null);
            }, timeoutMs);
        });

        try {
            // `requestUrl` does not accept an AbortSignal, so we use Promise.race with a timer and ignore late results.
            const rawPromise = requestUrl(request);
            const requestPromise = rawPromise
                .then(response => response)
                .catch(() => null)
                .finally(() => {
                    safeReleaseLimiter();
                    safeReleaseTimeoutDebt();
                });

            const responseOrNull = await Promise.race([requestPromise, timeoutPromise]);
            return responseOrNull ?? null;
        } catch {
            safeReleaseLimiter();
            safeReleaseTimeoutDebt();
            return null;
        } finally {
            if (timeoutId !== null) {
                timerWindow.clearTimeout(timeoutId);
            }
        }
    }

    private async downloadExternalImage(imageUrl: string): Promise<ImageBuffer | null> {
        const trimmedUrl = imageUrl.trim();
        if (!isValidHttpsUrl(trimmedUrl)) {
            return null;
        }

        return await this.getOrCreateDownload(`ext:${trimmedUrl}`, async () => {
            try {
                const preflight = await this.preflightExternalImage(trimmedUrl);
                if (!preflight) {
                    return null;
                }

                const response = await this.requestUrlWithTimeout(
                    {
                        url: trimmedUrl,
                        method: 'GET',
                        throw: false
                    },
                    EXTERNAL_REQUEST_TIMEOUT_MS
                );

                if (!response || response.status !== 200) {
                    return null;
                }

                // Determine the image type from the response headers.
                // iOS can return `Content-Type` instead of `content-type`, so use a case-insensitive lookup.
                const contentTypeHeader = this.getHeaderValue(response.headers, 'content-type');
                const mimeType = contentTypeHeader ? this.getMimeTypeFromContentType(contentTypeHeader) : preflight.mimeType;
                if (!mimeType) {
                    this.thumbnailRuntime.logOnce(
                        `featureImage-external-unsupported-content-type:${contentTypeHeader}:${trimmedUrl}`,
                        `[${trimmedUrl}] Skipping external image - unsupported Content-Type: ${contentTypeHeader}`
                    );
                    return null;
                }

                if (!response.arrayBuffer) {
                    this.thumbnailRuntime.logOnce(
                        `featureImage-external-missing-arrayBuffer:${mimeType}:${trimmedUrl}`,
                        `[${trimmedUrl}] Skipping external image - response missing arrayBuffer for ${mimeType}`
                    );
                    return null;
                }

                if (response.arrayBuffer.byteLength > MAX_EXTERNAL_IMAGE_BYTES) {
                    this.thumbnailRuntime.logOnce(
                        `featureImage-external-too-large:${MAX_EXTERNAL_IMAGE_BYTES}:${trimmedUrl}`,
                        `[${trimmedUrl}] Skipping external image (${response.arrayBuffer.byteLength} bytes) - file too large`
                    );
                    return null;
                }

                return { buffer: response.arrayBuffer, mimeType };
            } catch {
                return null;
            }
        });
    }

    private async preflightExternalImage(imageUrl: string): Promise<ExternalImagePreflight | null> {
        const response = await this.requestUrlWithTimeout(
            {
                url: imageUrl,
                method: 'HEAD',
                throw: false
            },
            EXTERNAL_REQUEST_TIMEOUT_MS
        );

        if (!response || response.status < 200 || response.status >= 300) {
            this.thumbnailRuntime.logOnce(
                `featureImage-external-head-failed:${imageUrl}`,
                `[${imageUrl}] Skipping external image - HEAD request failed`
            );
            return null;
        }

        const contentTypeHeader = this.getHeaderValue(response.headers, 'content-type');
        if (!contentTypeHeader) {
            this.thumbnailRuntime.logOnce(
                `featureImage-external-missing-content-type:${imageUrl}`,
                `[${imageUrl}] Skipping external image - missing Content-Type header`
            );
            return null;
        }

        const mimeType = this.getMimeTypeFromContentType(contentTypeHeader);
        if (!mimeType) {
            this.thumbnailRuntime.logOnce(
                `featureImage-external-unsupported-content-type:${contentTypeHeader}:${imageUrl}`,
                `[${imageUrl}] Skipping external image - unsupported Content-Type: ${contentTypeHeader}`
            );
            return null;
        }

        const contentLength = this.parseContentLength(this.getHeaderValue(response.headers, 'content-length'));
        if (contentLength === null) {
            this.thumbnailRuntime.logOnce(
                `featureImage-external-missing-content-length:${imageUrl}`,
                `[${imageUrl}] Skipping external image - missing Content-Length header`
            );
            return null;
        }

        if (contentLength > MAX_EXTERNAL_IMAGE_BYTES) {
            this.thumbnailRuntime.logOnce(
                `featureImage-external-too-large:${MAX_EXTERNAL_IMAGE_BYTES}:${imageUrl}`,
                `[${imageUrl}] Skipping external image (${contentLength} bytes) - file too large`
            );
            return null;
        }

        // SVG sources have a stricter byte cap; checking the reported length avoids downloading oversized bodies.
        if (mimeType === 'image/svg+xml' && contentLength > MAX_SVG_SOURCE_BYTES) {
            this.thumbnailRuntime.logOnce(
                `featureImage-svg-too-large:${MAX_SVG_SOURCE_BYTES}:${imageUrl}`,
                `[${imageUrl}] Skipping SVG feature image (${contentLength} bytes) - source too large`
            );
            return null;
        }

        return { mimeType };
    }

    private async downloadYoutubeThumbnail(videoId: string): Promise<ImageBuffer | null> {
        const candidates: { quality: string; mimeType: string }[] = [
            { quality: 'maxresdefault.jpg', mimeType: 'image/jpeg' },
            { quality: 'hqdefault.jpg', mimeType: 'image/jpeg' }
        ];

        for (const candidate of candidates) {
            const url = getYoutubeThumbnailUrl(videoId, candidate.quality);
            if (!isValidHttpsUrl(url)) {
                continue;
            }

            const result = await this.getOrCreateDownload(`yt:${url}|${candidate.mimeType}`, async () => {
                try {
                    const response = await this.requestUrlWithTimeout(
                        {
                            url,
                            method: 'GET',
                            headers: { Accept: candidate.mimeType },
                            throw: false
                        },
                        EXTERNAL_REQUEST_TIMEOUT_MS
                    );

                    if (response && response.status === 200 && response.arrayBuffer) {
                        return { buffer: response.arrayBuffer, mimeType: candidate.mimeType };
                    }
                    return null;
                } catch {
                    return null;
                }
            });

            if (result) {
                return result;
            }
        }

        return null;
    }

    // Deduplicates concurrent download requests by returning an existing promise for the same key
    private async getOrCreateDownload(key: string, request: () => Promise<ImageBuffer | null>): Promise<ImageBuffer | null> {
        const existing = this.thumbnailRuntime.inFlightDownloads.get(key);
        if (existing) {
            return existing;
        }

        const promise = request().finally(() => {
            this.thumbnailRuntime.inFlightDownloads.delete(key);
        });

        this.thumbnailRuntime.inFlightDownloads.set(key, promise);
        return promise;
    }

    // Resizes an image buffer to thumbnail dimensions with platform-aware pixel limits
    private async createThumbnailBlobFromBuffer(
        buffer: ArrayBuffer,
        mimeType: string,
        source: string,
        sourceKind: ThumbnailSourceKind,
        thumbnailDimensions: FeatureImageThumbnailDimensions
    ): Promise<Blob | null> {
        const normalizedMimeType = normalizeImageMimeType(mimeType);
        const detectedMimeType = detectImageMimeTypeFromBuffer(buffer);
        const effectiveMimeType =
            detectedMimeType && SUPPORTED_IMAGE_MIME_TYPES.has(detectedMimeType) ? detectedMimeType : normalizedMimeType;

        if (
            sourceKind === 'local' &&
            detectedMimeType &&
            detectedMimeType !== normalizedMimeType &&
            SUPPORTED_IMAGE_MIME_TYPES.has(detectedMimeType)
        ) {
            this.thumbnailRuntime.logOnce(
                `featureImage-mime-mismatch:${normalizedMimeType}:${detectedMimeType}:${source}`,
                `[${source}] Detected ${detectedMimeType} content for declared ${normalizedMimeType}`
            );
        }

        if (effectiveMimeType === 'image/svg+xml') {
            return await this.createSvgThumbnailBlob(buffer, source, thumbnailDimensions);
        }

        // Extract dimensions from the image header to determine if resizing is needed.
        // Skip images with unknown dimensions to avoid memory issues during decoding.
        const dimensionsPair = getImageDimensionsPairFromBuffer(buffer, effectiveMimeType);
        if (!dimensionsPair) {
            this.thumbnailRuntime.logOnce(
                `featureImage-unknown-dimensions:${effectiveMimeType}:${source}`,
                `[${source}] Skipping ${effectiveMimeType} (${buffer.byteLength} bytes) - unable to determine image dimensions`
            );
            return null;
        }

        const { display: displayDimensions, coded: codedDimensions } = dimensionsPair;
        const pixelCount = codedDimensions.width * codedDimensions.height;

        const maxFallbackPixels = Platform.isMobile
            ? LIMITS.thumbnails.featureImage.maxFallbackPixels.mobile
            : LIMITS.thumbnails.featureImage.maxFallbackPixels.desktop;

        const { width: targetWidth, height: targetHeight } = this.calculateThumbnailDimensions(
            displayDimensions.width,
            displayDimensions.height,
            thumbnailDimensions
        );

        const sourceBlob = new Blob([buffer], { type: effectiveMimeType });
        const releaseDecodeBudget = await this.thumbnailRuntime.imageDecodeLimiter.acquire(pixelCount);

        try {
            // Attempt direct bitmap resize/encode, which is more memory-efficient for large images.
            const resizedBitmapResult = await this.tryCreateThumbnailFromResizedBitmap(sourceBlob, targetWidth, targetHeight);
            if (resizedBitmapResult) {
                return resizedBitmapResult;
            }

            // Fallback decoding loads the full image into memory, so apply stricter limits.
            if (pixelCount > maxFallbackPixels) {
                const fallbackReason = typeof createImageBitmap === 'undefined' ? 'createImageBitmap unavailable' : 'resize bitmap failed';
                this.thumbnailRuntime.logOnce(
                    `featureImage-fallback-skip:${effectiveMimeType}:${codedDimensions.width}x${codedDimensions.height}:${source}`,
                    `[${source}] Skipping ${effectiveMimeType} (${codedDimensions.width}x${codedDimensions.height}, ${pixelCount} px) - ${fallbackReason}; fallback decode capped at ${maxFallbackPixels} px`
                );
                return null;
            }

            const bitmapResult = await this.tryCreateThumbnailFromBitmap(sourceBlob, thumbnailDimensions);
            if (bitmapResult) {
                return bitmapResult;
            }

            return await this.withImageFromBlob(sourceBlob, async image => {
                const sourceWidth = image.naturalWidth || image.width || 0;
                const sourceHeight = image.naturalHeight || image.height || 0;

                if (sourceWidth <= 0 || sourceHeight <= 0) {
                    return null;
                }

                const { width, height } = this.calculateThumbnailDimensions(sourceWidth, sourceHeight, thumbnailDimensions);
                return await this.resizeImageToBlob(image, width, height);
            });
        } finally {
            releaseDecodeBudget();
        }
    }

    /**
     * Rasterizes a vector-only SVG source into a thumbnail blob.
     *
     * The source is validated and sized by `prepareSvgFeatureImageSource()`, then decoded through
     * an image element because `createImageBitmap()` does not accept SVG blobs in Chromium.
     * Decoding an SVG in an image element runs in the browser's static image mode, so scripts
     * do not execute and external resources do not load.
     */
    private async createSvgThumbnailBlob(
        buffer: ArrayBuffer,
        source: string,
        thumbnailDimensions: FeatureImageThumbnailDimensions
    ): Promise<Blob | null> {
        if (buffer.byteLength > MAX_SVG_SOURCE_BYTES) {
            this.thumbnailRuntime.logOnce(
                `featureImage-svg-too-large:${MAX_SVG_SOURCE_BYTES}:${source}`,
                `[${source}] Skipping SVG feature image (${buffer.byteLength} bytes) - source too large`
            );
            return null;
        }

        const svgText = decodeSvgSourceText(buffer);
        const prepared = prepareSvgFeatureImageSource({
            svgText,
            maxWidth: thumbnailDimensions.width,
            maxHeight: thumbnailDimensions.height
        });
        if (!prepared.source) {
            this.thumbnailRuntime.logOnce(
                `featureImage-svg-rejected:${prepared.reason}:${source}`,
                `[${source}] Skipping SVG feature image - ${prepared.reason}`
            );
            return null;
        }

        const { blob, width, height } = prepared.source;
        const releaseDecodeBudget = await this.thumbnailRuntime.imageDecodeLimiter.acquire(width * height);
        try {
            return await this.withImageFromBlob(blob, async image => await this.resizeSourceToBlob(image, width, height));
        } catch {
            this.thumbnailRuntime.logOnce(
                `featureImage-svg-decode-failed:${source}`,
                `[${source}] Skipping SVG feature image - decode failed`
            );
            return null;
        } finally {
            releaseDecodeBudget();
        }
    }

    // Decodes and resizes an image in a single step using createImageBitmap resize options.
    // This approach avoids loading the full-resolution image into memory.
    private async tryCreateThumbnailFromResizedBitmap(blob: Blob, targetWidth: number, targetHeight: number): Promise<Blob | null> {
        if (typeof createImageBitmap === 'undefined') {
            return null;
        }

        if (targetWidth <= 0 || targetHeight <= 0) {
            return null;
        }

        let bitmap: ImageBitmap;
        try {
            bitmap = await createImageBitmap(blob, {
                imageOrientation: 'from-image',
                resizeWidth: targetWidth,
                resizeHeight: targetHeight,
                resizeQuality: 'high'
            });
        } catch {
            return null;
        }

        try {
            return await this.resizeSourceToBlob(bitmap, targetWidth, targetHeight);
        } finally {
            this.closeBitmap(bitmap);
        }
    }

    // Decodes a blob to an ImageBitmap and encodes it to thumbnail dimensions
    private async tryCreateThumbnailFromBitmap(blob: Blob, thumbnailDimensions: FeatureImageThumbnailDimensions): Promise<Blob | null> {
        if (typeof createImageBitmap === 'undefined') {
            return null;
        }

        let bitmap: ImageBitmap;
        try {
            bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
        } catch {
            return null;
        }

        try {
            const sourceWidth = bitmap.width || 0;
            const sourceHeight = bitmap.height || 0;

            if (sourceWidth <= 0 || sourceHeight <= 0) {
                return null;
            }

            const { width, height } = this.calculateThumbnailDimensions(sourceWidth, sourceHeight, thumbnailDimensions);
            return await this.resizeSourceToBlob(bitmap, width, height);
        } finally {
            this.closeBitmap(bitmap);
        }
    }

    // Releases the resources held by an ImageBitmap
    private closeBitmap(bitmap: ImageBitmap | null): void {
        if (!bitmap) {
            return;
        }

        try {
            bitmap.close();
        } catch {
            // ignore
        }
    }

    // Loads a blob as an HTMLImageElement and passes it to the handler for processing
    private async withImageFromBlob<T>(blob: Blob, handler: (image: HTMLImageElement) => Promise<T>): Promise<T> {
        const imageUrl = URL.createObjectURL(blob);

        try {
            // Decode the image via an object URL and pass it to the handler.
            const image = await this.loadImage(imageUrl);
            return await handler(image);
        } finally {
            // Always revoke the object URL after decoding.
            URL.revokeObjectURL(imageUrl);
        }
    }

    private async resizeImageToBlob(image: HTMLImageElement, width: number, height: number): Promise<Blob | null> {
        return await this.resizeSourceToBlob(image, width, height);
    }

    private async resizeSourceToBlob(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
        if (width <= 0 || height <= 0) {
            return null;
        }

        const canvasResult = await this.acquireThumbnailCanvas(width, height);
        if (!canvasResult) {
            return null;
        }

        const { canvas, ctx, release } = canvasResult;

        try {
            ctx.clearRect(0, 0, width, height);
            if ('imageSmoothingQuality' in ctx) {
                ctx.imageSmoothingQuality = 'high';
            }
            ctx.drawImage(source, 0, 0, width, height);

            const outputMimeType = Platform.isIosApp ? IOS_THUMBNAIL_OUTPUT_MIME : THUMBNAIL_OUTPUT_MIME;

            // Encode to the primary thumbnail mime type; fall back to PNG when encoding fails.
            const primary =
                outputMimeType === 'image/png'
                    ? await this.canvasToBlob(canvas, outputMimeType)
                    : await this.canvasToBlob(canvas, outputMimeType, THUMBNAIL_OUTPUT_QUALITY);
            if (primary) {
                return primary;
            }

            if (outputMimeType !== 'image/png') {
                return this.canvasToBlob(canvas, 'image/png');
            }

            return null;
        } finally {
            release();
        }
    }

    private createCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
        if (typeof OffscreenCanvas !== 'undefined') {
            const canvas = new OffscreenCanvas(width, height);
            if (typeof canvas.convertToBlob === 'function') {
                return canvas;
            }
        }
        const canvas = createEl('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    protected getThumbnailDimensions(featureImagePixelSize: FeatureImagePixelSizeSetting | undefined): FeatureImageThumbnailDimensions {
        return FEATURE_IMAGE_THUMBNAIL_DIMENSIONS[featureImagePixelSize ?? '256'];
    }

    private calculateThumbnailDimensions(
        srcWidth: number,
        srcHeight: number,
        thumbnailDimensions: FeatureImageThumbnailDimensions
    ): { width: number; height: number } {
        let width = srcWidth;
        let height = srcHeight;

        // Constrain the thumbnail to the max dimensions while preserving aspect ratio.
        if (srcWidth > thumbnailDimensions.width || srcHeight > thumbnailDimensions.height) {
            const aspectRatio = srcWidth / srcHeight;

            if (thumbnailDimensions.width / thumbnailDimensions.height > aspectRatio) {
                height = thumbnailDimensions.height;
                width = Math.round(height * aspectRatio);
            } else {
                width = thumbnailDimensions.width;
                height = Math.round(width / aspectRatio);
            }
        }

        return { width: Math.max(1, width), height: Math.max(1, height) };
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }

    /**
     * Acquires a canvas from the pool for thumbnail rendering with concurrency limiting.
     * Returns a canvas, context, and release function that must be called when done.
     */
    private async acquireThumbnailCanvas(
        width: number,
        height: number
    ): Promise<{
        canvas: HTMLCanvasElement | OffscreenCanvas;
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        release: () => void;
    } | null> {
        const releaseLimiter = await this.thumbnailRuntime.thumbnailCanvasLimiter.acquire();
        let released = false;

        // Reuse pooled canvas or create new one if pool is empty
        const canvas = this.thumbnailRuntime.thumbnailCanvasPool.pop() ?? this.createCanvas(Math.max(1, width), Math.max(1, height));
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            // Return canvas to pool and release limiter on context failure
            this.thumbnailRuntime.thumbnailCanvasPool.push(canvas);
            releaseLimiter();
            return null;
        }

        // Release function returns canvas to pool and frees limiter slot
        const release = () => {
            if (released) {
                return;
            }
            released = true;
            this.thumbnailRuntime.thumbnailCanvasPool.push(canvas);
            releaseLimiter();
        };

        return { canvas, ctx, release };
    }

    private isOffscreenCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): canvas is OffscreenCanvas {
        return typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas;
    }

    private async canvasToBlob(canvas: HTMLCanvasElement | OffscreenCanvas, mimeType: string, quality?: number): Promise<Blob | null> {
        // Wrap canvas.toBlob in a promise-based API.
        if (this.isOffscreenCanvas(canvas)) {
            try {
                return await canvas.convertToBlob({ type: mimeType, quality });
            } catch {
                return null;
            }
        }

        return await new Promise<Blob | null>(resolve => {
            canvas.toBlob(resolve, mimeType, quality);
        });
    }

    private getMimeTypeFromExtension(extension: string): string | null {
        if (!extension) {
            return null;
        }
        const key = extension.toLowerCase();
        return MIME_TYPE_BY_EXTENSION[key] ?? null;
    }

    private getMimeTypeFromContentType(contentType: string | undefined): string | null {
        if (!contentType) {
            return null;
        }

        const rawMimeType = contentType.split(';')[0].trim();
        const mimeType = normalizeImageMimeType(rawMimeType);
        if (!SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
            return null;
        }

        return mimeType;
    }

    private parseContentLength(contentLength: string | undefined): number | null {
        if (!contentLength) {
            return null;
        }

        const trimmed = contentLength.trim();
        if (!/^\d+$/.test(trimmed)) {
            return null;
        }

        const parsed = Number(trimmed);
        return Number.isSafeInteger(parsed) ? parsed : null;
    }
}
