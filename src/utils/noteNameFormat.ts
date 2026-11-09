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

import type { App, TFile } from 'obsidian';
import { createPeriodicNotePathParser, getPeriodicNoteLocaleContext } from '../components/calendar/calendarNoteResolution';
import type { NotebookNavigatorSettings } from '../settings/types';
import { getDailyNoteSettings as getCoreDailyNoteSettings } from './dailyNotes';
import { DateUtils } from './dateUtils';
import { getFileNameWithoutExtension } from './fileNameUtils';
import { getActiveVaultProfile } from './vaultProfiles';

const DEFAULT_NOTE_NAME_FORMAT = '{{name}}';

type NoteNameFormatPart =
    { type: 'text'; value: string } | { type: 'name' } | { type: 'filename' } | { type: 'date'; format: string | null };

interface ParsedNoteNameFormat {
    format: string;
    parts: NoteNameFormatPart[];
    usesDate: boolean;
}

/**
 * A daily note date as a calendar day; `month` is zero-based as in `Date`. Dates are kept as days rather than timestamps
 * because a timestamp of local midnight shows the previous or next day after the time zone changes, such as when
 * traveling with Obsidian open.
 */
interface CalendarDay {
    year: number;
    month: number;
    day: number;
}

/** Daily note dates by path, valid while the calendar settings that locate daily notes match `sourceKey`. */
interface DailyNoteDateCache {
    sourceKey: string;
    parsePath: ((filePath: string) => CalendarDay | null) | null;
    days: Map<string, CalendarDay | null>;
}

// Matches {{name}}, {{filename}}, {{date}} and {{date:FORMAT}}; any other {{...}} text stays literal.
const NOTE_NAME_TOKEN_PATTERN = /\{\{(?:(name|filename)|date(?::([^{}]+))?)\}\}/gu;

let parsedFormatCache: ParsedNoteNameFormat | null = null;
// List rows, search and title sorting ask for the same paths repeatedly, and each date is a strict Moment parse of the
// path, so dates are kept across calls. The source key covers every setting the parser reads, so changing one of them
// replaces the parser and drops the dates read with the old one.
let dailyNoteDateCache: DailyNoteDateCache | null = null;

function parseNoteNameFormat(format: string): ParsedNoteNameFormat {
    if (parsedFormatCache?.format === format) {
        return parsedFormatCache;
    }

    const parts: NoteNameFormatPart[] = [];
    let usesDate = false;
    let lastIndex = 0;
    for (const match of format.matchAll(NOTE_NAME_TOKEN_PATTERN)) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', value: format.slice(lastIndex, match.index) });
        }

        const fieldToken = match[1];
        if (fieldToken === 'name' || fieldToken === 'filename') {
            parts.push({ type: fieldToken });
        } else {
            usesDate = true;
            parts.push({ type: 'date', format: match[2] ?? null });
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < format.length) {
        parts.push({ type: 'text', value: format.slice(lastIndex) });
    }

    parsedFormatCache = { format, parts, usesDate };
    return parsedFormatCache;
}

/**
 * Identifies the settings that decide which paths are daily notes. The Daily Notes core plugin settings are read on each
 * call because they change outside this plugin's settings.
 */
function getDailyNoteSourceKey(app: App, settings: NotebookNavigatorSettings): string {
    if (settings.calendarIntegrationMode === 'daily-notes') {
        const coreSettings = getCoreDailyNoteSettings(app);
        return coreSettings ? ['daily-notes', coreSettings.folder, coreSettings.format].join('\n') : 'daily-notes';
    }

    return [
        'notebook-navigator',
        settings.calendarCustomFilePattern,
        getActiveVaultProfile(settings).periodicNotesFolder,
        settings.calendarLocale,
        settings.calendarPeriodicNotesLocaleSource
    ].join('\n');
}

/** Returns the day of the daily note at `filePath`, or null when the path is not a daily note. */
function getDailyNoteDay(app: App, settings: NotebookNavigatorSettings, filePath: string): CalendarDay | null {
    const sourceKey = getDailyNoteSourceKey(app, settings);
    let cache = dailyNoteDateCache;
    if (cache?.sourceKey !== sourceKey) {
        const localeContext = getPeriodicNoteLocaleContext(settings);
        const parseDate = localeContext ? createPeriodicNotePathParser(app, settings, 'day', localeContext) : null;
        cache = {
            sourceKey,
            parsePath: parseDate
                ? path => {
                      const date = parseDate(path);
                      return date ? { year: date.year(), month: date.month(), day: date.date() } : null;
                  }
                : null,
            days: new Map()
        };
        dailyNoteDateCache = cache;
    }

    const cached = cache.days.get(filePath);
    if (cached !== undefined) {
        return cached;
    }

    const day = cache.parsePath?.(filePath) ?? null;
    cache.days.set(filePath, day);
    return day;
}

/**
 * Returns the name shown for a note: its file name without extension when it has no frontmatter name, otherwise the
 * frontmatter name formatted with the Note name format setting. The format replaces {{name}} with the frontmatter name,
 * {{filename}} with the file name, and {{date}} or {{date:FORMAT}} with the date of a daily note, formatted with the
 * list date format when no format is given. A note that is not a daily note shows the frontmatter name alone when the
 * format uses {{date}}, so separators around a missing date never show. Title sorting and search use this name too, so
 * every caller that orders or matches notes by name must call it rather than read the frontmatter name.
 */
export function getNoteDisplayName(
    app: App,
    settings: NotebookNavigatorSettings,
    file: TFile,
    frontmatterName: string | undefined
): string {
    if (!frontmatterName) {
        return getFileNameWithoutExtension(file);
    }

    const format = settings.frontmatterNameFormat.trim();
    if (!format || format === DEFAULT_NOTE_NAME_FORMAT) {
        return frontmatterName;
    }

    const { parts, usesDate } = parseNoteNameFormat(format);
    const dailyNoteDay = usesDate ? getDailyNoteDay(app, settings, file.path) : null;
    if (usesDate && !dailyNoteDay) {
        return frontmatterName;
    }
    // Local midnight in the current time zone
    const dailyNoteTimestamp = dailyNoteDay ? new Date(dailyNoteDay.year, dailyNoteDay.month, dailyNoteDay.day).getTime() : null;

    let name = '';
    for (const part of parts) {
        switch (part.type) {
            case 'text':
                name += part.value;
                break;
            case 'name':
                name += frontmatterName;
                break;
            case 'filename':
                name += getFileNameWithoutExtension(file);
                break;
            case 'date':
                if (dailyNoteTimestamp !== null) {
                    name += DateUtils.formatDate(dailyNoteTimestamp, part.format ?? settings.dateFormat);
                }
                break;
        }
    }
    return name;
}
