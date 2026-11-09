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

import { normalizePath, type App, type TFile } from 'obsidian';
import { getCurrentLanguage } from '../../i18n';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { escapeMomentLiteralPath, normalizeCalendarCustomRootFolder } from '../../utils/calendarCustomNotePatterns';
import { createDailyNoteDatePathParser, getDailyNoteSettings as getCoreDailyNoteSettings } from '../../utils/dailyNotes';
import { isPathInExcludedFolder } from '../../utils/fileFilters';
import {
    buildCustomCalendarFilePathForPattern,
    buildCustomCalendarMomentPattern,
    getCalendarNoteConfig,
    resolveCalendarCustomNotePathDate,
    type CalendarNoteKind,
    type CalendarNoteLocation
} from '../../utils/calendarNotes';
import {
    getMomentApi,
    resolveCalendarLocales,
    resolveCalendarPeriodicNotesLocale,
    resolveDailyNoteLocale,
    type MomentApi,
    type MomentInstance
} from '../../utils/moment';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import type { CalendarNoteTarget, CustomCalendarNoteConfig, CustomCalendarNoteKind } from './types';

export interface CalendarNotePathResolverContext {
    config: CustomCalendarNoteConfig;
    momentPattern: string;
}

export type ResolvedCalendarNotePath = CalendarNoteLocation;

export interface CalendarNoteRootFolderSettings {
    calendarCustomRootFolder: string;
}

interface ResolveCalendarNoteTargetOptions {
    existingFile: TFile | null;
    targetPath: string | null;
    hiddenFolders: string[];
    showHiddenItems: boolean;
    isExistingFileVisible: (file: TFile) => boolean;
}

interface ResolveCalendarNotePathOptions {
    kind: CustomCalendarNoteKind;
    date: MomentInstance;
    resolverContext: CalendarNotePathResolverContext;
    calendarLocale: string;
    weekLocale: string;
    customCalendarRootFolderSettings: CalendarNoteRootFolderSettings;
    momentApi: MomentApi | null;
}

interface ParseCalendarNoteDateFromPathOptions extends Omit<ResolveCalendarNotePathOptions, 'date'> {
    filePath: string;
    parseLocale: string;
}

function stripMarkdownExtension(path: string): string {
    return path.replace(/\.md$/iu, '');
}

/** Replaces week-year tokens outside `[literals]` with calendar-year tokens, so `gggg` reads as `YYYY` and `GG` as `YY`. */
function toCalendarYearTokens(pattern: string): string {
    let result = '';
    let inLiteral = false;

    for (const character of pattern) {
        if (character === '[') {
            inLiteral = true;
        } else if (character === ']') {
            inLiteral = false;
        }
        result += !inLiteral && (character === 'g' || character === 'G') ? 'Y' : character;
    }

    return result;
}

/**
 * Returns the first day of the weekly note at the path that `isNotePath` checks, or null when no week builds that path.
 * Moment cannot parse week numbers back from paths: it ignores them once a month or day is parsed, and reads `YYYY` next
 * to a week number as the week-year, while paths take it from the first day of the week. So only the year is read from
 * `parseInput`, and the weeks around it are formatted and compared. Week-year tokens are read as calendar years, and the
 * year is taken before Moment checks the parsed fields against each other, so a weekday or a second year token cannot
 * reject the path. A note with year `Y` lies in a week starting between December of `Y - 1` and the end of `Y`. When two
 * weeks build the same path, such as `YYYY/[W]ww` in years where week 1 starts on January 1, the earlier week is returned.
 */
function findWeeklyCalendarNoteDate(
    parseInput: string,
    fullPattern: string,
    parseLocale: string,
    momentApi: MomentApi,
    resolveWeekStart: (date: MomentInstance) => MomentInstance,
    isNotePath: (date: MomentInstance) => boolean
): MomentInstance | null {
    const year = momentApi(parseInput, toCalendarYearTokens(fullPattern), parseLocale, true).parsingFlags().parsedDateParts[0];
    if (year === undefined) {
        return null;
    }

    const searchStart = momentApi()
        .locale(parseLocale)
        .set({ year: year - 1, month: 11, date: 1 })
        .startOf('day');
    for (let weekStart = resolveWeekStart(searchStart); weekStart.year() <= year; weekStart = weekStart.clone().add(1, 'week')) {
        if (isNotePath(weekStart)) {
            return weekStart;
        }
    }

    return null;
}

