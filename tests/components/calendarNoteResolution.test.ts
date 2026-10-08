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

import { beforeAll, describe, expect, test, vi } from 'vitest';
import {
    createCalendarNotePathResolverContext,
    parseCalendarNoteDateFromPath,
    resolveCalendarNotePath,
    resolveCalendarNoteTarget
} from '../../src/components/calendar/calendarNoteResolution';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { MomentApi, MomentInstance, MomentLocaleData } from '../../src/utils/moment';
import { createTestTFile } from '../utils/createTestTFile';

const realMoment = (await vi.importActual<{ default: unknown }>('moment')).default as MomentApi;
/** The moment package functions used to register a test locale. */
const momentLocales = realMoment as unknown as {
    defineLocale(name: string, config: { parentLocale: string; week: { dow: number; doy: number } }): unknown;
    locale(name: string): string;
};

function createFakeMoment(
    formatMap?: Record<string, string>,
    options?: {
        isValid?: boolean;
    }
): MomentInstance {
    const localeData: MomentLocaleData = {
        firstDayOfWeek: () => 1,
        weekdaysMin: () => [],
        weekdaysShort: () => []
    };

    const stub: MomentInstance = {
        clone: () => createFakeMoment(formatMap, options),
        format: (format?: string) => (format ? (formatMap?.[format] ?? format) : ''),
        isValid: () => options?.isValid ?? true,
        locale: () => stub,
        localeData: () => localeData,
        startOf: () => stub,
        endOf: () => stub,
        add: () => stub,
        subtract: () => stub,
        diff: () => 0,
        week: () => 25,
        weekYear: () => 2026,
        isoWeek: () => 25,
        isoWeekYear: () => 2026,
        month: () => 5,
        year: () => 2026,
        date: () => 14,
        set: () => stub,
        get: () => 0,
        toDate: () => new Date('2026-06-14T00:00:00Z'),
        parsingFlags: () => ({ parsedDateParts: [] })
    };

    return stub;
}

function createMomentApi(parsedByKey: Record<string, Record<string, string>>): MomentApi {
    const momentApi = ((input?: string | number | Date, format?: unknown): MomentInstance => {
        if (typeof input === 'string' && format === 'YYYY-MM-DD') {
            return createFakeMoment();
        }

        if (typeof input === 'string' && typeof format === 'string') {
            const formatMap = parsedByKey[`${format}::${input}`];
            if (formatMap) {
                return createFakeMoment(formatMap);
            }
        }

        return createFakeMoment(undefined, { isValid: false });
    }) as MomentApi;

    momentApi.locales = () => ['en'];
    momentApi.locale = () => 'en';
    momentApi.fn = {};
    momentApi.utc = () => ({});

    return momentApi;
}

