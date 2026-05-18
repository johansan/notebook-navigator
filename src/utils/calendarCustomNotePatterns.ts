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

import { normalizePath } from 'obsidian';
import { containsForbiddenNameCharactersAllPlatforms, containsForbiddenNameCharactersWindows } from './fileNameUtils';
import type { MomentInstance } from './moment';

export const DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN = 'YYYY/YYYYMMDD';
export const DEFAULT_CALENDAR_CUSTOM_WEEK_PATTERN = 'gggg/[W]ww';
export const DEFAULT_CALENDAR_CUSTOM_MONTH_PATTERN = 'YYYY/YYYYMM';
export const DEFAULT_CALENDAR_CUSTOM_QUARTER_PATTERN = 'YYYY/[Q]Q';
export const DEFAULT_CALENDAR_CUSTOM_YEAR_PATTERN = 'YYYY';

export type CalendarCustomWeekAnchorUnit = 'week' | 'isoWeek';

export interface CalendarCustomWeekRules {
    firstDayOfWeek: number;
    firstDayOfYear?: number | null;
}

function normalizeFirstDayOfWeek(value: number): number {
    return Number.isInteger(value) && value >= 0 && value <= 6 ? value : 1;
}

function normalizeFirstDayOfYear(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7 ? value : null;
}

function getCalendarCustomWeekTokenUsage(pattern: string): { usesIsoWeekTokens: boolean; usesLocaleWeekTokens: boolean } {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    const tokenSource = stripMomentLiterals(normalized);
    return {
        usesIsoWeekTokens: /[GW]/u.test(tokenSource),
        usesLocaleWeekTokens: /[gw]/u.test(tokenSource)
    };
}

export function doesCalendarCustomWeekPatternMixWeekTokenTypes(pattern: string): boolean {
    const { usesIsoWeekTokens, usesLocaleWeekTokens } = getCalendarCustomWeekTokenUsage(pattern);
    return usesIsoWeekTokens && usesLocaleWeekTokens;
}

export function getCalendarCustomWeekAnchorDate(date: MomentInstance, pattern: string, locale?: string): MomentInstance {
    const unit = getCalendarCustomWeekAnchorUnit(pattern);
    const cloned = date.clone();
    const localized = locale ? cloned.locale(locale) : cloned;
    return localized.startOf(unit);
}

export function doesCalendarCustomWeekPatternUseDifferentWeekRules(
    pattern: string,
    displayWeekRules: CalendarCustomWeekRules,
    pathWeekRules: CalendarCustomWeekRules
): boolean {
    const { usesIsoWeekTokens, usesLocaleWeekTokens } = getCalendarCustomWeekTokenUsage(pattern);

    if (usesIsoWeekTokens && !usesLocaleWeekTokens) {
        return false;
    }

    if (usesIsoWeekTokens && usesLocaleWeekTokens) {
        return true;
    }

    const displayFirstDayOfWeek = normalizeFirstDayOfWeek(displayWeekRules.firstDayOfWeek);
    const pathFirstDayOfWeek = normalizeFirstDayOfWeek(pathWeekRules.firstDayOfWeek);
    if (displayFirstDayOfWeek !== pathFirstDayOfWeek) {
        return true;
    }

    const displayFirstDayOfYear = normalizeFirstDayOfYear(displayWeekRules.firstDayOfYear);
    const pathFirstDayOfYear = normalizeFirstDayOfYear(pathWeekRules.firstDayOfYear);
    return displayFirstDayOfYear !== null && pathFirstDayOfYear !== null && displayFirstDayOfYear !== pathFirstDayOfYear;
}

/**
 * Removes the legacy `{title}` token from calendar patterns so it is not treated as a literal path segment.
 * Calendar notes resolve by formatted date path only.
 */
function stripCalendarTitleToken(value: string): string {
    return value.replace(/[ \t]*\{title\}/gu, '');
}

/** Appends .md extension to file name if not already present */
export function ensureMarkdownFileName(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }
    return /\.md$/iu.test(trimmed) ? trimmed : `${trimmed}.md`;
}

