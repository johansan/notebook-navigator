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

import { ISO_DATE_FORMAT } from './dateUtils';
import type { MomentApi, MomentInstance } from './moment';

/**
 * Built-in template engine.
 *
 * Templates use `{{token}}` placeholders. Everything else in the template is copied unchanged, including
 * `{{...}}` text whose name is not a known token, so templates shared with other plugins keep working.
 *
 * Token grammar: `{{ name [+|-amount unit] [:format] }}`
 * - Text tokens: `{{title}}`, `{{folder}}`, `{{path}}`
 * - Note date tokens: `{{date}}`, `{{yesterday}}`, `{{tomorrow}}`, `{{monday}}` ... `{{sunday}}`
 * - Clock tokens: `{{time}}`, `{{today}}`, `{{now}}` (ISO timestamp)
 * - `{{cursor}}` marks where the editor cursor is placed after the note opens
 * - `{{prompt:Label}}` asks the user for a value before the note is created; `{{value:Label}}` is an alias and the
 *   label defaults to `Value`
 * - `{{!name}}` writes the literal text `{{name}}`
 *
 * Offsets and formats only apply to date and clock tokens. Offsets use moment units: y, Q, M, w, d, h, m, s.
 * A token cannot contain braces, so formats cannot use `{` or `}`. Rendering is a single pass: replacement text is
 * never parsed again.
 */

export interface TemplateRenderContext {
    /** Moment API used for date tokens. When null, date and clock tokens stay in the output unchanged. */
    momentApi: MomentApi | null;
    /** File name of the note without extension. */
    title: string;
    /** Name of the folder containing the note. Empty for the vault root. */
    folderName: string;
    /** Vault-relative path of the note including extension. */
    path: string;
    /**
     * Date that `{{date}}`, `{{yesterday}}`, `{{tomorrow}}` and weekday tokens resolve against.
     * Periodic notes pass the start of their period so the tokens describe the note rather than the moment it was created.
     * When null, the current date is used.
     */
    date: MomentInstance | null;
    /** Default format of note date tokens. A formatter can apply the same basename rules as the note filename. */
    dateFormat: string | ((date: MomentInstance) => string);
    /** Moment format used by `{{today}}` and weekday tokens without an explicit format. */
    todayFormat: string;
    /** Moment format used by `{{time}}` without an explicit format. */
    timeFormat: string;
    /**
     * Week that weekday tokens resolve inside.
     * - `locale-week` (default): the locale week containing the note date.
     * - `note-date`: the seven days starting at the note date. Weekly notes use this so `{{sunday}}` stays inside
     *   an ISO week even in locales whose weeks start on Sunday.
     */
    weekdayBase?: 'locale-week' | 'note-date';
    /** Current time. Defaults to the moment the render starts and is shared by every token in the render. */
    now?: MomentInstance;
    /** Values entered for `{{prompt:Label}}` tokens, keyed by label. A prompt token without a value is reported as invalid. */
    promptValues?: Record<string, string>;
}

export interface TemplateCursorPosition {
    line: number;
    ch: number;
}

export interface TemplateRenderResult {
    /** Rendered template content with `{{cursor}}` tokens removed. */
    content: string;
    /** Position of the first `{{cursor}}` token in the rendered content, or null when the template has none. */
    cursor: TemplateCursorPosition | null;
    /** Known tokens that could not be parsed or rendered, as they appear in the template. They stay in the content unchanged. */
    invalidTokens: string[];
}

/** Offset amounts above this are rejected because moment produces invalid dates for very large values. */
const MAX_OFFSET_AMOUNT = 100000;

type DateOffsetUnit = 'y' | 'Q' | 'M' | 'w' | 'd' | 'h' | 'm' | 's';

/** Units that move whole calendar days. They are applied before the clock time is copied so DST gaps cannot shift the result. */
const CALENDAR_OFFSET_UNITS = new Set<DateOffsetUnit>(['y', 'Q', 'M', 'w', 'd']);

const WEEKDAY_TOKENS: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
};