describe('calendar note resolution', () => {
    test('retains an existing note while hiding it from a profile-hidden folder', () => {
        const existingFile = createTestTFile('Personal/Journal/2026-07-18.md');

        const target = resolveCalendarNoteTarget({
            existingFile,
            targetPath: existingFile.path,
            hiddenFolders: ['/Personal/Journal'],
            showHiddenItems: false,
            isExistingFileVisible: () => true
        });

        expect(target).toEqual({
            existingFile,
            visibleFile: null,
            isHidden: true,
            targetPath: existingFile.path
        });
    });

    test('blocks creation when a missing calendar note targets a profile-hidden folder', () => {
        const target = resolveCalendarNoteTarget({
            existingFile: null,
            targetPath: 'Personal/Journal/2026-07-19.md',
            hiddenFolders: ['/Personal/Journal'],
            showHiddenItems: false,
            isExistingFileVisible: () => true
        });

        expect(target).toEqual({
            existingFile: null,
            visibleFile: null,
            isHidden: true,
            targetPath: 'Personal/Journal/2026-07-19.md'
        });
    });

    test('shows profile-hidden calendar targets while hidden items are enabled', () => {
        const existingFile = createTestTFile('Personal/Journal/2026-07-18.md');

        const target = resolveCalendarNoteTarget({
            existingFile,
            targetPath: existingFile.path,
            hiddenFolders: ['/Personal/Journal'],
            showHiddenItems: true,
            isExistingFileVisible: () => false
        });

        expect(target).toEqual({
            existingFile,
            visibleFile: existingFile,
            isHidden: false,
            targetPath: existingFile.path
        });
    });

    test('hides an existing calendar note excluded by another profile file rule', () => {
        const existingFile = createTestTFile('Journal/2026-07-18.md');

        const target = resolveCalendarNoteTarget({
            existingFile,
            targetPath: existingFile.path,
            hiddenFolders: [],
            showHiddenItems: false,
            isExistingFileVisible: () => false
        });

        expect(target.existingFile).toBe(existingFile);
        expect(target.visibleFile).toBeNull();
        expect(target.isHidden).toBe(true);
    });

    test('parses a month note path when it round-trips through the configured pattern', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            calendarCustomMonthPattern: 'YYYY/YYYY-MM'
        };
        const filePath = 'Periodic/2026/2026-04.md';
        const resolverContext = createCalendarNotePathResolverContext('month', settings);
        const momentApi = createMomentApi({
            '[Periodic]/YYYY/YYYY-MM::Periodic/2026/2026-04': {
                YYYY: '2026',
                'YYYY-MM': '2026-04',
                'YYYY-MM-DD': '2026-04-01'
            }
        });

        const parsedDate = parseCalendarNoteDateFromPath({
            filePath,
            kind: 'month',
            resolverContext,
            calendarLocale: 'en',
            weekLocale: 'en',
            customCalendarRootFolderSettings: { calendarCustomRootFolder: 'Periodic' },
            momentApi,
            parseLocale: 'en'
        });

        expect(parsedDate).not.toBeNull();
        expect(parsedDate?.format('YYYY-MM-DD')).toBe('2026-04-01');
    });
});