/** Normalizes and sanitizes calendar root folder path, stripping leading/trailing slashes */
export function normalizeCalendarCustomRootFolder(value: string): string {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '/') {
        return '';
    }
    const normalized = normalizePath(trimmed);
    if (!normalized || normalized === '/' || normalized === '.') {
        return '';
    }
    return normalized.replace(/^\/+/u, '').replace(/\/+$/u, '');
}

/** Normalizes file pattern, ensuring .md extension and returning default if invalid */
export function normalizeCalendarCustomFilePattern(value: string, fallback: string = DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return fallback;
    }

    const withoutTitleToken = stripCalendarTitleToken(trimmed);
    const normalized = normalizePath(withoutTitleToken).replace(/\.md$/iu, '');
    if (!normalized || normalized === '/' || normalized === '.') {
        return fallback;
    }

    const normalizedWithoutLeadingSlashes = normalized.replace(/^\/+/u, '');
    const slashIndex = normalizedWithoutLeadingSlashes.lastIndexOf('/');

    if (slashIndex === -1) {
        const fileName = normalizedWithoutLeadingSlashes.trim();
        return fileName || fallback;
    }

    const folderPart = normalizedWithoutLeadingSlashes.slice(0, slashIndex);
    const filePart = normalizedWithoutLeadingSlashes.slice(slashIndex + 1);
    const filePartTrimmed = filePart.trim();
    if (!filePartTrimmed) {
        return fallback;
    }

    return folderPart ? `${folderPart}/${filePartTrimmed}` : filePartTrimmed;
}

/** Splits file pattern into folder and file components based on last slash */
export function splitCalendarCustomPattern(value: string, fallback?: string): { folderPattern: string; filePattern: string } {
    const normalized = normalizeCalendarCustomFilePattern(value, fallback);
    const slashIndex = normalized.lastIndexOf('/');
    if (slashIndex === -1) {
        return { folderPattern: '', filePattern: normalized };
    }
    return {
        folderPattern: normalized.slice(0, slashIndex),
        filePattern: normalized.slice(slashIndex + 1)
    };
}

/** Normalizes folder path for vault operations, returning '/' for root */
export function normalizeCalendarVaultFolderPath(value: string): string {
    const normalized = normalizePath(value);
    if (!normalized || normalized === '.' || normalized === '/') {
        return '/';
    }
    return normalized.replace(/^\/+/u, '');
}

/** Escapes a normalized vault path so Moment treats every segment as a literal path segment, including square brackets. */
export function escapeMomentLiteralPath(value: string): string {
    const normalized = normalizePath(value).replace(/^\/+/u, '').replace(/\/+$/u, '');
    if (!normalized) {
        return '';
    }

    return normalized
        .split('/')
        .filter(Boolean)
        .map(segment => {
            let escaped = '';
            let literalChunk = '';

            const flushLiteralChunk = () => {
                if (!literalChunk) {
                    return;
                }
                escaped += `[${literalChunk}]`;
                literalChunk = '';
            };

            for (const character of segment) {
                if (character === '[' || character === ']') {
                    flushLiteralChunk();
                    escaped += `\\${character}`;
                    continue;
                }

                literalChunk += character;
            }

            flushLiteralChunk();
            return escaped;
        })
        .join('/');
}

/**
 * Returns true when a custom calendar pattern (folder + filename, without extension) can be parsed as a full date
 * (year, month, day).
 */
export function isCalendarCustomDatePatternValid(pattern: string, momentApi?: MomentParseApi | null): boolean {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    if (!normalized || normalized === '/' || normalized === '.') {
        return false;
    }

    if (!momentApi) {
        return isCalendarCustomDatePatternValidStatic(normalized);
    }

    if (!hasDateTokens(normalized)) {
        return false;
    }

    return isCalendarCustomMomentPatternFormatsToValidPath(momentApi, normalized, ['2026-01-16', '2027-02-17'], date => date);
}