const TEXT_TOKENS = new Set(['title', 'folder', 'path', 'cursor']);
const DATE_TOKENS = new Set(['date', 'yesterday', 'tomorrow', 'time', 'today', 'now', ...Object.keys(WEEKDAY_TOKENS)]);
/** `value` is accepted as an alias so file name formats written for QuickAdd keep working. */
const PROMPT_TOKENS = new Set(['prompt', 'value']);
/** Label shown for `{{prompt}}` and `{{value}}` without a label. */
const DEFAULT_PROMPT_LABEL = 'Value';

/** Matches a candidate token. The inner text is parsed separately so malformed known tokens can be reported. */
const TOKEN_PATTERN = /\{\{([^{}]*)\}\}/g;

/** Parses the inside of a token: name, optional signed offset with unit, optional format after the first colon. */
const TOKEN_BODY_PATTERN = /^([A-Za-z]+)\s*(?:([+-])\s*(\d+)\s*([A-Za-z]))?\s*(?::(.*))?$/;

interface ParsedToken {
    name: string;
    offset: { amount: number; unit: DateOffsetUnit } | null;
    format: string | null;
}

/**
 * Maps a unit letter to a moment unit. Month and minute differ only by case, so `M` and `m` are kept distinct
 * while the other letters accept either case.
 */
function normalizeOffsetUnit(value: string): DateOffsetUnit | null {
    switch (value) {
        case 'y':
        case 'Y':
            return 'y';
        case 'q':
        case 'Q':
            return 'Q';
        case 'M':
            return 'M';
        case 'm':
            return 'm';
        case 'w':
        case 'W':
            return 'w';
        case 'd':
        case 'D':
            return 'd';
        case 'h':
        case 'H':
            return 'h';
        case 's':
        case 'S':
            return 's';
        default:
            return null;
    }
}

/**
 * Parses a token body. Returns null when the body does not follow the token grammar, when the offset is out of range,
 * or when an offset or format is attached to a text token.
 */
function parseTokenBody(body: string): ParsedToken | null {
    const match = TOKEN_BODY_PATTERN.exec(body);
    if (!match) {
        return null;
    }

    const name = match[1].toLowerCase();
    const sign = match[2];
    const amountRaw = match[3];
    const unitRaw = match[4];
    const formatRaw = match[5];

    let offset: ParsedToken['offset'] = null;
    if (sign && amountRaw && unitRaw) {
        const unit = normalizeOffsetUnit(unitRaw);
        const amount = Number.parseInt(amountRaw, 10);
        if (!unit || !Number.isSafeInteger(amount) || amount > MAX_OFFSET_AMOUNT) {
            return null;
        }
        offset = { amount: sign === '-' ? -amount : amount, unit };
    }

    let format: string | null = null;
    if (formatRaw !== undefined) {
        format = formatRaw.trim();
        if (!format) {
            return null;
        }
    }

    if (TEXT_TOKENS.has(name) && (offset || format !== null)) {
        return null;
    }
    // The format part of a prompt token is its label; a prompt takes no offset. A missing label gets the default.
    if (PROMPT_TOKENS.has(name)) {
        if (offset) {
            return null;
        }
        format = format ?? DEFAULT_PROMPT_LABEL;
    }

    return { name, offset, format };
}

function isKnownTokenName(name: string): boolean {
    return TEXT_TOKENS.has(name) || DATE_TOKENS.has(name) || PROMPT_TOKENS.has(name);
}

/** Returns the labels of all prompt tokens in a template in order of appearance, without duplicates. */
export function collectTemplatePrompts(template: string): string[] {
    const labels: string[] = [];
    TOKEN_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TOKEN_PATTERN.exec(template)) !== null) {
        const body = match[1].trim();
        if (body.startsWith('!')) {
            continue;
        }
        const token = parseTokenBody(body);
        if (token && PROMPT_TOKENS.has(token.name) && token.format !== null && !labels.includes(token.format)) {
            labels.push(token.format);
        }
    }
    return labels;
}

/**
 * Returns the day whose weekday index (0 = Sunday) matches `weekday` inside the seven days starting at `weekStart`.
 */
