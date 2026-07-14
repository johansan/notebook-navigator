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

import { describe, expect, it } from 'vitest';
import { uiStateReducer, type PaneActivationTarget, type UIState } from '../../src/context/UIStateContext';

function createState(overrides: Partial<UIState> = {}): UIState {
    return {
        focusedPane: 'files',
        currentSinglePaneView: 'files',
        paneWidth: 260,
        containerWidth: 800,
        dualPanePreference: true,
        dualPane: true,
        singlePane: false,
        effectiveDualPaneOrientation: 'horizontal',
        pinShortcuts: false,
        ...overrides
    };
}

describe('uiStateReducer pane activation', () => {
    it.each<{
        target: PaneActivationTarget;
        expectedFocus: PaneActivationTarget;
        expectedView: UIState['currentSinglePaneView'];
    }>([
        { target: 'navigation', expectedFocus: 'navigation', expectedView: 'navigation' },
        { target: 'files', expectedFocus: 'files', expectedView: 'files' },
        { target: 'search', expectedFocus: 'search', expectedView: 'files' }
    ])('activates $target atomically', ({ target, expectedFocus, expectedView }) => {
        const state = createState({ focusedPane: 'search', currentSinglePaneView: 'navigation' });

        const result = uiStateReducer(state, { type: 'ACTIVATE_PANE', target });

        expect(result.focusedPane).toBe(expectedFocus);
        expect(result.currentSinglePaneView).toBe(expectedView);
        expect(result.paneWidth).toBe(state.paneWidth);
        expect(result.containerWidth).toBe(state.containerWidth);
    });

    it.each<{
        target: PaneActivationTarget;
        focusedPane: PaneActivationTarget;
        currentSinglePaneView: UIState['currentSinglePaneView'];
    }>([
        { target: 'navigation', focusedPane: 'navigation', currentSinglePaneView: 'navigation' },
        { target: 'files', focusedPane: 'files', currentSinglePaneView: 'files' },
        { target: 'search', focusedPane: 'search', currentSinglePaneView: 'files' }
    ])('returns the existing state when $target is already active', ({ target, focusedPane, currentSinglePaneView }) => {
        const state = createState({ focusedPane, currentSinglePaneView });

        const result = uiStateReducer(state, { type: 'ACTIVATE_PANE', target });

        expect(result).toBe(state);
    });
});
