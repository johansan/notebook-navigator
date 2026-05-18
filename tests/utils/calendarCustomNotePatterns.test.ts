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
    doesCalendarCustomWeekPatternMixWeekTokenTypes,
    doesCalendarCustomWeekPatternUseDifferentWeekRules,
    escapeMomentLiteralPath,
    isCalendarCustomWeekPatternValid
} from '../../src/utils/calendarCustomNotePatterns';

describe('calendar custom note patterns', () => {
    type MomentStub = {
        isValid: () => boolean;
        format: (format?: string) => string;
        clone: () => MomentStub;
        startOf: (unit: string) => MomentStub;
    };

    const createMomentApi = (context: { lastStartOfUnit: string | null }) => {
        return (_input?: string, _format?: string, _strict?: boolean): MomentStub => {
            const stub: MomentStub = {
                isValid: () => true,
                format: (format?: string) => format ?? '',
                clone: () => stub,
                startOf: (unit: string) => {
                    context.lastStartOfUnit = unit;
                    return stub;
                }
            };
            return stub;
        };
    };

    test('accepts nested weekly paths with quarter and month folders', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        const pattern = 'YYYY/YYYY-[Q]Q/YYYY-MM/YYYY-[W]ww/YYYY-[W]ww';
        expect(isCalendarCustomWeekPatternValid(pattern, momentApi)).toBe(true);
        expect(context.lastStartOfUnit).toBe('week');
    });

    test('accepts simple weekly paths', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('gggg/[W]ww', momentApi)).toBe(true);
        expect(context.lastStartOfUnit).toBe('week');
    });

    test('anchors ISO week patterns to isoWeek', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('GGGG-[W]WW', momentApi)).toBe(true);
        expect(context.lastStartOfUnit).toBe('isoWeek');
    });

    test('does not warn for ISO week patterns because display and paths both use ISO weeks', () => {
        expect(
            doesCalendarCustomWeekPatternUseDifferentWeekRules(
                'GGGG-[W]WW',
                { firstDayOfWeek: 0, firstDayOfYear: 6 },
                { firstDayOfWeek: 1, firstDayOfYear: 4 }
            )
        ).toBe(false);
    });

    test('warns for mixed ISO and locale week tokens when display and path week rules differ', () => {
        expect(
            doesCalendarCustomWeekPatternUseDifferentWeekRules(
                'gggg-[W]WW',
                { firstDayOfWeek: 1, firstDayOfYear: 4 },
                { firstDayOfWeek: 0, firstDayOfYear: 6 }
            )
        ).toBe(true);
    });

    test('warns for mixed ISO and locale week tokens when display and path week rules match', () => {
        expect(
            doesCalendarCustomWeekPatternUseDifferentWeekRules(
                'gggg-[W]WW',
                { firstDayOfWeek: 0, firstDayOfYear: 6 },
                { firstDayOfWeek: 0, firstDayOfYear: 6 }
            )
        ).toBe(true);
    });

    test('detects mixed ISO and locale week tokens', () => {
        expect(doesCalendarCustomWeekPatternMixWeekTokenTypes('gggg-[W]WW')).toBe(true);
        expect(doesCalendarCustomWeekPatternMixWeekTokenTypes('GGGG-[W]WW')).toBe(false);
        expect(doesCalendarCustomWeekPatternMixWeekTokenTypes('gggg/[W]ww')).toBe(false);
    });

    test('warns for locale week patterns when display and path locales start weeks on different days', () => {
        expect(
            doesCalendarCustomWeekPatternUseDifferentWeekRules(
                'gggg/[W]ww',
                { firstDayOfWeek: 1, firstDayOfYear: 4 },
                { firstDayOfWeek: 0, firstDayOfYear: 6 }
            )
        ).toBe(true);
    });

    test('warns for locale week patterns when display and path locales use different first weeks of year', () => {
        expect(
            doesCalendarCustomWeekPatternUseDifferentWeekRules(
                'gggg/[W]ww',
                { firstDayOfWeek: 1, firstDayOfYear: 4 },
                { firstDayOfWeek: 1, firstDayOfYear: 6 }
            )
        ).toBe(true);
    });

    test('does not warn for locale week patterns when display and path week rules match', () => {
        expect(
            doesCalendarCustomWeekPatternUseDifferentWeekRules(
                'gggg/[W]ww',
                { firstDayOfWeek: 1, firstDayOfYear: 4 },
                { firstDayOfWeek: 1, firstDayOfYear: 4 }
            )
        ).toBe(false);
    });

    test('rejects weekly pattern without week number token', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('YYYY/YYYY-MM', momentApi)).toBe(false);
    });

    test('rejects weekly pattern without year token', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('[W]ww', momentApi)).toBe(false);
    });

    test('rejects patterns that format to invalid path segments', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('YYYY/<bad>/(gggg)/[W]ww', momentApi)).toBe(false);
    });

    test('rejects Windows reserved device names in path segments', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('YYYY/CON/[W]ww', momentApi)).toBe(false);
        expect(isCalendarCustomWeekPatternValid('YYYY/con.txt/[W]ww', momentApi)).toBe(false);
    });

    test('rejects path segments ending with a dot', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('YYYY/foo./[W]ww', momentApi)).toBe(false);
    });

    test('rejects patterns with unbalanced moment literal brackets', () => {
        const context = { lastStartOfUnit: null as string | null };
        const momentApi = createMomentApi(context);
        expect(isCalendarCustomWeekPatternValid('YYYY/[Www', momentApi)).toBe(false);
        expect(context.lastStartOfUnit).toBe(null);
    });

    test('escapes square brackets inside literal path segments', () => {
        expect(escapeMomentLiteralPath('Daily[Notes]/[2026]')).toBe('[Daily]\\[[Notes]\\]/\\[[2026]\\]');
    });
});
