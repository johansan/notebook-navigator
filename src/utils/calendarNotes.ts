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

import { TFile, TFolder, normalizePath, type App } from 'obsidian';
import { strings } from '../i18n';
import type { NotebookNavigatorSettings } from '../settings/types';
import {
    createCalendarCustomDateFormatter,
    ensureMarkdownFileName,
    getCalendarCustomWeekAnchorDate,
    isCalendarCustomDatePatternValid,
    isCalendarCustomMonthPatternValid,
    isCalendarCustomQuarterPatternValid,
    isCalendarCustomWeekPatternValid,
    isCalendarCustomYearPatternValid,
    normalizeCalendarCustomRootFolder,
    normalizeCalendarVaultFolderPath,
    splitCalendarCustomPattern
} from './calendarCustomNotePatterns';
import {
    createMarkdownFileFromTemplate,
    getFolderTemplateFile,
    getMarkdownTemplateFile,
    prepareMarkdownTemplate,
    type TemplateSettings
} from './fileCreationUtils';
import type { MomentApi, MomentInstance } from './moment';

export type CalendarNoteKind = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface CalendarNoteConfig {
    calendarCustomFilePattern: string;
    fallbackPattern?: string;
    isPatternValid: (pattern: string, momentApi?: MomentApi | null) => boolean;
    parsingErrorText: string;
}

export function getCalendarNoteConfig(kind: CalendarNoteKind, settings: NotebookNavigatorSettings): CalendarNoteConfig {
    switch (kind) {
        case 'day':
            return {
                calendarCustomFilePattern: settings.calendarCustomFilePattern,
                isPatternValid: isCalendarCustomDatePatternValid,
                parsingErrorText: strings.settings.items.calendarDailyNotePattern.parsingError
            };
        case 'week':
            return {
                calendarCustomFilePattern: settings.calendarCustomWeekPattern,
                fallbackPattern: '',
                isPatternValid: isCalendarCustomWeekPatternValid,
                parsingErrorText: strings.settings.items.calendarWeeklyNotePattern.parsingError
            };
        case 'month':
            return {
                calendarCustomFilePattern: settings.calendarCustomMonthPattern,
                fallbackPattern: '',
                isPatternValid: isCalendarCustomMonthPatternValid,
                parsingErrorText: strings.settings.items.calendarMonthlyNotePattern.parsingError
            };
        case 'quarter':
            return {
                calendarCustomFilePattern: settings.calendarCustomQuarterPattern,
                fallbackPattern: '',
                isPatternValid: isCalendarCustomQuarterPatternValid,
                parsingErrorText: strings.settings.items.calendarQuarterlyNotePattern.parsingError
            };
        case 'year':
            return {
                calendarCustomFilePattern: settings.calendarCustomYearPattern,
                fallbackPattern: '',
                isPatternValid: isCalendarCustomYearPatternValid,
                parsingErrorText: strings.settings.items.calendarYearlyNotePattern.parsingError
            };
    }
}

/** Returns the configured template file path for a calendar note kind, or null if not set. */
export function getCalendarTemplatePath(kind: CalendarNoteKind, settings: NotebookNavigatorSettings): string | null {
    switch (kind) {
        case 'day':
            return settings.calendarCustomFileTemplate;
        case 'week':
            return settings.calendarCustomWeekTemplate;
        case 'month':
            return settings.calendarCustomMonthTemplate;
        case 'quarter':
            return settings.calendarCustomQuarterTemplate;
        case 'year':
            return settings.calendarCustomYearTemplate;
    }
}

export function buildCustomCalendarMomentPattern(calendarCustomFilePattern: string, fallbackPattern?: string): string {
    const { folderPattern, filePattern } = splitCalendarCustomPattern(calendarCustomFilePattern, fallbackPattern);
    return folderPattern ? `${folderPattern}/${filePattern}` : filePattern;
}

export function resolveCalendarCustomNotePathDate(
    kind: CalendarNoteKind,
    date: MomentInstance,
    momentPattern: string,
    calendarLocale: string,
    weekLocale?: string
): MomentInstance {
    if (kind === 'week') {
        return getCalendarCustomWeekAnchorDate(date, momentPattern, weekLocale ?? calendarLocale);
    }
    return date.clone().locale(calendarLocale);
}

/** Resolved location of a calendar note plus the date and file name pattern it was built from. */
export interface CalendarNoteLocation {
    folderPath: string;
    fileName: string;
    filePath: string;
    /** File name pattern rendered with the note date. */
    formattedFilePattern: string;
    /** Moment pattern of the file name, used as the default `{{date}}` format in templates. */
    filePattern: string;
    /** Localized date the path was built from: the start of the period for weekly notes. */
    date: MomentInstance;
}