function resolveWeekdayFromWeekStart(weekStart: MomentInstance, weekday: number): MomentInstance {
    for (let index = 0; index < 7; index += 1) {
        const candidate = weekStart.clone().add(index, 'day');
        if (candidate.day() === weekday) {
            return candidate;
        }
    }
    return weekStart.clone();
}

/**
 * Copies the clock time of `now` onto a date so formats with time parts such as `{{date:YYYY-MM-DD HH:mm}}`
 * show the creation time instead of midnight.
 */
function withClockTime(date: MomentInstance, now: MomentInstance): MomentInstance {
    return date.clone().set({
        hour: now.get('hour'),
        minute: now.get('minute'),
        second: now.get('second'),
        millisecond: now.get('millisecond')
    });
}

/**
 * Renders a date or clock token. Returns null when the result is not a valid date, for example after an offset that
 * overflows the supported date range.
 */
function renderDateToken(token: ParsedToken, context: TemplateRenderContext, now: MomentInstance): string | null {
    const noteDate = context.date ? context.date.clone() : now.clone();

    let base: MomentInstance;
    let defaultFormat: TemplateRenderContext['dateFormat'];
    switch (token.name) {
        case 'time':
        case 'today':
        case 'now':
            base = now.clone();
            defaultFormat = token.name === 'time' ? context.timeFormat : token.name === 'today' ? context.todayFormat : ISO_DATE_FORMAT;
            break;
        case 'date':
            base = noteDate.startOf('day');
            defaultFormat = context.dateFormat;
            break;
        case 'yesterday':
            base = noteDate.startOf('day').subtract(1, 'day');
            defaultFormat = context.dateFormat;
            break;
        case 'tomorrow':
            base = noteDate.startOf('day').add(1, 'day');
            defaultFormat = context.dateFormat;
            break;
        default: {
            const weekStart = context.weekdayBase === 'note-date' ? noteDate.startOf('day') : noteDate.startOf('week');
            base = resolveWeekdayFromWeekStart(weekStart, WEEKDAY_TOKENS[token.name]);
            defaultFormat = context.todayFormat;
            break;
        }
    }

    const isClockToken = token.name === 'time' || token.name === 'today' || token.name === 'now';
    if (isClockToken) {
        if (token.offset) {
            base = base.add(token.offset.amount, token.offset.unit);
        }
    } else {
        // Calendar offsets move the day first and the clock time is copied afterwards, so a creation time that does
        // not exist on the note date (DST gap) cannot push the day forward. Elapsed-time offsets apply after the clock.
        if (token.offset && CALENDAR_OFFSET_UNITS.has(token.offset.unit)) {
            base = base.add(token.offset.amount, token.offset.unit);
        }
        base = withClockTime(base, now);
        if (token.offset && !CALENDAR_OFFSET_UNITS.has(token.offset.unit)) {
            base = base.add(token.offset.amount, token.offset.unit);
        }
    }

    if (!base.isValid()) {
        return null;
    }

    const format = token.format ?? defaultFormat;
    return typeof format === 'function' ? format(base) : base.format(format);
}

function getCursorPosition(content: string, offset: number): TemplateCursorPosition {
    const lines = content.slice(0, offset).split('\n');
    return { line: lines.length - 1, ch: lines[lines.length - 1].length };
}

interface QuotedFrontmatterRange {
    start: number;
    end: number;
    quote: '"' | "'";
}

/**
 * Locates quoted YAML scalars in the original frontmatter without parsing or serializing its values. Templates can
 * contain unresolved tokens, and serializing the whole block would rewrite authored formatting and comments.
 * Tokens are opaque here so quotes in prompt labels and date formats cannot change the surrounding YAML context.
 */