export function isCalendarCustomWeekPatternValid(pattern: string, momentApi?: MomentParseApi | null): boolean {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    if (!normalized || normalized === '/' || normalized === '.') {
        return false;
    }

    if (!momentApi) {
        return hasWeekTokens(normalized);
    }

    if (!hasWeekTokens(normalized)) {
        return false;
    }

    const anchorUnit = getCalendarCustomWeekAnchorUnit(normalized);

    /**
     * Weekly note patterns are treated as path templates that we *format*, not patterns that must strict-parse back into a week.
     *
     * Background:
     * - Moment has separate concepts for calendar year (`YYYY`) and week-year (`gggg` for locale weeks, `GGGG` for ISO weeks).
     * - When a pattern mixes week tokens (week number + week-year) with month/quarter tokens, strict parsing can round-trip
     *   incorrectly (the rendered string parses as a different week than the one it was formatted from).
     * - Notebook Navigator does not currently parse weekly note paths back into dates; it only needs to generate a stable,
     *   valid vault path. A strict “format -> parse -> compare week” validator rejects folder hierarchies that are valid and
     *   commonly used by other plugins that also only format paths.
     *
     * Standards / “correctness” note:
     * - ISO 8601 standardizes ISO week numbering (`WW`) and ISO week-year (`GGGG`), with weeks starting on Monday and week 1
     *   being the week containing January 4 (or equivalently, the first Thursday).
     * - There is no standard mapping from a week to a month/quarter; any `/Year/Quarter/Month/Week` hierarchy must choose
     *   an anchor date to define which month/quarter contains the week.
     *
     * Choice:
     * - Weekly formatting anchors to `startOf(anchorUnit)`, derived from the pattern tokens:
     *   - Patterns using ISO week number/year tokens (`W` or `G`) anchor to `startOf('isoWeek')` (ISO week rules).
     *   - Other patterns anchor to `startOf('week')` (locale week rules).
     *   This keeps the rendered path constant across all days within the same week, even if the pattern includes `YYYY-MM`
     *   or `YYYY-[Q]Q`.
     * - If users want week-based years around year boundaries, they should prefer `gggg` (locale week-year) or `GGGG` (ISO
     *   week-year) instead of `YYYY` (calendar year).
     */
    return isCalendarCustomMomentPatternFormatsToValidPath(
        momentApi,
        normalized,
        ['2020-12-31', '2021-01-01', '2026-06-19', '2027-02-17'],
        date => date.clone().startOf(anchorUnit)
    );
}

export function isCalendarCustomMonthPatternValid(pattern: string, momentApi?: MomentParseApi | null): boolean {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    if (!normalized || normalized === '/' || normalized === '.') {
        return false;
    }

    if (!momentApi) {
        return hasMonthTokens(normalized);
    }

    if (!hasMonthTokens(normalized)) {
        return false;
    }

    return isCalendarCustomMomentPatternFormatsToValidPath(momentApi, normalized, ['2026-01-16', '2027-02-17'], date => date);
}

export function isCalendarCustomQuarterPatternValid(pattern: string, momentApi?: MomentParseApi | null): boolean {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    if (!normalized || normalized === '/' || normalized === '.') {
        return false;
    }

    if (!momentApi) {
        return hasQuarterTokens(normalized);
    }

    if (!hasQuarterTokens(normalized)) {
        return false;
    }

    return isCalendarCustomMomentPatternFormatsToValidPath(momentApi, normalized, ['2026-01-16', '2026-07-15', '2027-04-03'], date => date);
}

export function isCalendarCustomYearPatternValid(pattern: string, momentApi?: MomentParseApi | null): boolean {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    if (!normalized || normalized === '/' || normalized === '.') {
        return false;
    }

    if (!momentApi) {
        return hasYearTokens(normalized);
    }

    if (!hasYearTokens(normalized)) {
        return false;
    }

    return isCalendarCustomMomentPatternFormatsToValidPath(momentApi, normalized, ['2026-01-16', '2027-02-17'], date => date);
}

interface MomentFormatLike {
    format: (format?: string) => string;
}

interface MomentParseResult {
    isValid: () => boolean;
    format: (format?: string) => string;
    clone: () => MomentParseResult;
    startOf: (unit: string) => MomentParseResult;
}

interface MomentParseApi {
    (input?: string, format?: string, strict?: boolean): MomentParseResult;
}

