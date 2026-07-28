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

import { findFencedCodeBlockRanges, findInlineCodeRanges } from '../codeRangeUtils';
import {
    buildPlaceholder,
    combineCodeRanges,
    createPlaceholderBase,
    escapeRegExpLiteral,
    stripBlockquotePrefixFromFencedBlock,
    stripInlineCodeFence,
    type CodeRangeContext
} from './codeAwareTransforms';

// Line-anchored block patterns. These classify a line from the original source structure, so they
// run only in the first strip pass: later passes rewrite inline formatting, which can move literal
// text to a line start (`**# title**` becomes `# title`), and re-running these patterns there
// would reclassify that text as a heading, table row, list marker, or footnote definition and
// drop it, even though the renderer treats it as plain inline text.
const PATTERN_LIST_MARKER = /^(?:[-*+]\s+|\d+\.\s+)/.source;
const PATTERN_HEADING = /^(#+)\s+(.*)$/m.source;
const PATTERN_TABLE_ROW = /^\s*\|.*\|.*$/m.source;
const PATTERN_FOOTNOTE_DEFINITION = /^\s*\[\^[^\]]+]:.*$/m.source;

const BASE_PATTERNS = [
    /([`~]{3,})[\s\S]*?\1/.source,
    /%%[\s\S]*?%%/.source,
    /`[^`]+`/.source,
    /!\[.*?\]\([^)]+\)/.source,
    /!\[\[.*?\]\]/.source,
    /#[\w\-/]+(?=\s|$)/.source,
    /\\([*_~`])/.source,
    /\*\*\*((?:(?!\*\*\*).)+)\*\*\*/.source,
    /___((?:(?!___).)+)___/.source,
    /\*\*_((?:(?!_\*\*).)+)_\*\*/.source,
    /__\*((?:(?!\*__).)+)\*__/.source,
    /\*\*==((?:(?!==\*\*).)+)==\*\*/.source,
    /==\*\*((?:(?!\*\*==).)+)\*\*==/.source,
    /__==((?:(?!==__).)+)==__/.source,
    /==__((?:(?!__==).)+)__==/.source,
    /\*\*((?:(?!\*\*).)+)\*\*/.source,
    /__((?:(?!__).)+)__/.source,
    /(^|[^*\d])\*([^*\n]+)\*(?![*\d])/.source,
    /(^|[^_a-zA-Z0-9])_([^_\n]+)_(?![_a-zA-Z0-9])/.source,
    /~~((?:(?!~~).)+)~~/.source,
    /==((?:(?!==).)+)==/.source,
    /\[([^\]]+)\]\([^)]+\)/.source,
    // Matches only the callout marker so the title text stays in the input and this same pass
    // strips its markdown (bold, links, tags) like ordinary text.
    /\[![\w-]+\][+-]?/.source,
    PATTERN_LIST_MARKER,
    PATTERN_HEADING,
    PATTERN_TABLE_ROW,
    /\^\[[^\]]*?]/.source,
    /\[\^[^\]]+]/.source,
    PATTERN_FOOTNOTE_DEFINITION
];

const BLOCK_PATTERNS = new Set([PATTERN_LIST_MARKER, PATTERN_HEADING, PATTERN_TABLE_ROW, PATTERN_FOOTNOTE_DEFINITION]);

const REGEX_STRIP_MARKDOWN = new RegExp(BASE_PATTERNS.join('|'), 'gm');
// Same alternation minus the block patterns, preserving pattern order, for passes after the first.
const REGEX_STRIP_INLINE_MARKDOWN = new RegExp(BASE_PATTERNS.filter(pattern => !BLOCK_PATTERNS.has(pattern)).join('|'), 'gm');
const REGEX_BLOCKQUOTE_MARKERS = /^\s{0,3}(?:>\s*)+/gm;
const REGEX_MARKDOWN_HARD_ESCAPES = /\\([\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E])/g;
const REGEX_MARKDOWN_HARD_LINE_BREAK = /\\\r?\n/g;

function protectMarkdownHardEscapes(text: string): { protectedText: string; escapeSegments: string[]; escapeBase: string } {
    if (!text.includes('\\')) {
        return { protectedText: text, escapeSegments: [], escapeBase: '' };
    }

    const escapeBase = createPlaceholderBase('ESC');
    const escapeSegments: string[] = [];

    const protectedText = text.replace(REGEX_MARKDOWN_HARD_ESCAPES, (_match, escapedChar: string) => {
        const placeholder = buildPlaceholder(escapeBase, escapeSegments.length);
        escapeSegments.push(escapedChar);
        return placeholder;
    });

    return { protectedText, escapeSegments, escapeBase };
}

function restoreEscapePlaceholders(text: string, escapeSegments: readonly string[], escapeBase: string): string {
    if (escapeSegments.length === 0) {
        return text;
    }

    const escapePattern = new RegExp(`${escapeRegExpLiteral(escapeBase)}_(\\d+)@@`, 'g');
    return text.replace(escapePattern, (_match, indexString: string) => {
        const index = Number.parseInt(indexString, 10);
        if (Number.isNaN(index) || index < 0 || index >= escapeSegments.length) {
            return '';
        }
        return escapeSegments[index];
    });
}

function normalizeWikiLinkDisplayText(rawLinkText: string): string {
    const trimmed = rawLinkText.trim();
    if (!trimmed) {
        return '';
    }

    const pipeIndex = trimmed.indexOf('|');
    if (pipeIndex === -1) {
        return trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    }

    const displayText = trimmed.slice(pipeIndex + 1).trim();
    if (displayText.length > 0) {
        return displayText;
    }

    const fallback = trimmed.slice(0, pipeIndex).trim();
    return fallback.startsWith('#') ? fallback.slice(1) : fallback;
}

function replaceWikiLinkSyntax(text: string): string {
    if (!text.includes('[[')) {
        return text;
    }

    const withoutEmbeds = text.replace(/!\[\[[^\]\n\r]*?\]\]/g, ' ');
    return withoutEmbeds.replace(/\[\[[^\]\n\r]*?\]\]/g, match => {
        const normalized = normalizeWikiLinkDisplayText(match.slice(2, -2));
        return normalized.length > 0 ? normalized : ' ';
    });
}

function stripTaskCheckboxesAndHorizontalRules(text: string): string {
    const withoutTaskCheckboxes = text.replace(/^\s*(?:[-*+]\s+|\d+\.\s+)?\[(?: |x|X|\/|-)?\]\]?\s*/gm, '');
    return withoutTaskCheckboxes.replace(/^\s*([*_-])(?:\s*\1){2,}\s*$/gm, '');
}

function stripObsidianBlockIdentifiers(text: string): string {
    if (!text.includes('^')) {
        return text;
    }

    return text.replace(/(^|[ \t])\^[0-9A-Za-z-]+(?=\s|$)/gm, '$1');
}

function buildProtectedText(
    text: string,
    context: CodeRangeContext,
    skipCodeBlocks: boolean
): { protectedText: string; inlineSegments: string[]; fencedSegments: string[]; inlineBase: string; fencedBase: string } {
    const inlineBase = createPlaceholderBase('INLINE');
    const fencedBase = createPlaceholderBase('CODE');
    const inlineSegments: string[] = [];
    const fencedSegments: string[] = [];

    const combined = combineCodeRanges(context, true, true);
    if (combined.length === 0) {
        return { protectedText: text, inlineSegments, fencedSegments, inlineBase, fencedBase };
    }

    let cursor = 0;
    let protectedText = '';

    for (const range of combined) {
        if (range.start > cursor) {
            protectedText += text.slice(cursor, range.start);
        }

        if (range.kind === 'inline') {
            const content = stripInlineCodeFence(text.slice(range.start, range.end));
            const placeholder = buildPlaceholder(inlineBase, inlineSegments.length);
            inlineSegments.push(content);
            protectedText += placeholder;
        } else {
            if (skipCodeBlocks) {
                const hasLeadingSpace = protectedText.length > 0 && !/\s$/.test(protectedText);
                const nextChar = text[range.end] ?? '';
                const needsTrailingSpace = nextChar !== '' && !/\s/.test(nextChar);
                if (hasLeadingSpace && needsTrailingSpace) {
                    protectedText += ' ';
                }
                cursor = range.end;
                continue;
            }

            const codeContent = extractCodeBlockContent(text.slice(range.start, range.end));
            const placeholder = buildPlaceholder(fencedBase, fencedSegments.length);
            fencedSegments.push(codeContent);
            const needsLeadingSpace = protectedText.length > 0 && !/\s$/.test(protectedText);
            if (needsLeadingSpace) {
                protectedText += ' ';
            }
            protectedText += placeholder;
            const nextChar = text[range.end] ?? '';
            if (nextChar !== '' && !/\s/.test(nextChar)) {
                protectedText += ' ';
            }
        }

        cursor = range.end;
    }

    if (cursor < text.length) {
        protectedText += text.slice(cursor);
    }

    return { protectedText, inlineSegments, fencedSegments, inlineBase, fencedBase };
}

function restorePlaceholders(
    text: string,
    inlineSegments: readonly string[],
    fencedSegments: readonly string[],
    inlineBase: string,
    fencedBase: string
): string {
    let restored = text;

    if (inlineSegments.length > 0) {
        const inlinePattern = new RegExp(`${escapeRegExpLiteral(inlineBase)}_(\\d+)@@`, 'g');
        restored = restored.replace(inlinePattern, (_match, indexString: string) => {
            const index = Number.parseInt(indexString, 10);
            if (Number.isNaN(index) || index < 0 || index >= inlineSegments.length) {
                return '';
            }
            return inlineSegments[index];
        });
    }

    if (fencedSegments.length > 0) {
        const fencedPattern = new RegExp(`${escapeRegExpLiteral(fencedBase)}_(\\d+)@@`, 'g');
        restored = restored.replace(fencedPattern, (_match, indexString: string) => {
            const index = Number.parseInt(indexString, 10);
            if (Number.isNaN(index) || index < 0 || index >= fencedSegments.length) {
                return '';
            }
            return fencedSegments[index];
        });
    }

    return restored;
}

function getCaptureLength(args: unknown[]): number {
    if (args.length === 0) {
        return 0;
    }

    const lastArg = args[args.length - 1];
    const hasNamedGroups = typeof lastArg === 'object' && lastArg !== null && !Array.isArray(lastArg);
    const metadataCount = hasNamedGroups ? 3 : 2;
    return Math.max(args.length - metadataCount, 0);
}

export function extractCodeBlockContent(block: string): string {
    const normalizedBlock = stripBlockquotePrefixFromFencedBlock(block);
    const openingFenceMatch = normalizedBlock.match(/^\s*([`~]{3,})[^\n\r]*\r?\n?/);
    if (!openingFenceMatch) {
        return normalizedBlock;
    }

    const fenceSequence = openingFenceMatch[1];
    const fenceChar = fenceSequence[0] ?? '`';
    const fenceLength = fenceSequence.length;
    const withoutOpeningFence = normalizedBlock.slice(openingFenceMatch[0].length);
    const closingFencePattern = new RegExp(`\\r?\\n?\\s*${fenceChar}{${fenceLength},}(?:\\s*)$`);
    return withoutOpeningFence.replace(closingFencePattern, '');
}

export function stripMarkdownSyntax(
    text: string,
    skipHeadings: boolean = false,
    skipCodeBlocks: boolean = true,
    codeRangeContext?: CodeRangeContext
): string {
    const fencedCodeBlocks =
        codeRangeContext && codeRangeContext.fencedCodeRanges.length > 0
            ? codeRangeContext.fencedCodeRanges
            : findFencedCodeBlockRanges(text);
    const inlineCodeRanges =
        codeRangeContext && codeRangeContext.inlineCodeRanges.length > 0
            ? codeRangeContext.inlineCodeRanges
            : findInlineCodeRanges(text, fencedCodeBlocks);
    const context: CodeRangeContext = {
        inlineCodeRanges,
        fencedCodeRanges: fencedCodeBlocks
    };

    const { protectedText, inlineSegments, fencedSegments, inlineBase, fencedBase } = buildProtectedText(text, context, skipCodeBlocks);
    const protectedEscapes = protectMarkdownHardEscapes(protectedText);

    const withoutHardLineBreakEscapes =
        protectedEscapes.protectedText.includes('\\') && protectedEscapes.protectedText.includes('\n')
            ? protectedEscapes.protectedText.replace(REGEX_MARKDOWN_HARD_LINE_BREAK, '\n')
            : protectedEscapes.protectedText;

    const withoutBlockquoteMarkers = withoutHardLineBreakEscapes.includes('>')
        ? withoutHardLineBreakEscapes.replace(REGEX_BLOCKQUOTE_MARKERS, '')
        : withoutHardLineBreakEscapes;

    const replaceMarkdownMatch = (match: string, ...rawArgs: unknown[]): string => {
        const args: unknown[] = rawArgs;
        const captureLength = getCaptureLength(args);
        const fenceMatch = match.match(/^([`~]{3,})/u);
        if (fenceMatch && match.endsWith(fenceMatch[1])) {
            if (skipCodeBlocks) {
                return '';
            }
            return extractCodeBlockContent(match);
        }

        if (match.startsWith('%%') && match.endsWith('%%')) {
            return '';
        }

        // Removes bare callout markers and matches from other patterns that contain a callout
        // marker, such as `[!note](url)` link matches.
        if (match.match(/\[![\w-]+\]/)) {
            return '';
        }

        if (match.startsWith('`') && match.endsWith('`')) {
            return match.slice(1, -1);
        }

        // Removed embeds and images become a space, matching replaceWikiLinkSyntax, so words on
        // both sides stay separated. This matters when a later pass removes an embed that an
        // earlier pass unwrapped from formatting, such as `Alpha**![[img]]**Beta`.
        if (match.startsWith('!')) {
            return ' ';
        }

        if (match.match(/#[\w\-/]+(?=\s|$)/)) {
            return '';
        }

        const trimmedFootnoteMatch = match.trimStart();
        if (trimmedFootnoteMatch.startsWith('^[') || trimmedFootnoteMatch.startsWith('[^')) {
            return '';
        }

        // The italic patterns capture a prefix character plus the content, so the generic
        // capture return below would keep only the prefix. Reconstruct prefix plus content
        // instead, but only when the re-match spans the whole match: a partial re-match means a
        // different pattern (bold, heading) matched text that merely contains italics, and that
        // match must fall through so its own capture is returned for the next pass.
        const italicStarMatch = match.match(/(^|[^*\d])\*([^*\n]+)\*(?![*\d])/);
        if (italicStarMatch && italicStarMatch[0] === match) {
            const italicStarContent = italicStarMatch[2];
            if (typeof italicStarContent !== 'string' || !italicStarContent.trim()) {
                return match;
            }
            const italicStarPrefix = italicStarMatch[1] ?? '';
            return `${italicStarPrefix}${italicStarContent}`;
        }

        const italicUnderscoreMatch = match.match(/(^|[^_a-zA-Z0-9])_([^_\n]+)_(?![_a-zA-Z0-9])/);
        if (italicUnderscoreMatch && italicUnderscoreMatch[0] === match) {
            const italicUnderscoreContent = italicUnderscoreMatch[2];
            if (typeof italicUnderscoreContent !== 'string' || !italicUnderscoreContent.trim()) {
                return match;
            }
            const italicUnderscorePrefix = italicUnderscoreMatch[1] ?? '';
            return `${italicUnderscorePrefix}${italicUnderscoreContent}`;
        }

        if (match.match(/^#+\s+/)) {
            if (skipHeadings) {
                return '';
            }
            return match.replace(/^#+\s+/, '').trim();
        }

        if (match.match(/^[-+\d]/) || match.match(/^\*\s+/)) {
            return '';
        }

        if (match.match(/^\s*\|.*\|/)) {
            return '';
        }

        for (let i = 0; i < captureLength; i += 1) {
            const capture = args[i];
            if (typeof capture === 'string') {
                return capture;
            }
        }

        return match;
    };

    // One pass resolves one nesting level: for `**[link](url)**` the bold pattern returns its
    // capture with the link syntax intact. Re-running until the text stabilizes strips nested
    // constructs the same way as their un-nested forms. Passes after the first use the
    // inline-only regex because block classification comes from the original line structure;
    // unwrapping emphasis can expose block-like text at line starts that must stay literal.
    // The bound keeps degenerate inputs cheap; nesting deeper than the bound keeps its
    // literal markers.
    let stripped = withoutBlockquoteMarkers.replace(REGEX_STRIP_MARKDOWN, replaceMarkdownMatch);
    for (let pass = 0; pass < 2; pass += 1) {
        const next = stripped.replace(REGEX_STRIP_INLINE_MARKDOWN, replaceMarkdownMatch);
        if (next === stripped) {
            break;
        }
        stripped = next;
    }

    const withoutWikiLinkSyntax = replaceWikiLinkSyntax(stripped);
    const withoutTasksAndRules = stripTaskCheckboxesAndHorizontalRules(withoutWikiLinkSyntax);
    const withoutBlockIdentifiers = stripObsidianBlockIdentifiers(withoutTasksAndRules);
    const withEscapesRestored = restoreEscapePlaceholders(
        withoutBlockIdentifiers,
        protectedEscapes.escapeSegments,
        protectedEscapes.escapeBase
    );

    return restorePlaceholders(withEscapesRestored, inlineSegments, fencedSegments, inlineBase, fencedBase);
}
