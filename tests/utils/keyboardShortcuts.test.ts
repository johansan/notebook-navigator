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
import { getDefaultKeyboardShortcuts, KeyboardShortcutAction, sanitizeKeyboardShortcuts } from '../../src/utils/keyboardShortcuts';

const testPlatform = Platform as typeof Platform & { isMacOS?: boolean };
const originalIsMacOS = testPlatform.isMacOS;

afterEach(() => {
    testPlatform.isMacOS = originalIsMacOS;
});

describe('keyboardShortcuts', () => {
    it('uses Enter as the default rename shortcut on macOS', () => {
        testPlatform.isMacOS = true;

        const shortcuts = getDefaultKeyboardShortcuts();

        expect(shortcuts[KeyboardShortcutAction.PANE_RENAME]).toEqual([{ modifiers: [], key: 'Enter' }]);
    });

    it('uses F2 as the default rename shortcut outside macOS', () => {
        testPlatform.isMacOS = false;

        const shortcuts = getDefaultKeyboardShortcuts();

        expect(shortcuts[KeyboardShortcutAction.PANE_RENAME]).toEqual([{ modifiers: [], key: 'F2' }]);
    });

    it('adds the default rename action when sanitizing older shortcut configs', () => {
        testPlatform.isMacOS = false;

        const shortcuts = sanitizeKeyboardShortcuts({
            [KeyboardShortcutAction.PANE_MOVE_UP]: [{ modifiers: [], key: 'K' }]
        });

        expect(shortcuts[KeyboardShortcutAction.PANE_MOVE_UP]).toEqual([{ modifiers: [], key: 'K' }]);
        expect(shortcuts[KeyboardShortcutAction.PANE_RENAME]).toEqual([{ modifiers: [], key: 'F2' }]);
    });
});