describe('calendar note path parsing with Moment', () => {
    beforeAll(() => {
        // Locale with a Monday week start and ISO week-year rules, like `en-gb`, so locale weeks are checked under other week rules.
        momentLocales.defineLocale('nn-monday-start', { parentLocale: 'en', week: { dow: 1, doy: 4 } });
        momentLocales.locale('en');
    });

    function createPathOptions(kind: 'day' | 'week', pattern: string, locale: string) {
        const settings =
            kind === 'day'
                ? { ...DEFAULT_SETTINGS, calendarCustomFilePattern: pattern }
                : { ...DEFAULT_SETTINGS, calendarCustomWeekPattern: pattern };
        return {
            kind,
            resolverContext: createCalendarNotePathResolverContext(kind, settings),
            calendarLocale: locale,
            weekLocale: locale,
            customCalendarRootFolderSettings: { calendarCustomRootFolder: 'Periodic' },
            momentApi: realMoment
        };
    }

    function parse(kind: 'day' | 'week', pattern: string, filePath: string, locale = 'en') {
        return parseCalendarNoteDateFromPath({ ...createPathOptions(kind, pattern, locale), filePath, parseLocale: locale });
    }

    test.each(['YYYY/YYYYMMDD[.md]', 'YYYY/YYYYMMDD.[md]'])('parses a daily note whose pattern %s ends in a literal extension', pattern => {
        expect(parse('day', pattern, 'Periodic/2026/20261005.md')?.format('YYYY-MM-DD')).toBe('2026-10-05');
    });

    test('parses a weekly note whose pattern ends in a literal extension', () => {
        expect(parse('week', 'gggg/[W]ww[.md]', 'Periodic/2026/W41.md')?.format('YYYY-MM-DD')).toBe('2026-10-04');
    });

    test.each([
        ['YYYY/[W]ww', 'en', '2025-12-28', 'Periodic/2025/W01.md'],
        ['YYYY/[W]ww', 'en', '2026-12-27', 'Periodic/2026/W01.md'],
        ['YYYY/[W]ww', 'en', '2027-12-26', 'Periodic/2027/W01.md'],
        ['YYYY/[W]ww', 'en', '2027-01-03', 'Periodic/2027/W02.md'],
        ['YYYY/[W]ww', 'nn-monday-start', '2025-12-29', 'Periodic/2025/W01.md'],
        ['YYYY/[W]WW', 'en', '2019-12-30', 'Periodic/2019/W01.md'],
        ['YYYY/[W]WW', 'en', '2025-12-29', 'Periodic/2025/W01.md'],
        ['YYYY/YYYY-[W]ww', 'en', '2026-12-27', 'Periodic/2026/2026-W01.md'],
        ['gggg/[W]ww', 'en', '2026-12-27', 'Periodic/2027/W01.md'],
        ['GGGG/[W]WW', 'en', '2025-12-29', 'Periodic/2026/W01.md'],
        ['YYYY/MM/[W]ww', 'en', '2026-10-04', 'Periodic/2026/10/W41.md'],
        ['YYYY/MM/[W]ww', 'en', '2026-12-27', 'Periodic/2026/12/W01.md'],
        ['YYYY/MM/[W]WW', 'en', '2026-12-28', 'Periodic/2026/12/W53.md'],
        ['YYYY/MMMM/[Week] ww', 'en', '2026-10-04', 'Periodic/2026/October/Week 41.md'],
        ['YYYY/YYYY-MM/[W]ww', 'en', '2027-01-03', 'Periodic/2027/2027-01/W02.md'],
        ['YYYY/[Q]Q/[W]ww', 'en', '2026-12-27', 'Periodic/2026/Q4/W01.md'],
        ['gggg/MM/[W]ww', 'en', '2026-12-27', 'Periodic/2027/12/W01.md'],
        ['YYYY-MM-DD/[W]ww', 'en', '2026-10-04', 'Periodic/2026-10-04/W41.md'],
        ['gggg/[W]ww-dddd', 'en', '2026-10-04', 'Periodic/2026/W41-Sunday.md'],
        ['YYYY/YYYY-[Q]Q/YYYY-MM/YYYY-[W]ww/YYYY-[W]ww', 'en', '2026-06-14', 'Periodic/2026/2026-Q2/2026-06/2026-W25/2026-W25.md'],
        ['YYYY-MM/[W]ww', 'en', '2026-10-04', 'Periodic/2026-10/W41.md'],
        ['YYYY-MM/[W]ww', 'nn-monday-start', '2025-12-29', 'Periodic/2025-12/W01.md'],
        ['YYYY/MM-[W]ww', 'en', '2026-12-27', 'Periodic/2026/12-W01.md'],
        ['YYYY/YYYY-MM-[W]ww', 'en', '2026-02-08', 'Periodic/2026/2026-02-W07.md'],
        ['YYYY-[Q]Q/[W]ww', 'en', '2026-12-27', 'Periodic/2026-Q4/W01.md'],
        ['gggg-MM/[W]ww', 'en', '2026-12-27', 'Periodic/2027-12/W01.md'],
        ['YYYY-MM/[W]ww-dddd', 'en', '2026-10-04', 'Periodic/2026-10/W41-Sunday.md']
    ])('parses the %s note in locale %s of the week starting %s from %s', (pattern, locale, weekStart, filePath) => {
        const date = realMoment(weekStart, 'YYYY-MM-DD', locale, true);
        expect(resolveCalendarNotePath({ ...createPathOptions('week', pattern, locale), date })?.filePath).toBe(filePath);
        expect(parse('week', pattern, filePath, locale)?.format('YYYY-MM-DD')).toBe(weekStart);
    });

    test('rejects a weekly note below a month folder the week does not start in', () => {
        expect(parse('week', 'YYYY/MM/[W]ww', 'Periodic/2026/09/W41.md')).toBeNull();
        expect(parse('week', 'YYYY/MM/[W]ww', 'Periodic/2027/01/W01.md')).toBeNull();
        expect(
            parse('week', 'YYYY/YYYY-[Q]Q/YYYY-MM/YYYY-[W]ww/YYYY-[W]ww', 'Periodic/2026/2026-Q2/2026-05/2026-W25/2026-W25.md')
        ).toBeNull();
    });

    test('returns the earlier week when two weeks build the same weekly note path', () => {
        const lastWeek = realMoment('2023-12-31', 'YYYY-MM-DD', 'en', true);
        expect(resolveCalendarNotePath({ ...createPathOptions('week', 'YYYY/[W]ww', 'en'), date: lastWeek })?.filePath).toBe(
            'Periodic/2023/W01.md'
        );
        expect(parse('week', 'YYYY/[W]ww', 'Periodic/2023/W01.md')?.format('YYYY-MM-DD')).toBe('2023-01-01');
    });
});
