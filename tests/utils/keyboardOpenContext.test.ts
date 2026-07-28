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
import { shouldOpenNoteClickInNewTab } from '../../src/utils/keyboardOpenContext';

const testPlatform = Platform as typeof Platform & { isMacOS?: boolean };
const originalIsMacOS = testPlatform.isMacOS;
const originalIsMobile = testPlatform.isMobile;
const originalIsTablet = testPlatform.isTablet;

afterEach(() => {
    testPlatform.isMacOS = originalIsMacOS;
    testPlatform.isMobile = originalIsMobile;
    testPlatform.isTablet = originalIsTablet;
});

describe('shouldOpenNoteClickInNewTab', () => {
    it('opens Cmd-click in a new tab on macOS when Option is the multi-select modifier', () => {
        testPlatform.isMacOS = true;

        expect(
            shouldOpenNoteClickInNewTab(
                {
                    altKey: false,
                    ctrlKey: false,
                    metaKey: true
                },
                'optionAlt'
            )
        ).toBe(true);
    });

    it('opens Ctrl-click in a new tab outside macOS when Alt is the multi-select modifier', () => {
        testPlatform.isMacOS = false;

        expect(
            shouldOpenNoteClickInNewTab(
                {
                    altKey: false,
                    ctrlKey: true,
                    metaKey: false
                },
                'optionAlt'
            )
        ).toBe(true);
    });

    it('does not open a new tab when Cmd/Ctrl is the multi-select modifier', () => {
        testPlatform.isMacOS = true;

        expect(
            shouldOpenNoteClickInNewTab(
                {
                    altKey: false,
                    ctrlKey: false,
                    metaKey: true
                },
                'cmdCtrl'
            )
        ).toBe(false);
    });

    it('gives Option/Alt multi-selection precedence over opening a new tab', () => {
        testPlatform.isMacOS = true;

        expect(
            shouldOpenNoteClickInNewTab(
                {
                    altKey: true,
                    ctrlKey: false,
                    metaKey: true
                },
                'optionAlt'
            )
        ).toBe(false);
    });

    it('does not open a new tab from modifier clicks on phones', () => {
        testPlatform.isMacOS = true;
        testPlatform.isMobile = true;
        testPlatform.isTablet = false;

        expect(
            shouldOpenNoteClickInNewTab(
                {
                    altKey: false,
                    ctrlKey: false,
                    metaKey: true
                },
                'optionAlt'
            )
        ).toBe(false);
    });

    it('opens Cmd-click in a new tab on tablets', () => {
        testPlatform.isMacOS = true;
        testPlatform.isMobile = true;
        testPlatform.isTablet = true;

        expect(
            shouldOpenNoteClickInNewTab(
                {
                    altKey: false,
                    ctrlKey: false,
                    metaKey: true
                },
                'optionAlt'
            )
        ).toBe(true);
    });
});
