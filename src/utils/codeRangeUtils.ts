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

import { mergeRanges, NumericRange } from './arrayUtils';

/**
 * Utilities for locating code ranges in Markdown-like text.
 *
 * These helpers intentionally avoid a full markdown parser. They scan raw text and return character
 * ranges so callers can:
 * - skip fenced code blocks when generating previews
 * - preserve inline code spans while stripping markdown formatting
 *
 * The returned ranges use `[start, end)` indexing (end is exclusive).
 */

export type FenceMarkerChar = '`' | '~';
export type ParsedBlockquotePrefix = { depth: number; nextIndex: number };
export type ParsedFenceMarker = { markerChar: FenceMarkerChar; markerLength: number; nextIndex: number };
export type ParsedFenceOpen = { depth: number; markerChar: FenceMarkerChar; markerLength: number };

const CHAR_CODE_TAB = 9;
const CHAR_CODE_CARRIAGE_RETURN = 13;
const CHAR_CODE_FORM_FEED = 12;
const CHAR_CODE_SPACE = 32;

export function isMarkdownWhitespace(code: number): boolean {
    return code === CHAR_CODE_TAB || code === CHAR_CODE_CARRIAGE_RETURN || code === CHAR_CODE_FORM_FEED || code === CHAR_CODE_SPACE;
}

export function skipMarkdownWhitespace(line: string, startIndex: number): number {
    let index = startIndex;
    while (index < line.length) {
        if (!isMarkdownWhitespace(line.charCodeAt(index))) {
            break;
        }
        index += 1;
    }
    return index;
}

export function parseBlockquotePrefix(line: string): ParsedBlockquotePrefix {
    let index = skipMarkdownWhitespace(line, 0);
    let depth = 0;

    while (index < line.length && line[index] === '>') {
        depth += 1;
        index += 1;
        index = skipMarkdownWhitespace(line, index);
    }

    return { depth, nextIndex: index };
}

function parseFenceMarker(line: string, startIndex: number): ParsedFenceMarker | null {
    if (startIndex >= line.length) {
        return null;
    }

    const markerChar = line[startIndex];
    if (markerChar !== '`' && markerChar !== '~') {
        return null;
    }

    let index = startIndex + 1;
    while (index < line.length && line[index] === markerChar) {
        index += 1;
    }

    const markerLength = index - startIndex;
    if (markerLength < 3) {
        return null;
    }

    return { markerChar, markerLength, nextIndex: index };
}

export function parseFenceOpen(line: string, prefix: ParsedBlockquotePrefix): ParsedFenceOpen | null {
    const markerIndex = skipMarkdownWhitespace(line, prefix.nextIndex);
    const marker = parseFenceMarker(line, markerIndex);
    if (!marker) {
        return null;
    }

    return {
        depth: prefix.depth,
        markerChar: marker.markerChar,
        markerLength: marker.markerLength
    };
}

export function isFenceClose(
    line: string,
    depth: number,
    markerChar: FenceMarkerChar,
    markerLength: number,
    prefix: ParsedBlockquotePrefix
): boolean {
    if (prefix.depth !== depth) {
        return false;
    }

    const markerIndex = skipMarkdownWhitespace(line, prefix.nextIndex);
    const marker = parseFenceMarker(line, markerIndex);
    if (!marker || marker.markerChar !== markerChar || marker.markerLength < markerLength) {
        return false;
    }

    const trailingIndex = skipMarkdownWhitespace(line, marker.nextIndex);
    return trailingIndex === line.length;
}