function isCalendarCustomMomentPatternFormatsToValidPath(
    momentApi: MomentParseApi,
    normalizedPattern: string,
    sampleIsoDates: readonly string[],
    anchorDate: (date: MomentParseResult) => MomentParseResult
): boolean {
    // Validation model:
    // - Treat patterns as path templates that must format to a valid vault-relative note path.
    // - Do not strict-parse the rendered string back into a date/week; round-trip parsing rejects valid hierarchies when
    //   patterns include additional date tokens (e.g. month/quarter folders in weekly note paths).
    // - Sample multiple dates to reduce false positives from tokens that only produce non-empty output for some inputs.
    for (const sampleIso of sampleIsoDates) {
        const sampleDate = momentApi(sampleIso, 'YYYY-MM-DD', true);
        if (!sampleDate.isValid()) {
            return false;
        }

        const anchor = anchorDate(sampleDate);
        if (!anchor.isValid()) {
            return false;
        }

        const rendered = anchor.format(normalizedPattern);
        if (!rendered || rendered.trim().length === 0) {
            return false;
        }

        if (!isRenderedCalendarNotePathValid(rendered)) {
            return false;
        }
    }

    return true;
}

function normalizeCalendarCustomMomentPattern(pattern: string): string {
    // Pattern validators and formatters operate on the date pattern only; `{title}` is not supported.
    return stripCalendarTitleToken(pattern.trim()).replace(/\.md$/iu, '');
}

function isCalendarCustomDatePatternValidStatic(pattern: string): boolean {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    if (!normalized || normalized === '/' || normalized === '.') {
        return false;
    }

    return hasDateTokens(normalized);
}

export function createCalendarCustomDateFormatter(pattern: string): (date: MomentFormatLike) => string {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    if (!normalized) {
        return () => '';
    }

    return (date: MomentFormatLike) => date.format(normalized);
}

function stripMomentLiterals(pattern: string): string {
    // Moment supports literals inside square brackets: `YYYY-[W]WW` renders a literal `W` between year and week number.
    //
    // Token detection in this file treats the remaining (non-literal) characters as a token source. This intentionally
    // ignores anything inside `[...]` so literal characters like `W` or `Q` do not count as tokens.
    //
    // Note:
    // - This does not validate bracket pairing. An unclosed `[` is treated as “literal until end of string”, which can
    //   cause token detection to fail (and therefore mark the pattern invalid).
    let result = '';
    let inLiteral = false;
    for (let index = 0; index < pattern.length; index++) {
        const char = pattern[index];
        if (char === '[') {
            inLiteral = true;
            continue;
        }
        if (char === ']') {
            inLiteral = false;
            continue;
        }
        if (!inLiteral) {
            result += char;
        }
    }
    return result;
}

export function getCalendarCustomWeekAnchorUnit(pattern: string): CalendarCustomWeekAnchorUnit {
    const normalized = normalizeCalendarCustomMomentPattern(pattern);
    const tokenSource = stripMomentLiterals(normalized);

    const usesIsoWeekNumber = /W/u.test(tokenSource);
    const usesIsoWeekYear = /G/u.test(tokenSource);
    return usesIsoWeekNumber || usesIsoWeekYear ? 'isoWeek' : 'week';
}

function hasYearTokens(pattern: string): boolean {
    // "Year-like" tokens:
    // - `Y` (calendar year, e.g. `YYYY`)
    // - `g` (locale week-year, e.g. `gggg`)
    // - `G` (ISO week-year, e.g. `GGGG`)
    //
    // This is intentionally permissive. Some validators accept `gggg`/`GGGG` anywhere a year token is required because
    // this module validates "formats to a valid note path", not "parses back to a calendar date".
    const tokenSource = stripMomentLiterals(pattern);
    return /[YgG]/u.test(tokenSource);
}

function hasMonthTokens(pattern: string): boolean {
    // "Month-like" tokens are identified by the presence of `M` (e.g. `MM` or `M`) and a year-like token.
    //
    // This intentionally does not distinguish calendar month from other token combinations. The formatted output is
    // additionally validated as a vault-relative path.
    const tokenSource = stripMomentLiterals(pattern);
    return /[YgG]/u.test(tokenSource) && /M/u.test(tokenSource);
}

