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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMomentApiCacheForTests } from '../../src/utils/moment';

function createMomentStub(): { moment: unknown } {
    const ISO_8601 = Symbol('ISO_8601');

    type MomentInstanceStub = {
        date: Date;
        valid: boolean;
        localeId: string;
    };

    const createInstance = (params: { date: Date; valid: boolean; localeId: string }): unknown => {
        const state: MomentInstanceStub = { ...params };

        const instance = {
            clone: () => createInstance({ date: new Date(state.date.getTime()), valid: state.valid, localeId: state.localeId }),
            format: (_format?: string) => (state.valid ? state.date.toISOString() : 'Invalid date'),
            isValid: () => state.valid,
            locale: (locale: string) => {
                state.localeId = locale;
                return instance;
            },
            localeData: () => ({
                firstDayOfWeek: () => 1,
                weekdaysMin: () => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                weekdaysShort: () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            }),
            startOf: (_unit: string) => instance,
            endOf: (_unit: string) => instance,
            add: (_amount: number, _unit: string) => instance,
            subtract: (_amount: number, _unit: string) => instance,
            diff: (_other: unknown, _unit: string) => 0,
            week: () => 1,
            weekYear: () => state.date.getFullYear(),
            month: () => state.date.getMonth(),
            year: () => state.date.getFullYear(),
            date: () => state.date.getDate(),
            set: (_values: Record<string, number>) => instance,
            get: (_unit: string) => 0,
            toDate: () => new Date(state.date.getTime())
        };

        return instance;
    };

    const parseChineseMeridiem = (value: string): { date: Date; valid: boolean } => {
        const match = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日\s*(上午|下午)\s*(\d{1,2}):(\d{2})$/u);
        if (!match) {
            return { date: new Date(NaN), valid: false };
        }

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const meridiem = match[4] ?? '';
        let hour = Number(match[5]);
        const minute = Number(match[6]);

        if (
            !Number.isFinite(year) ||
            !Number.isFinite(month) ||
            !Number.isFinite(day) ||
            !Number.isFinite(hour) ||
            !Number.isFinite(minute)
        ) {
            return { date: new Date(NaN), valid: false };
        }

        if (meridiem === '下午' && hour < 12) {
            hour += 12;
        }
        if (meridiem === '上午' && hour === 12) {
            hour = 0;
        }

        const date = new Date(year, month - 1, day, hour, minute, 0, 0);
        return { date, valid: Number.isFinite(date.getTime()) };
    };

    const moment = (input?: unknown, format?: unknown): unknown => {
        if (typeof input === 'string' && format === ISO_8601) {
            const parsed = Date.parse(input);
            const date = new Date(parsed);
            return createInstance({ date, valid: Number.isFinite(parsed), localeId: 'en' });
        }

        if (typeof input === 'string' && format === 'YYYY年M月D日 a hh:mm') {
            const parsed = parseChineseMeridiem(input);
            return createInstance({ date: parsed.date, valid: parsed.valid, localeId: 'zh-cn' });
        }

        if (typeof input === 'string') {
            const parsed = Date.parse(input);
            const date = new Date(parsed);
            return createInstance({ date, valid: Number.isFinite(parsed), localeId: 'en' });
        }

        if (typeof input === 'number') {
            const date = new Date(input);
            return createInstance({ date, valid: Number.isFinite(date.getTime()), localeId: 'en' });
        }

        if (input instanceof Date) {
            return createInstance({ date: new Date(input.getTime()), valid: Number.isFinite(input.getTime()), localeId: 'en' });
        }

        return createInstance({ date: new Date(NaN), valid: false, localeId: 'en' });
    };

    Object.defineProperty(moment, 'locales', {
        value: () => ['en', 'zh-cn'],
        writable: false
    });
    Object.defineProperty(moment, 'locale', {
        value: () => 'en',
        writable: false
    });
    Object.defineProperty(moment, 'fn', {
        value: {},
        writable: false
    });
    Object.defineProperty(moment, 'utc', {
        value: () => null,
        writable: false
    });
    Object.defineProperty(moment, 'ISO_8601', {
        value: ISO_8601,
        writable: false
    });

    return { moment };
}

const { getLanguageMock } = vi.hoisted(() => ({
    getLanguageMock: vi.fn(() => 'en')
}));

vi.mock('obsidian', () => ({
    getLanguage: getLanguageMock
}));

import { DateUtils } from '../../src/utils/dateUtils';

describe('DateUtils.formatLocalizedMonthDay', () => {
    it.each([
        ['en-US', 'April 19'],
        ['sv-SE', '19 april']
    ])('formats localized month/day order for %s', (locale, expected) => {
        expect(DateUtils.formatLocalizedMonthDay(new Date(2026, 3, 19, 12, 0, 0, 0), locale)).toBe(expected);
    });
});

describe('DateUtils.getDateGroupInfo', () => {
    it('returns the label and stable key from one grouping pass', () => {
        const referenceDate = new Date(2026, 2, 7, 12, 0, 0, 0);
        const timestamp = new Date(2026, 2, 7, 8, 30, 0, 0).getTime();

        const group = DateUtils.getDateGroupInfo(timestamp, referenceDate);

        expect(group).toEqual({
            label: 'Today',
            key: 'relative:today'
        });
        expect(DateUtils.getDateGroup(timestamp, referenceDate)).toBe(group.label);
    });
});

describe('DateUtils.parseFrontmatterDate', () => {
    beforeEach(() => {
        vi.stubGlobal('window', createMomentStub());
        getLanguageMock.mockReturnValue('en');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        resetMomentApiCacheForTests();
        getLanguageMock.mockReturnValue('en');
        getLanguageMock.mockClear();
    });

    it.each(['zh', 'zh-CN', 'zh_CN'])('parses Chinese meridiem markers in frontmatter values (%s)', locale => {
        getLanguageMock.mockReturnValue(locale);

        const timestamp = DateUtils.parseFrontmatterDate('2025年11月1日 下午03:24', 'YYYY年M月D日 a hh:mm');

        expect(timestamp).toBeDefined();
        if (timestamp === undefined) {
            throw new Error('Expected timestamp to be defined');
        }

        expect(new Date(timestamp).getHours()).toBe(15);
    });

    it.each(['zh', 'zh-CN', 'zh_CN'])('parses Chinese morning marker as morning hours (%s)', locale => {
        getLanguageMock.mockReturnValue(locale);

        const timestamp = DateUtils.parseFrontmatterDate('2025年11月1日 上午03:24', 'YYYY年M月D日 a hh:mm');

        expect(timestamp).toBeDefined();
        if (timestamp === undefined) {
            throw new Error('Expected timestamp to be defined');
        }

        expect(new Date(timestamp).getHours()).toBe(3);
    });

    it('parses ISO 8601 with timezone offset when dateFormat is empty', () => {
        const value = '2026-02-04T17:33:04+01:00';
        const timestamp = DateUtils.parseFrontmatterDate(value, '');

        expect(timestamp).toBeDefined();
        if (timestamp === undefined) {
            throw new Error('Expected timestamp to be defined');
        }

        expect(timestamp).toBe(Date.parse(value));
    });

    it('parses ISO 8601 without timezone as local time when dateFormat is empty', () => {
        const value = '2026-02-04T17:33:04';
        const timestamp = DateUtils.parseFrontmatterDate(value, '');

        expect(timestamp).toBeDefined();
        if (timestamp === undefined) {
            throw new Error('Expected timestamp to be defined');
        }

        expect(timestamp).toBe(new Date(2026, 1, 4, 17, 33, 4).getTime());
    });
});
