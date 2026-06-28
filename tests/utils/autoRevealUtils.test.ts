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

import { WorkspaceLeaf } from 'obsidian';
import { describe, expect, it } from 'vitest';
import { isLeafInNavigatorWindow, shouldSkipNavigatorAutoReveal } from '../../src/utils/autoRevealUtils';

function createMockLeaf(win: Window): WorkspaceLeaf {
    return {
        getContainer: () => ({ win })
    } as unknown as WorkspaceLeaf;
}

describe('shouldSkipNavigatorAutoReveal', () => {
    it('skips auto-reveal when the navigator opens the selected file', () => {
        expect(
            shouldSkipNavigatorAutoReveal({
                hasNavigatorFocus: true,
                isOpeningVersionHistory: false,
                isOpeningInNewContext: false,
                isNavigatorOpeningSelectedFile: true
            })
        ).toBe(true);
    });

    it('does not skip auto-reveal when the navigator is not focused', () => {
        expect(
            shouldSkipNavigatorAutoReveal({
                hasNavigatorFocus: false,
                isOpeningVersionHistory: false,
                isOpeningInNewContext: false,
                isNavigatorOpeningSelectedFile: true
            })
        ).toBe(false);
    });

    it('matches active leaves against navigator windows', () => {
        const primaryWindow = { name: 'primary' } as unknown as Window;
        const secondaryWindow = { name: 'secondary' } as unknown as Window;
        const activeLeaf = createMockLeaf(primaryWindow);
        const navigatorLeaf = createMockLeaf(primaryWindow);
        const otherNavigatorLeaf = createMockLeaf(secondaryWindow);

        expect(isLeafInNavigatorWindow(activeLeaf, [navigatorLeaf])).toBe(true);
        expect(isLeafInNavigatorWindow(activeLeaf, [otherNavigatorLeaf])).toBe(false);
        expect(isLeafInNavigatorWindow(null, [navigatorLeaf])).toBe(false);
    });
});