function hasQuarterTokens(pattern: string): boolean {
    // "Quarter-like" tokens are identified by the presence of `Q` and a year-like token.
    //
    // `Q` inside a Moment literal (e.g. `[Q]Q`) is ignored by `stripMomentLiterals()`, so only the token `Q` counts.
    const tokenSource = stripMomentLiterals(pattern);
    return /[YgG]/u.test(tokenSource) && /Q/u.test(tokenSource);
}

function hasDateTokens(pattern: string): boolean {
    // "Date-like" tokens are identified by the presence of `M` and `D`, plus a year-like token.
    //
    // This intentionally matches any `D` token, including `DDD` (day-of-year). This module only requires that the pattern
    // provides enough variability to avoid obvious collisions and formats to a valid vault path.
    const tokenSource = stripMomentLiterals(pattern);
    return /[YgG]/u.test(tokenSource) && /M/u.test(tokenSource) && /D/u.test(tokenSource);
}

function hasWeekTokens(pattern: string): boolean {
    // "Week-like" tokens:
    // - a year-like token (`Y`, `g`, or `G`)
    // - a week number token (`w` for locale week number, `W` for ISO week number)
    //
    // Weekly patterns can include additional date tokens (month/quarter) as folder segments. They are validated by
    // formatting a week-anchored date and checking that the rendered path is valid.
    const tokenSource = stripMomentLiterals(pattern);
    const hasYear = /[YgG]/u.test(tokenSource);
    const hasWeekNumber = /[wW]/u.test(tokenSource);
    // Require a year token to reduce collisions. For week-based years, `gggg`/`GGGG` is more precise than `YYYY` for weeks
    // that cross year boundaries.
    return hasYear && hasWeekNumber;
}

function isRenderedCalendarNotePathValid(rendered: string): boolean {
    // Validates the formatted output as a vault-relative path.
    //
    // This does not access the vault. It checks only for path-level constraints that would make file creation fail or
    // create ambiguous/hidden paths.
    if (rendered !== rendered.trim()) {
        return false;
    }

    const normalized = normalizePath(rendered);
    if (!normalized || normalized === '/' || normalized === '.') {
        return false;
    }

    const path = normalized.replace(/^\/+/u, '').replace(/\/+$/u, '');
    if (!path) {
        return false;
    }

    const parts = path.split('/');
    if (parts.length === 0) {
        return false;
    }

    for (const part of parts) {
        const segment = part;
        if (!segment || segment !== segment.trim()) {
            return false;
        }
        if (segment === '.' || segment === '..') {
            return false;
        }
        if (segment.startsWith('.')) {
            return false;
        }
        if (segment.endsWith('.')) {
            return false;
        }
        if (isWindowsReservedFileName(segment)) {
            return false;
        }
        if (containsForbiddenNameCharactersAllPlatforms(segment) || containsForbiddenNameCharactersWindows(segment)) {
            return false;
        }
    }

    const last = parts[parts.length - 1] ?? '';
    const baseName = last.replace(/\.md$/iu, '');
    return baseName.length > 0;
}

const WINDOWS_RESERVED_FILE_NAME_SET: ReadonlySet<string> = new Set([
    'con',
    'prn',
    'aux',
    'nul',
    'clock$',
    'com1',
    'com2',
    'com3',
    'com4',
    'com5',
    'com6',
    'com7',
    'com8',
    'com9',
    'lpt1',
    'lpt2',
    'lpt3',
    'lpt4',
    'lpt5',
    'lpt6',
    'lpt7',
    'lpt8',
    'lpt9'
]);

function isWindowsReservedFileName(value: string): boolean {
    // Windows reserves a set of device names (CON, NUL, COM1, ...). Creation fails even when an extension is present
    // (`CON.txt`). Trailing dots are also not permitted.
    //
    // This check is applied to every formatted path segment to reject patterns that would create invalid files/folders on
    // Windows.
    if (!value) {
        return false;
    }

    const normalized = value.trim().replace(/\.+$/u, '');
    if (!normalized) {
        return false;
    }

    const baseName = normalized.split('.')[0] ?? normalized;
    if (!baseName) {
        return false;
    }

    return WINDOWS_RESERVED_FILE_NAME_SET.has(baseName.toLowerCase());
}
