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

afterEach(() => {
    testPlatform.isMacOS = originalIsMacOS;
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
                'optionAlt',
                false
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
                'optionAlt',
                false
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
                'cmdCtrl',
                false
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
                'optionAlt',
                false
            )
        ).toBe(false);
    });

    it('does not open a new tab from modifier clicks on mobile', () => {
        testPlatform.isMacOS = true;

        expect(
            shouldOpenNoteClickInNewTab(
                {
                    altKey: false,
                    ctrlKey: false,
                    metaKey: true
                },
                'optionAlt',
                true
            )
        ).toBe(false);
    });
});