function getQuotedFrontmatterRanges(template: string): QuotedFrontmatterRange[] {
    const opening = /^\uFEFF?---[ \t]*\r?\n/.exec(template);
    if (!opening) {
        return [];
    }
    const closingPattern = /^(?:---|\.\.\.)[ \t]*\r?$/gm;
    closingPattern.lastIndex = opening[0].length;
    const closing = closingPattern.exec(template);
    if (!closing) {
        return [];
    }

    const ranges: QuotedFrontmatterRange[] = [];
    const tokenPattern = new RegExp(TOKEN_PATTERN.source, 'y');
    let quote: QuotedFrontmatterRange['quote'] | null = null;
    let quoteStart = 0;
    let lineStart = opening[0].length;
    let blockIndent: number | null = null;
    let plainIndent: number | null = null;
    let nodeIndent = 0;
    let valueIndent = 0;
    let flowDepth = 0;
    let scalarStart = true;
    let afterQuotedScalar = false;

    for (let index = lineStart; index < closing.index; index += 1) {
        if (index === lineStart) {
            const lineEnd = template.indexOf('\n', index);
            let contentStart = index;
            while (template[contentStart] === ' ' || template[contentStart] === '\t') {
                contentStart += 1;
            }
            const indent = contentStart - lineStart;
            // Indented continuations of block and plain scalars can contain quotes and mapping-like text literally.
            const continuationIndent = blockIndent ?? (flowDepth === 0 ? plainIndent : null);
            if (quote === null && continuationIndent !== null) {
                if (indent > continuationIndent || template.slice(contentStart, lineEnd).trim() === '') {
                    index = lineEnd;
                    lineStart = lineEnd + 1;
                    continue;
                }
                blockIndent = null;
                plainIndent = null;
            }
            valueIndent = indent;
        }

        const character = template[index];
        if (character === '{' && template[index + 1] === '{') {
            tokenPattern.lastIndex = index;
            const token = tokenPattern.exec(template);
            if (token) {
                if (quote === null && scalarStart) {
                    nodeIndent = index - lineStart;
                    plainIndent = valueIndent;
                }
                index += token[0].length - 1;
                scalarStart = false;
                continue;
            }
        }
        if (quote !== null) {
            if ((quote === '"' && character === '\\') || (quote === "'" && character === "'" && template[index + 1] === "'")) {
                index += 1;
            } else if (character === quote) {
                ranges.push({ start: quoteStart, end: index, quote });
                quote = null;
                afterQuotedScalar = true;
            }
            continue;
        }
        if (character === '\n') {
            lineStart = index + 1;
            scalarStart = flowDepth === 0 || scalarStart;
            afterQuotedScalar = false;
        } else if (character === '#' && /\s/.test(template[index - 1])) {
            index = template.indexOf('\n', index);
            lineStart = index + 1;
            scalarStart = flowDepth === 0 || scalarStart;
        } else if (scalarStart && (character === '"' || character === "'")) {
            nodeIndent = index - lineStart;
            quote = character;
            quoteStart = index + 1;
            scalarStart = false;
        } else if (scalarStart && flowDepth === 0 && (character === '|' || character === '>')) {
            blockIndent = valueIndent;
            index = template.indexOf('\n', index);
            lineStart = index + 1;
        } else if (scalarStart && (character === '[' || character === '{')) {
            flowDepth += 1;
        } else if (flowDepth > 0 && (character === ']' || character === '}')) {
            flowDepth -= 1;
            scalarStart = false;
        } else if (character === ':' && (afterQuotedScalar || /\s/.test(template[index + 1]))) {
            // A mapping inside a sequence starts after the dash; its next key must not be treated as a continuation.
            valueIndent = nodeIndent;
            plainIndent = null;
            scalarStart = true;
            afterQuotedScalar = false;
        } else if (
            (flowDepth > 0 && character === ',') ||
            (scalarStart && (character === '-' || character === '?') && /\s/.test(template[index + 1]))
        ) {
            scalarStart = true;
            afterQuotedScalar = false;
        } else if (!/\s/.test(character)) {
            if (scalarStart) {
                nodeIndent = index - lineStart;
                plainIndent = valueIndent;
            }
            scalarStart = false;
            afterQuotedScalar = false;
        }
    }
    return ranges;
}

