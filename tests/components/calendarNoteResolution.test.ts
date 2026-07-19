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
import {
    createCalendarNotePathResolverContext,
    parseCalendarNoteDateFromPath,
    resolveCalendarNoteTarget
} from '../../src/components/calendar/calendarNoteResolution';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { MomentApi, MomentInstance, MomentLocaleData } from '../../src/utils/moment';
import { createTestTFile } from '../utils/createTestTFile';

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
        toDate: () => new Date('2026-06-14T00:00:00Z')
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

    test('parses a nested weekly note path when the full path mixes month and quarter folders', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            calendarCustomWeekPattern: 'YYYY/YYYY-[Q]Q/YYYY-MM/YYYY-[W]ww/YYYY-[W]ww'
        };
        const filePath = 'Periodic/2026/2026-Q2/2026-06/2026-W25/2026-W25.md';
        const resolverContext = createCalendarNotePathResolverContext('week', settings);
        const momentApi = createMomentApi({
            'YYYY-[W]ww::2026-W25': {
                YYYY: '2026',
                'YYYY-[Q]Q': '2026-Q2',
                'YYYY-MM': '2026-06',
                'YYYY/YYYY-[Q]Q/YYYY-MM/YYYY-[W]ww': '2026/2026-Q2/2026-06/2026-W25',
                'YYYY-[W]ww': '2026-W25',
                'YYYY-MM-DD': '2026-06-14'
            }
        });

        const parsedDate = parseCalendarNoteDateFromPath({
            filePath,
            kind: 'week',
            resolverContext,
            calendarLocale: 'en',
            weekLocale: 'en',
            customCalendarRootFolderSettings: { calendarCustomRootFolder: 'Periodic' },
            momentApi,
            parseLocale: 'en'
        });

        expect(parsedDate).not.toBeNull();
        expect(parsedDate?.format('YYYY-MM-DD')).toBe('2026-06-14');
    });

    test('returns null when a nested weekly note path does not resolve back to the same month folder', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            calendarCustomWeekPattern: 'YYYY/YYYY-[Q]Q/YYYY-MM/YYYY-[W]ww/YYYY-[W]ww'
        };
        const filePath = 'Periodic/2026/2026-Q2/2026-05/2026-W25/2026-W25.md';
        const resolverContext = createCalendarNotePathResolverContext('week', settings);
        const momentApi = createMomentApi({
            'YYYY-[W]ww::2026-W25': {
                YYYY: '2026',
                'YYYY-[Q]Q': '2026-Q2',
                'YYYY-MM': '2026-06',
                'YYYY/YYYY-[Q]Q/YYYY-MM/YYYY-[W]ww': '2026/2026-Q2/2026-06/2026-W25',
                'YYYY-[W]ww': '2026-W25',
                'YYYY-MM-DD': '2026-06-14'
            }
        });

        const parsedDate = parseCalendarNoteDateFromPath({
            filePath,
            kind: 'week',
            resolverContext,
            calendarLocale: 'en',
            weekLocale: 'en',
            customCalendarRootFolderSettings: { calendarCustomRootFolder: 'Periodic' },
            momentApi,
            parseLocale: 'en'
        });

        expect(parsedDate).toBeNull();
    });
});
