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

import { afterEach, describe, expect, it } from 'vitest';
import { Platform } from 'obsidian';
import { isDateFilterModifierPressed, shouldAutoRevealCalendarNoteKind } from '../../src/components/calendar/calendarUtils';

const originalIsMobile = Platform.isMobile;
const originalIsTablet = Platform.isTablet;

afterEach(() => {
    Platform.isMobile = originalIsMobile;
    Platform.isTablet = originalIsTablet;
});

describe('calendarUtils', () => {
    describe('isDateFilterModifierPressed', () => {
        it('returns false on phones regardless of modifier state', () => {
            Platform.isMobile = true;
            Platform.isTablet = false;

            expect(
                isDateFilterModifierPressed(
                    {
                        altKey: true,
                        ctrlKey: true,
                        metaKey: true
                    },
                    'cmdCtrl'
                )
            ).toBe(false);
        });

        it('detects the modifier on tablets', () => {
            Platform.isMobile = true;
            Platform.isTablet = true;

            expect(
                isDateFilterModifierPressed(
                    {
                        altKey: false,
                        ctrlKey: true,
                        metaKey: false
                    },
                    'cmdCtrl'
                )
            ).toBe(true);
        });

        it('uses Cmd/Ctrl when cmdCtrl modifier is selected', () => {
            expect(
                isDateFilterModifierPressed(
                    {
                        altKey: false,
                        ctrlKey: true,
                        metaKey: false
                    },
                    'cmdCtrl'
                )
            ).toBe(true);

            expect(
                isDateFilterModifierPressed(
                    {
                        altKey: true,
                        ctrlKey: false,
                        metaKey: false
                    },
                    'cmdCtrl'
                )
            ).toBe(false);
        });

        it('uses Option/Alt when optionAlt modifier is selected', () => {
            expect(
                isDateFilterModifierPressed(
                    {
                        altKey: true,
                        ctrlKey: false,
                        metaKey: false
                    },
                    'optionAlt'
                )
            ).toBe(true);

            expect(
                isDateFilterModifierPressed(
                    {
                        altKey: false,
                        ctrlKey: true,
                        metaKey: true
                    },
                    'optionAlt'
                )
            ).toBe(false);
        });
    });

    describe('shouldAutoRevealCalendarNoteKind', () => {
        it('keeps auto-reveal enabled for day, week, and month notes', () => {
            expect(shouldAutoRevealCalendarNoteKind('day')).toBe(true);
            expect(shouldAutoRevealCalendarNoteKind('week')).toBe(true);
            expect(shouldAutoRevealCalendarNoteKind('month')).toBe(true);
        });

        it('disables auto-reveal for quarter and year notes', () => {
            expect(shouldAutoRevealCalendarNoteKind('quarter')).toBe(false);
            expect(shouldAutoRevealCalendarNoteKind('year')).toBe(false);
        });
    });
});