/** Matches an ATX heading marker at the start of a blockquote line remainder. */
const ATX_HEADING_PATTERN = /^#{1,6}(?:[ \t]|$)/;
/** Matches a list item marker at the start of a blockquote line remainder. */
const LIST_ITEM_PATTERN = /^(?:[-+*][ \t]|\d{1,9}[.)][ \t])/;
/** Matches a thematic break at the start of a blockquote line remainder. */
const THEMATIC_BREAK_PATTERN = /^(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;

/**
 * Returns true when the line remainder starts a block that ends lazy continuation of a blockquote.
 *
 * The Obsidian renderer absorbs shallower non-blank lines into an open blockquote — including into
 * an open fence inside it — unless the line starts a heading, list item, or thematic break (fence
 * markers also interrupt; callers detect those with `parseFenceOpen`). Verified against Obsidian
 * 1.13 rendering; this is laxer than CommonMark, which limits laziness to paragraph continuation.
 */
function startsInterruptingBlock(remainder: string): boolean {
    return ATX_HEADING_PATTERN.test(remainder) || LIST_ITEM_PATTERN.test(remainder) || THEMATIC_BREAK_PATTERN.test(remainder);
}

type FencedSegmentKind = 'text' | 'fenced';

interface FencedSegment {
    kind: FencedSegmentKind;
    start: number;
    end: number;
}

function scanFencedCodeSegments(
    content: string,
    onSegment: (segment: FencedSegment) => boolean | void,
    options?: { emitText?: boolean }
): void {
    const emitText = options?.emitText ?? false;
    let index = 0;
    let inFence = false;
    let fenceStart = 0;
    let fenceChar: FenceMarkerChar | null = null;
    let fenceLength = 0;
    let fenceDepth = 0;

    while (index < content.length) {
        const lineEnd = content.indexOf('\n', index);
        let line = lineEnd === -1 ? content.slice(index) : content.slice(index, lineEnd);
        if (line.endsWith('\r')) {
            line = line.slice(0, -1);
        }
        const segmentEnd = lineEnd === -1 ? content.length : lineEnd + 1;
        const prefix = parseBlockquotePrefix(line);

        // Set when the current line belongs to the open fence (interior or closing line), so it
        // must not be re-parsed as regular content below.
        let lineConsumedByFence = false;
        if (inFence && fenceChar !== null) {
            if (isFenceClose(line, fenceDepth, fenceChar, fenceLength, prefix)) {
                const keepGoing = onSegment({ kind: 'fenced', start: fenceStart, end: segmentEnd });
                if (keepGoing === false) {
                    return;
                }

                inFence = false;
                fenceChar = null;
                fenceLength = 0;
                fenceDepth = 0;
                lineConsumedByFence = true;
            } else if (fenceDepth > 0 && prefix.depth < fenceDepth) {
                const remainder = line.slice(prefix.nextIndex);
                // Obsidian lazily absorbs shallower plain lines into an open blockquote fence as
                // code content. A blank line or a line starting an interrupting block (heading,
                // list item, thematic break, or another fence) ends the blockquote and the fence
                // with it: the fenced segment stops before this line, and the line is parsed as
                // regular content so it can open a new fence or be emitted as text.
                if (remainder.length === 0 || startsInterruptingBlock(remainder) || parseFenceOpen(line, prefix) !== null) {
                    const keepGoing = onSegment({ kind: 'fenced', start: fenceStart, end: index });
                    if (keepGoing === false) {
                        return;
                    }

                    inFence = false;
                    fenceChar = null;
                    fenceLength = 0;
                    fenceDepth = 0;
                } else {
                    lineConsumedByFence = true;
                }
            } else {
                lineConsumedByFence = true;
            }
        }

        if (!lineConsumedByFence) {
            const openFence = parseFenceOpen(line, prefix);
            if (openFence) {
                inFence = true;
                fenceStart = index;
                fenceChar = openFence.markerChar;
                fenceLength = openFence.markerLength;
                fenceDepth = openFence.depth;
            } else if (emitText) {
                const keepGoing = onSegment({ kind: 'text', start: index, end: segmentEnd });
                if (keepGoing === false) {
                    return;
                }
            }
        }

        if (lineEnd === -1) {
            break;
        }
        index = lineEnd + 1;
    }

    if (inFence && fenceStart < content.length) {
        onSegment({ kind: 'fenced', start: fenceStart, end: content.length });
    }
}

/**
 * Finds fenced code block ranges (```...``` or ~~~...~~~) in the provided content.
 *
 * Behavior:
 * - Recognizes fences at the start of a line, allowing optional leading whitespace.
 * - Recognizes fences inside blockquotes, allowing any number of `>` markers before the fence.
 * - Closing fences must use the same fence character (` or ~) and be at least as long as the opener.
 * - Closing fences may contain trailing whitespace but no other characters.
 * - Closing fences must appear at the same blockquote depth as the opener.
 * - Open fences inside blockquotes follow Obsidian's lazy continuation: shallower non-blank lines
 *   are absorbed as code content, while a blank line or a line starting a heading, list item,
 *   thematic break, or another fence ends the blockquote and the fence with it.
 * - If an opening fence is never closed, the range runs to the end of the string (or, for
 *   blockquote fences, to the end of the blockquote).
 *
 * Known limitations:
 * - The scan is line-based and does not attempt to validate markdown indentation rules.
 * - Only fenced blocks are detected (no indented code blocks).
 */
export function findFencedCodeBlockRanges(content: string): NumericRange[] {
    const ranges: NumericRange[] = [];
    scanFencedCodeSegments(
        content,
        segment => {
            if (segment.kind !== 'fenced') {
                return;
            }
            ranges.push({
                start: segment.start,
                end: segment.end
            });
        },
        { emitText: false }
    );

    return ranges;
}

/**
 * Collects the first `maxVisibleLength` characters while skipping fenced code blocks.
 *
 * Intended for preview extraction when code blocks are skipped, so very large fences do not dominate
 * the preview window.
 */
export function collectVisibleTextSkippingFencedCodeBlocks(content: string, maxVisibleLength: number, maxScanLength?: number): string {
    if (maxVisibleLength <= 0 || content.length === 0) {
        return '';
    }

    const scanSource = maxScanLength && content.length > maxScanLength ? content.slice(0, maxScanLength) : content;
    if (!scanSource.includes('```') && !scanSource.includes('~~~')) {
        return scanSource.length > maxVisibleLength ? scanSource.slice(0, maxVisibleLength) : scanSource;
    }

    let output = '';

    scanFencedCodeSegments(
        scanSource,
        segment => {
            if (output.length >= maxVisibleLength) {
                return false;
            }

            if (segment.kind === 'text') {
                const remaining = maxVisibleLength - output.length;
                const segmentLength = segment.end - segment.start;
                if (segmentLength <= remaining) {
                    output += scanSource.slice(segment.start, segment.end);
                    return;
                }

                output += scanSource.slice(segment.start, segment.start + remaining);
                return false;
            }

            const needsLeadingSpace = output.length > 0 && !/\s$/.test(output);
            const nextChar = scanSource[segment.end] ?? '';
            const needsTrailingSpace = nextChar !== '' && !/\s/.test(nextChar);
            if (needsLeadingSpace && needsTrailingSpace && output.length < maxVisibleLength) {
                output += ' ';
            }

            return;
        },
        { emitText: true }
    );

    return output;
}

/** Matches a callout marker (`[!type]` with an optional `+`/`-` fold suffix) at the start of a blockquote line remainder. */
const CALLOUT_HEADER_PATTERN = /^\[![\w-]+\][+-]?(?:[ \t]|$)/;

/**
 * Removes callout blocks: `> [!type]` header lines and their continuation lines, matching how the
 * Obsidian renderer determines callout membership (verified against Obsidian 1.13 rendering).
 *
 * Behavior:
 * - A callout starts at a line whose blockquote prefix is followed by a `[!type]` marker.
 * - The callout consumes every following line whose blockquote depth is at least the header depth.
 *   Nested callouts and fenced code inside the callout are removed with it.
 * - Lazy continuation: a non-blank line at shallower depth is still callout content unless it
 *   starts a heading, list item, thematic break, or fence. The renderer absorbs such lines into
 *   the callout — even directly after a fenced code block or a `>`-only line — so without this,
 *   text that Obsidian renders inside the callout would leak into the preview.
 * - A blank line or an interrupting block line ends the callout; that line is kept.
 * - Callout markers inside fenced code blocks are treated as code, so code samples showing callout
 *   syntax are not removed.
 */
export function removeCalloutBlocks(content: string): string {
    if (!content.includes('[!')) {
        return content;
    }

    let output = '';
    // Blockquote depth of the callout currently being removed; 0 while outside a callout.
    let calloutDepth = 0;

    scanFencedCodeSegments(
        content,
        segment => {
            const raw = content.slice(segment.start, segment.end);

            if (segment.kind === 'fenced') {
                if (calloutDepth > 0) {
                    const firstLineEnd = raw.indexOf('\n');
                    const firstLine = firstLineEnd === -1 ? raw : raw.slice(0, firstLineEnd);
                    // A fence opening at the callout depth or deeper is callout content and is
                    // removed with it, including shallower lines the scanner absorbed into it.
                    if (parseBlockquotePrefix(firstLine).depth >= calloutDepth) {
                        return;
                    }
                    // A shallower fence interrupts the callout and starts its own block.
                    calloutDepth = 0;
                }
                output += raw;
                return;
            }

            let line = raw;
            const newlineIndex = line.indexOf('\n');
            if (newlineIndex !== -1) {
                line = line.slice(0, newlineIndex);
            }
            if (line.endsWith('\r')) {
                line = line.slice(0, -1);
            }

            const prefix = parseBlockquotePrefix(line);
            const remainder = line.slice(prefix.nextIndex);

            if (calloutDepth > 0) {
                if (prefix.depth >= calloutDepth) {
                    return;
                }
                if (remainder.length > 0 && !startsInterruptingBlock(remainder)) {
                    // Lazy continuation: the shallower line is rendered inside the callout, so it
                    // is removed with it. Fence lines never reach this branch because the scanner
                    // emits them as fenced segments.
                    return;
                }
                calloutDepth = 0;
            }

            if (prefix.depth > 0 && CALLOUT_HEADER_PATTERN.test(remainder)) {
                calloutDepth = prefix.depth;
                return;
            }

            output += raw;
        },
        { emitText: true }
    );

    return output;
}

/**
 * Finds the range containing the provided index within sorted ranges.
 *
 * Expects `ranges` to be sorted by start and non-overlapping. Returns null when the index is not
 * contained in any range.
 */
export function findRangeContainingIndex(index: number, ranges: readonly NumericRange[]): NumericRange | null {
    let left = 0;
    let right = ranges.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const range = ranges[mid];
        if (index < range.start) {
            right = mid - 1;
        } else if (index >= range.end) {
            left = mid + 1;
        } else {
            return range;
        }
    }

    return null;
}

