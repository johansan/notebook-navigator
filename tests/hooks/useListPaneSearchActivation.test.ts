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

import React from 'react';
import { App } from 'obsidian';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    uiDispatch: vi.fn(),
    setSearchActive: vi.fn(),
    services: {
        app: null as App | null,
        isMobile: false,
        plugin: {
            setSearchProvider: vi.fn()
        }
    }
}));

vi.mock('../../src/context/SelectionContext', () => ({
    useSelectionState: () => ({
        selectionType: 'folder',
        selectedFolder: null,
        selectedTag: null,
        selectedProperty: null
    })
}));

vi.mock('../../src/context/ServicesContext', () => ({
    useServices: () => mocks.services
}));

vi.mock('../../src/context/SettingsContext', () => ({
    useSettingsState: () => ({
        paneTransitionDuration: 0,
        searchProvider: 'internal',
        skipAutoScroll: false
    })
}));

vi.mock('../../src/context/ShortcutsContext', () => ({
    useShortcuts: () => ({
        addSearchShortcut: vi.fn(),
        removeSearchShortcut: vi.fn(),
        searchShortcutsByName: new Map()
    })
}));

vi.mock('../../src/context/UIStateContext', () => ({
    useUIDispatch: () => mocks.uiDispatch
}));

vi.mock('../../src/context/UXPreferencesContext', () => ({
    useUXPreferences: () => ({ searchActive: false }),
    useUXPreferenceActions: () => ({ setSearchActive: mocks.setSearchActive })
}));

import { useListPaneSearch, type UseListPaneSearchResult } from '../../src/hooks/useListPaneSearch';

describe('useListPaneSearch activation', () => {
    beforeEach(() => {
        mocks.uiDispatch.mockClear();
        mocks.setSearchActive.mockClear();
        mocks.services.app = new App();
    });

    it('preserves pane activation when a navigation-side search modification does not focus search', () => {
        let captured: UseListPaneSearchResult | null = null;

        function Harness() {
            captured = useListPaneSearch({
                rootContainerRef: { current: null },
                onNavigateToFolder: vi.fn(),
                onRevealTag: vi.fn(),
                onRevealProperty: vi.fn(() => true),
                ensureSelectionForCurrentFilterRef: { current: null }
            });
            return null;
        }

        renderToStaticMarkup(React.createElement(Harness));

        expect(captured).not.toBeNull();
        if (!captured) {
            throw new Error('Expected hook result');
        }
        const result = captured as UseListPaneSearchResult;

        result.modifySearchWithTag('work', 'AND', { focusSearch: false });

        expect(mocks.setSearchActive).toHaveBeenCalledWith(true);
        expect(mocks.uiDispatch).not.toHaveBeenCalled();
    });
});