export function createCalendarNotePathResolverContext(
    kind: CustomCalendarNoteKind,
    settings: NotebookNavigatorSettings
): CalendarNotePathResolverContext {
    const config = getCalendarNoteConfig(kind, settings);
    const momentPattern = buildCustomCalendarMomentPattern(config.calendarCustomFilePattern, config.fallbackPattern);
    return { config, momentPattern };
}

export function resolveCalendarNotePath({
    kind,
    date,
    resolverContext,
    calendarLocale,
    weekLocale,
    customCalendarRootFolderSettings,
    momentApi
}: ResolveCalendarNotePathOptions): ResolvedCalendarNotePath | null {
    const { config, momentPattern } = resolverContext;
    if (!config.isPatternValid(momentPattern, momentApi)) {
        return null;
    }

    const dateForPath = resolveCalendarCustomNotePathDate(kind, date, momentPattern, calendarLocale, weekLocale);
    return buildCustomCalendarFilePathForPattern(
        dateForPath,
        customCalendarRootFolderSettings,
        config.calendarCustomFilePattern,
        config.fallbackPattern
    );
}

/**
 * Resolves the four calendar target states without discarding an existing hidden file.
 *
 * - Existing and visible: both file fields contain the file and actions may open it.
 * - Existing and hidden: only `existingFile` contains the file and actions are blocked.
 * - Missing and visible: both file fields are null and actions may create the target.
 * - Missing and hidden: both file fields are null and actions are blocked because the destination folder is hidden.
 */
export function resolveCalendarNoteTarget({
    existingFile,
    targetPath,
    hiddenFolders,
    showHiddenItems,
    isExistingFileVisible
}: ResolveCalendarNoteTargetOptions): CalendarNoteTarget {
    const isHidden =
        !showHiddenItems &&
        ((targetPath !== null && hiddenFolders.length > 0 && isPathInExcludedFolder(targetPath, hiddenFolders)) ||
            (existingFile !== null && !isExistingFileVisible(existingFile)));

    return {
        existingFile,
        visibleFile: isHidden ? null : existingFile,
        isHidden,
        targetPath
    };
}

/** Returns the date of the calendar note at `filePath`, or null when the path is not such a note. */
export type CalendarNoteDatePathParser = (filePath: string) => MomentInstance | null;

/**
 * Builds the parser behind `parseCalendarNoteDateFromPath`, or returns null when the pattern is invalid. The pattern is
 * validated and the parse pattern built once here, so a caller that parses many paths, such as one per note in a list,
 * keeps this parser instead of calling `parseCalendarNoteDateFromPath` for each path.
 */
export function createCalendarNoteDatePathParser({
    kind,
    resolverContext,
    calendarLocale,
    weekLocale,
    customCalendarRootFolderSettings,
    momentApi,
    parseLocale
}: Omit<ParseCalendarNoteDateFromPathOptions, 'filePath'>): CalendarNoteDatePathParser | null {
    const { config, momentPattern } = resolverContext;
    if (!momentApi || !config.isPatternValid(momentPattern, momentApi)) {
        return null;
    }

    const resolvePathDate = (date: MomentInstance): MomentInstance =>
        resolveCalendarCustomNotePathDate(kind, date, momentPattern, calendarLocale, weekLocale);
    const resolveLocation = (date: MomentInstance): CalendarNoteLocation =>
        buildCustomCalendarFilePathForPattern(
            resolvePathDate(date),
            customCalendarRootFolderSettings,
            config.calendarCustomFilePattern,
            config.fallbackPattern
        );
    // A pattern can end in a literal extension such as `[.md]` or `[.MD]`, which the strict parse needs in the input.
    // The rendered file name keeps its spelling before `.md` is appended to names without one.
    const extensionSuffix = /\.md$/iu.exec(resolveLocation(momentApi()).formattedFilePattern)?.[0] ?? '';
    const rootFolder = normalizeCalendarCustomRootFolder(customCalendarRootFolderSettings.calendarCustomRootFolder);
    const rootFolderPattern = escapeMomentLiteralPath(customCalendarRootFolderSettings.calendarCustomRootFolder);
    const fullPattern = rootFolderPattern ? `${rootFolderPattern}/${momentPattern}` : momentPattern;

    return filePath => {
        if (!filePath.toLowerCase().endsWith('.md')) {
            return null;
        }

        const normalizedFilePath = normalizePath(filePath);
        // Note paths always start with the root folder, so other paths are rejected before the Moment parse, which is
        // the costly step when a list parses every note it shows.
        if (rootFolder && !normalizedFilePath.startsWith(`${rootFolder}/`)) {
            return null;
        }

        const isNotePath = (date: MomentInstance): boolean => resolveLocation(date).filePath === normalizedFilePath;
        const parseInput = `${stripMarkdownExtension(normalizedFilePath)}${extensionSuffix}`;

        if (kind === 'week') {
            return findWeeklyCalendarNoteDate(parseInput, fullPattern, parseLocale, momentApi, resolvePathDate, isNotePath);
        }

        const parsedDate = momentApi(parseInput, fullPattern, parseLocale, true);
        if (!parsedDate.isValid() || !isNotePath(parsedDate)) {
            return null;
        }

        return parsedDate;
    };
}