/**
 * Locates the closing backtick sequence matching the opener's length, skipping excluded ranges.
 *
 * This is used to find inline code spans like:
 * - `code`
 * - ``code with ` inside``
 *
 * Behavior:
 * - The closing run must be exactly `tickCount` long.
 * - Any backticks that fall inside `excluded` ranges are ignored.
 * - Returns -1 when no valid closing run is found.
 */
function findClosingBacktick(content: string, startIndex: number, tickCount: number, excluded: readonly NumericRange[]): number {
    let searchIndex = startIndex;

    while (searchIndex < content.length) {
        const nextBacktick = content.indexOf('`', searchIndex);
        if (nextBacktick === -1) {
            return -1;
        }

        const containing = findRangeContainingIndex(nextBacktick, excluded);
        if (containing) {
            searchIndex = containing.end;
            continue;
        }

        let runLength = 1;
        while (nextBacktick + runLength < content.length && content[nextBacktick + runLength] === '`') {
            runLength += 1;
        }

        if (runLength === tickCount) {
            return nextBacktick;
        }

        searchIndex = nextBacktick + runLength;
    }

    return -1;
}

/**
 * Finds inline code ranges, respecting backtick sequence lengths and excluding nested ranges.
 *
 * Typical usage is to pass fenced code block ranges as `excluded` so backticks inside fenced code
 * blocks are not considered inline code delimiters.
 *
 * Behavior:
 * - Scans for runs of backticks and looks for a closing run of the same length.
 * - Unclosed openers are ignored.
 * - Returned ranges are merged and sorted.
 */