/**
 * Renders a template with the built-in token engine.
 *
 * - Unknown `{{...}}` text is copied unchanged and not reported.
 * - Known tokens that fail to parse or render are copied unchanged and listed in `invalidTokens`.
 * - Date and clock tokens are copied unchanged when no moment API is available.
 * - `{{cursor}}` tokens are removed; the position of the first one is returned.
 * - Replacements inside quoted frontmatter scalars are escaped for that quote style; other replacements stay literal.
 */
export function renderNoteTemplate(template: string, context: TemplateRenderContext): TemplateRenderResult {
    const output: string[] = [];
    const invalidTokens: string[] = [];
    let cursorOffset: number | null = null;
    let outputLength = 0;
    let lastIndex = 0;
    const quotedRanges = getQuotedFrontmatterRanges(template);
    let quotedRangeIndex = 0;
    // One clock reading per render so every token in the note agrees on the creation time.
    let now: MomentInstance | null = null;
    const getNow = (momentApi: MomentApi): MomentInstance => {
        if (!now) {
            now = (context.now ?? momentApi()).clone();
        }
        return now;
    };

    const append = (text: string): void => {
        output.push(text);
        outputLength += text.length;
    };
    const appendValue = (value: string, tokenIndex: number): void => {
        while (quotedRangeIndex < quotedRanges.length && quotedRanges[quotedRangeIndex].end < tokenIndex) {
            quotedRangeIndex += 1;
        }
        const range = quotedRanges[quotedRangeIndex];
        if (!range || tokenIndex < range.start) {
            append(value);
        } else {
            // JSON string escapes are valid inside YAML double quotes. Single quotes escape only by doubling them.
            // Escape before appending so cursor positions include the extra escape characters written to the note.
            append(range.quote === '"' ? JSON.stringify(value).slice(1, -1) : value.replace(/'/g, "''"));
        }
    };

    TOKEN_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TOKEN_PATTERN.exec(template)) !== null) {
        const raw = match[0];
        const body = match[1].trim();
        append(template.slice(lastIndex, match.index));
        lastIndex = match.index + raw.length;

        if (body.startsWith('!')) {
            append(`{{${body.slice(1)}}}`);
            continue;
        }

        // The name must end where whitespace, a format, a numeric offset or the token ends, so `{{date_created}}` and
        // `{{title-x}}` are unknown tokens that stay silent rather than malformed known tokens.
        const nameMatch = /^([A-Za-z]+)(?=\s|:|[+-]\s*\d|$)/.exec(body);
        const name = nameMatch ? nameMatch[1].toLowerCase() : '';
        if (!isKnownTokenName(name)) {
            append(raw);
            continue;
        }

        const token = parseTokenBody(body);
        if (!token) {
            invalidTokens.push(raw);
            append(raw);
            continue;
        }

        switch (token.name) {
            case 'title':
                appendValue(context.title, match.index);
                break;
            case 'folder':
                appendValue(context.folderName, match.index);
                break;
            case 'path':
                appendValue(context.path, match.index);
                break;
            case 'cursor':
                if (cursorOffset === null) {
                    cursorOffset = outputLength;
                }
                break;
            case 'prompt':
            case 'value': {
                const value = token.format !== null ? context.promptValues?.[token.format] : undefined;
                if (value === undefined) {
                    invalidTokens.push(raw);
                    append(raw);
                    break;
                }
                appendValue(value, match.index);
                break;
            }
            default: {
                if (!context.momentApi) {
                    append(raw);
                    break;
                }
                const rendered = renderDateToken(token, context, getNow(context.momentApi));
                if (rendered === null) {
                    invalidTokens.push(raw);
                    append(raw);
                    break;
                }
                appendValue(rendered, match.index);
                break;
            }
        }
    }

    append(template.slice(lastIndex));
    const content = output.join('');

    return {
        content,
        cursor: cursorOffset === null ? null : getCursorPosition(content, cursorOffset),
        invalidTokens
    };
}

/** Returns true when the template contains Templater command syntax. */
export function containsTemplaterCommands(template: string): boolean {
    return template.includes('<%');
}
