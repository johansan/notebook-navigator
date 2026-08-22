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
import { getSinglePaneEntryView, isResolvedDualPaneLayout } from '../../src/utils/paneLayout';

describe('isResolvedDualPaneLayout', () => {
    it('does not treat provisional dual pane as a resolved layout before measurement', () => {
        expect(isResolvedDualPaneLayout(true, null)).toBe(false);
    });

    it('records dual pane after measurement', () => {
        expect(isResolvedDualPaneLayout(true, 800)).toBe(true);
    });

    it('does not record a measured single-pane layout as dual pane', () => {
        expect(isResolvedDualPaneLayout(false, 400)).toBe(false);
    });
});

describe('getSinglePaneEntryView', () => {
    it('keeps navigation when the provisional startup layout falls back to single pane', () => {
        const wasDualPane = isResolvedDualPaneLayout(true, null);

        expect(
            getSinglePaneEntryView({
                preferredView: 'navigation',
                wasDualPane
            })
        ).toBe('navigation');
    });

    it('keeps the list when it is the configured startup pane', () => {
        const wasDualPane = isResolvedDualPaneLayout(true, null);

        expect(
            getSinglePaneEntryView({
                preferredView: 'files',
                wasDualPane
            })
        ).toBe('files');
    });

    it('shows the list after a later dual-to-single transition', () => {
        const wasDualPane = isResolvedDualPaneLayout(true, 800);

        expect(
            getSinglePaneEntryView({
                preferredView: 'navigation',
                wasDualPane
            })
        ).toBe('files');
    });
});