export function buildCustomCalendarFilePathForPattern(
    date: MomentInstance,
    settings: {
        calendarCustomRootFolder: string;
    },
    calendarCustomFilePattern: string,
    fallbackPattern?: string
): CalendarNoteLocation {
    const customRootFolder = normalizeCalendarCustomRootFolder(settings.calendarCustomRootFolder);
    const { folderPattern: customFolderPattern, filePattern: customFilePattern } = splitCalendarCustomPattern(
        calendarCustomFilePattern,
        fallbackPattern
    );

    const folderFormatter = createCalendarCustomDateFormatter(customFolderPattern);
    const fileFormatter = createCalendarCustomDateFormatter(customFilePattern);

    const folderSuffix = folderFormatter(date);
    const rawFolderPath = customRootFolder ? (folderSuffix ? `${customRootFolder}/${folderSuffix}` : customRootFolder) : folderSuffix;
    const folderPath = normalizeCalendarVaultFolderPath(rawFolderPath || '/');

    const formattedFilePattern = fileFormatter(date).trim();
    const fileName = ensureMarkdownFileName(formattedFilePattern);
    const filePath = folderPath === '/' ? fileName : normalizePath(`${folderPath}/${fileName}`);

    return { folderPath, fileName, filePath, formattedFilePattern, filePattern: customFilePattern, date };
}

/** Creates nested folders recursively if they don't exist, returns final folder or null when a path segment is not a folder. */
async function ensureCalendarFolderExists(app: App, folderPath: string): Promise<TFolder | null> {
    if (folderPath === '/' || !folderPath) {
        return app.vault.getRoot();
    }

    const normalized = normalizePath(folderPath);
    if (!normalized || normalized === '/' || normalized === '.') {
        return app.vault.getRoot();
    }

    const parts = normalized.split('/').filter(Boolean);
    let current = '';
    for (const part of parts) {
        current = current ? `${current}/${part}` : part;
        const existing = app.vault.getAbstractFileByPath(current);
        if (!existing) {
            await app.vault.createFolder(current);
            continue;
        }
        if (!(existing instanceof TFolder)) {
            return null;
        }
    }

    const folder = app.vault.getAbstractFileByPath(normalized);
    return folder instanceof TFolder ? folder : null;
}

function getCalendarNoteBaseName(fileName: string): string | null {
    const baseName = fileName.replace(/\.md$/iu, '').trim();
    return baseName.length > 0 ? baseName : null;
}

/**
 * Returns the start of the period a calendar note covers. Weekly targets already carry their week anchor, so only
 * the time of day is dropped; other kinds are moved to the first day of their month, quarter or year so `{{date}}`
 * describes the note instead of the day it was created on.
 */
function getCalendarTemplateDate(kind: CalendarNoteKind, date: MomentInstance): MomentInstance {
    switch (kind) {
        case 'month':
            return date.clone().startOf('month');
        case 'quarter':
            return date.clone().startOf('quarter');
        case 'year':
            return date.clone().startOf('year');
        default:
            return date.clone().startOf('day');
    }
}

/**
 * Creates a calendar note at `target`, applying the template with the configured engine.
 * Returns null when creation stopped after a notice. Throws on invalid targets and vault failures.
 */
export async function createCalendarMarkdownFile(
    app: App,
    kind: CalendarNoteKind,
    target: CalendarNoteLocation,
    templatePath: string | null,
    templateSettings: TemplateSettings
): Promise<TFile | null> {
    const baseName = getCalendarNoteBaseName(target.fileName);
    if (!baseName) {
        throw new Error('Invalid calendar note filename');
    }

    // A configured calendar template wins even when its file is missing; folder templates only fill the gap when none is set.
    // The template is resolved from the target path before any folder exists, so prompts can run first and a cancelled
    // prompt leaves no empty folders behind.
    const templateFile = templatePath
        ? getMarkdownTemplateFile(app, templatePath, 'calendar note')
        : getFolderTemplateFile(app, templateSettings, target.folderPath);
    const preparedTemplate = await prepareMarkdownTemplate({
        app,
        templateFile,
        settings: templateSettings,
        templateErrorContext: 'calendar note'
    });
    if (!preparedTemplate) {
        return null;
    }

    const folder = await ensureCalendarFolderExists(app, target.folderPath);
    if (!folder) {
        throw new Error('Calendar folder path is not a folder');
    }

    const formatTemplateDate = createCalendarCustomDateFormatter(target.filePattern);
    return createMarkdownFileFromTemplate({
        app,
        folder,
        baseName,
        preparedTemplate,
        settings: templateSettings,
        // Weekly notes anchor weekday tokens on the period start so ISO weeks keep every weekday inside the note's week.
        templateDate: {
            date: getCalendarTemplateDate(kind, target.date),
            // Format before stripping the extension, because Moment literals such as `[.md]` render it too.
            dateFormat: date => getCalendarNoteBaseName(formatTemplateDate(date)) ?? '',
            weekdayBase: kind === 'week' ? 'note-date' : 'locale-week'
        },
        templateErrorContext: 'calendar note'
    });
}