/**
 * Returns the date of the calendar note of `kind` at `filePath`, or null when the path is not such a note. A path counts
 * only when the pattern builds the same path from the parsed date.
 */
export function parseCalendarNoteDateFromPath(options: ParseCalendarNoteDateFromPathOptions): MomentInstance | null {
    return createCalendarNoteDatePathParser(options)?.(options.filePath) ?? null;
}

/** Moment API plus the locale that Notebook Navigator periodic note paths are formatted and parsed with. */
export interface PeriodicNoteLocaleContext {
    momentApi: MomentApi;
    periodicNotesLocale: string;
}

export function getPeriodicNoteLocaleContext(settings: NotebookNavigatorSettings): PeriodicNoteLocaleContext | null {
    const momentApi = getMomentApi();
    if (!momentApi) {
        return null;
    }

    const { calendarRulesLocale } = resolveCalendarLocales(settings.calendarLocale, momentApi, getCurrentLanguage());
    const periodicNotesLocale = resolveCalendarPeriodicNotesLocale(
        settings.calendarPeriodicNotesLocaleSource,
        calendarRulesLocale,
        momentApi
    );
    return { momentApi, periodicNotesLocale };
}

/** Returns the start of the period covered by the note at `filePath`, or null when the path is not a note of the parser's kind. */
export type PeriodicNotePathParser = (filePath: string) => MomentInstance | null;

/**
 * Builds the path parser for notes of `kind`, or returns null when the calendar has no notes of that kind: the Daily Notes
 * integration only has daily notes, and Notebook Navigator periodic notes need a valid pattern, which weekly and longer
 * notes leave empty when they are turned off. The parser reads the settings as they are when it is built, so a caller
 * that keeps it must build a new one after the calendar settings or the Daily Notes settings change.
 */
export function createPeriodicNotePathParser(
    app: App,
    settings: NotebookNavigatorSettings,
    kind: CalendarNoteKind,
    localeContext: PeriodicNoteLocaleContext
): PeriodicNotePathParser | null {
    const { momentApi, periodicNotesLocale } = localeContext;

    if (settings.calendarIntegrationMode === 'daily-notes') {
        const dailyNoteSettings = kind === 'day' ? getCoreDailyNoteSettings(app) : null;
        if (!dailyNoteSettings) {
            return null;
        }

        return createDailyNoteDatePathParser(dailyNoteSettings, momentApi, resolveDailyNoteLocale(momentApi));
    }

    const resolverContext = createCalendarNotePathResolverContext(kind, settings);
    const parseDate = createCalendarNoteDatePathParser({
        kind,
        resolverContext,
        calendarLocale: periodicNotesLocale,
        weekLocale: periodicNotesLocale,
        customCalendarRootFolderSettings: { calendarCustomRootFolder: getActiveVaultProfile(settings).periodicNotesFolder },
        momentApi,
        parseLocale: periodicNotesLocale
    });
    if (!parseDate) {
        return null;
    }

    return filePath => {
        const parsedDate = parseDate(filePath);
        if (!parsedDate) {
            return null;
        }

        // Weekly dates move to the week start the pattern's week tokens use, so stepping by a week lands on the next
        // note and the parent month is the month of the first day of the week.
        const periodStart = resolveCalendarCustomNotePathDate(
            kind,
            parsedDate,
            resolverContext.momentPattern,
            periodicNotesLocale,
            periodicNotesLocale
        );
        return kind === 'week' ? periodStart : periodStart.startOf(kind);
    };
}
