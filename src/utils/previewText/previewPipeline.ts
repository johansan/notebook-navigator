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

import type { FrontMatterCache } from 'obsidian';
import type { NotebookNavigatorSettings } from '../../settings/types';
import {
    collectVisibleTextSkippingFencedCodeBlocks,
    findFencedCodeBlockRanges,
    findInlineCodeRanges,
    removeCalloutBlocks
} from '../codeRangeUtils';
import { hasExcalidrawFrontmatterFlag, isExcalidrawFileName } from '../fileNameUtils';
import { getMatchingRecordValue } from '../recordUtils';
import {
    clipIncludingCode,
    collapseWhitespace,
    decodeHtmlEntitiesOutsideCode,
    stripHtmlOutsideCode,
    stripLatexOutsideCode,
    stripTrailingIncompleteEmbeds,
    unwrapInlineCodeSegments,
    type CodeRangeContext
} from './codeAwareTransforms';
import { stripMarkdownSyntax } from './markdownSanitizer';

const MAX_PREVIEW_TEXT_LENGTH = 500;
const PREVIEW_SOURCE_SLACK = 400;
const PREVIEW_EXTENSION_LIMIT = MAX_PREVIEW_TEXT_LENGTH + PREVIEW_SOURCE_SLACK * 2;
const PREVIEW_CODE_BLOCK_SCAN_LIMIT = PREVIEW_EXTENSION_LIMIT * 50;

