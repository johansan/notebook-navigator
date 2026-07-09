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

/**
 * Centralized, non-user-configurable limits used to keep background processing predictable.
 *
 * Design goals:
 * - Prevent UI freezes and out-of-memory crashes (especially on mobile).
 * - Bound worst-case work per scan (bytes read, pixels decoded, concurrency).
 * - Keep derived caches (IndexedDB + in-memory LRUs) within reasonable sizes.
 *
 * Notes:
 * - These are "safety rails", not accuracy guarantees (e.g. huge markdown files may fall back to conservative defaults).
 * - Values are intentionally conservative on mobile where memory and CPU budgets are smaller and OS OOM-kills are common.
 * - When changing a limit, consider both: (1) peak memory usage and (2) total work during initial vault scans.
 */
export const LIMITS = {
    markdown: {
        /**
         * Maximum markdown file size (bytes on disk) that we will read into a JS string via `vault.cachedRead()`.
         *
         * Used by:
         * - `MarkdownPipelineContentProvider` when generating preview text and/or word count.
         *
         * Why this exists:
         * - Reading large markdown files allocates a large JS string (often ~2 bytes per code unit), and preview/word-count
         *   extraction can create additional transient allocations. On mobile this can cause jank or OOM.
         *
         * Behavior when exceeded:
         * - The provider skips reading the file body and only applies "safe" updates that can be derived from metadata/frontmatter.
         * - Word count/preview may be set to conservative defaults to avoid repeated reprocessing loops.
         */
        maxReadBytes: {
            // Mobile: keep well below typical memory pressure thresholds; avoids freezing/OS kill during full-vault scans.
            mobile: 2_000_000,
            // Desktop: larger budget is usually safe, but still bounded to avoid pathological files dominating scan time.
            desktop: 8_000_000
        }
    },
    thumbnails: {
        featureImage: {
            /**
             * Thumbnail dimensions (px).
             *
             * Used by:
             * - `FeatureImageContentProvider` to generate list-pane thumbnails.
             *
             * Why these values:
             * - Keeps thumbnails visually useful while limiting IndexedDB payload size and decode/encode cost.
             * - 256x144 is a small, wide thumbnail that works well with typical cover images and list layouts.
             */
            maxWidth: 256,
            maxHeight: 144,
            output: {
                /**
                 * Output encoding for generated thumbnails.
                 *
                 * Used by:
                 * - `FeatureImageContentProvider` when encoding resized thumbnails.
                 *
                 * Rationale:
                 * - WebP yields smaller blobs than PNG/JPEG at similar visual quality for UI thumbnails.
                 * - iOS Safari has known WebP encoding issues in some contexts; PNG is a safer fallback there.
                 */
                mimeType: 'image/webp',
                iosMimeType: 'image/png',
                /**
                 * WebP/JPEG-style quality setting for thumbnail encoding.
                 * 0.75 is a balance between sharp UI thumbnails and keeping cached blobs small.
                 */
                quality: 0.75
            },
            svg: {
                /**
                 * Maximum SVG source size (bytes) accepted for feature image rasterization.
                 *
                 * Used by:
                 * - `FeatureImageContentProvider` before decoding SVG text.
                 *
                 * Rationale:
                 * - SVG sources are parsed with `DOMParser` on the main thread; this bounds one-time parse cost.
                 * - Vector sources for a small thumbnail rarely need more than a couple of megabytes.
                 */
                maxSourceBytes: 2_000_000,
                /**
                 * Maximum element count in a parsed SVG accepted for feature image rasterization.
                 * Applied to both the parsed element count and the painted count after `use` expansion.
                 *
                 * Used by:
                 * - `prepareSvgFeatureImageSource()` during validation.
                 *
                 * Rationale:
                 * - Bounds transient DOM size during validation and the one-time rasterization cost.
                 * - Nested `use` references multiply painted elements beyond the parsed count, so the
                 *   expanded count is capped as well.
                 * - Larger than the vault icon cap (2000) because thumbnails rasterize once instead of rendering live.
                 */
                maxElementCount: 10_000
            },
            externalRequest: {
                /**
                 * Per-request timeout (ms) for `requestUrl()` fetches for external images.
                 *
                 * Why:
                 * - External hosts can be slow/hang; this bounds time spent waiting before we consider the attempt failed.
                 * - Some sources (e.g. YouTube thumbnails) try multiple candidates; per-request timeout keeps total bounded.
                 */
                timeoutMs: 10_000,
                /**
                 * Hard maximum lifetime (ms) for an external request before we release our concurrency slot.
                 *
                 * Why:
                 * - `requestUrl()` does not accept an AbortSignal, so timed-out requests can keep running in background.
                 * - We still need to guarantee forward progress; this ensures limiter slots are eventually released.
                 */
                maxLifetimeMs: 60_000,
                /**
                 * Maximum number of concurrent external requests for feature images.
                 *
                 * Rationale:
                 * - Controls network concurrency and background memory use; too high can create bursty allocations.
                 * - 6 keeps scans reasonably fast without saturating the runtime (especially when multiple candidates are tried).
                 */
                parallelLimit: 6,
                timeoutDebtMax: {
                    /**
                     * Maximum number of timed-out external requests we allow to keep running while new ones proceed.
                     *
                     * Rationale:
                     * - When a request times out, we may release the limiter slot to avoid deadlock.
                     * - This can temporarily oversubscribe concurrency; "debt" bounds that oversubscription.
                     * - Mobile is strict (0) to avoid background runaway; desktop allows a small amount (2).
                     */
                    mobile: 0,
                    desktop: 2
                }
            },
            /**
             * Maximum number of concurrent thumbnail encodes/resize operations that require a canvas.
             *
             * Rationale:
             * - Canvas operations can be CPU and memory heavy. A cap prevents "encode storms" on large vault scans.
             */
            thumbnailCanvasParallelLimit: 6,
            imageDecodeBudgetPixels: {
                /**
                 * Total pixel budget that can be decoded concurrently.
                 *
                 * Used by:
                 * - `createFeatureImageThumbnailRuntime()` to limit concurrent image decode/resize work.
                 */
                mobile: 100_000_000,
                desktop: Number.MAX_SAFE_INTEGER
            },
            maxImageBytes: {
                local: {
                    /**
                     * Maximum number of bytes we will read into memory for a local image before attempting decode/resize.
                     *
                     * Rationale:
                     * - Bounds memory spikes; images larger than this are skipped for feature image generation.
                     */
                    mobile: 50_000_000,
                    desktop: 50_000_000
                },
                external: {
                    /**
                     * Maximum number of bytes we will accept/download for an external image before aborting the attempt.
                     *
                     * Rationale:
                     * - Prevents downloading very large images just to generate a small thumbnail.
                     */
                    mobile: 15_000_000,
                    desktop: 50_000_000
                }
            },
            maxFallbackPixels: {
                /**
                 * Stricter pixel cap for fallback decode paths that can load full-resolution images into memory.
                 *
                 * Used by:
                 * - `FeatureImageContentProvider.createThumbnailBlobFromBuffer()` when bitmap resize fallbacks require full decode.
                 * - `renderPdfCoverThumbnail()` via the pdf.js `maxImageSize` option (caps decoded image size).
                 *
                 * Rationale:
                 * - Some decode methods are more memory efficient (e.g. resize during decode). When those aren't available,
                 *   fallback paths can require full-resolution decode + canvas draw, which is much riskier.
                 */
                mobile: 15_000_000,
                desktop: 50_000_000
            }
        },
        pdf: {
            /**
             * Limits for PDF cover thumbnails (pdf.js).
             *
             * Used by:
             * - `renderPdfCoverThumbnail()` to cap concurrency.
             */
            maxParallelRenders: 2,
            /**
             * Maximum concurrent PDF page renders on mobile.
             */
            maxParallelRendersMobile: 1,
            preflight: {
                /**
                 * Conservative mobile render work budget (bytes) used to decide whether to skip PDF cover thumbnails.
                 *
                 * Used by:
                 * - `renderPdfCoverThumbnail()` via `pdfPreflight` to avoid calling `page.render(...)` on PDFs that are
                 *   likely to exceed mobile memory/work budgets.
                 *
                 * Notes:
                 * - This is a worst-case estimate; preflight is intentionally fail-closed on mobile.
                 */
                mobileBudgetBytes: 200_000_000,
                /**
                 * Maximum time (ms) to wait for `page.getOperatorList()` during preflight.
                 */
                operatorListTimeoutMs: 1_500,
                multipliers: {
                    /**
                     * Applies when the PDF signals page group transparency.
                     */
                    transparencyGroup: 1.5,
                    /**
                     * Applies when the PDF uses soft masks.
                     */
                    softMask: 1.5
                }
            },
            /**
             * Idle timeout for the shared pdf.js worker.
             *
             * Rationale:
             * - Keeps the worker around briefly to speed up bursts, but releases memory when idle.
             */
            workerIdleTimeoutMs: 60_000
        }
    },
    storage: {
        /**
         * Default in-memory cache sizes (LRU-like structures).
         *
         * Rationale:
         * - These are performance optimizations; too small increases churn, too large increases memory usage.
         * - Values are defaults that can still be overridden by constructor options where supported.
         */
        featureImageCacheMaxEntriesDefault: 1000,
        /**
         * Maximum number of preview text entries cached in memory.
         * Previews are small strings; 10k keeps scrolling snappy in large vaults without being too memory heavy.
         */
        previewTextCacheMaxEntriesDefault: 10_000,
        /**
         * Maximum number of formatted date/time strings cached in memory.
         * Keys include the format, timestamp, timezone offset, and UI language.
         */
        dateFormatCacheMaxEntries: 8192,
        /**
         * Maximum number of previews loaded in a single batch when warming the preview cache.
         * Keeps IndexedDB transactions short and avoids long main-thread stalls.
         */
        previewLoadMaxBatchDefault: 50
    },
    contentProvider: {
        /**
         * BaseContentProvider batch and retry controls.
         *
         * Rationale:
         * - Keeps background work responsive: process in chunks, parallelize moderately, and backoff on failures.
         */
        queueBatchSize: 100,
        parallelLimit: 10,
        retry: {
            /**
             * Exponential backoff for retry-later semantics (e.g. waiting for metadata cache).
             */
            initialDelayMs: 1000,
            maxDelayMs: 30_000,
            maxAttempts: 5
        },
        metadataCache: {
            /**
             * Controls for metadata-cache reads that can temporarily return empty results for recently created files.
             * Providers can defer persisting empty values and allow BaseContentProvider retries.
             */
            emptyValueRetryLimit: 2,
            recentFileWindowMs: 15_000
        }
    },
    operations: {
        /**
         * Number of files processed before yielding to the event loop during
         * tag/property rename and delete workflows.
         */
        metadataMutationYieldBatchSize: 100
    }
} as const;
