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

import { describe, expect, test } from 'vitest';
import { resolveCalendarCustomNotePathDate } from '../../src/utils/calendarNotes';
import { resolveCalendarPeriodicNotesLocale, type MomentApi, type MomentInstance, type MomentLocaleData } from '../../src/utils/moment';

describe('calendar note locale policy', () => {
    const createMoment = (context: { localeCalls: string[]; startOfCalls: string[] }): MomentInstance => {
        const localeData: MomentLocaleData = {
            firstDayOfWeek: () => 1,
            weekdaysMin: () => [],
            weekdaysShort: () => []
        };

        const stub: MomentInstance = {
            clone: () => createMoment(context),
            format: () => '',
            isValid: () => true,
            locale: (locale: string) => {
                context.localeCalls.push(locale);
                return stub;
            },
            localeData: () => localeData,
            startOf: (unit: string) => {
                context.startOfCalls.push(unit);
                return stub;
            },
            endOf: () => stub,
            add: () => stub,
            subtract: () => stub,
            diff: () => 0,
            week: () => 1,
            weekYear: () => 2026,
            isoWeek: () => 1,
            isoWeekYear: () => 2026,
            month: () => 0,
            year: () => 2026,
            date: () => 1,
            set: () => stub,
            get: () => 0,
            toDate: () => new Date(0)
        };

        return stub;
    };

    test('localizes day/month/quarter/year path dates with the calendar locale', () => {
        const calendarLocale = 'fr';

        for (const kind of ['day', 'month', 'quarter', 'year'] as const) {
            const context = { localeCalls: [] as string[], startOfCalls: [] as string[] };
            const date = createMoment(context);
            resolveCalendarCustomNotePathDate(kind, date, 'YYYY/MM', calendarLocale);
            expect(context.localeCalls).toEqual([calendarLocale]);
            expect(context.startOfCalls).toEqual([]);
        }
    });

    test('anchors locale week patterns to startOf(week) using week locale override', () => {
        const context = { localeCalls: [] as string[], startOfCalls: [] as string[] };
        const date = createMoment(context);
        resolveCalendarCustomNotePathDate('week', date, 'gggg/[W]ww', 'sv', 'de');
        expect(context.localeCalls).toEqual(['de']);
        expect(context.startOfCalls).toEqual(['week']);
    });

    test('anchors locale week patterns to startOf(week) using display locale when week locale is omitted', () => {
        const context = { localeCalls: [] as string[], startOfCalls: [] as string[] };
        const date = createMoment(context);
        resolveCalendarCustomNotePathDate('week', date, 'gggg/[W]ww', 'sv');
        expect(context.localeCalls).toEqual(['sv']);
        expect(context.startOfCalls).toEqual(['week']);
    });

    test('anchors ISO week patterns to startOf(isoWeek) using week locale override', () => {
        const context = { localeCalls: [] as string[], startOfCalls: [] as string[] };
        const date = createMoment(context);
        resolveCalendarCustomNotePathDate('week', date, 'GGGG-[W]WW', 'fr', 'en-gb');
        expect(context.localeCalls).toEqual(['en-gb']);
        expect(context.startOfCalls).toEqual(['isoWeek']);
    });

    test('uses calendar locale when periodic notes locale source is calendar', () => {
        expect(resolveCalendarPeriodicNotesLocale('calendar', 'sv', null)).toBe('sv');
    });

    test('uses Obsidian moment locale when periodic notes locale source is obsidian', () => {
        const momentApi = (() => createMoment({ localeCalls: [], startOfCalls: [] })) as MomentApi;
        momentApi.locales = () => ['en', 'sv'];
        momentApi.locale = () => 'en-US';
        momentApi.fn = {};
        momentApi.utc = () => ({});

        expect(resolveCalendarPeriodicNotesLocale('obsidian', 'sv', momentApi)).toBe('en');
    });
});