function removeFrontmatter(content: string): string {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function resolvePreviewPropertyValue(value: unknown): string | null {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (Array.isArray(value)) {
        for (const entry of value) {
            if (typeof entry !== 'string') {
                continue;
            }
            const trimmed = entry.trim();
            if (trimmed) {
                return trimmed;
            }
        }
    }

    return null;
}

function buildPreviewFromClippedSource(clipped: { text: string; context: CodeRangeContext }, settings: NotebookNavigatorSettings): string {
    if (!clipped.text.trim()) {
        return '';
    }

    const htmlStep = settings.stripHtmlInPreview
        ? stripHtmlOutsideCode(clipped.text, clipped.context, {
              enabled: true,
              preserveFencedCode: true
          })
        : clipped;
    if (!htmlStep.text.trim()) {
        return '';
    }

    const latexStep = settings.stripLatexInPreview ? stripLatexOutsideCode(htmlStep.text, htmlStep.context, { enabled: true }) : htmlStep;
    if (!latexStep.text.trim()) {
        return '';
    }

    const decodedStep = decodeHtmlEntitiesOutsideCode(latexStep.text, latexStep.context);
    if (!decodedStep.text.trim()) {
        return '';
    }

    const cleanedStep = stripTrailingIncompleteEmbeds(decodedStep);
    if (!cleanedStep.text.trim()) {
        return '';
    }

    const stripped = stripMarkdownSyntax(
        cleanedStep.text,
        settings.skipHeadingsInPreview,
        settings.skipCodeBlocksInPreview,
        cleanedStep.context
    );
    const preview = collapseWhitespace(stripped);
    if (!preview) {
        return '';
    }

    if (preview.length > MAX_PREVIEW_TEXT_LENGTH) {
        return `${preview.substring(0, MAX_PREVIEW_TEXT_LENGTH - 1)}…`;
    }

    return preview;
}

export function isExcalidrawFile(fileName: string, frontmatter?: FrontMatterCache): boolean {
    if (isExcalidrawFileName(fileName)) {
        return true;
    }

    if (hasExcalidrawFrontmatterFlag(frontmatter)) {
        return true;
    }

    return false;
}

export function normalizeExcerpt(excerpt: string, options?: { stripHtml?: boolean }): string | undefined {
    const shouldStripHtml = options?.stripHtml !== false;
    const containsHtml = shouldStripHtml && excerpt.includes('<');
    if (!containsHtml) {
        const inlineOnlyRanges = findInlineCodeRanges(excerpt);
        const decodedInlineResult = decodeHtmlEntitiesOutsideCode(excerpt, {
            inlineCodeRanges: inlineOnlyRanges,
            fencedCodeRanges: []
        });
        const unwrappedInline = unwrapInlineCodeSegments(decodedInlineResult.text, decodedInlineResult.context.inlineCodeRanges);
        const normalizedInline = collapseWhitespace(unwrappedInline);
        return normalizedInline.length > 0 ? normalizedInline : undefined;
    }

    const fenced = findFencedCodeBlockRanges(excerpt);
    const baseContext: CodeRangeContext = {
        inlineCodeRanges: findInlineCodeRanges(excerpt, fenced),
        fencedCodeRanges: fenced
    };
    const sanitizedResult = shouldStripHtml
        ? stripHtmlOutsideCode(excerpt, baseContext, { enabled: true })
        : { text: excerpt, context: baseContext };
    const decodedResult = decodeHtmlEntitiesOutsideCode(sanitizedResult.text, sanitizedResult.context);
    const unwrapped = unwrapInlineCodeSegments(decodedResult.text, decodedResult.context.inlineCodeRanges);
    const normalized = collapseWhitespace(unwrapped);
    return normalized.length > 0 ? normalized : undefined;
}

export function extractPreviewText(content: string, settings: NotebookNavigatorSettings, frontmatter?: FrontMatterCache): string {
    const targetLength = MAX_PREVIEW_TEXT_LENGTH + PREVIEW_SOURCE_SLACK;
    const maxExtension = PREVIEW_EXTENSION_LIMIT;
    const hasPreviewProperties = settings.previewProperties.length > 0;
    const shouldFallbackToNoteContent = settings.previewPropertiesFallback;

    if (frontmatter && hasPreviewProperties) {
        for (const property of settings.previewProperties) {
            const value = getMatchingRecordValue(frontmatter, property);
            const propertyValue = resolvePreviewPropertyValue(value);
            if (!propertyValue) {
                continue;
            }

            // Callouts are removed from the scan-limited window before clipping to maxExtension,
            // otherwise a leading callout longer than the clip window would blank out the preview
            // even when visible property text follows it.
            const scanLimitedProperty =
                propertyValue.length > PREVIEW_CODE_BLOCK_SCAN_LIMIT
                    ? propertyValue.slice(0, PREVIEW_CODE_BLOCK_SCAN_LIMIT)
                    : propertyValue;
            const calloutFilteredProperty = settings.skipCalloutsInPreview ? removeCalloutBlocks(scanLimitedProperty) : scanLimitedProperty;
            const propertySource =
                calloutFilteredProperty.length > maxExtension ? calloutFilteredProperty.slice(0, maxExtension) : calloutFilteredProperty;
            const fencedRanges = findFencedCodeBlockRanges(propertySource);
            const inlineRanges = findInlineCodeRanges(propertySource, fencedRanges);
            const clippedProperty = clipIncludingCode(
                propertySource,
                { inlineCodeRanges: inlineRanges, fencedCodeRanges: fencedRanges },
                targetLength,
                maxExtension
            );
            const preview = buildPreviewFromClippedSource(clippedProperty, settings);
            if (!preview) {
                continue;
            }
            return preview;
        }
    }

    if (hasPreviewProperties && !shouldFallbackToNoteContent) {
        return '';
    }

    if (!content) {
        return '';
    }

    const contentWithoutFrontmatter = removeFrontmatter(content);
    if (!contentWithoutFrontmatter.trim()) {
        return '';
    }

    // Callout blocks are removed before clipping so a long leading callout does not leave the
    // clipped window empty when visible text follows it. The scan-limited slice bounds the walk
    // for very large files.
    const previewSource = settings.skipCalloutsInPreview
        ? removeCalloutBlocks(
              contentWithoutFrontmatter.length > PREVIEW_CODE_BLOCK_SCAN_LIMIT
                  ? contentWithoutFrontmatter.slice(0, PREVIEW_CODE_BLOCK_SCAN_LIMIT)
                  : contentWithoutFrontmatter
          )
        : contentWithoutFrontmatter;

    const clipped = settings.skipCodeBlocksInPreview
        ? (() => {
              const visibleText = collectVisibleTextSkippingFencedCodeBlocks(previewSource, maxExtension, PREVIEW_CODE_BLOCK_SCAN_LIMIT);
              if (!visibleText) {
                  return { text: '', context: { inlineCodeRanges: [], fencedCodeRanges: [] } };
              }
              const inlineRanges = findInlineCodeRanges(visibleText);
              return clipIncludingCode(visibleText, { inlineCodeRanges: inlineRanges, fencedCodeRanges: [] }, targetLength, maxExtension);
          })()
        : (() => {
              const limitedSource = previewSource.length > maxExtension ? previewSource.slice(0, maxExtension) : previewSource;
              const fencedRanges = findFencedCodeBlockRanges(limitedSource);
              const inlineRanges = findInlineCodeRanges(limitedSource, fencedRanges);
              return clipIncludingCode(
                  limitedSource,
                  { inlineCodeRanges: inlineRanges, fencedCodeRanges: fencedRanges },
                  targetLength,
                  maxExtension
              );
          })();

    return buildPreviewFromClippedSource(clipped, settings);
}