export function findInlineCodeRanges(content: string, excluded: readonly NumericRange[] = []): NumericRange[] {
    const ranges: NumericRange[] = [];
    const mergedExcluded = mergeRanges([...excluded]);
    let searchIndex = 0;

    while (searchIndex < content.length) {
        const nextBacktick = content.indexOf('`', searchIndex);
        if (nextBacktick === -1) {
            break;
        }

        const containing = findRangeContainingIndex(nextBacktick, mergedExcluded);
        if (containing) {
            searchIndex = containing.end;
            continue;
        }

        let tickCount = 1;
        while (nextBacktick + tickCount < content.length && content[nextBacktick + tickCount] === '`') {
            tickCount += 1;
        }

        const closingIndex = findClosingBacktick(content, nextBacktick + tickCount, tickCount, mergedExcluded);
        if (closingIndex === -1) {
            searchIndex = nextBacktick + tickCount;
            continue;
        }

        const rangeEnd = closingIndex + tickCount;
        ranges.push({
            start: nextBacktick,
            end: rangeEnd
        });
        searchIndex = rangeEnd;
    }

    return mergeRanges(ranges);
}

/** Returns true if the index falls within any of the provided ranges */
export function isIndexInRanges(index: number, ranges: readonly NumericRange[]): boolean {
    return findRangeContainingIndex(index, ranges) !== null;
}
